#!/usr/bin/env python3
"""
Generate Batch 5: 30 Rich, Detailed, Sketch-Style Native Vector (.svg) diagrams
for Φυσική Γ΄ Λυκείου (Κρούσεις, Ταλαντώσεις, Κύματα, Στερεό Σώμα, Ηλεκτρομαγνητισμός, Κβαντική).
Follows the Rich Sketch-Style SVG Standard (Section 16): hatching patterns, 3D gradients,
subtle drop shadows, fine annotations, and Greek textbook equations.
Output: public/vectors_stem/physics/phy3_*.svg
"""
import os
import math

OUT_DIR = os.path.join("public", "vectors_stem", "physics")
os.makedirs(OUT_DIR, exist_ok=True)


def svg_wrap(body: str, w: int = 460, h: int = 310) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <defs>
    <filter id="soft-shadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.2" flood-color="#0f172a" flood-opacity="0.16"/>
    </filter>
    <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="#64748b" stroke-width="1.15" opacity="0.65"/>
    </pattern>
    <pattern id="hatch-warm" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
      <line x1="0" y1="0" x2="0" y2="6" stroke="#92400e" stroke-width="1" opacity="0.35"/>
    </pattern>
    <radialGradient id="ball-blue" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#dbeafe"/>
      <stop offset="45%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </radialGradient>
    <radialGradient id="ball-red" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#fee2e2"/>
      <stop offset="45%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </radialGradient>
    <radialGradient id="ball-amber" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#92400e"/>
    </radialGradient>
    <radialGradient id="ball-slate" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="50%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#334155"/>
    </radialGradient>
    <linearGradient id="metal-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="35%" stop-color="#cbd5e1"/>
      <stop offset="70%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
    <linearGradient id="wood-grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fde68a"/>
      <stop offset="55%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="copper-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fed7aa"/>
      <stop offset="45%" stop-color="#ea580c"/>
      <stop offset="100%" stop-color="#7c2d12"/>
    </linearGradient>
    <linearGradient id="area-blue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.34"/>
      <stop offset="100%" stop-color="#3b82f6" stop-opacity="0.04"/>
    </linearGradient>
    <linearGradient id="area-red" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.32"/>
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0.04"/>
    </linearGradient>
    <marker id="arr-dark" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#1e293b"/>
    </marker>
    <marker id="arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#2563eb"/>
    </marker>
    <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#dc2626"/>
    </marker>
    <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#16a34a"/>
    </marker>
    <marker id="arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#d97706"/>
    </marker>
    <marker id="arr-violet" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#7c3aed"/>
    </marker>
  </defs>
  <style>
    .t-title {{ font: 700 13.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #0f172a; }}
    .t-sub {{ font: 700 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #334155; }}
    .t-lbl {{ font: 600 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #1e293b; }}
    .t-eq {{ font: 700 11px Georgia, "Times New Roman", serif; fill: #1e3a8a; }}
    .t-sm {{ font: 500 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #475569; }}
    .t-w {{ font: 700 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #ffffff; }}
  </style>
{body}
</svg>'''


def write_svg(name: str, body: str, w: int = 460, h: int = 310):
    with open(os.path.join(OUT_DIR, name), "w", encoding="utf-8") as f:
        f.write(svg_wrap(body, w, h))


def sine_path(x0, y0, width, amp, cycles, phase=0.0, decay=0.0, n=120):
    pts = []
    for i in range(n + 1):
        t = i / n
        x = x0 + t * width
        env = math.exp(-decay * t) if decay else 1.0
        y = y0 - amp * env * math.sin(2 * math.pi * cycles * t + phase)
        pts.append(f"{'M' if i == 0 else 'L'}{x:.1f},{y:.1f}")
    return " ".join(pts)


# 1. Elastic collision 1D
def make_elastic_collision():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ελαστική Κεντρική Κρούση (1D)</text>
  <!-- BEFORE panel -->
  <rect x="18" y="34" width="424" height="108" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="32" y="54" class="t-sub">ΠΡΙΝ την κρούση</text>
  <line x1="34" y1="118" x2="426" y2="118" stroke="#334155" stroke-width="2"/>
  <rect x="34" y="118" width="392" height="12" fill="url(#hatch)"/>
  <circle cx="118" cy="96" r="21" fill="url(#ball-blue)" stroke="#1e293b" stroke-width="1.4" filter="url(#soft-shadow)"/>
  <text x="118" y="100" text-anchor="middle" class="t-w">m₁</text>
  <line x1="142" y1="96" x2="206" y2="96" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="172" y="88" text-anchor="middle" class="t-eq" fill="#1d4ed8">u₁</text>
  <circle cx="318" cy="94" r="23" fill="url(#ball-red)" stroke="#1e293b" stroke-width="1.4" filter="url(#soft-shadow)"/>
  <text x="318" y="98" text-anchor="middle" class="t-w">m₂</text>
  <line x1="292" y1="94" x2="246" y2="94" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="268" y="86" text-anchor="middle" class="t-eq" fill="#b91c1c">u₂</text>

  <!-- AFTER panel -->
  <rect x="18" y="152" width="424" height="108" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
  <text x="32" y="172" class="t-sub">ΜΕΤΑ την κρούση</text>
  <line x1="34" y1="236" x2="426" y2="236" stroke="#334155" stroke-width="2"/>
  <rect x="34" y="236" width="392" height="12" fill="url(#hatch)"/>
  <circle cx="152" cy="214" r="21" fill="url(#ball-blue)" stroke="#1e293b" stroke-width="1.4" filter="url(#soft-shadow)"/>
  <text x="152" y="218" text-anchor="middle" class="t-w">m₁</text>
  <line x1="128" y1="214" x2="72" y2="214" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="98" y="206" text-anchor="middle" class="t-eq" fill="#1d4ed8">u₁'</text>
  <circle cx="294" cy="212" r="23" fill="url(#ball-red)" stroke="#1e293b" stroke-width="1.4" filter="url(#soft-shadow)"/>
  <text x="294" y="216" text-anchor="middle" class="t-w">m₂</text>
  <line x1="320" y1="212" x2="388" y2="212" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="356" y="204" text-anchor="middle" class="t-eq" fill="#b91c1c">u₂'</text>

  <!-- Conservation equations bar -->
  <rect x="18" y="268" width="424" height="30" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="287" text-anchor="middle" class="t-eq">ΑΔΟ: m₁u₁ + m₂u₂ = m₁u₁' + m₂u₂'    |    ΑΔΚΕ: K_πριν = K_μετά</text>
'''
    write_svg("phy3_elastic_collision_1d.svg", body)


# 2. Ballistic pendulum
def make_ballistic_pendulum():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Βαλλιστικό Εκκρεμές (Πλαστική Κρούση + ΑΔΜΕ)</text>
  <!-- Ceiling beam -->
  <rect x="130" y="34" width="210" height="14" fill="url(#hatch)" stroke="#334155" stroke-width="1.5"/>
  <circle cx="235" cy="48" r="4.5" fill="#1e293b"/>
  <!-- Initial string & block -->
  <line x1="235" y1="48" x2="235" y2="206" stroke="#334155" stroke-width="2"/>
  <rect x="206" y="206" width="58" height="44" rx="4" fill="url(#wood-grad)" stroke="#78350f" stroke-width="1.6" filter="url(#soft-shadow)"/>
  <rect x="206" y="206" width="58" height="44" rx="4" fill="url(#hatch-warm)"/>
  <text x="235" y="232" text-anchor="middle" class="t-w">M</text>
  <!-- Bullet -->
  <path d="M62,222 L88,222 Q98,228 88,234 L62,234 Z" fill="url(#metal-grad)" stroke="#1e293b" stroke-width="1.3"/>
  <line x1="102" y1="228" x2="188" y2="228" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="142" y="218" text-anchor="middle" class="t-eq" fill="#b91c1c">m, u₀</text>
  <!-- Swing arc -->
  <path d="M235,228 A180,180 0 0,0 358,158" fill="none" stroke="#64748b" stroke-width="1.6" stroke-dasharray="5,4"/>
  <!-- Final swung string & block -->
  <line x1="235" y1="48" x2="346" y2="164" stroke="#2563eb" stroke-width="2" stroke-dasharray="5,3"/>
  <g transform="translate(346,164) rotate(-42)">
    <rect x="-29" y="-22" width="58" height="44" rx="4" fill="url(#wood-grad)" opacity="0.88" stroke="#1e3a8a" stroke-width="1.5"/>
    <text x="0" y="5" text-anchor="middle" class="t-w">M+m</text>
  </g>
  <!-- Angle theta -->
  <path d="M235,98 A50,50 0 0,0 269,85" fill="none" stroke="#2563eb" stroke-width="1.5"/>
  <text x="256" y="106" class="t-eq">θ</text>
  <!-- Height h -->
  <line x1="274" y1="228" x2="412" y2="228" stroke="#64748b" stroke-width="1.2" stroke-dasharray="3,3"/>
  <line x1="378" y1="164" x2="412" y2="164" stroke="#64748b" stroke-width="1.2" stroke-dasharray="3,3"/>
  <line x1="402" y1="224" x2="402" y2="168" stroke="#16a34a" stroke-width="2" marker-start="url(#arr-green)" marker-end="url(#arr-green)"/>
  <text x="414" y="200" class="t-eq" fill="#15803d">h</text>
  <!-- Equations -->
  <rect x="20" y="264" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">1) mu₀ = (M+m)V    2) ½(M+m)V² = (M+m)gh  ⇒  V = √(2gh)</text>
'''
    write_svg("phy3_inelastic_collision_pendulum.svg", body)


# 3. Oblique collision 2D
def make_oblique_collision():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Πλάγια Κρούση σε 2 Διαστάσεις (ΑΔΟ σε x &amp; y)</text>
  <!-- Axes -->
  <line x1="42" y1="158" x2="426" y2="158" stroke="#64748b" stroke-width="1.4" stroke-dasharray="5,4" marker-end="url(#arr-dark)"/>
  <text x="434" y="162" class="t-lbl">x</text>
  <line x1="210" y1="252" x2="210" y2="48" stroke="#64748b" stroke-width="1.2" stroke-dasharray="4,4" marker-end="url(#arr-dark)"/>
  <text x="218" y="54" class="t-lbl">y</text>
  <!-- Incoming m1 -->
  <circle cx="96" cy="158" r="18" fill="url(#ball-blue)" stroke="#1e293b" stroke-width="1.3" filter="url(#soft-shadow)"/>
  <text x="96" y="162" text-anchor="middle" class="t-w">m₁</text>
  <line x1="118" y1="158" x2="184" y2="158" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="150" y="148" text-anchor="middle" class="t-eq">p₁ = m₁u₁</text>
  <!-- Target m2 at rest -->
  <circle cx="210" cy="158" r="18" fill="url(#ball-red)" opacity="0.45" stroke="#991b1b" stroke-width="1.4" stroke-dasharray="4,2"/>
  <text x="210" y="188" text-anchor="middle" class="t-sm">m₂ (u₂=0)</text>
  <!-- Outgoing m1 (upper right) -->
  <line x1="210" y1="158" x2="340" y2="80" stroke="#2563eb" stroke-width="2.5" marker-end="url(#arr-blue)"/>
  <circle cx="356" cy="70" r="16" fill="url(#ball-blue)" stroke="#1e293b" stroke-width="1.3" filter="url(#soft-shadow)"/>
  <text x="356" y="74" text-anchor="middle" class="t-w">m₁</text>
  <text x="294" y="96" class="t-eq">p₁'</text>
  <!-- Outgoing m2 (lower right) -->
  <line x1="210" y1="158" x2="344" y2="226" stroke="#dc2626" stroke-width="2.5" marker-end="url(#arr-red)"/>
  <circle cx="362" cy="235" r="16" fill="url(#ball-red)" stroke="#1e293b" stroke-width="1.3" filter="url(#soft-shadow)"/>
  <text x="362" y="239" text-anchor="middle" class="t-w">m₂</text>
  <text x="294" y="222" class="t-eq" fill="#b91c1c">p₂'</text>
  <!-- Angles -->
  <path d="M256,158 A46,46 0 0,0 248,135" fill="none" stroke="#2563eb" stroke-width="1.5"/>
  <text x="262" y="145" class="t-eq">θ₁</text>
  <path d="M256,158 A46,46 0 0,1 250,178" fill="none" stroke="#dc2626" stroke-width="1.5"/>
  <text x="262" y="177" class="t-eq" fill="#b91c1c">θ₂</text>
  <!-- Equations -->
  <rect x="20" y="264" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">Άξονας x: p₁ = p₁'cosθ₁ + p₂'cosθ₂   |   Άξονας y: p₁'sinθ₁ = p₂'sinθ₂</text>
'''
    write_svg("phy3_oblique_collision_2d.svg", body)


# 4. Impulse F(t) area
def make_impulse_ft():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ώθηση Δύναμης &amp; Εμβαδόν Διαγράμματος F(t)</text>
  <!-- Axes -->
  <line x1="62" y1="234" x2="416" y2="234" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <line x1="62" y1="234" x2="62" y2="44" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="424" y="238" class="t-lbl">t</text>
  <text x="48" y="52" class="t-lbl">F</text>
  <!-- Bell curve F(t) -->
  <path d="M104,234 Q152,230 186,120 Q216,52 246,120 Q280,230 336,234 Z" fill="url(#area-blue)" stroke="#2563eb" stroke-width="2.6"/>
  <!-- Equivalent F_mean rectangle -->
  <rect x="104" y="144" width="232" height="90" fill="#f59e0b" opacity="0.16" stroke="#d97706" stroke-width="1.8" stroke-dasharray="6,4"/>
  <text x="352" y="148" class="t-eq" fill="#b45309">F_μέση</text>
  <text x="218" y="196" text-anchor="middle" class="t-eq">Εμβαδόν = J = Δp</text>
  <text x="218" y="212" text-anchor="middle" class="t-sm">J = F_μέση · Δt</text>
  <!-- Peak & times -->
  <line x1="62" y1="86" x2="216" y2="86" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="54" y="90" text-anchor="end" class="t-sm">F_max</text>
  <text x="104" y="250" text-anchor="middle" class="t-sm">t₁</text>
  <text x="336" y="250" text-anchor="middle" class="t-sm">t₂</text>
  <line x1="108" y1="258" x2="332" y2="258" stroke="#1e293b" stroke-width="1.3" marker-start="url(#arr-dark)" marker-end="url(#arr-dark)"/>
  <text x="220" y="272" text-anchor="middle" class="t-sm">Δt = t₂ − t₁</text>
  <text x="230" y="296" text-anchor="middle" class="t-eq">J = ∫ F(t) dt = m·u_τελ − m·u_αρχ</text>
'''
    write_svg("phy3_impulse_force_time.svg", body)


# 5. SHM Phase Circle
def make_shm_phase_circle():
    wave = sine_path(224, 152, 206, 74, 1.25, phase=0.55)
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">ΑΑΤ &amp; Κύκλος Αναφοράς — x = A·sin(ωt + φ₀)</text>
  <!-- Reference circle -->
  <g transform="translate(114,152)">
    <circle r="74" fill="#f8fafc" stroke="#2563eb" stroke-width="2" filter="url(#soft-shadow)"/>
    <line x1="-88" y1="0" x2="88" y2="0" stroke="#94a3b8" stroke-width="1.2"/>
    <line x1="0" y1="-88" x2="0" y2="88" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
    <!-- Radius vector at 32 deg -->
    <line x1="0" y1="0" x2="62.8" y2="-39.2" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
    <circle cx="62.8" cy="-39.2" r="5.5" fill="url(#ball-red)" stroke="#1e293b"/>
    <path d="M26,0 A26,26 0 0,0 22,-14" fill="none" stroke="#dc2626" stroke-width="1.5"/>
    <text x="33" y="-6" class="t-eq" fill="#b91c1c">ωt+φ₀</text>
    <!-- Projection onto y axis -->
    <line x1="62.8" y1="-39.2" x2="0" y2="-39.2" stroke="#16a34a" stroke-width="1.6" stroke-dasharray="4,3"/>
    <circle cx="0" cy="-39.2" r="4.5" fill="#16a34a"/>
    <text x="-14" y="-36" text-anchor="end" class="t-eq" fill="#15803d">x</text>
    <text x="-12" y="-74" text-anchor="end" class="t-sm">+A</text>
    <text x="-12" y="80" text-anchor="end" class="t-sm">−A</text>
    <text x="26" y="-44" class="t-sm">A</text>
  </g>
  <!-- Dashed link from circle to wave -->
  <line x1="177" y1="113" x2="224" y2="113" stroke="#16a34a" stroke-width="1.4" stroke-dasharray="4,3"/>
  <!-- Sine wave x(t) -->
  <line x1="224" y1="152" x2="442" y2="152" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <line x1="224" y1="242" x2="224" y2="58" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <line x1="224" y1="78" x2="432" y2="78" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,3"/>
  <line x1="224" y1="226" x2="432" y2="226" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4,3"/>
  <path d="{wave}" fill="none" stroke="#2563eb" stroke-width="2.6"/>
  <circle cx="224" cy="113" r="4.5" fill="#16a34a"/>
  <text x="444" y="156" class="t-lbl">t</text>
  <text x="218" y="54" text-anchor="end" class="t-lbl">x(t)</text>
  <text x="388" y="68" class="t-sm">Περίοδος T = 2π/ω</text>
  <rect x="24" y="264" width="412" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">x = A·sin(ωt + φ₀)   |   u = ωA·cos(ωt + φ₀)   |   α = −ω²x</text>
'''
    write_svg("phy3_shm_phase_circle.svg", body)


# 6. SHM x(t), u(t), a(t) stacked graphs
def make_shm_xva():
    px = sine_path(78, 76, 336, 26, 1.5, phase=0.0)
    pu = sine_path(78, 158, 336, 26, 1.5, phase=math.pi / 2)
    pa = sine_path(78, 240, 336, 26, 1.5, phase=math.pi)
    body = f'''
  <text x="230" y="20" text-anchor="middle" class="t-title">Γραφικές Παραστάσεις ΑΑΤ: x(t), u(t), α(t)</text>
  <!-- Vertical guides at T/4, T/2, 3T/4, T -->
  <g stroke="#e2e8f0" stroke-width="1.2" stroke-dasharray="4,3">
    <line x1="134" y1="40" x2="134" y2="274"/>
    <line x1="190" y1="40" x2="190" y2="274"/>
    <line x1="246" y1="40" x2="246" y2="274"/>
    <line x1="302" y1="40" x2="302" y2="274"/>
    <line x1="358" y1="40" x2="358" y2="274"/>
  </g>
  <!-- x(t) -->
  <line x1="78" y1="76" x2="430" y2="76" stroke="#334155" stroke-width="1.4" marker-end="url(#arr-dark)"/>
  <line x1="78" y1="108" x2="78" y2="42" stroke="#334155" stroke-width="1.4" marker-end="url(#arr-dark)"/>
  <path d="{px}" fill="none" stroke="#2563eb" stroke-width="2.4"/>
  <text x="68" y="54" text-anchor="end" class="t-eq" fill="#1d4ed8">x(t)</text>
  <text x="68" y="68" text-anchor="end" class="t-sm">+A</text>
  <!-- u(t) -->
  <line x1="78" y1="158" x2="430" y2="158" stroke="#334155" stroke-width="1.4" marker-end="url(#arr-dark)"/>
  <line x1="78" y1="190" x2="78" y2="124" stroke="#334155" stroke-width="1.4" marker-end="url(#arr-dark)"/>
  <path d="{pu}" fill="none" stroke="#16a34a" stroke-width="2.4"/>
  <text x="68" y="136" text-anchor="end" class="t-eq" fill="#15803d">u(t)</text>
  <text x="68" y="150" text-anchor="end" class="t-sm">+u_max</text>
  <!-- a(t) -->
  <line x1="78" y1="240" x2="430" y2="240" stroke="#334155" stroke-width="1.4" marker-end="url(#arr-dark)"/>
  <line x1="78" y1="272" x2="78" y2="206" stroke="#334155" stroke-width="1.4" marker-end="url(#arr-dark)"/>
  <path d="{pa}" fill="none" stroke="#dc2626" stroke-width="2.4"/>
  <text x="68" y="218" text-anchor="end" class="t-eq" fill="#b91c1c">α(t)</text>
  <text x="68" y="232" text-anchor="end" class="t-sm">+α_max</text>
  <!-- Time ticks -->
  <text x="134" y="290" text-anchor="middle" class="t-sm">T/4</text>
  <text x="190" y="290" text-anchor="middle" class="t-sm">T/2</text>
  <text x="246" y="290" text-anchor="middle" class="t-sm">3T/4</text>
  <text x="302" y="290" text-anchor="middle" class="t-sm">T</text>
  <text x="434" y="244" class="t-lbl">t</text>
'''
    write_svg("phy3_shm_xva_graphs.svg", body)


# 7. SHM Energy vs x
def make_shm_energy():
    # Parabolas U = k x^2 and K = E - U from x = -140 to +140
    u_pts, k_pts = [], []
    for i in range(61):
        u = (i / 60) * 2 - 1  # -1..1
        x = 230 + u * 140
        yU = 236 - 150 * (u * u)
        yK = 236 - 150 * (1 - u * u)
        u_pts.append(f"{'M' if i == 0 else 'L'}{x:.1f},{yU:.1f}")
        k_pts.append(f"{'M' if i == 0 else 'L'}{x:.1f},{yK:.1f}")
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ενέργειες στην ΑΑΤ: E = K + U = ½DA²</text>
  <!-- Axes -->
  <line x1="56" y1="236" x2="414" y2="236" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <line x1="230" y1="252" x2="230" y2="46" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="422" y="240" class="t-lbl">x</text>
  <text x="242" y="54" class="t-lbl">Ενέργεια</text>
  <!-- Total energy line -->
  <line x1="90" y1="86" x2="370" y2="86" stroke="#0f172a" stroke-width="2.4" stroke-dasharray="7,4"/>
  <text x="378" y="90" class="t-eq">E = ½DA²</text>
  <!-- Curves -->
  <path d="{' '.join(u_pts)}" fill="none" stroke="#2563eb" stroke-width="2.8"/>
  <path d="{' '.join(k_pts)}" fill="none" stroke="#dc2626" stroke-width="2.8"/>
  <!-- Intersection points x = ±A/√2 -->
  <circle cx="131" cy="161" r="4.5" fill="#7c3aed" stroke="#fff" stroke-width="1.2"/>
  <circle cx="329" cy="161" r="4.5" fill="#7c3aed" stroke="#fff" stroke-width="1.2"/>
  <line x1="131" y1="161" x2="131" y2="236" stroke="#7c3aed" stroke-width="1.2" stroke-dasharray="3,3"/>
  <line x1="329" y1="161" x2="329" y2="236" stroke="#7c3aed" stroke-width="1.2" stroke-dasharray="3,3"/>
  <text x="90" y="252" text-anchor="middle" class="t-lbl">−A</text>
  <text x="370" y="252" text-anchor="middle" class="t-lbl">+A</text>
  <text x="329" y="252" text-anchor="middle" class="t-sm" fill="#6d28d9">+A/√2</text>
  <text x="131" y="252" text-anchor="middle" class="t-sm" fill="#6d28d9">−A/√2</text>
  <text x="336" y="122" class="t-eq" fill="#1d4ed8">U = ½Dx²</text>
  <text x="252" y="114" class="t-eq" fill="#b91c1c">K = ½mu²</text>
  <text x="230" y="290" text-anchor="middle" class="t-sm">Στα x = ±A/√2 ισχύει K = U = E/2</text>
'''
    write_svg("phy3_shm_energy_graph.svg", body)


# 8. Damped oscillation
def make_damped_oscillation():
    curve = sine_path(62, 152, 354, 88, 3.8, phase=math.pi / 2, decay=2.0, n=180)
    env_top = " ".join(f"{'M' if i == 0 else 'L'}{62 + (i/60)*354:.1f},{152 - 88*math.exp(-2.0*(i/60)):.1f}" for i in range(61))
    env_bot = " ".join(f"{'M' if i == 0 else 'L'}{62 + (i/60)*354:.1f},{152 + 88*math.exp(-2.0*(i/60)):.1f}" for i in range(61))
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Φθίνουσα Ταλάντωση — A(t) = A₀·e^(−Λt)</text>
  <line x1="62" y1="152" x2="432" y2="152" stroke="#1e293b" stroke-width="1.8" marker-end="url(#arr-dark)"/>
  <line x1="62" y1="256" x2="62" y2="44" stroke="#1e293b" stroke-width="1.8" marker-end="url(#arr-dark)"/>
  <text x="438" y="156" class="t-lbl">t</text>
  <text x="50" y="52" class="t-lbl">x(t)</text>
  <path d="{env_top}" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="6,4"/>
  <path d="{env_bot}" fill="none" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="6,4"/>
  <path d="{curve}" fill="none" stroke="#2563eb" stroke-width="2.5"/>
  <text x="52" y="68" text-anchor="end" class="t-sm">+A₀</text>
  <text x="52" y="242" text-anchor="end" class="t-sm">−A₀</text>
  <text x="276" y="88" class="t-eq" fill="#b91c1c">+A₀·e^(−Λt)</text>
  <rect x="28" y="268" width="404" height="30" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="287" text-anchor="middle" class="t-eq">F_αντ = −b·u   |   Λ = b / (2m)   |   E(t) = E₀·e^(−2Λt)</text>
'''
    write_svg("phy3_damped_oscillation.svg", body)


# 9. Forced oscillation & Resonance
def make_resonance():
    def res_curve(b_val, color, dash=""):
        pts = []
        for i in range(91):
            r = 0.15 + (i / 90) * 2.15  # f/f0 from 0.15 to 2.3
            amp = 1.0 / math.sqrt((1 - r * r) ** 2 + (b_val * r) ** 2)
            amp = min(amp, 4.2)
            x = 64 + (r / 2.3) * 354
            y = 238 - amp * 42
            pts.append(f"{'M' if i == 0 else 'L'}{x:.1f},{y:.1f}")
        extra = f' stroke-dasharray="{dash}"' if dash else ""
        return f'<path d="{" ".join(pts)}" fill="none" stroke="{color}" stroke-width="2.4"{extra}/>'

    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Εξαναγκασμένη Ταλάντωση &amp; Καμπύλη Συντονισμού</text>
  <line x1="64" y1="238" x2="430" y2="238" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <line x1="64" y1="238" x2="64" y2="42" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="436" y="242" class="t-lbl">f</text>
  <text x="52" y="50" class="t-lbl">A</text>
  <!-- f0 vertical line -->
  <line x1="218" y1="48" x2="218" y2="238" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,4"/>
  <text x="218" y="254" text-anchor="middle" class="t-eq" fill="#b91c1c">f₀ (Συντονισμός)</text>
  {res_curve(0.25, "#dc2626")}
  {res_curve(0.55, "#2563eb")}
  {res_curve(1.05, "#16a34a")}
  <!-- Labels -->
  <text x="252" y="72" class="t-lbl" fill="#b91c1c">Μικρή απόσβεση (b₁)</text>
  <text x="266" y="142" class="t-lbl" fill="#1d4ed8">Μέτρια απόσβεση (b₂)</text>
  <text x="280" y="192" class="t-lbl" fill="#15803d">Μεγάλη απόσβεση (b₃)</text>
  <text x="230" y="288" text-anchor="middle" class="t-eq">Συντονισμός όταν f_διεγ = f₀  ⇒  Μέγιστο πλάτος A_max (b₁ &lt; b₂ &lt; b₃)</text>
'''
    write_svg("phy3_forced_resonance.svg", body)


# 10. Transverse vs Longitudinal wave
def make_transverse_longitudinal():
    tw = sine_path(38, 96, 384, 30, 3.0)
    # Longitudinal vertical bars with sinusoidal density
    bars = []
    for i in range(44):
        base_x = 38 + (i / 43) * 384
        dx = 6.5 * math.sin(2 * math.pi * 2.5 * (i / 43))
        x = base_x + dx
        bars.append(f'<line x1="{x:.1f}" y1="190" x2="{x:.1f}" y2="246" stroke="#2563eb" stroke-width="1.6"/>')
    body = f'''
  <text x="230" y="20" text-anchor="middle" class="t-title">Εγκάρσιο vs Διάμηκες Κύμα</text>
  <!-- Top: Transverse -->
  <rect x="20" y="32" width="420" height="114" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="34" y="50" class="t-sub">1. Εγκάρσιο Κύμα (ταλάντωση ⊥ διάδοση)</text>
  <line x1="34" y1="96" x2="426" y2="96" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <path d="{tw}" fill="none" stroke="#dc2626" stroke-width="2.6"/>
  <line x1="70" y1="66" x2="198" y2="66" stroke="#1e293b" stroke-width="1.4" marker-start="url(#arr-dark)" marker-end="url(#arr-dark)"/>
  <text x="134" y="60" text-anchor="middle" class="t-eq">λ</text>
  <line x1="364" y1="74" x2="412" y2="74" stroke="#16a34a" stroke-width="2" marker-end="url(#arr-green)"/>
  <text x="388" y="68" text-anchor="middle" class="t-sm" fill="#15803d">u_διάδ</text>
  <text x="70" y="136" text-anchor="middle" class="t-sm">Όρος</text>
  <text x="134" y="136" text-anchor="middle" class="t-sm">Κοιλάδα</text>

  <!-- Bottom: Longitudinal -->
  <rect x="20" y="156" width="420" height="122" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="34" y="174" class="t-sub">2. Διάμηκες Κύμα (ταλάντωση ∥ διάδοση — π.χ. Ήχος)</text>
  {"".join(bars)}
  <text x="114" y="264" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Πύκνωμα</text>
  <text x="192" y="264" text-anchor="middle" class="t-sm">Αραίωμα</text>
  <text x="268" y="264" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Πύκνωμα</text>
  <line x1="114" y1="184" x2="268" y2="184" stroke="#1e293b" stroke-width="1.4" marker-start="url(#arr-dark)" marker-end="url(#arr-dark)"/>
  <text x="191" y="179" text-anchor="middle" class="t-eq">λ</text>
  <text x="230" y="298" text-anchor="middle" class="t-eq">Θεμελιώδης νόμος κυματικής: u = λ · f = λ / T</text>
'''
    write_svg("phy3_transverse_vs_longitudinal.svg", body)


# 11. Wave snapshot y(x) vs oscillation y(t)
def make_wave_snapshot():
    w1 = sine_path(46, 152, 166, 48, 1.5)
    w2 = sine_path(258, 152, 166, 48, 1.5, phase=0.0)
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Στιγμιότυπο Κύματος y(x) vs Ταλάντωση Σημείου y(t)</text>
  <!-- Left: y(x) -->
  <rect x="16" y="38" width="208" height="222" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="120" y="58" text-anchor="middle" class="t-sub">Στιγμιότυπο (t = σταθ.)</text>
  <line x1="42" y1="152" x2="214" y2="152" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <line x1="46" y1="214" x2="46" y2="80" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <path d="{w1}" fill="none" stroke="#2563eb" stroke-width="2.5"/>
  <line x1="46" y1="96" x2="156" y2="96" stroke="#dc2626" stroke-width="1.5" marker-start="url(#arr-red)" marker-end="url(#arr-red)"/>
  <text x="101" y="90" text-anchor="middle" class="t-eq" fill="#b91c1c">λ (μήκος κύματος)</text>
  <text x="212" y="168" text-anchor="end" class="t-lbl">x (m)</text>
  <text x="38" y="88" text-anchor="end" class="t-lbl">y</text>
  <text x="120" y="242" text-anchor="middle" class="t-sm">Δείχνει ΟΛΑ τα σημεία μια στιγμή</text>

  <!-- Right: y(t) -->
  <rect x="236" y="38" width="208" height="222" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="340" y="58" text-anchor="middle" class="t-sub">Διάγραμμα Χρόνου (x = σταθ.)</text>
  <line x1="254" y1="152" x2="428" y2="152" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <line x1="258" y1="214" x2="258" y2="80" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <path d="{w2}" fill="none" stroke="#16a34a" stroke-width="2.5"/>
  <line x1="258" y1="96" x2="368" y2="96" stroke="#d97706" stroke-width="1.5" marker-start="url(#arr-amber)" marker-end="url(#arr-amber)"/>
  <text x="313" y="90" text-anchor="middle" class="t-eq" fill="#b45309">T (περίοδος)</text>
  <text x="426" y="168" text-anchor="end" class="t-lbl">t (s)</text>
  <text x="250" y="88" text-anchor="end" class="t-lbl">y</text>
  <text x="340" y="242" text-anchor="middle" class="t-sm">Δείχνει ΕΝΑ σημείο στον χρόνο</text>

  <rect x="16" y="268" width="428" height="30" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="287" text-anchor="middle" class="t-eq">Εξίσωση αρμονικού κύματος: y(x,t) = A·sin[ 2π ( t/T − x/λ ) ]</text>
'''
    write_svg("phy3_wave_snapshot_vs_time.svg", body)


# 12. Wave interference (2 sources, hyperbolas)
def make_wave_interference():
    circles = []
    for r in range(28, 170, 26):
        circles.append(f'<circle cx="165" cy="186" r="{r}" fill="none" stroke="#3b82f6" stroke-width="1.15" opacity="0.55"/>')
        circles.append(f'<circle cx="295" cy="186" r="{r}" fill="none" stroke="#dc2626" stroke-width="1.15" opacity="0.55"/>')
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Συμβολή Δύο Σύμφωνων Κυμάτων (Πηγές Π₁, Π₂)</text>
  <clipPath id="int-clip"><rect x="24" y="34" width="412" height="218" rx="10"/></clipPath>
  <rect x="24" y="34" width="412" height="218" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <g clip-path="url(#int-clip)">
    {"".join(circles)}
    <!-- Central antinodal line (k=0) -->
    <line x1="230" y1="34" x2="230" y2="252" stroke="#16a34a" stroke-width="2.4"/>
    <!-- First nodal hyperbolas -->
    <path d="M210,252 Q204,160 156,34" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="5,4"/>
    <path d="M250,252 Q256,160 304,34" fill="none" stroke="#64748b" stroke-width="1.8" stroke-dasharray="5,4"/>
    <!-- First antinodal hyperbolas -->
    <path d="M188,252 Q178,150 92,34" fill="none" stroke="#16a34a" stroke-width="1.8"/>
    <path d="M272,252 Q282,150 368,34" fill="none" stroke="#16a34a" stroke-width="1.8"/>
  </g>
  <circle cx="165" cy="186" r="6" fill="url(#ball-blue)" stroke="#1e293b"/>
  <text x="150" y="206" class="t-lbl">Π₁</text>
  <circle cx="295" cy="186" r="6" fill="url(#ball-red)" stroke="#1e293b"/>
  <text x="302" y="206" class="t-lbl">Π₂</text>
  <text x="230" y="50" text-anchor="middle" class="t-lbl" fill="#15803d">Ενίσχυση (k=0)</text>
  <text x="348" y="54" class="t-sm" fill="#475569">Απόσβεση</text>
  <rect x="24" y="260" width="412" height="38" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="276" text-anchor="middle" class="t-eq">Ενίσχυση (2A): |r₁ − r₂| = k·λ   |   Απόσβεση (0): |r₁ − r₂| = (2k+1)·λ/2</text>
  <text x="230" y="291" text-anchor="middle" class="t-sm">k = 0, ±1, ±2, ... (Υπερβολές ενίσχυσης &amp; απόσβεσης)</text>
'''
    write_svg("phy3_wave_interference.svg", body)


# 13. Standing wave nodes & antinodes
def make_standing_wave():
    w_pos = sine_path(52, 148, 356, 62, 2.0)
    w_neg = sine_path(52, 148, 356, -62, 2.0)
    w_mid = sine_path(52, 148, 356, 32, 2.0)
    nodes_x = [52 + i * 89 for i in range(5)]
    nodes_svg = "".join(f'<circle cx="{nx}" cy="148" r="5" fill="#dc2626" stroke="#fff" stroke-width="1.3"/><text x="{nx}" y="168" text-anchor="middle" class="t-lbl" fill="#b91c1c">Δ</text>' for nx in nodes_x)
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Στάσιμο Κύμα (Δεσμοί Δ &amp; Κοιλίες Κ)</text>
  <!-- Fixed walls -->
  <rect x="34" y="64" width="18" height="168" fill="url(#hatch)" stroke="#334155" stroke-width="1.6"/>
  <rect x="408" y="64" width="18" height="168" fill="url(#hatch)" stroke="#334155" stroke-width="1.6"/>
  <line x1="52" y1="148" x2="408" y2="148" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="4,3"/>
  <!-- Standing wave envelopes -->
  <path d="{w_pos}" fill="none" stroke="#2563eb" stroke-width="2.6"/>
  <path d="{w_neg}" fill="none" stroke="#2563eb" stroke-width="2.2" stroke-dasharray="6,4"/>
  <path d="{w_mid}" fill="none" stroke="#60a5fa" stroke-width="1.4" opacity="0.65"/>
  {nodes_svg}
  <!-- Antinode markers -->
  <text x="96.5" y="76" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Κοιλία (2A)</text>
  <line x1="96.5" y1="90" x2="96.5" y2="206" stroke="#16a34a" stroke-width="1.4" stroke-dasharray="3,2" marker-start="url(#arr-green)" marker-end="url(#arr-green)"/>
  <text x="185.5" y="76" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Κ</text>
  <text x="274.5" y="76" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Κ</text>
  <text x="363.5" y="76" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Κ</text>
  <!-- Distance lambda/2 -->
  <line x1="141" y1="226" x2="230" y2="226" stroke="#1e293b" stroke-width="1.6" marker-start="url(#arr-dark)" marker-end="url(#arr-dark)"/>
  <text x="185.5" y="242" text-anchor="middle" class="t-eq">λ / 2</text>
  <rect x="24" y="262" width="412" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">y(x,t) = 2A·cos(2πx/λ)·sin(2πt/T)   |   Δ–Δ = Κ–Κ = λ/2</text>
'''
    write_svg("phy3_standing_wave_nodes.svg", body)


# 14. Doppler effect
def make_doppler():
    # Wavefronts shifted right as source moves right
    wf = []
    for k in range(1, 6):
        cx = 258 - k * 18
        r = k * 27
        wf.append(f'<circle cx="{cx}" cy="150" r="{r}" fill="none" stroke="#2563eb" stroke-width="1.6" opacity="{1.0 - k*0.12:.2f}"/>')
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Φαινόμενο Doppler (Κινούμενη Πηγή Ήχου)</text>
  <clipPath id="dop-clip"><rect x="20" y="34" width="420" height="222" rx="10"/></clipPath>
  <rect x="20" y="34" width="420" height="222" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <g clip-path="url(#dop-clip)">
    {"".join(wf)}
  </g>
  <!-- Moving source -->
  <circle cx="262" cy="150" r="10" fill="url(#ball-red)" stroke="#1e293b" stroke-width="1.4" filter="url(#soft-shadow)"/>
  <line x1="274" y1="150" x2="314" y2="150" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <text x="296" y="140" class="t-eq" fill="#b91c1c">u_S</text>
  <!-- Left observer (receding) -->
  <circle cx="52" cy="150" r="9" fill="url(#ball-slate)" stroke="#1e293b"/>
  <text x="52" y="176" text-anchor="middle" class="t-lbl">Α₁</text>
  <text x="86" y="64" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Απομάκρυνση</text>
  <text x="86" y="78" text-anchor="middle" class="t-sm">λ' &gt; λ  ⇒  f' &lt; f_S</text>
  <!-- Right observer (approaching) -->
  <circle cx="408" cy="150" r="9" fill="url(#ball-amber)" stroke="#1e293b"/>
  <text x="408" y="176" text-anchor="middle" class="t-lbl">Α₂</text>
  <text x="372" y="64" text-anchor="middle" class="t-lbl" fill="#b91c1c">Προσέγγιση</text>
  <text x="372" y="78" text-anchor="middle" class="t-sm">λ' &lt; λ  ⇒  f' &gt; f_S</text>
  <rect x="20" y="264" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">f_A = f_S · (u ± u_A) / (u ∓ u_S)    (u = ταχύτητα ήχου ≈ 340 m/s)</text>
'''
    write_svg("phy3_doppler_effect.svg", body)


# 15. Wave diffraction through narrow slit
def make_diffraction():
    planes = "".join(f'<line x1="{46 + i*26}" y1="54" x2="{46 + i*26}" y2="246" stroke="#2563eb" stroke-width="2"/>' for i in range(6))
    arcs = "".join(f'<path d="M{206 + r*0.18:.1f},{150 - r*0.98:.1f} A{r},{r} 0 0,1 {206 + r*0.18:.1f},{150 + r*0.98:.1f}" fill="none" stroke="#2563eb" stroke-width="2"/>' for r in range(26, 200, 26))
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Περίθλαση Κύματος από Στενή Σχισμή (d ≲ λ)</text>
  <clipPath id="dif-clip"><rect x="24" y="36" width="412" height="222" rx="10"/></clipPath>
  <rect x="24" y="36" width="412" height="222" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <g clip-path="url(#dif-clip)">
    {planes}
    {arcs}
  </g>
  <!-- Slit barrier -->
  <rect x="196" y="36" width="14" height="100" fill="url(#hatch)" stroke="#1e293b" stroke-width="1.6"/>
  <rect x="196" y="164" width="14" height="94" fill="url(#hatch)" stroke="#1e293b" stroke-width="1.6"/>
  <!-- Lambda & slit width d -->
  <line x1="72" y1="68" x2="98" y2="68" stroke="#dc2626" stroke-width="1.6" marker-start="url(#arr-red)" marker-end="url(#arr-red)"/>
  <text x="85" y="60" text-anchor="middle" class="t-eq" fill="#b91c1c">λ</text>
  <text x="184" y="154" text-anchor="end" class="t-eq" fill="#15803d">d</text>
  <text x="110" y="242" text-anchor="middle" class="t-lbl">Επίπεδα μέτωπα</text>
  <text x="328" y="242" text-anchor="middle" class="t-lbl">Κυκλικά περιθλώμενα μέτωπα</text>
  <text x="230" y="286" text-anchor="middle" class="t-eq">Αρχή Huygens: Όσο d ≈ λ, τόσο εντονότερη η περίθλαση</text>
'''
    write_svg("phy3_wave_diffraction_slit.svg", body)


# 16. Rigid body rolling without slipping
def make_rolling():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Κύλιση Χωρίς Ολίσθηση — Κατανομή Ταχυτήτων (u_cm = ωR)</text>
  <!-- Ground -->
  <line x1="28" y1="226" x2="432" y2="226" stroke="#1e293b" stroke-width="2.2"/>
  <rect x="28" y="226" width="404" height="14" fill="url(#hatch)"/>
  <!-- Wheel / cylinder -->
  <circle cx="215" cy="146" r="78" fill="url(#metal-grad)" opacity="0.55" stroke="#1e293b" stroke-width="2.2" filter="url(#soft-shadow)"/>
  <circle cx="215" cy="146" r="5" fill="#1e293b"/>
  <!-- Spokes -->
  <line x1="215" y1="68" x2="215" y2="224" stroke="#64748b" stroke-width="1.3" stroke-dasharray="4,3"/>
  <line x1="137" y1="146" x2="293" y2="146" stroke="#64748b" stroke-width="1.3" stroke-dasharray="4,3"/>
  <!-- Rotation arc omega -->
  <path d="M180,104 A52,52 0 0,1 252,104" fill="none" stroke="#7c3aed" stroke-width="2.2" marker-end="url(#arr-violet)"/>
  <text x="215" y="96" text-anchor="middle" class="t-eq" fill="#6d28d9">ω</text>
  <!-- Velocity vectors: Top = 2 u_cm, Center = u_cm, Bottom = 0 -->
  <line x1="215" y1="68" x2="365" y2="68" stroke="#dc2626" stroke-width="2.8" marker-end="url(#arr-red)"/>
  <text x="372" y="72" class="t-eq" fill="#b91c1c">u_Α = 2u_cm</text>
  <line x1="215" y1="146" x2="292" y2="146" stroke="#2563eb" stroke-width="2.8" marker-end="url(#arr-blue)"/>
  <text x="300" y="150" class="t-eq" fill="#1d4ed8">u_cm = ωR</text>
  <circle cx="215" cy="224" r="5" fill="#16a34a" stroke="#fff" stroke-width="1.2"/>
  <text x="228" y="218" class="t-eq" fill="#15803d">u_Κ = 0 (στιγμιαίος άξονας)</text>
  <!-- Linear velocity profile line -->
  <line x1="215" y1="224" x2="365" y2="68" stroke="#dc2626" stroke-width="1.3" stroke-dasharray="4,3" opacity="0.7"/>
  <!-- Radius -->
  <text x="196" y="188" class="t-eq">R</text>
  <rect x="24" y="262" width="412" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">u_cm = ωR   |   α_cm = α_γων·R   |   K_ολ = ½mu_cm² + ½I_cmω²</text>
'''
    write_svg("phy3_rigid_body_rolling.svg", body)


# 17. Inclined plane rolling forces
def make_inclined_rolling():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Κύλιση Στερεού σε Κεκλιμένο Επίπεδο (Δυνάμεις &amp; Ροπή)</text>
  <!-- Inclined wedge -->
  <polygon points="56,246 404,246 56,92" fill="url(#hatch)" stroke="#1e293b" stroke-width="2"/>
  <path d="M352,246 A52,52 0 0,0 360,226" fill="none" stroke="#1e293b" stroke-width="1.5"/>
  <text x="336" y="238" class="t-eq">φ</text>
  <!-- Cylinder on incline -->
  <g transform="translate(216,130)">
    <circle r="34" fill="url(#ball-slate)" stroke="#1e293b" stroke-width="2" filter="url(#soft-shadow)"/>
    <circle r="4" fill="#1e293b"/>
    <!-- Weight W vertical -->
    <line x1="0" y1="0" x2="0" y2="88" stroke="#1e293b" stroke-width="2.4" marker-end="url(#arr-dark)"/>
    <text x="-18" y="84" class="t-eq">W = mg</text>
    <!-- W sin phi along incline -->
    <line x1="0" y1="0" x2="64" y2="28" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
    <text x="72" y="34" class="t-eq" fill="#b91c1c">W·sinφ</text>
    <!-- Normal N perpendicular -->
    <line x1="14" y1="31" x2="-24" y2="-56" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arr-green)"/>
    <text x="-38" y="-56" class="t-eq" fill="#15803d">N</text>
    <!-- Static friction T_s at contact point pointing UP the incline -->
    <line x1="-14" y1="31" x2="-62" y2="10" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
    <text x="-82" y="10" class="t-eq" fill="#1d4ed8">T_σ</text>
    <!-- Angular acceleration arc -->
    <path d="M-16,-20 A24,24 0 0,1 20,-14" fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#arr-violet)"/>
    <text x="16" y="-26" class="t-eq" fill="#6d28d9">α_γων</text>
  </g>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">mg·sinφ − T_σ = m·α_cm    |    T_σ · R = I_cm · α_γων    (α_cm = α_γων·R)</text>
'''
    write_svg("phy3_inclined_rolling_forces.svg", body)


# 18. Torque & lever arm
def make_torque_lever():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ροπή Δύναμης &amp; Μοχλοβραχίονας (τ = F · d = r · F · sinθ)</text>
  <!-- Pivot O -->
  <circle cx="88" cy="186" r="10" fill="url(#metal-grad)" stroke="#1e293b" stroke-width="2"/>
  <circle cx="88" cy="186" r="3" fill="#1e293b"/>
  <text x="72" y="206" class="t-lbl">Ο (Άξονας)</text>
  <!-- Rigid rod -->
  <line x1="88" y1="186" x2="314" y2="122" stroke="#92400e" stroke-width="10" stroke-linecap="round" opacity="0.28"/>
  <line x1="88" y1="186" x2="314" y2="122" stroke="#1e293b" stroke-width="3"/>
  <text x="196" y="144" class="t-eq">r</text>
  <!-- Force vector F at tip -->
  <line x1="314" y1="122" x2="380" y2="48" stroke="#dc2626" stroke-width="2.8" marker-end="url(#arr-red)"/>
  <text x="390" y="54" class="t-eq" fill="#b91c1c">F</text>
  <!-- Line of action of F -->
  <line x1="210" y1="238" x2="386" y2="42" stroke="#dc2626" stroke-width="1.3" stroke-dasharray="5,4" opacity="0.6"/>
  <!-- Lever arm d perpendicular from O to line of action -->
  <line x1="88" y1="186" x2="232" y2="214" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <text x="164" y="218" class="t-eq" fill="#15803d">d = r·sinθ</text>
  <!-- Angle theta -->
  <path d="M338,115 A26,26 0 0,0 330,104" fill="none" stroke="#2563eb" stroke-width="1.6"/>
  <text x="346" y="114" class="t-eq">θ</text>
  <!-- Torque rotation indicator around O -->
  <path d="M68,162 A32,32 0 0,1 112,162" fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#arr-violet)"/>
  <text x="88" y="146" text-anchor="middle" class="t-eq" fill="#6d28d9">τ (+)</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">τ = F · d = r · F · sinθ   (Μονάδα SI: N·m   |   Θεμελιώδης νόμος: Στ = I·α_γων)</text>
'''
    write_svg("phy3_torque_lever_arm.svg", body)


# 19. Moments of inertia table
def make_moments_of_inertia():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ροπές Αδράνειας Κλασικών Ομογενών Στερεών</text>
  <!-- 4 cards in 2x2 grid -->
  <!-- 1. Ring -->
  <g transform="translate(20,38)">
    <rect width="204" height="122" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <circle cx="62" cy="64" r="36" fill="none" stroke="url(#metal-grad)" stroke-width="9"/>
    <circle cx="62" cy="64" r="40.5" fill="none" stroke="#1e293b" stroke-width="1.3"/>
    <circle cx="62" cy="64" r="31.5" fill="none" stroke="#1e293b" stroke-width="1.3"/>
    <circle cx="62" cy="64" r="3.5" fill="#dc2626"/>
    <line x1="62" y1="64" x2="96" y2="64" stroke="#2563eb" stroke-width="1.5"/>
    <text x="150" y="42" text-anchor="middle" class="t-sub">Δακτύλιος</text>
    <text x="150" y="68" text-anchor="middle" class="t-eq">I = mR²</text>
    <text x="150" y="88" text-anchor="middle" class="t-sm">(άξονας κέντρου)</text>
  </g>
  <!-- 2. Solid Disk / Cylinder -->
  <g transform="translate(236,38)">
    <rect width="204" height="122" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <circle cx="62" cy="64" r="38" fill="url(#ball-blue)" opacity="0.85" stroke="#1e293b" stroke-width="1.6"/>
    <circle cx="62" cy="64" r="3.5" fill="#fff"/>
    <line x1="62" y1="64" x2="98" y2="64" stroke="#fff" stroke-width="1.6"/>
    <text x="150" y="42" text-anchor="middle" class="t-sub">Δίσκος / Κύλινδρος</text>
    <text x="150" y="68" text-anchor="middle" class="t-eq">I = ½ mR²</text>
    <text x="150" y="88" text-anchor="middle" class="t-sm">(συμπαγής)</text>
  </g>
  <!-- 3. Solid Sphere -->
  <g transform="translate(20,172)">
    <rect width="204" height="122" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <circle cx="62" cy="64" r="38" fill="url(#ball-amber)" stroke="#1e293b" stroke-width="1.6"/>
    <ellipse cx="62" cy="64" rx="38" ry="12" fill="none" stroke="#78350f" stroke-width="1.2" stroke-dasharray="4,3"/>
    <line x1="62" y1="18" x2="62" y2="110" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,3"/>
    <text x="150" y="42" text-anchor="middle" class="t-sub">Συμπαγής Σφαίρα</text>
    <text x="150" y="68" text-anchor="middle" class="t-eq">I = ⅖ mR²</text>
    <text x="150" y="88" text-anchor="middle" class="t-sm">(άξονας διαμέτρου)</text>
  </g>
  <!-- 4. Thin Rod -->
  <g transform="translate(236,172)">
    <rect width="204" height="122" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <rect x="20" y="58" width="110" height="12" rx="4" fill="url(#wood-grad)" stroke="#78350f" stroke-width="1.4"/>
    <line x1="75" y1="24" x2="75" y2="102" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="4,3"/>
    <text x="164" y="40" text-anchor="middle" class="t-sub">Λεπτή Ράβδος</text>
    <text x="164" y="64" text-anchor="middle" class="t-eq">I_cm = 1/12 mL²</text>
    <text x="164" y="86" text-anchor="middle" class="t-eq" fill="#b91c1c">I_άκρο = ⅓ mL²</text>
  </g>
'''
    write_svg("phy3_moments_of_inertia.svg", body)


# 20. Atwood machine with massive pulley
def make_atwood_pulley():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Τροχαλία με Μάζα &amp; Ροπή Αδράνειας (T₁ ≠ T₂)</text>
  <!-- Support -->
  <rect x="164" y="34" width="132" height="14" fill="url(#hatch)" stroke="#1e293b" stroke-width="1.5"/>
  <line x1="230" y1="48" x2="230" y2="108" stroke="#475569" stroke-width="4"/>
  <!-- Pulley -->
  <circle cx="230" cy="108" r="38" fill="url(#metal-grad)" stroke="#1e293b" stroke-width="2" filter="url(#soft-shadow)"/>
  <circle cx="230" cy="108" r="7" fill="#1e293b"/>
  <text x="230" y="92" text-anchor="middle" class="t-sm">M, R, I</text>
  <!-- Strings -->
  <line x1="192" y1="108" x2="192" y2="212" stroke="#1e293b" stroke-width="2"/>
  <line x1="268" y1="108" x2="268" y2="188" stroke="#1e293b" stroke-width="2"/>
  <!-- Left mass m1 -->
  <rect x="168" y="212" width="48" height="42" rx="5" fill="url(#ball-blue)" stroke="#1e293b" stroke-width="1.5" filter="url(#soft-shadow)"/>
  <text x="192" y="238" text-anchor="middle" class="t-w">m₁</text>
  <!-- Right mass m2 > m1 -->
  <rect x="240" y="188" width="56" height="50" rx="5" fill="url(#ball-red)" stroke="#1e293b" stroke-width="1.5" filter="url(#soft-shadow)"/>
  <text x="268" y="218" text-anchor="middle" class="t-w">m₂</text>
  <!-- Tensions & weights -->
  <line x1="184" y1="204" x2="184" y2="154" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-blue)"/>
  <text x="168" y="176" class="t-eq" fill="#1d4ed8">T₁</text>
  <line x1="276" y1="180" x2="276" y2="132" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="290" y="156" class="t-eq" fill="#b91c1c">T₂</text>
  <line x1="312" y1="186" x2="312" y2="236" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arr-green)"/>
  <text x="322" y="214" class="t-eq" fill="#15803d">α (m₂ &gt; m₁)</text>
  <!-- Rotation arrow -->
  <path d="M206,74 A36,36 0 0,1 258,74" fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#arr-violet)"/>
  <text x="278" y="76" class="t-eq" fill="#6d28d9">α_γων</text>
  <rect x="20" y="264" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">(T₂ − T₁)·R = I·α_γων   ⇒   α = (m₂ − m₁)g / (m₁ + m₂ + I/R²)</text>
'''
    write_svg("phy3_atwood_pulley_mass.svg", body)


# 21. Conservation of Angular Momentum
def make_angular_momentum():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Διατήρηση Στροφορμής — L = I₁ω₁ = I₂ω₂ (Στ_εξ = 0)</text>
  <!-- Left: Large I1, Small omega1 -->
  <g transform="translate(22,40)">
    <rect width="198" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="99" y="22" text-anchor="middle" class="t-sub">Μεγάλη I₁ → Μικρή ω₁</text>
    <line x1="99" y1="36" x2="99" y2="188" stroke="#64748b" stroke-width="1.6" stroke-dasharray="4,3"/>
    <line x1="28" y1="108" x2="170" y2="108" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
    <circle cx="34" cy="108" r="14" fill="url(#ball-blue)" stroke="#1e293b" filter="url(#soft-shadow)"/>
    <circle cx="164" cy="108" r="14" fill="url(#ball-blue)" stroke="#1e293b" filter="url(#soft-shadow)"/>
    <path d="M68,64 A34,14 0 1,1 130,64" fill="none" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-blue)"/>
    <text x="99" y="54" text-anchor="middle" class="t-eq">ω₁</text>
    <text x="99" y="152" text-anchor="middle" class="t-sm">Μεγάλη απόσταση r₁</text>
    <text x="99" y="170" text-anchor="middle" class="t-eq">I₁ = 2mr₁²</text>
  </g>
  <!-- Arrow -->
  <line x1="224" y1="146" x2="236" y2="146" stroke="#1e293b" stroke-width="2.4" marker-end="url(#arr-dark)"/>
  <!-- Right: Small I2, Large omega2 -->
  <g transform="translate(240,40)">
    <rect width="198" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="99" y="22" text-anchor="middle" class="t-sub">Μικρή I₂ → Μεγάλη ω₂</text>
    <line x1="99" y1="36" x2="99" y2="188" stroke="#64748b" stroke-width="1.6" stroke-dasharray="4,3"/>
    <line x1="64" y1="108" x2="134" y2="108" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
    <circle cx="68" cy="108" r="14" fill="url(#ball-red)" stroke="#1e293b" filter="url(#soft-shadow)"/>
    <circle cx="130" cy="108" r="14" fill="url(#ball-red)" stroke="#1e293b" filter="url(#soft-shadow)"/>
    <path d="M66,64 A34,14 0 1,1 132,64" fill="none" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
    <path d="M74,74 A26,10 0 1,1 124,74" fill="none" stroke="#dc2626" stroke-width="1.6"/>
    <text x="99" y="54" text-anchor="middle" class="t-eq" fill="#b91c1c">ω₂ ≫ ω₁</text>
    <text x="99" y="152" text-anchor="middle" class="t-sm">Μικρή απόσταση r₂</text>
    <text x="99" y="170" text-anchor="middle" class="t-eq" fill="#b91c1c">I₂ &lt; I₁  ⇒  K₂ &gt; K₁</text>
  </g>
  <rect x="22" y="264" width="416" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Στ_εξ = 0  ⇒  L_αρχ = L_τελ  ⇒  I₁·ω₁ = I₂·ω₂</text>
'''
    write_svg("phy3_angular_momentum_conservation.svg", body)


# 22. Faraday induction moving rod on rails
def make_faraday_rod():
    crosses = []
    for x in range(116, 400, 44):
        for y in range(74, 214, 42):
            crosses.append(f'<text x="{x}" y="{y}" text-anchor="middle" class="t-sm" fill="#0284c7" font-weight="700">×</text>')
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Επαγωγή σε Κινούμενο Αγωγό (E_επ = B·ℓ·u &amp; Κανόνας Lenz)</text>
  <!-- Magnetic field region B into page -->
  <rect x="92" y="48" width="330" height="178" rx="8" fill="#e0f2fe" opacity="0.55" stroke="#7dd3fc" stroke-dasharray="5,3"/>
  {"".join(crosses)}
  <text x="394" y="68" class="t-eq" fill="#0369a1">B (⊗)</text>
  <!-- Rails -->
  <line x1="68" y1="84" x2="404" y2="84" stroke="#334155" stroke-width="3.2"/>
  <line x1="68" y1="196" x2="404" y2="196" stroke="#334155" stroke-width="3.2"/>
  <!-- Resistor R on left -->
  <line x1="68" y1="84" x2="68" y2="112" stroke="#334155" stroke-width="2.6"/>
  <polyline points="68,112 58,118 78,128 58,138 78,148 58,158 68,164" fill="none" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="68" y1="164" x2="68" y2="196" stroke="#334155" stroke-width="2.6"/>
  <text x="44" y="144" class="t-eq">R</text>
  <!-- Moving conducting rod -->
  <rect x="266" y="74" width="12" height="132" rx="4" fill="url(#copper-grad)" stroke="#7c2d12" stroke-width="1.6" filter="url(#soft-shadow)"/>
  <!-- Velocity u right -->
  <line x1="282" y1="140" x2="352" y2="140" stroke="#16a34a" stroke-width="2.8" marker-end="url(#arr-green)"/>
  <text x="322" y="130" class="t-eq" fill="#15803d">u</text>
  <!-- Laplace force F_L left (Lenz) -->
  <line x1="262" y1="140" x2="196" y2="140" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="228" y="130" class="t-eq" fill="#b91c1c">F_L</text>
  <!-- Induced current I_επ -->
  <line x1="272" y1="176" x2="272" y2="104" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-blue)"/>
  <text x="292" y="106" class="t-eq" fill="#1d4ed8">I_επ</text>
  <text x="256" y="218" class="t-sm">ℓ</text>
  <rect x="22" y="262" width="416" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">E_επ = B·ℓ·u   |   I_επ = E_επ / R_ολ   |   F_L = B·I_επ·ℓ (αντίθετη της u)</text>
'''
    write_svg("phy3_faraday_induction_rod.svg", body)


# 23. Faraday coil & magnet
def make_faraday_coil():
    turns = "".join(f'<ellipse cx="{264 + i*16}" cy="136" rx="10" ry="44" fill="none" stroke="#ea580c" stroke-width="3.2"/>' for i in range(6))
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Νόμος Faraday–Lenz (Μαγνήτης &amp; Πηνίο)</text>
  <!-- Bar magnet -->
  <g filter="url(#soft-shadow)">
    <rect x="42" y="114" width="58" height="44" fill="#2563eb" stroke="#1e293b" stroke-width="1.5"/>
    <rect x="100" y="114" width="58" height="44" fill="#dc2626" stroke="#1e293b" stroke-width="1.5"/>
    <text x="71" y="141" text-anchor="middle" class="t-w" font-size="14">S</text>
    <text x="129" y="141" text-anchor="middle" class="t-w" font-size="14">N</text>
  </g>
  <!-- Motion arrow -->
  <line x1="164" y1="136" x2="218" y2="136" stroke="#16a34a" stroke-width="2.8" marker-end="url(#arr-green)"/>
  <text x="190" y="124" text-anchor="middle" class="t-eq" fill="#15803d">u (προσέγγιση)</text>
  <!-- Solenoid coil -->
  <rect x="256" y="106" width="96" height="60" rx="6" fill="#f1f5f9" stroke="#94a3b8"/>
  {turns}
  <!-- Galvanometer -->
  <line x1="254" y1="180" x2="254" y2="232" stroke="#1e293b" stroke-width="2"/>
  <line x1="354" y1="180" x2="354" y2="232" stroke="#1e293b" stroke-width="2"/>
  <line x1="254" y1="232" x2="354" y2="232" stroke="#1e293b" stroke-width="2"/>
  <circle cx="304" cy="232" r="20" fill="#ffffff" stroke="#1e293b" stroke-width="1.8" filter="url(#soft-shadow)"/>
  <line x1="304" y1="232" x2="314" y2="218" stroke="#dc2626" stroke-width="2"/>
  <text x="304" y="247" text-anchor="middle" class="t-sm">G</text>
  <!-- Induced pole N on left of coil (repels approaching N) -->
  <text x="242" y="84" text-anchor="middle" class="t-eq" fill="#b91c1c">Επαγ. N</text>
  <text x="372" y="84" text-anchor="middle" class="t-eq" fill="#1d4ed8">Επαγ. S</text>
  <text x="398" y="138" class="t-sm">B_επ ←</text>
  <rect x="20" y="264" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">E_επ = −N · (ΔΦ / Δt)    (Το επαγωγικό ρεύμα αντιστέκεται στη μεταβολή ΔΦ)</text>
'''
    write_svg("phy3_faraday_coil_magnet.svg", body)


# 24. AC Generator
def make_ac_generator():
    ac_wave = sine_path(266, 152, 162, 54, 1.5)
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Γεννήτρια Εναλλασσόμενου Ρεύματος (AC)</text>
  <!-- Left: Rotating coil in B field -->
  <rect x="18" y="40" width="218" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="28" y="96" width="34" height="92" rx="4" fill="#dc2626" stroke="#1e293b" stroke-width="1.4"/>
  <text x="45" y="147" text-anchor="middle" class="t-w" font-size="14">N</text>
  <rect x="192" y="96" width="34" height="92" rx="4" fill="#2563eb" stroke="#1e293b" stroke-width="1.4"/>
  <text x="209" y="147" text-anchor="middle" class="t-w" font-size="14">S</text>
  <!-- Magnetic field lines -->
  <line x1="66" y1="120" x2="188" y2="120" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arr-dark)"/>
  <line x1="66" y1="164" x2="188" y2="164" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,3" marker-end="url(#arr-dark)"/>
  <!-- Rotating rectangular loop -->
  <polygon points="94,104 162,92 162,178 94,190" fill="none" stroke="#ea580c" stroke-width="3.2"/>
  <line x1="128" y1="74" x2="128" y2="214" stroke="#475569" stroke-width="1.5" stroke-dasharray="4,3"/>
  <path d="M110,80 A20,8 0 1,1 146,80" fill="none" stroke="#7c3aed" stroke-width="2" marker-end="url(#arr-violet)"/>
  <text x="128" y="68" text-anchor="middle" class="t-eq" fill="#6d28d9">ω</text>
  <!-- Slip rings -->
  <ellipse cx="128" cy="212" rx="16" ry="5" fill="none" stroke="#d97706" stroke-width="2.4"/>
  <ellipse cx="128" cy="224" rx="16" ry="5" fill="none" stroke="#d97706" stroke-width="2.4"/>
  <text x="128" y="246" text-anchor="middle" class="t-sm">Δακτύλιοι &amp; Ψήκτρες</text>

  <!-- Right: Sinusoidal EMF graph -->
  <rect x="246" y="40" width="196" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="344" y="60" text-anchor="middle" class="t-sub">Εναλλασσόμενη Τάση e(t)</text>
  <line x1="264" y1="152" x2="432" y2="152" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <line x1="266" y1="222" x2="266" y2="82" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <path d="{ac_wave}" fill="none" stroke="#dc2626" stroke-width="2.6"/>
  <text x="260" y="96" text-anchor="end" class="t-sm">+E₀</text>
  <text x="260" y="212" text-anchor="end" class="t-sm">−E₀</text>
  <text x="434" y="156" class="t-lbl">t</text>
  <text x="344" y="240" text-anchor="middle" class="t-sm">V_εν = V₀ / √2</text>

  <rect x="18" y="264" width="424" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">Φ(t) = N·B·A·cos(ωt)   ⇒   e(t) = E₀·sin(ωt)  όπου  E₀ = N·B·A·ω</text>
'''
    write_svg("phy3_ac_generator.svg", body)


# 25. Ideal Transformer
def make_transformer():
    p_coils = "".join(f'<path d="M128,{96+i*18} C110,{96+i*18} 110,{110+i*18} 128,{110+i*18}" fill="none" stroke="#2563eb" stroke-width="3"/>' for i in range(6))
    s_coils = "".join(f'<path d="M332,{104+i*24} C350,{104+i*24} 350,{122+i*24} 332,{122+i*24}" fill="none" stroke="#dc2626" stroke-width="3"/>' for i in range(4))
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ιδανικός Μετασχηματιστής (V₁/V₂ = N₁/N₂ = I₂/I₁)</text>
  <!-- Laminated iron core -->
  <rect x="128" y="66" width="204" height="168" rx="10" fill="url(#metal-grad)" stroke="#334155" stroke-width="2" filter="url(#soft-shadow)"/>
  <rect x="166" y="102" width="128" height="96" rx="6" fill="#ffffff" stroke="#475569" stroke-width="1.6"/>
  <!-- Flux loop inside core -->
  <rect x="147" y="84" width="166" height="132" rx="8" fill="none" stroke="#16a34a" stroke-width="1.8" stroke-dasharray="6,4"/>
  <text x="230" y="80" text-anchor="middle" class="t-eq" fill="#15803d">Μαγνητική Ροή Φ(t)</text>
  <!-- Primary coil -->
  {p_coils}
  <line x1="60" y1="96" x2="128" y2="96" stroke="#2563eb" stroke-width="2.4"/>
  <line x1="60" y1="200" x2="128" y2="200" stroke="#2563eb" stroke-width="2.4"/>
  <circle cx="60" cy="148" r="18" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
  <text x="60" y="153" text-anchor="middle" class="t-eq" fill="#1d4ed8">~V₁</text>
  <text x="90" y="84" class="t-lbl" fill="#1d4ed8">Πρωτεύον (N₁)</text>
  <text x="96" y="224" class="t-sm" fill="#1d4ed8">I₁</text>
  <!-- Secondary coil -->
  {s_coils}
  <line x1="332" y1="104" x2="398" y2="104" stroke="#dc2626" stroke-width="2.4"/>
  <line x1="332" y1="194" x2="398" y2="194" stroke="#dc2626" stroke-width="2.4"/>
  <rect x="386" y="128" width="24" height="44" rx="4" fill="#fef2f2" stroke="#dc2626" stroke-width="2"/>
  <text x="398" y="154" text-anchor="middle" class="t-eq" fill="#b91c1c">R</text>
  <text x="366" y="84" text-anchor="middle" class="t-lbl" fill="#b91c1c">Δευτερεύον (N₂)</text>
  <text x="366" y="224" class="t-sm" fill="#b91c1c">V₂, I₂</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">P₁ = P₂ (V₁I₁ = V₂I₂)   |   V₁ / V₂ = N₁ / N₂   (Μόνο για AC)</text>
'''
    write_svg("phy3_transformer_ideal.svg", body)


# 26. LC Electromagnetic oscillation
def make_lc_oscillation():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ηλεκτρομαγνητική Ταλάντωση σε Κύκλωμα LC (U_E ↔ U_B)</text>
  <!-- Left: Circuit diagram -->
  <rect x="18" y="40" width="186" height="212" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="111" y="60" text-anchor="middle" class="t-sub">Κύκλωμα LC</text>
  <line x1="60" y1="88" x2="162" y2="88" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="60" y1="208" x2="162" y2="208" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="60" y1="88" x2="60" y2="138" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="60" y1="158" x2="60" y2="208" stroke="#1e293b" stroke-width="2.4"/>
  <!-- Capacitor C -->
  <line x1="42" y1="138" x2="78" y2="138" stroke="#2563eb" stroke-width="3.6"/>
  <line x1="42" y1="158" x2="78" y2="158" stroke="#2563eb" stroke-width="3.6"/>
  <text x="30" y="134" class="t-eq" fill="#1d4ed8">+q</text>
  <text x="30" y="170" class="t-eq" fill="#1d4ed8">−q</text>
  <text x="86" y="152" class="t-eq" fill="#1d4ed8">C</text>
  <!-- Inductor L -->
  <line x1="162" y1="88" x2="162" y2="108" stroke="#1e293b" stroke-width="2.4"/>
  <path d="M162,108 C178,108 178,126 162,126 C178,126 178,144 162,144 C178,144 178,162 162,162 C178,162 178,180 162,180" fill="none" stroke="#ea580c" stroke-width="3"/>
  <line x1="162" y1="180" x2="162" y2="208" stroke="#1e293b" stroke-width="2.4"/>
  <text x="142" y="150" class="t-eq" fill="#c2410c">L</text>
  <line x1="92" y1="88" x2="130" y2="88" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <text x="111" y="80" text-anchor="middle" class="t-eq" fill="#b91c1c">i(t)</text>
  <text x="111" y="236" text-anchor="middle" class="t-sm">Τύπος Thomson: T = 2π√(LC)</text>

  <!-- Right: Energy exchange bars/curves -->
  <rect x="214" y="40" width="228" height="212" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="328" y="60" text-anchor="middle" class="t-sub">Εναλλαγή Ενέργειας U_E &amp; U_B</text>
  <line x1="234" y1="214" x2="428" y2="214" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <line x1="234" y1="214" x2="234" y2="78" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <!-- U_E = cos^2, U_B = sin^2 -->
  <path d="M234,94 Q256,94 278,214 Q300,94 322,94 Q344,94 366,214 Q388,94 410,94" fill="none" stroke="#2563eb" stroke-width="2.4"/>
  <path d="M234,214 Q256,94 278,94 Q300,214 322,214 Q344,94 366,94 Q388,214 410,214" fill="none" stroke="#dc2626" stroke-width="2.4"/>
  <text x="254" y="88" class="t-eq" fill="#1d4ed8">U_E = q²/2C</text>
  <text x="352" y="88" class="t-eq" fill="#b91c1c">U_B = ½Li²</text>
  <text x="278" y="230" text-anchor="middle" class="t-sm">T/4</text>
  <text x="322" y="230" text-anchor="middle" class="t-sm">T/2</text>
  <text x="366" y="230" text-anchor="middle" class="t-sm">3T/4</text>
  <text x="410" y="230" text-anchor="middle" class="t-sm">T</text>

  <rect x="18" y="264" width="424" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">ω = 1 / √(LC)   |   U_ολ = ½ Q²/C = ½ L·I² = σταθ.</text>
'''
    write_svg("phy3_rlc_oscillation_lc.svg", body)


# 27. Photoelectric effect
def make_photoelectric():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Φωτοηλεκτρικό Φαινόμενο — Εξίσωση Einstein</text>
  <!-- Left: Photons hitting metal plate -->
  <rect x="18" y="38" width="214" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <rect x="34" y="186" width="182" height="44" rx="4" fill="url(#metal-grad)" stroke="#334155" stroke-width="1.6"/>
  <text x="125" y="213" text-anchor="middle" class="t-lbl">Μεταλλική Πλάκα (Έργο b / W₀)</text>
  <!-- Incoming photons (wavy purple arrows) -->
  <path d="M46,66 Q56,74 62,86 Q68,98 78,106 Q88,114 96,134 L106,180" fill="none" stroke="#7c3aed" stroke-width="2.4" marker-end="url(#arr-violet)"/>
  <path d="M84,56 Q94,64 100,76 Q106,88 116,96 Q126,104 134,124 L144,180" fill="none" stroke="#7c3aed" stroke-width="2.4" marker-end="url(#arr-violet)"/>
  <text x="58" y="56" class="t-eq" fill="#6d28d9">Φωτόνια E = hf</text>
  <!-- Emitted photoelectrons -->
  <line x1="122" y1="184" x2="178" y2="108" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-blue)"/>
  <circle cx="182" cy="102" r="7" fill="url(#ball-blue)" stroke="#1e293b"/>
  <text x="182" y="105" text-anchor="middle" class="t-w" font-size="8">e⁻</text>
  <text x="196" y="132" class="t-sm" fill="#1d4ed8">K_max</text>

  <!-- Right: K_max vs f linear graph -->
  <rect x="242" y="38" width="200" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="342" y="58" text-anchor="middle" class="t-sub">Διάγραμμα K_max(f)</text>
  <line x1="262" y1="176" x2="430" y2="176" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <line x1="274" y1="238" x2="274" y2="74" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <!-- Line with slope h -->
  <line x1="274" y1="224" x2="322" y2="176" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4,3"/>
  <line x1="322" y1="176" x2="412" y2="86" stroke="#dc2626" stroke-width="2.8"/>
  <circle cx="322" cy="176" r="4" fill="#dc2626"/>
  <text x="322" y="192" text-anchor="middle" class="t-eq" fill="#b91c1c">f₀</text>
  <text x="268" y="228" text-anchor="end" class="t-sm">−W₀</text>
  <text x="384" y="138" class="t-sm" fill="#b91c1c">κλίση = h</text>
  <text x="428" y="192" text-anchor="end" class="t-lbl">f</text>
  <text x="284" y="82" class="t-lbl">K_max</text>

  <rect x="18" y="264" width="424" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">hf = W₀ + K_max    |    K_max = e·V_απ    |    Εκπομπή μόνο αν f ≥ f₀</text>
'''
    write_svg("phy3_photoelectric_effect.svg", body)


# 28. Bohr hydrogen energy levels & transitions
def make_bohr_transitions():
    levels = [
        (1, 232, "-13,6 eV"),
        (2, 152, "-3,40 eV"),
        (3, 114, "-1,51 eV"),
        (4, 90, "-0,85 eV"),
        (5, 72, "-0,54 eV"),
    ]
    lines_svg = "".join(
        f'<line x1="68" y1="{y}" x2="366" y2="{y}" stroke="#1e293b" stroke-width="1.8"/>'
        f'<text x="58" y="{y+4}" text-anchor="end" class="t-lbl">n={n}</text>'
        f'<text x="374" y="{y+4}" class="t-sm">{ev}</text>'
        for n, y, ev in levels
    )
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ενεργειακές Στάθμες Υδρογόνου (Πρότυπο Bohr)</text>
  <line x1="68" y1="52" x2="366" y2="52" stroke="#64748b" stroke-width="1.3" stroke-dasharray="5,3"/>
  <text x="58" y="56" text-anchor="end" class="t-sm">n=∞</text>
  <text x="374" y="56" class="t-sm">0 eV (Ιονισμός)</text>
  {lines_svg}
  <!-- Lyman series (UV) to n=1 -->
  <line x1="110" y1="152" x2="110" y2="228" stroke="#7c3aed" stroke-width="2.2" marker-end="url(#arr-violet)"/>
  <line x1="132" y1="114" x2="132" y2="228" stroke="#7c3aed" stroke-width="2.2" marker-end="url(#arr-violet)"/>
  <text x="122" y="250" text-anchor="middle" class="t-lbl" fill="#6d28d9">Lyman (UV)</text>
  <!-- Balmer series (Visible) to n=2 -->
  <line x1="208" y1="114" x2="208" y2="148" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <line x1="230" y1="90" x2="230" y2="148" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arr-green)"/>
  <line x1="252" y1="72" x2="252" y2="148" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-blue)"/>
  <text x="230" y="170" text-anchor="middle" class="t-lbl" fill="#b91c1c">Balmer (Ορατό)</text>
  <!-- Paschen series (IR) to n=3 -->
  <line x1="316" y1="90" x2="316" y2="110" stroke="#d97706" stroke-width="2.2" marker-end="url(#arr-amber)"/>
  <line x1="336" y1="72" x2="336" y2="110" stroke="#d97706" stroke-width="2.2" marker-end="url(#arr-amber)"/>
  <text x="326" y="132" text-anchor="middle" class="t-lbl" fill="#b45309">Paschen (IR)</text>

  <rect x="20" y="264" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">E_n = −13,6 / n² (eV)   |   hf = E_αρχ − E_τελ   |   r_n = n²·r₁</text>
'''
    write_svg("phy3_bohr_hydrogen_transitions.svg", body)


# 29. de Broglie standing electron wave
def make_de_broglie():
    # Standing wave around circle n=5
    pts = []
    cx, cy, R, amp, n = 152, 152, 74, 11, 5
    for i in range(181):
        th = (i / 180) * 2 * math.pi
        r = R + amp * math.sin(n * th)
        x = cx + r * math.cos(th)
        y = cy + r * math.sin(th)
        pts.append(f"{'M' if i == 0 else 'L'}{x:.1f},{y:.1f}")
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Κύματα de Broglie &amp; Στάσιμες Τροχιές (2πr = n·λ)</text>
  <!-- Left: Allowed orbit n=5 -->
  <circle cx="152" cy="152" r="74" fill="none" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="5,4"/>
  <path d="{' '.join(pts)}" fill="none" stroke="#2563eb" stroke-width="2.6"/>
  <circle cx="152" cy="152" r="14" fill="url(#ball-red)" stroke="#1e293b" filter="url(#soft-shadow)"/>
  <text x="152" y="156" text-anchor="middle" class="t-w">+Ze</text>
  <text x="152" y="250" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Επιτρεπτή τροχιά (n = 5)</text>
  <!-- Right: Info card -->
  <rect x="260" y="64" width="178" height="176" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="349" y="88" text-anchor="middle" class="t-sub">Κυματοσωματιδιακός</text>
  <text x="349" y="102" text-anchor="middle" class="t-sub">Δυϊσμός Ύλης</text>
  <text x="349" y="134" text-anchor="middle" class="t-eq" font-size="13">λ = h / p = h / (m·u)</text>
  <line x1="280" y1="152" x2="418" y2="152" stroke="#e2e8f0" stroke-width="1.2"/>
  <text x="349" y="176" text-anchor="middle" class="t-sm">Συνθήκη στάσιμου κύματος:</text>
  <text x="349" y="198" text-anchor="middle" class="t-eq">2πr_n = n · λ</text>
  <text x="349" y="222" text-anchor="middle" class="t-eq" fill="#15803d">⇒ L = m·u·r = n·(h/2π)</text>
  <text x="230" y="290" text-anchor="middle" class="t-sm">Κβάντωση στροφορμής Bohr ως στάσιμο κύμα de Broglie</text>
'''
    write_svg("phy3_de_broglie_wave.svg", body)


# 30. Compton scattering
def make_compton():
    w_in = sine_path(36, 152, 146, 9, 4.5)
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Φαινόμενο Compton (Σκέδαση Φωτονίου από Ηλεκτρόνιο)</text>
  <!-- Horizontal axis -->
  <line x1="36" y1="152" x2="424" y2="152" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="5,4"/>
  <!-- Incoming photon (short lambda) -->
  <path d="{w_in}" fill="none" stroke="#7c3aed" stroke-width="2.4"/>
  <line x1="172" y1="152" x2="196" y2="152" stroke="#7c3aed" stroke-width="2.4" marker-end="url(#arr-violet)"/>
  <text x="112" y="132" text-anchor="middle" class="t-eq" fill="#6d28d9">Φωτόνιο (λ, E = hc/λ)</text>
  <!-- Electron at rest -->
  <circle cx="212" cy="152" r="11" fill="url(#ball-blue)" stroke="#1e293b" stroke-width="1.4" filter="url(#soft-shadow)"/>
  <text x="212" y="155" text-anchor="middle" class="t-w" font-size="9">e⁻</text>
  <text x="212" y="178" text-anchor="middle" class="t-sm">e⁻ (αρχικά ακίνητο)</text>
  <!-- Scattered photon (longer lambda', upper right) -->
  <line x1="222" y1="145" x2="368" y2="74" stroke="#dc2626" stroke-width="2.4" stroke-dasharray="8,4" marker-end="url(#arr-red)"/>
  <text x="336" y="64" text-anchor="middle" class="t-eq" fill="#b91c1c">Σκεδαζόμενο φωτόνιο (λ' &gt; λ)</text>
  <!-- Recoil electron (lower right) -->
  <line x1="222" y1="159" x2="346" y2="226" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-blue)"/>
  <circle cx="358" cy="232" r="9" fill="url(#ball-blue)" stroke="#1e293b"/>
  <text x="358" y="235" text-anchor="middle" class="t-w" font-size="8">e⁻</text>
  <text x="354" y="252" text-anchor="middle" class="t-sm" fill="#1d4ed8">Ανακρουόμενο e⁻ (K_e, p_e)</text>
  <!-- Angles -->
  <path d="M262,152 A50,50 0 0,0 256,128" fill="none" stroke="#dc2626" stroke-width="1.6"/>
  <text x="270" y="142" class="t-eq" fill="#b91c1c">θ</text>
  <path d="M262,152 A50,50 0 0,1 256,174" fill="none" stroke="#2563eb" stroke-width="1.6"/>
  <text x="270" y="170" class="t-eq" fill="#1d4ed8">φ</text>
  <rect x="20" y="264" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">Δλ = λ' − λ = (h / m_e c)·(1 − cosθ)    (Σωματιδιακή φύση φωτός)</text>
'''
    write_svg("phy3_compton_scattering.svg", body)


if __name__ == "__main__":
    generators = [
        make_elastic_collision,
        make_ballistic_pendulum,
        make_oblique_collision,
        make_impulse_ft,
        make_shm_phase_circle,
        make_shm_xva,
        make_shm_energy,
        make_damped_oscillation,
        make_resonance,
        make_transverse_longitudinal,
        make_wave_snapshot,
        make_wave_interference,
        make_standing_wave,
        make_doppler,
        make_diffraction,
        make_rolling,
        make_inclined_rolling,
        make_torque_lever,
        make_moments_of_inertia,
        make_atwood_pulley,
        make_angular_momentum,
        make_faraday_rod,
        make_faraday_coil,
        make_ac_generator,
        make_transformer,
        make_lc_oscillation,
        make_photoelectric,
        make_bohr_transitions,
        make_de_broglie,
        make_compton,
    ]
    for fn in generators:
        fn()
    files = sorted(f for f in os.listdir(OUT_DIR) if f.startswith("phy3_") and f.endswith(".svg"))
    total_kb = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in files) / 1024
    print(f"Generated {len(files)} Physics G Lykeiou Sketch-Style SVGs in {OUT_DIR} ({total_kb:.1f} KB total, avg {total_kb/len(files):.1f} KB)")
