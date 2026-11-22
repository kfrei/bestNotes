#!/usr/bin/env python3
"""
Generate Batch 6: 30 Rich, Detailed, Sketch-Style Native Vector (.svg) diagrams
for Χημεία Β΄–Γ΄ Λυκείου (Ατομική Δομή, Θερμοχημεία, Κινητική, Ιοντική Ισορροπία,
Οξειδοαναγωγή/Ηλεκτροχημεία, Οργανική Χημεία & Σύνθεση).
Follows the Rich Sketch-Style SVG Standard (Section 16).
Output: public/vectors_stem/chemistry/chem3_*.svg
"""
import os
import math

OUT_DIR = os.path.join("public", "vectors_stem", "chemistry")
os.makedirs(OUT_DIR, exist_ok=True)


def svg_wrap(body: str, w: int = 460, h: int = 310) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <defs>
    <filter id="soft-shadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.2" flood-color="#0f172a" flood-opacity="0.15"/>
    </filter>
    <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="#64748b" stroke-width="1.1" opacity="0.55"/>
    </pattern>
    <radialGradient id="atom-c" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="50%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    <radialGradient id="atom-o" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#fecaca"/>
      <stop offset="48%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </radialGradient>
    <radialGradient id="atom-h" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="60%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#94a3b8"/>
    </radialGradient>
    <radialGradient id="atom-n" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#bfdbfe"/>
      <stop offset="50%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </radialGradient>
    <radialGradient id="atom-cl" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#bbf7d0"/>
      <stop offset="50%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#14532d"/>
    </radialGradient>
    <radialGradient id="atom-amber" cx="32%" cy="28%" r="68%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#92400e"/>
    </radialGradient>
    <linearGradient id="glass-liq" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#38bdf8" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="orbital-blue" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#93c5fd" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#2563eb" stop-opacity="0.65"/>
    </linearGradient>
    <linearGradient id="orbital-red" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fca5a5" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="#dc2626" stop-opacity="0.65"/>
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


# 1. Aufbau & Hund energy diagram
def make_aufbau():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Αρχή Aufbau &amp; Κανόνας Hund (Ηλεκτρονιακή Δόμηση)</text>
  <line x1="56" y1="252" x2="56" y2="42" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="44" y="54" text-anchor="end" class="t-lbl">E</text>
  <!-- 1s -->
  <rect x="86" y="224" width="32" height="22" rx="3" fill="#eff6ff" stroke="#2563eb" stroke-width="1.6"/>
  <text x="102" y="240" text-anchor="middle" class="t-eq">↑↓</text>
  <text x="78" y="239" text-anchor="end" class="t-lbl">1s</text>
  <!-- 2s -->
  <rect x="86" y="182" width="32" height="22" rx="3" fill="#eff6ff" stroke="#2563eb" stroke-width="1.6"/>
  <text x="102" y="198" text-anchor="middle" class="t-eq">↑↓</text>
  <text x="78" y="197" text-anchor="end" class="t-lbl">2s</text>
  <!-- 2p (3 boxes) -->
  <g transform="translate(154,154)">
    <rect x="0" y="0" width="32" height="22" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
    <rect x="36" y="0" width="32" height="22" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
    <rect x="72" y="0" width="32" height="22" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
    <text x="16" y="16" text-anchor="middle" class="t-eq">↑↓</text>
    <text x="52" y="16" text-anchor="middle" class="t-eq">↑↓</text>
    <text x="88" y="16" text-anchor="middle" class="t-eq">↑↓</text>
    <text x="114" y="15" class="t-lbl">2p</text>
  </g>
  <!-- 3s -->
  <rect x="86" y="124" width="32" height="22" rx="3" fill="#eff6ff" stroke="#2563eb" stroke-width="1.6"/>
  <text x="102" y="140" text-anchor="middle" class="t-eq">↑↓</text>
  <text x="78" y="139" text-anchor="end" class="t-lbl">3s</text>
  <!-- 3p -->
  <g transform="translate(154,98)">
    <rect x="0" y="0" width="32" height="22" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
    <rect x="36" y="0" width="32" height="22" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
    <rect x="72" y="0" width="32" height="22" rx="3" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
    <text x="16" y="16" text-anchor="middle" class="t-eq" fill="#b91c1c">↑</text>
    <text x="52" y="16" text-anchor="middle" class="t-eq" fill="#b91c1c">↑</text>
    <text x="88" y="16" text-anchor="middle" class="t-eq" fill="#b91c1c">↑</text>
    <text x="114" y="15" class="t-lbl">3p (Hund!)</text>
  </g>
  <!-- 4s lower than 3d -->
  <rect x="86" y="68" width="32" height="22" rx="3" fill="#dcfce7" stroke="#16a34a" stroke-width="1.6"/>
  <text x="78" y="83" text-anchor="end" class="t-lbl" fill="#15803d">4s</text>
  <!-- 3d (5 boxes) -->
  <g transform="translate(274,52)">
    <rect x="0" y="0" width="26" height="20" rx="3" fill="#f3e8ff" stroke="#7c3aed" stroke-width="1.4"/>
    <rect x="29" y="0" width="26" height="20" rx="3" fill="#f3e8ff" stroke="#7c3aed" stroke-width="1.4"/>
    <rect x="58" y="0" width="26" height="20" rx="3" fill="#f3e8ff" stroke="#7c3aed" stroke-width="1.4"/>
    <rect x="87" y="0" width="26" height="20" rx="3" fill="#f3e8ff" stroke="#7c3aed" stroke-width="1.4"/>
    <rect x="116" y="0" width="26" height="20" rx="3" fill="#f3e8ff" stroke="#7c3aed" stroke-width="1.4"/>
    <text x="71" y="34" text-anchor="middle" class="t-lbl" fill="#6d28d9">3d (E_4s &lt; E_3d)</text>
  </g>
  <!-- Info box -->
  <rect x="290" y="128" width="152" height="114" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="366" y="148" text-anchor="middle" class="t-sub">3 Βασικές Αρχές</text>
  <text x="300" y="168" class="t-sm">1. Pauli: max 2 e⁻ (↑↓)</text>
  <text x="300" y="188" class="t-sm">2. Aufbau: ελάχιστη E</text>
  <text x="300" y="208" class="t-sm">3. Hund: παράλληλα spin</text>
  <text x="300" y="228" class="t-sm">   (μέγιστο Σs)</text>
  <rect x="24" y="264" width="412" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Σειρά πλήρωσης: 1s → 2s → 2p → 3s → 3p → 4s → 3d → 4p</text>
'''
    write_svg("chem3_aufbau_energy_diagram.svg", body)


# 2. Hybridization sp3, sp2, sp
def make_hybridization():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Υβριδισμός Άνθρακα: sp³, sp² &amp; sp</text>
  <!-- sp3 -->
  <g transform="translate(16,40)">
    <rect width="138" height="218" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="69" y="20" text-anchor="middle" class="t-sub">sp³ (Τετραεδρική)</text>
    <ellipse cx="69" cy="76" rx="12" ry="30" fill="url(#orbital-blue)" stroke="#1e3a8a"/>
    <ellipse cx="42" cy="126" rx="12" ry="28" transform="rotate(55 42 126)" fill="url(#orbital-blue)" stroke="#1e3a8a"/>
    <ellipse cx="96" cy="126" rx="12" ry="28" transform="rotate(-55 96 126)" fill="url(#orbital-blue)" stroke="#1e3a8a"/>
    <circle cx="69" cy="108" r="11" fill="url(#atom-c)"/>
    <text x="69" y="112" text-anchor="middle" class="t-w">C</text>
    <text x="69" y="176" text-anchor="middle" class="t-eq">109,5°</text>
    <text x="69" y="194" text-anchor="middle" class="t-sm">4 δεσμοί σ</text>
    <text x="69" y="208" text-anchor="middle" class="t-sm">π.χ. CH₄ (Αλκάνια)</text>
  </g>
  <!-- sp2 -->
  <g transform="translate(161,40)">
    <rect width="138" height="218" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="69" y="20" text-anchor="middle" class="t-sub">sp² (Επίπεδη Τριγ.)</text>
    <ellipse cx="69" cy="72" rx="10" ry="28" fill="url(#orbital-red)" stroke="#991b1b" opacity="0.7"/>
    <ellipse cx="69" cy="144" rx="10" ry="28" fill="url(#orbital-red)" stroke="#991b1b" opacity="0.7"/>
    <ellipse cx="38" cy="108" rx="28" ry="11" fill="url(#orbital-blue)" stroke="#1e3a8a"/>
    <ellipse cx="100" cy="108" rx="28" ry="11" fill="url(#orbital-blue)" stroke="#1e3a8a"/>
    <circle cx="69" cy="108" r="11" fill="url(#atom-c)"/>
    <text x="69" y="112" text-anchor="middle" class="t-w">C</text>
    <text x="69" y="176" text-anchor="middle" class="t-eq">120°</text>
    <text x="69" y="194" text-anchor="middle" class="t-sm">3 σ + 1 π (C=C)</text>
    <text x="69" y="208" text-anchor="middle" class="t-sm">π.χ. C₂H₄ (Αλκένια)</text>
  </g>
  <!-- sp -->
  <g transform="translate(306,40)">
    <rect width="138" height="218" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="69" y="20" text-anchor="middle" class="t-sub">sp (Γραμμική)</text>
    <ellipse cx="69" cy="74" rx="9" ry="28" fill="url(#orbital-red)" stroke="#991b1b" opacity="0.65"/>
    <ellipse cx="69" cy="142" rx="9" ry="28" fill="url(#orbital-red)" stroke="#991b1b" opacity="0.65"/>
    <ellipse cx="36" cy="108" rx="30" ry="12" fill="url(#orbital-blue)" stroke="#1e3a8a"/>
    <ellipse cx="102" cy="108" rx="30" ry="12" fill="url(#orbital-blue)" stroke="#1e3a8a"/>
    <circle cx="69" cy="108" r="11" fill="url(#atom-c)"/>
    <text x="69" y="112" text-anchor="middle" class="t-w">C</text>
    <text x="69" y="176" text-anchor="middle" class="t-eq">180°</text>
    <text x="69" y="194" text-anchor="middle" class="t-sm">2 σ + 2 π (C≡C)</text>
    <text x="69" y="208" text-anchor="middle" class="t-sm">π.χ. C₂H₂ (Αλκίνια)</text>
  </g>
  <rect x="16" y="268" width="428" height="30" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="287" text-anchor="middle" class="t-eq">Μήκος δεσμού: C–C (sp³) &gt; C=C (sp²) &gt; C≡C (sp)</text>
'''
    write_svg("chem3_hybridization_sp3_sp2_sp.svg", body)


