#!/usr/bin/env python3
"""
Batch 2 (24 Chemistry SVGs) + Batch 3 (24 Biology SVGs) — 48 Studio-Grade Native Vector SVGs
aligned with Greek Lyceum & Gymnasium curriculum (ebooks.edu.gr / ebooksdl.cti.gr).
"""
import os

CHEM_DIR = "public/vectors_stem/chemistry"
BIO_DIR = "public/vectors_stem/biology"
os.makedirs(CHEM_DIR, exist_ok=True)
os.makedirs(BIO_DIR, exist_ok=True)

FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"

DEFS = """  <defs>
    <marker id="aB" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#2563eb"/></marker>
    <marker id="aR" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#dc2626"/></marker>
    <marker id="aG" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#16a34a"/></marker>
    <marker id="aO" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#d97706"/></marker>
    <marker id="aK" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M 1 1.5 L 9 5 L 1 8.5 z" fill="#1e293b"/></marker>
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0f9ff" stop-opacity="0.9"/><stop offset="100%" stop-color="#bae6fd" stop-opacity="0.65"/>
    </linearGradient>
    <linearGradient id="liqB" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7dd3fc" stop-opacity="0.8"/><stop offset="100%" stop-color="#0284c7" stop-opacity="0.72"/>
    </linearGradient>
    <linearGradient id="liqY" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a" stop-opacity="0.85"/><stop offset="100%" stop-color="#f59e0b" stop-opacity="0.75"/>
    </linearGradient>
    <linearGradient id="liqG" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bbf7d0" stop-opacity="0.85"/><stop offset="100%" stop-color="#16a34a" stop-opacity="0.72"/>
    </linearGradient>
    <linearGradient id="liqP" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fbcfe8" stop-opacity="0.85"/><stop offset="100%" stop-color="#db2777" stop-opacity="0.65"/>
    </linearGradient>
    <radialGradient id="sphR" cx="35%" cy="30%" r="68%">
      <stop offset="0%" stop-color="#fca5a5"/><stop offset="60%" stop-color="#ef4444"/><stop offset="100%" stop-color="#991b1b"/>
    </radialGradient>
    <radialGradient id="sphB" cx="35%" cy="30%" r="68%">
      <stop offset="0%" stop-color="#93c5fd"/><stop offset="60%" stop-color="#2563eb"/><stop offset="100%" stop-color="#1e3a8a"/>
    </radialGradient>
    <radialGradient id="sphG" cx="35%" cy="30%" r="68%">
      <stop offset="0%" stop-color="#86efac"/><stop offset="60%" stop-color="#16a34a"/><stop offset="100%" stop-color="#14532d"/>
    </radialGradient>
    <radialGradient id="sphO" cx="35%" cy="30%" r="68%">
      <stop offset="0%" stop-color="#fde68a"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#92400e"/>
    </radialGradient>
  </defs>"""


def wrap(body: str, w: int = 360, h: int = 240) -> str:
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" fill="none">\n'
        f"{DEFS}\n<g font-family=\"{FONT}\">\n{body}\n</g>\n</svg>\n"
    )


CHEM: dict[str, str] = {}
BIO: dict[str, str] = {}

# ═════════════════════════════════════════════════════════════════════════════
# BATCH 2: 24 CHEMISTRY VECTORS
# ═════════════════════════════════════════════════════════════════════════════

CHEM["chem_lab_filtration.svg"] = wrap("""
  <!-- Stand -->
  <line x1="72" y1="216" x2="210" y2="216" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
  <line x1="92" y1="28" x2="92" y2="216" stroke="#475569" stroke-width="3.2"/>
  <line x1="92" y1="92" x2="148" y2="92" stroke="#475569" stroke-width="2.6"/>
  <!-- Funnel + Filter paper -->
  <polygon points="146,56 218,56 188,108 188,142 176,142 176,108" fill="url(#glass)" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>
  <polygon points="154,58 210,58 182,102" fill="#fef3c7" stroke="#b45309" stroke-width="1.3" stroke-dasharray="3 2"/>
  <!-- Residue dots -->
  <g fill="#92400e"><circle cx="176" cy="84" r="2.4"/><circle cx="184" cy="88" r="2.2"/><circle cx="188" cy="82" r="2.1"/><circle cx="180" cy="94" r="2"/></g>
  <!-- Drops -->
  <circle cx="182" cy="152" r="2.6" fill="#0284c7"/><circle cx="182" cy="166" r="2.6" fill="#0284c7"/>
  <!-- Beaker with filtrate -->
  <path d="M 142 150 L 142 210 Q 142 214 148 214 L 216 214 Q 222 214 222 210 L 222 150" stroke="#334155" stroke-width="2.2"/>
  <rect x="144" y="182" width="76" height="30" fill="url(#liqB)"/>
  <!-- Labels -->
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Διήθηση (Διαχωρισμός Στερεού–Υγρού)</text>
  <text x="228" y="68" font-size="11" font-weight="700" fill="#b45309">Διηθητικό χαρτί</text>
  <text x="228" y="92" font-size="11" font-weight="700" fill="#92400e">Ίζημα (στερεό)</text>
  <text x="232" y="198" font-size="11" font-weight="700" fill="#0369a1">Διήθημα (υγρό)</text>
""")

CHEM["chem_lab_distillation.svg"] = wrap("""
  <!-- Heating flask (left) -->
  <circle cx="76" cy="162" r="34" fill="url(#glass)" stroke="#334155" stroke-width="2"/>
  <path d="M 46 172 A 34 34 0 0 0 106 172 Z" fill="url(#liqB)"/>
  <rect x="68" y="88" width="16" height="42" fill="url(#glass)" stroke="#334155" stroke-width="2"/>
  <!-- Thermometer -->
  <line x1="76" y1="42" x2="76" y2="112" stroke="#dc2626" stroke-width="2.4"/>
  <circle cx="76" cy="114" r="3.5" fill="#dc2626"/>
  <!-- Flame -->
  <path d="M 76 202 Q 66 216 76 226 Q 86 216 76 202 Z" fill="#f97316"/>
  <!-- Liebig Condenser -->
  <line x1="84" y1="102" x2="262" y2="152" stroke="#334155" stroke-width="3"/>
  <path d="M 118 98 L 242 134 L 234 158 L 110 122 Z" fill="url(#glass)" stroke="#0284c7" stroke-width="1.8"/>
  <line x1="226" y1="154" x2="226" y2="178" stroke="#0284c7" stroke-width="2" marker-start="url(#aB)"/>
  <line x1="126" y1="100" x2="126" y2="74" stroke="#0284c7" stroke-width="2" marker-end="url(#aB)"/>
  <!-- Receiving Erlenmeyer -->
  <path d="M 272 154 L 284 154 L 298 214 L 258 214 Z" fill="url(#glass)" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>
  <polygon points="262,196 294,196 298,214 258,214" fill="url(#liqB)"/>
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Απλή Απόσταξη (Ψυκτήρας Liebig)</text>
  <text x="176" y="84" text-anchor="middle" font-size="11" font-weight="700" fill="#0369a1">Ψυκτήρας (νερό ψύξης)</text>
  <text x="278" y="232" text-anchor="middle" font-size="11" font-weight="700" fill="#0369a1">Απόσταγμα</text>
""")

CHEM["chem_lab_titration.svg"] = wrap("""
  <!-- Stand -->
  <line x1="76" y1="218" x2="224" y2="218" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
  <line x1="98" y1="26" x2="98" y2="218" stroke="#475569" stroke-width="3"/>
  <line x1="98" y1="84" x2="168" y2="84" stroke="#475569" stroke-width="2.5"/>
  <!-- Burette -->
  <rect x="168" y="34" width="14" height="92" fill="url(#glass)" stroke="#334155" stroke-width="1.8"/>
  <rect x="170" y="54" width="10" height="70" fill="url(#liqB)"/>
  <g stroke="#334155" stroke-width="1"><line x1="168" y1="54" x2="174" y2="54"/><line x1="168" y1="70" x2="174" y2="70"/><line x1="168" y1="86" x2="174" y2="86"/><line x1="168" y1="102" x2="174" y2="102"/></g>
  <!-- Stopcock -->
  <line x1="162" y1="132" x2="188" y2="132" stroke="#dc2626" stroke-width="3.2" stroke-linecap="round"/>
  <line x1="175" y1="126" x2="175" y2="146" stroke="#334155" stroke-width="2"/>
  <circle cx="175" cy="154" r="2.5" fill="#0284c7"/>
  <!-- Erlenmeyer Flask -->
  <path d="M 166 160 L 184 160 L 204 214 L 146 214 Z" fill="url(#glass)" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>
  <polygon points="152,194 198,194 204,214 146,214" fill="url(#liqP)"/>
  <text x="200" y="64" font-size="11" font-weight="700" fill="#0369a1">Προχοΐδα (πρότυπο διάλυμα)</text>
  <text x="212" y="198" font-size="11" font-weight="700" fill="#be185d">Κωνική φιάλη + δείκτης</text>
  <text x="180" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Ογκομέτρηση (Εξουδετέρωση)</text>
""")

CHEM["chem_lab_separatory_funnel.svg"] = wrap("""
  <!-- Separatory Funnel -->
  <path d="M 136 52 Q 136 108 174 146 L 174 176 L 186 176 L 186 146 Q 224 108 224 52 Z"
        fill="url(#glass)" stroke="#334155" stroke-width="2.2" stroke-linejoin="round"/>
  <!-- Top oil layer -->
  <path d="M 140 72 L 220 72 Q 218 96 208 106 L 152 106 Q 142 96 140 72 Z" fill="url(#liqY)"/>
  <!-- Bottom water layer -->
  <path d="M 152 106 L 208 106 Q 196 126 184 144 L 176 144 Q 164 126 152 106 Z" fill="url(#liqB)"/>
  <!-- Stopcock -->
  <line x1="164" y1="158" x2="196" y2="158" stroke="#dc2626" stroke-width="3.2" stroke-linecap="round"/>
  <!-- Beaker -->
  <path d="M 152 184 L 152 222 L 208 222 L 208 184" stroke="#334155" stroke-width="2"/>
  <rect x="154" y="204" width="52" height="16" fill="url(#liqB)"/>
  <text x="234" y="92" font-size="11" font-weight="700" fill="#b45309">Λάδι (μικρότερη ρ)</text>
  <text x="224" y="128" font-size="11" font-weight="700" fill="#0369a1">Νερό (μεγαλύτερη ρ)</text>
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Διαχωριστική Χοάνη (Μη Αναμίξιμα Υγρά)</text>
""")

