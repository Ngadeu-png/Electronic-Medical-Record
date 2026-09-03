import { Outlet } from "react-router-dom";
import FloatingAIButton from "../components/Dashboard/FloatingAIButton";

const App_layout = () => {
  return (
    <div className="relative min-h-screen">
      <Outlet />
      <FloatingAIButton />
    </div>
  );
};

export default App_layout;
