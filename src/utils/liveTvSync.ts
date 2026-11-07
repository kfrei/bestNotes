import { db, doc, setDoc, onSnapshot } from '../firebase';
import type { NotePage, BezierPoint, StrokeObject } from '../types/note';

export interface LiveTvViewportPacket {
  t: 'vp';
  z: number;
  baseZ: number;
  px: number;
  py: number;
  w: number;
  h: number;
  pIdx: number;
  pW: number;
  ts: number;
}

export interface LiveTvInkPacket {
  t: 'ink';
  active: boolean;
  pageId: string;
  isLaser: boolean;
  tool: string;
  penType?: string;
  lineStyle?: 'solid' | 'dashed' | 'dotted';
  color: string;
  width: number;
  opacity: number;
  pts: BezierPoint[];
  laserPaths?: BezierPoint[][];
  laserAlpha?: number;
  ts: number;
}

export interface LiveTvErasePacket {
  t: 'erase';
  pageId: string;
  removedIds: string[];
  addedStrokes?: StrokeObject[];
  cursorPt?: { x: number; y: number; r: number } | null;
  ts: number;
}

export interface LiveTvSimPacket {
  t: 'sim';
  isSimulating: boolean;
  simCircuitSwitchClosed: boolean;
  simShowElectrons: boolean;
  simParticleStyle: 'green-energy' | 'blue-electrons';
  simFlowDirection: 'electrons' | 'conventional';
  simShowDarkWireTrack: boolean;
  simSpeedMultiplier: number;
  isSpringSimulating: boolean;
  isSpringPaused: boolean;
  springElapsedSec: number;
  draggingSpringDispPx: number | null;
  ts: number;
}

export interface LiveTvPagesPacket {
  t: 'pages';
  notebookId: string;
  notebookTitle: string;
  activePageIndex: number;
  pages: NotePage[];
  ts: number;
}

export interface LiveTvPingPacket {
  t: 'ping' | 'pong';
  ts: number;
}

export type LiveTvPacket =
  | LiveTvViewportPacket
  | LiveTvInkPacket
  | LiveTvErasePacket
  | LiveTvSimPacket
  | LiveTvPagesPacket
  | LiveTvPingPacket;

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const CHUNK_SIZE = 16000;

function sendChunkedOverChannel(dc: RTCDataChannel, rawJson: string) {
  if (dc.readyState !== 'open') return false;
  try {
    if (rawJson.length <= CHUNK_SIZE) {
      dc.send(rawJson);
      return true;
    }
    const msgId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    const total = Math.ceil(rawJson.length / CHUNK_SIZE);
    for (let i = 0; i < total; i++) {
      const part = rawJson.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      dc.send(
        JSON.stringify({
          _chunk: true,
          id: msgId,
          i,
          n: total,
          d: part,
        })
      );
    }
    return true;
  } catch {
    return false;
  }
}

function buildFirestoreSafePagesJson(packet: LiveTvPagesPacket): string {
  const full = JSON.stringify(packet);
  if (full.length <= 750000) return full;
  // Strip heavy base64 backgrounds/images only if exceeding Firestore 1MB document limit;
  // WebRTC DataChannel still transmits 100% of full backgrounds & images without size limits.
  const slimPages: NotePage[] = packet.pages.map((p) => ({
    ...p,
    backgroundDataUrl:
      p.backgroundDataUrl && p.backgroundDataUrl.length > 80000 ? undefined : p.backgroundDataUrl,
    images: (p.images || []).map((im) =>
      im.dataUrl && im.dataUrl.length > 80000 ? { ...im, dataUrl: '' } : im
    ),
  }));
  const slim = JSON.stringify({ ...packet, pages: slimPages });
  if (slim.length <= 850000) return slim;
  const activeOnly = slimPages[packet.activePageIndex]
    ? [slimPages[packet.activePageIndex]]
    : slimPages.slice(0, 1);
  return JSON.stringify({
    ...packet,
    activePageIndex: 0,
    pages: activeOnly,
  });
}

