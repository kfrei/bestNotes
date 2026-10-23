import JSZip from 'jszip';
import { Notebook, NotePage, StrokeObject, BezierPoint, TextObject } from '../types/note';

/**
 * Decompresses an Apple 'bv41' raw LZ4 block into a Uint8Array.
 * Format: 'bv41' (4B) + uncompressedSize (4B LE) + compressedSize (4B LE) + lz4Stream + 'bv4$' (4B)
 */
function decompressBv41(buf: Uint8Array, offset: number): Uint8Array | null {
  if (offset + 12 > buf.length) return null;
  if (
    buf[offset] !== 0x62 || // 'b'
    buf[offset + 1] !== 0x76 || // 'v'
    buf[offset + 2] !== 0x34 || // '4'
    buf[offset + 3] !== 0x31 // '1'
  ) {
    return null;
  }

  const view = new DataView(buf.buffer, buf.byteOffset + offset, buf.byteLength - offset);
  const uncompLen = view.getUint32(4, true);
  const compLen = view.getUint32(8, true);
  if (uncompLen <= 0 || uncompLen > 1024 * 1024 || offset + 12 + compLen > buf.length) {
    return null;
  }

  const out = new Uint8Array(uncompLen);
  let srcPos = offset + 12;
  const srcEnd = srcPos + compLen;
  let dstPos = 0;

  while (srcPos < srcEnd && dstPos < uncompLen) {
    const token = buf[srcPos++];
    let literalLen = token >> 4;
    if (literalLen === 15) {
      let b = 255;
      while (b === 255 && srcPos < srcEnd) {
        b = buf[srcPos++];
        literalLen += b;
      }
    }

    for (let i = 0; i < literalLen && srcPos < srcEnd && dstPos < uncompLen; i++) {
      out[dstPos++] = buf[srcPos++];
    }

    if (srcPos >= srcEnd || dstPos >= uncompLen) break;

    const matchOffset = buf[srcPos] | (buf[srcPos + 1] << 8);
    srcPos += 2;
    if (matchOffset === 0) break;

    let matchLen = (token & 0x0f) + 4;
    if ((token & 0x0f) === 15) {
      let b = 255;
      while (b === 255 && srcPos < srcEnd) {
        b = buf[srcPos++];
        matchLen += b;
      }
    }

    let matchPos = dstPos - matchOffset;
    for (let i = 0; i < matchLen && dstPos < uncompLen; i++) {
      out[dstPos++] = matchPos >= 0 ? out[matchPos++] : 0;
    }
  }

  return out;
}

interface PbField {
  fieldNum: number;
  wireType: number;
  value: any;
  rawBytes?: Uint8Array;
}

function readVarint(buf: Uint8Array, pos: number): { val: number; next: number } {
  let result = 0;
  let shift = 0;
  let p = pos;
  while (p < buf.length) {
    const b = buf[p++];
    result += (b & 0x7f) * Math.pow(2, shift);
    if ((b & 0x80) === 0) break;
    shift += 7;
  }
  return { val: result, next: p };
}

function parsePbFields(buf: Uint8Array, depth = 0): PbField[] {
  const fields: PbField[] = [];
  let pos = 0;
  while (pos < buf.length) {
    const tagRes = readVarint(buf, pos);
    pos = tagRes.next;
    const tag = tagRes.val;
    const fieldNum = Math.floor(tag / 8);
    const wireType = tag & 0x07;
    if (fieldNum <= 0) break;

    if (wireType === 0) {
      const vRes = readVarint(buf, pos);
      pos = vRes.next;
      fields.push({ fieldNum, wireType, value: vRes.val });
    } else if (wireType === 1) {
      if (pos + 8 > buf.length) break;
      const dv = new DataView(buf.buffer, buf.byteOffset + pos, 8);
      fields.push({ fieldNum, wireType, value: dv.getFloat64(0, true) });
      pos += 8;
    } else if (wireType === 2) {
      const lenRes = readVarint(buf, pos);
      pos = lenRes.next;
      const len = lenRes.val;
      if (len < 0 || pos + len > buf.length) break;
      const sub = buf.subarray(pos, pos + len);
      pos += len;

      // Check UUID string (36 chars)
      if (len === 36) {
        const str = new TextDecoder().decode(sub);
        if (/^[A-F0-9-]{36}$/i.test(str)) {
          fields.push({ fieldNum, wireType, value: str, rawBytes: sub });
          continue;
        }
      }

      if (sub.length >= 4 && sub[0] === 0x62 && sub[1] === 0x76 && sub[2] === 0x34 && sub[3] === 0x31) {
        fields.push({ fieldNum, wireType, value: 'bv41', rawBytes: sub });
      } else if (depth < 2) {
        try {
          fields.push({ fieldNum, wireType, value: parsePbFields(sub, depth + 1), rawBytes: sub });
        } catch {
          fields.push({ fieldNum, wireType, value: sub, rawBytes: sub });
        }
      } else {
        fields.push({ fieldNum, wireType, value: sub, rawBytes: sub });
      }
    } else if (wireType === 5) {
      if (pos + 4 > buf.length) break;
      const dv = new DataView(buf.buffer, buf.byteOffset + pos, 4);
      fields.push({ fieldNum, wireType, value: dv.getFloat32(0, true) });
      pos += 4;
    } else {
      break;
    }
  }
  return fields;
}

