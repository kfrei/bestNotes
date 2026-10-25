export type StickerCategory =
  | 'Όλα'
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
  iconifyId: string; // e.g. 'custom-svg:curve-left:#dc2626:12', 'fluent-emoji:gear', 'ph:car-duotone'
  title: string;
  category: Exclude<StickerCategory, 'Όλα'>;
  colorStyle: Exclude<StickerColorStyle, 'all'>;
  tags: string[];
}

export const STICKER_CATEGORIES: { id: StickerCategory; label: string }[] = [
  { id: 'Όλα', label: 'Όλα' },
  { id: 'Βελάκια', label: '🏹 Βελάκια' },
  { id: 'Κεραυνοί & Εφέ', label: '⚡ Κεραυνοί, ! & Πυροτεχνήματα' },
  { id: 'Σχολικά & Εργαστήριο', label: '✒️ Στυλό, Μολύβια & Σχολικά' },
  { id: 'Μηχανική & Οχήματα', label: '⚙️ Γρανάζια & Αμαξάκια' },
  { id: 'Επαγγέλματα', label: '👨‍🔬 Επαγγέλματα' },
  { id: 'Emoticons', label: '😀 Emoticons' },
  { id: 'Σχήματα & 3D', label: '🧊 3D & Σύμβολα' },
];

export const STICKER_COLOR_STYLES: { id: StickerColorStyle; label: string }[] = [
  { id: 'all', label: 'Όλα τα Χρώματα' },
  { id: 'multicolor', label: '🌈 Πολύχρωμα / 3D' },
  { id: 'duotone', label: '🎨 Δίχρωμα' },
  { id: 'monochrome', label: '✒️ Μονόχρωμα' },
];

