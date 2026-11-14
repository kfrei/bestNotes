/**
 * BestNotes Library Domain Types
 * Domain 3: Notebook Library, Shelves, Folder Hierarchies, and Filters
 */

import type { Notebook, NotePage } from '../../types/note';

export type { Notebook, NotePage };

export interface CustomFolderMeta {
  name: string;
  color?: string;
  icon?: string;
  favorite?: boolean;
  updatedAt?: string;
}

export interface EditingFolderModalState {
  name: string;
  originalPath: string;
  parentPath: string;
  color: string;
  icon: string;
  favorite: boolean;
}

export interface FolderPresetColor {
  hex: string;
  label: string;
}

export interface FolderPresetIcon {
  id: string;
  label: string;
}
