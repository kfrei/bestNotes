export interface VectorDemoItem {
  id: string;
  url: string;
  originalPngUrl: string;
  subject: 'Βιολογία' | 'Φυσική' | 'Χημεία' | 'Γεωγραφία';
  title: string;
  tags: string[];
  pathsCount: number;
  svgKb: number;
}

export const VECTOR_DEMO_CATALOG: VectorDemoItem[] = [
  {
    id: 'vec-01',
    url: '/mind_maps/vectors_demo/03_respiration_1.svg',
    originalPngUrl: '/mind_maps/biology_a_gymnasio/1_1/03_respiration_1.png',
    subject: 'Βιολογία',
    title: 'Αναπνευστικό Σύστημα Ανθρώπου (Πνεύμονες)',
    tags: ['αναπνευστικό', 'άνθρωπος', 'πνεύμονας', 'αναπνοή', 'οξυγόνο', 'vector', 'svg'],
    pathsCount: 53,
    svgKb: 77,
  },
  {
    id: 'vec-02',
    url: '/mind_maps/vectors_demo/02_nutrition_1.svg',
    originalPngUrl: '/mind_maps/biology_a_gymnasio/1_1/02_nutrition_1.png',
    subject: 'Βιολογία',
    title: 'Παιδί που τρώει Μήλο (Θρέψη Ζώων)',
    tags: ['παιδί', 'μήλο', 'θρέψη', 'ζώο', 'τροφή', 'vector', 'svg'],
    pathsCount: 86,
    svgKb: 128,
  },
  {
    id: 'vec-03',
    url: '/mind_maps/vectors_demo/02_nutrition_2.svg',
    originalPngUrl: '/mind_maps/biology_a_gymnasio/1_1/02_nutrition_2.png',
    subject: 'Βιολογία',
    title: 'Φυτό με Ρίζες (Θρέψη Φυτών)',
    tags: ['φυτό', 'ρίζα', 'θρέψη', 'φωτοσύνθεση', 'αυτότροφος', 'vector', 'svg'],
    pathsCount: 121,
    svgKb: 157,
  },
  {
    id: 'vec-04',
    url: '/mind_maps/vectors_demo/03_respiration_2.svg',
    originalPngUrl: '/mind_maps/biology_a_gymnasio/1_1/03_respiration_2.png',
    subject: 'Βιολογία',
    title: 'Αναπνοή Ψαριού με Βράγχια',
    tags: ['αναπνοή', 'ψάρι', 'βράγχια', 'νερό', 'vector', 'svg'],
    pathsCount: 81,
    svgKb: 105,
  },
  {
    id: 'vec-05',
    url: '/mind_maps/vectors_demo/05_growth_1.svg',
    originalPngUrl: '/mind_maps/biology_a_gymnasio/1_1/05_growth_1.png',
    subject: 'Βιολογία',
    title: 'Σπόρος στο Έδαφος (1ο Στάδιο Ανάπτυξης)',
    tags: ['σπόρος', 'έδαφος', 'ανάπτυξη', 'φυτό', 'vector', 'svg'],
    pathsCount: 37,
    svgKb: 41,
  },
  {
    id: 'vec-06',
    url: '/mind_maps/vectors_demo/07_response_2.svg',
    originalPngUrl: '/mind_maps/biology_a_gymnasio/1_1/07_response_2.png',
    subject: 'Βιολογία',
    title: 'Ήλιος με Ακτίνες Φωτός',
    tags: ['ήλιος', 'φως', 'ακτίνες', 'ενέργεια', 'vector', 'svg'],
    pathsCount: 24,
    svgKb: 17,
  },
];
