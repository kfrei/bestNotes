export type { StemVectorItem, StemVectorSubject, StemVectorGrade } from './types';
export { PHYSICS_VECTORS_CATALOG } from './physicsVectorsCatalog';
export { CHEMISTRY_VECTORS_CATALOG } from './chemistryVectorsCatalog';
export { BIOLOGY_VECTORS_CATALOG } from './biologyVectorsCatalog';
export { GEOGRAPHY_VECTORS_CATALOG } from './geographyVectorsCatalog';

import { PHYSICS_VECTORS_CATALOG } from './physicsVectorsCatalog';
import { CHEMISTRY_VECTORS_CATALOG } from './chemistryVectorsCatalog';
import { BIOLOGY_VECTORS_CATALOG } from './biologyVectorsCatalog';
import { GEOGRAPHY_VECTORS_CATALOG } from './geographyVectorsCatalog';
import type { StemVectorItem } from './types';

export const STEM_VECTORS_CATALOG: StemVectorItem[] = [
  ...PHYSICS_VECTORS_CATALOG,
  ...CHEMISTRY_VECTORS_CATALOG,
  ...BIOLOGY_VECTORS_CATALOG,
  ...GEOGRAPHY_VECTORS_CATALOG,
];