export class LiveTvSenderEngine {
  private roomId: string;
  private senderId: string;
  private pc: RTCPeerConnection | null = null;
  private fastDc: RTCDataChannel | null = null;
  private stateDc: RTCDataChannel | null = null;
  private unsubFirestore: (() => void) | null = null;
  private currentReceiverId = '';
  private lastProcessedAnswer = '';
  private addedCandidateSet = new Set<string>();
  private localCandidates: RTCIceCandidateInit[] = [];
  private candidateFlushTimer: number | null = null;
  private pingTimer: number | null = null;

  private lastVpFirestoreWriteMs = 0;
  private pendingVpFirestoreTimer: number | null = null;
  private latestVpPacket: LiveTvViewportPacket | null = null;

  private lastInkFirestoreWriteMs = 0;
  private pendingInkFirestoreTimer: number | null = null;
  private latestInkPacket: LiveTvInkPacket | null = null;

  private lastPagesFirestoreWriteMs = 0;
  private pendingPagesFirestoreTimer: number | null = null;
  private latestPagesPacket: LiveTvPagesPacket | null = null;
  private latestSimPacket: LiveTvSimPacket | null = null;

  private onStatusChange?: (status: {
    connected: boolean;
    mode: 'webrtc' | 'cloud' | 'waiting';
    latencyMs: number | null;
  }) => void;

  private latencyMs: number | null = null;