# 3. Sigma & Pi bonds in Ethene
def make_sigma_pi():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Σχηματισμός Δεσμών σ &amp; π στο Αιθένιο (C₂H₄)</text>
  <rect x="20" y="36" width="420" height="218" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <!-- Pi electron clouds (above & below) -->
  <ellipse cx="230" cy="94" rx="82" ry="22" fill="url(#orbital-red)" opacity="0.6" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3"/>
  <ellipse cx="230" cy="196" rx="82" ry="22" fill="url(#orbital-red)" opacity="0.6" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="5,3"/>
  <!-- p orbitals on each C -->
  <ellipse cx="174" cy="102" rx="14" ry="34" fill="url(#orbital-red)" opacity="0.55" stroke="#991b1b"/>
  <ellipse cx="174" cy="188" rx="14" ry="34" fill="url(#orbital-red)" opacity="0.55" stroke="#991b1b"/>
  <ellipse cx="286" cy="102" rx="14" ry="34" fill="url(#orbital-red)" opacity="0.55" stroke="#991b1b"/>
  <ellipse cx="286" cy="188" rx="14" ry="34" fill="url(#orbital-red)" opacity="0.55" stroke="#991b1b"/>
  <!-- Sigma bond C-C -->
  <ellipse cx="230" cy="145" rx="52" ry="15" fill="url(#orbital-blue)" stroke="#1e3a8a" stroke-width="1.6"/>
  <text x="230" y="149" text-anchor="middle" class="t-w">δεσμός σ</text>
  <!-- C-H bonds -->
  <line x1="174" y1="145" x2="108" y2="108" stroke="#1e293b" stroke-width="3"/>
  <line x1="174" y1="145" x2="108" y2="182" stroke="#1e293b" stroke-width="3"/>
  <line x1="286" y1="145" x2="352" y2="108" stroke="#1e293b" stroke-width="3"/>
  <line x1="286" y1="145" x2="352" y2="182" stroke="#1e293b" stroke-width="3"/>
  <!-- Atoms -->
  <circle cx="174" cy="145" r="15" fill="url(#atom-c)" filter="url(#soft-shadow)"/>
  <text x="174" y="149" text-anchor="middle" class="t-w">C</text>
  <circle cx="286" cy="145" r="15" fill="url(#atom-c)" filter="url(#soft-shadow)"/>
  <text x="286" y="149" text-anchor="middle" class="t-w">C</text>
  <circle cx="102" cy="104" r="11" fill="url(#atom-h)" stroke="#64748b"/>
  <text x="102" y="108" text-anchor="middle" class="t-lbl">H</text>
  <circle cx="102" cy="186" r="11" fill="url(#atom-h)" stroke="#64748b"/>
  <text x="102" y="190" text-anchor="middle" class="t-lbl">H</text>
  <circle cx="358" cy="104" r="11" fill="url(#atom-h)" stroke="#64748b"/>
  <text x="358" y="108" text-anchor="middle" class="t-lbl">H</text>
  <circle cx="358" cy="186" r="11" fill="url(#atom-h)" stroke="#64748b"/>
  <text x="358" y="190" text-anchor="middle" class="t-lbl">H</text>
  <text x="230" y="64" text-anchor="middle" class="t-eq" fill="#b91c1c">Δεσμός π (πλάγια επικάλυψη p–p)</text>
  <rect x="20" y="264" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">Ο δεσμός σ είναι ισχυρότερος από τον π • Ο π εμποδίζει την ελεύθερη περιστροφή</text>
'''
    write_svg("chem3_sigma_pi_bonds.svg", body)


# 4. Intermolecular forces
def make_intermolecular():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Διαμοριακές Δυνάμεις (Ισχύς &amp; Σημείο Βρασμού)</text>
  <!-- 1. Hydrogen bond -->
  <g transform="translate(18,40)">
    <rect width="424" height="66" rx="10" fill="#fef2f2" stroke="#fecaca"/>
    <text x="16" y="22" class="t-sub" fill="#991b1b">1. Δεσμός Υδρογόνου (Ισχυρότερος: H με F, O, N)</text>
    <text x="16" y="48" class="t-eq">H—Oδ⁻  · · · · ·  Hδ⁺—O—H</text>
    <text x="278" y="46" class="t-sm">π.χ. H₂O, NH₃, HF, Αλκοόλες</text>
  </g>
  <!-- 2. Dipole-Dipole -->
  <g transform="translate(18,116)">
    <rect width="424" height="66" rx="10" fill="#eff6ff" stroke="#bfdbfe"/>
    <text x="16" y="22" class="t-sub" fill="#1e3a8a">2. Δυνάμεις Διπόλου – Διπόλου (Πολικά μόρια)</text>
    <ellipse cx="78" cy="44" rx="44" ry="14" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
    <text x="78" y="48" text-anchor="middle" class="t-eq">δ⁺  HCl  δ⁻</text>
    <line x1="126" y1="44" x2="162" y2="44" stroke="#2563eb" stroke-width="2" stroke-dasharray="4,3"/>
    <ellipse cx="210" cy="44" rx="44" ry="14" fill="#dbeafe" stroke="#2563eb" stroke-width="1.5"/>
    <text x="210" y="48" text-anchor="middle" class="t-eq">δ⁺  HCl  δ⁻</text>
    <text x="278" y="48" class="t-sm">π.χ. HCl, H₂S, Ακετόνη</text>
  </g>
  <!-- 3. London dispersion -->
  <g transform="translate(18,192)">
    <rect width="424" height="66" rx="10" fill="#f0fdf4" stroke="#bbf7d0"/>
    <text x="16" y="22" class="t-sub" fill="#14532d">3. Δυνάμεις Διασποράς London (Όλα τα μόρια — κυρίως μη πολικά)</text>
    <ellipse cx="78" cy="44" rx="42" ry="13" fill="#dcfce7" stroke="#16a34a" stroke-width="1.4"/>
    <text x="78" y="48" text-anchor="middle" class="t-sm">στιγμιαίο δίπολο</text>
    <line x1="124" y1="44" x2="160" y2="44" stroke="#16a34a" stroke-width="1.8" stroke-dasharray="3,3"/>
    <ellipse cx="206" cy="44" rx="42" ry="13" fill="#dcfce7" stroke="#16a34a" stroke-width="1.4"/>
    <text x="206" y="48" text-anchor="middle" class="t-sm">επαγόμενο δίπολο</text>
    <text x="278" y="48" class="t-sm">π.χ. CH₄, I₂, Αλκάνια (↑ με M_r)</text>
  </g>
  <rect x="18" y="268" width="424" height="30" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="287" text-anchor="middle" class="t-eq">Ισχυρότερες διαμοριακές δυνάμεις  ⇒  Υψηλότερο Σ.Β. &amp; Σ.Τ.</text>
'''
    write_svg("chem3_intermolecular_forces.svg", body)


# 5. Crystal lattices (4 types)
def make_crystals():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Κρυσταλλικά Πλέγματα Στερεών (4 Τύποι)</text>
  <!-- Ionic -->
  <g transform="translate(18,38)">
    <rect width="206" height="122" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="103" y="18" text-anchor="middle" class="t-sub">1. Ιοντικό (π.χ. NaCl)</text>
    <circle cx="54" cy="52" r="11" fill="url(#atom-n)"/><text x="54" y="56" text-anchor="middle" class="t-w">+</text>
    <circle cx="96" cy="52" r="13" fill="url(#atom-cl)"/><text x="96" y="56" text-anchor="middle" class="t-w">−</text>
    <circle cx="54" cy="92" r="13" fill="url(#atom-cl)"/><text x="54" y="96" text-anchor="middle" class="t-w">−</text>
    <circle cx="96" cy="92" r="11" fill="url(#atom-n)"/><text x="96" y="96" text-anchor="middle" class="t-w">+</text>
    <text x="156" y="62" text-anchor="middle" class="t-sm">Υψηλό Σ.Τ.</text>
    <text x="156" y="78" text-anchor="middle" class="t-sm">Αγωγιμότητα</text>
    <text x="156" y="92" text-anchor="middle" class="t-sm">σε τήγμα/δ/μα</text>
  </g>
  <!-- Metallic -->
  <g transform="translate(236,38)">
    <rect width="206" height="122" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="103" y="18" text-anchor="middle" class="t-sub">2. Μεταλλικό (π.χ. Cu, Fe)</text>
    <rect x="26" y="34" width="90" height="72" rx="8" fill="#dbeafe" opacity="0.7"/>
    <circle cx="48" cy="54" r="10" fill="url(#atom-amber)"/><text x="48" y="58" text-anchor="middle" class="t-w">+</text>
    <circle cx="92" cy="54" r="10" fill="url(#atom-amber)"/><text x="92" y="58" text-anchor="middle" class="t-w">+</text>
    <circle cx="48" cy="88" r="10" fill="url(#atom-amber)"/><text x="48" y="92" text-anchor="middle" class="t-w">+</text>
    <circle cx="92" cy="88" r="10" fill="url(#atom-amber)"/><text x="92" y="92" text-anchor="middle" class="t-w">+</text>
    <text x="70" y="74" text-anchor="middle" class="t-sm" fill="#1d4ed8">e⁻ θάλασσα</text>
    <text x="160" y="62" text-anchor="middle" class="t-sm">Ελάσιμο,</text>
    <text x="160" y="78" text-anchor="middle" class="t-sm">Άριστος</text>
    <text x="160" y="92" text-anchor="middle" class="t-sm">αγωγός</text>
  </g>
  <!-- Covalent network -->
  <g transform="translate(18,172)">
    <rect width="206" height="122" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="103" y="18" text-anchor="middle" class="t-sub">3. Ατομικό (Διαμάντι, SiO₂)</text>
    <line x1="72" y1="42" x2="46" y2="76" stroke="#1e293b" stroke-width="2.2"/>
    <line x1="72" y1="42" x2="98" y2="76" stroke="#1e293b" stroke-width="2.2"/>
    <line x1="46" y1="76" x2="72" y2="104" stroke="#1e293b" stroke-width="2.2"/>
    <line x1="98" y1="76" x2="72" y2="104" stroke="#1e293b" stroke-width="2.2"/>
    <circle cx="72" cy="42" r="9" fill="url(#atom-c)"/>
    <circle cx="46" cy="76" r="9" fill="url(#atom-c)"/>
    <circle cx="98" cy="76" r="9" fill="url(#atom-c)"/>
    <circle cx="72" cy="104" r="9" fill="url(#atom-c)"/>
    <text x="156" y="62" text-anchor="middle" class="t-sm">Εξαιρετικά</text>
    <text x="156" y="78" text-anchor="middle" class="t-sm">σκληρό,</text>
    <text x="156" y="92" text-anchor="middle" class="t-sm">πολύ υψηλό Σ.Τ.</text>
  </g>
  <!-- Molecular -->
  <g transform="translate(236,172)">
    <rect width="206" height="122" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="103" y="18" text-anchor="middle" class="t-sub">4. Μοριακό (Πάγος, I₂, CO₂)</text>
    <circle cx="46" cy="56" r="8" fill="url(#atom-o)"/>
    <circle cx="60" cy="64" r="5" fill="url(#atom-h)" stroke="#64748b"/>
    <line x1="66" y1="64" x2="84" y2="64" stroke="#2563eb" stroke-width="1.5" stroke-dasharray="3,2"/>
    <circle cx="94" cy="64" r="8" fill="url(#atom-o)"/>
    <circle cx="54" cy="94" r="8" fill="url(#atom-o)"/>
    <circle cx="94" cy="94" r="8" fill="url(#atom-o)"/>
    <text x="156" y="62" text-anchor="middle" class="t-sm">Χαμηλό Σ.Τ.</text>
    <text x="156" y="78" text-anchor="middle" class="t-sm">Μαλακό,</text>
    <text x="156" y="92" text-anchor="middle" class="t-sm">μονωτής</text>
  </g>
