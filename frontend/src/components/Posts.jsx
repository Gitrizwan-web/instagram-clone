import React from "react";
import { useSelector } from "react-redux";
import Post from "./Post";
import usegetallpost from "../Hooks/usegetallpost";

const Posts = () => {
  usegetallpost();
  const posts = useSelector((state) => state.post.posts);

  if (!posts.length) {
    return <p className="mt-10 text-center text-gray-500">No posts yet</p>;
  }

  return (
    <div className="mx-auto mt-6 flex max-w-xl flex-col gap-6">
      {posts.map((post) => (
        <Post key={post._id} post={post} />
      ))}
    </div>
  );
};

export default Posts;
