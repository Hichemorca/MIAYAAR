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
  id: ID;
  /** Source name or label */
  name: string;
  /** Source type or classification */
  type: string;
  /** Source version if applicable */
  version?: Version;
  /** External reference URL if available */
  url?: URL;
  /** Additional source metadata */
  metadata?: Record<string, unknown>;
}

/**
 * Timestamps
 * 
 * Represents creation and modification timestamps.
 */
export interface Timestamps {
  /** Creation timestamp */
  createdAt: Timestamp;
  /** Last modification timestamp */
  updatedAt: Timestamp;
}

/**
 * AuditInfo
 * 
 * Represents audit trail information.
 */
export interface AuditInfo {
  /** User or system that created the object */
  createdBy: ID;
  /** User or system that last modified the object */
  updatedBy: ID;
  /** IP address or client identifier (optional) */
  clientId?: string;
  /** Session identifier (optional) */
  sessionId?: string;
}

/**
 * VersionInfo
 * 
 * Represents version tracking information.
 */
export interface VersionInfo {
  /** Semantic version or revision number */
  version: Version;
  /** Version creation timestamp */
  versionedAt: Timestamp;
  /** User or system that created this version */
  versionedBy: ID;
  /** Version change description */
  changeDescription?: string;
  /** Optional parent version reference */
  parentVersion?: Version;
}

/**
 * ProvenanceInfo
 * 
 * Represents data provenance information.
 */
export interface ProvenanceInfo {
  /** Original data source */
  source: SourceReference;
  /** When data was acquired */
  acquiredAt: Timestamp;
  /** Who or what acquired the data */
  acquiredBy: ID;
  /** Original data identifier if different from internal ID */
  externalId?: string;
  /** Processing pipeline version */
  pipelineVersion?: Version;
  /** Data quality score (optional) */
  qualityScore?: number;
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
  status: string;
  /** Status category classification */
  category: string;
  /** Timestamp of last status change */
  statusChangedAt: Timestamp;
  /** Reason for current status */
  statusReason?: string;
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
  id: ID;
  /** Technical timestamps */
  timestamps: Timestamps;
  /** Audit information */
  audit: AuditInfo;
  /** Version information */
  version: VersionInfo;
  /** Provenance information */
  provenance: ProvenanceInfo;
  /** Technical status */
  status: StatusInfo;
  /** Additional technical metadata */
  extensions?: Record<string, unknown>;
}