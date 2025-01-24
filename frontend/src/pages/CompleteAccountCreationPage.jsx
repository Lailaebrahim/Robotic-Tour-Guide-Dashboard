import { motion } from "framer-motion";
import Input from "../components/Input";
import { User, Lock, Image, Loader } from "lucide-react";
import { useState } from "react";
import userAuthStore from "../store/authStore";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";
import { useNavigate, useLocation } from "react-router-dom";
import { tokens } from "../theme";
import { useTheme } from "@mui/material";
import toast from "react-hot-toast";

const CompleteAccountCreationPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState(new File([], ""));
  const { isLoading, error, completeAccountCreation } = userAuthStore();
  const [confirmed, setConfirmed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handlePasswordConfirmation = async (e) => {
    if (e.target.value != password) {
      setConfirmed(false);
    } else {
      setConfirmed(true);
    }
  };

  const handleAccountCompletion = async (e) => {
    e.preventDefault();
    try {
      const res = await completeAccountCreation(
        firstName,
        lastName,
        password,
        profilePicture,
        token
      );
      if (res instanceof Error) {
        throw new Error(res.message);
      }
      navigate("/login");
      toast.success("Account Created Successfully! You can login now.");
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`max-w-2xl w-full bg-sky-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden `}
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text">
            Complete Account Creation
          </h2>
          <form
            onSubmit={handleAccountCompletion}
            className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2"
          >
            <div className="flex flex-col ">
              <Input
                icon={User}
                type="text"
                placeholder="First Name"
                value={firstName}
                required
                onChange={(e) => setFirstName(e.target.value)}
              />
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
                required
                onChange={(e) => setLastName(e.target.value)}
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
            <div className="col-span-2 mb-2">
              <PasswordStrengthMeter password={password} />
            </div>
            <div className="col-span-2 text-center">
              <Input
                icon={Image}
                type="file"
                placeholder="Your Profile Picture"
                onChange={(e) => setProfilePicture(e.target.files[0])}
              />
            </div>
            {error && (
              <div className="col-span-2">
                <p className="text-red-500 text-center text-sm">{error}</p>
              </div>
            )}

            <div className="col-span-2">
              <motion.button
                className="mt-5 w-full py-3 px-4 bg-gradient-to-r from-sky-500 to-sky-800 
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
                  "Complete"
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default CompleteAccountCreationPage;