  constructor(
    roomId: string,
    onStatusChange?: (status: {
      connected: boolean;
      mode: 'webrtc' | 'cloud' | 'waiting';
      latencyMs: number | null;
    }) => void
  ) {
    this.roomId = roomId;
    this.senderId = `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    this.onStatusChange = onStatusChange;
    this.start();
  }

  private emitStatus() {
    const isRtcOpen =
      this.fastDc?.readyState === 'open' || this.stateDc?.readyState === 'open';
    if (isRtcOpen) {
      this.onStatusChange?.({
        connected: true,
        mode: 'webrtc',
        latencyMs: this.latencyMs ?? 12,
      });
    } else if (this.currentReceiverId) {
      this.onStatusChange?.({
        connected: true,
        mode: 'cloud',
        latencyMs: this.latencyMs,
      });
    } else {
      this.onStatusChange?.({
        connected: false,
        mode: 'waiting',
        latencyMs: null,
      });
    }
  }

  private start() {
    const roomRef = doc(db, 'live_rooms', this.roomId);

    // Initialize room presence from iPad Sender
    void setDoc(
      roomRef,
      {
        roomId: this.roomId,
        senderId: this.senderId,
        rtcOfferJson: '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});

    this.unsubFirestore = onSnapshot(
      roomRef,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const rxId = typeof data.receiverId === 'string' ? data.receiverId : '';

        // If a new Interactive Board receiver joined, create a fresh WebRTC Offer for it immediately!
        if (rxId && rxId !== this.currentReceiverId) {
          this.currentReceiverId = rxId;
          this.lastProcessedAnswer = '';
          this.addedCandidateSet.clear();
          this.emitStatus();
          void this.setupPeerConnectionForReceiver(rxId);
          return;
        }

        // Process SDP Answer from this receiver
        if (
          rxId &&
          rxId === this.currentReceiverId &&
          typeof data.rtcAnswerJson === 'string' &&
          data.rtcAnswerJson.length > 0 &&
          data.rtcAnswerJson !== this.lastProcessedAnswer
        ) {
          try {
            const parsed = JSON.parse(data.rtcAnswerJson);
            if (
              parsed &&
              parsed.receiverId === rxId &&
              parsed.sdp &&
              this.pc &&
              this.pc.signalingState === 'have-local-offer'
            ) {
              this.lastProcessedAnswer = data.rtcAnswerJson;
              void this.pc.setRemoteDescription(new RTCSessionDescription(parsed.sdp)).catch(() => {});
            }
          } catch {
            // ignore
          }
        }

        // Process ICE Candidates from receiver
        if (
          rxId &&
          rxId === this.currentReceiverId &&
          typeof data.receiverCandidatesJson === 'string' &&
          data.receiverCandidatesJson.length > 2 &&
          this.pc
        ) {
          try {
            const cands = JSON.parse(data.receiverCandidatesJson);
            if (Array.isArray(cands)) {
              for (const c of cands) {
                const key = JSON.stringify(c);
                if (!this.addedCandidateSet.has(key)) {
                  this.addedCandidateSet.add(key);
                  void this.pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
                }
              }
            }
          } catch {
            // ignore
          }
        }
      },
      () => {}
    );

    this.pingTimer = window.setInterval(() => {
      if (this.fastDc?.readyState === 'open') {
        try {
          this.fastDc.send(JSON.stringify({ t: 'ping', ts: performance.now() }));
        } catch {
          // ignore
        }
      }
    }, 2000);
  }

  private async setupPeerConnectionForReceiver(rxId: string) {
    if (this.pc) {
      try {
        this.pc.close();
      } catch {
        // ignore
      }
    }
    this.localCandidates = [];
    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.pc = pc;

    // 1. Ultra-low-latency UDP-like channel for 60fps Zoom/Pan & Wet Ink/Laser
    const fastDc = pc.createDataChannel('live-fast', {
      ordered: false,
      maxRetransmits: 0,
    });
    this.fastDc = fastDc;

    // 2. Reliable ordered channel for full page strokes & simulation state
    const stateDc = pc.createDataChannel('live-state', {
      ordered: true,
    });
    this.stateDc = stateDc;

    const onChannelOpen = () => {
      this.emitStatus();
      // Immediately push current viewport, sim state, and full pages over WebRTC!
      if (this.latestVpPacket && fastDc.readyState === 'open') {
        sendChunkedOverChannel(fastDc, JSON.stringify(this.latestVpPacket));
      }
      if (this.latestSimPacket && stateDc.readyState === 'open') {
        sendChunkedOverChannel(stateDc, JSON.stringify(this.latestSimPacket));
      }
      if (this.latestPagesPacket && stateDc.readyState === 'open') {
        sendChunkedOverChannel(stateDc, JSON.stringify(this.latestPagesPacket));
      }
    };

    fastDc.onopen = onChannelOpen;
    stateDc.onopen = onChannelOpen;
    fastDc.onclose = () => this.emitStatus();
    stateDc.onclose = () => this.emitStatus();

    fastDc.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (msg?.t === 'pong' && typeof msg.ts === 'number') {
          const rtt = Math.max(1, Math.round((performance.now() - msg.ts) * 0.5));
          this.latencyMs = rtt;
          this.emitStatus();
        }
      } catch {
        // ignore
      }
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        this.localCandidates.push(ev.candidate.toJSON());
        if (this.candidateFlushTimer === null) {
          this.candidateFlushTimer = window.setTimeout(() => {
            this.candidateFlushTimer = null;
            void setDoc(
              doc(db, 'live_rooms', this.roomId),
              {
                roomId: this.roomId,
                senderCandidatesJson: JSON.stringify(this.localCandidates.slice(-35)),
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            ).catch(() => {});
          }, 80);
        }
      }
    };

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const payload: Record<string, string> = {
        roomId: this.roomId,
        senderId: this.senderId,
        rtcOfferJson: JSON.stringify({
          receiverId: rxId,
          sdp: pc.localDescription,
        }),
        senderCandidatesJson: '[]',
        updatedAt: new Date().toISOString(),
      };
      if (this.latestVpPacket) {
        payload.viewportJson = JSON.stringify(this.latestVpPacket);
      }
      if (this.latestSimPacket) {
        payload.simStateJson = JSON.stringify(this.latestSimPacket);
      }
      if (this.latestPagesPacket) {
        payload.pageJson = buildFirestoreSafePagesJson(this.latestPagesPacket);
      }
      await setDoc(doc(db, 'live_rooms', this.roomId), payload, { merge: true });
    } catch {
      // ignore
    }
  }

  public sendViewport(vp: Omit<LiveTvViewportPacket, 't' | 'ts'>) {
    const packet: LiveTvViewportPacket = {
      ...vp,
      t: 'vp',
      ts: Date.now(),
    };
    this.latestVpPacket = packet;

    // 1. Instant 60fps WebRTC DataChannel send (< 10ms latency!)
    const sentRtc =
      this.fastDc?.readyState === 'open' &&
      sendChunkedOverChannel(this.fastDc, JSON.stringify(packet));

    // 2. Firestore real-time stream (throttled to 75ms when on Cloud fallback, or 600ms heartbeat when on WebRTC)
    const now = performance.now();
    const minInterval = sentRtc ? 600 : 75;
    const elapsed = now - this.lastVpFirestoreWriteMs;
    if (elapsed >= minInterval) {
      this.lastVpFirestoreWriteMs = now;
      void setDoc(
        doc(db, 'live_rooms', this.roomId),
        {
          roomId: this.roomId,
          viewportJson: JSON.stringify(packet),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    } else if (this.pendingVpFirestoreTimer === null) {
      this.pendingVpFirestoreTimer = window.setTimeout(() => {
        this.pendingVpFirestoreTimer = null;
        this.lastVpFirestoreWriteMs = performance.now();
        if (this.latestVpPacket) {
          void setDoc(
            doc(db, 'live_rooms', this.roomId),
            {
              roomId: this.roomId,
              viewportJson: JSON.stringify(this.latestVpPacket),
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch(() => {});
        }
      }, minInterval - elapsed);
    }
  }

  public sendLiveInk(ink: Omit<LiveTvInkPacket, 't' | 'ts'>) {
    const packet: LiveTvInkPacket = {
      ...ink,
      t: 'ink',
      ts: Date.now(),
    };
    this.latestInkPacket = packet;

    // 1. Instant 60fps WebRTC DataChannel send
    const raw = JSON.stringify(packet);
    const sentRtc =
      (this.fastDc?.readyState === 'open' && sendChunkedOverChannel(this.fastDc, raw)) ||
      (this.stateDc?.readyState === 'open' && sendChunkedOverChannel(this.stateDc, raw));

    // 2. Firestore real-time stream when WebRTC is not open (or when ending stroke)
    if (!sentRtc || !ink.active) {
      const now = performance.now();
      const minInterval = !ink.active ? 0 : 85;
      const elapsed = now - this.lastInkFirestoreWriteMs;
      if (elapsed >= minInterval) {
        this.lastInkFirestoreWriteMs = now;
        if (raw.length <= 90000) {
          void setDoc(
            doc(db, 'live_rooms', this.roomId),
            {
              roomId: this.roomId,
              liveInkJson: raw,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch(() => {});
        }
      } else if (this.pendingInkFirestoreTimer === null) {
        this.pendingInkFirestoreTimer = window.setTimeout(() => {
          this.pendingInkFirestoreTimer = null;
          this.lastInkFirestoreWriteMs = performance.now();
          if (this.latestInkPacket) {
            const latestRaw = JSON.stringify(this.latestInkPacket);
            if (latestRaw.length <= 90000) {
              void setDoc(
                doc(db, 'live_rooms', this.roomId),
                {
                  roomId: this.roomId,
                  liveInkJson: latestRaw,
                  updatedAt: new Date().toISOString(),
                },
                { merge: true }
              ).catch(() => {});
            }
          }
        }, minInterval - elapsed);
      }
    }
  }

  public sendLiveErase(eraseData: Omit<LiveTvErasePacket, 't' | 'ts'>) {
    const packet: LiveTvErasePacket = {
      ...eraseData,
      t: 'erase',
      ts: Date.now(),
    };
    const raw = JSON.stringify(packet);

    // 1. Instant <10ms WebRTC DataChannel send (both fastDc and stateDc for guaranteed + immediate delivery)
    const sentFast =
      this.fastDc?.readyState === 'open' && sendChunkedOverChannel(this.fastDc, raw);
    const sentState =
      this.stateDc?.readyState === 'open' && sendChunkedOverChannel(this.stateDc, raw);
    const sentRtc = Boolean(sentFast || sentState);

    // 2. Cloud stream fallback (or immediate stroke removal sync via lightweight liveInkJson < 90KB)
    const hasStrokeDiff =
      eraseData.removedIds.length > 0 ||
      Boolean(eraseData.addedStrokes && eraseData.addedStrokes.length > 0);
    if ((!sentRtc || hasStrokeDiff) && raw.length <= 90000) {
      const now = performance.now();
      const minInterval = hasStrokeDiff ? 0 : 75;
      const elapsed = now - this.lastInkFirestoreWriteMs;
      if (elapsed >= minInterval) {
        this.lastInkFirestoreWriteMs = now;
        void setDoc(
          doc(db, 'live_rooms', this.roomId),
          {
            roomId: this.roomId,
            liveInkJson: raw,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        ).catch(() => {});
      }
    }
  }

  public sendSimState(sim: Omit<LiveTvSimPacket, 't' | 'ts'>) {
    const packet: LiveTvSimPacket = {
      ...sim,
      t: 'sim',
      ts: Date.now(),
    };
    this.latestSimPacket = packet;
    const raw = JSON.stringify(packet);
    if (this.stateDc?.readyState === 'open') {
      sendChunkedOverChannel(this.stateDc, raw);
    } else if (this.fastDc?.readyState === 'open') {
      sendChunkedOverChannel(this.fastDc, raw);
    }
    void setDoc(
      doc(db, 'live_rooms', this.roomId),
      {
        roomId: this.roomId,
        simStateJson: raw,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});
  }

  public sendPages(pagesData: Omit<LiveTvPagesPacket, 't' | 'ts'>) {
    const packet: LiveTvPagesPacket = {
      ...pagesData,
      t: 'pages',
      ts: Date.now(),
    };
    this.latestPagesPacket = packet;
    const sentRtc =
      this.stateDc?.readyState === 'open' &&
      sendChunkedOverChannel(this.stateDc, JSON.stringify(packet));

    const now = performance.now();
    const minInterval = sentRtc ? 800 : 300;
    const elapsed = now - this.lastPagesFirestoreWriteMs;
    if (elapsed >= minInterval) {
      this.lastPagesFirestoreWriteMs = now;
      const safeFirestoreJson = buildFirestoreSafePagesJson(packet);
      void setDoc(
        doc(db, 'live_rooms', this.roomId),
        {
          roomId: this.roomId,
          pageJson: safeFirestoreJson,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch(() => {});
    } else if (this.pendingPagesFirestoreTimer === null) {
      this.pendingPagesFirestoreTimer = window.setTimeout(() => {
        this.pendingPagesFirestoreTimer = null;
        this.lastPagesFirestoreWriteMs = performance.now();
        if (this.latestPagesPacket) {
          const safeFirestoreJson = buildFirestoreSafePagesJson(this.latestPagesPacket);
          void setDoc(
            doc(db, 'live_rooms', this.roomId),
            {
              roomId: this.roomId,
              pageJson: safeFirestoreJson,
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          ).catch(() => {});
        }
      }, minInterval - elapsed);
    }
  }

  public forceHandshake() {
    this.senderId = `tx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    this.currentReceiverId = '';
    this.lastProcessedAnswer = '';
    this.addedCandidateSet.clear();
    const payload: Record<string, unknown> = {
      roomId: this.roomId,
      senderId: this.senderId,
      rtcOfferJson: '',
      updatedAt: new Date().toISOString(),
    };
    if (this.latestVpPacket) {
      payload.viewportJson = JSON.stringify(this.latestVpPacket);
    }
    if (this.latestSimPacket) {
      payload.simStateJson = JSON.stringify(this.latestSimPacket);
    }
    if (this.latestPagesPacket) {
      payload.pageJson = buildFirestoreSafePagesJson(this.latestPagesPacket);
    }
    void setDoc(doc(db, 'live_rooms', this.roomId), payload, { merge: true }).catch(() => {});
  }