CHEM["chem_lab_electrolysis_water.svg"] = wrap("""
  <!-- Hofmann Voltameter -->
  <path d="M 96 42 L 96 184 L 264 184 L 264 42" stroke="#334155" stroke-width="2.2"/>
  <rect x="96" y="42" width="26" height="142" fill="url(#liqB)" stroke="#334155" stroke-width="1.8"/>
  <rect x="238" y="42" width="26" height="142" fill="url(#liqB)" stroke="#334155" stroke-width="1.8"/>
  <line x1="122" y1="140" x2="238" y2="140" stroke="#0284c7" stroke-width="8"/>
  <!-- Gas pockets: H2 = 2x volume of O2! -->
  <rect x="98" y="44" width="22" height="62" fill="#fee2e2"/>
  <rect x="240" y="44" width="22" height="31" fill="#e0f2fe"/>
  <text x="109" y="78" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">2H₂</text>
  <text x="251" y="64" text-anchor="middle" font-size="12" font-weight="700" fill="#2563eb">O₂</text>
  <!-- Electrodes -->
  <rect x="106" y="156" width="6" height="34" fill="#1e293b"/>
  <rect x="248" y="156" width="6" height="34" fill="#1e293b"/>
  <text x="109" y="206" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">Κάθοδος (−)</text>
  <text x="251" y="206" text-anchor="middle" font-size="12" font-weight="700" fill="#2563eb">Άνοδος (+)</text>
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Ηλεκτρόλυση Νερού: 2H₂O → 2H₂ + O₂</text>
""")

CHEM["chem_lab_ph_scale.svg"] = wrap("""
  <text x="180" y="34" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">Κλίμακα pH (0 – 14)</text>
  <!-- 15 colored pH blocks -->
  <g stroke="#ffffff" stroke-width="1">
    <rect x="20" y="76" width="21" height="44" rx="3" fill="#dc2626"/>
    <rect x="41" y="76" width="21" height="44" rx="3" fill="#ea580c"/>
    <rect x="62" y="76" width="21" height="44" rx="3" fill="#f97316"/>
    <rect x="83" y="76" width="21" height="44" rx="3" fill="#f59e0b"/>
    <rect x="104" y="76" width="21" height="44" rx="3" fill="#eab308"/>
    <rect x="125" y="76" width="21" height="44" rx="3" fill="#84cc16"/>
    <rect x="146" y="76" width="21" height="44" rx="3" fill="#4ade80"/>
    <rect x="167" y="76" width="26" height="52" rx="4" fill="#16a34a" stroke="#1e293b" stroke-width="2"/>
    <rect x="193" y="76" width="21" height="44" rx="3" fill="#14b8a6"/>
    <rect x="214" y="76" width="21" height="44" rx="3" fill="#06b6d4"/>
    <rect x="235" y="76" width="21" height="44" rx="3" fill="#0ea5e9"/>
    <rect x="256" y="76" width="21" height="44" rx="3" fill="#2563eb"/>
    <rect x="277" y="76" width="21" height="44" rx="3" fill="#4f46e5"/>
    <rect x="298" y="76" width="21" height="44" rx="3" fill="#7c3aed"/>
    <rect x="319" y="76" width="21" height="44" rx="3" fill="#6b21a8"/>
  </g>
  <g font-size="10" font-weight="700" fill="#ffffff" text-anchor="middle">
    <text x="30" y="102">0</text><text x="51" y="102">1</text><text x="72" y="102">2</text>
    <text x="93" y="102">3</text><text x="114" y="102">4</text><text x="135" y="102">5</text>
    <text x="156" y="102">6</text><text x="180" y="106" font-size="12">7</text>
    <text x="203" y="102">8</text><text x="224" y="102">9</text><text x="245" y="102">10</text>
    <text x="266" y="102">11</text><text x="287" y="102">12</text><text x="308" y="102">13</text><text x="329" y="102">14</text>
  </g>
  <line x1="158" y1="154" x2="28" y2="154" stroke="#dc2626" stroke-width="2.4" marker-end="url(#aR)"/>
  <text x="92" y="176" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">Όξινο (pH &lt; 7)</text>
  <text x="180" y="158" text-anchor="middle" font-size="12" font-weight="700" fill="#16a34a">Ουδέτερο</text>
  <line x1="202" y1="154" x2="332" y2="154" stroke="#4f46e5" stroke-width="2.4" marker-end="url(#aB)"/>
  <text x="268" y="176" text-anchor="middle" font-size="12" font-weight="700" fill="#4f46e5">Βασικό (pH &gt; 7)</text>
""")

CHEM["chem_orbitals_s_p.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Ατομικά Τροχιακά s, pₓ, pᵧ, p_z</text>
  <!-- s orbital -->
  <circle cx="58" cy="126" r="34" fill="url(#sphB)" opacity="0.88"/>
  <text x="58" y="186" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">s</text>
  <!-- px orbital -->
  <ellipse cx="132" cy="126" rx="22" ry="14" fill="url(#sphR)" opacity="0.88"/>
  <ellipse cx="176" cy="126" rx="22" ry="14" fill="url(#sphB)" opacity="0.88"/>
  <text x="154" y="186" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">pₓ</text>
  <!-- py orbital -->
  <ellipse cx="236" cy="102" rx="14" ry="24" fill="url(#sphR)" opacity="0.88"/>
  <ellipse cx="236" cy="150" rx="14" ry="24" fill="url(#sphB)" opacity="0.88"/>
  <text x="236" y="196" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">pᵧ</text>
  <!-- pz orbital (tilted) -->
  <ellipse cx="300" cy="112" rx="14" ry="22" transform="rotate(-38 300 112)" fill="url(#sphR)" opacity="0.88"/>
  <ellipse cx="326" cy="140" rx="14" ry="22" transform="rotate(-38 326 140)" fill="url(#sphB)" opacity="0.88"/>
  <text x="312" y="186" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">p_z</text>
""")

CHEM["chem_ionic_bond_nacl.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Ιοντικός Δεσμός: Na⁺ + Cl⁻ → NaCl</text>
  <!-- Na atom -> Na+ -->
  <circle cx="96" cy="126" r="42" stroke="#94a3b8" stroke-width="1.6" stroke-dasharray="4 3"/>
  <circle cx="96" cy="126" r="24" fill="url(#sphR)"/>
  <text x="96" y="132" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">Na⁺</text>
  <!-- Electron transfer arc -->
  <circle cx="138" cy="104" r="5" fill="#2563eb"/>
  <path d="M 142 98 Q 180 54 218 96" stroke="#2563eb" stroke-width="2.4" marker-end="url(#aB)"/>
  <text x="180" y="64" text-anchor="middle" font-size="12" font-weight="700" fill="#2563eb">1 e⁻</text>
  <!-- Cl atom -> Cl- -->
  <circle cx="264" cy="126" r="46" stroke="#16a34a" stroke-width="2"/>
  <circle cx="264" cy="126" r="26" fill="url(#sphG)"/>
  <text x="264" y="132" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">Cl⁻</text>
  <text x="180" y="208" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">Ηλεκτροστατική έλξη κατιόντος &amp; ανιόντος</text>
""")

CHEM["chem_covalent_bond_h2o.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Πολωμένος Ομοιοπολικός Δεσμός (H₂O)</text>
  <!-- Bonds -->
  <line x1="180" y1="98" x2="112" y2="162" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
  <line x1="180" y1="98" x2="248" y2="162" stroke="#334155" stroke-width="5" stroke-linecap="round"/>
  <!-- Oxygen -->
  <circle cx="180" cy="94" r="32" fill="url(#sphR)"/>
  <text x="180" y="100" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">O</text>
  <text x="180" y="54" text-anchor="middle" font-size="13" font-weight="700" fill="#dc2626">δ−</text>
  <!-- Hydrogens -->
  <circle cx="108" cy="166" r="20" fill="url(#sphB)"/>
  <text x="108" y="172" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">H</text>
  <text x="76" y="174" font-size="13" font-weight="700" fill="#2563eb">δ+</text>
  <circle cx="252" cy="166" r="20" fill="url(#sphB)"/>
  <text x="252" y="172" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">H</text>
  <text x="278" y="174" font-size="13" font-weight="700" fill="#2563eb">δ+</text>
  <!-- Angle 104.5 -->
  <path d="M 148 134 A 44 44 0 0 0 212 134" stroke="#475569" stroke-width="1.6"/>
  <text x="180" y="164" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">104,5°</text>
""")

CHEM["chem_hydrogen_bond.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Δεσμός Υδρογόνου μεταξύ Μορίων H₂O</text>
  <!-- Left H2O -->
  <line x1="92" y1="120" x2="54" y2="164" stroke="#334155" stroke-width="3.5"/>
  <line x1="92" y1="120" x2="144" y2="120" stroke="#334155" stroke-width="3.5"/>
  <circle cx="92" cy="120" r="22" fill="url(#sphR)"/><text x="92" y="126" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">O</text>
  <circle cx="52" cy="166" r="14" fill="url(#sphB)"/><text x="52" y="171" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">H</text>
  <circle cx="146" cy="120" r="14" fill="url(#sphB)"/><text x="146" y="125" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">H</text>
  <!-- Hydrogen Bond (dashed!) -->
  <line x1="164" y1="120" x2="220" y2="120" stroke="#0ea5e9" stroke-width="3.5" stroke-dasharray="6 5"/>
  <text x="192" y="102" text-anchor="middle" font-size="11" font-weight="700" fill="#0284c7">Δεσμός H</text>
  <!-- Right H2O -->
  <line x1="244" y1="120" x2="294" y2="86" stroke="#334155" stroke-width="3.5"/>
  <line x1="244" y1="120" x2="294" y2="154" stroke="#334155" stroke-width="3.5"/>
  <circle cx="244" cy="120" r="22" fill="url(#sphR)"/><text x="244" y="126" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">O</text>
  <circle cx="296" cy="84" r="14" fill="url(#sphB)"/><text x="296" y="89" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">H</text>
  <circle cx="296" cy="156" r="14" fill="url(#sphB)"/><text x="296" y="161" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">H</text>
""")

