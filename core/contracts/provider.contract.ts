/**
 * Core Contracts Module - Provider Contract
 *
 * Defines the canonical contract for all data providers in the platform.
 *
 * Data providers abstract external data sources and present a uniform
 * retrieval interface to engines. This contract is technology-neutral
 * and allows for seamless swapping of data sources.
 *
 * @module core/contracts/provider.contract
 */

/**
 * IDataProvider
 *
 * Generic interface for all data providers.
 *
 * @template TParams - The type of parameters required for the data fetch.
 * @template TData - The type of data returned by the provider.
 *
 * Providers are expected to handle their own authentication, rate limiting,
 * and error handling. They must transform external data into the platform's
 * canonical types.
 */
export interface IDataProvider<TParams, TData> {
  /**
   * Fetches data from the external source.
   *
   * @param params - The parameters for the data fetch.
   * @returns A promise that resolves to the fetched data.
   */
  fetch(params: TParams): Promise<TData>;

  /**
   * Validates credentials against the external source.
   *
   * @param credentials - The credentials to validate.
   * @returns A promise that resolves to true if credentials are valid.
   */
  validate(credentials: unknown): Promise<boolean>;

  /**
   * Transforms raw data from the external source to canonical domain types.
   *
   * @param raw - The raw data from the external source.
   * @returns The transformed canonical domain data.
   */
  transform(raw: unknown): TData;
}