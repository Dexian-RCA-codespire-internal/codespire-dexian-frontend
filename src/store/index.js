import { configureStore } from '@reduxjs/toolkit'
import counter from './counterSlice'
import pingStatus from './pingStatusSlice'

export const store = configureStore({
  reducer: {
    counter,
    pingStatus
  }
})
