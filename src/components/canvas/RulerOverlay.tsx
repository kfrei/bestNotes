import React, { useRef, useState } from 'react';
import { RotateCw } from 'lucide-react';
import { A4_GRID_STEP_PX, type NotePage, type StrokeObject } from '../../types/note';

export type PageRulerState = {
  visible: boolean;
  x: number;
  y: number;
  angle: number;
  showMm?: boolean;
  lengthPx?: number;
};

export interface EffectiveRulerGeometry {
  userLength: number;
  effectiveRulerW: number;
  maxLenToPageEdge: number;
  rulerH: number;
  originX: number;
  originY: number;
  centerX: number;
  centerY: number;
  cosA: number;
  sinA: number;
}

export interface RulerPointerReadoutInfo {
  clampedXPos: number;
  mmVal: number;
  cmVal: number;
  cmStr: string;
  badgeX: number;
  badgeY: number;
  isMostlyVertical: boolean;
  ptrColor: string;
  isLockedAtZero: boolean;
  tipX: number;
  tipY: number;
  dashLen: number;
  dashAngleDeg: number;
  dashDelaySec: number;
  dashDurationSec: number;
  readoutDelaySec: number;
}

interface RulerOverlayProps {
  pageObj: NotePage;
  pageIdx: number;
  activePageIndex: number;
  pageRuler: PageRulerState;
  pW: number;
  pH: number;
  zoomRef: React.MutableRefObject<number>;
  setRulerState: (
    updater: PageRulerState | ((prev: PageRulerState) => PageRulerState),
    targetPageId?: string
  ) => void;
  getEffectiveRulerGeometry: (rState: PageRulerState, pW: number, pH: number) => EffectiveRulerGeometry;
  computeRulerPointerReadout: (
    ptrStroke: StrokeObject,
    dispDx?: number,
    dispDy?: number,
    pW?: number,
    targetPage?: NotePage
  ) => RulerPointerReadoutInfo | null;
  onActivatePage: (pageIdx: number) => void;
}

