import type { GravityBodyState, GravityLabConfig } from './types';
import { GRAVITY_PX_PER_M } from './gravityGeometry';

function drawVectorArrow(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  dx: number,
  dy: number,
  color: string,
  label: string
) {
  const len = Math.hypot(dx, dy);
  if (len < 10) return;
  const maxLen = 82;
  const scale = len > maxLen ? maxLen / len : 1;
  const ex = x0 + dx * scale;
  const ey = y0 + dy * scale;
  const ang = Math.atan2(ey - y0, ex - x0);

  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x0, y0);
  ctx.lineTo(ex, ey);
  ctx.stroke();

  const head = 8.5;
  ctx.beginPath();
  ctx.moveTo(ex, ey);
  ctx.lineTo(ex - head * Math.cos(ang - 0.42), ey - head * Math.sin(ang - 0.42));
  ctx.lineTo(ex - head * Math.cos(ang + 0.42), ey - head * Math.sin(ang + 0.42));
  ctx.closePath();
  ctx.fill();

  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
  ctx.fillText(label, ex + 5 * Math.cos(ang) - 4, ey + 5 * Math.sin(ang) - 4);
  ctx.restore();
}

/**
 * Draws the Gravity Lab overlay: dotted trails, live tether strings, force/velocity vectors,
 * and subtle Pinned/Dynamic badges when paused!
 */
