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
  readonly asOf: Timestamp;
  /** Period or range description */
  readonly periodDescription?: string;
  /** Data freshness indicator */
  readonly daysSinceUpdate: number;
}

/**
 * TransactionVolume
 * 
 * Represents transaction volume metrics.
 */
export interface TransactionVolume {
  /** Number of transactions */
  readonly count: number;
  /** Total transaction value */
  readonly totalValue: Money;
  /** Average transaction value */
  readonly averageValue: Money;
  /** Median transaction value */
  readonly medianValue: Money;
  /** Transaction type */
  readonly transactionType: TransactionType;
}

/**
 * PriceIndicators
 * 
 * Represents price-related market indicators.
 */
export interface PriceIndicators {
  /** Average price per unit */
  readonly averagePrice: Money;
  /** Median price per unit */
  readonly medianPrice: Money;
  /** Minimum price */
  readonly minPrice: Money;
  /** Maximum price */
  readonly maxPrice: Money;
  /** Price per square meter */
  readonly pricePerSqm: Money;
  /** Price trend over period (percentage) */
  readonly priceTrendPercent: number;
}

/**
 * SupplyIndicators
 * 
 * Represents supply-side market indicators.
 */
export interface SupplyIndicators {
  /** Number of active listings */
  readonly activeListings: number;
  /** Number of new listings (period) */
  readonly newListings: number;
  /** Average days on market */
  readonly daysOnMarket: number;
  /** List price to sale price ratio */
  readonly listToSaleRatio: number;
  /** Inventory turnover rate */
  readonly turnoverRate: number;
}

/**
 * DemandIndicators
 * 
 * Represents demand-side market indicators.
 */
export interface DemandIndicators {
  /** Number of active buyers */
  readonly activeBuyers: number;
  /** Number of new inquiries (period) */
  readonly newInquiries: number;
  /** Viewing to offer conversion rate */
  readonly conversionRate: number;
  /** Demand score (0-100) */
  readonly demandScore: number;
}

/**
 * LiquidityIndicators
 * 
 * Represents market liquidity indicators.
 */
export interface LiquidityIndicators {
  /** Transaction velocity */
  readonly velocity: number;
  /** Time to sell (average days) */
  readonly timeToSell: number;
  /** Absorption rate (months of inventory) */
  readonly absorptionRate: number;
  /** Available properties for sale */
  readonly availableForSale: number;
}

/**
 * MarketSegment
 * 
 * Represents a market segment for classification.
 */
export interface MarketSegment {
  /** Segment identifier */
  readonly id: ID;
  /** Segment name */
  readonly name: Name;
  /** Property type */
  readonly propertyType: PropertyType;
  /** Location or region */
  readonly locationId?: string;
  /** Price range */
  readonly priceRange?: {
    readonly min: Money;
    readonly max: Money;
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
  readonly id: ID;
  /** Property reference */
  readonly propertyId: ID;
  /** Transaction date */
  readonly transactionDate: Timestamp;
  /** Transaction price */
  readonly transactionPrice: Money;
  /** Data source */
  readonly source: DataSource;
  /** Similarity score (0-1) */
  readonly similarityScore: number;
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
  readonly id: ID;
  /** Market segment */
  readonly segment: MarketSegment;
  /** Temporal context */
  readonly timestamp: MarketTimestamp;
  /** Price indicators */
  readonly prices: PriceIndicators;
  /** Supply indicators */
  readonly supply: SupplyIndicators;
  /** Demand indicators */
  readonly demand: DemandIndicators;
  /** Liquidity indicators */
  readonly liquidity: LiquidityIndicators;
  /** Transaction volume */
  readonly volume: TransactionVolume;
  /** Comparable references */
  readonly comparables: readonly ComparableReference[];
  /** Data source */
  readonly source: DataSource;
  /** Additional indicators */
  readonly extensions?: Readonly<Record<string, unknown>>;
}