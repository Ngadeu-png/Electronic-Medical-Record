import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center bg-gradient- from-purple-100 via-white to-pink-100 px-6 relative overflow-hidden"
    >
      <motion.div
        className="text-center max-w-3xl z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl md:text-5xl font-extrabold text-purple-800 mb-6 leading-tight">
          Welcome to <span className="text-pink-600">CENTRIC CARE</span>
        </h1>
        <p className="text-lg text-gray-700 mb-8">
          Your smart, secure electronic medical record system. Empowering
          patients. Enabling providers.
        </p>
       
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link
            to="/auths/register"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-md shadow-lg hover:bg-purple-700 transition"
          >
            Register Now
          </Link>
        </motion.div>
      </motion.div>

      {/* Optional: Add a subtle background pattern or SVG illustration */}
      <div className="absolute bottom-0 left-0 w-full opacity-10 pointer-events-none">
        <img
          src="/assets/medical-bg.svg"
          alt="background pattern"
          className="w-full h-auto"
        />
      </div>
    </section>
  );
};

export default Hero;
