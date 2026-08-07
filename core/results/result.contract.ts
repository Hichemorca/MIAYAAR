/**
 * Core Results Module - Result Contract
 *
 * Defines the standardized Result Object that every engine must return.
 *
 * This contract implements ADR-007 and provides the mandatory output structure
 * for all engines, ensuring consistent error handling, status reporting,
 * and data encapsulation across the platform.
 *
 * @module core/results/result.contract
 */

import { ID, Version, Timestamp } from '../types';

/**
 * ResultStatus
 *
 * Represents the processing status of an engine.
 *
 * @see ADR-007 - Standardized Result Object Contract
 */
export enum ResultStatus {
  /** Engine completed normally with full output */
  SUCCESS = 'success',
  /** Engine completed with reduced output */
  PARTIAL = 'partial',
  /** Engine failed to complete processing */
  ERROR = 'error',
  /** Engine processing is in progress (async workflows) */
  PENDING = 'pending',
}

/**
 * Warning
 *
 * Represents a non-critical issue encountered during processing.
 *
 * Warnings do not prevent the engine from producing a result but may
 * indicate degraded quality or incomplete data.
 */
export interface Warning {
  /** Machine-readable warning code for categorization */
  readonly code: string;
  /** Human-readable warning message */
  readonly message: string;
}

/**
 * ErrorInfo
 *
 * Represents a critical failure preventing complete processing.
 *
 * Errors indicate that the engine could not produce a full result.
 * The result may be partial or absent depending on the error severity.
 */
export interface ErrorInfo {
  /** Machine-readable error code for categorization */
  readonly code: string;
  /** Human-readable error message */
  readonly message: string;
  /** Additional diagnostic or context information */
  readonly details?: unknown;
}

/**
 * ResultMetadata
 *
 * Represents processing metadata for the Result Object.
 *
 * Provides traceability, versioning, and timing information
 * for every engine output.
 */
export interface ResultMetadata {
  /** Correlation ID for the request */
  readonly requestId: ID;
  /** Engine identifier or name */
  readonly engine: string;
  /** Engine version */
  readonly version: Version;
  /** Processing timestamp */
  readonly timestamp: Timestamp;
}

/**
 * Result
 *
 * Standardized Result Object contract for all engines.
 *
 * Every engine MUST return this structure. The contract is generic
 * to support diverse engine outputs while maintaining a consistent
 * envelope for status, warnings, errors, and metadata.
 *
 * @template TData - The type of the engine's domain-specific output
 */
export interface Result<TData> {
  /** Processing status */
  readonly status: ResultStatus;
  /** Engine-specific output payload */
  readonly data: TData;
  /** Non-critical issues encountered during processing */
  readonly warnings: readonly Warning[];
  /** Critical failures preventing complete processing */
  readonly errors: readonly ErrorInfo[];
  /** Processing metadata */
  readonly metadata: ResultMetadata;
}