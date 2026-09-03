import React, { useState } from "react";
import { motion } from "framer-motion";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { Link } from "react-router-dom";

const ResetPassword = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-pink-200 px-6">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/20 p-8 rounded-xl shadow-2xl backdrop-blur-md border border-white/30"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.h2
          className="text-3xl font-extrabold text-purple-800 mb-6 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Reset Password
        </motion.h2>

        <InputField
          label="New Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter new password"
        />

        <InputField
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm new password"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button text="Reset Password" type="submit" />
        </motion.div>

        <div className="mt-6 text-center text-sm text-purple-700">
          Remember your password?{" "}
          <Link to="/auths/login" className="hover:text-pink-500 font-semibold">
            Sign In
          </Link>
        </div>
      </motion.form>
    </div>
  );
};

export default ResetPassword;