'''
    write_svg("chem3_crystal_lattices.svg", body)


# 6. Lewis & Resonance (O3 & CO3^2-)
def make_lewis_resonance():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Δομές Lewis &amp; Συντονισμός (Όζον O₃ &amp; CO₃²⁻)</text>
  <!-- Ozone resonance -->
  <rect x="20" y="38" width="420" height="106" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="34" y="56" class="t-sub">Όζον (O₃) — Δύο ισοδύναμες δομές συντονισμού</text>
  <!-- Left O3 -->
  <text x="122" y="88" text-anchor="middle" class="t-eq" font-size="14">O⁺</text>
  <line x1="110" y1="92" x2="84" y2="114" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="114" y1="96" x2="88" y2="118" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="132" y1="94" x2="158" y2="116" stroke="#1e293b" stroke-width="2.4"/>
  <text x="76" y="130" text-anchor="middle" class="t-eq">O</text>
  <text x="166" y="130" text-anchor="middle" class="t-eq" fill="#b91c1c">O⁻</text>
  <!-- Double arrow -->
  <line x1="202" y1="104" x2="258" y2="104" stroke="#2563eb" stroke-width="2.2" marker-start="url(#arr-blue)" marker-end="url(#arr-blue)"/>
  <!-- Right O3 -->
  <text x="336" y="88" text-anchor="middle" class="t-eq" font-size="14">O⁺</text>
  <line x1="324" y1="94" x2="298" y2="116" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="346" y1="92" x2="372" y2="114" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="342" y1="96" x2="368" y2="118" stroke="#1e293b" stroke-width="2.4"/>
  <text x="290" y="130" text-anchor="middle" class="t-eq" fill="#b91c1c">O⁻</text>
  <text x="380" y="130" text-anchor="middle" class="t-eq">O</text>

  <!-- Carbonate hybrid -->
  <rect x="20" y="154" width="420" height="106" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="34" y="172" class="t-sub">Ανθρακικό ανιόν (CO₃²⁻) — Υβρίδιο συντονισμού (3 ίσοι δεσμοί)</text>
  <circle cx="230" cy="216" r="13" fill="url(#atom-c)"/><text x="230" y="220" text-anchor="middle" class="t-w">C</text>
  <line x1="230" y1="202" x2="230" y2="180" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="234" y1="202" x2="234" y2="180" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="3,2"/>
  <circle cx="230" cy="176" r="10" fill="url(#atom-o)"/><text x="230" y="180" text-anchor="middle" class="t-w">O</text>
  <line x1="218" y1="224" x2="194" y2="238" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="216" y1="220" x2="192" y2="234" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="3,2"/>
  <circle cx="188" cy="242" r="10" fill="url(#atom-o)"/><text x="188" y="246" text-anchor="middle" class="t-w">O</text>
  <line x1="242" y1="224" x2="266" y2="238" stroke="#1e293b" stroke-width="2.2"/>
  <line x1="244" y1="220" x2="268" y2="234" stroke="#dc2626" stroke-width="1.6" stroke-dasharray="3,2"/>
  <circle cx="272" cy="242" r="10" fill="url(#atom-o)"/><text x="272" y="246" text-anchor="middle" class="t-w">O</text>
  <text x="348" y="218" text-anchor="middle" class="t-sm">Τάξη δεσμού = 1⅓</text>
  <text x="348" y="234" text-anchor="middle" class="t-sm">Απεντοπισμένα π e⁻</text>

  <rect x="20" y="268" width="420" height="30" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="287" text-anchor="middle" class="t-eq">Ο συντονισμός σταθεροποιεί το μόριο (μικρότερη ενέργεια)</text>
'''
    write_svg("chem3_lewis_resonance.svg", body)


# 7. Hess's Law cycle
def make_hess_law():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Νόμος του Hess — Ενθαλπιακός Κύκλος (ΔH = ΔH₁ + ΔH₂)</text>
  <!-- Top horizontal direct reaction -->
  <rect x="34" y="64" width="136" height="46" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8" filter="url(#soft-shadow)"/>
  <text x="102" y="84" text-anchor="middle" class="t-lbl">Αντιδρώντα (Α)</text>
  <text x="102" y="100" text-anchor="middle" class="t-sm">C(s) + O₂(g)</text>

  <rect x="290" y="64" width="136" height="46" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8" filter="url(#soft-shadow)"/>
  <text x="358" y="84" text-anchor="middle" class="t-lbl">Προϊόντα (Γ)</text>
  <text x="358" y="100" text-anchor="middle" class="t-sm">CO₂(g)</text>

  <!-- Direct arrow -->
  <line x1="176" y1="87" x2="282" y2="87" stroke="#dc2626" stroke-width="2.8" marker-end="url(#arr-red)"/>
  <text x="230" y="76" text-anchor="middle" class="t-eq" fill="#b91c1c">ΔH = −393,5 kJ</text>
  <text x="230" y="104" text-anchor="middle" class="t-sm">(Άμεση οδός)</text>

  <!-- Intermediate bottom -->
  <rect x="154" y="190" width="152" height="46" rx="10" fill="#fef3c7" stroke="#d97706" stroke-width="1.8" filter="url(#soft-shadow)"/>
  <text x="230" y="210" text-anchor="middle" class="t-lbl">Ενδιάμεση Κατάσταση (Β)</text>
  <text x="230" y="226" text-anchor="middle" class="t-sm">CO(g) + ½O₂(g)</text>

  <!-- Step 1 arrow -->
  <line x1="112" y1="116" x2="176" y2="184" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-blue)"/>
  <text x="102" y="162" text-anchor="middle" class="t-eq" fill="#1d4ed8">ΔH₁ = −110,5 kJ</text>

  <!-- Step 2 arrow -->
  <line x1="284" y1="184" x2="348" y2="116" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arr-green)"/>
  <text x="358" y="162" text-anchor="middle" class="t-eq" fill="#15803d">ΔH₂ = −283,0 kJ</text>

  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">Η ΔH εξαρτάται μόνο από την αρχική &amp; τελική κατάσταση: ΔH = ΔH₁ + ΔH₂</text>
'''
    write_svg("chem3_hess_law_cycle.svg", body)


# 8. Maxwell-Boltzmann distribution
def make_maxwell_boltzmann():
    def mb_path(scale_x, peak_h, color):
        pts = []
        for i in range(91):
            u = i / 90 * 4.2
            v = (u * u) * math.exp(-(u / scale_x) ** 2)
            x = 58 + (u / 4.2) * 360
            y = 232 - v * peak_h
            pts.append(f"{'M' if i == 0 else 'L'}{x:.1f},{y:.1f}")
        return f'<path d="{" ".join(pts)}" fill="none" stroke="{color}" stroke-width="2.5"/>'

    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Κατανομή Maxwell–Boltzmann (Θερμοκρασία &amp; Καταλύτης)</text>
  <line x1="58" y1="232" x2="430" y2="232" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <line x1="58" y1="232" x2="58" y2="44" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="434" y="236" class="t-lbl">E_κ</text>
  <text x="48" y="52" text-anchor="end" class="t-lbl">N</text>
  <!-- Ea lines -->
  <line x1="286" y1="62" x2="286" y2="232" stroke="#16a34a" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="286" y="248" text-anchor="middle" class="t-eq" fill="#15803d">E_α(κατ)</text>
  <line x1="342" y1="62" x2="342" y2="232" stroke="#dc2626" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="342" y="248" text-anchor="middle" class="t-eq" fill="#b91c1c">E_α</text>
  <!-- Shaded effective area -->
  <rect x="286" y="182" width="128" height="50" fill="#16a34a" opacity="0.14"/>
  <!-- Curves -->
  {mb_path(1.3, 185, "#2563eb")}
  {mb_path(1.85, 80, "#dc2626")}
  <text x="164" y="88" class="t-eq" fill="#1d4ed8">T₁ (χαμηλή)</text>
  <text x="228" y="128" class="t-eq" fill="#b91c1c">T₂ &gt; T₁ (υψηλή)</text>
  <rect x="20" y="264" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">Αύξηση T ή προσθήκη καταλύτη ⇒ Περισσότερα μόρια με E ≥ E_α ⇒ ↑ u</text>
'''
    write_svg("chem3_maxwell_boltzmann.svg", body)


# 9. Reaction rate C(t)
def make_reaction_rate():
    # Reactant decay & product growth
    r_pts = " ".join(f"{'M' if i==0 else 'L'}{62+(i/60)*348:.1f},{66+156*(1-math.exp(-3.2*i/60)):.1f}" for i in range(61))
    p_pts = " ".join(f"{'M' if i==0 else 'L'}{62+(i/60)*348:.1f},{222-156*(1-math.exp(-3.2*i/60)):.1f}" for i in range(61))
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ταχύτητα Αντίδρασης &amp; Καμπύλες Συγκέντρωσης C(t)</text>
  <line x1="62" y1="226" x2="424" y2="226" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <line x1="62" y1="226" x2="62" y2="44" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="430" y="230" class="t-lbl">t</text>
  <text x="52" y="52" text-anchor="end" class="t-lbl">C</text>
  <path d="{r_pts}" fill="none" stroke="#dc2626" stroke-width="2.6"/>
  <path d="{p_pts}" fill="none" stroke="#16a34a" stroke-width="2.6"/>
  <!-- Tangent line at t1 for instantaneous rate -->
  <line x1="94" y1="88" x2="218" y2="198" stroke="#2563eb" stroke-width="2" stroke-dasharray="5,3"/>
  <circle cx="144" cy="132" r="4.5" fill="#2563eb"/>
  <text x="224" y="198" class="t-sm" fill="#1d4ed8">Εφαπτομένη: u_στιγμ = −dC/dt</text>
  <text x="352" y="210" class="t-eq" fill="#b91c1c">[Αντιδρώντος]</text>
  <text x="352" y="84" class="t-eq" fill="#15803d">[Προϊόντος]</text>
  <rect x="20" y="260" width="420" height="36" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="282" text-anchor="middle" class="t-eq">u_μ = −ΔC_αντ / Δt = +ΔC_πρ / Δt   |   Νόμος ταχύτητας: u = k·[A]ˣ·[B]ʸ</text>
'''
    write_svg("chem3_reaction_rate_conc.svg", body)


# 10. Collision theory
def make_collision_theory():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Θεωρία Συγκρούσεων (Αποτελεσματική vs Ανεπιτυχής)</text>
  <!-- Top: Effective collision -->
  <rect x="18" y="36" width="424" height="106" rx="10" fill="#f0fdf4" stroke="#86efac"/>
  <text x="32" y="54" class="t-sub" fill="#14532d">1. Αποτελεσματική Σύγκρουση (Σωστός προσανατολισμός &amp; E ≥ E_α)</text>
  <!-- A2 + B2 -> 2 AB -->
  <circle cx="72" cy="86" r="13" fill="url(#atom-n)"/><circle cx="72" cy="112" r="13" fill="url(#atom-n)"/>
  <circle cx="132" cy="86" r="13" fill="url(#atom-o)"/><circle cx="132" cy="112" r="13" fill="url(#atom-o)"/>
  <line x1="90" y1="99" x2="114" y2="99" stroke="#16a34a" stroke-width="2" marker-end="url(#arr-green)"/>
  <text x="174" y="104" class="t-eq">→</text>
  <!-- Activated complex -->
  <rect x="196" y="70" width="66" height="58" rx="8" fill="none" stroke="#d97706" stroke-width="1.6" stroke-dasharray="4,3"/>
  <circle cx="216" cy="86" r="11" fill="url(#atom-n)"/><circle cx="216" cy="112" r="11" fill="url(#atom-n)"/>
  <circle cx="242" cy="86" r="11" fill="url(#atom-o)"/><circle cx="242" cy="112" r="11" fill="url(#atom-o)"/>
  <text x="282" y="104" class="t-eq">→</text>
  <!-- 2 AB -->
  <circle cx="322" cy="84" r="12" fill="url(#atom-n)"/><circle cx="346" cy="84" r="12" fill="url(#atom-o)"/>
  <circle cx="322" cy="116" r="12" fill="url(#atom-n)"/><circle cx="346" cy="116" r="12" fill="url(#atom-o)"/>
  <text x="404" y="102" text-anchor="middle" class="t-eq" fill="#15803d">2 AB ✓</text>

  <!-- Bottom: Ineffective collision -->
  <rect x="18" y="152" width="424" height="104" rx="10" fill="#fef2f2" stroke="#fecaca"/>
  <text x="32" y="170" class="t-sub" fill="#991b1b">2. Ανεπιτυχής Σύγκρουση (Λάθος προσανατολισμός ή E &lt; E_α)</text>
  <circle cx="72" cy="198" r="13" fill="url(#atom-n)"/><circle cx="72" cy="224" r="13" fill="url(#atom-n)"/>
  <circle cx="128" cy="211" r="13" fill="url(#atom-o)"/><circle cx="154" cy="211" r="13" fill="url(#atom-o)"/>
  <text x="196" y="216" class="t-eq" fill="#b91c1c">→  Καμία αντίδραση ✗</text>
  <text x="330" y="236" text-anchor="middle" class="t-sm">(Τα μόρια αναπηδούν αναλλοίωτα)</text>

  <rect x="18" y="266" width="424" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="286" text-anchor="middle" class="t-eq">Προϋποθέσεις: 1) Επαρκής ενέργεια (E ≥ E_α)  &amp;  2) Κατάλληλος προσανατολισμός</text>
'''
    write_svg("chem3_collision_theory.svg", body)


