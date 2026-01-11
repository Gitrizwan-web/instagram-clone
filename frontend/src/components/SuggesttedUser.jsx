import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Link } from "react-router-dom";
import usegetsuggesteduser from "../Hooks/Usegetsuggesteduser";
import axios from "axios";
import { setsuggesteduser } from "../Redux/authslice";
import { toast } from "sonner";
import { getApiUrl } from "../config/api";

const SuggestedUser = () => {
  usegetsuggesteduser();

  const dispatch = useDispatch();

  const suggestedUsers = useSelector((store) => store.auth.suggestedUsers);
  const loggedInUser = useSelector((store) => store.auth.user);

  const [followingState, setFollowingState] = useState({});

  useEffect(() => {
    if (suggestedUsers && loggedInUser) {
      const initState = {};
      suggestedUsers.forEach((user) => {
        initState[user._id] = loggedInUser.following.includes(user._id);
      });
      setFollowingState(initState);
    }
  }, [suggestedUsers, loggedInUser]);

  const followOrUnfollow = async (userId) => {
    const currentlyFollowing = followingState[userId];

    try {
      const res = await axios.get(
        getApiUrl(`api/v1/user/followorunfollow/${userId}`),
        { withCredentials: true }
      );

      if (res.data.success) {
        setFollowingState((prev) => ({
          ...prev,
          [userId]: !currentlyFollowing,
        }));

        const updatedSuggestedUsers = suggestedUsers.map((user) => {
          if (user._id === userId) {
            return {
              ...user,
              followers:
                res.data.followers ||
                (currentlyFollowing
                  ? user.followers.filter((id) => id !== loggedInUser._id)
                  : [...user.followers, loggedInUser._id]),
            };
          }
          return user;
        });

        dispatch(setsuggesteduser(updatedSuggestedUsers));

        toast.success(
          res.data.message || (currentlyFollowing ? "Unfollowed" : "Followed")
        );
      }
    } catch (error) {
      toast.error("Failed to follow/unfollow user");
    }
  };

  if (!suggestedUsers || suggestedUsers.length === 0) {
    return (
      <p className="my-4 text-sm text-gray-500">No suggestions available</p>
    );
  }

  return (
    <div className="my-6 p-4 w-80 bg-white rounded-md shadow-md">
      <h2 className="font-semibold text-gray-700 text-lg mb-4">
        Suggestions For You
      </h2>

      {/* Scrollable container with better styling */}
      <div
        className="
          space-y-4
          max-h-[400px] 
          overflow-y-auto 
          scrollbar-thin 
          scrollbar-thumb-gray-300 
          scrollbar-track-gray-100 
          hover:scrollbar-thumb-gray-400 
          scroll-smooth
          pr-2
          "
      >
        {suggestedUsers.map((user) => (
          <div key={user._id} className="flex items-center justify-between">
            <Link to={`/profile/${user._id}`} className="flex items-center gap-3">
              <Avatar className="w-10 h-10 rounded-full border border-gray-300">
                {user.profilePicture ? (
                  <AvatarImage src={user.profilePicture} alt={user.username} />
                ) : (
                  <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-semibold text-sm text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">{user.bio?.trim() || "New to Instagram"}</p>
              </div>
            </Link>

            <button
              onClick={() => followOrUnfollow(user._id)}
              className={`text-xs font-semibold cursor-pointer ${
                followingState[user._id]
                  ? "text-gray-500"
                  : "text-blue-500 hover:text-blue-700"
              }`}
            >
              {followingState[user._id] ? "Unfollow" : "Follow"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestedUser;
