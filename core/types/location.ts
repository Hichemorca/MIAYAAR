/**
 * Core Types Module - Location
 * 
 * Defines the canonical location model for the platform.
 * 
 * Represents where a property exists. Contains only business data
 * representation with no GIS, mapping, or spatial processing.
 * 
 * Coordinates are optional to support datasets with administrative
 * addresses only.
 * 
 * @module core/types/location
 */

import { ID, Name, Description, Code, Nullable, Optional } from './primitives';

/**
 * Coordinates
 * 
 * Represents geographic coordinates as business data.
 * 
 * Contains latitude and longitude values only.
 * No geometry, no spatial operations, no GIS concepts.
 */
export interface Coordinates {
  /** Latitude in decimal degrees */
  readonly latitude: number;
  /** Longitude in decimal degrees */
  readonly longitude: number;
}

/**
 * Country
 * 
 * Represents a country or nation.
 */
export interface Country {
  /** Country code (ISO 3166-1 alpha-2) */
  readonly code: Code;
  /** Country name */
  readonly name: Name;
}

/**
 * Region
 * 
 * Represents a first-level administrative division.
 * Examples: State, Province, Emirate, Governorate.
 */
export interface Region {
  /** Region code */
  readonly code: Code;
  /** Region name */
  readonly name: Name;
  /** Optional reference to parent country */
  readonly country?: Country;
}

/**
 * City
 * 
 * Represents a city or municipality.
 */
export interface City {
  /** City code or identifier */
  readonly code: Code;
  /** City name */
  readonly name: Name;
  /** Optional reference to parent region */
  readonly region?: Region;
}

/**
 * District
 * 
 * Represents a district or sub-city area.
 * Examples: Dubai Marina, Jumeirah, Downtown.
 */
export interface District {
  /** District code or identifier */
  readonly code: Code;
  /** District name */
  readonly name: Name;
  /** Optional reference to parent city */
  readonly city?: City;
}

/**
 * Neighborhood
 * 
 * Represents a neighborhood or community.
 * Examples: The Palm Jumeirah, Dubai Hills Estate, Al Barsha.
 */
export interface Neighborhood {
  /** Neighborhood code or identifier */
  readonly code: Code;
  /** Neighborhood name */
  readonly name: Name;
  /** Optional reference to parent district */
  readonly district?: District;
}

/**
 * PostalCode
 * 
 * Represents a postal or ZIP code.
 */
export interface PostalCode {
  /** Postal code value */
  readonly code: Code;
  /** Optional reference to parent location */
  readonly region?: Region;
  readonly city?: City;
}

/**
 * Address
 * 
 * Represents a complete or partial postal address.
 */
export interface Address {
  /** Building name or number */
  readonly building?: string;
  /** Street name or number */
  readonly street?: string;
  /** Unit number or apartment identifier */
  readonly unit?: string;
  /** Postal code */
  readonly postalCode?: PostalCode;
  /** Optional reference to location hierarchy */
  readonly neighborhood?: Neighborhood;
  readonly district?: District;
  readonly city?: City;
  readonly region?: Region;
  readonly country?: Country;
}

/**
 * AdministrativeArea
 * 
 * Represents a generic administrative area boundary.
 * Used when a specific type is not required.
 */
export interface AdministrativeArea {
  /** Area identifier */
  readonly id: ID;
  /** Area name */
  readonly name: Name;
  /** Level of administrative division */
  readonly level: number;
  /** Optional reference to parent area */
  readonly parentId?: ID;
}

/**
 * Location
 * 
 * Canonical location model for the platform.
 * 
 * Contains administrative hierarchy and optional coordinates.
 * Coordinates are optional because many datasets provide only
 * administrative address data.
 */
export interface Location {
  /** Unique location identifier */
  readonly id: ID;
  /** Geographic coordinates (optional) */
  readonly coordinates?: Coordinates;
  /** Complete address */
  readonly address: Address;
  /** Administrative hierarchy */
  readonly neighborhood?: Neighborhood;
  readonly district?: District;
  readonly city?: City;
  readonly region?: Region;
  readonly country?: Country;
  /** Postal code */
  readonly postalCode?: PostalCode;
  /** Additional location metadata */
  readonly metadata?: Readonly<Record<string, unknown>>;
}