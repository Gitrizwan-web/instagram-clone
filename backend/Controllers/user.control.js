import bcrypt from "bcryptjs";
import Post  from "../Models/Post.model.js";
import User  from "../Models/user.model.js";
import jwt from "jsonwebtoken";
import getdatauri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "Try a different email", success: false });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      username,
      email,
      password: hashedPassword,
    });

    return res
      .status(201)
      .json({ message: "Account Created Successfully", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        message: "Something is missing, please check!",
        success: false,
      });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res
        .status(401)
        .json({ message: "Incorrect Email or Password", success: false });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Incorrect Email or Password", success: false });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    const populatedPosts = await Promise.all(
      user.posts.map(async (postId) => {
        const post = await Post.findById(postId);
        if (post.author.equals(user._id)) {
          return post;
        }
        return null;
      })
    );
    user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      profilePicture: user.profilePicture,
      following: user.following,
      followers: user.followers,
      bio: user.bio,
      posts: user.posts,
    };

    return res
      .status(200)
      .json({ message: `Welcome Back ${user.username}`, user, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    return res
      .cookie("token", "", { maxAge: 0 })
      .json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error(error);
  }
};

export const getprofile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId)
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } },
      })
      .populate({
        path: "bookmarks",
        options: { sort: { createdAt: -1 } },
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


export const editprofile = async (req, res) => {
  try {
    const userId = req.id; // Auth middleware से आएगा
    const { bio, gender } = req.body;
    const profilePicture = req.file;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User Not Found", success: false });
    }

    if (bio) user.bio = bio;
    if (gender) user.gender = gender;

    if (profilePicture) {
      const fileUri = getdatauri(profilePicture);
      const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
      user.profilePicture = cloudResponse.secure_url;
    }

    await user.save();

    res.status(200).json({ message: "Profile Updated", user, success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", success: false });
  }
};

export const getsuggesteduser = async (req, res) => {
  try {
    // अपने user को exclude कर रहे हैं _id: { $ne: req.id }
    const suggesteduser = await User.find({ _id: { $ne: req.id } }).select(
      "-password"
    );

    if (!suggesteduser || suggesteduser.length === 0) {
      return res.status(400).json({ message: "No users currently available" });
    }

    return res.status(200).json({ users: suggesteduser, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const followorunfollow = async (req, res) => {
  try {
    const followerId = req.id; // the user who wants to follow/unfollow
    const targetUserId = req.params.id; // the user to be followed/unfollowed

    if (followerId === targetUserId) {
      return res.status(400).json({
        message: "You can't follow/unfollow yourself",
        success: false,
      });
    }

    const follower = await User.findById(followerId);
    const targetUser = await User.findById(targetUserId);

    if (!follower || !targetUser) {
      return res.status(404).json({ message: "User not found", success: false });
    }

    const isFollowing = follower.following.includes(targetUserId);

    if (isFollowing) {
      // Unfollow
      await User.updateOne(
        { _id: followerId },
        { $pull: { following: targetUserId } }
      );

      await User.updateOne(
        { _id: targetUserId },
        { $pull: { followers: followerId } }
      );

      // Get updated followers list after unfollow
      const updatedTargetUser = await User.findById(targetUserId).select('followers');

      return res.status(200).json({
        message: "Unfollowed successfully",
        success: true,
        followers: updatedTargetUser.followers,
      });
    } else {
      // Follow
      await User.updateOne(
        { _id: followerId },
        { $push: { following: targetUserId } }
      );

      await User.updateOne(
        { _id: targetUserId },
        { $push: { followers: followerId } }
      );

      // Get updated followers list after follow
      const updatedTargetUser = await User.findById(targetUserId).select('followers');

      return res.status(200).json({
        message: "Followed successfully",
        success: true,
        followers: updatedTargetUser.followers,
      });
    }
  } catch (error) {
    console.error("Follow/unfollow error:", error);
    return res.status(500).json({
      message: "Something went wrong, please try again",
      success: false,
    });
  }
};
// GET /api/v1/users/search?q=searchTerm

export const searchUsers = async (req, res) => {
  try {
    const query = req.query.q;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    // Search username or email case insensitive, partial match
    const regex = new RegExp(query, "i");

    const users = await User.find({
      $or: [{ username: regex }, { email: regex }],
    })
      .select("_id username profilePicture bio")
      .limit(20); // limit to 20 results

    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found matching your search",
      });
    }

    return res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while searching users",
    });
  }
};

// GET /api/v1/users/explore
// controllers/user.controller.js या post.controller.js में


export const explorePosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "-password -email")
      .sort({ createdAt: -1 })  // recent posts पहले दिखाओ
      .limit(30);  // लिमिट लगा सकते हैं

    return res.status(200).json({ posts, success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};


