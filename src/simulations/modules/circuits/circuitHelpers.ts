import type { Notebook, NotePage, StrokeObject, CircuitSimConfig } from '../../../types/note';
import {
  getCircuitComponentsWithTerminals,
  splitWiresUnderCircuitComponent,
  pointToSegmentDist,
} from './circuitEngine';

const EMPTY_CIRCUIT_SIMS: CircuitSimConfig[] = [];

export function getValidCircuitSims(page: NotePage): CircuitSimConfig[] {
  if (!page.circuitSims || page.circuitSims.length === 0) return EMPTY_CIRCUIT_SIMS;
  const strokeIdSet = new Set(page.strokes.map((s) => s.id));
  return page.circuitSims.filter((sim) =>
    sim.strokeIds.some((id) => strokeIdSet.has(id))
  );
}

export function getAllNotebookCircuitSims(
  nb: Notebook
): { pageId: string; pageIdx: number; sim: CircuitSimConfig }[] {
  const list: { pageId: string; pageIdx: number; sim: CircuitSimConfig }[] = [];
  nb.pages.forEach((p, pageIdx) => {
    const valid = getValidCircuitSims(p);
    for (const sim of valid) {
      list.push({ pageId: p.id, pageIdx, sim });
    }
  });
  return list;
}

export function getActiveCircuitSim(page: NotePage): CircuitSimConfig | null {
  const valid = getValidCircuitSims(page);
  if (valid.length === 0) return null;
  return valid.find((sim) => sim.id === page.activeCircuitSimId) || valid[0];
}

export function getNextDefaultCircuitSimName(nb: Notebook, page?: NotePage): string {
  const allEntries = getAllNotebookCircuitSims(nb);
  const usedNames = new Set(allEntries.map((e) => e.sim.name.trim().toLowerCase()));
  if (page) {
    for (const s of getValidCircuitSims(page)) {
      usedNames.add(s.name.trim().toLowerCase());
    }
  }
  for (let i = 1; i <= 99; i++) {
    const candidate = `κύκλωμα${i}`;
    if (!usedNames.has(candidate)) return candidate;
  }
  return `κύκλωμα${usedNames.size + 1}`;
}

export function isCircuitEligibleStroke(s: StrokeObject): boolean {
  if (s.tool === 'highlighter') return false;
  if (s.arrowStart || s.arrowEnd) return false;
  if (s.points[0]?.twist === 999) return false;
  if (s.fillStyle && s.fillStyle !== 'none') return false;
  if (!s.isShape) {
    // Freehand wire strokes drawn with Apple Pencil / Stylus
    return s.points.length >= 2;
  }
  if (s.shapeType === 'line') {
    return s.points.length >= 2;
  }
  return (
    s.shapeType === 'battery' ||
    s.shapeType === 'voltage-source' ||
    s.shapeType === 'bulb' ||
    s.shapeType === 'bulb-symbol' ||
    s.shapeType === 'resistor' ||
    s.shapeType === 'switch' ||
    s.shapeType === 'switch-blade' ||
    s.shapeType === 'switch-knob' ||
    s.shapeType === 'fan' ||
    s.shapeType === 'fan-blade' ||
    s.shapeType === 'fan-hub' ||
    s.shapeType === 'ammeter' ||
    s.shapeType === 'ammeter-needle' ||
    s.shapeType === 'ammeter-label' ||
    s.shapeType === 'voltmeter' ||
    s.shapeType === 'voltmeter-needle' ||
    s.shapeType === 'voltmeter-label'
  );
}

/**
 * Strict eligibility for strokes that belong to an active/registered circuit simulation
 * or can be transitively attached to one on the fly.
 * Intentionally excludes raw freehand handwriting (`!s.isShape`) so Greek words/notes
 * written next to a circuit (`< 40px`) are NEVER absorbed into the circuit stroke graph!
 */
