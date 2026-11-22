#!/usr/bin/env python3
"""
Generate Batch 8: 30 Rich, Detailed, Sketch-Style Native Vector (.svg) diagrams
for Φυσικά Ε΄ & ΣΤ΄ Δημοτικού («Ερευνώ και Ανακαλύπτω» — ebooks.edu.gr aligned).
Output: public/vectors_stem/physics/dim_*.svg
"""
import os

OUT_DIR = os.path.join("public", "vectors_stem", "physics")
os.makedirs(OUT_DIR, exist_ok=True)


def svg_wrap(body: str, w: int = 460, h: int = 310) -> str:
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">
  <defs>
    <filter id="soft-shadow" x="-15%" y="-15%" width="130%" height="130%">
      <feDropShadow dx="1.5" dy="2.5" stdDeviation="2.2" flood-color="#0f172a" flood-opacity="0.14"/>
    </filter>
    <radialGradient id="sun-g" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="55%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#f59e0b"/>
    </radialGradient>
    <radialGradient id="earth-g" cx="35%" cy="30%" r="65%">
      <stop offset="0%" stop-color="#60a5fa"/>
      <stop offset="65%" stop-color="#2563eb"/>
      <stop offset="100%" stop-color="#1e3a8a"/>
    </radialGradient>
    <linearGradient id="water-g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#38bdf8"/>
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
    .t-sm {{ font: 500 9.5px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #475569; }}
    .t-w {{ font: 700 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; fill: #ffffff; }}
  </style>
{body}
</svg>'''


def write_svg(name: str, body: str):
    with open(os.path.join(OUT_DIR, name), "w", encoding="utf-8") as f:
        f.write(svg_wrap(body))


def make_all():
    # 1. Matter states particles
    solid_dots = "".join(f'<circle cx="{38+c*18}" cy="{98+r*18}" r="7" fill="#2563eb"/>' for r in range(4) for c in range(4))
    write_svg("dim_matter_states_particles.svg", f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Οι 3 Καταστάσεις της Ύλης (Στερεό, Υγρό, Αέριο)</text>
  <g transform="translate(16,42)">
    <rect width="136" height="206" rx="12" fill="#eff6ff" stroke="#93c5fd"/>
    <text x="68" y="22" text-anchor="middle" class="t-sub" fill="#1e3a8a">Στερεό</text>
    <rect x="20" y="38" width="96" height="106" rx="8" fill="#fff" stroke="#cbd5e1"/>
    {solid_dots}
    <text x="68" y="166" text-anchor="middle" class="t-sm">Ορισμένο σχήμα</text>
    <text x="68" y="180" text-anchor="middle" class="t-sm">&amp; ορισμένος όγκος</text>
  </g>
  <g transform="translate(162,42)">
    <rect width="136" height="206" rx="12" fill="#e0f2fe" stroke="#38bdf8"/>
    <text x="68" y="22" text-anchor="middle" class="t-sub" fill="#0369a1">Υγρό</text>
    <rect x="20" y="38" width="96" height="106" rx="8" fill="#fff" stroke="#cbd5e1"/>
    <circle cx="38" cy="126" r="7" fill="#0284c7"/><circle cx="58" cy="120" r="7" fill="#0284c7"/><circle cx="80" cy="128" r="7" fill="#0284c7"/><circle cx="98" cy="122" r="7" fill="#0284c7"/>
    <circle cx="46" cy="104" r="7" fill="#0284c7"/><circle cx="68" cy="100" r="7" fill="#0284c7"/><circle cx="90" cy="104" r="7" fill="#0284c7"/>
    <circle cx="56" cy="84" r="7" fill="#0284c7"/><circle cx="82" cy="84" r="7" fill="#0284c7"/>
    <text x="68" y="166" text-anchor="middle" class="t-sm">Παίρνει το σχήμα</text>
    <text x="68" y="180" text-anchor="middle" class="t-sm">του δοχείου (ίδιος όγκος)</text>
  </g>
  <g transform="translate(308,42)">
    <rect width="136" height="206" rx="12" fill="#fef3c7" stroke="#f59e0b"/>
    <text x="68" y="22" text-anchor="middle" class="t-sub" fill="#92400e">Αέριο</text>
    <rect x="20" y="38" width="96" height="106" rx="8" fill="#fff" stroke="#cbd5e1"/>
    <circle cx="42" cy="60" r="6" fill="#d97706"/><circle cx="96" cy="56" r="6" fill="#d97706"/>
    <circle cx="72" cy="92" r="6" fill="#d97706"/><circle cx="38" cy="124" r="6" fill="#d97706"/><circle cx="94" cy="128" r="6" fill="#d97706"/>
    <text x="68" y="166" text-anchor="middle" class="t-sm">Καταλαμβάνει όλο</text>
    <text x="68" y="180" text-anchor="middle" class="t-sm">τον διαθέσιμο χώρο</text>
  </g>
  <rect x="16" y="262" width="428" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="282" text-anchor="middle" class="t-lbl" fill="#14532d">Θέρμανση: Στερεό → (Τήξη) → Υγρό → (Εξάτμιση/Βρασμός) → Αέριο</text>
''')

    # 2. Mixtures separation methods
    write_svg("dim_mixtures_separation_methods.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Μέθοδοι Διαχωρισμού Μειγμάτων (Ε΄ Δημοτικού)</text>
  <g transform="translate(18,42)">
    <rect width="204" height="112" rx="10" fill="#fefce8" stroke="#fde047"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#92400e">1. Κοσκίνισμα</text>
    <rect x="44" y="42" width="116" height="16" rx="4" fill="#d97706" opacity="0.7" stroke="#78350f"/>
    <circle cx="76" cy="36" r="6" fill="#78716c"/><circle cx="116" cy="36" r="6" fill="#78716c"/>
    <circle cx="88" cy="76" r="3" fill="#ca8a04"/><circle cx="110" cy="82" r="3" fill="#ca8a04"/>
    <text x="102" y="102" text-anchor="middle" class="t-sm">Στερεά διαφορετικού μεγέθους</text>
  </g>
  <g transform="translate(238,42)">
    <rect width="204" height="112" rx="10" fill="#eff6ff" stroke="#93c5fd"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#1e3a8a">2. Διήθηση (Φιλτράρισμα)</text>
    <polygon points="74,36 130,36 108,68 96,68" fill="#fff" stroke="#2563eb" stroke-width="1.8"/>
    <line x1="102" y1="70" x2="102" y2="86" stroke="#38bdf8" stroke-width="2.5"/>
    <text x="102" y="102" text-anchor="middle" class="t-sm">Αδιάλυτο στερεό από υγρό (π.χ. άμμος+νερό)</text>
  </g>
  <g transform="translate(18,164)">
    <rect width="204" height="112" rx="10" fill="#f0fdf4" stroke="#86efac"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#14532d">3. Εξάτμιση</text>
    <rect x="58" y="54" width="88" height="32" rx="6" fill="url(#water-g)" stroke="#0284c7"/>
    <path d="M84,48 Q80,38 86,30 M114,48 Q110,38 116,30" fill="none" stroke="#0284c7" stroke-width="1.8"/>
    <text x="102" y="102" text-anchor="middle" class="t-sm">Διαλυμένο στερεό από υγρό (αλάτι+νερό)</text>
  </g>
  <g transform="translate(238,164)">
    <rect width="204" height="112" rx="10" fill="#fef2f2" stroke="#fca5a5"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#991b1b">4. Μαγνητικός Διαχωρισμός</text>
    <path d="M78,44 L78,72 A24,18 0 0,0 126,72 L126,44" fill="none" stroke="#dc2626" stroke-width="9"/>
    <circle cx="88" cy="84" r="3" fill="#334155"/><circle cx="112" cy="84" r="3" fill="#334155"/>
    <text x="102" y="102" text-anchor="middle" class="t-sm">Ρινίσματα σιδήρου από άμμο/θείο</text>
  </g>
''')

    # 3. Energy forms & transformations
    write_svg("dim_energy_forms_transformations.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Μορφές &amp; Μετατροπές Ενέργειας</text>
  <circle cx="230" cy="148" r="46" fill="url(#sun-g)" stroke="#d97706" stroke-width="2" filter="url(#soft-shadow)"/>
  <text x="230" y="145" text-anchor="middle" class="t-sub">ΕΝΕΡΓΕΙΑ</text>
  <text x="230" y="160" text-anchor="middle" class="t-sm">(Δεν χάνεται!)</text>
  <g font-weight="600">
    <rect x="26" y="46" width="126" height="38" rx="10" fill="#fef3c7" stroke="#d97706"/><text x="89" y="69" text-anchor="middle" class="t-lbl">Φωτεινή (Ήλιος)</text>
    <rect x="308" y="46" width="126" height="38" rx="10" fill="#dbeafe" stroke="#2563eb"/><text x="371" y="69" text-anchor="middle" class="t-lbl">Ηλεκτρική (Ρεύμα)</text>
    <rect x="26" y="132" width="126" height="38" rx="10" fill="#dcfce7" stroke="#16a34a"/><text x="89" y="155" text-anchor="middle" class="t-lbl">Χημική (Τροφή)</text>
    <rect x="308" y="132" width="126" height="38" rx="10" fill="#fee2e2" stroke="#dc2626"/><text x="371" y="155" text-anchor="middle" class="t-lbl">Θερμική (Ζέστη)</text>
    <rect x="26" y="216" width="126" height="38" rx="10" fill="#f3e8ff" stroke="#7c3aed"/><text x="89" y="239" text-anchor="middle" class="t-lbl">Κινητική (Κίνηση)</text>
    <rect x="308" y="216" width="126" height="38" rx="10" fill="#e0f2fe" stroke="#0284c7"/><text x="371" y="239" text-anchor="middle" class="t-lbl">Δυναμική (Ύψος)</text>
  </g>
  <g stroke="#64748b" stroke-width="1.8" marker-end="url(#arr-dark)">
    <line x1="154" y1="68" x2="192" y2="114"/><line x1="306" y1="68" x2="268" y2="114"/>
    <line x1="154" y1="150" x2="180" y2="150"/><line x1="306" y1="150" x2="280" y2="150"/>
    <line x1="154" y1="230" x2="192" y2="184"/><line x1="306" y1="230" x2="268" y2="184"/>
  </g>
  <rect x="20" y="266" width="420" height="30" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Η ενέργεια μετατρέπεται διαρκώς από τη μια μορφή στην άλλη!</text>
''')

    # 4. Renewable vs Non-renewable
    write_svg("dim_renewable_vs_nonrenewable.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ανανεώσιμες vs Μη Ανανεώσιμες Πηγές Ενέργειας</text>
  <rect x="18" y="40" width="206" height="218" rx="12" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.8"/>
  <text x="121" y="64" text-anchor="middle" class="t-sub" fill="#14532d">Ανανεώσιμες (ΑΠΕ ✓)</text>
  <text x="121" y="84" text-anchor="middle" class="t-sm">Δεν εξαντλούνται &amp; δεν ρυπαίνουν</text>
  <text x="36" y="116" class="t-lbl">☀️ Ηλιακή (Φωτοβολταϊκά)</text>
  <text x="36" y="142" class="t-lbl">💨 Αιολική (Ανεμογεννήτριες)</text>
  <text x="36" y="168" class="t-lbl">💧 Υδροηλεκτρική (Φράγματα)</text>
  <text x="36" y="194" class="t-lbl">🌋 Γεωθερμική (Θερμότητα Γης)</text>
  <text x="36" y="220" class="t-lbl">🌿 Βιομάζα (Φυτικά υπολείμματα)</text>

  <rect x="236" y="40" width="206" height="218" rx="12" fill="#fef2f2" stroke="#dc2626" stroke-width="1.8"/>
  <text x="339" y="64" text-anchor="middle" class="t-sub" fill="#991b1b">Μη Ανανεώσιμες (Ορυκτά ✗)</text>
  <text x="339" y="84" text-anchor="middle" class="t-sm">Εξαντλούνται &amp; εκπέμπουν CO₂</text>
  <text x="254" y="122" class="t-lbl">🛢️ Πετρέλαιο</text>
  <text x="254" y="152" class="t-lbl">🪨 Γαιάνθρακες (Λιγνίτης)</text>
  <text x="254" y="182" class="t-lbl">🔥 Φυσικό Αέριο</text>
  <text x="254" y="212" class="t-lbl">☢️ Πυρηνικά καύσιμα (Ουράνιο)</text>

  <rect x="18" y="268" width="424" height="30" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="287" text-anchor="middle" class="t-lbl" fill="#92400e">Εξοικονόμηση ενέργειας &amp; ΑΠΕ προστατεύουν το κλίμα του πλανήτη</text>
''')

    # 5. Heat transfer 3 ways
    write_svg("dim_heat_transfer_3ways.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Οι 3 Τρόποι Διάδοσης της Θερμότητας</text>
  <!-- Pot on flame -->
  <path d="M174,234 Q192,196 210,234 Q224,200 238,234 Q252,202 266,234 Z" fill="#f97316"/>
  <rect x="154" y="124" width="132" height="72" rx="8" fill="#cbd5e1" stroke="#334155" stroke-width="2" filter="url(#soft-shadow)"/>
  <rect x="160" y="138" width="120" height="52" fill="url(#water-g)"/>
  <!-- Handle right (conduction) -->
  <rect x="286" y="138" width="104" height="14" rx="6" fill="#64748b" stroke="#1e293b"/>
  <!-- 1. Conduction -->
  <line x1="292" y1="145" x2="378" y2="145" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <text x="348" y="126" text-anchor="middle" class="t-lbl" fill="#b91c1c">1. Αγωγή</text>
  <text x="348" y="172" text-anchor="middle" class="t-sm">(Στα στερεά: χερούλι)</text>
  <!-- 2. Convection -->
  <path d="M196,184 Q188,154 218,148 Q248,154 240,184" fill="none" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
  <text x="220" y="102" text-anchor="middle" class="t-lbl" fill="#0369a1">2. Ρεύματα Μεταφοράς</text>
  <text x="220" y="114" text-anchor="middle" class="t-sm">(Σε υγρά &amp; αέρια)</text>
  <!-- 3. Radiation -->
  <path d="M158,218 L86,218" stroke="#f59e0b" stroke-width="2.6" stroke-dasharray="5,3" marker-end="url(#arr-amber)"/>
  <text x="82" y="202" text-anchor="middle" class="t-lbl" fill="#b45309">3. Ακτινοβολία</text>
  <text x="82" y="236" text-anchor="middle" class="t-sm">(Και στο κενό! Ήλιος)</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Η θερμότητα ρέει πάντα από το θερμότερο προς το ψυχρότερο σώμα!</text>
''')

    # 6. Thermal expansion
    write_svg("dim_thermal_expansion.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Διαστολή &amp; Συστολή Σωμάτων (Θέρμανση vs Ψύξη)</text>
  <!-- Left: Cold (Contraction) -->
  <rect x="20" y="42" width="198" height="206" rx="10" fill="#eff6ff" stroke="#60a5fa"/>
  <text x="119" y="64" text-anchor="middle" class="t-sub" fill="#1e3a8a">Ψύξη → Συστολή</text>
  <rect x="98" y="84" width="16" height="114" rx="8" fill="#fff" stroke="#1e293b" stroke-width="1.6"/>
  <rect x="102" y="148" width="8" height="48" fill="#2563eb"/>
  <circle cx="106" cy="200" r="12" fill="#2563eb" stroke="#1e293b"/>
  <text x="119" y="232" text-anchor="middle" class="t-sm">Μικρότερος όγκος (π.χ. 5 °C)</text>
  <!-- Right: Hot (Expansion) -->
  <rect x="242" y="42" width="198" height="206" rx="10" fill="#fef2f2" stroke="#f87171"/>
  <text x="341" y="64" text-anchor="middle" class="t-sub" fill="#991b1b">Θέρμανση → Διαστολή</text>
  <rect x="320" y="84" width="16" height="114" rx="8" fill="#fff" stroke="#1e293b" stroke-width="1.6"/>
  <rect x="324" y="102" width="8" height="94" fill="#dc2626"/>
  <circle cx="328" cy="200" r="12" fill="#dc2626" stroke="#1e293b"/>
  <text x="341" y="232" text-anchor="middle" class="t-sm">Μεγαλύτερος όγκος (π.χ. 40 °C)</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="283" text-anchor="middle" class="t-lbl" fill="#92400e">Εξαίρεση: Το νερό όταν παγώνει (0 °C) ΔΙΑΣΤΕΛΛΕΤΑΙ (ο πάγος επιπλέει)!</text>
''')

    # 7. Simple electric circuit (battery, switch, bulb)
    write_svg("dim_simple_circuit_bulb.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Απλό Κλειστό Ηλεκτρικό Κύκλωμα (Ε΄ Δημοτικού)</text>
  <!-- Wire loop -->
  <rect x="86" y="76" width="288" height="156" rx="18" fill="none" stroke="#1e293b" stroke-width="3.2"/>
  <!-- Battery left -->
  <rect x="64" y="122" width="44" height="64" rx="6" fill="#f59e0b" stroke="#78350f" stroke-width="2" filter="url(#soft-shadow)"/>
  <text x="86" y="142" text-anchor="middle" class="t-w">+</text>
  <text x="86" y="162" text-anchor="middle" class="t-w">1,5V</text>
  <text x="86" y="178" text-anchor="middle" class="t-w">−</text>
  <text x="36" y="156" text-anchor="middle" class="t-lbl">Πηγή</text>
  <!-- Bulb top -->
  <circle cx="230" cy="76" r="24" fill="#fef08a" stroke="#ca8a04" stroke-width="2" filter="url(#soft-shadow)"/>
  <path d="M220,76 Q230,60 240,76" fill="none" stroke="#b45309" stroke-width="2.2"/>
  <text x="230" y="44" text-anchor="middle" class="t-lbl" fill="#b45309">Λαμπτήρας (Ανάβει!)</text>
  <!-- Switch bottom (closed) -->
  <rect x="196" y="224" width="68" height="16" fill="#fff"/>
  <circle cx="204" cy="232" r="4.5" fill="#1e293b"/>
  <circle cx="256" cy="232" r="4.5" fill="#1e293b"/>
  <line x1="204" y1="232" x2="256" y2="232" stroke="#16a34a" stroke-width="3.2"/>
  <text x="230" y="254" text-anchor="middle" class="t-lbl" fill="#15803d">Κλειστός Διακόπτης</text>
  <!-- Current arrow -->
  <line x1="374" y1="126" x2="374" y2="178" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="412" y="156" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Ρεύμα</text>
  <rect x="20" y="268" width="420" height="30" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="287" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Για να περάσει ρεύμα, το κύκλωμα πρέπει να είναι ΚΛΕΙΣΤΟ!</text>
''')

    # 8. Conductors vs Insulators
    write_svg("dim_conductors_vs_insulators.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Αγωγοί &amp; Μονωτές του Ηλεκτρικού Ρεύματος</text>
  <rect x="18" y="42" width="206" height="214" rx="12" fill="#dcfce7" stroke="#16a34a" stroke-width="1.8"/>
  <text x="121" y="66" text-anchor="middle" class="t-sub" fill="#14532d">Αγωγοί (Περνάει το ρεύμα ✓)</text>
  <text x="42" y="102" class="t-lbl">• Χαλκός (καλώδια)</text>
  <text x="42" y="128" class="t-lbl">• Σίδηρος &amp; Αλουμίνιο</text>
  <text x="42" y="154" class="t-lbl">• Χρυσός &amp; Ασήμι</text>
  <text x="42" y="180" class="t-lbl">• Γραφίτης (μύτη μολυβιού)</text>
  <text x="42" y="206" class="t-lbl">• Αλατόνερο (νερό βρύσης)</text>
  <text x="121" y="238" text-anchor="middle" class="t-sm" fill="#15803d">Το λαμπάκι ΑΝΑΒΕΙ!</text>

  <rect x="236" y="42" width="206" height="214" rx="12" fill="#fee2e2" stroke="#dc2626" stroke-width="1.8"/>
  <text x="339" y="66" text-anchor="middle" class="t-sub" fill="#991b1b">Μονωτές (Δεν περνάει ✗)</text>
  <text x="260" y="102" class="t-lbl">• Πλαστικό (κάλυμμα καλωδίων)</text>
  <text x="260" y="128" class="t-lbl">• Ξύλο (στεγνό)</text>
  <text x="260" y="154" class="t-lbl">• Γυαλί &amp; Πορσελάνη</text>
  <text x="260" y="180" class="t-lbl">• Καουτσούκ / Λάστιχο</text>
  <text x="260" y="206" class="t-lbl">• Χαρτί &amp; Ύφασμα</text>
  <text x="339" y="238" text-anchor="middle" class="t-sm" fill="#b91c1c">Μας προστατεύουν από ηλεκτροπληξία!</text>

  <rect x="18" y="266" width="424" height="30" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="285" text-anchor="middle" class="t-lbl" fill="#92400e">Όλα τα μέταλλα είναι καλοί αγωγοί του ηλεκτρισμού &amp; της θερμότητας</text>
''')

    # 9. Light rectilinear propagation & shadow
    write_svg("dim_light_shadow_rectilinear.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ευθύγραμμη Διάδοση Φωτός &amp; Σχηματισμός Σκιάς</text>
  <rect x="20" y="38" width="420" height="216" rx="10" fill="#0f172a"/>
  <!-- Light source left -->
  <circle cx="64" cy="146" r="18" fill="url(#sun-g)"/>
  <text x="64" y="182" text-anchor="middle" class="t-w">Πηγή φωτός</text>
  <!-- Opaque object center -->
  <rect x="206" y="108" width="18" height="76" rx="3" fill="#94a3b8" stroke="#fff"/>
  <text x="215" y="204" text-anchor="middle" class="t-w">Αδιαφανές</text>
  <text x="215" y="216" text-anchor="middle" class="t-w">σώμα</text>
  <!-- Light rays -->
  <line x1="80" y1="146" x2="394" y2="62" stroke="#facc15" stroke-width="2"/>
  <line x1="80" y1="146" x2="394" y2="230" stroke="#facc15" stroke-width="2"/>
  <!-- Shadow cone -->
  <polygon points="224,108 394,62 394,230 224,184" fill="#020617" opacity="0.82"/>
  <!-- Screen right -->
  <rect x="394" y="54" width="12" height="184" fill="#f8fafc"/>
  <rect x="394" y="62" width="12" height="168" fill="#334155"/>
  <text x="310" y="150" text-anchor="middle" class="t-w" fill="#94a3b8">Περιοχή Σκιάς</text>
  <text x="418" y="150" text-anchor="middle" class="t-w" transform="rotate(-90 418 150)">Πέτασμα</text>
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Το φως διαδίδεται ευθύγραμμα — έτσι σχηματίζονται οι σκιές!</text>
''')

    # 10. Reflection & Refraction for kids
    write_svg("dim_light_reflection_refraction_kids.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ανάκλαση &amp; Διάθλαση του Φωτός (Ε΄ Δημοτικού)</text>
  <!-- Left: Reflection -->
  <rect x="18" y="40" width="204" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="120" y="60" text-anchor="middle" class="t-sub" fill="#1e3a8a">1. Ανάκλαση (Καθρέφτης)</text>
  <line x1="38" y1="204" x2="202" y2="204" stroke="#0284c7" stroke-width="5"/>
  <line x1="120" y1="90" x2="120" y2="204" stroke="#94a3b8" stroke-width="1.3" stroke-dasharray="4,3"/>
  <line x1="56" y1="106" x2="120" y2="202" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <line x1="120" y1="202" x2="184" y2="106" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-blue)"/>
  <text x="120" y="230" text-anchor="middle" class="t-sm">Το φως «αναπηδά» (γωνία π = γωνία α)</text>
  <!-- Right: Refraction (broken pencil in glass of water) -->
  <rect x="238" y="40" width="204" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="340" y="60" text-anchor="middle" class="t-sub" fill="#0369a1">2. Διάθλαση (Ποτήρι με νερό)</text>
  <rect x="292" y="132" width="96" height="82" rx="6" fill="url(#water-g)" stroke="#0284c7" stroke-width="1.8"/>
  <line x1="308" y1="84" x2="338" y2="132" stroke="#d97706" stroke-width="5" stroke-linecap="round"/>
  <line x1="348" y1="136" x2="366" y2="206" stroke="#b45309" stroke-width="5" stroke-linecap="round"/>
  <text x="340" y="232" text-anchor="middle" class="t-sm">Το μολύβι φαίνεται «σπασμένο»!</text>
  <rect x="18" y="264" width="424" height="32" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="284" text-anchor="middle" class="t-lbl" fill="#92400e">Διάθλαση = αλλαγή πορείας του φωτός όταν περνά από τον αέρα στο νερό</text>
''')

    # 11. Sound vibrations & media
    write_svg("dim_sound_vibrations_medium.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Παραγωγή &amp; Διάδοση του Ήχου (Ταλαντώσεις)</text>
  <!-- Tuning fork left -->
  <path d="M74,84 L74,150 Q74,174 96,174 Q118,174 118,150 L118,84 M96,174 L96,216" fill="none" stroke="#475569" stroke-width="6" stroke-linecap="round"/>
  <text x="96" y="236" text-anchor="middle" class="t-lbl">Ηχητική πηγή</text>
  <text x="96" y="248" text-anchor="middle" class="t-sm">(Ταλάντωση)</text>
  <!-- Sound waves -->
  <path d="M142,102 Q162,138 142,174" fill="none" stroke="#2563eb" stroke-width="2.4"/>
  <path d="M168,88 Q194,138 168,188" fill="none" stroke="#2563eb" stroke-width="2.4"/>
  <path d="M196,74 Q228,138 196,202" fill="none" stroke="#2563eb" stroke-width="2.4"/>
  <!-- Speed comparison card right -->
  <rect x="242" y="54" width="198" height="186" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="341" y="76" text-anchor="middle" class="t-sub">Ταχύτητα Ήχου</text>
  <rect x="256" y="92" width="170" height="28" rx="6" fill="#dcfce7" stroke="#16a34a"/>
  <text x="341" y="110" text-anchor="middle" class="t-lbl" fill="#14532d">Στερεά: Πιο γρήγορα (~5.000 m/s)</text>
  <rect x="256" y="130" width="136" height="28" rx="6" fill="#e0f2fe" stroke="#0284c7"/>
  <text x="324" y="148" text-anchor="middle" class="t-lbl" fill="#0369a1">Υγρά (~1.500 m/s)</text>
  <rect x="256" y="168" width="102" height="28" rx="6" fill="#fef3c7" stroke="#d97706"/>
  <text x="307" y="186" text-anchor="middle" class="t-lbl" fill="#92400e">Αέρας (340 m/s)</text>
  <text x="341" y="220" text-anchor="middle" class="t-lbl" fill="#b91c1c">Στο ΚΕΝΟ (διάστημα): 0 ✗</text>
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Ο ήχος χρειάζεται υλικό μέσο για να διαδοθεί — δεν ταξιδεύει στο κενό!</text>
''')

    # 12. Simple machines (Lever, Inclined plane, Pulley)
    write_svg("dim_simple_machines_lever_pulley.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Απλές Μηχανές (Μοχλός, Κεκλιμένο Επίπεδο, Τροχαλία)</text>
  <!-- 1. Lever -->
  <g transform="translate(16,42)">
    <rect width="136" height="206" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="68" y="22" text-anchor="middle" class="t-sub">1. Μοχλός</text>
    <polygon points="56,156 80,156 68,128" fill="#64748b"/>
    <line x1="20" y1="138" x2="118" y2="112" stroke="#d97706" stroke-width="6" stroke-linecap="round"/>
    <rect x="22" y="112" width="24" height="22" rx="3" fill="#2563eb"/>
    <line x1="112" y1="76" x2="112" y2="108" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
    <text x="68" y="182" text-anchor="middle" class="t-sm">Υπομόχλιο, φορτίο</text>
    <text x="68" y="195" text-anchor="middle" class="t-sm">&amp; δύναμη</text>
  </g>
  <!-- 2. Inclined plane -->
  <g transform="translate(162,42)">
    <rect width="136" height="206" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="68" y="22" text-anchor="middle" class="t-sub">2. Κεκλιμένο</text>
    <polygon points="18,156 118,156 118,92" fill="#cbd5e1" stroke="#475569" stroke-width="1.6"/>
    <rect x="52" y="102" width="26" height="20" rx="3" transform="rotate(-32 65 112)" fill="#16a34a"/>
    <line x1="68" y1="100" x2="96" y2="82" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
    <text x="68" y="182" text-anchor="middle" class="t-sm">Μικρότερη δύναμη</text>
    <text x="68" y="195" text-anchor="middle" class="t-sm">σε μεγαλύτερη απόσταση</text>
  </g>
  <!-- 3. Pulley -->
  <g transform="translate(308,42)">
    <rect width="136" height="206" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="68" y="22" text-anchor="middle" class="t-sub">3. Τροχαλία</text>
    <line x1="36" y1="42" x2="100" y2="42" stroke="#1e293b" stroke-width="3"/>
    <circle cx="68" cy="76" r="22" fill="#cbd5e1" stroke="#334155" stroke-width="2"/>
    <line x1="46" y1="76" x2="46" y2="136" stroke="#1e293b" stroke-width="2"/>
    <line x1="90" y1="76" x2="90" y2="144" stroke="#dc2626" stroke-width="2.2" marker-end="url(#arr-red)"/>
    <rect x="34" y="136" width="24" height="24" rx="4" fill="#2563eb"/>
    <text x="68" y="182" text-anchor="middle" class="t-sm">Αλλάζει φορά δύναμης</text>
    <text x="68" y="195" text-anchor="middle" class="t-sm">ή τη μειώνει στο μισό</text>
  </g>
  <rect x="16" y="262" width="428" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="282" text-anchor="middle" class="t-lbl" fill="#14532d">Οι απλές μηχανές μάς βοηθούν να εκτελούμε έργο πιο εύκολα!</text>
''')

    # 13. Digestive system kids
    write_svg("dim_digestive_system_kids.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Πεπτικό Σύστημα Ανθρώπου (Ε΄ Δημοτικού)</text>
  <g transform="translate(24,46)">
    <rect x="12" y="10" width="120" height="34" rx="10" fill="#fee2e2" stroke="#dc2626"/><text x="72" y="31" text-anchor="middle" class="t-lbl">1. Στόμα (Δόντια &amp; Σάλιο)</text>
    <line x1="72" y1="46" x2="72" y2="66" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
    <rect x="12" y="70" width="120" height="34" rx="10" fill="#ffedd5" stroke="#ea580c"/><text x="72" y="91" text-anchor="middle" class="t-lbl">2. Οισοφάγος</text>
    <line x1="72" y1="106" x2="72" y2="126" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
    <rect x="12" y="130" width="120" height="34" rx="10" fill="#fef3c7" stroke="#d97706"/><text x="72" y="151" text-anchor="middle" class="t-lbl">3. Στομάχι (Υγρά)</text>
    <line x1="134" y1="147" x2="174" y2="147" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
    <rect x="178" y="130" width="220" height="38" rx="10" fill="#dcfce7" stroke="#16a34a"/>
    <text x="288" y="148" text-anchor="middle" class="t-lbl" fill="#14532d">4. Λεπτό Έντερο (Απορρόφηση!)</text>
    <text x="288" y="162" text-anchor="middle" class="t-sm">Θρεπτικές ουσίες → Αίμα</text>
    <line x1="288" y1="170" x2="288" y2="192" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>
    <rect x="178" y="196" width="220" height="34" rx="10" fill="#e0f2fe" stroke="#0284c7"/>
    <text x="288" y="217" text-anchor="middle" class="t-lbl" fill="#0369a1">5. Παχύ Έντερο (Απορρόφηση νερού)</text>
    <!-- Helper organs -->
    <rect x="196" y="34" width="184" height="58" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
    <text x="288" y="56" text-anchor="middle" class="t-sub">Βοηθητικά Όργανα</text>
    <text x="288" y="76" text-anchor="middle" class="t-sm">Ήπαρ (Χολή) &amp; Πάγκρεας</text>
  </g>
''')

    # 14. Respiratory diaphragm kids
    write_svg("dim_respiratory_diaphragm_kids.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Αναπνοή: Εισπνοή vs Εκπνοή (Κίνηση Διαφράγματος)</text>
  <!-- Left: Inhalation -->
  <rect x="18" y="40" width="204" height="214" rx="10" fill="#e0f2fe" stroke="#0284c7"/>
  <text x="120" y="60" text-anchor="middle" class="t-sub" fill="#0369a1">Εισπνοή (Μπαίνει αέρας O₂)</text>
  <line x1="120" y1="70" x2="120" y2="96" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <ellipse cx="94" cy="142" rx="28" ry="42" fill="#fca5a5" stroke="#dc2626" stroke-width="1.6"/>
  <ellipse cx="146" cy="142" rx="28" ry="42" fill="#fca5a5" stroke="#dc2626" stroke-width="1.6"/>
  <path d="M58,196 Q120,204 182,196" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
  <line x1="120" y1="204" x2="120" y2="224" stroke="#92400e" stroke-width="2" marker-end="url(#arr-amber)"/>
  <text x="120" y="242" text-anchor="middle" class="t-sm">Το διάφραγμα κατεβαίνει ↓</text>
  <!-- Right: Exhalation -->
  <rect x="238" y="40" width="204" height="214" rx="10" fill="#fef3c7" stroke="#d97706"/>
  <text x="340" y="60" text-anchor="middle" class="t-sub" fill="#92400e">Εκπνοή (Βγαίνει αέρας CO₂)</text>
  <line x1="340" y1="96" x2="340" y2="70" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <ellipse cx="318" cy="142" rx="20" ry="34" fill="#fca5a5" stroke="#dc2626" stroke-width="1.6"/>
  <ellipse cx="362" cy="142" rx="20" ry="34" fill="#fca5a5" stroke="#dc2626" stroke-width="1.6"/>
  <path d="M278,202 Q340,174 402,202" fill="none" stroke="#92400e" stroke-width="4" stroke-linecap="round"/>
  <line x1="340" y1="216" x2="340" y2="196" stroke="#92400e" stroke-width="2" marker-end="url(#arr-amber)"/>
  <text x="340" y="242" text-anchor="middle" class="t-sm">Το διάφραγμα ανεβαίνει ↑</text>
  <rect x="18" y="264" width="424" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="284" text-anchor="middle" class="t-lbl" fill="#14532d">Μύτη → Φάρυγγας → Λάρυγγας → Τραχεία → Βρόγχοι → Πνεύμονες</text>
''')

    # 15. Circulatory simple kids
    write_svg("dim_circulatory_simple_kids.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Κυκλοφορικό Σύστημα (Καρδιά, Αρτηρίες &amp; Φλέβες)</text>
  <circle cx="230" cy="146" r="44" fill="#ef4444" stroke="#991b1b" stroke-width="2.2" filter="url(#soft-shadow)"/>
  <text x="230" y="144" text-anchor="middle" class="t-w" font-size="13">ΚΑΡΔΙΑ</text>
  <text x="230" y="160" text-anchor="middle" class="t-w" font-size="9">(Αντλία αίματος)</text>
  <path d="M276,134 Q366,94 376,146 Q366,198 276,158" fill="none" stroke="#dc2626" stroke-width="4" marker-end="url(#arr-red)"/>
  <text x="380" y="88" text-anchor="middle" class="t-lbl" fill="#b91c1c">Αρτηρίες</text>
  <text x="380" y="102" text-anchor="middle" class="t-sm">(Από την καρδιά</text>
  <text x="380" y="114" text-anchor="middle" class="t-sm">προς το σώμα — O₂)</text>
  <path d="M184,158 Q94,198 84,146 Q94,94 184,134" fill="none" stroke="#2563eb" stroke-width="4" marker-end="url(#arr-blue)"/>
  <text x="80" y="88" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Φλέβες</text>
  <text x="80" y="102" text-anchor="middle" class="t-sm">(Επιστρέφουν αίμα</text>
  <text x="80" y="114" text-anchor="middle" class="t-sm">στην καρδιά — CO₂)</text>
  <rect x="20" y="242" width="420" height="52" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="230" y="264" text-anchor="middle" class="t-lbl">Τριχοειδή αγγεία: Λεπτά αγγεία που δίνουν O₂ &amp; τροφή σε κάθε κύτταρο!</text>
  <text x="230" y="282" text-anchor="middle" class="t-sm">Η καρδιά χτυπά ~70 φορές το λεπτό</text>
''')

    # 16. Forces everyday (ST Dimotikou)
    write_svg("dim_forces_push_pull_gravity.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Δυνάμεις στην Καθημερινή Ζωή (ΣΤ΄ Δημοτικού)</text>
  <g transform="translate(18,40)">
    <rect width="204" height="114" rx="10" fill="#eff6ff" stroke="#93c5fd"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#1e3a8a">1. Βαρύτητα (Βάρος)</text>
    <circle cx="102" cy="54" r="14" fill="#ef4444"/>
    <line x1="102" y1="68" x2="102" y2="96" stroke="#1e293b" stroke-width="2.6" marker-end="url(#arr-dark)"/>
    <text x="102" y="108" text-anchor="middle" class="t-sm">Έλξη της Γης προς τα κάτω</text>
  </g>
  <g transform="translate(238,40)">
    <rect width="204" height="114" rx="10" fill="#fef3c7" stroke="#f59e0b"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#92400e">2. Τριβή</text>
    <rect x="74" y="54" width="56" height="30" rx="4" fill="#d97706"/>
    <line x1="134" y1="69" x2="176" y2="69" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arr-green)"/>
    <line x1="70" y1="82" x2="32" y2="82" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
    <text x="102" y="106" text-anchor="middle" class="t-sm">Αντιστέκεται στην κίνηση</text>
  </g>
  <g transform="translate(18,166)">
    <rect width="204" height="114" rx="10" fill="#e0f2fe" stroke="#0284c7"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#0369a1">3. Άνωση (στο νερό)</text>
    <rect x="34" y="64" width="136" height="32" fill="url(#water-g)"/>
    <rect x="82" y="50" width="40" height="24" rx="4" fill="#f59e0b"/>
    <line x1="102" y1="88" x2="102" y2="42" stroke="#2563eb" stroke-width="2.4" marker-end="url(#arr-blue)"/>
    <text x="102" y="108" text-anchor="middle" class="t-sm">Σπρώχνει τα σώματα προς τα πάνω</text>
  </g>
  <g transform="translate(238,166)">
    <rect width="204" height="114" rx="10" fill="#fef2f2" stroke="#f87171"/>
    <text x="102" y="22" text-anchor="middle" class="t-sub" fill="#991b1b">4. Μαγνητική / Ηλεκτρική</text>
    <rect x="48" y="54" width="46" height="22" fill="#dc2626"/><text x="71" y="69" text-anchor="middle" class="t-w">N</text>
    <rect x="110" y="54" width="46" height="22" fill="#2563eb"/><text x="133" y="69" text-anchor="middle" class="t-w">S</text>
    <text x="102" y="106" text-anchor="middle" class="t-sm">Δυνάμεις από απόσταση!</text>
  </g>
''')

    # 17. Friction surfaces
    write_svg("dim_friction_surfaces.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Τριβή σε Λεία vs Τραχιά Επιφάνεια</text>
  <!-- Top: Smooth (ice) -->
  <rect x="20" y="42" width="420" height="98" rx="10" fill="#e0f2fe" stroke="#38bdf8"/>
  <text x="34" y="62" class="t-sub" fill="#0369a1">1. Λεία επιφάνεια (π.χ. πάγος, γυαλί) → Μικρή τριβή</text>
  <line x1="36" y1="114" x2="424" y2="114" stroke="#0284c7" stroke-width="3"/>
  <rect x="76" y="84" width="48" height="28" rx="4" fill="#2563eb"/>
  <line x1="130" y1="98" x2="364" y2="98" stroke="#16a34a" stroke-width="2.8" marker-end="url(#arr-green)"/>
  <text x="256" y="90" text-anchor="middle" class="t-lbl" fill="#15803d">Μεγάλη απόσταση κύλισης →</text>
  <!-- Bottom: Rough (sandpaper / carpet) -->
  <rect x="20" y="154" width="420" height="98" rx="10" fill="#fef3c7" stroke="#f59e0b"/>
  <text x="34" y="174" class="t-sub" fill="#92400e">2. Τραχιά επιφάνεια (π.χ. χαλί, άσφαλτος) → Μεγάλη τριβή</text>
  <polyline points="36,226 48,220 60,226 72,220 84,226 96,220 108,226 120,220 132,226 144,220 156,226 168,220 180,226 192,220 204,226 216,220 228,226 240,220 252,226 264,220 276,226 288,220 300,226 312,220 324,226 336,220 348,226 360,220 372,226 384,220 396,226 408,220 420,226" fill="none" stroke="#b45309" stroke-width="2.4"/>
  <rect x="76" y="192" width="48" height="28" rx="4" fill="#d97706"/>
  <line x1="130" y1="206" x2="196" y2="206" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <text x="286" y="210" text-anchor="middle" class="t-lbl" fill="#b91c1c">Σταματάει γρήγορα!</text>
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="284" text-anchor="middle" class="t-lbl" fill="#14532d">Η τριβή μάς επιτρέπει να περπατάμε και στα αυτοκίνητα να φρενάρουν!</text>
''')

    # 18. Buoyancy floating vs sinking
    write_svg("dim_buoyancy_floating_sinking.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Πλεύση &amp; Βύθιση Σωμάτων (Άνωση vs Βάρος)</text>
  <rect x="34" y="84" width="392" height="164" rx="10" fill="url(#water-g)" stroke="#0284c7" stroke-width="2"/>
  <!-- Floating wood left -->
  <rect x="78" y="68" width="66" height="38" rx="6" fill="#d97706" stroke="#78350f" stroke-width="1.8"/>
  <text x="111" y="92" text-anchor="middle" class="t-w">Ξύλο</text>
  <line x1="111" y1="112" x2="111" y2="148" stroke="#dc2626" stroke-width="2.4" marker-end="url(#arr-red)"/>
  <line x1="128" y1="146" x2="128" y2="112" stroke="#16a34a" stroke-width="2.4" marker-end="url(#arr-green)"/>
  <text x="111" y="172" text-anchor="middle" class="t-lbl" fill="#0c4a6e">Επιπλέει (Πλεύση)</text>
  <text x="111" y="186" text-anchor="middle" class="t-sm">Άνωση = Βάρος (ρ &lt; ρ_νερού)</text>
  <!-- Sinking stone right -->
  <circle cx="332" cy="218" r="24" fill="#64748b" stroke="#1e293b" stroke-width="1.8"/>
  <text x="332" y="222" text-anchor="middle" class="t-w">Πέτρα</text>
  <line x1="332" y1="188" x2="332" y2="148" stroke="#16a34a" stroke-width="2.2" marker-end="url(#arr-green)"/>
  <line x1="354" y1="148" x2="354" y2="206" stroke="#dc2626" stroke-width="2.8" marker-end="url(#arr-red)"/>
  <text x="332" y="124" text-anchor="middle" class="t-lbl" fill="#991b1b">Βυθίζεται!</text>
  <text x="332" y="138" text-anchor="middle" class="t-sm">Βάρος &gt; Άνωση (ρ &gt; ρ_νερού)</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="283" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Κάθε υγρό ασκεί προς τα πάνω δύναμη που λέγεται Άνωση!</text>
''')

    # 19. Atmospheric pressure straw & inverted glass
    write_svg("dim_atmospheric_pressure_straw.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ατμοσφαιρική Πίεση (Πείραμα Ποτηριού &amp; Καλαμάκι)</text>
  <!-- Left: Inverted glass with cardboard -->
  <rect x="18" y="40" width="204" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="120" y="60" text-anchor="middle" class="t-sub">1. Ανάποδο ποτήρι</text>
  <rect x="74" y="80" width="92" height="92" rx="4" fill="url(#water-g)" stroke="#0284c7" stroke-width="2"/>
  <rect x="64" y="172" width="112" height="10" rx="2" fill="#f59e0b" stroke="#92400e"/>
  <line x1="94" y1="216" x2="94" y2="186" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <line x1="146" y1="216" x2="146" y2="186" stroke="#2563eb" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="120" y="236" text-anchor="middle" class="t-sm">Ο αέρας σπρώχνει το χαρτόνι ↑</text>
  <!-- Right: Drinking straw -->
  <rect x="238" y="40" width="204" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="340" y="60" text-anchor="middle" class="t-sub">2. Πίνοντας με καλαμάκι</text>
  <rect x="292" y="132" width="96" height="84" rx="6" fill="url(#water-g)" stroke="#0284c7" stroke-width="2"/>
  <line x1="340" y1="80" x2="340" y2="206" stroke="#dc2626" stroke-width="6" stroke-linecap="round"/>
  <line x1="306" y1="102" x2="306" y2="128" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-blue)"/>
  <line x1="374" y1="102" x2="374" y2="128" stroke="#2563eb" stroke-width="2.2" marker-end="url(#arr-blue)"/>
  <text x="340" y="236" text-anchor="middle" class="t-sm">Η ατμοσφαιρική πίεση ανεβάζει το χυμό!</text>
  <rect x="18" y="264" width="424" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Ο αέρας έχει βάρος και ασκεί πίεση προς όλες τις κατευθύνσεις!</text>
''')

    # 20. Magnets poles & compass
    write_svg("dim_magnets_poles_compass.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Μαγνήτες, Πόλοι (Έλξη / Άπωση) &amp; Πυξίδα</text>
  <!-- Attraction: N-S -->
  <rect x="20" y="42" width="420" height="92" rx="10" fill="#f0fdf4" stroke="#86efac"/>
  <text x="230" y="62" text-anchor="middle" class="t-sub" fill="#14532d">Ετερώνυμοι πόλοι (N – S) → ΕΛΚΟΝΤΑΙ</text>
  <rect x="52" y="76" width="66" height="36" fill="#2563eb"/><text x="85" y="99" text-anchor="middle" class="t-w">S</text>
  <rect x="118" y="76" width="66" height="36" fill="#dc2626"/><text x="151" y="99" text-anchor="middle" class="t-w">N</text>
  <line x1="194" y1="94" x2="224" y2="94" stroke="#16a34a" stroke-width="2.6" marker-end="url(#arr-green)"/>
  <line x1="266" y1="94" x2="236" y2="94" stroke="#16a34a" stroke-width="2.6" marker-end="url(#arr-green)"/>
  <rect x="276" y="76" width="66" height="36" fill="#2563eb"/><text x="309" y="99" text-anchor="middle" class="t-w">S</text>
  <rect x="342" y="76" width="66" height="36" fill="#dc2626"/><text x="375" y="99" text-anchor="middle" class="t-w">N</text>
  <!-- Repulsion: N-N -->
  <rect x="20" y="148" width="420" height="92" rx="10" fill="#fef2f2" stroke="#fca5a5"/>
  <text x="230" y="168" text-anchor="middle" class="t-sub" fill="#991b1b">Ομώνυμοι πόλοι (N – N ή S – S) → ΑΠΩΘΟΥΝΤΑΙ</text>
  <rect x="52" y="182" width="66" height="36" fill="#2563eb"/><text x="85" y="205" text-anchor="middle" class="t-w">S</text>
  <rect x="118" y="182" width="66" height="36" fill="#dc2626"/><text x="151" y="205" text-anchor="middle" class="t-w">N</text>
  <line x1="224" y1="200" x2="192" y2="200" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <line x1="236" y1="200" x2="268" y2="200" stroke="#dc2626" stroke-width="2.6" marker-end="url(#arr-red)"/>
  <rect x="276" y="182" width="66" height="36" fill="#dc2626"/><text x="309" y="205" text-anchor="middle" class="t-w">N</text>
  <rect x="342" y="182" width="66" height="36" fill="#2563eb"/><text x="375" y="205" text-anchor="middle" class="t-w">S</text>
  <rect x="20" y="256" width="420" height="38" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="279" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Η βελόνα της πυξίδας είναι ένας μικρός μαγνήτης που δείχνει πάντα τον Βορρά!</text>
''')

    # 21. Electromagnet (nail + coil + battery)
    coils = "".join(f'<ellipse cx="{196+i*14}" cy="136" rx="7" ry="26" fill="none" stroke="#ea580c" stroke-width="3"/>' for i in range(8))
    write_svg("dim_electromagnet_nail.svg", f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ηλεκτρομαγνήτης (Καρφί, Σύρμα &amp; Μπαταρία)</text>
  <!-- Iron nail -->
  <rect x="152" y="126" width="194" height="20" rx="4" fill="#94a3b8" stroke="#334155" stroke-width="1.8"/>
  <polygon points="346,126 370,136 346,146" fill="#64748b"/>
  <rect x="142" y="114" width="12" height="44" rx="3" fill="#64748b" stroke="#334155"/>
  {coils}
  <!-- Battery bottom -->
  <rect x="196" y="204" width="100" height="36" rx="6" fill="#f59e0b" stroke="#78350f" stroke-width="1.8"/>
  <text x="246" y="226" text-anchor="middle" class="t-w">+  Μπαταρία  −</text>
  <path d="M196,162 L196,222 M296,162 L296,222" fill="none" stroke="#1e293b" stroke-width="2.4"/>
  <!-- Paperclips attracted -->
  <ellipse cx="388" cy="136" rx="12" ry="5" fill="none" stroke="#2563eb" stroke-width="2.2"/>
  <ellipse cx="408" cy="144" rx="12" ry="5" fill="none" stroke="#2563eb" stroke-width="2.2"/>
  <text x="392" y="112" text-anchor="middle" class="t-lbl" fill="#1d4ed8">Συνδετήρες</text>
  <text x="392" y="124" text-anchor="middle" class="t-sm">(έλκονται!)</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="283" text-anchor="middle" class="t-lbl" fill="#14532d">Όταν περνάει ρεύμα γίνεται μαγνήτης • Όταν ανοίξει το κύκλωμα, χάνει τον μαγνητισμό!</text>
''')

    # 22. Series vs Parallel bulbs for kids
    write_svg("dim_series_parallel_bulbs_kids.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Σύνδεση Λαμπτήρων σε Σειρά vs Παράλληλα</text>
  <!-- Left: Series -->
  <rect x="18" y="40" width="204" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="120" y="60" text-anchor="middle" class="t-sub" fill="#b91c1c">1. Σε Σειρά (1 δρόμος)</text>
  <rect x="48" y="88" width="144" height="104" rx="10" fill="none" stroke="#1e293b" stroke-width="2.4"/>
  <circle cx="94" cy="88" r="16" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/><text x="94" y="92" text-anchor="middle" class="t-sm">Λ₁</text>
  <circle cx="148" cy="88" r="16" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/><text x="148" y="92" text-anchor="middle" class="t-sm">Λ₂</text>
  <rect x="96" y="180" width="48" height="22" rx="4" fill="#f59e0b"/><text x="120" y="195" text-anchor="middle" class="t-w">Πηγή</text>
  <text x="120" y="224" text-anchor="middle" class="t-sm">Αν καεί το ένα, σβήνουν</text>
  <text x="120" y="238" text-anchor="middle" class="t-sm">ΟΛΑ τα λαμπάκια!</text>
  <!-- Right: Parallel -->
  <rect x="238" y="40" width="204" height="214" rx="10" fill="#f8fafc" stroke="#cbd5e1"/>
  <text x="340" y="60" text-anchor="middle" class="t-sub" fill="#15803d">2. Παράλληλα (2 δρόμοι)</text>
  <rect x="268" y="82" width="144" height="110" rx="10" fill="none" stroke="#1e293b" stroke-width="2.4"/>
  <line x1="268" y1="134" x2="412" y2="134" stroke="#1e293b" stroke-width="2.4"/>
  <circle cx="340" cy="82" r="16" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/><text x="340" y="86" text-anchor="middle" class="t-sm">Λ₁</text>
  <circle cx="340" cy="134" r="16" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/><text x="340" y="138" text-anchor="middle" class="t-sm">Λ₂</text>
  <rect x="316" y="180" width="48" height="22" rx="4" fill="#f59e0b"/><text x="340" y="195" text-anchor="middle" class="t-w">Πηγή</text>
  <text x="340" y="224" text-anchor="middle" class="t-sm">Αν καεί το ένα, το άλλο</text>
  <text x="340" y="238" text-anchor="middle" class="t-sm">συνεχίζει να ανάβει (Σπίτι!)</text>
  <rect x="18" y="264" width="424" height="32" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="284" text-anchor="middle" class="t-lbl" fill="#1e3a8a">Στα σπίτια μας όλες οι συσκευές &amp; λάμπες είναι συνδεδεμένες ΠΑΡΑΛΛΗΛΑ</text>
''')

    # 23. Acids, Bases, Salts everyday
    write_svg("dim_acids_bases_salts_everyday.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Οξέα, Βάσεις &amp; Άλατα στην Καθημερινή Ζωή (ΣΤ΄ Δημ.)</text>
  <g transform="translate(16,42)">
    <rect width="136" height="206" rx="12" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>
    <text x="68" y="24" text-anchor="middle" class="t-sub" fill="#991b1b">Οξέα</text>
    <text x="68" y="44" text-anchor="middle" class="t-sm">Ξινή γεύση (pH &lt; 7)</text>
    <text x="68" y="84" text-anchor="middle" class="t-lbl">🍋 Λεμόνι / Πορτοκάλι</text>
    <text x="68" y="114" text-anchor="middle" class="t-lbl">🥗 Ξίδι</text>
    <text x="68" y="144" text-anchor="middle" class="t-lbl">🥛 Γιαούρτι</text>
    <text x="68" y="184" text-anchor="middle" class="t-sm">Κόκκινο χρώμα σε</text>
    <text x="68" y="197" text-anchor="middle" class="t-sm">δείκτη κόκκινου λάχανου</text>
  </g>
  <g transform="translate(162,42)">
    <rect width="136" height="206" rx="12" fill="#dbeafe" stroke="#2563eb" stroke-width="1.6"/>
    <text x="68" y="24" text-anchor="middle" class="t-sub" fill="#1e3a8a">Βάσεις</text>
    <text x="68" y="44" text-anchor="middle" class="t-sm">Σαπωνώδης υφή (pH &gt; 7)</text>
    <text x="68" y="84" text-anchor="middle" class="t-lbl">🧼 Σαπούνι</text>
    <text x="68" y="114" text-anchor="middle" class="t-lbl">🥄 Μαγειρική σόδα</text>
    <text x="68" y="144" text-anchor="middle" class="t-lbl">🧴 Απορρυπαντικά</text>
    <text x="68" y="184" text-anchor="middle" class="t-sm">Πράσινο/μπλε χρώμα σε</text>
    <text x="68" y="197" text-anchor="middle" class="t-sm">δείκτη κόκκινου λάχανου</text>
  </g>
  <g transform="translate(308,42)">
    <rect width="136" height="206" rx="12" fill="#dcfce7" stroke="#16a34a" stroke-width="1.6"/>
    <text x="68" y="24" text-anchor="middle" class="t-sub" fill="#14532d">Άλατα</text>
    <text x="68" y="44" text-anchor="middle" class="t-sm">Οξύ + Βάση → Άλας + H₂O</text>
    <text x="68" y="84" text-anchor="middle" class="t-lbl">🧂 Μαγειρικό αλάτι</text>
    <text x="68" y="114" text-anchor="middle" class="t-lbl">🏛️ Μάρμαρο / Κιμωλία</text>
    <text x="68" y="144" text-anchor="middle" class="t-lbl">🌱 Λιπάσματα</text>
    <text x="68" y="184" text-anchor="middle" class="t-sm">Σχηματίζονται με</text>
    <text x="68" y="197" text-anchor="middle" class="t-sm">εξουδετέρωση!</text>
  </g>
  <rect x="16" y="262" width="428" height="32" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="282" text-anchor="middle" class="t-lbl" fill="#92400e">Εξουδετέρωση: Όταν αναμειγνύουμε οξύ με βάση, εξουδετερώνονται οι ιδιότητές τους</text>
''')

    # 24. Plant photosynthesis kids
    write_svg("dim_plant_photosynthesis_kids.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Φωτοσύνθεση: Πώς Φτιάχνουν την Τροφή τους τα Φυτά</text>
  <circle cx="68" cy="70" r="24" fill="url(#sun-g)" filter="url(#soft-shadow)"/>
  <line x1="94" y1="84" x2="174" y2="124" stroke="#f59e0b" stroke-width="2.6" marker-end="url(#arr-amber)"/>
  <text x="98" y="118" class="t-lbl" fill="#b45309">Ηλιακό φως</text>
  <!-- Soil & plant -->
  <rect x="148" y="218" width="164" height="34" rx="8" fill="#92400e"/>
  <line x1="230" y1="218" x2="230" y2="96" stroke="#15803d" stroke-width="6" stroke-linecap="round"/>
  <ellipse cx="192" cy="144" rx="34" ry="18" transform="rotate(-24 192 144)" fill="#22c55e" stroke="#14532d" stroke-width="1.6"/>
  <ellipse cx="268" cy="134" rx="34" ry="18" transform="rotate(24 268 134)" fill="#22c55e" stroke="#14532d" stroke-width="1.6"/>
  <!-- CO2 in -->
  <line x1="88" y1="168" x2="162" y2="154" stroke="#64748b" stroke-width="2.4" marker-end="url(#arr-dark)"/>
  <text x="72" y="172" text-anchor="middle" class="t-lbl">CO₂ (από αέρα)</text>
  <!-- Water in -->
  <line x1="230" y1="248" x2="230" y2="196" stroke="#0284c7" stroke-width="2.6" marker-end="url(#arr-blue)"/>
  <text x="230" y="242" text-anchor="middle" class="t-w">Νερό &amp; Άλατα (ρίζες)</text>
  <!-- O2 & Glucose out -->
  <line x1="298" y1="126" x2="374" y2="94" stroke="#16a34a" stroke-width="2.6" marker-end="url(#arr-green)"/>
  <text x="386" y="88" text-anchor="middle" class="t-lbl" fill="#15803d">Οξυγόνο (O₂)</text>
  <line x1="296" y1="154" x2="374" y2="176" stroke="#d97706" stroke-width="2.4" marker-end="url(#arr-amber)"/>
  <text x="388" y="192" text-anchor="middle" class="t-lbl" fill="#b45309">Γλυκόζη (Τροφή)</text>
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="284" text-anchor="middle" class="t-lbl" fill="#14532d">Φως + Νερό + Διοξείδιο του άνθρακα → Τροφή (Γλυκόζη) + Οξυγόνο!</text>
''')

    # 25. Flower parts & pollination
    write_svg("dim_flower_pollination_parts.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Τα Μέρη του Άνθους &amp; Επικονίαση</text>
  <!-- Stem & sepals -->
  <line x1="230" y1="256" x2="230" y2="196" stroke="#15803d" stroke-width="7"/>
  <ellipse cx="196" cy="198" rx="22" ry="8" transform="rotate(-20 196 198)" fill="#22c55e" stroke="#14532d"/>
  <ellipse cx="264" cy="198" rx="22" ry="8" transform="rotate(20 264 198)" fill="#22c55e" stroke="#14532d"/>
  <!-- Petals -->
  <ellipse cx="164" cy="136" rx="44" ry="26" transform="rotate(-30 164 136)" fill="#fbcfe8" stroke="#db2777" stroke-width="1.8"/>
  <ellipse cx="296" cy="136" rx="44" ry="26" transform="rotate(30 296 136)" fill="#fbcfe8" stroke="#db2777" stroke-width="1.8"/>
  <!-- Pistil (center) -->
  <path d="M214,196 Q206,162 224,142 L224,96 L236,96 L236,142 Q254,162 246,196 Z" fill="#fef08a" stroke="#ca8a04" stroke-width="1.8"/>
  <ellipse cx="230" cy="94" rx="14" ry="7" fill="#f59e0b" stroke="#92400e"/>
  <!-- Stamens -->
  <line x1="210" y1="184" x2="184" y2="108" stroke="#ca8a04" stroke-width="2.4"/>
  <ellipse cx="182" cy="104" rx="10" ry="6" fill="#f97316" stroke="#9a3412"/>
  <line x1="250" y1="184" x2="276" y2="108" stroke="#ca8a04" stroke-width="2.4"/>
  <ellipse cx="278" cy="104" rx="10" ry="6" fill="#f97316" stroke="#9a3412"/>
  <!-- Labels -->
  <text x="86" y="96" class="t-lbl" fill="#be185d">Πέταλα (χρώμα)</text>
  <text x="86" y="168" class="t-lbl" fill="#c2410c">Στήμονες (Γύρη)</text>
  <text x="356" y="96" class="t-lbl" fill="#b45309">Ύπερος (Στίγμα</text>
  <text x="356" y="110" class="t-sm">&amp; Ωοθήκη → Καρπός)</text>
  <text x="356" y="204" class="t-lbl" fill="#15803d">Σέπαλα</text>
  <rect x="20" y="264" width="420" height="32" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="284" text-anchor="middle" class="t-lbl" fill="#92400e">Επικονίαση = μεταφορά γύρης από τους στήμονες στον ύπερο (μέλισσες / άνεμος)</text>
''')

    # 26. Food chain kids
    write_svg("dim_food_chain_ecosystem_kids.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Τροφική Αλυσίδα (Ροή Ενέργειας στη Φύση)</text>
  <g transform="translate(14,92)">
    <rect x="0" y="0" width="76" height="72" rx="10" fill="#dcfce7" stroke="#16a34a" stroke-width="1.6"/>
    <text x="38" y="32" text-anchor="middle" class="t-lbl">🌿 Φυτό</text>
    <text x="38" y="54" text-anchor="middle" class="t-sm">Παραγωγός</text>
    <line x1="78" y1="36" x2="90" y2="36" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>

    <rect x="92" y="0" width="76" height="72" rx="10" fill="#fef3c7" stroke="#d97706" stroke-width="1.6"/>
    <text x="130" y="32" text-anchor="middle" class="t-lbl">🦗 Ακρίδα</text>
    <text x="130" y="54" text-anchor="middle" class="t-sm">Φυτοφάγο</text>
    <line x1="170" y1="36" x2="182" y2="36" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>

    <rect x="184" y="0" width="78" height="72" rx="10" fill="#e0f2fe" stroke="#0284c7" stroke-width="1.6"/>
    <text x="223" y="32" text-anchor="middle" class="t-lbl">🐸 Βάτραχος</text>
    <text x="223" y="54" text-anchor="middle" class="t-sm">Σαρκοφάγο 1</text>
    <line x1="264" y1="36" x2="276" y2="36" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>

    <rect x="278" y="0" width="68" height="72" rx="10" fill="#ffedd5" stroke="#ea580c" stroke-width="1.6"/>
    <text x="312" y="32" text-anchor="middle" class="t-lbl">🐍 Φίδι</text>
    <text x="312" y="54" text-anchor="middle" class="t-sm">Σαρκοφάγο 2</text>
    <line x1="348" y1="36" x2="360" y2="36" stroke="#1e293b" stroke-width="2" marker-end="url(#arr-dark)"/>

    <rect x="362" y="0" width="70" height="72" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="1.6"/>
    <text x="397" y="32" text-anchor="middle" class="t-lbl">🦅 Αετός</text>
    <text x="397" y="54" text-anchor="middle" class="t-sm">Κορυφαίος</text>
  </g>
  <rect x="96" y="198" width="268" height="44" rx="10" fill="#f1f5f9" stroke="#64748b"/>
  <text x="230" y="218" text-anchor="middle" class="t-lbl">🍄 Αποικοδομητές (Μύκητες &amp; Βακτήρια)</text>
  <text x="230" y="233" text-anchor="middle" class="t-sm">Επιστρέφουν τα θρεπτικά συστατικά στο έδαφος!</text>
  <rect x="20" y="262" width="420" height="32" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="282" text-anchor="middle" class="t-lbl" fill="#14532d">Κάθε βέλος (→) σημαίνει «γίνεται τροφή για...»</text>
''')

    # 27. Vertebrates 5 classes
    classes = [
        ("🐟 Ψάρια", "#e0f2fe", "#0284c7", "Λέπια • Βράγχια • Ψυχρόαιμα • Αυγά στο νερό"),
        ("🐸 Αμφίβια", "#dcfce7", "#16a34a", "Υγρό δέρμα • Μεταμόρφωση (γυρίνος → βάτραχος)"),
        ("🦎 Ερπετά", "#fef3c7", "#d97706", "Φολίδες • Πνεύμονες • Ψυχρόαιμα • Αυγά στη στεριά"),
        ("🦅 Πτηνά", "#f3e8ff", "#7c3aed", "Φτερά & πούπουλα • Θερμόαιμα • Αυγά με κέλυφος"),
        ("🦁 Θηλαστικά", "#fee2e2", "#dc2626", "Τρίχωμα • Θερμόαιμα • Γεννούν ζωντανά & θηλάζουν"),
    ]
    rows = "".join(
        f'<rect x="22" y="{42+i*46}" width="416" height="38" rx="10" fill="{bg}" stroke="{bd}" stroke-width="1.5"/>'
        f'<text x="38" y="{66+i*46}" class="t-sub">{name}</text>'
        f'<text x="156" y="{65+i*46}" class="t-lbl">{desc}</text>'
        for i, (name, bg, bd, desc) in enumerate(classes)
    )
    write_svg("dim_vertebrates_5_classes.svg", f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Οι 5 Ομάδες Σπονδυλωτών Ζώων (Έχουν Σπονδυλική Στήλη)</text>
  {rows}
  <text x="230" y="294" text-anchor="middle" class="t-sm">Ασπόνδυλα (χωρίς σπονδυλική στήλη): Έντομα, Μαλάκια, Σκουλήκια, Αράχνες</text>
''')

    # 28. Solar system 8 planets
    planets = [
        ("Ερμής", 104, 6, "#94a3b8"),
        ("Αφροδίτη", 136, 9, "#fcd34d"),
        ("Γη", 174, 10, "#2563eb"),
        ("Άρης", 210, 8, "#dc2626"),
        ("Δίας", 262, 20, "#d97706"),
        ("Κρόνος", 322, 16, "#eab308"),
        ("Ουρανός", 374, 12, "#38bdf8"),
        ("Ποσειδώνας", 418, 12, "#1d4ed8"),
    ]
    p_svg = []
    for i, (nm, x, r, col) in enumerate(planets):
        ly = 112 if i % 2 == 0 else 208
        p_svg.append(f'<circle cx="{x}" cy="156" r="{r}" fill="{col}" stroke="#fff" stroke-width="1"/>')
        if nm == "Κρόνος":
            p_svg.append(f'<ellipse cx="{x}" cy="156" rx="26" ry="6" fill="none" stroke="#fde68a" stroke-width="2.2"/>')
        p_svg.append(f'<text x="{x}" y="{ly}" text-anchor="middle" class="t-w" font-size="9.5">{nm}</text>')
    write_svg("dim_solar_system_planets.svg", f'''
  <text x="230" y="22" text-anchor="middle" class="t-title">Το Ηλιακό μας Σύστημα (Ήλιος &amp; 8 Πλανήτες)</text>
  <rect x="16" y="36" width="428" height="220" rx="12" fill="#0f172a"/>
  <circle cx="38" cy="156" r="36" fill="url(#sun-g)"/>
  <text x="42" y="160" text-anchor="middle" class="t-lbl">Ήλιος</text>
  <line x1="78" y1="156" x2="436" y2="156" stroke="#334155" stroke-width="1.2" stroke-dasharray="4,4"/>
  {"".join(p_svg)}
  <rect x="16" y="266" width="428" height="30" rx="8" fill="#eff6ff" stroke="#bfdbfe"/>
  <text x="230" y="285" text-anchor="middle" class="t-lbl" fill="#1e3a8a">4 Εσωτερικοί (βραχώδεις) + 4 Εξωτερικοί (αέριοι γίγαντες)</text>
''')

    # 29. Day & Night Earth rotation
    write_svg("dim_day_night_earth_rotation.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Εναλλαγή Ημέρας &amp; Νύχτας (Περιστροφή της Γης • 24 ώρες)</text>
  <rect x="18" y="36" width="424" height="220" rx="12" fill="#0f172a"/>
  <!-- Sun left -->
  <circle cx="74" cy="146" r="34" fill="url(#sun-g)"/>
  <text x="74" y="150" text-anchor="middle" class="t-lbl">Ήλιος</text>
  <line x1="116" y1="106" x2="196" y2="106" stroke="#facc15" stroke-width="2" marker-end="url(#arr-amber)"/>
  <line x1="116" y1="146" x2="196" y2="146" stroke="#facc15" stroke-width="2" marker-end="url(#arr-amber)"/>
  <line x1="116" y1="186" x2="196" y2="186" stroke="#facc15" stroke-width="2" marker-end="url(#arr-amber)"/>
  <!-- Earth split Day (left lit) / Night (right dark) -->
  <circle cx="294" cy="146" r="66" fill="url(#earth-g)" stroke="#93c5fd" stroke-width="2"/>
  <path d="M294,80 A66,66 0 0,1 294,212 Z" fill="#020617" opacity="0.72"/>
  <!-- Axis -->
  <line x1="274" y1="62" x2="314" y2="230" stroke="#ef4444" stroke-width="2" stroke-dasharray="5,3"/>
  <text x="256" y="150" text-anchor="middle" class="t-w" fill="#fef08a">ΗΜΕΡΑ</text>
  <text x="330" y="150" text-anchor="middle" class="t-w" fill="#94a3b8">ΝΥΧΤΑ</text>
  <text x="394" y="84" text-anchor="middle" class="t-w" font-size="9">Άξονας</text>
  <text x="394" y="96" text-anchor="middle" class="t-w" font-size="9">περιστροφής</text>
  <rect x="18" y="264" width="424" height="32" rx="8" fill="#fefce8" stroke="#fde047"/>
  <text x="230" y="284" text-anchor="middle" class="t-lbl" fill="#92400e">Η Γη περιστρέφεται γύρω από τον άξονά της από Δύση προς Ανατολή σε 24 ώρες</text>
''')

    # 30. Skeleton, joints & antagonistic muscles
    write_svg("dim_skeleton_joints_muscles.svg", '''
  <text x="230" y="22" text-anchor="middle" class="t-title">Ερειστικό &amp; Μυϊκό Σύστημα (Ανταγωνιστικοί Μύες)</text>
  <!-- Upper arm bone + forearm bone bent at elbow -->
  <rect x="116" y="62" width="20" height="106" rx="8" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
  <rect x="122" y="154" width="124" height="18" rx="8" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
  <!-- Elbow joint -->
  <circle cx="126" cy="162" r="13" fill="#fde68a" stroke="#d97706" stroke-width="2"/>
  <text x="126" y="198" text-anchor="middle" class="t-lbl" fill="#b45309">Άρθρωση (Αγκώνας)</text>
  <!-- Biceps (contracted front) -->
  <ellipse cx="148" cy="112" rx="22" ry="38" fill="#ef4444" opacity="0.82" stroke="#991b1b" stroke-width="1.8"/>
  <text x="226" y="104" class="t-lbl" fill="#991b1b">Δικέφαλος (Συσπάται)</text>
  <text x="226" y="118" class="t-sm">Κονταίνει &amp; σηκώνει το χέρι ↑</text>
  <!-- Triceps (relaxed back) -->
  <ellipse cx="102" cy="112" rx="12" ry="40" fill="#fca5a5" opacity="0.8" stroke="#b91c1c" stroke-width="1.5"/>
  <text x="54" y="112" text-anchor="middle" class="t-lbl" fill="#b91c1c">Τρικέφαλος</text>
  <text x="54" y="126" text-anchor="middle" class="t-sm">(Χαλαρώνει)</text>
  <!-- Info box right -->
  <rect x="272" y="166" width="166" height="72" rx="10" fill="#eff6ff" stroke="#93c5fd"/>
  <text x="355" y="186" text-anchor="middle" class="t-sub" fill="#1e3a8a">Σκελετός</text>
  <text x="355" y="204" text-anchor="middle" class="t-sm">• Στηρίζει το σώμα</text>
  <text x="355" y="218" text-anchor="middle" class="t-sm">• Προστατεύει όργανα</text>
  <text x="355" y="232" text-anchor="middle" class="t-sm">• 206 οστά (ενήλικας)</text>
  <rect x="20" y="262" width="420" height="34" rx="8" fill="#f0fdf4" stroke="#bbf7d0"/>
  <text x="230" y="283" text-anchor="middle" class="t-lbl" fill="#14532d">Οι μύες δουλεύουν σε ζευγάρια: όταν ο ένας συσπάται, ο άλλος χαλαρώνει!</text>
''')


if __name__ == "__main__":
    make_all()
    files = sorted(f for f in os.listdir(OUT_DIR) if f.startswith("dim_") and f.endswith(".svg"))
    total_kb = sum(os.path.getsize(os.path.join(OUT_DIR, f)) for f in files) / 1024
    print(f"Generated {len(files)} Dimotiko E-ST Fysika SVGs in {OUT_DIR} ({total_kb:.1f} KB total, avg {total_kb/len(files):.1f} KB)")