# 11. Calorimeter
def make_calorimeter():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Θερμιδόμετρο Μέτρησης Θερμότητας Αντίδρασης</text>
  <!-- Insulated outer wall -->
  <rect x="116" y="68" width="168" height="178" rx="12" fill="url(#hatch)" stroke="#334155" stroke-width="2" filter="url(#soft-shadow)"/>
  <!-- Inner vessel -->
  <rect x="134" y="84" width="132" height="148" rx="8" fill="#ffffff" stroke="#475569" stroke-width="1.6"/>
  <!-- Liquid -->
  <rect x="136" y="132" width="128" height="98" rx="4" fill="url(#glass-liq)"/>
  <!-- Lid -->
  <rect x="110" y="58" width="180" height="16" rx="4" fill="#64748b" stroke="#1e293b" stroke-width="1.5"/>
  <!-- Thermometer -->
  <rect x="172" y="34" width="10" height="164" rx="5" fill="#f8fafc" stroke="#1e293b" stroke-width="1.4"/>
  <rect x="175" y="106" width="4" height="86" fill="#dc2626"/>
  <circle cx="177" cy="194" r="7" fill="#dc2626" stroke="#1e293b"/>
  <!-- Stirrer -->
  <line x1="226" y1="40" x2="226" y2="212" stroke="#1e293b" stroke-width="2.4"/>
  <ellipse cx="226" cy="212" rx="22" ry="5" fill="none" stroke="#1e293b" stroke-width="2.2"/>
  <!-- Labels -->
  <line x1="172" y1="48" x2="96" y2="48" stroke="#1e293b" stroke-width="1.1"/>
  <text x="90" y="52" text-anchor="end" class="t-lbl">Θερμόμετρο</text>
  <line x1="228" y1="48" x2="302" y2="48" stroke="#1e293b" stroke-width="1.1"/>
  <text x="308" y="52" class="t-lbl">Αναδευτήρας</text>
  <line x1="284" y1="118" x2="316" y2="118" stroke="#1e293b" stroke-width="1.1"/>
  <text x="320" y="122" class="t-lbl">Θερμομόνωση</text>
  <line x1="264" y1="178" x2="316" y2="178" stroke="#1e293b" stroke-width="1.1"/>
  <text x="320" y="182" class="t-lbl">Διάλυμα (m, c, ΔT)</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">Q_αντ = −Q_διαλ = −(m·c + C_θερμ)·ΔT    |    ΔH = Q_p / n</text>
'''
    write_svg("chem3_calorimeter_bomb.svg", body)


# 12. Kc concentration vs time
def make_kc_conc():
    a_pts = " ".join(f"{'M' if i==0 else 'L'}{62+(i/60)*348:.1f},{68+72*(1-math.exp(-4.5*min(i/60,0.58))): .1f}" for i in range(61))
    b_pts = " ".join(f"{'M' if i==0 else 'L'}{62+(i/60)*348:.1f},{224-106*(1-math.exp(-4.5*min(i/60,0.58))): .1f}" for i in range(61))
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Αποκατάσταση Χημικής Ισορροπίας: [A], [B] vs t</text>
  <line x1="62" y1="228" x2="424" y2="228" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <line x1="62" y1="228" x2="62" y2="44" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="430" y="232" class="t-lbl">t</text>
  <text x="52" y="52" text-anchor="end" class="t-lbl">C (M)</text>
  <!-- Equilibrium vertical line -->
  <line x1="264" y1="48" x2="264" y2="228" stroke="#7c3aed" stroke-width="1.8" stroke-dasharray="6,4"/>
  <rect x="264" y="48" width="148" height="180" fill="#f3e8ff" opacity="0.32"/>
  <text x="338" y="66" text-anchor="middle" class="t-lbl" fill="#6d28d9">Χημική Ισορροπία</text>
  <text x="338" y="80" text-anchor="middle" class="t-sm" fill="#6d28d9">(C = σταθ., u₁ = u₂)</text>
  <path d="{a_pts}" fill="none" stroke="#dc2626" stroke-width="2.6"/>
  <path d="{b_pts}" fill="none" stroke="#16a34a" stroke-width="2.6"/>
  <text x="366" y="152" class="t-eq" fill="#b91c1c">[Αντιδρών]</text>
  <text x="366" y="114" class="t-eq" fill="#15803d">[Προϊόν]</text>
  <text x="264" y="244" text-anchor="middle" class="t-eq" fill="#6d28d9">t_ισ</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">αA + βB ⇌ γΓ + δΔ    ⇒    K_c = ([Γ]^γ · [Δ]^δ) / ([A]^α · [B]^β)</text>
'''
    write_svg("chem3_kc_concentration_time.svg", body)


# 13. Brønsted-Lowry conjugate pairs
def make_bronsted_lowry():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Θεωρία Brønsted–Lowry &amp; Συζυγή Ζεύγη Οξέος–Βάσης</text>
  <!-- Reaction boxes -->
  <rect x="22" y="106" width="84" height="44" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="1.8"/>
  <text x="64" y="126" text-anchor="middle" class="t-eq" fill="#991b1b">HA</text>
  <text x="64" y="142" text-anchor="middle" class="t-sm">Οξύ 1</text>
  <text x="118" y="132" text-anchor="middle" class="t-title">+</text>

  <rect x="130" y="106" width="84" height="44" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/>
  <text x="172" y="126" text-anchor="middle" class="t-eq" fill="#1e3a8a">H₂O</text>
  <text x="172" y="142" text-anchor="middle" class="t-sm">Βάση 2</text>

  <text x="232" y="133" text-anchor="middle" class="t-title">⇌</text>

  <rect x="250" y="106" width="84" height="44" rx="10" fill="#fef3c7" stroke="#d97706" stroke-width="1.8"/>
  <text x="292" y="126" text-anchor="middle" class="t-eq" fill="#92400e">A⁻</text>
  <text x="292" y="142" text-anchor="middle" class="t-sm">Συζ. Βάση 1</text>
  <text x="346" y="132" text-anchor="middle" class="t-title">+</text>

  <rect x="358" y="106" width="84" height="44" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
  <text x="400" y="126" text-anchor="middle" class="t-eq" fill="#14532d">H₃O⁺</text>
  <text x="400" y="142" text-anchor="middle" class="t-sm">Συζ. Οξύ 2</text>

  <!-- Proton transfer arc -->
  <path d="M74,104 Q118,54 162,102" fill="none" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <text x="118" y="64" text-anchor="middle" class="t-eq" fill="#b91c1c">Δότης H⁺ → Δέκτης H⁺</text>

  <!-- Conjugate brackets -->
  <path d="M64,154 L64,196 L292,196 L292,154" fill="none" stroke="#dc2626" stroke-width="1.8"/>
  <text x="178" y="212" text-anchor="middle" class="t-sm" fill="#b91c1c">Συζυγές Ζεύγος 1 (−H⁺)</text>
  <path d="M172,154 L172,232 L400,232 L400,154" fill="none" stroke="#2563eb" stroke-width="1.8"/>
  <text x="286" y="248" text-anchor="middle" class="t-sm" fill="#1d4ed8">Συζυγές Ζεύγος 2 (+H⁺)</text>

  <rect x="20" y="264" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">Ισχύει πάντα για κάθε συζυγές ζεύγος: K_a · K_b = K_w = 10⁻¹⁴ (25 °C)</text>
'''
    write_svg("chem3_bronsted_lowry_conjugate.svg", body)


# 14. Water autoionization Kw
def make_water_kw():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Αυτοϊοντισμός του Νερού — Γινόμενο Ιόντων K_w</text>
  <rect x="22" y="38" width="416" height="92" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="230" y="68" text-anchor="middle" class="t-eq" font-size="14">2 H₂O (l)  ⇌  H₃O⁺ (aq)  +  OH⁻ (aq)    (ΔH &gt; 0)</text>
  <text x="230" y="96" text-anchor="middle" class="t-eq" fill="#b91c1c">K_w = [H₃O⁺] · [OH⁻] = 10⁻¹⁴  (στους 25 °C)</text>
  <text x="230" y="118" text-anchor="middle" class="t-sm">Ενδόθερμη ⇒ Όταν ↑ T, τότε ↑ K_w (π.χ. στους 50 °C το ουδέτερο pH &lt; 7)</text>
  <!-- 3 regions -->
  <g transform="translate(22,144)">
    <rect width="132" height="106" rx="10" fill="#fee2e2" stroke="#f87171"/>
    <text x="66" y="22" text-anchor="middle" class="t-sub" fill="#991b1b">Όξινο</text>
    <text x="66" y="48" text-anchor="middle" class="t-eq" fill="#b91c1c">[H₃O⁺] &gt; [OH⁻]</text>
    <text x="66" y="70" text-anchor="middle" class="t-sm">[H₃O⁺] &gt; 10⁻⁷ M</text>
    <text x="66" y="92" text-anchor="middle" class="t-eq" fill="#991b1b">pH &lt; 7</text>
  </g>
  <g transform="translate(164,144)">
    <rect width="132" height="106" rx="10" fill="#dcfce7" stroke="#4ade80"/>
    <text x="66" y="22" text-anchor="middle" class="t-sub" fill="#14532d">Ουδέτερο</text>
    <text x="66" y="48" text-anchor="middle" class="t-eq" fill="#15803d">[H₃O⁺] = [OH⁻]</text>
    <text x="66" y="70" text-anchor="middle" class="t-sm">[H₃O⁺] = 10⁻⁷ M</text>
    <text x="66" y="92" text-anchor="middle" class="t-eq" fill="#14532d">pH = 7</text>
  </g>
  <g transform="translate(306,144)">
    <rect width="132" height="106" rx="10" fill="#dbeafe" stroke="#60a5fa"/>
    <text x="66" y="22" text-anchor="middle" class="t-sub" fill="#1e3a8a">Βασικό</text>
    <text x="66" y="48" text-anchor="middle" class="t-eq" fill="#1d4ed8">[H₃O⁺] &lt; [OH⁻]</text>
    <text x="66" y="70" text-anchor="middle" class="t-sm">[OH⁻] &gt; 10⁻⁷ M</text>
    <text x="66" y="92" text-anchor="middle" class="t-eq" fill="#1e3a8a">pH &gt; 7</text>
  </g>
  <rect x="22" y="264" width="416" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">pH = −log[H₃O⁺]   |   pOH = −log[OH⁻]   |   pH + pOH = 14 (25 °C)</text>
'''
    write_svg("chem3_water_autoionization_kw.svg", body)


