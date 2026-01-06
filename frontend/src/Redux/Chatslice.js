import { createSlice } from "@reduxjs/toolkit";

// in ChatSlice.js
const ChatSlice = createSlice({
  name: "chat",
  initialState: {
    onlineUsers: [],   // array of userIds online
    messages: [],      // array of message objects
  },
  reducers: {
    setonlineUsers: (state, action) => {
      state.onlineUsers = action.payload;
    },
    setmessages: (state, action) => {
      state.messages = action.payload;
    },
    addMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  setonlineUsers,
  setmessages,
  addMessage,
  clearMessages,
} = ChatSlice.actions;

export default ChatSlice.reducer;
