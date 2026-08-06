/**
 * Core Types Module - Property
 * 
 * Defines the Property entity and related property-specific types.
 * 
 * Represents a real estate asset with its physical characteristics,
 * location reference, and ownership attributes.
 * 
 * @module core/types/property
 */

/**
 * Core Types Module - Property
 * 
 * Defines the Property domain entity.
 * 
 * Property represents the Digital Twin of a real estate asset.
 * It models the real property itself with only intrinsic characteristics.
 * 
 * Property does NOT contain market data, financial values, valuation results,
 * confidence scores, analytics, predictions, or derived values.
 * 
 * @module core/types/property
 */

import { ID, Name, Description, Code, Status, Nullable } from './primitives';
import { Location } from './location';
import { Metadata } from './metadata';
import { PropertyType, PropertyCondition, UsageType, FloorLevel } from './enums';

/**
 * PropertyIdentity
 * 
 * Represents the unique identification of a property.
 */
export interface PropertyIdentity {
  /** Unique property identifier */
  id: ID;
  /** External reference identifier */
  externalId?: string;
  /** Parcel or plot number */
  parcelNumber?: string;
  /** Title deed number */
  titleDeedNumber?: string;
  /** Property code or reference */
  propertyCode?: Code;
}

/**
 * PropertyClassification
 * 
 * Represents the classification and categorization of a property.
 */
export interface PropertyClassification {
  /** Property type */
  type: PropertyType;
  /** Usage type */
  usage: UsageType;
  /** Property status */
  status: Status;
  /** Sub-type or specific category */
  subType?: string;
}

/**
 * PhysicalCharacteristics
 * 
 * Represents the physical characteristics of a property.
 */
export interface PhysicalCharacteristics {
  /** Total area in square meters */
  totalArea: number;
  /** Built-up area in square meters */
  builtUpArea?: number;
  /** Land area in square meters */
  landArea?: number;
  /** Number of bedrooms */
  bedrooms?: number;
  /** Number of bathrooms */
  bathrooms?: number;
  /** Number of parking spaces */
  parkingSpaces?: number;
  /** Floor level */
  floorLevel?: FloorLevel;
  /** Year built */
  yearBuilt?: number;
  /** Number of floors in building */
  totalFloors?: number;
}

/**
 * StructuralCharacteristics
 * 
 * Represents the structural and quality characteristics of a property.
 */
export interface StructuralCharacteristics {
  /** Property condition */
  condition: PropertyCondition;
  /** Finish quality */
  finishQuality?: string;
  /** Furnished status */
  furnished?: string;
  /** View type */
  viewType?: string;
  /** Street position */
  streetPosition?: string;
}

/**
 * LegalCharacteristics
 * 
 * Represents the legal and regulatory characteristics of a property.
 */
export interface LegalCharacteristics {
  /** Ownership type */
  ownershipType?: string;
  /** Freehold or leasehold */
  tenureType?: string;
  /** Zoning classification */
  zoning?: string;
  /** Legal restrictions */
  restrictions?: string[];
  /** Easements or encumbrances */
  encumbrances?: string[];
}

/**
 * PropertyName
 * 
 * Represents the naming and description of a property.
 */
export interface PropertyName {
  /** Property name */
  name: Name;
  /** Property description */
  description: Description;
  /** Alternative names or aliases */
  aliases?: Name[];
}

/**
 * Property
 * 
 * Canonical Property domain entity.
 * 
 * Represents a real estate asset with its intrinsic characteristics.
 * 
 * Property does NOT contain:
 * - Market data
 * - Financial values
 * - Valuation results
 * - Confidence scores
 * - Analytics
 * - Predictions
 * - Derived values
 * 
 * Those belong to other modules.
 */
export interface Property {
  /** Property identity */
  identity: PropertyIdentity;
  /** Property name and description */
  name: PropertyName;
  /** Property classification */
  classification: PropertyClassification;
  /** Location information */
  location: Location;
  /** Physical characteristics */
  physical: PhysicalCharacteristics;
  /** Structural characteristics */
  structural: StructuralCharacteristics;
  /** Legal characteristics */
  legal: LegalCharacteristics;
  /** Technical metadata */
  metadata: Metadata;
}