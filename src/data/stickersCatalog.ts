import { scoreSingleGreekTokenMatch } from '../utils/geometryAndAlgorithms';

export type StickerCategory =
  | 'Όλα'
  | 'Μονόχρωμα Σκίτσα'
  | 'Βελάκια'
  | 'Κεραυνοί & Εφέ'
  | 'Σχολικά & Εργαστήριο'
  | 'Μηχανική & Οχήματα'
  | 'Επαγγέλματα'
  | 'Emoticons'
  | 'Σχήματα & 3D';

export type StickerColorStyle = 'all' | 'multicolor' | 'duotone' | 'monochrome';

export interface StickerCatalogItem {
  id: string;
  iconifyId: string; // e.g. 'custom-svg:curve-left:#dc2626:12', 'sketch-png:/mind_maps/...:#1d4ed8'
  title: string;
  category: Exclude<StickerCategory, 'Όλα'>;
  colorStyle: Exclude<StickerColorStyle, 'all'>;
  tags: string[];
}

export const STICKER_CATEGORIES: { id: StickerCategory; label: string }[] = [
  { id: 'Όλα', label: 'Όλα' },
  { id: 'Μονόχρωμα Σκίτσα', label: 'Μονόχρωμα Σκίτσα' },
  { id: 'Βελάκια', label: 'Βελάκια' },
  { id: 'Κεραυνοί & Εφέ', label: 'Κεραυνοί, ! & Πυροτεχνήματα' },
  { id: 'Σχολικά & Εργαστήριο', label: 'Στυλό, Μολύβια & Σχολικά' },
  { id: 'Μηχανική & Οχήματα', label: 'Γρανάζια & Αμαξάκια' },
  { id: 'Επαγγέλματα', label: 'Επαγγέλματα' },
  { id: 'Emoticons', label: 'Emoticons' },
  { id: 'Σχήματα & 3D', label: '3D & Σύμβολα' },
];

export const STICKER_COLOR_STYLES: { id: StickerColorStyle; label: string }[] = [
  { id: 'all', label: 'Όλα τα Χρώματα' },
  { id: 'multicolor', label: 'Πολύχρωμα / 3D' },
  { id: 'duotone', label: 'Δίχρωμα' },
  { id: 'monochrome', label: 'Μονόχρωμα' },
];

