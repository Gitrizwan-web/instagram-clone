import React, { useRef, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "./components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Textarea } from "./components/ui/textarea";
import { Button } from "./components/ui/button";
import { readFileAsDataURL } from "./lib/utils";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { addPost } from "../Redux/postslice";
import { getApiUrl } from "../config/api";

const Createpost = ({ open, setOpen }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const onFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImagePreview(await readFileAsDataURL(selectedFile));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!caption && !file) {
      toast.error("Caption or image required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("caption", caption);
      if (file) formData.append("image", file);


      const res = await axios.post(
        getApiUrl("api/v1/post/addpost"),
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (res.data.success) {
        dispatch(addPost(res.data.post));
        toast.success("Post created");
        setOpen(false);
        setCaption("");
        setFile(null);
        setImagePreview("");
      } else {
        toast.error("Failed to create post");
      }
    } catch (error) {
      console.error("Post failed:", error.response || error.message || error);
      toast.error("Post failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader className="text-center font-semibold">
          Create new post
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={user?.profilePicture} />
              <AvatarFallback>
                {user?.username?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <span className="font-medium">{user?.username}</span>
          </div>

          <Textarea
            placeholder="Write a caption..."
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            disabled={loading}
          />

          <input
            type="file"
            hidden
            ref={fileInputRef}
            onChange={onFileChange}
            accept="image/*"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current.click()}
          >
            Select Image
          </Button>

          {imagePreview && (
            <img
              src={imagePreview}
              className="rounded-md max-h-60 mx-auto"
              alt="preview"
            />
          )}

          <Button
            type="submit"
            disabled={loading || (!caption && !file)}
            className="w-full"
          >
            {loading ? "Posting..." : "Post"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default Createpost;
