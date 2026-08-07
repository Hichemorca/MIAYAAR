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
  code: string;
  /** Currency name */
  name: string;
  /** Currency symbol */
  symbol: string;
  /** Number of decimal places */
  decimalPlaces: number;
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
  amount: number;
  /** Currency information */
  currency: Currency;
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
  fromCurrency: string;
  /** Target currency code */
  toCurrency: string;
  /** Exchange rate value */
  rate: number;
  /** Timestamp of the rate */
  asOf: string;
  /** Rate source or provider */
  source?: string;
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
  amount: number;
  /** Currency code */
  currencyCode: string;
  /** Optional description of the value */
  description?: string;
  /** Optional reference period */
  period?: string;
}