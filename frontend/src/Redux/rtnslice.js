// Redux/rtnslice.js
import { createSlice } from "@reduxjs/toolkit";

const rtnslice = createSlice({
  name: "realtimenotification",
  initialState: {
    likeNotification: [],
  },
  reducers: {
    setlikeNotification: (state, action) => {
      const payload = action.payload;

      // ✅ Case 1: Array of notifications (initial sync)
      if (Array.isArray(payload)) {
        state.likeNotification = payload;
        return;
      }

      // ✅ Case 2: Single notification
      if (payload?.type === "like") {
        const exists = state.likeNotification.some(
          (n) =>
            n.postId === payload.postId &&
            n.userId === payload.userId
        );

        if (!exists) {
          state.likeNotification.push(payload);
        }
      }

      // ✅ Case 3: Dislike
      if (payload?.type === "dislike") {
        state.likeNotification = state.likeNotification.filter(
          (n) =>
            !(
              n.postId === payload.postId &&
              n.userId === payload.userId
            )
        );
      }
    },
  },
});

export const { setlikeNotification } = rtnslice.actions;
export default rtnslice.reducer;
