/**
 * Universal Stopwatch Bridge: Decoupled pub-sub bridge between the digital stopwatch
 * widget and any active simulation module.
 */

import { StopwatchAction } from '../types';

export type StopwatchListener = (action: StopwatchAction) => void;

class UniversalStopwatchBridgeService {
  private listeners: Set<StopwatchListener> = new Set();

  /**
   * Register a callback listener from an active simulation module
   */
  public subscribe(listener: StopwatchListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Broadcast a stopwatch event to all active simulation listeners
   */
  public emit(action: StopwatchAction): void {
    this.listeners.forEach((listener) => {
      try {
        listener(action);
      } catch (err) {
        console.error('[UniversalStopwatchBridge] Listener error:', err);
      }
    });
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const UniversalStopwatchBridge = new UniversalStopwatchBridgeService();