function parseGoodnotesPageBuffer(buf: Uint8Array, pageId: string, pageNum: number): NotePage {
  const events: Uint8Array[] = [];
  let pos = 0;
  while (pos < buf.length) {
    const lenRes = readVarint(buf, pos);
    pos = lenRes.next;
    const len = lenRes.val;
    if (len <= 0 || pos + len > buf.length) break;
    events.push(buf.subarray(pos, pos + len));
    pos += len;
  }

  const deletedUuids = new Set<string>();
  const activeStrokeEvents = new Map<string, { fields: PbField[]; raw: Uint8Array }>();

  for (let i = 0; i < events.length - 1; i += 2) {
    const headerFields = parsePbFields(events[i]);
    const uuidField = headerFields.find((f) => f.fieldNum === 1);
    const statusField = headerFields.find((f) => f.fieldNum === 3);
    const uuid = typeof uuidField?.value === 'string' ? uuidField.value : '';
    if (!uuid) continue;

    if (statusField?.value === 1) {
      deletedUuids.add(uuid);
      continue;
    }

    const payloadTop = parsePbFields(events[i + 1]);
    if (payloadTop.length > 0 && payloadTop[0].fieldNum === 7 && Array.isArray(payloadTop[0].value)) {
      activeStrokeEvents.set(uuid, {
        fields: payloadTop[0].value as PbField[],
        raw: events[i + 1],
      });
    }
  }

  const strokes: StrokeObject[] = [];

  for (const [uuid, { fields, raw }] of activeStrokeEvents.entries()) {
    if (deletedUuids.has(uuid)) continue;

    // Find 'bv41' offset inside raw
    let bvIdx = -1;
    for (let j = 0; j < raw.length - 4; j++) {
      if (raw[j] === 0x62 && raw[j + 1] === 0x76 && raw[j + 2] === 0x34 && raw[j + 3] === 0x31) {
        bvIdx = j;
        break;
      }
    }
    if (bvIdx === -1) continue;

    const tplBuf = decompressBv41(raw, bvIdx);
    if (!tplBuf || tplBuf.length < 24) continue;
    if (tplBuf[0] !== 0x74 || tplBuf[1] !== 0x70 || tplBuf[2] !== 0x6c) continue; // 'tpl'

    let fmtEnd = 8;
    while (fmtEnd < tplBuf.length && tplBuf[fmtEnd] !== 0) fmtEnd++;
    const fmtStr = new TextDecoder().decode(tplBuf.subarray(8, fmtEnd));
    if (fmtStr !== 'vuA(v)A(S(uu))A(S(uuuu))vA(f)') continue;

    const dv = new DataView(tplBuf.buffer, tplBuf.byteOffset, tplBuf.byteLength);
    let p = fmtEnd + 1;
    p += 6; // skip v1 (2B) + u1 (4B)
    const lenAv = dv.getUint32(p, true);
    p += 4;
    const widths: number[] = [];
    for (let k = 0; k < lenAv && p + 2 <= tplBuf.length; k++) {
      widths.push(dv.getUint16(p, true));
      p += 2;
    }

    const lenAs2 = dv.getUint32(p, true);
    p += 4;
    if (lenAs2 === 0 || p + 8 > tplBuf.length) continue;
    const x0 = dv.getFloat32(p, true);
    const y0 = dv.getFloat32(p + 4, true);
    p += lenAs2 * 8;

    const lenAs4 = dv.getUint32(p, true);
    p += 4;

    // Extract translation offset (field 6)
    let dx = 0;
    let dy = 0;
    const f6 = fields.find((f) => f.fieldNum === 6);
    if (f6 && Array.isArray(f6.value)) {
      const dxF = (f6.value as PbField[]).find((x) => x.fieldNum === 1);
      const dyF = (f6.value as PbField[]).find((x) => x.fieldNum === 2);
      if (typeof dxF?.value === 'number') dx = dxF.value;
      if (typeof dyF?.value === 'number') dy = dyF.value;
    }

    // Extract RGBA color (field 4)
    let r = 0,
      g = 0,
      b = 0,
      a = 1;
    const f4 = fields.find((f) => f.fieldNum === 4);
    if (f4 && Array.isArray(f4.value)) {
      const cFields = f4.value as PbField[];
      const rF = cFields.find((x) => x.fieldNum === 1);
      const gF = cFields.find((x) => x.fieldNum === 2);
      const bF = cFields.find((x) => x.fieldNum === 3);
      const aF = cFields.find((x) => x.fieldNum === 4);
      if (typeof rF?.value === 'number') r = rF.value;
      if (typeof gF?.value === 'number') g = gF.value;
      if (typeof bF?.value === 'number') b = bF.value;
      if (typeof aF?.value === 'number') a = aF.value;
    }

    const f5 = fields.find((f) => f.fieldNum === 5);
    const f3 = fields.find((f) => f.fieldNum === 3);
    const isHighlighter = f5?.value === 1 || a < 0.85;

    const toHex = (n: number) =>
      Math.max(0, Math.min(255, Math.round(n * 255)))
        .toString(16)
        .padStart(2, '0');
    const hexColor = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

    const pts: BezierPoint[] = [
      {
        x: Math.round((x0 + dx) * 0.5 * 100) / 100,
        y: Math.round((y0 + dy) * 0.5 * 100) / 100,
        pressure: 0.6,
      },
    ];

    for (let k = 0; k < lenAs4 && p + 16 <= tplBuf.length; k++) {
      const cx = dv.getFloat32(p, true);
      const cy = dv.getFloat32(p + 4, true);
      const x = dv.getFloat32(p + 8, true);
      const y = dv.getFloat32(p + 12, true);
      p += 16;
      const wRaw = widths[Math.min(k + 1, widths.length - 1)] ?? 300;
      pts.push({
        x: Math.round((x + dx) * 0.5 * 100) / 100,
        y: Math.round((y + dy) * 0.5 * 100) / 100,
        cx: Math.round((cx + dx) * 0.5 * 100) / 100,
        cy: Math.round((cy + dy) * 0.5 * 100) / 100,
        pressure: Math.max(0.25, Math.min(1.0, wRaw / 600)),
      });
    }

    const avgW = widths.length > 0 ? widths.reduce((s, v) => s + v, 0) / widths.length : 280;
    const strokeWidth = isHighlighter ? 18 : Math.max(2.2, Math.min(6.5, avgW / 115));

    strokes.push({
      id: uuid,
      tool: isHighlighter ? 'highlighter' : 'pen',
      penType: 'fountain',
      color: hexColor,
      width: Math.round(strokeWidth * 10) / 10,
      opacity: isHighlighter ? Math.round(a * 100) / 100 : 1,
      points: pts,
      layerId: 'layer-1',
      isShape: f3?.value === 4,
    });
  }

  const texts: TextObject[] = [];

  return {
    id: pageId,
    title: `Σελίδα ${pageNum}`,
    template: 'grid',
    layers: [
      { id: 'layer-1', name: 'Σημειώσεις Goodnotes', visible: true, locked: false, opacity: 1 },
      { id: 'layer-2', name: 'Νέες Προσθήκες / Λύσεις', visible: true, locked: false, opacity: 1 },
    ],
    strokes,
    texts,
    images: [],
    tapes: [],
  };
}

