/*
 * Watch-side page runtime.
 *
 * This file owns the on-device UI lifecycle: building swiper pages, applying
 * the current symbol list, requesting market data from the app-side service,
 * and refreshing widgets when new data arrives.
 *
 * Important runtime constraint: the swiper page count can only be configured
 * when the UI is built, so symbol changes later in the session reuse or clear
 * existing pages instead of rebuilding the scroll mode from scratch.
 */
import { createWidget, deleteWidget, widget, align, text_style, prop } from '@zos/ui'
import { setScrollMode, SCROLL_MODE_SWIPER } from '@zos/page'
import { px } from '@zos/utils'
import { log as Logger } from '@zos/utils'
import { localStorage } from '@zos/storage'
import { BasePage } from '@zeppos/zml/base-page'
import {
  DEVICE_WIDTH,
  DEVICE_HEIGHT,
  SYMBOL_STYLE,
  PRICE_STYLE,
  CHANGE_LABEL_STYLE,
  UPDATE_STYLE
} from 'zosLoader:./index.[pf].layout.js'

const logger = Logger.getLogger('crypto-ticker')

// Ordered to match the visible rows rendered on each page.
const TIMEFRAMES = ['1min', '5min', '1h', '12h', '7d']
const TIMEFRAME_LABELS = {
  '1min': '1m',
  '5min': '5m',
  '1h': '1h',
  '12h': '12h',
  '7d': '7d'
}

const COLOR_GREEN = 0x00E676
const COLOR_RED = 0xFF5252
const COLOR_NEUTRAL = 0xAAAAAA
const COLOR_UPDATE_FLASH = 0xFFFFFF
const COLOR_UPDATE_NORMAL = 0x888888
const REFRESH_INTERVAL = 10000 // 10 seconds
const FLASH_DURATION = 1200 // ms to show flash color
const DEFAULT_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'DOGEUSDT', 'SOLUSDT', 'TRXUSDT', 'XRPUSDT']

/**
 * Read the last symbol list saved on the watch.
 *
 * This must stay synchronous because setupUI() needs the symbol count before
 * configuring swiper mode during build().
 */
function loadSavedSymbols() {
  try {
    const saved = localStorage.getItem('selectedSymbols')
    if (saved) {
      const parsed = JSON.parse(saved)
      if (parsed && parsed.length > 0) return parsed
    }
  } catch (e) {}
  return DEFAULT_SYMBOLS
}

let activeSymbols = loadSavedSymbols()

// Widget references per page
let pageWidgets = []
let emptyStateWidget = null
let refreshTimer = null
let pricesData = null
let uiBuilt = false

/**
 * Format a stringified price into a compact, watch-friendly display value.
 */
function formatPrice(priceStr) {
  const num = parseFloat(priceStr)
  if (isNaN(num)) return priceStr

  let formatted
  if (num >= 1000) {
    formatted = num.toFixed(2)
    // Add thousand separators manually (no toLocaleString in Zepp OS)
    const parts = formatted.split('.')
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    formatted = parts.join('.')
  } else if (num >= 1) {
    formatted = num.toFixed(4)
  } else {
    // Small coins — show more decimals
    formatted = num.toFixed(6)
  }
  return formatted
}

/**
 * Format a percentage string with a stable sign and fixed precision.
 */
function formatPercent(percentStr) {
  const num = parseFloat(percentStr)
  if (isNaN(num)) return percentStr
  const sign = num >= 0 ? '+' : ''
  return sign + num.toFixed(2) + '%'
}

/**
 * Convert an ISO timestamp into a compact local time string for the footer.
 */
function formatUpdateTime(isoStr) {
  if (!isoStr) return ''
  try {
    // Parse ISO string and format simply
    const d = new Date(isoStr)
    const pad = (n) => (n < 10 ? '0' : '') + n
    return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()) +
      ' ' + pad(d.getDate()) + '/' + pad(d.getMonth() + 1) + '/' + d.getFullYear()
  } catch (e) {
    return isoStr
  }
}

function getChangeColor(percentStr) {
  const num = parseFloat(percentStr)
  if (num > 0) return COLOR_GREEN
  if (num < 0) return COLOR_RED
  return COLOR_NEUTRAL
}

/**
 * Build one swiper page worth of widget references.
 *
 * When VIEW_CONTAINER is unavailable on a device/runtime combination, the
 * function falls back to absolute widget placement via createPageWidgetsFallback.
 */
