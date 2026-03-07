import { BaseSideService } from '@zeppos/zml/base-side'

const PRICES_URL = 'https://crypto-tracker.idct.tech/prices.json'

// Default symbols if none configured
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

async function fetchPrices(ctx, res) {
  try {
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
          this.call({
            method: 'SETTINGS_CHANGED',
            params: { symbols }
          })
        }
      }
    },

    onRequest(req, res) {
      console.log('side service onRequest: ' + req.method)

      if (req.method === 'GET_PRICES') {
        fetchPrices(req, res)
      } else if (req.method === 'GET_SETTINGS') {
        const symbolsRaw = settings.settingsStorage.getItem('selectedSymbols')
        if (!symbolsRaw) {
          // No user preference saved — let the watch use its own stored defaults
          res(null, { result: { symbols: null } })
          return
        }
        let symbols = null
        try {
          symbols = JSON.parse(symbolsRaw)
        } catch (e) {
          console.log('Failed to parse selectedSymbols setting')
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
