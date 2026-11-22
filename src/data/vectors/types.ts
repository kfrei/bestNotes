export type StemVectorSubject = 'Φυσική' | 'Χημεία' | 'Βιολογία' | 'Γεωγραφία';

export type StemVectorGrade =
  | "Ε' Δημοτικού"
  | "ΣΤ' Δημοτικού"
  | "Α' Γυμνασίου"
  | "Β' Γυμνασίου"
  | "Γ' Γυμνασίου"
  | "Α' Λυκείου"
  | "Β' Λυκείου"
  | "Γ' Λυκείου";

export interface StemVectorItem {
  id: string;
  url: string;
  subject: StemVectorSubject;
  grade: StemVectorGrade;
  chapter: string;
  chapterTitle: string;
  title: string;
  tags: string[];
}
