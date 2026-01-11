import React, { useState, useEffect } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getApiUrl } from "../config/api";

const InstaSignup = () => {
  const navigate = useNavigate();
  const { user } = useSelector((store) => store.auth);

  const [input, setInput] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        getApiUrl("api/v1/user/register"),
        input,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setInput({ username: "", email: "", password: "" });
        // Optional: signup के बाद redirect करना चाहें तो यहाँ करें
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  // अगर user पहले से logged in है तो signup page पर आने पर redirect कर दें
  useEffect(() => {
    if (user && user._id) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
        {/* Instagram Logo */}
        <div className="mb-8">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Instagram_logo_2022.svg/2560px-Instagram_logo_2022.svg.png"
            alt="Instagram"
            className="h-12 mx-auto"
          />
        </div>

        {/* Signup box */}
        <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full p-8 flex flex-col items-center">
          <p className="text-center text-gray-700 text-lg mb-6 font-semibold">
            Sign up to see photos and videos from your friends
          </p>

          <form onSubmit={signupHandler} className="w-full flex flex-col gap-4">
            <Input
              type="text"
              name="username"
              placeholder="Username"
              value={input.username}
              onChange={changeEventHandler}
              required
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={input.email}
              onChange={changeEventHandler}
              required
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={input.password}
              onChange={changeEventHandler}
              required
              className="px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              )}
              {loading ? "Signing up…" : "Sign Up"}
            </Button>
          </form>
        </div>

        {/* Footer with login link */}
        <div className="bg-white border border-gray-300 rounded-lg max-w-md w-full p-4 mt-4 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>

      <Toaster />
    </>
  );
};

export default InstaSignup;