# 15. Buffer solution mechanism
def make_buffer_solution():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ρυθμιστικό Διάλυμα (Ασθενές Οξύ HA + Συζυγής Βάση A⁻)</text>
  <!-- Central beaker -->
  <rect x="148" y="64" width="164" height="162" rx="12" fill="url(#glass-liq)" stroke="#0284c7" stroke-width="2" filter="url(#soft-shadow)"/>
  <text x="230" y="92" text-anchor="middle" class="t-sub" fill="#0c4a6e">Ρυθμιστικό Διάλυμα</text>
  <rect x="166" y="106" width="128" height="36" rx="8" fill="#ffffff" opacity="0.9"/>
  <text x="230" y="128" text-anchor="middle" class="t-eq">HA  +  A⁻  (σε περίσσεια)</text>
  <text x="230" y="176" text-anchor="middle" class="t-lbl" fill="#0c4a6e">pH ≈ σταθερό!</text>
  <text x="230" y="198" text-anchor="middle" class="t-sm">Μέγιστη ρυθμιστική</text>
  <text x="230" y="212" text-anchor="middle" class="t-sm">ικανότητα: [HA] = [A⁻]</text>
  <!-- Left: Add strong acid H3O+ -->
  <line x1="56" y1="118" x2="140" y2="118" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="74" y="102" text-anchor="middle" class="t-eq" fill="#b91c1c">+ H₃O⁺ (Οξύ)</text>
  <text x="74" y="144" text-anchor="middle" class="t-sm">Εξουδετερώνεται:</text>
  <text x="74" y="160" text-anchor="middle" class="t-eq" fill="#b91c1c">A⁻ + H₃O⁺ → HA</text>
  <!-- Right: Add strong base OH- -->
  <line x1="404" y1="118" x2="320" y2="118" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="386" y="102" text-anchor="middle" class="t-eq" fill="#1d4ed8">+ OH⁻ (Βάση)</text>
  <text x="386" y="144" text-anchor="middle" class="t-sm">Εξουδετερώνεται:</text>
  <text x="386" y="160" text-anchor="middle" class="t-eq" fill="#1d4ed8">HA + OH⁻ → A⁻</text>
  <!-- Henderson-Hasselbalch -->
  <rect x="20" y="256" width="420" height="40" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="274" text-anchor="middle" class="t-eq">Εξίσωση Henderson–Hasselbalch:</text>
  <text x="230" y="290" text-anchor="middle" class="t-eq" fill="#15803d">pH = pK_a + log( C_βάσης / C_οξέος )     (Εύρος: pK_a ± 1)</text>
'''
    write_svg("chem3_buffer_solution.svg", body)


# 16. Acid-base indicators pH ranges
def make_indicators():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Δείκτες Οξέων–Βάσεων &amp; Περιοχές Αλλαγής Χρώματος</text>
  <!-- pH axis 0..14 -->
  <line x1="120" y1="54" x2="428" y2="54" stroke="#1e293b" stroke-width="1.8"/>
  <g font-size="9" fill="#475569" text-anchor="middle">
    <text x="120" y="46">0</text><text x="164" y="46">2</text><text x="208" y="46">4</text>
    <text x="252" y="46">6</text><text x="274" y="46" font-weight="700" fill="#15803d">7</text>
    <text x="296" y="46">8</text><text x="340" y="46">10</text><text x="384" y="46">12</text><text x="428" y="46">14</text>
  </g>
  <line x1="274" y1="54" x2="274" y2="246" stroke="#16a34a" stroke-width="1.2" stroke-dasharray="4,3"/>
  <!-- 1. Methyl Orange (3.1 - 4.4) -->
  <text x="112" y="88" text-anchor="end" class="t-lbl">Ηλιανθίνη</text>
  <text x="112" y="100" text-anchor="end" class="t-sm">(3,1 – 4,4)</text>
  <rect x="120" y="76" width="68" height="24" fill="#ef4444" rx="3"/>
  <rect x="188" y="76" width="29" height="24" fill="#f97316"/>
  <rect x="217" y="76" width="211" height="24" fill="#facc15" rx="3"/>
  <!-- 2. Bromothymol Blue (6.0 - 7.6) -->
  <text x="112" y="144" text-anchor="end" class="t-lbl">Βρωμοθυμόλη</text>
  <text x="112" y="156" text-anchor="end" class="t-sm">(6,0 – 7,6)</text>
  <rect x="120" y="132" width="132" height="24" fill="#facc15" rx="3"/>
  <rect x="252" y="132" width="35" height="24" fill="#22c55e"/>
  <rect x="287" y="132" width="141" height="24" fill="#2563eb" rx="3"/>
  <!-- 3. Phenolphthalein (8.2 - 10.0) -->
  <text x="112" y="200" text-anchor="end" class="t-lbl">Φαινολοφθαλεΐνη</text>
  <text x="112" y="212" text-anchor="end" class="t-sm">(8,2 – 10,0)</text>
  <rect x="120" y="188" width="180" height="24" fill="#f8fafc" stroke="#cbd5e1" rx="3"/>
  <text x="210" y="204" text-anchor="middle" class="t-sm">Άχρωμο</text>
  <rect x="300" y="188" width="40" height="24" fill="#f9a8d4"/>
  <rect x="340" y="188" width="88" height="24" fill="#db2777" rx="3"/>
  <text x="384" y="204" text-anchor="middle" class="t-w">Ερυθροϊώδες</text>

  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">HIn + H₂O ⇌ H₃O⁺ + In⁻    |    Επιλογή δείκτη: pK_In ± 1 να περιέχει το pH_ΙΣ</text>
'''
    write_svg("chem3_indicators_ph_range.svg", body)


# 17. Weak acid + Strong base titration curve
def make_titration_weak_strong():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ογκομέτρηση Ασθενούς Οξέος (CH₃COOH) με Ισχυρή Βάση (NaOH)</text>
  <line x1="62" y1="240" x2="424" y2="240" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <line x1="62" y1="240" x2="62" y2="42" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="428" y="244" class="t-lbl">V(NaOH)</text>
  <text x="52" y="50" text-anchor="end" class="t-lbl">pH</text>
  <!-- pH=7 reference -->
  <line x1="62" y1="142" x2="412" y2="142" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="4,3"/>
  <text x="54" y="146" text-anchor="end" class="t-sm">7</text>
  <!-- Buffer region highlight -->
  <rect x="92" y="162" width="142" height="44" rx="6" fill="#fef3c7" opacity="0.65" stroke="#f59e0b" stroke-dasharray="3,2"/>
  <text x="163" y="200" text-anchor="middle" class="t-sm" fill="#92400e">Ρυθμιστική περιοχή</text>
  <!-- Titration S-curve starting around pH 3, buffer ~4.7, jump around V_eq, EP at pH 8.7 -->
  <path d="M62,202 Q90,182 162,174 Q238,168 256,146 L264,96 Q272,68 320,62 L408,58" fill="none" stroke="#2563eb" stroke-width="2.8"/>
  <!-- Half-equivalence point -->
  <circle cx="162" cy="174" r="4.5" fill="#d97706" stroke="#fff"/>
  <line x1="162" y1="174" x2="162" y2="240" stroke="#d97706" stroke-width="1.2" stroke-dasharray="3,3"/>
  <text x="162" y="254" text-anchor="middle" class="t-sm" fill="#b45309">V_ΙΣ / 2</text>
  <text x="162" y="156" text-anchor="middle" class="t-eq" fill="#b45309">pH = pK_a</text>
  <!-- Equivalence point pH > 7 -->
  <circle cx="260" cy="118" r="5.5" fill="#dc2626" stroke="#fff" stroke-width="1.4"/>
  <line x1="260" y1="118" x2="260" y2="240" stroke="#dc2626" stroke-width="1.3" stroke-dasharray="3,3"/>
  <line x1="62" y1="118" x2="260" y2="118" stroke="#dc2626" stroke-width="1.2" stroke-dasharray="3,3"/>
  <text x="260" y="254" text-anchor="middle" class="t-eq" fill="#b91c1c">V_ΙΣ</text>
  <text x="348" y="114" class="t-eq" fill="#b91c1c">ΙΣ: pH ≈ 8,7 &gt; 7</text>
  <text x="348" y="128" class="t-sm">(Δείκτης: Φαινολοφθαλεΐνη)</text>
  <text x="230" y="290" text-anchor="middle" class="t-sm">Στο ΙΣ υπάρχει το άλας CH₃COONa που υδρολύεται βασικά (pH &gt; 7)</text>
'''
    write_svg("chem3_titration_weak_strong_base.svg", body)


# 18. Salt hydrolysis
def make_salt_hydrolysis():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Υδρόλυση Αλάτων — Οξύτητα Υδατικών Διαλυμάτων</text>
  <!-- 3 columns -->
  <g transform="translate(16,40)">
    <rect width="138" height="214" rx="10" fill="#dcfce7" stroke="#4ade80"/>
    <text x="69" y="22" text-anchor="middle" class="t-sub" fill="#14532d">Ουδέτερο Άλας</text>
    <text x="69" y="42" text-anchor="middle" class="t-sm">Ισχυρό Οξύ +</text>
    <text x="69" y="56" text-anchor="middle" class="t-sm">Ισχυρή Βάση</text>
    <rect x="14" y="72" width="110" height="34" rx="6" fill="#fff"/>
    <text x="69" y="93" text-anchor="middle" class="t-eq">NaCl, KNO₃</text>
    <text x="69" y="132" text-anchor="middle" class="t-sm">Κανένα ιόν δεν</text>
    <text x="69" y="146" text-anchor="middle" class="t-sm">αντιδρά με H₂O</text>
    <text x="69" y="190" text-anchor="middle" class="t-eq" font-size="14" fill="#15803d">pH = 7</text>
  </g>
  <g transform="translate(161,40)">
    <rect width="138" height="214" rx="10" fill="#fee2e2" stroke="#f87171"/>
    <text x="69" y="22" text-anchor="middle" class="t-sub" fill="#991b1b">Όξινο Άλας</text>
    <text x="69" y="42" text-anchor="middle" class="t-sm">Ισχυρό Οξύ +</text>
    <text x="69" y="56" text-anchor="middle" class="t-sm">Ασθενής Βάση</text>
    <rect x="14" y="72" width="110" height="34" rx="6" fill="#fff"/>
    <text x="69" y="93" text-anchor="middle" class="t-eq">NH₄Cl</text>
    <text x="69" y="132" text-anchor="middle" class="t-sm">NH₄⁺ + H₂O ⇌</text>
    <text x="69" y="146" text-anchor="middle" class="t-sm">NH₃ + H₃O⁺</text>
    <text x="69" y="190" text-anchor="middle" class="t-eq" font-size="14" fill="#b91c1c">pH &lt; 7</text>
  </g>
  <g transform="translate(306,40)">
    <rect width="138" height="214" rx="10" fill="#dbeafe" stroke="#60a5fa"/>
    <text x="69" y="22" text-anchor="middle" class="t-sub" fill="#1e3a8a">Βασικό Άλας</text>
    <text x="69" y="42" text-anchor="middle" class="t-sm">Ασθενές Οξύ +</text>
    <text x="69" y="56" text-anchor="middle" class="t-sm">Ισχυρή Βάση</text>
    <rect x="14" y="72" width="110" height="34" rx="6" fill="#fff"/>
    <text x="69" y="93" text-anchor="middle" class="t-eq">CH₃COONa</text>
    <text x="69" y="132" text-anchor="middle" class="t-sm">CH₃COO⁻ + H₂O ⇌</text>
    <text x="69" y="146" text-anchor="middle" class="t-sm">CH₃COOH + OH⁻</text>
    <text x="69" y="190" text-anchor="middle" class="t-eq" font-size="14" fill="#1d4ed8">pH &gt; 7</text>
  </g>
  <rect x="16" y="266" width="428" height="30" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="285" text-anchor="middle" class="t-eq">Μόνο τα συζυγή ιόντα ΑΣΘΕΝΩΝ οξέων/βάσεων υδρολύονται στο νερό!</text>
'''
    write_svg("chem3_salt_hydrolysis.svg", body)


