import { Capacitor } from '@capacitor/core'

export const isNative = Capacitor.isNativePlatform()

export const isLocalDev = !isNative &&
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

export const API_BASE = isNative ? 'https://visionfinance.app' : ''
