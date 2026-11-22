import type {
  GravityBodyState,
  GravityEnergyStats,
  GravityLabConfig,
  GravitySegment,
} from './types';
import { GRAVITY_PX_PER_M, MAX_TRAIL_PTS } from './gravityGeometry';

export function stepGravityScene(
  bodies: GravityBodyState[],
  segments: GravitySegment[],
  config: GravityLabConfig,
  dtSec: number,
  pageW: number,
  pageH: number
): void {
  const clampedDt = Math.min(0.033, Math.max(0.001, dtSec));
  const SUB_STEPS = 8;
  const subDt = clampedDt / SUB_STEPS;
  const gPx = config.gravity * GRAVITY_PX_PER_M;

  // Snapshot previous-frame contact state so balls already rolling down a steep ramp smoothly
  // transition onto a connected horizontal floor (instead of bouncing off the sharp corner!),
  // while genuine air drops (wasOnGround === false) still bounce naturally!
  const wasOnGroundMap = new Map<string, boolean>();
  for (const b of bodies) {
    wasOnGroundMap.set(b.strokeId, b.onGround);
    b.normalX = 0;
    b.normalY = 0;
    b.normalForceN = 0;
    b.frictionForceN = 0;
    b.onGround = false;
  }

  const preStepYMap = new Map<string, number>();
  const preStepSpeedSqMap = new Map<string, number>();
  const hasExternalPushMap = new Map<string, boolean>();
  const dynamicBodyCount = bodies.reduce((acc, b) => acc + (b.pinned ? 0 : 1), 0);

  for (let step = 0; step < SUB_STEPS; step++) {
    // 1. Apply Gravity, Stickman Pushing Force F & Air Drag + integrate velocity & position
    for (const b of bodies) {
      if (b.pinned) continue;
      preStepYMap.set(b.strokeId, b.cy);
      preStepSpeedSqMap.set(b.strokeId, b.vx * b.vx + b.vy * b.vy);
      let hasExtPush = false;

      b.vy += gPx * subDt;

      // Sum all Stickmen signed horizontal forces F₁ + F₂ + ... (-40..+40 N each)
      if (b.pushers && b.pushers.length > 0) {
        let netForceN = 0;
        for (const p of b.pushers) {
          const fVal =
            config.pusherForcesN[p.strokeId] !== undefined
              ? config.pusherForcesN[p.strokeId]
              : p.dir * (Math.abs(config.pushForceN) || 14);
          netForceN += fVal;
        }
        if (Math.abs(netForceN) > 0.05) {
          hasExtPush = true;
          const axPx = (netForceN / Math.max(0.5, b.mass)) * GRAVITY_PX_PER_M;
          b.vx += axPx * subDt;
        }
      }
      hasExternalPushMap.set(b.strokeId, hasExtPush);

      if (config.airDragEnabled && config.airDragCoeff > 0) {
        const speed = Math.hypot(b.vx, b.vy);
        if (speed > 1e-3) {
          // Smooth quadratic + linear aerodynamic damping
          const dragFactor = Math.max(
            0,
            1 - (config.airDragCoeff * 0.45 + config.airDragCoeff * 0.0014 * speed) * subDt
          );
          b.vx *= dragFactor;
          b.vy *= dragFactor;
        }
      }

      b.cx += b.vx * subDt;
      b.cy += b.vy * subDt;
    }

    // 2. String / Pendulum Tether Constraints (|P - pivot| <= L)
    for (const b of bodies) {
      if (b.pinned || !b.tether) continue;
      const dx = b.cx - b.tether.pivotX;
      const dy = b.cy - b.tether.pivotY;
      const dist = Math.hypot(dx, dy);
      if (dist > b.tether.length && dist > 1e-4) {
        const nx = dx / dist;
        const ny = dy / dist;
        b.cx = b.tether.pivotX + nx * b.tether.length;
        b.cy = b.tether.pivotY + ny * b.tether.length;
        const vr = b.vx * nx + b.vy * ny;
        if (vr > 0) {
          b.vx -= vr * nx;
          b.vy -= vr * ny;
        }
      }
    }

    // 3. Body vs Static Segments Collision — Deepest-Contact-First (2 passes) to eliminate
    //    Box2D-style "ghost vertex" kicks when a ball hits near a joint between two flat segments!
    for (const b of bodies) {
      if (b.pinned) continue;
      const r = b.shapeKind === 'ball' ? b.radius : Math.min(b.halfW, b.halfH);

      const wasTrackedOnRail = wasOnGroundMap.get(b.strokeId) || b.onGround;
      const preCollisionVx = b.vx;
      const preCollisionSpeed = Math.hypot(b.vx, b.vy);
      let hitAnySegment = false;
      let firstHitNx = 0;
      let firstHitNy = 0;

      for (let iter = 0; iter < 2; iter++) {
        let bestOverlap = 0;
        let bestNx = 0;
        let bestNy = 0;
        let bestSegTx = 1;
        let bestSegTy = 0;
        let bestSegIdx = -1;
        let bestSegT = 0.5;
        let bestClosestX = 0;
        let bestClosestY = 0;

        for (let si = 0; si < segments.length; si++) {
          const seg = segments[si];
          const abx = seg.bx - seg.ax;
          const aby = seg.by - seg.ay;
          const lenSq = abx * abx + aby * aby;
          if (lenSq < 1e-4) continue;

          const t = Math.max(0, Math.min(1, ((b.cx - seg.ax) * abx + (b.cy - seg.ay) * aby) / lenSq));
          const closestX = seg.ax + t * abx;
          const closestY = seg.ay + t * aby;
          const dx = b.cx - closestX;
          const dy = b.cy - closestY;
          const dist = Math.hypot(dx, dy);
          const rContact = r + (seg.halfWidth ?? 1.5);

          if (dist < rContact && dist > 1e-5) {
            const overlap = rContact - dist;
            if (overlap > bestOverlap) {
              bestOverlap = overlap;
              bestNx = dx / dist;
              bestNy = dy / dist;
              const segLen = Math.sqrt(lenSq);
              bestSegTx = abx / segLen;
              bestSegTy = aby / segLen;
              bestSegIdx = si;
              bestSegT = t;
              bestClosestX = closestX;
              bestClosestY = closestY;
            }
          }
        }

        if (bestOverlap <= 0) break;
        hitAnySegment = true;

        let nx = bestNx;
        let ny = bestNy;

        // If hitting an open free track tip (no connected neighbor segment) while moving nearly
        // parallel to the track (launching off or re-entering a quarter-circle/ramp tip), use the
        // true flat surface normal of the segment instead of the rounded endpoint cap normal!
        const speedBeforeHit = Math.hypot(b.vx, b.vy);
        if (
          bestSegIdx >= 0 &&
          (bestSegT <= 1e-4 || bestSegT >= 1 - 1e-4) &&
          speedBeforeHit > 1e-3 &&
          Math.abs(b.vx * bestSegTx + b.vy * bestSegTy) >= 0.65 * speedBeforeHit
        ) {
          let isConnectedJoint = false;
          for (let sj = 0; sj < segments.length; sj++) {
            if (sj === bestSegIdx) continue;
            const other = segments[sj];
            if (
              Math.hypot(other.ax - bestClosestX, other.ay - bestClosestY) <= 4.5 ||
              Math.hypot(other.bx - bestClosestX, other.by - bestClosestY) <= 4.5
            ) {
              isConnectedJoint = true;
              break;
            }
          }
          if (!isConnectedJoint) {
            let sNx = -bestSegTy;
            let sNy = bestSegTx;
            if (sNx * bestNx + sNy * bestNy < 0) {
              sNx = -sNx;
              sNy = -sNy;
            }
            nx = sNx;
            ny = sNy;
          }
        }

        b.cx += nx * bestOverlap;
        b.cy += ny * bestOverlap;

        // Detect V-trough pinch (ball wider than a tight sine/U trough touching BOTH opposing walls in 1 substep):
        // Redirect smoothly up the forward wall in the direction of motion so it never gets wedged at the bottom!
        if (iter === 0) {
          firstHitNx = nx;
          firstHitNy = ny;
        } else if (config.guideRailEnabled && firstHitNx * nx < -0.15 && preCollisionSpeed > 6) {
          const dirX = preCollisionVx >= 0 ? 1 : -1;
          // Choose the forward wall's normal (right wall has nx < 0; left wall has nx > 0)
          const fwdNx = (dirX > 0 ? firstHitNx < 0 : firstHitNx > 0) ? firstHitNx : nx;
          const fwdNy = (dirX > 0 ? firstHitNx < 0 : firstHitNx > 0) ? firstHitNy : ny;
          // Up-and-forward unit tangent along the forward wall
          let climbTx = -fwdNy;
          let climbTy = fwdNx;
          if (climbTx * dirX < 0) {
            climbTx = -climbTx;
            climbTy = -climbTy;
          }
          const useExactInitE =
            !config.frictionEnabled &&
            !config.airDragEnabled &&
            !hasExternalPushMap.get(b.strokeId) &&
            dynamicBodyCount === 1 &&
            config.restitution >= 0.99;
          const refY = useExactInitE ? b.initCy : (preStepYMap.get(b.strokeId) ?? b.cy);
          const refSpeedSq = useExactInitE
            ? b.initVx * b.initVx + b.initVy * b.initVy
            : (preStepSpeedSqMap.get(b.strokeId) ?? preCollisionSpeed * preCollisionSpeed);
          const targetSpeed = Math.sqrt(Math.max(1e-2, refSpeedSq + 2 * gPx * (b.cy - refY)));
          b.vx = climbTx * targetSpeed;
          b.vy = climbTy * targetSpeed;
          b.onGround = true;
          break;
        }

        const vn = b.vx * nx + b.vy * ny;
        if (vn < 0) {
          const tx = -ny;
          const ty = nx;
          const vtBefore = b.vx * tx + b.vy * ty;
          const wasRollingOnTrack =
            (wasOnGroundMap.get(b.strokeId) || b.onGround) &&
            (ny < -0.04 || Math.abs(vn) < Math.max(85, Math.abs(vtBefore) * 0.72));
          const speedNowBefore = Math.hypot(b.vx, b.vy);
          const isParallelTrackReentry =
            speedNowBefore > 1e-3 &&
            Math.abs(b.vx * bestSegTx + b.vy * bestSegTy) >= 0.72 * speedNowBefore;
          // Smooth grazing/rolling contact on curved U-bowls, steep ramp->floor transitions, & tangential track re-entry!
          const isGrazingSlide =
            wasRollingOnTrack ||
            isParallelTrackReentry ||
            Math.abs(vn) < 42 ||
            Math.abs(vn) < Math.abs(vtBefore) * 0.48;
          const eEff = isGrazingSlide ? 0 : config.restitution;
          const jn = -(1 + eEff) * vn;
          b.vx += jn * nx;
          b.vy += jn * ny;

          // Track live normal force for vector visualization
          const nForce = (jn / Math.max(1e-4, subDt)) * (b.mass / GRAVITY_PX_PER_M);
          if (nForce > b.normalForceN) {
            b.normalForceN = nForce;
            b.normalX = nx;
            b.normalY = ny;
          }
          b.onGround = true;

          if (config.frictionEnabled && config.frictionMu > 0) {
            // Coulomb Friction along tangent (ONLY when frictionEnabled === true!)
            const vt = b.vx * tx + b.vy * ty;
            const maxFricDeltaV = config.frictionMu * Math.abs(jn);
            if (Math.abs(vt) <= maxFricDeltaV + 0.6) {
              b.vx -= vt * tx;
              b.vy -= vt * ty;
              const appliedFricN = (Math.abs(vt) / Math.max(1e-4, subDt)) * (b.mass / GRAVITY_PX_PER_M);
              b.frictionForceN = Math.max(b.frictionForceN, appliedFricN);
            } else {
              const sign = vt > 0 ? 1 : -1;
              b.vx -= sign * maxFricDeltaV * tx;
              b.vy -= sign * maxFricDeltaV * ty;
              const appliedFricN = (maxFricDeltaV / Math.max(1e-4, subDt)) * (b.mass / GRAVITY_PX_PER_M);
              b.frictionForceN = Math.max(b.frictionForceN, appliedFricN);
            }
          } else if (!config.airDragEnabled && isGrazingSlide && !hasExternalPushMap.get(b.strokeId)) {
            // Ideal conservative mode (Friction OFF, Air Drag OFF, no external pusher):
            // When single dynamic body + elastic (ideal), lock directly to exact initial mechanical energy
            // E₀ = ½ u₀² - g y₀ so ZERO numerical drift ever accumulates across steep 85° walls or troughs!
            const useExactInitE = dynamicBodyCount === 1 && config.restitution >= 0.99;
            const refY = useExactInitE ? b.initCy : (preStepYMap.get(b.strokeId) ?? b.cy);
            const refSpeedSq = useExactInitE
              ? b.initVx * b.initVx + b.initVy * b.initVy
              : (preStepSpeedSqMap.get(b.strokeId) ?? (b.vx * b.vx + b.vy * b.vy));
            const vt = b.vx * tx + b.vy * ty;
            const targetSpeedSq = refSpeedSq + 2 * gPx * (b.cy - refY);
            if (targetSpeedSq > 1e-2 && Math.abs(vt) > 1e-3) {
              const targetSpeed = Math.sqrt(targetSpeedSq);
              const sign = vt >= 0 ? 1 : -1;
              b.vx = sign * targetSpeed * tx;
              b.vy = sign * targetSpeed * ty;
            } else if (useExactInitE && targetSpeedSq <= 1e-2 && b.vy < 0) {
              // Exact turning point at initial height h₀: stop uphill velocity so gravity pulls it smoothly back down!
              b.vx = 0;
              b.vy = 0;
            }
          }
        }
      }

      // 3b. Guide Rail ("Τροχιά-Οδηγός"): when already rolling/sliding on a track, hug convex corners
      //     smoothly (e.g. steep ramp -> horizontal upper shelf or upper shelf -> downward ramp)
      //     without launching into the air, preserving exact mechanical energy!
      if (config.guideRailEnabled && wasTrackedOnRail && !hitAnySegment && segments.length > 0) {
        let bestDist = Infinity;
        let bestNx = 0;
        let bestNy = 0;
        let bestRContact = r + 1.5;

        for (let si = 0; si < segments.length; si++) {
          const seg = segments[si];
          const abx = seg.bx - seg.ax;
          const aby = seg.by - seg.ay;
          const lenSq = abx * abx + aby * aby;
          if (lenSq < 1e-4) continue;
          const t = Math.max(0, Math.min(1, ((b.cx - seg.ax) * abx + (b.cy - seg.ay) * aby) / lenSq));
          const closestX = seg.ax + t * abx;
          const closestY = seg.ay + t * aby;
          const dx = b.cx - closestX;
          const dy = b.cy - closestY;
          const dist = Math.hypot(dx, dy);
          const rContact = r + (seg.halfWidth ?? 1.5);
          if (dist > 1e-5 && dist <= rContact + 14 && dist < bestDist) {
            // Never hook/wrap a ball around an open free track tip (e.g. top of a quarter-circle
            // or launch ramp end): if closest point is an endpoint with no connected neighbor segment,
            // let the ball launch cleanly into free flight!
            if (t <= 1e-4 || t >= 1 - 1e-4) {
              let isConnectedJoint = false;
              for (let sj = 0; sj < segments.length; sj++) {
                if (sj === si) continue;
                const other = segments[sj];
                if (
                  Math.hypot(other.ax - closestX, other.ay - closestY) <= 4.5 ||
                  Math.hypot(other.bx - closestX, other.by - closestY) <= 4.5
                ) {
                  isConnectedJoint = true;
                  break;
                }
              }
              if (!isConnectedJoint) continue;
            }
            const nyCand = dy / dist;
            // Only hug upper track floors/shelves (convex ramp-to-shelf corners, NOT vertical walls or overhead loop ceilings!)
            if (nyCand < -0.35) {
              bestDist = dist;
              bestNx = dx / dist;
              bestNy = nyCand;
              bestRContact = rContact;
            }
          }
        }

        if (bestDist < Infinity) {
          const pull = bestRContact - bestDist; // <= 0, pulls body smoothly back onto track surface
          const pullDotV = pull * bestNx * b.vx + pull * bestNy * b.vy;
          const speedNow = Math.hypot(b.vx, b.vy);
          // Never yank a ball backward along its own velocity (e.g. when climbing past a loop equator)
          if (speedNow > 1e-3 && pullDotV < -0.45 * Math.abs(pull) * speedNow) {
            bestDist = Infinity;
          }
        }

        if (bestDist < Infinity) {
          const pull = bestRContact - bestDist; // <= 0, pulls body smoothly back onto track surface
          b.cx += bestNx * pull;
          b.cy += bestNy * pull;
          b.onGround = true;
          b.normalX = bestNx;
          b.normalY = bestNy;
          b.normalForceN = Math.max(b.normalForceN, Math.max(0, b.mass * config.gravity * (-bestNy)));

          const tx = -bestNy;
          const ty = bestNx;
          const vt = b.vx * tx + b.vy * ty;
          if (!config.frictionEnabled && !config.airDragEnabled && !hasExternalPushMap.get(b.strokeId)) {
            const useExactInitE = dynamicBodyCount === 1 && config.restitution >= 0.99;
            const refY = useExactInitE ? b.initCy : (preStepYMap.get(b.strokeId) ?? b.cy);
            const refSpeedSq = useExactInitE
              ? b.initVx * b.initVx + b.initVy * b.initVy
              : (preStepSpeedSqMap.get(b.strokeId) ?? (b.vx * b.vx + b.vy * b.vy));
            const targetSpeedSq = refSpeedSq + 2 * gPx * (b.cy - refY);
            if (targetSpeedSq > 1e-2 && Math.abs(vt) > 1e-3) {
              const targetSpeed = Math.sqrt(targetSpeedSq);
              const sign = vt >= 0 ? 1 : -1;
              b.vx = sign * targetSpeed * tx;
              b.vy = sign * targetSpeed * ty;
            } else if (useExactInitE && targetSpeedSq <= 1e-2 && b.vy < 0) {
              b.vx = 0;
              b.vy = 0;
            } else {
              b.vx = vt * tx;
              b.vy = vt * ty;
            }
          } else {
            const speed = Math.hypot(b.vx, b.vy);
            if (speed > 1e-3 && Math.abs(vt) > 1e-3) {
              const sign = vt >= 0 ? 1 : -1;
              b.vx = sign * speed * tx;
              b.vy = sign * speed * ty;
            } else {
              b.vx = vt * tx;
              b.vy = vt * ty;
            }
          }
        }
      }

      // Keep inside A4 page bounds gently ONLY when pageBoundsEnabled is checked!
      if (config.pageBoundsEnabled) {
        const halfWBound = b.shapeKind === 'ball' ? r : b.halfW;
        const wallRestitution = b.pushers && b.pushers.length > 0 ? 0 : config.restitution;
        if (b.cx - halfWBound < 8) {
          b.cx = 8 + halfWBound;
          if (b.vx < 0) b.vx = -b.vx * wallRestitution;
        } else if (b.cx + halfWBound > pageW - 8) {
          b.cx = pageW - 8 - halfWBound;
          if (b.vx > 0) b.vx = -b.vx * wallRestitution;
        }
        if (b.cy - r < 8) {
          b.cy = 8 + r;
          if (b.vy < 0) b.vy = -b.vy * config.restitution;
        } else if (b.cy + r > pageH - 8) {
          b.cy = pageH - 8 - r;
          if (b.vy > 0) {
            const eEff = Math.abs(b.vy) < 26 ? 0 : config.restitution;
            b.vy = -b.vy * eEff;
            b.onGround = true;
            if (config.frictionEnabled) {
              b.vx *= Math.max(0, 1 - config.frictionMu * 1.8 * subDt);
            }
          }
        }
      }
    }

    // 4. Pairwise Dynamic Body-vs-Body Collisions (elastic / inelastic!)
    for (let i = 0; i < bodies.length; i++) {
      const a = bodies[i];
      if (a.pinned) continue;
      for (let j = i + 1; j < bodies.length; j++) {
        const b = bodies[j];
        if (b.pinned) continue;
        const dx = b.cx - a.cx;
        const dy = b.cy - a.cy;
        const dist = Math.hypot(dx, dy);
        const minD = a.radius + b.radius;
        if (dist < minD && dist > 1e-4) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minD - dist;
          const invA = 1 / a.mass;
          const invB = 1 / b.mass;
          const invSum = invA + invB;
          a.cx -= nx * overlap * (invA / invSum);
          a.cy -= ny * overlap * (invA / invSum);
          b.cx += nx * overlap * (invB / invSum);
          b.cy += ny * overlap * (invB / invSum);

          const rvx = b.vx - a.vx;
          const rvy = b.vy - a.vy;
          const vn = rvx * nx + rvy * ny;
          if (vn < 0) {
            const jImp = (-(1 + config.restitution) * vn) / invSum;
            a.vx -= jImp * invA * nx;
            a.vy -= jImp * invA * ny;
            b.vx += jImp * invB * nx;
            b.vy += jImp * invB * ny;
          }
        }
      }
    }
  }

  // Record trajectory trail points cleanly
  for (const b of bodies) {
    if (b.pinned) continue;
    const last = b.trail[b.trail.length - 1];
    if (!last || Math.hypot(b.cx - last.x, b.cy - last.y) >= 4) {
      b.trail.push({ x: b.cx, y: b.cy });
      if (b.trail.length > MAX_TRAIL_PTS) b.trail.shift();
    }
  }

  // Smoothly align sliding/resting boxes to the slope angle of the surface they are riding on
  const rotBlend = Math.min(1, 18 * clampedDt);
  for (const b of bodies) {
    if (b.pinned || b.shapeKind !== 'box') continue;
    if (b.onGround && (b.normalX !== 0 || b.normalY !== 0)) {
      const nLen = Math.hypot(b.normalX, b.normalY);
      if (nLen > 1e-4) {
        const nx = b.normalX / nLen;
        const ny = b.normalY / nLen;
        // Only tilt along traversable slopes/floors (not pure vertical walls)
        if (ny < -0.15) {
          const targetAngle = Math.atan2(nx, -ny);
          const curAngle = b.angle ?? b.initAngle ?? 0;
          let delta = targetAngle - curAngle;
          // Shortest path modulo PI (symmetric box)
          while (delta > Math.PI * 0.5) delta -= Math.PI;
          while (delta <= -Math.PI * 0.5) delta += Math.PI;
          b.angle = curAngle + delta * rotBlend;
        }
      }
    }
  }
}

