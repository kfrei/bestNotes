#!/usr/bin/env python3
"""
Generate Batch 7: 30 Rich, Detailed, Sketch-Style Native Vector (.svg) diagrams
for Βιολογία Α΄–Γ΄ Λυκείου (Συστήματα Ανθρώπου, Ανοσία, Καρυότυπος, Μεταλλάξεις,
Ευκαρυωτικό mRNA, Βιοτεχνολογία, Εξέλιξη, Οικολογία & Κύκλοι Άνθρακα/Αζώτου).
Output: public/vectors_stem/biology/bio3_*.svg
"""
import os
import math

OUT_DIR = os.path.join("public", "vectors_stem", "biology")
os.makedirs(OUT_DIR, exist_ok=True)


def svg_wrap(body: str, w: int = 460, h: int = 310) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <defs>
    <filter id="soft-shadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.2" flood-color="#0f172a" flood-opacity="0.14"/>
    </filter>
    <radialGradient id="cell-red" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#fecaca"/>
      <stop offset="50%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </radialGradient>
    <radialGradient id="cell-blue" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#dbeafe"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </radialGradient>
    <radialGradient id="cell-green" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#dcfce7"/>
      <stop offset="50%" stop-color="#22c55e"/>
      <stop offset="100%" stop-color="#14532d"/>
    </radialGradient>
    <radialGradient id="cell-amber" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#fef3c7"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#92400e"/>
    </radialGradient>
    <radialGradient id="cell-purple" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#f3e8ff"/>
      <stop offset="50%" stop-color="#a855f7"/>
      <stop offset="100%" stop-color="#581c87"/>
    </radialGradient>
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
    .t-eq {{ font: 700 10.5px Georgia, "Times New Roman", serif; fill: #14532d; }}
    .t-sm {{ font: 500 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #475569; }}
    .t-w {{ font: 700 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #ffffff; }}
  </style>
{body}
</svg>'''


def write_svg(name: str, body: str):
    with open(os.path.join(OUT_DIR, name), "w", encoding="utf-8") as f:
        f.write(svg_wrap(body))


def make_all():
    # 1. Neuron & Synapse
    write_svg("bio3_neuron_synapse.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Δομή Νευρώνα &amp; Χημική Σύναψη</text>
  <!-- Dendrites -->
  <path d="M74,132 L38,94 M74,132 L32,126 M74,132 L40,164 M74,132 L64,182 M74,132 L64,84" stroke="#7c3aed" stroke-width="2.4" stroke-linecap="round"/>
  <!-- Cell body (soma) -->
  <circle cx="96" cy="132" r="26" fill="url(#cell-purple)" stroke="#581c87" stroke-width="1.6" filter="url(#soft-shadow)"/>
  <circle cx="96" cy="132" r="9" fill="#fef08a"/>
  <!-- Axon + Myelin sheaths -->
  <line x1="122" y1="132" x2="344" y2="132" stroke="#7c3aed" stroke-width="4.5"/>
  <rect x="136" y="121" width="38" height="22" rx="10" fill="#fde68a" stroke="#d97706" stroke-width="1.4"/>
  <rect x="184" y="121" width="38" height="22" rx="10" fill="#fde68a" stroke="#d97706" stroke-width="1.4"/>
  <rect x="232" y="121" width="38" height="22" rx="10" fill="#fde68a" stroke="#d97706" stroke-width="1.4"/>
  <rect x="280" y="121" width="38" height="22" rx="10" fill="#fde68a" stroke="#d97706" stroke-width="1.4"/>
  <!-- Axon terminals + synaptic cleft -->
  <path d="M344,132 L374,104 M344,132 L380,132 M344,132 L374,160" stroke="#7c3aed" stroke-width="2.6" stroke-linecap="round"/>
  <circle cx="378" cy="104" r="6" fill="#a855f7"/>
  <circle cx="384" cy="132" r="6" fill="#a855f7"/>
  <circle cx="378" cy="160" r="6" fill="#a855f7"/>
  <!-- Neurotransmitters & postsynaptic membrane -->
  <circle cx="396" cy="126" r="2.5" fill="#dc2626"/>
  <circle cx="400" cy="136" r="2.5" fill="#dc2626"/>
  <circle cx="395" cy="144" r="2.5" fill="#dc2626"/>
  <path d="M412,92 Q404,132 412,172" fill="none" stroke="#2563eb" stroke-width="4" stroke-linecap="round"/>
  <!-- Direction arrow -->
  <line x1="130" y1="86" x2="320" y2="86" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <text x="225" y="76" text-anchor="middle" class="t-lbl" fill="#b91c1c">Κατεύθυνση Νευρικής Ώσης →</text>
  <!-- Labels -->
  <text x="54" y="204" text-anchor="middle" class="t-sm">Δενδρίτες</text>
  <text x="108" y="176" text-anchor="middle" class="t-sm">Κυτταρικό σώμα</text>
  <text x="226" y="168" text-anchor="middle" class="t-lbl">Νευράξονας &amp; Έλυτρο Μυελίνης</text>
  <text x="394" y="188" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Σύναψη</text>
  <text x="394" y="202" text-anchor="middle" class="t-sm">(Νευροδιαβιβαστές)</text>
  <rect x="20" y="256" width="420" height="38" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="279" text-anchor="middle" class="t-eq">Ηλεκτρικό σήμα στον νευράξονα → Χημική μεταβίβαση στη σύναψη</text>
''')

    # 2. Reflex arc
    write_svg("bio3_reflex_arc.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Αντανακλαστικό Τόξο (Αυτόματη &amp; Ταχεία Αντίδραση)</text>
  <!-- Spinal cord cross section -->
  <ellipse cx="296" cy="144" rx="76" ry="58" fill="#f1f5f9" stroke="#475569" stroke-width="2" filter="url(#soft-shadow)"/>
  <path d="M266,112 Q296,132 326,112 Q314,144 326,176 Q296,156 266,176 Q278,144 266,112 Z" fill="#cbd5e1" stroke="#64748b"/>
  <text x="296" y="218" text-anchor="middle" class="t-lbl">Νωτιαίος Μυελός (Φαιά &amp; Λευκή ουσία)</text>
  <!-- Receptor left top -->
  <rect x="24" y="64" width="114" height="40" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>
  <text x="81" y="82" text-anchor="middle" class="t-lbl" fill="#991b1b">1. Υποδοχέας</text>
  <text x="81" y="96" text-anchor="middle" class="t-sm">(Δέρμα / Ερέθισμα)</text>
  <!-- Effector left bottom -->
  <rect x="24" y="184" width="114" height="40" rx="10" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6"/>
  <text x="81" y="202" text-anchor="middle" class="t-lbl" fill="#1e3a8a">5. Εκτελεστικό</text>
  <text x="81" y="216" text-anchor="middle" class="t-sm">(Μυς → Κίνηση)</text>
  <!-- Sensory neuron (red) -->
  <path d="M138,84 Q206,84 274,124" fill="none" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="196" y="76" text-anchor="middle" class="t-sm" fill="#b91c1c">2. Αισθητικός νευρώνας</text>
  <!-- Interneuron (green) -->
  <path d="M280,128 L292,158" fill="none" stroke="#16a34a" stroke-width="2.6" marker-end="url(#arr-green)"/>
  <text x="342" y="146" class="t-sm" fill="#15803d">3. Ενδιάμεσος</text>
  <!-- Motor neuron (blue) -->
  <path d="M282,164 Q206,204 142,204" fill="none" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="200" y="218" text-anchor="middle" class="t-sm" fill="#1d4ed8">4. Κινητικός νευρώνας</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">Ερέθισμα → Υποδοχέας → Αισθητικός → Νωτιαίος Μυελός → Κινητικός → Μυς</text>
''')

    # 3. Heart & Double circulation
    write_svg("bio3_heart_circulation.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Καρδιά &amp; Διπλή Κυκλοφορία (Μικρή &amp; Μεγάλη)</text>
  <!-- Lungs top -->
  <rect x="154" y="38" width="152" height="38" rx="14" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/>
  <text x="230" y="61" text-anchor="middle" class="t-lbl" fill="#0369a1">Πνεύμονες (Οξυγόνωση)</text>
  <!-- Heart center (4 chambers) -->
  <g transform="translate(174,108)" filter="url(#soft-shadow)">
    <rect x="0" y="0" width="56" height="44" rx="8" fill="#bfdbfe" stroke="#1d4ed8" stroke-width="1.6"/>
    <text x="28" y="26" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Δ. Κόλπος</text>
    <rect x="56" y="0" width="56" height="44" rx="8" fill="#fecaca" stroke="#dc2626" stroke-width="1.6"/>
    <text x="84" y="26" text-anchor="middle" class="t-lbl" fill="#991b1b">Α. Κόλπος</text>
    <rect x="0" y="44" width="56" height="52" rx="8" fill="#60a5fa" stroke="#1e3a8a" stroke-width="1.6"/>
    <text x="28" y="74" text-anchor="middle" class="t-w">Δ. Κοιλία</text>
    <rect x="56" y="44" width="56" height="52" rx="8" fill="#ef4444" stroke="#991b1b" stroke-width="1.6"/>
    <text x="84" y="74" text-anchor="middle" class="t-w">Α. Κοιλία</text>
  </g>
  <!-- Body tissues bottom -->
  <rect x="144" y="238" width="172" height="38" rx="14" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
  <text x="230" y="261" text-anchor="middle" class="t-lbl" fill="#92400e">Ιστοί &amp; Όργανα Σώματος</text>
  <!-- Pulmonary circuit arrows -->
  <path d="M174,174 Q94,140 150,58" fill="none" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="82" y="100" text-anchor="middle" class="t-sm" fill="#1d4ed8">Πνευμονική</text>
  <text x="82" y="113" text-anchor="middle" class="t-sm" fill="#1d4ed8">αρτηρία (CO₂)</text>
  <path d="M310,58 Q366,92 290,126" fill="none" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="380" y="92" text-anchor="middle" class="t-sm" fill="#b91c1c">Πνευμονική</text>
  <text x="380" y="105" text-anchor="middle" class="t-sm" fill="#b91c1c">φλέβα (O₂)</text>
  <!-- Systemic circuit arrows -->
  <path d="M290,180 Q374,210 320,256" fill="none" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="386" y="220" text-anchor="middle" class="t-sm" fill="#b91c1c">Αορτή (O₂)</text>
  <path d="M140,256 Q78,200 170,128" fill="none" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="74" y="220" text-anchor="middle" class="t-sm" fill="#1d4ed8">Κοίλες φλέβες</text>
  <text x="230" y="298" text-anchor="middle" class="t-sm">Μπλε = Φλεβικό αίμα (CO₂)   |   Κόκκινο = Αρτηριακό αίμα (O₂)</text>
''')

    # 4. Blood cells & clotting
    write_svg("bio3_blood_cells_clotting.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Κύτταρα Αίματος &amp; Μηχανισμός Πήξης</text>
  <g transform="translate(18,40)">
    <rect width="136" height="196" rx="10" fill="#fef2f2" stroke="#fca5a5"/>
    <ellipse cx="68" cy="76" rx="36" ry="26" fill="url(#cell-red)" stroke="#991b1b" stroke-width="1.5"/>
    <ellipse cx="68" cy="76" rx="15" ry="9" fill="#991b1b" opacity="0.35"/>
    <text x="68" y="128" text-anchor="middle" class="t-sub" fill="#991b1b">Ερυθρά (RBC)</text>
    <text x="68" y="148" text-anchor="middle" class="t-sm">Απύρηνα, αμφίκοιλα</text>
    <text x="68" y="164" text-anchor="middle" class="t-sm">Αιμοσφαιρίνη (Hb)</text>
    <text x="68" y="180" text-anchor="middle" class="t-sm">Μεταφορά O₂ / CO₂</text>
  </g>
  <g transform="translate(162,40)">
    <rect width="136" height="196" rx="10" fill="#eff6ff" stroke="#93c5fd"/>
    <circle cx="68" cy="76" r="32" fill="url(#cell-blue)" stroke="#1e3a8a" stroke-width="1.5"/>
    <circle cx="58" cy="70" r="9" fill="#1e3a8a"/><circle cx="76" cy="78" r="10" fill="#1e3a8a"/>
    <text x="68" y="128" text-anchor="middle" class="t-sub" fill="#1e3a8a">Λευκά (WBC)</text>
    <text x="68" y="148" text-anchor="middle" class="t-sm">Εμπύρηνα</text>
    <text x="68" y="164" text-anchor="middle" class="t-sm">Φαγοκυττάρωση &amp;</text>
    <text x="68" y="180" text-anchor="middle" class="t-sm">Παραγωγή αντισωμάτων</text>
  </g>
  <g transform="translate(306,40)">
    <rect width="136" height="196" rx="10" fill="#fefce8" stroke="#fde047"/>
    <polygon points="48,68 62,56 76,68 68,84 52,82" fill="url(#cell-amber)" stroke="#92400e"/>
    <polygon points="74,78 88,68 96,82 82,92" fill="url(#cell-amber)" stroke="#92400e"/>
    <line x1="40" y1="62" x2="100" y2="96" stroke="#d97706" stroke-width="1.6" stroke-dasharray="4,2"/>
    <line x1="100" y1="60" x2="40" y2="96" stroke="#d97706" stroke-width="1.6" stroke-dasharray="4,2"/>
    <text x="68" y="128" text-anchor="middle" class="t-sub" fill="#92400e">Αιμοπετάλια</text>
    <text x="68" y="148" text-anchor="middle" class="t-sm">Κυτταρικά θραύσματα</text>
    <text x="68" y="164" text-anchor="middle" class="t-sm">Ινωδογόνο → Ινώδες</text>
    <text x="68" y="180" text-anchor="middle" class="t-sm">Πήξη αίματος (θρόμβος)</text>
  </g>
  <rect x="18" y="252" width="424" height="42" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="270" text-anchor="middle" class="t-eq">Σύσταση Αίματος: ~55% Πλάσμα (νερό, πρωτεΐνες) + ~45% Έμμορφα συστατικά</text>
  <text x="230" y="286" text-anchor="middle" class="t-sm">Παραγωγή όλων των κυττάρων στον ερυθρό μυελό των οστών</text>
''')

    # 5. Nephron & Urine formation
    write_svg("bio3_nephron_urine.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Νεφρώνας &amp; Σχηματισμός Ούρων</text>
  <!-- Bowman's capsule + Glomerulus -->
  <path d="M74,84 A36,36 0 1,0 134,84" fill="#fef3c7" stroke="#d97706" stroke-width="2.4"/>
  <circle cx="104" cy="92" r="18" fill="url(#cell-red)" opacity="0.85"/>
  <text x="104" y="54" text-anchor="middle" class="t-lbl">1. Διήθηση</text>
  <text x="104" y="66" text-anchor="middle" class="t-sm">(Έλυτρο Bowman)</text>
  <!-- Proximal tubule -> Loop of Henle -> Distal tubule -> Collecting duct -->
  <path d="M134,88 Q166,74 186,108 L186,216 Q210,248 234,216 L234,108 Q264,74 302,102 L344,102" fill="none" stroke="#eab308" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M134,88 Q166,74 186,108 L186,216 Q210,248 234,216 L234,108 Q264,74 302,102 L344,102" fill="none" stroke="#854d0e" stroke-width="1.5" stroke-dasharray="5,3"/>
  <!-- Collecting duct -->
  <rect x="342" y="76" width="22" height="168" rx="8" fill="#fde047" stroke="#854d0e" stroke-width="1.8"/>
  <line x1="353" y1="100" x2="353" y2="230" stroke="#854d0e" stroke-width="2" marker-end="url(#arr-dark)"/>
  <!-- Arrows for Reabsorption & Secretion -->
  <line x1="176" y1="158" x2="132" y2="158" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-blue)"/>
  <text x="96" y="156" text-anchor="middle" class="t-lbl" fill="#1d4ed8">2. Επαναρρόφηση</text>
  <text x="96" y="170" text-anchor="middle" class="t-sm">(H₂O, γλυκόζη, Na⁺)</text>
  <line x1="292" y1="154" x2="254" y2="136" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="302" y="172" text-anchor="middle" class="t-lbl" fill="#b91c1c">3. Έκκριση</text>
  <text x="302" y="186" text-anchor="middle" class="t-sm">(H⁺, τοξίνες)</text>
  <text x="210" y="252" text-anchor="middle" class="t-sm">Αγκύλη Henle</text>
  <text x="404" y="158" text-anchor="middle" class="t-lbl">Αθροιστικό</text>
  <text x="404" y="172" text-anchor="middle" class="t-lbl">σωληνάριο</text>
  <text x="404" y="192" text-anchor="middle" class="t-sm">→ Ούρα</text>
  <rect x="20" y="268" width="420" height="30" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="287" text-anchor="middle" class="t-eq">Ομοιόσταση νερού &amp; ιόντων • Απομάκρυνση ουρίας &amp; άχρηστων ουσιών</text>
''')

    # 6. Alveoli gas exchange
    write_svg("bio3_alveoli_gas_exchange.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Πνευμονική Κυψελίδα &amp; Ανταλλαγή Αερίων (O₂ / CO₂)</text>
  <!-- Alveolus sac -->
  <path d="M168,42 L168,84 A78,78 0 1,0 242,84 L242,42" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.4" filter="url(#soft-shadow)"/>
  <text x="205" y="138" text-anchor="middle" class="t-sub" fill="#0369a1">Κυψελίδα</text>
  <text x="205" y="154" text-anchor="middle" class="t-sm">(Αέρας πλούσιος σε O₂)</text>
  <!-- Capillary wrapping bottom -->
  <path d="M44,196 Q116,252 205,252 Q294,252 396,196" fill="none" stroke="#ef4444" stroke-width="24" stroke-linecap="round" opacity="0.22"/>
  <path d="M44,196 Q116,252 205,252" fill="none" stroke="#2563eb" stroke-width="18" stroke-linecap="round" opacity="0.65"/>
  <path d="M205,252 Q294,252 396,196" fill="none" stroke="#dc2626" stroke-width="18" stroke-linecap="round" opacity="0.72"/>
  <!-- Diffusion arrows -->
  <line x1="234" y1="186" x2="254" y2="232" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="278" y="210" class="t-eq" fill="#b91c1c">O₂ (διάχυση)</text>
  <line x1="162" y1="232" x2="180" y2="186" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="114" y="210" class="t-eq" fill="#1d4ed8">CO₂ (διάχυση)</text>
  <!-- Labels -->
  <text x="72" y="176" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Φλεβικό αίμα</text>
  <text x="72" y="188" text-anchor="middle" class="t-sm">(↑ CO₂, ↓ O₂)</text>
  <text x="384" y="176" text-anchor="middle" class="t-lbl" fill="#b91c1c">Αρτηριακό αίμα</text>
  <text x="384" y="188" text-anchor="middle" class="t-sm">(↑ O₂, ↓ CO₂)</text>
  <text x="230" y="294" text-anchor="middle" class="t-eq">Παθητική διάχυση από υψηλότερη προς χαμηλότερη μερική πίεση</text>
''')

    # 7. Intestinal villus
    write_svg("bio3_digestive_villus.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Εντερική Λάχνη &amp; Απορρόφηση Θρεπτικών Ουσιών</text>
  <!-- Villus finger projection -->
  <path d="M132,248 L132,120 Q132,56 184,56 Q236,56 236,120 L236,248 Z" fill="#fef3c7" stroke="#d97706" stroke-width="2.4" filter="url(#soft-shadow)"/>
  <!-- Lacteal (lymphatic) central green -->
  <path d="M184,248 L184,92" stroke="#16a34a" stroke-width="10" stroke-linecap="round"/>
  <!-- Capillary network red/blue -->
  <path d="M162,248 L162,102 Q184,78 206,102 L206,248" fill="none" stroke="#dc2626" stroke-width="3.2"/>
  <path d="M156,144 Q184,132 212,144 M156,184 Q184,172 212,184" fill="none" stroke="#2563eb" stroke-width="2"/>
  <!-- Absorption arrows -->
  <line x1="78" y1="116" x2="128" y2="116" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="72" y="102" text-anchor="middle" class="t-sm" fill="#b91c1c">Γλυκόζη &amp;</text>
  <text x="72" y="114" text-anchor="middle" class="t-sm" fill="#b91c1c">Αμινοξέα</text>
  <line x1="78" y1="176" x2="128" y2="176" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <text x="72" y="164" text-anchor="middle" class="t-sm" fill="#15803d">Λιπαρά οξέα</text>
  <text x="72" y="176" text-anchor="middle" class="t-sm" fill="#15803d">&amp; Γλυκερόλη</text>
  <!-- Right annotations -->
  <line x1="236" y1="92" x2="292" y2="82" stroke="#1e293b" stroke-width="1.2"/>
  <text x="298" y="85" class="t-lbl">Μονόστιβο επιθήλιο</text>
  <line x1="208" y1="136" x2="292" y2="136" stroke="#1e293b" stroke-width="1.2"/>
  <text x="298" y="139" class="t-lbl" fill="#b91c1c">Αιμοφόρα τριχοειδή</text>
  <text x="298" y="152" class="t-sm">(→ Πυλαία φλέβα → Ήπαρ)</text>
  <line x1="188" y1="196" x2="292" y2="196" stroke="#1e293b" stroke-width="1.2"/>
  <text x="298" y="199" class="t-lbl" fill="#15803d">Λεμφαγγείο (Χυλοφόρο)</text>
  <text x="298" y="212" class="t-sm">(Απορρόφηση λιπιδίων)</text>
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Οι λάχνες &amp; μικρολάχνες αυξάνουν τεράστια την επιφάνεια απορρόφησης</text>
''')

    # 8. Eye anatomy & vision defects
    write_svg("bio3_eye_anatomy_vision.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ανατομία Οφθαλμού &amp; Προσαρμογή Όρασης</text>
  <!-- Eyeball -->
  <circle cx="204" cy="148" r="84" fill="#f8fafc" stroke="#1e293b" stroke-width="2.2" filter="url(#soft-shadow)"/>
  <!-- Cornea bulge left -->
  <path d="M126,112 Q104,148 126,184" fill="#e0f2fe" stroke="#0284c7" stroke-width="2.2"/>
  <!-- Lens -->
  <ellipse cx="144" cy="148" rx="11" ry="30" fill="#bae6fd" stroke="#0284c7" stroke-width="1.8"/>
  <!-- Retina arc right -->
  <path d="M244,76 A80,80 0 0,1 244,220" fill="none" stroke="#f59e0b" stroke-width="4.5"/>
  <!-- Optic nerve -->
  <rect x="284" y="138" width="44" height="20" fill="#fde68a" stroke="#b45309" stroke-width="1.6"/>
  <!-- Light rays focusing on retina -->
  <line x1="42" y1="126" x2="144" y2="126" stroke="#dc2626" stroke-width="2"/>
  <line x1="42" y1="170" x2="144" y2="170" stroke="#dc2626" stroke-width="2"/>
  <line x1="144" y1="126" x2="284" y2="148" stroke="#dc2626" stroke-width="2"/>
  <line x1="144" y1="170" x2="284" y2="148" stroke="#dc2626" stroke-width="2"/>
  <!-- Labels -->
  <text x="72" y="102" text-anchor="middle" class="t-lbl">Κερατοειδής</text>
  <text x="144" y="96" text-anchor="middle" class="t-lbl" fill="#0369a1">Κρυσταλλοειδής φακός</text>
  <text x="356" y="114" class="t-lbl" fill="#b45309">Αμφιβληστροειδής</text>
  <text x="356" y="128" class="t-sm">(Ραβδία &amp; Κωνία)</text>
  <text x="356" y="152" class="t-lbl">Οπτικό νεύρο</text>
  <rect x="20" y="256" width="420" height="40" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="274" text-anchor="middle" class="t-eq">Μυωπία: Είδωλο μπροστά (αποκλίνων φακός) | Υπερμετρωπία: Είδωλο πίσω (συγκλίνων)</text>
  <text x="230" y="289" text-anchor="middle" class="t-sm">Κωνία → έγχρωμη όραση (ημέρα)  •  Ραβδία → όραση σε χαμηλό φωτισμό</text>
''')

    # 9. Ear anatomy
    write_svg("bio3_ear_anatomy_hearing.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ανατομία Αυτιού (Ακοή &amp; Ισορροπία)</text>
  <!-- 3 regions background -->
  <rect x="20" y="38" width="130" height="206" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="85" y="56" text-anchor="middle" class="t-sub" fill="#1e3a8a">Εξωτερικό Αυτί</text>
  <rect x="156" y="38" width="126" height="206" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="219" y="56" text-anchor="middle" class="t-sub" fill="#92400e">Μέσο Αυτί</text>
  <rect x="288" y="38" width="152" height="206" rx="8" fill="#f0fdf4" stroke="#86efac"/>
  <text x="364" y="56" text-anchor="middle" class="t-sub" fill="#14532d">Εσωτερικό Αυτί</text>
  <!-- Auditory canal -->
  <path d="M36,124 L152,124 M36,158 L152,158" stroke="#1e293b" stroke-width="2.4"/>
  <text x="92" y="146" text-anchor="middle" class="t-sm">Ακουστικός πόρος</text>
  <!-- Eardrum -->
  <ellipse cx="156" cy="141" rx="6" ry="20" fill="#fca5a5" stroke="#dc2626" stroke-width="2"/>
  <text x="156" y="182" text-anchor="middle" class="t-lbl" fill="#b91c1c">Τύμπανο</text>
  <!-- 3 Ossicles -->
  <path d="M162,138 L194,122 L230,132 L268,140" fill="none" stroke="#b45309" stroke-width="4.5" stroke-linecap="round"/>
  <text x="218" y="106" text-anchor="middle" class="t-lbl">3 Ακουστικά Οστάρια</text>
  <text x="218" y="118" text-anchor="middle" class="t-sm">(Σφύρα, Άκμονας, Αναβολέας)</text>
  <!-- Semicircular canals + Cochlea -->
  <path d="M312,118 A18,18 0 1,1 344,118" fill="none" stroke="#16a34a" stroke-width="3.5"/>
  <text x="330" y="92" text-anchor="middle" class="t-sm" fill="#15803d">Ημικύκλιοι σωλήνες</text>
  <text x="330" y="103" text-anchor="middle" class="t-sm" fill="#15803d">(Ισορροπία)</text>
  <path d="M342,160 A26,26 0 1,1 368,136 A16,16 0 1,1 352,150" fill="none" stroke="#0284c7" stroke-width="4" stroke-linecap="round"/>
  <text x="358" y="198" text-anchor="middle" class="t-lbl" fill="#0369a1">Κοχλίας (Όργανο Corti)</text>
  <text x="358" y="212" text-anchor="middle" class="t-sm">→ Ακουστικό νεύρο</text>
  <rect x="20" y="258" width="420" height="36" rx="8" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="230" y="280" text-anchor="middle" class="t-eq">Ηχητικά κύματα → Τύμπανο → Οστάρια (ενίσχυση) → Κοχλίας → Εγκέφαλος</text>
''')

    # 10. Endocrine negative feedback (Insulin / Glucagon)
    write_svg("bio3_endocrine_feedback.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ενδοκρινικό Σύστημα &amp; Αρνητική Ανάδραση (Γλυκόζη Αίματος)</text>
  <!-- Center homeostasis -->
  <rect x="150" y="132" width="160" height="44" rx="22" fill="#dcfce7" stroke="#16a34a" stroke-width="2" filter="url(#soft-shadow)"/>
  <text x="230" y="152" text-anchor="middle" class="t-lbl" fill="#14532d">Φυσιολογική Γλυκόζη</text>
  <text x="230" y="166" text-anchor="middle" class="t-sm">(~90 mg / 100 mL)</text>
  <!-- Top loop: High glucose -> Pancreas -> Insulin -->
  <path d="M168,130 Q84,80 154,60" fill="none" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <text x="84" y="88" text-anchor="middle" class="t-lbl" fill="#b91c1c">↑ Γλυκόζη</text>
  <text x="84" y="101" text-anchor="middle" class="t-sm">(μετά από γεύμα)</text>
  <rect x="158" y="42" width="144" height="40" rx="10" fill="#fee2e2" stroke="#dc2626"/>
  <text x="230" y="60" text-anchor="middle" class="t-lbl" fill="#991b1b">Πάγκρεας → Ινσουλίνη</text>
  <text x="230" y="74" text-anchor="middle" class="t-sm">Ήπαρ: Γλυκόζη → Γλυκογόνο</text>
  <path d="M304,62 Q376,82 296,130" fill="none" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arr-green)"/>
  <text x="378" y="96" text-anchor="middle" class="t-sm" fill="#15803d">↓ Γλυκόζη</text>
  <!-- Bottom loop: Low glucose -> Pancreas -> Glucagon -->
  <path d="M292,178 Q376,226 306,246" fill="none" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-blue)"/>
  <text x="382" y="216" text-anchor="middle" class="t-lbl" fill="#1d4ed8">↓ Γλυκόζη</text>
  <text x="382" y="229" text-anchor="middle" class="t-sm">(νηστεία/άσκηση)</text>
  <rect x="158" y="226" width="144" height="40" rx="10" fill="#dbeafe" stroke="#2563eb"/>
  <text x="230" y="244" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Πάγκρεας → Γλυκαγόνη</text>
  <text x="230" y="258" text-anchor="middle" class="t-sm">Ήπαρ: Γλυκογόνο → Γλυκόζη</text>
  <path d="M156,246 Q84,226 164,178" fill="none" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arr-green)"/>
  <text x="82" y="216" text-anchor="middle" class="t-sm" fill="#15803d">↑ Γλυκόζη</text>
  <text x="230" y="294" text-anchor="middle" class="t-eq">Ανταγωνιστικές ορμόνες • Διατήρηση εσωτερικής ομοιόστασης</text>
''')

    # 11. Immune response (Antibody-Antigen & Memory)
    write_svg("bio3_immune_antibody_antigen.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ανοσοβιολογική Απόκριση (Αντίσωμα–Αντιγόνο &amp; Μνήμη)</text>
  <!-- Left: Y-shaped Antibody binding Antigen -->
  <rect x="18" y="38" width="198" height="216" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="117" y="56" text-anchor="middle" class="t-sub">Σύμπλοκο Αντιγόνου–Αντισώματος</text>
  <!-- Y antibody -->
  <path d="M117,196 L117,140 M117,140 L84,104 M117,140 L150,104" stroke="#2563eb" stroke-width="9" stroke-linecap="round"/>
  <path d="M98,118 L78,98 M136,118 L156,98" stroke="#60a5fa" stroke-width="6" stroke-linecap="round"/>
  <!-- Antigens fitting tips -->
  <polygon points="68,86 88,86 78,104" fill="#ef4444" stroke="#991b1b"/>
  <polygon points="146,86 166,86 156,104" fill="#ef4444" stroke="#991b1b"/>
  <text x="117" y="80" text-anchor="middle" class="t-lbl" fill="#b91c1c">Αντιγόνα (ειδική σύνδεση)</text>
  <text x="117" y="222" text-anchor="middle" class="t-sm">Πλασματοκύτταρα (Β-λεμφοκύτταρα)</text>
  <text x="117" y="236" text-anchor="middle" class="t-sm">→ Παραγωγή αντισωμάτων</text>
  <!-- Right: Primary vs Secondary response graph -->
  <rect x="226" y="38" width="216" height="216" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="334" y="56" text-anchor="middle" class="t-sub">Πρωτογενής vs Δευτερογενής</text>
  <line x1="246" y1="222" x2="430" y2="222" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <line x1="246" y1="222" x2="246" y2="74" stroke="#1e293b" stroke-width="1.6" marker-end="url(#arr-dark)"/>
  <!-- Primary low bump, Secondary tall fast peak -->
  <path d="M246,222 L268,222 Q286,174 304,196 Q320,210 340,210 L352,210 Q366,84 384,96 Q404,116 426,142" fill="none" stroke="#dc2626" stroke-width="2.6"/>
  <text x="292" y="170" text-anchor="middle" class="t-sm">1η επαφή</text>
  <text x="382" y="86" text-anchor="middle" class="t-lbl" fill="#b91c1c">2η επαφή (Μνήμη!)</text>
  <text x="334" y="242" text-anchor="middle" class="t-sm">Χρόνος (εμβολιασμός → κύτταρα μνήμης)</text>
  <rect x="18" y="264" width="424" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Ειδική Άμυνα: Χυμική (Β-κύτταρα/αντισώματα) &amp; Κυτταρική (Τ-κύτταρα)</text>
''')

    # 12. Muscle sarcomere
    write_svg("bio3_muscle_sarcomere.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Δομή Σαρκομερίου — Μοντέλο Ολίσθησης Νηματίων</text>
  <!-- Z-lines -->
  <line x1="68" y1="54" x2="68" y2="218" stroke="#1e293b" stroke-width="4"/>
  <line x1="392" y1="54" x2="392" y2="218" stroke="#1e293b" stroke-width="4"/>
  <text x="68" y="46" text-anchor="middle" class="t-lbl">Γραμμή Z</text>
  <text x="392" y="46" text-anchor="middle" class="t-lbl">Γραμμή Z</text>
  <!-- Actin (thin blue filaments from Z lines) -->
  <g stroke="#2563eb" stroke-width="3">
    <line x1="68" y1="84" x2="196" y2="84"/><line x1="264" y1="84" x2="392" y2="84"/>
    <line x1="68" y1="136" x2="196" y2="136"/><line x1="264" y1="136" x2="392" y2="136"/>
    <line x1="68" y1="188" x2="196" y2="188"/><line x1="264" y1="188" x2="392" y2="188"/>
  </g>
  <!-- Myosin (thick red filaments in center) -->
  <g stroke="#dc2626" stroke-width="7" stroke-linecap="round">
    <line x1="146" y1="110" x2="314" y2="110"/>
    <line x1="146" y1="162" x2="314" y2="162"/>
  </g>
  <!-- Sliding arrows -->
  <line x1="118" y1="110" x2="140" y2="110" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <line x1="342" y1="110" x2="320" y2="110" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <text x="230" y="72" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Ακτίνη (λεπτά νημάτια)</text>
  <text x="230" y="138" text-anchor="middle" class="t-lbl" fill="#b91c1c">Μυοσίνη (παχιά νημάτια)</text>
  <line x1="68" y1="234" x2="392" y2="234" stroke="#1e293b" stroke-width="1.6" marker-start="url(#arr-dark)" marker-end="url(#arr-dark)"/>
  <text x="230" y="250" text-anchor="middle" class="t-sub">1 Σαρκομέριο (βραχύνεται κατά τη σύσπαση)</text>
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Σύσπαση με κατανάλωση ATP &amp; ιόντων Ca²⁺ (ολίσθηση ακτίνης πάνω στη μυοσίνη)</text>
''')

    # 13. Human Karyotype
    write_svg("bio3_karyotype_human.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ανθρώπινος Καρυότυπος (2n = 46: 44 Αυτοσωμικά + XX / XY)</text>
  <rect x="20" y="36" width="420" height="216" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <!-- Schematic chromosome pairs 1..22 -->
  <g stroke="#2563eb" stroke-width="5" stroke-linecap="round">
    <line x1="48" y1="62" x2="48" y2="108"/><line x1="58" y1="62" x2="58" y2="108"/>
    <line x1="92" y1="66" x2="92" y2="108"/><line x1="102" y1="66" x2="102" y2="108"/>
    <line x1="136" y1="70" x2="136" y2="108"/><line x1="146" y1="70" x2="146" y2="108"/>
    <line x1="180" y1="74" x2="180" y2="108"/><line x1="190" y1="74" x2="190" y2="108"/>
    <line x1="224" y1="78" x2="224" y2="108"/><line x1="234" y1="78" x2="234" y2="108"/>
    <line x1="48" y1="142" x2="48" y2="174"/><line x1="58" y1="142" x2="58" y2="174"/>
    <line x1="92" y1="146" x2="92" y2="174"/><line x1="102" y1="146" x2="102" y2="174"/>
    <line x1="136" y1="150" x2="136" y2="174"/><line x1="146" y1="150" x2="146" y2="174"/>
    <line x1="180" y1="154" x2="180" y2="174"/><line x1="190" y1="154" x2="190" y2="174"/>
    <line x1="224" y1="156" x2="224" y2="174"/><line x1="234" y1="156" x2="234" y2="174"/>
  </g>
  <text x="142" y="124" text-anchor="middle" class="t-sm">Ζεύγη 1 – 12 (ταξινόμηση κατά μέγεθος)</text>
  <text x="142" y="192" text-anchor="middle" class="t-sm">Ζεύγη 13 – 22 (22 ζεύγη αυτοσωμικών)</text>
  <!-- Sex chromosomes box -->
  <rect x="276" y="58" width="144" height="174" rx="10" fill="#fef2f2" stroke="#fca5a5" stroke-width="1.6"/>
  <text x="348" y="78" text-anchor="middle" class="t-sub" fill="#991b1b">Φυλετικά (23ο ζεύγος)</text>
  <!-- XX -->
  <line x1="306" y1="98" x2="306" y2="136" stroke="#db2777" stroke-width="6" stroke-linecap="round"/>
  <line x1="320" y1="98" x2="320" y2="136" stroke="#db2777" stroke-width="6" stroke-linecap="round"/>
  <text x="313" y="154" text-anchor="middle" class="t-lbl" fill="#be185d">XX (Θήλυ)</text>
  <!-- XY -->
  <line x1="376" y1="98" x2="376" y2="136" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/>
  <line x1="390" y1="118" x2="390" y2="136" stroke="#2563eb" stroke-width="6" stroke-linecap="round"/>
  <text x="383" y="154" text-anchor="middle" class="t-lbl" fill="#1d4ed8">XY (Άρρεν)</text>
  <text x="348" y="186" text-anchor="middle" class="t-sm">Μετάφαση μίτωσης</text>
  <text x="348" y="200" text-anchor="middle" class="t-sm">(μέγιστη συσπείρωση)</text>
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Σωματικά κύτταρα: 2n = 46 (διπλοειδή)  |  Γαμέτες: n = 23 (απλοειδείς)</text>
''')

    # 14. Point mutations
    write_svg("bio3_point_mutations.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Γονιδιακές (Σημειακές) Μεταλλάξεις στο DNA</text>
  <!-- Normal -->
  <rect x="20" y="38" width="420" height="52" rx="8" fill="#dcfce7" stroke="#4ade80"/>
  <text x="34" y="56" class="t-sub" fill="#14532d">Φυσιολογικό mRNA:</text>
  <text x="230" y="78" text-anchor="middle" class="t-eq" font-size="13">AUG — GCU — UUC — GGA — UAA   (Met–Ala–Phe–Gly)</text>
  <!-- Substitution -->
  <rect x="20" y="100" width="420" height="68" rx="8" fill="#eff6ff" stroke="#93c5fd"/>
  <text x="34" y="118" class="t-sub" fill="#1e3a8a">1. Αντικατάσταση βάσης (π.χ. U → C):</text>
  <text x="230" y="140" text-anchor="middle" class="t-eq">AUG — GCU — <tspan fill="#dc2626">C</tspan>UC — GGA — UAA   (Met–Ala–<tspan fill="#dc2626">Leu</tspan>–Gly)</text>
  <text x="230" y="158" text-anchor="middle" class="t-sm">Μπορεί να είναι σιωπηλή, παρερμηνεύσιμη ή ανοηματική (κωδικόνιο λήξης)</text>
  <!-- Frameshift insertion/deletion -->
  <rect x="20" y="178" width="420" height="72" rx="8" fill="#fef2f2" stroke="#fca5a5"/>
  <text x="34" y="196" class="t-sub" fill="#991b1b">2. Προσθήκη ή Έλλειψη βάσης (Μετατόπιση πλαισίου ανάγνωσης!):</text>
  <text x="230" y="218" text-anchor="middle" class="t-eq" fill="#991b1b">AUG — GCU — <tspan fill="#dc2626">A</tspan>UU — CGG — AUA — A...</text>
  <text x="230" y="238" text-anchor="middle" class="t-sm">Αλλάζουν ΟΛΑ τα επόμενα κωδικόνια ⇒ τελείως διαφορετική/ανενεργή πρωτεΐνη</text>
  <rect x="20" y="262" width="420" height="32" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="282" text-anchor="middle" class="t-eq">Κλασικό παράδειγμα: Δρεπανοκυτταρική αναιμία (Glu → Val στην αλυσίδα β)</text>
''')

    # 15. Chromosomal aberrations
    write_svg("bio3_chromosomal_aberrations.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Δομικές Χρωμοσωμικές Ανωμαλίες (4 Τύποι)</text>
  <!-- Reference chromosome ABCDEF -->
  <text x="230" y="44" text-anchor="middle" class="t-sm">Αρχικό χρωμόσωμα: [ A | B | C | D | E | F ]</text>
  <!-- 4 cards -->
  <g transform="translate(20,56)">
    <rect width="204" height="92" rx="10" fill="#fef2f2" stroke="#fca5a5"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#991b1b">1. Έλλειψη (Deletion)</text>
    <text x="102" y="54" text-anchor="middle" class="t-eq" font-size="13">[ A | B | <tspan fill="#dc2626">–</tspan> | D | E | F ]</text>
    <text x="102" y="76" text-anchor="middle" class="t-sm">Απώλεια τμήματος (π.χ. Cri-du-chat)</text>
  </g>
  <g transform="translate(236,56)">
    <rect width="204" height="92" rx="10" fill="#eff6ff" stroke="#93c5fd"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#1e3a8a">2. Διπλασιασμός (Duplication)</text>
    <text x="102" y="54" text-anchor="middle" class="t-eq" font-size="13">[ A | B | <tspan fill="#2563eb">C | C</tspan> | D | E | F ]</text>
    <text x="102" y="76" text-anchor="middle" class="t-sm">Επανάληψη χρωμοσωμικού τμήματος</text>
  </g>
  <g transform="translate(20,160)">
    <rect width="204" height="92" rx="10" fill="#fefce8" stroke="#fde047"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#92400e">3. Αναστροφή (Inversion)</text>
    <text x="102" y="54" text-anchor="middle" class="t-eq" font-size="13">[ A | <tspan fill="#d97706">D | C | B</tspan> | E | F ]</text>
    <text x="102" y="76" text-anchor="middle" class="t-sm">Περιστροφή τμήματος κατά 180°</text>
  </g>
  <g transform="translate(236,160)">
    <rect width="204" height="92" rx="10" fill="#f3e8ff" stroke="#d8b4fe"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#581c87">4. Μετατόπιση (Translocation)</text>
    <text x="102" y="54" text-anchor="middle" class="t-eq" font-size="13">[ A | B | C | <tspan fill="#7c3aed">M | N</tspan> ]</text>
    <text x="102" y="76" text-anchor="middle" class="t-sm">Μεταφορά σε μη ομόλογο χρωμόσωμα</text>
  </g>
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Οφείλονται σε θραύσεις &amp; λανθασμένες επανασυνδέσεις χρωμοσωμάτων</text>
''')

    # 16. Nondisjunction in Meiosis
    write_svg("bio3_nondisjunction_meiosis.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Μη Διαχωρισμός Χρωμοσωμάτων στη Μείωση (Ανευπλοειδία)</text>
  <!-- Parent cell 2n -->
  <circle cx="230" cy="64" r="24" fill="#eff6ff" stroke="#2563eb" stroke-width="1.8"/>
  <text x="230" y="68" text-anchor="middle" class="t-lbl">2n</text>
  <!-- Meiosis I error: both go left -->
  <line x1="210" y1="84" x2="144" y2="122" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <line x1="250" y1="84" x2="316" y2="122" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="230" y="106" text-anchor="middle" class="t-sm" fill="#b91c1c">Μη διαχωρισμός (Μείωση Ι)</text>
  <circle cx="130" cy="144" r="22" fill="#fee2e2" stroke="#dc2626" stroke-width="1.8"/>
  <text x="130" y="148" text-anchor="middle" class="t-lbl" fill="#991b1b">n + 1</text>
  <circle cx="330" cy="144" r="22" fill="#f1f5f9" stroke="#64748b" stroke-width="1.8"/>
  <text x="330" y="148" text-anchor="middle" class="t-lbl">n − 1</text>
  <!-- 4 gametes -->
  <line x1="118" y1="166" x2="82" y2="202" stroke="#1e293b" stroke-width="1.8" marker-end="url(#arr-dark)"/>
  <line x1="142" y1="166" x2="178" y2="202" stroke="#1e293b" stroke-width="1.8" marker-end="url(#arr-dark)"/>
  <line x1="318" y1="166" x2="282" y2="202" stroke="#1e293b" stroke-width="1.8" marker-end="url(#arr-dark)"/>
  <line x1="342" y1="166" x2="378" y2="202" stroke="#1e293b" stroke-width="1.8" marker-end="url(#arr-dark)"/>
  <circle cx="76" cy="224" r="20" fill="#fee2e2" stroke="#dc2626"/><text x="76" y="228" text-anchor="middle" class="t-lbl" fill="#991b1b">n+1</text>
  <circle cx="184" cy="224" r="20" fill="#fee2e2" stroke="#dc2626"/><text x="184" y="228" text-anchor="middle" class="t-lbl" fill="#991b1b">n+1</text>
  <circle cx="276" cy="224" r="20" fill="#f1f5f9" stroke="#64748b"/><text x="276" y="228" text-anchor="middle" class="t-lbl">n−1</text>
  <circle cx="384" cy="224" r="20" fill="#f1f5f9" stroke="#64748b"/><text x="384" y="228" text-anchor="middle" class="t-lbl">n−1</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">Γονιμοποίηση (n+1) + n → Τρισωμία (2n+1, π.χ. Σύνδρομο Down 21) | (n−1) + n → Μονοσωμία</text>
''')

    # 17. Eukaryotic pre-mRNA splicing
    write_svg("bio3_eukaryotic_gene_splicing.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ωρίμανση προ-mRNA Ευκαρυωτικών (Εξώνια &amp; Εσώνια)</text>
  <!-- DNA / pre-mRNA -->
  <text x="32" y="60" class="t-sub">πρόδρομο mRNA (στον πυρήνα):</text>
  <rect x="40" y="70" width="76" height="34" rx="4" fill="#2563eb"/><text x="78" y="91" text-anchor="middle" class="t-w">Εξώνιο 1</text>
  <rect x="116" y="74" width="64" height="26" rx="4" fill="#cbd5e1" stroke="#64748b"/><text x="148" y="91" text-anchor="middle" class="t-sm">Εσώνιο 1</text>
  <rect x="180" y="70" width="84" height="34" rx="4" fill="#16a34a"/><text x="222" y="91" text-anchor="middle" class="t-w">Εξώνιο 2</text>
  <rect x="264" y="74" width="66" height="26" rx="4" fill="#cbd5e1" stroke="#64748b"/><text x="297" y="91" text-anchor="middle" class="t-sm">Εσώνιο 2</text>
  <rect x="330" y="70" width="84" height="34" rx="4" fill="#d97706"/><text x="372" y="91" text-anchor="middle" class="t-w">Εξώνιο 3</text>
  <!-- Splicing arrow -->
  <line x1="230" y1="112" x2="230" y2="162" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="242" y="142" class="t-lbl" fill="#b91c1c">Ωρίμανση (Αποκοπή εσωνίων &amp; συρραφή εξωνίων)</text>
  <!-- Mature mRNA -->
  <text x="32" y="182" class="t-sub">Ώριμο mRNA (εξέρχεται στο κυτταρόπλασμα):</text>
  <rect x="26" y="196" width="52" height="30" rx="15" fill="#7c3aed"/><text x="52" y="215" text-anchor="middle" class="t-w">5' Cap</text>
  <rect x="80" y="194" width="82" height="34" rx="4" fill="#2563eb"/><text x="121" y="215" text-anchor="middle" class="t-w">Εξώνιο 1</text>
  <rect x="162" y="194" width="88" height="34" rx="4" fill="#16a34a"/><text x="206" y="215" text-anchor="middle" class="t-w">Εξώνιο 2</text>
  <rect x="250" y="194" width="88" height="34" rx="4" fill="#d97706"/><text x="294" y="215" text-anchor="middle" class="t-w">Εξώνιο 3</text>
  <rect x="340" y="196" width="96" height="30" rx="15" fill="#0284c7"/><text x="388" y="215" text-anchor="middle" class="t-w">Ουρά Poly-A (3')</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">Εξώνια = Κωδικές περιοχές (μεταφράζονται)  |  Εσώνια = Μη κωδικές (απομακρύνονται)</text>
''')

    # 18. Gene therapy
    write_svg("bio3_crispr_gene_editing.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Γονιδιακή Θεραπεία (Εισαγωγή Φυσιολογικού Γονιδίου)</text>
  <!-- 4 steps horizontally -->
  <rect x="18" y="54" width="96" height="106" rx="10" fill="#fee2e2" stroke="#dc2626"/>
  <text x="66" y="76" text-anchor="middle" class="t-sub" fill="#991b1b">1. Ασθενής</text>
  <circle cx="66" cy="118" r="24" fill="#fff" stroke="#dc2626" stroke-width="1.8"/>
  <text x="66" y="122" text-anchor="middle" class="t-sm">Μεταλλαγμένο</text>
  <line x1="116" y1="108" x2="132" y2="108" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>

  <rect x="136" y="54" width="96" height="106" rx="10" fill="#eff6ff" stroke="#2563eb"/>
  <text x="184" y="76" text-anchor="middle" class="t-sub" fill="#1e3a8a">2. Ιός-Φορέας</text>
  <polygon points="184,96 204,108 204,128 184,140 164,128 164,108" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/>
  <text x="184" y="122" text-anchor="middle" class="t-sm">Φυσ. γονίδιο</text>
  <line x1="234" y1="108" x2="250" y2="108" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>

  <rect x="254" y="54" width="96" height="106" rx="10" fill="#fefce8" stroke="#d97706"/>
  <text x="302" y="76" text-anchor="middle" class="t-sub" fill="#92400e">3. Μεταφορά</text>
  <circle cx="302" cy="118" r="24" fill="#fff" stroke="#16a34a" stroke-width="2"/>
  <text x="302" y="122" text-anchor="middle" class="t-sm" fill="#15803d">Ενσωμάτωση</text>
  <line x1="352" y1="108" x2="368" y2="108" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>

  <rect x="372" y="54" width="72" height="106" rx="10" fill="#dcfce7" stroke="#16a34a"/>
  <text x="408" y="76" text-anchor="middle" class="t-sub" fill="#14532d">4. Θεραπεία</text>
  <text x="408" y="114" text-anchor="middle" class="t-sm">Φυσιολογική</text>
  <text x="408" y="128" text-anchor="middle" class="t-sm">πρωτεΐνη ✓</text>

  <rect x="18" y="182" width="424" height="66" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="230" y="204" text-anchor="middle" class="t-lbl">Ex vivo: Κύτταρα τροποποιούνται στο εργαστήριο &amp; επιστρέφουν (π.χ. ανεπάρκεια ADA)</text>
  <text x="230" y="226" text-anchor="middle" class="t-lbl">In vivo: Ο φορέας χορηγείται απευθείας στον οργανισμό (π.χ. κυστική ίνωση)</text>
  <rect x="18" y="262" width="424" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="282" text-anchor="middle" class="t-eq">Εφαρμόζεται μόνο σε σωματικά κύτταρα (δεν κληρονομείται στους απογόνους)</text>
''')

    # 19. cDNA library
    write_svg("bio3_cdna_library.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Κατασκευή cDNA Βιβλιοθήκης (Αντίστροφη Μεταγραφάση)</text>
  <rect x="34" y="46" width="392" height="38" rx="8" fill="#dcfce7" stroke="#16a34a"/>
  <text x="230" y="70" text-anchor="middle" class="t-eq">1. Απομόνωση ώριμου mRNA (μόνο εξώνια, χωρίς εσώνια!)</text>
  <line x1="230" y1="86" x2="230" y2="108" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <rect x="34" y="112" width="392" height="38" rx="8" fill="#eff6ff" stroke="#2563eb"/>
  <text x="230" y="136" text-anchor="middle" class="t-eq">2. Αντίστροφη μεταγραφάση → Υβριδικό μόριο mRNA / cDNA</text>
  <line x1="230" y1="152" x2="230" y2="174" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <rect x="34" y="178" width="392" height="38" rx="8" fill="#fef3c7" stroke="#d97706"/>
  <text x="230" y="202" text-anchor="middle" class="t-eq">3. Αποδόμηση mRNA + DNA πολυμεράση → Δίκλωνο cDNA</text>
  <line x1="230" y1="218" x2="230" y2="240" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <rect x="34" y="244" width="392" height="44" rx="8" fill="#f3e8ff" stroke="#7c3aed"/>
  <text x="230" y="264" text-anchor="middle" class="t-eq" fill="#581c87">4. Ενσωμάτωση σε πλασμίδια → Βακτηριακοί κλώνοι (cDNA Βιβλιοθήκη)</text>
  <text x="230" y="280" text-anchor="middle" class="t-sm">Περιέχει μόνο τα γονίδια που εκφράζονται στον συγκεκριμένο ιστό</text>
''')

    # 20. DNA Fingerprinting
    write_svg("bio3_dna_fingerprinting.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Αποτύπωμα DNA (Εγκληματολογία &amp; Έλεγχος Πατρότητας)</text>
  <rect x="52" y="42" width="356" height="206" rx="10" fill="#f8fafc" stroke="#334155" stroke-width="1.8"/>
  <!-- 4 Lanes: Sample, Suspect 1, Suspect 2, Suspect 3 -->
  <text x="108" y="64" text-anchor="middle" class="t-lbl" fill="#b91c1c">Δείγμα</text>
  <text x="190" y="64" text-anchor="middle" class="t-lbl">Ύποπτος 1</text>
  <text x="272" y="64" text-anchor="middle" class="t-lbl" fill="#15803d">Ύποπτος 2 ✓</text>
  <text x="354" y="64" text-anchor="middle" class="t-lbl">Ύποπτος 3</text>
  <!-- Wells -->
  <rect x="86" y="72" width="44" height="8" fill="#334155"/>
  <rect x="168" y="72" width="44" height="8" fill="#334155"/>
  <rect x="250" y="72" width="44" height="8" fill="#334155"/>
  <rect x="332" y="72" width="44" height="8" fill="#334155"/>
  <!-- Bands: Sample matches Suspect 2 -->
  <g fill="#dc2626">
    <rect x="88" y="102" width="40" height="6" rx="2"/><rect x="88" y="138" width="40" height="6" rx="2"/>
    <rect x="88" y="182" width="40" height="6" rx="2"/><rect x="88" y="216" width="40" height="6" rx="2"/>
  </g>
  <g fill="#64748b">
    <rect x="170" y="96" width="40" height="6" rx="2"/><rect x="170" y="156" width="40" height="6" rx="2"/><rect x="170" y="206" width="40" height="6" rx="2"/>
  </g>
  <g fill="#16a34a">
    <rect x="252" y="102" width="40" height="6" rx="2"/><rect x="252" y="138" width="40" height="6" rx="2"/>
    <rect x="252" y="182" width="40" height="6" rx="2"/><rect x="252" y="216" width="40" height="6" rx="2"/>
  </g>
  <g fill="#64748b">
    <rect x="334" y="114" width="40" height="6" rx="2"/><rect x="334" y="138" width="40" height="6" rx="2"/><rect x="334" y="196" width="40" height="6" rx="2"/>
  </g>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">Βασίζεται σε περιοχές DNA μεταβλητού μήκους (STR) &amp; ηλεκτροφόρηση</text>
''')

    # 21. Natural Selection 3 types
    write_svg("bio3_natural_selection_types.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Τύποι Φυσικής Επιλογής (Κατανομή Φαινοτύπων)</text>
  <!-- 1. Stabilizing -->
  <g transform="translate(16,42)">
    <rect width="138" height="206" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="69" y="20" text-anchor="middle" class="t-sub">Σταθεροποιητική</text>
    <line x1="16" y1="162" x2="122" y2="162" stroke="#1e293b" stroke-width="1.4"/>
    <path d="M18,162 Q69,76 120,162" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4,3"/>
    <path d="M36,162 Q69,48 102,162" fill="none" stroke="#16a34a" stroke-width="2.6"/>
    <text x="69" y="184" text-anchor="middle" class="t-sm">Ευνοεί τους ενδιάμεσους</text>
    <text x="69" y="196" text-anchor="middle" class="t-sm">φαινοτύπους</text>
  </g>
  <!-- 2. Directional -->
  <g transform="translate(161,42)">
    <rect width="138" height="206" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="69" y="20" text-anchor="middle" class="t-sub">Κατευθυντική</text>
    <line x1="16" y1="162" x2="122" y2="162" stroke="#1e293b" stroke-width="1.4"/>
    <path d="M18,162 Q54,76 90,162" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4,3"/>
    <path d="M46,162 Q84,76 122,162" fill="none" stroke="#2563eb" stroke-width="2.6"/>
    <line x1="56" y1="70" x2="86" y2="70" stroke="#2563eb" stroke-width="2" marker-end="url(#arr-blue)"/>
    <text x="69" y="184" text-anchor="middle" class="t-sm">Μετατόπιση προς το ένα</text>
    <text x="69" y="196" text-anchor="middle" class="t-sm">άκρο (π.χ. αντιβιοτικά)</text>
  </g>
  <!-- 3. Disruptive -->
  <g transform="translate(306,42)">
    <rect width="138" height="206" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="69" y="20" text-anchor="middle" class="t-sub">Διασπαστική</text>
    <line x1="16" y1="162" x2="122" y2="162" stroke="#1e293b" stroke-width="1.4"/>
    <path d="M18,162 Q69,76 120,162" fill="none" stroke="#94a3b8" stroke-width="1.8" stroke-dasharray="4,3"/>
    <path d="M16,162 Q42,64 69,146 Q96,64 122,162" fill="none" stroke="#dc2626" stroke-width="2.6"/>
    <text x="69" y="184" text-anchor="middle" class="t-sm">Ευνοεί και τα δύο άκρα</text>
    <text x="69" y="196" text-anchor="middle" class="t-sm">(→ ειδογένεση)</text>
  </g>
  <rect x="16" y="262" width="428" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="282" text-anchor="middle" class="t-eq">Διακεκομμένη: αρχικός πληθυσμός   |   Συνεχής: μετά τη φυσική επιλογή</text>
''')

    # 22. Geographic speciation
    write_svg("bio3_speciation_geographic.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ειδογένεση &amp; Γεωγραφική Απομόνωση (Δαρβίνος)</text>
  <rect x="18" y="48" width="124" height="186" rx="10" fill="#dcfce7" stroke="#16a34a"/>
  <text x="80" y="68" text-anchor="middle" class="t-sub" fill="#14532d">1. Αρχικός Πληθυσμός</text>
  <circle cx="58" cy="116" r="10" fill="url(#cell-green)"/>
  <circle cx="96" cy="126" r="10" fill="url(#cell-green)"/>
  <circle cx="72" cy="158" r="10" fill="url(#cell-green)"/>
  <text x="80" y="206" text-anchor="middle" class="t-sm">Κοινή γονιδιακή</text>
  <text x="80" y="220" text-anchor="middle" class="t-sm">δεξαμενή (1 είδος)</text>
  <line x1="146" y1="140" x2="164" y2="140" stroke="#1e293b" stroke-width="2.2" marker-end="url(#arr-dark)"/>

  <rect x="168" y="48" width="124" height="186" rx="10" fill="#fefce8" stroke="#d97706"/>
  <text x="230" y="68" text-anchor="middle" class="t-sub" fill="#92400e">2. Γεωγραφικός Φραγμός</text>
  <path d="M230,84 L230,218" stroke="#0284c7" stroke-width="10" opacity="0.5"/>
  <text x="230" y="152" text-anchor="middle" class="t-sm" fill="#0369a1">Ποτάμι/Όρος</text>
  <circle cx="196" cy="122" r="9" fill="url(#cell-blue)"/>
  <circle cx="264" cy="176" r="9" fill="url(#cell-amber)"/>
  <text x="230" y="228" text-anchor="middle" class="t-sm">Διαφορετικές μεταλλάξεις</text>
  <line x1="296" y1="140" x2="314" y2="140" stroke="#1e293b" stroke-width="2.2" marker-end="url(#arr-dark)"/>

  <rect x="318" y="48" width="124" height="186" rx="10" fill="#eff6ff" stroke="#2563eb"/>
  <text x="380" y="68" text-anchor="middle" class="t-sub" fill="#1e3a8a">3. 2 Νέα Είδη</text>
  <circle cx="354" cy="118" r="11" fill="url(#cell-blue)"/>
  <circle cx="406" cy="166" r="11" fill="url(#cell-red)"/>
  <text x="380" y="206" text-anchor="middle" class="t-lbl" fill="#b91c1c">Αναπαραγωγική</text>
  <text x="380" y="220" text-anchor="middle" class="t-lbl" fill="#b91c1c">απομόνωση ✗</text>

  <rect x="18" y="256" width="424" height="36" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="278" text-anchor="middle" class="t-eq">Γεωγραφική απομόνωση + Φυσική επιλογή → Αναπαραγωγική απομόνωση (Νέα είδη)</text>
''')

    # 23. Homologous vs Analogous organs
    write_svg("bio3_homologous_analogous.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ομόλογα vs Ανάλογα Όργανα (Αποδείξεις Εξέλιξης)</text>
  <!-- Left: Homologous -->
  <rect x="18" y="40" width="206" height="214" rx="10" fill="#eff6ff" stroke="#2563eb" stroke-width="1.6"/>
  <text x="121" y="62" text-anchor="middle" class="t-sub" fill="#1e3a8a">Ομόλογα Όργανα</text>
  <text x="121" y="84" text-anchor="middle" class="t-lbl">Κοινός πρόγονος &amp; ίδια βασική δομή</text>
  <text x="121" y="102" text-anchor="middle" class="t-sm">Διαφορετική λειτουργία!</text>
  <rect x="34" y="118" width="174" height="72" rx="8" fill="#fff" stroke="#bfdbfe"/>
  <text x="121" y="138" text-anchor="middle" class="t-sm">• Χέρι ανθρώπου (σύλληψη)</text>
  <text x="121" y="156" text-anchor="middle" class="t-sm">• Πτερύγιο φάλαινας (κολύμβηση)</text>
  <text x="121" y="174" text-anchor="middle" class="t-sm">• Πτέρυγα νυχτερίδας (πτήση)</text>
  <text x="121" y="226" text-anchor="middle" class="t-eq" fill="#1d4ed8">Αποκλίνουσα εξέλιξη</text>

  <!-- Right: Analogous -->
  <rect x="236" y="40" width="206" height="214" rx="10" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
  <text x="339" y="62" text-anchor="middle" class="t-sub" fill="#92400e">Ανάλογα Όργανα</text>
  <text x="339" y="84" text-anchor="middle" class="t-lbl">Διαφορετική προέλευση &amp; δομή</text>
  <text x="339" y="102" text-anchor="middle" class="t-sm">Ίδια λειτουργία (παρόμοιο περιβάλλον)!</text>
  <rect x="252" y="118" width="174" height="72" rx="8" fill="#fff" stroke="#fde68a"/>
  <text x="339" y="142" text-anchor="middle" class="t-sm">• Φτερό εντόμου (χιτίνη)</text>
  <text x="339" y="164" text-anchor="middle" class="t-sm">• Φτερό πτηνού (οστά &amp; πούπουλα)</text>
  <text x="339" y="226" text-anchor="middle" class="t-eq" fill="#b45309">Συγκλίνουσα εξέλιξη</text>

  <rect x="18" y="264" width="424" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Μόνο τα ομόλογα όργανα αποδεικνύουν εξελικτική συγγένεια!</text>
''')

    # 24. Ecological energy pyramid (10% rule)
    write_svg("bio3_ecological_pyramids.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Οικολογική Πυραμίδα Ενέργειας (Κανόνας του 10%)</text>
  <!-- 4 trapezoid levels -->
  <polygon points="184,48 276,48 296,94 164,94" fill="#ef4444" stroke="#991b1b" stroke-width="1.5"/>
  <text x="230" y="76" text-anchor="middle" class="t-w">3ης τάξης (10 kcal)</text>

  <polygon points="154,98 306,98 334,146 126,146" fill="#f97316" stroke="#9a3412" stroke-width="1.5"/>
  <text x="230" y="126" text-anchor="middle" class="t-w">Καταναλωτές 2ης τάξης (100 kcal)</text>

  <polygon points="116,150 344,150 374,198 86,198" fill="#eab308" stroke="#854d0e" stroke-width="1.5"/>
  <text x="230" y="178" text-anchor="middle" class="t-lbl">Καταναλωτές 1ης τάξης — Φυτοφάγα (1.000 kcal)</text>

  <polygon points="74,202 386,202 418,252 42,252" fill="#22c55e" stroke="#14532d" stroke-width="1.5"/>
  <text x="230" y="232" text-anchor="middle" class="t-w">Παραγωγοί — Φυτά / Φυτοπλαγκτόν (10.000 kcal)</text>

  <!-- Heat loss arrows on right -->
  <line x1="364" y1="174" x2="424" y2="156" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-red)"/>
  <text x="412" y="144" text-anchor="middle" class="t-sm" fill="#b91c1c">~90% Θερμότητα</text>
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="284" text-anchor="middle" class="t-eq">Μόνο ~10% της ενέργειας περνά στο επόμενο τροφικό επίπεδο (ροή μονόδρομη)</text>
''')

    # 25. Carbon cycle
    write_svg("bio3_carbon_cycle.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ο Κύκλος του Άνθρακα (CO₂ — Φωτοσύνθεση, Αναπνοή, Καύσεις)</text>
  <rect x="148" y="38" width="164" height="38" rx="18" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.8"/>
  <text x="230" y="61" text-anchor="middle" class="t-lbl" fill="#0369a1">Ατμοσφαιρικό CO₂</text>
  <!-- Plants -->
  <rect x="24" y="138" width="124" height="44" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.6"/>
  <text x="86" y="158" text-anchor="middle" class="t-lbl" fill="#14532d">Φυτά (Παραγωγοί)</text>
  <text x="86" y="172" text-anchor="middle" class="t-sm">Οργανικές ενώσεις</text>
  <!-- Animals -->
  <rect x="174" y="138" width="112" height="44" rx="10" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
  <text x="230" y="158" text-anchor="middle" class="t-lbl" fill="#92400e">Ζώα (Καταναλωτές)</text>
  <text x="230" y="172" text-anchor="middle" class="t-sm">Τροφή</text>
  <!-- Fossil fuels & Factories -->
  <rect x="312" y="138" width="128" height="44" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>
  <text x="376" y="158" text-anchor="middle" class="t-lbl" fill="#991b1b">Ορυκτά Καύσιμα</text>
  <text x="376" y="172" text-anchor="middle" class="t-sm">Βιομηχανία / Καύσεις</text>
  <!-- Decomposers bottom -->
  <rect x="144" y="232" width="172" height="40" rx="10" fill="#f1f5f9" stroke="#64748b" stroke-width="1.6"/>
  <text x="230" y="256" text-anchor="middle" class="t-lbl">Αποικοδομητές (Έδαφος)</text>
  <!-- Arrows -->
  <line x1="170" y1="78" x2="96" y2="134" stroke="#16a34a" stroke-width="2.6" marker-end="url(#arr-green)"/>
  <text x="92" y="102" text-anchor="middle" class="t-lbl" fill="#15803d">Φωτοσύνθεση</text>
  <line x1="230" y1="136" x2="230" y2="80" stroke="#d97706" stroke-width="2.2" marker-end="url(#arr-amber)"/>
  <text x="266" y="110" class="t-sm" fill="#b45309">Αναπνοή</text>
  <line x1="364" y1="136" x2="296" y2="78" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="374" y="102" text-anchor="middle" class="t-lbl" fill="#b91c1c">Καύσεις ↑ CO₂</text>
  <line x1="150" y1="160" x2="172" y2="160" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <line x1="86" y1="184" x2="152" y2="232" stroke="#64748b" stroke-width="1.8" marker-end="url(#arr-dark)"/>
  <line x1="230" y1="184" x2="230" y2="228" stroke="#64748b" stroke-width="1.8" marker-end="url(#arr-dark)"/>
  <text x="230" y="294" text-anchor="middle" class="t-sm">Ανακύκλωση άνθρακα μεταξύ ατμόσφαιρας, βιόσφαιρας &amp; λιθόσφαιρας</text>
''')

    # 26. Nitrogen cycle
    write_svg("bio3_nitrogen_cycle.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ο Κύκλος του Αζώτου (N₂ → NH₄⁺ → NO₃⁻ → N₂)</text>
  <rect x="148" y="38" width="164" height="36" rx="18" fill="#dbeafe" stroke="#2563eb" stroke-width="1.8"/>
  <text x="230" y="60" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Ατμοσφαιρικό N₂ (78%)</text>
  <!-- 3 soil boxes -->
  <rect x="24" y="176" width="122" height="52" rx="10" fill="#fef3c7" stroke="#d97706"/>
  <text x="85" y="198" text-anchor="middle" class="t-lbl">Αμμώνιο (NH₄⁺)</text>
  <text x="85" y="216" text-anchor="middle" class="t-sm">Αζωτοδεσμευτικά βακτήρια</text>

  <rect x="168" y="176" width="124" height="52" rx="10" fill="#dcfce7" stroke="#16a34a"/>
  <text x="230" y="198" text-anchor="middle" class="t-lbl">Νιτρικά (NO₃⁻)</text>
  <text x="230" y="216" text-anchor="middle" class="t-sm">Νιτροποιητικά βακτήρια</text>

  <rect x="314" y="114" width="126" height="44" rx="10" fill="#f0fdf4" stroke="#15803d"/>
  <text x="377" y="134" text-anchor="middle" class="t-lbl" fill="#14532d">Φυτά &amp; Ζώα</text>
  <text x="377" y="148" text-anchor="middle" class="t-sm">(Πρωτεΐνες &amp; DNA)</text>

  <!-- Arrows -->
  <line x1="176" y1="76" x2="86" y2="172" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-blue)"/>
  <text x="82" y="122" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Αζωτοδέσμευση</text>
  <text x="82" y="136" text-anchor="middle" class="t-sm">(Ψυχανθή / κεραυνοί)</text>
  <line x1="148" y1="202" x2="166" y2="202" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <line x1="286" y1="176" x2="342" y2="160" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <line x1="230" y1="172" x2="230" y2="78" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="230" y="128" text-anchor="middle" class="t-lbl" fill="#b91c1c">Απονιτροποίηση</text>
  <rect x="20" y="256" width="420" height="36" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="278" text-anchor="middle" class="t-eq">Τα φυτά απορροφούν κυρίως νιτρικά (NO₃⁻) για σύνθεση αμινοξέων &amp; νουκλεϊκών οξέων</text>
''')

    # 27. Food web & trophic levels
    write_svg("bio3_food_web_trophic.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Τροφικό Πλέγμα &amp; Τροφικά Επίπεδα Οικοσυστήματος</text>
  <!-- Top predator -->
  <rect x="176" y="38" width="108" height="34" rx="10" fill="#fee2e2" stroke="#dc2626"/>
  <text x="230" y="59" text-anchor="middle" class="t-lbl" fill="#991b1b">Αετός (3ης τάξης)</text>
  <!-- Secondary consumers -->
  <rect x="74" y="106" width="104" height="34" rx="10" fill="#ffedd5" stroke="#ea580c"/>
  <text x="126" y="127" text-anchor="middle" class="t-lbl">Φίδι (2ης τάξης)</text>
  <rect x="282" y="106" width="104" height="34" rx="10" fill="#ffedd5" stroke="#ea580c"/>
  <text x="334" y="127" text-anchor="middle" class="t-lbl">Αλεπού (2ης)</text>
  <!-- Primary consumers -->
  <rect x="26" y="176" width="102" height="34" rx="10" fill="#fef3c7" stroke="#d97706"/>
  <text x="77" y="197" text-anchor="middle" class="t-lbl">Ακρίδα (1ης)</text>
  <rect x="178" y="176" width="104" height="34" rx="10" fill="#fef3c7" stroke="#d97706"/>
  <text x="230" y="197" text-anchor="middle" class="t-lbl">Ποντικός (1ης)</text>
  <rect x="332" y="176" width="102" height="34" rx="10" fill="#fef3c7" stroke="#d97706"/>
  <text x="383" y="197" text-anchor="middle" class="t-lbl">Λαγός (1ης)</text>
  <!-- Producers -->
  <rect x="74" y="246" width="312" height="36" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
  <text x="230" y="268" text-anchor="middle" class="t-lbl" fill="#14532d">Παραγωγοί: Φυτά / Χόρτα (Φωτοσύνθεση — Ήλιος)</text>
  <!-- Web arrows -->
  <g stroke="#334155" stroke-width="1.6" marker-end="url(#arr-dark)">
    <line x1="126" y1="244" x2="86" y2="212"/><line x1="230" y1="244" x2="230" y2="212"/><line x1="334" y1="244" x2="374" y2="212"/>
    <line x1="86" y1="174" x2="118" y2="142"/><line x1="216" y1="174" x2="146" y2="142"/><line x1="244" y1="174" x2="314" y2="142"/>
    <line x1="374" y1="174" x2="344" y2="142"/><line x1="146" y1="104" x2="206" y2="74"/><line x1="314" y1="104" x2="254" y2="74"/>
    <line x1="230" y1="174" x2="230" y2="74"/>
  </g>
''')

    # 28. Population growth curves (J vs S)
    write_svg("bio3_population_growth_curves.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Καμπύλες Αύξησης Πληθυσμού (Εκθετική J vs Λογιστική S)</text>
  <line x1="62" y1="236" x2="424" y2="236" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <line x1="62" y1="236" x2="62" y2="44" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
  <text x="430" y="240" class="t-lbl">Χρόνος (t)</text>
  <text x="52" y="52" text-anchor="end" class="t-lbl">N</text>
  <!-- Carrying capacity K -->
  <line x1="62" y1="96" x2="416" y2="96" stroke="#dc2626" stroke-width="1.8" stroke-dasharray="6,4"/>
  <text x="342" y="86" class="t-eq" fill="#b91c1c">Φέρουσα ικανότητα (K)</text>
  <!-- J curve (exponential) -->
  <path d="M62,230 Q144,226 196,174 Q236,126 254,52" fill="none" stroke="#dc2626" stroke-width="2.5" stroke-dasharray="5,3"/>
  <text x="256" y="64" class="t-lbl" fill="#b91c1c">Καμπύλη J (Απεριόριστοι πόροι)</text>
  <!-- S curve (logistic) -->
  <path d="M62,230 Q150,224 218,162 Q274,104 342,99 L412,97" fill="none" stroke="#16a34a" stroke-width="3"/>
  <text x="336" y="122" class="t-lbl" fill="#15803d">Καμπύλη S (Περιοριστικοί παράγοντες)</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq">K = μέγιστος πληθυσμός που μπορεί να συντηρήσει σταθερά ένα οικοσύστημα</text>
''')

    # 29. Eutrophication
    write_svg("bio3_eutrophication.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ευτροφισμός Υδάτινων Οικοσυστημάτων</text>
  <rect x="18" y="48" width="96" height="106" rx="10" fill="#fef3c7" stroke="#d97706"/>
  <text x="66" y="72" text-anchor="middle" class="t-sub" fill="#92400e">1. Λιπάσματα</text>
  <text x="66" y="96" text-anchor="middle" class="t-sm">Νιτρικά (NO₃⁻)</text>
  <text x="66" y="112" text-anchor="middle" class="t-sm">&amp; Φωσφορικά</text>
  <text x="66" y="128" text-anchor="middle" class="t-sm">σε λίμνες/θάλασσες</text>
  <line x1="116" y1="100" x2="132" y2="100" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>

  <rect x="136" y="48" width="96" height="106" rx="10" fill="#dcfce7" stroke="#16a34a"/>
  <text x="184" y="72" text-anchor="middle" class="t-sub" fill="#14532d">2. Άνθιση Φυκών</text>
  <text x="184" y="96" text-anchor="middle" class="t-sm">Υπέρμετρη αύξηση</text>
  <text x="184" y="112" text-anchor="middle" class="t-sm">φυτοπλαγκτού</text>
  <text x="184" y="128" text-anchor="middle" class="t-sm">(εμποδίζει το φως)</text>
  <line x1="234" y1="100" x2="250" y2="100" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>

  <rect x="254" y="48" width="96" height="106" rx="10" fill="#e0f2fe" stroke="#0284c7"/>
  <text x="302" y="72" text-anchor="middle" class="t-sub" fill="#0369a1">3. Αποικοδόμηση</text>
  <text x="302" y="96" text-anchor="middle" class="t-sm">Αερόβια βακτήρια</text>
  <text x="302" y="112" text-anchor="middle" class="t-sm">καταναλώνουν</text>
  <text x="302" y="128" text-anchor="middle" class="t-sm">το διαλυμένο O₂</text>
  <line x1="352" y1="100" x2="368" y2="100" stroke="#dc2626" stroke-width="2" marker-end="url(#arr-red)"/>

  <rect x="372" y="48" width="70" height="106" rx="10" fill="#fee2e2" stroke="#dc2626"/>
  <text x="407" y="72" text-anchor="middle" class="t-sub" fill="#991b1b">4. Ανοξία</text>
  <text x="407" y="102" text-anchor="middle" class="t-sm">↓ O₂</text>
  <text x="407" y="120" text-anchor="middle" class="t-sm">Θάνατος</text>
  <text x="407" y="134" text-anchor="middle" class="t-sm">ψαριών</text>

  <!-- Lake schematic bottom -->
  <rect x="20" y="176" width="420" height="72" rx="10" fill="#bae6fd" stroke="#0284c7"/>
  <rect x="20" y="176" width="420" height="16" rx="4" fill="#16a34a" opacity="0.8"/>
  <text x="230" y="188" text-anchor="middle" class="t-w">Πυκνό στρώμα φυτοπλαγκτού στην επιφάνεια (μπλοκάρει το φως)</text>
  <text x="230" y="226" text-anchor="middle" class="t-lbl" fill="#0c4a6e">Βυθός χωρίς O₂ — Υποβάθμιση υδάτινου οικοσυστήματος</text>
  <rect x="20" y="262" width="420" height="32" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="282" text-anchor="middle" class="t-eq">Αντιμετώπιση: Βιολογικός καθαρισμός λυμάτων &amp; ορθολογική λίπανση</text>
''')

    # 30. Retrovirus (HIV) life cycle
    write_svg("bio3_virus_retrovirus_hiv.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Κύκλος Ζωής Ρετροϊού (HIV — Αντίστροφη Μεταγραφή)</text>
  <!-- Host T-helper cell -->
  <rect x="92" y="54" width="338" height="196" rx="28" fill="#f8fafc" stroke="#2563eb" stroke-width="2.2"/>
  <text x="364" y="76" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Τ-βοηθητικό κύτταρο</text>
  <!-- Nucleus -->
  <ellipse cx="298" cy="156" rx="84" ry="52" fill="#eff6ff" stroke="#60a5fa" stroke-width="1.8" stroke-dasharray="5,3"/>
  <text x="298" y="126" text-anchor="middle" class="t-sm" fill="#1e3a8a">Πυρήνας (DNA ξενιστή)</text>
  <!-- HIV virus entering left -->
  <circle cx="52" cy="136" r="24" fill="url(#cell-red)" stroke="#991b1b" stroke-width="1.6" filter="url(#soft-shadow)"/>
  <text x="52" y="134" text-anchor="middle" class="t-w">HIV</text>
  <text x="52" y="146" text-anchor="middle" class="t-w" font-size="8">(RNA)</text>
  <!-- Steps arrows -->
  <line x1="78" y1="136" x2="118" y2="136" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="156" y="132" text-anchor="middle" class="t-lbl">1. RNA ιού</text>
  <line x1="156" y1="142" x2="156" y2="174" stroke="#7c3aed" stroke-width="2.2" marker-end="url(#arr-dark)"/>
  <text x="156" y="192" text-anchor="middle" class="t-lbl" fill="#6d28d9">2. Αντίστροφη</text>
  <text x="156" y="205" text-anchor="middle" class="t-lbl" fill="#6d28d9">μεταγραφή → DNA</text>
  <line x1="198" y1="184" x2="236" y2="164" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <text x="298" y="158" text-anchor="middle" class="t-eq">3. Ενσωμάτωση (Προϊός)</text>
  <text x="298" y="176" text-anchor="middle" class="t-sm">4. Μεταγραφή &amp; Μετάφραση</text>
  <text x="298" y="192" text-anchor="middle" class="t-sm">→ Νέοι ιοί HIV</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#fef2f2" stroke="#fca5a5"/>
  <text x="230" y="283" text-anchor="middle" class="t-eq" fill="#991b1b">RNA → cDNA (αντίστροφη μεταγραφάση) → Ενσωμάτωση στο DNA του ξενιστή</text>
''')


if __name__ == "__main__":
    make_all()
    files = sorted(f for f in os.listdir(OUT_DIR) if f.startswith("bio3_") and f.endswith(".svg"))
    total_kb = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in files) / 1024
    print(f"Generated {len(files)} Biology Lykeio Sketch-Style SVGs in {OUT_DIR} ({total_kb:.1f} KB total, avg {total_kb/len(files):.1f} KB)")