  public stopBroadcast() {
    void setDoc(
      doc(db, 'live_rooms', this.roomId),
      {
        roomId: this.roomId,
        senderId: '',
        rtcOfferJson: '',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});
    this.destroy();
  }

  public destroy() {
    if (this.pingTimer !== null) window.clearInterval(this.pingTimer);
    if (this.candidateFlushTimer !== null) window.clearTimeout(this.candidateFlushTimer);
    if (this.pendingVpFirestoreTimer !== null) window.clearTimeout(this.pendingVpFirestoreTimer);
    if (this.pendingInkFirestoreTimer !== null) window.clearTimeout(this.pendingInkFirestoreTimer);
    if (this.pendingPagesFirestoreTimer !== null) window.clearTimeout(this.pendingPagesFirestoreTimer);
    this.unsubFirestore?.();
    try {
      this.fastDc?.close();
      this.stateDc?.close();
      this.pc?.close();
    } catch {
      // ignore
    }
  }
}

export class LiveTvReceiverEngine {
  private roomId: string;
  private receiverId: string;
  private lastSenderId = '';
  private pc: RTCPeerConnection | null = null;
  private unsubFirestore: (() => void) | null = null;
  private lastOfferStr = '';
  private addedCandidateSet = new Set<string>();
  private localCandidates: RTCIceCandidateInit[] = [];
  private candidateFlushTimer: number | null = null;
  private chunkBuffers = new Map<string, { parts: string[]; received: number; total: number }>();
  private isRtcConnected = false;