CHEM["chem_vsepr_geometries.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Μοριακές Γεωμετρίες VSEPR</text>
  <!-- Linear (CO2) -->
  <line x1="26" y1="118" x2="104" y2="118" stroke="#334155" stroke-width="3"/>
  <circle cx="26" cy="118" r="11" fill="url(#sphR)"/><circle cx="65" cy="118" r="14" fill="url(#sphB)"/><circle cx="104" cy="118" r="11" fill="url(#sphR)"/>
  <text x="65" y="158" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">Γραμμική (180°)</text>
  <!-- Trigonal Planar (BF3) -->
  <line x1="180" y1="118" x2="180" y2="74" stroke="#334155" stroke-width="2.8"/>
  <line x1="180" y1="118" x2="144" y2="144" stroke="#334155" stroke-width="2.8"/>
  <line x1="180" y1="118" x2="216" y2="144" stroke="#334155" stroke-width="2.8"/>
  <circle cx="180" cy="118" r="13" fill="url(#sphG)"/><circle cx="180" cy="74" r="10" fill="url(#sphO)"/>
  <circle cx="144" cy="144" r="10" fill="url(#sphO)"/><circle cx="216" cy="144" r="10" fill="url(#sphO)"/>
  <text x="180" y="176" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">Τριγωνική (120°)</text>
  <!-- Tetrahedral (CH4) -->
  <line x1="296" y1="118" x2="296" y2="70" stroke="#334155" stroke-width="2.8"/>
  <line x1="296" y1="118" x2="262" y2="142" stroke="#334155" stroke-width="2.8"/>
  <line x1="296" y1="118" x2="332" y2="138" stroke="#334155" stroke-width="2.8"/>
  <line x1="296" y1="118" x2="292" y2="158" stroke="#334155" stroke-width="2.8"/>
  <circle cx="296" cy="118" r="14" fill="url(#sphB)"/><circle cx="296" cy="70" r="9" fill="url(#sphR)"/>
  <circle cx="262" cy="142" r="9" fill="url(#sphR)"/><circle cx="332" cy="138" r="9" fill="url(#sphR)"/><circle cx="292" cy="158" r="9" fill="url(#sphR)"/>
  <text x="296" y="186" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">Τετραεδρική (109,5°)</text>
""")

CHEM["chem_periodic_trends.svg"] = wrap("""
  <!-- Simplified Periodic Table silhouette -->
  <path d="M 64 58 L 96 58 L 96 98 L 240 98 L 240 58 L 296 58 L 296 178 L 64 178 Z"
        fill="#f1f5f9" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>
  <!-- Electronegativity / IE increases right & up -->
  <line x1="76" y1="42" x2="286" y2="42" stroke="#dc2626" stroke-width="2.6" marker-end="url(#aR)"/>
  <text x="180" y="34" text-anchor="middle" font-size="11" font-weight="700" fill="#dc2626">Ηλεκτραρνητικότητα &amp; Ενέργεια Ιοντισμού ↑</text>
  <line x1="314" y1="172" x2="314" y2="62" stroke="#dc2626" stroke-width="2.6" marker-end="url(#aR)"/>
  <!-- Atomic Radius increases left & down -->
  <line x1="286" y1="196" x2="76" y2="196" stroke="#2563eb" stroke-width="2.6" marker-end="url(#aB)"/>
  <text x="180" y="216" text-anchor="middle" font-size="11" font-weight="700" fill="#2563eb">Ατομική Ακτίνα (R) &amp; Μεταλλικός Χαρακτήρας ↑</text>
  <line x1="46" y1="62" x2="46" y2="172" stroke="#2563eb" stroke-width="2.6" marker-end="url(#aB)"/>
  <text x="180" y="142" text-anchor="middle" font-size="13" font-weight="700" fill="#334155">Περιοδικός Πίνακας</text>
""")

CHEM["chem_org_hydrocarbons.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Αλκάνια, Αλκένια &amp; Αλκίνια</text>
  <!-- Alkane C-C -->
  <text x="32" y="76" font-size="12" font-weight="700" fill="#2563eb">Αλκάνιο:</text>
  <text x="128" y="76" font-size="15" font-weight="700" fill="#1e293b">H₃C — CH₃</text>
  <text x="242" y="76" font-size="12" font-weight="600" fill="#475569">Απλός δεσμός (σ)</text>
  <!-- Alkene C=C -->
  <text x="32" y="132" font-size="12" font-weight="700" fill="#16a34a">Αλκένιο:</text>
  <text x="128" y="132" font-size="15" font-weight="700" fill="#1e293b">H₂C = CH₂</text>
  <text x="242" y="132" font-size="12" font-weight="600" fill="#475569">Διπλός (1σ, 1π)</text>
  <!-- Alkyne C≡C -->
  <text x="32" y="188" font-size="12" font-weight="700" fill="#dc2626">Αλκίνιο:</text>
  <text x="128" y="188" font-size="15" font-weight="700" fill="#1e293b">HC ≡ CH</text>
  <text x="242" y="188" font-size="12" font-weight="600" fill="#475569">Τριπλός (1σ, 2π)</text>
""")

CHEM["chem_org_benzene.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Βενζόλιο (C₆H₆) — Αρωματικός Δακτύλιος</text>
  <!-- Kekule structure 1 -->
  <polygon points="84,66 124,89 124,135 84,158 44,135 44,89" fill="#f8fafc" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="84" y1="76" x2="116" y2="94" stroke="#2563eb" stroke-width="2.2"/>
  <line x1="116" y1="130" x2="84" y2="148" stroke="#2563eb" stroke-width="2.2"/>
  <line x1="52" y1="94" x2="52" y2="130" stroke="#2563eb" stroke-width="2.2"/>
  <text x="150" y="118" font-size="18" font-weight="700" fill="#475569">↔</text>
  <!-- Aromatic ring with circle -->
  <polygon points="244,66 284,89 284,135 244,158 204,135 204,89" fill="#eff6ff" stroke="#1e293b" stroke-width="2.4"/>
  <circle cx="244" cy="112" r="24" stroke="#2563eb" stroke-width="2.4" stroke-dasharray="5 3"/>
  <text x="244" y="196" text-anchor="middle" font-size="12" font-weight="700" fill="#2563eb">Απεντοπισμένα π ηλεκτρόνια</text>
""")

CHEM["chem_org_petroleum_tower.svg"] = wrap("""
  <text x="180" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Κλασματική Απόσταξη Πετρελαίου</text>
  <!-- Fractionating column -->
  <rect x="96" y="38" width="76" height="182" rx="12" fill="url(#glass)" stroke="#334155" stroke-width="2.2"/>
  <rect x="98" y="40" width="72" height="34" rx="8" fill="#dbeafe"/>
  <rect x="98" y="74" width="72" height="36" fill="#fef08a"/>
  <rect x="98" y="110" width="72" height="36" fill="#fed7aa"/>
  <rect x="98" y="146" width="72" height="36" fill="#fca5a5"/>
  <rect x="98" y="182" width="72" height="36" rx="8" fill="#64748b"/>
  <!-- Crude oil inlet -->
  <line x1="28" y1="192" x2="94" y2="192" stroke="#1e293b" stroke-width="3" marker-end="url(#aK)"/>
  <text x="20" y="182" font-size="10" font-weight="700" fill="#1e293b">Αργό πετρ.</text>
  <!-- Fractions -->
  <g font-size="11" font-weight="700">
    <text x="184" y="60" fill="#1d4ed8">Αέρια (&lt; 40°C)</text>
    <text x="184" y="96" fill="#a16207">Βενζίνη (40–180°C)</text>
    <text x="184" y="132" fill="#c2410c">Κηροζίνη (180–250°C)</text>
    <text x="184" y="168" fill="#b91c1c">Πετρέλαιο Diesel (250–350°C)</text>
    <text x="184" y="204" fill="#334155">Άσφαλτος / Μαζούτ (&gt; 350°C)</text>
  </g>
""")

CHEM["chem_org_functional_groups.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Χαρακτηριστικές Ομάδες Οργανικής Χημείας</text>
  <g font-size="13" font-weight="700">
    <rect x="26" y="48" width="146" height="44" rx="8" fill="#eff6ff" stroke="#93c5fd"/><text x="99" y="66" text-anchor="middle" fill="#1d4ed8">Αλκοόλες</text><text x="99" y="84" text-anchor="middle" fill="#1e293b">R — OH</text>
    <rect x="188" y="48" width="146" height="44" rx="8" fill="#fef3c7" stroke="#fcd34d"/><text x="261" y="66" text-anchor="middle" fill="#b45309">Αλδεΰδες</text><text x="261" y="84" text-anchor="middle" fill="#1e293b">R — CHO</text>
    <rect x="26" y="108" width="146" height="44" rx="8" fill="#fee2e2" stroke="#fca5a5"/><text x="99" y="126" text-anchor="middle" fill="#b91c1c">Καρβοξυλικά Οξέα</text><text x="99" y="144" text-anchor="middle" fill="#1e293b">R — COOH</text>
    <rect x="188" y="108" width="146" height="44" rx="8" fill="#dcfce7" stroke="#86efac"/><text x="261" y="126" text-anchor="middle" fill="#15803d">Αμίνες</text><text x="261" y="144" text-anchor="middle" fill="#1e293b">R — NH₂</text>
    <rect x="104" y="168" width="152" height="44" rx="8" fill="#f3e8ff" stroke="#d8b4fe"/><text x="180" y="186" text-anchor="middle" fill="#7e22ce">Εστέρες</text><text x="180" y="204" text-anchor="middle" fill="#1e293b">R — COO — R'</text>
  </g>
""")

