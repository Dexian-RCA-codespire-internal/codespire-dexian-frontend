import { createSlice } from '@reduxjs/toolkit';

// Initial state: array of up to 10 ping status objects
const initialState = {
  pingHistory: []
};

const pingStatusSlice = createSlice({
  name: 'pingStatus',
  initialState,
  reducers: {
    addPingStatus: (state, action) => {
      // action.payload should be a new ping status object
      state.pingHistory.push(action.payload);
      if (state.pingHistory.length > 10) {
        state.pingHistory.shift(); // Remove oldest
      }
    },
    setPingHistory: (state, action) => {
      // Replace the whole array (for initialization/reset)
      state.pingHistory = action.payload;
    }
  }
});

export const { addPingStatus, setPingHistory } = pingStatusSlice.actions;
export default pingStatusSlice.reducer;
