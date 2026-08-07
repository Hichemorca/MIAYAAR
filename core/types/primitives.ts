/**
 * Core Types Module - Primitives
 * 
 * Defines fundamental primitive types shared across the entire platform.
 * 
 * These types are completely domain-independent and serve as building blocks
 * for all domain models. They contain no real estate, valuation, financial,
 * or geographic concepts.
 * 
 * @module core/types/primitives
 */

/**
 * Unique identifier type
 * 
 * Represents a stable, opaque identifier for entities.
 * Implementations may use UUID, ULID, or similar schemes.
 */
export type ID = string;

/**
 * Timestamp type
 * 
 * Represents a point in time.
 * Implementations may use ISO 8601 strings or Unix timestamps.
 */
export type Timestamp = string;

/**
 * Date type
 * 
 * Represents a calendar date without time component.
 * Implementations may use ISO 8601 date strings (YYYY-MM-DD).
 */
export type DateString = string;

/**
 * Code type
 * 
 * Represents a short, human-readable code or mnemonic.
 * Used for enumerations, reference codes, and standardized identifiers.
 */
export type Code = string;

/**
 * Name type
 * 
 * Represents a human-readable label or name.
 * Used for entity names, display labels, and descriptive identifiers.
 */
export type Name = string;

/**
 * Description type
 * 
 * Represents a human-readable description or narrative.
 * Used for textual explanations, notes, and supplementary information.
 */
export type Description = string;

/**
 * Status type
 * 
 * Represents the state or phase of an entity or process.
 * Used for workflow states, lifecycle phases, and processing status.
 */
export type Status = string;

/**
 * Version type
 * 
 * Represents a semantic version or revision identifier.
 * Used for entity versions, document revisions, and configuration versions.
 */
export type Version = string;

/**
 * Email type
 * 
 * Represents an email address.
 * Contains no validation logic at the type level.
 */
export type Email = string;

/**
 * Phone type
 * 
 * Represents a phone number.
 * Contains no validation logic at the type level.
 */
export type Phone = string;

/**
 * URL type
 * 
 * Represents a uniform resource locator.
 * Contains no validation logic at the type level.
 */
export type URL = string;

/**
 * UUID type
 * 
 * Represents a Universally Unique Identifier.
 * Used for identifiers with global uniqueness requirements.
 */
export type UUID = string;

/**
 * ISO Date type
 * 
 * Represents a date in ISO 8601 format (YYYY-MM-DD).
 * Used for calendar dates without time component.
 */
export type ISODate = string;

/**
 * ISO DateTime type
 * 
 * Represents a date-time in ISO 8601 format.
 * Used for timestamps with time component and timezone information.
 */
export type ISODateTime = string;

/**
 * Nullable type
 * 
 * Utility type for explicitly nullable values.
 * Improves readability over direct union with null.
 */
export type Nullable<T> = T | null;

/**
 * Optional type
 * 
 * Utility type for explicitly optional values.
 * Improves readability over direct union with undefined.
 */
export type Optional<T> = T | undefined;

/**
 * Result type placeholder
 * 
 * Reserved for future Result Object implementation.
 * This type is defined but not implemented in primitives.
 */
export type Result = unknown;