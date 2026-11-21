#!/usr/bin/env python3
"""
Batch 1 Generator: 32 Studio-Grade Native Physics Vector SVGs (Greek Curriculum — ebooks.edu.gr).
Every SVG is pure hand-authored vector geometry (cubic Béziers, gradients, vector arrows, crisp Greek labels),
transparent background, ~2-5 KB each, infinitely sharp at any zoom.
"""
import os

OUT_DIR = "public/vectors_stem/physics"
os.makedirs(OUT_DIR, exist_ok=True)

FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

COMMON_DEFS = """  <defs>
    <marker id="arrB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#2563eb"/>
    </marker>
    <marker id="arrR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#dc2626"/>
    </marker>
    <marker id="arrG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#16a34a"/>
    </marker>
    <marker id="arrO" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#d97706"/>
    </marker>
    <marker id="arrK" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6.5" markerHeight="6.5" orient="auto-start-reverse">
      <path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#1e293b"/>
    </marker>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe" stop-opacity="0.88"/>
      <stop offset="50%" stop-color="#bae6fd" stop-opacity="0.65"/>
      <stop offset="100%" stop-color="#7dd3fc" stop-opacity="0.82"/>
    </linearGradient>
    <linearGradient id="water" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.72"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.58"/>
    </linearGradient>
    <linearGradient id="metal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="55%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <linearGradient id="blockG" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </linearGradient>
    <radialGradient id="posQ" cx="35%" cy="30%" r="68%">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="55%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </radialGradient>
    <radialGradient id="negQ" cx="35%" cy="30%" r="68%">
      <stop offset="0%" stop-color="#93c5fd"/>
      <stop offset="55%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </radialGradient>
  </defs>"""


def wrap_svg(body: str, w: int = 360, h: int = 240) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" fill="none">\n'
        f"{COMMON_DEFS}\n"
        f'<g font-family="{FONT}">\n'
        f"{body}\n"
        f"</g>\n</svg>\n"
    )


SVGS: dict[str, str] = {}

# 1. Reflection Law
SVGS["opt_reflection_law.svg"] = wrap_svg("""
  <!-- Mirror surface -->
  <rect x="40" y="182" width="280" height="12" fill="url(#metal)" stroke="#334155" stroke-width="1.5"/>
  <g stroke="#64748b" stroke-width="1.1">
    <line x1="55" y1="194" x2="45" y2="206"/><line x1="80" y1="194" x2="70" y2="206"/>
    <line x1="105" y1="194" x2="95" y2="206"/><line x1="130" y1="194" x2="120" y2="206"/>
    <line x1="155" y1="194" x2="145" y2="206"/><line x1="180" y1="194" x2="170" y2="206"/>
    <line x1="205" y1="194" x2="195" y2="206"/><line x1="230" y1="194" x2="220" y2="206"/>
    <line x1="255" y1="194" x2="245" y2="206"/><line x1="280" y1="194" x2="270" y2="206"/>
    <line x1="305" y1="194" x2="295" y2="206"/>
  </g>
  <!-- Normal line -->
  <line x1="180" y1="26" x2="180" y2="182" stroke="#64748b" stroke-width="1.6" stroke-dasharray="6 4"/>
  <text x="187" y="38" font-size="12" font-weight="600" fill="#475569">Κάθετος (N)</text>
  <!-- Incident & Reflected Rays -->
  <line x1="68" y1="54" x2="178" y2="180" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arrR)"/>
  <line x1="180" y1="182" x2="292" y2="54" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arrB)"/>
  <!-- Angle arcs -->
  <path d="M 148 145 A 48 48 0 0 1 180 134" stroke="#dc2626" stroke-width="1.8"/>
  <path d="M 180 134 A 48 48 0 0 1 212 145" stroke="#2563eb" stroke-width="1.8"/>
  <text x="152" y="126" font-size="14" font-weight="700" fill="#dc2626">θπ</text>
  <text x="192" y="126" font-size="14" font-weight="700" fill="#2563eb">θα</text>
  <text x="46" y="46" font-size="12" font-weight="600" fill="#dc2626">Προσπίπτουσα</text>
  <text x="234" y="46" font-size="12" font-weight="600" fill="#2563eb">Ανακλώμενη</text>
  <rect x="132" y="210" width="96" height="22" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="180" y="225" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">θπ = θα</text>
""")

# 2. Refraction Snell
SVGS["opt_refraction_snell.svg"] = wrap_svg("""
  <!-- Water medium -->
  <rect x="24" y="120" width="312" height="104" rx="4" fill="url(#water)" stroke="#0284c7" stroke-width="1.2"/>
  <line x1="24" y1="120" x2="336" y2="120" stroke="#0369a1" stroke-width="2"/>
  <text x="34" y="108" font-size="12" font-weight="700" fill="#475569">Αέρας (n₁)</text>
  <text x="34" y="140" font-size="12" font-weight="700" fill="#0369a1">Νερό / Γυαλί (n₂ &gt; n₁)</text>
  <!-- Normal -->
  <line x1="180" y1="18" x2="180" y2="224" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5 4"/>
  <!-- Incident ray -->
  <line x1="78" y1="26" x2="178" y2="118" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arrR)"/>
  <!-- Original straight path (dashed) -->
  <line x1="180" y1="120" x2="276" y2="208" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="4 4"/>
  <!-- Refracted ray (bends toward normal) -->
  <line x1="180" y1="120" x2="232" y2="216" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arrB)"/>
  <!-- Angles -->
  <path d="M 150 92 A 40 40 0 0 1 180 80" stroke="#dc2626" stroke-width="1.8"/>
  <path d="M 180 164 A 44 44 0 0 0 202 158" stroke="#2563eb" stroke-width="1.8"/>
  <text x="155" y="74" font-size="13" font-weight="700" fill="#dc2626">θ₁</text>
  <text x="187" y="180" font-size="13" font-weight="700" fill="#2563eb">θ₂</text>
  <text x="234" y="42" font-size="12" font-weight="700" fill="#1e293b">n₁·ημθ₁ = n₂·ημθ₂</text>
""")

# 3. Total Internal Reflection & Optical Fiber
SVGS["opt_total_reflection.svg"] = wrap_svg("""
  <!-- Optical fiber tube -->
  <rect x="24" y="72" width="312" height="96" rx="14" fill="url(#glass)" stroke="#0284c7" stroke-width="2.2"/>
  <rect x="24" y="56" width="312" height="16" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.1"/>
  <rect x="24" y="168" width="312" height="16" rx="4" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.1"/>
  <text x="180" y="48" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">Ολική Εσωτερική Ανάκλαση — Οπτική Ίνα (θ &gt; θκ)</text>
  <text x="36" y="68" font-size="10" font-weight="600" fill="#475569">Επένδυση (n₂)</text>
  <text x="36" y="124" font-size="11" font-weight="700" fill="#0369a1">Πυρήνας (n₁ &gt; n₂)</text>
  <!-- Bouncing laser ray -->
  <polyline points="20,136 96,74 180,166 264,74 338,136" stroke="#dc2626" stroke-width="2.6" stroke-linejoin="round" marker-end="url(#arrR)"/>
  <!-- Normals at bounce points -->
  <line x1="96" y1="74" x2="96" y2="112" stroke="#64748b" stroke-width="1.2" stroke-dasharray="3 3"/>
  <line x1="180" y1="166" x2="180" y2="128" stroke="#64748b" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="180" y="206" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">ημ(θκ) = n₂ / n₁</text>
""")