function createPageWidgets(pageIndex) {
  const widgets = {}

  logger.log('creating VIEW_CONTAINER for page ' + pageIndex)
  const vc = createWidget(widget.VIEW_CONTAINER, {
    x: px(0),
    y: px(0),
    w: px(DEVICE_WIDTH),
    h: px(DEVICE_HEIGHT),
    scroll_enable: 0,
    page: pageIndex
  })

  if (!vc || !vc.createWidget) {
    logger.log('VIEW_CONTAINER failed for page ' + pageIndex + ', falling back to y-offset')
    // Fallback: place widgets at y-offset directly
    return createPageWidgetsFallback(pageIndex)
  }

  // Keep a reference so destroyUI() can clean up the container.
  widgets.container = vc

  // 1) Symbol name at top
  widgets.symbol = vc.createWidget(widget.TEXT, {
    x: SYMBOL_STYLE.x,
    y: SYMBOL_STYLE.y,
    w: SYMBOL_STYLE.w,
    h: SYMBOL_STYLE.h,
    color: SYMBOL_STYLE.color,
    text_size: SYMBOL_STYLE.text_size,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
    text: '---'
  })

  // 2) Current price
  widgets.price = vc.createWidget(widget.TEXT, {
    x: PRICE_STYLE.x,
    y: PRICE_STYLE.y,
    w: PRICE_STYLE.w,
    h: PRICE_STYLE.h,
    color: PRICE_STYLE.color,
    text_size: PRICE_STYLE.text_size,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
    text: '...'
  })

  // 3) Timeframe rows (label + change %)
  widgets.changes = []
  TIMEFRAMES.forEach((tf, i) => {
    const rowY = CHANGE_LABEL_STYLE.y_start + (i * CHANGE_LABEL_STYLE.row_height)

    const label = vc.createWidget(widget.TEXT, {
      x: CHANGE_LABEL_STYLE.label_x,
      y: rowY,
      w: CHANGE_LABEL_STYLE.label_w,
      h: CHANGE_LABEL_STYLE.row_height,
      color: CHANGE_LABEL_STYLE.label_color,
      text_size: CHANGE_LABEL_STYLE.text_size,
      align_h: align.RIGHT,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
      text: TIMEFRAME_LABELS[tf] + ':'
    })

    const value = vc.createWidget(widget.TEXT, {
      x: CHANGE_LABEL_STYLE.value_x,
      y: rowY,
      w: CHANGE_LABEL_STYLE.value_w,
      h: CHANGE_LABEL_STYLE.row_height,
      color: COLOR_NEUTRAL,
      text_size: CHANGE_LABEL_STYLE.text_size,
      align_h: align.LEFT,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
      text: '---'
    })

    widgets.changes.push({ label, value, timeframe: tf })
  })

  // 4) Last update timestamp
  widgets.updateTime = vc.createWidget(widget.TEXT, {
    x: UPDATE_STYLE.x,
    y: UPDATE_STYLE.y,
    w: UPDATE_STYLE.w,
    h: UPDATE_STYLE.h,
    color: UPDATE_STYLE.color,
    text_size: UPDATE_STYLE.text_size,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
    text: ''
  })

  return widgets
}

// Fallback path for runtimes where VIEW_CONTAINER cannot host page-local widgets.
function createPageWidgetsFallback(pageIndex) {
  const yOffset = pageIndex * DEVICE_HEIGHT
  const widgets = {}

  widgets.symbol = createWidget(widget.TEXT, {
    x: SYMBOL_STYLE.x,
    y: SYMBOL_STYLE.y + yOffset,
    w: SYMBOL_STYLE.w,
    h: SYMBOL_STYLE.h,
    color: SYMBOL_STYLE.color,
    text_size: SYMBOL_STYLE.text_size,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
    text: '---'
  })

  widgets.price = createWidget(widget.TEXT, {
    x: PRICE_STYLE.x,
    y: PRICE_STYLE.y + yOffset,
    w: PRICE_STYLE.w,
    h: PRICE_STYLE.h,
    color: PRICE_STYLE.color,
    text_size: PRICE_STYLE.text_size,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
    text: '...'
  })

  widgets.changes = []
  TIMEFRAMES.forEach((tf, i) => {
    const rowY = CHANGE_LABEL_STYLE.y_start + (i * CHANGE_LABEL_STYLE.row_height) + yOffset

    const label = createWidget(widget.TEXT, {
      x: CHANGE_LABEL_STYLE.label_x,
      y: rowY,
      w: CHANGE_LABEL_STYLE.label_w,
      h: CHANGE_LABEL_STYLE.row_height,
      color: CHANGE_LABEL_STYLE.label_color,
      text_size: CHANGE_LABEL_STYLE.text_size,
      align_h: align.RIGHT,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
      text: TIMEFRAME_LABELS[tf] + ':'
    })

    const value = createWidget(widget.TEXT, {
      x: CHANGE_LABEL_STYLE.value_x,
      y: rowY,
      w: CHANGE_LABEL_STYLE.value_w,
      h: CHANGE_LABEL_STYLE.row_height,
      color: COLOR_NEUTRAL,
      text_size: CHANGE_LABEL_STYLE.text_size,
      align_h: align.LEFT,
      align_v: align.CENTER_V,
      text_style: text_style.NONE,
      text: '---'
    })

    widgets.changes.push({ label, value, timeframe: tf })
  })

  widgets.updateTime = createWidget(widget.TEXT, {
    x: UPDATE_STYLE.x,
    y: UPDATE_STYLE.y + yOffset,
    w: UPDATE_STYLE.w,
    h: UPDATE_STYLE.h,
    color: UPDATE_STYLE.color,
    text_size: UPDATE_STYLE.text_size,
    align_h: align.CENTER_H,
    align_v: align.CENTER_V,
    text_style: text_style.NONE,
    text: ''
  })

  return widgets
}

