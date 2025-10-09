import { configureStore } from '@reduxjs/toolkit'
import counter from './counterSlice.js'
import sla from './slaSlice.js'

export const store = configureStore({
  reducer: {
    counter,
    sla
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore specific action types or paths in state
        ignoredActions: ['sla/handleSLAUpdate'],
        ignoredPaths: ['sla.websocket.lastUpdate']
      }
    })
})
