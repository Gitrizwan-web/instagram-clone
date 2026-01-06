import React from "react";
import Feed from "./Feed";
import Rightside from "./Rightside";
import { Outlet } from "react-router-dom";


const Home = () => {
  
  return (
    <div className="flex w-full bg-white">
      
      {/* MAIN FEED */}
      <div className="flex-1 min-h-screen">
        <Feed />
        <Outlet />
      </div>

      {/* RIGHT SIDEBAR */}
      <div className="hidden lg:block min-h-screen">
        <Rightside />
      </div>

    </div>
  );
};

export default Home;