/**
 * Tear down all page widgets so the swiper can be reconfigured with a
 * different page count.  Called from applySymbols() before setupUI().
 */
function destroyUI() {
  for (let i = 0; i < pageWidgets.length; i++) {
    const w = pageWidgets[i]
    deleteWidget(w.symbol)
    deleteWidget(w.price)
    deleteWidget(w.updateTime)
    w.changes.forEach(({ label, value }) => {
      deleteWidget(label)
      deleteWidget(value)
    })
    if (w.container) {
      deleteWidget(w.container)
    }
  }
  if (emptyStateWidget) {
    deleteWidget(emptyStateWidget)
    emptyStateWidget = null
  }
  pageWidgets = []
  uiBuilt = false
}

function getPriceDirection(currentStr, previousStr) {
  if (!currentStr || !previousStr) return 0
  const current = parseFloat(currentStr)
  const previous = parseFloat(previousStr)
  if (isNaN(current) || isNaN(previous)) return 0
  if (current > previous) return 1   // up
  if (current < previous) return -1  // down
  return 0                            // unchanged
}

function getPriceColor(direction) {
  if (direction > 0) return COLOR_GREEN
  if (direction < 0) return COLOR_RED
  return 0xFFFFFF // white when unchanged
}

function getPriceArrow(direction) {
  if (direction > 0) return ' \u25B2'  // ▲
  if (direction < 0) return ' \u25BC'  // ▼
  return ''
}

function flashUpdateWidget(w) {
  // A short flash makes periodic updates noticeable without redrawing the page.
  w.setProperty(prop.COLOR, COLOR_UPDATE_FLASH)
  setTimeout(() => {
    w.setProperty(prop.COLOR, COLOR_UPDATE_NORMAL)
  }, FLASH_DURATION)
}

/**
 * Apply one pair payload onto an already-created widget set.
 */
function updatePageData(widgets, pairData, lastUpdate) {
  if (!pairData) return

  widgets.symbol.setProperty(prop.TEXT, pairData.symbol || '---')

  // Price with direction arrow and color
  const direction = getPriceDirection(pairData.currentPrice, pairData.previousPrice)
  const priceText = '$' + formatPrice(pairData.currentPrice) + getPriceArrow(direction)
  widgets.price.setProperty(prop.TEXT, priceText)
  widgets.price.setProperty(prop.COLOR, getPriceColor(direction))

  widgets.changes.forEach(({ value, timeframe }) => {
    const change = pairData.changes && pairData.changes[timeframe]
    if (change) {
      const pctText = formatPercent(change.priceChangePercent)
      value.setProperty(prop.TEXT, pctText)
      value.setProperty(prop.COLOR, getChangeColor(change.priceChangePercent))
    } else {
      value.setProperty(prop.TEXT, 'N/A')
      value.setProperty(prop.COLOR, COLOR_NEUTRAL)
    }
  })

  widgets.updateTime.setProperty(prop.TEXT, 'Updated: ' + formatUpdateTime(lastUpdate))
  flashUpdateWidget(widgets.updateTime)
}

