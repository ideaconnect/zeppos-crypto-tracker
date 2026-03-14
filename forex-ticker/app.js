/*
 * Application entry point for the Zepp OS Mini Program.
 *
 * This file intentionally stays minimal. The watch page, app-side service,
 * and settings page own the real feature logic, while the app object only
 * exposes lifecycle hooks for future global initialization if needed.
 */
import { BaseApp } from '@zeppos/zml/base-app'

App(
  BaseApp({
    // Reserved for shared state if the app grows beyond a single page flow.
    globalData: {},
    onCreate(options) {
      console.log('app on create invoke')
    },

    onDestroy(options) {
      console.log('app on destroy invoke')
    }
  })
)