# 4. Prism Dispersion
SVGS["opt_prism_dispersion.svg"] = wrap_svg("""
  <!-- White incoming beam -->
  <line x1="20" y1="146" x2="126" y2="118" stroke="#475569" stroke-width="4"/>
  <text x="22" y="132" font-size="12" font-weight="700" fill="#334155">Λευκό φως</text>
  <!-- Glass Prism -->
  <polygon points="180,32 98,196 262,196" fill="url(#glass)" stroke="#0284c7" stroke-width="2.4" stroke-linejoin="round"/>
  <!-- Internal fan -->
  <polygon points="126,118 224,114 236,148" fill="#fef08a" opacity="0.35"/>
  <!-- Rainbow Spectrum Exiting -->
  <line x1="224" y1="114" x2="342" y2="112" stroke="#ef4444" stroke-width="3.2"/>
  <line x1="226" y1="120" x2="342" y2="126" stroke="#f97316" stroke-width="3.2"/>
  <line x1="228" y1="126" x2="342" y2="140" stroke="#eab308" stroke-width="3.2"/>
  <line x1="230" y1="132" x2="342" y2="154" stroke="#22c55e" stroke-width="3.2"/>
  <line x1="232" y1="138" x2="342" y2="168" stroke="#06b6d4" stroke-width="3.2"/>
  <line x1="234" y1="143" x2="342" y2="182" stroke="#3b82f6" stroke-width="3.2"/>
  <line x1="236" y1="148" x2="342" y2="196" stroke="#7c3aed" stroke-width="3.2"/>
  <text x="278" y="98" font-size="11" font-weight="700" fill="#dc2626">Ερυθρό</text>
  <text x="278" y="214" font-size="11" font-weight="700" fill="#7c3aed">Ιώδες</text>
  <text x="180" y="224" text-anchor="middle" font-size="12" font-weight="700" fill="#1e293b">Ανάλυση Λευκού Φωτός σε Πρίσμα</text>
""")

# 5. Convex Lens Principal Rays
SVGS["opt_convex_lens_rays.svg"] = wrap_svg("""
  <!-- Optical axis -->
  <line x1="16" y1="126" x2="344" y2="126" stroke="#475569" stroke-width="1.5" stroke-dasharray="6 4"/>
  <!-- Convex lens -->
  <path d="M 180 34 Q 198 126 180 218 Q 162 126 180 34 Z" fill="url(#glass)" stroke="#0284c7" stroke-width="2.2"/>
  <!-- Focal points -->
  <circle cx="115" cy="126" r="3.2" fill="#1e293b"/><text x="111" y="144" font-size="12" font-weight="700" fill="#1e293b">F</text>
  <circle cx="52" cy="126" r="3.2" fill="#1e293b"/><text x="44" y="144" font-size="12" font-weight="700" fill="#1e293b">2F</text>
  <circle cx="245" cy="126" r="3.2" fill="#1e293b"/><text x="241" y="144" font-size="12" font-weight="700" fill="#1e293b">F'</text>
  <circle cx="308" cy="126" r="3.2" fill="#1e293b"/><text x="300" y="144" font-size="12" font-weight="700" fill="#1e293b">2F'</text>
  <!-- Object arrow -->
  <line x1="76" y1="126" x2="76" y2="66" stroke="#16a34a" stroke-width="3" marker-end="url(#arrG)"/>
  <text x="58" y="60" font-size="12" font-weight="700" fill="#16a34a">Αντικ.</text>
  <!-- Ray 1: parallel -> through F' -->
  <polyline points="76,66 180,66 308,184" stroke="#dc2626" stroke-width="1.8"/>
  <!-- Ray 2: through optical center -->
  <line x1="76" y1="66" x2="308" y2="184" stroke="#2563eb" stroke-width="1.8"/>
  <!-- Image arrow (real, inverted) -->
  <line x1="296" y1="126" x2="296" y2="176" stroke="#d97706" stroke-width="3" marker-end="url(#arrO)"/>
  <text x="284" y="196" font-size="12" font-weight="700" fill="#d97706">Είδωλο</text>
  <text x="180" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#0369a1">Συγκλίνων Φακός</text>
""")

# 6. Concave Lens
SVGS["opt_concave_lens_rays.svg"] = wrap_svg("""
  <line x1="16" y1="130" x2="344" y2="130" stroke="#475569" stroke-width="1.5" stroke-dasharray="6 4"/>
  <!-- Concave lens -->
  <path d="M 168 38 L 192 38 Q 182 130 192 222 L 168 222 Q 178 130 168 38 Z" fill="url(#glass)" stroke="#0284c7" stroke-width="2.2"/>
  <circle cx="112" cy="130" r="3.2" fill="#1e293b"/><text x="108" y="148" font-size="12" font-weight="700" fill="#1e293b">F</text>
  <circle cx="248" cy="130" r="3.2" fill="#1e293b"/><text x="244" y="148" font-size="12" font-weight="700" fill="#1e293b">F'</text>
  <!-- Object -->
  <line x1="70" y1="130" x2="70" y2="62" stroke="#16a34a" stroke-width="3" marker-end="url(#arrG)"/>
  <text x="50" y="54" font-size="12" font-weight="700" fill="#16a34a">Αντικ.</text>
  <!-- Ray 1: parallel -> diverges from F -->
  <line x1="70" y1="62" x2="180" y2="62" stroke="#dc2626" stroke-width="1.8"/>
  <line x1="180" y1="62" x2="296" y2="24" stroke="#dc2626" stroke-width="1.8" marker-end="url(#arrR)"/>
  <line x1="112" y1="130" x2="180" y2="62" stroke="#dc2626" stroke-width="1.4" stroke-dasharray="4 3"/>
  <!-- Ray 2: through center -->
  <line x1="70" y1="62" x2="306" y2="206" stroke="#2563eb" stroke-width="1.8"/>
  <!-- Virtual upright diminished image -->
  <line x1="138" y1="130" x2="138" y2="104" stroke="#d97706" stroke-width="2.8" marker-end="url(#arrO)"/>
  <text x="118" y="166" font-size="11" font-weight="700" fill="#d97706">Φανταστικό</text>
  <text x="180" y="22" text-anchor="middle" font-size="12" font-weight="700" fill="#0369a1">Αποκλίνων Φακός</text>
""")

