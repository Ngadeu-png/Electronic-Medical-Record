import { motion } from "framer-motion";

const mockServices = [
  {
    title: "Secure Storage",
    description: "Keep patient records encrypted and accessible from anywhere.",
  },
  {
    title: "Appointment Scheduling",
    description: "Efficient scheduling with reminders and patient tracking.",
  },
  {
    title: "E-Prescriptions",
    description:
      "Send prescriptions digitally and manage medication histories.",
  },
];

const Services = () => {
  return (
    <section id="services" className="py-16 px-6 bg-white">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-purple-700">Our Services</h2>
        <p className="text-gray-600 mt-2">
          Designed to enhance patient care and streamline operations.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {mockServices.map((service, index) => (
          <motion.div
            key={index}
            className="bg-purple-50 p-6 rounded-lg shadow hover:shadow-lg transition"
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <h3 className="text-xl font-semibold text-purple-800">
              {service.title}
            </h3>
            <p className="text-gray-700 mt-2">{service.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Services;
