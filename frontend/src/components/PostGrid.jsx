import React from "react";

const PostsGrid = ({ posts }) => {
  return (
    <div className="mt-10 max-w-5xl mx-auto px-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Posts
      </h2>
      {posts && posts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2 md:gap-3">
          {posts.map((post) => (
            <div
              key={post._id}
              className="relative w-full aspect-square bg-gray-100 dark:bg-gray-800 cursor-pointer overflow-hidden rounded"
            >
              <img
                src={post.imageUrl || post.image}
                alt={post.caption || "Post image"}
                className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600 dark:text-gray-400">
          No posts yet.
        </p>
      )}
    </div>
  );
};

export default PostsGrid;
