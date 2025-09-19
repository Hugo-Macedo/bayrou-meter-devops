import { Outlet } from "react-router-dom";
import Header from "./Header.jsx";

export default function RootLayout() {
  return (
    <>
      <Header />
      <div className="flex-grow flex items-center justify-center pt-14">
        <Outlet />
      </div>
    </>
  );
}
