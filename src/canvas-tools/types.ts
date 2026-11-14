/**
 * BestNotes Canvas Tools Architecture
 * Domain 4: Drawing Tools, Pens, Highlighters, Lasers, Shapes, Selection & Geometry
 */

import type {
  ToolType,
  PenSubType,
  EraserSubType,
  ShapePresetType,
} from '../types/note';

export type { ToolType, PenSubType, EraserSubType, ShapePresetType };

export type ToolCategory =
  | 'drawing'      // pen, pencil, highlighter
  | 'erasing'      // eraser (stroke, precision, highlighter-only)
  | 'selection'    // lasso, magnetic-lasso, direct-node
  | 'geometry'     // shape, ruler
  | 'presentation' // laser
  | 'content'      // text, image, tape
  | 'navigation';  // pan

export interface ToolDescriptor {
  id: ToolType;
  label: string;
  category: ToolCategory;
  shortcut?: string;
  hasSubTypes?: boolean;
}

export interface StrokeStyleConfig {
  color: string;
  width: number;
  opacity: number;
  subType?: PenSubType | EraserSubType;
}

export interface ColorSlotMeta {
  index: number;
  color: string;
  isRecent: boolean;
}
