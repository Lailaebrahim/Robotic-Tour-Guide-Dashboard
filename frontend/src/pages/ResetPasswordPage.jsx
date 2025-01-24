import { useState } from "react";
import { motion } from "framer-motion";
import userAuthStore from "../store/authStore";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../components/Input";
import { Lock } from "lucide-react";
import toast from "react-hot-toast";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { resetPassword, error, isLoading } = userAuthStore();
  const [confirmed, setConfirmed] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  const handlePasswordConfirmation = async (e) => {
    if (e.target.value != password) {
      setConfirmed(false);
    } else {
      setConfirmed(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!confirmed) {
      return;
    }
    try {
      const res = await resetPassword(token, password);
      if (res instanceof Error) {
        throw new Error(res.message);
      }
      toast.success(
        "Password reset successfully, redirecting to login page..."
      );
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Error resetting password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center bg-clip-text">
            Reset Password
          </h2>

          <form onSubmit={handleSubmit}>
            <Input
              icon={Lock}
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              icon={Lock}
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                handlePasswordConfirmation(e);
              }}
              required
            />

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

            {error && (
              <div className="col-span-2">
                <p className="text-red-500 text-center text-sm">{error}</p>
              </div>
            )}

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
              {isLoading ? "Resetting..." : "Set New Password"}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
export default ResetPasswordPage;