/**
 * Parses a .goodnotes ZIP file directly in the browser and returns a BestNotes Notebook!
 */
export async function importGoodnotesFile(file: File): Promise<Notebook> {
  const zip = await JSZip.loadAsync(file);
  const noteFiles: { path: string; name: string }[] = [];

  zip.folder('notes')?.forEach((relativePath, zipEntry) => {
    if (!zipEntry.dir) {
      noteFiles.push({ path: zipEntry.name, name: relativePath });
    }
  });

  const pages: NotePage[] = [];
  let pageNum = 1;
  for (const nf of noteFiles) {
    const entry = zip.file(nf.path);
    if (!entry) continue;
    const uint8 = await entry.async('uint8array');
    const page = parseGoodnotesPageBuffer(uint8, `gn-page-${Date.now()}-${pageNum}`, pageNum);
    if (page.strokes.length > 0 || noteFiles.length === 1) {
      pages.push(page);
      pageNum++;
    }
  }

  if (pages.length === 0) {
    pages.push({
      id: `page-${Date.now()}`,
      title: 'Σελίδα 1',
      template: 'grid',
      layers: [{ id: 'layer-1', name: 'Βασικό Επίπεδο', visible: true, locked: false, opacity: 1 }],
      strokes: [],
      texts: [],
      images: [],
      tapes: [],
    });
  }

  const cleanTitle = file.name.replace(/\.goodnotes$/i, '');
  return {
    id: `nb-${Date.now()}`,
    title: cleanTitle,
    folder: 'Εισαγωγή από Goodnotes',
    coverColor: '#0284c7',
    updatedAt: new Date().toISOString(),
    sourceFormat: '.goodnotes',
    pages,
  };
}
