import { px } from '@zos/utils'

// Round screen: 480x480
export const DEVICE_WIDTH = 480
export const DEVICE_HEIGHT = 480

// Symbol name at top
export const SYMBOL_STYLE = {
  x: px(0),
  y: px(30),
  w: px(480),
  h: px(50),
  color: 0xFFFFFF,
  text_size: px(36),
}

// Current price - large
export const PRICE_STYLE = {
  x: px(0),
  y: px(90),
  w: px(480),
  h: px(60),
  color: 0xFFFFFF,
  text_size: px(48),
}

// Change rows — timeframe labels & percentages (centered pair)
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

// Last update timestamp
export const UPDATE_STYLE = {
  x: px(0),
  y: px(370),
  w: px(480),
  h: px(30),
  color: 0x888888,
  text_size: px(18),
}

// Loading text
export const LOADING_STYLE = {
  x: px(0),
  y: px(200),
  w: px(480),
  h: px(60),
  color: 0x888888,
  text_size: px(28),
}
