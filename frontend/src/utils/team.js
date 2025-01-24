import axios from "axios";
const API_URL = "http://localhost:5000/api/admin";

axios.defaults.withCredentials = true;

export const getTeam = async (page, limit) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("No access token found");
    }
    
    const response = await axios.get(`${API_URL}/team`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: { page, limit }
    });
    
    return response.data.data.team;
  } catch (err) {
    throw new Error(err.response?.data?.data?.message || err.message);
  }
};

export const createTeamMember = async (username, email, role) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("unauthorized");
    }  
    const response = await axios.post(`${API_URL}/create-member`, {
      username,
      email,
      role,
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.message;
  } catch (err) {
    throw new Error(err.response?.data?.data?.message || err.message);
  }
};

export const giveControl = async (userId) => {
  try {
    const token = localStorage.getItem("accessToken");
    console.log(token);
    if (!token) {
      throw new Error("No access token found");
    }
    const response = await axios.patch(`${API_URL}/give-control/${userId}`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.message;
  } catch (err) {
    throw new Error(err.response?.data?.data?.message || err.message);
  }
}

export const revokeControl = async (userId) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("unauthorized");
    }
    const response = await axios.patch(`${API_URL}/revoke-control/${userId}`,{}, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.message;
  } catch (err) {
    throw new Error(err.response?.data?.data?.message || err.message);
  }
}

export const deleteMember = async (userId) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("unauthorized");
    }
    const response = await axios.delete(`${API_URL}/member/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.message;
  } catch (err) {
    throw new Error(err.response?.data?.data?.message || err.message);
  }
}

export const updateMember = async (userId, username, email) => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("unauthorized");
    }
    const response = await axios.patch(`${API_URL}/member/${userId}`, { email, username
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data.message;
  } catch (err) {
    throw new Error(err.response?.data?.data?.message || err.message);
  }
}