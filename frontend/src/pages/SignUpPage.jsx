import { motion } from "framer-motion";
import Input from "../components/Input";
import { User, Lock, Mail, Image, Calendar, Loader } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import userAuthStore from "../store/authStore";

const SignUpPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [confirmed, setConfirmed] = useState(true);
  const navigate = useNavigate();
  const { signUp, isLoading, error } = userAuthStore();

  const handlePasswordConfirmation = async (e) => {
    if (e.target.value != password) {
      setConfirmed(false);
    } else {
      setConfirmed(true);
    }
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const res = await signUp(
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        username,
        profilePicture
      );
      if (res instanceof Error) {
        throw new Error(res.message);
      }
      navigate("/verify-email");
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
        className="max-w-2xl w-full bg-sky-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden  mb-8 mt-8"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text">
            Create Account
          </h2>
          <form
            onSubmit={handleSignUp}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2"
          >
            <div className="flex flex-col ">
              <Input
                icon={User}
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <Input
                icon={User}
                type="text"
                placeholder="Your Username"
                value={username}
                required
                onChange={(e) => setUserName(e.target.value)}
              />
              <Input icon={Calendar} type="date" placeholder="Date of Birth" />
              <Input
                icon={Lock}
                type="password"
                placeholder="Your Password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <Input
                icon={User}
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
              <Input
                icon={Mail}
                type="email"
                placeholder="Your Email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                icon={Image}
                type="file"
                placeholder="Your Profile Picture"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
              />
              <Input
                icon={Lock}
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  handlePasswordConfirmation(e);
                }}
              />
            </div>
            {!confirmed && (
              <div className="col-span-2 mb-2 text-center">
                <p className="text-red-500 font-semibold mt-2 text-center">
                  Passwords Don't Match
                </p>
              </div>
            )}
            {error && (
              <div className="col-span-2 mb-2 text-center">
                <p className="text-red-500 font-semibold mt-2  break-words">
                  {error}
                </p>
              </div>
            )}
            <div className="col-span-2 mb-2">
              <PasswordStrengthMeter password={password} />
            </div>
            <div className="col-span-2 text-center">
              <motion.button
                className="mt-8 w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-sky-800 
            font-bold rounded-lg shadow-lg hover:from-sky-600
            hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
             focus:ring-offset-gray-900 transition duration-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className=" animate-spin mx-auto" size={24} />
                ) : (
                  "Sign Up"
                )}
              </motion.button>
            </div>
          </form>
        </div>
        <div className="px-8 py-4 bg-sky-900 bg-opacity-50 flex justify-center">
          <p className="text-sm text-grey-400">
            Already have an account {"    "}
            <Link to={"/login"} className="text-green-400 hover:underline ">
              Login Here!
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