# 19. Redox electron transfer
def make_redox():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Οξειδοαναγωγή: Μεταφορά Ηλεκτρονίων (OIL RIG)</text>
  <!-- Left: Reducing agent (loses e-) -->
  <circle cx="116" cy="148" r="46" fill="url(#atom-amber)" stroke="#92400e" stroke-width="2" filter="url(#soft-shadow)"/>
  <text x="116" y="144" text-anchor="middle" class="t-w" font-size="14">Zn (Αναγ.)</text>
  <text x="116" y="162" text-anchor="middle" class="t-w" font-size="10">Α.Ο.: 0 → +2</text>
  <text x="116" y="218" text-anchor="middle" class="t-lbl" fill="#b45309">ΟΞΕΙΔΩΝΕΤΑΙ</text>
  <text x="116" y="234" text-anchor="middle" class="t-sm">(Δίνει e⁻ • ↑ Α.Ο.)</text>
  <!-- Right: Oxidizing agent (gains e-) -->
  <circle cx="344" cy="148" r="46" fill="url(#atom-n)" stroke="#1e3a8a" stroke-width="2" filter="url(#soft-shadow)"/>
  <text x="344" y="144" text-anchor="middle" class="t-w" font-size="14">Cu²⁺ (Οξειδ.)</text>
  <text x="344" y="162" text-anchor="middle" class="t-w" font-size="10">Α.Ο.: +2 → 0</text>
  <text x="344" y="218" text-anchor="middle" class="t-lbl" fill="#1d4ed8">ΑΝΑΓΕΤΑΙ</text>
  <text x="344" y="234" text-anchor="middle" class="t-sm">(Δέχεται e⁻ • ↓ Α.Ο.)</text>
  <!-- Curved electron transfer arrow -->
  <path d="M156,112 Q230,52 302,110" fill="none" stroke="#dc2626" stroke-width="3" marker-end="url(#arr-red)"/>
  <rect x="192" y="64" width="76" height="24" rx="12" fill="#fee2e2" stroke="#dc2626"/>
  <text x="230" y="80" text-anchor="middle" class="t-eq" fill="#b91c1c">2 e⁻ →</text>
  <rect x="20" y="260" width="420" height="36" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="282" text-anchor="middle" class="t-eq">Zn + Cu²⁺ → Zn²⁺ + Cu    (Συνολικός αριθμός e⁻ που χάνονται = e⁻ που κερδίζονται)</text>
'''
    write_svg("chem3_redox_electron_transfer.svg", body)


# 20. Electrolysis cell (molten NaCl)
def make_electrolysis_cell():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ηλεκτρολυτικό Στοιχείο (Ηλεκτρόλυση Τήγματος NaCl)</text>
  <!-- DC Power source at top -->
  <rect x="184" y="34" width="92" height="30" rx="6" fill="#1e293b"/>
  <text x="230" y="54" text-anchor="middle" class="t-w">DC Πηγή (+ / −)</text>
  <line x1="184" y1="49" x2="146" y2="49" stroke="#dc2626" stroke-width="2.4"/>
  <line x1="146" y1="49" x2="146" y2="108" stroke="#dc2626" stroke-width="2.4"/>
  <line x1="276" y1="49" x2="314" y2="49" stroke="#2563eb" stroke-width="2.4"/>
  <line x1="314" y1="49" x2="314" y2="108" stroke="#2563eb" stroke-width="2.4"/>
  <!-- Beaker -->
  <rect x="92" y="102" width="276" height="148" rx="10" fill="url(#glass-liq)" stroke="#334155" stroke-width="2"/>
  <!-- Anode (+) left, Cathode (-) right -->
  <rect x="134" y="108" width="24" height="106" rx="4" fill="#475569" stroke="#1e293b" stroke-width="1.6"/>
  <text x="146" y="128" text-anchor="middle" class="t-w" font-size="14">+</text>
  <rect x="302" y="108" width="24" height="106" rx="4" fill="#475569" stroke="#1e293b" stroke-width="1.6"/>
  <text x="314" y="128" text-anchor="middle" class="t-w" font-size="14">−</text>
  <!-- Ion migration arrows -->
  <circle cx="212" cy="156" r="13" fill="url(#atom-cl)"/><text x="212" y="160" text-anchor="middle" class="t-w">Cl⁻</text>
  <line x1="196" y1="156" x2="166" y2="156" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <circle cx="248" cy="198" r="13" fill="url(#atom-amber)"/><text x="248" y="202" text-anchor="middle" class="t-w">Na⁺</text>
  <line x1="264" y1="198" x2="294" y2="198" stroke="#d97706" stroke-width="2.2" marker-end="url(#arr-amber)"/>
  <!-- Labels -->
  <text x="46" y="142" text-anchor="middle" class="t-lbl" fill="#b91c1c">Άνοδος (+)</text>
  <text x="46" y="156" text-anchor="middle" class="t-sm">Οξείδωση:</text>
  <text x="46" y="170" text-anchor="middle" class="t-sm">2Cl⁻ → Cl₂↑</text>
  <text x="414" y="142" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Κάθοδος (−)</text>
  <text x="414" y="156" text-anchor="middle" class="t-sm">Αναγωγή:</text>
  <text x="414" y="170" text-anchor="middle" class="t-sm">Na⁺ → Na(l)</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">Ηλεκτρική ενέργεια → Χημική (Μη αυθόρμητη οξειδοαναγωγή)</text>
'''
    write_svg("chem3_electrolysis_cell.svg", body)


# 21. Standard Hydrogen Electrode (SHE)
def make_she():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Πρότυπο Ηλεκτρόδιο Υδρογόνου (SHE — E° = 0,00 V)</text>
  <!-- Beaker with 1 M H+ -->
  <rect x="134" y="96" width="192" height="150" rx="10" fill="url(#glass-liq)" stroke="#334155" stroke-width="2"/>
  <text x="230" y="232" text-anchor="middle" class="t-lbl" fill="#0c4a6e">Διάλυμα HCl 1 M ([H⁺] = 1 M, 25 °C)</text>
  <!-- Glass jacket tube -->
  <path d="M196,62 L196,196 L264,196 L264,62" fill="#ffffff" opacity="0.55" stroke="#1e293b" stroke-width="1.8"/>
  <!-- H2 gas inlet -->
  <path d="M138,76 L196,76" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <text x="128" y="72" text-anchor="end" class="t-eq" fill="#b91c1c">H₂(g)</text>
  <text x="128" y="86" text-anchor="end" class="t-sm">P = 1 atm</text>
  <!-- Pt wire & foil -->
  <line x1="230" y1="38" x2="230" y2="156" stroke="#1e293b" stroke-width="2.6"/>
  <rect x="214" y="156" width="32" height="28" rx="2" fill="#64748b" stroke="#0f172a" stroke-width="1.6"/>
  <text x="230" y="174" text-anchor="middle" class="t-w">Pt</text>
  <!-- Bubbles -->
  <circle cx="208" cy="188" r="3.5" fill="#fff" stroke="#0284c7"/>
  <circle cx="252" cy="184" r="4" fill="#fff" stroke="#0284c7"/>
  <circle cx="246" cy="166" r="3" fill="#fff" stroke="#0284c7"/>
  <!-- Label right -->
  <line x1="248" y1="168" x2="340" y2="168" stroke="#1e293b" stroke-width="1.2"/>
  <text x="346" y="164" class="t-lbl">Ηλεκτρόδιο</text>
  <text x="346" y="178" class="t-sm">λευκόχρυσου (Pt)</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">2H⁺(aq, 1M) + 2e⁻ ⇌ H₂(g, 1atm)    |    E° = 0,00 V (Αναφορά)</text>
'''
    write_svg("chem3_standard_hydrogen_electrode.svg", body)


# 22. Metal reactivity series
def make_reactivity_series():
    metals = [
        ("K, Na, Ca", "#dc2626", "Πολύ δραστικά (αντιδρούν με κρύο H₂O)"),
        ("Mg, Al, Zn, Fe", "#f59e0b", "Αντιδρούν με αραιά οξέα → H₂↑"),
        ("H₂ (Όριο)", "#1e293b", "Εκτοπίζουν το H₂ όσα είναι αριστερά/πάνω"),
        ("Cu, Hg, Ag", "#2563eb", "Δεν αντιδρούν με HCl / αραιό H₂SO₄"),
        ("Pt, Au", "#7c3aed", "Ευγενή μέταλλα (ελάχιστη δραστικότητα)"),
    ]
    rows = []
    for idx, (m, col, desc) in enumerate(metals):
        y = 46 + idx * 42
        rows.append(
            f'<rect x="34" y="{y}" width="118" height="32" rx="8" fill="{col}"/>'
            f'<text x="93" y="{y+20}" text-anchor="middle" class="t-w">{m}</text>'
            f'<text x="166" y="{y+20}" class="t-lbl">{desc}</text>'
        )
    body = f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Σειρά Δραστικότητας Μετάλλων (Απλή Αντικατάσταση)</text>
  <line x1="20" y1="242" x2="20" y2="50" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  {"".join(rows)}
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Κάθε μέταλλο εκτοπίζει από τα άλατά τους τα λιγότερο δραστικά μέταλλα</text>
'''
    write_svg("chem3_metal_reactivity_series.svg", body)


# 23. Geometric isomerism cis / trans
def make_cis_trans():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Γεωμετρική Ισομέρεια cis / trans (2-βουτένιο)</text>
  <!-- Left: cis -->
  <g transform="translate(18,40)">
    <rect width="204" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#1d4ed8">cis-2-βουτένιο</text>
    <line x1="76" y1="116" x2="128" y2="116" stroke="#1e293b" stroke-width="3"/>
    <line x1="76" y1="124" x2="128" y2="124" stroke="#1e293b" stroke-width="3"/>
    <line x1="76" y1="120" x2="46" y2="76" stroke="#1e293b" stroke-width="2.4"/>
    <line x1="128" y1="120" x2="158" y2="76" stroke="#1e293b" stroke-width="2.4"/>
    <line x1="76" y1="120" x2="46" y2="162" stroke="#1e293b" stroke-width="2.4"/>
    <line x1="128" y1="120" x2="158" y2="162" stroke="#1e293b" stroke-width="2.4"/>
    <circle cx="76" cy="120" r="12" fill="url(#atom-c)"/><text x="76" y="124" text-anchor="middle" class="t-w">C</text>
    <circle cx="128" cy="120" r="12" fill="url(#atom-c)"/><text x="128" y="124" text-anchor="middle" class="t-w">C</text>
    <rect x="20" y="54" width="44" height="24" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="42" y="70" text-anchor="middle" class="t-eq">CH₃</text>
    <rect x="140" y="54" width="44" height="24" rx="8" fill="#dbeafe" stroke="#2563eb"/><text x="162" y="70" text-anchor="middle" class="t-eq">CH₃</text>
    <text x="40" y="176" text-anchor="middle" class="t-lbl">H</text>
    <text x="164" y="176" text-anchor="middle" class="t-lbl">H</text>
    <text x="102" y="200" text-anchor="middle" class="t-sm">Ίδιες ομάδες στο ίδιο μέρος (πολικό)</text>
  </g>
  <!-- Right: trans -->
  <g transform="translate(238,40)">
    <rect width="204" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#b91c1c">trans-2-βουτένιο</text>
    <line x1="76" y1="116" x2="128" y2="116" stroke="#1e293b" stroke-width="3"/>
    <line x1="76" y1="124" x2="128" y2="124" stroke="#1e293b" stroke-width="3"/>
    <line x1="76" y1="120" x2="46" y2="76" stroke="#1e293b" stroke-width="2.4"/>
    <line x1="128" y1="120" x2="158" y2="76" stroke="#1e293b" stroke-width="2.4"/>
    <line x1="76" y1="120" x2="46" y2="162" stroke="#1e293b" stroke-width="2.4"/>
    <line x1="128" y1="120" x2="158" y2="162" stroke="#1e293b" stroke-width="2.4"/>
    <circle cx="76" cy="120" r="12" fill="url(#atom-c)"/><text x="76" y="124" text-anchor="middle" class="t-w">C</text>
    <circle cx="128" cy="120" r="12" fill="url(#atom-c)"/><text x="128" y="124" text-anchor="middle" class="t-w">C</text>
    <rect x="20" y="54" width="44" height="24" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="42" y="70" text-anchor="middle" class="t-eq" fill="#b91c1c">CH₃</text>
    <rect x="140" y="158" width="44" height="24" rx="8" fill="#fee2e2" stroke="#dc2626"/><text x="162" y="174" text-anchor="middle" class="t-eq" fill="#b91c1c">CH₃</text>
    <text x="40" y="176" text-anchor="middle" class="t-lbl">H</text>
    <text x="164" y="70" text-anchor="middle" class="t-lbl">H</text>
    <text x="102" y="200" text-anchor="middle" class="t-sm">Διαγώνια (πιο σταθερό, μ = 0)</text>
  </g>
  <rect x="18" y="264" width="424" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Απαραίτητη συνθήκη: Διπλός δεσμός C=C &amp; διαφορετικοί υποκαταστάτες σε κάθε C</text>