export const CURATED_STICKERS_CATALOG: StickerCatalogItem[] = [
  // =========================================================================
  // 0. ΘΑΥΜΑΣΤΙΚΑ & ΑΝΑΠΟΔΑ ΤΡΙΓΩΝΑ ΠΡΟΣΟΧΗΣ (Πλήρως Προσαρμόσιμο Χρώμα!)
  // =========================================================================
  {
    id: 'fx-excl-inverted-triangle-outline',
    iconifyId: 'custom-svg:alert-inverted-triangle-outline:#dc2626:14',
    title: 'Θαυμαστικό Ανάποδο Τρίγωνο (Περίγραμμα)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'monochrome',
    tags: [
      'θαυμαστικό',
      'θαυμαστικά',
      'ανάποδο τρίγωνο',
      'τρίγωνο',
      'προσοχή',
      'κίνδυνος',
      'sos',
      'alert',
      'warning',
      'yield',
      'caution',
      'σημαντικό',
      'σημείωση',
      '!',
    ],
  },
  {
    id: 'fx-excl-inverted-triangle-solid',
    iconifyId: 'custom-svg:alert-inverted-triangle-solid:#dc2626:14',
    title: 'Θαυμαστικό Ανάποδο Τρίγωνο (Γεμάτο Badge)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'monochrome',
    tags: [
      'θαυμαστικό',
      'θαυμαστικά',
      'ανάποδο τρίγωνο',
      'γεμάτο',
      'σήμα',
      'badge',
      'προσοχή',
      'κίνδυνος',
      'sos',
      'alert',
      'warning',
      'yield',
      'σημαντικό',
      '!',
    ],
  },
  {
    id: 'fx-excl-wedge-triangle',
    iconifyId: 'custom-svg:alert-wedge-exclamation:#dc2626:14',
    title: 'Θαυμαστικό Σφήνα (Ανάποδο Τρίγωνο)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'monochrome',
    tags: [
      'θαυμαστικό',
      'θαυμαστικά',
      'σφήνα',
      'ανάποδο τρίγωνο',
      'τρίγωνο',
      'προσοχή',
      'έντονο',
      'sos',
      'σημαντικό',
      'alert',
      'wedge',
      '!',
    ],
  },
  {
    id: 'sk-premium-planet-earth-monochrome-sketch',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_planet_earth_monochrome_sketch.png:#5a3015',
    title: 'Πλανήτης Γη — Μονόχρωμο Δικτυωτό Σκίτσο Υδρογείου',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: [
      'γη',
      'πλανήτης',
      'πλανήτης γη',
      'υδρόγειος',
      'σκίτσο',
      'μονόχρωμο σκίτσο',
      'μονόχρωμο',
      'premium',
      'μεσημβρινοί',
      'παράλληλοι',
      'ήπειροι',
      'χάρτης',
      'γεωγραφία',
      'αστρονομία',
      'φυσική',
      'earth',
      'planet',
      'globe',
      'sketch',
    ],
  },
  // =========================================================================
  // 1. ΒΕΛΑΚΙΑ (Χειρόγραφα Καμπύλα Βέλη σαν της εικόνας, Διαφορετικά Χρώματα & Πάχη!)
  // =========================================================================
  {
    id: 'arr-sketch-left-red-med',
    iconifyId: 'custom-svg:sketch-curve-left:#dc2626:12',
    title: 'Καμπύλο Βέλος Αριστερά (Κόκκινο Μαρκαδόρος)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'αριστερά', 'κόκκινο', 'χειρόγραφο', 'arrow'],
  },
  {
    id: 'arr-sketch-right-red-med',
    iconifyId: 'custom-svg:sketch-curve-right:#dc2626:12',
    title: 'Καμπύλο Βέλος Δεξιά (Κόκκινο Μαρκαδόρος)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'δεξιά', 'κόκκινο', 'χειρόγραφο', 'arrow'],
  },
  {
    id: 'arr-loop-red',
    iconifyId: 'custom-svg:sketch-loop-left:#dc2626:11',
    title: 'Βέλος με Σπείρα / Loop Αριστερά (Κόκκινο)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'σπείρα', 'θηλιά', 'loop', 'κόκκινο'],
  },
  {
    id: 'arr-loop-blue',
    iconifyId: 'custom-svg:sketch-loop-right:#0066ff:11',
    title: 'Βέλος με Σπείρα / Loop Δεξιά (Μπλε)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'σπείρα', 'θηλιά', 'loop', 'μπλε'],
  },
  {
    id: 'arr-scurve-purple',
    iconifyId: 'custom-svg:sketch-scurve:#7c3aed:12',
    title: 'Κυματοειδές Βέλος S-Curve (Μωβ)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'κύμα', 'καμπύλο', 'μωβ'],
  },
  {
    id: 'arr-dashed-red',
    iconifyId: 'custom-svg:sketch-dashed-left:#dc2626:10',
    title: 'Διακεκομμένο Καμπύλο Βέλος Αριστερά (Κόκκινο)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'διακεκομμένο', 'τροχιά', 'κόκκινο'],
  },
  {
    id: 'arr-dashed-blue',
    iconifyId: 'custom-svg:sketch-dashed-right:#0066ff:10',
    title: 'Διακεκομμένο Καμπύλο Βέλος Δεξιά (Μπλε)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'διακεκομμένο', 'τροχιά', 'μπλε'],
  },
  {
    id: 'arr-double-curve-teal',
    iconifyId: 'custom-svg:sketch-double-curve:#0d9488:12',
    title: 'Διπλό Καμπύλο Βέλος Αμφίδρομο',
    category: 'Βελάκια',
    colorStyle: 'duotone',
    tags: ['βέλος', 'διπλό', 'καμπύλο', 'ισορροπία'],
  },
  {
    id: 'arr-3d-ribbon-red',
    iconifyId: 'custom-svg:3d-filled-arrow-left:#dc2626:14',
    title: '3D Γεμάτο Καμπύλο Βέλος Αριστερά (Κόκκινο)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', '3d', 'κόκκινο', 'καμπύλο'],
  },
  {
    id: 'arr-3d-ribbon-blue',
    iconifyId: 'custom-svg:3d-filled-arrow-right:#0066ff:14',
    title: '3D Γεμάτο Καμπύλο Βέλος Δεξιά (Μπλε)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', '3d', 'μπλε', 'καμπύλο'],
  },
  {
    id: 'arr-3d-ribbon-green',
    iconifyId: 'custom-svg:3d-filled-arrow-right:#16a34a:14',
    title: '3D Γεμάτο Καμπύλο Βέλος Δεξιά (Πράσινο)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', '3d', 'πράσινο', 'καμπύλο'],
  },
  {
    id: 'arr-straight-marker-red',
    iconifyId: 'custom-svg:sketch-straight-right:#dc2626:14',
    title: 'Ευθύ Βέλος Μαρκαδόρου (Κόκκινο Χοντρό)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'ευθύ', 'άνυσμα', 'δύναμη', 'κόκκινο'],
  },
  {
    id: 'arr-straight-marker-blue',
    iconifyId: 'custom-svg:sketch-straight-left:#0066ff:14',
    title: 'Ευθύ Βέλος Μαρκαδόρου Αριστερά (Μπλε)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'ευθύ', 'άνυσμα', 'δύναμη', 'μπλε'],
  },
  {
    id: 'arr-3d-target',
    iconifyId: 'fluent-emoji:bullseye',
    title: 'Στόχος 3D με Βέλος',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['στόχος', 'βέλος', 'κέντρο', 'εστίαση'],
  },
  {
    id: 'arr-mp-cycle',
    iconifyId: 'icon-park:cycle-arrow',
    title: 'Κυκλική Φορά (Πολύχρωμο)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'κύκλος', 'περιστροφή', 'φορά'],
  },
  {
    id: 'arr-duo-fat-right',
    iconifyId: 'ph:arrow-fat-lines-right-duotone',
    title: 'Παχύ Βέλος Κίνησης (Δίχρωμο)',
    category: 'Βελάκια',
    colorStyle: 'duotone',
    tags: ['βέλος', 'κίνηση', 'ταχύτητα', 'δύναμη'],
  },
  {
    id: 'arr-duo-clockwise',
    iconifyId: 'ph:arrows-clockwise-duotone',
    title: 'Βέλη Δεξιόστροφης Ροπής (Δίχρωμο)',
    category: 'Βελάκια',
    colorStyle: 'duotone',
    tags: ['βέλος', 'περιστροφή', 'ροπή', 'γωνιακή'],
  },
  {
    id: 'arr-mono-axis',
    iconifyId: 'mdi:axis-arrow',
    title: 'Τρισδιάστατοι Άξονες X-Y-Z (Μονόχρωμο)',
    category: 'Βελάκια',
    colorStyle: 'monochrome',
    tags: ['άξονες', 'βέλη', '3d', 'συντεταγμένες', 'xyz'],
  },

  // =========================================================================
  // 1B. ΚΕΡΑΥΝΟΙ, ΘΑΥΜΑΣΤΙΚΑ & ΠΥΡΟΤΕΧΝΗΜΑΤΑ (Lightning, Exclamations, Fireworks)
  // =========================================================================
  {
    id: 'fx-lightning-3d',
    iconifyId: 'fluent-emoji:high-voltage',
    title: 'Κεραυνός Υψηλής Τάσης 3D (Κίτρινος)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['κεραυνός', 'ηλεκτρισμός', 'φορτίο', 'φορτία', 'ενέργεια', 'ρεύμα', 'lightning'],
  },
  {
    id: 'fx-lightning-red-custom',
    iconifyId: 'custom-svg:lightning-bolt:#dc2626:12',
    title: 'Κεραυνός Δυναμικός (Κόκκινος/Χρυσός)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['κεραυνός', 'κόκκινος', 'φορτίο', 'φορτία', 'ενέργεια', 'κίνδυνος', 'lightning'],
  },
  {
    id: 'fx-lightning-blue-custom',
    iconifyId: 'custom-svg:lightning-bolt:#0066ff:12',
    title: 'Ηλεκτρικός Κεραυνός (Μπλε)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['κεραυνός', 'μπλε', 'ηλεκτρισμός', 'φορτίο', 'φορτία', 'lightning'],
  },
  {
    id: 'fx-excl-red-3d',
    iconifyId: 'fluent-emoji:red-exclamation-mark',
    title: 'Θαυμαστικό Κόκκινο 3D (!)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['θαυμαστικό', 'προσοχή', 'σημαντικό', 'sos', '!'],
  },
  {
    id: 'fx-excl-double-3d',
    iconifyId: 'fluent-emoji:double-exclamation-mark',
    title: 'Διπλό Θαυμαστικό 3D (!!)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['θαυμαστικό', 'διπλό', 'προσοχή', 'sos', '!!'],
  },
  {
    id: 'fx-excl-triple-custom',
    iconifyId: 'custom-svg:triple-exclamation:#dc2626:12',
    title: 'Τριπλό Χειρόγραφο Θαυμαστικό (!!!)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['θαυμαστικό', 'τριπλό', 'sos', 'σημαντικό', '!!!'],
  },
  {
    id: 'fx-excl-quest-3d',
    iconifyId: 'fluent-emoji:exclamation-question-mark',
    title: 'Θαυμαστικό & Ερωτηματικό 3D (!?)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['θαυμαστικό', 'ερωτηματικό', 'απορία', '!?'],
  },
  {
    id: 'fx-quest-red-3d',
    iconifyId: 'fluent-emoji:red-question-mark',
    title: 'Ερωτηματικό Κόκκινο 3D (?)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['ερωτηματικό', 'ερώτηση', 'απορία', '?'],
  },
  {
    id: 'fx-fireworks-3d',
    iconifyId: 'custom-svg:fireworks-3d-gold-magenta:#ec4899:12',
    title: 'Πυροτεχνήματα Πολύχρωμα 3D',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['πυροτέχνημα', 'πυροτεχνήματα', 'γιορτή', 'λάμψη', 'fireworks'],
  },
  {
    id: 'fx-sparkler-3d',
    iconifyId: 'custom-svg:sparkler-3d-transparent:#f59e0b:12',
    title: 'Βεγγαλικό / Πυροτέχνημα Σπινθήρων 3D',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['πυροτέχνημα', 'βεγγαλικό', 'σπινθήρας', 'λάμψη', 'sparkler'],
  },
  {
    id: 'fx-fireworks-trio-3d',
    iconifyId: 'custom-svg:fireworks-trio-celebration:#8b5cf6:12',
    title: 'Τριπλά Πυροτεχνήματα Γιορτής 3D',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['πυροτέχνημα', 'πυροτεχνήματα', 'γιορτή', 'έκρηξη', 'fireworks'],
  },
  {
    id: 'fx-firework-galaxy-3d',
    iconifyId: 'custom-svg:firework-ring-galaxy:#06b6d4:12',
    title: 'Πυροτέχνημα Χρυσάνθεμο & Αστέρια 3D',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['πυροτέχνημα', 'πυροτεχνήματα', 'αστέρια', 'λάμψη', 'fireworks'],
  },
  {
    id: 'fx-firework-burst-custom',
    iconifyId: 'custom-svg:firework-burst:#eab308:12',
    title: 'Πυροτέχνημα Αστεριών (Starburst)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['πυροτέχνημα', 'πυροτεχνήματα', 'αστέρια', 'έκρηξη'],
  },
  {
    id: 'fx-collision-3d',
    iconifyId: 'fluent-emoji:collision',
    title: 'Έκρηξη Comic Boom / Κρούση 3D',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['έκρηξη', 'κρούση', 'πυροτέχνημα', 'δύναμη', 'boom'],
  },
  {
    id: 'fx-sparkles-3d',
    iconifyId: 'fluent-emoji:sparkles',
    title: 'Λάμψεις & Αστεράκια 3D',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['λάμψη', 'αστέρια', 'πυροτέχνημα', 'sparkles'],
  },
  {
    id: 'fx-party-3d',
    iconifyId: 'fluent-emoji:party-popper',
    title: 'Κομφετί Γιορτής / Επιτυχίας 3D',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['κομφετί', 'πυροτέχνημα', 'γιορτή', 'μπράβο'],
  },
  {
    id: 'fx-fire-3d',
    iconifyId: 'fluent-emoji:fire',
    title: 'Φλόγα / Φωτιά 3D',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['φωτιά', 'φλόγα', 'θερμότητα', 'καύση'],
  },
  {
    id: 'fx-warning-3d',
    iconifyId: 'fluent-emoji:warning',
    title: 'Σήμα Προσοχής / Κινδύνου 3D',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['προσοχή', 'θαυμαστικό', 'κίνδυνος', 'sos'],
  },

  // =========================================================================
  // 2. ΜΗΧΑΝΙΚΗ, ΓΡΑΝΑΖΙΑ & ΟΧΗΜΑΤΑ (Gears, Cars, Physics Mechanics)
  // =========================================================================
  {
    id: 'mech-3d-gear',
    iconifyId: 'fluent-emoji:gear',
    title: 'Γρανάζι 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['γρανάζι', 'μηχανική', 'κίνηση', 'περιστροφή', 'gear'],
  },
  {
    id: 'mech-3d-car',
    iconifyId: 'fluent-emoji:automobile',
    title: 'Αμαξάκι Κόκκινο 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['αμάξι', 'αμαξάκι', 'αυτοκίνητο', 'ταχύτητα', 'κίνηση', 'car'],
  },
  {
    id: 'mech-3d-suv',
    iconifyId: 'fluent-emoji:sport-utility-vehicle',
    title: 'Αυτοκίνητο Μπλε 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['αμάξι', 'αμαξάκι', 'αυτοκίνητο', 'τζιπ', 'κίνηση'],
  },
  {
    id: 'mech-3d-racecar',
    iconifyId: 'fluent-emoji:racing-car',
    title: 'Αγωνιστικό Αμαξάκι F1 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['αμάξι', 'αγωνιστικό', 'επιτάχυνση', 'ταχύτητα'],
  },
  {
    id: 'mech-3d-truck',
    iconifyId: 'fluent-emoji:delivery-truck',
    title: 'Φορτηγό 3D (Ορμή & Κρούση)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['φορτηγό', 'αμάξι', 'μάζα', 'ορμή', 'κρούση', 'truck'],
  },
  {
    id: 'mech-3d-train',
    iconifyId: 'fluent-emoji-flat:locomotive',
    title: 'Τρένο / Ατμομηχανή',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['τρένο', 'κίνηση', 'θερμοδυναμική', 'όχημα'],
  },
  {
    id: 'mech-3d-bike',
    iconifyId: 'fluent-emoji:bicycle',
    title: 'Ποδήλατο 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['ποδήλατο', 'τροχός', 'κίνηση', 'ταχύτητα'],
  },
  {
    id: 'mech-3d-rocket',
    iconifyId: 'fluent-emoji:rocket',
    title: 'Πύραυλος 3D (Δράση-Αντίδραση)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['πύραυλος', 'διάστημα', 'δράση', 'αντίδραση', 'ορμή'],
  },
  {
    id: 'mech-3d-airplane',
    iconifyId: 'fluent-emoji:airplane',
    title: 'Αεροπλάνο 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['αεροπλάνο', 'πτήση', 'άνωση', 'όχημα'],
  },
  {
    id: 'mech-3d-boat',
    iconifyId: 'fluent-emoji:speedboat',
    title: 'Ταχύπλοο Σκάφος 3D (Άνωση)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['σκάφος', 'βάρκα', 'πλοίο', 'άνωση', 'νερό', 'boat'],
  },
  {
    id: 'mech-3d-sailboat',
    iconifyId: 'fluent-emoji:sailboat',
    title: 'Ιστιοπλοϊκή Βάρκα 3D (Άνεμος & Πλεύση)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['βάρκα', 'ιστιοπλοϊκό', 'σκάφος', 'πλοίο', 'θάλασσα', 'άνωση', 'boat'],
  },
  {
    id: 'mech-3d-ship',
    iconifyId: 'fluent-emoji:ship',
    title: 'Πλοίο / Καράβι 3D (Άνωση Αρχιμήδη)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['πλοίο', 'βάρκα', 'καράβι', 'σκάφος', 'θάλασσα', 'άνωση', 'ship'],
  },
  {
    id: 'mech-duo-boat',
    iconifyId: 'ph:boat-duotone',
    title: 'Βάρκα / Πλοίο (Δίχρωμο)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'duotone',
    tags: ['βάρκα', 'πλοίο', 'σκάφος', 'θάλασσα', 'άνωση'],
  },
  {
    id: 'mech-3d-magnet',
    iconifyId: 'fluent-emoji:magnet',
    title: 'Μαγνήτης Πεταλοειδής 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['μαγνήτης', 'μαγνητισμός', 'πεδίο', 'έλξη', 'φορτίο'],
  },
  {
    id: 'mech-3d-battery',
    iconifyId: 'fluent-emoji:battery',
    title: 'Μπαταρία / Πηγή 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['μπαταρία', 'ηλεκτρισμός', 'φορτίο', 'φορτία', 'τάση', 'κύκλωμα', 'ενέργεια'],
  },
  {
    id: 'mech-3d-bulb',
    iconifyId: 'fluent-emoji:light-bulb',
    title: 'Ηλεκτρικός Λαμπτήρας 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['λάμπα', 'λαμπτήρας', 'φως', 'κύκλωμα', 'ισχύς'],
  },
  {
    id: 'mech-3d-scale',
    iconifyId: 'fluent-emoji:balance-scale',
    title: 'Ζυγός Ισορροπίας 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['ζυγαριά', 'ζυγός', 'μάζα', 'βάρος', 'ισορροπία', 'ροπή'],
  },
  {
    id: 'mech-3d-wrench',
    iconifyId: 'fluent-emoji:wrench',
    title: 'Γαλλικό Κλειδί 3D (Ροπή Δύναμης)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['κλειδί', 'εργαλείο', 'ροπή', 'βίδα', 'μηχανική'],
  },
  {
    id: 'mech-3d-stopwatch',
    iconifyId: 'fluent-emoji:stopwatch',
    title: 'Χρονόμετρο 3D (Χρόνος t)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['χρονόμετρο', 'ρολόι', 'χρόνος', 'περίοδος', 'συχνότητα'],
  },
  {
    id: 'mech-duo-gears',
    iconifyId: 'ph:gear-six-duotone',
    title: 'Γρανάζι Μηχανής (Δίχρωμο)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'duotone',
    tags: ['γρανάζι', 'μηχανική', 'δίχρωμο'],
  },
  {
    id: 'mech-duo-car',
    iconifyId: 'ph:car-profile-duotone',
    title: 'Αμαξάκι Προφίλ (Δίχρωμο)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'duotone',
    tags: ['αμάξι', 'αμαξάκι', 'αυτοκίνητο', 'προφίλ', 'κίνηση'],
  },
  {
    id: 'mech-duo-truck',
    iconifyId: 'ph:truck-duotone',
    title: 'Φορτηγό Προφίλ (Δίχρωμο)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'duotone',
    tags: ['φορτηγό', 'αμάξι', 'κίνηση', 'μάζα'],
  },
  {
    id: 'mech-duo-magnet',
    iconifyId: 'ph:magnet-duotone',
    title: 'Μαγνήτης (Δίχρωμο)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'duotone',
    tags: ['μαγνήτης', 'πεδίο'],
  },
  {
    id: 'mech-mono-cogs',
    iconifyId: 'mdi:cogs',
    title: 'Σύστημα 2 Γραναζιών (Μονόχρωμο)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'monochrome',
    tags: ['γρανάζια', 'γρανάζι', 'στροφές', 'μηχανική'],
  },
  {
    id: 'mech-mono-car',
    iconifyId: 'mdi:car-side',
    title: 'Αμαξάκι Προφίλ Ασκήσεων (Μονόχρωμο)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'monochrome',
    tags: ['αμάξι', 'αμαξάκι', 'αυτοκίνητο', 'φυσική', 'άσκηση'],
  },
  {
    id: 'mech-mono-truck',
    iconifyId: 'mdi:truck-outline',
    title: 'Φορτηγό Ασκήσεων (Μονόχρωμο)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'monochrome',
    tags: ['φορτηγό', 'όχημα', 'άσκηση', 'κρούση'],
  },
  {
    id: 'mech-mono-scale',
    iconifyId: 'mdi:scale-balance',
    title: 'Ζυγός Σύγκρισης Μαζών (Μονόχρωμο)',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'monochrome',
    tags: ['ζυγός', 'ζυγαριά', 'ισορροπία', 'μάζα'],
  },

  // =========================================================================
  // 3. ΣΧΟΛΙΚΑ & ΕΡΓΑΣΤΗΡΙΟ (Στυλό, Μολύβια, Μαρκαδόροι, Βιβλία, Εργαστήριο)
  // =========================================================================
  {
    id: 'sch-3d-pencil',
    iconifyId: 'fluent-emoji:pencil',
    title: 'Κλασικό Μολύβι 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['μολύβι', 'στυλό', 'σχολικά', 'γραφή', 'σχέδιο', 'pencil'],
  },
  {
    id: 'sch-3d-pen',
    iconifyId: 'fluent-emoji:pen',
    title: 'Στυλό Διαρκείας 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['στυλό', 'μολύβι', 'σχολικά', 'γραφή', 'pen'],
  },
  {
    id: 'sch-3d-fountainpen',
    iconifyId: 'fluent-emoji:fountain-pen',
    title: 'Πένα Μελάνης 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['πένα', 'στυλό', 'μολύβι', 'σχολικά', 'γραφή'],
  },
  {
    id: 'sch-custom-pen-red',
    iconifyId: 'custom-svg:pen-marker:#dc2626:12',
    title: 'Κόκκινο Στυλό / Μαρκαδόρος Διόρθωσης',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['στυλό', 'κόκκινο', 'μαρκαδόρος', 'μολύβι', 'διόρθωση'],
  },
  {
    id: 'sch-custom-pen-blue',
    iconifyId: 'custom-svg:pen-marker:#0066ff:12',
    title: 'Μπλε Στυλό / Μαρκαδόρος Σημειώσεων',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['στυλό', 'μπλε', 'μαρκαδόρος', 'μολύβι', 'σημειώσεις'],
  },
  {
    id: 'sch-3d-crayon',
    iconifyId: 'fluent-emoji:crayon',
    title: 'Κραγιόνι / Μαρκαδόρος Ζωγραφικής 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['κραγιόνι', 'μαρκαδόρος', 'στυλό', 'μολύβι', 'χρώμα'],
  },
  {
    id: 'sch-3d-paintbrush',
    iconifyId: 'fluent-emoji:paintbrush',
    title: 'Πινέλο Ζωγραφικής 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['πινέλο', 'ζωγραφική', 'στυλό', 'μολύβι', 'τέχνη'],
  },
  {
    id: 'sch-3d-books',
    iconifyId: 'fluent-emoji:books',
    title: 'Σχολικά Βιβλία 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['βιβλία', 'βιβλίο', 'σχολικά', 'διάβασμα', 'μάθημα'],
  },
  {
    id: 'sch-3d-openbook',
    iconifyId: 'fluent-emoji:open-book',
    title: 'Ανοιχτό Βιβλίο 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['βιβλίο', 'ανοιχτό', 'σχολικά', 'θεωρία'],
  },
  {
    id: 'sch-3d-notebook',
    iconifyId: 'fluent-emoji:spiral-notepad',
    title: 'Σπιράλ Τετράδιο Σημειώσεων 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['τετράδιο', 'σημειωματάριο', 'σχολικά', 'σημειώσεις'],
  },
  {
    id: 'sch-3d-pushpin',
    iconifyId: 'fluent-emoji:pushpin',
    title: 'Κόκκινη Πινέζα Σημείωσης 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['πινέζα', 'καρφίτσα', 'σημείωση', 'σχολικά'],
  },
  {
    id: 'sch-3d-paperclip',
    iconifyId: 'fluent-emoji:linked-paperclips',
    title: 'Συνδετήρες 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['συνδετήρας', 'σχολικά', 'χαρτιά'],
  },
  {
    id: 'sch-3d-backpack',
    iconifyId: 'fluent-emoji:backpack',
    title: 'Σχολική Τσάντα 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['τσάντα', 'σχολείο', 'σχολικά'],
  },
  {
    id: 'sch-3d-ruler',
    iconifyId: 'fluent-emoji:straight-ruler',
    title: 'Χάρακας Μέτρησης 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['χάρακας', 'μέτρηση', 'μήκος', 'σχολικά'],
  },
  {
    id: 'sch-3d-triruler',
    iconifyId: 'fluent-emoji:triangular-ruler',
    title: 'Γωνία Γεωμετρίας 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['γωνία', 'τρίγωνο', 'γεωμετρία', 'σχολικά'],
  },
  {
    id: 'sch-3d-microscope',
    iconifyId: 'fluent-emoji:microscope',
    title: 'Μικροσκόπιο Εργαστηρίου 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['μικροσκόπιο', 'βιολογία', 'εργαστήριο', 'κύτταρο'],
  },
  {
    id: 'sch-3d-telescope',
    iconifyId: 'fluent-emoji:telescope',
    title: 'Τηλεσκόπιο Αστρονομίας 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['τηλεσκόπιο', 'αστρονομία', 'οπτική', 'φακός'],
  },
  {
    id: 'sch-3d-testtube',
    iconifyId: 'fluent-emoji:test-tube',
    title: 'Δοκιμαστικός Σωλήνας Χημείας 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['σωλήνας', 'χημεία', 'πείραμα', 'διάλυμα', 'εργαστήριο'],
  },
  {
    id: 'sch-3d-petri',
    iconifyId: 'fluent-emoji:petri-dish',
    title: 'Τρυβλίο Πετρί (Βιολογία) 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['βιολογία', 'μικρόβια', 'εργαστήριο', 'πείραμα'],
  },
  {
    id: 'sch-3d-dna',
    iconifyId: 'fluent-emoji:dna',
    title: 'Διπλή Έλικα DNA 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['dna', 'βιολογία', 'γενετική', 'μόριο'],
  },
  {
    id: 'sch-3d-atom',
    iconifyId: 'custom-svg:atom-3d-transparent:#0066ff:12',
    title: 'Σύμβολο Ατόμου & Ηλεκτρικού Φορτίου 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['άτομο', 'πυρήνας', 'ηλεκτρόνιο', 'φορτίο', 'φορτία', 'φυσική', 'χημεία'],
  },
  {
    id: 'sch-3d-apple',
    iconifyId: 'fluent-emoji:red-apple',
    title: 'Κόκκινο Μήλο 3D (Βαρύτητα Νεύτωνα & Τροφή)',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['μήλο', 'τροφή', 'τροφές', 'φαγητό', 'βαρύτητα', 'βιολογία', 'ενέργεια'],
  },
  {
    id: 'sch-3d-salad',
    iconifyId: 'fluent-emoji:green-salad',
    title: 'Υγιεινή Τροφή & Διατροφή 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['τροφή', 'τροφές', 'διατροφή', 'φαγητό', 'βιολογία', 'ενέργεια', 'φυτό'],
  },
  {
    id: 'sch-3d-globe',
    iconifyId: 'fluent-emoji:globe-showing-europe-africa',
    title: 'Υδρόγειος Σφαίρα (Γη) 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['γη', 'υδρόγειος', 'πλανήτης', 'γεωγραφία', 'χάρτης'],
  },
  {
    id: 'sch-3d-gradcap',
    iconifyId: 'fluent-emoji:graduation-cap',
    title: 'Καπέλο Αποφοίτησης 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['καπέλο', 'σχολείο', 'επιτυχία', 'εξετάσεις'],
  },
  {
    id: 'sch-duo-flask',
    iconifyId: 'ph:flask-duotone',
    title: 'Κωνική Φιάλη Χημείας (Δίχρωμο)',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'duotone',
    tags: ['φιάλη', 'χημεία', 'εργαστήριο', 'διάλυμα'],
  },
  {
    id: 'sch-duo-calc',
    iconifyId: 'ph:calculator-duotone',
    title: 'Αριθμομηχανή / Κομπιουτεράκι (Δίχρωμο)',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'duotone',
    tags: ['αριθμομηχανή', 'μαθηματικά', 'υπολογισμός', 'σχολικά'],
  },
  {
    id: 'sch-duo-books',
    iconifyId: 'ph:books-duotone',
    title: 'Βιβλία Βιβλιοθήκης (Δίχρωμο)',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'duotone',
    tags: ['βιβλία', 'σχολικά', 'μελέτη'],
  },
  {
    id: 'sch-mono-flask',
    iconifyId: 'mdi:flask-outline',
    title: 'Κωνική Φιάλη Εργαστηρίου (Μονόχρωμο)',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'monochrome',
    tags: ['φιάλη', 'χημεία', 'εργαστήριο'],
  },
  {
    id: 'sch-mono-atom',
    iconifyId: 'mdi:atom',
    title: 'Τροχιές Ατόμου & Φορτίων (Μονόχρωμο)',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'monochrome',
    tags: ['άτομο', 'φορτίο', 'φορτία', 'φυσική', 'χημεία'],
  },
  {
    id: 'sch-mono-microscope',
    iconifyId: 'mdi:microscope',
    title: 'Μικροσκόπιο (Μονόχρωμο)',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'monochrome',
    tags: ['μικροσκόπιο', 'βιολογία', 'εργαστήριο'],
  },

  // =========================================================================
  // 4. ΕΠΑΓΓΕΛΜΑΤΑ & ΑΝΘΡΩΠΟΙ (Professions & Characters)
  // =========================================================================
  {
    id: 'prof-scientist',
    iconifyId: 'fluent-emoji-flat:scientist',
    title: 'Επιστήμονας / Χημικός',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['επιστήμονας', 'χημικός', 'φυσικός', 'βιολόγος', 'επαγγέλματα'],
  },
  {
    id: 'prof-teacher',
    iconifyId: 'fluent-emoji-flat:teacher',
    title: 'Καθηγητής / Δάσκαλος στον Πίνακα',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['καθηγητής', 'δάσκαλος', 'σχολείο', 'μάθημα', 'επαγγέλματα'],
  },
  {
    id: 'prof-student',
    iconifyId: 'fluent-emoji-flat:student',
    title: 'Μαθητής / Φοιτητής',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['μαθητής', 'φοιτητής', 'σχολείο', 'επαγγέλματα'],
  },
  {
    id: 'prof-doctor',
    iconifyId: 'fluent-emoji-flat:health-worker',
    title: 'Γιατρός / Υγειονομικός',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['γιατρός', 'ιατρός', 'υγεία', 'βιολογία', 'επαγγέλματα'],
  },
  {
    id: 'prof-astronaut',
    iconifyId: 'fluent-emoji-flat:astronaut',
    title: 'Αστροναύτης (Βαρύτητα & Διάστημα)',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['αστροναύτης', 'διάστημα', 'βαρύτητα', 'επαγγέλματα'],
  },
  {
    id: 'prof-mechanic',
    iconifyId: 'fluent-emoji-flat:mechanic',
    title: 'Μηχανικός / Τεχνικός',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['μηχανικός', 'τεχνικός', 'εργαλείο', 'επαγγέλματα'],
  },
  {
    id: 'prof-tech',
    iconifyId: 'fluent-emoji-flat:technologist',
    title: 'Προγραμματιστής / Πληροφορικός',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['προγραμματιστής', 'πληροφορική', 'υπολογιστής', 'επαγγέλματα'],
  },
  {
    id: 'prof-firefighter',
    iconifyId: 'fluent-emoji-flat:firefighter',
    title: 'Πυροσβέστης',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['πυροσβέστης', 'επαγγέλματα'],
  },
  {
    id: 'prof-pilot',
    iconifyId: 'fluent-emoji-flat:pilot',
    title: 'Πιλότος Αεροσκάφους',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['πιλότος', 'αεροπλάνο', 'επαγγέλματα'],
  },
  {
    id: 'prof-artist',
    iconifyId: 'fluent-emoji-flat:artist',
    title: 'Ζωγράφος / Καλλιτέχνης',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['ζωγράφος', 'καλλιτέχνης', 'τέχνη', 'επαγγέλματα'],
  },
  {
    id: 'prof-cook',
    iconifyId: 'fluent-emoji-flat:cook',
    title: 'Σεφ / Μάγειρας',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['σεφ', 'μάγειρας', 'επαγγέλματα'],
  },
  {
    id: 'prof-judge',
    iconifyId: 'fluent-emoji-flat:judge',
    title: 'Δικαστής / Νομικός',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['δικαστής', 'δικηγόρος', 'επαγγέλματα'],
  },
  {
    id: 'prof-farmer',
    iconifyId: 'fluent-emoji-flat:farmer',
    title: 'Αγρότης / Γεωπόνος',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['αγρότης', 'γεωπόνος', 'φύση', 'επαγγέλματα'],
  },
  {
    id: 'prof-builder',
    iconifyId: 'fluent-emoji-flat:construction-worker',
    title: 'Πολιτικός Μηχανικός / Εργοδηγός',
    category: 'Επαγγέλματα',
    colorStyle: 'multicolor',
    tags: ['μηχανικός', 'οικοδόμος', 'κράνος', 'επαγγέλματα'],
  },
  {
    id: 'prof-duo-teacher',
    iconifyId: 'ph:chalkboard-teacher-duotone',
    title: 'Καθηγητής σε Πίνακα (Δίχρωμο)',
    category: 'Επαγγέλματα',
    colorStyle: 'duotone',
    tags: ['καθηγητής', 'δάσκαλος', 'πίνακας', 'επαγγέλματα'],
  },
  {
    id: 'prof-duo-student',
    iconifyId: 'ph:student-duotone',
    title: 'Μαθητής / Απόφοιτος (Δίχρωμο)',
    category: 'Επαγγέλματα',
    colorStyle: 'duotone',
    tags: ['μαθητής', 'φοιτητής', 'επαγγέλματα'],
  },
  {
    id: 'prof-mono-school',
    iconifyId: 'mdi:account-school-outline',
    title: 'Μαθητής / Φοιτητής (Μονόχρωμο)',
    category: 'Επαγγέλματα',
    colorStyle: 'monochrome',
    tags: ['μαθητής', 'επαγγέλματα', 'μονόχρωμο'],
  },
  {
    id: 'prof-mono-tie',
    iconifyId: 'mdi:account-tie',
    title: 'Επαγγελματίας / Καθηγητής (Μονόχρωμο)',
    category: 'Επαγγέλματα',
    colorStyle: 'monochrome',
    tags: ['επαγγελματίας', 'καθηγητής', 'επαγγέλματα'],
  },

  // =========================================================================
  // 5. EMOTICONS & STICKERS (Emoticons, Badges, Feedback Stickers)
  // =========================================================================
  {
    id: 'emo-3d-smile',
    iconifyId: 'fluent-emoji:grinning-face-with-big-eyes',
    title: 'Χαμόγελο 3D (Μπράβο!)',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['χαμόγελο', 'emoticon', 'emoji', 'μπράβο', 'χαρά'],
  },
  {
    id: 'emo-3d-cool',
    iconifyId: 'fluent-emoji:smiling-face-with-sunglasses',
    title: 'Cool με Γυαλιά Ηλίου 3D',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['cool', 'emoticon', 'emoji', 'τέλεια'],
  },
  {
    id: 'emo-3d-think',
    iconifyId: 'fluent-emoji-flat:thinking-face',
    title: 'Σκέψη / Ερώτημα (Thinking)',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['σκέψη', 'απορία', 'ερώτηση', 'emoticon', 'emoji'],
  },
  {
    id: 'emo-3d-stars',
    iconifyId: 'fluent-emoji-flat:star-struck',
    title: 'Ενθουσιασμός με Αστέρια!',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['αστέρια', 'ενθουσιασμός', 'τέλεια', 'emoticon'],
  },
  {
    id: 'emo-3d-mindblown',
    iconifyId: 'fluent-emoji-flat:exploding-head',
    title: 'Mind Blown (Εκπληκτικό!)',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['έκπληξη', 'mindblown', 'emoticon'],
  },
  {
    id: 'emo-3d-party',
    iconifyId: 'fluent-emoji:partying-face',
    title: 'Γιορτή / Επιτυχία 3D',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['γιορτή', 'επιτυχία', 'emoticon'],
  },
  {
    id: 'emo-3d-100',
    iconifyId: 'fluent-emoji-flat:hundred-points',
    title: '100% Άριστα!',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['100', 'άριστα', 'βαθμός', 'επιτυχία', 'sticker'],
  },
  {
    id: 'emo-3d-trophy',
    iconifyId: 'fluent-emoji-flat:trophy',
    title: 'Κύπελλο Πρωταθλητή',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['κύπελλο', 'βραβείο', 'νίκη', 'άριστα'],
  },
  {
    id: 'emo-3d-medal',
    iconifyId: 'fluent-emoji-flat:1st-place-medal',
    title: 'Χρυσό Μετάλλιο 1ης Θέσης',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['μετάλλιο', 'χρυσό', 'πρώτος', 'βραβείο'],
  },
  {
    id: 'emo-3d-star',
    iconifyId: 'fluent-emoji-flat:glowing-star',
    title: 'Λαμπερό Αστέρι',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['αστέρι', 'σημαντικό', 'άριστα'],
  },
  {
    id: 'emo-3d-fire',
    iconifyId: 'fluent-emoji:fire',
    title: 'Φωτιά / Θερμότητα 3D',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['φωτιά', 'θερμότητα', 'καύση', 'ενέργεια', 'sos'],
  },
  {
    id: 'emo-3d-bolt',
    iconifyId: 'fluent-emoji:high-voltage',
    title: 'Κεραυνός / Ηλεκτρική Ενέργεια 3D',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['κεραυνός', 'ρεύμα', 'ενέργεια', 'τάση'],
  },
  {
    id: 'emo-3d-brain',
    iconifyId: 'fluent-emoji:brain',
    title: 'Εγκέφαλος / Έξυπνη Σκέψη 3D',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['εγκέφαλος', 'μυαλό', 'βιολογία', 'σκέψη'],
  },
  {
    id: 'emo-3d-heart',
    iconifyId: 'fluent-emoji:anatomical-heart',
    title: 'Ανατομική Καρδιά 3D (Βιολογία)',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['καρδιά', 'ανατομία', 'βιολογία', 'αίμα', 'αρτηρία', 'φλέβα', 'αορτή', 'κοίλη φλέβα', 'αιμοφόρα αγγεία', 'κυκλοφορικό'],
  },
  {
    id: 'emo-3d-check',
    iconifyId: 'custom-svg:check-3d-transparent:#16a34a:14',
    title: 'Σωστό / Check 3D',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['σωστό', 'check', 'ναι', 'επιτυχία'],
  },
  {
    id: 'emo-3d-warn',
    iconifyId: 'fluent-emoji:warning',
    title: 'Προσοχή / SOS 3D',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['προσοχή', 'κίνδυνος', 'sos', 'σημαντικό'],
  },
  {
    id: 'emo-3d-pin',
    iconifyId: 'fluent-emoji:pushpin',
    title: 'Κόκκινη Πινέζα Σημείωσης 3D',
    category: 'Emoticons',
    colorStyle: 'multicolor',
    tags: ['πινέζα', 'σημείωση', 'σημαντικό'],
  },
  {
    id: 'emo-duo-smile',
    iconifyId: 'ph:smiley-duotone',
    title: 'Χαμόγελο (Δίχρωμο)',
    category: 'Emoticons',
    colorStyle: 'duotone',
    tags: ['χαμόγελο', 'emoticon', 'δίχρωμο'],
  },
  {
    id: 'emo-duo-trophy',
    iconifyId: 'ph:trophy-duotone',
    title: 'Κύπελλο (Δίχρωμο)',
    category: 'Emoticons',
    colorStyle: 'duotone',
    tags: ['κύπελλο', 'βραβείο'],
  },
  {
    id: 'emo-mono-smile',
    iconifyId: 'mdi:emoticon-happy-outline',
    title: 'Χαμόγελο (Μονόχρωμο)',
    category: 'Emoticons',
    colorStyle: 'monochrome',
    tags: ['χαμόγελο', 'emoticon', 'μονόχρωμο'],
  },

  // =========================================================================
  // 6. ΣΧΗΜΑΤΑ & 3D ΣΥΜΒΟΛΑ (3D Shapes, Charts, Math & Science Symbols)
  // =========================================================================
  {
    id: 'shp-3d-cube',
    iconifyId: 'fluent-emoji:ice',
    title: 'Διαφανής Κύβος 3D (Πάγος / Όγκος)',
    category: 'Σχήματα & 3D',
    colorStyle: 'multicolor',
    tags: ['κύβος', '3d', 'όγκος', 'στερεό', 'πάγος'],
  },
  {
    id: 'shp-3d-chart-up',
    iconifyId: 'custom-svg:chart-up-3d-transparent:#10b981:12',
    title: 'Αύξουσα Γραφική Παράσταση 3D',
    category: 'Σχήματα & 3D',
    colorStyle: 'multicolor',
    tags: ['γράφημα', 'καμπύλη', 'αύξηση', 'μαθηματικά'],
  },
  {
    id: 'shp-3d-barchart',
    iconifyId: 'custom-svg:barchart-3d-transparent:#0066ff:12',
    title: 'Ραβδόγραμμα Στατιστικής 3D',
    category: 'Σχήματα & 3D',
    colorStyle: 'multicolor',
    tags: ['ραβδόγραμμα', 'γράφημα', 'στατιστική', 'μαθηματικά'],
  },
  {
    id: 'shp-3d-compass',
    iconifyId: 'fluent-emoji-flat:compass',
    title: 'Μαγνητική Πυξίδα Προσανατολισμού',
    category: 'Σχήματα & 3D',
    colorStyle: 'multicolor',
    tags: ['πυξίδα', 'βορράς', 'μαγνητισμός', 'γεωγραφία'],
  },
  {
    id: 'shp-duo-cube',
    iconifyId: 'ph:cube-duotone',
    title: 'Κύβος 3D (Δίχρωμο)',
    category: 'Σχήματα & 3D',
    colorStyle: 'duotone',
    tags: ['κύβος', '3d', 'γεωμετρία', 'στερεό'],
  },
  {
    id: 'shp-duo-cylinder',
    iconifyId: 'ph:cylinder-duotone',
    title: 'Κύλινδρος 3D (Δίχρωμο)',
    category: 'Σχήματα & 3D',
    colorStyle: 'duotone',
    tags: ['κύλινδρος', '3d', 'γεωμετρία', 'όγκος'],
  },
  {
    id: 'shp-duo-sphere',
    iconifyId: 'ph:globe-simple-duotone',
    title: 'Σφαίρα 3D (Δίχρωμο)',
    category: 'Σχήματα & 3D',
    colorStyle: 'duotone',
    tags: ['σφαίρα', '3d', 'γεωμετρία'],
  },
  {
    id: 'shp-mono-cube',
    iconifyId: 'mdi:cube-outline',
    title: 'Κύβος Γεωμετρίας 3D (Μονόχρωμο)',
    category: 'Σχήματα & 3D',
    colorStyle: 'monochrome',
    tags: ['κύβος', '3d', 'γεωμετρία'],
  },

  // =========================================================================
  // 7. ΜΟΝΟΧΡΩΜΑ ΣΚΙΤΣΑ (Αποχρώσεις Μπλε -> Αλλαγή σε Αποχρώσεις Μαύρου/Χρώματος)
  // =========================================================================
  {
    id: 'sk-davinci-portrait',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_portrait_vitruvian_blue_sketch.png:#5a3015',
    title: "Λεονάρντο ντα Βίντσι — Πορτρέτο & Άνθρωπος του Βιτρούβιου",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "λεονάρντο ντα βίντσι", "ντα βίντσι", "βιτρούβιος", "εφευρέτης", "επιστήμονας", "αναγέννηση", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-davinci-vitruvian',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_vitruvian_man_blue_sketch.png:#5a3015',
    title: "Άνθρωπος του Βιτρούβιου — Αναλογίες Ανθρώπινου Σώματος",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "άνθρωπος του βιτρούβιου", "λεονάρντο ντα βίντσι", "ανατομία", "συμμετρία", "αναλογίες", "μονόχρωμο σκίτσο", "βιολογία"],
  },
  {
    id: 'sk-davinci-villa',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_vinci_villa_blue_sketch.png:#5a3015',
    title: "Γενέτειρα Λεονάρντο ντα Βίντσι στο Ανκιάνο (Φλωρεντία)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "λεονάρντο ντα βίντσι", "ανκιάνο", "φλωρεντία", "ιταλία", "τοσκάνη", "μονόχρωμο σκίτσο", "γεωγραφία"],
  },
  {
    id: 'sk-davinci-italy-map',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_italy_map_blue_sketch.png:#5a3015',
    title: "Χάρτης Ιταλίας — Φλωρεντία & Ανκιάνο (Βίντσι)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "χάρτης", "ιταλία", "φλωρεντία", "βίντσι", "χερσόνησος", "μονόχρωμο σκίτσο", "γεωγραφία"],
  },
  {
    id: 'sk-davinci-mona-lisa',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_mona_lisa_blue_sketch.png:#5a3015',
    title: "Μόνα Λίζα (Τζοκόντα) — Λεονάρντο ντα Βίντσι",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "μόνα λίζα", "τζοκόντα", "λεονάρντο ντα βίντσι", "προοπτική", "φως", "μονόχρωμο σκίτσο"],
  },
  {
    id: 'sk-davinci-anatomy-full',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_anatomy_muscles_skull_blue_sketch.png:#5a3015',
    title: "Ανατομικές Μελέτες Ανθρώπινου Σώματος (Μύες, Θώρακας, Κρανίο, Καρδιά)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ανατομία", "μύες", "σκελετός", "θώρακας", "κρανίο", "καρδιά", "λεονάρντο ντα βίντσι", "οστά", "μονόχρωμο σκίτσο", "βιολογία"],
  },
  {
    id: 'sk-davinci-skull-heart',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_anatomy_skull_heart_blue_sketch.png:#5a3015',
    title: "Ανατομική Μελέτη Ανθρώπινου Κρανίου & Καρδιάς (Ντα Βίντσι)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "κρανίο", "καρδιά", "ανατομία", "οστά", "λεονάρντο ντα βίντσι", "μονόχρωμο σκίτσο", "βιολογία"],
  },
  {
    id: 'sk-davinci-botany-horse',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_botany_horse_study_blue_sketch.png:#5a3015',
    title: "Βοτανικές & Ζωολογικές Μελέτες της Φύσης (Φυτό & Άλογο)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "βοτανική", "ζωολογία", "φυτό", "άλογο", "φύση", "λεονάρντο ντα βίντσι", "μονόχρωμο σκίτσο", "βιολογία"],
  },
  {
    id: 'sk-davinci-water-flow',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_water_flow_vortex_blue_sketch.png:#5a3015',
    title: "Υδραυλική & Ρευστομηχανική — Ροή Νερού, Ρεύματα & Δίνες",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ροή νερού", "ρευστομηχανική", "υδραυλική", "ποτάμι", "κύματα", "λεονάρντο ντα βίντσι", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-davinci-optics-eye',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_optics_lens_eye_blue_sketch.png:#5a3015',
    title: "Οπτική — Πορεία Φωτός, Συγκλίνων Φακός & Ανθρώπινο Μάτι",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "οπτική", "φακός", "μάτι", "όραση", "φως", "διάθλαση", "ακτίνες", "λεονάρντο ντα βίντσι", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-davinci-geology-cube',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_geology_strata_cube_blue_sketch.png:#5a3015',
    title: "Γεωλογία — Στρώματα Πετρωμάτων, Ρήγματα & Απολιθώματα",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "γεωλογία", "πετρώματα", "στρώματα", "απολιθώματα", "φλοιός", "λεονάρντο ντα βίντσι", "μονόχρωμο σκίτσο", "γεωγραφία"],
  },
  {
    id: 'sk-davinci-aerial-screw',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_aerial_screw_helicopter_blue_sketch.png:#5a3015',
    title: "Εναέριος Κοχλίας (Πρόδρομος Ελικοπτέρου — Λεονάρντο ντα Βίντσι)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "εναέριος κοχλίας", "ελικόπτερο", "μηχανή", "εφεύρεση", "λεονάρντο ντα βίντσι", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-davinci-inventions-trio',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_davinci_armored_tank_blue_sketch.png:#5a3015',
    title: "Μηχανικές Εφευρέσεις Ντα Βίντσι (Εναέριος Κοχλίας, Θωρακισμένο Όχημα, Γέφυρα)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "εφευρέσεις", "θωρακισμένο όχημα", "αυτοφερόμενη γέφυρα", "ελικόπτερο", "λεονάρντο ντα βίντσι", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-newton-portrait',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_newton_portrait_blue_sketch.png:#5a3015',
    title: "Ισαάκ Νεύτων (1642–1727) — Φυσικός, Μαθηματικός & Αστρονόμος",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ισαάκ νεύτων", "νεύτων", "newton", "φυσικός", "μαθηματικός", "αστρονόμος", "νόμοι κίνησης", "βαρύτητα", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-newton-cradle',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_newton_cradle_laws_of_motion_blue_sketch.png:#5a3015',
    title: "Εκκρεμές του Νεύτωνα — Τρεις Νόμοι της Κίνησης & Διατήρηση Ορμής",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "εκκρεμές του νεύτωνα", "νόμοι κίνησης", "ορμή", "ενέργεια", "κρούση", "νεύτων", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-newton-falling-apple',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_newton_falling_apple_gravity_blue_sketch.png:#5a3015',
    title: "Το Μήλο του Νεύτωνα — Νόμος της Παγκόσμιας Έλξης (Βαρύτητα)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "μήλο", "παγκόσμια έλξη", "βαρύτητα", "βάρος", "ελεύθερη πτώση", "νεύτων", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-newton-calculus-book',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_newton_calculus_book_blue_sketch.png:#5a3015',
    title: "Απειροστικός Λογισμός & Μαθηματική Ανάλυση — Παράγωγος & Ολοκλήρωμα",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "μαθηματικά", "λογισμός", "παράγωγος", "ολοκλήρωμα", "συνάρτηση", "νεύτων", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-newton-prism-spectrum',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_newton_prism_light_spectrum_blue_sketch.png:#5a3015',
    title: "Πρίσμα του Νεύτωνα — Ανάλυση Λευκού Φωτός στο Φάσμα Χρωμάτων",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "πρίσμα", "οπτική", "φως", "φάσμα", "χρώματα", "διάθλαση", "νεύτων", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-newton-principia',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_newton_principia_book_blue_sketch.png:#5a3015',
    title: "Principia Mathematica (1687) — Το Θεμελιώδες Έργο του Ισαάκ Νεύτωνα",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "principia", "βιβλίο", "νεύτων", "μηχανική", "φυσική", "μονόχρωμο σκίτσο"],
  },
  {
    id: 'sk-newton-planetary-orbit',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_newton_planetary_orbit_blue_sketch.png:#5a3015',
    title: "Πλανητική Τροχιά & Βαρυτική Έλξη — Αστρονομία & Κληρονομιά Νεύτωνα",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "πλανητική τροχιά", "γη", "δορυφόρος", "βαρύτητα", "αστρονομία", "νεύτων", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-einstein-portrait',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_einstein_portrait_blue_sketch.png:#5a3015',
    title: "Άλμπερτ Αϊνστάιν (1879–1955) — Θεωρητικός Φυσικός",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "άλμπερτ αϊνστάιν", "αϊνστάιν", "einstein", "φυσικός", "σχετικότητα", "κβαντική φυσική", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-einstein-spacetime',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_einstein_spacetime_curvature_blue_sketch.png:#5a3015',
    title: "Γενική Θεωρία της Σχετικότητας — Καμπύλωση Χωροχρόνου από Μάζα",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "σχετικότητα", "χωροχρόνος", "καμπύλωση", "βαρύτητα", "μάζα", "αϊνστάιν", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-einstein-emc2',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_einstein_emc2_equation_blue_sketch.png:#5a3015',
    title: "Εξίσωση Ισοδυναμίας Μάζας–Ενέργειας E = mc² (Άλμπερτ Αϊνστάιν)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "e=mc2", "ενέργεια", "μάζα", "ταχύτητα φωτός", "σχετικότητα", "αϊνστάιν", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-einstein-photoelectric',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_einstein_photoelectric_effect_blue_sketch.png:#5a3015',
    title: "Φωτοηλεκτρικό Φαινόμενο — Φωτόνια & Εκπομπή Ηλεκτρονίων (Νόμπελ 1921)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "φωτοηλεκτρικό φαινόμενο", "φωτόνια", "ηλεκτρόνια", "φως", "κβάντα", "αϊνστάιν", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-einstein-peace-dove',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_einstein_peace_dove_blue_sketch.png:#5a3015',
    title: "Περιστέρι της Ειρήνης με Κλαδί Ελιάς",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "περιστέρι", "ειρήνη", "κλαδί ελιάς", "αϊνστάιν", "μονόχρωμο σκίτσο"],
  },
  {
    id: 'sk-einstein-curiosity',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_einstein_curiosity_thought_bubble_blue_sketch.png:#5a3015',
    title: "Συννεφάκι Σκέψης & Επιστημονικής Περιέργειας (???)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "σκέψη", "περιέργεια", "ερωτηματικά", "συννεφάκι", "μονόχρωμο σκίτσο"],
  },
  {
    id: 'sk-einstein-cosmos',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_einstein_cosmos_orbit_blue_sketch.png:#5a3015',
    title: "Παγκόσμια Κληρονομιά — Σύμπαν, Γη & Κοσμικές Τροχιές",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "σύμπαν", "γη", "τροχιές", "κοσμολογία", "αϊνστάιν", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-curie-portrait',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_curie_portrait_blue_sketch.png:#5a3015',
    title: "Μαρί Κιουρί (1867–1934) — Φυσικός & Χημικός, Πρωτοπόρος Ραδιενέργειας",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "μαρί κιουρί", "κιουρί", "curie", "φυσικός", "χημικός", "ραδιενέργεια", "πολώνιο", "ράδιο", "νόμπελ", "μονόχρωμο σκίτσο", "χημεία", "φυσική"],
  },
  {
    id: 'sk-curie-nobel-medal',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_curie_nobel_medal_blue_sketch.png:#5a3015',
    title: "Μετάλλιο Βραβείου Νόμπελ (Άλφρεντ Νόμπελ — Φυσική & Χημεία)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "νόμπελ", "βραβείο νόμπελ", "μετάλλιο", "μαρί κιουρί", "μονόχρωμο σκίτσο", "χημεία", "φυσική"],
  },
  {
    id: 'sk-curie-polonium-radium',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_curie_polonium_radium_ores_blue_sketch.png:#5a3015',
    title: "Ανακάλυψη Πολωνίου (84 Po) & Ραδίου (88 Ra) — Ορυκτά & Στοιχεία",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "πολώνιο", "ράδιο", "po", "ra", "ραδιενέργεια", "στοιχεία", "ορυκτά", "μαρί κιουρί", "μονόχρωμο σκίτσο", "χημεία", "φυσική"],
  },
  {
    id: 'sk-curie-chemistry-apparatus',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_curie_chemistry_apparatus_blue_sketch.png:#5a3015',
    title: "Χημική Συσκευή Απόσταξης, Κωνική Φιάλη & Ποτήρι Ζέσεως",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "απόσταξη", "φιάλη", "ποτήρι ζέσεως", "εργαστήριο", "χημεία", "μαρί κιουρί", "μονόχρωμο σκίτσο"],
  },
  {
    id: 'sk-curie-electrometer',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_curie_electrometer_apparatus_blue_sketch.png:#5a3015',
    title: "Πιεζοηλεκτρικό Ηλεκτρόμετρο Κιουρί — Μέτρηση Ιονισμού & Ραδιενέργειας",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ηλεκτρόμετρο", "ραδιενέργεια", "μέτρηση", "εργαστήριο", "μαρί κιουρί", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-curie-xray-radiology',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_curie_xray_radiology_blue_sketch.png:#5a3015',
    title: "Ακτινογραφία & Κινητή Μονάδα Ακτίνων Χ (Μαρί Κιουρί — Ιατρική Φυσική)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ακτίνες χ", "ακτινογραφία", "ιατρική φυσική", "ραδιολογία", "μαρί κιουρί", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-curie-radiation-symbol',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_curie_radiation_symbol_blue_sketch.png:#5a3015',
    title: "Σύμβολο Ραδιενέργειας & Πυρηνικής Ενέργειας",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ραδιενέργεια", "πυρηνική ενέργεια", "σύμβολο", "ακτινοβολία", "μαρί κιουρί", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-archimedes',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_archimedes_blue_sketch.png:#5a3015',
    title: "Αρχιμήδης ο Συρακούσιος (287–212 π.Χ.) — Φυσικός & Μαθηματικός (Άνωση, Μοχλοί)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "αρχιμήδης", "archimedes", "φυσικός", "μαθηματικός", "άνωση", "μοχλός", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-galileo-galilei',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_galileo_galilei_blue_sketch.png:#5a3015',
    title: "Γαλιλαίος Γαλιλέι (1564–1642) — Φυσικός & Αστρονόμος (Ελεύθερη Πτώση, Τηλεσκόπιο)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "γαλιλαίος", "galileo", "φυσικός", "αστρονόμος", "ελεύθερη πτώση", "αδράνεια", "τηλεσκόπιο", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-johannes-kepler',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_johannes_kepler_blue_sketch.png:#5a3015',
    title: "Γιοχάνες Κέπλερ (1571–1630) — Αστρονόμος & Φυσικός (Νόμοι Πλανητικής Κίνησης)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "κέπλερ", "kepler", "φυσικός", "αστρονόμος", "πλανήτες", "τροχιές", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-blaise-pascal',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_blaise_pascal_blue_sketch.png:#5a3015',
    title: "Μπλεζ Πασκάλ (1623–1662) — Φυσικός & Μαθηματικός (Υδροστατική Πίεση Pa)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "πασκάλ", "pascal", "φυσικός", "μαθηματικός", "πίεση", "υδροστατική", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-robert-hooke',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_robert_hooke_blue_sketch.png:#5a3015',
    title: "Ρόμπερτ Χουκ (1635–1703) — Φυσικός & Βιολόγος (Νόμος Ελαστικότητας & Κύτταρο)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "χουκ", "ρόμπερτ χουκ", "hooke", "φυσικός", "ελατήριο", "κύτταρο", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική", "βιολογία"],
  },
  {
    id: 'sk-scientist-christiaan-huygens',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_christiaan_huygens_blue_sketch.png:#5a3015',
    title: "Κρίστιαν Χόιχενς (1629–1695) — Φυσικός (Κυματική Θεωρία Φωτός & Εκκρεμές)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "χόιχενς", "huygens", "φυσικός", "κύματα", "φως", "εκκρεμές", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-charles-coulomb',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_charles_coulomb_blue_sketch.png:#5a3015',
    title: "Σαρλ-Ωγκυστέν ντε Κουλόμπ (1736–1806) — Φυσικός (Νόμος του Κουλόμπ & Ηλεκτρικό Φορτίο)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "κουλόμπ", "coulomb", "φυσικός", "ηλεκτρικό φορτίο", "ηλεκτρισμός", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-alessandro-volta',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_alessandro_volta_blue_sketch.png:#5a3015',
    title: "Αλεσάντρο Βόλτα (1745–1827) — Φυσικός (Ηλεκτρική Στήλη & Τάση Volt)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "βόλτα", "volta", "volt", "φυσικός", "ηλεκτρική τάση", "μπαταρία", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-andre-marie-ampere',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_andre_marie_ampere_blue_sketch.png:#5a3015',
    title: "Αντρέ-Μαρί Αμπέρ (1775–1836) — Φυσικός (Ηλεκτρικό Ρεύμα Ampere & Ηλεκτρομαγνητισμός)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "αμπέρ", "ampere", "φυσικός", "ηλεκτρικό ρεύμα", "ηλεκτρομαγνητισμός", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-georg-ohm',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_georg_ohm_blue_sketch.png:#5a3015',
    title: "Γκέοργκ Σίμον Ωμ (1789–1854) — Φυσικός (Νόμος του Ωμ & Ηλεκτρική Αντίσταση)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ωμ", "ohm", "φυσικός", "νόμος του ωμ", "αντίσταση", "ηλεκτρισμός", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-michael-faraday',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_michael_faraday_blue_sketch.png:#5a3015',
    title: "Μάικλ Φαραντέι (1791–1867) — Φυσικός & Χημικός (Ηλεκτρομαγνητική Επαγωγή & Πεδία)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "φαραντέι", "faraday", "φυσικός", "επαγωγή", "μαγνητικό πεδίο", "ηλεκτρισμός", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-james-prescott-joule',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_james_prescott_joule_blue_sketch.png:#5a3015',
    title: "Τζέιμς Πρέσκοτ Τζάουλ (1818–1889) — Φυσικός (Έργο, Ενέργεια Joule & Θερμότητα)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "τζάουλ", "joule", "φυσικός", "ενέργεια", "έργο", "θερμότητα", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-lord-kelvin',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_lord_kelvin_blue_sketch.png:#5a3015',
    title: "Λόρδος Κέλβιν (Ουίλιαμ Τόμσον, 1824–1907) — Φυσικός (Απόλυτη Θερμοκρασία Kelvin & Θερμοδυναμική)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "κέλβιν", "kelvin", "φυσικός", "θερμοκρασία", "θερμοδυναμική", "απόλυτο μηδέν", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-james-clerk-maxwell',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_james_clerk_maxwell_blue_sketch.png:#5a3015',
    title: "Τζέιμς Κλερκ Μάξγουελ (1831–1879) — Φυσικός (Εξισώσεις Μάξγουελ & Ηλεκτρομαγνητικά Κύματα)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "μάξγουελ", "maxwell", "φυσικός", "ηλεκτρομαγνητισμός", "ηλεκτρομαγνητικά κύματα", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-heinrich-hertz',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_heinrich_hertz_blue_sketch.png:#5a3015',
    title: "Χάινριχ Χερτζ (1857–1894) — Φυσικός (Ηλεκτρομαγνητικά Κύματα & Συχνότητα Hz)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "χερτζ", "hertz", "hz", "φυσικός", "συχνότητα", "κύματα", "ταλαντώσεις", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-nikola-tesla',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_nikola_tesla_blue_sketch.png:#5a3015',
    title: "Νίκολα Τέσλα (1856–1943) — Φυσικός & Εφευρέτης (Εναλλασσόμενο Ρεύμα & Μαγνητικό Πεδίο)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "τέσλα", "νίκολα τέσλα", "tesla", "φυσικός", "εφευρέτης", "εναλλασσόμενο ρεύμα", "μαγνητικό πεδίο", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-wilhelm-roentgen',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_wilhelm_roentgen_blue_sketch.png:#5a3015',
    title: "Βίλχελμ Κόνραντ Ρέντγκεν (1845–1923) — Φυσικός (Ανακάλυψη Ακτίνων Χ, Νόμπελ 1901)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ρέντγκεν", "roentgen", "φυσικός", "ακτίνες χ", "ακτινοβολία", "νόμπελ", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-henri-becquerel',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_henri_becquerel_blue_sketch.png:#5a3015',
    title: "Ανρί Μπεκερέλ (1852–1908) — Φυσικός (Ανακάλυψη Φυσικής Ραδιενέργειας Bq)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "μπεκερέλ", "becquerel", "φυσικός", "ραδιενέργεια", "πυρηνική φυσική", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-jj-thomson',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_jj_thomson_blue_sketch.png:#5a3015',
    title: "Τζόζεφ Τζον Τόμσον (1856–1940) — Φυσικός (Ανακάλυψη του Ηλεκτρονίου)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "τόμσον", "thomson", "φυσικός", "ηλεκτρόνιο", "άτομο", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική", "χημεία"],
  },
  {
    id: 'sk-scientist-ernest-rutherford',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_ernest_rutherford_blue_sketch.png:#5a3015',
    title: "Έρνεστ Ράδερφορντ (1871–1937) — Φυσικός (Πυρηνικό Πρότυπο του Ατόμου & Πρωτόνιο)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ράδερφορντ", "rutherford", "φυσικός", "πυρήνας", "άτομο", "πρωτόνιο", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική", "χημεία"],
  },
  {
    id: 'sk-scientist-max-planck',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_max_planck_blue_sketch.png:#5a3015',
    title: "Μαξ Πλανκ (1858–1947) — Φυσικός (Πατέρας της Κβαντικής Θεωρίας & Σταθερά h)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "πλανκ", "μαξ πλανκ", "planck", "φυσικός", "κβαντική φυσική", "κβάντα", "σταθερά πλανκ", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-niels-bohr',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_niels_bohr_blue_sketch.png:#5a3015',
    title: "Νιλς Μπορ (1885–1962) — Φυσικός (Ατομικό Πρότυπο του Μπορ & Κβαντικές Τροχιές)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "μπορ", "νιλς μπορ", "bohr", "φυσικός", "άτομο", "ατομικό πρότυπο", "κβαντομηχανική", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική", "χημεία"],
  },
  {
    id: 'sk-scientist-erwin-schrodinger',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_erwin_schrodinger_blue_sketch.png:#5a3015',
    title: "Έρβιν Σρέντινγκερ (1887–1961) — Φυσικός (Κυματική Εξίσωση Κβαντομηχανικής)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "σρέντινγκερ", "schrodinger", "φυσικός", "κβαντομηχανική", "κυματική εξίσωση", "τροχιακά", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική", "χημεία"],
  },
  {
    id: 'sk-scientist-werner-heisenberg',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_werner_heisenberg_blue_sketch.png:#5a3015',
    title: "Βέρνερ Χάιζενμπεργκ (1901–1976) — Φυσικός (Αρχή της Αβεβαιότητας & Κβαντομηχανική)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "χάιζενμπεργκ", "heisenberg", "φυσικός", "αρχή αβεβαιότητας", "κβαντομηχανική", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-paul-dirac',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_paul_dirac_blue_sketch.png:#5a3015',
    title: "Πολ Ντιράκ (1902–1984) — Φυσικός (Σχετικιστική Κβαντομηχανική & Αντιύλη)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ντιράκ", "dirac", "φυσικός", "κβαντομηχανική", "αντιύλη", "ποζιτρόνιο", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-wolfgang-pauli',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_wolfgang_pauli_blue_sketch.png:#5a3015',
    title: "Βόλφγκανγκ Πάουλι (1900–1958) — Φυσικός (Απαγορευτική Αρχή του Πάουλι & Σπιν)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "πάουλι", "pauli", "φυσικός", "απαγορευτική αρχή", "σπιν", "ηλεκτρόνια", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική", "χημεία"],
  },
  {
    id: 'sk-scientist-enrico-fermi',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_enrico_fermi_blue_sketch.png:#5a3015',
    title: "Ενρίκο Φέρμι (1901–1954) — Φυσικός (Πυρηνική Φυσική & Αλυσιδωτή Αντίδραση)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "φέρμι", "fermi", "φυσικός", "πυρηνική φυσική", "νετρόνια", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-lise-meitner',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_lise_meitner_blue_sketch.png:#5a3015',
    title: "Λίζε Μάιτνερ (1878–1968) — Φυσικός (Ερμηνεία της Πυρηνικής Σχάσης)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "μάιτνερ", "λίζε μάιτνερ", "meitner", "φυσικός", "πυρηνική σχάση", "ραδιενέργεια", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-richard-feynman',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_richard_feynman_blue_sketch.png:#5a3015',
    title: "Ρίτσαρντ Φάινμαν (1918–1988) — Φυσικός (Κβαντική Ηλεκτροδυναμική & Διαγράμματα Φάινμαν)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "φάινμαν", "feynman", "φυσικός", "κβαντική ηλεκτροδυναμική", "σωματίδια", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-stephen-hawking',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_stephen_hawking_blue_sketch.png:#5a3015',
    title: "Στίβεν Χόκινγκ (1942–2018) — Θεωρητικός Φυσικός & Κοσμολόγος (Μαύρες Τρύπες & Σύμπαν)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "χόκινγκ", "στίβεν χόκινγκ", "hawking", "φυσικός", "κοσμολογία", "μαύρες τρύπες", "σύμπαν", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-peter-higgs',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_peter_higgs_blue_sketch.png:#5a3015',
    title: "Πίτερ Χιγκς (1929–2024) — Θεωρητικός Φυσικός (Σωματίδιο Μποζόνιο Χιγκς & Μάζα)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "χιγκς", "higgs", "μποζόνιο χιγκς", "φυσικός", "σωματιδιακή φυσική", "cern", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-christian-doppler',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_christian_doppler_blue_sketch.png:#5a3015',
    title: "Κρίστιαν Ντόπλερ (1803–1853) — Φυσικός (Φαινόμενο Ντόπλερ στα Κύματα & τον Ήχο)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ντόπλερ", "doppler", "φαινόμενο doppler", "φυσικός", "κύματα", "ήχος", "συχνότητα", "επιστήμονας", "μονόχρωμο σκίτσο", "φυσική"],
  },
  {
    id: 'sk-scientist-pythagoras',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_pythagoras_blue_sketch.png:#5a3015',
    title: "Πυθαγόρας ο Σάμιος (580–496 π.Χ.) — Μαθηματικός & Φιλόσοφος (Πυθαγόρειο Θεώρημα & Αρμονία)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "πυθαγόρας", "pythagoras", "μαθηματικός", "πυθαγόρειο θεώρημα", "τρίγωνο", "γεωμετρία", "επιστήμονας", "μονόχρωμο σκίτσο", "μαθηματικά", "φυσική"],
  },
  {
    id: 'sk-scientist-euclid',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_euclid_blue_sketch.png:#5a3015',
    title: "Ευκλείδης ο Αλεξανδρεύς (325–265 π.Χ.) — Μαθηματικός (Πατέρας της Ευκλείδειας Γεωμετρίας, «Στοιχεία»)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "ευκλείδης", "euclid", "μαθηματικός", "γεωμετρία", "ευκλείδεια γεωμετρία", "στοιχεία", "επιστήμονας", "μονόχρωμο σκίτσο", "μαθηματικά", "φυσική"],
  },
  {
    id: 'sk-scientist-carl-friedrich-gauss',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_carl_friedrich_gauss_blue_sketch.png:#5a3015',
    title: "Καρλ Φρίντριχ Γκάους (1777–1855) — Μαθηματικός & Φυσικός (Θεωρία Αριθμών, Νόμος του Γκάους)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "γκάους", "gauss", "μαθηματικός", "φυσικός", "άλγεβρα", "κατανομή gauss", "μαγνητική ροή", "επιστήμονας", "μονόχρωμο σκίτσο", "μαθηματικά", "φυσική"],
  },
  {
    id: 'sk-scientist-leonhard-euler',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_leonhard_euler_blue_sketch.png:#5a3015',
    title: "Λέοναρντ Όιλερ (1707–1783) — Μαθηματικός & Φυσικός (Συναρτήσεις, Αριθμός e, Ανάλυση & Μηχανική)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "όιλερ", "euler", "μαθηματικός", "συναρτήσεις", "ανάλυση", "εκθετική συνάρτηση", "επιστήμονας", "μονόχρωμο σκίτσο", "μαθηματικά", "φυσική"],
  },
  {
    id: 'sk-scientist-antoine-lavoisier',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_antoine_lavoisier_blue_sketch.png:#5a3015',
    title: "Αντουάν Λαβουαζιέ (1743–1794) — Χημικός (Πατέρας της Σύγχρονης Χημείας, Αρχή Διατήρησης της Μάζας)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "λαβουαζιέ", "lavoisier", "χημικός", "διατήρηση της μάζας", "οξυγόνο", "καύση", "επιστήμονας", "μονόχρωμο σκίτσο", "χημεία"],
  },
  {
    id: 'sk-scientist-dmitri-mendeleev',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_dmitri_mendeleev_blue_sketch.png:#5a3015',
    title: "Ντμίτρι Μεντελέγιεφ (1834–1907) — Χημικός (Δημιουργός του Περιοδικού Πίνακα των Στοιχείων)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "μεντελέγιεφ", "mendeleev", "χημικός", "περιοδικός πίνακας", "χημικά στοιχεία", "επιστήμονας", "μονόχρωμο σκίτσο", "χημεία"],
  },
  {
    id: 'sk-scientist-amedeo-avogadro',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_amedeo_avogadro_blue_sketch.png:#5a3015',
    title: "Αμεντέο Αβογκάντρο (1776–1856) — Χημικός & Φυσικός (Αριθμός Αβογκάντρο NA & Νόμος των Αερίων)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "αβογκάντρο", "avogadro", "χημικός", "φυσικός", "mole", "μόρια", "αέρια", "επιστήμονας", "μονόχρωμο σκίτσο", "χημεία", "φυσική"],
  },
  {
    id: 'sk-scientist-linus-pauling',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_linus_pauling_blue_sketch.png:#5a3015',
    title: "Λάινους Πόλινγκ (1901–1994) — Χημικός (Φύση του Χημικού Δεσμού & Κλίμακα Ηλεκτραρνητικότητας)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "πόλινγκ", "pauling", "χημικός", "χημικός δεσμός", "ηλεκτραρνητικότητα", "μόρια", "ενώσεις", "νόμπελ", "επιστήμονας", "μονόχρωμο σκίτσο", "χημεία"],
  },
  {
    id: 'sk-scientist-charles-darwin',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_charles_darwin_blue_sketch.png:#5a3015',
    title: "Κάρολος Δαρβίνος (1809–1882) — Βιολόγος & Φυσιοδίφης (Θεωρία της Εξέλιξης & Φυσική Επιλογή)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "δαρβίνος", "κάρολος δαρβίνος", "darwin", "βιολόγος", "εξέλιξη", "φυσική επιλογή", "είδη", "επιστήμονας", "μονόχρωμο σκίτσο", "βιολογία"],
  },
  {
    id: 'sk-scientist-gregor-mendel',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_gregor_mendel_blue_sketch.png:#5a3015',
    title: "Γκρέγκορ Μέντελ (1822–1884) — Βιολόγος (Πατέρας της Γενετικής & Νόμοι της Κληρονομικότητας)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "μέντελ", "γκρέγκορ μέντελ", "mendel", "βιολόγος", "γενετική", "κληρονομικότητα", "γονίδια", "επιστήμονας", "μονόχρωμο σκίτσο", "βιολογία"],
  },
  {
    id: 'sk-scientist-louis-pasteur',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_louis_pasteur_blue_sketch.png:#5a3015',
    title: "Λουί Παστέρ (1822–1895) — Βιολόγος & Χημικός (Πατέρας της Μικροβιολογίας, Εμβόλια & Παστερίωση)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "παστέρ", "λουί παστέρ", "pasteur", "βιολόγος", "χημικός", "μικροβιολογία", "εμβόλια", "παστερίωση", "μικρόβια", "επιστήμονας", "μονόχρωμο σκίτσο", "βιολογία"],
  },
  {
    id: 'sk-scientist-rosalind-franklin',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/scientist_rosalind_franklin_blue_sketch.png:#5a3015',
    title: "Ρόζαλιντ Φράνκλιν (1920–1958) — Βιολόγος & Βιοφυσικός (Κρυσταλλογραφία Ακτίνων Χ & Διπλή Έλικα DNA)",
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ["φυσικοί", "επιστήμονες", "premium", "φράνκλιν", "ρόζαλιντ φράνκλιν", "franklin", "βιολόγος", "dna", "διπλή έλικα", "γενετική", "επιστήμονας", "μονόχρωμο σκίτσο", "βιολογία"],
  },
  {
    id: 'sk-mass-balance-scale-apple',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_mass_balance_scale_apple.png:#1d4ed8',
    title: 'Ζυγός Ισορροπίας με Μήλο & Βάρη (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ζυγός ισορροπίας', 'ζυγαριά', 'μάζα', 'μήλο', 'βαράκια', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-mass-balance-3stages',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_mass_balance_3stages.png:#1d4ed8',
    title: '3 Στάδια Μέτρησης με Ζυγό Ισορροπίας (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ζυγός ισορροπίας', 'μέτρηση μάζας', 'βαράκια', 'μάζα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-mass-balance-step1',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_mass_balance_step1_100g.png:#1d4ed8',
    title: 'Ζυγός Ισορροπίας με Μήλο & 100g (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ζυγός ισορροπίας', 'μάζα', '100g', 'μήλο', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-mass-balance-equilibrium',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_mass_balance_equilibrium.png:#1d4ed8',
    title: 'Ζυγός Ισορροπίας σε Ισορροπία 175g (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ισορροπία', 'ζυγός ισορροπίας', 'μάζα', 'βαράκια', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-mass-digital-scale',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_mass_digital_scale_apple.png:#1d4ed8',
    title: 'Ηλεκτρονική Ζυγαριά Ακριβείας 185.4g (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ηλεκτρονική ζυγαριά', 'ζυγαριά', 'μάζα', 'μήλο', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-weight-earth-dynamometer',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_weight_earth_dynamometer.png:#1d4ed8',
    title: 'Γη & Δυναμόμετρο — Μέτρηση Βάρους (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'βάρος', 'δυναμόμετρο', 'βαρύτητα', 'γη', 'δύναμη', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-weight-dynamometer-isolated',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_weight_dynamometer_isolated.png:#1d4ed8',
    title: 'Δυναμόμετρο με Κρεμασμένο Σώμα (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'δυναμόμετρο', 'βάρος', 'δύναμη', 'ελατήριο', 'νεύτωνα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-weight-dynamometer-3stages',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_weight_dynamometer_3stages.png:#1d4ed8',
    title: '3 Βήματα Μέτρησης Βάρους με Δυναμόμετρο (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'δυναμόμετρο', 'μέτρηση βάρους', 'βάρος', 'νεύτωνα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-weight-dynamometer-zoom',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_weight_dynamometer_zoom_scale.png:#1d4ed8',
    title: 'Κλίμακα Δυναμομέτρου σε Μεγέθυνση (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'δυναμόμετρο', 'κλίμακα', 'βάρος', 'νεύτωνα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-weight-altitude-earth',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_weight_altitude_earth_gravity.png:#1d4ed8',
    title: 'Μεταβολή Βάρους με το Ύψος από τη Γη (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'βάρος', 'βαρύτητα', 'ύψος', 'πύραυλος', 'γη', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-weight-earth-globe',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_weight_earth_globe_sketch.png:#1d4ed8',
    title: 'Πλανήτης Γη — Υδρόγειος (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'γη', 'υδρόγειος', 'πλανήτης', 'βαρύτητα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-volume-rectangular-prism',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_volume_rectangular_prism.png:#1d4ed8',
    title: 'Ορθογώνιο Παραλληλεπίπεδο V = l·b·h (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'όγκος', 'ορθογώνιο παραλληλεπίπεδο', 'στερεό', 'γεωμετρία', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-volume-cube',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_volume_cube_isolated.png:#1d4ed8',
    title: 'Κύβος V = a³ (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'κύβος', 'όγκος', 'στερεό', 'γεωμετρία', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-volume-cylinder',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_volume_cylinder_isolated.png:#1d4ed8',
    title: 'Κύλινδρος V = π·r²·h (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'κύλινδρος', 'όγκος', 'στερεό', 'γεωμετρία', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-volume-displacement-3cylinders',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_volume_displacement_3cylinders.png:#1d4ed8',
    title: 'Μέτρηση Όγκου με Ογκομετρικό Κύλινδρο V₂-V₁ (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ογκομετρικός κύλινδρος', 'όγκος', 'εκτόπιση νερού', 'πέτρα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-volume-graduated-cylinder-stone',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_volume_graduated_cylinder_stone.png:#1d4ed8',
    title: 'Ογκομετρικός Κύλινδρος με Πέτρα (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ογκομετρικός κύλινδρος', 'όγκος', 'πέτρα', 'εργαστήριο', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-density-balance-comparison',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_density_balance_comparison.png:#1d4ed8',
    title: 'Ζυγός Σύγκρισης Πυκνότητας (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'πυκνότητα', 'ζυγός', 'μάζα', 'όγκος', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-density-regular-solid',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_density_regular_solid_method.png:#1d4ed8',
    title: 'Μέτρηση Πυκνότητας Κανονικού Στερεού (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'πυκνότητα', 'ζυγός', 'ογκομετρικός κύλινδρος', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-density-irregular-solid',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_density_irregular_solid_method.png:#1d4ed8',
    title: 'Μέτρηση Πυκνότητας Ακανόνιστου Σώματος (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'πυκνότητα', 'ογκομετρικός κύλινδρος', 'ακανόνιστο σώμα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-boiling-water-pot',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_boiling_water_pot_stove.png:#1d4ed8',
    title: 'Βρασμός Νερού σε Κατσαρόλα 100°C (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'βρασμός', 'νερό', 'κατσαρόλα', 'φυσαλίδες', 'ατμός', 'θερμότητα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-boiling-water-4beakers',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_boiling_water_4beakers.png:#1d4ed8',
    title: 'Τα 4 Στάδια Βρασμού σε Ποτήρια Ζέσεως (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'βρασμός', 'ποτήρι ζέσεως', 'φυσαλίδες', 'στάδια βρασμού', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-boiling-beaker-warm',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_boiling_beaker_stage1_warm.png:#1d4ed8',
    title: 'Ποτήρι Ζέσεως με Νερό (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ποτήρι ζέσεως', 'νερό', 'εργαστήριο', 'χημεία', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-boiling-beaker-bubbles',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_boiling_beaker_bubbles.png:#1d4ed8',
    title: 'Ποτήρι Ζέσεως σε Βρασμό με Φυσαλίδες (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'βρασμός', 'ποτήρι ζέσεως', 'φυσαλίδες', 'ατμός', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-ocean-liner-buoyancy',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_ocean_liner_buoyancy.png:#1d4ed8',
    title: 'Υπερωκεάνιο Πλοίο — Άνωση & Πλεύση (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'υπερωκεάνιο', 'πλοίο', 'άνωση', 'πλεύση', 'αρχή του αρχιμήδη', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-ocean-liner-4stages',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_ocean_liner_4stages_flotation.png:#1d4ed8',
    title: 'Τα 4 Στάδια Πλεύσης & Άνωσης Πλοίου (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'πλεύση', 'άνωση', 'πλοίο', 'υπερωκεάνιο', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-rain-cloud-precipitation',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_rain_cloud_precipitation_blue_sketch.png:#18181b',
    title: 'Σύννεφο Βροχής & Κατακρήμνιση — Κύκλος Νερού (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'σύννεφο', 'βροχή', 'κατακρήμνιση', 'κύκλος νερού', 'κύκλος του νερού', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-condensation-cloud',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_condensation_cloud_blue_sketch.png:#18181b',
    title: 'Σύννεφο Συμπύκνωσης Υδρατμών — Κύκλος Νερού (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'σύννεφο', 'συμπύκνωση', 'κύκλος νερού', 'κύκλος του νερού', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-sun-solar-heating',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_sun_solar_heating_blue_sketch.png:#18181b',
    title: 'Ήλιος — Κύκλος Νερού (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ήλιος', 'εξάτμιση', 'θερμότητα', 'κύκλος νερού', 'κύκλος του νερού', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-drought-cracked-earth',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_drought_cracked_earth_full_blue_sketch.png:#18181b',
    title: 'Ξηρό Σκασμένο Έδαφος με Ξερό Δέντρο & Λίμνη — Ξηρασία (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ξηρασία', 'λειψυδρία', 'ξηρό έδαφος', 'σκασμένο έδαφος', 'ξερό δέντρο', 'έλλειψη νερού', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-drought-barren-tree',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_drought_barren_tree_blue_sketch.png:#18181b',
    title: 'Ξερό Δέντρο — Ξηρασία (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ξηρασία', 'λειψυδρία', 'ξερό δέντρο', 'δέντρο', 'έδαφος', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-drought-shrinking-pond',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_drought_shrinking_pond_blue_sketch.png:#18181b',
    title: 'Στεγνωμένη Λίμνη σε Ξηρό Έδαφος — Ξηρασία (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ξηρασία', 'λειψυδρία', 'λίμνη', 'ξηρό έδαφος', 'έλλειψη νερού', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-drought-weak-rain-cloud',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_drought_weak_rain_cloud_blue_sketch.png:#18181b',
    title: 'Σύννεφο Μειωμένης Βροχόπτωσης — Ξηρασία (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ξηρασία', 'λειψυδρία', 'βροχόπτωση', 'λιγότερη βροχή', 'σύννεφο', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-drought-heat-waves',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_drought_heat_waves_blue_sketch.png:#18181b',
    title: 'Ανοδικά Κύματα Ζέστης & Εξάτμισης — Ξηρασία (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ξηρασία', 'λειψυδρία', 'ζέστη', 'εξάτμιση', 'κύματα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-volcano-eruption-plume',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_volcano_eruption_ash_plume_blue_sketch.png:#18181b',
    title: 'Ηφαιστειακή Έκρηξη & Νέφος Τέφρας (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ηφαίστειο', 'έκρηξη', 'τέφρα', 'λάβα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-water-cycle-evaporation-arrows',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_water_cycle_evaporation_arrows_blue_sketch.png:#18181b',
    title: 'Βέλη Εξάτμισης που Ανεβαίνουν — Κύκλος Νερού (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'εξάτμιση', 'υδρατμοί', 'βέλη', 'κύκλος νερού', 'κύκλος του νερού', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-water-cycle-mountain-river',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_water_cycle_mountain_river_blue_sketch.png:#18181b',
    title: 'Βουνά, Ποτάμι & Θάλασσα — Κύκλος Νερού (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'βουνό', 'βουνά', 'θάλασσα', 'ποτάμι', 'συγκέντρωση', 'απορροή', 'κύκλος νερού', 'κύκλος του νερού', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-volcano-formation-full',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_volcano_formation_cross_section_blue_sketch.png:#18181b',
    title: 'Δημιουργία Ηφαιστείου — Πλήρης Τομή (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ηφαίστειο', 'μάγμα', 'λάβα', 'κρατήρας', 'γεωλογία', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-volcano-cone-layers',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_volcano_cone_layers_blue_sketch.png:#18181b',
    title: 'Ηφαιστειακός Κώνος & Γεωλογικά Στρώματα (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'ηφαίστειο', 'κώνος', 'στρώματα', 'πετρώματα', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-volcano-magma-chamber',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_volcano_magma_chamber_blue_sketch.png:#18181b',
    title: 'Μαγματικός Θάλαμος στο Εσωτερικό της Γης (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'μάγμα', 'μαγματικός θάλαμος', 'ηφαίστειο', 'γεωλογία', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'sk-chitin-chemical-structure',
    iconifyId: 'sketch-png:/mind_maps/premium_pdf/premium_chitin_chemical_structure_blue_sketch.png:#1d4ed8',
    title: 'Χημική Δομή Χιτίνης — Πολυσακχαρίτης (Σκίτσο)',
    category: 'Μονόχρωμα Σκίτσα',
    colorStyle: 'monochrome',
    tags: ['premium', 'χιτίνη', 'χημική ένωση', 'ενώσεις', 'εξωσκελετός', 'μονόχρωμο σκίτσο'],
  },
  {
    id: 'col-premium-acids-hero-vinegar-yogurt-hcl-fruits',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_hero_vinegar_yogurt_hcl_fruits.png',
    title: "Τα Οξέα στην Καθημερινή Ζωή & στο Εργαστήριο — Ξύδι (CH3COOH), Γιαούρτι, Υδροχλωρικό Οξύ (HCl), Λεμόνι, Σταφύλι & Ντομάτα",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "οξέα", "ξύδι", "οξικό οξύ", "CH3COOH", "γιαούρτι", "γαλακτικό οξύ", "υδροχλωρικό οξύ", "HCl", "λεμόνι", "κιτρικό οξύ", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-flask-bubbles',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_flask_bubbles.png',
    title: "Κωνική Φιάλη Ερλενμάγιερ με Υδατικό Διάλυμα Οξέος & Φυσαλίδες",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κωνική φιάλη", "ερλενμάγιερ", "διάλυμα οξέος", "οξέα", "εργαστήριο", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-molecule-ionization',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_molecule_ionization.png',
    title: "Μοριακό Μοντέλο Οξέος & Ιοντισμός (Κατιόντα Υδρογόνου H+)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ιοντισμός", "μόριο", "οξύ", "κατιόντα υδρογόνου", "H+", "ανιόν", "ενώσεις", "οξέα", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-sour-tongue-litmus',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_sour_tongue_litmus.png',
    title: "Ιδιότητες Οξέων — Ξινή Γεύση & Κόκκινο Χρώμα σε Πεχαχαρτο (Δείκτες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ιδιότητες οξέων", "ξινή γεύση", "γλώσσα", "πεχαχαρτο", "δείκτες", "κόκκινο", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-zinc-h2-testtube-shield',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_zinc_h2_testtube_shield.png',
    title: "Δοκιμαστικός Σωλήνας Αντίδρασης Οξέος με Μέταλλο (Έκλυση H2) & Διαβρωτικότητα",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δοκιμαστικός σωλήνας", "υδρογόνο", "H2", "μέταλλα", "διαβρωτικά", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-inorganic-test-tubes-rack',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_inorganic_test_tubes_rack.png',
    title: "Ανόργανα Οξέα σε Στατώ Δοκιμαστικών Σωλήνων (HCl, H2SO4, HNO3)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ανόργανα οξέα", "δοκιμαστικοί σωλήνες", "HCl", "H2SO4", "HNO3", "ενώσεις", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "θειικό οξύ", "νιτρικό οξύ", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-organic-molecule-model',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_organic_molecule_model.png',
    title: "Οργανικά Οξέα (με Άνθρακα) — 3D Μοριακό Μοντέλο (CH3COOH, Κιτρικό, Γαλακτικό)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "οργανικά οξέα", "μόριο", "άνθρακας", "οξικό οξύ", "CH3COOH", "ενώσεις", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-strong-weak-lightning-scale',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_strong_weak_lightning_scale.png',
    title: "Ισχυρά Οξέα (Πλήρης Ιοντισμός) & Ασθενή Οξέα (Μερικός Ιοντισμός / Ισορροπία)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ισχυρά οξέα", "ασθενή οξέα", "πλήρης ιοντισμός", "μερικός ιοντισμός", "χημική ισορροπία", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-litmus-beakers-trio',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_litmus_beakers_trio.png',
    title: "Δείκτες Οξέων – Βάσεων: Πεχαχαρτο (Ήλιος) σε Όξινο, Ουδέτερο & Βασικό Διάλυμα",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δείκτες", "πεχαχαρτο", "ήλιος", "όξινο διάλυμα", "ουδέτερο διάλυμα", "βασικό διάλυμα", "ποτήρια ζέσεως", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-metal-zn-hcl-h2-reaction',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_metal_zn_hcl_h2_reaction.png',
    title: "Αντίδραση Οξέων με Μέταλλα: Ψευδάργυρος (Zn) + Υδροχλωρικό Οξύ (HCl) → ZnCl2 + Αέριο Υδρογόνο (H2↑)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αντίδραση με μέταλλα", "ψευδάργυρος", "Zn", "υδροχλωρικό οξύ", "HCl", "υδρογόνο", "H2", "φυσαλίδες", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-neutralization-4flasks',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_neutralization_4flasks.png',
    title: "Εξουδετέρωση (Αντίδραση με Βάσεις): Οξύ (HCl) + Βάση (NaOH) → Άλας (NaCl) + Νερό (H2O)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "εξουδετέρωση", "οξύ", "βάση", "άλας", "νερό", "HCl", "NaOH", "NaCl", "H2O", "ενώσεις", "οξέα", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "υδροχλωρικό οξύ", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-ph-scale-spectrum',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_ph_scale_spectrum.png',
    title: "Κλίμακα pH (0 έως 14) — Όξινο (pH < 7), Ουδέτερο (pH = 7) & Βασικό Διάλυμα (pH > 7)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κλίμακα pH", "pH", "όξινο", "ουδέτερο", "βασικό", "αλκαλικό", "δείκτες", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-water-drop-ph',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_water_drop_ph.png',
    title: "Σταγόνα Καθαρού Νερού (Ουδέτερο pH = 7)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "σταγόνα", "καθαρό νερό", "ουδέτερο", "pH 7", "H2O", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-stomach-digestion',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_stomach_digestion.png',
    title: "Υδροχλωρικό Οξύ (HCl) στο Στομάχι — Γαστρικό Υγρό & Πέψη των Τροφών",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "στομάχι", "πέψη", "γαστρικό υγρό", "υδροχλωρικό οξύ", "HCl", "πεπτικό σύστημα", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-cleaner-spray-bottle',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_cleaner_spray_bottle.png',
    title: "Υγρά Καθαριστικά & Απολυμαντικά (Χρήσεις Υδροχλωρικού Οξέος)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "καθαριστικά", "απολύμανση", "υδροχλωρικό οξύ", "κεζάπ", "χρήσεις οξέων", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-chemical-factory',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_chemical_factory.png',
    title: "Χημική Βιομηχανία — Παραγωγή Λιπασμάτων, Χημικών & Πλαστικών (H2SO4, HNO3)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "βιομηχανία", "λιπάσματα", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-pickles-jar-preservation',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_pickles_jar_preservation.png',
    title: "Συντήρηση Τροφίμων & Μαγειρική με Ξύδι (Οξικό Οξύ) και Κιτρικό Οξύ",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "συντήρηση τροφίμων", "τουρσί", "ξύδι", "οξικό οξύ", "κιτρικό οξύ", "τρόφιμα", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "CH3COOH", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-car-battery-h2so4',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_car_battery_h2so4.png',
    title: "Μπαταρία Αυτοκινήτου (Συσσωρευτής Μολύβδου με Θειικό Οξύ H2SO4)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μπαταρία αυτοκινήτου", "μπαταρία", "θειικό οξύ", "H2SO4", "ηλεκτρολύτης", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-acids-safety-goggles-gloves',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_acids_safety_goggles_gloves.png',
    title: "Κανόνες Ασφαλείας στο Χημικό Εργαστήριο — Προστατευτικά Γυαλιά & Γάντια",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ασφάλεια", "εργαστήριο", "προστατευτικά γυαλιά", "γάντια", "διαβρωτικά", "οξέα", "οξύ", "κατιόντα υδρογόνου", "H+", "ξινή γεύση", "δείκτες", "πεχαχαρτο", "βάμμα ηλίου", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροχλωρικό οξύ", "HCl", "θειικό οξύ", "H2SO4", "νιτρικό οξύ", "HNO3", "οξικό οξύ", "CH3COOH", "ξύδι", "κιτρικό οξύ", "γαλακτικό οξύ", "ενώσεις", "χημικές ενώσεις", "acids", "χημεία"],
  },
  {
    id: 'col-premium-bases-hero-naoh-nh3-caoh2-soap',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_hero_naoh_nh3_caoh2_soap.png',
    title: "Οι Βάσεις στην Καθημερινή Ζωή & στο Εργαστήριο — Υδροξείδιο Νατρίου (NaOH), Αμμωνία (NH3), Υδροξείδιο Ασβεστίου Ca(OH)2 & Σαπούνι",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "βάσεις", "υδροξείδιο νατρίου", "NaOH", "αμμωνία", "NH3", "υδροξείδιο ασβεστίου", "Ca(OH)2", "σαπούνι", "καυστική σόδα", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "υδροξείδιο του καλίου", "KOH", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-bitter-tongue',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_bitter_tongue.png',
    title: "Ιδιότητες Βάσεων — Πικρή Γεύση (Προσοχή: Δεν Δοκιμάζουμε Χημικές Ουσίες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "πικρή γεύση", "γλώσσα", "ιδιότητες βάσεων", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-soapy-hands',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_soapy_hands.png',
    title: "Ιδιότητες Βάσεων — Γλιστερή Υφή (Αίσθηση Σαπουνιού στα Χέρια)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "γλιστερή υφή", "σαπουνάδα", "σαπούνι", "χέρια", "ιδιότητες βάσεων", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-litmus-test-tube-shield',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_litmus_test_tube_shield.png',
    title: "Δοκιμαστικός Σωλήνας Βασικού Διαλύματος & Ασπίδα Διαβρωτικότητας",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δοκιμαστικός σωλήνας", "βασικό διάλυμα", "διαβρωτικότητα", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-oh-ion-dissociation',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_oh_ion_dissociation.png',
    title: "Διάσταση / Ιοντισμός Βάσεων — Απελευθέρωση Ανιόντων Υδροξυλίου (OH-)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ανιόντα υδροξυλίου", "OH-", "διάσταση", "ιοντισμός", "μόριο", "ενώσεις", "βάσεις", "βάση", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-soap-bar-bubbles',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_soap_bar_bubbles.png',
    title: "Πλάκα Σαπουνιού με Φυσαλίδες (Παρασκευή Σαπουνιού με NaOH / KOH)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "σαπούνι", "σαπωνοποίηση", "NaOH", "KOH", "καθαριστικά", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "υδροξείδιο του καλίου", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-strong-test-tubes-rack',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_strong_test_tubes_rack.png',
    title: "Ισχυρές Βάσεις σε Στατώ Δοκιμαστικών Σωλήνων (NaOH, KOH, Ba(OH)2)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ισχυρές βάσεις", "NaOH", "KOH", "Ba(OH)2", "πλήρης διάσταση", "ενώσεις", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "υδροξείδιο του καλίου", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-weak-nh3-molecule',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_weak_nh3_molecule.png',
    title: "Ασθενείς Βάσεις — 3D Μοριακό Μοντέλο Αμμωνίας (NH3)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ασθενείς βάσεις", "αμμωνία", "NH3", "μόριο", "μερικός ιοντισμός", "ενώσεις", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-soluble-beaker-stirring',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_soluble_beaker_stirring.png',
    title: "Διαλυτές Βάσεις στο Νερό (NaOH, KOH, Ca(OH)2) — Ποτήρι Ζέσεως με Ράβδο Ανάδευσης",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "διαλυτές βάσεις", "διάλυμα", "ποτήρι ζέσεως", "ανάδευση", "NaOH", "Ca(OH)2", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-insoluble-precipitate-bowl',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_insoluble_precipitate_bowl.png',
    title: "Αδιάλυτες Βάσεις στο Νερό — Υδροξείδιο του Χαλκού Cu(OH)2 & Υδροξείδιο του Σιδήρου Fe(OH)3",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αδιάλυτες βάσεις", "Cu(OH)2", "Fe(OH)3", "ίζημα", "υδροξείδιο χαλκού", "ενώσεις", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-indicators-7tubes-spectrum',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_indicators_7tubes_spectrum.png',
    title: "Χρωματική Κλίμακα Δεικτών σε 7 Δοκιμαστικούς Σωλήνες (Αύξηση Βασικότητας / pH)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δείκτες", "χρώματα δεικτών", "βασικότητα", "δοκιμαστικοί σωλήνες", "κλίμακα pH", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-neutralization-naoh-hcl',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_neutralization_naoh_hcl.png',
    title: "Εξουδετέρωση Βάσης με Οξύ: Βάση (NaOH) + Οξύ (HCl) → Άλας (NaCl) + Νερό (H2O)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "εξουδετέρωση", "NaOH", "HCl", "NaCl", "H2O", "βάση", "οξύ", "άλας", "βάσεις", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "υδροξείδιο του νατρίου", "καυστική σόδα", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-oxide-co2-reaction',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_oxide_co2_reaction.png',
    title: "Αντίδραση Βάσεων με Οξείδια Αμετάλλων: CO2 + Ca(OH)2 → CaCO3↓ + H2O (Θόλωμα Ασβεστόνερου)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αντίδραση με οξείδια", "διοξείδιο του άνθρακα", "CO2", "ασβεστόνερο", "Ca(OH)2", "CaCO3", "ενώσεις", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-uses-icons-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_uses_icons_column.png',
    title: "Εφαρμογές & Χρήσεις των Βάσεων (Καθαριστικά, Αντιόξινα Φάρμακα, Τρόφιμα, Βιομηχανία, Επεξεργασία Νερού)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "χρήσεις βάσεων", "αντιόξινα", "καθαριστικά", "βιομηχανία", "επεξεργασία νερού", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-safety-washing-hands-faucet',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_safety_washing_hands_faucet.png',
    title: "Προφυλάξεις στις Βάσεις — Γυαλιά, Γάντια & Άμεσο Ξέπλυμα με Άφθονο Νερό",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "προφυλάξεις", "ασφάλεια", "ξέπλυμα με νερό", "γάντια", "γυαλιά", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-drain-pipe-siphon',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_drain_pipe_siphon.png',
    title: "Αποφρακτικά Σωλήνων & Σιφωνιών (Υδροξείδιο του Νατρίου / Καυστική Σόδα NaOH)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αποφρακτικό", "σωλήνες", "σιφώνι", "καυστική σόδα", "NaOH", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-liquid-soap-detergent',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_liquid_soap_detergent.png',
    title: "Υγρό Σαπούνι & Απορρυπαντικά (Χρήσεις Βάσεων στην Καθημερινή Υγιεινή)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "υγρό σαπούνι", "απορρυπαντικά", "σαπούνι", "καθαριστικά", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-bases-baking-soda-box',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_bases_baking_soda_box.png',
    title: "Μαγειρική Σόδα (NaHCO3) — Ασθενής Βασική Συμπεριφορά σε Τρόφιμα & Αντιόξινα",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μαγειρική σόδα", "NaHCO3", "σόδα", "αντιόξινο", "τρόφιμα", "βάσεις", "βάση", "ανιόντα υδροξυλίου", "OH-", "πικρή γεύση", "γλιστερή υφή", "σαπούνι", "δείκτες", "μπρομοθυμολομπλέ", "φαινολοφθαλεΐνη", "κλίμακα pH", "pH", "εξουδετέρωση", "υδροξείδιο του νατρίου", "καυστική σόδα", "NaOH", "υδροξείδιο του καλίου", "KOH", "αμμωνία", "NH3", "υδροξείδιο του ασβεστίου", "ασβεστόνερο", "Ca(OH)2", "ενώσεις", "χημικές ενώσεις", "bases", "alkali", "χημεία"],
  },
  {
    id: 'col-premium-salts-hero-nacl-nahco3-caco3-crystals',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_hero_nacl_nahco3_caco3_crystals.png',
    title: "Τα Άλατα στη Ζωή & στη Φύση — Χλωριούχο Νάτριο (NaCl), Μαγειρική Σόδα (NaHCO3), Ασβεστόλιθος (CaCO3) & Κρύσταλλοι",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "άλατα", "χλωριούχο νάτριο", "NaCl", "μαγειρικό αλάτι", "μαγειρική σόδα", "NaHCO3", "ασβεστόλιθος", "CaCO3", "κρύσταλλοι", "άλας", "ιοντικές ενώσεις", "κατιόντα", "ανιόντα", "κρυσταλλικό πλέγμα", "εξουδετέρωση", "ανθρακικό ασβέστιο", "όξινο ανθρακικό νάτριο", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "ίζημα", "διαλυτότητα", "ενώσεις", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-purple-crystal-cluster',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_purple_crystal_cluster.png',
    title: "Κρυσταλλική Δομή Αλάτων — Σύμπλεγμα Ιοντικών Κρυστάλλων",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κρύσταλλοι", "κρυσταλλική δομή", "ιοντικοί κρύσταλλοι", "άλατα", "ενώσεις", "άλας", "ιοντικές ενώσεις", "κατιόντα", "ανιόντα", "κρυσταλλικό πλέγμα", "εξουδετέρωση", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "NaCl", "ανθρακικό ασβέστιο", "ασβεστόλιθος", "CaCO3", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "NaHCO3", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "ίζημα", "διαλυτότητα", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-ionic-neutralization-spheres',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_ionic_neutralization_spheres.png',
    title: "Σχηματισμός Άλατος με Εξουδετέρωση: H+ + Cl- + Na+ + OH- → Na+ + Cl- + H2O",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "σχηματισμός άλατος", "εξουδετέρωση", "κατιόντα", "ανιόντα", "Na+", "Cl-", "NaCl", "ενώσεις", "άλατα", "άλας", "ιοντικές ενώσεις", "κρυσταλλικό πλέγμα", "κρύσταλλοι", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "ανθρακικό ασβέστιο", "ασβεστόλιθος", "CaCO3", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "NaHCO3", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "ίζημα", "διαλυτότητα", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-crystal-lattice-conductivity',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_crystal_lattice_conductivity.png',
    title: "Ιδιότητες Αλάτων — Κρυσταλλικό Πλέγμα Ιόντων & Ηλεκτρική Αγωγιμότητα Υδατικού Διαλύματος",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κρυσταλλικό πλέγμα", "ηλεκτρική αγωγιμότητα", "ηλεκτρολύτης", "ιόντα", "λυχνία", "άλατα", "άλας", "ιοντικές ενώσεις", "κατιόντα", "ανιόντα", "κρύσταλλοι", "εξουδετέρωση", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "NaCl", "ανθρακικό ασβέστιο", "ασβεστόλιθος", "CaCO3", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "NaHCO3", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "ίζημα", "διαλυτότητα", "ενώσεις", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-4crystal-types-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_4crystal_types_column.png',
    title: "Κατηγορίες Αλάτων — Ουδέτερα (NaCl), Όξινα (NaHCO3), Βασικά & Διπλά Άλατα (Στυπτηρία)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κατηγορίες αλάτων", "ουδέτερα άλατα", "όξινα άλατα", "βασικά άλατα", "διπλά άλατα", "στυπτηρία", "άλατα", "άλας", "ιοντικές ενώσεις", "κατιόντα", "ανιόντα", "κρυσταλλικό πλέγμα", "κρύσταλλοι", "εξουδετέρωση", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "NaCl", "ανθρακικό ασβέστιο", "ασβεστόλιθος", "CaCO3", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "NaHCO3", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "ίζημα", "διαλυτότητα", "ενώσεις", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-flame-test-colors-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_flame_test_colors_column.png',
    title: "Πυροχημική Ανίχνευση Μετάλλων — Χρώματα Φλόγας Κατιόντων (Li+, Na+, K+, Ca2+, Ba2+, Cu2+)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "χρώματα φλόγας", "δοκιμή φλόγας", "πυροχημική ανίχνευση", "κατιόντα", "λίθιο", "νάτριο", "κάλιο", "χαλκός", "άλατα", "άλας", "ιοντικές ενώσεις", "ανιόντα", "κρυσταλλικό πλέγμα", "κρύσταλλοι", "εξουδετέρωση", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "NaCl", "ανθρακικό ασβέστιο", "ασβεστόλιθος", "CaCO3", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "NaHCO3", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "ίζημα", "διαλυτότητα", "ενώσεις", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-precipitate-4tubes-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_precipitate_4tubes_column.png',
    title: "Ανίχνευση Ανιόντων & Σχηματισμός Ιζημάτων (AgCl, BaSO4, CO2↑, Ag3PO4)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ανίχνευση ανιόντων", "ίζημα", "καταβύθιση", "AgCl", "BaSO4", "Ag3PO4", "δοκιμαστικοί σωλήνες", "άλατα", "άλας", "ιοντικές ενώσεις", "κατιόντα", "ανιόντα", "κρυσταλλικό πλέγμα", "κρύσταλλοι", "εξουδετέρωση", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "NaCl", "ανθρακικό ασβέστιο", "ασβεστόλιθος", "CaCO3", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "NaHCO3", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "διαλυτότητα", "ενώσεις", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-solubility-beaker',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_solubility_beaker.png',
    title: "Διαλυτότητα Αλάτων στο Νερό — Ευδιάλυτα & Δυσδιάλυτα Άλατα (Ιζήματα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "διαλυτότητα", "ευδιάλυτα άλατα", "δυσδιάλυτα άλατα", "ίζημα", "ποτήρι ζέσεως", "άλατα", "άλας", "ιοντικές ενώσεις", "κατιόντα", "ανιόντα", "κρυσταλλικό πλέγμα", "κρύσταλλοι", "εξουδετέρωση", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "NaCl", "ανθρακικό ασβέστιο", "ασβεστόλιθος", "CaCO3", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "NaHCO3", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "ενώσεις", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-5common-salts-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_5common_salts_column.png',
    title: "Σημαντικά Άλατα: Μαγειρικό Αλάτι (NaCl), Ασβεστόλιθος (CaCO3), Σόδα (NaHCO3), Γαλαζόπετρα (CuSO4·5H2O) & Νιτραλάπι (KNO3)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "σημαντικά άλατα", "NaCl", "CaCO3", "NaHCO3", "CuSO4", "γαλαζόπετρα", "KNO3", "νιτραλάπι", "άλατα", "άλας", "ιοντικές ενώσεις", "κατιόντα", "ανιόντα", "κρυσταλλικό πλέγμα", "κρύσταλλοι", "εξουδετέρωση", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "ανθρακικό ασβέστιο", "ασβεστόλιθος", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "θειικός χαλκός", "νιτρικό κάλιο", "ίζημα", "διαλυτότητα", "ενώσεις", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-nature-sea-rocks-landscape',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_nature_sea_rocks_landscape.png',
    title: "Τα Άλατα στη Φύση — Θαλασσινό Νερό, Αλυκές, Ασβεστολιθικά Πετρώματα & Ορυκτά Κοιτάσματα",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "άλατα στη φύση", "θάλασσα", "αλυκές", "πετρώματα", "ασβεστόλιθος", "ορυκτά", "NaCl", "CaCO3", "άλατα", "άλας", "ιοντικές ενώσεις", "κατιόντα", "ανιόντα", "κρυσταλλικό πλέγμα", "κρύσταλλοι", "εξουδετέρωση", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "ανθρακικό ασβέστιο", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "NaHCO3", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "ίζημα", "διαλυτότητα", "ενώσεις", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-everyday-uses-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_everyday_uses_column.png',
    title: "Χρήσεις Αλάτων — Αλατιέρα, Λιπάσματα Γεωργίας, Βιομηχανία, Ιατρικός Ορός & Καθαρισμός",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "χρήσεις αλάτων", "αλατιέρα", "λιπάσματα", "φυσιολογικός ορός", "βιομηχανία", "άλατα", "άλας", "ιοντικές ενώσεις", "κατιόντα", "ανιόντα", "κρυσταλλικό πλέγμα", "κρύσταλλοι", "εξουδετέρωση", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "NaCl", "ανθρακικό ασβέστιο", "ασβεστόλιθος", "CaCO3", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "NaHCO3", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "ίζημα", "διαλυτότητα", "ενώσεις", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-salts-overview-5icons-row',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_salts_overview_5icons_row.png',
    title: "Οι 5 Βασικοί Τομείς Χρήσης των Αλάτων: Διατροφή, Γεωργία, Βιομηχανία, Ιατρική & Καθημερινή Ζωή",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "διατροφή", "γεωργία", "βιομηχανία", "ιατρική", "καθημερινή ζωή", "χρήσεις αλάτων", "άλατα", "άλας", "ιοντικές ενώσεις", "κατιόντα", "ανιόντα", "κρυσταλλικό πλέγμα", "κρύσταλλοι", "εξουδετέρωση", "χλωριούχο νάτριο", "μαγειρικό αλάτι", "NaCl", "ανθρακικό ασβέστιο", "ασβεστόλιθος", "CaCO3", "όξινο ανθρακικό νάτριο", "μαγειρική σόδα", "NaHCO3", "θειικός χαλκός", "γαλαζόπετρα", "CuSO4", "νιτρικό κάλιο", "KNO3", "ίζημα", "διαλυτότητα", "ενώσεις", "χημικές ενώσεις", "salts", "χημεία"],
  },
  {
    id: 'col-premium-amino-hero-structure-protein-jar',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_hero_structure_protein_jar.png',
    title: "Τα Αμινοξέα & οι Πρωτεΐνες — Γενική Μοριακή Δομή (Αμινομάδα -NH2, Καρβοξυλομάδα -COOH, Ομάδα R)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αμινοξέα", "πρωτεΐνες", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "κεντρικός άνθρακας", "μόριο", "ενώσεις", "αμινοξύ", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "κολλαγόνο", "αιμοσφαιρίνη", "αντισώματα", "ινσουλίνη", "βιομόρια", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-3d-ball-stick-model',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_3d_ball_stick_model.png',
    title: "3D Μοριακό Μοντέλο Αμινοξέος (Σφαιρικό Πρότυπο με Ομάδα R)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "3d μόριο", "αμινοξύ", "μοριακό μοντέλο", "πλευρική ομάδα R", "ενώσεις", "αμινοξέα", "πρωτεΐνες", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "κολλαγόνο", "αιμοσφαιρίνη", "αντισώματα", "ινσουλίνη", "βιομόρια", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-amphoteric-balance-scale',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_amphoteric_balance_scale.png',
    title: "Αμφοτερικός Χαρακτήρας Αμινοξέων & Ζουίτερ Ιόν (Διπολικό Ιόν σε Ουδέτερο pH)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αμφοτερικές ενώσεις", "ζουίτερ ιόν", "διπολικό ιόν", "ισοηλεκτρικό σημείο", "οξύ", "βάση", "αμινοξέα", "αμινοξύ", "πρωτεΐνες", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "κολλαγόνο", "αιμοσφαιρίνη", "αντισώματα", "ινσουλίνη", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-meat-fish-eggs-dairy-jar',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_meat_fish_eggs_dairy_jar.png',
    title: "Πηγές Ουσιωδών (Απαραίτητων) Αμινοξέων στη Διατροφή — Κρέας, Ψάρι, Αυγά, Γάλα & Όσπρια",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ουσιώδη αμινοξέα", "απαραίτητα αμινοξέα", "διατροφή", "πρωτεΐνες", "κρέας", "ψάρι", "αυγό", "γάλα", "αμινοξέα", "αμινοξύ", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "κολλαγόνο", "αιμοσφαιρίνη", "αντισώματα", "ινσουλίνη", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-protein-4-structure-levels',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_protein_4_structure_levels.png',
    title: "Τα 4 Επίπεδα Οργάνωσης & Δομής των Πρωτεϊνών (Πρωτογενής, Δευτερογενής α-Έλικα, Τριτογενής & Τεταρτογενής Δομή)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "επίπεδα δομής πρωτεϊνών", "πρωτογενής δομή", "δευτερογενής δομή", "α-έλικα", "β-πτυχώσεις", "τριτογενής δομή", "τεταρτογενής δομή", "αναδίπλωση πρωτεϊνών", "αμινοξέα", "αμινοξύ", "πρωτεΐνες", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "ένζυμα", "κολλαγόνο", "αιμοσφαιρίνη", "αντισώματα", "ινσουλίνη", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-collagen-bone-structure',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_collagen_bone_structure.png',
    title: "Δομικές Πρωτεΐνες (Κολλαγόνο, Κερατίνη, Ελαστίνη) — Στήριξη & Αντοχή Οστών και Ιστών",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δομικές πρωτεΐνες", "κολλαγόνο", "κερατίνη", "ελαστίνη", "οστό", "στήριξη", "αμινοξέα", "αμινοξύ", "πρωτεΐνες", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "αιμοσφαιρίνη", "αντισώματα", "ινσουλίνη", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-enzyme-substrate-catalysis',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_enzyme_substrate_catalysis.png',
    title: "Καταλυτική Λειτουργία Πρωτεϊνών — Ένζυμο & Υπόστρωμα (E + S → ES → E + P)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ένζυμα", "ένζυμο", "υπόστρωμα", "ενεργό κέντρο", "βιοκαταλύτες", "κατάλυση", "enzyme", "αμινοξέα", "αμινοξύ", "πρωτεΐνες", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "κολλαγόνο", "αιμοσφαιρίνη", "αντισώματα", "ινσουλίνη", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-hemoglobin-red-blood-cell',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_hemoglobin_red_blood_cell.png',
    title: "Μεταφορική Λειτουργία Πρωτεϊνών — Αιμοσφαιρίνη στα Ερυθρά Αιμοσφαίρια (Μεταφορά Οξυγόνου O2)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αιμοσφαιρίνη", "ερυθρά αιμοσφαίρια", "μεταφορά οξυγόνου", "μεταφορικές πρωτεΐνες", "αμινοξέα", "αμινοξύ", "πρωτεΐνες", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "κολλαγόνο", "αντισώματα", "ινσουλίνη", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-antibodies-immune-defense',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_antibodies_immune_defense.png',
    title: "Αμυντική Λειτουργία Πρωτεϊνών — Αντισώματα (Ανοσοσφαιρίνες) κατά Παθογόνων Μικροοργανισμών",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αντισώματα", "ανοσία", "αμυντικές πρωτεΐνες", "αντιγόνο", "ανοσοποιητικό", "αμινοξέα", "αμινοξύ", "πρωτεΐνες", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "κολλαγόνο", "αιμοσφαιρίνη", "ινσουλίνη", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-hormones-insulin-key',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_hormones_insulin_key.png',
    title: "Ρυθμιστική Λειτουργία Πρωτεϊνών — Πεπτιδικές Ορμόνες (π.χ. Ινσουλίνη)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ορμόνες", "ινσουλίνη", "ρυθμιστικές πρωτεΐνες", "υποδοχέας", "ομοιόσταση", "αμινοξέα", "αμινοξύ", "πρωτεΐνες", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "κολλαγόνο", "αιμοσφαιρίνη", "αντισώματα", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-protein-foods-4groups',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_protein_foods_4groups.png',
    title: "Τροφές Πλούσιες σε Πρωτεΐνες & Αμινοξέα (Κρέας/Αυγά, Γαλακτοκομικά, Όσπρια/Ξηροί Καρποί, Σόγια)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "πρωτεϊνούχες τροφές", "κρέας", "αυγά", "γαλακτοκομικά", "όσπρια", "ξηροί καρποί", "σόγια", "αμινοξέα", "αμινοξύ", "πρωτεΐνες", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "κολλαγόνο", "αιμοσφαιρίνη", "αντισώματα", "ινσουλίνη", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-deficiency-tired-boy',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_deficiency_tired_boy.png',
    title: "Έλλειψη Απαραίτητων Αμινοξέων — Κόπωση, Μυϊκή Αδυναμία & Μειωμένη Άμυνα",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "έλλειψη αμινοξέων", "υποθρεψία", "μυϊκή αδυναμία", "κόπωση", "ατονία", "αμινοξέα", "αμινοξύ", "πρωτεΐνες", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "κολλαγόνο", "αιμοσφαιρίνη", "αντισώματα", "ινσουλίνη", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-amino-strong-bicep-arm',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_amino_strong_bicep_arm.png',
    title: "Μυϊκή Ανάπτυξη & Δύναμη μέσω Πρωτεϊνών (Ακτίνη & Μυοσίνη)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μυϊκός ιστός", "μύες", "ακτίνη", "μυοσίνη", "πρωτεΐνες", "αμινοξέα", "αμινοξύ", "πρωτεΐνη", "πεπτιδικός δεσμός", "πολυπεπτιδική αλυσίδα", "αμινομάδα", "καρβοξυλομάδα", "πλευρική ομάδα R", "ζουίτερ ιόν", "διπολικό ιόν", "αμφοτερικές ενώσεις", "ουσιώδη αμινοξέα", "πρωτογενής δομή", "δευτερογενής δομή", "τριτογενής δομή", "τεταρτογενής δομή", "ένζυμα", "κολλαγόνο", "αιμοσφαιρίνη", "αντισώματα", "ινσουλίνη", "βιομόρια", "ενώσεις", "οργανικές ενώσεις", "amino acids", "proteins", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-hero-chemical-structure',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_hero_chemical_structure.png',
    title: "Το Νουκλεοτίδιο — Χημική Δομή (Αζωτούχα Βάση, Σάκχαρο Πεντόζη & Φωσφορική Ομάδα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "νουκλεοτίδιο", "χημική δομή", "αζωτούχα βάση", "πεντόζη", "φωσφορική ομάδα", "μόριο", "ενώσεις", "νουκλεοτίδια", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "DNA", "RNA", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφοδιεστερικός δεσμός", "ATP", "γενετικό υλικό", "βιομόρια", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-3puzzle-pieces',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_3puzzle_pieces.png',
    title: "Τα 3 Δομικά Μέρη του Νουκλεοτιδίου (Σύνδεση σαν Κομμάτια Παζλ)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δομικά μέρη νουκλεοτιδίου", "μονομερή", "νουκλεοτίδια", "παζλ", "νουκλεοτίδιο", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "DNA", "RNA", "αζωτούχα βάση", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "πεντόζη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφορική ομάδα", "φωσφοδιεστερικός δεσμός", "ATP", "γενετικό υλικό", "βιομόρια", "μόριο", "ενώσεις", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-3parts-decomposition',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_3parts_decomposition.png',
    title: "Ανάλυση των 3 Μερών ενός Νουκλεοτιδίου: Αζωτούχα Βάση + Σάκχαρο Πεντόζης + Φωσφορική Ομάδα",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αζωτούχα βάση", "σάκχαρο πεντόζης", "φωσφορική ομάδα", "σύνθεση νουκλεοτιδίου", "ενώσεις", "νουκλεοτίδια", "νουκλεοτίδιο", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "DNA", "RNA", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "πεντόζη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφοδιεστερικός δεσμός", "ATP", "γενετικό υλικό", "βιομόρια", "μόριο", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-purines-pyrimidines-5bases',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_purines_pyrimidines_5bases.png',
    title: "Οι 5 Αζωτούχες Βάσεις: Πουρίνες (Αδενίνη A, Γουανίνη G) & Πυριμιδίνες (Κυτοσίνη C, Θυμίνη T, Ουρακίλη U)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "A G C T U", "ενώσεις", "νουκλεοτίδια", "νουκλεοτίδιο", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "DNA", "RNA", "αζωτούχα βάση", "πεντόζη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφορική ομάδα", "φωσφοδιεστερικός δεσμός", "ATP", "γενετικό υλικό", "βιομόρια", "μόριο", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-ribose-deoxyribose-pair',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_ribose_deoxyribose_pair.png',
    title: "Τα Σάκχαρα Πεντόζης: Ριβόζη (στο RNA με -OH στον 2' C) vs Δεοξυριβόζη (στο DNA με -H στον 2' C)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ριβόζη", "δεοξυριβόζη", "πεντόζη", "σάκχαρο", "RNA", "DNA", "2' άνθρακας", "ενώσεις", "νουκλεοτίδια", "νουκλεοτίδιο", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "αζωτούχα βάση", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "φωσφορική ομάδα", "φωσφοδιεστερικός δεσμός", "ATP", "γενετικό υλικό", "βιομόρια", "μόριο", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-rna-dna-8examples',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_rna_dna_8examples.png',
    title: "Ριβονουκλεοτίδια RNA (AMP, GMP, CMP, UMP) & Δεοξυριβονουκλεοτίδια DNA (dAMP, dGMP, dCMP, dTMP)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ριβονουκλεοτίδια", "δεοξυριβονουκλεοτίδια", "AMP", "GMP", "CMP", "UMP", "dAMP", "dGMP", "dCMP", "dTMP", "ενώσεις", "νουκλεοτίδια", "νουκλεοτίδιο", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "DNA", "RNA", "αζωτούχα βάση", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "πεντόζη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφορική ομάδα", "φωσφοδιεστερικός δεσμός", "ATP", "γενετικό υλικό", "βιομόρια", "μόριο", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-phosphodiester-chain-3-5',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_phosphodiester_chain_3_5.png',
    title: "Σύνδεση Νουκλεοτιδίων με 3'-5' Φωσφοδιεστερικό Δεσμό & Πολυμερική Αλυσίδα (5' → 3')",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "3'-5' φωσφοδιεστερικός δεσμός", "φωσφοδιεστερικός δεσμός", "πολυριβονουκλεοτιδική αλυσίδα", "5' άκρο", "3' άκρο", "πολυμερισμός", "νουκλεοτίδια", "νουκλεοτίδιο", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "DNA", "RNA", "αζωτούχα βάση", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "πεντόζη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφορική ομάδα", "ATP", "γενετικό υλικό", "βιομόρια", "μόριο", "ενώσεις", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-vs-nucleoside-comparison',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_vs_nucleoside_comparison.png',
    title: "Σύγκριση: Νουκλεοτίδιο (με Φωσφορική Ομάδα) vs Νουκλεοσίδιο (Αζωτούχα Βάση + Πεντόζη)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "νουκλεοτίδιο", "νουκλεοσίδιο", "φωσφορική ομάδα", "σύγκριση", "ενώσεις", "νουκλεοτίδια", "νουκλεϊκά οξέα", "DNA", "RNA", "αζωτούχα βάση", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "πεντόζη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφοδιεστερικός δεσμός", "ATP", "γενετικό υλικό", "βιομόρια", "μόριο", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-dna-rna-atp-icons',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_dna_rna_atp_icons.png',
    title: "Ρόλος των Νουκλεοτιδίων — Διπλή Έλικα DNA, Μονόκλωνο RNA & Ενεργειακό Νόμισμα ATP",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "διπλή έλικα DNA", "μονόκλωνο RNA", "ATP", "τριφωσφορική αδενοσίνη", "ενέργεια κυττάρου", "cAMP", "νουκλεοτίδια", "νουκλεοτίδιο", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "DNA", "RNA", "αζωτούχα βάση", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "πεντόζη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφορική ομάδα", "φωσφοδιεστερικός δεσμός", "γενετικό υλικό", "βιομόρια", "μόριο", "ενώσεις", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-eukaryotic-cell-dna-rna-atp',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_eukaryotic_cell_dna_rna_atp.png',
    title: "Ευκαρυωτικό Κύτταρο — Εντοπισμός DNA (στον Πυρήνα), RNA (Πυρήνας & Κυτταρόπλασμα) & ATP (Μιτοχόνδρια)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ευκαρυωτικό κύτταρο", "κύτταρο", "πυρήνας", "μιτοχόνδριο", "κυτταρόπλασμα", "DNA", "RNA", "ATP", "νουκλεοτίδια", "νουκλεοτίδιο", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "αζωτούχα βάση", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "πεντόζη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφορική ομάδα", "φωσφοδιεστερικός δεσμός", "γενετικό υλικό", "βιομόρια", "μόριο", "ενώσεις", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-food-atp-pharma-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_food_atp_pharma_column.png',
    title: "Τα Νουκλεοτίδια στη Ζωή μας — Τροφές, Κυτταρική Ενέργεια (ATP) & Βιοτεχνολογία",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "τρόφιμα", "μπαταρία ATP", "ενέργεια", "φάρμακα", "εμβόλια", "νουκλεοτίδια", "νουκλεοτίδιο", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "DNA", "RNA", "αζωτούχα βάση", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "πεντόζη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφορική ομάδα", "φωσφοδιεστερικός δεσμός", "ATP", "γενετικό υλικό", "βιομόρια", "μόριο", "ενώσεις", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-nucleotide-pill-vaccine-vial',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_nucleotide_pill_vaccine_vial.png',
    title: "Νουκλεοτίδια & mRNA στη Φαρμακευτική, στη Βιοτεχνολογία & στα Εμβόλια",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "εμβόλια", "mRNA", "φάρμακα", "βιοτεχνολογία", "νουκλεοτίδια", "νουκλεοτίδιο", "νουκλεοσίδιο", "νουκλεϊκά οξέα", "DNA", "RNA", "αζωτούχα βάση", "αζωτούχες βάσεις", "πουρίνες", "πυριμιδίνες", "αδενίνη", "γουανίνη", "κυτοσίνη", "θυμίνη", "ουρακίλη", "πεντόζη", "σάκχαρο", "ριβόζη", "δεοξυριβόζη", "φωσφορική ομάδα", "φωσφοδιεστερικός δεσμός", "ATP", "γενετικό υλικό", "βιομόρια", "μόριο", "ενώσεις", "οργανικές ενώσεις", "nucleotides", "βιολογία", "χημεία"],
  },
  {
    id: 'col-premium-cell-scientists-hooke-schleiden-schwann-virchow',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_scientists_hooke_schleiden_schwann_virchow.png',
    title: "Ανακάλυψη του Κυττάρου & Κυτταρική Θεωρία — Ρόμπερτ Χουκ (1665), Σλάιντεν (1838), Σβαν (1839) & Βίρχοφ (1855)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ανακάλυψη κυττάρου", "ρόμπερτ χουκ", "σλάιντεν", "σβαν", "βίρχοφ", "hooke", "schleiden", "schwann", "virchow", "κύτταρο", "κυτταρική θεωρία", "προκαρυωτικό κύτταρο", "ευκαρυωτικό κύτταρο", "φυτικό κύτταρο", "ζωικό κύτταρο", "κυτταρικά οργανίδια", "πυρήνας", "μιτοχόνδριο", "ριβοσώματα", "ενδοπλασματικό δίκτυο", "σύμπλεγμα Golgi", "λυσοσώματα", "χυμοτόπιο", "χλωροπλάστης", "κυτταρικό τείχος", "πλασματική μεμβράνη", "κυτταρόπλασμα", "μικροσκόπιο", "cell", "organelles", "βιολογία"],
  },
  {
    id: 'col-premium-cell-prokaryotic-vs-eukaryotic',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_prokaryotic_vs_eukaryotic.png',
    title: "Σύγκριση Κυττάρων: Προκαρυωτικό Κύτταρο (Βακτήριο) vs Ευκαρυωτικό Κύτταρο",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "προκαρυωτικό κύτταρο", "ευκαρυωτικό κύτταρο", "βακτήριο", "νουκλεοειδές", "μαστίγιο", "πυρήνας", "κύτταρο", "κυτταρική θεωρία", "φυτικό κύτταρο", "ζωικό κύτταρο", "κυτταρικά οργανίδια", "μιτοχόνδριο", "ριβοσώματα", "ενδοπλασματικό δίκτυο", "σύμπλεγμα Golgi", "λυσοσώματα", "χυμοτόπιο", "χλωροπλάστης", "κυτταρικό τείχος", "πλασματική μεμβράνη", "κυτταρόπλασμα", "μικροσκόπιο", "cell", "organelles", "βιολογία"],
  },
  {
    id: 'col-premium-cell-theory-3circles',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_theory_3circles.png',
    title: "Οι 3 Θεμελιώδεις Αρχές της Κυτταρικής Θεωρίας (Δομική Μονάδα & Κυτταρική Διαίρεση)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κυτταρική θεωρία", "κυτταρική διαίρεση", "προϋπάρχον κύτταρο", "ζωντανοί οργανισμοί", "κύτταρο", "προκαρυωτικό κύτταρο", "ευκαρυωτικό κύτταρο", "φυτικό κύτταρο", "ζωικό κύτταρο", "κυτταρικά οργανίδια", "πυρήνας", "μιτοχόνδριο", "ριβοσώματα", "ενδοπλασματικό δίκτυο", "σύμπλεγμα Golgi", "λυσοσώματα", "χυμοτόπιο", "χλωροπλάστης", "κυτταρικό τείχος", "πλασματική μεμβράνη", "κυτταρόπλασμα", "μικροσκόπιο", "cell", "organelles", "βιολογία"],
  },
  {
    id: 'col-premium-cell-plant-eukaryotic-labeled',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_plant_eukaryotic_labeled.png',
    title: "Φυτικό Ευκαρυωτικό Κύτταρο (Πλήρες Διάγραμμα με Ονομασίες Οργανιδίων)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φυτικό κύτταρο", "κυτταρικό τείχος", "χλωροπλάστης", "χυμοτόπιο", "πυρήνας", "μιτοχόνδριο", "golgi", "πλασμοδέσματα", "κύτταρο", "κυτταρική θεωρία", "προκαρυωτικό κύτταρο", "ευκαρυωτικό κύτταρο", "ζωικό κύτταρο", "κυτταρικά οργανίδια", "ριβοσώματα", "ενδοπλασματικό δίκτυο", "σύμπλεγμα Golgi", "λυσοσώματα", "πλασματική μεμβράνη", "κυτταρόπλασμα", "μικροσκόπιο", "cell", "organelles", "βιολογία"],
  },
  {
    id: 'col-premium-cell-plant-eukaryotic-isolated',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_plant_eukaryotic_isolated.png',
    title: "Φυτικό Ευκαρυωτικό Κύτταρο (Υψηλής Ανάλυσης Τομή χωρίς Ετικέτες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φυτικό κύτταρο", "χλωροπλάστης", "χυμοτόπιο", "κυτταρικό τείχος", "ευκαρυωτικό", "κύτταρο", "κυτταρική θεωρία", "προκαρυωτικό κύτταρο", "ευκαρυωτικό κύτταρο", "ζωικό κύτταρο", "κυτταρικά οργανίδια", "πυρήνας", "μιτοχόνδριο", "ριβοσώματα", "ενδοπλασματικό δίκτυο", "σύμπλεγμα Golgi", "λυσοσώματα", "πλασματική μεμβράνη", "κυτταρόπλασμα", "μικροσκόπιο", "cell", "organelles", "βιολογία"],
  },
  {
    id: 'col-premium-cell-organelles-8icons-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_organelles_8icons_column.png',
    title: "Τα 8 Κυτταρικά Οργανίδια (Πυρήνας, Μιτοχόνδριο, Ριβοσώματα, ΕΔ, Golgi, Λυσοσώματα, Χυμοτόπιο, Χλωροπλάστης)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κυτταρικά οργανίδια", "πυρήνας", "μιτοχόνδριο", "ριβοσώματα", "ενδοπλασματικό δίκτυο", "golgi", "λυσοσώματα", "χλωροπλάστης", "κύτταρο", "κυτταρική θεωρία", "προκαρυωτικό κύτταρο", "ευκαρυωτικό κύτταρο", "φυτικό κύτταρο", "ζωικό κύτταρο", "σύμπλεγμα Golgi", "χυμοτόπιο", "κυτταρικό τείχος", "πλασματική μεμβράνη", "κυτταρόπλασμα", "μικροσκόπιο", "cell", "organelles", "βιολογία"],
  },
  {
    id: 'col-premium-cell-animal-eukaryotic-labeled',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_animal_eukaryotic_labeled.png',
    title: "Ζωικό Ευκαρυωτικό Κύτταρο (Πλήρες Διάγραμμα με Ονομασίες Οργανιδίων)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ζωικό κύτταρο", "κυτταρική μεμβράνη", "πυρήνας", "πυρηνίσκος", "μιτοχόνδριο", "κεντριόλια", "λυσοσώματα", "golgi", "κύτταρο", "κυτταρική θεωρία", "προκαρυωτικό κύτταρο", "ευκαρυωτικό κύτταρο", "φυτικό κύτταρο", "κυτταρικά οργανίδια", "ριβοσώματα", "ενδοπλασματικό δίκτυο", "σύμπλεγμα Golgi", "χυμοτόπιο", "χλωροπλάστης", "κυτταρικό τείχος", "πλασματική μεμβράνη", "κυτταρόπλασμα", "μικροσκόπιο", "cell", "organelles", "βιολογία"],
  },
  {
    id: 'col-premium-cell-animal-eukaryotic-isolated',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_animal_eukaryotic_isolated.png',
    title: "Ζωικό Ευκαρυωτικό Κύτταρο (Υψηλής Ανάλυσης Τομή χωρίς Ετικέτες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ζωικό κύτταρο", "ευκαρυωτικό κύτταρο", "πυρήνας", "μιτοχόνδριο", "οργανίδια", "κύτταρο", "κυτταρική θεωρία", "προκαρυωτικό κύτταρο", "φυτικό κύτταρο", "κυτταρικά οργανίδια", "ριβοσώματα", "ενδοπλασματικό δίκτυο", "σύμπλεγμα Golgi", "λυσοσώματα", "χυμοτόπιο", "χλωροπλάστης", "κυτταρικό τείχος", "πλασματική μεμβράνη", "κυτταρόπλασμα", "μικροσκόπιο", "cell", "organelles", "βιολογία"],
  },
  {
    id: 'col-premium-cell-size-comparison-1-10-100um',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_size_comparison_1_10_100um.png',
    title: "Σύγκριση Μεγέθους Κυττάρων: Προκαρυωτικά (1–10 μm) vs Ευκαρυωτικά Κύτταρα (10–100 μm)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μέγεθος κυττάρων", "μικρόμετρο", "μm", "προκαρυωτικό", "ευκαρυωτικό", "κύτταρο", "κυτταρική θεωρία", "προκαρυωτικό κύτταρο", "ευκαρυωτικό κύτταρο", "φυτικό κύτταρο", "ζωικό κύτταρο", "κυτταρικά οργανίδια", "πυρήνας", "μιτοχόνδριο", "ριβοσώματα", "ενδοπλασματικό δίκτυο", "σύμπλεγμα Golgi", "λυσοσώματα", "χυμοτόπιο", "χλωροπλάστης", "κυτταρικό τείχος", "πλασματική μεμβράνη", "κυτταρόπλασμα", "μικροσκόπιο", "cell", "organelles", "βιολογία"],
  },
  {
    id: 'col-premium-cell-optical-microscope',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_optical_microscope.png',
    title: "Οπτικό Μικροσκόπιο Εργαστηρίου Βιολογίας",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "οπτικό μικροσκόπιο", "μικροσκόπιο", "παρατήρηση κυττάρων", "εργαστήριο", "κύτταρο", "κυτταρική θεωρία", "προκαρυωτικό κύτταρο", "ευκαρυωτικό κύτταρο", "φυτικό κύτταρο", "ζωικό κύτταρο", "κυτταρικά οργανίδια", "πυρήνας", "μιτοχόνδριο", "ριβοσώματα", "ενδοπλασματικό δίκτυο", "σύμπλεγμα Golgi", "λυσοσώματα", "χυμοτόπιο", "χλωροπλάστης", "κυτταρικό τείχος", "πλασματική μεμβράνη", "κυτταρόπλασμα", "cell", "organelles", "βιολογία"],
  },
  {
    id: 'col-premium-cell-motor-neuron-1meter',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_motor_neuron_1meter.png',
    title: "Νευρικό Κύτταρο (Νευρώνας με Δενδρίτες, Κυτταρικό Σώμα & Νευράξονα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "νευρικό κύτταρο", "νευρώνας", "δενδρίτες", "νευράξονας", "έλυτρο μυελίνης", "νευρικό σύστημα", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-diff-pathway-4stages',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_diff_pathway_4stages.png',
    title: "Η Πορεία της Κυτταρικής Διαφοροποίησης (Αρχέγονο Βλαστικό Κύτταρο → Πολλαπλασιασμός → Δέσμευση → Εξειδικευμένο Κύτταρο)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κυτταρική διαφοροποίηση", "διαφοροποίηση", "αρχέγονο κύτταρο", "βλαστικό κύτταρο", "εξειδικευμένο κύτταρο", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-diff-dna-double-helix-gene-expression',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_diff_dna_double_helix_gene_expression.png',
    title: "Διπλή Έλικα DNA & Επιλεκτική Έκφραση Γονιδίων στη Διαφοροποίηση",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "διπλή έλικα DNA", "DNA", "έκφραση γονιδίων", "γονίδια", "διαφοροποίηση", "ενώσεις", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-diff-stem-cells-5types-diagram',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_diff_stem_cells_5types_diagram.png',
    title: "Βλαστικά Κύτταρα & Διαφοροποίηση σε Νευρικό, Μυϊκό, Επιθηλιακό, Αιμοσφαίριο & Οστικό Κύτταρο",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "βλαστικά κύτταρα", "εμβρυϊκά βλαστικά κύτταρα", "νευρικό κύτταρο", "μυϊκό κύτταρο", "επιθηλιακό κύτταρο", "αιμοσφαίριο", "οστικό κύτταρο", "διαφοροποίηση", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "κόκαλο", "κόκαλα", "οστό", "σκελετός", "ανθρώπινος σκελετός", "κρανίο", "σπονδυλική στήλη", "σπόνδυλος", "θωρακικός κλωβός", "θώρακας", "πλευρές", "παΐδια", "στέρνο", "κλείδα", "ωμοπλάτη", "βραχιόνιο", "κερκίδα", "ωλένη", "λεκάνη", "πύελος", "μηριαίο οστό", "επιγονατίδα", "κνήμη", "περόνη", "άρθρωση", "μυελός των οστών"],
  },
  {
    id: 'col-premium-diff-epithelial-cells-layer',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_diff_epithelial_cells_layer.png',
    title: "Επιθηλιακά Κύτταρα — Πυκνή Διάταξη πάνω σε Βασική Μεμβράνη",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "επιθηλιακά κύτταρα", "επιθηλιακός ιστός", "βασική μεμβράνη", "επιδερμίδα", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-diff-connective-cells-osteocyte-adipocyte-fibroblast',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_diff_connective_cells_osteocyte_adipocyte_fibroblast.png',
    title: "Συνδετικά Κύτταρα: Οστικό Κύτταρο (Οστεοκύτταρο), Λιποκύτταρο & Ινοβλάστης",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "συνδετικά κύτταρα", "οστικό κύτταρο", "οστεοκύτταρο", "λιποκύτταρο", "ινοβλάστης", "συνδετικός ιστός", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "κόκαλο", "κόκαλα", "οστό", "σκελετός", "ανθρώπινος σκελετός", "κρανίο", "σπονδυλική στήλη", "σπόνδυλος", "θωρακικός κλωβός", "θώρακας", "πλευρές", "παΐδια", "στέρνο", "κλείδα", "ωμοπλάτη", "βραχιόνιο", "κερκίδα", "ωλένη", "λεκάνη", "πύελος", "μηριαίο οστό", "επιγονατίδα", "κνήμη", "περόνη", "άρθρωση", "μυελός των οστών"],
  },
  {
    id: 'col-premium-diff-muscle-cells-3types',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_diff_muscle_cells_3types.png',
    title: "Τα 3 Είδη Μυϊκών Κυττάρων (Σκελετικά Γραμμωτά, Καρδιακά & Λεία Μυϊκά Κύτταρα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μυϊκά κύτταρα", "μυϊκές ίνες", "σκελετικά μυϊκά κύτταρα", "καρδιακά μυϊκά κύτταρα", "λεία μυϊκά κύτταρα", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-diff-nerve-cells-neuron-glia',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_diff_nerve_cells_neuron_glia.png',
    title: "Νευρικά Κύτταρα — Νευρώνας (Δενδρίτες, Άξονας) & Κύτταρα Νευρογλοίας",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "νευρικά κύτταρα", "νευρώνας", "νευρογλοιακά κύτταρα", "κύτταρα γλοίας", "νευρικές ώσεις", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-diff-blood-cells-rbc-wbc-platelets',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_diff_blood_cells_rbc_wbc_platelets.png',
    title: "Αιμοποιητικά Κύτταρα Αίματος: Ερυθρά Αιμοσφαίρια, Λευκά Αιμοσφαίρια & Αιμοπετάλια",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αιμοποιητικά κύτταρα", "κύτταρα αίματος", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "πήξη αίματος", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "αιμοφόρα αγγεία", "αγγεία", "αρτηρία", "αρτηρίες", "φλέβα", "φλέβες", "τριχοειδή αγγεία", "αορτή", "άνω κοίλη φλέβα", "κάτω κοίλη φλέβα", "πνευμονική αρτηρία", "πνευμονική φλέβα", "κυκλοφορικό σύστημα", "αίμα"],
  },
  {
    id: 'col-premium-diff-stem-cell-summary-tree',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_diff_stem_cell_summary_tree.png',
    title: "Δέντρο Κυτταρικής Διαφοροποίησης από Αρχέγονο Κύτταρο στις Κύριες Ομάδες Κυττάρων",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δέντρο διαφοροποίησης", "αρχέγονο κύτταρο", "ομάδες κυττάρων", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-diff-embryo-fetus-development',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_diff_embryo_fetus_development.png',
    title: "Εμβρυϊκή Ανάπτυξη του Ανθρώπου από Αρχέγονα Βλαστικά Κύτταρα",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "έμβρυο", "εμβρυϊκή ανάπτυξη", "κύηση", "μήτρα", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-tissues-cell-division-cluster',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_cell_division_cluster.png',
    title: "Σχηματισμός Ιστού από Ομάδα Κυττάρων με Παρόμοια Δομή και Λειτουργία",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "σχηματισμός ιστού", "ιστός", "ομάδα κυττάρων", "μεσοκυττάρια ουσία", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-tissues-human-body-4tissues-overview',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_human_body_4tissues_overview.png',
    title: "Οι 4 Βασικοί Τύποι Ιστών στον Άνθρωπο (Επιθηλιακός, Συνδετικός, Μυϊκός & Νευρικός Ιστός)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "τέσσερις βασικοί ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "κόκαλο", "κόκαλα", "οστό", "σκελετός", "ανθρώπινος σκελετός", "κρανίο", "σπονδυλική στήλη", "σπόνδυλος", "θωρακικός κλωβός", "θώρακας", "πλευρές", "παΐδια", "στέρνο", "κλείδα", "ωμοπλάτη", "βραχιόνιο", "κερκίδα", "ωλένη", "λεκάνη", "πύελος", "μηριαίο οστό", "επιγονατίδα", "κνήμη", "περόνη", "άρθρωση", "μυελός των οστών"],
  },
  {
    id: 'col-premium-tissues-epithelial-structure',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_epithelial_structure.png',
    title: "Επιθηλιακός Ιστός — Δομή Κυττάρων, Πολικότητα & Βασική Μεμβράνη",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "επιθηλιακός ιστός", "επιθήλιο", "βασική μεμβράνη", "προστασία", "απορρόφηση", "έκκριση", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-tissues-exocrine-gland',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_exocrine_gland.png',
    title: "Εξωκρινής Αδένας (Ιδρωτοποιός / Σιελογόνος Αδένας από Αδενικό Επιθήλιο)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αδένας", "αδένες", "εξωκρινής αδένας", "σιελογόνος αδένας", "ιδρωτοποιός αδένας", "επιθηλιακός ιστός", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-tissues-connective-fibers-matrix',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_connective_fibers_matrix.png',
    title: "Συνδετικός Ιστός — Διάσπαρτα Κύτταρα, Θεμέλια Μεσοκυττάρια Ουσία & Ινίδια Κολλαγόνου/Ελαστίνης",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "συνδετικός ιστός", "μεσοκυττάρια ουσία", "θεμέλια ουσία", "κολλαγόνο", "ελαστίνη", "ινοβλάστες", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-tissues-connective-bone-blood-fat',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_connective_bone_blood_fat.png',
    title: "Είδη Συνδετικού Ιστού: Οστίτης Ιστός (Οστό), Αίμα & Λιπώδης Ιστός",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "οστίτης ιστός", "οστό", "αίμα", "λιπώδης ιστός", "χόνδρινος ιστός", "συνδετικός ιστός", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "κόκαλο", "κόκαλα", "σκελετός", "ανθρώπινος σκελετός", "κρανίο", "σπονδυλική στήλη", "σπόνδυλος", "θωρακικός κλωβός", "θώρακας", "πλευρές", "παΐδια", "στέρνο", "κλείδα", "ωμοπλάτη", "βραχιόνιο", "κερκίδα", "ωλένη", "λεκάνη", "πύελος", "μηριαίο οστό", "επιγονατίδα", "κνήμη", "περόνη", "άρθρωση", "μυελός των οστών", "αιμοφόρα αγγεία", "αγγεία", "αρτηρία", "αρτηρίες", "φλέβα", "φλέβες", "τριχοειδή αγγεία", "αορτή", "άνω κοίλη φλέβα", "κάτω κοίλη φλέβα", "πνευμονική αρτηρία", "πνευμονική φλέβα", "κυκλοφορικό σύστημα"],
  },
  {
    id: 'col-premium-tissues-muscle-striated-smooth-cardiac',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_muscle_striated_smooth_cardiac.png',
    title: "Μυϊκός Ιστός: 1. Γραμμωτός Σκελετικός (Εκούσιος), 2. Λείος (Ακούσιος) & 3. Καρδιακός Μυϊκός Ιστός (Μυοκάρδιο)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μυϊκός ιστός", "γραμμωτός μυϊκός ιστός", "λείος μυϊκός ιστός", "καρδιακός μυϊκός ιστός", "μυοκάρδιο", "μυϊκές ίνες", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-tissues-nervous-neuron-synapse',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_nervous_neuron_synapse.png',
    title: "Νευρικός Ιστός — Νευρώνας & Νευρογλοιακά Κύτταρα (Διεγερσιμότητα & Αγωγιμότητα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "νευρικός ιστός", "νευρώνας", "νευρογλοιακά κύτταρα", "διεγερσιμότητα", "αγωγιμότητα", "ερεθίσματα", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-tissues-brain-spinal-cord-organ',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_brain_spinal_cord_organ.png',
    title: "Εγκέφαλος (Κεντρικό Νευρικό Σύστημα & Νευρικός Ιστός)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "εγκέφαλος", "κεντρικό νευρικό σύστημα", "ημισφαίρια", "παρεγκεφαλίδα", "νευρικός ιστός", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-tissues-hierarchy-cell-to-organism',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_hierarchy_cell_to_organism.png',
    title: "Η Ιεραρχία της Βιολογικής Οργάνωσης: Κύτταρο → Ιστός → Όργανο → Σύστημα Οργάνων → Οργανισμός",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ιεραρχία οργάνωσης", "επίπεδα οργάνωσης", "κύτταρο", "ιστός", "όργανο", "σύστημα οργάνων", "οργανισμός", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-tissues-skin-regeneration-vs-neuron',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_tissues_skin_regeneration_vs_neuron.png',
    title: "Ικανότητα Αναγέννησης Ιστών: Διαρκής Ανανέωση Επιδερμίδας vs Περιορισμένη Αναγέννηση Νευρώνων",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αναγέννηση ιστών", "ανανέωση δέρματος", "επιδερμίδα", "νευρώνες", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organs-tissues-to-stomach-diagram',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_tissues_to_stomach_diagram.png',
    title: "Σχηματισμός Οργάνου (Στομάχι) από τη Συνεργασία και των 4 Τύπων Ιστών",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "σχηματισμός οργάνου", "διάφοροι ιστοί", "όργανο", "στομάχι", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανα", "καρδιά", "πνεύμονες", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organs-8examples-collection',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_8examples_collection.png',
    title: "Συλλογή Οργάνων του Ανθρώπινου Σώματος (Καρδιά, Πνεύμονες, Στομάχι, Ήπαρ, Νεφρά, Εγκέφαλος, Μάτι, Οστό)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "όργανα του ανθρώπου", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "μάτι", "οστό", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "δέρμα", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "κόκαλο", "κόκαλα", "σκελετός", "ανθρώπινος σκελετός", "κρανίο", "σπονδυλική στήλη", "σπόνδυλος", "θωρακικός κλωβός", "θώρακας", "πλευρές", "παΐδια", "στέρνο", "κλείδα", "ωμοπλάτη", "βραχιόνιο", "κερκίδα", "ωλένη", "λεκάνη", "πύελος", "μηριαίο οστό", "επιγονατίδα", "κνήμη", "περόνη", "άρθρωση", "μυελός των οστών", "αιμοφόρα αγγεία", "αγγεία", "αρτηρία", "αρτηρίες", "φλέβα", "φλέβες", "τριχοειδή αγγεία", "αορτή", "άνω κοίλη φλέβα", "κάτω κοίλη φλέβα", "πνευμονική αρτηρία", "πνευμονική φλέβα", "κυκλοφορικό σύστημα", "αίμα"],
  },
  {
    id: 'col-premium-organs-heart-anatomy',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_heart_anatomy.png',
    title: "Καρδιά — Μυώδες Όργανο Άντλησης Αίματος με Αορτή, Κοίλες Φλέβες & Πνευμονικά Αγγεία",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "καρδιά", "μυοκάρδιο", "κόλποι", "κοιλίες", "αορτή", "άντληση αίματος", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "αιμοφόρα αγγεία", "αγγεία", "αρτηρία", "αρτηρίες", "φλέβα", "φλέβες", "τριχοειδή αγγεία", "άνω κοίλη φλέβα", "κάτω κοίλη φλέβα", "πνευμονική αρτηρία", "πνευμονική φλέβα", "κυκλοφορικό σύστημα", "αίμα"],
  },
  {
    id: 'col-premium-organs-lungs-respiration',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_lungs_respiration.png',
    title: "Πνεύμονες & Τραχεία — Ανταλλαγή Αερίων (Πρόσληψη O2 & Αποβολή CO2)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "πνεύμονες", "τραχεία", "βρόγχοι", "κυψελίδες", "ανταλλαγή αερίων", "αναπνοή", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organs-stomach-digestion',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_stomach_digestion.png',
    title: "Στομάχι — Μηχανική και Χημική Πέψη της Τροφής με Γαστρικούς Χυμούς",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "στομάχι", "πέψη", "γαστρικό υγρό", "οισοφάγος", "δωδεκαδάκτυλο", "πεπτικό", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organs-liver-metabolism',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_liver_metabolism.png',
    title: "Ήπαρ (Συκώτι) — Παραγωγή Χολής, Αποθήκευση Γλυκογόνου, Αποτοξίνωση & Μεταβολισμός",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ήπαρ", "συκώτι", "χολή", "γλυκογόνο", "αποτοξίνωση", "μεταβολισμός", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organs-kidneys-filtration',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_kidneys_filtration.png',
    title: "Νεφρά (Δεξιός & Αριστερός Νεφρός με Νεφρική Αρτηρία, Φλέβα & Ουρητήρες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "νεφρά", "νεφρός", "διήθηση αίματος", "ούρα", "ομοιόσταση νερού", "ουροποιητικό", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "αιμοφόρα αγγεία", "αγγεία", "αρτηρία", "αρτηρίες", "φλέβα", "φλέβες", "τριχοειδή αγγεία", "αορτή", "άνω κοίλη φλέβα", "κάτω κοίλη φλέβα", "πνευμονική αρτηρία", "πνευμονική φλέβα", "κυκλοφορικό σύστημα", "αίμα"],
  },
  {
    id: 'col-premium-organs-brain-control',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_brain_control.png',
    title: "Εγκέφαλος — Έλεγχος & Συντονισμός Λειτουργιών, Σκέψης, Συναισθημάτων & Μνήμης",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "εγκέφαλος", "εγκεφαλικά ημισφαίρια", "στέλεχος", "παρεγκεφαλίδα", "μνήμη", "σκέψη", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organs-skin-layers-hair',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_skin_layers_hair.png',
    title: "Ανατομική Τομή Δέρματος (Επιδερμίδα, Χόριο, Υποδόριος Ιστός, Τρίχες & Αδένες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δέρμα", "επιδερμίδα", "χόριο", "θερμορύθμιση", "αφή", "τρίχα", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organs-eye-vision',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_eye_vision.png',
    title: "Οφθαλμός (Μάτι) — Αισθητήριο Όργανο της Όρασης (Κόρη, Ίριδα, Κερατοειδής)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μάτι", "οφθαλμός", "όραση", "ίριδα", "κόρη", "αμφιβληστροειδής", "αισθητήρια όργανα", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organs-ribcage-bones',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_ribcage_bones.png',
    title: "Θωρακικός Κλωβός (Στέρνο, Πλευρές & Σπονδυλική Στήλη — Προστασία Καρδιάς & Πνευμόνων)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "θωρακικός κλωβός", "θώρακας", "πλευρές", "παΐδια", "στέρνο", "οστά", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "κόκαλο", "κόκαλα", "οστό", "σκελετός", "ανθρώπινος σκελετός", "κρανίο", "σπονδυλική στήλη", "σπόνδυλος", "κλείδα", "ωμοπλάτη", "βραχιόνιο", "κερκίδα", "ωλένη", "λεκάνη", "πύελος", "μηριαίο οστό", "επιγονατίδα", "κνήμη", "περόνη", "άρθρωση", "μυελός των οστών"],
  },
  {
    id: 'col-premium-organs-skeletal-muscle',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_skeletal_muscle.png',
    title: "Γραμμωτός Σκελετικός Μυς με Τένοντες (Σύσπαση, Χαλάρωση & Κίνηση)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "σκελετικός μυς", "μύες", "τένοντας", "σύσπαση", "κίνηση", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "κόκαλο", "κόκαλα", "οστό", "σκελετός", "ανθρώπινος σκελετός", "κρανίο", "σπονδυλική στήλη", "σπόνδυλος", "θωρακικός κλωβός", "θώρακας", "πλευρές", "παΐδια", "στέρνο", "κλείδα", "ωμοπλάτη", "βραχιόνιο", "κερκίδα", "ωλένη", "λεκάνη", "πύελος", "μηριαίο οστό", "επιγονατίδα", "κνήμη", "περόνη", "άρθρωση", "μυελός των οστών"],
  },
  {
    id: 'col-premium-organs-5systems-cooperation-cards',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_5systems_cooperation_cards.png',
    title: "Συνεργασία Οργάνων σε 5 Συστήματα (Κυκλοφορικό, Αναπνευστικό, Πεπτικό, Νευρικό & Ουροποιητικό)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "συνεργασία οργάνων", "κυκλοφορικό", "αναπνευστικό", "πεπτικό", "νευρικό", "ουροποιητικό", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organs-vertical-hierarchy-5levels',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organs_vertical_hierarchy_5levels.png',
    title: "Κάθετο Διάγραμμα Εππέδων Οργάνωσης (Κύτταρο → Ιστός → Όργανο → Σύστημα Οργάνων → Οργανισμός)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "επίπεδα οργάνωσης", "ιεραρχία", "κύτταρο", "ιστός", "όργανο", "σύστημα οργάνων", "οργανισμός", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organism-human-anatomy-body',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_human_anatomy_body.png',
    title: "Ο Ανθρώπινος Οργανισμός & τα Εσωτερικά Όργανα σε Ανατομική Προβολή",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ανθρώπινος οργανισμός", "ανατομία ανθρώπου", "εσωτερικά όργανα", "σώμα", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organism-digestive-system',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_digestive_system.png',
    title: "Πεπτικό Σύστημα (Οισοφάγος, Στομάχι, Λεπτό & Παχύ Έντερο — Διάσπαση Τροφών & Απορρόφηση)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "πεπτικό σύστημα", "στομάχι", "λεπτό έντερο", "παχύ έντερο", "πέψη", "απορρόφηση", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organism-respiratory-system',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_respiratory_system.png',
    title: "Αναπνευστικό Σύστημα (Λάρυγγας, Τραχεία, Βρόγχοι, Βρογχιόλια & Πνεύμονες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αναπνευστικό σύστημα", "πνεύμονες", "τραχεία", "βρόγχοι", "αναπνοή", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organism-circulatory-heart',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_circulatory_heart.png',
    title: "Κυκλοφορικό Σύστημα — Καρδιά, Αορτή, Κοίλες Φλέβες & Στεφανιαία Αγγεία",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κυκλοφορικό σύστημα", "καρδιά", "αορτή", "αρτηρίες", "φλέβες", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "αιμοφόρα αγγεία", "αγγεία", "αρτηρία", "φλέβα", "τριχοειδή αγγεία", "άνω κοίλη φλέβα", "κάτω κοίλη φλέβα", "πνευμονική αρτηρία", "πνευμονική φλέβα", "αίμα"],
  },
  {
    id: 'col-premium-organism-urinary-system',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_urinary_system.png',
    title: "Ουροποιητικό Σύστημα (Νεφρά, Ουρητήρες, Ουροδόχος Κύστη & Ουρήθρα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ουροποιητικό σύστημα", "νεφρά", "ουρητήρες", "ουροδόχος κύστη", "ουρήθρα", "απέκκριση", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organism-nervous-brain-cord',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_nervous_brain_cord.png',
    title: "Νευρικό Σύστημα (Εγκέφαλος, Παρεγκεφαλίδα, Εγκεφαλικό Στέλεχος & Νωτιαίος Μυελός)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "νευρικό σύστημα", "εγκέφαλος", "νωτιαίος μυελός", "κεντρικό νευρικό σύστημα", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organism-endocrine-glands',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_endocrine_glands.png',
    title: "Ενδοκρινικό Σύστημα — Ενδοκρινείς Αδένες (Υπόφυση, Θυρεοειδής, Επινεφρίδια, Πάγκρεας, Γονάδες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ενδοκρινικό σύστημα", "ενδοκρινείς αδένες", "ορμόνες", "υπόφυση", "θυρεοειδής", "επινεφρίδια", "πάγκρεας", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organism-muscular-body',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_muscular_body.png',
    title: "Μυϊκό Σύστημα του Ανθρώπου (Σκελετικοί Μύες Κορμού & Άκρων)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μυϊκό σύστημα", "σκελετικοί μύες", "μύες", "κίνηση", "στάση σώματος", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organism-skeletal-body',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_skeletal_body.png',
    title: "Σκελετικό Σύστημα του Ανθρώπου (Κρανίο, Θώρακας, Σπονδυλική Στήλη, Λεκάνη & Οστά Άκρων)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "σκελετικό σύστημα", "σκελετός", "οστά", "κόκαλα", "στήριξη", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία", "κόκαλο", "οστό", "ανθρώπινος σκελετός", "κρανίο", "σπονδυλική στήλη", "σπόνδυλος", "θωρακικός κλωβός", "θώρακας", "πλευρές", "παΐδια", "στέρνο", "κλείδα", "ωμοπλάτη", "βραχιόνιο", "κερκίδα", "ωλένη", "λεκάνη", "πύελος", "μηριαίο οστό", "επιγονατίδα", "κνήμη", "περόνη", "άρθρωση", "μυελός των οστών"],
  },
  {
    id: 'col-premium-organism-environment-interaction',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_environment_interaction.png',
    title: "Αλληλεπίδραση Οργανισμού με το Περιβάλλον (Θερμοκρασία, Νερό, Τροφή, Αέρας, Φως & Μικροοργανισμοί)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αλληλεπίδραση με το περιβάλλον", "ερεθίσματα", "προσαρμογή", "επιβίωση", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-organism-homeostasis-balance',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_organism_homeostasis_balance.png',
    title: "Ομοιόσταση — Διατήρηση Σταθερού Εσωτερικού Περιβάλλοντος (Θερμοκρασία 36,6°C, pH, Γλυκόζη, Αρτηριακή Πίεση)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ομοιόσταση", "ισορροπία", "θερμορύθμιση", "γλυκόζη", "αρτηριακή πίεση", "pH", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-systems-6way-cooperation-hub',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_systems_6way_cooperation_hub.png',
    title: "Διάγραμμα Συνεργασίας των Συστημάτων Οργάνων του Ανθρώπου (Νευρικό, Κυκλοφορικό, Αναπνευστικό, Πεπτικό, Ουροποιητικό, Μυϊκό)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "συνεργασία συστημάτων οργάνων", "συστήματα οργάνων", "συντονισμός", "ισορροπία", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-systems-3gears-mechanism',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_systems_3gears_mechanism.png',
    title: "Συστήματα Οργάνων σε Αρμονική Συνεργασία (Συμπλεκόμενα Γρανάζια Λειτουργιών)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "συστήματα λειτουργιών", "γρανάζια", "συνεργασία", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-systems-reproductive-male-female',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_systems_reproductive_male_female.png',
    title: "Αναπαραγωγικό Σύστημα Ανθρώπου — Γυναικείο (Ωοθήκες, Σάλπιγγες, Μήτρα) & Ανδρικό (Όρχεις, Σπερματικοί Πόροι)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αναπαραγωγικό σύστημα", "γεννητικό σύστημα", "ωοθήκες", "σάλπιγγες", "μήτρα", "όρχεις", "γαμέτες", "αναπαραγωγή", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-systems-sensory-organs-5senses',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_systems_sensory_organs_5senses.png',
    title: "Τα 5 Αισθητήρια Όργανα (Μάτι/Όραση, Αυτί/Ακοή, Μύτη/Όσφρηση, Γλώσσα/Γεύση, Δέρμα/Αφή)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αισθητήρια όργανα", "πέντε αισθήσεις", "όραση", "ακοή", "όσφρηση", "γεύση", "αφή", "μάτι", "αυτί", "μύτη", "γλώσσα", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-systems-lymphatic-immune-cells',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_systems_lymphatic_immune_cells.png',
    title: "Λεμφικό & Ανοσοποιητικό Σύστημα — Λευκά Αιμοσφαίρια, Λεμφοκύτταρα & Άμυνα κατά Παθογόνων Μικροβίων",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "λεμφικό σύστημα", "ανοσοποιητικό σύστημα", "άμυνα οργανισμού", "λεμφοκύτταρα", "φαγοκύτταρα", "μικρόβια", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-systems-integumentary-skin-section',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_systems_integumentary_skin_section.png',
    title: "Επιδερμιδικό (Καλυπτήριο) Σύστημα — Δέρμα, Τρίχες, Ιδρωτοποιοί Αδένες & Αισθητήριοι Υποδοχείς",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "επιδερμιδικό σύστημα", "καλυπτήριο σύστημα", "δέρμα", "επιδερμίδα", "χόριο", "θερμορύθμιση", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-systems-runner-cooperation',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_systems_runner_cooperation.png',
    title: "Συνεργασία όλων των Συστημάτων Οργάνων κατά το Τρέξιμο και τη Σωματική Άσκηση",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "άσκηση", "τρέξιμο", "συνεργασία συστημάτων", "μυϊκό", "αναπνευστικό", "κυκλοφορικό", "διαφοροποίηση", "βλαστικά κύτταρα", "αρχέγονα κύτταρα", "ιστός", "ιστοί", "επιθηλιακός ιστός", "συνδετικός ιστός", "μυϊκός ιστός", "νευρικός ιστός", "νευρώνας", "ερυθρά αιμοσφαίρια", "λευκά αιμοσφαίρια", "αιμοπετάλια", "όργανο", "όργανα", "καρδιά", "πνεύμονες", "στομάχι", "ήπαρ", "νεφρά", "εγκέφαλος", "δέρμα", "μάτι", "οστά", "μύες", "συστήματα οργάνων", "οργανισμός", "ομοιόσταση", "tissues", "organs", "organ systems", "βιολογία"],
  },
  {
    id: 'col-premium-eco-pond-biotic-abiotic-scene',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_pond_biotic_abiotic_scene.png',
    title: "Το Οικοσύστημα — Αλληλεπίδραση Βιοτικών Παραγόντων (Φυτά, Ζώα) και Αβιοτικών Παραγόντων (Ήλιος, Νερό, Αέρας, Έδαφος)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "οικοσύστημα", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "βιότοπος", "βιοκοινότητα", "οικολογία", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-producers-consumers-decomposers-cycle',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_producers_consumers_decomposers_cycle.png',
    title: "Οι Βιοτικοί Παράγοντες του Οικοσυστήματος: Παραγωγοί (Φυτά), Καταναλωτές (Ζώα) & Αποικοδομητές (Μύκητες, Βακτήρια)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "αυτότροφοι", "ετερότροφοι", "μύκητες", "βακτήρια", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-abiotic-sun-water-wind-soil',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_abiotic_sun_water_wind_soil.png',
    title: "Αβιοτικοί Παράγοντες Οικοσυστήματος (Ηλιακή Ακτινοβολία/Θερμοκρασία, Νερό/Υγρασία, Άνεμος & Έδαφος)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αβιοτικοί παράγοντες", "φως", "θερμοκρασία", "νερό", "άνεμος", "έδαφος", "κλίμα", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-natural-forest-lake-ecosystem',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_natural_forest_lake_ecosystem.png',
    title: "Φυσικό Οικοσύστημα (Δάσος, Βουνά, Ποτάμι & Λίμνη)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φυσικό οικοσύστημα", "χερσαίο οικοσύστημα", "υδάτινο οικοσύστημα", "δάσος", "λίμνη", "ποτάμι", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-artificial-farm-ecosystem',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_artificial_farm_ecosystem.png',
    title: "Τεχνητό / Αγροτικό Οικοσύστημα (Αγρόκτημα & Καλλιέργειες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "τεχνητό οικοσύστημα", "αγροτικό οικοσύστημα", "αγρόκτημα", "καλλιέργειες", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-competition-two-trees',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_competition_two_trees.png',
    title: "Ανταγωνισμός μεταξύ Οργανισμών (Δύο Δέντρα που Ανταγωνίζονται για το Φως, το Νερό & τα Θρεπτικά Συστατικά)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ανταγωνισμός", "σχέσεις οργανισμών", "φως", "νερό", "δέντρα", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-predation-wolf-hare',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_predation_wolf_hare.png',
    title: "Σχέση Θήρας – Θηρευτή (Λύκος Θηρευτής & Λαγός Θήραμα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "θήρα", "θηρευτής", "θήραμα", "λύκος", "λαγός", "τροφικές σχέσεις", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-parasitism-dog-tick',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_parasitism_dog_tick.png',
    title: "Παρασιτισμός — Παράσιτο (Τσιμπούρι) και Ξενιστής (Σκύλος)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "παρασιτισμός", "παράσιτο", "ξενιστής", "τσιμπούρι", "σκύλος", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-symbiosis-bee-flower',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_symbiosis_bee_flower.png',
    title: "Συμβίωση / Αμοιβαιότητα — Μέλισσα & Λουλούδι (Νέκταρ & Επικονίαση)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "συμβίωση", "αμοιβαιότητα", "επικονίαση", "μέλισσα", "λουλούδι", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-commensalism-orchid-tree',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_commensalism_orchid_tree.png',
    title: "Κομμενσαλισμός (Ομοσιτισμός) — Επίφυτη Ορχιδέα πάνω σε Κορμό Δέντρου",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κομμενσαλισμός", "ομοσιτισμός", "ορχιδέα", "επίφυτο", "σχέσεις οργανισμών", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-food-chain-5levels',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_food_chain_5levels.png',
    title: "Τροφική Αλυσίδα 5 Τροφικών Επιπέδων: Χόρτο → Ακρίδα → Βάτραχος → Φίδι → Αετός",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "τροφική αλυσίδα", "τροφικά επίπεδα", "χόρτο", "ακρίδα", "βάτραχος", "φίδι", "αετός", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-food-web-network',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_food_web_network.png',
    title: "Τροφικό Πλέγμα Χερσαίου Οικοσυστήματος (Διαπλεκόμενες Τροφικές Αλυσίδες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "τροφικό πλέγμα", "τροφικές αλυσίδες", "κουκουβάγια", "φίδι", "βάτραχος", "ποντίκι", "ακρίδα", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-energy-flow-vertical',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_energy_flow_vertical.png',
    title: "Μονόδρομη Ροή Ενέργειας στο Οικοσύστημα (Ήλιος → Παραγωγοί → Καταναλωτές → Αποικοδομητές)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ροή ενέργειας", "μονόδρομη ροή ενέργειας", "ήλιος", "φωτοσύνθεση", "θερμότητα", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-matter-cycle-circular',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_matter_cycle_circular.png',
    title: "Αέναος Κύκλος Υλικών στο Οικοσύστημα (Ατμόσφαιρα CO2/O2, Παραγωγοί, Καταναλωτές, Αποικοδομητές & Έδαφος)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κύκλος υλικών", "βιογεωχημικοί κύκλοι", "ανακύκλωση ύλης", "κύκλος άνθρακα", "αποικοδομητές", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-natural-disturbances-fire-flood',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_natural_disturbances_fire_flood.png',
    title: "Φυσικές Διαταραχές της Οικολογικής Ισορροπίας (Δασικές Πυρκαγιές & Πλημμύρες)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φυσικές διαταραχές", "πυρκαγιά", "πλημμύρα", "οικολογική ισορροπία", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-human-disturbances-pollution',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_human_disturbances_pollution.png',
    title: "Ανθρωπογενείς Διαταραχές Οικοσυστημάτων (Ρύπανση, Αποψίλωση Δασών & Υπεραλίευση)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ανθρωπογενείς διαταραχές", "ρύπανση", "αποψίλωση", "υπεραλίευση", "κλιματική αλλαγή", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "βιοποικιλότητα", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-eco-earth-biodiversity-globe',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_eco_earth_biodiversity_globe.png',
    title: "Βιόσφαιρα, Βιοποικιλότητα & Προστασία του Πλανήτη Γη",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "βιόσφαιρα", "βιοποικιλότητα", "προστασία περιβάλλοντος", "αειφορία", "πλανήτης γη", "οικοσύστημα", "οικολογία", "βιοτικοί παράγοντες", "αβιοτικοί παράγοντες", "παραγωγοί", "καταναλωτές", "αποικοδομητές", "τροφική αλυσίδα", "τροφικό πλέγμα", "ροή ενέργειας", "κύκλος υλικών", "ανταγωνισμός", "θήρα", "θηρευτής", "παρασιτισμός", "συμβίωση", "αμοιβαιότητα", "κομμενσαλισμός", "ecosystem", "food chain", "food web", "βιολογία"],
  },
  {
    id: 'col-premium-photo-plant-sun-co2-h2o-o2-glucose',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_plant_sun_co2_h2o_o2_glucose.png',
    title: "Η Διαδικασία της Φωτοσύνθεσης — CO2 + H2O + Ηλιακό Φως → Γλυκόζη (C6H12O6) + Οξυγόνο (O2)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φωτοσύνθεση", "εξίσωση φωτοσύνθεσης", "ήλιος", "γλυκόζη", "οξυγόνο", "CO2", "H2O", "φυτό", "φυτά", "χλωροπλάστης", "χλωροφύλλη", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "φωτεινή φάση", "σκοτεινή φάση", "κύκλος Calvin", "φωτόλυση νερού", "ATP", "NADPH", "C6H12O6", "O2", "διοξείδιο του άνθρακα", "νερό", "αυτότροφοι οργανισμοί", "φύλλο", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-chloroplast-labeled-anatomy',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_chloroplast_labeled_anatomy.png',
    title: "Δομή Χλωροπλάστη (Εξωτερική & Εσωτερική Μεμβράνη, Στρώμα, Θυλακοειδή / Κοκκία, Grana)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "χλωροπλάστης", "δομή χλωροπλάστη", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "μεμβράνη", "φωτοσύνθεση", "φυτό", "φυτά", "χλωροφύλλη", "φωτεινή φάση", "σκοτεινή φάση", "κύκλος Calvin", "φωτόλυση νερού", "ATP", "NADPH", "γλυκόζη", "C6H12O6", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "φύλλο", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-chloroplast-isolated',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_chloroplast_isolated.png',
    title: "Χλωροπλάστης — 3D Εσωτερική Ανατομική Τομή Υψηλής Ανάλυσης (Grana & Στρώμα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "χλωροπλάστης", "3d χλωροπλάστης", "οργανίδιο", "φωτοσύνθεση", "χλωροφύλλη", "φυτό", "φυτά", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "φωτεινή φάση", "σκοτεινή φάση", "κύκλος Calvin", "φωτόλυση νερού", "ATP", "NADPH", "γλυκόζη", "C6H12O6", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "φύλλο", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-leaf-to-plant-cell-zoom',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_leaf_to_plant_cell_zoom.png',
    title: "Πού Γίνεται η Φωτοσύνθεση: Από το Πράσινο Φύλλο στο Φυτικό Κύτταρο & στους Χλωροπλάστες",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φύλλο", "φυτικό κύτταρο", "χλωροπλάστες", "μεσόφυλλο", "φωτοσύνθεση", "φυτό", "φυτά", "χλωροπλάστης", "χλωροφύλλη", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "φωτεινή φάση", "σκοτεινή φάση", "κύκλος Calvin", "φωτόλυση νερού", "ATP", "NADPH", "γλυκόζη", "C6H12O6", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-light-phase-thylakoids',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_light_phase_thylakoids.png',
    title: "Α. Φωτεινή (Φωτοχημική) Φάση της Φωτοσύνθεσης στα Θυλακοειδή (Φωτόλυση H2O → O2, Παραγωγή ATP & NADPH)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φωτεινή φάση", "φωτοχημική φάση", "φωτόλυση νερού", "θυλακοειδή", "ATP", "NADPH", "O2", "φωτοσύνθεση", "φυτό", "φυτά", "χλωροπλάστης", "χλωροφύλλη", "κοκκία", "grana", "στρώμα", "σκοτεινή φάση", "κύκλος Calvin", "γλυκόζη", "C6H12O6", "οξυγόνο", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "φύλλο", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-dark-phase-calvin-cycle',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_dark_phase_calvin_cycle.png',
    title: "Β. Σκοτεινή Φάση της Φωτοσύνθεσης (Κύκλος Calvin στο Στρώμα: Δέσμευση CO2 → Γλυκόζη C6H12O6)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "σκοτεινή φάση", "κύκλος Calvin", "calvin", "στρώμα χλωροπλάστη", "δέσμευση CO2", "γλυκόζη", "RuBP", "φωτοσύνθεση", "φυτό", "φυτά", "χλωροπλάστης", "χλωροφύλλη", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "φωτεινή φάση", "φωτόλυση νερού", "ATP", "NADPH", "C6H12O6", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "φύλλο", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-5factors-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_5factors_column.png',
    title: "Παράγοντες που Επηρεάζουν την Ένταση της Φωτοσύνθεσης (Φως, CO2, Θερμοκρασία, Νερό, Χλωροφύλλη)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "παράγοντες φωτοσύνθεσης", "ένταση φωτός", "θερμοκρασία", "συγκέντρωση CO2", "χλωροφύλλη", "φωτοσύνθεση", "φυτό", "φυτά", "χλωροπλάστης", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "φωτεινή φάση", "σκοτεινή φάση", "κύκλος Calvin", "φωτόλυση νερού", "ATP", "NADPH", "γλυκόζη", "C6H12O6", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "φύλλο", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-products-leaf-o2',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_products_leaf_o2.png',
    title: "Προϊόντα της Φωτοσύνθεσης: Γλυκόζη (Τροφή στο Φύλλο) + Αέριο Οξυγόνο (O2)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "προϊόντα φωτοσύνθεσης", "γλυκόζη", "οξυγόνο", "O2", "φύλλο", "φωτοσύνθεση", "φυτό", "φυτά", "χλωροπλάστης", "χλωροφύλλη", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "φωτεινή φάση", "σκοτεινή φάση", "κύκλος Calvin", "φωτόλυση νερού", "ATP", "NADPH", "C6H12O6", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-tree-co2-o2-exchange',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_tree_co2_o2_exchange.png',
    title: "Σημασία της Φωτοσύνθεσης — Δέσμευση CO2 από τα Δέντρα & Απελευθέρωση O2 στην Ατμόσφαιρα",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δέντρο", "δέσμευση CO2", "απελευθέρωση O2", "ατμόσφαιρα", "φωτοσύνθεση", "φυτό", "φυτά", "χλωροπλάστης", "χλωροφύλλη", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "φωτεινή φάση", "σκοτεινή φάση", "κύκλος Calvin", "φωτόλυση νερού", "ATP", "NADPH", "γλυκόζη", "C6H12O6", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "φύλλο", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-organisms-plants-algae-cyanobacteria',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_organisms_plants_algae_cyanobacteria.png',
    title: "Φωτοσυνθετικοί (Αυτότροφοι) Οργανισμοί: Πράσινα Φυτά, Φύκη & Κυανοβακτήρια",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φωτοσυνθετικοί οργανισμοί", "πράσινα φυτά", "φύκη", "κυανοβακτήρια", "αυτότροφοι", "φωτοσύνθεση", "φυτό", "φυτά", "χλωροπλάστης", "χλωροφύλλη", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "φωτεινή φάση", "σκοτεινή φάση", "κύκλος Calvin", "φωτόλυση νερού", "ATP", "NADPH", "γλυκόζη", "C6H12O6", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "φύλλο", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-c3-vs-c4-plants',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_c3_vs_c4_plants.png',
    title: "Φυτά C3 (Σιτάρι, Ρύζι, Δέντρα) vs Φυτά C4 Προσαρμοσμένα στη Ζέστη (Καλαμπόκι, Ζαχαροκάλαμο)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φυτά C3", "φυτά C4", "καλαμπόκι", "ζαχαροκάλαμο", "δέσμευση CO2", "φωτοσύνθεση", "φυτό", "φυτά", "χλωροπλάστης", "χλωροφύλλη", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "φωτεινή φάση", "σκοτεινή φάση", "κύκλος Calvin", "φωτόλυση νερού", "ATP", "NADPH", "γλυκόζη", "C6H12O6", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "φύλλο", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-photo-earth-globe-oxygen-life',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_photo_earth_globe_oxygen_life.png',
    title: "Η Φωτοσύνθεση ως Βάση της Ζωής και του Οξυγόνου στον Πλανήτη Γη",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "πλανήτης γη", "βιόσφαιρα", "οξυγόνο", "ζωή στη γη", "φωτοσύνθεση", "φυτό", "φυτά", "χλωροπλάστης", "χλωροφύλλη", "θυλακοειδή", "κοκκία", "grana", "στρώμα", "φωτεινή φάση", "σκοτεινή φάση", "κύκλος Calvin", "φωτόλυση νερού", "ATP", "NADPH", "γλυκόζη", "C6H12O6", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "αυτότροφοι οργανισμοί", "φύλλο", "ενώσεις", "photosynthesis", "chloroplast", "βιολογία"],
  },
  {
    id: 'col-premium-resp-plant-cell-mitochondrion-labeled',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resp_plant_cell_mitochondrion_labeled.png',
    title: "Πού Γίνεται η Κυτταρική Αναπνοή του Φυτού — Φυτικό Κύτταρο & Μιτοχόνδριο (Παραγωγή Ενέργειας ATP)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φυτικό κύτταρο", "μιτοχόνδριο", "παραγωγή ATP", "κυτταρική αναπνοή", "αναπνοή φυτού", "αναπνοή φυτών", "μιτοχόνδρια", "ATP", "ενέργεια", "γλυκόζη", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "ανταλλαγή αερίων", "στόματα", "στόμα φύλλου", "καταφρακτικά κύτταρα", "φακίδια", "φακίδιο", "βλαστός", "φύλλο", "ενώσεις", "plant respiration", "stomata", "mitochondria", "βιολογία"],
  },
  {
    id: 'col-premium-resp-mitochondrion-isolated',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resp_mitochondrion_isolated.png',
    title: "Μιτοχόνδριο — 3D Ανατομική Τομή (Εξωτερική Μεμβράνη, Αναδιπλώσεις Cristae & Μήτρα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μιτοχόνδριο", "3d μιτοχόνδριο", "cristae", "αναπνοή", "ATP", "αναπνοή φυτού", "αναπνοή φυτών", "κυτταρική αναπνοή", "μιτοχόνδρια", "ενέργεια", "γλυκόζη", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "ανταλλαγή αερίων", "στόματα", "στόμα φύλλου", "καταφρακτικά κύτταρα", "φακίδια", "φακίδιο", "βλαστός", "φύλλο", "ενώσεις", "plant respiration", "stomata", "mitochondria", "βιολογία"],
  },
  {
    id: 'col-premium-resp-stomata-leaf-gas-exchange',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resp_stomata_leaf_gas_exchange.png',
    title: "Ανταλλαγή Αερίων στα Φύλλα μέσω των Στομάτων (Είσοδος O2 για Αναπνοή & Έξοδος CO2)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "στόματα φύλλου", "ανταλλαγή αερίων", "είσοδος O2", "έξοδος CO2", "επιδερμίδα φύλλου", "αναπνοή φυτού", "αναπνοή φυτών", "κυτταρική αναπνοή", "μιτοχόνδριο", "μιτοχόνδρια", "ATP", "ενέργεια", "γλυκόζη", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "στόματα", "στόμα φύλλου", "καταφρακτικά κύτταρα", "φακίδια", "φακίδιο", "βλαστός", "φύλλο", "ενώσεις", "plant respiration", "stomata", "mitochondria", "βιολογία"],
  },
  {
    id: 'col-premium-resp-stoma-guard-cells-isolated',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resp_stoma_guard_cells_isolated.png',
    title: "Στόμα Επιδερμίδας Φύλλου (Δύο Καταφρακτικά Κύτταρα με Χλωροπλάστες & Στοματικό Άνοιγμα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "στόμα", "στόματα", "καταφρακτικά κύτταρα", "στοματικό άνοιγμα", "διαπνοή", "αναπνοή φυτού", "αναπνοή φυτών", "κυτταρική αναπνοή", "μιτοχόνδριο", "μιτοχόνδρια", "ATP", "ενέργεια", "γλυκόζη", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "ανταλλαγή αερίων", "στόμα φύλλου", "φακίδια", "φακίδιο", "βλαστός", "φύλλο", "ενώσεις", "plant respiration", "stomata", "mitochondria", "βιολογία"],
  },
  {
    id: 'col-premium-resp-lenticels-stem-gas-exchange',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resp_lenticels_stem_gas_exchange.png',
    title: "Ανταλλαγή Αερίων στους Ξυλώδεις Βλαστούς μέσω των Φακιδίων (Είσοδος O2 & Έξοδος CO2)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φακίδιο", "φακίδια", "ξυλώδης βλαστός", "ανταλλαγή αερίων", "αναπνοή φυτού", "αναπνοή φυτών", "κυτταρική αναπνοή", "μιτοχόνδριο", "μιτοχόνδρια", "ATP", "ενέργεια", "γλυκόζη", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "στόματα", "στόμα φύλλου", "καταφρακτικά κύτταρα", "βλαστός", "φύλλο", "ενώσεις", "plant respiration", "stomata", "mitochondria", "βιολογία"],
  },
  {
    id: 'col-premium-resp-4factors-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resp_4factors_column.png',
    title: "Παράγοντες που Επηρεάζουν την Αναπνοή του Φυτού (Θερμοκρασία, Οξυγόνο O2, Γλυκόζη, Νερό)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "παράγοντες αναπνοής", "θερμοκρασία", "οξυγόνο", "γλυκόζη", "νερό", "αναπνοή φυτού", "αναπνοή φυτών", "κυτταρική αναπνοή", "μιτοχόνδριο", "μιτοχόνδρια", "ATP", "ενέργεια", "O2", "διοξείδιο του άνθρακα", "CO2", "H2O", "ανταλλαγή αερίων", "στόματα", "στόμα φύλλου", "καταφρακτικά κύτταρα", "φακίδια", "φακίδιο", "βλαστός", "φύλλο", "ενώσεις", "plant respiration", "stomata", "mitochondria", "βιολογία"],
  },
  {
    id: 'col-premium-resp-products-plant-o2-co2-atp',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resp_products_plant_o2_co2_atp.png',
    title: "Αναπνοή Φυτού όλο το 24ωρο: Είσοδος O2 → Έξοδος CO2 + H2O + Ενέργεια (ATP)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "προϊόντα αναπνοής", "είσοδος O2", "έξοδος CO2", "ATP", "ενέργεια", "αναπνοή φυτού", "αναπνοή φυτών", "κυτταρική αναπνοή", "μιτοχόνδριο", "μιτοχόνδρια", "γλυκόζη", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "ανταλλαγή αερίων", "στόματα", "στόμα φύλλου", "καταφρακτικά κύτταρα", "φακίδια", "φακίδιο", "βλαστός", "φύλλο", "ενώσεις", "plant respiration", "stomata", "mitochondria", "βιολογία"],
  },
  {
    id: 'col-premium-resp-active-organs-seed-root-flower-fruit',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resp_active_organs_seed_root_flower_fruit.png',
    title: "Όργανα Φυτού με Έντονη Αναπνοή: Σπόρος σε Βλάστηση, Νεαρές Ρίζες, Άνθος & Καρπός",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "βλάστηση σπόρου", "σπόρος", "ρίζες", "άνθος", "καρπός", "μήλο", "αναπνοή φυτού", "αναπνοή φυτών", "κυτταρική αναπνοή", "μιτοχόνδριο", "μιτοχόνδρια", "ATP", "ενέργεια", "γλυκόζη", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "ανταλλαγή αερίων", "στόματα", "στόμα φύλλου", "καταφρακτικά κύτταρα", "φακίδια", "φακίδιο", "βλαστός", "φύλλο", "ενώσεις", "plant respiration", "stomata", "mitochondria", "βιολογία"],
  },
  {
    id: 'col-premium-resp-apples-crate-storage-co2',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resp_apples_crate_storage_co2.png',
    title: "Συνέχιση της Αναπνοής σε Αποθηκευμένα Φρούτα & Λαχανικά (Κατανάλωση O2 & Παραγωγή CO2)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αποθήκευση φρούτων", "μήλα", "έκλυση CO2", "συντήρηση", "αναπνοή φυτού", "αναπνοή φυτών", "κυτταρική αναπνοή", "μιτοχόνδριο", "μιτοχόνδρια", "ATP", "ενέργεια", "γλυκόζη", "οξυγόνο", "O2", "διοξείδιο του άνθρακα", "CO2", "νερό", "H2O", "ανταλλαγή αερίων", "στόματα", "στόμα φύλλου", "καταφρακτικά κύτταρα", "φακίδια", "φακίδιο", "βλαστός", "φύλλο", "ενώσεις", "plant respiration", "stomata", "mitochondria", "βιολογία"],
  },
  {
    id: 'col-premium-support-without-vs-with-support-sunflower',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_without_vs_with_support_sunflower.png',
    title: "Η Σημασία της Στήριξης στο Φυτό — Μαραμένο Φυτό χωρίς Στήριξη vs Όρθιο Ηλιοτρόπιο με Στήριξη",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "στήριξη φυτού", "χωρίς στήριξη", "με στήριξη", "ηλιοτρόπιο", "σπαργή", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "αναρριχώμενα φυτά", "έλικες", "αγκάθια", "ρίζες", "ριζώματα", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-tissues-collenchyma-sclerenchyma-xylem',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_tissues_collenchyma_sclerenchyma_xylem.png',
    title: "Οι Ιστοί Στήριξης των Φυτών: Κολέγχυμα (Ζωντανός Ιστός), Σκληρέγχυμα & Ξύλωμα (Ξυλώδεις Ιστοί)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ιστοί στήριξης", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "μηχανικοί ιστοί", "στήριξη φυτού", "στήριξη στα φυτά", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "αναρριχώμενα φυτά", "έλικες", "αγκάθια", "ρίζες", "ριζώματα", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-stem-cross-section-labeled',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_stem_cross_section_labeled.png',
    title: "Εγκάρσια Τομή Στελέχους / Βλαστού (Επιδερμίδα, Φλοιός/Κολέγχυμα, Αγγεία Ξυλώματος, Ηθμοί Σωλήνες/Φλοίωμα, Μυελός)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "εγκάρσια τομή στελέχους", "εγκάρσια τομή βλαστού", "αγωγός ιστός", "ηθμαγγειώδεις δεσμίδες", "ξύλωμα", "φλοίωμα", "στήριξη φυτού", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "αγγεία ξυλώματος", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "αναρριχώμενα φυτά", "έλικες", "αγκάθια", "ρίζες", "ριζώματα", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-leaf-veins-magnified',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_leaf_veins_magnified.png',
    title: "Στήριξη στα Φύλλα — Δίκτυο Νευρώσεων (Αγγεία Ξυλώματος & Μηχανικοί Ιστοί στο Έλασμα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "νεύρα φύλλου", "νευρώσεις φύλλου", "έλασμα", "στήριξη φύλλου", "στήριξη φυτού", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "αναρριχώμενα φυτά", "έλικες", "αγκάθια", "ρίζες", "ριζώματα", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-upright-stems-sunflower-oak-wheat',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_upright_stems_sunflower_oak_wheat.png',
    title: "Α. Φυτά με Όρθια Στελέχη (Ηλιοτρόπιο, Κορμός Βελανιδιάς & Σιτάρι)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "όρθια στελέχη", "κορμός δέντρου", "βελανιδιά", "ηλιοτρόπιο", "σιτάρι", "στήριξη φυτού", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "αναρριχώμενα φυτά", "έλικες", "αγκάθια", "ρίζες", "ριζώματα", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-climbing-plants-ivy-vine',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_climbing_plants_ivy_vine.png',
    title: "Β. Αναρριχώμενα Φυτά (Κισσός, Αμπέλι, Μπιζέλι)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αναρριχώμενα φυτά", "κισσός", "αμπέλι", "μπιζέλι", "στήριξη φυτού", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "έλικες", "αγκάθια", "ρίζες", "ριζώματα", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-twining-stems-bougainvillea',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_twining_stems_bougainvillea.png',
    title: "Γ. Φυτά με Πλεκόμενους Βλαστούς (Μπουκαμβίλια)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "πλεκόμενοι βλαστοί", "μπουκαμβίλια", "βλαστοί", "στήριξη φυτού", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "αναρριχώμενα φυτά", "έλικες", "αγκάθια", "ρίζες", "ριζώματα", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-thorns-tendrils-rose-cucumber',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_thorns_tendrils_rose_cucumber.png',
    title: "Δ. Ειδικά Όργανα Στήριξης Φυτών — Αγκάθια (Τριαντάφυλλο) & Έλικες / Παράφυα (Αγγούρι)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αγκάθια", "έλικες", "παράφυα", "τριαντάφυλλο", "αγγούρι", "στήριξη φυτού", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "αναρριχώμενα φυτά", "ρίζες", "ριζώματα", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-underground-roots-rhizomes',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_underground_roots_rhizomes.png',
    title: "Ε. Υπόγεια Όργανα Στήριξης & Αγκύρωσης στο Έδαφος (Ριζικό Σύστημα Δέντρων & Ριζώματα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "υπόγεια όργανα στήριξης", "ριζικό σύστημα", "ρίζες δέντρου", "ριζώματα", "στήριξη φυτού", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "αναρριχώμενα φυτά", "έλικες", "αγκάθια", "ρίζες", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-4factors-column',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_4factors_column.png',
    title: "Παράγοντες που Επηρεάζουν τη Στήριξη των Φυτών (Φως, Νερό, Θρεπτικές Ουσίες Ca/Si, Άνεμος)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "παράγοντες στήριξης", "φως", "έλλειψη νερού", "άνεμος", "στήριξη φυτού", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "αναρριχώμενα φυτά", "έλικες", "αγκάθια", "ρίζες", "ριζώματα", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-bean-stake-experiment',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_bean_stake_experiment.png',
    title: "Πείραμα Στήριξης Φυτού (Φασολιά με Στήριγμα vs Φασολιά χωρίς Στήριγμα)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "πείραμα στήριξης", "φασολιά", "με στήριγμα", "χωρίς στήριγμα", "στήριξη φυτού", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "αναρριχώμενα φυτά", "έλικες", "αγκάθια", "ρίζες", "ριζώματα", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-support-adaptations-bamboo-ivy-shrub',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_support_adaptations_bamboo_ivy_shrub.png',
    title: "Προσαρμογές Φυτών για Στήριξη (Ευλύγιστα Καλάμια, Προσκολλητικές Ρίζες & Χαμηλή Ανάπτυξη στον Άνεμο)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "προσαρμογές φυτών", "καλάμια", "μπαμπού", "προσκολλητικές ρίζες", "στήριξη φυτού", "στήριξη στα φυτά", "ιστοί στήριξης", "μηχανικοί ιστοί", "κολέγχυμα", "σκληρέγχυμα", "ξύλωμα", "αγγεία ξυλώματος", "φλοίωμα", "ηθμοί σωλήνες", "βλαστός", "στέλεχος", "εγκάρσια τομή βλαστού", "επιδερμίδα", "φλοιός", "μυελός", "νεύρα φύλλου", "αναρριχώμενα φυτά", "έλικες", "αγκάθια", "ρίζες", "ριζώματα", "σπαργή", "plant support", "xylem", "phloem", "βιολογία"],
  },
  {
    id: 'col-premium-ice-h2o-polar-molecule-labeled',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_ice_h2o_polar_molecule_labeled.png',
    title: "Μόριο Νερού (H2O) — Πολικό Μόριο με Αρνητικό Πόλο στο Οξυγόνο (δ-) και Θετικό Πόλο στα Υδρογόνα (δ+)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μόριο νερού", "H2O", "πολικό μόριο", "δίπολο", "οξυγόνο", "υδρογόνο", "νερό", "πάγος", "υδρατμός", "ατμός", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-ice-floating-cube-density-hero',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_ice_floating_cube_density_hero.png',
    title: "Γιατί ο Πάγος Επιπλέει στο Νερό — Μικρότερη Πυκνότητα Πάγου (≈0,92 g/cm³) έναντι Υγρού Νερού (≈1,00 g/cm³)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ο πάγος επιπλέει", "πυκνότητα πάγου", "πυκνότητα νερού", "0,92 g/cm3", "1,00 g/cm3", "άνωση", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-ice-liquid-water-molecules-dense',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_ice_liquid_water_molecules_dense.png',
    title: "Μοριακή Δομή Υγρού Νερού — Μόρια Κοντά Μεταξύ τους σε Διαρκή Κίνηση",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "υγρό νερό", "μοριακή δομή νερού", "δεσμοί υδρογόνου", "πυκνότητα", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-ice-hexagonal-crystal-lattice',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_ice_hexagonal_crystal_lattice.png',
    title: "Μοριακή Δομή Πάγου — Ανοικτό Εξαγωνικό Κρυσταλλικό Πλέγμα Δεσμών Υδρογόνου",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κρυσταλλικό πλέγμα πάγου", "ανοικτή εξαγωνική δομή", "δεσμοί υδρογόνου", "πάγος", "νερό", "H2O", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-ice-hydrogen-bond-attraction',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_ice_hydrogen_bond_attraction.png',
    title: "Ηλεκτροστατική Έλξη Μεταξύ Πολικών Μορίων Νερού (Δεσμός Υδρογόνου δ+ ··· δ-)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δεσμός υδρογόνου", "διαμοριακές δυνάμεις", "δίπολο", "έλξη μορίων", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-ice-hydrogen-bonds-tetramer',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_ice_hydrogen_bonds_tetramer.png',
    title: "Δίκτυο Δεσμών Υδρογόνου Μεταξύ Γειτονικών Μορίων Νερού (H2O)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "δίκτυο δεσμών υδρογόνου", "δεσμοί υδρογόνου", "μόρια νερού", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-ice-hexagonal-ring-icon',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_ice_hexagonal_ring_icon.png',
    title: "Εξαγωνικός Κρυσταλλικός Δακτύλιος 6 Μορίων Νερού στον Πάγο",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "εξαγωνικός δακτύλιος", "πλέγμα πάγου", "κρυσταλλική δομή", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-ice-cube-open-voids',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_ice_cube_open_voids.png',
    title: "Κύβος Πάγου με Ανοικτά Κενά (Αύξηση Όγκου κατά την Πήξη του Νερού)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αύξηση όγκου", "πήξη νερού", "κύβος πάγου", "ανώμαλη διαστολή", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-ice-cube-in-beaker',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_ice_cube_in_beaker.png',
    title: "Παγάκι που Επιπλέει στην Επιφάνεια Ποτηριού με Υγρό Νερό",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "παγάκι", "επίπλευση", "πυκνότητα", "ποτήρι νερό", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-ice-freezing-6stages-flowchart',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_ice_freezing_6stages_flowchart.png',
    title: "Τα 6 Στάδια Πήξης & Επίπλευσης του Πάγου (Ψύξη → Επιβράδυνση → Κλείδωμα Δεσμών → Πλέγμα → Μείωση Πυκνότητας → Επίπλευση)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "στάδια πήξης", "ψύξη", "εξαγωνικό πλέγμα", "ζυγός πυκνότητας", "ο πάγος επιπλέει", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-phases-top-3icons-ice-drop-steam',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_phases_top_3icons_ice_drop_steam.png',
    title: "Οι Τρεις Φυσικές Καταστάσεις (Φάσεις) του Νερού: Στερεή (Πάγος), Υγρή (Νερό) & Αέρια (Υδρατμός)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "τρεις φάσεις νερού", "στερεό", "υγρό", "αέριο", "πάγος", "υδρατμός", "νερό", "H2O", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-phases-3molecular-states-comparison',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_phases_3molecular_states_comparison.png',
    title: "Μικροσκοπική Σύγκριση Μορίων Νερού στις 3 Φάσεις: 1. Στερεό (Πάγος), 2. Υγρό (Νερό), 3. Αέριο (Υδρατμός)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μικροσκοπική δομή", "μοριακή κίνηση", "στερεό", "υγρό", "αέριο", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-phases-transitions-6changes-diagram',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_phases_transitions_6changes_diagram.png',
    title: "Διάγραμμα Αλλαγών Φάσεων του Νερού: Τήξη, Πήξη, Εξάτμιση, Συμπύκνωση, Εξάχνωση & Απόθεση",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αλλαγές φάσεων", "τήξη", "πήξη", "εξάτμιση", "συμπύκνωση", "εξάχνωση", "απόθεση", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "βρασμός", "υγροποίηση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-boiling-pot-molecular-zoom-hero',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_boiling_pot_molecular_zoom_hero.png',
    title: "Ο Βρασμός του Νερού — Σχηματισμός Φυσαλίδων Υδρατμού σε Όλη τη Μάζα του Υγρού (100°C)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "βρασμός", "βρασμός νερού", "σημείο βρασμού", "100°C", "φυσαλίδες υδρατμού", "κατσαρόλα", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-boiling-3stages-molecular-columns',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_boiling_3stages_molecular_columns.png',
    title: "Μοριακή Εξέλιξη του Βρασμού: 1. Αύξηση Κίνησης Μορίων, 2. Σχηματισμός Φυσαλίδων στο Σημείο Βρασμού, 3. Διαφυγή Ατμού",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "στάδια βρασμού", "θραύση δεσμών υδρογόνου", "φυσαλίδες", "ατμός", "νερό", "H2O", "πάγος", "υδρατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-boiling-conditions-altitude-pressure-purity',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_boiling_conditions_altitude_pressure_purity.png',
    title: "Παράγοντες που Επηρεάζουν το Σημείο Βρασμού: Υψόμετρο, Εξωτερική Πίεση & Καθαρότητα Υγρού",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "συνθήκες βρασμού", "υψόμετρο", "ατμοσφαιρική πίεση", "καθαρότητα", "σημείο βρασμού", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-boiling-process-6steps-sequence',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_boiling_process_6steps_sequence.png',
    title: "Η Διαδικασία του Βρασμού σε 6 Βήματα (Θέρμανση → Επιτάχυνση Μορίων → Μικρές Φυσαλίδες → Άνοδος → Διάρρηξη → Υδρατμός)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "διαδικασία βρασμού", "θερμόμετρο", "φυσαλίδες ατμού", "υδρατμός", "νερό", "H2O", "πάγος", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-boiling-bottom-5summary-icons',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_boiling_bottom_5summary_icons.png',
    title: "Τα 5 Κλειδιά του Βρασμού: Παροχή Θερμότητας, Κινητική Ενέργεια Μορίων, Θραύση Δεσμών, Φυσαλίδες & Σταθερή Θερμοκρασία",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "θερμότητα", "κινητική ενέργεια", "σταθερή θερμοκρασία βρασμού", "νερό", "H2O", "πάγος", "υδρατμός", "ατμός", "πολικό μόριο", "δεσμός υδρογόνου", "δεσμοί υδρογόνου", "εξαγωνικό πλέγμα", "κρυσταλλική δομή", "πυκνότητα", "επίπλευση", "ανώμαλη διαστολή νερού", "4°C", "φάσεις του νερού", "φυσικές καταστάσεις", "στερεό", "υγρό", "αέριο", "τήξη", "πήξη", "εξάτμιση", "βρασμός", "συμπύκνωση", "υγροποίηση", "εξάχνωση", "απόθεση", "σημείο βρασμού", "100°C", "φυσαλίδες", "μόριο", "ενώσεις", "χημικές ενώσεις", "water", "ice", "boiling", "φυσική", "χημεία"],
  },
  {
    id: 'col-premium-atm-earth-atmosphere-molecular-zoom',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_atm_earth_atmosphere_molecular_zoom.png',
    title: "Η Ατμόσφαιρα της Γης & τα Μόρια του Αέρα (N2, O2) που Ασκούν Ατμοσφαιρική Πίεση",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ατμόσφαιρα γης", "μόρια αέρα", "ατμοσφαιρική πίεση", "στρώμα αέρα", "ατμόσφαιρα", "πίεση", "αέρας", "βάρος αέρα", "βαρύτητα", "πείραμα Torricelli", "τοριτσέλι", "torricelli", "υδράργυρος", "76 cm Hg", "κενό Torricelli", "1 atm", "1013 hPa", "Pascal", "mmHg", "Torr", "βαρόμετρο", "ισοβαρείς", "υψόμετρο", "χαμηλή πίεση", "υψηλή πίεση", "χύτρα ταχύτητας", "καλαμάκι", "atmospheric pressure", "barometer", "φυσική"],
  },
  {
    id: 'col-premium-atm-3columns-weight-gravity-omnidirectional',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_atm_3columns_weight_gravity_omnidirectional.png',
    title: "Πώς Προκύπτει η Ατμοσφαιρική Πίεση: Βάρος Αέρα, Βαρυτική Έλξη της Γης & Πίεση προς Όλες τις Κατευθύνσεις",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "βάρος αέρα", "βαρύτητα", "πίεση προς όλες τις κατευθύνσεις", "ατμοσφαιρική πίεση", "ατμόσφαιρα", "πίεση", "αέρας", "πείραμα Torricelli", "τοριτσέλι", "torricelli", "υδράργυρος", "76 cm Hg", "κενό Torricelli", "1 atm", "1013 hPa", "Pascal", "mmHg", "Torr", "βαρόμετρο", "ισοβαρείς", "υψόμετρο", "χαμηλή πίεση", "υψηλή πίεση", "χύτρα ταχύτητας", "καλαμάκι", "atmospheric pressure", "barometer", "φυσική"],
  },
  {
    id: 'col-premium-atm-torricelli-experiment-5steps',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_atm_torricelli_experiment_5steps.png',
    title: "Το Πείραμα του Torricelli σε 5 Στάδια — Σωλήνας Υδραργύρου 76 cm Hg & Κενό Torricelli (1 atm = 1013 hPa)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "πείραμα Torricelli", "τοριτσέλι", "76 cm Hg", "υδράργυρος", "κενό Torricelli", "1 atm", "ατμοσφαιρική πίεση", "ατμόσφαιρα", "πίεση", "αέρας", "βάρος αέρα", "βαρύτητα", "torricelli", "1013 hPa", "Pascal", "mmHg", "Torr", "βαρόμετρο", "ισοβαρείς", "υψόμετρο", "χαμηλή πίεση", "υψηλή πίεση", "χύτρα ταχύτητας", "καλαμάκι", "atmospheric pressure", "barometer", "φυσική"],
  },
  {
    id: 'col-premium-atm-effects-straw-lungs-cooker-house',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_atm_effects_straw_lungs_cooker_house.png',
    title: "Εφαρμογές & Επιδράσεις της Ατμοσφαιρικής Πίεσης: Καλαμάκι Ροφήματος, Αναπνοή στους Πνεύμονες, Χύτρα Ταχύτητας & Κτίρια",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "καλαμάκι", "αναπνοή", "πνεύμονες", "χύτρα ταχύτητας", "εφαρμογές ατμοσφαιρικής πίεσης", "ατμοσφαιρική πίεση", "ατμόσφαιρα", "πίεση", "αέρας", "βάρος αέρα", "βαρύτητα", "πείραμα Torricelli", "τοριτσέλι", "torricelli", "υδράργυρος", "76 cm Hg", "κενό Torricelli", "1 atm", "1013 hPa", "Pascal", "mmHg", "Torr", "βαρόμετρο", "ισοβαρείς", "υψόμετρο", "χαμηλή πίεση", "υψηλή πίεση", "atmospheric pressure", "barometer", "φυσική"],
  },
  {
    id: 'col-premium-atm-variations-altitude-weather-isobars-barometer',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_atm_variations_altitude_weather_isobars_barometer.png',
    title: "Μεταβολές Ατμοσφαιρικής Πίεσης: Υψόμετρο, Καιρός, Χαμηλό/Υψηλό Βαρομετρικό, Ισοβαρείς Χάρτες & Βαρόμετρο",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "βαρόμετρο", "ισοβαρείς καμπύλες", "υψόμετρο", "βαρομετρικό χαμηλό", "βαρομετρικό υψηλό", "καιρός", "ατμοσφαιρική πίεση", "ατμόσφαιρα", "πίεση", "αέρας", "βάρος αέρα", "βαρύτητα", "πείραμα Torricelli", "τοριτσέλι", "torricelli", "υδράργυρος", "76 cm Hg", "κενό Torricelli", "1 atm", "1013 hPa", "Pascal", "mmHg", "Torr", "ισοβαρείς", "χαμηλή πίεση", "υψηλή πίεση", "χύτρα ταχύτητας", "καλαμάκι", "atmospheric pressure", "barometer", "φυσική"],
  },
  {
    id: 'col-premium-carbon-atom-tetrahedral-bonds',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_carbon_atom_tetrahedral_bonds.png',
    title: "Άτομο Άνθρακα (C) — Τετραεδρική Διάταξη 4 Ομοιοπολικών Δεσμών",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "άτομο άνθρακα", "τετρασθενής άνθρακας", "ομοιοπολικός δεσμός", "άνθρακας", "C", "ατομικός αριθμός 6", "4 ηλεκτρόνια σθένους", "τετρασθενής", "αλυσίδες άνθρακα", "δακτύλιοι", "αλλοτροπικές μορφές", "αλλοτροπία", "διαμάντι", "γραφίτης", "γραφένιο", "φουλερένια", "C60", "νανοτεχνολογία", "κύκλος του άνθρακα", "οργανική χημεία", "ορυκτά καύσιμα", "βιομόρια", "μόριο", "ενώσεις", "χημικές ενώσεις", "carbon", "allotropes", "χημεία"],
  },
  {
    id: 'col-premium-carbon-hero-coal-diamond-graphite-graphene',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_carbon_hero_coal_diamond_graphite_graphene.png',
    title: "Ο Άνθρακας στη Φύση & στην Τεχνολογία: Γαιάνθρακας, Διαμάντι, Μολύβι Γραφίτη & Πλέγμα Γραφενίου",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "γαιάνθρακας", "διαμάντι", "γραφίτης", "μολύβι", "γραφένιο", "άνθρακας", "C", "άτομο άνθρακα", "ατομικός αριθμός 6", "4 ηλεκτρόνια σθένους", "ομοιοπολικός δεσμός", "τετρασθενής", "αλυσίδες άνθρακα", "δακτύλιοι", "αλλοτροπικές μορφές", "αλλοτροπία", "φουλερένια", "C60", "νανοτεχνολογία", "κύκλος του άνθρακα", "οργανική χημεία", "ορυκτά καύσιμα", "βιομόρια", "μόριο", "ενώσεις", "χημικές ενώσεις", "carbon", "allotropes", "χημεία"],
  },
  {
    id: 'col-premium-carbon-bohr-model-6protons-6neutrons',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_carbon_bohr_model_6protons_6neutrons.png',
    title: "Ατομικό Πρότυπο Bohr του Άνθρακα (Z=6, 6p+, 6n0, Ηλεκτρονιακή Δομή K=2, L=4)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "πρότυπο Bohr", "πυρήνας άνθρακα", "6 πρωτόνια", "6 νετρόνια", "4 ηλεκτρόνια σθένους", "άνθρακας", "C", "άτομο άνθρακα", "ατομικός αριθμός 6", "ομοιοπολικός δεσμός", "τετρασθενής", "αλυσίδες άνθρακα", "δακτύλιοι", "αλλοτροπικές μορφές", "αλλοτροπία", "διαμάντι", "γραφίτης", "γραφένιο", "φουλερένια", "C60", "νανοτεχνολογία", "κύκλος του άνθρακα", "οργανική χημεία", "ορυκτά καύσιμα", "βιομόρια", "μόριο", "ενώσεις", "χημικές ενώσεις", "carbon", "allotropes", "χημεία"],
  },
  {
    id: 'col-premium-carbon-periodic-table-tile',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_carbon_periodic_table_tile.png',
    title: "Ο Άνθρακας στον Περιοδικό Πίνακα (6 C, Ατομικό Βάρος 12.01, Ομάδα 14 IVA, Περίοδος 2)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "περιοδικός πίνακας", "ομάδα 14", "περίοδος 2", "12.01", "άνθρακας", "C", "άτομο άνθρακα", "ατομικός αριθμός 6", "4 ηλεκτρόνια σθένους", "ομοιοπολικός δεσμός", "τετρασθενής", "αλυσίδες άνθρακα", "δακτύλιοι", "αλλοτροπικές μορφές", "αλλοτροπία", "διαμάντι", "γραφίτης", "γραφένιο", "φουλερένια", "C60", "νανοτεχνολογία", "κύκλος του άνθρακα", "οργανική χημεία", "ορυκτά καύσιμα", "βιομόρια", "μόριο", "ενώσεις", "χημικές ενώσεις", "carbon", "allotropes", "χημεία"],
  },
  {
    id: 'col-premium-carbon-4covalent-bonds-model',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_carbon_4covalent_bonds_model.png',
    title: "Σχηματισμός 4 Ομοιοπολικών Δεσμών από το Άτομο του Άνθρακα (1s² 2s² 2p²)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "τέσσερις ομοιοπολικοί δεσμοί", "ηλεκτρόνια σθένους", "ομοιοπολικός δεσμός", "άνθρακας", "C", "άτομο άνθρακα", "ατομικός αριθμός 6", "4 ηλεκτρόνια σθένους", "τετρασθενής", "αλυσίδες άνθρακα", "δακτύλιοι", "αλλοτροπικές μορφές", "αλλοτροπία", "διαμάντι", "γραφίτης", "γραφένιο", "φουλερένια", "C60", "νανοτεχνολογία", "κύκλος του άνθρακα", "οργανική χημεία", "ορυκτά καύσιμα", "βιομόρια", "μόριο", "ενώσεις", "χημικές ενώσεις", "carbon", "allotropes", "χημεία"],
  },
  {
    id: 'col-premium-carbon-allotropes-diamond-graphite-graphene-fullerene',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_carbon_allotropes_diamond_graphite_graphene_fullerene.png',
    title: "Οι 4 Αλλοτροπικές Μορφές του Άνθρακα: Διαμάντι, Γραφίτης, Γραφένιο & Φουλερένια (C60)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αλλοτροπικές μορφές άνθρακα", "διαμάντι", "γραφίτης", "γραφένιο", "φουλερένια", "C60", "άνθρακας", "C", "άτομο άνθρακα", "ατομικός αριθμός 6", "4 ηλεκτρόνια σθένους", "ομοιοπολικός δεσμός", "τετρασθενής", "αλυσίδες άνθρακα", "δακτύλιοι", "αλλοτροπικές μορφές", "αλλοτροπία", "νανοτεχνολογία", "κύκλος του άνθρακα", "οργανική χημεία", "ορυκτά καύσιμα", "βιομόρια", "μόριο", "ενώσεις", "χημικές ενώσεις", "carbon", "allotropes", "χημεία"],
  },
  {
    id: 'col-premium-carbon-diamond-crystal-structure',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_carbon_diamond_crystal_structure.png',
    title: "Διαμάντι & το Τετραεδρικό Κρυσταλλικό Πλέγμα Ατόμων Άνθρακα",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "διαμάντι", "τετραεδρικό πλέγμα", "κρύσταλλος διαμαντιού", "άνθρακας", "C", "άτομο άνθρακα", "ατομικός αριθμός 6", "4 ηλεκτρόνια σθένους", "ομοιοπολικός δεσμός", "τετρασθενής", "αλυσίδες άνθρακα", "δακτύλιοι", "αλλοτροπικές μορφές", "αλλοτροπία", "γραφίτης", "γραφένιο", "φουλερένια", "C60", "νανοτεχνολογία", "κύκλος του άνθρακα", "οργανική χημεία", "ορυκτά καύσιμα", "βιομόρια", "μόριο", "ενώσεις", "χημικές ενώσεις", "carbon", "allotropes", "χημεία"],
  },
  {
    id: 'col-premium-carbon-graphite-layered-structure',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_carbon_graphite_layered_structure.png',
    title: "Γραφίτης — Επίπεδα Εξαγωνικά Στρώματα Ατόμων Άνθρακα (Αγωγός του Ηλεκτρισμού)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "γραφίτης", "εξαγωνικά στρώματα", "αγωγός ηλεκτρισμού", "άνθρακας", "C", "άτομο άνθρακα", "ατομικός αριθμός 6", "4 ηλεκτρόνια σθένους", "ομοιοπολικός δεσμός", "τετρασθενής", "αλυσίδες άνθρακα", "δακτύλιοι", "αλλοτροπικές μορφές", "αλλοτροπία", "διαμάντι", "γραφένιο", "φουλερένια", "C60", "νανοτεχνολογία", "κύκλος του άνθρακα", "οργανική χημεία", "ορυκτά καύσιμα", "βιομόρια", "μόριο", "ενώσεις", "χημικές ενώσεις", "carbon", "allotropes", "χημεία"],
  },
  {
    id: 'col-premium-carbon-cycle-ecosystem-diagram',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_carbon_cycle_ecosystem_diagram.png',
    title: "Ο Κύκλος του Άνθρακα στη Φύση (Ατμοσφαιρικό CO2, Φωτοσύνθεση, Αναπνοή, Ηφαίστεια, Ορυκτά Καύσιμα & Ωκεανοί)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κύκλος του άνθρακα", "CO2", "φωτοσύνθεση", "ορυκτά καύσιμα", "ιζηματογενή πετρώματα", "ωκεανοί", "άνθρακας", "C", "άτομο άνθρακα", "ατομικός αριθμός 6", "4 ηλεκτρόνια σθένους", "ομοιοπολικός δεσμός", "τετρασθενής", "αλυσίδες άνθρακα", "δακτύλιοι", "αλλοτροπικές μορφές", "αλλοτροπία", "διαμάντι", "γραφίτης", "γραφένιο", "φουλερένια", "C60", "νανοτεχνολογία", "οργανική χημεία", "βιομόρια", "μόριο", "ενώσεις", "χημικές ενώσεις", "carbon", "allotropes", "χημεία"],
  },
  {
    id: 'col-premium-carbon-bottom-7summary-icons',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_carbon_bottom_7summary_icons.png',
    title: "Σύνοψη Ιδιοτήτων του Άνθρακα: Άτομο C, Δεσμοί C–C, Αλυσίδες & Δακτύλιοι, Αλλοτροπίες, Κύκλος στη Φύση & Εφαρμογές",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αλυσίδες άνθρακα", "δακτύλιοι άνθρακα", "δεσμός C-C", "θεμέλιο της ζωής", "άνθρακας", "C", "άτομο άνθρακα", "ατομικός αριθμός 6", "4 ηλεκτρόνια σθένους", "ομοιοπολικός δεσμός", "τετρασθενής", "δακτύλιοι", "αλλοτροπικές μορφές", "αλλοτροπία", "διαμάντι", "γραφίτης", "γραφένιο", "φουλερένια", "C60", "νανοτεχνολογία", "κύκλος του άνθρακα", "οργανική χημεία", "ορυκτά καύσιμα", "βιομόρια", "μόριο", "ενώσεις", "χημικές ενώσεις", "carbon", "allotropes", "χημεία"],
  },
  {
    id: 'col-premium-alkanes-methane-ch4-3d-molecule',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_alkanes_methane_ch4_3d_molecule.png',
    title: "Μόριο Μεθανίου (CH4) — Το Απλούστερο Αλκάνιο σε 3D Τετραεδρική Δομή",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "μεθάνιο", "CH4", "αλκάνιο", "3d μόριο", "τετραεδρική δομή", "αλκάνια", "κορεσμένοι υδρογονάνθρακες", "υδρογονάνθρακες", "ομόλογη σειρά", "CnH2n+2", "αιθάνιο", "C2H6", "προπάνιο", "C3H8", "βουτάνιο", "C4H10", "πεντάνιο", "C5H12", "απλός ομοιοπολικός δεσμός", "τετραεδρική γεωμετρία", "καύση", "τέλεια καύση", "αλογόνωση", "πυρόλυση", "κρακινγκ", "αργό πετρέλαιο", "φυσικό αέριο", "κλασματική απόσταξη", "βενζίνη", "κηροζίνη", "ντίζελ", "παραφίνη", "μόριο", "ενώσεις", "οργανικές ενώσεις", "alkanes", "hydrocarbons", "χημεία"],
  },
  {
    id: 'col-premium-alkanes-hero-barrel-burner-gas-cylinder',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_alkanes_hero_barrel_burner_gas_cylinder.png',
    title: "Τα Αλκάνια ως Καύσιμα & Πρώτες Ύλες: Βαρέλι Πετρελαίου, Καυστήρας Φυσικού Αερίου & Φιάλη Υγραερίου (Προπάνιο/Βουτάνιο)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "καύσιμα", "βαρέλι πετρελαίου", "φυσικό αέριο", "υγραέριο", "προπάνιο", "βουτάνιο", "αλκάνια", "κορεσμένοι υδρογονάνθρακες", "υδρογονάνθρακες", "ομόλογη σειρά", "CnH2n+2", "μεθάνιο", "CH4", "αιθάνιο", "C2H6", "C3H8", "C4H10", "πεντάνιο", "C5H12", "απλός ομοιοπολικός δεσμός", "τετραεδρική γεωμετρία", "καύση", "τέλεια καύση", "αλογόνωση", "πυρόλυση", "κρακινγκ", "αργό πετρέλαιο", "κλασματική απόσταξη", "βενζίνη", "κηροζίνη", "ντίζελ", "παραφίνη", "μόριο", "ενώσεις", "οργανικές ενώσεις", "alkanes", "hydrocarbons", "χημεία"],
  },
  {
    id: 'col-premium-alkanes-ethane-tetrahedral-geometry',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_alkanes_ethane_tetrahedral_geometry.png',
    title: "Συντακτικός Τύπος Αιθανίου (C2H6) & Τετραεδρική Γεωμετρία Απλών Ομοιοπολικών Δεσμών σ (109,5°)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αιθάνιο", "C2H6", "δεσμός σ", "τετραεδρική γεωμετρία", "συντακτικός τύπος", "αλκάνια", "κορεσμένοι υδρογονάνθρακες", "υδρογονάνθρακες", "ομόλογη σειρά", "CnH2n+2", "μεθάνιο", "CH4", "προπάνιο", "C3H8", "βουτάνιο", "C4H10", "πεντάνιο", "C5H12", "απλός ομοιοπολικός δεσμός", "καύση", "τέλεια καύση", "αλογόνωση", "πυρόλυση", "κρακινγκ", "αργό πετρέλαιο", "φυσικό αέριο", "κλασματική απόσταξη", "βενζίνη", "κηροζίνη", "ντίζελ", "παραφίνη", "μόριο", "ενώσεις", "οργανικές ενώσεις", "alkanes", "hydrocarbons", "χημεία"],
  },
  {
    id: 'col-premium-alkanes-states-gas-liquid-solid',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_alkanes_states_gas_liquid_solid.png',
    title: "Φυσική Κατάσταση Αλκανίων ανά Αριθμό Ατόμων Άνθρακα: C1–C4 Αέρια, C5–C17 Υγρά, ≥C18 Στερεά (Παραφίνη)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "φυσικές καταστάσεις αλκανίων", "αέρια αλκάνια", "υγρά αλκάνια", "στερεά αλκάνια", "παραφίνη", "αλκάνια", "κορεσμένοι υδρογονάνθρακες", "υδρογονάνθρακες", "ομόλογη σειρά", "CnH2n+2", "μεθάνιο", "CH4", "αιθάνιο", "C2H6", "προπάνιο", "C3H8", "βουτάνιο", "C4H10", "πεντάνιο", "C5H12", "απλός ομοιοπολικός δεσμός", "τετραεδρική γεωμετρία", "καύση", "τέλεια καύση", "αλογόνωση", "πυρόλυση", "κρακινγκ", "αργό πετρέλαιο", "φυσικό αέριο", "κλασματική απόσταξη", "βενζίνη", "κηροζίνη", "ντίζελ", "μόριο", "ενώσεις", "οργανικές ενώσεις", "alkanes", "hydrocarbons", "χημεία"],
  },
  {
    id: 'col-premium-alkanes-combustion-ch4-reaction',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_alkanes_combustion_ch4_reaction.png',
    title: "Τέλεια Καύση Μεθανίου: CH4 + 2O2 → CO2 + 2H2O + Θερμική Ενέργεια",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "τέλεια καύση", "καύση μεθανίου", "CH4 + 2O2", "CO2", "H2O", "εξώθερμη αντίδραση", "αλκάνια", "κορεσμένοι υδρογονάνθρακες", "υδρογονάνθρακες", "ομόλογη σειρά", "CnH2n+2", "μεθάνιο", "CH4", "αιθάνιο", "C2H6", "προπάνιο", "C3H8", "βουτάνιο", "C4H10", "πεντάνιο", "C5H12", "απλός ομοιοπολικός δεσμός", "τετραεδρική γεωμετρία", "καύση", "αλογόνωση", "πυρόλυση", "κρακινγκ", "αργό πετρέλαιο", "φυσικό αέριο", "κλασματική απόσταξη", "βενζίνη", "κηροζίνη", "ντίζελ", "παραφίνη", "μόριο", "ενώσεις", "οργανικές ενώσεις", "alkanes", "hydrocarbons", "χημεία"],
  },
  {
    id: 'col-premium-alkanes-natural-sources-oil-gas-extraction',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_alkanes_natural_sources_oil_gas_extraction.png',
    title: "Φυσικές Πηγές Αλκανίων — Θαλάσσια Πλατφόρμα Άντλησης, Γεωλογικά Κοιτάσματα Αργού Πετρελαίου & Φυσικού Αερίου",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "εξόρυξη πετρελαίου", "κοιτάσματα πετρελαίου", "φυσικό αέριο", "αργό πετρέλαιο", "γεώτρηση", "αλκάνια", "κορεσμένοι υδρογονάνθρακες", "υδρογονάνθρακες", "ομόλογη σειρά", "CnH2n+2", "μεθάνιο", "CH4", "αιθάνιο", "C2H6", "προπάνιο", "C3H8", "βουτάνιο", "C4H10", "πεντάνιο", "C5H12", "απλός ομοιοπολικός δεσμός", "τετραεδρική γεωμετρία", "καύση", "τέλεια καύση", "αλογόνωση", "πυρόλυση", "κρακινγκ", "κλασματική απόσταξη", "βενζίνη", "κηροζίνη", "ντίζελ", "παραφίνη", "μόριο", "ενώσεις", "οργανικές ενώσεις", "alkanes", "hydrocarbons", "χημεία"],
  },
  {
    id: 'col-premium-alkanes-fractional-distillation-tower',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_alkanes_fractional_distillation_tower.png',
    title: "Κλασματική Απόσταξη Αργού Πετρελαίου — Αποστακτική Στήλη & Κλάσματα (Υγραέριο, Βενζίνη, Κηροζίνη, Ντίζελ, Μαζούτ/Άσφαλτος)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κλασματική απόσταξη", "διυλιστήριο", "κλάσματα πετρελαίου", "βενζίνη", "κηροζίνη", "ντίζελ", "παραφίνη", "αλκάνια", "κορεσμένοι υδρογονάνθρακες", "υδρογονάνθρακες", "ομόλογη σειρά", "CnH2n+2", "μεθάνιο", "CH4", "αιθάνιο", "C2H6", "προπάνιο", "C3H8", "βουτάνιο", "C4H10", "πεντάνιο", "C5H12", "απλός ομοιοπολικός δεσμός", "τετραεδρική γεωμετρία", "καύση", "τέλεια καύση", "αλογόνωση", "πυρόλυση", "κρακινγκ", "αργό πετρέλαιο", "φυσικό αέριο", "μόριο", "ενώσεις", "οργανικές ενώσεις", "alkanes", "hydrocarbons", "χημεία"],
  },
  {
    id: 'col-premium-alkanes-everyday-uses-7icons-row',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_alkanes_everyday_uses_7icons_row.png',
    title: "Τα Αλκάνια στην Καθημερινή Ζωή: Μαγείρεμα/Θέρμανση, Καύσιμα Οχημάτων, Κεριά, Λιπαντικά, Πλαστικά, Απορρυπαντικά & Αεροσκάφη",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "χρήσεις αλκανίων", "πετροχημικά", "πλαστικά", "κεριά παραφίνης", "λιπαντικά", "καύσιμα", "αλκάνια", "κορεσμένοι υδρογονάνθρακες", "υδρογονάνθρακες", "ομόλογη σειρά", "CnH2n+2", "μεθάνιο", "CH4", "αιθάνιο", "C2H6", "προπάνιο", "C3H8", "βουτάνιο", "C4H10", "πεντάνιο", "C5H12", "απλός ομοιοπολικός δεσμός", "τετραεδρική γεωμετρία", "καύση", "τέλεια καύση", "αλογόνωση", "πυρόλυση", "κρακινγκ", "αργό πετρέλαιο", "φυσικό αέριο", "κλασματική απόσταξη", "βενζίνη", "κηροζίνη", "ντίζελ", "παραφίνη", "μόριο", "ενώσεις", "οργανικές ενώσεις", "alkanes", "hydrocarbons", "χημεία"],
  },
  {
    id: 'col-premium-resistance-electric-field-electrons',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resistance_electric_field_electrons.png',
    title: "Ηλεκτρικό Πεδίο & Επιτάχυνση Ελεύθερων Ηλεκτρονίων ανάμεσα στα Ιόντα Μεταλλικού Αγωγού",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ηλεκτρική αντίσταση", "αντίσταση", "ηλεκτρικό πεδίο", "ελεύθερα ηλεκτρόνια", "ιόντα μετάλλου", "μεταλλικός αγωγός", "καλώδιο", "τάση", "ηλεκτρικό ρεύμα", "νόμος του Ohm", "ωμ", "φυσική", "ηλεκτρισμός", "electric field", "electrons", "electrical resistance"],
  },
  {
    id: 'col-premium-resistance-copper-wire-cross-section',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resistance_copper_wire_cross_section.png',
    title: "Τομή Χάλκινου Καλωδίου (Αγωγού) — Μικροσκοπικές Συγκρούσεις Ελεύθερων Ηλεκτρονίων με τα Ιόντα του Μετάλλου",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ηλεκτρική αντίσταση", "αντίσταση", "χάλκινο καλώδιο", "αγωγός", "μικροσκοπικές συγκρούσεις", "ελεύθερα ηλεκτρόνια", "ιόντα μετάλλου", "φαινόμενο Joule", "ηλεκτρικό ρεύμα", "νόμος του Ohm", "φυσική", "ηλεκτρισμός", "copper wire", "electron collisions", "electrical resistance"],
  },
  {
    id: 'col-premium-resistance-electron-ion-collisions',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_resistance_electron_ion_collisions.png',
    title: "Ηλεκτρική Αντίσταση: Επιβράδυνση & Εκτροπή Ηλεκτρονίων λόγω Συγκρούσεων με τα Ιόντα του Μετάλλου",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ηλεκτρική αντίσταση", "αντίσταση", "συγκρούσεις ηλεκτρονίων", "ελεύθερα ηλεκτρόνια", "ιόντα μετάλλου", "επιβράδυνση ηλεκτρονίων", "αγωγός", "καλώδιο", "ηλεκτρικό ρεύμα", "νόμος του Ohm", "φυσική", "ηλεκτρισμός", "electron ion collisions", "electrical resistance"],
  },
  {
    id: 'col-premium-cell-plant-eukaryotic-isolated',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_plant_eukaryotic_isolated.png',
    title: "Φυτικό Ευκαρυωτικό Κύτταρο (Κυτταρικό Τείχος, Χλωροπλάστες, Χυμοτόπιο, Πυρήνας & Οργανίδια)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κύτταρο", "φυτικό κύτταρο", "ευκαρυωτικό κύτταρο", "χλωροπλάστης", "χυμοτόπιο", "κυτταρικό τείχος", "πυρήνας", "μιτοχόνδριο", "βιολογία", "plant cell"],
  },
  {
    id: 'col-premium-cell-animal-eukaryotic-isolated',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_animal_eukaryotic_isolated.png',
    title: "Ζωικό Ευκαρυωτικό Κύτταρο (Κυτταρική Μεμβράνη, Πυρήνας, Μιτοχόνδρια, Ενδοπλασματικό Δίκτυο & Golgi)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κύτταρο", "ζωικό κύτταρο", "ευκαρυωτικό κύτταρο", "πυρήνας", "μιτοχόνδριο", "σύμπλεγμα Golgi", "ενδοπλασματικό δίκτυο", "βιολογία", "animal cell"],
  },
  {
    id: 'col-premium-cell-prokaryotic-clean',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_cell_prokaryotic_clean.png',
    title: "Προκαρυωτικό Κύτταρο (Βακτήριο — Νουκλεοειδές, Ριβοσώματα, Κυτταρικό Τείχος & Μαστίγιο)",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "κύτταρο", "προκαρυωτικό κύτταρο", "βακτήριο", "νουκλεοειδές", "μαστίγιο", "βιολογία", "prokaryotic cell"],
  },
  {
    id: 'col-premium-circuit-closed-bulb-lit',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_circuit_closed_bulb_lit.png',
    title: "Κλειστό Ηλεκτρικό Κύκλωμα — Ροή Ελεύθερων Ηλεκτρονίων, Κλειστός Διακόπτης & Φωτοβόλος Λαμπτήρας",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ηλεκτρικό κύκλωμα", "κλειστό κύκλωμα", "ροή ρεύματος", "ηλεκτρικό ρεύμα", "ελεύθερα ηλεκτρόνια", "μπαταρία", "κλειστός διακόπτης", "λαμπτήρας", "φυσική", "ηλεκτρισμός", "closed circuit", "electric circuit"],
  },
  {
    id: 'col-premium-circuit-open-bulb-off',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_circuit_open_bulb_off.png',
    title: "Ανοιχτό Ηλεκτρικό Κύκλωμα — Ανοιχτός Διακόπτης, Διακοπή Ροής Ηλεκτρονίων & Σβηστός Λαμπτήρας",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ηλεκτρικό κύκλωμα", "ανοιχτό κύκλωμα", "διακοπή ροής", "ανοιχτός διακόπτης", "μπαταρία", "σβηστός λαμπτήρας", "ηλεκτρικό ρεύμα", "φυσική", "ηλεκτρισμός", "open circuit", "electric circuit"],
  },
  {
    id: 'col-premium-circuit-source-battery-chemical',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_circuit_source_battery_chemical.png',
    title: "Ηλεκτρική Πηγή: Μπαταρία (Ηλεκτρικό Στοιχείο) — Μετατροπή Χημικής Ενέργειας σε Ηλεκτρική",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ηλεκτρικό κύκλωμα", "ηλεκτρική πηγή", "μπαταρία", "ηλεκτρικό στοιχείο", "χημική ενέργεια", "ηλεκτρική ενέργεια", "φυσική", "ηλεκτρισμός", "battery", "chemical energy"],
  },
  {
    id: 'col-premium-circuit-source-generator-kinetic',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_circuit_source_generator_kinetic.png',
    title: "Ηλεκτρική Πηγή: Γεννήτρια (Τουρμπίνα & Πηνίο) — Μετατροπή Κινητικής (Μηχανικής) Ενέργειας σε Ηλεκτρική",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ηλεκτρικό κύκλωμα", "ηλεκτρική πηγή", "γεννήτρια", "τουρμπίνα", "πηνίο", "κινητική ενέργεια", "μηχανική ενέργεια", "ηλεκτρική ενέργεια", "φυσική", "ηλεκτρισμός", "generator", "kinetic energy"],
  },
  {
    id: 'col-premium-circuit-source-solar-photovoltaic',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_circuit_source_solar_photovoltaic.png',
    title: "Ηλεκτρική Πηγή: Φωτοστοιχείο (Φωτοβολταϊκό Πάνελ) — Μετατροπή Φωτεινής Ενέργειας (Ακτινοβολίας) σε Ηλεκτρική",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ηλεκτρικό κύκλωμα", "ηλεκτρική πηγή", "φωτοστοιχείο", "φωτοβολταϊκό", "ηλιακή ενέργεια", "ενέργεια ακτινοβολίας", "ηλεκτρική ενέργεια", "φυσική", "ηλεκτρισμός", "solar panel", "photovoltaic"],
  },
  {
    id: 'col-premium-circuit-source-thermocouple-thermal',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_circuit_source_thermocouple_thermal.png',
    title: "Ηλεκτρική Πηγή: Θερμοστοιχείο (Θερμοζεύγος) — Μετατροπή Θερμικής Ενέργειας σε Ηλεκτρική",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ηλεκτρικό κύκλωμα", "ηλεκτρική πηγή", "θερμοστοιχείο", "θερμοζεύγος", "θερμική ενέργεια", "ηλεκτρική ενέργεια", "βολτόμετρο", "φυσική", "ηλεκτρισμός", "thermocouple", "thermal energy"],
  },
  {
    id: 'col-premium-conductors-vs-insulators-cylinder',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_conductors_vs_insulators_cylinder.png',
    title: "Αγωγοί vs. Μονωτές — Σύγκριση Ελεύθερων Ηλεκτρονίων σε Μεταλλικό Αγωγό (Χαλκός) & Δέσμιων Ηλεκτρονίων σε Μονωτή",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "αγωγοί", "μονωτές", "αγωγός", "μονωτής", "ελεύθερα ηλεκτρόνια", "δέσμια ηλεκτρόνια", "ιόντα μετάλλου", "ηλεκτρικό ρεύμα", "χαλκός", "φυσική", "ηλεκτρισμός", "conductors", "insulators"],
  },
  {
    id: 'col-premium-current-random-thermal-motion',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_current_random_thermal_motion.png',
    title: "Χωρίς Ηλεκτρική Πηγή: Άτακτη (Τυχαία Θερμική) Κίνηση Ελεύθερων Ηλεκτρονίων σε Μεταλλικό Αγωγό",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "άτακτη κίνηση", "τυχαία κίνηση", "θερμική κίνηση", "ελεύθερα ηλεκτρόνια", "χωρίς πηγή", "μεταλλικός αγωγός", "ιόντα μετάλλου", "ηλεκτρικό ρεύμα", "φυσική", "ηλεκτρισμός", "random motion", "free electrons"],
  },
  {
    id: 'col-premium-current-battery-directed-flow',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_current_battery_directed_flow.png',
    title: "Με Ηλεκτρική Πηγή (Μπαταρία): Προσανατολισμένη Κίνηση Ελεύθερων Ηλεκτρονίων & Γέννηση Ηλεκτρικού Ρεύματος",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "προσανατολισμένη κίνηση", "ηλεκτρικό ρεύμα", "ηλεκτρική πηγή", "μπαταρία", "ελεύθερα ηλεκτρόνια", "ηλεκτρικό πεδίο", "αγωγός", "φυσική", "ηλεκτρισμός", "directed electron flow", "electric current"],
  },
  {
    id: 'col-premium-current-resistor-flow-result',
    iconifyId: 'local-png:/mind_maps/premium_pdf/premium_current_resistor_flow_result.png',
    title: "Αποτέλεσμα: Ηλεκτρικό Ρεύμα σε Μεταλλικό Αγωγό & Διέλευση από Αντιστάτη",
    category: "Σχολικά & Εργαστήριο",
    colorStyle: 'multicolor',
    tags: ["premium", "ηλεκτρικό ρεύμα", "προσανατολισμένη κίνηση", "ελεύθερα ηλεκτρόνια", "αντιστάτης", "αγωγός", "φυσική", "ηλεκτρισμός", "electric current", "resistor"],
  },
];

