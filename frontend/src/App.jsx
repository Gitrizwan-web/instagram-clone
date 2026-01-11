import { Route, Routes } from "react-router-dom";
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io } from "socket.io-client";

import Home from "./components/Home";
import InstaLogin from "./components/Login";
import InstaSignup from "./components/Signup";
import Mainlayout from "./components/Mainlayout";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import Chatpage from "./components/Chatpage";

import { setonlineUsers } from "./Redux/Chatslice";
import { setlikeNotification } from "./Redux/rtnslice";
import { SOCKET_URL } from "./config/api";

import Explorer from "./components/Explorer";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;

    const socketUrl = SOCKET_URL;

    try {
      socketRef.current = io(socketUrl, {
        query: { userId: user._id },
        transports: ["websocket", "polling"], // Fallback to polling if websocket fails
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 1000,
        timeout: 5000,
      });

      socketRef.current.on("connect", () => {
        console.log("Socket.IO connected");
      });

      socketRef.current.on("connect_error", (error) => {
        console.warn("Socket.IO connection error (this is normal on Vercel):", error.message);
        // Don't crash the app if Socket.IO fails
      });

      socketRef.current.on("getonlineUsers", (users) => {
        dispatch(setonlineUsers(users || []));
      });

      socketRef.current.on("notification", (data) => {
        if (data) {
          dispatch(setlikeNotification(data));
        }
      });
    } catch (error) {
      console.warn("Socket.IO initialization failed (this is normal on Vercel):", error);
      // App continues to work without real-time features
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user?._id, dispatch]);

  return (
    <Routes>
      <Route element={<Mainlayout />}>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chatpage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/explore"
          element={
            <ProtectedRoute>
              <Explorer />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Public routes */}
      <Route path="/login" element={<InstaLogin />} />
      <Route path="/signup" element={<InstaSignup />} />
    </Routes>
  );
};

export default App;
