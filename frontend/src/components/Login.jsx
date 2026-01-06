import React, { useState, useEffect } from "react";  // <-- useEffect import करें
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { useDispatch, useSelector } from "react-redux";  // <-- useSelector भी import करें
import { setAuthUser } from "../Redux/authslice";

const InstaLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const loginHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/api/v1/user/login",
        input,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        dispatch(setAuthUser(res.data.user));
        toast.success(res.data.message || "Login successful");
        navigate("/");
        setInput({ email: "", password: "" });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // useEffect में dependency array में user डालें ताकि user बदलने पर effect चले
  useEffect(() => {
    if (user && user._id) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
        {/* Logo */}
        <div className="mb-8">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/2560px-Instagram_logo_2022.svg.png"
            alt="Instagram"
            className="h-12 mx-auto"
          />
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md p-8 bg-white border border-gray-300 rounded-lg">
          <p className="mb-6 text-lg font-semibold text-center text-gray-700">
            Login to see photos and videos from your friends
          </p>

          <form onSubmit={loginHandler} className="flex flex-col gap-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={input.email}
              onChange={changeEventHandler}
              required
            />

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={input.password}
              onChange={changeEventHandler}
              required
            />

            <Button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 font-semibold text-white bg-blue-600 hover:bg-blue-700"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white rounded-full animate-spin border-t-transparent" />
              )}
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </div>

        {/* Signup Link */}
        <div className="w-full max-w-md p-4 mt-4 text-sm text-center text-gray-600 bg-white border border-gray-300 rounded-lg">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 hover:underline"
          >
            Sign up
          </Link>
        </div>
      </div>

      <Toaster position="top-right" />
    </>
  );
};

export default InstaLogin;
