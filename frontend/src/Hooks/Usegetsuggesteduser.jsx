import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setsuggesteduser } from "../Redux/authslice";
import { getApiUrl } from "../config/api";

const usegetsuggesteduser = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        const res = await axios.get(getApiUrl("api/v1/user/suggested"), {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setsuggesteduser(res.data.users));  // users array dispatch करें
        }
      } catch (error) {
        console.error("Failed to fetch suggested users", error);
      }
    };

    fetchSuggestedUsers();
  }, [dispatch]);
};

export default usegetsuggesteduser;