# 7. Concave Mirror
SVGS["opt_concave_mirror.svg"] = wrap_svg("""
  <line x1="20" y1="126" x2="320" y2="126" stroke="#475569" stroke-width="1.4" stroke-dasharray="6 4"/>
  <!-- Concave mirror arc -->
  <path d="M 272 34 Q 312 126 272 218" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
  <path d="M 276 34 Q 316 126 276 218" stroke="#94a3b8" stroke-width="3" stroke-dasharray="3 4"/>
  <circle cx="154" cy="126" r="3.2" fill="#1e293b"/><text x="150" y="144" font-size="12" font-weight="700" fill="#1e293b">C</text>
  <circle cx="222" cy="126" r="3.2" fill="#1e293b"/><text x="218" y="144" font-size="12" font-weight="700" fill="#1e293b">F</text>
  <!-- Parallel rays converging at F -->
  <line x1="42" y1="74" x2="286" y2="74" stroke="#dc2626" stroke-width="2" marker-end="url(#arrR)"/>
  <line x1="286" y1="74" x2="158" y2="178" stroke="#2563eb" stroke-width="2" marker-end="url(#arrB)"/>
  <line x1="42" y1="178" x2="286" y2="178" stroke="#dc2626" stroke-width="2" marker-end="url(#arrR)"/>
  <line x1="286" y1="178" x2="158" y2="74" stroke="#2563eb" stroke-width="2" marker-end="url(#arrB)"/>
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Κοίλο Σφαιρικό Κάτοπτρο (Συγκλίνουσα Δέσμη)</text>
""")

# 8. Convex Mirror
SVGS["opt_convex_mirror.svg"] = wrap_svg("""
  <line x1="20" y1="126" x2="340" y2="126" stroke="#475569" stroke-width="1.4" stroke-dasharray="6 4"/>
  <!-- Convex mirror arc -->
  <path d="M 244 38 Q 208 126 244 214" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
  <path d="M 248 38 Q 212 126 248 214" stroke="#94a3b8" stroke-width="3" stroke-dasharray="3 4"/>
  <circle cx="288" cy="126" r="3.2" fill="#1e293b"/><text x="284" y="144" font-size="12" font-weight="700" fill="#1e293b">F</text>
  <line x1="40" y1="78" x2="226" y2="78" stroke="#dc2626" stroke-width="2" marker-end="url(#arrR)"/>
  <line x1="226" y1="78" x2="150" y2="20" stroke="#2563eb" stroke-width="2" marker-end="url(#arrB)"/>
  <line x1="226" y1="78" x2="288" y2="126" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="4 3"/>
  <line x1="40" y1="174" x2="226" y2="174" stroke="#dc2626" stroke-width="2" marker-end="url(#arrR)"/>
  <line x1="226" y1="174" x2="150" y2="230" stroke="#2563eb" stroke-width="2" marker-end="url(#arrB)"/>
  <line x1="226" y1="174" x2="288" y2="126" stroke="#94a3b8" stroke-width="1.4" stroke-dasharray="4 3"/>
  <text x="180" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Κυρτό Σφαιρικό Κάτοπτρο (Αποκλίνουσα Δέσμη)</text>
""")

# 9. Myopia Correction
SVGS["opt_human_eye_myopia.svg"] = wrap_svg("""
  <!-- Eyeball -->
  <circle cx="242" cy="124" r="70" fill="#fffbeb" stroke="#334155" stroke-width="2.4"/>
  <!-- Retina highlight -->
  <path d="M 294 76 A 70 70 0 0 1 294 172" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Crystalline lens -->
  <ellipse cx="186" cy="124" rx="9" ry="28" fill="url(#glass)" stroke="#0284c7" stroke-width="1.6"/>
  <!-- Concave corrective lens in front -->
  <path d="M 118 84 L 132 84 Q 125 124 132 164 L 118 164 Q 125 124 118 84 Z" fill="url(#glass)" stroke="#2563eb" stroke-width="2"/>
  <!-- Incoming parallel rays -> slightly diverge -> focus right on retina! -->
  <polyline points="28,100 125,100 186,94 310,124" stroke="#2563eb" stroke-width="2"/>
  <polyline points="28,148 125,148 186,154 310,124" stroke="#2563eb" stroke-width="2"/>
  <circle cx="310" cy="124" r="3.5" fill="#16a34a"/>
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Διόρθωση Μυωπίας με Αποκλίνοντα Φακό</text>
  <text x="72" y="190" font-size="11" font-weight="700" fill="#2563eb">Αποκλίνων φακός</text>
  <text x="234" y="216" font-size="11" font-weight="700" fill="#dc2626">Αμφιβληστροειδής</text>
""")

# 10. Hyperopia Correction
SVGS["opt_human_eye_hyperopia.svg"] = wrap_svg("""
  <circle cx="242" cy="124" r="66" fill="#fffbeb" stroke="#334155" stroke-width="2.4"/>
  <path d="M 290 78 A 66 66 0 0 1 290 170" stroke="#dc2626" stroke-width="3.5" stroke-linecap="round"/>
  <ellipse cx="188" cy="124" rx="9" ry="27" fill="url(#glass)" stroke="#0284c7" stroke-width="1.6"/>
  <!-- Convex corrective lens -->
  <path d="M 124 84 Q 136 124 124 164 Q 112 124 124 84 Z" fill="url(#glass)" stroke="#16a34a" stroke-width="2"/>
  <polyline points="28,100 124,100 188,106 306,124" stroke="#16a34a" stroke-width="2"/>
  <polyline points="28,148 124,148 188,142 306,124" stroke="#16a34a" stroke-width="2"/>
  <circle cx="306" cy="124" r="3.5" fill="#16a34a"/>
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Διόρθωση Υπερμετρωπίας με Συγκλίνοντα Φακό</text>
  <text x="68" y="190" font-size="11" font-weight="700" fill="#16a34a">Συγκλίνων φακός</text>
  <text x="234" y="214" font-size="11" font-weight="700" fill="#dc2626">Αμφιβληστροειδής</text>
""")

# 11. Pascal Hydraulic Press
SVGS["hyd_pascal_press.svg"] = wrap_svg("""
  <!-- U-shaped hydraulic vessel -->
  <path d="M 68 88 L 68 202 L 296 202 L 296 88 L 210 88 L 210 162 L 116 162 L 116 88 Z"
        fill="url(#water)" stroke="#1e293b" stroke-width="2.4" stroke-linejoin="round"/>
  <!-- Small piston A1 -->
  <rect x="69" y="80" width="46" height="14" fill="url(#metal)" stroke="#334155" stroke-width="1.6"/>
  <line x1="92" y1="32" x2="92" y2="76" stroke="#dc2626" stroke-width="3" marker-end="url(#arrR)"/>
  <text x="102" y="54" font-size="14" font-weight="700" fill="#dc2626">F₁</text>
  <text x="92" y="114" text-anchor="middle" font-size="12" font-weight="700" fill="#0369a1">A₁</text>
  <!-- Large piston A2 -->
  <rect x="211" y="80" width="84" height="14" fill="url(#metal)" stroke="#334155" stroke-width="1.6"/>
  <line x1="253" y1="78" x2="253" y2="26" stroke="#2563eb" stroke-width="3.4" marker-end="url(#arrB)"/>
  <text x="266" y="52" font-size="14" font-weight="700" fill="#2563eb">F₂</text>
  <text x="253" y="114" text-anchor="middle" font-size="12" font-weight="700" fill="#0369a1">A₂</text>
  <rect x="116" y="210" width="136" height="24" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="184" y="226" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">F₁ / A₁ = F₂ / A₂</text>
""")

