export interface HandcraftedVectorItem {
  id: string;
  url: string;
  subject: 'Βιολογία' | 'Φυσική' | 'Χημεία' | 'Γεωγραφία';
  title: string;
  tags: string[];
  svgKb: string;
}

export const HANDCRAFTED_VECTOR_CATALOG: HandcraftedVectorItem[] = [
  {
    id: 'hvec-01',
    url: '/mind_maps/vectors_handcrafted/03_respiration_1.svg',
    subject: 'Βιολογία',
    title: 'Αναπνευστικό Σύστημα Ανθρώπου (Πνεύμονες)',
    tags: ['αναπνευστικό', 'άνθρωπος', 'πνεύμονας', 'αναπνοή', 'οξυγόνο', 'vector', 'svg'],
    svgKb: '6.2KB',
  },
  {
    id: 'hvec-02',
    url: '/mind_maps/vectors_handcrafted/02_nutrition_2.svg',
    subject: 'Βιολογία',
    title: 'Φυτό με Ρίζες (Θρέψη Φυτών)',
    tags: ['φυτό', 'ρίζα', 'θρέψη', 'φωτοσύνθεση', 'αυτότροφος', 'vector', 'svg'],
    svgKb: '5.4KB',
  },
  {
    id: 'hvec-03',
    url: '/mind_maps/vectors_handcrafted/03_respiration_2.svg',
    subject: 'Βιολογία',
    title: 'Αναπνοή Ψαριού με Βράγχια',
    tags: ['αναπνοή', 'ψάρι', 'βράγχια', 'νερό', 'vector', 'svg'],
    svgKb: '6.0KB',
  },
  {
    id: 'hvec-04',
    url: '/mind_maps/vectors_handcrafted/05_growth_1.svg',
    subject: 'Βιολογία',
    title: 'Σπόρος στο Έδαφος (1ο Στάδιο Ανάπτυξης)',
    tags: ['σπόρος', 'έδαφος', 'ανάπτυξη', 'φυτό', 'vector', 'svg'],
    svgKb: '2.6KB',
  },
  {
    id: 'hvec-05',
    url: '/mind_maps/vectors_handcrafted/07_response_2.svg',
    subject: 'Βιολογία',
    title: 'Ήλιος με Ακτίνες Φωτός',
    tags: ['ήλιος', 'φως', 'ακτίνες', 'ενέργεια', 'vector', 'svg'],
    svgKb: '2.6KB',
  },
  {
    id: 'hvec-06',
    url: '/mind_maps/vectors_handcrafted/02_nutrition_1.svg',
    subject: 'Βιολογία',
    title: 'Παιδί που τρώει Μήλο (Θρέψη Ζώων)',
    tags: ['παιδί', 'μήλο', 'θρέψη', 'ζώο', 'τροφή', 'vector', 'svg'],
    svgKb: '5.2KB',
  },
];