CHEM["chem_org_soap_micelle.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Μικύλλιο Σαπουνιού (Απορρυπαντική Δράση)</text>
  <!-- Grease droplet in center -->
  <circle cx="154" cy="130" r="34" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
  <text x="154" y="135" text-anchor="middle" font-size="12" font-weight="700" fill="#854d0e">Λίπος</text>
  <!-- Amphiphilic soap molecules around grease -->
  <g stroke="#475569" stroke-width="2">
    <line x1="154" y1="62" x2="154" y2="96"/><circle cx="154" cy="56" r="8" fill="url(#sphB)"/>
    <line x1="154" y1="164" x2="154" y2="198"/><circle cx="154" cy="204" r="8" fill="url(#sphB)"/>
    <line x1="86" y1="130" x2="120" y2="130"/><circle cx="80" cy="130" r="8" fill="url(#sphB)"/>
    <line x1="188" y1="130" x2="222" y2="130"/><circle cx="228" cy="130" r="8" fill="url(#sphB)"/>
    <line x1="106" y1="82" x2="130" y2="106"/><circle cx="100" cy="76" r="8" fill="url(#sphB)"/>
    <line x1="202" y1="82" x2="178" y2="106"/><circle cx="208" cy="76" r="8" fill="url(#sphB)"/>
    <line x1="106" y1="178" x2="130" y2="154"/><circle cx="100" cy="184" r="8" fill="url(#sphB)"/>
    <line x1="202" y1="178" x2="178" y2="154"/><circle cx="208" cy="184" r="8" fill="url(#sphB)"/>
  </g>
  <text x="250" y="96" font-size="11" font-weight="700" fill="#2563eb">Υδρόφιλη κεφαλή</text>
  <text x="250" y="114" font-size="11" font-weight="700" fill="#475569">Υδρόφοβη ουρά</text>
""")

CHEM["chem_org_isomerism.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Συντακτική Ισομέρεια (C₄H₁₀)</text>
  <rect x="20" y="52" width="152" height="156" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="96" y="76" text-anchor="middle" font-size="12" font-weight="700" fill="#2563eb">n-Βουτάνιο</text>
  <text x="96" y="132" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">CH₃–CH₂–CH₂–CH₃</text>
  <text x="96" y="184" text-anchor="middle" font-size="11" fill="#475569">Ευθεία αλυσίδα</text>
  <rect x="188" y="52" width="152" height="156" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="264" y="76" text-anchor="middle" font-size="12" font-weight="700" fill="#16a34a">Ισοβουτάνιο</text>
  <text x="264" y="122" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">CH₃–CH–CH₃</text>
  <line x1="264" y1="128" x2="264" y2="144" stroke="#1e293b" stroke-width="2"/>
  <text x="264" y="158" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">CH₃</text>
  <text x="264" y="186" text-anchor="middle" font-size="11" fill="#475569">Διακλαδισμένη</text>
""")

CHEM["chem_exo_endothermic.svg"] = wrap("""
  <!-- Exothermic (left) -->
  <line x1="30" y1="196" x2="30" y2="42" stroke="#334155" stroke-width="1.8" marker-end="url(#aK)"/>
  <line x1="30" y1="196" x2="164" y2="196" stroke="#334155" stroke-width="1.8" marker-end="url(#aK)"/>
  <path d="M 40 96 L 72 96 Q 94 52 114 156 L 152 156" stroke="#dc2626" stroke-width="2.6"/>
  <line x1="124" y1="96" x2="124" y2="152" stroke="#dc2626" stroke-width="2" marker-end="url(#aR)"/>
  <text x="96" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="#dc2626">Εξώθερμη (ΔH &lt; 0)</text>
  <text x="52" y="90" font-size="10" font-weight="700" fill="#334155">Αντιδρ.</text>
  <text x="128" y="172" font-size="10" font-weight="700" fill="#334155">Προϊόντα</text>
  <!-- Endothermic (right) -->
  <line x1="198" y1="196" x2="198" y2="42" stroke="#334155" stroke-width="1.8" marker-end="url(#aK)"/>
  <line x1="198" y1="196" x2="338" y2="196" stroke="#334155" stroke-width="1.8" marker-end="url(#aK)"/>
  <path d="M 208 158 L 242 158 Q 268 48 292 98 L 328 98" stroke="#2563eb" stroke-width="2.6"/>
  <line x1="300" y1="158" x2="300" y2="102" stroke="#2563eb" stroke-width="2" marker-end="url(#aB)"/>
  <text x="268" y="34" text-anchor="middle" font-size="12" font-weight="700" fill="#2563eb">Ενδόθερμη (ΔH &gt; 0)</text>
""")

CHEM["chem_activation_catalyst.svg"] = wrap("""
  <line x1="48" y1="204" x2="48" y2="30" stroke="#1e293b" stroke-width="2" marker-end="url(#aK)"/>
  <line x1="48" y1="204" x2="332" y2="204" stroke="#1e293b" stroke-width="2" marker-end="url(#aK)"/>
  <text x="32" y="42" font-size="13" font-weight="700" fill="#1e293b">E</text>
  <!-- Without catalyst -->
  <path d="M 56 122 L 104 122 C 148 122, 160 44, 188 44 C 216 44, 232 164, 270 164 L 320 164" stroke="#dc2626" stroke-width="2.6"/>
  <!-- With catalyst -->
  <path d="M 104 122 C 148 122, 164 84, 188 84 C 212 84, 232 164, 270 164" stroke="#16a34a" stroke-width="2.6" stroke-dasharray="6 4"/>
  <line x1="188" y1="122" x2="188" y2="48" stroke="#dc2626" stroke-width="1.8" marker-end="url(#aR)"/>
  <line x1="202" y1="122" x2="202" y2="88" stroke="#16a34a" stroke-width="1.8" marker-end="url(#aG)"/>
  <text x="148" y="42" font-size="11" font-weight="700" fill="#dc2626">Χωρίς καταλύτη (Ea)</text>
  <text x="212" y="96" font-size="11" font-weight="700" fill="#16a34a">Με καταλύτη (Ea')</text>
  <text x="190" y="226" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">Πορεία Αντίδρασης</text>
""")

CHEM["chem_equilibrium_rates.svg"] = wrap("""
  <line x1="48" y1="202" x2="48" y2="30" stroke="#1e293b" stroke-width="2" marker-end="url(#aK)"/>
  <line x1="48" y1="202" x2="332" y2="202" stroke="#1e293b" stroke-width="2" marker-end="url(#aK)"/>
  <text x="32" y="42" font-size="13" font-weight="700" fill="#1e293b">u</text>
  <text x="326" y="220" font-size="13" font-weight="700" fill="#1e293b">t</text>
  <!-- Forward rate u1 -->
  <path d="M 50 56 Q 116 122 192 124 L 320 124" stroke="#2563eb" stroke-width="2.6"/>
  <!-- Reverse rate u2 -->
  <path d="M 50 200 Q 116 126 192 124 L 320 124" stroke="#dc2626" stroke-width="2.6"/>
  <line x1="192" y1="124" x2="192" y2="202" stroke="#16a34a" stroke-width="1.6" stroke-dasharray="5 4"/>
  <text x="192" y="218" text-anchor="middle" font-size="11" font-weight="700" fill="#16a34a">t_ισορρ</text>
  <text x="82" y="68" font-size="12" font-weight="700" fill="#2563eb">u₁ (δεξιά)</text>
  <text x="82" y="186" font-size="12" font-weight="700" fill="#dc2626">u₂ (αριστερά)</text>
  <text x="256" y="114" text-anchor="middle" font-size="12" font-weight="700" fill="#16a34a">u₁ = u₂ (Χ.Ι.)</text>
""")

CHEM["chem_titration_curve_ph.svg"] = wrap("""
  <line x1="48" y1="204" x2="48" y2="28" stroke="#1e293b" stroke-width="2" marker-end="url(#aK)"/>
  <line x1="48" y1="204" x2="332" y2="204" stroke="#1e293b" stroke-width="2" marker-end="url(#aK)"/>
  <text x="26" y="38" font-size="12" font-weight="700" fill="#1e293b">pH</text>
  <text x="284" y="222" font-size="11" font-weight="700" fill="#1e293b">V(βάσης)</text>
  <!-- Equivalence line pH=7 -->
  <line x1="48" y1="116" x2="188" y2="116" stroke="#16a34a" stroke-width="1.4" stroke-dasharray="4 4"/>
  <line x1="188" y1="116" x2="188" y2="204" stroke="#16a34a" stroke-width="1.4" stroke-dasharray="4 4"/>
  <text x="34" y="120" font-size="11" font-weight="700" fill="#16a34a">7</text>
  <!-- S-shaped titration curve -->
  <path d="M 52 186 C 128 182, 178 176, 184 148 C 188 116, 188 116, 192 84 C 198 56, 248 50, 322 46"
        stroke="#2563eb" stroke-width="2.8"/>
  <circle cx="188" cy="116" r="4.5" fill="#dc2626"/>
  <text x="200" y="116" font-size="11" font-weight="700" fill="#dc2626">Ισοδύναμο σημείο</text>
""")

CHEM["chem_daniell_cell.svg"] = wrap("""
  <text x="180" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Γαλβανικό Στοιχείο Daniell (Zn | Cu)</text>
  <!-- Left Beaker (Zn) -->
  <rect x="38" y="106" width="106" height="96" rx="4" fill="url(#liqB)" stroke="#334155" stroke-width="2"/>
  <rect x="64" y="84" width="16" height="92" fill="#94a3b8" stroke="#334155" stroke-width="1.6"/>
  <text x="72" y="196" text-anchor="middle" font-size="11" font-weight="700" fill="#1e293b">ZnSO₄</text>
  <!-- Right Beaker (Cu) -->
  <rect x="216" y="106" width="106" height="96" rx="4" fill="url(#liqB)" stroke="#334155" stroke-width="2"/>
  <rect x="280" y="84" width="16" height="92" fill="#d97706" stroke="#78350f" stroke-width="1.6"/>
  <text x="288" y="196" text-anchor="middle" font-size="11" font-weight="700" fill="#1e293b">CuSO₄</text>
  <!-- Salt bridge -->
  <path d="M 118 144 L 118 82 Q 118 72 132 72 L 228 72 Q 242 72 242 82 L 242 144"
        stroke="#e2e8f0" stroke-width="12" stroke-linejoin="round"/>
  <path d="M 118 144 L 118 82 Q 118 72 132 72 L 228 72 Q 242 72 242 82 L 242 144"
        stroke="#475569" stroke-width="1.8" stroke-linejoin="round"/>
  <text x="180" y="92" text-anchor="middle" font-size="10" font-weight="700" fill="#475569">Γέφυρα άλατος</text>
  <!-- External Wire + Voltmeter -->
  <polyline points="72,84 72,44 162,44" stroke="#1e293b" stroke-width="2"/>
  <polyline points="198,44 288,44 288,84" stroke="#1e293b" stroke-width="2"/>
  <circle cx="180" cy="44" r="14" fill="#fff" stroke="#1e293b" stroke-width="2"/>
  <text x="180" y="49" text-anchor="middle" font-size="13" font-weight="700" fill="#2563eb">V</text>
  <line x1="100" y1="36" x2="146" y2="36" stroke="#dc2626" stroke-width="2" marker-end="url(#aR)"/>
  <text x="122" y="32" text-anchor="middle" font-size="10" font-weight="700" fill="#dc2626">e⁻</text>
  <text x="72" y="220" text-anchor="middle" font-size="11" font-weight="700" fill="#dc2626">Άνοδος (−) Zn</text>
  <text x="288" y="220" text-anchor="middle" font-size="11" font-weight="700" fill="#2563eb">Κάθοδος (+) Cu</text>
""")