const RulerOverlayInner: React.FC<RulerOverlayProps> = ({
  pageObj,
  pageIdx,
  activePageIndex,
  pageRuler,
  pW,
  pH,
  zoomRef,
  setRulerState,
  getEffectiveRulerGeometry,
  computeRulerPointerReadout,
  onActivatePage,
}) => {
  const rulerDragRef = useRef<{
    pageId: string;
    mode: 'move' | 'rotate' | 'resize';
    pointerId: number;
    startClientX: number;
    startClientY: number;
    initialX: number;
    initialY: number;
    initialAngle: number;
    startPointerAngleDeg: number;
    centerClientX: number;
    centerClientY: number;
    originX?: number;
    originY?: number;
    initialLength?: number;
    lastSnappedCardinal?: number | null;
  } | null>(null);

  const [rulerSnapFlash, setRulerSnapFlash] = useState<{
    label: '0°' | '90°';
    ts: number;
  } | null>(null);
  const rulerSnapFlashTimerRef = useRef<number | null>(null);

  if (!pageRuler.visible) return null;

  // 100% of A4 Portrait width (920px) = 20cm => 1cm = 46px in page coordinates!
  const rGeom = getEffectiveRulerGeometry(pageRuler, pW, pH);
  const rulerW = rGeom.effectiveRulerW;
  const rulerH = rGeom.rulerH;
  const oneCmPx = 920 / 20; // 46px per 1cm
  const halfCmPx = oneCmPx / 2; // 23px per 0.5cm
  const totalHalfCmSteps = Math.floor(rulerW / halfCmPx);
  const resizeCursor = Math.abs(rGeom.sinA) >= 0.7 ? 'ns-resize' : 'ew-resize';
  const pointerCandidates = pageObj.strokes.filter(
    (s) =>
      s.points.length >= 2 &&
      (s.shapeType === 'spring-pointer' ||
        Boolean(s.attachedToSpringId) ||
        s.shapeType === 'arrow' ||
        Boolean(s.arrowEnd))
  );

  return (
    <>
      <div
        data-ui-panel="true"
        data-ruler-root="true"
        tabIndex={0}
        aria-label="Χάρακας (σύρετε για μετακίνηση ή από την άκρη για αλλαγή μεγέθους)"
        onKeyDown={(e) => {
          const step = e.shiftKey ? 5 : 1.5;
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            e.stopPropagation();
            setRulerState((r) => ({ ...r, x: r.x - step }), pageObj.id);
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            e.stopPropagation();
            setRulerState((r) => ({ ...r, x: r.x + step }), pageObj.id);
          } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            e.stopPropagation();
            setRulerState((r) => ({ ...r, y: r.y - step }), pageObj.id);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            e.stopPropagation();
            setRulerState((r) => ({ ...r, y: r.y + step }), pageObj.id);
          }
        }}
        onPointerDown={(e) => {
          if (e.pointerType === 'mouse' && e.button !== 0) return;
          if (
            (e.target as HTMLElement).closest(
              '[data-ruler-rotate="true"], [data-ruler-mm="true"], [data-ruler-flip="true"]'
            )
          ) {
            return;
          }
          e.stopPropagation();
          if (pageIdx !== activePageIndex) {
            onActivatePage(pageIdx);
          }
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {
            // ignore capture error
          }

          const hitResizeHandle = Boolean(
            (e.target as HTMLElement).closest('[data-ruler-resize="end"]')
          );
          const pageContainerEl = e.currentTarget.parentElement;
          const pageRect = pageContainerEl?.getBoundingClientRect();
          let isNearFarEnd = hitResizeHandle;
          if (!isNearFarEnd && pageRect) {
            const ptPageX = (e.clientX - pageRect.left) / zoomRef.current;
            const ptPageY = (e.clientY - pageRect.top) / zoomRef.current;
            const distAlongFromOrigin =
              (ptPageX - rGeom.originX) * rGeom.cosA +
              (ptPageY - rGeom.originY) * rGeom.sinA;
            if (distAlongFromOrigin >= rulerW - 26) {
              isNearFarEnd = true;
            }
          }

          const syncedCenterX = rGeom.originX + (rGeom.userLength / 2) * rGeom.cosA;
          const syncedCenterY = rGeom.originY + (rGeom.userLength / 2) * rGeom.sinA;

          rulerDragRef.current = {
            pageId: pageObj.id,
            mode: isNearFarEnd ? 'resize' : 'move',
            pointerId: e.pointerId,
            startClientX: e.clientX,
            startClientY: e.clientY,
            initialX: syncedCenterX,
            initialY: syncedCenterY,
            initialAngle: pageRuler.angle,
            startPointerAngleDeg: 0,
            centerClientX: 0,
            centerClientY: 0,
            originX: rGeom.originX,
            originY: rGeom.originY,
            initialLength: rulerW,
          };
        }}
        onPointerMove={(e) => {
          const st = rulerDragRef.current;
          if (
            !st ||
            (st.mode !== 'move' && st.mode !== 'resize') ||
            st.pointerId !== e.pointerId ||
            st.pageId !== pageObj.id
          ) {
            return;
          }
          e.stopPropagation();
          const dx = (e.clientX - st.startClientX) / zoomRef.current;
          const dy = (e.clientY - st.startClientY) / zoomRef.current;

          if (st.mode === 'resize') {
            const origX = st.originX ?? rGeom.originX;
            const origY = st.originY ?? rGeom.originY;
            const initLen = st.initialLength ?? rulerW;
            const deltaAlong = dx * rGeom.cosA + dy * rGeom.sinA;
            const nextLen = Math.max(
              69,
              Math.min(rGeom.maxLenToPageEdge, Math.round(initLen + deltaAlong))
            );
            const nextCenterX = origX + (nextLen / 2) * rGeom.cosA;
            const nextCenterY = origY + (nextLen / 2) * rGeom.sinA;
            setRulerState(
              (prev) => ({
                ...prev,
                x: nextCenterX,
                y: nextCenterY,
                lengthPx: nextLen,
              }),
              pageObj.id
            );
            return;
          }

          const sinA = rGeom.sinA;
          const cosA = rGeom.cosA;
          const uLen = rGeom.userLength;
          const rawOrigX = st.initialX - (uLen / 2) * cosA + dx;
          const rawOrigY = st.initialY - (uLen / 2) * sinA + dy;
          const moveMarginX = Math.abs(sinA) * (rulerH / 2);
          const moveMarginY = Math.abs(cosA) * (rulerH / 2);
          let clampedOrigX = Math.max(moveMarginX, Math.min(pW - moveMarginX, rawOrigX));
          let clampedOrigY = Math.max(moveMarginY, Math.min(pH - moveMarginY, rawOrigY));
          // Gentle ±3.5px magnetic snap of the 0-origin onto notebook grid lines (23px = 0.5cm)
          if (Math.abs(cosA) >= 0.99) {
            const snappedGridX = Math.round(clampedOrigX / A4_GRID_STEP_PX) * A4_GRID_STEP_PX;
            if (
              Math.abs(clampedOrigX - snappedGridX) <= 3.5 &&
              snappedGridX >= moveMarginX &&
              snappedGridX <= pW - moveMarginX
            ) {
              clampedOrigX = snappedGridX;
            }
          } else if (Math.abs(sinA) >= 0.99) {
            const snappedGridY = Math.round(clampedOrigY / A4_GRID_STEP_PX) * A4_GRID_STEP_PX;
            if (
              Math.abs(clampedOrigY - snappedGridY) <= 3.5 &&
              snappedGridY >= moveMarginY &&
              snappedGridY <= pH - moveMarginY
            ) {
              clampedOrigY = snappedGridY;
            }
          }
          const nextX = clampedOrigX + (uLen / 2) * cosA;
          let nextY = clampedOrigY + (uLen / 2) * sinA;

          if (Math.abs(sinA) >= 0.96) {
            const closeEdgeThreshold = rulerH / 2 + 36;
            for (const cand of pageObj.strokes) {
              if (!cand.attachedToSpringId || cand.points.length < 2) continue;
              const cP0 = cand.points[0];
              const cPEnd = cand.points[cand.points.length - 1];
              const sPerp0 = -(cP0.x - nextX) * sinA + (cP0.y - nextY) * cosA;
              const sPerpEnd = -(cPEnd.x - nextX) * sinA + (cPEnd.y - nextY) * cosA;
              const segPerpDist =
                sPerp0 * sPerpEnd <= 0
                  ? 0
                  : Math.min(Math.abs(sPerp0), Math.abs(sPerpEnd));
              if (segPerpDist <= closeEdgeThreshold) {
                const targetY = cPEnd.y + (uLen / 2) * (sinA >= 0 ? 1 : -1);
                if (Math.abs(nextY - targetY) <= 14) {
                  nextY = targetY;
                  break;
                }
              }
            }
          }
          setRulerState((prev) => ({ ...prev, x: nextX, y: nextY }), pageObj.id);
        }}
        onPointerUp={(e) => {
          if (rulerDragRef.current?.pointerId === e.pointerId) {
            rulerDragRef.current = null;
          }
        }}
        onLostPointerCapture={() => {
          if (
            rulerDragRef.current?.mode === 'move' ||
            rulerDragRef.current?.mode === 'resize'
          ) {
            rulerDragRef.current = null;
          }
        }}
        style={{
          width: rulerW,
          height: rulerH,
          left: rGeom.centerX - rulerW / 2,
          top: rGeom.centerY - rulerH / 2,
          transform: `rotate(${pageRuler.angle}deg)`,
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none',
        }}
        className={`absolute bg-slate-200/75 backdrop-blur-[1.5px] rounded-md shadow-md cursor-grab active:cursor-grabbing z-[70] outline-none transition-shadow duration-150 ${
          rulerSnapFlash
            ? 'ring-2 ring-[#2563eb]/75 shadow-[0_0_18px_rgba(37,99,235,0.42)]'
            : 'ring-1 ring-inset ring-slate-400/65'
        }`}
      >
        {/* Instant 0° / 90° Magnetic Lock Flash Badge */}
        {rulerSnapFlash && (
          <div
            key={rulerSnapFlash.ts}
            style={{
              transform: `translate(-50%, -50%) rotate(${-pageRuler.angle}deg)`,
            }}
            className="absolute left-1/2 top-1/2 z-30 pointer-events-none px-2.5 py-0.5 rounded-full bg-[#234978]/95 text-white text-[11px] font-mono font-extrabold tracking-tight shadow-lg ring-2 ring-white/90 animate-pulse"
          >
            {rulerSnapFlash.label}
          </div>
        )}

        {/* 0-Origin Single Navy Arrow + 0 Label */}
        <button
          type="button"
          data-ui-panel="true"
          data-ruler-flip="true"
          title="Αλλαγή αρχής (0) του χάρακα: Αριστερά ↔ Δεξιά ή Επάνω ↔ Κάτω"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            setRulerState((prev) => {
              let nextAngle = prev.angle + 180;
              while (nextAngle > 180) nextAngle -= 360;
              while (nextAngle <= -180) nextAngle += 360;
              return {
                ...prev,
                x: rGeom.centerX,
                y: rGeom.centerY,
                lengthPx: rGeom.effectiveRulerW,
                angle: nextAngle,
              };
            }, pageObj.id);
          }}
          className="absolute left-0 inset-y-0 w-7 z-20 text-[#234978] hover:text-[#dc2626] active:scale-95 cursor-pointer transition-colors outline-none"
        >
          <svg
            style={{ left: 3, top: 6.5 }}
            className="absolute w-3.5 h-2.5 shrink-0"
            viewBox="0 0 18 12"
            fill="none"
          >
            <line
              x1="2"
              y1="6"
              x2="9.5"
              y2="6"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M 9.2 2.1 L 15.6 6 L 9.2 9.9 Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
          {pageRuler.showMm && (
            <span
              style={{
                left: 7,
                transform: `translate(-50%, -50%) rotate(${-pageRuler.angle}deg)`,
              }}
              className="absolute top-1/2 text-[9px] font-mono font-extrabold text-slate-800 bg-slate-200/85 px-0.5 rounded leading-none select-none"
            >
              0
            </span>
          )}
        </button>

        {/* Far-End Interactive Resize Grip */}
        <div
          data-ruler-resize="end"
          title="Σύρετε την άκρη του χάρακα για αυξομείωση του μήκους του"
          style={{ cursor: resizeCursor }}
          className="absolute right-0 inset-y-0 w-6 z-20 flex items-center justify-end pr-1.5 rounded-r-md hover:bg-slate-400/25 active:bg-slate-400/40 transition-colors"
        >
          <div className="flex gap-[2px] items-center pointer-events-none opacity-65">
            <div className="w-[1.5px] h-5 rounded-full bg-slate-600" />
            <div className="w-[1.5px] h-5 rounded-full bg-slate-600" />
          </div>
        </div>

        {/* Top-Center Rotation Stem & Circular Handle */}
        <div
          data-ui-panel="true"
          data-ruler-rotate="true"
          title="Σύρετε για περιστροφή του χάρακα (κλειδώνει αυτόματα σε 0° & 90°)"
          onPointerDown={(e) => {
            if (e.pointerType === 'mouse' && e.button !== 0) return;
            e.stopPropagation();
            if (pageIdx !== activePageIndex) {
              onActivatePage(pageIdx);
            }
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch {
              // ignore capture error
            }
            const rulerEl = e.currentTarget.closest('[data-ruler-root="true"]') as HTMLElement | null;
            const rect = rulerEl?.getBoundingClientRect();
            const centerClientX = rect ? rect.left + rect.width / 2 : e.clientX;
            const centerClientY = rect ? rect.top + rect.height / 2 : e.clientY + 44;
            const startAng =
              (Math.atan2(e.clientY - centerClientY, e.clientX - centerClientX) * 180) / Math.PI;
            const initNorm = Math.round(pageRuler.angle);
            const initCardinal =
              initNorm === 0 || initNorm === 180 || initNorm === -180
                ? 0
                : initNorm === 90 || initNorm === -90
                  ? 90
                  : null;
            rulerDragRef.current = {
              pageId: pageObj.id,
              mode: 'rotate',
              pointerId: e.pointerId,
              startClientX: e.clientX,
              startClientY: e.clientY,
              initialX: pageRuler.x,
              initialY: pageRuler.y,
              initialAngle: pageRuler.angle,
              startPointerAngleDeg: startAng,
              centerClientX,
              centerClientY,
              lastSnappedCardinal: initCardinal,
            };
          }}
          onPointerMove={(e) => {
            const st = rulerDragRef.current;
            if (
              !st ||
              st.mode !== 'rotate' ||
              st.pointerId !== e.pointerId ||
              st.pageId !== pageObj.id
            ) {
              return;
            }
            e.stopPropagation();
            const currAng =
              (Math.atan2(e.clientY - st.centerClientY, e.clientX - st.centerClientX) * 180) /
              Math.PI;
            let delta = currAng - st.startPointerAngleDeg;
            while (delta > 180) delta -= 360;
            while (delta < -180) delta += 360;
            let nextAngle = st.initialAngle + delta;
            while (nextAngle > 180) nextAngle -= 360;
            while (nextAngle <= -180) nextAngle += 360;
            let snappedCardinal: number | null = null;
            for (const snapDeg of [0, 90, 180, -90, -180]) {
              if (Math.abs(nextAngle - snapDeg) <= 7) {
                nextAngle = snapDeg === -180 ? 180 : snapDeg;
                snappedCardinal = snapDeg === 90 || snapDeg === -90 ? 90 : 0;
                break;
              }
            }
            if (snappedCardinal !== null) {
              if (st.lastSnappedCardinal !== snappedCardinal) {
                st.lastSnappedCardinal = snappedCardinal;
                if (rulerSnapFlashTimerRef.current !== null) {
                  window.clearTimeout(rulerSnapFlashTimerRef.current);
                }
                setRulerSnapFlash({
                  label: snappedCardinal === 90 ? '90°' : '0°',
                  ts: performance.now(),
                });
                rulerSnapFlashTimerRef.current = window.setTimeout(() => {
                  rulerSnapFlashTimerRef.current = null;
                  setRulerSnapFlash(null);
                }, 550);
              }
            } else {
              st.lastSnappedCardinal = null;
              for (const snapDeg of [45, 135, -45, -135]) {
                if (Math.abs(nextAngle - snapDeg) <= 3.5) {
                  nextAngle = snapDeg;
                  break;
                }
              }
            }
            setRulerState((prev) => ({ ...prev, angle: nextAngle }), pageObj.id);
          }}
          onPointerUp={(e) => {
            if (rulerDragRef.current?.pointerId === e.pointerId) {
              rulerDragRef.current = null;
            }
          }}
          onLostPointerCapture={() => {
            if (rulerDragRef.current?.mode === 'rotate') {
              rulerDragRef.current = null;
            }
          }}
          style={{
            touchAction: 'none',
            WebkitUserSelect: 'none',
            userSelect: 'none',
          }}
          className="absolute left-[calc(50%-16px)] -top-9 -translate-x-1/2 flex flex-col items-center cursor-grab active:cursor-grabbing"
        >
          <div
            className={`w-7 h-7 rounded-full border shadow-md flex items-center justify-center transition ${
              Math.abs(pageRuler.angle % 90) < 0.5
                ? 'bg-[#eff6ff] border-[#2563eb] text-[#234978] ring-2 ring-[#2563eb]/25'
                : 'bg-white/95 border-slate-400/80 text-slate-600 hover:text-slate-900'
            }`}
          >
            <RotateCw className="w-3.5 h-3.5" />
          </div>
          <div className="w-[1.5px] h-2 bg-slate-400/80" />
        </div>

        {/* Millimeter Precision Toggle Button Next to Rotation Handle */}
        <button
          type="button"
          data-ui-panel="true"
          data-ruler-mm="true"
          title="Εμφάνιση υποδιαιρέσεων & τιμών με ακρίβεια χιλιοστού (mm) στον χάρακα"
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.stopPropagation();
            setRulerState((prev) => ({ ...prev, showMm: !prev.showMm }), pageObj.id);
          }}
          className="absolute left-[calc(50%+16px)] -top-9 -translate-x-1/2 flex flex-col items-center cursor-pointer outline-none"
        >
          <div
            className={`w-7 h-7 rounded-full border shadow-md flex items-center justify-center text-[9.5px] font-extrabold tracking-tight transition ${
              pageRuler.showMm
                ? 'bg-[#234978] text-white border-[#0052cc] ring-2 ring-[#234978]/30'
                : 'bg-white/95 text-slate-600 border-slate-400/80 hover:text-slate-900'
            }`}
          >
            <span
              style={{
                display: 'inline-block',
                transform: `rotate(${-pageRuler.angle}deg)`,
              }}
            >
              cm
            </span>
          </div>
          <div className={`w-[1.5px] h-2 ${pageRuler.showMm ? 'bg-[#234978]/80' : 'bg-slate-400/80'}`} />
        </button>

        {/* Tick Lines & Optional cm Precision Labels Along Top and Bottom Edges */}
        <div className="relative w-full h-full pointer-events-none overflow-hidden rounded-md">
          <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 h-px bg-slate-400/30" />

          {pageRuler.showMm ? (
            <>
              {Array.from(
                { length: Math.floor(rulerW / (oneCmPx / 10)) - 1 },
                (_, i) => {
                  const mmIdx = i + 1;
                  const isFullCm = mmIdx % 10 === 0;
                  const isHalfCm = mmIdx % 5 === 0 && !isFullCm;
                  const xPos = mmIdx * (oneCmPx / 10);
                  const tickH = isFullCm ? 13 : isHalfCm ? 8.5 : 4.5;
                  const tickW = isFullCm ? 1.5 : isHalfCm ? 1.15 : 0.85;
                  const tickCls = isFullCm
                    ? 'bg-slate-700/80'
                    : isHalfCm
                      ? 'bg-slate-600/65'
                      : 'bg-slate-500/45';
                  return (
                    <React.Fragment key={mmIdx}>
                      <div
                        style={{ left: xPos, height: tickH, width: tickW }}
                        className={`absolute top-0 -translate-x-1/2 ${tickCls}`}
                      />
                      <div
                        style={{ left: xPos, height: tickH, width: tickW }}
                        className={`absolute bottom-0 -translate-x-1/2 ${tickCls}`}
                      />
                      {isFullCm && xPos < rulerW - 14 && (
                        <span
                          style={{
                            left: xPos,
                            transform: `translate(-50%, -50%) rotate(${-pageRuler.angle}deg)`,
                          }}
                          className="absolute top-1/2 text-[9px] font-mono font-extrabold text-slate-800 bg-slate-200/85 px-0.5 rounded select-none"
                        >
                          {mmIdx / 10}
                        </span>
                      )}
                    </React.Fragment>
                  );
                }
              )}
            </>
          ) : (
            Array.from({ length: totalHalfCmSteps - 1 }, (_, i) => {
              const stepIdx = i + 1;
              const isFullCm = stepIdx % 2 === 0;
              const xPos = stepIdx * halfCmPx;
              return (
                <React.Fragment key={stepIdx}>
                  <div
                    style={{
                      left: xPos,
                      height: isFullCm ? 12 : 6,
                      width: isFullCm ? 1.5 : 1,
                    }}
                    className={`absolute top-0 -translate-x-1/2 ${
                      isFullCm ? 'bg-slate-500/55' : 'bg-slate-400/40'
                    }`}
                  />
                  <div
                    style={{
                      left: xPos,
                      height: isFullCm ? 12 : 6,
                      width: isFullCm ? 1.5 : 1,
                    }}
                    className={`absolute bottom-0 -translate-x-1/2 ${
                      isFullCm ? 'bg-slate-500/55' : 'bg-slate-400/40'
                    }`}
                  />
                </React.Fragment>
              );
            })
          )}

          {/* Colored Indicator Line Across Ruler Matching the Attached Pointer Needle */}
          {pointerCandidates.map((pSt) => {
            const info = computeRulerPointerReadout(pSt, 0, 0, pW, pageObj);
            const ptrColor = info ? info.ptrColor : pSt.color || '#dc2626';
            return (
              <div
                key={`rline-${pSt.id}`}
                data-ruler-ptr-line={pSt.id}
                style={{
                  display: info ? 'block' : 'none',
                  left: info ? info.clampedXPos : 0,
                  backgroundColor: ptrColor,
                  animationDelay: info ? `${info.readoutDelaySec}s` : '0s',
                  animationDuration: '0.22s',
                }}
                className="absolute inset-y-0 w-[2px] -translate-x-1/2 z-10 pointer-events-none opacity-90 ruler-ptr-badge-anim"
              />
            );
          })}
        </div>
      </div>

      {/* Animated Dashed Projection Line from Pointer Arrow Tip to Ruler when Locked at 0 */}
      {pointerCandidates.map((pSt) => {
        const info = computeRulerPointerReadout(pSt, 0, 0, pW, pageObj);
        const ptrColor = info ? info.ptrColor : pSt.color || '#dc2626';
        const showDash = Boolean(info && info.isLockedAtZero && info.dashLen > 1);
        const dLen = info ? Math.max(1, info.dashLen) : 1;
        return (
          <div
            key={`rdash-${pSt.id}`}
            data-ruler-ptr-dash={pSt.id}
            style={{
              display: showDash ? 'block' : 'none',
              left: info ? info.tipX : 0,
              top: info ? info.tipY : 0,
              width: dLen,
              height: 6,
              transformOrigin: '0 50%',
              transform: `translateY(-50%) rotate(${info ? info.dashAngleDeg : 0}deg)`,
              animationDelay: info ? `${info.dashDelaySec}s` : '0s',
              animationDuration: info ? `${info.dashDurationSec}s` : '0.52s',
            }}
            className="absolute z-[72] pointer-events-none select-none ruler-ptr-dash-anim"
          >
            <svg width={dLen} height={6} className="block overflow-visible">
              <line
                data-ruler-ptr-dash-svgline="true"
                x1={0}
                y1={3}
                x2={dLen}
                y2={3}
                stroke={ptrColor}
                strokeWidth={1.45}
                strokeDasharray="5 3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        );
      })}

      {/* Colored Numerical Readout (in cm) to the Right of the Ruler Matching the Pointer Arrow Color */}
      {pointerCandidates.map((pSt) => {
        const info = computeRulerPointerReadout(pSt, 0, 0, pW, pageObj);
        const ptrColor = info ? info.ptrColor : pSt.color || '#dc2626';
        return (
          <div
            key={`rbadge-${pSt.id}`}
            data-ruler-ptr-badge={pSt.id}
            style={{
              display: info ? 'flex' : 'none',
              left: info ? info.badgeX : 0,
              top: info ? info.badgeY : 0,
              color: ptrColor,
              borderColor: ptrColor,
              transform:
                !info || info.isMostlyVertical
                  ? 'translate(0, -50%)'
                  : 'translate(-50%, -100%)',
              animationDelay: info ? `${info.readoutDelaySec}s` : '0s',
              animationDuration: '0.24s',
            }}
            className="absolute z-[73] pointer-events-none items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/95 border shadow-sm font-mono font-extrabold text-[11px] leading-none whitespace-nowrap select-none ruler-ptr-badge-anim"
          >
            <span
              data-ruler-ptr-arr="true"
              style={{ color: ptrColor }}
              className="text-[8.5px]"
            >
              ◀
            </span>
            <span data-ruler-ptr-val="true">{info ? info.cmStr : ''}</span>
          </div>
        );
      })}
    </>
  );
};

export const RulerOverlay = React.memo(RulerOverlayInner);
