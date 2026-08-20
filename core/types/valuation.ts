/**
 * Core Types Module - Valuation
 * 
 * Defines immutable valuation result types for the platform.
 * 
 * Valuation represents the official result of one completed valuation.
 * It is an immutable domain entity that represents the outcome,
 * never the valuation process.
 * 
 * @module core/types/valuation
 */

import { ID, Timestamp, Version } from './primitives';
import { Money } from './financial';
import { PropertyType } from './enums';
import { Metadata } from './metadata';

/**
 * ValuationIdentifier
 * 
 * Represents the unique identification of a valuation.
 */
export interface ValuationIdentifier {
  /** Unique valuation identifier */
  readonly id: ID;
  /** Reference to the property being valued */
  readonly propertyId: ID;
  /** Reference to the market snapshot used */
  readonly marketSnapshotId: ID;
  /** Valuation version */
  readonly version: Version;
}

/**
 * ValuationApproachResult
 * 
 * Represents the result from a single valuation approach.
 */
export interface ValuationApproachResult {
  /** Approach name */
  readonly approach: string;
  /** Approach weight applied */
  readonly weight: number;
  /** Value estimated by this approach */
  readonly value: Money;
  /** Approach confidence score (0-1) */
  readonly confidence: number;
  /** Approach-specific metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * ValuationResult
 * 
 * Represents the complete valuation result.
 */
export interface ValuationResult {
  /** Final valuation value */
  readonly value: Money;
  /** Lower bound of valuation range */
  readonly lowerBound?: Money;
  /** Upper bound of valuation range */
  readonly upperBound?: Money;
  /** Valuation range width as percentage of value */
  readonly rangeWidthPercent?: number;
  /** Individual approach results */
  readonly approachResults: readonly ValuationApproachResult[];
  /** Methodology name or identifier */
  readonly methodology: string;
  /** Methodology version */
  readonly methodologyVersion: Version;
}

/**
 * ValuationMetadata
 * 
 * Represents valuation business metadata.
 */
export interface ValuationMetadata {
  /** Valuation type */
  readonly type: string;
  /** Property type */
  readonly propertyType: PropertyType;
  /** Valuation date */
  readonly valuationDate: Timestamp;
  /** Valuation purpose */
  readonly purpose?: string;
  /** Currency used */
  readonly currency: string;
}

/**
 * Valuation
 * 
 * Canonical Valuation domain entity.
 * 
 * Represents the official result of one completed valuation.
 * 
 * Valuation is immutable. A new valuation must always create a new entity.
 * Existing valuations are never modified.
 */
export interface Valuation {
  /** Valuation identifier */
  readonly id: ValuationIdentifier;
  /** Business metadata */
  readonly valuationMetadata: ValuationMetadata;
  /**
   * Canonical technical metadata, including the entity audit lifecycle.
   * `metadata.timestamps.createdAt` is the only technical creation timestamp
   * for this entity; `valuationMetadata.valuationDate` remains a separate
   * business-domain fact.
   */
  readonly metadata: Metadata;
  /** Valuation result */
  readonly result: ValuationResult;
  /** Additional notes or comments */
  readonly notes?: string;
}