export function isCircuitSimConnectedStroke(s: StrokeObject): boolean {
  if (s.tool === 'highlighter') return false;
  if (s.arrowStart || s.arrowEnd) return false;
  if (s.points[0]?.twist === 999) return false;
  if (s.fillStyle && s.fillStyle !== 'none') return false;
  if (!s.isShape) return false;
  if (s.shapeType === 'line') {
    return s.points.length >= 2;
  }
  return (
    s.shapeType === 'battery' ||
    s.shapeType === 'voltage-source' ||
    s.shapeType === 'bulb' ||
    s.shapeType === 'bulb-symbol' ||
    s.shapeType === 'resistor' ||
    s.shapeType === 'switch' ||
    s.shapeType === 'switch-blade' ||
    s.shapeType === 'switch-knob' ||
    s.shapeType === 'fan' ||
    s.shapeType === 'fan-blade' ||
    s.shapeType === 'fan-hub' ||
    s.shapeType === 'ammeter' ||
    s.shapeType === 'ammeter-needle' ||
    s.shapeType === 'ammeter-label' ||
    s.shapeType === 'voltmeter' ||
    s.shapeType === 'voltmeter-needle' ||
    s.shapeType === 'voltmeter-label'
  );
}

const strokeFastBBoxCache = new WeakMap<
  StrokeObject,
  { minX: number; minY: number; maxX: number; maxY: number }
>();

function getFastStrokeBBox(s: StrokeObject): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
} {
  const cached = strokeFastBBoxCache.get(s);
  if (cached) return cached;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < s.points.length; i++) {
    const p = s.points[i];
    if (p.x < minX) minX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.x > maxX) maxX = p.x;
    if (p.y > maxY) maxY = p.y;
  }
  const res = Number.isFinite(minX)
    ? { minX, minY, maxX, maxY }
    : { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  strokeFastBBoxCache.set(s, res);
  return res;
}

export function areStrokesWithinCircuitTol(a: StrokeObject, b: StrokeObject, tol = 40): boolean {
  if (a.points.length === 0 || b.points.length === 0) return false;
  const ba = getFastStrokeBBox(a);
  const bb = getFastStrokeBBox(b);
  if (
    ba.maxX + tol < bb.minX ||
    bb.maxX + tol < ba.minX ||
    ba.maxY + tol < bb.minY ||
    bb.maxY + tol < ba.minY
  ) {
    return false;
  }
  for (const pt of a.points) {
    if (b.points.length === 1) {
      if (Math.hypot(pt.x - b.points[0].x, pt.y - b.points[0].y) <= tol) return true;
    } else {
      for (let i = 0; i < b.points.length - 1; i++) {
        if (
          pointToSegmentDist(pt.x, pt.y, b.points[i].x, b.points[i].y, b.points[i + 1].x, b.points[i + 1].y) <= tol
        ) {
          return true;
        }
      }
    }
  }
  for (const pt of b.points) {
    if (a.points.length === 1) {
      if (Math.hypot(pt.x - a.points[0].x, pt.y - a.points[0].y) <= tol) return true;
    } else {
      for (let i = 0; i < a.points.length - 1; i++) {
        if (
          pointToSegmentDist(pt.x, pt.y, a.points[i].x, a.points[i].y, a.points[i + 1].x, a.points[i + 1].y) <= tol
        ) {
          return true;
        }
      }
    }
  }
  return false;
}

const simExpandedSetCache = new WeakMap<StrokeObject[], Map<string, Set<string>>>();
const simExpandedBySigCache = new Map<string, Set<string>>();

