/**
 * Πλήρης Βιβλιοθήκη Εξισώσεων & Γραφικών Παραστάσεων Φυσικής Γυμνασίου & Λυκείου (Α', Β', Γ' Λυκείου)
 * Βασισμένη στα σχολικά βιβλία και στα Τυπολόγια Φυσικής Α', Β', Γ' Λυκείου.
 */

export interface PhysicsEquationCatalogEntry {
  id: string;
  chapter:
    | 'Κινηματική'
    | 'Δυναμική & Ενέργεια'
    | 'Ορμή & Κρούσεις'
    | 'Παγκόσμια Έλξη & Βαρύτητα'
    | 'Μηχανικές Ταλαντώσεις'
    | 'Κύματα & Οπτική'
    | 'Θερμοδυναμική & Αέρια'
    | 'Ηλεκτροστατική & Πυκνωτές'
    | 'Ηλεκτρικό Ρεύμα & Κυκλώματα'
    | 'Μαγνητισμός & Επαγωγή'
    | 'Εναλλασσόμενο Ρεύμα & LC'
    | 'Στερεό Σώμα'
    | 'Μηχανική Ρευστών'
    | 'Κβαντική, Ατομική & Πυρηνική Φυσική';
  grade: string;
  title: string;
  canonicalLatex: string;
  aliases: string[];
  yAxis: string;
  xAxis: string;
  diagramDescription: string;
}