# 12. Archimedes Buoyancy
SVGS["hyd_archimedes_buoyancy.svg"] = wrap_svg("""
  <!-- Beaker -->
  <path d="M 96 40 L 96 208 Q 96 216 106 216 L 254 216 Q 264 216 264 208 L 264 40"
        stroke="#334155" stroke-width="2.6" stroke-linecap="round"/>
  <!-- Water -->
  <rect x="98" y="86" width="164" height="128" fill="url(#water)"/>
  <path d="M 98 86 Q 138 80 180 86 Q 222 92 262 86" stroke="#0284c7" stroke-width="2"/>
  <!-- Submerged block -->
  <rect x="148" y="114" width="64" height="52" rx="5" fill="url(#blockG)" stroke="#334155" stroke-width="2"/>
  <circle cx="180" cy="140" r="3" fill="#1e293b"/>
  <!-- Weight vector W (down) -->
  <line x1="180" y1="140" x2="180" y2="206" stroke="#dc2626" stroke-width="3" marker-end="url(#arrR)"/>
  <text x="190" y="198" font-size="14" font-weight="700" fill="#dc2626">W</text>
  <!-- Buoyancy vector A (up) -->
  <line x1="180" y1="140" x2="180" y2="54" stroke="#2563eb" stroke-width="3" marker-end="url(#arrB)"/>
  <text x="190" y="70" font-size="14" font-weight="700" fill="#2563eb">A (Άνωση)</text>
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Αρχή του Αρχιμήδη: A = ρυγρ · g · Vβυθ</text>
""")

# 13. Communicating Vessels
SVGS["hyd_communicating_vessels.svg"] = wrap_svg("""
  <!-- Common water level line -->
  <line x1="36" y1="96" x2="324" y2="96" stroke="#0284c7" stroke-width="1.4" stroke-dasharray="5 4"/>
  <text x="328" y="100" font-size="12" font-weight="700" fill="#0284c7">h</text>
  <!-- Base tube + 3 different shaped vessels filled to same height y=96 -->
  <path d="M 60 96 L 60 198 L 300 198 L 300 96 L 274 96 L 274 176 L 204 176 L 194 96 L 154 96 L 164 176 L 86 176 L 86 96 Z"
        fill="url(#water)"/>
  <!-- Vessel outlines -->
  <path d="M 60 44 L 60 198 L 300 198 L 300 44 M 274 44 L 274 176 L 204 176 L 190 44 M 150 44 L 164 176 L 86 176 L 86 44"
        stroke="#1e293b" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="180" y="224" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Συγκοινωνούντα Δοχεία — P = ρ · g · h</text>
""")

# 14. Torricelli Barometer
SVGS["hyd_torricelli_barometer.svg"] = wrap_svg("""
  <!-- Basin -->
  <path d="M 80 156 L 80 212 L 280 212 L 280 156" stroke="#334155" stroke-width="2.4"/>
  <rect x="82" y="172" width="196" height="38" fill="url(#metal)"/>
  <!-- Inverted Glass Tube -->
  <path d="M 164 188 L 164 38 A 16 16 0 0 1 196 38 L 196 188" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <!-- Mercury Column -->
  <rect x="166" y="68" width="28" height="122" fill="#94a3b8"/>
  <text x="180" y="54" text-anchor="middle" font-size="10" font-weight="700" fill="#64748b">Κενό</text>
  <!-- Height dimension 76 cm -->
  <line x1="222" y1="68" x2="222" y2="172" stroke="#dc2626" stroke-width="2" marker-start="url(#arrR)" marker-end="url(#arrR)"/>
  <text x="230" y="124" font-size="12" font-weight="700" fill="#dc2626">h = 76 cm Hg</text>
  <!-- Atmospheric pressure arrows -->
  <line x1="112" y1="132" x2="112" y2="168" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arrB)"/>
  <text x="86" y="124" font-size="12" font-weight="700" fill="#2563eb">Pατμ</text>
  <text x="180" y="232" text-anchor="middle" font-size="12" font-weight="700" fill="#1e293b">Πείραμα Torricelli (1 atm)</text>
""")

# 15. Newton's 1st Law (Inertia)
SVGS["mech_newton_1_inertia.svg"] = wrap_svg("""
  <line x1="24" y1="176" x2="336" y2="176" stroke="#334155" stroke-width="2.6"/>
  <rect x="140" y="114" width="80" height="62" rx="6" fill="url(#blockG)" stroke="#334155" stroke-width="2.2"/>
  <text x="180" y="150" text-anchor="middle" font-size="16" font-weight="700" fill="#1e293b">m</text>
  <!-- Balanced forces -->
  <line x1="140" y1="145" x2="68" y2="145" stroke="#dc2626" stroke-width="2.8" marker-end="url(#arrR)"/>
  <line x1="220" y1="145" x2="292" y2="145" stroke="#2563eb" stroke-width="2.8" marker-end="url(#arrB)"/>
  <text x="64" y="136" font-size="13" font-weight="700" fill="#dc2626">F₁</text>
  <text x="284" y="136" font-size="13" font-weight="700" fill="#2563eb">F₂</text>
  <text x="180" y="42" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">1ος Νόμος Newton (Αδράνεια)</text>
  <rect x="66" y="56" width="228" height="28" rx="7" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="180" y="75" text-anchor="middle" font-size="13" font-weight="700" fill="#2563eb">ΣF = 0 ⇔ u = 0 ή u = σταθ.</text>
""")

# 16. Newton's 2nd Law
SVGS["mech_newton_2_accel.svg"] = wrap_svg("""
  <line x1="24" y1="180" x2="336" y2="180" stroke="#334155" stroke-width="2.6"/>
  <rect x="96" y="116" width="84" height="64" rx="6" fill="url(#blockG)" stroke="#334155" stroke-width="2.2"/>
  <text x="138" y="154" text-anchor="middle" font-size="16" font-weight="700" fill="#1e293b">m</text>
  <line x1="180" y1="148" x2="296" y2="148" stroke="#dc2626" stroke-width="3.4" marker-end="url(#arrR)"/>
  <text x="242" y="138" font-size="14" font-weight="700" fill="#dc2626">ΣF</text>
  <line x1="180" y1="100" x2="262" y2="100" stroke="#16a34a" stroke-width="2.8" marker-end="url(#arrG)"/>
  <text x="220" y="90" font-size="14" font-weight="700" fill="#16a34a">a</text>
  <text x="180" y="34" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">2ος Νόμος Newton: ΣF = m · a</text>
""")