  private lastVpTs = 0;
  private lastInkTs = 0;
  private lastEraseTs = 0;
  private lastSimTs = 0;
  private lastPagesTs = 0;

  private lastCloudPageStr = '';
  private lastCloudSimStr = '';
  private lastCloudVpStr = '';
  private lastCloudInkStr = '';

  private onPacket: (packet: LiveTvPacket, via: 'webrtc' | 'cloud') => void;
  private onConnectionModeChange?: (mode: 'webrtc' | 'cloud' | 'connecting') => void;

  constructor(
    roomId: string,
    onPacket: (packet: LiveTvPacket, via: 'webrtc' | 'cloud') => void,
    onConnectionModeChange?: (mode: 'webrtc' | 'cloud' | 'connecting') => void
  ) {
    this.roomId = roomId;
    this.receiverId = `rx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
    this.onPacket = onPacket;
    this.onConnectionModeChange = onConnectionModeChange;
    this.start();
  }

  private handleIncomingRaw(raw: string, via: 'webrtc' | 'cloud', replyDc?: RTCDataChannel) {
    try {
      const parsed = JSON.parse(raw);
      if (!parsed) return;

      // Reassemble chunked WebRTC messages
      if (parsed._chunk && typeof parsed.id === 'string') {
        let entry = this.chunkBuffers.get(parsed.id);
        if (!entry) {
          entry = { parts: new Array(parsed.n).fill(''), received: 0, total: parsed.n };
          this.chunkBuffers.set(parsed.id, entry);
        }
        if (entry.parts[parsed.i] === '') {
          entry.parts[parsed.i] = parsed.d;
          entry.received++;
        }
        if (entry.received === entry.total) {
          this.chunkBuffers.delete(parsed.id);
          const fullJson = entry.parts.join('');
          this.handleIncomingRaw(fullJson, via, replyDc);
        }
        return;
      }

      if (parsed.t === 'ping' && replyDc && replyDc.readyState === 'open') {
        replyDc.send(JSON.stringify({ t: 'pong', ts: parsed.ts }));
        return;
      }

      const ts = typeof parsed.ts === 'number' ? parsed.ts : Date.now();
      if (parsed.t === 'vp') {
        if (ts <= this.lastVpTs && via === 'cloud') return;
        this.lastVpTs = Math.max(this.lastVpTs, ts);
        this.onPacket(parsed as LiveTvViewportPacket, via);
      } else if (parsed.t === 'ink') {
        if (ts <= this.lastInkTs && via === 'cloud') return;
        this.lastInkTs = Math.max(this.lastInkTs, ts);
        this.onPacket(parsed as LiveTvInkPacket, via);
      } else if (parsed.t === 'erase') {
        if (ts <= this.lastEraseTs) return;
        this.lastEraseTs = ts;
        this.lastPagesTs = Math.max(this.lastPagesTs, ts);
        this.onPacket(parsed as LiveTvErasePacket, via);
      } else if (parsed.t === 'sim') {
        if (ts <= this.lastSimTs && via === 'cloud') return;
        this.lastSimTs = Math.max(this.lastSimTs, ts);
        this.onPacket(parsed as LiveTvSimPacket, via);
      } else if (parsed.t === 'pages') {
        if (ts <= this.lastPagesTs && via === 'cloud') return;
        this.lastPagesTs = Math.max(this.lastPagesTs, ts);
        this.onPacket(parsed as LiveTvPagesPacket, via);
      }
    } catch {
      // ignore
    }
  }

  private start() {
    this.onConnectionModeChange?.('connecting');
    const roomRef = doc(db, 'live_rooms', this.roomId);

    // Announce receiver presence so sender creates a fresh WebRTC offer
    void setDoc(
      roomRef,
      {
        roomId: this.roomId,
        receiverId: this.receiverId,
        rtcAnswerJson: '',
        receiverCandidatesJson: '[]',
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    ).catch(() => {});

    this.unsubFirestore = onSnapshot(
      roomRef,
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();

        // Detect when the teacher starts or restarts broadcasting from the iPad (new senderId)
        if (typeof data.senderId === 'string' && data.senderId.length > 0 && data.senderId !== this.lastSenderId) {
          const hadPrevSender = this.lastSenderId.length > 0;
          this.lastSenderId = data.senderId;
          if (hadPrevSender) {
            this.isRtcConnected = false;
            this.lastOfferStr = '';
            this.receiverId = `rx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
            void setDoc(
              roomRef,
              {
                roomId: this.roomId,
                receiverId: this.receiverId,
                rtcAnswerJson: '',
                receiverCandidatesJson: '[]',
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            ).catch(() => {});
          }
        }

