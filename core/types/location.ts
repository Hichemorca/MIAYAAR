/**
 * Core Types Module - Location
 * 
 * Defines the Location entity and location-related types.
 * 
 * Represents geospatial context, including coordinates,
 * administrative boundaries, proximity metrics, and neighborhood characteristics.
 * 
 * @module core/types/location
 */

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

import { Optional, Nullable } from './primitives';

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
  latitude: number;
  /** Longitude in decimal degrees */
  longitude: number;
}

/**
 * Country
 * 
 * Represents a country or nation.
 */
export interface Country {
  /** Country code (ISO 3166-1 alpha-2) */
  code: string;
  /** Country name */
  name: string;
}

/**
 * Region
 * 
 * Represents a first-level administrative division.
 * Examples: State, Province, Emirate, Governorate.
 */
export interface Region {
  /** Region code */
  code: string;
  /** Region name */
  name: string;
  /** Optional reference to parent country */
  country?: Country;
}

/**
 * City
 * 
 * Represents a city or municipality.
 */
export interface City {
  /** City code or identifier */
  code: string;
  /** City name */
  name: string;
  /** Optional reference to parent region */
  region?: Region;
}

/**
 * District
 * 
 * Represents a district or sub-city area.
 * Examples: Dubai Marina, Jumeirah, Downtown.
 */
export interface District {
  /** District code or identifier */
  code: string;
  /** District name */
  name: string;
  /** Optional reference to parent city */
  city?: City;
}

/**
 * Neighborhood
 * 
 * Represents a neighborhood or community.
 * Examples: The Palm Jumeirah, Dubai Hills Estate, Al Barsha.
 */
export interface Neighborhood {
  /** Neighborhood code or identifier */
  code: string;
  /** Neighborhood name */
  name: string;
  /** Optional reference to parent district */
  district?: District;
}

/**
 * PostalCode
 * 
 * Represents a postal or ZIP code.
 */
export interface PostalCode {
  /** Postal code value */
  code: string;
  /** Optional reference to parent location */
  region?: Region;
  city?: City;
}

/**
 * Address
 * 
 * Represents a complete or partial postal address.
 */
export interface Address {
  /** Building name or number */
  building?: string;
  /** Street name or number */
  street?: string;
  /** Unit number or apartment identifier */
  unit?: string;
  /** Postal code */
  postalCode?: PostalCode;
  /** Optional reference to location hierarchy */
  neighborhood?: Neighborhood;
  district?: District;
  city?: City;
  region?: Region;
  country?: Country;
}

/**
 * AdministrativeArea
 * 
 * Represents a generic administrative area boundary.
 * Used when a specific type is not required.
 */
export interface AdministrativeArea {
  /** Area identifier */
  id: string;
  /** Area name */
  name: string;
  /** Level of administrative division */
  level: number;
  /** Optional reference to parent area */
  parentId?: string;
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
  id: string;
  /** Geographic coordinates (optional) */
  coordinates?: Coordinates;
  /** Complete address */
  address: Address;
  /** Administrative hierarchy */
  neighborhood?: Neighborhood;
  district?: District;
  city?: City;
  region?: Region;
  country?: Country;
  /** Postal code */
  postalCode?: PostalCode;
  /** Additional location metadata */
  metadata?: Record<string, unknown>;
}