# 17. Newton's 3rd Law
SVGS["mech_newton_3_action_reaction.svg"] = wrap_svg("""
  <line x1="24" y1="184" x2="336" y2="184" stroke="#334155" stroke-width="2.4"/>
  <!-- Sphere A & Sphere B -->
  <circle cx="136" cy="134" r="36" fill="url(#posQ)" stroke="#7f1d1d" stroke-width="2"/>
  <text x="136" y="140" text-anchor="middle" font-size="16" font-weight="700" fill="#ffffff">Α</text>
  <circle cx="224" cy="134" r="36" fill="url(#negQ)" stroke="#1e3a8a" stroke-width="2"/>
  <text x="224" y="140" text-anchor="middle" font-size="16" font-weight="700" fill="#ffffff">Β</text>
  <!-- Opposite equal force vectors -->
  <line x1="136" y1="84" x2="66" y2="84" stroke="#dc2626" stroke-width="3" marker-end="url(#arrR)"/>
  <text x="72" y="72" font-size="13" font-weight="700" fill="#dc2626">F(Β→Α)</text>
  <line x1="224" y1="84" x2="294" y2="84" stroke="#2563eb" stroke-width="3" marker-end="url(#arrB)"/>
  <text x="242" y="72" font-size="13" font-weight="700" fill="#2563eb">F(Α→Β)</text>
  <text x="180" y="30" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">3ος Νόμος Newton: Δράση – Αντίδραση</text>
  <text x="180" y="214" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">F₁₂ = − F₂₁</text>
""")

# 18. Atwood Pulley Machine
SVGS["mech_atwood_pulley.svg"] = wrap_svg("""
  <!-- Ceiling -->
  <line x1="110" y1="22" x2="250" y2="22" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
  <line x1="180" y1="22" x2="180" y2="66" stroke="#475569" stroke-width="3"/>
  <!-- Pulley -->
  <circle cx="180" cy="66" r="26" fill="url(#metal)" stroke="#334155" stroke-width="2.2"/>
  <circle cx="180" cy="66" r="5" fill="#334155"/>
  <!-- Strings -->
  <line x1="154" y1="66" x2="154" y2="150" stroke="#334155" stroke-width="2"/>
  <line x1="206" y1="66" x2="206" y2="122" stroke="#334155" stroke-width="2"/>
  <!-- Mass m1 -->
  <rect x="132" y="150" width="44" height="40" rx="5" fill="url(#blockG)" stroke="#334155" stroke-width="2"/>
  <text x="154" y="175" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">m₁</text>
  <!-- Mass m2 -->
  <rect x="184" y="122" width="44" height="40" rx="5" fill="url(#blockG)" stroke="#334155" stroke-width="2"/>
  <text x="206" y="147" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">m₂</text>
  <!-- Tension & Weight arrows -->
  <line x1="154" y1="150" x2="154" y2="112" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arrB)"/>
  <text x="136" y="122" font-size="12" font-weight="700" fill="#2563eb">T</text>
  <line x1="154" y1="190" x2="154" y2="228" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arrR)"/>
  <text x="128" y="222" font-size="12" font-weight="700" fill="#dc2626">W₁</text>
  <line x1="206" y1="122" x2="206" y2="90" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arrB)"/>
  <text x="216" y="106" font-size="12" font-weight="700" fill="#2563eb">T</text>
  <line x1="206" y1="162" x2="206" y2="202" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arrR)"/>
  <text x="216" y="198" font-size="12" font-weight="700" fill="#dc2626">W₂</text>
""")

# 19. Table + Pulley System
SVGS["mech_table_pulley.svg"] = wrap_svg("""
  <!-- Table -->
  <rect x="30" y="114" width="212" height="16" fill="#e2e8f0" stroke="#334155" stroke-width="2"/>
  <rect x="226" y="130" width="16" height="92" fill="#e2e8f0" stroke="#334155" stroke-width="2"/>
  <!-- Pulley at corner -->
  <circle cx="252" cy="108" r="14" fill="url(#metal)" stroke="#334155" stroke-width="2"/>
  <circle cx="252" cy="108" r="3" fill="#334155"/>
  <!-- Mass m1 on table -->
  <rect x="86" y="68" width="66" height="46" rx="5" fill="url(#blockG)" stroke="#334155" stroke-width="2"/>
  <text x="119" y="96" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">m₁</text>
  <!-- String -->
  <line x1="152" y1="94" x2="252" y2="94" stroke="#334155" stroke-width="2"/>
  <line x1="266" y1="108" x2="266" y2="162" stroke="#334155" stroke-width="2"/>
  <!-- Hanging mass m2 -->
  <rect x="246" y="162" width="40" height="38" rx="5" fill="url(#blockG)" stroke="#334155" stroke-width="2"/>
  <text x="266" y="186" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">m₂</text>
  <!-- Forces -->
  <line x1="152" y1="94" x2="198" y2="94" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arrB)"/>
  <text x="174" y="84" font-size="12" font-weight="700" fill="#2563eb">T</text>
  <line x1="86" y1="110" x2="44" y2="110" stroke="#d97706" stroke-width="2.4" marker-end="url(#arrO)"/>
  <text x="48" y="100" font-size="12" font-weight="700" fill="#d97706">Tολ</text>
  <line x1="266" y1="200" x2="266" y2="232" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arrR)"/>
  <text x="276" y="226" font-size="12" font-weight="700" fill="#dc2626">W₂</text>
""")

# 20. Horizontal Projectile
SVGS["mech_horizontal_projectile.svg"] = wrap_svg("""
  <!-- Axes -->
  <line x1="48" y1="28" x2="48" y2="210" stroke="#334155" stroke-width="1.8" marker-end="url(#arrK)"/>
  <line x1="48" y1="208" x2="332" y2="208" stroke="#334155" stroke-width="1.8" marker-end="url(#arrK)"/>
  <text x="32" y="42" font-size="12" font-weight="700" fill="#334155">y</text>
  <text x="326" y="224" font-size="12" font-weight="700" fill="#334155">x</text>
  <!-- Parabolic trajectory -->
  <path d="M 48 56 Q 178 56 292 206" stroke="#2563eb" stroke-width="2.6" stroke-dasharray="6 4"/>
  <!-- Launch velocity u0 -->
  <circle cx="48" cy="56" r="6" fill="#dc2626"/>
  <line x1="48" y1="56" x2="116" y2="56" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arrR)"/>
  <text x="86" y="46" font-size="13" font-weight="700" fill="#dc2626">u₀</text>
  <!-- Midpoint velocity components -->
  <circle cx="182" cy="108" r="5.5" fill="#1e293b"/>
  <line x1="182" y1="108" x2="246" y2="108" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arrG)"/>
  <line x1="182" y1="108" x2="182" y2="156" stroke="#d97706" stroke-width="2.2" marker-end="url(#arrO)"/>
  <line x1="182" y1="108" x2="242" y2="154" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arrB)"/>
  <text x="234" y="98" font-size="12" font-weight="700" fill="#16a34a">ux = u₀</text>
  <text x="154" y="148" font-size="12" font-weight="700" fill="#d97706">uy</text>
  <text x="246" y="156" font-size="13" font-weight="700" fill="#2563eb">u</text>
  <text x="242" y="34" font-size="12" font-weight="700" fill="#1e293b">Οριζόντια Βολή</text>
""")

