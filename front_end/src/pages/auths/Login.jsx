// import { useContext, useState } from "react";
// import { motion } from "framer-motion";
// import InputField from "../../components/InputField";
// import Button from "../../components/Button";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../../api/context/AuthContext";

// const Login = () => {
//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [errors, setErrors] = useState({}); // store validation errors
//   const navigate = useNavigate();
//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const { setUser } = useContext(AuthContext);
//   const validate = () => {
//     let tempErrors = {};
//     // email validation
//     if (!formData.email) {
//       tempErrors.email = "Email cannot be empty";
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       tempErrors.email = "Enter a valid email address";
//     }

//     // password validation
//     if (!formData.password) {
//       tempErrors.password = "Password cannot be empty";
//     } else if (formData.password.length < 9) {
//       tempErrors.password = "Password must be at least 9 characters";
//     }

//     setErrors(tempErrors);
//     return Object.keys(tempErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await fetch("http://localhost:5000/api/auths/login", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         setErrors({ general: data.error || "Something went wrong." });
//         return;
//       }
//       console.log(data);

//       setUser(data.data);
//       localStorage.setItem("user", JSON.stringify(data.data));
//       localStorage.setItem("token", data.token);

//       if (data.data.role === "patient") {
//         navigate("/patient");
//       } else if (data.data.role === "admin") {
//         navigate("/admin");
//       } else if (data.data.role === "doctor") {
//         navigate("/doctor");
//       }
//       setSuccess("User created successfully!");
//       // setFormData({
//       //   email: "",
//       //   password: "",
//       // });
//     } catch (err) {
//       console.log("error: ", err);
//       setErrors({ general: "error Please try again later." });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-white to-pink-200 px-6">
//       <motion.form
//         onSubmit={handleSubmit}
//         className="w-full max-w-md bg-white/20 p-8 rounded-xl shadow-2xl backdrop-blur-md border border-white/30"
//         initial={{ opacity: 0, y: 30 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.6, ease: "easeOut" }}
//       >
//         <motion.h2
//           className="text-3xl font-extrabold text-purple-800 mb-6 text-center"
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.2 }}
//         >
//           Welcome Back
//         </motion.h2>

//         {/* Email Field */}
//         <InputField
//           label="Email"
//           type="email"
//           name="email"
//           value={formData.email}
//           onChange={handleChange}
//           placeholder="Enter your email"
//         />
//         {errors.email && (
//           <p className="text-red-500 text-sm mt-1">{errors.email}</p>
//         )}

//         {/* Password Field */}
//         <InputField
//           label="Password"
//           type="password"
//           name="password"
//           value={formData.password}
//           onChange={handleChange}
//           placeholder="Enter your password"
//         />
//         {errors.password && (
//           <p className="text-red-500 text-sm mt-1">{errors.password}</p>
//         )}

//         <motion.div
//           initial={{ opacity: 0, scale: 0.9 }}
//           animate={{ opacity: 1, scale: 1 }}
//           transition={{ delay: 0.3 }}
//           className="mt-4"
//         >
//           <Button text="Login" type="submit" />
//         </motion.div>

//         {/* Links Section */}
//         <div className="mt-6 text-center text-sm text-purple-700 space-y-2">
//           <Link to="/auths/forgot-password" className="hover:underline block">
//             Forgot password?
//           </Link>
//           <Link to="/auths/register" className="hover:underline block">
//             Don't have an account?{" "}
//             <span className="font-semibold">Sign up</span>
//           </Link>
//         </div>
//       </motion.form>
//     </div>
//   );
// };

// export default Login;
import { useContext, useState } from "react";
import { motion } from "framer-motion";
import InputField from "../../components/InputField";
import Button from "../../components/Button";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../api/context/AuthContext";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { setUser } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); 
  };

  const validateFields = () => {
    const newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(formData.email))
      newErrors.email = "Enter a valid email address";

    if (!formData.password.trim()) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    const fieldErrors = validateFields();
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auths/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ general: data.error || "Login failed" });
        return;
      }

      
      setUser(data.data);
      localStorage.setItem("user", JSON.stringify(data.data));
      localStorage.setItem("token", data.token);

      // Redirect based on user role
      if (data.data.role === "patient") {
        navigate("/patient");
      } else if (data.data.role === "doctor") {
        navigate("/Doctor");
      } else if (data.data.role === "admin") {
        navigate("/admin");
      }
    } catch (err) {
      console.error(err);
      setErrors({ general: "Server error. Try again later." });
    }
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
          transition={{ delay: 0.2 }}
        >
          Welcome Back
        </motion.h2>

        {errors.general && (
          <p className="text-red-600 text-sm mb-4">{errors.general}</p>
        )}

        <InputField
          label="Email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
        />
        {errors.email && (
          <p className="text-red-600 text-sm mt-1">{errors.email}</p>
        )}

        <InputField
          label="Password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="text-red-600 text-sm mt-1">{errors.password}</p>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-4"
        >
          <Button text="Login" type="submit" />
        </motion.div>

      
        <div className="mt-6 text-center text-sm text-purple-700 space-y-2">
          <Link to="/auths/forgot-password" className="hover:underline block">
            Forgot password?
          </Link>
          <Link to="/auths/register" className="hover:underline block">
            Don't have an account? <span className="font-semibold">Sign up</span>
          </Link>
        </div>
      </motion.form>
    </div>
  );
};

export default Login;