export function renderGravityOverlay(
  ctx: CanvasRenderingContext2D,
  bodies: GravityBodyState[],
  config: GravityLabConfig,
  isRunning: boolean
): void {
  ctx.save();

  for (const b of bodies) {
    if (b.pinned) {
      // Classic tilted faint-red pushpin positioned neatly OUTSIDE the bottom-right rim/corner of the pinned floor
      const pinX =
        b.shapeKind === 'ball'
          ? b.cx + (b.halfW + 15) * 0.72
          : b.cx + b.halfW + 10;
      const pinY =
        b.shapeKind === 'ball'
          ? b.cy + (b.halfH + 15) * 0.72
          : b.cy + b.halfH + 6;
      ctx.save();
      ctx.translate(pinX, pinY);
      ctx.rotate(0.45); // ~26° tilt so the needle points cleanly toward the floor rim
      ctx.globalAlpha = isRunning ? 0.42 : 0.68;
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.lineWidth = 0.7;

      // 1. Sharp tapered needle pointing down-left toward the line
      ctx.beginPath();
      ctx.moveTo(-1.1, 3.0);
      ctx.lineTo(1.1, 3.0);
      ctx.lineTo(0, 9.5);
      ctx.closePath();
      ctx.fill();

      // 2. Flared circular collar/base
      ctx.beginPath();
      ctx.ellipse(0, 2.5, 5.2, 1.9, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 3. Tapered pushpin stem/neck
      ctx.beginPath();
      ctx.moveTo(-2.5, 2.0);
      ctx.lineTo(-1.8, -5.0);
      ctx.lineTo(1.8, -5.0);
      ctx.lineTo(2.5, 2.0);
      ctx.closePath();
      ctx.fill();

      // 4. Flat oval top cap with crisp light rim separator
      ctx.beginPath();
      ctx.ellipse(0, -5.5, 3.9, 1.45, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.restore();
      continue;
    }

    // 0. Pre-launch u₀ preview when paused at t = 0:
    //    - When Velocity vector is enabled in the panel -> draw the blue vector arrow + `u₀ = ... m/s`
    //    - When Velocity vector is OFF -> hide the blue arrow and show ONLY the live `u₀ = ... m/s` value next to the user's drawn arrow
    if (!isRunning && b.trail.length <= 1) {
      const v0Mag = Math.hypot(b.initVx, b.initVy);
      if (v0Mag > 12) {
        const v0Ms = (v0Mag / GRAVITY_PX_PER_M).toFixed(1);
        const label = `u₀ = ${v0Ms} m/s`;
        if (config.showVelocity) {
          drawVectorArrow(
            ctx,
            b.cx,
            b.cy,
            b.initVx * 0.22,
            b.initVy * 0.22,
            '#2563eb',
            label
          );
        } else {
          const dx = b.initVx * 0.22;
          const dy = b.initVy * 0.22;
          const len = Math.hypot(dx, dy);
          const scale = len > 82 ? 82 / len : 1;
          const ex = b.cx + dx * scale;
          const ey = b.cy + dy * scale;
          const ang = Math.atan2(dy, dx);
          const lx = ex + 6 * Math.cos(ang) - 4;
          const ly = ey + 6 * Math.sin(ang) - 4;
          ctx.save();
          ctx.font = 'bold 11.5px system-ui, -apple-system, sans-serif';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
          ctx.lineWidth = 3;
          ctx.lineJoin = 'round';
          ctx.strokeText(label, lx, ly);
          ctx.fillStyle = '#2563eb';
          ctx.fillText(label, lx, ly);
          ctx.restore();
        }
      }
    }

    // 1. Live Trajectory Trail (same length/duration, with smooth fade-out on the oldest tail end)
    if (config.showTrail && b.trail.length >= 2) {
      ctx.save();
      ctx.strokeStyle = b.color || '#16a34a';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.setLineDash([4, 4]);

      const n = b.trail.length;
      const fadeEndIdx = n >= 16 ? Math.floor(n * 0.38) : 0;

      if (fadeEndIdx >= 6) {
        const BANDS = 6;
        const step = Math.max(1, Math.floor(fadeEndIdx / BANDS));
        for (let band = 0; band < BANDS; band++) {
          const sIdx = band * step;
          const eIdx = band === BANDS - 1 ? fadeEndIdx : Math.min(fadeEndIdx, (band + 1) * step);
          if (eIdx <= sIdx) continue;
          const frac = (band + 0.5) / BANDS; // 0 (oldest tail) -> 1 (joins full-opacity body)
          ctx.globalAlpha = 0.04 + 0.42 * (frac * frac);
          ctx.beginPath();
          ctx.moveTo(b.trail[sIdx].x, b.trail[sIdx].y);
          for (let i = sIdx + 1; i <= eIdx; i++) {
            ctx.lineTo(b.trail[i].x, b.trail[i].y);
          }
          ctx.stroke();
        }
      }

      // Main recent portion of trail at crisp 0.46 opacity
      ctx.globalAlpha = 0.46;
      ctx.beginPath();
      ctx.moveTo(b.trail[fadeEndIdx].x, b.trail[fadeEndIdx].y);
      for (let i = fadeEndIdx + 1; i < n; i++) {
        ctx.lineTo(b.trail[i].x, b.trail[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 2. Live Pendulum / String Tether
    if (b.tether) {
      ctx.save();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(b.tether.pivotX, b.tether.pivotY);
      ctx.lineTo(b.cx, b.cy);
      ctx.stroke();
      ctx.fillStyle = '#234978';
      ctx.beginPath();
      ctx.arc(b.tether.pivotX, b.tether.pivotY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Independent Vector Overlays: Velocity (outside, slightly above & ahead), Forces (W, N, F, T), OR Net Force (Fολ)
    const drewV0Preview = !isRunning && b.trail.length <= 1 && Math.hypot(b.initVx, b.initVy) > 12;

    // 3a. Velocity vector v (blue) — positioned OUTSIDE the body, slightly above & ahead along direction of motion!
    if (config.showVelocity && !drewV0Preview) {
      const speedPx = Math.hypot(b.vx, b.vy);
      if (speedPx > 8) {
        const ux = b.vx / speedPx;
        const uy = b.vy / speedPx;
        const outerR = b.shapeKind === 'ball' ? b.radius : Math.max(b.halfW, b.halfH);
        const topClearY = b.cy - (b.shapeKind === 'ball' ? b.radius : b.halfH) - 10;
        const vOriginX = b.cx + ux * (outerR * 0.55);
        const vOriginY = Math.min(topClearY, b.cy + uy * (outerR * 0.35) - outerR * 0.72);
        drawVectorArrow(ctx, vOriginX, vOriginY, b.vx * 0.22, b.vy * 0.22, '#2563eb', 'u');
      }
    }

    // Compute sum of Stickmen applied horizontal forces (needed for both Forces & Net Force modes)
    let netAppliedForceN = 0;
    if (b.pushers && b.pushers.length > 0) {
      for (const p of b.pushers) {
        netAppliedForceN +=
          config.pusherForcesN[p.strokeId] !== undefined
            ? config.pusherForcesN[p.strokeId]
            : p.dir * (Math.abs(config.pushForceN) || 14);
      }
    }

    // 3b. Individual Forces (W, N, F / F₁,F₂, T) — mutually exclusive with Net Force Fολ
    if (config.showForces) {
      // Weight W = mg (crimson)
      if (config.gravity > 0.1) {
        drawVectorArrow(ctx, b.cx, b.cy, 0, Math.min(58, config.gravity * 3.6), '#dc2626', 'W');
      }
      // Normal reaction N (emerald) when in contact
      if (b.onGround && b.normalForceN > 0.2) {
        const nLen = Math.min(58, b.normalForceN * 3.4);
        drawVectorArrow(ctx, b.cx, b.cy, b.normalX * nLen, b.normalY * nLen, '#059669', 'N');
      }
      // Individual Stickman signed horizontal forces (F, or F₁ & F₂ color-coded)
      if (b.pushers && b.pushers.length > 0) {
        const multi = b.pushers.length >= 2;
        b.pushers.forEach((p, idx) => {
          const fVal =
            config.pusherForcesN[p.strokeId] !== undefined
              ? config.pusherForcesN[p.strokeId]
              : p.dir * (Math.abs(config.pushForceN) || 14);
          if (Math.abs(fVal) > 0.2) {
            const fDir = fVal >= 0 ? 1 : -1;
            const fLen = Math.min(76, 22 + Math.abs(fVal) * 1.35);
            const yOffset = multi ? (idx - (b.pushers!.length - 1) * 0.5) * 14 : 0;
            const arrowColor =
              p.color && p.color !== '#000000' && p.color !== '#111827' ? p.color : '#1d4ed8';
            drawVectorArrow(
              ctx,
              b.cx,
              b.cy + yOffset,
              fDir * fLen,
              0,
              arrowColor,
              `${p.label} = ${Math.abs(fVal).toFixed(0)} N`
            );
          }
        });
      }
      // Friction force T (amber) opposing horizontal motion / net applied force
      if (config.frictionEnabled && b.onGround && b.frictionForceN > 0.2) {
        const motionDir =
          Math.abs(b.vx) > 2
            ? b.vx > 0
              ? 1
              : -1
            : Math.abs(netAppliedForceN) > 0.2
            ? netAppliedForceN > 0
              ? 1
              : -1
            : 0;
        if (motionDir !== 0) {
          const tLen = Math.min(64, 18 + b.frictionForceN * 1.4);
          drawVectorArrow(ctx, b.cx, b.cy + 8, -motionDir * tLen, 0, '#d97706', 'T');
        }
      }
    }

    // 3c. Net Resultant Force Fολ = W + N + ΣF + T (exact 2D vector sum!) — mutually exclusive with Forces
    if (config.showNetForce) {
      let fx = netAppliedForceN;
      let fy = b.mass * config.gravity;

      if (b.onGround && Math.hypot(b.normalX, b.normalY) > 0.1) {
        const nx = b.normalX;
        const ny = b.normalY;
        const fn = fx * nx + fy * ny;
        if (fn < 0) {
          // Add exact Normal reaction N cancelling inward force component
          fx -= fn * nx;
          fy -= fn * ny;
        }
        if (config.frictionEnabled && config.frictionMu > 0 && b.frictionForceN > 0.05) {
          const tx = -ny;
          const ty = nx;
          const vt = b.vx * tx + b.vy * ty;
          const ft = fx * tx + fy * ty;
          const maxFric = b.frictionForceN;
          if (Math.abs(vt) > 2) {
            const sign = vt > 0 ? 1 : -1;
            fx -= sign * maxFric * tx;
            fy -= sign * maxFric * ty;
          } else if (Math.abs(ft) <= maxFric + 0.2) {
            // Static friction balances tangential force -> equilibrium!
            fx -= ft * tx;
            fy -= ft * ty;
          } else {
            const sign = ft > 0 ? 1 : -1;
            fx -= sign * maxFric * tx;
            fy -= sign * maxFric * ty;
          }
        }
      }

      const fNetMag = Math.hypot(fx, fy);
      if (fNetMag > 0.35) {
        const scale = Math.min(72, 20 + fNetMag * 2.4) / fNetMag;
        drawVectorArrow(
          ctx,
          b.cx,
          b.cy,
          fx * scale,
          fy * scale,
          '#7c3aed',
          'ΣF'
        );
      } else {
        // Equilibrium badge when ΣF = 0
        const badgeY = b.cy - (b.shapeKind === 'ball' ? b.radius : b.halfH) - 16;
        ctx.save();
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const badgeText = 'ΣF = 0';
        const tw = ctx.measureText(badgeText).width + 12;
        ctx.fillStyle = 'rgba(245, 243, 255, 0.94)';
        ctx.strokeStyle = '#7c3aed';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(b.cx - tw / 2, badgeY - 9, tw, 18, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#5b21b6';
        ctx.fillText(badgeText, b.cx, badgeY + 0.5);
        ctx.restore();
      }
    }
  }

  ctx.restore();
}