# 21. Mechanical Energy Conservation
SVGS["mech_energy_rollercoaster.svg"] = wrap_svg("""
  <line x1="20" y1="202" x2="340" y2="202" stroke="#475569" stroke-width="1.8" stroke-dasharray="5 4"/>
  <!-- Curved track -->
  <path d="M 32 58 C 92 58, 120 198, 180 198 C 240 198, 268 96, 326 96"
        stroke="#1e293b" stroke-width="3.2" stroke-linecap="round"/>
  <!-- Position A (top) -->
  <circle cx="52" cy="52" r="9" fill="url(#posQ)"/>
  <text x="36" y="34" font-size="11" font-weight="700" fill="#dc2626">Α: Umax, K=0</text>
  <!-- Position B (bottom) -->
  <circle cx="180" cy="188" r="9" fill="url(#negQ)"/>
  <text x="136" y="172" font-size="11" font-weight="700" fill="#2563eb">Β: Kmax, U=0</text>
  <!-- Position C (right) -->
  <circle cx="308" cy="88" r="9" fill="#16a34a"/>
  <text x="260" y="70" font-size="11" font-weight="700" fill="#16a34a">Γ: K + U</text>
  <rect x="92" y="210" width="176" height="22" rx="6" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="180" y="225" text-anchor="middle" font-size="12" font-weight="700" fill="#1e293b">Eμηχ = K + U = σταθ.</text>
""")

# 22. Work at an Angle
SVGS["mech_work_angle.svg"] = wrap_svg("""
  <line x1="24" y1="184" x2="336" y2="184" stroke="#334155" stroke-width="2.4"/>
  <rect x="70" y="128" width="76" height="56" rx="5" fill="url(#blockG)" stroke="#334155" stroke-width="2"/>
  <rect x="220" y="128" width="76" height="56" rx="5" fill="url(#blockG)" stroke="#94a3b8" stroke-width="1.6" stroke-dasharray="5 4" opacity="0.5"/>
  <!-- Force at angle -->
  <line x1="146" y1="150" x2="232" y2="86" stroke="#dc2626" stroke-width="3" marker-end="url(#arrR)"/>
  <line x1="146" y1="150" x2="232" y2="150" stroke="#2563eb" stroke-width="2.2" stroke-dasharray="4 3" marker-end="url(#arrB)"/>
  <path d="M 184 150 A 38 38 0 0 0 176 128" stroke="#1e293b" stroke-width="1.6"/>
  <text x="188" y="140" font-size="13" font-weight="700" fill="#1e293b">θ</text>
  <text x="218" y="78" font-size="14" font-weight="700" fill="#dc2626">F</text>
  <text x="218" y="166" font-size="12" font-weight="700" fill="#2563eb">Fx = F·συνθ</text>
  <!-- Displacement arrow -->
  <line x1="108" y1="204" x2="258" y2="204" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arrG)"/>
  <text x="180" y="222" text-anchor="middle" font-size="13" font-weight="700" fill="#16a34a">Δx</text>
  <text x="180" y="34" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">Έργο Δύναμης: W = F · Δx · συνθ</text>
""")

# 23. Uniform Circular Motion
SVGS["b_circular_motion.svg"] = wrap_svg("""
  <circle cx="176" cy="126" r="76" stroke="#334155" stroke-width="2.2" stroke-dasharray="6 4"/>
  <circle cx="176" cy="126" r="3.5" fill="#1e293b"/>
  <line x1="176" y1="126" x2="252" y2="126" stroke="#64748b" stroke-width="1.5"/>
  <text x="214" y="142" font-size="12" font-weight="700" fill="#475569">R</text>
  <!-- Mass on right -->
  <circle cx="252" cy="126" r="8" fill="url(#posQ)"/>
  <!-- Tangential velocity u -->
  <line x1="252" y1="118" x2="252" y2="44" stroke="#2563eb" stroke-width="3" marker-end="url(#arrB)"/>
  <text x="262" y="64" font-size="14" font-weight="700" fill="#2563eb">u</text>
  <!-- Centripetal acceleration / force -->
  <line x1="244" y1="126" x2="188" y2="126" stroke="#dc2626" stroke-width="3" marker-end="url(#arrR)"/>
  <text x="196" y="116" font-size="13" font-weight="700" fill="#dc2626">Fκ, aκ</text>
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Ομαλή Κυκλική Κίνηση (aκ = u² / R)</text>
""")

# 24. Elastic Collision
SVGS["b_elastic_collision.svg"] = wrap_svg("""
  <text x="34" y="42" font-size="12" font-weight="700" fill="#475569">Πριν την κρούση:</text>
  <circle cx="96" cy="76" r="22" fill="url(#posQ)"/>
  <text x="96" y="81" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">m₁</text>
  <line x1="120" y1="76" x2="174" y2="76" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arrR)"/>
  <text x="142" y="66" font-size="12" font-weight="700" fill="#dc2626">u₁</text>
  <circle cx="238" cy="76" r="26" fill="url(#negQ)"/>
  <text x="238" y="81" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">m₂</text>
  <text x="272" y="80" font-size="12" font-weight="600" fill="#64748b">(u₂=0)</text>

  <line x1="34" y1="122" x2="326" y2="122" stroke="#cbd5e1" stroke-width="1.4" stroke-dasharray="4 4"/>
  <text x="34" y="144" font-size="12" font-weight="700" fill="#475569">Μετά την κρούση:</text>
  <circle cx="116" cy="182" r="22" fill="url(#posQ)"/>
  <text x="116" y="187" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">m₁</text>
  <line x1="92" y1="182" x2="46" y2="182" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arrR)"/>
  <text x="58" y="172" font-size="12" font-weight="700" fill="#dc2626">u₁'</text>
  <circle cx="234" cy="182" r="26" fill="url(#negQ)"/>
  <text x="234" y="187" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">m₂</text>
  <line x1="262" y1="182" x2="322" y2="182" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arrB)"/>
  <text x="284" y="172" font-size="12" font-weight="700" fill="#2563eb">u₂'</text>
""")