export const PHYSICS_EQUATIONS_CATALOG: PhysicsEquationCatalogEntry[] = [
  // ============================================================================
  // 1. ΚΙΝΗΜΑΤΙΚΗ (Γυμνάσιο, Α' & Β' Λυκείου)
  // ============================================================================
  {
    id: 'kin-eok-x-t',
    chapter: 'Κινηματική',
    grade: "Γυμνάσιο / Α' Λυκείου",
    title: 'Ευθύγραμμη Ομαλή Κίνηση (ΕΟΚ)',
    canonicalLatex: 'x = u \\cdot t',
    aliases: ['x = u*t', 's = u*t', 'x = v*t', 'x = x_0 + u*t', 'x - t'],
    yAxis: 'x',
    xAxis: 't',
    diagramDescription: 'Ευθεία από την αρχή των αξόνων (ή από αρχική θέση x_0)',
  },
  {
    id: 'kin-eomk-u-t',
    chapter: 'Κινηματική',
    grade: "Α' Λυκείου",
    title: 'Ταχύτητα στην ΕΟΜΚ',
    canonicalLatex: 'u = u_0 \\pm a \\cdot t',
    aliases: ['u = a*t', 'u = g*t', 'u = u_0 + a*t', 'u = u_0 - a*t', 'u = u_0 - g*t'],
    yAxis: 'u',
    xAxis: 't',
    diagramDescription: 'Ευθεία επιταχυνόμενης ή επιβραδυνόμενης κίνησης',
  },
  {
    id: 'kin-eomk-x-t',
    chapter: 'Κινηματική',
    grade: "Α' Λυκείου",
    title: 'Μετατόπιση στην ΕΟΜΚ / Ελεύθερη Πτώση',
    canonicalLatex: 'x = u_0 \\cdot t \\pm \\frac{1}{2} a \\cdot t^2',
    aliases: [
      'x = 1/2*a*t^2',
      'h = 1/2*g*t^2',
      'y = H - 1/2*g*t^2',
      'x = u_0*t + 1/2*a*t^2',
      'x = u_0*t - 1/2*a*t^2',
      'y = u_0*t - 1/2*g*t^2',
    ],
    yAxis: 'x',
    xAxis: 't',
    diagramDescription: 'Παραβολή θέσης-χρόνου (αύξουσα, από ύψος H, ή κατακόρυφη βολή)',
  },
  {
    id: 'kin-u-x-torricelli',
    chapter: 'Κινηματική',
    grade: "Α' Λυκείου",
    title: 'Ταχύτητα - Μετατόπιση (Ανεξάρτητη Χρόνου)',
    canonicalLatex: 'u = \\sqrt{2 a x}',
    aliases: ['u = sqrt(2*a*x)', 'u = sqrt(2*g*h)', 'u^2 = 2*a*x', 'u^2 = 2*g*h'],
    yAxis: 'u',
    xAxis: 'x',
    diagramDescription: 'Καμπύλη τετραγωνικής ρίζας u(x)',
  },
  {
    id: 'kin-horiz-proj',
    chapter: 'Κινηματική',
    grade: "Β' Λυκείου",
    title: 'Εξίσωση Τροχιάς Οριζόντιας Βολής',
    canonicalLatex: 'y = H - \\frac{g}{2 u_0^2} x^2',
    aliases: ['y = (g/(2*u_0^2))*x^2', 'y = H - (g/(2*u_0^2))*x^2'],
    yAxis: 'y',
    xAxis: 'x',
    diagramDescription: 'Παραβολική τροχιά οριζόντιας βολής y(x)',
  },
  {
    id: 'kin-oblique-proj',
    chapter: 'Κινηματική',
    grade: "Β' Λυκείου",
    title: 'Εξίσωση Τροχιάς Πλάγιας Βολής',
    canonicalLatex: 'y = x \\tan\\theta - \\frac{g}{2 u_0^2 \\cos^2\\theta} x^2',
    aliases: ['y = x*εφ(θ) - (g/(2*u_0^2*συν^2(θ)))*x^2'],
    yAxis: 'y',
    xAxis: 'x',
    diagramDescription: 'Παραβολική τροχιά πλάγιας βολής με μέγιστο ύψος h_max και βεληνεκές S',
  },
  {
    id: 'kin-circular',
    chapter: 'Κινηματική',
    grade: "Β' Λυκείου",
    title: 'Ομαλή Κυκλική Κίνηση & Κεντρομόλος Επιτάχυνση',
    canonicalLatex: 'a_\\kappa = \\frac{u^2}{R} = \\omega^2 R',
    aliases: [
      'θ = ω*t',
      'u = ω*R',
      'ω = 2*π*f',
      'ω = 2*π/T',
      'a_κ = u^2/R',
      'F_κ = m*u^2/R',
      'a_κ = ω^2*R',
      'a_κ - R',
    ],
    yAxis: 'a_κ',
    xAxis: 'u',
    diagramDescription: 'Παραβολή a_κ(u), ευθεία a_κ(R) για σταθερό ω, υπερβολή a_κ(R) για σταθερό u',
  },

  // ============================================================================
  // 2. ΔΥΝΑΜΙΚΗ & ΕΡΓΟ - ΕΝΕΡΓΕΙΑ - ΙΣΧΥΣ (Α' & Β' Λυκείου)
  // ============================================================================
  {
    id: 'dyn-newton2',
    chapter: 'Δυναμική & Ενέργεια',
    grade: "Α' Λυκείου",
    title: '2ος Νόμος του Νεύτωνα',
    canonicalLatex: '\\Sigma F = m \\cdot a',
    aliases: ['ΣF = m*a', 'F = m*a', 'a = F/m', 'a = ΣF/m', 'a - m'],
    yAxis: 'ΣF',
    xAxis: 'a',
    diagramDescription: 'Ευθεία ΣF(a) από την αρχή των αξόνων, υπερβολή a(m)',
  },
  {
    id: 'dyn-hooke-friction-work-power',
    chapter: 'Δυναμική & Ενέργεια',
    grade: "Α' Λυκείου",
    title: 'Νόμος Hooke, Τριβή, Έργο & Ισχύς',
    canonicalLatex: 'F = k \\cdot x,\\; T = \\mu N,\\; W = F \\cdot x,\\; P = F \\cdot u',
    aliases: ['F = k*x', 'F = D*x', 'T = μ*N', 'W = F*x', 'W = F*s', 'P = F*u', 'U = m*g*h'],
    yAxis: 'F',
    xAxis: 'x',
    diagramDescription: 'Ευθεία από την αρχή των αξόνων',
  },

  // ============================================================================
  // 3. ΟΡΜΗ & ΚΡΟΥΣΕΙΣ (Β' & Γ' Λυκείου)
  // ============================================================================
  {
    id: 'mom-p-u-k',
    chapter: 'Ορμή & Κρούσεις',
    grade: "Β' & Γ' Λυκείου",
    title: 'Ορμή & Κινητική Ενέργεια',
    canonicalLatex: 'p = m \\cdot u,\\; K = \\frac{p^2}{2m}',
    aliases: ['p = m*u', 'K = p^2/(2*m)', 'p = sqrt(2*m*K)', 'J = F*Δt', 'Δp = F*Δt'],
    yAxis: 'K',
    xAxis: 'p',
    diagramDescription: 'Ευθεία p(u), παραβολή K(p), καμπύλη ρίζας p(K), παλμός κρούσης F(t)',
  },

  // ============================================================================
  // 4. ΠΑΓΚΟΣΜΙΑ ΕΛΞΗ & ΒΑΡΥΤΙΚΟ ΠΕΔΙΟ (Β' Λυκείου)
  // ============================================================================
  {
    id: 'grav-newton-field',
    chapter: 'Παγκόσμια Έλξη & Βαρύτητα',
    grade: "Β' Λυκείου",
    title: 'Νόμος Παγκόσμιας Έλξης & Ένταση Βαρυτικού Πεδίου',
    canonicalLatex: 'F = G \\frac{M m}{r^2},\\; g = G \\frac{M}{r^2}',
    aliases: ['F = G*m_1*m_2/r^2', 'F = G*M*m/r^2', 'g = G*M/r^2', 'g - r'],
    yAxis: 'g',
    xAxis: 'r',
    diagramDescription: 'Καμπύλη αντίστροφου τετραγώνου 1/r² στο 1ο τεταρτημόριο',
  },
  {
    id: 'grav-satellite-escape-potential',
    chapter: 'Παγκόσμια Έλξη & Βαρύτητα',
    grade: "Β' Λυκείου",
    title: 'Ταχύτητα Δορυφόρου, Διαφυγής & Βαρυτικό Δυναμικό',
    canonicalLatex: 'u_{\\delta o\\rho} = \\sqrt{\\frac{GM}{r}},\\; V = -G\\frac{M}{r}',
    aliases: ['u_δορ = sqrt(G*M/r)', 'u_δ = sqrt(2*G*M/r)', 'V = -G*M/r', 'U = -G*M*m/r'],
    yAxis: 'u_δορ',
    xAxis: 'r',
    diagramDescription: 'Φθίνουσα καμπύλη 1/√r (δορυφόρος) και αρνητική υπερβολή 4ου τεταρτημορίου V(r)',
  },

  // ============================================================================
  // 5. ΜΗΧΑΝΙΚΕΣ ΤΑΛΑΝΤΩΣΕΙΣ (Γ' Λυκείου)
  // ============================================================================
  {
    id: 'osc-shm-all',
    chapter: 'Μηχανικές Ταλαντώσεις',
    grade: "Γ' Λυκείου",
    title: 'Απλή Αρμονική, Φθίνουσα & Εξαναγκασμένη Ταλάντωση & Διακρότημα',
    canonicalLatex: 'x = A\\eta\\mu(\\omega t + \\varphi_0),\\; \\Sigma F = -Dx,\\; K = \\frac{1}{2}mu_{\\max}^2\\sigma\\upsilon\\nu^2(\\omega t)',
    aliases: [
      'x = A*ημ(ω*t)',
      'u = u_max*συν(ω*t)',
      'a = -a_max*ημ(ω*t)',
      'ΣF = -D*x',
      'a = -ω^2*x',
      'U = 1/2*D*x^2',
      'K = 1/2*m*u^2',
      'K = E - 1/2*D*x^2',
      'U = E - 1/2*m*u^2',
      'U = 1/2*m*(u_max^2 - u^2)',
      'u = ω*sqrt(A^2 - x^2)',
      'a = ω*sqrt(u_max^2 - u^2)',
      'K = 1/2*m*u_max^2*συν^2(ω*t)',
      'U = 1/2*D*A^2*ημ^2(ω*t)',
      'x = A_0*e^(-Λ*t)*συν(ω*t)',
      'A = A_0*e^(-Λ*t)',
      'E = E_0*e^(-2*Λ*t)',
      'A - f',
      'διακρότημα',
    ],
    yAxis: 'x',
    xAxis: 't',
    diagramDescription: 'Πλήρες σετ διαγραμμάτων ΑΑΤ (x-t, u-t, a-t, u-x, a-u, K-x, U-u), ενεργειών, φθίνουσας, συντονισμού και διακροτήματος',
  },

  // ============================================================================
  // 6. ΚΥΜΑΤΑ & ΟΠΤΙΚΗ (Β' & Γ' Λυκείου)
  // ============================================================================
  {
    id: 'waves-fundamental',
    chapter: 'Κύματα & Οπτική',
    grade: "Β' & Γ' Λυκείου",
    title: 'Θεμελιώδης Εξίσωση Κυματικής, Διάδοση & Ένταση Κύματος',
    canonicalLatex: 'u = \\lambda \\cdot f = \\frac{\\lambda}{T},\\; x = u \\cdot t,\\; u = \\sqrt{\\frac{F}{\\mu}},\\; I = \\frac{P}{4\\pi r^2}',
    aliases: [
      'u = λ*f',
      'u = λ/T',
      'λ = u/f',
      'λ = u*T',
      'f = u/λ',
      'x = u*t',
      'u = sqrt(F/μ)',
      'I = P/(4*π*r^2)',
    ],
    yAxis: 'λ',
    xAxis: 'f',
    diagramDescription: 'Υπερβολή λ(f), ευθεία διάδοσης x(t) = u·t, ταχύτητα εγκάρσιου κύματος u(F) και ένταση I(r) ∝ 1/r²',
  },
  {
    id: 'waves-traveling-xt',
    chapter: 'Κύματα & Οπτική',
    grade: "Γ' Λυκείου",
    title: 'Εξίσωση Τρέχοντος Αρμονικού Κύματος y(x, t) (Στιγμιότυπο y-x & Ταλάντωση y-t)',
    canonicalLatex: 'y = A\\eta\\mu\\left(\\frac{2\\pi t}{T} - \\frac{2\\pi x}{\\lambda}\\right) = A\\eta\\mu\\left(2\\pi\\left(\\frac{t}{T} - \\frac{x}{\\lambda}\\right)\\right) = A\\eta\\mu(\\omega t - kx)',
    aliases: [
      'y = A*ημ(2*π*t/T - 2*π*x/λ)',
      'y = A*ημ(2*π*t/T + 2*π*x/λ)',
      'y = A*ημ(2*π*(t/T - x/λ))',
      'y = A*ημ(2*π*(t/T + x/λ))',
      'y = A*ημ(ω*t - k*x)',
      'y = A*ημ(ω*t + k*x)',
      'y = A*ημ(2*π*(f*t - x/λ))',
      'y = A*ημ((2*π/λ)*(u*t - x))',
      'y = A*ημ((2*π/T)*(t - x/u))',
      'φ = 2*π*(t/T - x/λ)',
      'Δφ = 2*π*Δx/λ',
      'Δφ = 2*π*Δt/T',
    ],
    yAxis: 'y',
    xAxis: 'x',
    diagramDescription: 'Επιλογή μεταξύ Στιγμιότυπου Κύματος y=f(x) (t=σταθ.) και Διαγράμματος Ταλάντωσης y=f(t) (x=σταθ., από t_αφ=x/u)',
  },
  {
    id: 'waves-velocity-accel-xt',
    chapter: 'Κύματα & Οπτική',
    grade: "Γ' Λυκείου",
    title: 'Ταχύτητα u_y(x, t) & Επιτάχυνση a_y(x, t) Σημείου Ελαστικού Μέσου',
    canonicalLatex: 'u_y = u_{\\max}\\sigma\\upsilon\\nu\\left(\\frac{2\\pi t}{T} - \\frac{2\\pi x}{\\lambda}\\right),\\; a_y = -a_{\\max}\\eta\\mu\\left(\\frac{2\\pi t}{T} - \\frac{2\\pi x}{\\lambda}\\right),\\; a_y = -\\omega^2 y',
    aliases: [
      'u = u_max*συν(2*π*t/T - 2*π*x/λ)',
      'u_y = u_max*συν(2*π*(t/T - x/λ))',
      'u = ω*A*συν(2*π*t/T - 2*π*x/λ)',
      'u_y = (2*π/T)*A*συν(2*π*(t/T - x/λ))',
      'u = u_max*συν(ω*t - k*x)',
      'a = -a_max*ημ(2*π*t/T - 2*π*x/λ)',
      'a_y = -a_max*ημ(2*π*(t/T - x/λ))',
      'a = -ω^2*A*ημ(2*π*t/T - 2*π*x/λ)',
      'a_y = -(2*π/T)^2*A*ημ(2*π*(t/T - x/λ))',
      'a = -a_max*ημ(ω*t - k*x)',
      'a_y = -ω^2*y',
      'a = -ω^2*y',
      'u_y = ω*sqrt(A^2 - y^2)',
    ],
    yAxis: 'u_y',
    xAxis: 't',
    diagramDescription: 'Επιλογή μεταξύ Στιγμιότυπου u_y(x), a_y(x) (t=σταθ.) και Ταλάντωσης u_y(t), a_y(t) (x=σταθ., από t_αφ=x/u)',
  },
  {
    id: 'waves-standing-interference',
    chapter: 'Κύματα & Οπτική',
    grade: "Γ' Λυκείου",
    title: 'Στάσιμα Κύματα & Συμβολή Κυμάτων',
    canonicalLatex: 'y = 2A\\sigma\\upsilon\\nu\\left(\\frac{2\\pi x}{\\lambda}\\right)\\eta\\mu\\left(\\frac{2\\pi t}{T}\\right),\\; A\'(x) = 2A\\left|\\sigma\\upsilon\\nu\\left(\\frac{2\\pi x}{\\lambda}\\right)\\right|',
    aliases: [
      'y = 2*A*συν(2*π*x/λ)*ημ(2*π*t/T)',
      'y = 2*A*συν(k*x)*ημ(ω*t)',
      "A' = 2*A*συν(2*π*x/λ)",
      "A' = |2*A*συν(2*π*x/λ)|",
      'u_y = 2*ω*A*συν(2*π*x/λ)*συν(2*π*t/T)',
      'a_y = -2*ω^2*A*συν(2*π*x/λ)*ημ(2*π*t/T)',
      'y = 2*A*συν(π*(r_1 - r_2)/λ)*ημ(2*π*(t/T - (r_1 + r_2)/(2*λ)))',
    ],
    yAxis: "A'",
    xAxis: 'x',
    diagramDescription: "Στιγμιότυπο στάσιμου κύματος y(x), ταλάντωση σημείου y(t) και πλάτος στάσιμου κύματος A'(x) με δεσμούς & κοιλίες",
  },
  {
    id: 'waves-doppler-optics',
    chapter: 'Κύματα & Οπτική',
    grade: "Β' & Γ' Λυκείου",
    title: 'Φαινόμενο Doppler & Διασκεδασμός Φωτός',
    canonicalLatex: 'f_A = \\frac{u \\pm u_A}{u \\mp u_S}f_S,\\; n = \\frac{c}{u},\\; n(\\lambda) = A + \\frac{B}{\\lambda^2}',
    aliases: [
      'f_A = (u/(u - u_S))*f_S',
      'f_A = (u/(u + u_S))*f_S',
      'f_A = ((u + u_A)/u)*f_S',
      'f_A = ((u - u_A)/u)*f_S',
      'n = c/u',
      'n - λ',
    ],
    yAxis: 'n',
    xAxis: 'λ',
    diagramDescription: 'Φαινόμενο Doppler f_A(u_S), f_A(u_A) και καμπύλη διασκεδασμού φωτός n(λ)',
  },

  // ============================================================================
  // 7. ΘΕΡΜΟΔΥΝΑΜΙΚΗ & ΙΔΑΝΙΚΑ ΑΕΡΙΑ (Β' Λυκείου)
  // ============================================================================
  {
    id: 'thermo-gas-laws',
    chapter: 'Θερμοδυναμική & Αέρια',
    grade: "Β' Λυκείου",
    title: 'Καταστατική Εξίσωση PV = nRT, Κινητική Θεωρία & Μηχανή Carnot',
    canonicalLatex: 'P \\cdot V = n \\cdot R \\cdot T,\\; P \\cdot V^\\gamma = \\text{σταθ.},\\; u_{\\varepsilon\\nu} = \\sqrt{\\frac{3RT}{M_r}},\\; n_c = 1 - \\frac{T_c}{T_h}',
    aliases: [
      'P*V = n*R*T',
      'P - V',
      'P - T',
      'V - T',
      'P*V^γ = σταθ',
      'T*V^(γ-1) = σταθ',
      'u_εν = sqrt(3*R*T/M_r)',
      'K = 3/2*k*T',
      'U = 3/2*n*R*T',
      'U = n*C_V*T',
      'n_c = 1 - T_2/T_1',
      'e_c = 1 - T_c/T_h',
      'Q = m*c*ΔT',
    ],
    yAxis: 'P',
    xAxis: 'V',
    diagramDescription: 'Ισόθερμη P(V), Ισόχωρη P(T), Ισοβαρής V(T), Αδιαβατική PV^γ & TV^(γ-1), u_εν(T), K(T), U(T), Απόδοση Carnot n_c(T_2)',
  },

  // ============================================================================
  // 8. ΗΛΕΚΤΡΟΣΤΑΤΙΚΗ & ΠΥΚΝΩΤΕΣ (Β' Λυκείου)
  // ============================================================================
  {
    id: 'elec-coulomb-field-potential',
    chapter: 'Ηλεκτροστατική & Πυκνωτές',
    grade: "Β' Λυκείου",
    title: 'Νόμος Coulomb, Ένταση Ηλεκτρικού Πεδίου E(r) & Δυναμικό V(r)',
    canonicalLatex: 'F = k \\frac{q_1 q_2}{r^2},\\; E = k \\frac{Q}{r^2},\\; V = k \\frac{Q}{r}',
    aliases: [
      'F = k*q_1*q_2/r^2',
      'E = k*Q/r^2',
      'E - r',
      'V = k*Q/r',
      'V - r',
      'U = k*q_1*q_2/r',
      'F = q*E',
      'V = E*d',
    ],
    yAxis: 'E',
    xAxis: 'r',
    diagramDescription: 'Καμπύλη 1/r² για F(r) και E(r), υπερβολή 1/r για V(r) και U(r)',
  },
  {
    id: 'elec-capacitors',
    chapter: 'Ηλεκτροστατική & Πυκνωτές',
    grade: "Β' Λυκείου",
    title: 'Πυκνωτής: Φορτίο, Χωρητικότητα & Ενέργεια',
    canonicalLatex: 'Q = C \\cdot V,\\; C = \\varepsilon_0 \\frac{S}{d},\\; U = \\frac{1}{2} C V^2',
    aliases: ['Q = C*V', 'C = Q/V', 'C = ε_0*S/d', 'C - S', 'C - d', 'U = 1/2*C*V^2', 'U = Q^2/(2*C)'],
    yAxis: 'Q',
    xAxis: 'V',
    diagramDescription: 'Ευθεία Q(V) και C(S), υπερβολή C(d), παραβολή U(V) και U(Q)',
  },

  // ============================================================================
  // 9. ΗΛΕΚΤΡΙΚΟ ΡΕΥΜΑ & ΚΥΚΛΩΜΑΤΑ Σ.Ρ. (Γυμνάσιο, Β' Λυκείου)
  // ============================================================================
  {
    id: 'curr-ohm-resistance-temperature',
    chapter: 'Ηλεκτρικό Ρεύμα & Κυκλώματα',
    grade: "Γυμνάσιο / Β' Λυκείου",
    title: 'Νόμος του Ohm, Αντίσταση Αγωγού & Θερμοκρασία',
    canonicalLatex: 'I = \\frac{V}{R},\\; R = \\rho \\frac{l}{S},\\; R = R_0(1 + \\alpha\\theta)',
    aliases: [
      'I = V/R',
      'V = I*R',
      'I - V',
      'V - I',
      'I - R',
      'R = ρ*l/S',
      'R - l',
      'R - S',
      'R = R_0*(1 + α*θ)',
      'ρ = ρ_0*(1 + α*θ)',
      'R - θ',
    ],
    yAxis: 'I',
    xAxis: 'V',
    diagramDescription: 'Χαρακτηριστική I(V) / V(I), υπερβολή I(R) και R(S), ευθεία R(θ) από R_0',
  },
  {
    id: 'curr-closed-circuit-joule',
    chapter: 'Ηλεκτρικό Ρεύμα & Κυκλώματα',
    grade: "Β' Λυκείου",
    title: 'Κλειστό Κύκλωμα, Πολική Τάση & Ισχύς',
    canonicalLatex: 'I = \\frac{E}{R+r},\\; V_\\pi = E - I \\cdot r,\\; P_{\\varepsilon\\xi} = E I - I^2 r',
    aliases: [
      'I = E/(R+r)',
      'V_π = E - I*r',
      'V_π - I',
      'V_π = E*R/(R+r)',
      'V_π - R',
      'P_εξ = E*I - I^2*r',
      'P_εξ - I',
      'P = I^2*R',
      'P = V^2/R',
      'P = V*I',
      'Q = I^2*R*t',
    ],
    yAxis: 'V_π',
    xAxis: 'I',
    diagramDescription: 'Ευθεία πολικής τάσης V_π(I), παραβολή ισχύος P_εξ(I), υπερβολή I(R) από I_βρ',
  },

  // ============================================================================
  // 10. ΜΑΓΝΗΤΙΣΜΟΣ & ΗΛΕΚΤΡΟΜΑΓΝΗΤΙΚΗ ΕΠΑΓΩΓΗ (Β' & Γ' Λυκείου)
  // ============================================================================
  {
    id: 'mag-biot-savart-laplace-lorentz',
    chapter: 'Μαγνητισμός & Επαγωγή',
    grade: "Β' & Γ' Λυκείου",
    title: 'Μαγνητικό Πεδίο B(r), Δύναμη Laplace, Lorentz, Επαγωγή & Neumann',
    canonicalLatex: 'B = k_\\mu \\frac{2I}{r},\\; F_L = B I l,\\; E_{\\varepsilon\\pi} = B u l,\\; q_{\\varepsilon\\pi} = N\\frac{|\\Delta\\Phi|}{R}',
    aliases: [
      'B = k_μ*2*I/r',
      'B = (μ_0/(2*π))*I/r',
      'B = k_μ*2*π*I/r',
      'B = μ_0*n*I',
      'B - r',
      'B - I',
      'F_L = B*I*l',
      'F_L = q*u*B',
      'F = k_μ*2*I_1*I_2*l/r',
      'R = m*u/(q*B)',
      'E_επ = B*u*l',
      'E_επ = 1/2*B*ω*l^2',
      'E_επ - l',
      'q_επ = N*ΔΦ/R',
      'q_επ - ΔΦ',
      'q_επ - R',
      'q_επ - Δt',
      'L = μ_0*A*N^2/l',
      'L - N',
      'L - l',
      'U_B = 1/2*L*I^2',
    ],
    yAxis: 'B',
    xAxis: 'r',
    diagramDescription: 'Υπερβολή B(r) ∝ 1/r, ευθείες B(I), F_L(I), E_επ(u), q_επ(ΔΦ), παραβολές E_επ(l), L(N), U_B(I)',
  },

  // ============================================================================
  // 11. ΕΝΑΛΛΑΣΣΟΜΕΝΟ ΡΕΥΜΑ & ΗΛΕΚΤΡΙΚΗ ΤΑΛΑΝΤΩΣΗ LC (Γ' Λυκείου)
  // ============================================================================
  {
    id: 'ac-lc-all',
    chapter: 'Εναλλασσόμενο Ρεύμα & LC',
    grade: "Γ' Λυκείου",
    title: 'Εναλλασσόμενο Ρεύμα, Στιγμιαία Ισχύς p(t), Εμπέδηση RLC & Ταλάντωση LC',
    canonicalLatex: 'p = P_{\\max} \\eta\\mu^2(\\omega t),\\; Z = \\sqrt{R^2 + (L\\omega - \\frac{1}{C\\omega})^2},\\; T = 2\\pi\\sqrt{LC}',
    aliases: [
      'v = V*ημ(ω*t)',
      'i = I*ημ(ω*t)',
      'p = P_max*ημ^2(ω*t)',
      'p = V*I*ημ^2(ω*t)',
      'p - t',
      'Z_C = 1/(C*ω)',
      'Z_L = L*ω',
      'Z = sqrt(R^2 + (L*ω - 1/(C*ω))^2)',
      'Z - ω',
      'Z - f',
      'I_εν - ω',
      'T = 2*π*sqrt(L*C)',
      'U_E = q^2/(2*C)',
      'U_B = 1/2*L*i^2',
      'i = ω*sqrt(Q^2 - q^2)',
    ],
    yAxis: 'p',
    xAxis: 't',
    diagramDescription: 'Στιγμιαία ισχύς Ε.Ρ. p(t) ≥ 0, υπερβολή Z_C(ω), ευθεία Z_L(ω), καμπύλη εμπέδησης RLC Z(ω), συντονισμός I_εν(ω) & έλλειψη LC',
  },

  // ============================================================================
  // 12. ΣΤΕΡΕΟ ΣΩΜΑ & ΜΗΧΑΝΙΚΗ ΡΕΥΣΤΩΝ (Γ' Λυκείου)
  // ============================================================================
  {
    id: 'rigid-body-all',
    chapter: 'Στερεό Σώμα',
    grade: "Γ' Λυκείου",
    title: 'Στροφική Κίνηση, Ροπή Αδράνειας, Steiner, Στροφορμή & Κινητική Ενέργεια',
    canonicalLatex: '\\Sigma\\tau = I\\alpha_\\gamma,\\; L = I\\omega,\\; K_{\\sigma\\tau\\rho} = \\frac{1}{2}I\\omega^2,\\; I_p = I_{cm} + Md^2',
    aliases: [
      'I = m*R^2',
      'I_p = I_cm + M*d^2',
      'τ = F*d',
      'Στ = I*α_γ',
      'L = I*ω',
      'L = m*u*r',
      'ω = L/I',
      'ω - I',
      'K_στρ = 1/2*I*ω^2',
      'W = τ*θ',
      'P = τ*ω',
    ],
    yAxis: 'K_στρ',
    xAxis: 'ω',
    diagramDescription: 'Παραβολές I(R), I_p(d) (Steiner), K_στρ(ω), υπερβολή διατήρησης στροφορμής ω(I) = L/I και ευθείες Στ(α_γ), L(ω), W(θ), P(ω)',
  },
  {
    id: 'fluids-all',
    chapter: 'Μηχανική Ρευστών',
    grade: "Γ' Λυκείου",
    title: 'Υδροστατική Πίεση, Άνωση, Pascal, Συνέχεια, Bernoulli, Torricelli & Ιξώδες',
    canonicalLatex: 'P = P_{atm} + \\rho g h,\\; F_A = \\rho g V,\\; A \\cdot u = \\Pi,\\; P + \\frac{1}{2}\\rho u^2 = P_0,\\; u = \\sqrt{2gh}',
    aliases: [
      'P = ρ*g*h',
      'P = P_atm + ρ*g*h',
      'F_A = ρ*g*V',
      'F_2 = (A_2/A_1)*F_1',
      'ΔV = Π*t',
      'Π = A*u',
      'u = Π/A',
      'A*u = σταθ',
      'F = ρ*A*u^2',
      'F_ΤΡ = η*A*u/l',
      'P = P_0 - 1/2*ρ*u^2',
      'P - u',
      'u = sqrt(2*g*h)',
      'u = sqrt(2*g*(H - y))',
    ],
    yAxis: 'P',
    xAxis: 'h',
    diagramDescription: 'Ευθείες P(h), F_A(V), ΔV(t), Π(u), F_ΤΡ(u), υπερβολή συνέχειας u(A), παραβολή Bernoulli P(u) = P_0 - ½ρu² και καμπύλη ρίζας Torricelli u(h)',
  },

  // ============================================================================
  // 13. ΚΒΑΝΤΙΚΗ, ΑΤΟΜΙΚΗ & ΠΥΡΗΝΙΚΗ ΦΥΣΙΚΗ (Γ' Λυκείου)
  // ============================================================================
  {
    id: 'quantum-photoelectric-stopping',
    chapter: 'Κβαντική, Ατομική & Πυρηνική Φυσική',
    grade: "Γ' Λυκείου",
    title: 'Φωτοηλεκτρικό Φαινόμενο & Δυναμικό Αποκοπής V_0(f)',
    canonicalLatex: 'K_{\\max} = h \\cdot f - W_{\\varepsilon\\xi},\\; V_0 = \\frac{h}{e} f - \\frac{W_{\\varepsilon\\xi}}{e}',
    aliases: [
      'K_max = h*f - φ',
      'K_max = h*f - W_εξ',
      'e*V_0 = h*f - φ',
      'e*V_0 = h*f - W_εξ',
      'V_0 = (h/e)*f - φ/e',
      'V_0 = (h/e)*f - W_εξ/e',
      'V_απ = (h/e)*f - W_εξ/e',
      'V_0 - f',
      'V_απ - f',
      'K_max - f',
      'I_φ - V',
    ],
    yAxis: 'V_0',
    xAxis: 'f',
    diagramDescription: 'Ευθεία με συχνότητα κατωφλίου f_0 και διακεκομμένη προέκταση στο -W_εξ (ή -W_εξ/e), και καμπύλη I(V) από -V_0 έως I_κορ',
  },
  {
    id: 'quantum-debroglie-bohr-nuclear',
    chapter: 'Κβαντική, Ατομική & Πυρηνική Φυσική',
    grade: "Γ' Λυκείου",
    title: 'Φωτόνια, de Broglie, Μέλαν Σώμα, Άτομο Bohr & Ραδιενέργεια',
    canonicalLatex: 'E = hf,\\; \\lambda = \\frac{h}{p},\\; r_n = n^2 r_1,\\; N = N_0 e^{-\\lambda t}',
    aliases: [
      'E = h*f',
      'E = h*c/λ',
      'λ = h/p',
      'λ = h/(m*u)',
      'λ_max = b/T',
      'r_n = n^2*r_1',
      'E_n = -E_1/n^2',
      'N = N_0*e^(-λ*t)',
      'N_δ = N_0*(1 - e^(-λ*t))',
      'E_B/A - A',
    ],
    yAxis: 'N',
    xAxis: 't',
    diagramDescription: 'Ευθεία E(f), υπερβολές E(λ), λ(p), λ_max(T), παραβολή Bohr r_n(n), ραδιενεργός διάσπαση N(t) και ενέργεια σύνδεσης E_B/A(A)',
  },
];
