import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import SuggestedUser from "./SuggesttedUser";

const Rightside = () => {
  const { user } = useSelector((store) => store.auth);

  if (!user) return null;

  return (
    <div className="w-96 my-10 pr-10 sticky top-20">
      {/* User Info */}
      <div className="flex items-center gap-5 mb-6">
        <Link to={`/profile/${user._id}`}>
          <Avatar className="w-16 h-16 rounded-full border border-gray-300">
            {user.profilePicture ? (
              <AvatarImage src={user.profilePicture} alt={user.username} />
            ) : (
              <AvatarFallback>{user.username.slice(0, 2).toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
        </Link>
        <div>
          <h2 className="font-semibold text-base text-gray-900 hover:underline cursor-pointer">
            <Link to={`/profile/${user._id}`}>{user.username}</Link>
          </h2>
          <p className="text-sm text-gray-600">{user.bio?.trim() || "Bio here..."}</p>
        </div>
      </div>

      {/* Suggested Users */}
      <SuggestedUser />
    </div>
  );
};

export default Rightside;