# 25. P-V Thermodynamic Processes
SVGS["b_pv_isothermal_adiabatic.svg"] = wrap_svg("""
  <!-- Axes -->
  <line x1="54" y1="204" x2="54" y2="28" stroke="#1e293b" stroke-width="2.2" marker-end="url(#arrK)"/>
  <line x1="54" y1="204" x2="330" y2="204" stroke="#1e293b" stroke-width="2.2" marker-end="url(#arrK)"/>
  <text x="36" y="40" font-size="14" font-weight="700" fill="#1e293b">P</text>
  <text x="322" y="224" font-size="14" font-weight="700" fill="#1e293b">V</text>
  <!-- Starting point -->
  <circle cx="118" cy="76" r="4.5" fill="#1e293b"/>
  <!-- Isobaric -->
  <line x1="118" y1="76" x2="262" y2="76" stroke="#16a34a" stroke-width="2.6" marker-end="url(#arrG)"/>
  <text x="268" y="80" font-size="11" font-weight="700" fill="#16a34a">Ισοβαρής</text>
  <!-- Isothermal -->
  <path d="M 118 76 Q 178 118 262 132" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arrB)"/>
  <text x="268" y="136" font-size="11" font-weight="700" fill="#2563eb">Ισόθερμη</text>
  <!-- Adiabatic (steeper) -->
  <path d="M 118 76 Q 158 148 232 178" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arrR)"/>
  <text x="238" y="182" font-size="11" font-weight="700" fill="#dc2626">Αδιαβατική</text>
  <!-- Isochoric -->
  <line x1="118" y1="76" x2="118" y2="178" stroke="#d97706" stroke-width="2.6" marker-end="url(#arrO)"/>
  <text x="64" y="176" font-size="11" font-weight="700" fill="#d97706">Ισόχωρη</text>
  <text x="196" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Θερμοδυναμικές Μεταβολές (P–V)</text>
""")

# 26. Carnot Cycle
SVGS["b_carnot_cycle.svg"] = wrap_svg("""
  <line x1="50" y1="208" x2="50" y2="26" stroke="#1e293b" stroke-width="2.2" marker-end="url(#arrK)"/>
  <line x1="50" y1="208" x2="328" y2="208" stroke="#1e293b" stroke-width="2.2" marker-end="url(#arrK)"/>
  <text x="32" y="38" font-size="14" font-weight="700" fill="#1e293b">P</text>
  <text x="322" y="226" font-size="14" font-weight="700" fill="#1e293b">V</text>
  <!-- Cycle area -->
  <path d="M 112 64 Q 168 84 228 94 Q 254 140 282 174 Q 214 166 154 152 Q 130 112 112 64 Z"
        fill="#fef08a" fill-opacity="0.45"/>
  <!-- 1->2 Isothermal expansion Qh -->
  <path d="M 112 64 Q 168 84 228 94" stroke="#dc2626" stroke-width="2.8" marker-end="url(#arrR)"/>
  <!-- 2->3 Adiabatic expansion -->
  <path d="M 228 94 Q 254 140 282 174" stroke="#d97706" stroke-width="2.6" marker-end="url(#arrO)"/>
  <!-- 3->4 Isothermal compression Qc -->
  <path d="M 282 174 Q 214 166 154 152" stroke="#2563eb" stroke-width="2.8" marker-end="url(#arrB)"/>
  <!-- 4->1 Adiabatic compression -->
  <path d="M 154 152 Q 130 112 112 64" stroke="#16a34a" stroke-width="2.6" marker-end="url(#arrG)"/>
  <text x="174" y="68" font-size="12" font-weight="700" fill="#dc2626">Qₕ (Tₕ)</text>
  <text x="200" y="186" font-size="12" font-weight="700" fill="#2563eb">Qc (Tc)</text>
  <text x="196" y="132" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Wολ</text>
  <text x="196" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Κύκλος Carnot (e = 1 − Tc/Tₕ)</text>
""")

# 27. Coulomb's Law
SVGS["b_coulomb_forces.svg"] = wrap_svg("""
  <!-- Row 1: Repulsion (+ +) -->
  <circle cx="128" cy="72" r="20" fill="url(#posQ)"/>
  <text x="128" y="78" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">+</text>
  <circle cx="232" cy="72" r="20" fill="url(#posQ)"/>
  <text x="232" y="78" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">+</text>
  <line x1="106" y1="72" x2="48" y2="72" stroke="#dc2626" stroke-width="2.8" marker-end="url(#arrR)"/>
  <line x1="254" y1="72" x2="312" y2="72" stroke="#dc2626" stroke-width="2.8" marker-end="url(#arrR)"/>
  <text x="64" y="60" font-size="12" font-weight="700" fill="#dc2626">F</text>
  <text x="292" y="60" font-size="12" font-weight="700" fill="#dc2626">F</text>
  <text x="180" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="#475569">Ομώνυμα → Άπωση</text>

  <!-- Row 2: Attraction (+ -) -->
  <circle cx="114" cy="164" r="20" fill="url(#posQ)"/>
  <text x="114" y="170" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">+</text>
  <circle cx="246" cy="164" r="20" fill="url(#negQ)"/>
  <text x="246" y="170" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">−</text>
  <line x1="136" y1="164" x2="174" y2="164" stroke="#2563eb" stroke-width="2.8" marker-end="url(#arrB)"/>
  <line x1="224" y1="164" x2="186" y2="164" stroke="#2563eb" stroke-width="2.8" marker-end="url(#arrB)"/>
  <text x="180" y="132" text-anchor="middle" font-size="12" font-weight="700" fill="#475569">Ετερώνυμα → Έλξη</text>
  <text x="180" y="218" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">F = k · |q₁·q₂| / r²</text>
""")

# 28. Electric Dipole Field Lines
SVGS["b_electric_field_dipole.svg"] = wrap_svg("""
  <!-- Field lines from + to - -->
  <g stroke="#2563eb" stroke-width="1.8" fill="none">
    <line x1="116" y1="120" x2="244" y2="120" marker-end="url(#arrB)"/>
    <path d="M 110 106 C 142 60, 218 60, 250 106" marker-end="url(#arrB)"/>
    <path d="M 110 134 C 142 180, 218 180, 250 134" marker-end="url(#arrB)"/>
    <path d="M 102 100 C 122 20, 238 20, 258 100"/>
    <path d="M 102 140 C 122 220, 238 220, 258 140"/>
    <path d="M 88 110 C 60 88, 40 74, 24 66"/>
    <path d="M 88 130 C 60 152, 40 166, 24 174"/>
    <path d="M 272 110 C 300 88, 320 74, 336 66"/>
    <path d="M 272 130 C 300 152, 320 166, 336 174"/>
  </g>
  <circle cx="102" cy="120" r="18" fill="url(#posQ)"/>
  <text x="102" y="126" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">+</text>
  <circle cx="258" cy="120" r="18" fill="url(#negQ)"/>
  <text x="258" y="126" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">−</text>
  <text x="180" y="226" text-anchor="middle" font-size="12" font-weight="700" fill="#1e293b">Δυναμικές Γραμμές Ηλεκτρικού Διπόλου</text>
""")

