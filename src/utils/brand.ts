export const isExplainBoardsBrand =
  typeof window !== 'undefined' &&
  (window.location.hostname.toLowerCase().includes('explainboard') ||
    window.location.search.toLowerCase().includes('explainboard'));
