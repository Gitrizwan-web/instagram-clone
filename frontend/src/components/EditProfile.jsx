import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import axios from "axios";
import { setAuthUser } from "../Redux/authslice";
import { toast } from "sonner";


const EditProfile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const [bio, setBio] = useState(user?.bio || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(user?.profilePicture || "");
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

const handleSubmit = async () => {
  try {
    setLoading(true);
    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("gender", gender);
    if (profilePicture) formData.append("profilePicture", profilePicture);

    const { data } = await axios.post(
      "http://localhost:3000/api/v1/user/profile/edit",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      }
    );

    if (data.success) {
      dispatch(setAuthUser(data.user));
      toast.success("Profile updated successfully!");
    } else {
      toast.error("Failed to update profile");
    }
  } catch (err) {
    console.error(err);
    toast.error("Update failed");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 relative">
      {/* Loading line */}
      {loading && <div className="loading-line"></div>}

      <h1 className="text-2xl font-semibold mb-10 text-center md:text-left">
        Edit Profile
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
        {/* Avatar column */}
        <div className="flex flex-col items-center md:items-end md:pr-6">
          <div className="p-1 rounded-full bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500">
            <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-900">
              <AvatarImage src={preview} />
              <AvatarFallback>
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>

          <label className="mt-3 text-blue-500 font-medium cursor-pointer text-sm hover:underline">
            Change profile photo
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleImageChange}
            />
          </label>
        </div>

        {/* Form column */}
        <div className="md:col-span-2 space-y-6 max-w-xl">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              disabled
              value={user.username}
              className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-700"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium mb-1">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              className="w-full border rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <p className="text-xs text-gray-500 mt-1">
              Tell people a little about yourself
            </p>
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Prefer not to say</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          {/* Save */}
          <div className="pt-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 px-8"
            >
              {loading ? "Saving..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
