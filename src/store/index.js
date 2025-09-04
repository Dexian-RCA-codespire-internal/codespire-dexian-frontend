import { configureStore } from '@reduxjs/toolkit'
import counter from './counterSlice'

export const store = configureStore({
  reducer: { counter }
})
