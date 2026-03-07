# Crypto Tracker for Zepp OS

A lightweight cryptocurrency price tracker for Amazfit smartwatches running Zepp OS 4.0+.

Track real-time prices and percentage changes for popular crypto pairs — right on your wrist.

## Screenshots

<p align="center">
  <img src=".github/assets/zepp_screenshot_1772853668190.png" width="200" alt="Round screen - BTC" />
  <img src=".github/assets/zepp_screenshot_1772853671595.png" width="200" alt="Round screen - ETH" />
  <img src=".github/assets/zepp_screenshot_1772854104741.png" width="170" alt="Square screen - BTC" />
  <img src=".github/assets/zepp_screenshot_1772854107418.png" width="170" alt="Square screen - ETH" />
</p>

<p align="center">
  <img src=".github/assets/app-settings.png" width="300" alt="Settings page in Zepp companion app" />
</p>

## Features

- **Live prices** — current price displayed with up/down direction arrows and color coding (green/red)
- **Multi-timeframe changes** — percentage change for 1m, 5m, 1h, 12h, and 7d intervals
- **Multiple pairs** — swipe between pages to view different cryptocurrencies
- **Auto-refresh** — prices update automatically every 10 seconds
- **Configurable** — select and reorder tracked pairs from the Zepp companion app
- **Multi-device** — supports both round (480×480) and square (390×390) Amazfit screens

## Supported Pairs

| Pair      | Name          |
|-----------|---------------|
| BTCUSDT   | Bitcoin       |
| ETHUSDT   | Ethereum      |
| BNBUSDT   | Binance Coin  |
| ADAUSDT   | Cardano       |
| DOGEUSDT  | Dogecoin      |
| SOLUSDT   | Solana        |
| TRXUSDT   | TRON          |
| XRPUSDT   | XRP           |

All pairs are quoted against USDT. Price data is sourced from the Binance API.

## How It Works

The app follows the Zepp OS Mini Program architecture:

- **Watch side** (`page/index.js`) — renders the UI using Zepp OS widget APIs, displays prices with color-coded change indicators, and supports vertical swipe navigation between pairs.
- **Phone side** (`app-side/index.js`) — runs on the companion phone, fetches price data from the backend, and relays it to the watch via the Zepp OS messaging API.
- **Settings** (`setting/index.js`) — provides a configuration UI inside the Zepp companion app for selecting and reordering tracked pairs.

## Getting Started

### Prerequisites

- [Zeus CLI](https://docs.zepp.com/docs/guides/tools/cli/) (`@zeppos/zeus-cli`)
- [Zepp OS Simulator](https://docs.zepp.com/docs/guides/tools/simulator/) (for testing without a physical device)
- An Amazfit device running Zepp OS 4.0 or later

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ideaconnect/zeppos-crypto-tracker.git
   cd zeppos-crypto-tracker/forex-ticker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run in the simulator:

   ```bash
   zeus dev
   ```

4. To build for deployment:

   ```bash
   zeus build
   ```

## Configuration

Open the Zepp companion app on your phone, navigate to the Crypto Tracker settings, and:

- **Enable/disable** pairs using the toggle switches
- **Reorder** pairs using the up/down arrow buttons
- At least one pair must remain active

Changes are pushed to the watch in real time.

## Project Structure

```
forex-ticker/
├── app.js                  # App entry point (lifecycle hooks)
├── app.json                # App manifest (permissions, targets, pages)
├── app-side/
│   └── index.js            # Phone-side companion logic (API calls)
├── page/
│   ├── index.js            # Watch UI rendering and data display
│   ├── index.r.layout.js   # Layout constants for round screens (480×480)
│   └── index.s.layout.js   # Layout constants for square screens (390×390)
├── setting/
│   └── index.js            # Settings page (Zepp companion app)
└── assets/                 # Bundled image/resource files
```

# 💖 Love my work? Support it! 🚀

* ☕ **Buy me a coffee**: https://buymeacoffee.com/idct
* 💝 **Sponsor**: https://github.com/sponsors/ideaconnect
* 🪙 **BTC**: bc1qntms755swm3nplsjpllvx92u8wdzrvs474a0hr
* 💎 **ETH**: 0x08E27250c91540911eD27F161572aFA53Ca24C0a
* ⚡ **TRX**: TVXWaU4ScNV9RBYX5RqFmySuB4zF991QaE
* 🚀 **LTC**: LN5ApP1Yhk4iU9Bo1tLU8eHX39zDzzyZxB

## License

This project is licensed under the [MIT License](LICENSE).

## Author

**IDCT Bartosz Pachołek** — [idct.tech](https://idct.tech)