        // 1. Immediately apply Firestore state packets when changed (instant startup + continuous fallback)
        if (!this.isRtcConnected) {
          this.onConnectionModeChange?.('cloud');
        }
        if (
          typeof data.pageJson === 'string' &&
          data.pageJson.length > 2 &&
          data.pageJson !== this.lastCloudPageStr
        ) {
          this.lastCloudPageStr = data.pageJson;
          if (!this.isRtcConnected || this.lastPagesTs === 0) {
            this.handleIncomingRaw(data.pageJson, 'cloud');
          }
        }
        if (
          typeof data.simStateJson === 'string' &&
          data.simStateJson.length > 2 &&
          data.simStateJson !== this.lastCloudSimStr
        ) {
          this.lastCloudSimStr = data.simStateJson;
          if (!this.isRtcConnected || this.lastSimTs === 0) {
            this.handleIncomingRaw(data.simStateJson, 'cloud');
          }
        }
        if (
          typeof data.liveInkJson === 'string' &&
          data.liveInkJson.length > 2 &&
          data.liveInkJson !== this.lastCloudInkStr
        ) {
          this.lastCloudInkStr = data.liveInkJson;
          this.handleIncomingRaw(data.liveInkJson, 'cloud');
        }
        if (!this.isRtcConnected) {
          if (
            typeof data.viewportJson === 'string' &&
            data.viewportJson.length > 2 &&
            data.viewportJson !== this.lastCloudVpStr
          ) {
            this.lastCloudVpStr = data.viewportJson;
            this.handleIncomingRaw(data.viewportJson, 'cloud');
          }
        }

