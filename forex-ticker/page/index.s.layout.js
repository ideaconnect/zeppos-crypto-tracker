import { px } from '@zos/utils'

// Square screen: 390x390
export const DEVICE_WIDTH = 390
export const DEVICE_HEIGHT = 390

// Symbol name at top
export const SYMBOL_STYLE = {
  x: px(0),
  y: px(85),
  w: px(390),
  h: px(40),
  color: 0xFFFFFF,
  text_size: px(30),
}

// Current price - large
export const PRICE_STYLE = {
  x: px(0),
  y: px(130),
  w: px(390),
  h: px(50),
  color: 0xFFFFFF,
  text_size: px(40),
}

// Change rows — timeframe labels & percentages (centered pair)
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

// Last update timestamp
export const UPDATE_STYLE = {
  x: px(0),
  y: px(370),
  w: px(390),
  h: px(28),
  color: 0x888888,
  text_size: px(16),
}

// Loading text
export const LOADING_STYLE = {
  x: px(0),
  y: px(230),
  w: px(390),
  h: px(50),
  color: 0x888888,
  text_size: px(24),
}
