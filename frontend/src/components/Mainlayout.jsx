import Leftsidebar from "./Leftsidebar";
import { Outlet } from "react-router-dom";

const Mainlayout = () => {
  return (
    <div className="flex w-full">
      <Leftsidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 ml-0 md:ml-[250px]">
        <Outlet />
      </div>
    </div>
  );
};

export default Mainlayout;

