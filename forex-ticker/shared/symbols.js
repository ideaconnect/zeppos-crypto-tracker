/**
 * Canonical symbol definitions shared across all three runtimes
 * (watch page, phone-side service, settings companion).
 *
 * If you add or remove a trading pair, update ALL_SYMBOLS first —
 * DEFAULT_SYMBOLS and SYMBOL_NAMES should stay in sync.
 */

// Complete list of supported trading pairs
export const ALL_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'SOLUSDT',
  'TRXUSDT',
  'XRPUSDT',
]

// Pairs enabled by default on first launch (all enabled)
export const DEFAULT_SYMBOLS = [...ALL_SYMBOLS]

// Human-readable labels shown next to each toggle in settings
export const SYMBOL_NAMES = {
  BTCUSDT: 'Bitcoin / USDT',
  ETHUSDT: 'Ethereum / USDT',
  BNBUSDT: 'Binance Coin / USDT',
  ADAUSDT: 'Cardano / USDT',
  DOGEUSDT: 'Dogecoin / USDT',
  SOLUSDT: 'Solana / USDT',
  TRXUSDT: 'TRON / USDT',
  XRPUSDT: 'XRP / USDT',
}
