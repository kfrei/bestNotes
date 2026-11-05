import React, { useState, useEffect, useRef } from 'react';
import {
  Pen,
  Highlighter,
  Eraser,
  Shapes,
  Lasso,
  Layers,
  Search,
  Sparkles,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  GripVertical,
  Copy,
  Plus,
  FileText,
  FolderOpen,
  LogOut,
  User as UserIcon,
  X,
  Move,
  ZoomIn,
  RotateCcw,
} from 'lucide-react';
import {
  auth,
  googleProvider,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  type User,
} from '../firebase';

interface LandingPageProps {
  currentUser: User | null;
  onEnterApp: () => void;
  onOpenAuthModal: (initialMode: 'signin' | 'signup') => void;
  showAuthModal: boolean;
  setShowAuthModal: (v: boolean) => void;
  authMode: 'signin' | 'signup';
  setAuthMode: (m: 'signin' | 'signup') => void;
}

type ShowcaseTabId =
  | 'sim-forces'
  | 'sim-springs'
  | 'sim-circuits'
  | 'sim-atoms'
  | 'water-cycle'
  | 'photosynthesis'
  | 'acids'
  | 'blood-vessels'
  | 'mass-physics'
  | 'sine-3d'
  | 'layers-groups';

export interface ScienceNoteAsset {
  id: ShowcaseTabId;
  tabLabel: string;
  shortTitle: string;
  title: string;
  subjectBadge: string;
  subjectColor: string;
  src: string;
  highlightColor: string;
  highlightText: string;
  secondaryHighlightText: string;
  description: string;
  formulaBadge: string;
}

const LIVE_SIMULATION_GIFS: ScienceNoteAsset[] = [
  {
    id: 'sim-forces',
    tabLabel: '🎯 Δυνάμεις & Ανάλυση',
    shortTitle: 'Δυνάμεις & Ανάλυση F',
    title: 'Ανάλυση & Σύνθεση Δυνάμεων, Κεκλιμένο Επίπεδο & Εκκρεμές',
    subjectBadge: 'Φυσική • Μηχανική',
    subjectColor: '#7c3aed',
    src: '/showcase/sim-forces.gif',
    highlightColor: '#c4b5fd',
    highlightText: 'Fx = F·συν(θ),  Fy = F·ημ(θ)  &  Μαγνητικό Κλείδωμα Πυθαγορείων Τριάδων',
    secondaryHighlightText: 'Σύρε την άκρη της δύναμης F στον καμβά • Αυτόματοι Υπολογισμοί Συνιστωσών',
    description:
      'Σχεδίασε με το μολύβι ένα ή δύο διανύσματα, ένα κεκλιμένο επίπεδο ή ένα εκκρεμές και δες τα να ζωντανεύουν! Κούνησε ελεύθερα την άκρη της δύναμης με μαγνητικό κλείδωμα σε ακέραιες τιμές (π.χ. 6 N, 8 N, 10 N) και εμφάνισε βήμα-βήμα τους υπολογισμούς.',
    formulaBadge: '🧲 F = √(Fx² + Fy²) = 10 N',
  },
  {
    id: 'sim-springs',
    tabLabel: '🌀 Ελατήρια & Ταλάντωση',
    shortTitle: 'Ελατήρια & Ταλαντώσεις',
    title: 'Απλή Αρμονική Ταλάντωση, Νόμος του Hooke & Γραφήματα x(t), υ(t), α(t)',
    subjectBadge: 'Φυσική • Ταλαντώσεις',
    subjectColor: '#0284c7',
    src: '/showcase/sim-springs.gif',
    highlightColor: '#7dd3fc',
    highlightText: 'Fελ = -k·x  •  Ζωντανή Ταλάντωση & Συγχρονισμένα Διαγράμματα x(t), υ(t), α(t)',
    secondaryHighlightText: 'Τράβηξε το σώμα m από τη Θέση Ισορροπίας (+A / -A) και άφησέ το να ταλαντωθεί!',
    description:
      'Ζωγράφισε στήριγμα, ελατήριο και μάζα με το μολύβι σου! Το σχέδιό σου μετατρέπεται αμέσως σε ζωντανό ταλαντωτή με διανύσματα δυνάμεων (Fελ, B), πίνακα μετρήσεων Νόμου του Hooke και γραφήματα θέσης, ταχύτητας και επιτάχυνσης σε πραγματικό χρόνο.',
    formulaBadge: '🌀 x(t) = A·ημ(ωt)',
  },
  {
    id: 'sim-circuits',
    tabLabel: '⚡ Ηλεκτρικά Κυκλώματα',
    shortTitle: 'Ηλεκτρικά Κυκλώματα',
    title: 'Ηλεκτρικά Κυκλώματα από το Μολύβι σε Ζωντανή Ροή Ηλεκτρονίων',
    subjectBadge: 'Φυσική • Ηλεκτρισμός',
    subjectColor: '#0f172a',
    src: '/showcase/sim-circuits.gif',
    highlightColor: '#fde047',
    highlightText: 'Κλείσε τον διακόπτη στον καμβά ➔ Ροή Ηλεκτρονίων (e⁻) & Φωτεινός Λαμπτήρας',
    secondaryHighlightText: 'Πηγή V, Διακόπτης, Λαμπτήρας, Αντιστάτης R & Μοτέρ με αυτόματη στοίχιση',
    description:
      'Σχεδίασε με το χέρι ένα ηλεκτρικό κύκλωμα στον πίνακα. Με ένα κλικ στο Sim, το κύκλωμα ευθυγραμμίζεται, ο διακόπτης γίνεται διαδραστικός και τα ηλεκτρόνια αρχίζουν να ρέουν ανάβοντας τον λαμπτήρα!',
    formulaBadge: '⚡ I = V / R • Ροή e⁻',
  },
  {
    id: 'sim-atoms',
    tabLabel: '⚛️ Δομή Ατόμου & ChemOCR',
    shortTitle: 'Δομή Ατόμου & Χημεία',
    title: 'Δομή Ατόμου (Bohr), Περιοδικός Πίνακας, Δεσμοί & ChemOCR Αντιδράσεων',
    subjectBadge: 'Χημεία • Άτομα & Δεσμοί',
    subjectColor: '#4f46e5',
    src: '/showcase/sim-atoms.gif',
    highlightColor: '#a7f3d0',
    highlightText: 'Ζευγαράκια Ηλεκτρονίων 2-2 σε Αργή Περιστροφή • Ετεροπολικός & Ομοιοπολικός Δεσμός',
    secondaryHighlightText: 'Γράπωσε εξωτερικό e⁻ σε διπλανό άτομο ή πάτα το βέλος ➔ για 2s Animation Αντίδρασης!',
    description:
      'Ζωγράφισε πυρήνα και τροχιές, επίλεξε στοιχείο από τον Draggable Περιοδικός Πίνακα (H έως Rn) με πλήρη συμβολισμό ᴬᶻX, σύρε ηλεκτρόνια σθένους για δημιουργία δεσμών ή αναγνώρισε χειρόγραφες χημικές αντιδράσεις με ChemOCR!',
    formulaBadge: '⚛️ Na + Cl ➔ Na⁺Cl⁻',
  },
  {
    id: 'layers-groups',
    tabLabel: '🔗 Layers & Groups',
    shortTitle: 'Layers & Groups (Βαράκια)',
    title: 'Πείραμα Ελατηρίων & Ομαδοποίηση (Ελατήριο + Βελάκι + Βαράκια σε Group)',
    subjectBadge: 'Layers & Groups PRO',
    subjectColor: '#4f46e5',
    src: '__animated_hooke_group__',
    highlightColor: '#6ee7b7',
    highlightText: '🔗 Επιλογή (Select) Ελατήριο + Βελάκι + 3 Βαράκια (0,1 kg) σε 1 Ενιαίο Group!',
    secondaryHighlightText: 'Σταδιακό κρέμασμα βαρών με ταλάντωση πάνω-κάτω • Χάρακας cm • Πίνακας & Γράφημα Fελ - Δl',
    description:
      'Οργάνωσε τον καμβά σου σε Layers και ένωσε με το Λάσο το Ελατήριο, το Βελάκι δείκτη και τα Βαράκια (0,1 kg) σε ένα ενιαίο Group για να τα μετακινείς ή να τα αντιγράφεις όλα μαζί!',
    formulaBadge: '🔗 Group: Ελατήριο + Βελάκι + Βαράκια',
  },
];

