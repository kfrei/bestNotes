/**
 * Simulation Registry: Central registry for registering and querying
 * simulation modules across all STEM domains.
 */

import { ISimulationModule, SimulationCategory } from '../types';

class SimulationRegistryService {
  private modules: Map<string, ISimulationModule<any, any>> = new Map();

  /**
   * Registers a new simulation module
   */
  public register(module: ISimulationModule<any, any>): void {
    if (this.modules.has(module.id)) {
      console.warn(`[SimulationRegistry] Overwriting module with id: ${module.id}`);
    }
    this.modules.set(module.id, module);
  }

  /**
   * Retrieves a simulation module by its unique ID
   */
  public get(id: string): ISimulationModule<any, any> | undefined {
    return this.modules.get(id);
  }

  /**
   * Retrieves all modules belonging to a specific category
   */
  public getByCategory(category: SimulationCategory): ISimulationModule<any, any>[] {
    return Array.from(this.modules.values()).filter((m) => m.category === category);
  }

  /**
   * Retrieves all registered modules
   */
  public getAll(): ISimulationModule<any, any>[] {
    return Array.from(this.modules.values());
  }

  public clear(): void {
    this.modules.clear();
  }
}

export const SimulationRegistry = new SimulationRegistryService();
