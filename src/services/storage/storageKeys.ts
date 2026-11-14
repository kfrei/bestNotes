/**
 * BestNotes Storage Keys & Constants
 * Domain 5: Storage & Database Keys
 */

export const STORAGE_KEY = 'bestnotes_notebooks_v2';
export const ACTIVE_NOTEBOOK_STORAGE_KEY = 'bestnotes_active_nb_cache_v2';
export const CUSTOM_FOLDERS_STORAGE_KEY = 'bestnotes_custom_folders_v2';
export const SHAPE_LIBRARY_STORAGE_KEY = 'bestnotes_shape_library_v2';
export const UI_SESSION_STORAGE_KEY = 'bestnotes_ui_session_v2';
export const AUTH_FLAG_STORAGE_KEY = 'bestnotes_auth_logged_in';
export const AUTH_UID_STORAGE_KEY = 'bestnotes_auth_uid';
export const COLOR_SLOTS_STORAGE_KEY = 'bestnotes_color_slots_v1';
export const USER_EDITED_SESSION_STORAGE_KEY = 'bestnotes_user_edited_session_ids_v1';
export const LIBRARY_CACHE_STORAGE_KEY = 'bestnotes_lib_shelf_cache_v2';

export const IDB_NAME = 'bestnotes_idb_v1';
export const IDB_STORE = 'notebooks_by_uid';

export const FIRESTORE_SINGLE_DOC_LIMIT = 750000;
export const FIRESTORE_CHUNK_SIZE = 450000;

export function loadUserEditedSessionIds(): Set<string> {
  try {
    const raw = sessionStorage.getItem(USER_EDITED_SESSION_STORAGE_KEY);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch {
    // ignore
  }
  return new Set<string>();
}

export function saveUserEditedSessionIds(ids: Set<string>): void {
  try {
    sessionStorage.setItem(
      USER_EDITED_SESSION_STORAGE_KEY,
      JSON.stringify(Array.from(ids))
    );
  } catch {
    // ignore
  }
}