'''
    write_svg("chem3_stereoisomerism_cis_trans.svg", body)


# 24. Optical isomerism / Enantiomers
def make_optical_isomerism():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Οπτική Ισομέρεια &amp; Εναντιομερή (Χειρόμορφος C*)</text>
  <!-- Mirror plane -->
  <line x1="230" y1="42" x2="230" y2="248" stroke="#0284c7" stroke-width="2.4" stroke-dasharray="7,4"/>
  <text x="230" y="256" text-anchor="middle" class="t-sm" fill="#0369a1">Καθρέφτης (Επίπεδο συμμετρίας)</text>
  <!-- Left enantiomer -->
  <g transform="translate(118,144)">
    <line x1="0" y1="0" x2="0" y2="-66" stroke="#1e293b" stroke-width="2.4"/>
    <line x1="0" y1="0" x2="-58" y2="38" stroke="#1e293b" stroke-width="2.4"/>
    <line x1="0" y1="0" x2="54" y2="34" stroke="#1e293b" stroke-width="4.2"/>
    <line x1="0" y1="0" x2="18" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="4,3"/>
    <circle r="15" fill="url(#atom-c)" filter="url(#soft-shadow)"/><text y="4" text-anchor="middle" class="t-w">C*</text>
    <circle cy="-72" r="14" fill="url(#atom-o)"/><text y="-68" text-anchor="middle" class="t-w">OH</text>
    <circle cx="-64" cy="42" r="13" fill="url(#atom-h)" stroke="#475569"/><text x="-64" y="46" text-anchor="middle" class="t-lbl">H</text>
    <circle cx="62" cy="38" r="15" fill="url(#atom-cl)"/><text x="62" y="42" text-anchor="middle" class="t-w">Cl</text>
    <circle cx="22" cy="68" r="14" fill="url(#atom-n)"/><text x="22" y="72" text-anchor="middle" class="t-w">CH₃</text>
  </g>
  <!-- Right enantiomer (mirror image) -->
  <g transform="translate(342,144)">
    <line x1="0" y1="0" x2="0" y2="-66" stroke="#1e293b" stroke-width="2.4"/>
    <line x1="0" y1="0" x2="58" y2="38" stroke="#1e293b" stroke-width="2.4"/>
    <line x1="0" y1="0" x2="-54" y2="34" stroke="#1e293b" stroke-width="4.2"/>
    <line x1="0" y1="0" x2="-18" y2="62" stroke="#64748b" stroke-width="2" stroke-dasharray="4,3"/>
    <circle r="15" fill="url(#atom-c)" filter="url(#soft-shadow)"/><text y="4" text-anchor="middle" class="t-w">C*</text>
    <circle cy="-72" r="14" fill="url(#atom-o)"/><text y="-68" text-anchor="middle" class="t-w">OH</text>
    <circle cx="64" cy="42" r="13" fill="url(#atom-h)" stroke="#475569"/><text x="64" y="46" text-anchor="middle" class="t-lbl">H</text>
    <circle cx="-62" cy="38" r="15" fill="url(#atom-cl)"/><text x="-62" y="42" text-anchor="middle" class="t-w">Cl</text>
    <circle cx="-22" cy="68" r="14" fill="url(#atom-n)"/><text x="-22" y="72" text-anchor="middle" class="t-w">CH₃</text>
  </g>
  <rect x="20" y="266" width="420" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="286" text-anchor="middle" class="t-eq">Ασύμμετρος C* με 4 διαφορετικές ομάδες ⇒ Μη υπερτιθέμενα κατοπτρικά είδωλα</text>
'''
    write_svg("chem3_optical_isomerism_enantiomers.svg", body)


# 25. Markovnikov addition
def make_markovnikov():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Κανόνας Markovnikov (Προσθήκη HX σε Ασύμμετρο Αλκένιο)</text>
  <rect x="18" y="40" width="424" height="84" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="230" y="68" text-anchor="middle" class="t-eq" font-size="14">CH₃—CH=CH₂  +  H—Br</text>
  <text x="230" y="96" text-anchor="middle" class="t-sm">Το H προστίθεται στον C του διπλού δεσμού με τα ΠΕΡΙΣΣΟΤΕΡΑ H!</text>
  <!-- Major product -->
  <line x1="168" y1="126" x2="122" y2="164" stroke="#16a34a" stroke-width="2.6" marker-end="url(#arr-green)"/>
  <rect x="18" y="168" width="214" height="82" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
  <text x="125" y="188" text-anchor="middle" class="t-sub" fill="#14532d">Κύριο Προϊόν (~90% ✓)</text>
  <text x="125" y="216" text-anchor="middle" class="t-eq" font-size="13" fill="#14532d">CH₃—CH(Br)—CH₃</text>
  <text x="125" y="236" text-anchor="middle" class="t-sm">2-βρωμοπροπάνιο (2° καρβοκατιόν)</text>
  <!-- Minor product -->
  <line x1="292" y1="126" x2="338" y2="164" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,3" marker-end="url(#arr-dark)"/>
  <rect x="242" y="168" width="200" height="82" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="342" y="188" text-anchor="middle" class="t-sub" fill="#64748b">Δευτερεύον (~10%)</text>
  <text x="342" y="216" text-anchor="middle" class="t-eq" fill="#64748b">CH₃—CH₂—CH₂Br</text>
  <text x="342" y="236" text-anchor="middle" class="t-sm">1-βρωμοπροπάνιο</text>
  <rect x="18" y="264" width="424" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Ισχύει για προσθήκη HCl, HBr, HI, H₂O (H⁺) σε ασύμμετρα αλκένια &amp; αλκίνια</text>
'''
    write_svg("chem3_markovnikov_addition.svg", body)


# 26. Alcohol oxidation scheme (1°, 2°, 3°)
def make_alcohol_oxidation():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Οξείδωση Αλκοολών (1°, 2°, 3° — K₂Cr₂O₇ ή KMnO₄ / H⁺)</text>
  <!-- 1° Alcohol -->
  <rect x="18" y="42" width="112" height="52" rx="8" fill="#dbeafe" stroke="#2563eb"/>
  <text x="74" y="64" text-anchor="middle" class="t-lbl">1° Αλκοόλη</text>
  <text x="74" y="80" text-anchor="middle" class="t-sm">R—CH₂OH</text>
  <line x1="132" y1="68" x2="168" y2="68" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="150" y="58" text-anchor="middle" class="t-sm" fill="#b91c1c">[O]</text>
  <rect x="172" y="42" width="112" height="52" rx="8" fill="#fef3c7" stroke="#d97706"/>
  <text x="228" y="64" text-anchor="middle" class="t-lbl">Αλδεΰδη</text>
  <text x="228" y="80" text-anchor="middle" class="t-sm">R—CHO</text>
  <line x1="286" y1="68" x2="322" y2="68" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="304" y="58" text-anchor="middle" class="t-sm" fill="#b91c1c">[O]</text>
  <rect x="326" y="42" width="116" height="52" rx="8" fill="#fee2e2" stroke="#dc2626"/>
  <text x="384" y="64" text-anchor="middle" class="t-lbl">Καρβ. Οξύ</text>
  <text x="384" y="80" text-anchor="middle" class="t-sm">R—COOH</text>

  <!-- 2° Alcohol -->
  <rect x="18" y="114" width="112" height="52" rx="8" fill="#dcfce7" stroke="#16a34a"/>
  <text x="74" y="136" text-anchor="middle" class="t-lbl">2° Αλκοόλη</text>
  <text x="74" y="152" text-anchor="middle" class="t-sm">R—CH(OH)—R'</text>
  <line x1="132" y1="140" x2="168" y2="140" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="150" y="130" text-anchor="middle" class="t-sm" fill="#b91c1c">[O]</text>
  <rect x="172" y="114" width="112" height="52" rx="8" fill="#fef3c7" stroke="#d97706"/>
  <text x="228" y="136" text-anchor="middle" class="t-lbl">Κετόνη</text>
  <text x="228" y="152" text-anchor="middle" class="t-sm">R—CO—R'</text>
  <text x="360" y="144" text-anchor="middle" class="t-sm">(Δεν οξειδώνεται περαιτέρω ήπια)</text>

  <!-- 3° Alcohol -->
  <rect x="18" y="186" width="112" height="52" rx="8" fill="#f3e8ff" stroke="#7c3aed"/>
  <text x="74" y="208" text-anchor="middle" class="t-lbl">3° Αλκοόλη</text>
  <text x="74" y="224" text-anchor="middle" class="t-sm">R₃C—OH</text>
  <line x1="132" y1="212" x2="168" y2="212" stroke="#94a3b8" stroke-width="2"/>
  <text x="150" y="216" text-anchor="middle" class="t-title" fill="#dc2626">✗</text>
  <rect x="172" y="186" width="270" height="52" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="307" y="210" text-anchor="middle" class="t-lbl" fill="#64748b">Δεν οξειδώνεται (δεν έχει α-υδρογόνο)</text>
  <text x="307" y="226" text-anchor="middle" class="t-sm">Κριτήριο διάκρισης 3° από 1°/2° αλκοόλες!</text>

  <rect x="18" y="260" width="424" height="36" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="282" text-anchor="middle" class="t-eq">Χρωματική αλλαγή: Cr₂O₇²⁻ (πορτοκαλί) → Cr³⁺ (πράσινο) | MnO₄⁻ (ιώδες) → Mn²⁺ (άχρωμο)</text>
'''
    write_svg("chem3_alcohol_oxidation_scheme.svg", body)


# 27. Esterification & Hydrolysis
def make_esterification():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Εστεροποίηση &amp; Υδρόλυση Εστέρα (Αμφίδρομη Αντίδραση)</text>
  <!-- Acid -->
  <rect x="18" y="84" width="114" height="64" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>
  <text x="75" y="110" text-anchor="middle" class="t-eq" fill="#991b1b">R—COOH</text>
  <text x="75" y="132" text-anchor="middle" class="t-sm">Καρβοξυλικό Οξύ</text>
  <text x="142" y="122" text-anchor="middle" class="t-title">+</text>
  <!-- Alcohol -->
  <rect x="152" y="84" width="94" height="64" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6"/>
  <text x="199" y="110" text-anchor="middle" class="t-eq" fill="#1e3a8a">R'—OH</text>
  <text x="199" y="132" text-anchor="middle" class="t-sm">Αλκοόλη</text>
  <!-- Reversible arrows -->
  <line x1="252" y1="108" x2="294" y2="108" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <line x1="294" y1="124" x2="252" y2="124" stroke="#d97706" stroke-width="2.2" marker-end="url(#arr-amber)"/>
  <text x="273" y="98" text-anchor="middle" class="t-sm" fill="#15803d">H⁺ (Θ)</text>
  <text x="273" y="142" text-anchor="middle" class="t-sm" fill="#b45309">Υδρόλυση</text>
  <!-- Ester + Water -->
  <rect x="300" y="84" width="142" height="64" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.6"/>
  <text x="371" y="110" text-anchor="middle" class="t-eq" fill="#14532d">R—COOR' + H₂O</text>
  <text x="371" y="132" text-anchor="middle" class="t-sm">Εστέρας (άρωμα) + Νερό</text>

  <!-- Key notes -->
  <rect x="20" y="176" width="420" height="72" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="34" y="198" class="t-lbl">• Το —OH του H₂O προέρχεται από το ΟΞΥ και το —H από την ΑΛΚΟΟΛΗ.</text>
  <text x="34" y="218" class="t-lbl">• Θερμικά ουδέτερη (ΔH ≈ 0): η K_c δεν αλλάζει με τη θερμοκρασία.</text>
  <text x="34" y="238" class="t-lbl">• Απόδοση αυξάνεται με περίσσεια αντιδρώντος ή απομάκρυνση H₂O.</text>

  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">Εστεροποίηση (→)  |  Όξινη υδρόλυση (←)  |  Αλκαλική υδρόλυση = Σαπωνοποίηση</text>
'''
    write_svg("chem3_esterification_hydrolysis.svg", body)


# 28. Saponification
def make_saponification():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Σαπωνοποίηση (Αλκαλική Υδρόλυση Τριγλυκεριδίου)</text>
  <!-- Triglyceride -->
  <rect x="18" y="56" width="128" height="128" rx="10" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
  <text x="82" y="76" text-anchor="middle" class="t-sub" fill="#92400e">Τριγλυκερίδιο</text>
  <text x="82" y="104" text-anchor="middle" class="t-sm">CH₂—O—CO—R</text>
  <text x="82" y="124" text-anchor="middle" class="t-sm">CH —O—CO—R</text>
  <text x="82" y="144" text-anchor="middle" class="t-sm">CH₂—O—CO—R</text>
  <text x="82" y="170" text-anchor="middle" class="t-sm">(Λίπος / Έλαιο)</text>

  <text x="160" y="124" text-anchor="middle" class="t-title">+</text>
  <rect x="172" y="96" width="66" height="46" rx="8" fill="#dbeafe" stroke="#2563eb"/>
  <text x="205" y="124" text-anchor="middle" class="t-eq">3 NaOH</text>

  <line x1="242" y1="120" x2="276" y2="120" stroke="#1e293b" stroke-width="2.4" marker-end="url(#arr-dark)"/>
  <text x="259" y="110" text-anchor="middle" class="t-sm">Θ</text>

  <!-- Products: Glycerol + 3 Soap -->
  <rect x="282" y="48" width="160" height="72" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.6"/>
  <text x="362" y="68" text-anchor="middle" class="t-sub" fill="#14532d">3 R—COO⁻Na⁺</text>
  <text x="362" y="88" text-anchor="middle" class="t-lbl">Σαπούνι (Άλας λιπαρού</text>
  <text x="362" y="102" text-anchor="middle" class="t-lbl">οξέος — αμφίφιλο)</text>

  <rect x="282" y="132" width="160" height="72" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="1.6"/>
  <text x="362" y="152" text-anchor="middle" class="t-sub" fill="#1e3a8a">Γλυκερίνη (Γλυκερόλη)</text>
  <text x="362" y="174" text-anchor="middle" class="t-sm">CH₂(OH)—CH(OH)—CH₂OH</text>
  <text x="362" y="192" text-anchor="middle" class="t-sm">(Τρισθενής αλκοόλη)</text>

  <rect x="18" y="224" width="424" height="70" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="230" y="246" text-anchor="middle" class="t-eq">Μονόδρομη αντίδραση (πλήρης μετατροπή, όχι ισορροπία)</text>
  <text x="230" y="268" text-anchor="middle" class="t-sm">NaOH → σκληρό σαπούνι   |   KOH → μαλακό (πράσινο) σαπούνι</text>
  <text x="230" y="284" text-anchor="middle" class="t-sm">Υδρόφοβη ουρά (R—) + Υδρόφιλη κεφαλή (—COO⁻)</text>
'''
    write_svg("chem3_saponification.svg", body)


# 29. Addition polymerization
def make_polymerization():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Πολυμερισμός Προσθήκης (Μονομερές → Πολυμερές)</text>
  <!-- Ethene to Polyethylene -->
  <rect x="18" y="42" width="424" height="98" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="32" y="62" class="t-sub" fill="#1e3a8a">1. Αιθένιο → Πολυαιθυλένιο (PE)</text>
  <text x="108" y="106" text-anchor="middle" class="t-eq" font-size="14">n ( CH₂ = CH₂ )</text>
  <line x1="184" y1="102" x2="254" y2="102" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-blue)"/>
  <text x="219" y="92" text-anchor="middle" class="t-sm">P, T, κατ.</text>
  <text x="348" y="106" text-anchor="middle" class="t-eq" font-size="14" fill="#15803d">—[—CH₂—CH₂—]ₙ—</text>
  <text x="108" y="128" text-anchor="middle" class="t-sm">Μονομερές (διπλός δεσμός)</text>
  <text x="348" y="128" text-anchor="middle" class="t-sm">Μακρομόριο (απλοί δεσμοί)</text>

  <!-- Vinyl chloride to PVC -->
  <rect x="18" y="152" width="424" height="98" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="32" y="172" class="t-sub" fill="#991b1b">2. Χλωροαιθένιο → Πολυβινυλοχλωρίδιο (PVC)</text>
  <text x="108" y="216" text-anchor="middle" class="t-eq" font-size="13">n ( CH₂ = CH—Cl )</text>
  <line x1="184" y1="212" x2="254" y2="212" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <text x="348" y="216" text-anchor="middle" class="t-eq" font-size="13" fill="#b91c1c">—[—CH₂—CH(Cl)—]ₙ—</text>
  <text x="348" y="238" text-anchor="middle" class="t-sm">Βαθμός πολυμερισμού: n = M_r(πολυμ.) / M_r(μονομ.)</text>

  <rect x="18" y="264" width="424" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Σπάει ο δεσμός π και ενώνονται n μόρια χωρίς παραπροϊόντα</text>
