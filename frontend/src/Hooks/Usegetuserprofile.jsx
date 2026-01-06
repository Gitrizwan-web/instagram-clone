import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setuserProfile } from "../Redux/authslice";  // path ठीक रखें

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;  // अगर userId नहीं है तो कुछ न करें

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/v1/user/${userId}/profile`,
          {
            withCredentials: true,
          }
        );

        if (res.data.success) {
          dispatch(setuserProfile(res.data.user));
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };

    fetchUserProfile();
  }, [userId, dispatch]);
};

export default useGetUserProfile;