export const CURATED_STICKERS_CATALOG: StickerCatalogItem[] = [
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
    id: 'arr-sketch-left-blue-med',
    iconifyId: 'custom-svg:sketch-curve-left:#0066ff:12',
    title: 'Καμπύλο Βέλος Αριστερά (Μπλε Μεσαίο)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'αριστερά', 'μπλε', 'arrow'],
  },
  {
    id: 'arr-sketch-right-blue-med',
    iconifyId: 'custom-svg:sketch-curve-right:#0066ff:12',
    title: 'Καμπύλο Βέλος Δεξιά (Μπλε Μεσαίο)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'δεξιά', 'μπλε', 'arrow'],
  },
  {
    id: 'arr-sketch-left-green-thick',
    iconifyId: 'custom-svg:sketch-curve-left:#16a34a:17',
    title: 'Καμπύλο Βέλος Αριστερά (Πράσινο Χοντρό)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'αριστερά', 'πράσινο', 'χοντρό'],
  },
  {
    id: 'arr-sketch-right-green-thick',
    iconifyId: 'custom-svg:sketch-curve-right:#16a34a:17',
    title: 'Καμπύλο Βέλος Δεξιά (Πράσινο Χοντρό)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'δεξιά', 'πράσινο', 'χοντρό'],
  },
  {
    id: 'arr-sketch-left-orange-thin',
    iconifyId: 'custom-svg:sketch-curve-left:#ea580c:6',
    title: 'Καμπύλο Βέλος Αριστερά (Πορτοκαλί Λεπτό)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'πορτοκαλί', 'λεπτό'],
  },
  {
    id: 'arr-sketch-right-purple-thick',
    iconifyId: 'custom-svg:sketch-curve-right:#7c3aed:16',
    title: 'Καμπύλο Βέλος Δεξιά (Μωβ Χοντρό)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'μωβ', 'χοντρό'],
  },
  {
    id: 'arr-sketch-left-black-thin',
    iconifyId: 'custom-svg:sketch-curve-left:#0f172a:6',
    title: 'Καμπύλο Βέλος Αριστερά (Μαύρο Λεπτό)',
    category: 'Βελάκια',
    colorStyle: 'monochrome',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'μαύρο', 'λεπτό'],
  },
  {
    id: 'arr-sketch-down-red',
    iconifyId: 'custom-svg:sketch-arch-down-left:#dc2626:12',
    title: 'Καμπύλο Βέλος Κάτω-Αριστερά (Κόκκινο)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'κάτω', 'κόκκινο'],
  },
  {
    id: 'arr-sketch-down-blue',
    iconifyId: 'custom-svg:sketch-arch-down-right:#0066ff:12',
    title: 'Καμπύλο Βέλος Κάτω-Δεξιά (Μπλε)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'καμπύλο', 'κάτω', 'μπλε'],
  },
  {
    id: 'arr-sketch-up-green',
    iconifyId: 'custom-svg:sketch-curve-up:#16a34a:12',
    title: 'Καμπύλο Βέλος Πάνω (Πράσινο)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'πάνω', 'πράσινο'],
  },
  {
    id: 'arr-sketch-down-orange',
    iconifyId: 'custom-svg:sketch-curve-down:#ea580c:12',
    title: 'Καμπύλο Βέλος Κάτω (Πορτοκαλί)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'κάτω', 'πορτοκαλί'],
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
    tags: ['κεραυνός', 'ηλεκτρισμός', 'ενέργεια', 'ρεύμα', 'lightning'],
  },
  {
    id: 'fx-lightning-red-custom',
    iconifyId: 'custom-svg:lightning-bolt:#dc2626:12',
    title: 'Κεραυνός Δυναμικός (Κόκκινος/Χρυσός)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['κεραυνός', 'κόκκινος', 'ενέργεια', 'κίνδυνος', 'lightning'],
  },
  {
    id: 'fx-lightning-blue-custom',
    iconifyId: 'custom-svg:lightning-bolt:#0066ff:12',
    title: 'Ηλεκτρικός Κεραυνός (Μπλε)',
    category: 'Κεραυνοί & Εφέ',
    colorStyle: 'multicolor',
    tags: ['κεραυνός', 'μπλε', 'ηλεκτρισμός', 'lightning'],
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
    tags: ['σκάφος', 'βάρκα', 'πλοίο', 'άνωση', 'νερό'],
  },
  {
    id: 'mech-3d-magnet',
    iconifyId: 'fluent-emoji:magnet',
    title: 'Μαγνήτης Πεταλοειδής 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['μαγνήτης', 'μαγνητισμός', 'πεδίο', 'έλξη'],
  },
  {
    id: 'mech-3d-battery',
    iconifyId: 'fluent-emoji:battery',
    title: 'Μπαταρία / Πηγή 3D',
    category: 'Μηχανική & Οχήματα',
    colorStyle: 'multicolor',
    tags: ['μπαταρία', 'ηλεκτρισμός', 'τάση', 'κύκλωμα', 'ενέργεια'],
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
    title: 'Σύμβολο Ατόμου 3D (Φυσική & Χημεία)',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['άτομο', 'πυρήνας', 'ηλεκτρόνιο', 'φυσική', 'χημεία'],
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
    title: 'Τροχιές Ατόμου (Μονόχρωμο)',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'monochrome',
    tags: ['άτομο', 'φυσική', 'χημεία'],
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
    tags: ['καρδιά', 'ανατομία', 'βιολογία', 'αίμα'],
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
    for (const [k, v] of Object.entries(GREEK_TO_ENGLISH_ICON_DICT)) {
      if (k.startsWith(t) || t.startsWith(k)) return v;
    }
    return t;
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
    if (id.startsWith('custom-svg:')) {
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
    if (id.startsWith('custom-svg:') || ICONIFY_RAW_CACHE.has(id)) {
      verified.add(id);
    }
  }
  return verified;
}

export function isStickerVerifiedOrCached(iconifyId: string): boolean {
  if (iconifyId.startsWith('custom-svg:')) return true;
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
  if (iconifyId.startsWith('custom-svg:')) {
    const parts = iconifyId.split(':');
    const shapeKind = parts[1] || 'sketch-curve-left';
    const defaultColor = parts[2] || '#dc2626';
    const defaultWidth = Number(parts[3]) || 12;
    return buildCustomStickerSvgDataUrl(
      shapeKind,
      overrideCustomColor || defaultColor,
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
export async function rasterizeStickerUrlToPngDataUrl(
  svgUrl: string,
  iconifyId?: string,
  colorStyle: StickerColorStyle | Exclude<StickerColorStyle, 'all'> = 'multicolor',
  customHexColor = '#1e293b',
  overrideCustomColor?: string | null,
  overrideCustomWidth?: number | null
): Promise<string> {
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
        resolve(canvas.toDataURL('image/png'));
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
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = blobUrl;
    });
    return dataUrl;
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
