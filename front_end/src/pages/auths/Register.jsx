// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import InputField from "../../components/InputField";
// import Button from "../../components/Button";
// import { Link, useNavigate } from "react-router-dom";

// const Register = () => {
//   const [formData, setFormData] = useState({
//     username: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     dob: "",
//     phone: "",
//     role: "patient",
//   });
//   const [errors, setErrors] = useState({});
//   const [success, setSuccess] = useState("");
//   const navigate = useNavigate();
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: "" }));
//     setSuccess("");
//   };

//   const validateFields = () => {
//     const newErrors = {};
//     if (!formData.username) newErrors.username = "Username is required.";
//     if (!formData.email) newErrors.email = "Email is required.";
//     else if (!/\S+@\S+\.\S+/.test(formData.email))
//       newErrors.email = "Email is invalid.";

//     if (!formData.password) newErrors.password = "Password is required.";
//     if (formData.password !== formData.confirmPassword)
//       newErrors.confirmPassword = "Passwords do not match.";

//     return newErrors;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setErrors({});
//     setSuccess("");

//     const fieldErrors = validateFields();
//     if (Object.keys(fieldErrors).length > 0) {
//       setErrors(fieldErrors);
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:5000/api/auths/signup", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setErrors({ general: data.error || "Something went wrong." });
//         return;
//       }

//       setSuccess("User created successfully!");
//       setFormData({
//         username: "",
//         email: "",
//         password: "",
//         confirmPassword: "",
//         dob: "",
//         phone: "",
//       });
//       navigate("/auths/login");
//     } catch (err) {
//       console.log("error: ", err);
//       setErrors({ general: "error Please try again later." });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-pink-200 px-6">
//       <motion.form
//         onSubmit={handleSubmit}
//         className="w-full max-w-2xl bg-white/20 p-8 rounded-xl shadow-2xl backdrop-blur-md border border-white/30"
//         initial={{ opacity: 0, y: 40 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.7, ease: "easeOut" }}
//       >
//         <motion.h2
//           className="text-3xl font-extrabold text-purple-800 mb-8 text-center"
//           initial={{ opacity: 0, y: -30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           Create Your Account
//         </motion.h2>

//         {errors.general && (
//           <p className="text-red-600 text-sm mb-4">{errors.general}</p>
//         )}
//         {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <InputField
//             label="Username"
//             type="text"
//             name="username"
//             value={formData.username}
//             onChange={handleChange}
//             placeholder="Enter username"
//             error={errors.username}
//           />

//           <InputField
//             label="Email"
//             type="email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             placeholder="Enter email"
//             error={errors.email}
//           />

//           <InputField
//             label="Password"
//             type="password"
//             name="password"
//             value={formData.password}
//             onChange={handleChange}
//             placeholder="Enter password"
//             error={errors.password}
//           />

//           <InputField
//             label="Confirm Password"
//             type="password"
//             name="confirmPassword"
//             value={formData.confirmPassword}
//             onChange={handleChange}
//             placeholder="Confirm password"
//             error={errors.confirmPassword}
//           />

//           <InputField
//             label="Date of Birth"
//             type="date"
//             name="dob"
//             value={formData.dob}
//             onChange={handleChange}
//           />

//           <InputField
//             label="Phone"
//             type="text"
//             name="phone"
//             value={formData.phone}
//             onChange={handleChange}
//             placeholder="Enter phone number"
//           />

//           <div className="md:col-span-2 text-center text-purple-700 font-light text-sm">
//             Already have an account?{" "}
//             <Link
//               to="/auths/login"
//               className="hover:text-pink-500 font-semibold"
//             >
//               Sign In
//             </Link>
//           </div>
//         </div>

//         <motion.div
//           className="mt-8"
//           initial={{ opacity: 0, scale: 0.95 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 0.4 }}
//         >
//           <Button text="Register" type="submit" onClick={handleSubmit} />
//         </motion.div>
//       </motion.form>
//     </div>
//   );
// };

// export default Register;
import React, { useState } from "react";
import { motion } from "framer-motion";
import InputField from "../../components/InputField";
import SelectField from "../../components/SelectField";
import Button from "../../components/Button";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    dob: "",
    phone: "",
    role: "patient",
    specialty: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); 
    setSuccess("");
  };

  const validateFields = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = "Username is required";
    if (!formData.email.trim()) newErrors.email = "Email cannot be empty";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Invalid email address";
    if (!formData.password.trim()) newErrors.password = "Password cannot be empty";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.confirmPassword.trim() === "") newErrors.confirmPassword = "Confirm Password is required";
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.dob.trim()) newErrors.dob = "Date of Birth is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[6]\d{8}$/.test(formData.phone.trim()))  newErrors.phone = "Enter a valid number";
    if (!formData.role) newErrors.role = "Role is required";
    if (formData.role === "doctor" && !formData.specialty.trim()) newErrors.specialty = "Specialty is required for doctors";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess("");

    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auths/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ general: data.error || "Something went wrong." });
        return;
      }

      setSuccess("User created successfully!");
      setFormData({ username: "", email: "", password: "", confirmPassword: "", dob: "", phone: "", role: "patient", specialty: "" });
      navigate("/auths/login");
    } catch (err) {
      console.log(err);
      setErrors({ general: "Server error. Please try again later." });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-pink-200 px-6">
      <motion.form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white/20 p-8 rounded-xl shadow-2xl backdrop-blur-md border border-white/30"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <motion.h2
          className="text-3xl font-extrabold text-purple-800 mb-8 text-center"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          Create Your Account
        </motion.h2>

        {errors.general && <p className="text-red-600 text-sm mb-4">{errors.general}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <InputField
              label="Username"
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter username"
            />
            {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
          </div>

          <div>
            <InputField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email"
            />
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <InputField
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
            />
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
          </div>

          <div>
            <InputField
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
            />
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <div>
            <InputField
              label="Date of Birth"
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
            />
            {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
          </div>

          <div>
            <InputField
              label="Phone"
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter phone number"
            />
            {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <SelectField
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={[
                { value: "patient", label: "Patient" },
                { value: "doctor", label: "Doctor" },
              ]}
            />
            {errors.role && <p className="text-red-600 text-sm mt-1">{errors.role}</p>}
          </div>

          {formData.role === "doctor" && (
            <div>
              <SelectField
                label="Specialty"
                name="specialty"
                value={formData.specialty}
                onChange={handleChange}
                options={[
                  { value: "cardiology", label: "Cardiology" },
                  { value: "neurology", label: "Neurology" },
                  { value: "orthopedics", label: "Orthopedics" },
                  { value: "dermatology", label: "Dermatology" },
                  { value: "pediatrics", label: "Pediatrics" },
                  { value: "psychiatry", label: "Psychiatry" },
                  { value: "general", label: "General Practice" },
                ]}
              />
              {errors.specialty && <p className="text-red-600 text-sm mt-1">{errors.specialty}</p>}
            </div>
          )}

          <div className="md:col-span-2 text-center text-purple-700 font-light text-sm">
            Already have an account?{" "}
            <Link to="/auths/login" className="hover:text-pink-500 font-semibold">
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-8">
          <Button text="Register" type="submit" onClick={handleSubmit} />
        </div>
      </motion.form>
    </div>
  );
};

export default Register;
