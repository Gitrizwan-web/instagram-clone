import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Home,
  Search,
  Compass,
  Heart,
  MessageCircle,
  PlusSquare,
  LogOut,
  X,
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setAuthUser } from "../Redux/authslice";
import axios from "axios";
import { toast } from "sonner";
import Createpost from "./Createpost";
import { Popover, PopoverTrigger } from "./components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";

const popoverVariants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } },
};

const AnimatedPopoverContent = React.forwardRef(({ open, children, className, ...props }, ref) => (
  <AnimatePresence>
    {open && (
      <motion.div
        ref={ref}
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={popoverVariants}
        style={{ originY: 0 }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
));

const Leftsidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [openPost, setOpenPost] = useState(false);
  const [messageSeen, setMessageSeen] = useState(true);
  const [likeSeen, setLikeSeen] = useState(false);
  const [searchSeen, setSearchSeen] = useState(true);

  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);
  const [notifPopoverOpen, setNotifPopoverOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  const { user } = useSelector((s) => s.auth);
  const { likeNotification = [] } = useSelector((s) => s.realtimenotification || {});
  const { unreadCount = 0 } = useSelector((s) => s.chat || {});
  const { searchNotification = [] } = useSelector((s) => s.searchnotifications || {});

  const loggedIn = Boolean(user?._id);
  const active = (path) => location.pathname.startsWith(path);

  const searchRef = useRef(null);
  const notifRef = useRef(null);

  // Close popovers on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchPopoverOpen &&
        searchRef.current &&
        !searchRef.current.contains(event.target)
      ) {
        setSearchPopoverOpen(false);
        setSearchTerm("");
      }
      if (
        notifPopoverOpen &&
        notifRef.current &&
        !notifRef.current.contains(event.target)
      ) {
        setNotifPopoverOpen(false);
        setLikeSeen(true);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchPopoverOpen, notifPopoverOpen]);

  // Notifications and badge logic
  useEffect(() => {
    if (likeNotification.length === 0 && !likeSeen) {
      setLikeSeen(true);
    } else if (likeNotification.length > 0 && likeSeen) {
      setLikeSeen(false);
    }
  }, [likeNotification.length, likeSeen]);

  useEffect(() => {
    if (unreadCount > 0 && messageSeen) {
      setMessageSeen(false);
    } else if (unreadCount === 0 && !messageSeen) {
      setMessageSeen(true);
    }
  }, [unreadCount, messageSeen]);

  useEffect(() => {
    if (searchNotification.length > 0 && searchSeen) {
      setSearchSeen(false);
    } else if (searchNotification.length === 0 && !searchSeen) {
      setSearchSeen(true);
    }
  }, [searchNotification.length, searchSeen]);

  const logoutHandler = useCallback(async () => {
    try {
      await axios.get("http://localhost:3000/api/v1/user/logout", {
        withCredentials: true,
      });
      dispatch(setAuthUser(null));
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  }, [dispatch, navigate]);

  const fetchSearchResults = useCallback(
    async (query) => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }
      try {
        setLoadingSearch(true);
        const { data } = await axios.get(
          `http://localhost:3000/api/v1/user/search?q=${encodeURIComponent(query)}`,
          { withCredentials: true }
        );
        if (data.success) {
          setSearchResults(data.users);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setLoadingSearch(false);
      }
    },
    []
  );

  // Debounce search input
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchSearchResults(searchTerm);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchSearchResults]);

  const handleUserClick = (id) => {
    navigate(`/profile/${id}`);
    setSearchPopoverOpen(false);
    setSearchTerm("");
    setSearchSeen(true);
  };

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[260px] border-r bg-background px-4 py-6 z-20">
        <div className="flex flex-col justify-between w-full h-full">
          <div>
            <h1 className="text-2xl font-semibold mb-10 px-2">Instagram</h1>

            <nav className="space-y-1">
              {/* Home */}
              <button
                onClick={() => navigate("/")}
                className={`flex items-center gap-4 w-full px-3 py-3 rounded-xl transition ${
                  active("/") ? "bg-muted font-semibold" : "hover:bg-muted"
                }`}
              >
                <Home />
                <span>Home</span>
              </button>

              {/* Search Popover */}
              <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchPopoverOpen(!searchPopoverOpen);
                      setSearchTerm("");
                      setSearchSeen(true);
                      setNotifPopoverOpen(false);
                    }}
                    className={`relative flex items-center gap-4 w-full px-3 py-3 rounded-xl transition ${
                      active("/search") ? "bg-muted font-semibold" : "hover:bg-muted"
                    }`}
                  >
                    <Search />
                    {searchNotification.length > 0 && !searchSeen && (
                      <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
                    )}
                    <span>Search</span>
                  </button>
                </PopoverTrigger>

                <AnimatedPopoverContent
                  open={searchPopoverOpen}
                  ref={searchRef}
                  className="w-80 p-4 max-h-96 overflow-y-auto shadow-lg rounded-md border border-gray-300 bg-white z-50"
                >
                  <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />

                  {loadingSearch ? (
                    <p className="text-center text-sm text-muted-foreground">Loading...</p>
                  ) : searchResults.length === 0 && searchTerm.trim() !== "" ? (
                    <p className="text-center text-sm text-muted-foreground">No users found</p>
                  ) : (
                    searchResults.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-3 p-2 hover:bg-muted cursor-pointer rounded"
                        onClick={() => handleUserClick(user._id)}
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.profilePicture} />
                          <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span>{user.username}</span>
                      </div>
                    ))
                  )}
                </AnimatedPopoverContent>
              </Popover>

              {/* Explore */}
              <button
                onClick={() => {
                  navigate("/explore");
                  setNotifPopoverOpen(false);
                  setSearchPopoverOpen(false);
                }}
                className={`flex items-center gap-4 w-full px-3 py-3 rounded-xl hover:bg-muted transition ${
                  active("/explore") ? "bg-muted font-semibold" : ""
                }`}
              >
                <Compass />
                <span>Explore</span>
              </button>

              {/* Chat */}
              <button
                type="button"
                onClick={() => {
                  navigate("/chat");
                  setMessageSeen(true);
                  setNotifPopoverOpen(false);
                  setSearchPopoverOpen(false);
                }}
                className={`relative flex items-center gap-4 w-full px-3 py-3 rounded-xl transition ${
                  active("/chat") ? "bg-muted font-semibold" : "hover:bg-muted"
                }`}
              >
                <div className="relative">
                  <MessageCircle />
                  {unreadCount > 0 && !messageSeen && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
                  )}
                </div>
                <span>Messages</span>
              </button>

              {/* Notifications Popover */}
              <Popover open={notifPopoverOpen} onOpenChange={setNotifPopoverOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    onClick={() => {
                      setNotifPopoverOpen(!notifPopoverOpen);
                      setLikeSeen(true);
                      setSearchPopoverOpen(false);
                    }}
                    className="relative flex items-center gap-4 w-full px-3 py-3 rounded-xl hover:bg-muted transition"
                  >
                    <div className="relative">
                      <Heart />
                      {likeNotification.length > 0 && !likeSeen && (
                        <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background" />
                      )}
                    </div>
                    <span>Notifications</span>
                  </button>
                </PopoverTrigger>

                <AnimatedPopoverContent
                  open={notifPopoverOpen}
                  ref={notifRef}
                  className="w-80 p-0 max-h-96 overflow-y-auto shadow-lg rounded-md border border-gray-300 bg-white z-50"
                >
                  {likeNotification.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                      No new notifications
                    </p>
                  ) : (
                    likeNotification.map((n) => {
                      const u = n.userDetails || {};
                      return (
                        <div
                          key={n._id}
                          className="flex items-center gap-3 px-4 py-3 border-b text-sm hover:bg-muted cursor-pointer"
                          onClick={() => navigate(`/profile/${u._id || ""}`)}
                        >
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={u.profilePicture} />
                            <AvatarFallback>{u.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                          </Avatar>
                          <span>
                            <b>{u.username || "Someone"}</b> liked your post ❤️
                          </span>
                        </div>
                      );
                    })
                  )}
                </AnimatedPopoverContent>
              </Popover>

              {/* Create Post */}
              <button
                onClick={() => {
                  setOpenPost(true);
                  setSearchPopoverOpen(false);
                  setNotifPopoverOpen(false);
                }}
                className="flex items-center gap-4 w-full px-3 py-3 rounded-xl hover:bg-muted transition"
              >
                <PlusSquare />
                <span>Create</span>
              </button>

              {/* Profile */}
              {loggedIn && (
                <button
                  onClick={() => {
                    navigate(`/profile/${user._id}`);
                    setSearchPopoverOpen(false);
                    setNotifPopoverOpen(false);
                  }}
                  className="flex items-center gap-4 w-full px-3 py-3 rounded-xl hover:bg-muted transition"
                >
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>U</AvatarFallback>
                  </Avatar>
                  <span>Profile</span>
                </button>
              )}
            </nav>
          </div>

          {/* Logout */}
          {loggedIn && (
            <button
              onClick={logoutHandler}
              className="flex items-center gap-4 px-3 py-3 rounded-xl hover:bg-muted transition"
            >
              <LogOut />
              Logout
            </button>
          )}
        </div>
      </aside>

      {/* ===== MOBILE BOTTOM NAVIGATION ===== */}
      <nav
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 flex justify-around items-center h-14 md:hidden z-30"
        role="navigation"
        aria-label="Mobile Navigation"
      >
        <button
          onClick={() => navigate("/")}
          className={`flex flex-col items-center justify-center text-[11px] ${
            active("/") ? "text-blue-600" : "text-gray-600"
          }`}
          aria-label="Home"
          type="button"
        >
          <Home size={22} />
          <span className="mt-0.5">Home</span>
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setSearchPopoverOpen(!searchPopoverOpen);
              setSearchTerm("");
              setSearchSeen(true);
              setNotifPopoverOpen(false);
            }}
            className={`flex flex-col items-center justify-center text-[11px] ${
              active("/search") ? "text-blue-600" : "text-gray-600"
            }`}
            aria-label="Search"
            type="button"
          >
            <Search size={22} />
            {searchNotification.length > 0 && !searchSeen && (
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
            )}
            <span className="mt-0.5">Search</span>
          </button>

          {/* Mobile Search Popover */}
          <AnimatedPopoverContent
            open={searchPopoverOpen}
            className="fixed bottom-16 left-1/2 transform -translate-x-1/2 w-80 max-h-[380px] overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg z-50 md:hidden"
          >
            <input
              type="text"
              placeholder="Search users..."
              className="w-full p-2 mb-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />

            {loadingSearch ? (
              <p className="text-center text-sm text-muted-foreground">Loading...</p>
            ) : searchResults.length === 0 && searchTerm.trim() !== "" ? (
              <p className="text-center text-sm text-muted-foreground">No users found</p>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3 p-2 hover:bg-muted cursor-pointer rounded"
                  onClick={() => {
                    handleUserClick(user._id);
                    setSearchPopoverOpen(false);
                  }}
                >
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback>{user.username[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{user.username}</span>
                </div>
              ))
            )}
          </AnimatedPopoverContent>
        </div>

        <button
          onClick={() => {
            navigate("/explore");
            setSearchPopoverOpen(false);
            setNotifPopoverOpen(false);
          }}
          className={`flex flex-col items-center justify-center text-[11px] ${
            active("/explore") ? "text-blue-600" : "text-gray-600"
          }`}
          aria-label="Explore"
          type="button"
        >
          <Compass size={22} />
          <span className="mt-0.5">Explore</span>
        </button>

        <button
          onClick={() => {
            navigate("/chat");
            setMessageSeen(true);
            setSearchPopoverOpen(false);
            setNotifPopoverOpen(false);
          }}
          className={`relative flex flex-col items-center justify-center text-[11px] ${
            active("/chat") ? "text-blue-600" : "text-gray-600"
          }`}
          aria-label="Messages"
          type="button"
        >
          <MessageCircle size={22} />
          {unreadCount > 0 && !messageSeen && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
          )}
          <span className="mt-0.5">Messages</span>
        </button>

        {/* Notifications Button */}
        <div className="relative">
          <button
            onClick={() => {
              setNotifPopoverOpen(!notifPopoverOpen);
              setLikeSeen(true);
              setSearchPopoverOpen(false);
            }}
            className={`flex flex-col items-center justify-center text-[11px] ${
              notifPopoverOpen ? "text-blue-600" : "text-gray-600"
            }`}
            aria-label="Notifications"
            type="button"
          >
            <Heart size={22} />
            {likeNotification.length > 0 && !likeSeen && (
              <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
            )}
            <span className="mt-0.5">Notifications</span>
          </button>

          {/* Notifications Popover Mobile */}
          <AnimatedPopoverContent
            open={notifPopoverOpen}
            className="fixed bottom-16 left-1/2 transform -translate-x-1/2 w-80 max-h-[380px] overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg z-50 md:hidden"
          >
            {likeNotification.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">
                No new notifications
              </p>
            ) : (
              likeNotification.map((n) => {
                const u = n.userDetails || {};
                return (
                  <div
                    key={n._id}
                    className="flex items-center gap-3 px-4 py-3 border-b text-sm hover:bg-muted cursor-pointer"
                    onClick={() => navigate(`/profile/${u._id || ""}`)}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={u.profilePicture} />
                      <AvatarFallback>{u.username?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    <span>
                      <b>{u.username || "Someone"}</b> liked your post ❤️
                    </span>
                  </div>
                );
              })
            )}
          </AnimatedPopoverContent>
        </div>

        {/* Profile or Login */}
        {loggedIn ? (
          <button
            onClick={() => navigate(`/profile/${user._id}`)}
            className={`flex flex-col items-center justify-center text-[11px] ${
              location.pathname.startsWith("/profile") ? "text-blue-600" : "text-gray-600"
            }`}
            aria-label="Profile"
            type="button"
          >
            <Avatar className="w-6 h-6 rounded-full overflow-hidden">
              <AvatarImage src={user.profilePicture} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <span className="mt-0.5">Profile</span>
          </button>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="flex flex-col items-center justify-center text-[11px] text-gray-600"
            aria-label="Login"
            type="button"
          >
            <LogOut size={22} />
            <span className="mt-0.5">Login</span>
          </button>
        )}
      </nav>

      <Createpost open={openPost} setOpen={setOpenPost} />
    </>
  );
};

export default Leftsidebar;