export function getSimExpandedStrokeSet(page: NotePage, sim: CircuitSimConfig | null): Set<string> {
  if (!sim) return new Set();
  const otherSimsSig = (page.circuitSims || [])
    .filter((other) => other.id !== sim.id)
    .map((other) => `${other.id}:${other.strokeIds.length}`)
    .join('|');
  const cacheKey = `${sim.id}:${sim.strokeIds.join(',')}::${otherSimsSig}`;
  let byStrokesMap = simExpandedSetCache.get(page.strokes);
  if (byStrokesMap) {
    const hit = byStrokesMap.get(cacheKey);
    if (hit) return hit;
  } else {
    byStrokesMap = new Map();
    simExpandedSetCache.set(page.strokes, byStrokesMap);
  }

  const rawBaseSet = new Set(sim.strokeIds);
  // Build a fast geometry signature strictly over circuit-eligible strokes (ignoring all freehand handwriting!)
  // so writing 2,000 handwritten words on the same page hits this O(1) cache 100% of the time!
  let connectedGeomSig = `${cacheKey}@@`;
  for (let i = 0; i < page.strokes.length; i++) {
    const s = page.strokes[i];
    if (!rawBaseSet.has(s.id) && !isCircuitSimConnectedStroke(s)) continue;
    const p0 = s.points[0];
    const pN = s.points[s.points.length - 1];
    connectedGeomSig += `${s.id},${s.groupId || ''},${s.points.length},${p0 ? Math.round(p0.x) : 0},${p0 ? Math.round(p0.y) : 0},${pN ? Math.round(pN.x) : 0},${pN ? Math.round(pN.y) : 0};`;
  }
  const sigHit = simExpandedBySigCache.get(connectedGeomSig);
  if (sigHit) {
    byStrokesMap.set(cacheKey, sigHit);
    return sigHit;
  }
  // Self-heal any previously bloated sim.strokeIds that accidentally captured nearby freehand handwriting:
  // if the simulation contains real circuit shapes/wires, exclude raw non-shape handwriting strokes!
  const hasStrictCircuitMembers = page.strokes.some(
    (s) => rawBaseSet.has(s.id) && isCircuitSimConnectedStroke(s)
  );
  const baseSet = new Set<string>();
  for (const s of page.strokes) {
    if (!rawBaseSet.has(s.id)) continue;
    if (hasStrictCircuitMembers && !isCircuitSimConnectedStroke(s)) continue;
    baseSet.add(s.id);
  }

  const groupIds = new Set(
    page.strokes
      .filter((s) => baseSet.has(s.id) && isCircuitSimConnectedStroke(s) && s.groupId)
      .map((s) => s.groupId!)
  );
  const out = new Set<string>();
  for (const s of page.strokes) {
    if (baseSet.has(s.id)) {
      out.add(s.id);
    } else if (
      isCircuitSimConnectedStroke(s) &&
      s.groupId &&
      groupIds.has(s.groupId)
    ) {
      out.add(s.id);
    }
  }

  // Exclude strokes explicitly registered to other named simulations (e.g. sim02)
  const otherSimIds = new Set<string>();
  for (const other of page.circuitSims || []) {
    if (other.id === sim.id) continue;
    for (const id of other.strokeIds) otherSimIds.add(id);
  }

  // Transitively include any newly drawn wire branch or circuit component physically connected (<= 40px) to this circuit
  const eligible = page.strokes.filter(
    (s) => !otherSimIds.has(s.id) && (out.has(s.id) || isCircuitSimConnectedStroke(s))
  );
  let changed = true;
  while (changed) {
    changed = false;
    const currentMembers = eligible.filter((s) => out.has(s.id));
    for (const cand of eligible) {
      if (out.has(cand.id)) continue;
      if (currentMembers.some((m) => areStrokesWithinCircuitTol(cand, m, 40))) {
        out.add(cand.id);
        changed = true;
        if (cand.groupId) {
          for (const g of page.strokes) {
            if (g.groupId === cand.groupId && isCircuitSimConnectedStroke(g) && !out.has(g.id)) {
              out.add(g.id);
            }
          }
        }
      }
    }
  }

  if (byStrokesMap.size >= 32) {
    byStrokesMap.clear();
  }
  byStrokesMap.set(cacheKey, out);
  if (simExpandedBySigCache.size >= 64) {
    const oldestKey = simExpandedBySigCache.keys().next().value;
    if (oldestKey) simExpandedBySigCache.delete(oldestKey);
  }
  simExpandedBySigCache.set(connectedGeomSig, out);
  return out;
}

