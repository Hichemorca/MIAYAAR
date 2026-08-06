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
  id: ID;
  /** Factor name */
  name: Name;
  /** Factor description */
  description: Description;
  /** Factor score (0-1) */
  score: number;
  /** Score contribution weight (0-1) */
  weight: number;
  /** Justification for the score */
  justification: string;
  /** Supporting evidence references */
  evidenceReferences?: string[];
  /** Data quality status */
  dataQuality: string;
}

/**
 * ConfidenceAssessment
 * 
 * Represents the assessment of confidence factors for a valuation.
 */
export interface ConfidenceAssessment {
  /** Assessment identifier */
  id: ID;
  /** Reference to the valuation being assessed */
  valuationId: ID;
  /** Confidence factors evaluated */
  factors: ConfidenceFactor[];
  /** Assessment timestamp */
  assessedAt: Timestamp;
  /** Assessment version */
  version: string;
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
  level: string;
  /** Overall confidence score (0-1) */
  score: number;
  /** Confidence interpretation */
  interpretation: string;
  /** Lower bound of confidence range */
  lowerBound?: number;
  /** Upper bound of confidence range */
  upperBound?: number;
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
  id: ID;
  /** Reference to the valuation */
  valuationId: ID;
  /** Confidence assessment */
  assessment: ConfidenceAssessment;
  /** Overall confidence summary */
  overall: OverallConfidence;
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Additional notes */
  notes?: string;
}/**
 * Core Types Module - Confidence
 * 
 * Defines the Confidence entity and confidence-related types.
 * 
 * Represents certainty assessment, including confidence scores,
 * uncertainty bounds, data quality indicators, and risk flags.
 * 
 * @module core/types/confidence
 */

// Export placeholders for confidence-related types
// Future implementation will include: Confidence, ConfidenceScore, UncertaintyBound, etc.