'''
    write_svg("chem3_polymerization_addition.svg", body)


# 30. Organic synthesis roadmap
def make_organic_roadmap():
    body = '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Οδικός Χάρτης Οργανικών Μετατροπών (Γ΄ Λυκείου)</text>
  <!-- Nodes -->
  <rect x="24" y="48" width="96" height="38" rx="8" fill="#f1f5f9" stroke="#475569" stroke-width="1.6"/>
  <text x="72" y="71" text-anchor="middle" class="t-lbl">Αλκάνιο</text>

  <rect x="182" y="48" width="96" height="38" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6"/>
  <text x="230" y="71" text-anchor="middle" class="t-lbl">Αλκένιο</text>

  <rect x="340" y="48" width="96" height="38" rx="8" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
  <text x="388" y="71" text-anchor="middle" class="t-lbl">Αλκυλαλογονίδιο</text>

  <rect x="182" y="138" width="96" height="38" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="1.6"/>
  <text x="230" y="161" text-anchor="middle" class="t-lbl">Αλκοόλη (1°/2°)</text>

  <rect x="24" y="138" width="96" height="38" rx="8" fill="#f3e8ff" stroke="#7c3aed" stroke-width="1.6"/>
  <text x="72" y="161" text-anchor="middle" class="t-lbl">Αλδεΰδη/Κετόνη</text>

  <rect x="24" y="228" width="96" height="38" rx="8" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>
  <text x="72" y="251" text-anchor="middle" class="t-lbl">Καρβ. Οξύ</text>

  <rect x="182" y="228" width="96" height="38" rx="8" fill="#ffedd5" stroke="#ea580c" stroke-width="1.6"/>
  <text x="230" y="251" text-anchor="middle" class="t-lbl">Εστέρας</text>

  <rect x="340" y="138" width="96" height="38" rx="8" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/>
  <text x="388" y="161" text-anchor="middle" class="t-lbl">Νιτρίλιο (RCN)</text>

  <!-- Arrows -->
  <line x1="180" y1="67" x2="124" y2="67" stroke="#1e293b" stroke-width="1.8" marker-end="url(#arr-dark)"/>
  <text x="152" y="60" text-anchor="middle" class="t-sm">+H₂/Ni</text>
  <line x1="280" y1="60" x2="336" y2="60" stroke="#2563eb" stroke-width="1.8" marker-end="url(#arr-blue)"/>
  <text x="308" y="54" text-anchor="middle" class="t-sm">+HX</text>
  <line x1="336" y1="74" x2="280" y2="74" stroke="#d97706" stroke-width="1.8" marker-end="url(#arr-amber)"/>
  <text x="308" y="88" text-anchor="middle" class="t-sm">NaOH/EtOH</text>
  <line x1="230" y1="88" x2="230" y2="134" stroke="#16a34a" stroke-width="1.8" marker-end="url(#arr-green)"/>
  <text x="252" y="114" class="t-sm">+H₂O/H⁺</text>
  <line x1="364" y1="88" x2="270" y2="136" stroke="#16a34a" stroke-width="1.6" marker-end="url(#arr-green)"/>
  <text x="330" y="122" class="t-sm">NaOH(aq)</text>
  <line x1="388" y1="88" x2="388" y2="134" stroke="#0284c7" stroke-width="1.8" marker-end="url(#arr-blue)"/>
  <text x="412" y="114" class="t-sm">+KCN</text>
  <line x1="180" y1="157" x2="124" y2="157" stroke="#dc2626" stroke-width="1.8" marker-end="url(#arr-red)"/>
  <text x="152" y="150" text-anchor="middle" class="t-sm">[O]</text>
  <line x1="72" y1="178" x2="72" y2="224" stroke="#dc2626" stroke-width="1.8" marker-end="url(#arr-red)"/>
  <text x="86" y="204" class="t-sm">[O]</text>
  <line x1="122" y1="247" x2="178" y2="247" stroke="#ea580c" stroke-width="1.8" marker-end="url(#arr-amber)"/>
  <text x="150" y="240" text-anchor="middle" class="t-sm">+ROH/H⁺</text>
  <text x="364" y="248" text-anchor="middle" class="t-sm">RCN + 2H₂O → RCOOH</text>
'''
    write_svg("chem3_organic_synthesis_map.svg", body)


if __name__ == "__main__":
    generators = [
        make_aufbau,
        make_hybridization,
        make_sigma_pi,
        make_intermolecular,
        make_crystals,
        make_lewis_resonance,
        make_hess_law,
        make_maxwell_boltzmann,
        make_reaction_rate,
        make_collision_theory,
        make_calorimeter,
        make_kc_conc,
        make_bronsted_lowry,
        make_water_kw,
        make_buffer_solution,
        make_indicators,
        make_titration_weak_strong,
        make_salt_hydrolysis,
        make_redox,
        make_electrolysis_cell,
        make_she,
        make_reactivity_series,
        make_cis_trans,
        make_optical_isomerism,
        make_markovnikov,
        make_alcohol_oxidation,
        make_esterification,
        make_saponification,
        make_polymerization,
        make_organic_roadmap,
    ]
    for fn in generators:
        fn()
    files = sorted(f for f in os.listdir(OUT_DIR) if f.startswith("chem3_") and f.endswith(".svg"))
    total_kb = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in files) / 1024
    print(f"Generated {len(files)} Chemistry Lykeio Sketch-Style SVGs in {OUT_DIR} ({total_kb:.1f} KB total, avg {total_kb/len(files):.1f} KB)")
