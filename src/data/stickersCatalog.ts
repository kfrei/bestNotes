export type StickerCategory =
  | 'Όλα'
  | 'Βελάκια'
  | 'Μηχανική & Οχήματα'
  | 'Σχολικά & Εργαστήριο'
  | 'Επαγγέλματα'
  | 'Emoticons'
  | 'Σχήματα & 3D';

export type StickerColorStyle = 'all' | 'multicolor' | 'duotone' | 'monochrome';

export interface StickerCatalogItem {
  id: string;
  iconifyId: string; // e.g. 'fluent-emoji:gear', 'ph:car-duotone', 'mdi:cog'
  title: string;
  category: Exclude<StickerCategory, 'Όλα'>;
  colorStyle: Exclude<StickerColorStyle, 'all'>;
  tags: string[];
}

export const STICKER_CATEGORIES: { id: StickerCategory; label: string }[] = [
  { id: 'Όλα', label: 'Όλα' },
  { id: 'Βελάκια', label: '🏹 Βελάκια' },
  { id: 'Μηχανική & Οχήματα', label: '⚙️ Γρανάζια & Αμαξάκια' },
  { id: 'Σχολικά & Εργαστήριο', label: '🎒 Σχολικά' },
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
  // 1. ΒΕΛΑΚΙΑ (Arrows & Pointers - 3D, Multicolor, Duotone, Monochrome)
  // =========================================================================
  {
    id: 'arr-3d-right',
    iconifyId: 'fluent-emoji:right-arrow',
    title: 'Βέλος Δεξιά 3D',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'δεξιά', 'κατεύθυνση', 'arrow'],
  },
  {
    id: 'arr-3d-upright',
    iconifyId: 'fluent-emoji-flat:up-right-arrow',
    title: 'Διαγώνιο Βέλος Πάνω-Δεξιά',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'διαγώνιο', 'άνυσμα', 'arrow'],
  },
  {
    id: 'arr-3d-down',
    iconifyId: 'fluent-emoji:down-arrow',
    title: 'Βέλος Κάτω 3D (Βαρύτητα)',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'βελάκι', 'κάτω', 'βάρος', 'βαρύτητα'],
  },
  {
    id: 'arr-3d-leftright',
    iconifyId: 'fluent-emoji:left-right-arrow',
    title: 'Διπλό Βέλος Οριζόντιο 3D',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'διπλό', 'ισορροπία', 'μήκος', 'απόσταση'],
  },
  {
    id: 'arr-3d-updown',
    iconifyId: 'fluent-emoji:up-down-arrow',
    title: 'Διπλό Βέλος Κατακόρυφο 3D',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'διπλό', 'ύψος', 'ταλάντωση', 'κατακόρυφο'],
  },
  {
    id: 'arr-3d-curve-up',
    iconifyId: 'fluent-emoji:right-arrow-curving-up',
    title: 'Καμπύλο Βέλος Πάνω 3D',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'καμπύλο', 'τροχιά', 'στροφή'],
  },
  {
    id: 'arr-3d-curve-down',
    iconifyId: 'fluent-emoji-flat:right-arrow-curving-down',
    title: 'Καμπύλο Βέλος Κάτω',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'καμπύλο', 'βολή', 'πτώση'],
  },
  {
    id: 'arr-3d-cycle',
    iconifyId: 'fluent-emoji:counterclockwise-arrows-button',
    title: 'Κυκλικά Βέλη Περιστροφής 3D',
    category: 'Βελάκια',
    colorStyle: 'multicolor',
    tags: ['βέλος', 'κύκλος', 'περιστροφή', 'ροπή', 'κύκλωμα'],
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
    id: 'arr-duo-bend',
    iconifyId: 'ph:arrow-arc-right-duotone',
    title: 'Τοξοειδές Βέλος (Δίχρωμο)',
    category: 'Βελάκια',
    colorStyle: 'duotone',
    tags: ['βέλος', 'τόξο', 'τροχιά', 'γωνία'],
  },
  {
    id: 'arr-duo-target',
    iconifyId: 'ph:target-duotone',
    title: 'Στόχος & Βέλος (Δίχρωμο)',
    category: 'Βελάκια',
    colorStyle: 'duotone',
    tags: ['στόχος', 'βέλος', 'κέντρο'],
  },
  {
    id: 'arr-mono-axis',
    iconifyId: 'mdi:axis-arrow',
    title: 'Τρισδιάστατοι Άξονες X-Y-Z (Μονόχρωμο)',
    category: 'Βελάκια',
    colorStyle: 'monochrome',
    tags: ['άξονες', 'βέλη', '3d', 'συντεταγμένες', 'xyz'],
  },
  {
    id: 'arr-mono-rotate3d',
    iconifyId: 'mdi:rotate-3d-variant',
    title: 'Βέλη Περιστροφής 3D (Μονόχρωμο)',
    category: 'Βελάκια',
    colorStyle: 'monochrome',
    tags: ['βέλος', 'περιστροφή', '3d', 'ροπή'],
  },
  {
    id: 'arr-mono-bold-right',
    iconifyId: 'mdi:arrow-right-bold-outline',
    title: 'Περίγραμμα Βέλους Δεξιά (Μονόχρωμο)',
    category: 'Βελάκια',
    colorStyle: 'monochrome',
    tags: ['βέλος', 'δεξιά', 'μονόχρωμο', 'διάνυσμα'],
  },
  {
    id: 'arr-mono-curved',
    iconifyId: 'mdi:arrow-u-right-top-bold',
    title: 'Αναστροφή Τροχιάς U (Μονόχρωμο)',
    category: 'Βελάκια',
    colorStyle: 'monochrome',
    tags: ['βέλος', 'στροφή', 'τροχιά'],
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
  // 3. ΣΧΟΛΙΚΑ & ΕΡΓΑΣΤΗΡΙΟ (School Supplies & Science Lab)
  // =========================================================================
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
    id: 'sch-3d-backpack',
    iconifyId: 'fluent-emoji:backpack',
    title: 'Σχολική Τσάντα 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['τσάντα', 'σχολείο', 'σχολικά'],
  },
  {
    id: 'sch-3d-pencil',
    iconifyId: 'fluent-emoji:pencil',
    title: 'Μολύβι 3D',
    category: 'Σχολικά & Εργαστήριο',
    colorStyle: 'multicolor',
    tags: ['μολύβι', 'σχολικά', 'γραφή', 'σχέδιο'],
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
    iconifyId: 'fluent-emoji:atom-symbol',
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
    iconifyId: 'fluent-emoji:check-mark-button',
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
    iconifyId: 'fluent-emoji:chart-increasing',
    title: 'Αύξουσα Γραφική Παράσταση 3D',
    category: 'Σχήματα & 3D',
    colorStyle: 'multicolor',
    tags: ['γράφημα', 'καμπύλη', 'αύξηση', 'μαθηματικά'],
  },
  {
    id: 'shp-3d-barchart',
    iconifyId: 'fluent-emoji:bar-chart',
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

export function getIconifySvgUrl(
  iconifyId: string,
  colorStyle: StickerColorStyle | Exclude<StickerColorStyle, 'all'>,
  customHexColor = '#1e293b'
): string {
  const [prefix, name] = iconifyId.split(':');
  if (!prefix || !name) return '';
  const baseUrl = `https://api.iconify.design/${prefix}/${name}.svg`;
  if (
    colorStyle === 'monochrome' ||
    prefix === 'mdi' ||
    prefix === 'lucide' ||
    prefix === 'tabler'
  ) {
    return `${baseUrl}?color=${encodeURIComponent(customHexColor)}`;
  }
  if (colorStyle === 'duotone' || prefix === 'ph' || prefix === 'solar') {
    return `${baseUrl}?color=${encodeURIComponent('#0066ff')}`;
  }
  return baseUrl;
}

/**
 * Searches Iconify's 200,000+ online vector library live according to the user's query and color style.
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

  try {
    const res = await fetch(
      `https://api.iconify.design/search?query=${encodeURIComponent(enQuery)}&prefixes=${encodeURIComponent(
        prefixes
      )}&limit=36`
    );
    if (!res.ok) return [];
    const data = await res.json();
    const icons: string[] = Array.isArray(data?.icons) ? data.icons : [];
    return icons
      .filter((ic) => {
        if (colorStyle === 'duotone') {
          return ic.includes('duotone') || ic.startsWith('icon-park-twotone:');
        }
        return true;
      })
      .slice(0, 28)
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
  } catch {
    return [];
  }
}

/**
 * Fetches an SVG from Iconify and rasterizes it onto a crisp 512x512 transparent PNG data URL
 * so it works offline, syncs to Firestore, exports to PDF, and supports all Lasso/Crop/Mirror tools.
 */
export async function rasterizeStickerUrlToPngDataUrl(svgUrl: string): Promise<string> {
  const res = await fetch(svgUrl);
  if (!res.ok) throw new Error('Failed to fetch sticker SVG');
  let svgText = await res.text();
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
