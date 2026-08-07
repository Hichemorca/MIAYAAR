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
import { 
  PropertyType, 
  PropertyCondition, 
  BuildingCondition,
  UsageType, 
  FloorLevel,
  ViewType,
  FurnishedStatus,
  FinishQuality,
  StreetPosition
} from './enums';

/**
 * PropertyIdentity
 * 
 * Represents the unique identification of a property.
 */
export interface PropertyIdentity {
  /** Unique property identifier */
  readonly id: ID;
  /** External reference identifier */
  readonly externalId?: string;
  /** Parcel or plot number */
  readonly parcelNumber?: string;
  /** Title deed number */
  readonly titleDeedNumber?: string;
  /** Property code or reference */
  readonly propertyCode?: Code;
}

/**
 * PropertyClassification
 * 
 * Represents the classification and categorization of a property.
 */
export interface PropertyClassification {
  /** Property type */
  readonly type: PropertyType;
  /** Usage type */
  readonly usage: UsageType;
  /** Property status */
  readonly status: Status;
  /** Sub-type or specific category */
  readonly subType?: string;
}

/**
 * PhysicalCharacteristics
 * 
 * Represents the physical characteristics of a property.
 */
export interface PhysicalCharacteristics {
  /** Total area in square meters */
  readonly totalArea: number;
  /** Built-up area in square meters */
  readonly builtUpArea?: number;
  /** Land area in square meters */
  readonly landArea?: number;
  /** Number of bedrooms */
  readonly bedrooms?: number;
  /** Number of bathrooms */
  readonly bathrooms?: number;
  /** Number of parking spaces */
  readonly parkingSpaces?: number;
  /** Floor level */
  readonly floorLevel?: FloorLevel;
  /** Year built */
  readonly yearBuilt?: number;
  /** Number of floors in building */
  readonly totalFloors?: number;
}

/**
 * StructuralCharacteristics
 * 
 * Represents the structural and quality characteristics of a property.
 * 
 * @see ADR-006 - Separation of Property Condition and Building Condition
 */
export interface StructuralCharacteristics {
  /** Physical condition of the property itself */
  readonly propertyCondition: PropertyCondition;
  /** Physical condition of the building containing the property */
  readonly buildingCondition: BuildingCondition;
  /** Finish quality */
  readonly finishQuality?: FinishQuality;
  /** Furnished status */
  readonly furnished?: FurnishedStatus;
  /** View type */
  readonly viewType?: ViewType;
  /** Street position */
  readonly streetPosition?: StreetPosition;
}

/**
 * LegalCharacteristics
 * 
 * Represents the legal and regulatory characteristics of a property.
 */
export interface LegalCharacteristics {
  /** Ownership type */
  readonly ownershipType?: string;
  /** Freehold or leasehold */
  readonly tenureType?: string;
  /** Zoning classification */
  readonly zoning?: string;
  /** Legal restrictions */
  readonly restrictions?: readonly string[];
  /** Easements or encumbrances */
  readonly encumbrances?: readonly string[];
}

/**
 * PropertyName
 * 
 * Represents the naming and description of a property.
 */
export interface PropertyName {
  /** Property name */
  readonly name: Name;
  /** Property description */
  readonly description: Description;
  /** Alternative names or aliases */
  readonly aliases?: readonly Name[];
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
  readonly identity: PropertyIdentity;
  /** Property name and description */
  readonly name: PropertyName;
  /** Property classification */
  readonly classification: PropertyClassification;
  /** Location information */
  readonly location: Location;
  /** Physical characteristics */
  readonly physical: PhysicalCharacteristics;
  /** Structural characteristics */
  readonly structural: StructuralCharacteristics;
  /** Legal characteristics */
  readonly legal: LegalCharacteristics;
  /** Technical metadata */
  readonly metadata: Metadata;
}