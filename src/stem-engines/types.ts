/**
 * Core types and definitions for the STEM Engines & OCR Domain.
 * Encompasses Mathematical function graphing, Chemical reactions & 3D molecules,
 * and Multi-provider Vision AI (textOCR, MathOCR, ChemOCR).
 */

export type StemDomain = 'math' | 'chemistry' | 'physics' | 'biology';

export type OcrTaskKind = 'text' | 'math' | 'chem' | '3d-molecule';

export interface OcrResult<T = string> {
  success: boolean;
  rawText?: string;
  data?: T;
  provider?: 'gemini' | 'groq' | 'mistral';
  latencyMs?: number;
  error?: string;
}

export interface MathFunctionPlotDefinition {
  id: string;
  expression: string;
  latex?: string;
  color?: string;
  domain?: [number, number];
  isParametric?: boolean;
}

export interface ChemicalReactionAnalysis {
  originalText: string;
  isBalanced: boolean;
  balancedEquation: string;
  reactants: string[];
  products: string[];
  correctedCoefficients?: Record<string, number>;
}
