import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { setselecteduser } from "../Redux/authslice";
import { setmessages, addMessage, clearMessages, setonlineUsers } from "../Redux/Chatslice";
import { Link } from "react-router-dom";
import { Button } from "./components/ui/button";

import { MessageCircle, ChevronLeft, Send } from "lucide-react";
import axios from "axios";
import { io } from "socket.io-client";

const SOCKET_SERVER_URL = "http://localhost:3000";

const Chatpage = () => {
  const dispatch = useDispatch();

  const { user, suggestedUsers, selectedUser } = useSelector((store) => store.auth);
  const { onlineUsers, messages } = useSelector((store) => store.chat);

  const [isMobile, setIsMobile] = useState(false);
  const [message, setMessage] = useState("");
  const [socket, setSocket] = useState(null);

  const messagesEndRef = useRef(null);

  // Initialize socket connection once when user id is available
  useEffect(() => {
    if (!user?._id) return;

    const socketIo = io(SOCKET_SERVER_URL, {
      auth: { token: localStorage.getItem("token") },
      query: { userId: user._id },
    });

    setSocket(socketIo);

    socketIo.on("getonlineUsers", (onlineUsersList) => {
      dispatch(setonlineUsers(onlineUsersList));
    });

    socketIo.on("newMessage", (newMessage) => {
      // Update messages only if it is relevant to the currently selected user
      if (
        selectedUser &&
        (newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id)
      ) {
        dispatch(addMessage(newMessage));
      }
    });

    return () => {
      socketIo.disconnect();
      dispatch(setonlineUsers([]));
      setSocket(null);
    };
  }, [user?._id, dispatch, selectedUser]);

  // Responsive screen check
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768);
    checkScreen();
    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  // Fetch messages whenever selectedUser changes (without reload)
  useEffect(() => {
    if (!selectedUser) {
      dispatch(clearMessages());
      return;
    }

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `http://localhost:3000/api/v1/message/all/${selectedUser._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true,
          }
        );

        if (res.data.success) {
          dispatch(setmessages(res.data.messages));
        }
      } catch (error) {
        console.error("Error loading messages:", error);
      }
    };

    fetchMessages();
  }, [selectedUser, dispatch]);

  // Scroll to bottom on messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // User select handler (set selected user, clear messages, reset input)
  const handleUserSelect = (user) => {
    dispatch(setselecteduser(user));
    dispatch(clearMessages());
    setMessage("");
  };

  // Send message function with socket emit and API post
  const handleSendMessage = async (receiverId) => {
    if (!message.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/message/send/${receiverId}`,
        { message },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const newMsg = res.data.newMessage || res.data.message;

        dispatch(addMessage(newMsg)); // Add locally immediately
        setMessage("");

        socket?.emit("sendMessage", newMsg); // Send via socket for real-time receiver update
      }
    } catch (error) {
      console.error("Send message error:", error);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white pb-[70px] md:pb-0">
      {(isMobile && !selectedUser) || !isMobile ? (
        <section
          className={`${
            isMobile ? "w-full" : "w-[380px] border-r border-gray-200"
          } h-full flex flex-col`}
        >
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-lg font-semibold">{user?.username}</h1>
            </div>
            <span className="text-xs font-semibold text-gray-500">Messages</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {suggestedUsers.map((u) => {
              const isOnline = onlineUsers?.includes(u._id);
              const isSelected = selectedUser?._id === u._id;

              return (
                <div
                  key={u._id}
                  onClick={() => handleUserSelect(u)}
                  className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                    isSelected ? "bg-blue-100" : ""
                  }`}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={u.profilePicture} />
                      <AvatarFallback>{u.username?.[0]}</AvatarFallback>
                    </Avatar>

                    {isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="text-sm font-semibold truncate">{u.username}</span>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {isOnline ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {selectedUser ? (
        <section className="flex-1 flex flex-col h-full">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="flex items-center gap-3">
              {isMobile && (
                <button
                  onClick={() => dispatch(setselecteduser(null))}
                  className="p-2 hover:bg-gray-100 rounded-full"
                  aria-label="Back to contacts"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <Avatar className="w-8 h-8">
                <AvatarImage src={selectedUser.profilePicture} />
                <AvatarFallback>{selectedUser.username?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-semibold">{selectedUser.username}</p>
                {onlineUsers?.includes(selectedUser._id) ? (
                  <p className="text-[11px] text-green-500">Active now</p>
                ) : (
                  <p className="text-[11px] text-gray-400">Offline</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#fafafa] px-4 py-4">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="flex flex-col items-center text-center px-6">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={selectedUser?.profilePicture} alt="profile" />
                    <AvatarFallback className="text-2xl">{selectedUser?.username?.[0]}</AvatarFallback>
                  </Avatar>

                  <span className="text-lg font-semibold">{selectedUser?.username}</span>

                  <span className="text-sm text-gray-500 mt-1">Instagram</span>

                  <Link to={`/profile/${selectedUser?._id}`}>
                    <Button variant="secondary" className="h-8 mt-4 px-4 text-sm">
                      View profile
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg._id}
                    className={`flex ${msg.senderId === user?._id ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-2xl max-w-[75%] break-words text-sm ${
                        msg.senderId === user?._id
                          ? "bg-[#3797f0] text-white rounded-br-none"
                          : "bg-gray-200 text-black rounded-bl-none"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="flex items-center gap-2 px-3 py-2 border-t bg-white">
            <div className="flex-1 relative">
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Message..."
                className="w-full h-10 px-4 pr-10 bg-gray-100 rounded-full text-sm"
                aria-label="Type your message"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSendMessage(selectedUser?._id);
                  }
                }}
              />
            </div>

            <button
              className={`p-2 rounded-full ${message.trim() ? "bg-[#3797f0]" : "bg-[#b2dffc]"}`}
              disabled={!message.trim()}
              onClick={() => handleSendMessage(selectedUser?._id)}
              aria-label="Send message"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </section>
      ) : (
        !isMobile && (
          <div className="flex-1 flex flex-col items-center justify-center">
            <MessageCircle className="w-24 h-24 text-gray-300 mb-4" />
            <p className="text-gray-500">Your Messages</p>
          </div>
        )
      )}
    </div>
  );
};

export default Chatpage;
