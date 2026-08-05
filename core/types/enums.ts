/**
 * Core Types Module - Enums
 * 
 * Defines shared enumerations used across multiple domain entities.
 * 
 * Contains enums that are not specific to a single entity but are
 * referenced by multiple components of the platform.
 * 
 * @module core/types/enums
 */

/**
 * Core Types Module - Enums
 * 
 * Defines shared enumerations used across the entire platform.
 * 
 * These enums are domain-independent and reusable by multiple modules.
 * They contain no business logic, helper functions, or utility methods.
 * 
 * @module core/types/enums
 */

/**
 * PropertyType
 * 
 * Represents the classification of a real estate property.
 * Used across valuation, market analysis, and reporting modules.
 */
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  VILLA = 'VILLA',
  TOWNHOUSE = 'TOWNHOUSE',
  OFFICE = 'OFFICE',
  RETAIL = 'RETAIL',
  LAND = 'LAND',
  WAREHOUSE = 'WAREHOUSE',
}

/**
 * TransactionType
 * 
 * Represents the type of real estate transaction.
 * Used for distinguishing between sales and rental transactions.
 */
export enum TransactionType {
  SALE = 'SALE',
  RENT = 'RENT',
}

/**
 * PropertyCondition
 * 
 * Represents the physical condition of a property.
 * Used for adjustment factors in valuation calculations.
 */
export enum PropertyCondition {
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  NEEDS_RENOVATION = 'NEEDS_RENOVATION',
}

/**
 * ViewType
 * 
 * Represents the type of view from a property.
 * Used for adjustment factors in valuation calculations.
 */
export enum ViewType {
  SEA = 'SEA',
  PARTIAL_SEA = 'PARTIAL_SEA',
  CITY = 'CITY',
  GARDEN = 'GARDEN',
  PARK = 'PARK',
  STREET = 'STREET',
  INTERNAL = 'INTERNAL',
  UNKNOWN = 'UNKNOWN',
}

/**
 * FloorLevel
 * 
 * Represents the floor level category of a property.
 * Used for adjustment factors in valuation calculations.
 */
export enum FloorLevel {
  PENTHOUSE = 'PENTHOUSE',
  VERY_HIGH = 'VERY_HIGH',
  HIGH = 'HIGH',
  MID = 'MID',
  LOW = 'LOW',
  GROUND = 'GROUND',
}

/**
 * UsageType
 * 
 * Represents the usage classification of a property.
 * Used for zoning, regulatory compliance, and market segmentation.
 */
export enum UsageType {
  RESIDENTIAL = 'RESIDENTIAL',
  COMMERCIAL = 'COMMERCIAL',
  MIXED = 'MIXED',
  INDUSTRIAL = 'INDUSTRIAL',
  AGRICULTURAL = 'AGRICULTURAL',
}

/**
 * DataSource
 * 
 * Represents the origin of data ingested by the platform.
 * Used for data provenance, quality assessment, and audit trails.
 */
export enum DataSource {
  DLD = 'DLD',
  BAYUT = 'BAYUT',
  PROPERTY_FINDER = 'PROPERTY_FINDER',
  OSM = 'OSM',
  CSV = 'CSV',
  CONSULTANCY = 'CONSULTANCY',
}

/**
 * ConfidenceLevel
 * 
 * Represents the confidence level of valuation outputs.
 * Used for uncertainty assessment and decision support.
 */
export enum ConfidenceLevel {
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
  BASIC = 'BASIC',
}