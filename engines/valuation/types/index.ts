/**
 * Valuation Engine Types Module
 *
 * Defines internal types for the Valuation Engine.
 *
 * @module engines/valuation/types
 */

import { Property, MarketSnapshot, Valuation } from '../../../core/types';
import { ValuationData } from './valuation-data.contracts';
import { ValuationConfiguration } from './valuation-configuration.contracts';

export * from './valuation-data.contracts';
export * from './valuation-configuration.contracts';

/**
 * ValuationRequest
 *
 * Input contract for the Valuation Engine.
 *
 * Represents one valuation execution. Scenario (Lower/Baseline/Upper) handling
 * and methodology parameters are supplied through the platform's established
 * architecture (see ADR-009). The exact mechanism remains an unresolved
 * implementation decision per IMP-005 §20 and is not defined here.
 */
export interface ValuationRequest {
  /** The property to be valued */
  readonly property: Property;
  /** Market context for the valuation */
  readonly market: MarketSnapshot;
  /** Approach-specific input data (optional) */
  readonly data?: ValuationData;
  readonly config: ValuationConfiguration;

  readonly requestId?: string;
}

/**
 * ValuationOutcome
 *
 * Output contract for the Valuation Engine's IEngine<TRequest, TData>
 * implementation.
 *
 * This is NOT a valuation result, and it is not a duplicate of, or
 * alternative to, `Valuation` / `ValuationResult` from core/types. It exists
 * only to make "no valuation is available" a real, type-safe value rather
 * than a fabricated one, since `Result<TData>.data` is mandatory and cannot
 * be null or omitted.
 *
 * When `available` is `true`, `valuation` is the canonical, frozen
 * `Valuation` domain entity from core/types -- the single source of truth
 * for a completed valuation result. This engine never defines its own
 * valuation result shape.
 */
export type ValuationOutcome =
  | {
      /** No valuation was produced by this execution. */
      readonly available: false;
      /** Machine-readable reason code for why no valuation is available. */
      readonly reasonCode: string;
      /** Human-readable explanation of why no valuation is available. */
      readonly reason: string;
    }
  | {
      /** A valuation was produced by this execution. */
      readonly available: true;
      /** The canonical valuation result, as defined in core/types. */
      readonly valuation: Valuation;
    };
