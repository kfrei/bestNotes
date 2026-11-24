import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  Folder,
  FolderOpen,
  GripVertical,
  Home,
  PanelLeftClose,
} from 'lucide-react';
import type { Notebook } from '../../../types/note';
import { isShowcaseFolderPath, isShowcaseNotebook } from '../../../services/storage';

export interface LibraryTreeFolderEntry {
  path: string;
  name: string;
  parentPath: string;
  updatedAt: string;
  count: number;
  subfolderCount: number;
  totalBytes: number;
  color?: string;
  icon?: string;
  favorite?: boolean;
}

export interface LibraryFolderTreeSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  folderMap: Map<string, LibraryTreeFolderEntry>;
  notebooks: Notebook[];
  currentFolderPath: string;
  draggingLibraryNbId: string | null;
  dragOverFolderName: string | null;
  isDragCopyMode: boolean;
  isAdminUser: boolean;
  showcaseFolderName: string;
  resolveNotebookSpineColor: (nb: Notebook) => string;
  onSelectFolder: (folderPath: string | null) => void;
  onOpenNotebook: (nb: Notebook) => void;
  onNotebookPointerDrag: (e: React.PointerEvent<HTMLElement>, nb: Notebook) => void;
  onThumbPointerEnter: (e: React.PointerEvent<HTMLDivElement>, nbId: string) => void;
  onClearThumbHover: (nbId?: string) => void;
}

const normalizePath = (raw: string) =>
  raw
    .split('/')
    .map((s) => s.trim())
    .filter(Boolean)
    .join('/');

