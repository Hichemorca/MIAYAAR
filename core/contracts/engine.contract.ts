/**
 * Core Contracts Module - Engine Contract
 *
 * Defines the canonical contract for all decision engines in the platform.
 *
 * Every engine must implement this contract to be integrated into the
 * Orchestrator workflow. The contract remains generic to support diverse
 * engine implementations without imposing business-specific constraints.
 *
 * @module core/contracts/engine.contract
 */

import { Result } from '../results';

/**
 * IEngine
 *
 * Generic interface for all decision engines.
 *
 * @template TRequest - The type of the request accepted by the engine.
 * @template TData - The type of the data returned in the Result object.
 *
 * Engines are expected to be stateless and process requests deterministically.
 * The execute method encapsulates the entire engine operation and must return
 * a standardized Result object containing the engine's output.
 */
export interface IEngine<TRequest, TData> {
  /**
   * Executes the engine's core logic.
   *
   * @param request - The input data for the engine.
   * @returns A promise that resolves to a standardized Result object
   *          containing the engine's output.
   */
  execute(request: TRequest): Promise<Result<TData>>;
}