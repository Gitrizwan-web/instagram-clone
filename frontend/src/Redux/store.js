import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authslice";
import PostReducer from "./postslice";
import SocketReducer from "./SocketSlice";
import chatReducer from "./Chatslice";
import rtnReducer from "./rtnslice";
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";

const storage = {
  getItem: (key) => Promise.resolve(localStorage.getItem(key)),
  setItem: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
  removeItem: (key) => Promise.resolve(localStorage.removeItem(key)),
};

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  post: PostReducer,
  socket: SocketReducer,
  chat: chatReducer,
  realtimenotification:rtnReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore default redux-persist actions plus your socket action
        ignoredActions: [
          FLUSH,
          REHYDRATE,
          PAUSE,
          PERSIST,
          PURGE,
          REGISTER,
          "socketio/setsocket",  // Add this line to ignore your socket action
        ],
      },
    }),
});

export const persistor = persistStore(store);
