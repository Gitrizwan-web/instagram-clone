import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import usegetuserprofile from "../Hooks/Usegetuserprofile";
import { Link, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "./components/ui/button";
import {
  Grid3X3,
  Bookmark,
  UserPlus,
  Settings,
  MessageCircle,
  MoreVertical,
  ChevronLeft,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { setAuthUser } from "../Redux/authslice";
import { getApiUrl } from "../config/api";

const Profile = () => {
  const { id: userId } = useParams();
  const dispatch = useDispatch();

  // Fetch user profile based on userId param
  usegetuserprofile(userId);

  const { userprofile, user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("posts");
  const [followLoading, setFollowLoading] = useState(false);

  // Local state to track followers to avoid mutating redux state directly
  const [followers, setFollowers] = useState([]);

  // Initialize followers from userprofile when it changes
  useEffect(() => {
    if (userprofile?.followers) {
      setFollowers(userprofile.followers);
    }
  }, [userprofile?.followers]);

  const isLoggedInUser = user?._id === userprofile?._id;
  const isFollowing = followers.includes(user?._id);

  const formatCount = (num = 0) => {
    if (num >= 1_000_000)
      return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
    return num.toString();
  };

  // Posts or saved bookmarks depending on active tab
  const displayPosts =
    activeTab === "posts" ? userprofile?.posts || [] : userprofile?.bookmarks || [];

  // Follow/unfollow API call and state update
const handleFollowToggle = async () => {
  if (followLoading) return;
  setFollowLoading(true);

  try {
    const res = await axios.get(
      getApiUrl(`api/v1/user/followorunfollow/${userprofile._id}`),
      { withCredentials: true }
    );

    if (res.data.success) {
      // Update logged-in user in redux store (to update their following list)
      dispatch(setAuthUser(res.data.user || user));

      // Update local followers state without mutating redux state
      if (isFollowing) {
        setFollowers((prev) => prev.filter((id) => id !== user._id));
      } else {
        setFollowers((prev) => [...prev, user._id]);
      }

      toast.success(isFollowing ? "Unfollowed" : "Followed");
    } else {
      toast.error("Failed to follow/unfollow");
    }
  } catch (error) {
    console.error(error);
    toast.error("Something went wrong");
  } finally {
    setFollowLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden border-b px-4 py-3 flex justify-between items-center">
        <ChevronLeft className="w-5 h-5" />
        <span className="font-medium">@{userprofile?.username}</span>
        <MoreVertical className="w-5 h-5" />
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-10 mb-10">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="p-1 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
              <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-900">
                <AvatarImage src={userprofile?.profilePicture} />
                <AvatarFallback>
                  {userprofile?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <h1 className="text-2xl font-light">{userprofile?.username}</h1>

              {isLoggedInUser ? (
                <Link
                  to="/profile/edit"
                  className="flex items-center gap-1 border px-3 py-1 rounded text-sm"
                >
                  <Settings className="w-4 h-4" />
                  Edit Profile
                </Link>
              ) : (
                <>
                  <Button
                    className={`${
                      isFollowing ? "bg-gray-300 text-gray-700" : "bg-blue-500 text-white"
                    }`}
                    disabled={followLoading}
                    onClick={handleFollowToggle}
                  >
                    {followLoading
                      ? "Please wait..."
                      : isFollowing
                      ? "Following"
                      : "Follow"}
                    {!isFollowing && <UserPlus className="w-4 h-4 ml-1" />}
                  </Button>
                  <Button variant="outline">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Message
                  </Button>
                </>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-4">
              <span>
                <b>{userprofile?.posts?.length || 0}</b> posts
              </span>
              <span>
                <b>{formatCount(followers.length)}</b> followers
              </span>
              <span>
                <b>{formatCount(userprofile?.following?.length || 0)}</b> following
              </span>
            </div>

            {/* Bio */}
            <div>
              <p className="font-semibold">{userprofile?.fullName}</p>
              <p className="text-sm whitespace-pre-wrap">
                {userprofile?.bio || "No bio available."}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-t flex justify-center gap-10 mb-6">
          <button
            onClick={() => setActiveTab("posts")}
            className={`py-3 flex items-center gap-2 ${
              activeTab === "posts" ? "border-t-2 border-black" : ""
            }`}
          >
            <Grid3X3 size={18} /> POSTS
          </button>

          {isLoggedInUser && (
            <button
              onClick={() => setActiveTab("saved")}
              className={`py-3 flex items-center gap-2 ${
                activeTab === "saved" ? "border-t-2 border-black" : ""
              }`}
            >
              <Bookmark size={18} /> SAVED
            </button>
          )}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-2">
          {displayPosts.map((post) => (
            <div key={post._id} className="relative group">
              <img
                src={post.image}
                className="aspect-square object-cover w-full"
                alt="User post"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-6 text-white transition">
                <div>❤️ {formatCount(post.likes?.length || 0)}</div>
                <div>💬 {formatCount(post.comments?.length || 0)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
