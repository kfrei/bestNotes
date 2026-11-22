#!/usr/bin/env python3
"""
Generate Batch 4: 24 clean, textbook-grade Native Vector (.svg) diagrams
for Geography & Geology (Γυμνάσιο & Λύκειο, ebooks.edu.gr aligned).
Output: public/vectors_stem/geography/*.svg
"""
import os
import math

OUT_DIR = os.path.join("public", "vectors_stem", "geography")
os.makedirs(OUT_DIR, exist_ok=True)


def svg_wrap(body: str, w: int = 440, h: int = 300) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <defs>
    <marker id="arr-dark" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#1e293b"/>
    </marker>
    <marker id="arr-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#2563eb"/>
    </marker>
    <marker id="arr-red" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#dc2626"/>
    </marker>
    <marker id="arr-amber" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#d97706"/>
    </marker>
    <marker id="arr-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M1,1.5 L8.5,5 L1,8.5 Z" fill="#16a34a"/>
    </marker>
    <linearGradient id="sky-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#f0f9ff"/>
    </linearGradient>
    <linearGradient id="sea-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0369a1"/>
    </linearGradient>
    <linearGradient id="lava-grad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="45%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#dc2626"/>
    </linearGradient>
    <radialGradient id="sun-grad" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="60%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </radialGradient>
    <radialGradient id="earth-grad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="65%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </radialGradient>
  </defs>
  <style>
    .t-title {{ font: 700 13.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #0f172a; }}
    .t-sub {{ font: 600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #334155; }}
    .t-lbl {{ font: 600 10.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #1e293b; }}
    .t-sm {{ font: 500 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #475569; }}
    .t-white {{ font: 700 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #ffffff; }}
  </style>
{body}
</svg>'''


def write_svg(filename: str, body: str, w: int = 440, h: int = 300):
    path = os.path.join(OUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(svg_wrap(body, w, h))


# 1. Earth layers
def make_earth_layers():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Εσωτερική Δομή της Γης</text>
  <g transform="translate(165,160)">
    <circle r="110" fill="#2563eb" stroke="#1e293b" stroke-width="2"/>
    <path d="M-85,-45 Q-50,-75 -20,-40 Q-5,-15 -35,20 Q-65,45 -90,10 Z" fill="#22c55e" opacity="0.85"/>
    <path d="M-40,55 Q-10,45 10,80 Q-20,102 -55,82 Z" fill="#22c55e" opacity="0.85"/>
    <!-- Cutaway quadrant -->
    <path d="M0,0 L0,-110 A110,110 0 0,1 110,0 Z" fill="#92400e" stroke="#1e293b" stroke-width="1.5"/>
    <path d="M0,0 L0,-102 A102,102 0 0,1 102,0 Z" fill="#ea580c" stroke="#9a3412" stroke-width="1.2"/>
    <path d="M0,0 L0,-62 A62,62 0 0,1 62,0 Z" fill="#f59e0b" stroke="#b45309" stroke-width="1.2"/>
    <path d="M0,0 L0,-30 A30,30 0 0,1 30,0 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1.2"/>
  </g>
  <!-- Labels -->
  <line x1="235" y1="78" x2="295" y2="62" stroke="#1e293b" stroke-width="1.2"/>
  <text x="300" y="65" class="t-lbl">Φλοιός (5–70 km)</text>
  <line x1="235" y1="105" x2="295" y2="100" stroke="#1e293b" stroke-width="1.2"/>
  <text x="300" y="103" class="t-lbl">Μανδύας (2.900 km)</text>
  <line x1="210" y1="130" x2="295" y2="140" stroke="#1e293b" stroke-width="1.2"/>
  <text x="300" y="143" class="t-lbl">Εξωτερικός Πυρήνας</text>
  <text x="300" y="156" class="t-sm">(υγρός Fe–Ni)</text>
  <line x1="185" y1="148" x2="295" y2="188" stroke="#1e293b" stroke-width="1.2"/>
  <text x="300" y="191" class="t-lbl">Εσωτερικός Πυρήνας</text>
  <text x="300" y="204" class="t-sm">(στερεός, ~5.500 °C)</text>
  <text x="300" y="242" class="t-sm">Ακτίνα Γης ≈ 6.371 km</text>
'''
    write_svg("geo_earth_layers.svg", body)


# 2. Tectonic plates boundaries
def make_tectonic_plates():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Όρια Λιθοσφαιρικών Πλακών</text>
  <!-- Panel 1: Divergent -->
  <g transform="translate(14,42)">
    <rect width="128" height="236" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
    <text x="64" y="20" text-anchor="middle" class="t-sub">1. Αποκλίνοντα</text>
    <rect x="8" y="135" width="112" height="58" fill="#fdba74" rx="4"/>
    <path d="M8,105 L56,105 L56,138 L8,138 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.3"/>
    <path d="M72,105 L120,105 L120,138 L72,138 Z" fill="#94a3b8" stroke="#334155" stroke-width="1.3"/>
    <path d="M56,138 L64,96 L72,138 Z" fill="url(#lava-grad)"/>
    <line x1="48" y1="88" x2="18" y2="88" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
    <line x1="80" y1="88" x2="110" y2="88" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
    <text x="64" y="172" text-anchor="middle" class="t-sm">Ασθενόσφαιρα</text>
    <text x="64" y="214" text-anchor="middle" class="t-sm">Μεσοωκεάνια ράχη</text>
    <text x="64" y="227" text-anchor="middle" class="t-sm">Νέος φλοιός</text>
  </g>
  <!-- Panel 2: Convergent -->
  <g transform="translate(156,42)">
    <rect width="128" height="236" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
    <text x="64" y="20" text-anchor="middle" class="t-sub">2. Συγκλίνοντα</text>
    <rect x="8" y="135" width="112" height="58" fill="#fdba74" rx="4"/>
    <path d="M8,110 L58,110 L82,175 L64,175 L46,134 L8,134 Z" fill="#64748b" stroke="#334155" stroke-width="1.3"/>
    <path d="M58,108 L80,82 L100,102 L120,102 L120,136 L58,136 Z" fill="#a8a29e" stroke="#334155" stroke-width="1.3"/>
    <path d="M77,85 L80,75 L83,85 Z" fill="#ef4444"/>
    <line x1="16" y1="90" x2="46" y2="90" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-blue)"/>
    <line x1="112" y1="90" x2="88" y2="90" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-blue)"/>
    <text x="64" y="214" text-anchor="middle" class="t-sm">Καταβύθιση, όρη</text>
    <text x="64" y="227" text-anchor="middle" class="t-sm">&amp; ηφαίστεια</text>
  </g>
  <!-- Panel 3: Transform -->
  <g transform="translate(298,42)">
    <rect width="128" height="236" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.2"/>
    <text x="64" y="20" text-anchor="middle" class="t-sub">3. Μετασχηματισμού</text>
    <rect x="14" y="64" width="46" height="118" rx="4" fill="#cbd5e1" stroke="#334155" stroke-width="1.4"/>
    <rect x="68" y="64" width="46" height="118" rx="4" fill="#94a3b8" stroke="#334155" stroke-width="1.4"/>
    <line x1="64" y1="56" x2="64" y2="190" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
    <line x1="37" y1="150" x2="37" y2="92" stroke="#1e293b" stroke-width="2.2" marker-end="url(#arr-dark)"/>
    <line x1="91" y1="92" x2="91" y2="150" stroke="#1e293b" stroke-width="2.2" marker-end="url(#arr-dark)"/>
    <text x="64" y="214" text-anchor="middle" class="t-sm">Οριζόντια ολίσθηση</text>
    <text x="64" y="227" text-anchor="middle" class="t-sm">Ισχυροί σεισμοί</text>
  </g>
'''
    write_svg("geo_tectonic_plates.svg", body)


# 3. Volcano cross section
def make_volcano():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Τομή Ηφαιστείου</text>
  <rect x="20" y="34" width="400" height="248" rx="10" fill="url(#sky-grad)" stroke="#cbd5e1"/>
  <!-- Ash cloud -->
  <path d="M180,82 Q160,55 190,46 Q215,34 245,48 Q275,44 282,66 Q262,82 232,76 Z" fill="#94a3b8" opacity="0.85"/>
  <!-- Ground strata -->
  <rect x="20" y="210" width="400" height="72" fill="#78716c"/>
  <rect x="20" y="210" width="400" height="22" fill="#a8a29e"/>
  <!-- Cone -->
  <polygon points="85,210 198,96 232,96 345,210" fill="#57534e" stroke="#1e293b" stroke-width="1.6"/>
  <!-- Magma chamber & conduit -->
  <ellipse cx="215" cy="256" rx="68" ry="22" fill="url(#lava-grad)"/>
  <path d="M204,240 L207,96 L223,96 L226,240 Z" fill="url(#lava-grad)"/>
  <!-- Side vent -->
  <path d="M222,165 L278,144 L282,149 L222,174 Z" fill="url(#lava-grad)"/>
  <!-- Lava flow -->
  <path d="M198,96 Q178,125 162,155 Q148,175 130,208 L142,208 Q160,178 174,154 Q188,128 205,100 Z" fill="#f97316"/>
  <!-- Labels -->
  <text x="292" y="64" class="t-lbl">Νέφος τέφρας &amp; αερίων</text>
  <line x1="226" y1="96" x2="296" y2="96" stroke="#1e293b" stroke-width="1.2"/>
  <text x="300" y="100" class="t-lbl">Κρατήρας</text>
  <line x1="280" y1="146" x2="322" y2="136" stroke="#1e293b" stroke-width="1.2"/>
  <text x="326" y="139" class="t-lbl">Πλευρικός</text>
  <text x="326" y="151" class="t-lbl">κώνος</text>
  <line x1="158" y1="162" x2="96" y2="148" stroke="#1e293b" stroke-width="1.2"/>
  <text x="32" y="148" class="t-lbl">Ροή λάβας</text>
  <line x1="210" y1="184" x2="108" y2="190" stroke="#1e293b" stroke-width="1.2"/>
  <text x="32" y="193" class="t-lbl">Καμινάδα</text>
  <text x="215" y="261" text-anchor="middle" class="t-white">Μαγματικός Θάλαμος</text>
'''
    write_svg("geo_volcano_cross_section.svg", body)


# 4. Earthquake focus, epicenter, waves
def make_earthquake():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Σεισμός: Υπόκεντρο, Επίκεντρο &amp; Κύματα</text>
  <!-- Earth block 3D-like -->
  <polygon points="40,100 340,100 400,66 100,66" fill="#bbf7d0" stroke="#15803d" stroke-width="1.4"/>
  <rect x="40" y="100" width="300" height="170" fill="#e7e5e4" stroke="#57534e" stroke-width="1.4"/>
  <polygon points="340,100 400,66 400,236 340,270" fill="#d6d3d1" stroke="#57534e" stroke-width="1.4"/>
  <!-- Fault plane -->
  <line x1="140" y1="100" x2="220" y2="270" stroke="#b91c1c" stroke-width="2.2" stroke-dasharray="6,3"/>
  <line x1="140" y1="100" x2="200" y2="66" stroke="#b91c1c" stroke-width="2" stroke-dasharray="5,3"/>
  <!-- Seismic waves around focus -->
  <circle cx="182" cy="190" r="24" fill="none" stroke="#ef4444" stroke-width="1.6" stroke-dasharray="4,2"/>
  <circle cx="182" cy="190" r="46" fill="none" stroke="#f97316" stroke-width="1.5" stroke-dasharray="5,3"/>
  <circle cx="182" cy="190" r="70" fill="none" stroke="#eab308" stroke-width="1.4" stroke-dasharray="6,3"/>
  <!-- Focus -->
  <circle cx="182" cy="190" r="7" fill="#dc2626" stroke="#fff" stroke-width="1.5"/>
  <!-- Vertical line to Epicenter -->
  <line x1="182" y1="183" x2="182" y2="88" stroke="#1e293b" stroke-width="1.5" stroke-dasharray="3,3"/>
  <!-- Epicenter -->
  <ellipse cx="182" cy="84" rx="22" ry="8" fill="none" stroke="#dc2626" stroke-width="1.5"/>
  <ellipse cx="182" cy="84" rx="40" ry="13" fill="none" stroke="#ef4444" stroke-width="1.2" opacity="0.7"/>
  <circle cx="182" cy="84" r="5" fill="#dc2626"/>
  <!-- Labels -->
  <line x1="188" y1="82" x2="255" y2="50" stroke="#1e293b" stroke-width="1.2"/>
  <text x="260" y="53" class="t-lbl">Επίκεντρο (επιφάνεια)</text>
  <line x1="188" y1="192" x2="262" y2="204" stroke="#1e293b" stroke-width="1.2"/>
  <text x="266" y="206" class="t-lbl">Υπόκεντρο</text>
  <text x="266" y="219" class="t-sm">(Εστία σεισμού)</text>
  <text x="54" y="138" class="t-lbl" fill="#b91c1c">Επίπεδο</text>
  <text x="54" y="151" class="t-lbl" fill="#b91c1c">ρήγματος</text>
  <text x="54" y="254" class="t-sm">Σεισμικά κύματα (P &amp; S)</text>
  <text x="190" y="142" class="t-sm">Εστιακό βάθος (h)</text>
'''
    write_svg("geo_earthquake_waves.svg", body)


# 5. Fault types
def make_fault_types():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Τύποι Τεκτονικών Ρηγμάτων</text>
  <!-- Normal fault -->
  <g transform="translate(14,42)">
    <rect width="128" height="236" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="64" y="20" text-anchor="middle" class="t-sub">Κανονικό Ρήγμα</text>
    <polygon points="14,96 70,96 54,176 14,176" fill="#d97706" opacity="0.75" stroke="#1e293b"/>
    <polygon points="14,122 65,122 60,146 14,146" fill="#fef08a" opacity="0.8"/>
    <polygon points="66,118 114,118 114,194 50,194" fill="#b45309" opacity="0.75" stroke="#1e293b"/>
    <polygon points="61,144 114,144 114,168 56,168" fill="#fef08a" opacity="0.8"/>
    <line x1="42" y1="68" x2="14" y2="68" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-red)"/>
    <line x1="86" y1="68" x2="114" y2="68" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-red)"/>
    <text x="64" y="216" text-anchor="middle" class="t-sm">Δυνάμεις εφελκυσμού</text>
    <text x="64" y="228" text-anchor="middle" class="t-sm">(επιμήκυνση φλοιού)</text>
  </g>
  <!-- Reverse fault -->
  <g transform="translate(156,42)">
    <rect width="128" height="236" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="64" y="20" text-anchor="middle" class="t-sub">Ανάστροφο Ρήγμα</text>
    <polygon points="14,118 68,118 52,194 14,194" fill="#d97706" opacity="0.75" stroke="#1e293b"/>
    <polygon points="14,144 62,144 57,168 14,168" fill="#fef08a" opacity="0.8"/>
    <polygon points="72,94 114,94 114,174 56,174" fill="#b45309" opacity="0.75" stroke="#1e293b"/>
    <polygon points="67,120 114,120 114,144 62,144" fill="#fef08a" opacity="0.8"/>
    <line x1="14" y1="68" x2="44" y2="68" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-blue)"/>
    <line x1="114" y1="68" x2="84" y2="68" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-blue)"/>
    <text x="64" y="216" text-anchor="middle" class="t-sm">Δυνάμεις συμπίεσης</text>
    <text x="64" y="228" text-anchor="middle" class="t-sm">(βράχυνση φλοιού)</text>
  </g>
  <!-- Strike-slip fault -->
  <g transform="translate(298,42)">
    <rect width="128" height="236" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="64" y="20" text-anchor="middle" class="t-sub">Οριζόντιας Μετατόπισης</text>
    <polygon points="16,74 62,74 62,184 16,184" fill="#d97706" opacity="0.75" stroke="#1e293b"/>
    <polygon points="66,94 112,94 112,196 66,196" fill="#b45309" opacity="0.75" stroke="#1e293b"/>
    <line x1="64" y1="64" x2="64" y2="202" stroke="#dc2626" stroke-width="2" stroke-dasharray="4,3"/>
    <line x1="38" y1="154" x2="38" y2="104" stroke="#1e293b" stroke-width="2.2" marker-end="url(#arr-dark)"/>
    <line x1="90" y1="114" x2="90" y2="164" stroke="#1e293b" stroke-width="2.2" marker-end="url(#arr-dark)"/>
    <text x="64" y="216" text-anchor="middle" class="t-sm">Διατμητικές δυνάμεις</text>
    <text x="64" y="228" text-anchor="middle" class="t-sm">(π.χ. Άγιος Ανδρέας)</text>
  </g>
'''
    write_svg("geo_fault_types.svg", body)


# 6. Rock cycle
def make_rock_cycle():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Ο Κύκλος των Πετρωμάτων</text>
  <!-- Nodes -->
  <rect x="155" y="42" width="130" height="38" rx="19" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>
  <text x="220" y="65" text-anchor="middle" class="t-white">Μάγμα</text>

  <rect x="292" y="130" width="132" height="44" rx="10" fill="#f97316" stroke="#9a3412" stroke-width="1.5"/>
  <text x="358" y="150" text-anchor="middle" class="t-white">Πυριγενή</text>
  <text x="358" y="164" text-anchor="middle" class="t-white" font-size="9">(π.χ. γρανίτης, βασάλτης)</text>

  <rect x="155" y="236" width="130" height="44" rx="10" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
  <text x="220" y="256" text-anchor="middle" class="t-lbl">Ιζηματογενή</text>
  <text x="220" y="269" text-anchor="middle" class="t-sm">(ασβεστόλιθος, ψαμμίτης)</text>

  <rect x="16" y="130" width="132" height="44" rx="10" fill="#8b5cf6" stroke="#5b21b6" stroke-width="1.5"/>
  <text x="82" y="150" text-anchor="middle" class="t-white">Μεταμορφωμένα</text>
  <text x="82" y="164" text-anchor="middle" class="t-white" font-size="9">(μάρμαρο, σχιστόλιθος)</text>

  <!-- Curved arrows -->
  <path d="M288,65 Q348,80 356,126" fill="none" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="348" y="88" class="t-sm">Ψύξη &amp;</text>
  <text x="348" y="100" class="t-sm">στερεοποίηση</text>

  <path d="M354,176 Q344,234 290,254" fill="none" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="336" y="222" class="t-sm">Αποσάθρωση,</text>
  <text x="336" y="234" class="t-sm">διάβρωση &amp; ιζηματογένεση</text>

  <path d="M152,254 Q96,236 86,178" fill="none" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="20" y="222" class="t-sm">Υψηλή πίεση</text>
  <text x="20" y="234" class="t-sm">&amp; θερμοκρασία</text>

  <path d="M84,126 Q94,78 150,65" fill="none" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-red)"/>
  <text x="48" y="88" class="t-sm" fill="#b91c1c">Τήξη</text>

  <!-- Cross arrows -->
  <path d="M290,152 L154,152" fill="none" stroke="#64748b" stroke-width="1.4" stroke-dasharray="4,3" marker-end="url(#arr-dark)"/>
  <text x="222" y="146" text-anchor="middle" class="t-sm">Πίεση &amp; Θερμοκρασία</text>
'''
    write_svg("geo_rock_cycle.svg", body)


# 7. Latitude & Longitude
def make_lat_lon():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Γεωγραφικές Συντεταγμένες (Πλάτος &amp; Μήκος)</text>
  <!-- Left: Latitude -->
  <g transform="translate(115,160)">
    <circle r="84" fill="#eff6ff" stroke="#1e3a8a" stroke-width="1.8"/>
    <ellipse cx="0" cy="0" rx="84" ry="20" fill="none" stroke="#dc2626" stroke-width="2.2"/>
    <ellipse cx="0" cy="-34" rx="76" ry="16" fill="none" stroke="#2563eb" stroke-width="1.3"/>
    <ellipse cx="0" cy="-62" rx="56" ry="11" fill="none" stroke="#2563eb" stroke-width="1.3"/>
    <ellipse cx="0" cy="34" rx="76" ry="16" fill="none" stroke="#2563eb" stroke-width="1.3"/>
    <ellipse cx="0" cy="62" rx="56" ry="11" fill="none" stroke="#2563eb" stroke-width="1.3"/>
    <line x1="0" y1="-92" x2="0" y2="92" stroke="#475569" stroke-width="1.2" stroke-dasharray="4,3"/>
    <text x="0" y="-96" text-anchor="middle" class="t-lbl">Β. Πόλος (90° Β)</text>
    <text x="0" y="106" text-anchor="middle" class="t-lbl">Ν. Πόλος (90° Ν)</text>
    <text x="0" y="122" text-anchor="middle" class="t-sub">Παράλληλοι (Πλάτος φ)</text>
    <text x="0" y="4" text-anchor="middle" class="t-sm" fill="#b91c1c">Ισημερινός 0°</text>
  </g>
  <!-- Right: Longitude -->
  <g transform="translate(325,160)">
    <circle r="84" fill="#eff6ff" stroke="#1e3a8a" stroke-width="1.8"/>
    <line x1="0" y1="-84" x2="0" y2="84" stroke="#dc2626" stroke-width="2.2"/>
    <ellipse cx="0" cy="0" rx="28" ry="84" fill="none" stroke="#2563eb" stroke-width="1.3"/>
    <ellipse cx="0" cy="0" rx="58" ry="84" fill="none" stroke="#2563eb" stroke-width="1.3"/>
    <line x1="-84" y1="0" x2="84" y2="0" stroke="#94a3b8" stroke-width="1.1" stroke-dasharray="4,3"/>
    <text x="0" y="-96" text-anchor="middle" class="t-lbl">Μεσημβρινός Greenwich (0°)</text>
    <text x="-58" y="104" text-anchor="middle" class="t-sm">Δυτικό (Δ)</text>
    <text x="58" y="104" text-anchor="middle" class="t-sm">Ανατολικό (Α)</text>
    <text x="0" y="122" text-anchor="middle" class="t-sub">Μεσημβρινοί (Μήκος λ)</text>
  </g>
'''
    write_svg("geo_latitude_longitude.svg", body)


# 8. Earth seasons
def make_seasons():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Εποχές της Γης &amp; Κλίση Άξονα (23,5°)</text>
  <!-- Orbit ellipse -->
  <ellipse cx="220" cy="158" rx="154" ry="86" fill="none" stroke="#64748b" stroke-width="1.5" stroke-dasharray="6,4"/>
  <!-- Sun -->
  <circle cx="220" cy="158" r="24" fill="url(#sun-grad)" stroke="#d97706" stroke-width="1.5"/>
  <text x="220" y="162" text-anchor="middle" class="t-lbl">Ήλιος</text>
  <!-- 4 Earth positions with tilted axis 23.5 deg -->
  <!-- Left: Summer Solstice (June 21) -->
  <g transform="translate(66,158)">
    <circle r="16" fill="url(#earth-grad)" stroke="#1e293b" stroke-width="1.2"/>
    <line x1="-10" y1="22" x2="10" y2="-22" stroke="#dc2626" stroke-width="1.8"/>
    <text x="0" y="-30" text-anchor="middle" class="t-lbl">21 Ιουνίου</text>
    <text x="0" y="38" text-anchor="middle" class="t-sm">Θερινό Ηλιοστάσιο</text>
  </g>
  <!-- Right: Winter Solstice (Dec 21) -->
  <g transform="translate(374,158)">
    <circle r="16" fill="url(#earth-grad)" stroke="#1e293b" stroke-width="1.2"/>
    <line x1="-10" y1="22" x2="10" y2="-22" stroke="#dc2626" stroke-width="1.8"/>
    <text x="0" y="-30" text-anchor="middle" class="t-lbl">21 Δεκεμβρίου</text>
    <text x="0" y="38" text-anchor="middle" class="t-sm">Χειμερινό Ηλιοστάσιο</text>
  </g>
  <!-- Top: Spring Equinox (Mar 21) -->
  <g transform="translate(220,72)">
    <circle r="15" fill="url(#earth-grad)" stroke="#1e293b" stroke-width="1.2"/>
    <line x1="-9" y1="20" x2="9" y2="-20" stroke="#dc2626" stroke-width="1.8"/>
    <text x="0" y="-24" text-anchor="middle" class="t-lbl">21 Μαρτίου — Εαρινή Ισημερία</text>
  </g>
  <!-- Bottom: Autumn Equinox (Sep 23) -->
  <g transform="translate(220,244)">
    <circle r="15" fill="url(#earth-grad)" stroke="#1e293b" stroke-width="1.2"/>
    <line x1="-9" y1="20" x2="9" y2="-20" stroke="#dc2626" stroke-width="1.8"/>
    <text x="0" y="36" text-anchor="middle" class="t-lbl">23 Σεπτεμβρίου — Φθινοπωρινή Ισημερία</text>
  </g>
  <text x="220" y="200" text-anchor="middle" class="t-sm">Κλίση άξονα = 23,5° (Β. Ημισφαίριο)</text>
'''
    write_svg("geo_earth_seasons.svg", body)


# 9. Moon phases
def make_moon_phases():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Φάσεις της Σελήνης (29,5 ημέρες)</text>
  <rect x="16" y="34" width="408" height="250" rx="12" fill="#0f172a"/>
  <!-- Sun rays from right -->
  <line x1="412" y1="90" x2="378" y2="90" stroke="#facc15" stroke-width="2" marker-end="url(#arr-amber)"/>
  <line x1="412" y1="158" x2="378" y2="158" stroke="#facc15" stroke-width="2" marker-end="url(#arr-amber)"/>
  <line x1="412" y1="226" x2="378" y2="226" stroke="#facc15" stroke-width="2" marker-end="url(#arr-amber)"/>
  <text x="396" y="68" text-anchor="middle" class="t-white" fill="#fde047">Ήλιος</text>
  <!-- Orbit -->
  <circle cx="205" cy="158" r="82" fill="none" stroke="#475569" stroke-width="1.3" stroke-dasharray="4,4"/>
  <!-- Earth -->
  <circle cx="205" cy="158" r="22" fill="url(#earth-grad)" stroke="#93c5fd" stroke-width="1.4"/>
  <text x="205" y="162" text-anchor="middle" class="t-white">Γη</text>
  <!-- 4 main moon phases -->
  <!-- Right: New Moon -->
  <circle cx="287" cy="158" r="14" fill="#334155" stroke="#94a3b8" stroke-width="1.3"/>
  <text x="328" y="148" text-anchor="middle" class="t-white" font-size="9.5">Νέα</text>
  <text x="328" y="160" text-anchor="middle" class="t-white" font-size="9.5">Σελήνη</text>
  <!-- Top: First Quarter -->
  <circle cx="205" cy="76" r="14" fill="#334155" stroke="#94a3b8" stroke-width="1.3"/>
  <path d="M205,62 A14,14 0 0,1 205,90 Z" fill="#fef08a"/>
  <text x="205" y="54" text-anchor="middle" class="t-white" font-size="9.5">Πρώτο Τέταρτο</text>
  <!-- Left: Full Moon -->
  <circle cx="123" cy="158" r="14" fill="#fef08a" stroke="#fde047" stroke-width="1.3"/>
  <text x="68" y="162" text-anchor="middle" class="t-white" font-size="9.5">Πανσέληνος</text>
  <!-- Bottom: Last Quarter -->
  <circle cx="205" cy="240" r="14" fill="#334155" stroke="#94a3b8" stroke-width="1.3"/>
  <path d="M205,226 A14,14 0 0,0 205,254 Z" fill="#fef08a"/>
  <text x="205" y="272" text-anchor="middle" class="t-white" font-size="9.5">Τελευταίο Τέταρτο</text>
'''
    write_svg("geo_moon_phases.svg", body)


# 10. Solar & Lunar Eclipses
def make_eclipses():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Έκλειψη Ηλίου &amp; Έκλειψη Σελήνης</text>
  <!-- Top: Solar Eclipse -->
  <rect x="18" y="36" width="404" height="112" rx="10" fill="#0f172a"/>
  <text x="32" y="54" class="t-white" fill="#fde047">1. Έκλειψη Ηλίου (Ήλιος — Σελήνη — Γη)</text>
  <circle cx="72" cy="96" r="24" fill="url(#sun-grad)"/>
  <!-- Shadow cone -->
  <polygon points="72,72 225,88 340,96 225,104 72,120" fill="#fde047" opacity="0.16"/>
  <polygon points="225,88 340,96 225,104" fill="#020617" opacity="0.85"/>
  <circle cx="225" cy="96" r="8" fill="#cbd5e1" stroke="#fff" stroke-width="1"/>
  <circle cx="348" cy="96" r="22" fill="url(#earth-grad)"/>
  <text x="72" y="136" text-anchor="middle" class="t-white" font-size="9">Ήλιος</text>
  <text x="225" y="124" text-anchor="middle" class="t-white" font-size="9">Σελήνη</text>
  <text x="348" y="136" text-anchor="middle" class="t-white" font-size="9">Γη</text>
  <text x="282" y="84" text-anchor="middle" class="t-white" font-size="8.5">Σκιά (Ολική)</text>

  <!-- Bottom: Lunar Eclipse -->
  <rect x="18" y="162" width="404" height="122" rx="10" fill="#0f172a"/>
  <text x="32" y="180" class="t-white" fill="#93c5fd">2. Έκλειψη Σελήνης (Ήλιος — Γη — Σελήνη)</text>
  <circle cx="72" cy="226" r="24" fill="url(#sun-grad)"/>
  <polygon points="225,204 378,218 378,234 225,248" fill="#020617" opacity="0.88"/>
  <circle cx="225" cy="226" r="22" fill="url(#earth-grad)"/>
  <circle cx="345" cy="226" r="9" fill="#b91c1c" stroke="#fca5a5" stroke-width="1"/>
  <text x="72" y="268" text-anchor="middle" class="t-white" font-size="9">Ήλιος</text>
  <text x="225" y="268" text-anchor="middle" class="t-white" font-size="9">Γη</text>
  <text x="345" y="256" text-anchor="middle" class="t-white" font-size="9">Σελήνη (στη σκιά)</text>
'''
    write_svg("geo_eclipses.svg", body)


# 11. Atmosphere layers
def make_atmosphere():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Στρώματα της Ατμόσφαιρας της Γης</text>
  <rect x="28" y="38" width="384" height="44" fill="#1e1b4b"/>
  <rect x="28" y="82" width="384" height="46" fill="#1e3a8a"/>
  <rect x="28" y="128" width="384" height="46" fill="#2563eb"/>
  <rect x="28" y="174" width="384" height="50" fill="#60a5fa"/>
  <rect x="28" y="224" width="384" height="50" fill="#bae6fd"/>
  <!-- Ozone band -->
  <rect x="28" y="192" width="384" height="8" fill="#34d399" opacity="0.7"/>
  <!-- Ground -->
  <path d="M28,274 Q220,256 412,274 L412,284 L28,284 Z" fill="#15803d"/>
  <!-- Labels -->
  <text x="42" y="64" class="t-white">Εξόσφαιρα (&gt; 500 km) — Δορυφόροι</text>
  <text x="42" y="109" class="t-white">Θερμόσφαιρα (85–500 km) — Σέλας, ISS</text>
  <text x="42" y="155" class="t-white">Μεσόσφαιρα (50–85 km) — Καύση μετεωριτών</text>
  <text x="42" y="190" class="t-white">Στρατόσφαιρα (12–50 km)</text>
  <text x="242" y="200" class="t-lbl" fill="#064e3b">Στιβάδα Όζοντος (O₃)</text>
  <text x="42" y="250" class="t-lbl">Τροπόσφαιρα (0–12 km) — Καιρικά φαινόμενα &amp; σύννεφα</text>
'''
    write_svg("geo_atmosphere_layers.svg", body)


# 12. Climate zones
def make_climate_zones():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Κλιματικές Ζώνες της Γης</text>
  <g transform="translate(155,160)">
    <clipPath id="globe-clip"><circle r="106"/></clipPath>
    <g clip-path="url(#globe-clip)">
      <rect x="-110" y="-110" width="220" height="34" fill="#bae6fd"/>
      <rect x="-110" y="-76" width="220" height="44" fill="#86efac"/>
      <rect x="-110" y="-32" width="220" height="64" fill="#fde047"/>
      <rect x="-110" y="32" width="220" height="44" fill="#86efac"/>
      <rect x="-110" y="76" width="220" height="34" fill="#bae6fd"/>
      <line x1="-110" y1="0" x2="110" y2="0" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
      <line x1="-110" y1="-32" x2="110" y2="-32" stroke="#d97706" stroke-width="1.2"/>
      <line x1="-110" y1="32" x2="110" y2="32" stroke="#d97706" stroke-width="1.2"/>
      <line x1="-110" y1="-76" x2="110" y2="-76" stroke="#0284c7" stroke-width="1.2"/>
      <line x1="-110" y1="76" x2="110" y2="76" stroke="#0284c7" stroke-width="1.2"/>
    </g>
    <circle r="106" fill="none" stroke="#1e293b" stroke-width="2"/>
    <text x="0" y="-86" text-anchor="middle" class="t-sm">Πολική</text>
    <text x="0" y="-50" text-anchor="middle" class="t-lbl">Β. Εύκρατη</text>
    <text x="0" y="-6" text-anchor="middle" class="t-lbl">Τροπική Ζώνη</text>
    <text x="0" y="14" text-anchor="middle" class="t-sm" fill="#b91c1c">Ισημερινός 0°</text>
    <text x="0" y="58" text-anchor="middle" class="t-lbl">Ν. Εύκρατη</text>
    <text x="0" y="94" text-anchor="middle" class="t-sm">Πολική</text>
  </g>
  <!-- Legend right -->
  <text x="278" y="86" class="t-lbl">66,5° Β — Αρκτικός Κύκλος</text>
  <text x="278" y="128" class="t-lbl">23,5° Β — Τροπικός Καρκίνου</text>
  <text x="278" y="164" class="t-lbl" fill="#b91c1c">0° — Ισημερινός</text>
  <text x="278" y="198" class="t-lbl">23,5° Ν — Τροπικός Αιγόκερω</text>
  <text x="278" y="238" class="t-lbl">66,5° Ν — Ανταρκτικός Κύκλος</text>
'''
    write_svg("geo_climate_zones.svg", body)


# 13. Water cycle
def make_water_cycle():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Ο Κύκλος του Νερού (Υδρολογικός Κύκλος)</text>
  <rect x="20" y="34" width="400" height="248" rx="10" fill="url(#sky-grad)" stroke="#cbd5e1"/>
  <!-- Sun -->
  <circle cx="70" cy="74" r="22" fill="url(#sun-grad)"/>
  <!-- Clouds -->
  <path d="M168,84 Q158,66 178,64 Q192,52 212,64 Q230,62 232,78 Q224,90 202,88 Z" fill="#ffffff" stroke="#94a3b8"/>
  <path d="M294,88 Q284,70 304,66 Q320,54 342,66 Q362,64 364,82 Q354,94 328,92 Z" fill="#cbd5e1" stroke="#64748b"/>
  <!-- Mountain & land -->
  <polygon points="210,230 330,118 420,170 420,282 20,282 20,230" fill="#86efac" stroke="#15803d" stroke-width="1.3"/>
  <polygon points="296,150 330,118 364,138 342,148 326,138" fill="#ffffff"/>
  <!-- Sea -->
  <rect x="20" y="224" width="210" height="58" fill="url(#sea-grad)"/>
  <!-- Underground aquifer -->
  <path d="M210,264 Q300,256 410,266" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="6,4" marker-end="url(#arr-blue)"/>
  <!-- Rain -->
  <g stroke="#2563eb" stroke-width="1.8">
    <line x1="308" y1="98" x2="302" y2="118"/>
    <line x1="326" y1="98" x2="320" y2="118"/>
    <line x1="344" y1="98" x2="338" y2="118"/>
  </g>
  <!-- Evaporation arrows -->
  <path d="M78,218 Q70,180 82,142" fill="none" stroke="#0284c7" stroke-width="2" marker-end="url(#arr-blue)"/>
  <path d="M118,218 Q110,180 122,142" fill="none" stroke="#0284c7" stroke-width="2" marker-end="url(#arr-blue)"/>
  <!-- Wind arrow -->
  <line x1="238" y1="74" x2="284" y2="74" stroke="#475569" stroke-width="1.8" marker-end="url(#arr-dark)"/>
  <!-- Surface runoff -->
  <path d="M312,162 Q278,196 234,224" fill="none" stroke="#0369a1" stroke-width="2.5" marker-end="url(#arr-blue)"/>
  <!-- Labels -->
  <text x="98" y="134" text-anchor="middle" class="t-lbl">Εξάτμιση</text>
  <text x="198" y="54" text-anchor="middle" class="t-lbl">Συμπύκνωση</text>
  <text x="330" y="54" text-anchor="middle" class="t-lbl">Βροχόπτωση</text>
  <text x="278" y="218" class="t-lbl">Απορροή</text>
  <text x="318" y="254" class="t-sm">Διήθηση &amp; Υπόγεια νερά</text>
  <text x="115" y="256" text-anchor="middle" class="t-white">Θάλασσα / Ωκεανός</text>
'''
    write_svg("geo_water_cycle.svg", body)


# 14. Greenhouse effect
def make_greenhouse():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Φαινόμενο του Θερμοκηπίου</text>
  <rect x="20" y="34" width="400" height="248" rx="10" fill="#eff6ff" stroke="#cbd5e1"/>
  <!-- Atmosphere dome -->
  <path d="M20,126 Q220,76 420,126 L420,152 Q220,104 20,152 Z" fill="#93c5fd" opacity="0.55"/>
  <text x="220" y="114" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Αέρια Θερμοκηπίου (CO₂, CH₄, H₂O)</text>
  <!-- Earth surface -->
  <path d="M20,240 Q220,218 420,240 L420,282 L20,282 Z" fill="#22c55e" stroke="#15803d"/>
  <text x="220" y="266" text-anchor="middle" class="t-white">Επιφάνεια της Γης</text>
  <!-- Sun -->
  <circle cx="64" cy="68" r="22" fill="url(#sun-grad)"/>
  <!-- Incoming solar radiation -->
  <line x1="88" y1="84" x2="152" y2="226" stroke="#f59e0b" stroke-width="2.6" marker-end="url(#arr-amber)"/>
  <text x="86" y="178" class="t-lbl" fill="#b45309">Ηλιακή</text>
  <text x="86" y="191" class="t-lbl" fill="#b45309">ακτινοβολία</text>
  <!-- Reflected part -->
  <line x1="112" y1="120" x2="158" y2="62" stroke="#f59e0b" stroke-width="1.6" stroke-dasharray="4,3" marker-end="url(#arr-amber)"/>
  <text x="164" y="64" class="t-sm">Ανάκλαση</text>
  <!-- Outgoing IR trapped -->
  <line x1="210" y1="226" x2="255" y2="128" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <line x1="262" y1="128" x2="310" y2="226" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <line x1="262" y1="124" x2="296" y2="56" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="4,3" marker-end="url(#arr-red)"/>
  <text x="304" y="66" class="t-sm" fill="#b91c1c">Διαφυγή στο διάστημα</text>
  <text x="348" y="182" text-anchor="middle" class="t-lbl" fill="#b91c1c">Παγίδευση</text>
  <text x="348" y="195" text-anchor="middle" class="t-lbl" fill="#b91c1c">θερμότητας (IR)</text>
'''
    write_svg("geo_greenhouse_effect.svg", body)


# 15. Contour lines & topographic profile
def make_contour_lines():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Ισοϋψείς Καμπύλες &amp; Τοπογραφικό Προφίλ</text>
  <!-- Top: contour map -->
  <rect x="28" y="34" width="384" height="114" rx="8" fill="#fefce8" stroke="#cbd5e1"/>
  <ellipse cx="185" cy="92" rx="135" ry="46" fill="none" stroke="#92400e" stroke-width="1.4"/>
  <ellipse cx="175" cy="92" rx="95" ry="34" fill="none" stroke="#92400e" stroke-width="1.4"/>
  <ellipse cx="164" cy="92" rx="56" ry="22" fill="none" stroke="#92400e" stroke-width="1.4"/>
  <ellipse cx="154" cy="92" rx="24" ry="10" fill="none" stroke="#92400e" stroke-width="1.4"/>
  <text x="154" y="95" text-anchor="middle" class="t-sm">400m</text>
  <text x="210" y="95" class="t-sm">300</text>
  <text x="258" y="95" class="t-sm">200</text>
  <text x="306" y="95" class="t-sm">100m</text>
  <!-- Section line A-B -->
  <line x1="42" y1="92" x2="338" y2="92" stroke="#2563eb" stroke-width="1.4" stroke-dasharray="5,3"/>
  <text x="34" y="95" class="t-lbl" fill="#2563eb">Α</text>
  <text x="344" y="95" class="t-lbl" fill="#2563eb">Β</text>
  <text x="366" y="54" class="t-sm">Κάτοψη</text>
  <text x="366" y="66" class="t-sm">(Χάρτης)</text>
  <!-- Bottom: profile -->
  <rect x="28" y="162" width="384" height="120" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
  <line x1="48" y1="262" x2="390" y2="262" stroke="#64748b" stroke-width="1.4"/>
  <line x1="48" y1="262" x2="48" y2="174" stroke="#64748b" stroke-width="1.4"/>
  <path d="M50,262 Q95,245 128,192 Q154,174 182,196 Q240,224 320,262 Z" fill="#d97706" opacity="0.35" stroke="#92400e" stroke-width="2"/>
  <text x="38" y="184" text-anchor="end" class="t-sm">400</text>
  <text x="38" y="206" text-anchor="end" class="t-sm">300</text>
  <text x="38" y="228" text-anchor="end" class="t-sm">200</text>
  <text x="38" y="250" text-anchor="end" class="t-sm">100</text>
  <text x="90" y="246" class="t-sm">Απότομη κλίση</text>
  <text x="234" y="246" class="t-sm">Ήπια κλίση</text>
  <text x="366" y="182" class="t-sm">Τομή Α–Β</text>
'''
    write_svg("geo_contour_lines.svg", body)


# 16. Compass rose
def make_compass():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Ανεμολόγιο &amp; Σημεία του Ορίζοντα</text>
  <g transform="translate(220,162)">
    <circle r="102" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
    <circle r="86" fill="none" stroke="#94a3b8" stroke-width="1" stroke-dasharray="3,3"/>
    <!-- Intercardinal points -->
    <polygon points="0,0 12,-12 58,-58 0,-18" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
    <polygon points="0,0 12,12 58,58 18,0" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
    <polygon points="0,0 -12,12 -58,58 0,18" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
    <polygon points="0,0 -12,-12 -58,-58 -18,0" fill="#cbd5e1" stroke="#475569" stroke-width="1"/>
    <!-- Cardinal points -->
    <polygon points="0,-86 14,0 0,0" fill="#dc2626" stroke="#1e293b" stroke-width="1"/>
    <polygon points="0,-86 -14,0 0,0" fill="#f87171" stroke="#1e293b" stroke-width="1"/>
    <polygon points="0,86 14,0 0,0" fill="#1e293b"/>
    <polygon points="0,86 -14,0 0,0" fill="#64748b"/>
    <polygon points="86,0 0,-14 0,0" fill="#2563eb"/>
    <polygon points="86,0 0,14 0,0" fill="#93c5fd"/>
    <polygon points="-86,0 0,-14 0,0" fill="#2563eb"/>
    <polygon points="-86,0 0,14 0,0" fill="#93c5fd"/>
    <circle r="6" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
    <!-- Cardinal labels -->
    <text x="0" y="-108" text-anchor="middle" class="t-title" fill="#dc2626">Β (Βορράς • 0°)</text>
    <text x="0" y="122" text-anchor="middle" class="t-title">Ν (Νότος • 180°)</text>
    <text x="114" y="4" class="t-title" fill="#2563eb">Α (90°)</text>
    <text x="-114" y="4" text-anchor="end" class="t-title" fill="#2563eb">Δ (270°)</text>
    <!-- Intercardinal labels -->
    <text x="68" y="-64" class="t-lbl">ΒΑ</text>
    <text x="68" y="72" class="t-lbl">ΝΑ</text>
    <text x="-82" y="72" class="t-lbl">ΝΔ</text>
    <text x="-82" y="-64" class="t-lbl">ΒΔ</text>
  </g>
'''
    write_svg("geo_compass_rose.svg", body)


# 17. River course (sources, meanders, delta)
def make_river_course():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Ο Ρους ενός Ποταμού (Πηγές → Μαίανδροι → Δέλτα)</text>
  <rect x="20" y="34" width="400" height="248" rx="10" fill="#ecfdf5" stroke="#cbd5e1"/>
  <!-- Mountains -->
  <polygon points="20,140 68,58 124,140" fill="#94a3b8" stroke="#475569"/>
  <polygon points="88,140 132,76 180,140" fill="#cbd5e1" stroke="#475569"/>
  <!-- Sea on right -->
  <path d="M342,34 Q326,155 344,282 L420,282 L420,34 Z" fill="url(#sea-grad)"/>
  <!-- River winding -->
  <path d="M88,116 Q116,150 144,162 Q178,176 168,208 Q156,238 206,226 Q254,214 246,168 Q238,136 286,154 Q316,166 336,168" fill="none" stroke="#0284c7" stroke-width="7" stroke-linecap="round"/>
  <!-- Delta branches -->
  <path d="M322,166 Q344,146 364,136" fill="none" stroke="#0284c7" stroke-width="3.5"/>
  <path d="M326,168 L368,168" fill="none" stroke="#0284c7" stroke-width="3.5"/>
  <path d="M322,170 Q344,192 362,204" fill="none" stroke="#0284c7" stroke-width="3.5"/>
  <!-- Tributary -->
  <path d="M138,118 Q152,148 164,168" fill="none" stroke="#38bdf8" stroke-width="3.5"/>
  <!-- Labels -->
  <text x="40" y="54" class="t-lbl">Πηγές</text>
  <text x="150" y="114" class="t-sm">Παραπόταμος</text>
  <text x="218" y="254" text-anchor="middle" class="t-lbl">Μαίανδροι (Μέσος ρους)</text>
  <text x="380" y="116" text-anchor="middle" class="t-white">Θάλασσα</text>
  <text x="308" y="226" text-anchor="middle" class="t-lbl">Δέλτα &amp;</text>
  <text x="308" y="239" text-anchor="middle" class="t-lbl">Εκβολή</text>
'''
    write_svg("geo_river_course.svg", body)


# 18. Karst cave
def make_karst_cave():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Καρστικό Σπήλαιο (Σταλακτίτες &amp; Σταλαγμίτες)</text>
  <rect x="20" y="34" width="400" height="248" rx="10" fill="#d6d3d1" stroke="#57534e"/>
  <!-- Surface grass -->
  <rect x="20" y="34" width="400" height="24" rx="4" fill="#86efac"/>
  <!-- Cave chamber -->
  <path d="M62,158 Q74,98 188,92 Q328,88 378,156 Q388,236 280,248 Q128,254 68,224 Z" fill="#1e293b"/>
  <!-- Water table -->
  <path d="M126,232 Q216,226 320,234 Q282,250 156,246 Z" fill="#0284c7" opacity="0.85"/>
  <!-- Stalactites (ceiling) -->
  <polygon points="124,104 134,104 129,154" fill="#fde68a"/>
  <polygon points="168,94 180,94 174,142" fill="#fde68a"/>
  <polygon points="222,92 236,92 229,156" fill="#fde68a"/>
  <!-- Column (joined) -->
  <polygon points="274,94 290,94 286,232 278,232" fill="#fcd34d"/>
  <!-- Stalagmites (floor) -->
  <polygon points="164,234 184,234 174,186" fill="#f59e0b"/>
  <polygon points="218,234 240,234 229,182" fill="#f59e0b"/>
  <!-- Drip arrow -->
  <line x1="174" y1="58" x2="174" y2="90" stroke="#0284c7" stroke-width="2" stroke-dasharray="3,2" marker-end="url(#arr-blue)"/>
  <!-- Labels -->
  <text x="184" y="76" class="t-lbl" fill="#0369a1">Διήθηση νερού (CaCO₃)</text>
  <line x1="126" y1="136" x2="80" y2="124" stroke="#fff" stroke-width="1.2"/>
  <text x="84" y="138" class="t-white">Σταλακτίτης</text>
  <text x="150" y="216" class="t-white">Σταλαγμίτης</text>
  <text x="300" y="164" class="t-white">Κολόνα</text>
  <text x="220" y="272" text-anchor="middle" class="t-lbl">Ασβεστολιθικό πέτρωμα &amp; Υπόγειος υδροφορέας</text>
'''
    write_svg("geo_karst_cave.svg", body)


# 19. Sea & Land breeze
def make_sea_breeze():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Θαλάσσια &amp; Απόγειος Αύρα</text>
  <!-- Left: Day (Sea breeze) -->
  <g transform="translate(16,38)">
    <rect width="198" height="244" rx="10" fill="url(#sky-grad)" stroke="#cbd5e1"/>
    <text x="99" y="18" text-anchor="middle" class="t-sub">Ημέρα: Θαλάσσια Αύρα</text>
    <circle cx="164" cy="48" r="14" fill="url(#sun-grad)"/>
    <rect x="2" y="196" width="98" height="46" fill="url(#sea-grad)"/>
    <polygon points="100,196 196,174 196,242 100,242" fill="#d97706" opacity="0.65"/>
    <!-- Circulation arrows -->
    <line x1="48" y1="176" x2="146" y2="162" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-blue)"/>
    <line x1="158" y1="152" x2="158" y2="96" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
    <line x1="146" y1="88" x2="48" y2="88" stroke="#64748b" stroke-width="2" marker-end="url(#arr-dark)"/>
    <line x1="40" y1="98" x2="40" y2="164" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-blue)"/>
    <text x="50" y="224" text-anchor="middle" class="t-white">Ψυχρή θάλασσα</text>
    <text x="150" y="224" text-anchor="middle" class="t-lbl">Θερμή ξηρά</text>
  </g>
  <!-- Right: Night (Land breeze) -->
  <g transform="translate(226,38)">
    <rect width="198" height="244" rx="10" fill="#1e293b" stroke="#475569"/>
    <text x="99" y="18" text-anchor="middle" class="t-white">Νύχτα: Απόγειος Αύρα</text>
    <circle cx="164" cy="48" r="11" fill="#fef08a"/>
    <rect x="2" y="196" width="98" height="46" fill="#0369a1"/>
    <polygon points="100,196 196,174 196,242 100,242" fill="#78716c"/>
    <line x1="146" y1="162" x2="48" y2="176" stroke="#60a5fa" stroke-width="2.4" marker-end="url(#arr-blue)"/>
    <line x1="40" y1="164" x2="40" y2="98" stroke="#f87171" stroke-width="2.4" marker-end="url(#arr-red)"/>
    <line x1="50" y1="88" x2="146" y2="88" stroke="#cbd5e1" stroke-width="2" marker-end="url(#arr-dark)"/>
    <line x1="158" y1="98" x2="158" y2="154" stroke="#60a5fa" stroke-width="2" marker-end="url(#arr-blue)"/>
    <text x="50" y="224" text-anchor="middle" class="t-white">Θερμότερη θάλασσα</text>
    <text x="150" y="224" text-anchor="middle" class="t-white">Ψυχρή ξηρά</text>
  </g>
'''
    write_svg("geo_sea_land_breeze.svg", body)


# 20. Orographic rain & rain shadow
def make_orographic_rain():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Ορογραφικές Βροχοπτώσεις &amp; Ομβροσκιά</text>
  <rect x="20" y="34" width="400" height="248" rx="10" fill="url(#sky-grad)" stroke="#cbd5e1"/>
  <!-- Sea left -->
  <rect x="20" y="230" width="96" height="52" fill="url(#sea-grad)"/>
  <!-- Mountain -->
  <polygon points="116,282 116,230 226,102 332,230 420,230 420,282" fill="#a8a29e" stroke="#475569" stroke-width="1.5"/>
  <!-- Green windward slope -->
  <polygon points="116,230 226,102 226,230" fill="#4ade80" opacity="0.5"/>
  <!-- Dry leeward slope -->
  <polygon points="226,102 332,230 420,230 420,248 226,230" fill="#fde68a" opacity="0.65"/>
  <!-- Moist cloud & rain -->
  <path d="M126,116 Q116,96 138,94 Q158,80 184,96 Q204,96 204,114 Q192,126 156,124 Z" fill="#94a3b8" stroke="#475569"/>
  <g stroke="#2563eb" stroke-width="1.8">
    <line x1="142" y1="128" x2="136" y2="156"/>
    <line x1="162" y1="128" x2="156" y2="156"/>
    <line x1="182" y1="128" x2="176" y2="156"/>
  </g>
  <!-- Air flow arrows -->
  <path d="M46,204 Q100,192 146,144" fill="none" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-blue)"/>
  <path d="M242,102 Q296,138 358,196" fill="none" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <!-- Labels -->
  <text x="68" y="260" text-anchor="middle" class="t-white">Θάλασσα</text>
  <text x="86" y="176" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Υγρός αέρας</text>
  <text x="166" y="76" text-anchor="middle" class="t-lbl">Ψύξη &amp; Βροχή</text>
  <text x="332" y="138" text-anchor="middle" class="t-lbl" fill="#b91c1c">Θερμός, ξηρός</text>
  <text x="332" y="151" text-anchor="middle" class="t-lbl" fill="#b91c1c">αέρας (Ομβροσκιά)</text>
  <text x="170" y="256" text-anchor="middle" class="t-lbl">Προσήνεμη (υγρή)</text>
  <text x="330" y="256" text-anchor="middle" class="t-lbl">Υπήνεμη (ξηρή)</text>
'''
    write_svg("geo_orographic_rain.svg", body)


# 21. Ocean floor relief
def make_ocean_floor():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Ανάγλυφο του Θαλάσσιου Πυθμένα</text>
  <rect x="20" y="34" width="400" height="248" rx="10" fill="#e0f2fe" stroke="#cbd5e1"/>
  <!-- Ocean water -->
  <rect x="20" y="84" width="400" height="198" fill="url(#sea-grad)" opacity="0.72"/>
  <line x1="20" y1="84" x2="420" y2="84" stroke="#0284c7" stroke-width="2"/>
  <!-- Seabed profile -->
  <path d="M20,66 L76,72 L106,96 L138,194 L204,204 L234,142 L252,158 L270,142 L298,204 L334,204 L356,262 L380,196 L420,176 L420,282 L20,282 Z" fill="#78716c" stroke="#1e293b" stroke-width="1.6"/>
  <!-- Labels -->
  <text x="48" y="58" text-anchor="middle" class="t-lbl">Ήπειρος</text>
  <line x1="94" y1="90" x2="108" y2="62" stroke="#1e293b" stroke-width="1.1"/>
  <text x="112" y="60" class="t-sm">Υφαλοκρηπίδα</text>
  <line x1="126" y1="154" x2="94" y2="176" stroke="#fff" stroke-width="1.1"/>
  <text x="34" y="188" class="t-white">Υφαλοκλίτυς</text>
  <text x="172" y="226" text-anchor="middle" class="t-white">Αβυσσαία</text>
  <text x="172" y="238" text-anchor="middle" class="t-white">πεδιάδα</text>
  <line x1="252" y1="142" x2="252" y2="104" stroke="#fff" stroke-width="1.1"/>
  <text x="252" y="98" text-anchor="middle" class="t-lbl">Μεσοωκεάνια ράχη</text>
  <line x1="356" y1="258" x2="366" y2="116" stroke="#fff" stroke-width="1.1"/>
  <text x="366" y="110" text-anchor="middle" class="t-lbl">Ωκεάνια τάφρος</text>
'''
    write_svg("geo_ocean_floor.svg", body)


# 22. Time zones
def make_time_zones():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Ωριαίες Άτρακτοι (Ζώνες Ώρας • 360° ÷ 24 = 15°)</text>
  <rect x="20" y="42" width="400" height="206" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <!-- 9 representative bands -->
  <g>
    <rect x="28" y="58" width="42" height="140" fill="#dbeafe" stroke="#93c5fd"/>
    <rect x="70" y="58" width="42" height="140" fill="#eff6ff" stroke="#93c5fd"/>
    <rect x="112" y="58" width="42" height="140" fill="#dbeafe" stroke="#93c5fd"/>
    <rect x="154" y="58" width="42" height="140" fill="#eff6ff" stroke="#93c5fd"/>
    <rect x="196" y="58" width="48" height="140" fill="#fef08a" stroke="#eab308" stroke-width="1.8"/>
    <rect x="244" y="58" width="42" height="140" fill="#dcfce7" stroke="#86efac"/>
    <rect x="286" y="58" width="42" height="140" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.8"/>
    <rect x="328" y="58" width="42" height="140" fill="#dcfce7" stroke="#86efac"/>
    <rect x="370" y="58" width="42" height="140" fill="#bbf7d0" stroke="#86efac"/>
  </g>
  <!-- Labels -->
  <text x="49" y="76" text-anchor="middle" class="t-sm">UTC-4</text>
  <text x="91" y="76" text-anchor="middle" class="t-sm">UTC-3</text>
  <text x="133" y="76" text-anchor="middle" class="t-sm">UTC-2</text>
  <text x="175" y="76" text-anchor="middle" class="t-sm">UTC-1</text>
  <text x="220" y="76" text-anchor="middle" class="t-lbl">UTC 0</text>
  <text x="220" y="92" text-anchor="middle" class="t-sm">Λονδίνο</text>
  <text x="220" y="132" text-anchor="middle" class="t-lbl">12:00</text>
  <text x="265" y="76" text-anchor="middle" class="t-sm">UTC+1</text>
  <text x="265" y="132" text-anchor="middle" class="t-sm">13:00</text>
  <text x="307" y="76" text-anchor="middle" class="t-lbl" fill="#15803d">UTC+2</text>
  <text x="307" y="92" text-anchor="middle" class="t-sm" fill="#15803d">Ελλάδα</text>
  <text x="307" y="132" text-anchor="middle" class="t-lbl" fill="#15803d">14:00</text>
  <text x="349" y="76" text-anchor="middle" class="t-sm">UTC+3</text>
  <text x="349" y="132" text-anchor="middle" class="t-sm">15:00</text>
  <text x="391" y="76" text-anchor="middle" class="t-sm">UTC+4</text>
  <text x="391" y="132" text-anchor="middle" class="t-sm">16:00</text>
  <!-- Arrows West/East -->
  <line x1="184" y1="220" x2="62" y2="220" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-blue)"/>
  <text x="122" y="236" text-anchor="middle" class="t-sm" fill="#1d4ed8">Προς Δύση: −1 ώρα / 15°</text>
  <line x1="256" y1="220" x2="378" y2="220" stroke="#16a34a" stroke-width="2" marker-end="url(#arr-green)"/>
  <text x="318" y="236" text-anchor="middle" class="t-sm" fill="#15803d">Προς Ανατολή: +1 ώρα / 15°</text>
  <text x="220" y="274" text-anchor="middle" class="t-sm">Μεσημβρινός Greenwich (0°) — Διεθνής Γραμμή Ημερομηνίας (180°)</text>
'''
    write_svg("geo_time_zones.svg", body)


# 23. Greece simplified schematic relief map
def make_greece_map():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Σχηματικός Χάρτης &amp; Ανάγλυφο της Ελλάδας</text>
  <rect x="20" y="34" width="400" height="248" rx="10" fill="#bae6fd" stroke="#0284c7" stroke-width="1.3"/>
  <!-- Mainland Greece schematic silhouette -->
  <path d="M126,72 L182,76 L248,64 L304,54 L318,74 L274,88 L244,90 L226,112 L206,108 L194,132 L214,154 L236,174 L224,186 L196,176 L176,172 L198,198 L192,226 L168,224 L154,202 L144,182 L156,164 L132,148 L118,118 Z" fill="#86efac" stroke="#15803d" stroke-width="1.6"/>
  <!-- Pindus mountain range -->
  <path d="M138,94 L152,130 L166,158" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round" stroke-dasharray="6,4"/>
  <!-- Evia -->
  <path d="M214,142 L244,168 L238,176 L208,150 Z" fill="#86efac" stroke="#15803d" stroke-width="1.2"/>
  <!-- Crete -->
  <path d="M204,252 Q256,246 312,256 Q296,268 214,264 Z" fill="#86efac" stroke="#15803d" stroke-width="1.4"/>
  <!-- Ionian & Aegean islands dots -->
  <circle cx="106" cy="112" r="4" fill="#86efac" stroke="#15803d"/>
  <circle cx="122" cy="166" r="5" fill="#86efac" stroke="#15803d"/>
  <circle cx="294" cy="134" r="6" fill="#86efac" stroke="#15803d"/>
  <circle cx="268" cy="194" r="4" fill="#86efac" stroke="#15803d"/>
  <circle cx="332" cy="216" r="6" fill="#86efac" stroke="#15803d"/>
  <!-- Labels -->
  <text x="72" y="160" text-anchor="middle" class="t-lbl" fill="#0369a1">Ιόνιο</text>
  <text x="72" y="173" text-anchor="middle" class="t-lbl" fill="#0369a1">Πέλαγος</text>
  <text x="278" y="168" text-anchor="middle" class="t-lbl" fill="#0369a1">Αιγαίο</text>
  <text x="278" y="181" text-anchor="middle" class="t-lbl" fill="#0369a1">Πέλαγος</text>
  <text x="150" y="128" class="t-sm" fill="#78350f">Πίνδος</text>
  <text x="216" y="188" class="t-sm">Αθήνα</text>
  <text x="206" y="92" class="t-sm">Θεσ/νίκη</text>
  <text x="258" y="275" text-anchor="middle" class="t-lbl">Κρήτη</text>
  <text x="150" y="218" class="t-sm">Πελοπόννησος</text>
'''
    write_svg("geo_greece_relief_map.svg", body)


# 24. Soil profile & horizons
def make_soil_profile():
    body = '''
  <text x="220" y="22" text-anchor="middle" class="t-title">Εδαφικό Προφίλ &amp; Ορίζοντες Εδάφους</text>
  <!-- Grass & plant on top -->
  <rect x="46" y="54" width="184" height="14" fill="#22c55e" rx="3"/>
  <path d="M126,54 L126,34 M126,44 L116,36 M126,42 L136,34" stroke="#15803d" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Horizons -->
  <rect x="46" y="68" width="184" height="24" fill="#451a03"/>
  <rect x="46" y="92" width="184" height="44" fill="#78350f"/>
  <rect x="46" y="136" width="184" height="52" fill="#b45309"/>
  <rect x="46" y="188" width="184" height="44" fill="#a8a29e"/>
  <rect x="46" y="232" width="184" height="44" fill="#57534e"/>
  <!-- Roots & pebbles -->
  <path d="M126,68 Q122,94 114,116 M126,68 Q132,96 142,112" fill="none" stroke="#fef3c7" stroke-width="1.5"/>
  <circle cx="84" cy="208" r="6" fill="#78716c"/>
  <circle cx="146" cy="212" r="8" fill="#78716c"/>
  <circle cx="196" cy="206" r="6" fill="#78716c"/>
  <!-- Horizon letters & descriptions -->
  <text x="60" y="84" class="t-white">O</text>
  <text x="242" y="84" class="t-lbl">Ορίζοντας O — Χούμος (οργανική ύλη)</text>
  <text x="60" y="118" class="t-white">A</text>
  <text x="242" y="116" class="t-lbl">Ορίζοντας A — Επιφανειακό έδαφος (ρίζες)</text>
  <text x="60" y="166" class="t-white">B</text>
  <text x="242" y="164" class="t-lbl">Ορίζοντας B — Υπέδαφος (άργιλος, ορυκτά)</text>
  <text x="60" y="214" class="t-lbl">C</text>
  <text x="242" y="214" class="t-lbl">Ορίζοντας C — Αποσαθρωμένο πέτρωμα</text>
  <text x="60" y="258" class="t-white">R</text>
  <text x="242" y="258" class="t-lbl">Μητρικό Πέτρωμα (στερεός βράχος)</text>
'''
    write_svg("geo_soil_profile.svg", body)


if __name__ == "__main__":
    generators = [
        make_earth_layers,
        make_tectonic_plates,
        make_volcano,
        make_earthquake,
        make_fault_types,
        make_rock_cycle,
        make_lat_lon,
        make_seasons,
        make_moon_phases,
        make_eclipses,
        make_atmosphere,
        make_climate_zones,
        make_water_cycle,
        make_greenhouse,
        make_contour_lines,
        make_compass,
        make_river_course,
        make_karst_cave,
        make_sea_breeze,
        make_orographic_rain,
        make_ocean_floor,
        make_time_zones,
        make_greece_map,
        make_soil_profile,
    ]
    for fn in generators:
        fn()
    files = sorted(f for f in os.listdir(OUT_DIR) if f.endswith(".svg"))
    total_kb = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in files) / 1024
    print(f"Generated {len(files)} Geography & Geology SVGs in {OUT_DIR} ({total_kb:.1f} KB total, avg {total_kb/len(files):.1f} KB)")
