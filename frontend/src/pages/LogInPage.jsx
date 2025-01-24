import React, { useState } from "react";
import { motion } from "framer-motion";
import Input from "../components/Input";
import { User, Lock, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import userAuthStore from "../store/authStore";

const LogInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { isLoading, error, login } = userAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      if (res instanceof Error) {
        throw new Error(res.message);
      }
      navigate("/dashboard/robot-status");
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-sky-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden "
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text">
            Welcome Back
          </h2>
          <form onSubmit={handleLogin}>
            <Input
              icon={User}
              type="text"
              placeholder="Your Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="justify-center"
            />
            <Input
              icon={Lock}
              type="password"
              placeholder="Your Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <Link className="hover:underline" to={"/forgot-password"}>
              Forget Your Password ?
            </Link>
            {error && (
              <p className="text-red-500 font-semibold mt-2 text-center">
                {error}
              </p>
            )}
            <motion.button
              className="mt-8 w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-sky-800 
            font-bold rounded-lg shadow-lg hover:from-sky-600
            hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
             focus:ring-offset-gray-900 transition duration-200"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
            >
              {isLoading ? (
                <Loader className=" animate-spin mx-auto" size={24} />
              ) : (
                "login"
              )}
            </motion.button>
          </form>
        </div>
        {/* <div className="px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center">
          <p className="text-sm text-grey-400">
            Don't have an account ? {"    "}
            <Link to={"/signup"} className="text-green-400 hover:underline ">
              Sign Up Here!
            </Link>
          </p>
        </div> */}
      </motion.div>
    </div>
  );
};

export default LogInPage;
