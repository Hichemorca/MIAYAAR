/**
 * Core Types Module - Valuation
 * 
 * Defines the Valuation entity and valuation-related types.
 * 
 * Represents the valuation output, including value estimates,
 * methodology applied, adjustment factors, and supporting calculations.
 * 
 * @module core/types/valuation
 */

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

/**
 * ValuationIdentifier
 * 
 * Represents the unique identification of a valuation.
 */
export interface ValuationIdentifier {
  /** Unique valuation identifier */
  id: ID;
  /** Reference to the property being valued */
  propertyId: ID;
  /** Reference to the market snapshot used */
  marketSnapshotId: ID;
  /** Valuation version */
  version: Version;
}

/**
 * ValuationApproachResult
 * 
 * Represents the result from a single valuation approach.
 */
export interface ValuationApproachResult {
  /** Approach name */
  approach: string;
  /** Approach weight applied */
  weight: number;
  /** Value estimated by this approach */
  value: Money;
  /** Approach confidence score (0-1) */
  confidence: number;
  /** Approach-specific metadata */
  metadata?: Record<string, unknown>;
}

/**
 * ValuationResult
 * 
 * Represents the complete valuation result.
 */
export interface ValuationResult {
  /** Final valuation value */
  value: Money;
  /** Lower bound of valuation range */
  lowerBound?: Money;
  /** Upper bound of valuation range */
  upperBound?: Money;
  /** Valuation range width as percentage of value */
  rangeWidthPercent?: number;
  /** Individual approach results */
  approachResults: ValuationApproachResult[];
  /** Methodology name or identifier */
  methodology: string;
  /** Methodology version */
  methodologyVersion: Version;
}

/**
 * ValuationMetadata
 * 
 * Represents valuation metadata.
 */
export interface ValuationMetadata {
  /** Valuation type */
  type: string;
  /** Property type */
  propertyType: PropertyType;
  /** Valuation date */
  valuationDate: Timestamp;
  /** Valuation purpose */
  purpose?: string;
  /** Currency used */
  currency: string;
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
  id: ValuationIdentifier;
  /** Valuation metadata */
  metadata: ValuationMetadata;
  /** Valuation result */
  result: ValuationResult;
  /** Valuation creation timestamp */
  createdAt: Timestamp;
  /** Additional notes or comments */
  notes?: string;
}