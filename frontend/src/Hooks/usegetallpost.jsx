import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setPosts } from "../Redux/postslice";


const usegetallpost = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:3000/api/v1/post/all",
          { withCredentials: true }
        );

        if (res.data.success) {
          dispatch(setPosts(res.data.posts));
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchPosts();
  }, [dispatch]);
};

export default usegetallpost;
