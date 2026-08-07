/**
 * Core Types Module - Financial
 * 
 * Defines shared financial types for the platform.
 * 
 * Represents financial data only. Contains no calculations,
 * accounting logic, or business rules.
 * 
 * @module core/types/financial
 */

/**
 * Currency
 * 
 * Represents a currency.
 * 
 * Currency is represented by its ISO 4217 code.
 */
export interface Currency {
  /** ISO 4217 currency code */
  readonly code: string;
  /** Currency name */
  readonly name: string;
  /** Currency symbol */
  readonly symbol: string;
  /** Number of decimal places */
  readonly decimalPlaces: number;
}

/**
 * Money
 * 
 * Represents a monetary value with currency.
 * 
 * Money must always contain both amount and currency.
 * Never represent financial values as raw numbers.
 */
export interface Money {
  /** Monetary amount */
  readonly amount: number;
  /** Currency information */
  readonly currency: Currency;
}

/**
 * ExchangeRate
 * 
 * Represents a currency exchange rate.
 * 
 * Stores the rate between two currencies at a specific point in time.
 */
export interface ExchangeRate {
  /** Source currency code */
  readonly fromCurrency: string;
  /** Target currency code */
  readonly toCurrency: string;
  /** Exchange rate value */
  readonly rate: number;
  /** Timestamp of the rate */
  readonly asOf: string;
  /** Rate source or provider */
  readonly source?: string;
}

/**
 * FinancialValue
 * 
 * Represents a generic financial value.
 * 
 * Used when a more specific financial type is not required.
 */
export interface FinancialValue {
  /** Monetary amount */
  readonly amount: number;
  /** Currency code */
  readonly currencyCode: string;
  /** Optional description of the value */
  readonly description?: string;
  /** Optional reference period */
  readonly period?: string;
}