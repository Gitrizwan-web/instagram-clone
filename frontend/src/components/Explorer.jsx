import React, { useEffect, useState } from "react";
import axios from "axios";

const Explorer = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExplorePosts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(
          "http://localhost:3000/api/v1/user/explore",
          { withCredentials: true }
        );
        if (data.success) {
          setPosts(data.posts);
        } else {
          setError("Failed to load posts");
        }
      } catch (err) {
        setError("Server error");
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-semibold mb-6">Explore Posts</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {posts.map((post) => (
          <div
            key={post._id}
            className="border rounded shadow hover:shadow-lg cursor-pointer"
            onClick={() => window.location.href = `/profile/${post.author._id}`}
          >
            <img
              src={post.image || "https://via.placeholder.com/300"}
              alt={post.caption || "Post Image"}
              className="w-full h-48 object-cover"
            />
            <div className="p-2">
              <p className="font-semibold">{post.author.username}</p>
              <p className="text-sm text-gray-600 truncate">{post.caption}</p>
              <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Explorer;
