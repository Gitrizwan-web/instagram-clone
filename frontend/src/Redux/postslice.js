import { createSlice } from "@reduxjs/toolkit";

const postSlice = createSlice({
  name: "post",
  initialState: {
    posts: [],
    selectedPost: null,
  },
  reducers: {
    setPosts: (state, action) => {
      state.posts = action.payload;
    },

    addPost: (state, action) => {
      state.posts.unshift(action.payload);
    },

    removePost: (state, action) => {
      state.posts = state.posts.filter(
        (post) => post._id !== action.payload
      );
    },

    setSelectedPost: (state, action) => {
      state.selectedPost = action.payload;
    },
  },
});

export const {
  setPosts,
  addPost,
  removePost,
  setSelectedPost,
} = postSlice.actions;

export default postSlice.reducer;
