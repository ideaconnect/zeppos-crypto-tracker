/*
 * Round-screen layout constants for the watch page.
 *
 * Keeping coordinates in a dedicated file lets page/index.js focus on data
 * flow and widget updates while the device-specific geometry stays isolated.
 */
import { px } from '@zos/utils'

// Amazfit round target used by this project.
export const DEVICE_WIDTH = 480
export const DEVICE_HEIGHT = 480

// Header row.
export const SYMBOL_STYLE = {
  x: px(0),
  y: px(30),
  w: px(480),
  h: px(50),
  color: 0xFFFFFF,
  text_size: px(36),
}

// Primary price readout.
export const PRICE_STYLE = {
  x: px(0),
  y: px(90),
  w: px(480),
  h: px(60),
  color: 0xFFFFFF,
  text_size: px(48),
}

// Timeframe label/value pairs arranged around the center line.
export const CHANGE_LABEL_STYLE = {
  y_start: px(170),
  row_height: px(36),
  // Centered: label right-aligned in left half, value left-aligned in right half
  label_x: px(80),
  label_w: px(140),
  value_x: px(230),
  value_w: px(170),
  text_size: px(24),
  label_color: 0xAAAAAA,
}

// Footer metadata row.
export const UPDATE_STYLE = {
  x: px(0),
  y: px(370),
  w: px(480),
  h: px(30),
  color: 0x888888,
  text_size: px(18),
}

// Shared placeholder style for empty or loading states.
export const LOADING_STYLE = {
  x: px(0),
  y: px(200),
  w: px(480),
  h: px(60),
  color: 0x888888,
  text_size: px(28),
}

// Page position indicator (e.g. "1/8") in top-right corner.
export const PAGE_INDICATOR_STYLE = {
  x: px(380),
  y: px(8),
  w: px(90),
  h: px(24),
  color: 0x666666,
  text_size: px(18),
}