        // 2. Check for WebRTC Offer from sender targeting this receiverId
        if (
          typeof data.rtcOfferJson === 'string' &&
          data.rtcOfferJson.length > 2 &&
          data.rtcOfferJson !== this.lastOfferStr
        ) {
          try {
            const parsed = JSON.parse(data.rtcOfferJson);
            if (parsed && parsed.receiverId === this.receiverId && parsed.sdp) {
              this.lastOfferStr = data.rtcOfferJson;
              this.addedCandidateSet.clear();
              void this.acceptOffer(parsed.sdp);
            }
          } catch {
            // ignore
          }
        }

        // 3. Process ICE Candidates from sender
        if (
          typeof data.senderCandidatesJson === 'string' &&
          data.senderCandidatesJson.length > 2 &&
          this.pc &&
          this.pc.remoteDescription
        ) {
          try {
            const cands = JSON.parse(data.senderCandidatesJson);
            if (Array.isArray(cands)) {
              for (const c of cands) {
                const key = JSON.stringify(c);
                if (!this.addedCandidateSet.has(key)) {
                  this.addedCandidateSet.add(key);
                  void this.pc.addIceCandidate(new RTCIceCandidate(c)).catch(() => {});
                }
              }
            }
          } catch {
            // ignore
          }
        }
      },
      () => {}
    );
  }

  private async acceptOffer(offerSdp: RTCSessionDescriptionInit) {
    if (this.pc) {
      try {
        this.pc.close();
      } catch {
        // ignore
      }
    }
    this.localCandidates = [];
    const pc = new RTCPeerConnection(RTC_CONFIG);
    this.pc = pc;

    pc.ondatachannel = (ev) => {
      const dc = ev.channel;
      dc.onopen = () => {
        this.isRtcConnected = true;
        this.onConnectionModeChange?.('webrtc');
      };
      dc.onclose = () => {
        this.isRtcConnected = false;
        this.onConnectionModeChange?.('cloud');
      };
      dc.onmessage = (msgEv) => {
        if (typeof msgEv.data === 'string') {
          this.handleIncomingRaw(msgEv.data, 'webrtc', dc);
        }
      };
    };

    pc.onicecandidate = (ev) => {
      if (ev.candidate) {
        this.localCandidates.push(ev.candidate.toJSON());
        if (this.candidateFlushTimer === null) {
          this.candidateFlushTimer = window.setTimeout(() => {
            this.candidateFlushTimer = null;
            void setDoc(
              doc(db, 'live_rooms', this.roomId),
              {
                roomId: this.roomId,
                receiverCandidatesJson: JSON.stringify(this.localCandidates.slice(-35)),
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            ).catch(() => {});
          }, 80);
        }
      }
    };

    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offerSdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      await setDoc(
        doc(db, 'live_rooms', this.roomId),
        {
          roomId: this.roomId,
          receiverId: this.receiverId,
          rtcAnswerJson: JSON.stringify({
            receiverId: this.receiverId,
            sdp: pc.localDescription,
          }),
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch {
      // ignore
    }
  }

  public destroy() {
    if (this.candidateFlushTimer !== null) window.clearTimeout(this.candidateFlushTimer);
    this.unsubFirestore?.();
    try {
      this.pc?.close();
    } catch {
      // ignore
    }
  }
}