function isPointNearStrokeSimple(
  pt: { x: number; y: number },
  s: StrokeObject,
  tol = 26
): boolean {
  if (s.points.length === 0) return false;
  const b = getFastStrokeBBox(s);
  if (
    pt.x < b.minX - tol ||
    pt.x > b.maxX + tol ||
    pt.y < b.minY - tol ||
    pt.y > b.maxY + tol
  ) {
    return false;
  }
  if (s.points.length === 1) {
    return Math.hypot(pt.x - s.points[0].x, pt.y - s.points[0].y) <= tol;
  }
  for (let i = 0; i < s.points.length - 1; i++) {
    if (
      pointToSegmentDist(pt.x, pt.y, s.points[i].x, s.points[i].y, s.points[i + 1].x, s.points[i + 1].y) <= tol
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Ensures that when a multi-component circuit (or registered `CircuitSimConfig`) is selected
 * via Lasso or transformed via Resize / Move / Rotate, 100% of its connected wires (including
 * parallel Voltmeter horizontal leads `hl`/`hr` and vertical risers `vl`/`vr`, and split switch wires)
 * are included in the stroke set so no wire ever detaches or stays frozen behind.
 */
export function expandWholeCircuitStrokeIds(page: NotePage, strokeIds: string[]): string[] {
  if (strokeIds.length === 0) return strokeIds;
  const lockedLayerIds = new Set(
    page.layers.filter((l) => !l.visible || l.locked).map((l) => l.id)
  );
  const outSet = new Set<string>(strokeIds);

  // 1. Check registered CircuitSimConfigs on this page
  for (const sim of getValidCircuitSims(page)) {
    const simSet = getSimExpandedStrokeSet(page, sim);
    const simStrokes = page.strokes.filter(
      (s) => simSet.has(s.id) && !lockedLayerIds.has(s.layerId)
    );
    if (simStrokes.length === 0) continue;
    const simComps = getCircuitComponentsWithTerminals(simStrokes);
    const matchedComps = simComps.filter((c) => c.strokeIds.some((id) => outSet.has(id)));
    const matchedStrokeCount = simStrokes.filter((s) => outSet.has(s.id)).length;
    if (
      matchedComps.length >= 2 ||
      (simComps.length === 1 && matchedComps.length === 1 && matchedStrokeCount >= 2) ||
      matchedStrokeCount >= Math.max(3, Math.ceil(simStrokes.length * 0.35))
    ) {
      for (const s of simStrokes) {
        outSet.add(s.id);
      }
    }
  }

  // 2. General connected-circuit & parallel-voltmeter wire expansion
  const unlockedStrokes =
    lockedLayerIds.size === 0
      ? page.strokes
      : page.strokes.filter((s) => !lockedLayerIds.has(s.layerId));
  const allComps = getCircuitComponentsWithTerminals(unlockedStrokes);
  const selComps = allComps.filter((c) => c.strokeIds.some((id) => outSet.has(id)));
  for (const c of selComps) {
    for (const sid of c.strokeIds) {
      outSet.add(sid);
    }
  }

  if (selComps.length >= 2) {
    const compStrokeSet = new Set(allComps.flatMap((c) => c.strokeIds));
    const wireCandidates = unlockedStrokes.filter(
      (s) =>
        !compStrokeSet.has(s.id) &&
        isCircuitSimConnectedStroke(s) &&
        s.shapeType === 'line' &&
        !s.arrowStart &&
        !s.arrowEnd &&
        s.points.length >= 2
    );

    // Explicitly include all 4 parallel branch wires (`hl`, `hr`, `vl`, `vr`) for every selected Voltmeter
    for (const vm of selComps) {
      if (vm.kind !== 'voltmeter') continue;
      const vmTerms = [
        vm.leftTerm,
        vm.rightTerm,
        ...(vm.topTerm ? [vm.topTerm] : []),
        ...(vm.bottomTerm ? [vm.bottomTerm] : []),
      ];
      const outerHorizEndpoints: { x: number; y: number }[] = [];
      for (const w of wireCandidates) {
        const p0 = w.points[0];
        const p1 = w.points[w.points.length - 1];
        const d0 = Math.min(...vmTerms.map((t) => Math.hypot(p0.x - t.x, p0.y - t.y)));
        const d1 = Math.min(...vmTerms.map((t) => Math.hypot(p1.x - t.x, p1.y - t.y)));
        if (d0 <= 28 || d1 <= 28) {
          outSet.add(w.id);
          outerHorizEndpoints.push(d0 <= d1 ? p1 : p0);
        }
      }
      for (const ep of outerHorizEndpoints) {
        for (const w of wireCandidates) {
          const p0 = w.points[0];
          const p1 = w.points[w.points.length - 1];
          if (
            Math.hypot(p0.x - ep.x, p0.y - ep.y) <= 28 ||
            Math.hypot(p1.x - ep.x, p1.y - ep.y) <= 28
          ) {
            outSet.add(w.id);
          }
        }
      }
    }

    // Transitively include any circuit wire connected on both ends (or bridging) within the selected circuit
    let added = true;
    while (added) {
      added = false;
      const curSelStrokes = unlockedStrokes.filter((s) => outSet.has(s.id));
      for (const w of wireCandidates) {
        if (outSet.has(w.id)) continue;
        const p0 = w.points[0];
        const p1 = w.points[w.points.length - 1];
        const isExplicitCircuitWire =
          w.id.startsWith('st-wire-') || w.id.includes('par-vm-');
        const touchesAtP0 = curSelStrokes.some((m) => isPointNearStrokeSimple(p0, m, 26));
        const touchesAtP1 = curSelStrokes.some((m) => isPointNearStrokeSimple(p1, m, 26));
        if (
          (touchesAtP0 && touchesAtP1) ||
          (isExplicitCircuitWire && (touchesAtP0 || touchesAtP1))
        ) {
          outSet.add(w.id);
          added = true;
        }
      }
    }
  }

  if (outSet.size === strokeIds.length) return strokeIds;
  return page.strokes.filter((s) => outSet.has(s.id)).map((s) => s.id);
}

export function runScopedCircuitOperationOnPage(
  page: NotePage,
  op: (subStrokes: StrokeObject[]) => StrokeObject[],
  targetSimId?: string
): NotePage {
  const validSims = getValidCircuitSims(page);
  const targetSim =
    (targetSimId ? validSims.find((s) => s.id === targetSimId) : null) ||
    getActiveCircuitSim(page);
  if (!targetSim) return page;

  const simSet = getSimExpandedStrokeSet(page, targetSim);
  const subStrokes = page.strokes.filter((s) => simSet.has(s.id));
  if (subStrokes.length === 0) return page;

  const nextSubStrokes = op(subStrokes);
  const nextSubIds = nextSubStrokes.map((s) => s.id);
  const nextStrokes: StrokeObject[] = [];
  let inserted = false;
  for (const s of page.strokes) {
    if (simSet.has(s.id)) {
      if (!inserted) {
        nextStrokes.push(...nextSubStrokes);
        inserted = true;
      }
      continue;
    }
    nextStrokes.push(s);
  }
  if (!inserted) {
    nextStrokes.push(...nextSubStrokes);
  }

  const nextSims = validSims.map((sim) =>
    sim.id === targetSim.id ? { ...sim, strokeIds: nextSubIds } : sim
  );
  return {
    ...page,
    strokes: nextStrokes,
    circuitSims: nextSims,
    activeCircuitSimId: targetSim.id,
  };
}

export function splitWiresAndSyncPageSims(
  page: NotePage,
  strokesWithNewComp: StrokeObject[],
  compStrokeIds: string[]
): NotePage {
  const splitStrokes = splitWiresUnderCircuitComponent(strokesWithNewComp, compStrokeIds);
  const beforeIds = new Set(strokesWithNewComp.map((s) => s.id));
  const afterIds = new Set(splitStrokes.map((s) => s.id));
  const removedWireIds = [...beforeIds].filter((id) => !afterIds.has(id));
  const addedWireIds = [...afterIds].filter((id) => !beforeIds.has(id));

  if (removedWireIds.length === 0 || !page.circuitSims || page.circuitSims.length === 0) {
    return { ...page, strokes: splitStrokes };
  }
  const removedSet = new Set(removedWireIds);
  const nextSims = page.circuitSims.map((sim) => {
    if (!sim.strokeIds.some((id) => removedSet.has(id))) return sim;
    const kept = sim.strokeIds.filter((id) => !removedSet.has(id));
    const mergedIds = Array.from(new Set([...kept, ...addedWireIds, ...compStrokeIds]));
    return { ...sim, strokeIds: mergedIds };
  });
  return { ...page, strokes: splitStrokes, circuitSims: nextSims };
}
