import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="py-16 px-6 bg-purple-50">
      <motion.div
        className="max-w-4xl mx-auto text-center"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-purple-700 mb-4">
          About CENTRIC CARE
        </h2>
        <p className="text-gray-700 text-lg">
          Centric is a cloud-based electronic medical record system built to
          revolutionize patient care. Founded in 2025, our mission is to create
          intelligent tools that empower healthcare professionals and engage
          patients in their healthcare journey.
        </p>
      </motion.div>
    </section>
  );
};

export default About;
