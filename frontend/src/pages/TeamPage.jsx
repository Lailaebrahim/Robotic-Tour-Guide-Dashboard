import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, useTheme, IconButton } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  DeleteIcon,
  EditIcon,
  UnlockIcon,
  LockIcon,
  User,
  Lock,
  Mail,
  Loader,
} from "lucide-react";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import TourIcon from "@mui/icons-material/Tour";
import RobotIcon from "@mui/icons-material/SmartToyOutlined";
import { tokens } from "../theme";
import Header from "../components/header";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";
import ProfileCard from "../components/ProfileCard";
import Popup from "../components/PopUp";
import userAuthStore from "../store/authStore";
import {
  getTeam,
  createTeamMember,
  giveControl,
  revokeControl,
  deleteMember,
  updateMember,
} from "../utils/team";
import { userRoles } from "../../../backend/utils/userRolesPermissions";

const TeamPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [teamData, setTeamData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const { user, isAuthenticated, checkAuth } = userAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      try {
        checkAuth();
      } catch (err) {
        console.error("Error in checkAuth:", err);
        navigate("/login");
      }
    }
  }, [isAuthenticated, user, navigate]);

  const columns = [
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      renderCell: (params) => {
        const { row } = params;
        const { firstName, lastName } = row;
        return (
          <Popup
            content={<ProfileCard user={row} />}
            position="top"
            trigger="click"
          >
            <Typography>
              {firstName} {lastName}
            </Typography>
          </Popup>
        );
      },
    },
    {
      field: "username",
      headerName: "User Name",
      flex: 1,
      cellClassName: "name-column--cell",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
    },
    {
      field: "role",
      headerName: "Role",
      flex: 1,
      renderCell: ({ row: { role } }) => {
        return (
          <Box
            m="auto"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p="5px"
            width="70%"
            backgroundColor={
              role === "robotOperator"
                ? colors.greenAccent[600]
                : role === "tourManager"
                ? colors.greenAccent[700]
                : colors.greenAccent[700]
            }
            borderRadius="4px"
          >
            {role === "robotOperator" && <RobotIcon />}
            {role === "tourManager" && <TourIcon />}
            {role === "user" && <LockOpenOutlinedIcon />}
            <Typography color={colors.grey[100]} sx={{ ml: "5px" }}>
              {role}
            </Typography>
          </Box>
        );
      },
    },
  ];

  const handleRevokeControl = async (e, id) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await revokeControl(id);
      toast.success("Control Revoked Successfully");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleGiveControl = async (e, id) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await giveControl(id);
      toast.success("Control Given Successfully");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleDeleteMember = async (e, id) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await deleteMember(id);
      toast.success("Member Deleted Successfully");
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleUpdateMember = async (e, id) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log(id, username, email);
      const res = await updateMember(id, username, email);
      toast.success(res);
      setIsUpdateModalOpen(false);
      await fetchData();
      setUsername("");
      setEmail("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (user && user.role === userRoles.ADMIN) {
    columns.push({
      field: "actions",
      headerName: "",
      flex: 1,
      renderCell: ({ row }) => {
        return (
          <Box display="flex" width="100%">
            <IconButton
              width="30%"
              onClick={(e) => {
                handleDeleteMember(e, row._id);
              }}
            >
              <DeleteIcon style={{ color: "red" }} />
            </IconButton>
            <IconButton
              width="30%"
              onClick={() => {
                setIsUpdateModalOpen(true);
                setSelectedMember(row);
              }}
            >
              <EditIcon />
            </IconButton>
            {row.role === "robotOperator" &&
              (row.hasControl ? (
                <IconButton
                  onClick={(e) => {
                    handleRevokeControl(e, row._id);
                  }}
                  title="Have Control"
                >
                  <LockIcon />
                </IconButton>
              ) : (
                <IconButton
                  onClick={(e) => handleGiveControl(e, row._id)}
                  title="Don't Have Control"
                >
                  <UnlockIcon />
                </IconButton>
              ))}
          </Box>
        );
      },
    });
  }

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const team = await getTeam(1, 10);
      setTeamData(Array.isArray(team) ? team : []); // Ensure team is an array
    } catch (err) {
      console.error("Error in fetchData:", err);
      setError(err.message);
      setTeamData([]); // Reset team data on error
      if (err.message === "unauthorized") {
        navigate("/login");
      }
      if (err.message === "TokenExpiredError") {
        checkAuth();
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const handleAddMember = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createTeamMember(username, email, role);
      setUsername("");
      setEmail("");
      setRole("");
      setIsCreateModalOpen(false);
      toast.success("Member Added Successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box m="auto" maxWidth={"90%"}>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Header title="Your Team" subtitle=""></Header>
        {user && user.role === userRoles.ADMIN ? (
          <motion.button
            className="mt-8 w-fit-content py-3 px-4 bg-gradient-to-r from-sky-500 to-sky-800 
            font-bold rounded-lg shadow-lg hover:from-sky-600
            hover:to-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
             focus:ring-offset-gray-900 transition duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            onClick={() => setIsCreateModalOpen(true)}
          >
            Add A New Member
          </motion.button>
        ) : null}
      </Box>
      <Box m="10px 0 0 0" height="75vh">
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Add A New Member To Your Team"
        >
          <form onSubmit={(e) => handleAddMember(e)}>
            <Input
              icon={User}
              type="text"
              placeholder="Username"
              value={username}
              required
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              icon={Mail}
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <Select
              icon={Lock}
              value={role}
              onChange={(e) => setRole(e.target.value)}
              options={[
                { value: "robotOperator", label: "Robot Operator" },
                { value: "tourManager", label: "Tour Manager" },
              ]}
              required
            />
            {error && (
              <div className="col-span-2">
                <p className="text-red-500 text-center text-sm">{error}</p>
              </div>
            )}
            <motion.button
              className=" w-fit-content py-3 px-8 bg-gradient-to-r from-sky-500 to-sky-800 
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
                "Add"
              )}
            </motion.button>
          </form>
        </Modal>
        <Modal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title="Add A New Member To Your Team"
        >
          <form onSubmit={(e) => handleUpdateMember(e, selectedMember._id)}>
            <Input
              icon={User}
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <Input
              icon={Mail}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {error && (
              <div className="col-span-2">
                <p className="text-red-500 text-center text-sm">{error}</p>
              </div>
            )}
            <motion.button
              className=" w-fit-content py-3 px-8 bg-gradient-to-r from-sky-500 to-sky-800 
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
                "Update"
              )}
            </motion.button>
          </form>
        </Modal>
        <DataGrid
          getRowId={(row) => row._id}
          sx={{
            border: "none",
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            },
            "& .MuiDataGrid-container--top": {
              // override this css property to be able to add blue background color to the header of grid
              "--DataGrid-containerBackground": "transparent !important",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-toolbarContainer .MuiButtonBase-root": {
              color: `${colors.grey[100]} !important`,
            },
          }}
          rows={teamData}
          columns={columns}
          pageSize={10}
          loading={isLoading}
          slots={{ toolbar: GridToolbar }}
        />
      </Box>
    </Box>
  );
};
export default TeamPage;