# 29. Same-Sign Charges Field Lines
SVGS["b_electric_field_same.svg"] = wrap_svg("""
  <g stroke="#dc2626" stroke-width="1.8" fill="none">
    <path d="M 116 108 C 156 96, 172 68, 172 24" marker-end="url(#arrR)"/>
    <path d="M 116 132 C 156 144, 172 172, 172 216" marker-end="url(#arrR)"/>
    <path d="M 244 108 C 204 96, 188 68, 188 24" marker-end="url(#arrR)"/>
    <path d="M 244 132 C 204 144, 188 172, 188 216" marker-end="url(#arrR)"/>
    <path d="M 96 102 C 80 70, 56 44, 32 32" marker-end="url(#arrR)"/>
    <path d="M 96 138 C 80 170, 56 196, 32 208" marker-end="url(#arrR)"/>
    <path d="M 264 102 C 280 70, 304 44, 328 32" marker-end="url(#arrR)"/>
    <path d="M 264 138 C 280 170, 304 196, 328 208" marker-end="url(#arrR)"/>
  </g>
  <circle cx="104" cy="120" r="18" fill="url(#posQ)"/>
  <text x="104" y="126" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">+</text>
  <circle cx="256" cy="120" r="18" fill="url(#posQ)"/>
  <text x="256" y="126" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">+</text>
  <circle cx="180" cy="120" r="3" fill="#64748b"/>
  <text x="180" y="138" text-anchor="middle" font-size="10" font-weight="700" fill="#64748b">E=0</text>
""")

# 30. Parallel Plate Capacitor
SVGS["b_parallel_plate_capacitor.svg"] = wrap_svg("""
  <!-- Positive plate (left) -->
  <rect x="76" y="42" width="16" height="156" rx="3" fill="#fee2e2" stroke="#dc2626" stroke-width="2"/>
  <g font-size="14" font-weight="700" fill="#dc2626" text-anchor="middle">
    <text x="84" y="64">+</text><text x="84" y="94">+</text><text x="84" y="124">+</text><text x="84" y="154">+</text><text x="84" y="184">+</text>
  </g>
  <!-- Negative plate (right) -->
  <rect x="268" y="42" width="16" height="156" rx="3" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <g font-size="16" font-weight="700" fill="#2563eb" text-anchor="middle">
    <text x="276" y="65">−</text><text x="276" y="95">−</text><text x="276" y="125">−</text><text x="276" y="155">−</text><text x="276" y="185">−</text>
  </g>
  <!-- Uniform E-field arrows -->
  <g stroke="#2563eb" stroke-width="2.2" marker-end="url(#arrB)">
    <line x1="96" y1="62" x2="262" y2="62"/>
    <line x1="96" y1="92" x2="262" y2="92"/>
    <line x1="96" y1="122" x2="262" y2="122"/>
    <line x1="96" y1="152" x2="262" y2="152"/>
    <line x1="96" y1="182" x2="262" y2="182"/>
  </g>
  <text x="180" y="28" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Επίπεδος Πυκνωτής — Ομογενές Πεδίο E = V / d</text>
  <line x1="94" y1="216" x2="266" y2="216" stroke="#475569" stroke-width="1.6" marker-start="url(#arrK)" marker-end="url(#arrK)"/>
  <text x="180" y="232" text-anchor="middle" font-size="12" font-weight="700" fill="#475569">d</text>
""")

# 31. Laplace / Lorentz Force in Magnetic Field
SVGS["c_lorentz_right_hand.svg"] = wrap_svg("""
  <!-- Magnetic field B into page (x symbols) -->
  <rect x="46" y="38" width="268" height="164" rx="10" fill="#f0f9ff" stroke="#7dd3fc" stroke-width="1.5" stroke-dasharray="5 4"/>
  <g stroke="#0284c7" stroke-width="1.8" opacity="0.55">
    <path d="M 74 62 L 84 72 M 84 62 L 74 72"/>
    <path d="M 134 62 L 144 72 M 144 62 L 134 72"/>
    <path d="M 214 62 L 224 72 M 224 62 L 214 72"/>
    <path d="M 274 62 L 284 72 M 284 62 L 274 72"/>
    <path d="M 74 166 L 84 176 M 84 166 L 74 176"/>
    <path d="M 134 166 L 144 176 M 144 166 L 134 176"/>
    <path d="M 214 166 L 224 176 M 224 166 L 214 176"/>
    <path d="M 274 166 L 284 176 M 284 166 L 274 176"/>
  </g>
  <text x="290" y="58" font-size="13" font-weight="700" fill="#0284c7">B (⊗)</text>
  <!-- Current-carrying conductor -->
  <rect x="64" y="114" width="232" height="14" rx="4" fill="url(#metal)" stroke="#334155" stroke-width="1.8"/>
  <line x1="94" y1="121" x2="158" y2="121" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arrR)"/>
  <text x="122" y="144" font-size="13" font-weight="700" fill="#dc2626">I</text>
  <!-- Force F_L upwards -->
  <line x1="180" y1="114" x2="180" y2="48" stroke="#16a34a" stroke-width="3.4" marker-end="url(#arrG)"/>
  <text x="190" y="64" font-size="14" font-weight="700" fill="#16a34a">F_L = B · I · L</text>
  <text x="180" y="224" text-anchor="middle" font-size="12" font-weight="700" fill="#1e293b">Δύναμη Laplace σε Αγωγό εντός Μαγνητικού Πεδίου</text>
""")

# 32. Venturi Tube & Bernoulli's Principle
SVGS["c_bernoulli_venturi.svg"] = wrap_svg("""
  <!-- Venturi pipe -->
  <path d="M 24 128 L 116 128 Q 144 128 156 144 L 204 144 Q 216 128 244 128 L 336 128
           L 336 196 L 244 196 Q 216 196 204 180 L 156 180 Q 144 196 116 196 L 24 196 Z"
        fill="url(#water)" stroke="#1e293b" stroke-width="2.4" stroke-linejoin="round"/>
  <!-- Vertical manometer tubes -->
  <rect x="76" y="42" width="16" height="86" fill="#f8fafc" stroke="#334155" stroke-width="1.8"/>
  <rect x="78" y="64" width="12" height="64" fill="#38bdf8"/>
  <rect x="172" y="42" width="16" height="102" fill="#f8fafc" stroke="#334155" stroke-width="1.8"/>
  <rect x="174" y="108" width="12" height="36" fill="#38bdf8"/>
  <!-- Velocity arrows -->
  <line x1="36" y1="162" x2="86" y2="162" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arrB)"/>
  <line x1="146" y1="162" x2="220" y2="162" stroke="#dc2626" stroke-width="3" marker-end="url(#arrR)"/>
  <text x="54" y="152" font-size="12" font-weight="700" fill="#2563eb">u₁</text>
  <text x="180" y="156" font-size="12" font-weight="700" fill="#dc2626">u₂ &gt; u₁</text>
  <text x="100" y="76" font-size="12" font-weight="700" fill="#0369a1">P₁</text>
  <text x="196" y="106" font-size="12" font-weight="700" fill="#dc2626">P₂ &lt; P₁</text>
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Σωλήνας Venturi — Νόμος Bernoulli</text>
""")


for fname, content in SVGS.items():
    out_p = os.path.join(OUT_DIR, fname)
    with open(out_p, "w", encoding="utf-8") as f:
        f.write(content)

total_kb = sum(os.path.getsize(os.path.join(OUT_DIR, fn)) for fn in SVGS) / 1024
print(f"Generated {len(SVGS)} Native Physics SVGs in {OUT_DIR}/ (Total: {total_kb:.1f} KB, avg {total_kb/len(SVGS):.1f} KB each)")
