/**
 * BestNotes Storage & Database Domain
 * Domain 5: Master Index Facade
 * 
 * Provides unified access to:
 * - Storage keys and session state helpers
 * - Cleaners, payload optimizers, and serialization
 * - High-capacity IndexedDB engine
 * - Local-First multi-tier cache synchronization
 * - Cloud Firestore multi-chunk atomic sync
 */

export * from './storageKeys';
export * from './storageCleaners';
export * from './indexedDb';
export * from './localAndIdbSync';
export * from './firestoreSync';
