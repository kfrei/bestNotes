import React from 'react';
import {
  GraduationCap,
  BookOpen,
  Atom,
  FlaskConical,
  Dna,
  Leaf,
  Calculator,
  Compass,
  Zap,
  Magnet,
  Globe,
  Rocket,
  Lightbulb,
  Microscope,
  Pen,
  ClipboardList,
  Trophy,
  Target,
  Music,
  School,
  NotebookPen,
  Library,
  Backpack,
  Orbit,
  Thermometer,
  TestTubes,
  FlaskRound,
  Brain,
  HeartPulse,
  Heart,
  Star,
  Folder,
} from 'lucide-react';
import type { FolderPresetColor, FolderPresetIcon } from '../types';

export const FOLDER_PRESET_COLORS: readonly FolderPresetColor[] = [
  { hex: '#e11d48', label: 'Κόκκινο' },
  { hex: '#ec4899', label: 'Ροζ' },
  { hex: '#ea580c', label: 'Πορτοκαλί' },
  { hex: '#f59e0b', label: 'Κεχριμπάρι' },
  { hex: '#65a30d', label: 'Λαχανί' },
  { hex: '#10b981', label: 'Σμαραγδί' },
  { hex: '#06b6d4', label: 'Τιρκουάζ' },
  { hex: '#234978', label: 'Μπλε' },
  { hex: '#8b5cf6', label: 'Μωβ' },
  { hex: '#a21caf', label: 'Δαμασκηνί' },
  { hex: '#92400e', label: 'Καφέ' },
  { hex: '#475569', label: 'Γκρι-Μπλε' },
];

export const FOLDER_PRESET_ICONS: readonly FolderPresetIcon[] = [
  { id: 'folder', label: 'Φάκελος' },
  { id: 'school', label: 'Καπέλο Αποφοίτησης' },
  { id: 'book', label: 'Ανοιχτό Βιβλίο' },
  { id: 'atom', label: 'Φυσική / Άτομο' },
  { id: 'flask', label: 'Χημεία / Κωνική Φιάλη' },
  { id: 'dna', label: 'Βιολογία / DNA' },
  { id: 'leaf', label: 'Βιολογία / Φυτό' },
  { id: 'calculator', label: 'Μαθηματικά' },
  { id: 'compass', label: 'Γεωμετρία / Πυξίδα' },
  { id: 'zap', label: 'Φυσική / Ηλεκτρισμός' },
  { id: 'magnet', label: 'Φυσική / Μαγνητισμός' },
  { id: 'globe', label: 'Γεωγραφία / Υδρόγειος' },
  { id: 'rocket', label: 'Φυσική / Διάστημα' },
  { id: 'lightbulb', label: 'Ιδέες / Οπτική' },
  { id: 'microscope', label: 'Βιολογία / Μικροσκόπιο' },
  { id: 'pen', label: 'Σημειώσεις / Στυλό' },
  { id: 'clipboard', label: 'Διαγωνίσματα / Ασκήσεις' },
  { id: 'trophy', label: 'Επιτυχίες' },
  { id: 'target', label: 'Στόχοι' },
  { id: 'music', label: 'Μουσική' },
  { id: 'school-building', label: 'Σχολείο / Τάξη' },
  { id: 'notebook', label: 'Τετράδιο' },
  { id: 'library', label: 'Βιβλία / Βιβλιοθήκη' },
  { id: 'backpack', label: 'Σχολική Τσάντα' },
  { id: 'orbit', label: 'Φυσική / Τροχιές & Δυνάμεις' },
  { id: 'thermometer', label: 'Φυσική / Θερμότητα' },
  { id: 'test-tubes', label: 'Χημεία / Δοκιμαστικοί Σωλήνες' },
  { id: 'flask-round', label: 'Χημεία / Σφαιρική Φιάλη' },
  { id: 'brain', label: 'Βιολογία / Εγκέφαλος' },
  { id: 'heart-pulse', label: 'Βιολογία / Καρδιά & Υγεία' },
];

export function renderFolderCustomIcon(
  iconId: string | undefined,
  colorHex: string | undefined,
  sizeClass = 'w-7 h-7'
): React.ReactNode {
  const c = colorHex || '#f59e0b';
  const style = { color: c };
  switch (iconId) {
    case 'school':
      return <GraduationCap className={sizeClass} style={style} />;
    case 'book':
      return <BookOpen className={sizeClass} style={style} />;
    case 'atom':
      return <Atom className={sizeClass} style={style} />;
    case 'flask':
      return <FlaskConical className={sizeClass} style={style} />;
    case 'dna':
      return <Dna className={sizeClass} style={style} />;
    case 'leaf':
      return <Leaf className={sizeClass} style={style} />;
    case 'calculator':
      return <Calculator className={sizeClass} style={style} />;
    case 'compass':
      return <Compass className={sizeClass} style={style} />;
    case 'zap':
      return <Zap className={sizeClass} style={{ color: c, fill: `${c}33` }} />;
    case 'magnet':
      return <Magnet className={sizeClass} style={style} />;
    case 'globe':
      return <Globe className={sizeClass} style={style} />;
    case 'rocket':
      return <Rocket className={sizeClass} style={style} />;
    case 'lightbulb':
      return <Lightbulb className={sizeClass} style={{ color: c, fill: `${c}33` }} />;
    case 'microscope':
      return <Microscope className={sizeClass} style={style} />;
    case 'pen':
      return <Pen className={sizeClass} style={style} />;
    case 'clipboard':
      return <ClipboardList className={sizeClass} style={style} />;
    case 'trophy':
      return <Trophy className={sizeClass} style={style} />;
    case 'target':
      return <Target className={sizeClass} style={style} />;
    case 'music':
      return <Music className={sizeClass} style={style} />;
    case 'school-building':
      return <School className={sizeClass} style={style} />;
    case 'notebook':
      return <NotebookPen className={sizeClass} style={style} />;
    case 'library':
      return <Library className={sizeClass} style={style} />;
    case 'backpack':
      return <Backpack className={sizeClass} style={style} />;
    case 'orbit':
      return <Orbit className={sizeClass} style={style} />;
    case 'thermometer':
      return <Thermometer className={sizeClass} style={style} />;
    case 'test-tubes':
      return <TestTubes className={sizeClass} style={style} />;
    case 'flask-round':
      return <FlaskRound className={sizeClass} style={style} />;
    case 'brain':
      return <Brain className={sizeClass} style={style} />;
    case 'heart-pulse':
      return <HeartPulse className={sizeClass} style={style} />;
    case 'heart':
      return <Heart className={sizeClass} style={{ color: c, fill: `${c}33` }} />;
    case 'star':
      return <Star className={sizeClass} style={{ color: c, fill: `${c}33` }} />;
    case 'folder':
    default:
      return <Folder className={sizeClass} style={{ color: c, fill: c }} />;
  }
}
