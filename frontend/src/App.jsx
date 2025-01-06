import { Route, Routes, Navigate } from "react-router-dom";
import LogInPage from "./pages/LogInPage";
import ToursPage from "./pages/ToursPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import CompleteAccountCreationPage from "./pages/CompleteAccountCreationPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import TeamPage from "./pages/TeamPage";
import RobotStatusPage from "./pages/RobotStatusPage.jsx";
import CalenderPage from "./pages/CalenderPage.jsx";
import { ColorModeContext, useMode } from "./theme";
import { CssBaseline, ThemeProvider } from "@mui/material";
import Dashboard from "./pages/DashboardPage.jsx";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import userAuthStore from "./store/authStore.js";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";
import PropTypes from "prop-types";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = userAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (user.status != "active") {
    return <Navigate to="/complete-account-creation" replace />;
  }
  return children;
};
ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

const RedirectAuthenticated = ({ children }) => {
  const { isAuthenticated, user } = userAuthStore();

  if (isAuthenticated && user.status == "active" && user.role != "user") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
RedirectAuthenticated.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  const [theme, colorMode] = useMode();

  const { isCheckingAuth, checkAuth } = userAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth) {
    return (
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <div className="min-h-screen flex relative justify-center items-center">
            <Loader className=" animate-spin mx-auto" size={48} />
          </div>
        </ThemeProvider>
      </ColorModeContext.Provider>
    );
  }
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        {/* One Routes wrapper to handle all routes */}
        <Routes>
          <Route
            path="/login"
            element={
              <RedirectAuthenticated>
                <LogInPage />
              </RedirectAuthenticated>
            }
          />
          <Route
            path="/verify-email"
            element={
              <RedirectAuthenticated>
                <VerifyEmailPage />
              </RedirectAuthenticated>
            }
          />
          <Route
            path="/complete-account-creation"
            element={
              <RedirectAuthenticated>
                <CompleteAccountCreationPage />
              </RedirectAuthenticated>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <RedirectAuthenticated>
                <ForgotPasswordPage />
              </RedirectAuthenticated>
            }
          />
          <Route
            path="/reset-password"
            element={
              <RedirectAuthenticated>
                <ResetPasswordPage />
              </RedirectAuthenticated>
            }
          />

          {/* Dashboard route */}
          <Route
            path="/dashboard/*"
            element={
              <div className="max-h-screen w-full flex relative">
                <Sidebar className="fixed h-full" />
                <main className="flex-1 max-h-screen overflow-auto">
                  <Topbar />
                  <Routes>
                    <Route
                      path=""
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="team"
                      element={
                        <ProtectedRoute>
                          <TeamPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="tours"
                      element={
                        <ProtectedRoute>
                          <ToursPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="robot-status"
                      element={
                        <ProtectedRoute>
                          <RobotStatusPage />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="calendar"
                      element={
                        <ProtectedRoute>
                          <CalenderPage />
                        </ProtectedRoute>
                      }
                    />
                  </Routes>
                </main>
              </div>
            }
          />
        </Routes>
        <Toaster />
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
