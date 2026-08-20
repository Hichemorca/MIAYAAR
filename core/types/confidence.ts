/**
 * Core Types Module - Confidence
 * 
 * Defines explainable confidence types for the platform.
 * 
 * Confidence represents an independent assessment of the quality and
 * reliability of one completed valuation.
 * 
 * Confidence evaluates the valuation result.
 * It does NOT evaluate the property or the market.
 * 
 * @module core/types/confidence
 */

import { ID, Timestamp, Name, Description, Nullable } from './primitives';
import { Metadata } from './metadata';
import { ConfidenceLevel } from './enums';

/**
 * ConfidenceFactor
 * 
 * Represents a measurable confidence factor.
 * 
 * Each factor evaluates one specific aspect of valuation quality.
 * Factors are the primary source of truth.
 */
export interface ConfidenceFactor {
  /** Factor identifier */
  readonly id: ID;
  /** Factor name */
  readonly name: Name;
  /** Factor description */
  readonly description: Description;
  /** Factor score (0-1) */
  readonly score: number;
  /** Score contribution weight (0-1) */
  readonly weight: number;
  /** Justification for the score */
  readonly justification: string;
  /** Supporting evidence references */
  readonly evidenceReferences?: readonly string[];
  /** Data quality status */
  readonly dataQuality: string;
}

/**
 * ConfidenceAssessment
 * 
 * Represents the assessment of confidence factors for a valuation.
 */
export interface ConfidenceAssessment {
  /** Assessment identifier */
  readonly id: ID;
  /** Reference to the valuation being assessed */
  readonly valuationId: ID;
  /** Confidence factors evaluated */
  readonly factors: readonly ConfidenceFactor[];
  /** Assessment timestamp */
  readonly assessedAt: Timestamp;
  /** Assessment version */
  readonly version: string;
}

/**
 * OverallConfidence
 * 
 * Represents the overall confidence in a valuation result.
 * 
 * The overall score is derived from confidence factors.
 * Factors are the truth. The overall score is a derived summary.
 */
export interface OverallConfidence {
  /** Overall confidence level */
  readonly level: ConfidenceLevel;
  /** Overall confidence score (0-1) */
  readonly score: number;
  /** Confidence interpretation */
  readonly interpretation: string;
  /** Lower bound of confidence range */
  readonly lowerBound?: number;
  /** Upper bound of confidence range */
  readonly upperBound?: number;
}

/**
 * Confidence
 * 
 * Canonical Confidence domain entity.
 * 
 * Represents an independent assessment of valuation quality and reliability.
 * 
 * Confidence must be explainable. Factors are the primary source of truth.
 * The overall score is derived from those factors.
 */
export interface Confidence {
  /** Unique confidence identifier */
  readonly id: ID;
  /** Reference to the valuation */
  readonly valuationId: ID;
  /** Confidence assessment */
  readonly assessment: ConfidenceAssessment;
  /** Overall confidence summary */
  readonly overall: OverallConfidence;
  /**
   * Canonical technical metadata, including the entity audit lifecycle.
   * `metadata.timestamps.createdAt` is the only technical creation timestamp
   * for this entity; `assessment.assessedAt` remains a separate business-domain
   * assessment fact.
   */
  readonly metadata: Metadata;
  /** Additional notes */
  readonly notes?: string;
}