CHEM["chem_le_chatelier.svg"] = wrap("""
  <text x="180" y="28" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">Αρχή Le Chatelier (Μετατόπιση Χ.Ι.)</text>
  <rect x="44" y="54" width="272" height="36" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="180" y="77" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">Α + Β ⇌ Γ + Δ</text>
  <g font-size="11.5" font-weight="700">
    <rect x="24" y="106" width="148" height="48" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
    <text x="98" y="126" text-anchor="middle" fill="#1d4ed8">Αύξηση [Α] ή [Β]</text>
    <text x="98" y="144" text-anchor="middle" fill="#16a34a">→ Μετατόπιση Δεξιά</text>
    <rect x="188" y="106" width="148" height="48" rx="8" fill="#fee2e2" stroke="#fca5a5"/>
    <text x="262" y="126" text-anchor="middle" fill="#b91c1c">Αύξηση Θερμοκρασίας</text>
    <text x="262" y="144" text-anchor="middle" fill="#1e293b">→ Προς την Ενδόθερμη</text>
    <rect x="64" y="168" width="232" height="48" rx="8" fill="#fef3c7" stroke="#fcd34d"/>
    <text x="180" y="188" text-anchor="middle" fill="#b45309">Αύξηση Πίεσης (Μείωση Όγκου)</text>
    <text x="180" y="206" text-anchor="middle" fill="#1e293b">→ Προς τα λιγότερα mol αερίων</text>
  </g>
""")

# ═════════════════════════════════════════════════════════════════════════════
# BATCH 3: 24 BIOLOGY VECTORS
# ═════════════════════════════════════════════════════════════════════════════

BIO["bio_fluid_mosaic_membrane.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Ρευστό Μωσαϊκό Πλασματικής Μεμβράνης</text>
  <!-- Phospholipid bilayer -->
  <g>
    """ + "".join(
        f'<circle cx="{32+i*22}" cy="84" r="8" fill="url(#sphB)"/><line x1="{29+i*22}" y1="92" x2="{29+i*22}" y2="118" stroke="#d97706" stroke-width="1.6"/><line x1="{35+i*22}" y1="92" x2="{35+i*22}" y2="118" stroke="#d97706" stroke-width="1.6"/>'
        f'<circle cx="{32+i*22}" cy="156" r="8" fill="url(#sphB)"/><line x1="{29+i*22}" y1="148" x2="{29+i*22}" y2="122" stroke="#d97706" stroke-width="1.6"/><line x1="{35+i*22}" y1="148" x2="{35+i*22}" y2="122" stroke="#d97706" stroke-width="1.6"/>'
        for i in range(14) if i not in (4, 5, 10)
    ) + """
  </g>
  <!-- Transmembrane Channel Protein -->
  <rect x="114" y="64" width="38" height="112" rx="14" fill="url(#liqP)" stroke="#be185d" stroke-width="2.2"/>
  <rect x="128" y="64" width="10" height="112" fill="#fdf2f8"/>
  <!-- Globular Integral Protein -->
  <ellipse cx="252" cy="120" rx="18" ry="48" fill="url(#liqG)" stroke="#15803d" stroke-width="2"/>
  <!-- Glycoprotein chain -->
  <polyline points="252,72 246,56 258,46 252,36" stroke="#16a34a" stroke-width="2.4" stroke-linejoin="round"/>
  <text x="133" y="198" text-anchor="middle" font-size="11" font-weight="700" fill="#be185d">Διαμεμβρανική πρωτεΐνη</text>
  <text x="284" y="198" text-anchor="middle" font-size="11" font-weight="700" fill="#2563eb">Φωσφολιπίδια</text>
""")

BIO["bio_membrane_transport.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Παθητική vs Ενεργητική Μεταφορά</text>
  <rect x="20" y="96" width="320" height="46" rx="6" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8"/>
  <!-- Simple Diffusion -->
  <line x1="72" y1="54" x2="72" y2="178" stroke="#16a34a" stroke-width="2.6" marker-end="url(#aG)"/>
  <text x="72" y="200" text-anchor="middle" font-size="11" font-weight="700" fill="#16a34a">Απλή Διάχυση</text>
  <!-- Facilitated -->
  <rect x="164" y="86" width="32" height="66" rx="10" fill="url(#liqP)" stroke="#be185d" stroke-width="1.8"/>
  <line x1="180" y1="54" x2="180" y2="178" stroke="#2563eb" stroke-width="2.6" marker-end="url(#aB)"/>
  <text x="180" y="200" text-anchor="middle" font-size="11" font-weight="700" fill="#2563eb">Διευκολυνόμενη</text>
  <!-- Active Transport + ATP -->
  <rect x="272" y="86" width="36" height="66" rx="10" fill="url(#liqY)" stroke="#b45309" stroke-width="1.8"/>
  <line x1="290" y1="178" x2="290" y2="54" stroke="#dc2626" stroke-width="2.8" marker-end="url(#aR)"/>
  <text x="290" y="200" text-anchor="middle" font-size="11" font-weight="700" fill="#dc2626">Ενεργητική (ATP)</text>
""")

BIO["bio_osmosis_cells.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Ώσμωση σε Ερυθρά Αιμοσφαίρια</text>
  <!-- Hypotonic (swollen) -->
  <circle cx="68" cy="118" r="38" fill="url(#sphR)"/>
  <line x1="20" y1="118" x2="48" y2="118" stroke="#2563eb" stroke-width="2.2" marker-end="url(#aB)"/>
  <text x="68" y="178" text-anchor="middle" font-size="11" font-weight="700" fill="#2563eb">Υποτονικό</text>
  <text x="68" y="194" text-anchor="middle" font-size="10" fill="#475569">(Διόγκωση / Λύση)</text>
  <!-- Isotonic (normal) -->
  <ellipse cx="180" cy="118" rx="34" ry="26" fill="url(#sphR)"/>
  <ellipse cx="180" cy="118" rx="14" ry="8" fill="#991b1b" opacity="0.45"/>
  <text x="180" y="178" text-anchor="middle" font-size="11" font-weight="700" fill="#16a34a">Ισοτονικό</text>
  <text x="180" y="194" text-anchor="middle" font-size="10" fill="#475569">(Φυσιολογικό)</text>
  <!-- Hypertonic (shrunk) -->
  <path d="M 292 92 L 306 100 L 318 96 L 314 114 L 324 128 L 308 134 L 304 148 L 288 140 L 274 146 L 276 130 L 264 118 L 278 106 Z" fill="url(#sphR)"/>
  <line x1="312" y1="118" x2="344" y2="118" stroke="#2563eb" stroke-width="2.2" marker-end="url(#aB)"/>
  <text x="292" y="178" text-anchor="middle" font-size="11" font-weight="700" fill="#dc2626">Υπερτονικό</text>
  <text x="292" y="194" text-anchor="middle" font-size="10" fill="#475569">(Συρρίκνωση)</text>
""")

BIO["bio_enzyme_lock_key.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Δράση Ενζύμου (Ενεργό Κέντρο — Υπόστρωμα)</text>
  <!-- Step 1: Enzyme + Substrate -->
  <path d="M 24 118 A 34 34 0 1 0 92 118 L 72 118 L 58 136 L 44 118 Z" fill="url(#liqB)" stroke="#0369a1" stroke-width="2"/>
  <polygon points="44,74 72,74 58,92" fill="url(#liqY)" stroke="#b45309" stroke-width="1.8"/>
  <text x="58" y="174" text-anchor="middle" font-size="11" font-weight="700" fill="#0369a1">Ε + Υ</text>
  <line x1="102" y1="118" x2="128" y2="118" stroke="#334155" stroke-width="2.2" marker-end="url(#aK)"/>
  <!-- Step 2: E-S complex -->
  <path d="M 142 118 A 34 34 0 1 0 210 118 L 190 118 L 176 136 L 162 118 Z" fill="url(#liqB)" stroke="#0369a1" stroke-width="2"/>
  <polygon points="162,118 190,118 176,136" fill="url(#liqY)" stroke="#b45309" stroke-width="1.8"/>
  <text x="176" y="174" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309">Σύμπλοκο Ε–Υ</text>
  <line x1="220" y1="118" x2="246" y2="118" stroke="#334155" stroke-width="2.2" marker-end="url(#aK)"/>
  <!-- Step 3: Enzyme + Products -->
  <path d="M 260 118 A 34 34 0 1 0 328 118 L 308 118 L 294 136 L 280 118 Z" fill="url(#liqB)" stroke="#0369a1" stroke-width="2"/>
  <polygon points="274,76 290,76 286,92" fill="url(#liqG)" stroke="#15803d" stroke-width="1.6"/>
  <polygon points="298,76 314,76 302,92" fill="url(#liqP)" stroke="#be185d" stroke-width="1.6"/>
  <text x="294" y="174" text-anchor="middle" font-size="11" font-weight="700" fill="#15803d">Ε + Προϊόντα</text>
""")