// Greek-to-English dictionary for live Iconify online search (200,000+ icons)
const GREEK_TO_ENGLISH_ICON_DICT: Record<string, string> = {
  βελος: 'arrow',
  βελακι: 'arrow',
  βελακια: 'arrow',
  γραναζι: 'gear',
  γραναζια: 'gears',
  αμαξι: 'car',
  αμαξακι: 'car',
  αυτοκινητο: 'car',
  φορτηγο: 'truck',
  τρενο: 'train',
  αεροπλανο: 'airplane',
  πυραυλος: 'rocket',
  ποδηλατο: 'bicycle',
  πλοιο: 'ship',
  βαρκα: 'boat',
  μαγνητης: 'magnet',
  μπαταρια: 'battery',
  λαμπα: 'light bulb',
  ζυγαρια: 'balance scale',
  εργαλειο: 'wrench tool',
  ρολοι: 'clock',
  χρονομετρο: 'stopwatch',
  βιβλιο: 'book',
  βιβλια: 'books',
  τετραδιο: 'notebook',
  μολυβι: 'pencil',
  στυλο: 'pen',
  χαρακας: 'ruler',
  τσάντα: 'backpack',
  τσαντα: 'backpack',
  μικροσκοπιο: 'microscope',
  τηλεσκοπιο: 'telescope',
  σωληνας: 'test tube',
  φιαλη: 'flask',
  ατομο: 'atom',
  dna: 'dna',
  υδρογειος: 'globe',
  γη: 'earth globe',
  χαρτης: 'map',
  δασκαλος: 'teacher',
  καθηγητης: 'teacher',
  μαθητης: 'student',
  επιστημονας: 'scientist',
  γιατρος: 'doctor',
  μηχανικος: 'mechanic engineer',
  αστροναυτης: 'astronaut',
  πυροσβεστης: 'firefighter',
  πιλοτος: 'pilot',
  σεφ: 'chef cook',
  μαγειρας: 'cook',
  καλλιτεχνης: 'artist',
  αγροτης: 'farmer',
  αστυνομικος: 'police',
  χαμογελο: 'smile emoji',
  emoticon: 'emoji smile',
  emoji: 'emoji',
  αστερι: 'star',
  κυπελλο: 'trophy',
  μεταλλιο: 'medal',
  φωτια: 'fire',
  κεραυνος: 'lightning bolt',
  κεραυνοι: 'lightning bolt',
  θαυμαστικο: 'exclamation mark',
  θαυμαστικα: 'exclamation mark',
  πυροτεχνημα: 'fireworks',
  πυροτεχνηματα: 'fireworks',
  βεγγαλικο: 'sparkler',
  εκρηξη: 'explosion boom',
  πενα: 'fountain pen',
  μαρκαδορος: 'marker pen',
  πινελο: 'paintbrush',
  καρδια: 'heart',
  εγκεφαλος: 'brain',
  μυαλο: 'brain',
  ιδεα: 'idea bulb',
  κυβος: 'cube',
  σφαιρα: 'sphere',
  κυλινδρος: 'cylinder',
  πυραμιδα: 'pyramid',
  κωνος: 'cone',
  γραφημα: 'chart',
  σκυλος: 'dog',
  γατα: 'cat',
  δεντρο: 'tree',
  λουλουδι: 'flower',
  σπιτι: 'house',
  ηλιος: 'sun',
  συννεφο: 'cloud',
  βροχη: 'rain',
  μπαλα: 'ball',
  μουσικη: 'music',
  υπολογιστης: 'computer laptop',
  φορτιο: 'electric bolt',
  τροφη: 'food',
  τροφες: 'food',
  φαγητο: 'food',
  φρουτο: 'fruit',
  μηλο: 'apple',
  ψωμι: 'bread',
  κυτταρο: 'microbe cell',
  βακτηριο: 'bacteria microbe',
  ιος: 'virus microbe',
  δυναμη: 'muscle force',
  νερο: 'water drop',
  σταγονα: 'water drop',
  ηφαιστειο: 'volcano',
  βουνο: 'mountain',
  θαλασσα: 'ocean wave',
  κυμα: 'wave',
  θερμομετρο: 'thermometer',
  πυξιδα: 'compass',
  φυτο: 'plant seedling',
  ζωο: 'animal paw',
  ψαρι: 'fish',
  πουλι: 'bird',
  ανθρωπος: 'person',
  σκελετος: 'bone',
  πνευμονας: 'lungs',
  ματι: 'eye',
  αυτι: 'ear',
  χερι: 'hand',
  ηχος: 'speaker sound',
  φως: 'light sun',
  φακος: 'magnifying glass',
  βαρος: 'weight',
  ταχυτητα: 'speedometer',
  μυκητας: 'mushroom',
  σεισμος: 'earthquake',
  μοριο: 'molecule',
  ενωση: 'chemistry flask',
  αγωγος: 'electric wire',
  μονωτης: 'shield',
  κυκλωμα: 'circuit',
};

