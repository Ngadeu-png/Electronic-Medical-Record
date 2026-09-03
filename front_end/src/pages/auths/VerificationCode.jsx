import React, { useState } from "react";
import { motion } from "framer-motion";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { Link } from "react-router-dom";

const VerificationCode = ({ onSubmit }) => {
  const [code, setCode] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(code);
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
          Enter Verification Code
        </motion.h2>

        <InputField
          label="Verification Code"
          type="text"
          name="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter the code sent to your email"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button text="Verify" type="submit" />
        </motion.div>

        <div className="mt-6 text-center text-sm text-purple-700">
          Didn’t receive the code?{" "}
          <Link
            to="/auths/forgot-password"
            className="hover:text-pink-500 font-semibold"
          >
            Resend
          </Link>
        </div>
      </motion.form>
    </div>
  );
};

export default VerificationCode;