BIO["bio_enzyme_ph_temp.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Δραστικότητα Ενζύμου vs Θερμοκρασία &amp; pH</text>
  <!-- Temp curve -->
  <line x1="34" y1="192" x2="34" y2="54" stroke="#334155" stroke-width="1.8" marker-end="url(#aK)"/>
  <line x1="34" y1="192" x2="164" y2="192" stroke="#334155" stroke-width="1.8" marker-end="url(#aK)"/>
  <path d="M 40 184 Q 94 166 116 74 Q 128 74 142 188" stroke="#dc2626" stroke-width="2.6"/>
  <line x1="118" y1="74" x2="118" y2="192" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="118" y="208" text-anchor="middle" font-size="10" font-weight="700" fill="#dc2626">37°C (Άριστη)</text>
  <text x="148" y="114" font-size="9.5" font-weight="700" fill="#dc2626">Μετουσίωση</text>
  <!-- pH curve -->
  <line x1="202" y1="192" x2="202" y2="54" stroke="#334155" stroke-width="1.8" marker-end="url(#aK)"/>
  <line x1="202" y1="192" x2="338" y2="192" stroke="#334155" stroke-width="1.8" marker-end="url(#aK)"/>
  <path d="M 218 188 Q 270 62 322 188" stroke="#2563eb" stroke-width="2.6"/>
  <line x1="270" y1="76" x2="270" y2="192" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 3"/>
  <text x="270" y="208" text-anchor="middle" font-size="10" font-weight="700" fill="#2563eb">Άριστο pH</text>
""")

BIO["bio_atp_adp_cycle.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">Κύκλος Ενέργειας ATP ↔ ADP + Pᵢ</text>
  <rect x="44" y="96" width="96" height="48" rx="12" fill="url(#liqY)" stroke="#b45309" stroke-width="2.2"/>
  <text x="92" y="126" text-anchor="middle" font-size="16" font-weight="700" fill="#78350f">ATP</text>
  <rect x="220" y="96" width="104" height="48" rx="12" fill="url(#liqB)" stroke="#0369a1" stroke-width="2.2"/>
  <text x="272" y="126" text-anchor="middle" font-size="14" font-weight="700" fill="#0c4a6e">ADP + Pᵢ</text>
  <path d="M 142 94 Q 180 54 220 94" stroke="#dc2626" stroke-width="2.8" marker-end="url(#aR)"/>
  <text x="180" y="64" text-anchor="middle" font-size="11" font-weight="700" fill="#dc2626">Απελευθέρωση Ενέργειας</text>
  <path d="M 220 146 Q 180 186 142 146" stroke="#16a34a" stroke-width="2.8" marker-end="url(#aG)"/>
  <text x="180" y="186" text-anchor="middle" font-size="11" font-weight="700" fill="#16a34a">Κυτταρική Αναπνοή (+Ενέργεια)</text>
""")

BIO["bio_mitochondrion_respiration.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Μιτοχόνδριο &amp; Κυτταρική Αναπνοή</text>
  <!-- Outer membrane -->
  <ellipse cx="180" cy="122" rx="134" ry="68" fill="#fed7aa" stroke="#9a3412" stroke-width="2.6"/>
  <!-- Inner cristae folds -->
  <path d="M 76 122 Q 86 76 126 78 Q 134 114 148 114 Q 162 114 168 78 Q 204 76 210 112 Q 226 112 232 84 Q 272 88 284 122 Q 272 162 230 162 Q 218 134 202 134 Q 188 134 182 164 Q 146 164 140 134 Q 124 134 118 160 Q 84 156 76 122 Z"
        fill="#fef3c7" stroke="#c2410c" stroke-width="2"/>
  <text x="180" y="126" text-anchor="middle" font-size="12" font-weight="700" fill="#9a3412">Κύκλος Krebs + ΑΜΗ → 36 ATP</text>
  <text x="180" y="216" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + Ενέργεια (ATP)</text>
""")

BIO["bio_chloroplast_photosynthesis.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Χλωροπλάστης — Φωτοσύνθεση</text>
  <ellipse cx="180" cy="122" rx="138" ry="68" fill="#dcfce7" stroke="#15803d" stroke-width="2.6"/>
  <!-- Grana (thylakoid stacks) -->
  <g fill="#22c55e" stroke="#14532d" stroke-width="1.4">
    <rect x="86" y="88" width="44" height="12" rx="6"/><rect x="86" y="102" width="44" height="12" rx="6"/>
    <rect x="86" y="116" width="44" height="12" rx="6"/><rect x="86" y="130" width="44" height="12" rx="6"/>
  </g>
  <text x="108" y="160" text-anchor="middle" font-size="10.5" font-weight="700" fill="#14532d">Φωτεινή φάση</text>
  <!-- Calvin cycle in stroma -->
  <circle cx="242" cy="118" r="32" stroke="#0284c7" stroke-width="2.4" stroke-dasharray="6 4"/>
  <text x="242" y="116" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0369a1">Κύκλος</text>
  <text x="242" y="130" text-anchor="middle" font-size="10.5" font-weight="700" fill="#0369a1">Calvin</text>
  <!-- ATP/NADPH arrow -->
  <line x1="136" y1="114" x2="204" y2="114" stroke="#d97706" stroke-width="2.2" marker-end="url(#aO)"/>
  <text x="170" y="106" text-anchor="middle" font-size="10" font-weight="700" fill="#b45309">ATP</text>
  <text x="180" y="216" text-anchor="middle" font-size="11.5" font-weight="700" fill="#15803d">6CO₂ + 6H₂O + Φως → C₆H₁₂O₆ + 6O₂</text>
""")

BIO["bio_cell_cycle.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Κυτταρικός Κύκλος (G₁ → S → G₂ → M)</text>
  <!-- Cycle ring -->
  <circle cx="180" cy="128" r="74" stroke="#e2e8f0" stroke-width="22"/>
  <path d="M 180 54 A 74 74 0 0 1 254 128" stroke="#38bdf8" stroke-width="22"/>
  <path d="M 254 128 A 74 74 0 0 1 132 184" stroke="#22c55e" stroke-width="22"/>
  <path d="M 132 184 A 74 74 0 0 1 116 90" stroke="#f59e0b" stroke-width="22"/>
  <path d="M 116 90 A 74 74 0 0 1 180 54" stroke="#ef4444" stroke-width="22"/>
  <text x="234" y="84" font-size="13" font-weight="700" fill="#0369a1">G₁</text>
  <text x="206" y="214" font-size="13" font-weight="700" fill="#15803d">S (Αντιγραφή DNA)</text>
  <text x="64" y="152" font-size="13" font-weight="700" fill="#b45309">G₂</text>
  <text x="108" y="62" font-size="13" font-weight="700" fill="#dc2626">M (Μίτωση)</text>
  <text x="180" y="132" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">Μεσόφαση</text>
""")

BIO["bio_mitosis_phases.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Φάσεις της Μίτωσης (2n → 2 × 2n)</text>
  <!-- Prophase -->
  <circle cx="52" cy="118" r="34" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <path d="M 42 106 L 54 122 M 54 106 L 42 122 M 56 116 L 66 132 M 66 116 L 56 132" stroke="#dc2626" stroke-width="2.4" stroke-linecap="round"/>
  <text x="52" y="172" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">Πρόφαση</text>
  <!-- Metaphase -->
  <circle cx="138" cy="118" r="34" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <line x1="138" y1="86" x2="138" y2="150" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 2"/>
  <path d="M 132 102 L 144 112 M 144 102 L 132 112 M 132 124 L 144 134 M 144 124 L 132 134" stroke="#2563eb" stroke-width="2.4" stroke-linecap="round"/>
  <text x="138" y="172" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">Μετάφαση</text>
  <!-- Anaphase -->
  <ellipse cx="224" cy="118" rx="38" ry="30" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <path d="M 206 106 L 198 112 L 206 118 M 206 122 L 198 128 L 206 134" stroke="#dc2626" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M 242 106 L 250 112 L 242 118 M 242 122 L 250 128 L 242 134" stroke="#2563eb" stroke-width="2.2" stroke-linecap="round"/>
  <text x="224" y="172" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">Ανάφαση</text>
  <!-- Telophase -->
  <circle cx="302" cy="118" r="22" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <circle cx="336" cy="118" r="22" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
  <text x="319" y="172" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">Τελόφαση</text>
""")

BIO["bio_meiosis_crossing_over.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Επιχιασμός (Crossing-Over στη Μείωση Ι)</text>
  <!-- Homologous pair before -->
  <path d="M 60 54 L 60 184 M 74 54 L 74 184" stroke="#dc2626" stroke-width="8" stroke-linecap="round"/>
  <path d="M 100 54 L 100 184 M 114 54 L 114 184" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/>
  <line x1="136" y1="118" x2="178" y2="118" stroke="#334155" stroke-width="2.6" marker-end="url(#aK)"/>
  <!-- Recombinant pair after crossing over -->
  <path d="M 210 54 L 210 184" stroke="#dc2626" stroke-width="8" stroke-linecap="round"/>
  <path d="M 226 54 L 226 144" stroke="#dc2626" stroke-width="8" stroke-linecap="round"/>
  <path d="M 226 144 L 226 184" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/>
  <path d="M 254 54 L 254 144" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/>
  <path d="M 254 144 L 254 184" stroke="#dc2626" stroke-width="8" stroke-linecap="round"/>
  <path d="M 270 54 L 270 184" stroke="#2563eb" stroke-width="8" stroke-linecap="round"/>
  <text x="240" y="214" text-anchor="middle" font-size="12" font-weight="700" fill="#16a34a">Ανασυνδυασμένες χρωματίδες</text>
""")

BIO["bio_prokaryote_vs_eukaryote.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Προκαρυωτικό vs Ευκαρυωτικό Κύτταρο</text>
  <!-- Prokaryote -->
  <rect x="30" y="72" width="124" height="72" rx="36" fill="#dcfce7" stroke="#15803d" stroke-width="2.4"/>
  <path d="M 64 106 Q 82 88 98 108 Q 112 124 126 104" stroke="#dc2626" stroke-width="2.4"/>
  <path d="M 154 108 Q 170 96 178 112" stroke="#15803d" stroke-width="2"/>
  <text x="92" y="172" text-anchor="middle" font-size="12" font-weight="700" fill="#15803d">Προκαρυωτικό</text>
  <text x="92" y="188" text-anchor="middle" font-size="10" fill="#475569">(Χωρίς πυρήνα)</text>
  <!-- Eukaryote -->
  <ellipse cx="268" cy="112" rx="64" ry="52" fill="#e0f2fe" stroke="#0369a1" stroke-width="2.4"/>
  <circle cx="268" cy="108" r="22" fill="#c7d2fe" stroke="#4338ca" stroke-width="2"/>
  <ellipse cx="234" cy="134" rx="12" ry="6" fill="#fed7aa" stroke="#c2410c" stroke-width="1.4"/>
  <ellipse cx="304" cy="132" rx="12" ry="6" fill="#fed7aa" stroke="#c2410c" stroke-width="1.4"/>
  <text x="268" y="184" text-anchor="middle" font-size="12" font-weight="700" fill="#0369a1">Ευκαρυωτικό</text>
  <text x="268" y="200" text-anchor="middle" font-size="10" fill="#475569">(Με πυρήνα &amp; οργανίδια)</text>
""")

