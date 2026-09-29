import { Outlet } from "react-router-dom";

const App_layout = () => {
  return (
    <div className="relative min-h-screen">
      <Outlet />
    </div>
  );
};

export default App_layout;
