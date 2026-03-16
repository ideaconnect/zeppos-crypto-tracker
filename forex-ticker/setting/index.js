/*
 * Settings page for Crypto Tracker � runs inside the Zepp companion app on
 * the paired phone.
 *
 * Presents toggle switches and reorder controls so the user can choose which
 * cryptocurrency pairs to track and in what order they appear on the watch.
 * The selected list is persisted to settingsStorage; the phone-side service
 * detects the change and pushes a SETTINGS_CHANGED message to the watch so
 * the swiper updates without a restart.
 */

import { ALL_SYMBOLS, DEFAULT_SYMBOLS, SYMBOL_NAMES } from '../shared/symbols'
import { UP_ICON, DOWN_ICON, LOGO } from './assets'

AppSettingsPage({
  state: {
    selectedSymbols: [], // tracks the currently selected pairs for reactivity
    settingsErrorMessage: ''
  },

  /**
   * build() is called by the Zepp Settings framework each time the page
   * renders.  It reads the persisted selection from settingsStorage, wires
   * up toggle / reorder callbacks, and returns the component tree.
   */
  build(props) {
    const storage = props.settingsStorage

    // --- Restore persisted selection (or fall back to defaults) -----------
    let selectedSymbols = DEFAULT_SYMBOLS
    try {
      const saved = storage.getItem('selectedSymbols')
      if (saved) selectedSymbols = JSON.parse(saved)
    } catch (e) {
      // use defaults
    }

    this.state.selectedSymbols = selectedSymbols

    // --- Helper: read current selection from storage ---------------------
    const getSelectedSymbols = () => {
      try {
        const saved = storage.getItem('selectedSymbols')
        if (saved) return JSON.parse(saved)
      } catch (e) { /* use defaults */ }
      return [...DEFAULT_SYMBOLS]
    }

    // --- Helper: persist selection and trigger a re-render ---------------
    const saveAndRefresh = (newSelected) => {
      try {
        storage.setItem('selectedSymbols', JSON.stringify(newSelected))
        this.state.selectedSymbols = newSelected
        this.state.settingsErrorMessage = ''
      } catch (e) {
        console.log('Failed to save selectedSymbols: ' + e)
        this.state.settingsErrorMessage = 'Network errors.'
      }
    }

    // --- Callback: toggle a symbol on/off -------------------------------
    const toggleSymbol = (symbol) => {
      try {
        const arr = getSelectedSymbols()
        const idx = arr.indexOf(symbol)
        if (idx >= 0) {
          if (arr.length <= 1) return // keep at least one symbol active
          arr.splice(idx, 1) // deactivate
        } else {
          arr.push(symbol)   // activate (appended at end)
        }
        saveAndRefresh(arr)
      } catch (e) {
        console.log('toggleSymbol failed: ' + e)
        this.state.settingsErrorMessage = 'Network errors.'
      }
    }

    // --- Callback: move a symbol one position up in the list -------------
    const moveUp = (symbol) => {
      try {
        const arr = getSelectedSymbols()
        const idx = arr.indexOf(symbol)
        if (idx > 0) {
          const temp = arr[idx - 1]; arr[idx - 1] = symbol; arr[idx] = temp
          saveAndRefresh(arr)
        }
      } catch (e) {
        console.log('moveUp failed: ' + e)
        this.state.settingsErrorMessage = 'Network errors.'
      }
    }

    // --- Callback: move a symbol one position down in the list -----------
    const moveDown = (symbol) => {
      try {
        const arr = getSelectedSymbols()
        const idx = arr.indexOf(symbol)
        if (idx >= 0 && idx < arr.length - 1) {
          const temp = arr[idx + 1]; arr[idx + 1] = symbol; arr[idx] = temp
          saveAndRefresh(arr)
        }
      } catch (e) {
        console.log('moveDown failed: ' + e)
        this.state.settingsErrorMessage = 'Network errors.'
      }
    }

    // --- UI component: reorder arrow button -----------------------------
    const arrowBtn = (icon, opacity, onClickFn) => View({
      style: {
        width: '28px',
        height: '28px',
        backgroundImage: "url('" + icon + "')",
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        opacity: opacity,           // dimmed when action is unavailable
        cursor: onClickFn ? 'pointer' : 'default',
        flexShrink: '0',
      },
      onClick: onClickFn || undefined,
    }, [])

    // --- UI component: toggle switch (on/off pill) -----------------------
    const switchBtn = (isOn, onToggle) => View({
      style: {
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        backgroundColor: isOn ? '#E91E63' : '#ccc',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px',
        flexShrink: '0',
        marginLeft: '4px',
        marginRight: '8px',
      },
      onClick: onToggle,
    }, [
      View({
        style: {
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'white',
          marginLeft: isOn ? '20px' : '0',
        },
      }, [])
    ])

    // Build the display order: active pairs first (in user order), then inactive
    const activeSymbols = this.state.selectedSymbols.filter(s => ALL_SYMBOLS.indexOf(s) >= 0)
    const inactiveSymbols = ALL_SYMBOLS.filter(s => this.state.selectedSymbols.indexOf(s) < 0)
    const orderedSymbols = activeSymbols.concat(inactiveSymbols)

    // Generate one row per symbol: [?] [?] [toggle] label
    const rows = orderedSymbols.map((symbol) => {
      const isActive = activeSymbols.indexOf(symbol) >= 0
      const activeIdx = activeSymbols.indexOf(symbol)
      const isFirst = isActive && activeIdx === 0
      const isLast = isActive && activeIdx === activeSymbols.length - 1
      const name = SYMBOL_NAMES[symbol] || symbol

      const upOpacity = !isActive ? '0' : (isFirst ? '0.35' : '1')
      const downOpacity = !isActive ? '0' : (isLast ? '0.35' : '1')

      return View({
        style: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          borderBottom: '1px solid #eaeaea',
          minHeight: '44px',
          padding: '4px 0',
        },
      }, [
        arrowBtn(UP_ICON, upOpacity, (isActive && !isFirst) ? () => moveUp(symbol) : null),
        arrowBtn(DOWN_ICON, downOpacity, (isActive && !isLast) ? () => moveDown(symbol) : null),
        switchBtn(isActive, () => toggleSymbol(symbol)),
        Text({}, name),
      ])
    })

    // --- Assemble the full settings page layout -------------------------
    return Section({}, [
      // Header
      Section({ style: { marginBottom: '16px', width: '100%', textAlign: 'center' } }, [
        Text({ align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } }, 'Crypto Tracker Settings'),
      ]),
      Section({ style: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' } }, [
        Text({ align: 'center', style: { display: 'block' } }, 'Crypto Tracker is a simple app to track cryptocurrency prices.'),
        Text({ align: 'center', style: { display: 'block' } }, 'Select the pairs you want to track in the settings.'),
        Text({ align: 'center', style: { display: 'block' } }, 'Data is fetched from Binance API.'),
      ]),
      // Symbol toggle / reorder list
      Section({ style: { padding: '16px', width: '100%' } }, [
        Text({ bold: true }, 'Active pairs:'),
        ...(this.state.settingsErrorMessage
          ? [
              Text(
                {
                  style: {
                    color: '#FF5252',
                    display: 'block',
                    marginBottom: '8px',
                  },
                },
                this.state.settingsErrorMessage
              )
            ]
          : []),
        ...rows,
      ]),
      // About section
      Section({ style: { marginBottom: '16px', width: '100%', textAlign: 'center' } }, [
        Text({ align: 'center', style: { fontSize: '18px', fontWeight: 'bold' } }, 'About'),
      ]),
      Section({ style: { width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' } }, [
        Link({ source: 'https://idct.tech'}, [
          View({
            style: {
              width: '128px',
              height: '128px',
              marginBottom: '16px',
              backgroundImage: "url('" + LOGO + "')",
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
            },
          }, [])
        ])
      ]),
      Section({ style: { display: 'block', width: '100%', align: 'center', textAlign: 'center' } }, [
        Link({ source: 'https://github.com/ideaconnect/zeppos-crypto-tracker'}, [
          Text({ align: 'center', style: { fontSize: '16px' } }, 'GitHub Repository')
        ])

      ]),
    ])
  }
})