BIO["bio_dna_double_helix.svg"] = wrap("""
  <text x="180" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Διπλή Έλικα DNA (A=T, G≡C)</text>
  <!-- Two sinusoidal backbones -->
  <path d="M 40 90 C 90 42, 130 164, 180 116 C 230 68, 270 164, 320 116" stroke="#2563eb" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M 40 142 C 90 190, 130 68, 180 116 C 230 164, 270 68, 320 116" stroke="#dc2626" stroke-width="4.5" stroke-linecap="round"/>
  <!-- Base pair rungs -->
  <g stroke-width="3" stroke-linecap="round">
    <line x1="68" y1="80" x2="68" y2="152" stroke="#16a34a"/>
    <line x1="94" y1="82" x2="94" y2="148" stroke="#f59e0b"/>
    <line x1="144" y1="108" x2="144" y2="124" stroke="#7c3aed"/>
    <line x1="214" y1="102" x2="214" y2="132" stroke="#16a34a"/>
    <line x1="244" y1="90" x2="244" y2="142" stroke="#f59e0b"/>
    <line x1="274" y1="98" x2="274" y2="134" stroke="#7c3aed"/>
  </g>
  <text x="36" y="78" font-size="11" font-weight="700" fill="#2563eb">5'</text>
  <text x="36" y="162" font-size="11" font-weight="700" fill="#dc2626">3'</text>
  <text x="322" y="106" font-size="11" font-weight="700" fill="#2563eb">3'</text>
  <text x="322" y="136" font-size="11" font-weight="700" fill="#dc2626">5'</text>
  <text x="180" y="212" text-anchor="middle" font-size="12" font-weight="700" fill="#334155">Συμπληρωματικότητα: A = T (2 δ.H) • G ≡ C (3 δ.H)</text>
""")

BIO["bio_nucleotide_structure.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Δομή Νουκλεοτιδίου (Μονομερές DNA/RNA)</text>
  <!-- Phosphate group -->
  <circle cx="84" cy="108" r="24" fill="url(#sphO)"/>
  <text x="84" y="114" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">P</text>
  <line x1="108" y1="108" x2="144" y2="128" stroke="#334155" stroke-width="2.6"/>
  <!-- Pentose sugar -->
  <polygon points="180,98 214,122 200,162 160,162 146,122" fill="url(#liqB)" stroke="#0369a1" stroke-width="2.2"/>
  <text x="180" y="138" text-anchor="middle" font-size="11" font-weight="700" fill="#0c4a6e">Πεντόζη</text>
  <line x1="214" y1="122" x2="246" y2="108" stroke="#334155" stroke-width="2.6"/>
  <!-- Nitrogenous base -->
  <rect x="246" y="84" width="84" height="46" rx="8" fill="url(#liqG)" stroke="#15803d" stroke-width="2"/>
  <text x="288" y="104" text-anchor="middle" font-size="11" font-weight="700" fill="#14532d">Αζωτούχος</text>
  <text x="288" y="120" text-anchor="middle" font-size="11" font-weight="700" fill="#14532d">Βάση (A,T,G,C)</text>
  <text x="84" y="156" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309">Φωσφορική ομάδα</text>
""")

BIO["bio_dna_replication.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Ημισυντηρητική Αντιγραφή DNA</text>
  <!-- Parental double strand on left -->
  <line x1="28" y1="112" x2="132" y2="112" stroke="#2563eb" stroke-width="4"/>
  <line x1="28" y1="128" x2="132" y2="128" stroke="#2563eb" stroke-width="4"/>
  <!-- Replication fork opening -->
  <line x1="132" y1="112" x2="322" y2="62" stroke="#2563eb" stroke-width="4"/>
  <line x1="132" y1="128" x2="322" y2="178" stroke="#2563eb" stroke-width="4"/>
  <!-- New daughter strands (red) -->
  <line x1="154" y1="118" x2="318" y2="76" stroke="#dc2626" stroke-width="3.4" marker-end="url(#aR)"/>
  <line x1="316" y1="164" x2="244" y2="145" stroke="#dc2626" stroke-width="3.4" marker-end="url(#aR)"/>
  <line x1="230" y1="142" x2="162" y2="124" stroke="#dc2626" stroke-width="3.4" marker-end="url(#aR)"/>
  <!-- Helicase -->
  <polygon points="122,120 146,106 146,134" fill="#16a34a"/>
  <text x="134" y="158" text-anchor="middle" font-size="10" font-weight="700" fill="#16a34a">Ελικάση</text>
  <text x="268" y="54" font-size="11" font-weight="700" fill="#dc2626">Συνεχής (5'→3')</text>
  <text x="242" y="200" font-size="11" font-weight="700" fill="#dc2626">Ασυνεχής (Okazaki)</text>
""")

BIO["bio_central_dogma.svg"] = wrap("""
  <text x="180" y="28" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">Κεντρικό Δόγμα της Βιολογίας</text>
  <rect x="24" y="96" width="84" height="50" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="2.2"/>
  <text x="66" y="127" text-anchor="middle" font-size="16" font-weight="700" fill="#1d4ed8">DNA</text>
  <rect x="142" y="96" width="84" height="50" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="2.2"/>
  <text x="184" y="127" text-anchor="middle" font-size="16" font-weight="700" fill="#15803d">mRNA</text>
  <rect x="256" y="96" width="84" height="50" rx="10" fill="#fce7f3" stroke="#db2777" stroke-width="2.2"/>
  <text x="298" y="126" text-anchor="middle" font-size="13" font-weight="700" fill="#be185d">Πρωτεΐνη</text>
  <!-- Replication loop -->
  <path d="M 52 94 C 34 52, 98 52, 80 94" stroke="#2563eb" stroke-width="2.2" marker-end="url(#aB)"/>
  <text x="66" y="56" text-anchor="middle" font-size="10.5" font-weight="700" fill="#2563eb">Αντιγραφή</text>
  <!-- Transcription -->
  <line x1="108" y1="121" x2="138" y2="121" stroke="#16a34a" stroke-width="2.8" marker-end="url(#aG)"/>
  <text x="123" y="166" text-anchor="middle" font-size="11" font-weight="700" fill="#16a34a">Μεταγραφή</text>
  <!-- Translation -->
  <line x1="226" y1="121" x2="252" y2="121" stroke="#db2777" stroke-width="2.8" marker-end="url(#aR)"/>
  <text x="242" y="166" text-anchor="middle" font-size="11" font-weight="700" fill="#be185d">Μετάφραση</text>
""")

BIO["bio_translation_ribosome.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Μετάφραση στο Ριβόσωμα (Πρωτεϊνοσύνθεση)</text>
  <!-- Ribosome subunits -->
  <ellipse cx="180" cy="112" rx="76" ry="44" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
  <ellipse cx="180" cy="164" rx="64" ry="22" fill="#bae6fd" stroke="#0284c7" stroke-width="2"/>
  <!-- mRNA strand -->
  <line x1="26" y1="146" x2="334" y2="146" stroke="#16a34a" stroke-width="4.5" stroke-linecap="round"/>
  <text x="36" y="138" font-size="11" font-weight="700" fill="#16a34a">5' mRNA</text>
  <text x="316" y="138" font-size="11" font-weight="700" fill="#16a34a">3'</text>
  <!-- tRNA + Amino acid chain -->
  <rect x="166" y="88" width="26" height="54" rx="6" fill="#fef08a" stroke="#ca8a04" stroke-width="1.8"/>
  <text x="179" y="118" text-anchor="middle" font-size="10" font-weight="700" fill="#854d0e">tRNA</text>
  <circle cx="179" cy="76" r="10" fill="url(#sphR)"/>
  <circle cx="158" cy="64" r="10" fill="url(#sphB)"/>
  <circle cx="136" cy="58" r="10" fill="url(#sphG)"/>
  <text x="116" y="46" font-size="11" font-weight="700" fill="#be185d">Πολυπεπτίδιο</text>
  <text x="180" y="206" text-anchor="middle" font-size="11" font-weight="700" fill="#0369a1">Κωδικόνιο mRNA ↔ Αντικωδικόνιο tRNA</text>
""")

BIO["bio_lac_operon.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Οπερόνιο Λακτόζης (Ε. coli)</text>
  <line x1="20" y1="126" x2="340" y2="126" stroke="#334155" stroke-width="3"/>
  <rect x="28" y="106" width="54" height="40" rx="5" fill="#e2e8f0" stroke="#475569" stroke-width="1.8"/><text x="55" y="130" text-anchor="middle" font-size="11" font-weight="700" fill="#1e293b">Ρυθμ.</text>
  <rect x="92" y="106" width="46" height="40" rx="5" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/><text x="115" y="130" text-anchor="middle" font-size="11" font-weight="700" fill="#1d4ed8">Υποκ.</text>
  <rect x="142" y="106" width="46" height="40" rx="5" fill="#fee2e2" stroke="#dc2626" stroke-width="1.8"/><text x="165" y="130" text-anchor="middle" font-size="11" font-weight="700" fill="#b91c1c">Χειρ.</text>
  <rect x="194" y="106" width="42" height="40" rx="5" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/><text x="215" y="130" text-anchor="middle" font-size="11" font-weight="700" fill="#15803d">lacZ</text>
  <rect x="240" y="106" width="42" height="40" rx="5" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/><text x="261" y="130" text-anchor="middle" font-size="11" font-weight="700" fill="#15803d">lacY</text>
  <rect x="286" y="106" width="42" height="40" rx="5" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/><text x="307" y="130" text-anchor="middle" font-size="11" font-weight="700" fill="#15803d">lacA</text>
  <!-- Repressor -->
  <circle cx="165" cy="84" r="16" fill="url(#sphR)"/>
  <text x="165" y="60" text-anchor="middle" font-size="10.5" font-weight="700" fill="#dc2626">Καταστολέας</text>
  <text x="260" y="174" text-anchor="middle" font-size="11" font-weight="700" fill="#15803d">Δομικά γονίδια (ένζυμα λακτόζης)</text>
""")

