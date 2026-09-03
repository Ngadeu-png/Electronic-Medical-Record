import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <motion.nav
      className="fixed top-0 w-full bg-white/70 backdrop-blur-md shadow-md z-50 px-6 py-4 flex justify-between items-center"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-xl font-bold text-purple-700">
        <Link to="/">EMR</Link>
      </div>

      <div className="flex items-center space-x-6 text-sm font-medium text-gray-700">
        <a href="#home" className="hover:text-purple-500 transition">
          Home
        </a>
        <a href="#services" className="hover:text-purple-500 transition">
          Services
        </a>
        <a href="#about" className="hover:text-purple-500 transition">
          About
        </a>
        <a href="#contact" className="hover:text-purple-500 transition">
          Contact
        </a>

        {/* Login Button */}
        <Link
          to="/auths/login"
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
        >
          Login
        </Link>
      </div>
    </motion.nav>
  );
};

export default Navbar;