export function translateGreekStickerQueryToEnglish(rawQuery: string): string {
  const norm = rawQuery
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ς/g, 'σ')
    .trim();
  if (!norm) return '';
  if (GREEK_TO_ENGLISH_ICON_DICT[norm]) {
    return GREEK_TO_ENGLISH_ICON_DICT[norm];
  }
  const tokens = norm.split(/\s+/);
  const mapped = tokens.map((t) => {
    if (GREEK_TO_ENGLISH_ICON_DICT[t]) return GREEK_TO_ENGLISH_ICON_DICT[t];
    let bestVal = '';
    let bestScore = 0;
    for (const [k, v] of Object.entries(GREEK_TO_ENGLISH_ICON_DICT)) {
      const sc = scoreSingleGreekTokenMatch(k, t);
      if (sc > bestScore) {
        bestScore = sc;
        bestVal = v;
      }
    }
    return bestScore > 0 ? bestVal : t;
  });
  return mapped.join(' ');
}

/**
 * Builds a high-resolution standalone SVG data URL for hand-drawn/marker curved arrows,
 * lightning bolts, exclamation marks, fireworks, and pens with customizable color & thickness.
 */
export function buildCustomStickerSvgDataUrl(
  shapeKind: string,
  colorHex: string,
  strokeWidthNum: number
): string {
  const c = colorHex || '#dc2626';
  const w = Math.max(3, Math.min(26, strokeWidthNum || 12));
  const wInner = Math.max(2, w * 0.55);
  let innerSvg = '';

  switch (shapeKind) {
    case 'sketch-curve-left': {
      // Exact organic curved arrow pointing left like the user's screenshot!
      innerSvg = `
        <path d="M 224 166 Q 134 118 36 140" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 220 163 Q 134 122 40 141" fill="none" stroke="${c}" stroke-width="${wInner}" stroke-opacity="0.7" stroke-linecap="round" />
        <path d="M 80 100 L 34 140 L 82 172" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-curve-right': {
      innerSvg = `
        <path d="M 32 166 Q 122 118 220 140" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 36 163 Q 122 122 216 141" fill="none" stroke="${c}" stroke-width="${wInner}" stroke-opacity="0.7" stroke-linecap="round" />
        <path d="M 176 100 L 222 140 L 174 172" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-arch-down-left': {
      innerSvg = `
        <path d="M 222 92 Q 134 150 36 124" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 82 92 L 34 124 L 78 164" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-arch-down-right': {
      innerSvg = `
        <path d="M 34 92 Q 122 150 220 124" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 174 92 L 222 124 L 178 164" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-curve-up': {
      innerSvg = `
        <path d="M 154 222 Q 112 132 132 36" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 94 80 L 132 34 L 168 82" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-curve-down': {
      innerSvg = `
        <path d="M 104 34 Q 146 124 126 220" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 90 174 L 126 222 L 164 176" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-loop-left': {
      innerSvg = `
        <path d="M 226 164 C 170 164, 116 74, 146 74 C 176 74, 150 168, 36 138" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 80 100 L 34 138 L 78 174" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-loop-right': {
      innerSvg = `
        <path d="M 30 164 C 86 164, 140 74, 110 74 C 80 74, 106 168, 220 138" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 176 100 L 222 138 L 178 174" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-scurve': {
      innerSvg = `
        <path d="M 30 184 C 95 184, 95 72, 165 72 C 195 72, 208 82, 222 92" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 178 62 L 224 94 L 176 126" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-dashed-left': {
      const dash = `${Math.round(w * 2.1)} ${Math.round(w * 1.55)}`;
      innerSvg = `
        <path d="M 224 166 Q 134 118 42 140" fill="none" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round" />
        <path d="M 80 100 L 34 140 L 82 172" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-dashed-right': {
      const dash = `${Math.round(w * 2.1)} ${Math.round(w * 1.55)}`;
      innerSvg = `
        <path d="M 32 166 Q 122 118 214 140" fill="none" stroke="${c}" stroke-width="${w}" stroke-dasharray="${dash}" stroke-linecap="round" />
        <path d="M 176 100 L 222 140 L 174 172" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-double-curve': {
      innerSvg = `
        <path d="M 36 146 Q 128 96 220 146" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 78 110 L 34 146 L 78 178" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 178 110 L 222 146 L 178 178" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case '3d-filled-arrow-left': {
      innerSvg = `
        <path d="M 230 172 Q 146 116 84 134 L 88 102 L 24 146 L 94 180 L 90 152 Q 148 138 230 172 Z" fill="rgba(15,23,42,0.18)" transform="translate(4, 7)" />
        <path d="M 230 172 Q 146 116 84 134 L 88 102 L 24 146 L 94 180 L 90 152 Q 148 138 230 172 Z" fill="${c}" stroke="#0f172a" stroke-width="4" stroke-linejoin="round" />
      `;
      break;
    }
    case '3d-filled-arrow-right': {
      innerSvg = `
        <path d="M 26 172 Q 110 116 172 134 L 168 102 L 232 146 L 162 180 L 166 152 Q 108 138 26 172 Z" fill="rgba(15,23,42,0.18)" transform="translate(4, 7)" />
        <path d="M 26 172 Q 110 116 172 134 L 168 102 L 232 146 L 162 180 L 166 152 Q 108 138 26 172 Z" fill="${c}" stroke="#0f172a" stroke-width="4" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-straight-right': {
      innerSvg = `
        <path d="M 30 132 Q 124 124 220 130" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" />
        <path d="M 172 92 L 222 130 L 172 168" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'sketch-straight-left': {
      innerSvg = `
        <path d="M 226 132 Q 132 124 36 130" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" />
        <path d="M 84 92 L 34 130 L 84 168" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
    }
    case 'lightning-bolt': {
      innerSvg = `
        <polygon points="148,20 58,136 122,136 96,236 202,110 134,110" fill="rgba(15,23,42,0.18)" transform="translate(6, 7)" />
        <polygon points="148,20 58,136 122,136 96,236 202,110 134,110" fill="#facc15" stroke="${c}" stroke-width="${Math.max(5, w * 0.65)}" stroke-linejoin="round" />
      `;
      break;
    }
    case 'triple-exclamation': {
      innerSvg = `
        <path d="M 76 44 L 84 164 M 128 36 L 128 162 M 180 44 L 172 164" fill="none" stroke="${c}" stroke-width="${Math.max(12, w * 1.25)}" stroke-linecap="round" />
        <circle cx="86" cy="204" r="${Math.max(8, w * 0.75)}" fill="${c}" />
        <circle cx="128" cy="204" r="${Math.max(8, w * 0.75)}" fill="${c}" />
        <circle cx="170" cy="204" r="${Math.max(8, w * 0.75)}" fill="${c}" />
      `;
      break;
    }
    case 'fireworks-3d-gold-magenta': {
      // Rich 3D multicolor firework burst with arched trails, glowing star flares, and zero background box!
      innerSvg = `
        <g stroke-linecap="round" fill="none">
          <!-- Outer arched glowing trails -->
          <path d="M 128 132 Q 128 66 128 18" stroke="#facc15" stroke-width="8" />
          <path d="M 128 132 Q 168 78 210 38" stroke="#ec4899" stroke-width="8" />
          <path d="M 128 132 Q 186 112 238 118" stroke="#06b6d4" stroke-width="8" />
          <path d="M 128 132 Q 178 164 216 208" stroke="#f97316" stroke-width="8" />
          <path d="M 128 132 Q 134 186 128 238" stroke="#a855f7" stroke-width="8" />
          <path d="M 128 132 Q 78 164 40 208" stroke="#10b981" stroke-width="8" />
          <path d="M 128 132 Q 70 112 18 118" stroke="#f43f5e" stroke-width="8" />
          <path d="M 128 132 Q 88 78 46 38" stroke="#3b82f6" stroke-width="8" />

          <!-- Secondary inner burst rays (dashed sparkles) -->
          <line x1="128" y1="132" x2="164" y2="34" stroke="#fde047" stroke-width="6" stroke-dasharray="12 10" />
          <line x1="128" y1="132" x2="226" y2="76" stroke="#f472b6" stroke-width="6" stroke-dasharray="12 10" />
          <line x1="128" y1="132" x2="228" y2="164" stroke="#38bdf8" stroke-width="6" stroke-dasharray="12 10" />
          <line x1="128" y1="132" x2="168" y2="226" stroke="#fb923c" stroke-width="6" stroke-dasharray="12 10" />
          <line x1="128" y1="132" x2="88" y2="226" stroke="#c084fc" stroke-width="6" stroke-dasharray="12 10" />
          <line x1="128" y1="132" x2="28" y2="164" stroke="#34d399" stroke-width="6" stroke-dasharray="12 10" />
          <line x1="128" y1="132" x2="30" y2="76" stroke="#fb7185" stroke-width="6" stroke-dasharray="12 10" />
          <line x1="128" y1="132" x2="92" y2="34" stroke="#60a5fa" stroke-width="6" stroke-dasharray="12 10" />
        </g>
        <!-- Glowing 4-point star tips & colorful spark beads -->
        <polygon points="128,6 133,16 143,20 133,24 128,34 123,24 113,20 123,16" fill="#facc15" />
        <polygon points="212,26 216,35 225,39 216,43 212,52 208,43 199,39 208,35" fill="#ec4899" />
        <polygon points="44,26 48,35 57,39 48,43 44,52 40,43 31,39 40,35" fill="#3b82f6" />
        <polygon points="240,106 244,115 253,119 244,123 240,132 236,123 227,119 236,115" fill="#06b6d4" />
        <polygon points="16,106 20,115 29,119 20,123 16,132 12,123 3,119 12,115" fill="#f43f5e" />
        <circle cx="218" cy="210" r="8" fill="#f97316" />
        <circle cx="38" cy="210" r="8" fill="#10b981" />
        <circle cx="128" cy="240" r="8" fill="#a855f7" />
        <!-- Bright 3D core -->
        <circle cx="128" cy="132" r="24" fill="#f59e0b" fill-opacity="0.32" />
        <circle cx="128" cy="132" r="14" fill="#fde047" stroke="${c}" stroke-width="4" />
      `;
      break;
    }
    case 'sparkler-3d-transparent': {
      // Handheld 3D Sparkler (Βεγγαλικό) with blazing golden/amber/pink sparks on 100% transparent background!
      innerSvg = `
        <!-- Metallic handheld sparkler rod at bottom-left -->
        <line x1="36" y1="228" x2="136" y2="128" stroke="#64748b" stroke-width="10" stroke-linecap="round" />
        <line x1="78" y1="186" x2="136" y2="128" stroke="#f97316" stroke-width="14" stroke-linecap="round" />
        <!-- Radiant sparkler rays from (142, 118) -->
        <g stroke-linecap="round">
          <line x1="142" y1="118" x2="142" y2="18" stroke="#facc15" stroke-width="8" />
          <line x1="142" y1="118" x2="218" y2="42" stroke="#f59e0b" stroke-width="8" />
          <line x1="142" y1="118" x2="242" y2="118" stroke="#fde047" stroke-width="8" />
          <line x1="142" y1="118" x2="216" y2="192" stroke="#fb923c" stroke-width="8" />
          <line x1="142" y1="118" x2="142" y2="216" stroke="#facc15" stroke-width="8" />
          <line x1="142" y1="118" x2="66" y2="42" stroke="#fbbf24" stroke-width="8" />
          <line x1="142" y1="118" x2="44" y2="118" stroke="#f59e0b" stroke-width="8" />

          <!-- Diagonal secondary golden/pink sparks -->
          <line x1="142" y1="118" x2="182" y2="28" stroke="#ec4899" stroke-width="6" stroke-dasharray="14 10" />
          <line x1="142" y1="118" x2="232" y2="78" stroke="#f43f5e" stroke-width="6" stroke-dasharray="14 10" />
          <line x1="142" y1="118" x2="232" y2="158" stroke="#ec4899" stroke-width="6" stroke-dasharray="14 10" />
          <line x1="142" y1="118" x2="182" y2="206" stroke="#f97316" stroke-width="6" stroke-dasharray="14 10" />
          <line x1="142" y1="118" x2="102" y2="28" stroke="#f97316" stroke-width="6" stroke-dasharray="14 10" />
          <line x1="142" y1="118" x2="54" y2="78" stroke="#ec4899" stroke-width="6" stroke-dasharray="14 10" />
        </g>
        <!-- 4-point star sparkles around the sparkler -->
        <polygon points="142,8 148,26 166,32 148,38 142,56 136,38 118,32 136,26" fill="#fef08a" stroke="#f59e0b" stroke-width="2" />
        <polygon points="224,30 228,40 238,44 228,48 224,58 220,48 210,44 220,40" fill="#facc15" />
        <polygon points="60,30 64,40 74,44 64,48 60,58 56,48 46,44 56,40" fill="#ec4899" />
        <polygon points="236,118 240,128 250,132 240,136 236,146 232,136 222,132 232,128" fill="#fb923c" />
        <!-- Blazing core -->
        <circle cx="142" cy="118" r="28" fill="#fbbf24" fill-opacity="0.38" />
        <polygon points="142,84 152,108 176,118 152,128 142,152 132,128 108,118 132,108" fill="#ffffff" stroke="#f59e0b" stroke-width="4" />
      `;
      break;
    }
    case 'fireworks-trio-celebration': {
      // Cluster of 3 colorful 3D fireworks (Magenta/Gold top-left, Cyan/Blue right, Emerald/Amber bottom) — 100% transparent!
      innerSvg = `
        <!-- Firework 1: Top-Left (Magenta & Gold, center 86,86) -->
        <g stroke-linecap="round">
          <line x1="86" y1="86" x2="86" y2="20" stroke="#ec4899" stroke-width="7" stroke-dasharray="14 8" />
          <line x1="86" y1="86" x2="134" y2="38" stroke="#facc15" stroke-width="7" stroke-dasharray="14 8" />
          <line x1="86" y1="86" x2="152" y2="86" stroke="#ec4899" stroke-width="7" stroke-dasharray="14 8" />
          <line x1="86" y1="86" x2="134" y2="134" stroke="#facc15" stroke-width="7" stroke-dasharray="14 8" />
          <line x1="86" y1="86" x2="86" y2="152" stroke="#ec4899" stroke-width="7" stroke-dasharray="14 8" />
          <line x1="86" y1="86" x2="38" y2="134" stroke="#facc15" stroke-width="7" stroke-dasharray="14 8" />
          <line x1="86" y1="86" x2="20" y2="86" stroke="#ec4899" stroke-width="7" stroke-dasharray="14 8" />
          <line x1="86" y1="86" x2="38" y2="38" stroke="#facc15" stroke-width="7" stroke-dasharray="14 8" />
          <circle cx="86" cy="86" r="12" fill="#fde047" stroke="#ec4899" stroke-width="4" />
        </g>
        <!-- Firework 2: Middle-Right (Cyan & Royal Blue, center 186,108) -->
        <g stroke-linecap="round">
          <line x1="186" y1="108" x2="186" y2="52" stroke="#06b6d4" stroke-width="6" stroke-dasharray="12 7" />
          <line x1="186" y1="108" x2="226" y2="68" stroke="#3b82f6" stroke-width="6" stroke-dasharray="12 7" />
          <line x1="186" y1="108" x2="242" y2="108" stroke="#06b6d4" stroke-width="6" stroke-dasharray="12 7" />
          <line x1="186" y1="108" x2="226" y2="148" stroke="#3b82f6" stroke-width="6" stroke-dasharray="12 7" />
          <line x1="186" y1="108" x2="186" y2="164" stroke="#06b6d4" stroke-width="6" stroke-dasharray="12 7" />
          <line x1="186" y1="108" x2="146" y2="148" stroke="#3b82f6" stroke-width="6" stroke-dasharray="12 7" />
          <line x1="186" y1="108" x2="130" y2="108" stroke="#06b6d4" stroke-width="6" stroke-dasharray="12 7" />
          <line x1="186" y1="108" x2="146" y2="68" stroke="#3b82f6" stroke-width="6" stroke-dasharray="12 7" />
          <circle cx="186" cy="108" r="10" fill="#38bdf8" stroke="#1d4ed8" stroke-width="3.5" />
        </g>
        <!-- Firework 3: Bottom-Center (Violet, Emerald & Orange, center 124,190) -->
        <g stroke-linecap="round">
          <line x1="124" y1="190" x2="124" y2="140" stroke="#8b5cf6" stroke-width="6" stroke-dasharray="11 7" />
          <line x1="124" y1="190" x2="160" y2="154" stroke="#10b981" stroke-width="6" stroke-dasharray="11 7" />
          <line x1="124" y1="190" x2="174" y2="190" stroke="#f97316" stroke-width="6" stroke-dasharray="11 7" />
          <line x1="124" y1="190" x2="160" y2="226" stroke="#8b5cf6" stroke-width="6" stroke-dasharray="11 7" />
          <line x1="124" y1="190" x2="124" y2="240" stroke="#10b981" stroke-width="6" stroke-dasharray="11 7" />
          <line x1="124" y1="190" x2="88" y2="226" stroke="#f97316" stroke-width="6" stroke-dasharray="11 7" />
          <line x1="124" y1="190" x2="74" y2="190" stroke="#8b5cf6" stroke-width="6" stroke-dasharray="11 7" />
          <line x1="124" y1="190" x2="88" y2="154" stroke="#10b981" stroke-width="6" stroke-dasharray="11 7" />
          <circle cx="124" cy="190" r="10" fill="#facc15" stroke="#8b5cf6" stroke-width="3.5" />
        </g>
      `;
      break;
    }
    case 'firework-ring-galaxy': {
      // Concentric Chrysanthemum Ring Firework with 4-point star sparkles — 100% transparent!
      innerSvg = `
        <circle cx="128" cy="128" r="96" fill="none" stroke="#facc15" stroke-width="7" stroke-dasharray="4 22" stroke-linecap="round" />
        <circle cx="128" cy="128" r="68" fill="none" stroke="#ec4899" stroke-width="8" stroke-dasharray="6 18" stroke-linecap="round" />
        <circle cx="128" cy="128" r="40" fill="none" stroke="#06b6d4" stroke-width="8" stroke-dasharray="5 14" stroke-linecap="round" />
        <g stroke-linecap="round">
          <line x1="128" y1="18" x2="128" y2="54" stroke="#ef4444" stroke-width="7" />
          <line x1="128" y1="202" x2="128" y2="238" stroke="#8b5cf6" stroke-width="7" />
          <line x1="18" y1="128" x2="54" y2="128" stroke="#f59e0b" stroke-width="7" />
          <line x1="202" y1="128" x2="238" y2="128" stroke="#10b981" stroke-width="7" />
          <line x1="50" y1="50" x2="76" y2="76" stroke="#3b82f6" stroke-width="7" />
          <line x1="180" y1="180" x2="206" y2="206" stroke="#ec4899" stroke-width="7" />
          <line x1="206" y1="50" x2="180" y2="76" stroke="#facc15" stroke-width="7" />
          <line x1="76" y1="180" x2="50" y2="206" stroke="#06b6d4" stroke-width="7" />
        </g>
        <polygon points="128,94 136,120 162,128 136,136 128,162 120,136 94,128 120,120" fill="#fde047" stroke="#f59e0b" stroke-width="3" />
      `;
      break;
    }
    case 'atom-3d-transparent': {
      // 3D Atom with 3 intersecting elliptical orbits, electrons, and nucleus — 100% transparent!
      innerSvg = `
        <g fill="none" stroke-width="7">
          <ellipse cx="128" cy="128" rx="104" ry="38" stroke="#0066ff" />
          <ellipse cx="128" cy="128" rx="104" ry="38" stroke="#8b5cf6" transform="rotate(60 128 128)" />
          <ellipse cx="128" cy="128" rx="104" ry="38" stroke="#06b6d4" transform="rotate(-60 128 128)" />
        </g>
        <circle cx="232" cy="128" r="10" fill="#0066ff" stroke="#ffffff" stroke-width="3" />
        <circle cx="76" cy="38" r="10" fill="#8b5cf6" stroke="#ffffff" stroke-width="3" />
        <circle cx="76" cy="218" r="10" fill="#06b6d4" stroke="#ffffff" stroke-width="3" />
        <circle cx="122" cy="124" r="16" fill="#ef4444" />
        <circle cx="136" cy="132" r="14" fill="#3b82f6" />
        <circle cx="128" cy="118" r="12" fill="#facc15" />
      `;
      break;
    }
    case 'check-3d-transparent': {
      // Glossy 3D Checkmark without any background box — 100% transparent!
      innerSvg = `
        <path d="M 42 138 L 102 198 L 218 64" fill="none" stroke="rgba(15,23,42,0.18)" stroke-width="32" stroke-linecap="round" stroke-linejoin="round" transform="translate(5, 8)" />
        <path d="M 42 138 L 102 198 L 218 64" fill="none" stroke="#16a34a" stroke-width="30" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 42 138 L 102 198 L 218 64" fill="none" stroke="#4ade80" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" transform="translate(-2, -3)" />
      `;
      break;
    }
    case 'chart-up-3d-transparent': {
      // 3D Rising Trend Line Chart without white card background — 100% transparent!
      innerSvg = `
        <path d="M 32 36 L 32 220 L 228 220" fill="none" stroke="#334155" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 52 184 L 104 132 L 146 156 L 214 64" fill="none" stroke="#10b981" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 174 62 L 216 62 L 216 104" fill="none" stroke="#10b981" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
        <circle cx="104" cy="132" r="9" fill="#0066ff" stroke="#ffffff" stroke-width="3" />
        <circle cx="146" cy="156" r="9" fill="#f59e0b" stroke="#ffffff" stroke-width="3" />
      `;
      break;
    }
    case 'barchart-3d-transparent': {
      // 3D Multicolor Bar Chart without white card background — 100% transparent!
      innerSvg = `
        <rect x="44" y="132" width="36" height="84" rx="6" fill="#3b82f6" stroke="#1e3a8a" stroke-width="4" />
        <rect x="108" y="84" width="36" height="132" rx="6" fill="#10b981" stroke="#065f46" stroke-width="4" />
        <rect x="172" y="44" width="36" height="172" rx="6" fill="#f59e0b" stroke="#78350f" stroke-width="4" />
        <line x1="24" y1="218" x2="232" y2="218" stroke="#334155" stroke-width="10" stroke-linecap="round" />
      `;
      break;
    }
    case 'firework-burst': {
      innerSvg = `
        <g stroke-linecap="round">
          <line x1="128" y1="128" x2="128" y2="26" stroke="#ef4444" stroke-width="8" stroke-dasharray="18 10" />
          <line x1="128" y1="128" x2="200" y2="56" stroke="#f59e0b" stroke-width="8" stroke-dasharray="18 10" />
          <line x1="128" y1="128" x2="230" y2="128" stroke="#10b981" stroke-width="8" stroke-dasharray="18 10" />
          <line x1="128" y1="128" x2="200" y2="200" stroke="#0066ff" stroke-width="8" stroke-dasharray="18 10" />
          <line x1="128" y1="128" x2="128" y2="230" stroke="#8b5cf6" stroke-width="8" stroke-dasharray="18 10" />
          <line x1="128" y1="128" x2="56" y2="200" stroke="#ec4899" stroke-width="8" stroke-dasharray="18 10" />
          <line x1="128" y1="128" x2="26" y2="128" stroke="#f59e0b" stroke-width="8" stroke-dasharray="18 10" />
          <line x1="128" y1="128" x2="56" y2="56" stroke="#0066ff" stroke-width="8" stroke-dasharray="18 10" />
          <circle cx="128" cy="128" r="16" fill="#facc15" stroke="${c}" stroke-width="4" />
          <circle cx="128" cy="22" r="7" fill="#ef4444" />
          <circle cx="204" cy="52" r="7" fill="#f59e0b" />
          <circle cx="234" cy="128" r="7" fill="#10b981" />
          <circle cx="204" cy="204" r="7" fill="#0066ff" />
          <circle cx="128" cy="234" r="7" fill="#8b5cf6" />
          <circle cx="52" cy="204" r="7" fill="#ec4899" />
          <circle cx="22" cy="128" r="7" fill="#f59e0b" />
          <circle cx="52" cy="52" r="7" fill="#0066ff" />
        </g>
      `;
      break;
    }
    case 'pen-marker': {
      innerSvg = `
        <g transform="rotate(-38 128 128)">
          <rect x="108" y="42" width="40" height="132" rx="8" fill="${c}" stroke="#0f172a" stroke-width="5" />
          <rect x="108" y="56" width="40" height="18" fill="#ffffff" fill-opacity="0.35" />
          <polygon points="108,174 148,174 135,208 121,208" fill="#e2e8f0" stroke="#0f172a" stroke-width="5" stroke-linejoin="round" />
          <polygon points="121,208 135,208 128,228" fill="${c}" stroke="${c}" stroke-width="3" stroke-linejoin="round" />
          <path d="M 148 56 L 162 56 L 162 116" fill="none" stroke="#0f172a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
        </g>
      `;
      break;
    }
    case 'alert-inverted-triangle-outline': {
      // Clean modern inverted warning triangle outline with exclamation mark inside
      innerSvg = `
        <path d="M 44 46 L 212 46 L 128 214 Z" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 128 72 L 128 140" stroke="${c}" stroke-width="${Math.max(12, w * 0.95)}" stroke-linecap="round" />
        <circle cx="128" cy="174" r="${Math.max(6, w * 0.48)}" fill="${c}" />
      `;
      break;
    }
    case 'alert-inverted-triangle-solid': {
      // Solid filled inverted warning triangle badge with crisp cutout white exclamation mark
      innerSvg = `
        <path d="M 48 44 Q 34 44 40 58 L 120 216 Q 128 230 136 216 L 216 58 Q 222 44 208 44 Z" fill="${c}" />
        <path d="M 128 74 L 128 142" stroke="#ffffff" stroke-width="15" stroke-linecap="round" />
        <circle cx="128" cy="176" r="7.5" fill="#ffffff" />
      `;
      break;
    }
    case 'alert-wedge-exclamation': {
      // Stylized wedge / downward tapering inverted triangle exclamation mark
      innerSvg = `
        <path d="M 82 34 Q 74 34 78 44 L 122 152 Q 128 164 134 152 L 178 44 Q 182 34 174 34 Z" fill="${c}" />
        <circle cx="128" cy="204" r="18" fill="${c}" />
      `;
      break;
    }
    case 'alert-inverted-triangle-hazard': {
      // Double-bordered Yield / Caution inverted hazard triangle with exclamation mark
      innerSvg = `
        <path d="M 40 44 L 216 44 L 128 220 Z" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 68 62 L 188 62 L 128 180 Z" fill="none" stroke="${c}" stroke-width="${Math.max(3, w * 0.35)}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.65" />
        <path d="M 128 82 L 128 132" stroke="${c}" stroke-width="${Math.max(10, w * 0.85)}" stroke-linecap="round" />
        <circle cx="128" cy="156" r="${Math.max(5, w * 0.42)}" fill="${c}" />
      `;
      break;
    }
    case 'alert-inverted-triangle-soft': {
      // Smooth iPadOS-style rounded inverted triangle with exclamation mark
      innerSvg = `
        <path d="M 64 52 L 192 52 Q 212 52 200 72 L 140 188 Q 128 210 116 188 L 56 72 Q 44 52 64 52 Z" fill="none" stroke="${c}" stroke-width="${w * 1.1}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 128 80 L 128 134" stroke="${c}" stroke-width="${Math.max(12, w)}" stroke-linecap="round" />
        <circle cx="128" cy="168" r="${Math.max(6, w * 0.5)}" fill="${c}" />
      `;
      break;
    }
    case 'alert-triangle-upright': {
      // Classic upright warning triangle with customizable stroke & exclamation mark
      innerSvg = `
        <path d="M 128 42 L 216 208 L 40 208 Z" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 128 102 L 128 160" stroke="${c}" stroke-width="${Math.max(12, w * 0.95)}" stroke-linecap="round" />
        <circle cx="128" cy="186" r="${Math.max(6, w * 0.48)}" fill="${c}" />
      `;
      break;
    }
    default: {
      innerSvg = `
        <path d="M 224 166 Q 134 118 36 140" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
        <path d="M 80 100 L 34 140 L 82 172" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" />
      `;
    }
  }

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 256 256">${innerSvg}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fullSvg)}`;
}

/**
 * Strips any full-bleed square or rounded-square tile background `<rect>` or `<path>`
 * from an emoji/icon SVG so that every inserted sticker has a 100% transparent background.
 */
function stripSvgBackgroundTile(svgText: string): string {
  // Remove full-bleed 28x28 / 30x30 / 32x32 rounded-square background <path> in 32x32 emoji sets
  // (e.g., d="M26.296 1.96H5.656c-2.03 0-3.68 1.65-3.68 3.68v20.64...")
  let cleaned = svgText.replace(
    /<path\b[^>]*\bd=["']M2[5678]\.[0-9]+\s+[123]\.[0-9]+H[23456]\.[0-9]+c-[0-9.\s-]+v2[0-9]\.[0-9]+[^>]*\/>/gi,
    ''
  );
  // Also remove any top-level background <rect> covering >= 80% of the viewBox
  cleaned = cleaned.replace(
    /<rect\b[^>]*\bwidth=["'](2[6-9]|3[0-2]|100%)["'][^>]*\bheight=["'](2[6-9]|3[0-2]|100%)["'][^>]*\/>/gi,
    ''
  );
  return cleaned;
}

interface CachedIconifyEntry {
  body: string;
  width: number;
  height: number;
  left: number;
  top: number;
}

const ICONIFY_API_HOSTS = [
  'https://api.iconify.design',
  'https://api.simplesvg.com',
  'https://api.unisvg.com',
];

const ICONIFY_RAW_CACHE = new Map<string, CachedIconifyEntry>();
const ICONIFY_MISSING_IDS = new Set<string>();

/**
 * Batch-fetches SVG bodies for any list of Iconify IDs (`prefix:name`) in 1 single JSON request per prefix
 * across the 3 official Iconify CDN mirrors (`api.iconify.design`, `api.simplesvg.com`, `api.unisvg.com`).
 * Completely eliminates browser rate-limiting (HTTP 429 / 1015) from loading 100+ individual `.svg` URLs,
 * and verifies that every icon actually exists (filtering out any orphaned/missing icon IDs).
 */
export async function preloadIconifyStickersBatch(iconifyIds: string[]): Promise<Set<string>> {
  const verified = new Set<string>();
  const toFetchByPrefix = new Map<string, string[]>();

  for (const id of iconifyIds) {
    if (!id) continue;
    if (id.startsWith('custom-svg:') || id.startsWith('sketch-png:') || id.startsWith('local-png:')) {
      verified.add(id);
      continue;
    }
    if (ICONIFY_RAW_CACHE.has(id)) {
      verified.add(id);
      continue;
    }
    if (ICONIFY_MISSING_IDS.has(id)) {
      continue;
    }
    const [prefix, name] = id.split(':');
    if (!prefix || !name) continue;
    let list = toFetchByPrefix.get(prefix);
    if (!list) {
      list = [];
      toFetchByPrefix.set(prefix, list);
    }
    if (!list.includes(name)) {
      list.push(name);
    }
  }

  const fetchPrefixChunk = async (prefix: string, names: string[]) => {
    for (const host of ICONIFY_API_HOSTS) {
      try {
        const res = await fetch(
          `${host}/${encodeURIComponent(prefix)}.json?icons=${encodeURIComponent(names.join(','))}`
        );
        if (!res.ok) continue;
        const data = await res.json();
        const defW = Number(data?.width) || 24;
        const defH = Number(data?.height) || 24;
        const defL = Number(data?.left) || 0;
        const defT = Number(data?.top) || 0;
        const iconsMap = data?.icons || {};
        const aliasesMap = data?.aliases || {};

        for (const name of names) {
          const fullId = `${prefix}:${name}`;
          let iconObj = iconsMap[name];
          if (!iconObj && aliasesMap[name]?.parent) {
            const parentObj = iconsMap[aliasesMap[name].parent];
            if (parentObj) {
              iconObj = { ...parentObj, ...aliasesMap[name] };
            }
          }
          if (iconObj && typeof iconObj.body === 'string' && iconObj.body.trim().length > 0) {
            const cleanedBody = stripSvgBackgroundTile(iconObj.body);
            if (/<(path|circle|rect|polygon|polyline|line|ellipse|g)\b/i.test(cleanedBody)) {
              ICONIFY_RAW_CACHE.set(fullId, {
                body: cleanedBody,
                width: Number(iconObj.width) || defW,
                height: Number(iconObj.height) || defH,
                left: Number(iconObj.left) || defL,
                top: Number(iconObj.top) || defT,
              });
              verified.add(fullId);
            } else {
              ICONIFY_MISSING_IDS.add(fullId);
            }
          } else {
            ICONIFY_MISSING_IDS.add(fullId);
          }
        }
        return;
      } catch {
        // try next CDN mirror
      }
    }
  };

  const tasks: Promise<void>[] = [];
  for (const [prefix, names] of toFetchByPrefix.entries()) {
    for (let i = 0; i < names.length; i += 45) {
      tasks.push(fetchPrefixChunk(prefix, names.slice(i, i + 45)));
    }
  }
  if (tasks.length > 0) {
    await Promise.all(tasks);
  }

  for (const id of iconifyIds) {
    if (id.startsWith('custom-svg:') || id.startsWith('sketch-png:') || id.startsWith('local-png:') || ICONIFY_RAW_CACHE.has(id)) {
      verified.add(id);
    }
  }
  return verified;
}

export function isStickerVerifiedOrCached(iconifyId: string): boolean {
  if (iconifyId.startsWith('custom-svg:') || iconifyId.startsWith('sketch-png:') || iconifyId.startsWith('local-png:')) return true;
  if (ICONIFY_MISSING_IDS.has(iconifyId)) return false;
  return ICONIFY_RAW_CACHE.has(iconifyId);
}

export function getIconifySvgUrl(
  iconifyId: string,
  colorStyle: StickerColorStyle | Exclude<StickerColorStyle, 'all'>,
  customHexColor = '#1e293b',
  overrideCustomColor?: string | null,
  overrideCustomWidth?: number | null
): string {
  if (iconifyId.startsWith('sketch-png:') || iconifyId.startsWith('local-png:')) {
    const parts = iconifyId.split(':');
    const rawPath = parts[1] || '';
    return rawPath ? `${rawPath}?v=vintage7` : '';
  }
  if (iconifyId.startsWith('custom-svg:')) {
    const parts = iconifyId.split(':');
    const shapeKind = parts[1] || 'sketch-curve-left';
    const defaultColor = parts[2] || '#dc2626';
    const defaultWidth = Number(parts[3]) || 12;
    const effectiveColor =
      overrideCustomColor ||
      (colorStyle === 'monochrome' ? (customHexColor || defaultColor) : defaultColor);
    return buildCustomStickerSvgDataUrl(
      shapeKind,
      effectiveColor,
      overrideCustomWidth || defaultWidth
    );
  }
  const [prefix, name] = iconifyId.split(':');
  if (!prefix || !name) return '';

  const effectiveMonoColor = overrideCustomColor || customHexColor || '#1e293b';
  const effectiveDuoColor = overrideCustomColor || '#0066ff';
  const activeColor =
    colorStyle === 'monochrome' || prefix === 'mdi' || prefix === 'lucide' || prefix === 'tabler'
      ? effectiveMonoColor
      : colorStyle === 'duotone' || prefix === 'ph' || prefix === 'solar'
      ? effectiveDuoColor
      : effectiveMonoColor;

  // Serve directly as an instant local `data:image/svg+xml` URL if preloaded in ICONIFY_RAW_CACHE!
  const cached = ICONIFY_RAW_CACHE.get(iconifyId);
  if (cached) {
    const coloredBody = cached.body.replace(/currentColor/g, activeColor);
    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="${cached.left} ${cached.top} ${cached.width} ${cached.height}">${coloredBody}</svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fullSvg)}`;
  }

  const baseUrl = `https://api.iconify.design/${prefix}/${name}.svg`;
  if (
    colorStyle === 'monochrome' ||
    prefix === 'mdi' ||
    prefix === 'lucide' ||
    prefix === 'tabler'
  ) {
    return `${baseUrl}?color=${encodeURIComponent(effectiveMonoColor)}`;
  }
  if (colorStyle === 'duotone' || prefix === 'ph' || prefix === 'solar') {
    return `${baseUrl}?color=${encodeURIComponent(effectiveDuoColor)}`;
  }
  return baseUrl;
}

/**
 * Searches Iconify's 200,000+ online vector library live according to the user's query and color style,
 * deduplicates skin-tone/weight clones, and batch-preloads & verifies all returned icons so zero
 * broken or orphaned icons ever appear.
 */
export async function searchOnlineIconifyStickers(
  rawQuery: string,
  colorStyle: StickerColorStyle
): Promise<StickerCatalogItem[]> {
  const enQuery = translateGreekStickerQueryToEnglish(rawQuery);
  if (!enQuery || enQuery.length < 2) return [];

  let prefixes = 'fluent-emoji,fluent-emoji-flat,noto,icon-park,ph,mdi,lucide';
  if (colorStyle === 'multicolor') {
    prefixes = 'fluent-emoji,fluent-emoji-flat,noto,twemoji,icon-park';
  } else if (colorStyle === 'duotone') {
    prefixes = 'ph,icon-park-twotone,solar';
  } else if (colorStyle === 'monochrome') {
    prefixes = 'mdi,lucide,tabler';
  }

  let icons: string[] = [];
  for (const host of ICONIFY_API_HOSTS) {
    try {
      const res = await fetch(
        `${host}/search?query=${encodeURIComponent(enQuery)}&prefixes=${encodeURIComponent(
          prefixes
        )}&limit=48`
      );
      if (!res.ok) continue;
      const data = await res.json();
      if (Array.isArray(data?.icons)) {
        icons = data.icons;
        break;
      }
    } catch {
      // try next mirror
    }
  }
  if (icons.length === 0) return [];

  const NON_TRANSPARENT_EMOJI_NAMES = new Set([
    'fireworks',
    'sparkler',
    'night-with-stars',
    'milky-way',
    'bridge-at-night',
    'sunrise-over-mountains',
    'sunrise',
    'sunset',
    'cityscape',
    'cityscape-at-dusk',
    'shooting-star',
  ]);

  const seenPhBase = new Set<string>();
  const filteredIds = icons
    .filter((ic) => {
      const [prefix = '', icName = ''] = ic.split(':');
      if (!prefix || !icName) return false;
      if (
        NON_TRANSPARENT_EMOJI_NAMES.has(icName) ||
        icName.endsWith('-button') ||
        icName.startsWith('squared-')
      ) {
        return false;
      }
      // Skip skin-tone variants that clutter results with 6 identical copies
      if (
        /-(light|medium-light|medium|medium-dark|dark)(-skin-tone)?$/.test(icName) &&
        !icName.startsWith('light-') &&
        !icName.endsWith('-bulb-light')
      ) {
        if (
          icName.endsWith('-skin-tone') ||
          icName.endsWith('-medium-light') ||
          icName.endsWith('-medium-dark') ||
          prefix === 'fluent-emoji' ||
          prefix === 'fluent-emoji-flat' ||
          prefix === 'noto'
        ) {
          return false;
        }
      }
      // For Phosphor ('ph'), avoid showing 5 identical monochrome weight clones (-thin, -light, -bold, -fill)
      if (prefix === 'ph' && colorStyle !== 'duotone') {
        if (icName.endsWith('-thin') || icName.endsWith('-light') || icName.endsWith('-bold')) {
          return false;
        }
        const base = icName.replace(/-(duotone|fill)$/, '');
        const key = `${base}:${icName.endsWith('-duotone') ? 'duo' : 'mono'}`;
        if (seenPhBase.has(key)) return false;
        seenPhBase.add(key);
      }
      if (colorStyle === 'duotone') {
        return ic.includes('duotone') || ic.startsWith('icon-park-twotone:');
      }
      return true;
    })
    .slice(0, 24);

  // Batch-preload & verify every candidate icon in 1 request per prefix before returning!
  const verifiedSet = await preloadIconifyStickersBatch(filteredIds);

  return filteredIds
    .filter((ic) => verifiedSet.has(ic))
    .map((ic) => {
      const [prefix, name] = ic.split(':');
      const inferredStyle: Exclude<StickerColorStyle, 'all'> =
        prefix === 'fluent-emoji' ||
        prefix === 'fluent-emoji-flat' ||
        prefix === 'noto' ||
        prefix === 'twemoji' ||
        prefix === 'icon-park'
          ? 'multicolor'
          : ic.includes('duotone') || prefix === 'icon-park-twotone'
          ? 'duotone'
          : 'monochrome';
      return {
        id: `online-${ic}`,
        iconifyId: ic,
        title: (name || ic).replace(/-/g, ' '),
        category: 'Σχήματα & 3D',
        colorStyle: inferredStyle,
        tags: [rawQuery.trim(), prefix],
      };
    });
}

/**
 * Fetches an SVG from Iconify (or uses the preloaded `data:image/svg+xml` URL directly)
 * and rasterizes it onto a crisp 512x512 transparent PNG data URL so it works offline,
 * syncs to Firestore, exports to PDF, and supports all Lasso/Crop/Mirror tools.
 */
/**
 * Automatically trims transparent borders/padding around visible pixels in a canvas,
 * returning a snugly-cropped canvas with a small specified padding cushion.
 */
export function autoTrimCanvasToVisibleBounds(
  canvas: HTMLCanvasElement,
  padding = 6,
  alphaThreshold = 6
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const w = canvas.width;
  const h = canvas.height;
  if (w <= 2 || h <= 2) return canvas;

  try {
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    let minX = w;
    let minY = h;
    let maxX = -1;
    let maxY = -1;

    for (let y = 0; y < h; y++) {
      const rowOffset = y * w * 4;
      for (let x = 0; x < w; x++) {
        const a = d[rowOffset + x * 4 + 3];
        if (a > alphaThreshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // Completely transparent canvas or no pixels above threshold
    if (maxX === -1 || maxY === -1) {
      return canvas;
    }

    // Check if the image already touches the borders (within padding)
    if (
      minX <= padding &&
      minY <= padding &&
      maxX >= w - 1 - padding &&
      maxY >= h - 1 - padding
    ) {
      return canvas;
    }

    const cropX = Math.max(0, minX - padding);
    const cropY = Math.max(0, minY - padding);
    const rightX = Math.min(w, maxX + 1 + padding);
    const bottomY = Math.min(h, maxY + 1 + padding);
    const cropW = Math.max(1, rightX - cropX);
    const cropH = Math.max(1, bottomY - cropY);

    // If change is tiny (less than 4px on each side), don't recreate
    if (cropW >= w - 4 && cropH >= h - 4) {
      return canvas;
    }

    const trimmed = document.createElement('canvas');
    trimmed.width = cropW;
    trimmed.height = cropH;
    const tCtx = trimmed.getContext('2d');
    if (!tCtx) return canvas;

    tCtx.drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    return trimmed;
  } catch {
    return canvas;
  }
}

export async function tintMonochromeSketchDataUrl(
  sourceUrl: string,
  targetHexColor: string
): Promise<string> {
  const cleanHex = (targetHexColor || '#1d4ed8').replace('#', '');
  const tr = parseInt(cleanHex.slice(0, 2) || '1d', 16) / 255;
  const tg = parseInt(cleanHex.slice(2, 4) || '4e', 16) / 255;
  const tb = parseInt(cleanHex.slice(4, 6) || 'd8', 16) / 255;

  return await new Promise<string>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const w = img.naturalWidth || 512;
      const h = img.naturalHeight || 512;
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }
      ctx.drawImage(img, 0, 0, w, h);
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;

      // Find the RGB channel with the lowest minimum value (strongest contrast against 255 white)
      let minR = 255;
      let minG = 255;
      let minB = 255;
      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 64) continue;
        if (d[i] < minR) minR = d[i];
        if (d[i + 1] < minG) minG = d[i + 1];
        if (d[i + 2] < minB) minB = d[i + 2];
      }
      const ch = minR <= minG && minR <= minB ? 0 : minG <= minB ? 1 : 2;
      const minVal = ch === 0 ? minR : ch === 1 ? minG : minB;
      const denom = Math.max(30, 255 - minVal);

      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < 10) {
          d[i] = 0;
          d[i + 1] = 0;
          d[i + 2] = 0;
          d[i + 3] = 0;
          continue;
        }
        const lum = Math.max(0, Math.min(1, (d[i + ch] - minVal) / denom));
        const rVal = Math.round((tr + lum * (1 - tr)) * 255);
        const gVal = Math.round((tg + lum * (1 - tg)) * 255);
        const bVal = Math.round((tb + lum * (1 - tb)) * 255);
        d[i] = Math.min(255, (rVal + 3) & 0xf8);
        d[i + 1] = Math.min(255, (gVal + 3) & 0xf8);
        d[i + 2] = Math.min(255, (bVal + 3) & 0xf8);
        d[i + 3] = d[i + 3] > 246 ? 255 : (d[i + 3] + 7) & 0xf0;
      }
      ctx.putImageData(imgData, 0, 0);
      const trimmed = autoTrimCanvasToVisibleBounds(canvas, 6);
      const webpUrl = trimmed.toDataURL('image/webp', 0.86);
      const pngUrl = trimmed.toDataURL('image/png');
      resolve(
        webpUrl.startsWith('data:image/webp') && webpUrl.length < pngUrl.length ? webpUrl : pngUrl
      );
    };
    img.onerror = reject;
    img.src = sourceUrl;
  });
}

