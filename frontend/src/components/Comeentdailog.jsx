import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTrigger } from "./components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "./components/ui/avatar";
import { Button } from "./components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setPosts } from "../Redux/postslice";
import { toast } from "sonner";
import { getApiUrl } from "../config/api";

const Comeentdailog = ({ open, setopen }) => {
  const dispatch = useDispatch();
  const { selectedPost: reduxSelectedPost, posts } = useSelector(
    (state) => state.post
  );
  const user = useSelector((state) => state.auth.user);

  const [openMore, setOpenMore] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Local state for comments to show immediate updates
  const [localComments, setLocalComments] = useState([]);

  // Always call hooks, so no early return here!

  useEffect(() => {
    if (reduxSelectedPost && user) {
      setBookmarked(
        reduxSelectedPost.isBookmarked ||
          reduxSelectedPost.bookmarkedBy?.includes(user._id) ||
          false
      );

      setIsFollowing(
        reduxSelectedPost.author?.followers?.includes(user._id) || false
      );
    }
  }, [reduxSelectedPost, user]);

  useEffect(() => {
    setLocalComments(reduxSelectedPost?.comments || []);
  }, [reduxSelectedPost]);

  if (!reduxSelectedPost) {
    return (
      <Dialog open={open} onOpenChange={setopen}>
        <DialogContent className="p-4 text-center">
          <p className="text-gray-500">No post selected.</p>
        </DialogContent>
      </Dialog>
    );
  }

  const isAuthor = user?._id === reduxSelectedPost.author?._id;

  /* ---------------- FOLLOW / UNFOLLOW ---------------- */
  const followOrUnfollowHandler = async () => {
    try {
      const res = await axios.get(
        getApiUrl(`api/v1/user/followorunfollow/${reduxSelectedPost.author._id}`),
        { withCredentials: true }
      );

      if (res.data.success) {
        setIsFollowing((prev) => !prev);

        const updatedPosts = posts.map((p) =>
          p._id === reduxSelectedPost._id
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

        toast.success(
          res.data.message || (isFollowing ? "Unfollowed" : "Followed")
        );
        setOpenMore(false); // close menu after action
      }
    } catch (error) {
      toast.error("Follow/unfollow failed");
    }
  };

  /* ---------------- ADD COMMENT ---------------- */
  const addCommentHandler = async () => {
    if (!commentText.trim()) return;

    const tempComment = {
      _id: "temp-" + Date.now(),
      text: commentText.trim(),
      author: user,
      createdAt: new Date().toISOString(),
    };

    setLocalComments((prev) => [...prev, tempComment]);
    setCommentText("");

    try {
      const res = await axios.post(
        getApiUrl(`api/v1/post/${reduxSelectedPost._id}/comment`),
        { text: tempComment.text },
        { withCredentials: true }
      );

      if (res.data.success) {
        setLocalComments((prev) =>
          prev.filter((c) => !c._id.startsWith("temp-")).concat(res.data.comment)
        );

        const updatedPosts = posts.map((p) =>
          p._id === reduxSelectedPost._id
            ? { ...p, comments: [...p.comments, res.data.comment] }
            : p
        );
        dispatch(setPosts(updatedPosts));
      }
    } catch (error) {
      setLocalComments((prev) => prev.filter((c) => !c._id.startsWith("temp-")));
      toast.error("Comment failed");
    }
  };

  /* ---------------- DELETE POST ---------------- */
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      setDeleting(true);
      await axios.delete(getApiUrl(`api/v1/post/${reduxSelectedPost._id}`), {
        withCredentials: true,
      });
      const updatedPosts = posts.filter((p) => p._id !== reduxSelectedPost._id);
      dispatch(setPosts(updatedPosts));
      setopen(false);
      toast.success("Post deleted");
    } catch {
      toast.error("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  /* ---------------- BOOKMARK HANDLER ---------------- */
  const bookmarkHandler = async () => {
    try {
      const res = await axios.post(
        getApiUrl(`api/v1/post/${reduxSelectedPost._id}/bookmark`),
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        const updatedPosts = posts.map((p) =>
          p._id === reduxSelectedPost._id ? { ...p, isBookmarked: !p.isBookmarked } : p
        );

        dispatch(setPosts(updatedPosts));
        setBookmarked(!bookmarked);
        toast.success(bookmarked ? "Removed from favorites" : "Added to favorites");
      }
    } catch {
      toast.error("Bookmark failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setopen}>
      <DialogContent
        className="p-0 max-w-5xl w-full h-[90vh] flex flex-col md:flex-row overflow-hidden rounded-lg"
        onInteractOutside={() => setopen(false)}
      >
        {/* LEFT IMAGE */}
        <div className="w-full md:w-1/2 bg-black flex items-center justify-center">
          <img
            src={reduxSelectedPost.image}
            alt="post"
            className="object-contain w-full h-64 md:h-full"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col w-full md:w-1/2 bg-white">
          {/* HEADER */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage src={reduxSelectedPost.author?.profilePicture} />
                <AvatarFallback>
                  {reduxSelectedPost.author?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <p className="text-sm font-semibold truncate max-w-[120px] md:max-w-full">
                {reduxSelectedPost.author?.username}
              </p>
            </div>

            {/* More Options Dialog */}
            <Dialog open={openMore} onOpenChange={setOpenMore}>
              <DialogTrigger asChild>
                <MoreHorizontal
                  className="cursor-pointer"
                  onClick={() => setOpenMore(true)}
                />
              </DialogTrigger>

              <DialogContent
                onInteractOutside={() => setOpenMore(false)}
                className="w-64 p-0 text-sm text-center rounded-xl"
              >
                {isAuthor ? (
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full py-3 font-semibold text-red-600 border-b"
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={followOrUnfollowHandler}
                      className="w-full py-3 font-semibold text-blue-600 border-b"
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </button>

                    <button
                      onClick={bookmarkHandler}
                      className="w-full py-3 font-semibold"
                    >
                      {bookmarked ? "Remove from favorites" : "Add to favorites"}
                    </button>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>

          {/* COMMENTS LIST */}
          <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[40vh] md:max-h-full">
            {localComments.map((comment) => (
              <div key={comment._id} className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.author?.profilePicture} />
                  <AvatarFallback>
                    {comment.author?.username?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="text-sm break-words">
                    <span className="mr-2 font-semibold">{comment.author?.username}</span>
                    {comment.text}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 ">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* ADD COMMENT */}
          <div className="flex items-center gap-3 p-4 border-t">
            <input
              type="text"
              placeholder="Add a comment..."
              className="flex-1 text-sm outline-none"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
            />

            <Button
              variant="link"
              disabled={!commentText.trim()}
              onClick={addCommentHandler}
              className={`p-0 font-semibold ${
                commentText.trim() ? "text-blue-500" : "text-gray-400"
              }`}
            >
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Comeentdailog;
