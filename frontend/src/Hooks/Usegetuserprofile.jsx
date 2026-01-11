import { useEffect } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { setuserProfile } from "../Redux/authslice";
import { getApiUrl } from "../config/api";

const useGetUserProfile = (userId) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!userId) return;

    const fetchUserProfile = async () => {
      try {
        const res = await axios.get(
          getApiUrl(`api/v1/user/${userId}/profile`),
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
