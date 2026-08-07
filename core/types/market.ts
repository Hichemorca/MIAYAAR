/**
 * Core Types Module - Market
 * 
 * Defines market snapshot types for the platform.
 * 
 * Market represents a Market Snapshot captured at a specific point in time.
 * It provides market context for valuation but does not perform valuation itself.
 * 
 * @module core/types/market
 */

import { ID, Timestamp, Name, Description, Nullable } from './primitives';
import { Money } from './financial';
import { PropertyType, DataSource, TransactionType } from './enums';

/**
 * MarketTimestamp
 * 
 * Represents the temporal context of a market snapshot.
 */
export interface MarketTimestamp {
  /** Snapshot timestamp */
  asOf: Timestamp;
  /** Period or range description */
  periodDescription?: string;
  /** Data freshness indicator */
  daysSinceUpdate: number;
}

/**
 * TransactionVolume
 * 
 * Represents transaction volume metrics.
 */
export interface TransactionVolume {
  /** Number of transactions */
  count: number;
  /** Total transaction value */
  totalValue: Money;
  /** Average transaction value */
  averageValue: Money;
  /** Median transaction value */
  medianValue: Money;
  /** Transaction type */
  transactionType: TransactionType;
}

/**
 * PriceIndicators
 * 
 * Represents price-related market indicators.
 */
export interface PriceIndicators {
  /** Average price per unit */
  averagePrice: Money;
  /** Median price per unit */
  medianPrice: Money;
  /** Minimum price */
  minPrice: Money;
  /** Maximum price */
  maxPrice: Money;
  /** Price per square meter */
  pricePerSqm: Money;
  /** Price trend over period (percentage) */
  priceTrendPercent: number;
}

/**
 * SupplyIndicators
 * 
 * Represents supply-side market indicators.
 */
export interface SupplyIndicators {
  /** Number of active listings */
  activeListings: number;
  /** Number of new listings (period) */
  newListings: number;
  /** Average days on market */
  daysOnMarket: number;
  /** List price to sale price ratio */
  listToSaleRatio: number;
  /** Inventory turnover rate */
  turnoverRate: number;
}

/**
 * DemandIndicators
 * 
 * Represents demand-side market indicators.
 */
export interface DemandIndicators {
  /** Number of active buyers */
  activeBuyers: number;
  /** Number of new inquiries (period) */
  newInquiries: number;
  /** Viewing to offer conversion rate */
  conversionRate: number;
  /** Demand score (0-100) */
  demandScore: number;
}

/**
 * LiquidityIndicators
 * 
 * Represents market liquidity indicators.
 */
export interface LiquidityIndicators {
  /** Transaction velocity */
  velocity: number;
  /** Time to sell (average days) */
  timeToSell: number;
  /** Absorption rate (months of inventory) */
  absorptionRate: number;
  /** Available properties for sale */
  availableForSale: number;
}

/**
 * MarketSegment
 * 
 * Represents a market segment for classification.
 */
export interface MarketSegment {
  /** Segment identifier */
  id: ID;
  /** Segment name */
  name: Name;
  /** Property type */
  propertyType: PropertyType;
  /** Location or region */
  locationId?: string;
  /** Price range */
  priceRange?: {
    min: Money;
    max: Money;
  };
}

/**
 * ComparableReference
 * 
 * Represents a reference to a comparable property.
 * 
 * This is a reference only. The full comparable data resides in the
 * Data Engine or Valuation Engine.
 */
export interface ComparableReference {
  /** Comparable identifier */
  id: ID;
  /** Property reference */
  propertyId: ID;
  /** Transaction date */
  transactionDate: Timestamp;
  /** Transaction price */
  transactionPrice: Money;
  /** Data source */
  source: DataSource;
  /** Similarity score (0-1) */
  similarityScore: number;
}

/**
 * MarketSnapshot
 * 
 * Canonical market snapshot for the platform.
 * 
 * Represents market conditions at a specific point in time.
 * Provides context for valuation but does not perform valuation itself.
 */
export interface MarketSnapshot {
  /** Unique snapshot identifier */
  id: ID;
  /** Market segment */
  segment: MarketSegment;
  /** Temporal context */
  timestamp: MarketTimestamp;
  /** Price indicators */
  prices: PriceIndicators;
  /** Supply indicators */
  supply: SupplyIndicators;
  /** Demand indicators */
  demand: DemandIndicators;
  /** Liquidity indicators */
  liquidity: LiquidityIndicators;
  /** Transaction volume */
  volume: TransactionVolume;
  /** Comparable references */
  comparables: ComparableReference[];
  /** Data source */
  source: DataSource;
  /** Additional indicators */
  extensions?: Record<string, unknown>;
}