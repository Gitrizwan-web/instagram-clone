// authslice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  suggestedUsers: [],
  userprofile: null,
  selectedUser: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
    },
    setsuggesteduser: (state, action) => {
      state.suggestedUsers = action.payload; // यहाँ भी camelCase का use करें
    },
    setuserProfile: (state, action) => {
      state.userprofile = action.payload;
    },
      setselecteduser: (state, action) => {
      state.selectedUser = action.payload; // <-- capital "S" here too
    },
    clearAuthUser: (state) => {
      state.user = null;
    },
  },
});

export const {
  setAuthUser,
  clearAuthUser,
  setsuggesteduser,
  setuserProfile,
  setselecteduser,
} = authSlice.actions;
export default authSlice.reducer;