export const LibraryFolderTreeSidebar: React.FC<LibraryFolderTreeSidebarProps> = ({
  isOpen,
  onClose,
  folderMap,
  notebooks,
  currentFolderPath,
  draggingLibraryNbId,
  dragOverFolderName,
  isDragCopyMode,
  isAdminUser,
  showcaseFolderName,
  resolveNotebookSpineColor,
  onSelectFolder,
  onOpenNotebook,
  onNotebookPointerDrag,
  onThumbPointerEnter,
  onClearThumbHover,
}) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => new Set(['__ROOT__']));

  // Auto-expand ancestors of the currently opened folder so the user always sees where they are
  useEffect(() => {
    if (!currentFolderPath) return;
    const parts = currentFolderPath.split('/');
    setExpandedPaths((prev) => {
      let changed = false;
      const next = new Set(prev);
      let acc = '';
      for (const seg of parts) {
        acc = acc ? `${acc}/${seg}` : seg;
        if (!next.has(acc)) {
          next.add(acc);
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [currentFolderPath]);

  // Build sorted children map & notebooks-by-folder map in O(N)
  const { childrenByParent, notesByFolder, allFolderPaths } = useMemo(() => {
    const childMap = new Map<string, LibraryTreeFolderEntry[]>();
    const paths: string[] = [];
    for (const entry of folderMap.values()) {
      paths.push(entry.path);
      const pKey = entry.parentPath || '';
      const list = childMap.get(pKey) || [];
      list.push(entry);
      childMap.set(pKey, list);
    }
    for (const list of childMap.values()) {
      list.sort((a, b) => a.name.localeCompare(b.name, 'el'));
    }

    const nMap = new Map<string, Notebook[]>();
    for (const nb of notebooks) {
      const fKey = normalizePath(nb.folder || '');
      const list = nMap.get(fKey) || [];
      list.push(nb);
      nMap.set(fKey, list);
    }
    for (const list of nMap.values()) {
      list.sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    }

    return { childrenByParent: childMap, notesByFolder: nMap, allFolderPaths: paths };
  }, [folderMap, notebooks]);

  // Spring-loaded folders (macOS Finder style):
  // When dragging a note and hovering over a collapsed folder that has subfolders,
  // automatically expand it after 550ms so you can drill down into nested subfolders.
  useEffect(() => {
    if (!draggingLibraryNbId || !dragOverFolderName) return;
    const isRootTarget = dragOverFolderName === '__ROOT__';
    const hasSubfolders = isRootTarget
      ? (childrenByParent.get('') || []).length > 0
      : (childrenByParent.get(dragOverFolderName) || []).length > 0;
    if (!hasSubfolders || expandedPaths.has(dragOverFolderName)) return;

    const timer = window.setTimeout(() => {
      setExpandedPaths((prev) => {
        if (prev.has(dragOverFolderName)) return prev;
        const next = new Set(prev);
        next.add(dragOverFolderName);
        return next;
      });
    }, 550);

    return () => window.clearTimeout(timer);
  }, [draggingLibraryNbId, dragOverFolderName, childrenByParent, expandedPaths]);

  const toggleExpand = (pathKey: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(pathKey)) next.delete(pathKey);
      else next.add(pathKey);
      return next;
    });
  };

  const allExpanded =
    allFolderPaths.length > 0 && allFolderPaths.every((p) => expandedPaths.has(p));

  const handleToggleExpandAll = () => {
    if (allExpanded) {
      setExpandedPaths(new Set(['__ROOT__']));
    } else {
      setExpandedPaths(new Set(['__ROOT__', ...allFolderPaths]));
    }
  };

  const rootNotes = notesByFolder.get('') || [];
  const rootFolders = childrenByParent.get('') || [];
  const isRootExpanded = expandedPaths.has('__ROOT__');
  const isRootActive = !currentFolderPath;
  const isRootDropHover = dragOverFolderName === '__ROOT__' && Boolean(draggingLibraryNbId);

  const renderNoteRow = (nb: Notebook, depth: number) => {
    const spineColor = resolveNotebookSpineColor(nb);
    const isDraggingThis = draggingLibraryNbId === nb.id;
    const isLockedShowcase = isShowcaseNotebook(nb) && !isAdminUser;

    return (
      <div
        key={`tree-nb-${nb.id}`}
        onPointerDown={(e) => {
          onClearThumbHover();
          onNotebookPointerDrag(e, nb);
        }}
        onPointerEnter={(e) => onThumbPointerEnter(e, nb.id)}
        onPointerLeave={() => onClearThumbHover(nb.id)}
        onClick={(e) => {
          e.stopPropagation();
          onOpenNotebook(nb);
        }}
        style={{ paddingLeft: `${depth * 14 + 24}px` }}
        className={`group flex items-center gap-2 pr-2 py-1.5 rounded-xl text-[12px] transition-all select-none ${
          isLockedShowcase
            ? 'cursor-pointer text-slate-600 hover:bg-[#efebe3]/80'
            : 'cursor-grab active:cursor-grabbing text-[#1e293b] hover:bg-[#efebe3]/85 hover:text-[#1b2a4a]'
        } ${isDraggingThis ? 'opacity-40 bg-sky-50' : ''}`}
        title={
          isLockedShowcase
            ? `Άνοιγμα «${nb.title}» (Demo)`
            : `Κλικ για άνοιγμα · Σύρε για Μετακίνηση · +Shift για Αντιγραφή`
        }
      >
        <span
          className="w-1.5 h-4 rounded-full shrink-0 shadow-2xs"
          style={{ backgroundColor: spineColor }}
        />
        <span className="truncate flex-1 font-medium leading-tight">{nb.title}</span>
        {!isLockedShowcase && (
          <GripVertical className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
        )}
      </div>
    );
  };

  const renderFolderNode = (entry: LibraryTreeFolderEntry, depth: number) => {
    const isExpanded = expandedPaths.has(entry.path);
    const isActive = currentFolderPath === entry.path;
    const childFolders = childrenByParent.get(entry.path) || [];
    const childNotes = notesByFolder.get(entry.path) || [];
    const hasChildren = childFolders.length > 0 || childNotes.length > 0;
    const folderColor = entry.color || '#f59e0b';
    const isLockedShowcase =
      isShowcaseFolderPath(entry.path, showcaseFolderName) && !isAdminUser;
    const isDropHover = dragOverFolderName === entry.path && Boolean(draggingLibraryNbId);

    return (
      <div key={`tree-folder-${entry.path}`}>
        <div
          data-library-folder-drop={isLockedShowcase ? undefined : entry.path}
          onClick={() => toggleExpand(entry.path)}
          onDoubleClick={() => onSelectFolder(entry.path)}
          style={{ paddingLeft: `${depth * 14 + 6}px` }}
          className={`group flex items-center gap-1.5 pr-2 py-1.5 rounded-xl text-[12.5px] cursor-pointer transition-all select-none ${
            isDropHover
              ? isDragCopyMode
                ? 'bg-sky-100 text-sky-900 ring-2 ring-sky-500 font-bold shadow-xs'
                : 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500 font-bold shadow-xs'
              : isActive
              ? 'bg-[#234978]/12 text-[#1b2a4a] font-bold ring-1 ring-[#234978]/20'
              : 'text-[#2c3e50] hover:bg-[#efebe3]/80 font-semibold'
          }`}
          title={`Κλικ: άνοιγμα/κλείσιμο φακέλου «${entry.name}» · Διπλό κλικ: προβολή δεξιά (${entry.count} αρχεία)`}
        >
          <button
            type="button"
            data-no-card-drag="true"
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(entry.path);
            }}
            className={`w-5 h-5 flex items-center justify-center rounded-md hover:bg-black/5 shrink-0 transition-colors ${
              hasChildren ? 'text-slate-500' : 'text-transparent pointer-events-none'
            }`}
            aria-label={isExpanded ? 'Σύμπτυξη φακέλου' : 'Ανάπτυξη φακέλου'}
          >
            {isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
          </button>

          {isExpanded ? (
            <FolderOpen
              className="w-4 h-4 shrink-0"
              style={{ color: folderColor, fill: `${folderColor}30` }}
            />
          ) : (
            <Folder
              className="w-4 h-4 shrink-0"
              style={{ color: folderColor, fill: `${folderColor}35` }}
            />
          )}

          <span className="truncate flex-1 leading-tight">{entry.name}</span>

          <span
            className={`text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md shrink-0 ${
              isActive
                ? 'bg-[#234978]/15 text-[#234978]'
                : 'bg-slate-200/70 text-slate-500'
            }`}
          >
            {entry.count}
          </span>
        </div>

        {isExpanded && hasChildren && (
          <div className="mt-0.5 space-y-0.5 relative">
            {childFolders.map((cf) => renderFolderNode(cf, depth + 1))}
            {childNotes.map((nb) => renderNoteRow(nb, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile backdrop overlay (smooth fade in/out) */}
      <div
        onClick={onClose}
        aria-hidden={!isOpen}
        className={`md:hidden fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-[2px] transition-opacity duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Full-Height Vertical Tree Sidebar — true smooth left↔right push/pull slide */}
      <aside
        aria-label="Δέντρο Φακέλων & Αρχείων"
        aria-hidden={!isOpen}
        className={`fixed md:relative inset-y-0 left-0 z-40 md:z-20 w-[288px] max-w-[85vw] md:w-[288px] shrink-0 h-full flex flex-col bg-[#fdfbf7]/96 backdrop-blur-md border-r border-[#dfd8cb] will-change-[margin,transform] transition-[margin-left,transform,box-shadow] duration-[380ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isOpen
            ? 'translate-x-0 md:ml-0 shadow-[6px_0_24px_rgba(15,23,42,0.08)] md:shadow-[2px_0_16px_rgba(15,23,42,0.05)] pointer-events-auto'
            : '-translate-x-full md:translate-x-0 md:-ml-[288px] shadow-none pointer-events-none'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-3 border-b border-[#dfd8cb]/85 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1b2a4a] truncate">
              Δέντρο Φακέλων
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleToggleExpandAll}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#1b2a4a] hover:bg-[#efebe3] transition cursor-pointer"
              title={allExpanded ? 'Σύμπτυξη όλων των φακέλων' : 'Ανάπτυξη όλων των φακέλων'}
            >
              {allExpanded ? (
                <ChevronsDownUp className="w-4 h-4" />
              ) : (
                <ChevronsUpDown className="w-4 h-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-[#1b2a4a] hover:bg-[#efebe3] transition cursor-pointer"
              title="Κλείσιμο πλευρικού πίνακα"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Hierarchical Tree */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-2.5 py-2.5 space-y-1">
          {/* Root: Βιβλιοθήκη */}
          <div>
            <div
              data-library-folder-drop="__ROOT__"
              onClick={() => toggleExpand('__ROOT__')}
              onDoubleClick={() => onSelectFolder(null)}
              className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[12.5px] cursor-pointer transition-all select-none ${
                isRootDropHover
                  ? isDragCopyMode
                    ? 'bg-sky-100 text-sky-900 ring-2 ring-sky-500 font-bold shadow-xs'
                    : 'bg-emerald-100 text-emerald-900 ring-2 ring-emerald-500 font-bold shadow-xs'
                  : isRootActive
                  ? 'bg-[#234978]/12 text-[#1b2a4a] font-bold ring-1 ring-[#234978]/20'
                  : 'text-[#2c3e50] hover:bg-[#efebe3]/80 font-semibold'
              }`}
              title="Κλικ: άνοιγμα/κλείσιμο · Διπλό κλικ: προβολή Βιβλιοθήκης δεξιά"
            >
              <button
                type="button"
                data-no-card-drag="true"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand('__ROOT__');
                }}
                className="w-5 h-5 flex items-center justify-center rounded-md hover:bg-black/5 text-slate-500 shrink-0"
                aria-label={isRootExpanded ? 'Σύμπτυξη Βιβλιοθήκης' : 'Ανάπτυξη Βιβλιοθήκης'}
              >
                {isRootExpanded ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5" />
                )}
              </button>
              <Home className="w-4 h-4 text-[#234978] shrink-0" />
              <span className="truncate flex-1">Βιβλιοθήκη</span>
              <span className="text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-md bg-slate-200/70 text-slate-500 shrink-0">
                {notebooks.length}
              </span>
            </div>

            {isRootExpanded && (
              <div className="mt-1 space-y-0.5">
                {rootFolders.map((entry) => renderFolderNode(entry, 1))}
                {rootNotes.length > 0 && (
                  <div className="pt-1 mt-1 border-t border-[#dfd8cb]/60 space-y-0.5">
                    {rootNotes.map((nb) => renderNoteRow(nb, 0))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Drag & Drop + Shift Copy Hint */}
        <div className="px-3.5 py-2.5 border-t border-[#dfd8cb]/85 bg-[#f7f5f0]/80 shrink-0">
          <div className="flex items-center justify-between gap-2 text-[10.5px] font-semibold text-slate-500">
            <span>Σύρε: Μετακίνηση</span>
            <span className="px-1.5 py-0.5 rounded-md bg-white/90 border border-[#dfd8cb] text-[#1b2a4a] font-bold">
              + Shift: Αντιγραφή
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