export function computeGravityEnergyStats(
  bodies: GravityBodyState[],
  segments: GravitySegment[],
  config: GravityLabConfig,
  pageH: number
): GravityEnergyStats {
  let refFloorY = pageH - 20;
  if (segments.length > 0) {
    let maxSegY = -Infinity;
    for (const seg of segments) {
      if (seg.ay > maxSegY) maxSegY = seg.ay;
      if (seg.by > maxSegY) maxSegY = seg.by;
    }
    if (maxSegY > 0) refFloorY = maxSegY;
  }

  let kineticJ = 0;
  let potentialJ = 0;
  let primarySpeed = 0;
  let primaryHeight = 0;
  let foundPrimary = false;

  for (const b of bodies) {
    if (b.pinned) continue;
    const speedMs = Math.hypot(b.vx, b.vy) / GRAVITY_PX_PER_M;
    const heightM = Math.max(0, (refFloorY - (b.cy + b.radius)) / GRAVITY_PX_PER_M);
    kineticJ += 0.5 * b.mass * speedMs * speedMs;
    potentialJ += b.mass * config.gravity * heightM;
    if (!foundPrimary) {
      primarySpeed = speedMs;
      primaryHeight = heightM;
      foundPrimary = true;
    }
  }

  return {
    kineticJ,
    potentialJ,
    totalJ: kineticJ + potentialJ,
    speedMs: primarySpeed,
    heightM: primaryHeight,
    refFloorY,
  };
}

