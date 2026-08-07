/**
 * Core Types Module - Metadata
 * 
 * Defines shared technical metadata for the platform.
 * 
 * Metadata describes the lifecycle and origin of an object.
 * It is separate from business data and answers technical questions
 * about creation, updates, versioning, and provenance.
 * 
 * @module core/types/metadata
 */

import { ID, Timestamp, Version, Email, URL } from './primitives';

/**
 * SourceReference
 * 
 * Represents the origin of data or an object.
 */
export interface SourceReference {
  /** Unique source identifier */
  readonly id: ID;
  /** Source name or label */
  readonly name: string;
  /** Source type or classification */
  readonly type: string;
  /** Source version if applicable */
  readonly version?: Version;
  /** External reference URL if available */
  readonly url?: URL;
  /** Additional source metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/**
 * Timestamps
 * 
 * Represents creation and modification timestamps.
 */
export interface Timestamps {
  /** Creation timestamp */
  readonly createdAt: Timestamp;
  /** Last modification timestamp */
  readonly updatedAt: Timestamp;
}

/**
 * AuditInfo
 * 
 * Represents audit trail information.
 */
export interface AuditInfo {
  /** User or system that created the object */
  readonly createdBy: ID;
  /** User or system that last modified the object */
  readonly updatedBy: ID;
  /** IP address or client identifier (optional) */
  readonly clientId?: string;
  /** Session identifier (optional) */
  readonly sessionId?: string;
}

/**
 * VersionInfo
 * 
 * Represents version tracking information.
 */
export interface VersionInfo {
  /** Semantic version or revision number */
  readonly version: Version;
  /** Version creation timestamp */
  readonly versionedAt: Timestamp;
  /** User or system that created this version */
  readonly versionedBy: ID;
  /** Version change description */
  readonly changeDescription?: string;
  /** Optional parent version reference */
  readonly parentVersion?: Version;
}

/**
 * ProvenanceInfo
 * 
 * Represents data provenance information.
 */
export interface ProvenanceInfo {
  /** Original data source */
  readonly source: SourceReference;
  /** When data was acquired */
  readonly acquiredAt: Timestamp;
  /** Who or what acquired the data */
  readonly acquiredBy: ID;
  /** Original data identifier if different from internal ID */
  readonly externalId?: string;
  /** Processing pipeline version */
  readonly pipelineVersion?: Version;
  /** Data quality score (optional) */
  readonly qualityScore?: number;
}

/**
 * StatusInfo
 * 
 * Represents the technical status of an object.
 * 
 * Used for technical lifecycle state, not business status.
 */
export interface StatusInfo {
  /** Current status code */
  readonly status: string;
  /** Status category classification */
  readonly category: string;
  /** Timestamp of last status change */
  readonly statusChangedAt: Timestamp;
  /** Reason for current status */
  readonly statusReason?: string;
}

/**
 * Metadata
 * 
 * Canonical metadata model for the platform.
 * 
 * Composes all metadata components into a single object.
 * Represents the complete technical metadata for any object.
 */
export interface Metadata {
  /** Unique metadata identifier */
  readonly id: ID;
  /** Technical timestamps */
  readonly timestamps: Timestamps;
  /** Audit information */
  readonly audit: AuditInfo;
  /** Version information */
  readonly version: VersionInfo;
  /** Provenance information */
  readonly provenance: ProvenanceInfo;
  /** Technical status */
  readonly status: StatusInfo;
  /** Additional technical metadata */
  readonly extensions?: Readonly<Record<string, unknown>>;
}