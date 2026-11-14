/**
 * BestNotes Canvas Tools Catalog
 * Domain 4: Tool Descriptors, Categories, and Registry
 */

import type { ToolDescriptor, ToolCategory, ToolType } from '../types';

export const TOOL_DESCRIPTORS: readonly ToolDescriptor[] = [
  // Drawing Tools
  { id: 'pen', label: 'Στυλό', category: 'drawing', shortcut: 'P', hasSubTypes: true },
  { id: 'pencil', label: 'Μολύβι', category: 'drawing', shortcut: 'B' },
  { id: 'highlighter', label: 'Υπογραμμιστής', category: 'drawing', shortcut: 'H' },

  // Erasing Tools
  { id: 'eraser', label: 'Γόμα', category: 'erasing', shortcut: 'E', hasSubTypes: true },

  // Selection Tools
  { id: 'lasso', label: 'Λάσο', category: 'selection', shortcut: 'L' },
  { id: 'magnetic-lasso', label: 'Μαγνητικό Λάσο', category: 'selection', shortcut: 'M' },
  { id: 'direct-node', label: 'Κόμβοι (Nodes)', category: 'selection', shortcut: 'N' },

  // Geometry & Shapes
  { id: 'shape', label: 'Σχήματα', category: 'geometry', shortcut: 'S', hasSubTypes: true },
  { id: 'ruler', label: 'Χάρακας', category: 'geometry', shortcut: 'R' },

  // Presentation & Live Teaching
  { id: 'laser', label: 'Δείκτης Laser', category: 'presentation', shortcut: 'K' },

  // Content Tools
  { id: 'text', label: 'Κείμενο', category: 'content', shortcut: 'T' },
  { id: 'image', label: 'Εικόνα', category: 'content', shortcut: 'I' },
  { id: 'tape', label: 'Ταινία Απόκρυψης', category: 'content' },

  // Navigation
  { id: 'pan', label: 'Μετακίνηση', category: 'navigation', shortcut: 'Space' },
];

export function getToolsByCategory(category: ToolCategory): ToolDescriptor[] {
  return TOOL_DESCRIPTORS.filter((t) => t.category === category);
}

export function getToolDescriptor(toolId: ToolType): ToolDescriptor | undefined {
  return TOOL_DESCRIPTORS.find((t) => t.id === toolId);
}