export async function rasterizeStickerUrlToPngDataUrl(
  svgUrl: string,
  iconifyId?: string,
  colorStyle: StickerColorStyle | Exclude<StickerColorStyle, 'all'> = 'multicolor',
  customHexColor = '#1e293b',
  overrideCustomColor?: string | null,
  overrideCustomWidth?: number | null
): Promise<string> {
  if (iconifyId && iconifyId.startsWith('sketch-png:')) {
    const parts = iconifyId.split(':');
    const pngPath = parts[1] || svgUrl;
    const defaultHex = parts[2] || '#1d4ed8';
    const cacheBustedPath = pngPath.includes('?') ? pngPath : `${pngPath}?v=vintage7`;
    if (!overrideCustomColor) {
      return cacheBustedPath;
    }
    const targetHex = overrideCustomColor || defaultHex;
    return await tintMonochromeSketchDataUrl(cacheBustedPath, targetHex);
  }

  if (iconifyId && iconifyId.startsWith('local-png:')) {
    const parts = iconifyId.split(':');
    const pngPath = parts[1] || svgUrl;
    return pngPath.includes('?') ? pngPath : `${pngPath}?v=vintage7`;
  }

  let effectiveUrl = svgUrl;

  // If the URL is still a remote Iconify URL, batch-preload it via the 3-CDN JSON API first!
  if (!effectiveUrl.startsWith('data:image/svg+xml') && iconifyId && !iconifyId.startsWith('custom-svg:')) {
    await preloadIconifyStickersBatch([iconifyId]);
    effectiveUrl = getIconifySvgUrl(
      iconifyId,
      colorStyle,
      customHexColor,
      overrideCustomColor,
      overrideCustomWidth
    );
  }

  if (effectiveUrl.startsWith('data:image/svg+xml')) {
    const isCustomFullBleed = Boolean(iconifyId && iconifyId.startsWith('custom-svg:'));
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No 2d context'));
          return;
        }
        const pad = isCustomFullBleed ? 0 : 24;
        ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
        const trimmed = autoTrimCanvasToVisibleBounds(canvas, 6);
        resolve(trimmed.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = effectiveUrl;
    });
  }

  const res = await fetch(effectiveUrl);
  if (!res.ok) throw new Error('Failed to fetch sticker SVG');
  let svgText = stripSvgBackgroundTile(await res.text());
  if (!svgText.includes('width=')) {
    svgText = svgText.replace('<svg ', '<svg width="512" height="512" ');
  }
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const blobUrl = URL.createObjectURL(svgBlob);

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No 2d context'));
          return;
        }
        const pad = 24;
        ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2);
        const trimmed = autoTrimCanvasToVisibleBounds(canvas, 6);
        resolve(trimmed.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = blobUrl;
    });
    return dataUrl;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
