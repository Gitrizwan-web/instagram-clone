import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/dialog";

import { MoreHorizontal, MessageCircle, Send, Bookmark } from "lucide-react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import Comeentdailog from "./Comeentdailog";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { removePost, setPosts, setSelectedPost } from "../Redux/postslice";
import { Badge } from "./components/ui/badge";
import { Link } from "react-router-dom";

const Post = ({ post }) => {
  const user = useSelector((state) => state.auth.user);
  const posts = useSelector((state) => state.post.posts || []);
  const dispatch = useDispatch();

  const {
    _id,
    caption,
    image,
    likes = [],
    comments = [],
    author = {},
    isBookmarked = false,
  } = post;

  // Followers array can be inside author or fetched separately
  // Adjust accordingly if backend structure is different
  const followers = author.followers || [];

  // State tracking if logged-in user follows this post author
  const [isFollowing, setIsFollowing] = useState(false);

  // Like/bookmark states
  const [liked, setLiked] = useState(likes.includes(user?._id));
  const [bookmarked, setBookmarked] = useState(isBookmarked);
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [text, setText] = useState("");

  const isAuthor = user?._id === author?._id;

  // On mount and whenever author or user changes, update follow state
  useEffect(() => {
    if (followers && user?._id) {
      setIsFollowing(followers.includes(user._id));
    } else {
      setIsFollowing(false);
    }
  }, [followers, user]);

  /* ---------------- FOLLOW / UNFOLLOW ---------------- */
  const followOrUnfollowHandler = async () => {
    try {
      // Call backend route to toggle follow/unfollow
      const res = await axios.get(
        `http://localhost:3000/api/v1/user/followorunfollow/${author._id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        // Toggle local follow state
        setIsFollowing((prev) => !prev);

        // Update followers list in posts state
        const updatedPosts = posts.map((p) =>
          p._id === _id
            ? {
                ...p,
                author: {
                  ...p.author,
                  followers: res.data.followers || (isFollowing
                    ? p.author.followers.filter((id) => id !== user._id)
                    : [...p.author.followers, user._id]),
                },
              }
            : p
        );

        dispatch(setPosts(updatedPosts));

        toast.success(res.data.message || (isFollowing ? "Unfollowed" : "Followed"));
      }
    } catch (error) {
      toast.error("Follow/unfollow failed");
    }
  };

  /* ---------------- LIKE / UNLIKE ---------------- */
  const likeHandler = async () => {
    try {
      const action = liked ? "dislike" : "like";

      const res = await axios.get(
        `http://localhost:3000/api/v1/post/${_id}/${action}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedPosts = posts.map((p) =>
          p._id === _id
            ? {
                ...p,
                likes: liked
                  ? p.likes.filter((id) => id !== user._id)
                  : [...p.likes, user._id],
              }
            : p
        );

        dispatch(setPosts(updatedPosts));
        setLiked(!liked);
      }
    } catch {
      toast.error("Like update failed");
    }
  };

  /* ---------------- COMMENT ---------------- */
  const commentHandler = async () => {
    if (!text.trim()) return;

    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/post/${_id}/comment`,
        { text },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        const updatedPosts = posts.map((p) =>
          p._id === _id ? { ...p, comments: [...p.comments, res.data.comment] } : p
        );

        dispatch(setPosts(updatedPosts));
        setText("");
      }
    } catch {
      toast.error("Comment failed");
    }
  };

  /* ---------------- BOOKMARK ---------------- */
  const bookmarkHandler = async () => {
    try {
      const res = await axios.post(
        `http://localhost:3000/api/v1/post/${_id}/bookmark`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedPosts = posts.map((p) =>
          p._id === _id ? { ...p, isBookmarked: !p.isBookmarked } : p
        );

        dispatch(setPosts(updatedPosts));
        setBookmarked(!bookmarked);
      }
    } catch {
      toast.error("Bookmark failed");
    }
  };

  /* ---------------- DELETE ---------------- */
  const handleDelete = async () => {
    try {
      setDeleting(true);
      const res = await axios.delete(
        `http://localhost:3000/api/v1/post/delete/${_id}`,
        { withCredentials: true }
      );

      if (res.data.success) {
        dispatch(removePost(_id));
        toast.success("Post deleted");
      }
    } catch {
      toast.error("Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto my-6 w-full max-w-sm rounded-md border bg-white">
      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${author._id}`}>
            <Avatar className="cursor-pointer">
              <AvatarImage src={author.profilePicture} />
              <AvatarFallback>{author.username?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
            </Avatar>
          </Link>

          <Link
            to={`/profile/${author._id}`}
            className="font-semibold cursor-pointer hover:underline"
          >
            {author.username}
          </Link>

          {isAuthor && (
            <Badge className="text-xs px-1 py-0.5 rounded-md bg-blue-100 text-blue-800">
              Author
            </Badge>
          )}
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <MoreHorizontal className="cursor-pointer" />
          </DialogTrigger>
          <DialogContent className="w-64 p-0 text-center">
            {isAuthor ? (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full py-3 font-semibold text-red-600"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            ) : (
              <>
                <button
                  onClick={followOrUnfollowHandler}
                  className="w-full py-3 font-semibold text-blue-600"
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>

                <button onClick={bookmarkHandler} className="w-full py-3 font-semibold">
                  {bookmarked ? "Remove from favorites" : "Add to favorites"}
                </button>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* IMAGE */}
      <img src={image} alt="post" className="w-full object-cover" />

      {/* ACTIONS */}
      <div className="mt-3 flex items-center px-4 text-2xl">
        <div className="flex gap-6">
          <button onClick={likeHandler}>
            {liked ? <FaHeart className="text-red-600" /> : <FaRegHeart />}
          </button>
          <MessageCircle
            onClick={() => {
              dispatch(setSelectedPost(post));
              setOpen(true);
            }}
          />
          <Send />
        </div>

        <button onClick={bookmarkHandler} className="ml-auto">
          <Bookmark className={bookmarked ? "fill-black" : ""} />
        </button>
      </div>

      {/* LIKES */}
      <p className="px-4 mt-2 font-semibold">{likes.length} likes</p>

      {/* CAPTION */}
      <div className="px-4 py-2 text-sm">
        <span className="mr-2 font-semibold">{author.username}</span>
        {caption}
      </div>

      {/* COMMENTS */}
      {comments.length > 0 && (
        <button
          onClick={() => {
            dispatch(setSelectedPost(post));
            setOpen(true);
          }}
          className="px-4 text-sm text-gray-500"
        >
          View all {comments.length} comments
        </button>
      )}

      {/* ADD COMMENT */}
      <div className="flex items-center px-4 py-2 gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-grow outline-none text-sm"
        />
        {text.trim() && (
          <button onClick={commentHandler} className="text-[#3BADF8] font-semibold">
            Post
          </button>
        )}
      </div>

      <Comeentdailog open={open} setopen={setOpen} />
    </div>
  );
};

export default Post;
