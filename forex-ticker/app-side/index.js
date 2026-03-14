/*
 * Phone-side Zepp OS service.
 *
 * This runtime is responsible for two things:
 * 1. Fetching remote market data.
 * 2. Bridging companion settings storage to the watch page.
 *
 * Watch-side code must not perform network requests directly, so the page
 * communicates with this service through `request` / `call` messages.
 */
import { BaseSideService } from '@zeppos/zml/base-side'

const PRICES_URL = 'https://crypto-tracker.idct.tech/prices.json'

// Companion defaults exist mainly for first-run settings hydration.
const DEFAULT_SYMBOLS = [
  'BTCUSDT',
  'ETHUSDT',
  'BNBUSDT',
  'ADAUSDT',
  'DOGEUSDT',
  'SOLUSDT',
  'TRXUSDT',
  'XRPUSDT'
];

/**
 * Fetch the latest aggregated market payload and return it through the
 * Zepp side-service callback contract.
 */
async function fetchPrices(ctx, res) {
  try {
    // App-side fetch is available in this runtime even though watch-side code
    // cannot use browser or Node APIs.
    const response = await fetch({
      url: PRICES_URL,
      method: 'GET'
    })

    const body = typeof response.body === 'string'
      ? JSON.parse(response.body)
      : response.body

    res(null, { result: body })
  } catch (error) {
    console.log('fetchPrices error: ' + error)
    res(null, { result: null, error: 'FETCH_FAILED' })
  }
}

AppSideService(
  BaseSideService({
    onInit() {
      console.log('side service onInit')
    },

    onSettingsChange({ key, newValue, oldValue }) {
      console.log('settings changed: ' + key + ' = ' + newValue)
      if (key === 'selectedSymbols' && newValue) {
        let symbols = null
        try {
          symbols = JSON.parse(newValue)
        } catch (e) {
          console.log('Failed to parse selectedSymbols from settings change')
        }
        if (symbols) {
          // Push symbol changes to the running watch page so the user does not
          // need to wait for the next launch to see the new order.
          this.call({
            method: 'SETTINGS_CHANGED',
            params: { symbols }
          })
        }
      }
    },

    onRequest(req, res) {
      console.log('side service onRequest: ' + req.method)

      // Request protocol consumed by page/index.js.
      if (req.method === 'GET_PRICES') {
        fetchPrices(req, res)
      } else if (req.method === 'GET_SETTINGS') {
        const symbolsRaw = settings.settingsStorage.getItem('selectedSymbols')
        if (!symbolsRaw) {
          // No companion preference is saved yet. The watch page keeps its own
          // local fallback list so first paint can still succeed.
          res(null, { result: { symbols: null } })
          return
        }
        let symbols = null
        try {
          symbols = JSON.parse(symbolsRaw)
        } catch (e) {
          console.log('Failed to parse selectedSymbols setting')
        }
        if (!symbols || symbols.length === 0) {
          symbols = DEFAULT_SYMBOLS
        }
        res(null, { result: { symbols } })
      }
    },

    onRun() {},

    onDestroy() {
      console.log('side service onDestroy')
    }
  })
)