Page(
  BasePage({
    state: {},

    build() {
      logger.log('page build start')

      // setupUI must run before any async call because swiper mode is configured
      // only once during page build.
      this.setupUI()

      // Settings are fetched after the first paint so startup stays responsive.
      this.fetchSettings()

      // Prices can be requested immediately. If settings arrive later, pages are
      // updated again with the new symbol order.
      this.fetchPrices()

      // Keep the page current while the user stays on it.
      this.startAutoRefresh()
    },

    onCall(data) {
      if (data && data.method === 'SETTINGS_CHANGED' && data.params && data.params.symbols) {
        const newSymbols = data.params.symbols
        logger.log('settings pushed from side service')
        this.applySymbols(newSymbols)
      }
    },

    applySymbols(newSymbols) {
      if (!newSymbols) return
      activeSymbols = newSymbols
      try { localStorage.setItem('selectedSymbols', JSON.stringify(activeSymbols)) } catch (e) {}

      // Tear down existing UI and rebuild with the correct page count.
      destroyUI()
      this.setupUI()

      if (activeSymbols.length > 0) {
        this.fetchPrices()
      }
    },

    fetchSettings() {
      try {
        this.request({ method: 'GET_SETTINGS' })
          .then((data) => {
            logger.log('settings received')
            if (data && data.result && data.result.symbols && data.result.symbols.length > 0) {
              this.applySymbols(data.result.symbols)
            } else {
              // Fall back to the watch-local symbol cache when the companion app
              // has not saved any preference yet.
              this.fetchPrices()
            }
          })
          .catch((err) => {
            logger.log('settings fetch failed, using saved: ' + err)
            this.fetchPrices()
          })
      } catch (e) {
        logger.log('request not available: ' + e)
        this.fetchPrices()
      }
    },

    setupUI() {
      if (uiBuilt) return
      uiBuilt = true

      const count = activeSymbols.length
      if (count === 0) {
        // First-run empty state before the user enables symbols in the phone app.
        emptyStateWidget = createWidget(widget.TEXT, {
          x: px(0),
          y: px(Math.floor(DEVICE_HEIGHT / 2) - px(30)),
          w: px(DEVICE_WIDTH),
          h: px(60),
          color: COLOR_NEUTRAL,
          text_size: px(18),
          align_h: align.CENTER_H,
          align_v: align.CENTER_V,
          text_style: text_style.WRAP,
          text: 'Select currencies in the mobile app.'
        })
        return
      }

      // Remove empty-state widget if it was shown
      if (emptyStateWidget) {
        emptyStateWidget.setProperty(prop.TEXT, '')
        emptyStateWidget.setProperty(prop.VISIBLE, false)
        emptyStateWidget = null
      }

      logger.log('setupUI: count=' + count + ' height=' + DEVICE_HEIGHT)

      // Use one full-screen page per tracked symbol.
      setScrollMode({
        mode: SCROLL_MODE_SWIPER,
        options: {
          height: px(DEVICE_HEIGHT),
          count: count
        }
      })

      // Pre-create all widgets once, then update properties as data changes.
      pageWidgets = []
      for (let i = 0; i < count; i++) {
        const widgets = createPageWidgets(i)

        // Show the symbol immediately so the page does not look empty while
        // waiting for the first network response.
        widgets.symbol.setProperty(prop.TEXT, activeSymbols[i])
        widgets.price.setProperty(prop.TEXT, 'Loading...')

        pageWidgets.push(widgets)
      }

      logger.log('setupUI complete, pages=' + pageWidgets.length)
    },

    fetchPrices() {
      try {
        this.request({ method: 'GET_PRICES' })
          .then((data) => {
            logger.log('prices received')
            if (data && data.result && data.result.pairs) {
              pricesData = data.result
              this.updateAllPages()
            }
          })
          .catch((err) => {
            logger.log('prices fetch failed: ' + err)
          })
      } catch (e) {
        logger.log('request not available: ' + e)
      }
    },

    updateAllPages() {
      if (!pricesData || !pricesData.pairs) return

      // Each visible page maps to the symbol at the same index in activeSymbols.
      activeSymbols.forEach((symbol, idx) => {
        if (idx < pageWidgets.length) {
          const pairData = pricesData.pairs[symbol]
          if (pairData) {
            updatePageData(pageWidgets[idx], pairData, pricesData.lastUpdate)
          }
        }
      })
    },

    startAutoRefresh() {
      if (refreshTimer) {
        clearInterval(refreshTimer)
      }
      // Refresh is page-scoped so it can be torn down cleanly in onDestroy().
      refreshTimer = setInterval(() => {
        logger.log('auto-refresh tick')
        this.fetchPrices()
      }, REFRESH_INTERVAL)
    },

    onDestroy() {
      logger.log('page onDestroy')
      if (refreshTimer) {
        clearInterval(refreshTimer)
        refreshTimer = null
      }
    }
  })
)