BIO["bio_bacteriophage.svg"] = wrap("""
  <text x="180" y="22" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Δομή Βακτηριοφάγου (Ιός T4)</text>
  <!-- Icosahedral Head -->
  <polygon points="180,36 218,58 218,102 180,124 142,102 142,58" fill="#dbeafe" stroke="#1d4ed8" stroke-width="2.2"/>
  <!-- DNA inside head -->
  <path d="M 164 68 Q 180 54 196 68 Q 180 82 196 96 Q 176 106 164 92" stroke="#dc2626" stroke-width="2.4"/>
  <!-- Tail sheath -->
  <rect x="170" y="124" width="20" height="58" fill="#e2e8f0" stroke="#334155" stroke-width="2"/>
  <g stroke="#475569" stroke-width="1.2"><line x1="170" y1="136" x2="190" y2="136"/><line x1="170" y1="148" x2="190" y2="148"/><line x1="170" y1="160" x2="190" y2="160"/><line x1="170" y1="172" x2="190" y2="172"/></g>
  <!-- Baseplate & Tail fibers -->
  <rect x="160" y="182" width="40" height="8" rx="3" fill="#475569"/>
  <g stroke="#334155" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="164,190 126,174 106,216"/>
    <polyline points="168,190 142,196 132,224"/>
    <polyline points="196,190 234,174 254,216"/>
    <polyline points="192,190 218,196 228,224"/>
  </g>
  <text x="234" y="76" font-size="11" font-weight="700" fill="#1d4ed8">Κεφαλή (Καψίδιο + DNA)</text>
  <text x="202" y="156" font-size="11" font-weight="700" fill="#334155">Ουρά</text>
""")

BIO["bio_recombinant_dna.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Τεχνολογία Ανασυνδυασμένου DNA</text>
  <!-- Plasmid -->
  <circle cx="72" cy="118" r="36" stroke="#2563eb" stroke-width="5"/>
  <text x="72" y="176" text-anchor="middle" font-size="11" font-weight="700" fill="#2563eb">Πλασμίδιο</text>
  <text x="128" y="124" font-size="18" font-weight="700" fill="#334155">+</text>
  <!-- Foreign gene -->
  <line x1="152" y1="118" x2="206" y2="118" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>
  <text x="179" y="144" text-anchor="middle" font-size="10.5" font-weight="700" fill="#dc2626">Γονίδιο</text>
  <line x1="214" y1="118" x2="244" y2="118" stroke="#334155" stroke-width="2.4" marker-end="url(#aK)"/>
  <!-- Recombinant plasmid -->
  <circle cx="294" cy="118" r="36" stroke="#2563eb" stroke-width="5"/>
  <path d="M 294 82 A 36 36 0 0 1 330 118" stroke="#dc2626" stroke-width="6"/>
  <text x="294" y="176" text-anchor="middle" font-size="11" font-weight="700" fill="#16a34a">Ανασυνδυασμένο</text>
""")

BIO["bio_pcr_amplification.svg"] = wrap("""
  <text x="180" y="26" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Αλυσιδωτή Αντίδραση Πολυμεράσης (PCR)</text>
  <rect x="24" y="54" width="94" height="58" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="1.8"/>
  <text x="71" y="76" text-anchor="middle" font-size="11" font-weight="700" fill="#b91c1c">1. Αποδιάταξη</text>
  <text x="71" y="96" text-anchor="middle" font-size="11" fill="#334155">~95°C</text>
  <line x1="118" y1="83" x2="132" y2="83" stroke="#334155" stroke-width="2" marker-end="url(#aK)"/>
  <rect x="134" y="54" width="94" height="58" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="1.8"/>
  <text x="181" y="76" text-anchor="middle" font-size="11" font-weight="700" fill="#b45309">2. Υβριδοποίηση</text>
  <text x="181" y="96" text-anchor="middle" font-size="11" fill="#334155">~55°C (Primers)</text>
  <line x1="228" y1="83" x2="242" y2="83" stroke="#334155" stroke-width="2" marker-end="url(#aK)"/>
  <rect x="244" y="54" width="94" height="58" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
  <text x="291" y="76" text-anchor="middle" font-size="11" font-weight="700" fill="#15803d">3. Επιμήκυνση</text>
  <text x="291" y="96" text-anchor="middle" font-size="11" fill="#334155">~72°C (Taq)</text>
  <!-- Exponential amplification -->
  <text x="180" y="166" text-anchor="middle" font-size="15" font-weight="700" fill="#2563eb">1 → 2 → 4 → 8 → ... → 2ⁿ αντίγραφα DNA</text>
""")

BIO["bio_gel_electrophoresis.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Ηλεκτροφόρηση DNA σε Πηκτή Αγαρόζης</text>
  <!-- Gel slab -->
  <rect x="70" y="44" width="220" height="162" rx="8" fill="#f1f5f9" stroke="#334155" stroke-width="2"/>
  <text x="48" y="64" font-size="16" font-weight="700" fill="#1e293b">−</text>
  <text x="48" y="196" font-size="16" font-weight="700" fill="#dc2626">+</text>
  <line x1="52" y1="74" x2="52" y2="178" stroke="#2563eb" stroke-width="2.2" marker-end="url(#aB)"/>
  <!-- Wells -->
  <g fill="#475569"><rect x="92" y="54" width="28" height="8"/><rect x="142" y="54" width="28" height="8"/><rect x="192" y="54" width="28" height="8"/><rect x="242" y="54" width="28" height="8"/></g>
  <!-- DNA Bands -->
  <g fill="#2563eb">
    <rect x="92" y="84" width="28" height="5" rx="2"/><rect x="92" y="114" width="28" height="5" rx="2"/><rect x="92" y="148" width="28" height="5" rx="2"/><rect x="92" y="178" width="28" height="5" rx="2"/>
    <rect x="142" y="96" width="28" height="5" rx="2"/><rect x="142" y="156" width="28" height="5" rx="2"/>
    <rect x="192" y="114" width="28" height="5" rx="2"/><rect x="192" y="178" width="28" height="5" rx="2"/>
    <rect x="242" y="84" width="28" height="5" rx="2"/><rect x="242" y="140" width="28" height="5" rx="2"/>
  </g>
  <text x="322" y="88" text-anchor="middle" font-size="10" font-weight="700" fill="#475569">Μεγάλα</text>
  <text x="322" y="182" text-anchor="middle" font-size="10" font-weight="700" fill="#2563eb">Μικρά</text>
""")

BIO["bio_punnett_square.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Τετράγωνο Punnett (Μονοϋβριδισμός Aa × Aa)</text>
  <!-- Grid -->
  <rect x="108" y="64" width="144" height="128" fill="#ffffff" stroke="#334155" stroke-width="2"/>
  <line x1="180" y1="64" x2="180" y2="192" stroke="#334155" stroke-width="1.8"/>
  <line x1="108" y1="128" x2="252" y2="128" stroke="#334155" stroke-width="1.8"/>
  <!-- Gametes -->
  <text x="144" y="54" text-anchor="middle" font-size="15" font-weight="700" fill="#2563eb">A</text>
  <text x="216" y="54" text-anchor="middle" font-size="15" font-weight="700" fill="#dc2626">a</text>
  <text x="90" y="102" text-anchor="middle" font-size="15" font-weight="700" fill="#2563eb">A</text>
  <text x="90" y="166" text-anchor="middle" font-size="15" font-weight="700" fill="#dc2626">a</text>
  <!-- Offspring -->
  <text x="144" y="102" text-anchor="middle" font-size="16" font-weight="700" fill="#1e293b">AA</text>
  <text x="216" y="102" text-anchor="middle" font-size="16" font-weight="700" fill="#1e293b">Aa</text>
  <text x="144" y="166" text-anchor="middle" font-size="16" font-weight="700" fill="#1e293b">Aa</text>
  <rect x="181" y="129" width="70" height="62" fill="#fee2e2"/>
  <text x="216" y="166" text-anchor="middle" font-size="16" font-weight="700" fill="#dc2626">aa</text>
  <text x="180" y="218" text-anchor="middle" font-size="12" font-weight="700" fill="#16a34a">Φαινοτυπική αναλογία 3 : 1</text>
""")

BIO["bio_pedigree_chart.svg"] = wrap("""
  <text x="180" y="24" text-anchor="middle" font-size="13" font-weight="700" fill="#1e293b">Γενεαλογικό Δέντρο (Αυτοσωμική Υπολειπόμενη)</text>
  <!-- Generation I -->
  <rect x="108" y="48" width="28" height="28" fill="#ffffff" stroke="#1e293b" stroke-width="2.2"/>
  <circle cx="224" cy="62" r="14" fill="#ffffff" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="136" y1="62" x2="210" y2="62" stroke="#1e293b" stroke-width="2"/>
  <text x="96" y="66" font-size="11" font-weight="700" fill="#475569">I</text>
  <!-- Generation II -->
  <line x1="173" y1="62" x2="173" y2="112" stroke="#1e293b" stroke-width="2"/>
  <line x1="88" y1="112" x2="258" y2="112" stroke="#1e293b" stroke-width="2"/>
  <line x1="88" y1="112" x2="88" y2="136" stroke="#1e293b" stroke-width="2"/>
  <line x1="173" y1="112" x2="173" y2="136" stroke="#1e293b" stroke-width="2"/>
  <line x1="258" y1="112" x2="258" y2="136" stroke="#1e293b" stroke-width="2"/>
  <circle cx="88" cy="150" r="14" fill="#1e293b" stroke="#1e293b" stroke-width="2"/>
  <rect x="159" y="136" width="28" height="28" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
  <circle cx="258" cy="150" r="14" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
  <text x="58" y="154" font-size="11" font-weight="700" fill="#475569">II</text>
  <!-- Legend -->
  <text x="180" y="206" text-anchor="middle" font-size="11" font-weight="700" fill="#334155">□ Άνδρας   ○ Γυναίκα   ● Πάσχον άτομο (aa)</text>
""")


for fn, svg in CHEM.items():
    with open(os.path.join(CHEM_DIR, fn), "w", encoding="utf-8") as f:
        f.write(svg)

for fn, svg in BIO.items():
    with open(os.path.join(BIO_DIR, fn), "w", encoding="utf-8") as f:
        f.write(svg)

c_kb = sum(os.path.getsize(os.path.join(CHEM_DIR, fn)) for fn in CHEM) / 1024
b_kb = sum(os.path.getsize(os.path.join(BIO_DIR, fn)) for fn in BIO) / 1024
print(f"Generated {len(CHEM)} Chemistry SVGs ({c_kb:.1f} KB) + {len(BIO)} Biology SVGs ({b_kb:.1f} KB)")