const STATIC_SCIENCE_NOTES: ScienceNoteAsset[] = [
  {
    id: 'water-cycle',
    tabLabel: '1. Whiteboard • Κύκλος Νερού',
    shortTitle: 'Ο Κύκλος του Νερού',
    title: 'Ο Κύκλος του Νερού — Διαδραστικό Whiteboard',
    subjectBadge: 'Γεωγραφία & Φυσική',
    subjectColor: '#0284c7',
    src: '/showcase/kyklos-nerou.png',
    highlightColor: '#fde047',
    highlightText: '1. Εξάτμιση ➔ 2. Συμπύκνωση ➔ 3. Κατακρήμνιση',
    secondaryHighlightText: '4. Συγκέντρωση σε λίμνες, ποτάμια & θάλασσες',
    description:
      'Συνδύασε χειρόγραφες σημειώσεις σε τετραγωνισμένο χαρτί με εικονογραφήσεις, βέλη ροής, φωσφορούχο υπογραμμιστήριο και σύρε ελεύθερα τις κάρτες με το ποντίκι.',
    formulaBadge: '☀️ Εξάτμιση & Συμπύκνωση Η₂Ο',
  },
  {
    id: 'photosynthesis',
    tabLabel: '2. PDF • Φωτοσύνθεση',
    shortTitle: 'Η Φωτοσύνθεση',
    title: 'Η Φωτοσύνθεση — Υπογράμμιση PDF με Apple Pencil',
    subjectBadge: 'Βιολογία',
    subjectColor: '#16a34a',
    src: '/showcase/fotosynthesi.jpg',
    highlightColor: '#4ade80',
    highlightText: '6CO₂ + 6H₂O ➔ C₆H₁₂O₆ (Γλυκόζη) + 6O₂',
    secondaryHighlightText: 'Χλωροπλάστης • Θυλακοειδή & Grana',
    description:
      'Υπογράμμισε με φωσφορούχο μαρκαδόρο τις χημικές εξισώσεις της φωτοσύνθεσης, κύκλωσε τον χλωροπλάστη και το φυτικό κύτταρο και κάνε zoom σε κάθε λεπτομέρεια.',
    formulaBadge: '🌿 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂',
  },
  {
    id: 'acids',
    tabLabel: '3. Documents • Τα Οξέα',
    shortTitle: 'Τα Οξέα (Χημεία)',
    title: 'Τα Οξέα — Μικρά στη γεύση, μεγάλα σε δράση!',
    subjectBadge: 'Χημεία',
    subjectColor: '#dc2626',
    src: '/showcase/oxea.jpg',
    highlightColor: '#fde047',
    highlightText: 'HA ➔ H⁺ + A⁻ (Ιοντισμός Οξέων σε Διάλυμα)',
    secondaryHighlightText: 'HCl, H₂SO₄, CH₃COOH • Δείκτες pH & Μέταλλα',
    description:
      'Οργάνωσε πολύχρωμα φύλλα Χημείας με ξύδι, λεμόνι, γαλακτικό & υδροχλωρικό οξύ, μετατροπή εξισώσεων με MathOCR και φωσφορούχες επισημάνσεις.',
    formulaBadge: '🧪 HA → H⁺ + A⁻ | pH < 7',
  },
  {
    id: 'blood-vessels',
    tabLabel: '4. Notebooks • Αιμοφόρα Αγγεία',
    shortTitle: 'Αιμοφόρα Αγγεία',
    title: 'Αιμοφόρα Αγγεία — Αρτηρίες, Φλέβες & Τριχοειδή',
    subjectBadge: 'Ανατομία & Βιολογία',
    subjectColor: '#e11d48',
    src: '/showcase/aimofora-aggeia.jpg',
    highlightColor: '#f472b6',
    highlightText: 'Αρτηρίες (O₂) ➔ Τριχοειδή (Ανταλλαγή) ➔ Φλέβες (CO₂)',
    secondaryHighlightText: 'Ροή Πίεσης & Βαλβίδες Φλεβικής Επιστροφής',
    description:
      'Μελέτησε το κυκλοφορικό σύστημα με ζωντανή υπογράμμιση Apple Pencil, ορθογώνιο λάσο επιλογής και ανεξάρτητα Layers για εξάσκηση.',
    formulaBadge: '❤️ Αρτηρίες • Φλέβες • Τριχοειδή',
  },
  {
    id: 'mass-physics',
    tabLabel: '5. Φυσική • Η Μάζα',
    shortTitle: 'Τι είναι η Μάζα',
    title: 'Τι είναι η Μάζα και Πώς την Μετράμε',
    subjectBadge: 'Φυσική & Μετρήσεις',
    subjectColor: '#2563eb',
    src: '/showcase/maza.png',
    highlightColor: '#38bdf8',
    highlightText: 'Η μάζα είναι η ποσότητα ύλης που περιέχει ένα σώμα',
    secondaryHighlightText: '1. Με ζυγό ισορροπίας • 2. Με ηλεκτρονική ζυγαριά (185.4 g)',
    description:
      'Σχεδίασε πειράματα μέτρησης μάζας με ζυγό ισορροπίας, σταθμά (100g, 50g, 20g, 5g) και ηλεκτρονική ζυγαριά με αυτόματο zoom και MathOCR.',
    formulaBadge: '⚖️ m = 185.4 g (Σταθερή Παντού)',
  },
];

const SCIENCE_NOTES: ScienceNoteAsset[] = [
  ...LIVE_SIMULATION_GIFS,
  ...STATIC_SCIENCE_NOTES,
];

const SHOWCASE_TABS: { id: ShowcaseTabId; label: string; badge?: string }[] = [
  { id: 'sim-forces', label: '🎯 Δυνάμεις', badge: 'LIVE' },
  { id: 'sim-springs', label: '🌀 Ελατήρια', badge: 'LIVE' },
  { id: 'sim-circuits', label: '⚡ Κυκλώματα', badge: 'LIVE' },
  { id: 'sim-atoms', label: '⚛️ Άτομο & Χημεία', badge: 'LIVE' },
  { id: 'layers-groups', label: 'Layers & Groups', badge: 'PRO' },
  { id: 'sine-3d', label: 'Ημίτονα & 3D', badge: 'PRO' },
];

/* ============================================================================
   INTERACTIVE DRAGGABLE CARD WRAPPER (Mouse & Touch Dragging with Reset)
   ============================================================================ */
const DraggableCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  resetSignal?: number;
  badgeText?: string;
  onClickCard?: () => void;
}> = ({ children, className = '', style, resetSignal = 0, badgeText = '✋ Σύρε με ποντίκι', onClickCard }) => {
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ startX: number; startY: number; origX: number; origY: number; moved: boolean } | null>(
    null
  );

  useEffect(() => {
    setOffset({ x: 0, y: 0 });
  }, [resetSignal]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    e.stopPropagation();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: offset.x,
      origY: offset.y,
      moved: false,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStartRef.current.moved = true;
    }
    setOffset({
      x: dragStartRef.current.origX + dx,
      y: dragStartRef.current.origY + dy,
    });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const wasMoved = dragStartRef.current?.moved;
    setIsDragging(false);
    dragStartRef.current = null;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    if (!wasMoved && onClickCard) {
      onClickCard();
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        ...style,
        transform: `translate3d(${offset.x}px, ${offset.y}px, 0) ${isDragging ? 'scale(1.04) rotate(0deg)' : ''}`,
        transition: isDragging ? 'none' : 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s ease',
        touchAction: 'none',
      }}
      className={`group/drag select-none cursor-grab active:cursor-grabbing ${
        isDragging ? 'z-50 shadow-2xl ring-2 ring-[#0066ff]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * Ζωντανή βήμα-προς-βήμα προσομοίωση για την καρτέλα "Layers & Groups PRO":
 * 1. Χτίζει σταδιακά τα 4 ελατήρια με τα βαράκια (0,1 kg), τον κατακόρυφο χάρακα (0..3 cm), τον πίνακα μετρήσεων και το διάγραμμα Fελ - Δl.
 * 2. Δείχνει την ταλάντωση (πάνω-κάτω κίνηση) κάθε ελατηρίου & των βαρών καθώς κρεμιούνται.
 * 3. Επιλέγει (Select) Ελατήριο + Βελάκι + Βαράκια μαζί σε ένα ενιαίο Group (🔗 Group) και δείχνει τη μετακίνησή τους ως μία ομάδα!
 */
const AnimatedHookeWeightsGroupShowcase: React.FC<{
  className?: string;
  showStatusBanner?: boolean;
}> = ({ className = 'w-full h-[370px]', showStatusBanner = false }) => {
  const [elapsedSec, setElapsedSec] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const startMs = performance.now();
    const CYCLE_SEC = 12.5;
    const loop = (now: number) => {
      const t = ((now - startMs) / 1000) % CYCLE_SEC;
      setElapsedSec(t);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // Χρονισμός βημάτων (0..12.5s):
  // t >= 0.2s: 1ο ελατήριο (δεξιά, 0 βάρη, 0 cm, μωβ βελάκι)
  // t >= 2.0s: 2ο ελατήριο (1 βάρος 0,1 kg, 1 cm, κόκκινο βελάκι + ταλάντωση πάνω-κάτω)
  // t >= 4.4s: 3ο ελατήριο (2 βάρη 0,1 kg, 2 cm, μπλε βελάκι + ταλάντωση πάνω-κάτω)
  // t >= 6.8s: 4ο ελατήριο (3 βάρη 0,1 kg, 3 cm, πράσινο βελάκι + ταλάντωση πάνω-κάτω)
  // t >= 9.2s: Select Ελατήριο + Βελάκι + Βαράκια σε 1 Group (🔗 Group) & ομαδική κίνηση!
  const stepTimes = [0.2, 2.0, 4.4, 6.8];
  const isGroupSelectPhase = elapsedSec >= 9.2;
  const groupSelectProgress = isGroupSelectPhase
    ? Math.min(1, (elapsedSec - 9.2) / 0.7)
    : 0;
  // Μικρή ομαλή κίνηση όλου του Group (Ελατήριο + Βελάκι + 3 Βαράκια) όταν έχει γίνει Group!
  const groupShiftX =
    elapsedSec >= 10.0 ? Math.sin((elapsedSec - 10.0) * 3.2) * 8 : 0;
  const groupShiftY =
    elapsedSec >= 10.0 ? Math.cos((elapsedSec - 10.0) * 3.2) * 3.5 : 0;

  // Κατασκευή SVG μονοπατιού ελατηρίου με σπείρες από (x, topY) έως (x, bottomY)
  const buildSpringSvgPath = (cx: number, topY: number, bottomY: number, coils = 9) => {
    const lead = 10;
    const bodyTop = topY + lead;
    const bodyBot = Math.max(bodyTop + 20, bottomY - lead);
    const totalH = bodyBot - bodyTop;
    const stepH = totalH / coils;
    const rx = 12;
    let d = `M ${cx} ${topY} L ${cx} ${bodyTop}`;
    for (let i = 0; i < coils; i++) {
      const y0 = bodyTop + i * stepH;
      const yMid = y0 + stepH * 0.5;
      const y1 = y0 + stepH;
      d += ` C ${cx + rx} ${y0 + stepH * 0.15}, ${cx + rx} ${yMid - stepH * 0.1}, ${cx} ${yMid}`;
      d += ` C ${cx - rx} ${yMid + stepH * 0.1}, ${cx - rx} ${y1 - stepH * 0.15}, ${cx} ${y1}`;
    }
    d += ` L ${cx} ${bottomY}`;
    return d;
  };

  // Τα 4 ελατήρια από δεξιά προς αριστερά (όπως στην εικόνα: 0 cm δεξιά, 1 cm, 2 cm, 3 cm αριστερά)
  const columns = [
    {
      idx: 0,
      weights: 0,
      x: 310,
      cm: 0,
      baseBotY: 112,
      color: '#9333ea',
      badgeBg: '#f3e8ff',
      label: '◀ 0 cm',
      massStr: '0',
      forceStr: '0',
    },
    {
      idx: 1,
      weights: 1,
      x: 236,
      cm: 1,
      baseBotY: 146,
      color: '#dc2626',
      badgeBg: '#fee2e2',
      label: '◀ 1 cm',
      massStr: '0,1',
      forceStr: '1',
    },
    {
      idx: 2,
      weights: 2,
      x: 162,
      cm: 2,
      baseBotY: 180,
      color: '#2563eb',
      badgeBg: '#dbeafe',
      label: '◀ 2 cm',
      massStr: '0,2',
      forceStr: '2',
    },
    {
      idx: 3,
      weights: 3,
      x: 86,
      cm: 3,
      baseBotY: 214,
      color: '#16a34a',
      badgeBg: '#dcfce7',
      label: '◀ 3 cm',
      massStr: '0,3',
      forceStr: '3',
    },
  ];

  const rulerX = 398;
  const rulerZeroY = 112;
  const cmStepPx = 34; // 1 cm = 34px πάνω στον χάρακα

  return (
    <div className="w-full relative overflow-hidden bg-[#fcfaf2]">
      {showStatusBanner && (
        <div className="flex items-center justify-between gap-2 flex-wrap px-3 pt-2.5 pb-1.5 bg-[#fffdf7] border-b border-slate-200/70">
          <span className="text-[11px] font-extrabold text-slate-800">
            Πείραμα Ελατηρίων &amp; Ομαδοποίηση (Ελατήριο + Βελάκι + Βαράκια σε Group)
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full border text-[10px] font-extrabold transition-all ${
              isGroupSelectPhase
                ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            {isGroupSelectPhase
              ? '🔗 Επιλεγμένο Group: Ελατήριο + Βελάκι + 3 Βαράκια!'
              : '⚖️ Κρέμασμα Βαρών (0,1 kg) & Ταλάντωση...'}
          </span>
        </div>
      )}

      <svg
        className={`${className} block bg-[#fcfaf2]`}
        viewBox="0 0 600 465"
        preserveAspectRatio="xMidYMid meet"
      >
          <defs>
            <pattern id="hookeGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="rgba(148, 163, 184, 0.23)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="600" height="465" fill="url(#hookeGrid)" />

          {/* Οριζόντια μπάρα στήριξης στην οροφή */}
          <line
            x1="28"
            y1="22"
            x2="365"
            y2="22"
            stroke="#0f172a"
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* Σχεδίαση των 4 Ελατηρίων, των Βελών Δείκτη & των Βαρών 0,1 kg με Ταλάντωση */}
          {columns.map((col) => {
            const appearT = stepTimes[col.idx];
            if (elapsedSec < appearT) return null;
            const dt = elapsedSec - appearT;
            const fade = Math.min(1, dt / 0.35);

            // Απόσβεση ταλάντωσης πάνω-κάτω καθώς κρεμιούνται τα βαράκια!
            const bounceAmp = col.weights === 0 ? 0 : 12 + col.weights * 3.5;
            const bounceY =
              dt < 2.2 && col.weights > 0
                ? Math.exp(-2.6 * dt) * Math.sin(dt * 15.5) * bounceAmp
                : Math.sin(elapsedSec * 2.2 + col.idx) * (col.weights > 0 ? 1.1 : 0);

            const isThisColumnGrouped = col.idx === 3 && isGroupSelectPhase;
            const gx = isThisColumnGrouped ? groupShiftX : 0;
            const gy = isThisColumnGrouped ? groupShiftY : 0;

            const curX = col.x + gx;
            const curBotY = col.baseBotY + bounceY + gy;
            const springPath = buildSpringSvgPath(curX, 22 + gy, curBotY, 9);

            return (
              <g key={col.idx} opacity={fade}>
                {/* Αν είναι η φάση Group Selection στο 4ο ελατήριο (Ελατήριο + Βελάκι + 3 Βαράκια), δείξε το πλαίσιο Group! */}
                {isThisColumnGrouped && (
                  <g>
                    <rect
                      x={curX - 28}
                      y={16 + gy}
                      width={86 * groupSelectProgress}
                      height={318 * groupSelectProgress}
                      rx="10"
                      fill="rgba(16, 185, 129, 0.08)"
                      stroke="#10b981"
                      strokeWidth="2.2"
                      strokeDasharray="6 4"
                    />
                    {groupSelectProgress > 0.75 && (
                      <g transform={`translate(${curX - 26}, ${4 + gy})`}>
                        <rect
                          x="0"
                          y="0"
                          width="178"
                          height="18"
                          rx="6"
                          fill="#059669"
                        />
                        <text
                          x="89"
                          y="12.5"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="9.5"
                          fontWeight="bold"
                        >
                          🔗 Group: Ελατήριο + Βελάκι + Βαράκια
                        </text>
                      </g>
                    )}
                  </g>
                )}

                {/* Ελατήριο */}
                <path
                  d={springPath}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />

                {/* Κόμβος σύνδεσης & Βελάκι Δείκτη (Pointer Arrow) */}
                <circle cx={curX} cy={curBotY} r="3.2" fill={col.color} />
                <line
                  x1={curX}
                  y1={curBotY}
                  x2={curX + 36}
                  y2={curBotY}
                  stroke={col.color}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <polyline
                  points={`${curX + 29},${curBotY - 4.5} ${curX + 37},${curBotY} ${curX + 29},${curBotY + 4.5}`}
                  fill="none"
                  stroke={col.color}
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Διακεκομμένη γραμμή μέτρησης προς τον κατακόρυφο χάρακα */}
                <line
                  x1={curX + 38}
                  y1={curBotY}
                  x2={rulerX}
                  y2={curBotY}
                  stroke={col.color}
                  strokeWidth="1.5"
                  strokeDasharray="5 4"
                />

                {/* Κρεμαστά Βαράκια (0,1 kg το καθένα) */}
                {Array.from({ length: col.weights }).map((_, wIdx) => {
                  const wy = curBotY + 6 + wIdx * 36;
                  return (
                    <g key={wIdx}>
                      {/* Πάνω γάντζος */}
                      <path
                        d={`M ${curX} ${wy - 6} L ${curX} ${wy}`}
                        stroke="#1e293b"
                        strokeWidth="2"
                      />
                      {/* Σώμα σταθμού 0,1 kg */}
                      <rect
                        x={curX - 13}
                        y={wy}
                        width="26"
                        height="26"
                        rx="2.5"
                        fill="#cbd5e1"
                        stroke="#1e293b"
                        strokeWidth="1.8"
                      />
                      <text
                        x={curX}
                        y={wy + 11.5}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize="8.5"
                        fontWeight="bold"
                      >
                        0,1
                      </text>
                      <text
                        x={curX}
                        y={wy + 21}
                        textAnchor="middle"
                        fill="#0f172a"
                        fontSize="8"
                        fontWeight="bold"
                      >
                        kg
                      </text>
                      {/* Κάτω γάντζος */}
                      <path
                        d={`M ${curX} ${wy + 26} C ${curX + 5} ${wy + 26}, ${curX + 5} ${wy + 32}, ${curX} ${wy + 32} C ${curX - 4} ${wy + 32}, ${curX - 4} ${wy + 29}, ${curX - 1} ${wy + 29}`}
                        fill="none"
                        stroke="#1e293b"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* ΚΑΤΑΚΟΡΥΦΟΣ ΧΑΡΑΚΑΣ (0 έως 10 cm) ΔΕΞΙΑ */}
          <g transform={`translate(${rulerX}, ${rulerZeroY - 4})`}>
            <rect
              x="0"
              y="0"
              width="52"
              height="346"
              rx="6"
              fill="rgba(226, 232, 240, 0.85)"
              stroke="#94a3b8"
              strokeWidth="1.5"
            />
            {Array.from({ length: 11 }).map((_, cmVal) => {
              const yTick = 4 + cmVal * cmStepPx;
              return (
                <g key={cmVal}>
                  <line
                    x1="0"
                    y1={yTick}
                    x2="13"
                    y2={yTick}
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  <line
                    x1="39"
                    y1={yTick}
                    x2="52"
                    y2={yTick}
                    stroke="#475569"
                    strokeWidth="1.5"
                  />
                  {cmVal < 10 && (
                    <>
                      <line
                        x1="0"
                        y1={yTick + cmStepPx * 0.5}
                        x2="8"
                        y2={yTick + cmStepPx * 0.5}
                        stroke="#94a3b8"
                        strokeWidth="1.1"
                      />
                      <line
                        x1="44"
                        y1={yTick + cmStepPx * 0.5}
                        x2="52"
                        y2={yTick + cmStepPx * 0.5}
                        stroke="#94a3b8"
                        strokeWidth="1.1"
                      />
                    </>
                  )}
                  <text
                    x="26"
                    y={yTick + 3.5}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="9.5"
                    fontWeight="bold"
                  >
                    {cmVal}
                  </text>
                </g>
              );
            })}

            {/* Κουμπάκια Χάρακα (↻ και cm) */}
            <circle cx="70" cy="245" r="12" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.4" />
            <text x="70" y="249" textAnchor="middle" fill="#475569" fontSize="11" fontWeight="bold">
              ↻
            </text>
            <circle cx="70" cy="274" r="13" fill="#0066ff" />
            <text x="70" y="277.5" textAnchor="middle" fill="#ffffff" fontSize="9.5" fontWeight="bold">
              cm
            </text>
          </g>

          {/* Ταμπελάκια Μετρήσεων Δίπλα στον Χάρακα (◀ 0 cm, ◀ 1 cm, ◀ 2 cm, ◀ 3 cm) */}
          {columns.map((col) => {
            if (elapsedSec < stepTimes[col.idx] + 0.25) return null;
            const yMark = rulerZeroY + col.cm * cmStepPx;
            return (
              <g key={`lbl-${col.idx}`}>
                <line
                  x1={rulerX}
                  y1={yMark}
                  x2={rulerX + 52}
                  y2={yMark}
                  stroke={col.color}
                  strokeWidth="1.8"
                />
                <rect
                  x={rulerX + 60}
                  y={yMark - 10}
                  width="54"
                  height="20"
                  rx="6"
                  fill="#ffffff"
                  stroke={col.color}
                  strokeWidth="1.4"
                />
                <text
                  x={rulerX + 87}
                  y={yMark + 3.5}
                  textAnchor="middle"
                  fill={col.color}
                  fontSize="10"
                  fontWeight="bold"
                >
                  {col.label}
                </text>
              </g>
            );
          })}

          {/* ΠΙΝΑΚΑΣ ΜΕΤΡΗΣΕΩΝ ΝΟΜΟΥ HOOKE & ΔΙΑΓΡΑΜΜΑ Fελ(N) - Δl(cm) ΚΑΤΩ ΑΡΙΣΤΕΡΑ */}
          <g transform="translate(118, 224)">
            {/* Διακεκομμένο πλαίσιο widgets */}
            <rect
              x="0"
              y="0"
              width="256"
              height="232"
              rx="8"
              fill="rgba(255, 255, 255, 0.55)"
              stroke="#60a5fa"
              strokeWidth="1.3"
              strokeDasharray="4 4"
            />

            {/* Πίνακας Μετρήσεων */}
            <rect
              x="6"
              y="5"
              width="244"
              height="86"
              rx="7"
              fill="#ffffff"
              stroke="#cbd5e1"
              strokeWidth="1.3"
            />
            <text x="26" y="19" textAnchor="middle" fill="#1e293b" fontSize="8.5" fontWeight="bold">
              Βάρη
            </text>
            <text x="72" y="19" textAnchor="middle" fill="#1e293b" fontSize="8.5" fontWeight="bold">
              m (kg)
            </text>
            <text x="130" y="19" textAnchor="middle" fill="#1e293b" fontSize="8.5" fontWeight="bold">
              W=Fελ(N)
            </text>
            <text x="186" y="19" textAnchor="middle" fill="#1e293b" fontSize="8.5" fontWeight="bold">
              Δl (cm)
            </text>
            <circle cx="228" cy="16" r="3.5" fill="#0284c7" />
            <line x1="8" y1="24" x2="248" y2="24" stroke="#e2e8f0" strokeWidth="1" />

            {columns.map((col, rIdx) => {
              const isRowVisible = elapsedSec >= stepTimes[rIdx] + 0.35;
              const isLatestRow =
                isRowVisible &&
                (rIdx === 3 || elapsedSec < stepTimes[rIdx + 1] + 0.35);
              const ry = 26 + rIdx * 15.5;
              return (
                <g key={`row-${rIdx}`} opacity={isRowVisible ? 1 : 0.25}>
                  {isLatestRow && (
                    <rect
                      x="8"
                      y={ry}
                      width="240"
                      height="15"
                      rx="3"
                      fill="#dbeafe"
                    />
                  )}
                  <text
                    x="26"
                    y={ry + 10.5}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="8.5"
                    fontWeight="bold"
                  >
                    {isRowVisible ? col.weights : '—'}
                  </text>
                  <text
                    x="72"
                    y={ry + 10.5}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="8.5"
                    fontWeight="bold"
                  >
                    {isRowVisible ? col.massStr : '—'}
                  </text>
                  <text
                    x="130"
                    y={ry + 10.5}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="8.5"
                    fontWeight="bold"
                  >
                    {isRowVisible ? col.forceStr : '—'}
                  </text>
                  <text
                    x="186"
                    y={ry + 10.5}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="8.5"
                    fontWeight="bold"
                  >
                    {isRowVisible ? col.cm : '—'}
                  </text>
                  <circle
                    cx="228"
                    cy={ry + 7.5}
                    r="4.2"
                    fill={isRowVisible ? '#0284c7' : '#ffffff'}
                    stroke="#0284c7"
                    strokeWidth="1.2"
                  />
                </g>
              );
            })}

            {/* Διάγραμμα Fελ(N) - Δl(cm) */}
            <g transform="translate(28, 104)">
              {/* Άξονες */}
              <line x1="0" y1="112" x2="0" y2="8" stroke="#0f172a" strokeWidth="1.8" />
              <polyline
                points="-4,14 0,7 4,14"
                fill="none"
                stroke="#0f172a"
                strokeWidth="1.8"
              />
              <text x="8" y="16" fill="#0f172a" fontSize="10.5" fontWeight="bold" fontStyle="italic">
                Fελ (N)
              </text>

              <line x1="0" y1="112" x2="188" y2="112" stroke="#0f172a" strokeWidth="1.8" />
              <polyline
                points="182,108 189,112 182,116"
                fill="none"
                stroke="#0f172a"
                strokeWidth="1.8"
              />
              <text x="135" y="105" fill="#0f172a" fontSize="10" fontWeight="bold" fontStyle="italic">
                Δl (cm)
              </text>

              {/* Κουμπάκι [✓ Γραμμή] */}
              <rect
                x="118"
                y="6"
                width="62"
                height="18"
                rx="5"
                fill="#f0fdf4"
                stroke="#16a34a"
                strokeWidth="1.2"
              />
              <rect x="123" y="10" width="10" height="10" rx="2" fill="#16a34a" />
              <text x="128" y="18" textAnchor="middle" fill="#ffffff" fontSize="8" fontWeight="bold">
                ✓
              </text>
              <text x="156" y="18" textAnchor="middle" fill="#15803d" fontSize="8.5" fontWeight="bold">
                Γραμμή
              </text>

              {/* Ευθεία Νόμου Hooke & Σημεία (0,0), (1,1), (2,2), (3,3) */}
              {(() => {
                const activeCount = stepTimes.filter((st) => elapsedSec >= st + 0.35).length;
                const pts = [
                  { x: 0, y: 112, label: '0' },
                  { x: 42, y: 82, label: '1' },
                  { x: 84, y: 52, label: '2' },
                  { x: 126, y: 22, label: '3' },
                ].slice(0, activeCount);

                return (
                  <>
                    {pts.length >= 2 && (
                      <line
                        x1={pts[0].x}
                        y1={pts[0].y}
                        x2={pts[pts.length - 1].x}
                        y2={pts[pts.length - 1].y}
                        stroke="#0284c7"
                        strokeWidth="2.4"
                      />
                    )}
                    {pts.map((p, idx) => (
                      <g key={`gpt-${idx}`}>
                        {idx > 0 && (
                          <>
                            <line
                              x1={p.x}
                              y1={112}
                              x2={p.x}
                              y2={p.y}
                              stroke="#38bdf8"
                              strokeWidth="1.1"
                              strokeDasharray="3 3"
                            />
                            <line
                              x1={0}
                              y1={p.y}
                              x2={p.x}
                              y2={p.y}
                              stroke="#38bdf8"
                              strokeWidth="1.1"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={p.x}
                              y="123"
                              textAnchor="middle"
                              fill="#0f172a"
                              fontSize="8.5"
                              fontWeight="bold"
                            >
                              {p.label}
                            </text>
                            <text
                              x="-8"
                              y={p.y + 3}
                              textAnchor="end"
                              fill="#0f172a"
                              fontSize="8.5"
                              fontWeight="bold"
                            >
                              {p.label}
                            </text>
                          </>
                        )}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="4.2"
                          fill="#0284c7"
                          stroke="#e0f2fe"
                          strokeWidth="1.8"
                        />
                      </g>
                    ))}
                  </>
                );
              })()}
            </g>
          </g>
        </svg>
    </div>
  );
};

export const isExplainBoardsBrand =
  typeof window !== 'undefined' &&
  (window.location.hostname.toLowerCase().includes('explainboard') ||
    window.location.search.toLowerCase().includes('explainboard'));

export const BestNotesLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  if (isExplainBoardsBrand) {
    return (
      <img
        src="/explainboards-icon.png"
        alt="ExplainBoards"
        className={`${className} object-contain`}
      />
    );
  }
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="4" width="92" height="92" rx="23" fill="#ffffff" stroke="#dcdfe4" strokeWidth="5.5" />
      <line x1="42" y1="31" x2="77" y2="31" stroke="#e11d48" strokeWidth="6.6" strokeLinecap="round" />
      <line x1="48" y1="49" x2="77" y2="49" stroke="#e11d48" strokeWidth="6.6" strokeLinecap="round" />
      <path d="M 44 73.5 C 51 82, 69 81, 76 63" stroke="#e11d48" strokeWidth="6.6" strokeLinecap="round" fill="none" />
      <g transform="translate(30.5, 47.5) rotate(-21)">
        <path
          d="M -5.3 -16.5 A 5.3 5.3 0 0 1 5.3 -16.5 L 5.3 8.5 L 1.0 21.2 C 0.5 22.5 -0.5 22.5 -1.0 21.2 L -5.3 8.5 Z"
          fill="#111315"
        />
      </g>
    </svg>
  );
};

export const AuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  mode: 'signin' | 'signup';
  setMode: (m: 'signin' | 'signup') => void;
  onSuccess: () => void;
}> = ({ isOpen, onClose, mode, setMode, onSuccess }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const translateFirebaseError = (err: any): string => {
    const code = err?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return 'Λάθος email ή κωδικός πρόσβασης. Έλεγξε τα στοιχεία σου ή κάνε Εγγραφή.';
    }
    if (code === 'auth/email-already-in-use') {
      return 'Αυτό το email χρησιμοποιείται ήδη. Επίλεξε «Σύνδεση» για να μπεις στον λογαριασμό σου.';
    }
    if (code === 'auth/weak-password') {
      return 'Ο κωδικός πρέπει να έχει τουλάχιστον 6 χαρακτήρες.';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Το παράθυρο σύνδεσης Google έκλεισε πριν ολοκληρωθεί.';
    }
    if (code === 'auth/unauthorized-domain') {
      return 'Το domain προετοιμάζεται στο Firebase Auth — δοκίμασε ξανά σε λίγα δευτερόλεπτα ή συνδέσου με Email.';
    }
    return err?.message || 'Παρουσιάστηκε σφάλμα κατά τη σύνδεση.';
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (fullName.trim()) {
          await updateProfile(cred.user, { displayName: fullName.trim() });
        }
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(translateFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const cred = GoogleAuthProvider.credentialFromResult(result);
      const token = cred?.accessToken;
      const gEmail = result.user.email || result.user.displayName || '';
      if (token) {
        try {
          localStorage.setItem('bestnotes_drive_token_v1', token);
          localStorage.setItem('bestnotes_drive_token_time_v1', String(Date.now()));
          if (gEmail) localStorage.setItem('bestnotes_drive_email_v1', gEmail);
          window.dispatchEvent(
            new CustomEvent('bestnotes-drive-auth', {
              detail: { accessToken: token, email: gEmail },
            })
          );
        } catch {
          // ignore
        }
      }
      onSuccess();
    } catch (err: any) {
      const code = err?.code || '';
      if (
        code === 'auth/popup-blocked' ||
        code === 'auth/operation-not-supported-in-this-environment'
      ) {
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirErr: any) {
          setErrorMsg(translateFirebaseError(redirErr));
        }
      } else {
        setErrorMsg(translateFirebaseError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-slate-200 text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          aria-label="Κλείσιμο"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-5">
          <BestNotesLogoIcon className="w-10 h-10 shrink-0 shadow-2xs" />
          <div>
            <h2
              className="text-lg font-semibold tracking-[-0.025em] text-[#111315]"
              style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
            >
              {mode === 'signin'
                ? isExplainBoardsBrand
                  ? 'Σύνδεση στο ExplainBoards'
                  : 'Σύνδεση στο BestNotes'
                : 'Δημιουργία Λογαριασμού'}
            </h2>
            <p className="text-xs text-slate-500">
              Συγχρόνισε τις σημειώσεις και τα σχήματά σου παντού
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Σύνδεση (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 rounded-lg transition cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Εγγραφή (Sign Up)
          </button>
        </div>

        {/* Google Sign-In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-sm font-semibold text-slate-800 shadow-2xs transition cursor-pointer disabled:opacity-50"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Συνέχεια με Google</span>
        </button>

        <div className="relative my-5 flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            ή με Email
          </span>
          <div className="border-t border-slate-200 w-full" />
        </div>

        <form onSubmit={handleEmailSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-slate-700 mb-1">
                Ονοματεπώνυμο
              </label>
              <input
                type="text"
                id="name"
                name="name"
                autoComplete="name"
                enterKeyHint="next"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="π.χ. Φρειδερίκος Κ."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-slate-700 mb-1">
              Διεύθυνση Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              autoComplete="username"
              spellCheck={false}
              enterKeyHint="next"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor={mode === 'signin' ? 'current-password' : 'new-password'}
                className="block text-xs font-bold text-slate-700"
              >
                Κωδικός Πρόσβασης
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[11px] font-semibold text-[#0066ff] hover:underline cursor-pointer"
              >
                {showPassword ? 'Απόκρυψη' : 'Εμφάνιση'}
              </button>
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              id={mode === 'signin' ? 'current-password' : 'new-password'}
              name="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              enterKeyHint="done"
              minLength={6}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Τουλάχιστον 6 χαρακτήρες"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0066ff] focus:ring-2 focus:ring-[#0066ff]/20"
            />
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-[#0066ff] hover:bg-blue-600 text-white text-sm font-bold shadow-md transition cursor-pointer disabled:opacity-50"
          >
            {loading
              ? 'Παρακαλώ περιμένετε...'
              : mode === 'signin'
              ? 'Σύνδεση (Sign In)'
              : 'Δημιουργία Λογαριασμού (Sign Up)'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onSuccess}
            className="text-xs font-semibold text-slate-500 hover:text-[#0066ff] transition cursor-pointer"
          >
            Συνέχεια κατευθείαν στην εφαρμογή χωρίς σύνδεση →
          </button>
        </div>
      </div>
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({
  currentUser,
  onEnterApp,
  onOpenAuthModal,
  showAuthModal,
  setShowAuthModal,
  authMode,
  setAuthMode,
}) => {
  const [activeTab, setActiveTab] = useState<ShowcaseTabId>('sim-forces');
  const [tabProgress, setTabProgress] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [dragResetCounter, setDragResetCounter] = useState<number>(0);
  const [zoomedNote, setZoomedNote] = useState<ScienceNoteAsset | null>(null);
  const [activeBentoIndex, setActiveBentoIndex] = useState<number>(0);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  // Auto-cycle through the 5 animated Science Image Tabs + 2 PRO tabs
  useEffect(() => {
    if (isPaused) return;
    const interval = window.setInterval(() => {
      setTabProgress((prev) => {
        if (prev >= 100) {
          setActiveTab((curr) => {
            const idx = SHOWCASE_TABS.findIndex((t) => t.id === curr);
            const nextIdx = (idx + 1) % SHOWCASE_TABS.length;
            return SHOWCASE_TABS[nextIdx].id;
          });
          return 0;
        }
        return prev + 1.25;
      });
    }, 85);
    return () => window.clearInterval(interval);
  }, [isPaused]);

  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(null);

  // Subtle cross-fade & zoom pulse cycle on the below-the-fold gallery
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBentoIndex((prev) => (prev + 1) % LIVE_SIMULATION_GIFS.length);
    }, 4200);
    return () => window.clearInterval(timer);
  }, []);

  const handleSelectTab = (id: ShowcaseTabId) => {
    setActiveTab(id);
    setTabProgress(0);
  };

  const scrollToElementId = (
    elId: string,
    highlightId?: string,
    blockPos: ScrollLogicalPosition = 'start'
  ) => {
    const el = document.getElementById(elId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: blockPos });
      if (highlightId) {
        setHighlightedZoneId(highlightId);
        window.setTimeout(() => {
          setHighlightedZoneId((curr) => (curr === highlightId ? null : curr));
        }, 2200);
      }
    }
  };

  const activeScienceNote = LIVE_SIMULATION_GIFS.find((n) => n.id === activeTab) || null;
  const secondaryNotes = LIVE_SIMULATION_GIFS.filter((n) => n.id !== activeTab);

  return (
    <div
      data-ui-panel="true"
      style={{ touchAction: 'pan-y' }}
      onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 8)}
      className="fixed inset-0 z-40 overflow-y-auto overscroll-contain bg-white text-slate-900 select-none"
    >
      {/* Keyframe animations: Stronger Ken-Burns Zoom, Hand-drawn Circles & Expanding Selection Frames */}
      <style>{`
        @keyframes bnDrawStroke {
          0% { stroke-dashoffset: 680; opacity: 0.25; }
          45%, 85% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 680; opacity: 0.25; }
        }
        @keyframes bnPenMoveOrbit {
          0% { transform: translate(0px, 0px) rotate(0deg); }
          25% { transform: translate(68px, -18px) rotate(4deg); }
          50% { transform: translate(115px, 14px) rotate(-5deg); }
          75% { transform: translate(38px, 24px) rotate(3deg); }
          100% { transform: translate(0px, 0px) rotate(0deg); }
        }
        @keyframes bnTabFadeZoomIn {
          0% { opacity: 0; transform: scale(0.93) translateY(10px); }
          100% { opacity: 1; transform: scale(1) translateY(0px); }
        }
        @keyframes bnKenBurnsPulse {
          0%, 100% { transform: scale(1) translate(0px, 0px); }
          50% { transform: scale(1.48) translate(-12px, -8px); }
        }
        @keyframes bnCrossFadeBreath {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.38); }
        }
        @keyframes bnPopupFrameOpen {
          0%, 12% { transform: scale(0.72); opacity: 0; }
          28%, 80% { transform: scale(1); opacity: 1; }
          94%, 100% { transform: scale(0.85); opacity: 0; }
        }
        @keyframes bnFloatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes bnFloatDelayed {
          0%, 100% { transform: translateY(0px) rotate(-1.5deg); }
          50% { transform: translateY(-7px) rotate(1.5deg); }
        }
        @keyframes bnSineMorph {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.52); }
        }
        @keyframes bnLassoPulse {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(-1.5deg) scale(1.045); }
        }
        @keyframes bnRectMarqueeSweep {
          0%, 10% { width: 28px; height: 22px; opacity: 0; }
          20% { opacity: 1; }
          55%, 85% { width: 210px; height: 124px; opacity: 1; }
          96%, 100% { width: 210px; height: 124px; opacity: 0; }
        }
        .bn-animate-draw {
          stroke-dasharray: 680;
          animation: bnDrawStroke 4.2s ease-in-out infinite;
        }
        .bn-animate-draw-delayed {
          stroke-dasharray: 680;
          animation: bnDrawStroke 4.2s ease-in-out 1.8s infinite;
        }
        .bn-animate-pen {
          animation: bnPenMoveOrbit 4.4s ease-in-out infinite;
        }
        .bn-tab-stage {
          animation: bnTabFadeZoomIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .bn-ken-burns {
          animation: bnKenBurnsPulse 6.2s ease-in-out infinite;
        }
        .bn-fade-zoom-cycle {
          animation: bnCrossFadeBreath 4.8s ease-in-out infinite;
        }
        .bn-popup-frame {
          transform-origin: center center;
          animation: bnPopupFrameOpen 4.8s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }
        .bn-animate-float {
          animation: bnFloatSlow 4.6s ease-in-out infinite;
        }
        .bn-animate-float-delayed {
          animation: bnFloatDelayed 5.2s ease-in-out infinite;
        }
        .bn-animate-sine {
          transform-origin: center 135px;
          animation: bnSineMorph 3.1s ease-in-out infinite;
        }
        .bn-animate-lasso {
          animation: bnLassoPulse 3.8s ease-in-out infinite;
        }
        .bn-rect-marquee {
          animation: bnRectMarqueeSweep 4.6s ease-in-out infinite;
        }
        .bn-scroll-reveal {
          opacity: 1;
        }
      `}</style>

      {/* =====================================================================
          1. TOP STICKY NAVIGATION BAR (Logo + Προσομοιώσεις + Σημειώσεις + Auth)
         ===================================================================== */}
      <header
        style={
          typeof window !== 'undefined' &&
          ((window.navigator as any)?.standalone === true ||
            window.matchMedia?.('(display-mode: standalone)')?.matches ||
            window.matchMedia?.('(display-mode: fullscreen)')?.matches ||
            window.matchMedia?.('(display-mode: minimal-ui)')?.matches ||
            ((/iPad|iPhone|iPod/i.test(navigator.userAgent || '') ||
              (/Macintosh/i.test(navigator.userAgent || '') && navigator.maxTouchPoints > 1)) &&
              !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(navigator.userAgent || '')))
            ? { paddingTop: 'max(env(safe-area-inset-top, 0px), 36px)' }
            : undefined
        }
        className={`sticky top-0 z-50 border-b transition-all duration-200 bn-safe-top-header ${
          isScrolled
            ? 'bg-white/75 backdrop-blur-md border-slate-200/85 shadow-[0_6px_22px_-4px_rgba(15,23,42,0.11)]'
            : 'bg-white/95 border-slate-200/60 shadow-none'
        }`}
      >
        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-10 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 sm:gap-8 shrink-0">
            <div
              onClick={() => scrollToElementId('hero-top-section', undefined, 'start')}
              className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            >
              {isExplainBoardsBrand ? (
                <img
                  src="/explainboards-logo.png"
                  alt="ExplainBoards"
                  className="h-10 sm:h-11 w-auto min-w-[165px] object-contain group-hover:scale-[1.02] transition shrink-0"
                />
              ) : (
                <>
                  <BestNotesLogoIcon className="w-9 h-9 group-hover:scale-105 transition shrink-0" />
                  <span
                    className="text-[22px] font-semibold tracking-[-0.03em] text-[#111315] inline-flex items-start leading-none shrink-0"
                    style={{ fontFamily: "'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif" }}
                  >
                    BestNotes
                    <sup className="text-[7px] font-bold tracking-normal text-[#111315] ml-0.5 mt-0.5">
                      TM
                    </sup>
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 ml-auto">
            <nav className="flex items-center gap-1.5 sm:gap-2.5 mr-2.5 sm:mr-5 text-xs sm:text-sm font-bold text-slate-700">
              <button
                type="button"
                onClick={() => scrollToElementId('simulations-section', undefined, 'start')}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#0066ff] transition cursor-pointer whitespace-nowrap"
              >
                Προσομοιώσεις
              </button>
              <button
                type="button"
                onClick={() => scrollToElementId('science-notes-hub', undefined, 'start')}
                className="px-3 py-2 rounded-xl hover:bg-slate-100 hover:text-[#0066ff] transition cursor-pointer whitespace-nowrap"
              >
                Σημειώσεις
              </button>
            </nav>
            {currentUser ? (
              <div className="flex items-center gap-2.5">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                  <UserIcon className="w-3.5 h-3.5 text-[#0066ff]" />
                  <span className="max-w-[150px] truncate">
                    {currentUser.displayName || currentUser.email || 'Χρήστης'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => signOut(auth)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition cursor-pointer"
                  title="Αποσύνδεση (Logout)"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('signin')}
                  className="px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                >
                  Σύνδεση
                </button>
                <button
                  type="button"
                  onClick={() => onOpenAuthModal('signup')}
                  className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-bold text-[#0066ff] transition cursor-pointer"
                >
                  Εγγραφή
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={onEnterApp}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#46c8f5] hover:bg-[#2bb8eb] text-slate-950 text-sm font-bold shadow-xs transition cursor-pointer"
            >
              <span>Έναρξη</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* =====================================================================
          2. HERO SECTION + ANIMATED SIMULATIONS & SCIENCE SHOWCASE TABS
         ===================================================================== */}
      <main id="hero-top-section" className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-10 pt-10 pb-28 scroll-mt-20">
        {/* --- Α. ΚΕΝΤΡΙΚΕΣ ΠΛΗΡΟΦΟΡΙΕΣ (Τίτλος & Υπότιτλος) --- */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-5xl md:text-[50px] font-extrabold tracking-tight text-slate-950 leading-[1.14]">
            Δώστε ζωή &amp; κίνηση στο μολύβι σας με το{' '}
            {isExplainBoardsBrand ? (
              <>
                <span className="text-[#111722]">Explain</span>
                <span className="text-[#df1b3f]">Boards</span>
              </>
            ) : (
              <>
                <span className="text-[#111722]">Best</span>
                <span className="text-[#0066ff]">Notes</span>
              </>
            )}
          </h1>

          <div className="mt-5 max-w-[840px] mx-auto">
            <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
              Εξηγήστε πάνω στα boards σας φαινόμενα, έννοιες, χημικές αντιδράσεις &amp; διαγράμματα με διαδραστικές προσομοιώσεις που{' '}
              <span className="text-slate-900 font-bold">«ζωντανεύουν» κατευθείαν από το μολύβι σας</span>!
            </p>
            <p className="mt-3.5 text-lg sm:text-xl md:text-[21px] text-slate-600 font-medium leading-snug">
              Ένα ολοκληρωμένο πακέτο εργαλείων{' '}
              <strong className="text-slate-900 font-bold">Φυσικής, Χημείας, Βιολογίας &amp; Μαθηματικών</strong>.
            </p>
          </div>

          {/* --- Β. ΚΥΡΙΑ ΚΟΥΜΠΙΑ ΕΝΕΡΓΕΙΑΣ (Ξεκάθαρα διαχωρισμένα) --- */}
          <div className="mt-8 flex items-center justify-center gap-3.5 flex-wrap">
            <button
              type="button"
              onClick={onEnterApp}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#46c8f5] hover:bg-[#2bb8eb] text-slate-950 text-sm sm:text-base font-extrabold shadow-sm hover:shadow-md transition cursor-pointer"
            >
              <span>Δωρεάν Έναρξη στον Καμβά</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {!currentUser && (
              <button
                type="button"
                onClick={() => onOpenAuthModal('signup')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-800 text-sm sm:text-base font-bold transition cursor-pointer"
              >
                <span>Εγγραφή με Google / Email</span>
              </button>
            )}
          </div>
        </div>

        {/* ===================================================================
            3. FOLDER-STYLE SHOWCASE TABS (Live Simulation GIFs + PRO Tabs)
           =================================================================== */}
        <div
          id="simulations-section"
          className="mt-12 pt-8 border-t border-slate-200/70 max-w-[1360px] w-full mx-auto scroll-mt-20"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex items-center justify-between gap-2 px-3 mb-3">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Επιλέξτε Ζωντανή Προσομοίωση ή Εργαλείο PRO:
            </span>
            <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline">
              Κάντε κλικ σε κάθε καρτέλα για προεπισκόπηση
            </span>
          </div>
          {/* Folder Tab Headers (Only Live Simulations + PRO Tabs) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 px-2">
            {SHOWCASE_TABS.map((tab) => {
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  className={`relative flex items-center justify-center gap-1.5 px-2.5 py-3.5 rounded-t-2xl text-xs sm:text-[12.5px] transition cursor-pointer overflow-hidden border border-b-0 ${
                    isSelected
                      ? 'bg-[#efefef] text-slate-950 font-extrabold border-slate-300 shadow-xs scale-[1.02]'
                      : 'bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 border-slate-200/80 font-semibold'
                  }`}
                >
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#0066ff] text-white text-[9px] font-extrabold uppercase tracking-wider shrink-0">
                      {tab.badge}
                    </span>
                  )}
                  {isSelected && (
                    <div className="absolute bottom-0 left-0 right-0 h-[3.5px] bg-slate-300/70">
                      <div
                        className="h-full bg-[#0066ff] transition-all duration-75"
                        style={{ width: `${tabProgress}%` }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Interactive Goodnotes Tablet Showcase Frame */}
          <div className="relative rounded-3xl rounded-tl-none bg-[#f2f4f7] border border-slate-200/90 shadow-2xl overflow-hidden min-h-[610px]">
            {/* Top Goodnotes-style App Header inside Preview */}
            <div className="bg-[#1e40af] text-white px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-4 h-4 text-sky-200" />
                <Search className="w-4 h-4 text-sky-200" />
                <span className="font-semibold text-sky-100 hidden sm:inline">
                  {isExplainBoardsBrand ? 'ExplainBoards' : 'BestNotes'} —{' '}
                  {activeScienceNote ? activeScienceNote.title : SHOWCASE_TABS.find((t) => t.id === activeTab)?.label}
                </span>
              </div>

              {/* Simulated Goodnotes / BestNotes Toolbar Icons */}
              <div className="flex items-center gap-2.5 bg-white/15 px-3.5 py-1 rounded-full">
                <Pen className="w-3.5 h-3.5 text-white" />
                <Eraser className="w-3.5 h-3.5 text-sky-200" />
                <Highlighter className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                <Shapes className="w-3.5 h-3.5 text-emerald-300" />
                <Lasso className="w-3.5 h-3.5 text-sky-200" />
                <Layers className="w-3.5 h-3.5 text-pink-200" />
              </div>

              <div className="w-8 hidden sm:block" />
            </div>

            {/* Sub-bar inside Preview */}
            <div className="bg-white border-b border-slate-200 px-4 py-1.5 flex items-center justify-between gap-3 text-[11px] text-slate-600 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#0066ff] text-white font-semibold">
                  ✏️ Apple Pencil &amp; Φωσφορούχος
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  ⬚ Ορθογώνιο Λάσο &amp; ∑ MathOCR
                </span>
              </div>
            </div>

            {/* ===============================================================
                TABS 1 TO 5: THE 5 UPLOADED SCIENCE NOTES WITH FULL GOODNOTES
                ANIMATIONS (Fade In/Out, Zoom, Draggable Cards, Apple Pencil
                Fluorescent Highlighting, Rectangular Marquee & Magnifier Loupe!)
               =============================================================== */}
            {activeScienceNote && (
              <div
                key={activeScienceNote.id}
                className="bn-tab-stage relative p-5 sm:p-8 min-h-[535px] flex items-center justify-center overflow-hidden"
                style={{
                  backgroundImage: 'radial-gradient(rgba(148, 163, 184, 0.42) 1.3px, transparent 1.3px)',
                  backgroundSize: '20px 20px',
                  backgroundColor: '#f8fafc',
                }}
              >
                {/* TOP-LEFT DRAGGABLE FLOATING CARD (Secondary Note #1) */}
                {secondaryNotes[0] && (
                  <DraggableCard
                    resetSignal={dragResetCounter}
                    badgeText="✋ Σύρε με ποντίκι"
                    onClickCard={() => handleSelectTab(secondaryNotes[0].id)}
                    className="hidden lg:block absolute left-4 top-6 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 p-2.5 -rotate-2 z-20"
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-700 mb-1.5">
                      <span className="truncate">{secondaryNotes[0].shortTitle}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-white text-[8.5px]"
                        style={{ backgroundColor: secondaryNotes[0].subjectColor }}
                      >
                        {secondaryNotes[0].subjectBadge}
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {secondaryNotes[0].id === 'layers-groups' ? (
                        <AnimatedHookeWeightsGroupShowcase className="w-full h-32" />
                      ) : (
                        <img
                          src={secondaryNotes[0].src}
                          alt={secondaryNotes[0].shortTitle}
                          {...({ fetchpriority: 'low' } as any)}
                          className="w-full h-32 object-cover bn-fade-zoom-cycle"
                        />
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[9.5px] font-bold text-slate-500">
                      <span className="truncate">{secondaryNotes[0].formulaBadge}</span>
                      <span className="text-[#0066ff] shrink-0">Προβολή →</span>
                    </div>
                  </DraggableCard>
                )}

                {/* BOTTOM-LEFT DRAGGABLE STICKY / POLAROID CARD (Secondary Note #2) */}
                {secondaryNotes[1] && (
                  <DraggableCard
                    resetSignal={dragResetCounter}
                    badgeText="✋ Σύρε με ποντίκι"
                    onClickCard={() => handleSelectTab(secondaryNotes[1].id)}
                    className="hidden lg:block absolute left-6 bottom-6 w-56 rounded-2xl bg-[#fef9c3] shadow-xl border border-amber-300 p-2.5 rotate-2 z-20"
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-amber-950 mb-1.5">
                      <span className="truncate">📌 {secondaryNotes[1].shortTitle}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-300/80 text-amber-950 text-[8.5px]">
                        Σημείωση
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-amber-300 bg-white">
                      {secondaryNotes[1].id === 'layers-groups' ? (
                        <AnimatedHookeWeightsGroupShowcase className="w-full h-28" />
                      ) : (
                        <img
                          src={secondaryNotes[1].src}
                          alt={secondaryNotes[1].shortTitle}
                          {...({ fetchpriority: 'low' } as any)}
                          className="w-full h-28 object-cover bn-ken-burns"
                        />
                      )}
                    </div>
                    <div className="mt-1.5 text-[9.5px] font-bold text-amber-900 truncate">
                      {secondaryNotes[1].highlightText}
                    </div>
                  </DraggableCard>
                )}

                {/* CENTER MAIN INTERACTIVE SHEET (The Active Science Note with Live Apple Pencil + Fluorescent Highlighter + Zoom!) */}
                <DraggableCard
                  resetSignal={dragResetCounter}
                  badgeText="✋ Σύρε τον Καμβά ή Κάνε Κλικ για Zoom"
                  onClickCard={() => setZoomedNote(activeScienceNote)}
                  className="relative w-full max-w-3xl rounded-3xl bg-white border-2 border-slate-200/95 shadow-2xl p-4 sm:p-5 z-10"
                >
                  {/* Sheet Top Info Bar */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-white text-[10.5px] font-extrabold"
                        style={{ backgroundColor: activeScienceNote.subjectColor }}
                      >
                        {activeScienceNote.subjectBadge}
                      </span>
                      <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                        {activeScienceNote.shortTitle}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-900 border border-yellow-300 text-[10px] font-extrabold">
                        {activeScienceNote.formulaBadge}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setZoomedNote(activeScienceNote);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#0066ff] hover:text-white text-slate-700 text-[10.5px] font-bold transition cursor-pointer"
                      >
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Zoom</span>
                      </button>
                    </div>
                  </div>

                  {/* Main High-Resolution Note Canvas with Deep Zoom */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#fffdf9] shadow-inner">
                    {activeScienceNote.id === 'layers-groups' ? (
                      <AnimatedHookeWeightsGroupShowcase
                        className="w-full h-[370px]"
                        showStatusBanner
                      />
                    ) : (
                      <img
                        src={activeScienceNote.src}
                        alt={activeScienceNote.title}
                        {...({ fetchpriority: 'high' } as any)}
                        className={`w-full max-h-[370px] object-contain mx-auto ${
                          activeScienceNote.src.endsWith('.gif') ? '' : 'bn-ken-burns'
                        }`}
                      />
                    )}
                  </div>

                  {/* Clean Caption Bar under the Image */}
                  <div className="mt-3.5 flex items-center justify-between gap-3 bg-slate-50 rounded-xl p-2.5 border border-slate-200/80 text-xs flex-wrap">
                    <span className="font-extrabold text-slate-900 text-[11px]">
                      ✨ {activeScienceNote.highlightText}
                    </span>
                    <span className="text-[11px] font-bold text-slate-600">
                      {activeScienceNote.secondaryHighlightText}
                    </span>
                  </div>
                </DraggableCard>

                {/* TOP-RIGHT DRAGGABLE FLOATING CARD (Secondary Note #3) */}
                {secondaryNotes[2] && (
                  <DraggableCard
                    resetSignal={dragResetCounter}
                    badgeText="✋ Σύρε με ποντίκι"
                    onClickCard={() => handleSelectTab(secondaryNotes[2].id)}
                    className="hidden lg:block absolute right-4 top-6 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 p-2.5 rotate-2 z-20"
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-700 mb-1.5">
                      <span className="truncate">{secondaryNotes[2].shortTitle}</span>
                      <span
                        className="px-1.5 py-0.5 rounded text-white text-[8.5px]"
                        style={{ backgroundColor: secondaryNotes[2].subjectColor }}
                      >
                        {secondaryNotes[2].subjectBadge}
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {secondaryNotes[2].id === 'layers-groups' ? (
                        <AnimatedHookeWeightsGroupShowcase className="w-full h-32" />
                      ) : (
                        <img
                          src={secondaryNotes[2].src}
                          alt={secondaryNotes[2].shortTitle}
                          {...({ fetchpriority: 'low' } as any)}
                          className="w-full h-32 object-cover bn-fade-zoom-cycle"
                        />
                      )}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between text-[9.5px] font-bold text-slate-500">
                      <span className="truncate">{secondaryNotes[2].formulaBadge}</span>
                      <span className="text-[#0066ff] shrink-0">Προβολή →</span>
                    </div>
                  </DraggableCard>
                )}

                {/* BOTTOM-RIGHT DRAGGABLE FLOATING CARD (Secondary Note #4) */}
                {secondaryNotes[3] && (
                  <DraggableCard
                    resetSignal={dragResetCounter}
                    badgeText="✋ Σύρε με ποντίκι"
                    onClickCard={() => handleSelectTab(secondaryNotes[3].id)}
                    className="hidden lg:block absolute right-6 bottom-6 w-56 rounded-2xl bg-sky-50/95 shadow-xl border border-sky-200 p-2.5 -rotate-2 z-20"
                  >
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-sky-950 mb-1.5">
                      <span className="truncate">🔗 {secondaryNotes[3].shortTitle}</span>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[8.5px]">
                        Group
                      </span>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-sky-200 bg-white">
                      {secondaryNotes[3].id === 'layers-groups' ? (
                        <AnimatedHookeWeightsGroupShowcase className="w-full h-28" />
                      ) : (
                        <img
                          src={secondaryNotes[3].src}
                          alt={secondaryNotes[3].shortTitle}
                          {...({ fetchpriority: 'low' } as any)}
                          className="w-full h-28 object-cover bn-ken-burns"
                        />
                      )}
                    </div>
                    <div className="mt-1.5 text-[9.5px] font-bold text-sky-900 truncate">
                      {secondaryNotes[3].highlightText}
                    </div>
                  </DraggableCard>
                )}
              </div>
            )}

            {/* ===============================================================
                TAB 6 (PRO #1): ΗΜΙΤΟΝΑ & 3D ΣΧΗΜΑΤΑ
               =============================================================== */}
            {activeTab === 'sine-3d' && (
              <div className="bn-tab-stage p-6 sm:p-8 min-h-[535px] flex flex-col lg:flex-row items-stretch justify-center gap-6">
                <div className="w-full lg:w-1/2 rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-lg p-5 flex flex-col justify-between relative">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-[#0066ff] uppercase tracking-wider">
                        〰️ Ημίτονο 2 Κόμβων &amp; ╰ Υπερβολή (y = c/x)
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold">
                        PRO Εργαλείο
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      Τράβηξε τον κίτρινο κόμβο <b>↕ Κορυφή</b> μόνο πάνω/κάτω για το πλάτος και το <b>↔ Άκρο</b> μόνο αριστερά/δεξιά, ή σχεδίασε ασυμπτωτική <b>Υπερβολή (P·V = σταθ.)</b>!
                    </p>
                  </div>

                  <svg className="w-full h-60 bg-white rounded-xl border border-slate-200/80 shadow-inner" viewBox="0 0 420 215">
                    <line x1="25" y1="135" x2="255" y2="135" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 4" />
                    <line x1="35" y1="25" x2="35" y2="195" stroke="#94a3b8" strokeWidth="1.5" />
                    <g className="bn-animate-sine">
                      <path
                        d="M 35 135 C 62 42, 88 42, 115 135 C 142 228, 168 228, 195 135"
                        fill="rgba(0, 102, 255, 0.08)"
                        stroke="#0066ff"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                      />
                      <rect x="68" y="59" width="14" height="14" fill="#fef08a" stroke="#2563eb" strokeWidth="2.2" />
                      <text x="46" y="51" fill="#1e3a8a" fontSize="10" fontWeight="bold">
                        ↕ Κορυφή (Πλάτος A)
                      </text>
                    </g>
                    <rect x="188" y="128" width="14" height="14" fill="#ffffff" stroke="#2563eb" strokeWidth="2.2" />
                    <text x="205" y="139" fill="#1e3a8a" fontSize="10" fontWeight="bold">
                      ↔ Άκρο (λ)
                    </text>

                    <line x1="285" y1="25" x2="285" y2="180" stroke="#64748b" strokeWidth="1.6" />
                    <line x1="285" y1="180" x2="408" y2="180" stroke="#64748b" strokeWidth="1.6" />
                    <path
                      d="M 295 35 Q 302 162 398 170"
                      fill="none"
                      stroke="#dc2626"
                      strokeWidth="3.2"
                      strokeLinecap="round"
                      className="bn-animate-draw"
                    />
                    <rect x="316" y="130" width="12" height="12" fill="#fef08a" stroke="#dc2626" strokeWidth="2" />
                    <text x="310" y="92" fill="#991b1b" fontSize="10" fontWeight="bold">
                      Υπερβολή P·V = nRT
                    </text>
                  </svg>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>✓ Κλείδωμα οριζόντιου άξονα</span>
                    <span className="text-[#0066ff]">✓ Κόψιμο με ✂️ Ψαλίδι σε 2 ημίτονα</span>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 rounded-2xl bg-[#fffdf7] border border-slate-200 shadow-lg p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider">
                        📦 3D Στερεά, Αντιστάτης, Ελατήριο &amp; ∑ MathOCR
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold">
                        1-Click Γέμισμα (F)
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                      Έτοιμο 3D Παραλληλεπίπεδο, 3D Σφαίρα, Κύλινδρος, Πυραμίδα, Αντιστάτης, Ελατήριο και μετατροπή χειρόγραφων κλασμάτων σε τύπους με <b>∑ MathOCR</b>.
                    </p>
                  </div>

                  <svg className="w-full h-60 bg-white rounded-xl border border-slate-200/80 shadow-inner" viewBox="0 0 420 215">
                    <g transform="translate(18, 20)">
                      <polygon points="0,24 64,24 64,88 0,88" fill="rgba(220,38,38,0.16)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <polygon points="0,24 20,0 84,0 64,24" fill="rgba(220,38,38,0.10)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <polygon points="64,24 84,0 84,64 64,88" fill="rgba(220,38,38,0.28)" stroke="#dc2626" strokeWidth="2.4" strokeLinejoin="round" />
                      <text x="4" y="106" fill="#991b1b" fontSize="9.5" fontWeight="bold">3D Κυβόλιθος</text>
                    </g>

                    <g transform="translate(125, 18)">
                      <circle cx="46" cy="46" r="42" fill="rgba(37,99,235,0.14)" stroke="#2563eb" strokeWidth="2.4" />
                      <path d="M 4 46 A 42 14 0 0 0 88 46" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 3" />
                      <path d="M 16 46 C 30 18, 40 18, 46 46 C 52 74, 62 74, 76 46" fill="none" stroke="#16a34a" strokeWidth="2.5" />
                      <text x="6" y="108" fill="#1e3a8a" fontSize="9.5" fontWeight="bold">3D Σφαίρα + Κύμα</text>
                    </g>

                    <g transform="translate(236, 18)">
                      <path d="M 8 16 L 8 80 A 34 11 0 0 0 76 80 L 76 16" fill="rgba(147,51,234,0.16)" stroke="#9333ea" strokeWidth="2.3" />
                      <ellipse cx="42" cy="16" rx="34" ry="11" fill="rgba(147,51,234,0.26)" stroke="#9333ea" strokeWidth="2.3" />
                      <ellipse cx="42" cy="80" rx="34" ry="11" fill="none" stroke="#9333ea" strokeWidth="2" strokeDasharray="4 3" />
                      <text x="6" y="108" fill="#6b21a8" fontSize="9.5" fontWeight="bold">3D Κύλινδρος</text>
                    </g>

                    <g transform="translate(330, 18)">
                      <polygon points="38,4 6,78 52,88" fill="rgba(234,179,8,0.20)" stroke="#ca8a04" strokeWidth="2.2" strokeLinejoin="round" />
                      <polygon points="38,4 52,88 76,68" fill="rgba(234,179,8,0.34)" stroke="#ca8a04" strokeWidth="2.2" strokeLinejoin="round" />
                      <line x1="6" y1="78" x2="76" y2="68" stroke="#ca8a04" strokeWidth="1.6" strokeDasharray="3 3" />
                      <text x="8" y="108" fill="#854d0e" fontSize="9.5" fontWeight="bold">3D Πυραμίδα</text>
                    </g>

                    <path
                      d="M 20 172 L 48 172 L 56 156 L 70 188 L 84 156 L 98 188 L 112 156 L 126 188 L 134 172 L 162 172"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <text x="48" y="204" fill="#334155" fontSize="9.5" fontWeight="bold">⚡ Αντιστάτης R</text>

                    <path
                      d="M 215 172 L 235 172 C 240 150, 252 150, 250 172 C 248 190, 260 190, 265 172 C 270 150, 282 150, 280 172 C 278 190, 290 190, 295 172 C 300 150, 312 150, 310 172 L 335 172"
                      fill="none"
                      stroke="#0284c7"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                    />
                    <rect x="335" y="156" width="30" height="30" rx="5" fill="rgba(2,132,199,0.2)" stroke="#0284c7" strokeWidth="2.2" />
                    <text x="242" y="204" fill="#0369a1" fontSize="9.5" fontWeight="bold">🌀 Ελατήριο (F = -kx)</text>
                  </svg>

                  <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-600">
                    <span>✓ Αυτόματο γέμισμα με κράτημα μολυβιού</span>
                    <span className="text-emerald-700">✓ Διαφάνεια 25% / 45% / 90%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ===================================================================
            4. DEDICATED SCIENCE NOTES & LESSONS HUB:
               - COMPACT MINI-CARDS ROW AT TOP (All 5 Together)
               - SMOOTH SCROLL ON CLICK TO EACH NOTE'S DEDICATED ZONE BELOW
           =================================================================== */}
        <section id="science-notes-hub" className="mt-24 max-w-[1360px] w-full mx-auto scroll-mt-24">
          {/* Header + Compact Mini-Cards Strip (Όλα μαζί μικρά στην αρχή) */}
          <div className="rounded-3xl bg-gradient-to-b from-slate-50 to-white border border-slate-200/90 p-6 sm:p-8 shadow-lg">
            <div className="text-center max-w-3xl mx-auto mb-7">
              <span className="px-3.5 py-1 rounded-full bg-sky-100 border border-sky-200 text-[#0066ff] text-xs font-extrabold uppercase tracking-wider">
                Διαδραστικές Σημειώσεις, PDF &amp; Μαθήματα ανά Ενότητα
              </span>
              <h2 className="mt-3 text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-950">
                Εξερεύνησε κάθε Μάθημα &amp; Σημείωση στη Δική του Ενότητα
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600">
                Κάνε κλικ σε οποιαδήποτε από τις <b>μικρές κάρτες ενοτήτων</b> παρακάτω για <b>ομαλή κύλιση (smooth scroll)</b> απευθείας στη δική της ξεχωριστή ζώνη παρουσίασης!
              </p>
            </div>

            {/* Row of All 5 Compact Mini-Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {STATIC_SCIENCE_NOTES.map((note, idx) => (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => scrollToElementId(`note-zone-${note.id}`, note.id, 'center')}
                  className="group text-left rounded-2xl bg-white hover:bg-sky-50/60 border-2 border-slate-200 hover:border-[#0066ff] p-2.5 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span
                        className="px-2 py-0.5 rounded-md text-white text-[9.5px] font-extrabold truncate"
                        style={{ backgroundColor: note.subjectColor }}
                      >
                        0{idx + 1} • {note.subjectBadge}
                      </span>
                    </div>

                    <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-[#fffdf9] h-28">
                      <img
                        src={note.src}
                        alt={note.shortTitle}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <h3 className="mt-2 text-xs sm:text-sm font-extrabold text-slate-900 group-hover:text-[#0066ff] transition truncate">
                      {note.shortTitle}
                    </h3>
                    <p className="mt-0.5 text-[10px] font-semibold text-slate-500 truncate">
                      {note.formulaBadge}
                    </p>
                  </div>

                  <div className="mt-2.5 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10.5px] font-extrabold text-[#0066ff]">
                    <span>Μετάβαση στη Ζώνη</span>
                    <span className="group-hover:translate-y-0.5 transition-transform">↓</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Separate Dedicated Full-Width Zone for Each Static Science Note */}
          <div className="mt-16 space-y-16">
            {STATIC_SCIENCE_NOTES.map((note, index) => {
              const isEven = index % 2 === 0;
              const isHighlighted = highlightedZoneId === note.id;
              return (
                <div
                  key={note.id}
                  id={`note-zone-${note.id}`}
                  className={`scroll-mt-24 rounded-3xl border-2 p-6 sm:p-10 shadow-xl transition-all duration-500 ${
                    isHighlighted
                      ? 'bg-sky-50/70 border-[#0066ff] ring-4 ring-[#0066ff]/20'
                      : isEven
                        ? 'bg-[#fffdf9] border-slate-200/90'
                        : 'bg-slate-50/90 border-slate-200/90'
                  }`}
                >
                  {/* Zone Top Bar with Section Number & Back-to-Top Link */}
                  <div className="flex items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-200/80 flex-wrap">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="px-3 py-1 rounded-full text-white text-xs font-extrabold shadow-2xs"
                        style={{ backgroundColor: note.subjectColor }}
                      >
                        ΕΝΟΤΗΤΑ 0{index + 1} • {note.subjectBadge}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-slate-700">
                        {note.shortTitle}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => scrollToElementId('science-notes-hub')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-bold transition cursor-pointer shadow-2xs"
                    >
                      <span>↑ Όλες οι Ενότητες</span>
                    </button>
                  </div>

                  <div
                    className={`flex flex-col ${
                      isEven ? 'lg:flex-row' : 'lg:flex-row-reverse'
                    } items-center gap-8 lg:gap-12`}
                  >
                    {/* Image Showcase Side (Draggable + Deep Zoom) */}
                    <div className="w-full lg:w-7/12 relative">
                      <DraggableCard
                        resetSignal={dragResetCounter}
                        badgeText="✋ Σύρε την εικόνα ή Πάτα για Zoom"
                        onClickCard={() => setZoomedNote(note)}
                        className="relative rounded-2xl overflow-hidden bg-white border-2 border-slate-200 shadow-2xl p-3"
                      >
                        <img
                          src={note.src}
                          alt={note.title}
                          loading="lazy"
                          className="w-full max-h-[420px] object-contain mx-auto bn-ken-burns"
                        />
                      </DraggableCard>
                    </div>

                    {/* Text & Interactive Features Side */}
                    <div className="w-full lg:w-5/12 space-y-4">
                      <div className="inline-flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-full bg-yellow-100 border border-yellow-300 text-yellow-950 text-xs font-extrabold">
                          {note.formulaBadge}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-950 leading-tight">
                        {note.title}
                      </h3>

                      <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                        {note.description}
                      </p>

                      {/* Clean Callout Box */}
                      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-2">
                        <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                          Βασικές Έννοιες &amp; Εξισώσεις:
                        </div>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-950">
                          ✨ {note.highlightText}
                        </div>
                        <div className="text-xs font-semibold text-slate-600">
                          ✓ {note.secondaryHighlightText}
                        </div>
                      </div>

                      <div className="pt-2 flex items-center gap-3 flex-wrap">
                        <button
                          type="button"
                          onClick={() => setZoomedNote(note)}
                          className="inline-flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs sm:text-sm font-bold transition cursor-pointer"
                        >
                          <ZoomIn className="w-4 h-4 text-[#0066ff]" />
                          <span>Πλήρες Zoom</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* =====================================================================
          6. FULLSCREEN ZOOM LIGHTBOX MODAL (When clicking Zoom on any of the 5 Notes)
         ===================================================================== */}
      {zoomedNote && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 sm:p-8"
          onClick={() => setZoomedNote(null)}
        >
          <div
            className="relative max-w-5xl w-full rounded-3xl bg-white border border-slate-200 shadow-2xl p-4 sm:p-6 overflow-hidden bn-tab-stage"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span
                  className="px-3 py-1 rounded-full text-white text-xs font-extrabold"
                  style={{ backgroundColor: zoomedNote.subjectColor }}
                >
                  {zoomedNote.subjectBadge}
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {zoomedNote.title}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomedNote(null)}
                  className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  aria-label="Κλείσιμο Zoom"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-[#fffdf9] border border-slate-200 flex items-center justify-center">
              {zoomedNote.id === 'layers-groups' ? (
                <AnimatedHookeWeightsGroupShowcase
                  className="w-full h-[70vh]"
                  showStatusBanner
                />
              ) : (
                <img
                  src={zoomedNote.src}
                  alt={zoomedNote.title}
                  className="max-h-[75vh] w-auto object-contain mx-auto bn-ken-burns"
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal inside Landing Page so Login / Εγγραφή buttons always open it immediately */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode={authMode}
        setMode={setAuthMode}
        onSuccess={() => {
          setShowAuthModal(false);
          onEnterApp();
        }}
      />
    </div>
  );
};
