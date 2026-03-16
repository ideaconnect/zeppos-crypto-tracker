/*
 * Square-screen layout constants for the watch page.
 *
 * These values intentionally differ from the round layout so text remains
 * centered and readable on the tighter 390x390 surface.
 */
import { px } from '@zos/utils'

// Amazfit square target used by this project.
export const DEVICE_WIDTH = 390
export const DEVICE_HEIGHT = 390

// Header row.
export const SYMBOL_STYLE = {
  x: px(0),
  y: px(85),
  w: px(390),
  h: px(40),
  color: 0xFFFFFF,
  text_size: px(30),
}

// Primary price readout.
export const PRICE_STYLE = {
  x: px(0),
  y: px(130),
  w: px(390),
  h: px(50),
  color: 0xFFFFFF,
  text_size: px(40),
}

// Timeframe label/value pairs arranged around the center line.
export const CHANGE_LABEL_STYLE = {
  y_start: px(195),
  row_height: px(32),
  // Centered: label right-aligned in left half, value left-aligned in right half
  label_x: px(60),
  label_w: px(120),
  value_x: px(190),
  value_w: px(140),
  text_size: px(22),
  label_color: 0xAAAAAA,
}

// Footer metadata row.
export const UPDATE_STYLE = {
  x: px(0),
  y: px(370),
  w: px(390),
  h: px(28),
  color: 0x888888,
  text_size: px(16),
}

// Shared placeholder style for empty or loading states.
export const LOADING_STYLE = {
  x: px(0),
  y: px(230),
  w: px(390),
  h: px(50),
  color: 0x888888,
  text_size: px(24),
}

// Page position indicator (e.g. "1/8") in top-right corner.
export const PAGE_INDICATOR_STYLE = {
  x: px(300),
  y: px(6),
  w: px(80),
  h: px(22),
  color: 0x666666,
  text_size: px(16),
}
