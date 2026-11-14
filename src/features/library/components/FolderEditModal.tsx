import React from 'react';
import { Star, X, Folder, Home } from 'lucide-react';
import {
  FOLDER_PRESET_COLORS,
  FOLDER_PRESET_ICONS,
  renderFolderCustomIcon,
} from '../constants/folderPresets';

export interface EditingFolderModalData {
  name: string;
  originalPath: string;
  parentPath: string;
  color: string;
  icon: string;
  favorite: boolean;
  showMoveTree?: boolean;
}

export interface FolderNodeInfo {
  path: string;
  name: string;
  parentPath: string;
  color?: string;
  icon?: string;
}

export interface FolderEditModalProps {
  editingFolderModal: EditingFolderModalData | null;
  folderMap: Map<string, FolderNodeInfo>;
  onClose: () => void;
  onUpdateModal: (
    updater: (prev: EditingFolderModalData | null) => EditingFolderModalData | null
  ) => void;
  onSave: (
    originalPath: string,
    name: string,
    parentPath: string,
    color: string,
    icon: string,
    favorite: boolean
  ) => void;
}

export const FolderEditModal: React.FC<FolderEditModalProps> = ({
  editingFolderModal,
  folderMap,
  onClose,
  onUpdateModal,
  onSave,
}) => {
  if (!editingFolderModal) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[220] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto ipados-liquid-glass bg-[#fdfbf7]/38 backdrop-blur-2xl backdrop-saturate-200 rounded-2xl shadow-[0_24px_60px_-12px_rgba(0,0,0,0.22),inset_0_1px_1px_rgba(255,255,255,0.95)] border border-white/85 ring-1 ring-black/5 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 text-[#2c3e50]"
      >
        {/* Header with Live Preview + Favorite Star + Close */}
        <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#dfd8cb]">
          <div className="flex items-center gap-3 min-w-0">
            <div
              style={{
                backgroundColor: `${editingFolderModal.color}1f`,
                borderColor: `${editingFolderModal.color}55`,
              }}
              className="w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0"
            >
              {renderFolderCustomIcon(
                editingFolderModal.icon,
                editingFolderModal.color,
                'w-7 h-7'
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-extrabold text-[#234978] truncate">
                Επεξεργασία Φακέλου
              </h3>
              <p className="text-xs text-[#64748b] truncate">
                {editingFolderModal.parentPath
                  ? `Βιβλιοθήκη › ${editingFolderModal.parentPath.replace(
                      /\//g,
                      ' › '
                    )} › `
                  : 'Βιβλιοθήκη › '}
                <span className="font-bold text-[#234978]">
                  {editingFolderModal.name || 'Φάκελος'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                onUpdateModal((prev) =>
                  prev ? { ...prev, favorite: !prev.favorite } : null
                )
              }
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer focus:outline-none ${
                editingFolderModal.favorite
                  ? 'bg-amber-50 border-amber-300 text-amber-700'
                  : 'bg-[#efebe3] border-[#dfd8cb] text-[#64748b] hover:text-amber-600'
              }`}
              title="Προσθήκη / Αφαίρεση από τα Αγαπημένα"
            >
              <Star
                className={`w-4 h-4 ${
                  editingFolderModal.favorite
                    ? 'fill-amber-400 text-amber-500'
                    : ''
                }`}
              />
              <span>Αγαπημένο</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-[#a8a29e] hover:text-[#234978] hover:bg-[#efebe3] cursor-pointer transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 1. Folder Name Input */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#234978]">
            Όνομα Φακέλου
          </label>
          <input
            type="text"
            autoFocus
            value={editingFolderModal.name}
            onChange={(e) =>
              onUpdateModal((prev) =>
                prev ? { ...prev, name: e.target.value } : null
              )
            }
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSave(
                  editingFolderModal.originalPath,
                  editingFolderModal.name,
                  editingFolderModal.parentPath,
                  editingFolderModal.color,
                  editingFolderModal.icon,
                  editingFolderModal.favorite
                );
                onClose();
              } else if (e.key === 'Escape') {
                onClose();
              }
            }}
            placeholder="Πληκτρολόγησε όνομα φακέλου..."
            className="w-full px-3 py-2 rounded-xl bg-[#fdfbf7] border border-[#dfd8cb] text-sm font-bold text-[#234978] focus:outline-none focus:border-[#234978] focus:ring-1 focus:ring-[#234978]/30"
          />
        </div>

        {/* 2. Folder Color (12 Two-Tone Colors matching the Folder Card) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#234978]">
            Χρώμα Φακέλου
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
            {FOLDER_PRESET_COLORS.map((col) => {
              const isSelectedColor =
                editingFolderModal.color.toLowerCase() === col.hex.toLowerCase();
              return (
                <button
                  key={col.hex}
                  type="button"
                  onClick={() =>
                    onUpdateModal((prev) =>
                      prev ? { ...prev, color: col.hex } : null
                    )
                  }
                  style={{ borderColor: `${col.hex}88` }}
                  className={`relative w-full h-8 rounded-md bg-white border overflow-hidden flex flex-col transition cursor-pointer focus:outline-none ${
                    isSelectedColor
                      ? 'ring-2 ring-[#234978] scale-105 shadow-md'
                      : 'opacity-90 hover:opacity-100 hover:scale-105'
                  }`}
                  title={col.label}
                >
                  <span
                    style={{ backgroundColor: col.hex, opacity: 0.68 }}
                    className="w-full h-2 shrink-0 border-b border-black/5"
                  />
                  <span
                    style={{ backgroundColor: col.hex, opacity: 0.28 }}
                    className="w-full flex-1"
                  />
                  {isSelectedColor && (
                    <span
                      style={{ backgroundColor: col.hex }}
                      className="absolute inset-0 m-auto w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Folder Icon (Ready-Made Icons) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#234978]">
            Εικονίδιο Φακέλου
          </label>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {FOLDER_PRESET_ICONS.map((ic) => {
              const isSelectedIcon = editingFolderModal.icon === ic.id;
              return (
                <button
                  key={ic.id}
                  type="button"
                  onClick={() =>
                    onUpdateModal((prev) =>
                      prev ? { ...prev, icon: ic.id } : null
                    )
                  }
                  className={`h-10 rounded-xl border flex items-center justify-center transition cursor-pointer focus:outline-none ${
                    isSelectedIcon
                      ? 'bg-[#efebe3] border-[#234978] ring-2 ring-[#234978]/30 scale-105 shadow-xs'
                      : 'bg-[#fdfbf7] hover:bg-[#efebe3] border-[#dfd8cb]'
                  }`}
                  title={ic.label}
                >
                  {renderFolderCustomIcon(
                    ic.id,
                    editingFolderModal.color,
                    'w-5 h-5'
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Move Folder Dropdown (Collapsible Hierarchical Folder Tree) */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={() =>
              onUpdateModal((prev) =>
                prev ? { ...prev, showMoveTree: !prev.showMoveTree } : null
              )
            }
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-[#efebe3] hover:bg-[#e4ded2] border border-[#dfd8cb] text-xs font-bold text-[#234978] transition cursor-pointer focus:outline-none"
          >
            <span className="flex items-center gap-2 min-w-0 truncate">
              <span className="text-[#64748b] font-semibold">Μετακίνηση σε:</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#fdfbf7] border border-[#dfd8cb] text-[#234978] font-bold truncate">
                {editingFolderModal.parentPath ? (
                  <>
                    <Folder className="w-3.5 h-3.5 shrink-0 text-[#234978]" />
                    <span className="truncate">
                      {editingFolderModal.parentPath.replace(/\//g, ' › ')}
                    </span>
                  </>
                ) : (
                  <>
                    <Home className="w-3.5 h-3.5 shrink-0 text-[#234978]" />
                    <span>Βιβλιοθήκη (Αρχικός)</span>
                  </>
                )}
              </span>
            </span>
            <span className="text-[11px] font-semibold text-[#64748b] shrink-0">
              {editingFolderModal.showMoveTree ? 'Κλείσιμο ▴' : 'Δέντρο ▾'}
            </span>
          </button>

          {editingFolderModal.showMoveTree &&
            (() => {
              type TreeItem = {
                path: string;
                name: string;
                parentPath: string;
                depth: number;
                isLastSibling: boolean;
                color?: string;
                icon?: string;
              };
              const externalFolders = Array.from(folderMap.values()).filter(
                (f) =>
                  f.path !== editingFolderModal.originalPath &&
                  !f.path.startsWith(`${editingFolderModal.originalPath}/`)
              );
              const childrenByParent = new Map<string, typeof externalFolders>();
              for (const f of externalFolders) {
                const pKey = f.parentPath || '';
                const arr = childrenByParent.get(pKey) || [];
                arr.push(f);
                childrenByParent.set(pKey, arr);
              }
              for (const arr of childrenByParent.values()) {
                arr.sort((a, b) => a.name.localeCompare(b.name, 'el'));
              }
              const treeRows: TreeItem[] = [];
              const buildTreeDfs = (parentKey: string, depth: number) => {
                const kids = childrenByParent.get(parentKey) || [];
                kids.forEach((kid, idx) => {
                  treeRows.push({
                    path: kid.path,
                    name: kid.name,
                    parentPath: kid.parentPath,
                    depth,
                    isLastSibling: idx === kids.length - 1,
                    color: kid.color,
                    icon: kid.icon,
                  });
                  buildTreeDfs(kid.path, depth + 1);
                });
              };
              buildTreeDfs('', 0);

              const isRootSelected = editingFolderModal.parentPath === '';
              return (
                <div className="max-h-56 overflow-y-auto p-2 bg-[#efebe3]/40 rounded-2xl border border-[#dfd8cb] space-y-1">
                  {/* Root Node: Βιβλιοθήκη */}
                  <button
                    type="button"
                    onClick={() =>
                      onUpdateModal((prev) =>
                        prev ? { ...prev, parentPath: '' } : null
                      )
                    }
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer focus:outline-none ${
                      isRootSelected
                        ? 'bg-[#234978] text-white shadow-2xs'
                        : 'bg-[#fdfbf7] hover:bg-[#efebe3] text-[#2c3e50] border border-[#dfd8cb]/70'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Home
                        className={`w-4 h-4 ${
                          isRootSelected ? 'text-white' : 'text-[#234978]'
                        }`}
                      />
                      <span>Βιβλιοθήκη (Αρχικός Φάκελος)</span>
                    </span>
                    {isRootSelected ? (
                      <span className="text-[10px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded-md">
                        Επιλεγμένο
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-[#234978] opacity-85">
                        Μετακίνηση εδώ
                      </span>
                    )}
                  </button>

                  {/* External Hierarchical Folder Tree Nodes */}
                  {treeRows.map((node) => {
                    const isSelectedParent =
                      editingFolderModal.parentPath === node.path;
                    return (
                      <button
                        key={node.path}
                        type="button"
                        onClick={() =>
                          onUpdateModal((prev) =>
                            prev ? { ...prev, parentPath: node.path } : null
                          )
                        }
                        style={{ paddingLeft: `${(node.depth + 1) * 18 + 8}px` }}
                        className={`w-full flex items-center justify-between pr-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer focus:outline-none ${
                          isSelectedParent
                            ? 'bg-[#234978] text-white shadow-2xs'
                            : 'bg-[#fdfbf7] hover:bg-[#efebe3] text-[#2c3e50] border border-[#dfd8cb]/70'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 min-w-0 truncate">
                          <span
                            className={`font-mono text-[11px] select-none ${
                              isSelectedParent ? 'text-white/70' : 'text-[#a8a29e]'
                            }`}
                          >
                            {node.isLastSibling ? '└─' : '├─'}
                          </span>
                          <span className="shrink-0">
                            {renderFolderCustomIcon(
                              node.icon,
                              node.color || '#f59e0b',
                              'w-4 h-4'
                            )}
                          </span>
                          <span className="truncate font-bold">{node.name}</span>
                        </span>
                        {isSelectedParent ? (
                          <span className="text-[10px] font-semibold bg-white/20 text-white px-1.5 py-0.5 rounded-md shrink-0 ml-2">
                            Επιλεγμένο
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-[#234978] opacity-85 shrink-0 ml-2">
                            Μετακίνηση εδώ
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })()}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#efebe3] hover:bg-[#e4ded2] text-[#2c3e50] border border-[#dfd8cb] text-xs font-bold transition cursor-pointer"
          >
            Ακύρωση
          </button>
          <button
            type="button"
            onClick={() => {
              onSave(
                editingFolderModal.originalPath,
                editingFolderModal.name,
                editingFolderModal.parentPath,
                editingFolderModal.color,
                editingFolderModal.icon,
                editingFolderModal.favorite
              );
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-[#234978] hover:bg-[#1c3c63] text-white text-xs font-bold shadow-xs transition cursor-pointer"
          >
            Αποθήκευση
          </button>
        </div>
      </div>
    </div>
  );
};
