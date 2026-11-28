/**
 * Lazy-loaded Library Catalogs (Science Vectors + Mind Maps + Curated Stickers + Banner Frames)
 * Keeps ~1.86 MB of static SVG/catalog data out of the initial index.js bundle so first load
 * on iPad / PWA is dramatically faster; chunks load on-demand once the Library panel opens.
 */
import type { MindMapLibraryItem } from './mindMapsCatalog';

export type StickersCatalogModule = typeof import('./stickersCatalog');
export type BannerFramesCatalogModule = typeof import('./bannerFramesCatalog');

export interface LoadedLibraryCatalogs {
  scienceCatalog: MindMapLibraryItem[];
  stickersMod: StickersCatalogModule;
  bannerFramesMod: BannerFramesCatalogModule;
}

let cachedPromise: Promise<LoadedLibraryCatalogs> | null = null;
let cachedResult: LoadedLibraryCatalogs | null = null;

export function getCachedLibraryCatalogs(): LoadedLibraryCatalogs | null {
  return cachedResult;
}

export function loadLibraryCatalogs(): Promise<LoadedLibraryCatalogs> {
  if (cachedResult) return Promise.resolve(cachedResult);
  if (!cachedPromise) {
    cachedPromise = Promise.all([
      import('./vectors'),
      import('./mindMapsCatalog'),
      import('./stickersCatalog'),
      import('./bannerFramesCatalog'),
    ]).then(([vectorsMod, mindMapsMod, stickersMod, bannerFramesMod]) => {
      const scienceCatalog: MindMapLibraryItem[] = [
        ...vectorsMod.STEM_VECTORS_CATALOG.map((v) => ({
          ...v,
          description: `${v.chapterTitle} (Native Vector SVG)`,
          englishKey: v.id,
        })),
        ...mindMapsMod.MIND_MAPS_CATALOG,
      ];
      cachedResult = {
        scienceCatalog,
        stickersMod,
        bannerFramesMod,
      };
      return cachedResult;
    });
  }
  return cachedPromise;
}
