import {create} from "zustand";
import { userRoles } from "../../../backend/utils/userRolesPermissions";
import axios from "axios";
const API_URL = "http://localhost:5000/api/auth";

axios.defaults.withCredentials = true;

const userAuthStore = create((set) => ({
	user: null,
	isAuthenticated: false,
	error: null,
	isLoading: false,
	isCheckingAuth: true,

    signUp: async (firstName, lastName, email, password, confirmPassword,username, profile) => {
        set({isLoading: true});
        try {
            const response = await axios.post(`${API_URL}/signup`, {firstName, lastName, email, password,confirmPassword, username, profile, role: userRoles.USER});
            set({ user: response.data.user, error:null, isLoading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
           set({user: null, error: errorMessage, isLoading: false});
           return new Error(errorMessage);
        }
    },    

    verifyEmail: async (verificationToken) => {
        set({isLoading: true});
        try {
            const response = await axios.post(`${API_URL}/verify-email`, { verificationToken });
            set({ user: response.data.user, error:null, isLoading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
           set({user: null, error: errorMessage, isLoading: false});
           return new Error(errorMessage);
        }
    },

    login: async (email, password) => {
        set({ isLoading: true});
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });
            set({ user: response.data.data.user, error:null, isLoading: false, isAuthenticated: true});
            localStorage.setItem('accessToken', response.data.data.accessToken);
        } catch (error) {
            const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
           set({user: null, error: error.message, isLoading: false, isAuthenticated: false});
           return new Error(errorMessage);
        }
    },

    completeAccountCreation: async (firstName, lastName, password, profile, token) => {
        set({ isLoading: true});
        try {
            const formData = new FormData();
            formData.append('firstName', firstName);
            formData.append('lastName', lastName);
            formData.append('password', password);
            formData.append('profile', profile);

            const response = await axios.post(`${API_URL}/complete-registration/${token}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            set({ user: response.data.user, error:null, isLoading: false });
        } catch (error) {
            const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
           set({user: null, error: errorMessage, isLoading: false});
           return new Error(errorMessage);
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, isLoading: true});
        try {
            const token = localStorage.getItem('accessToken');
            console.log("checking auth")
            const response = await axios.get(`${API_URL}/check-auth`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            set({ user: response.data.data.user, isAuthenticated: true, isCheckingAuth: false , isLoading: false});
            console.log("authorized")
        } catch (error) {
            const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
            console.log(errorMessage);
            if (errorMessage === 'TokenExpiredError'){
                try {
                    const response = await axios.get(`${API_URL}/refresh-token`);
                    set({ user: response.data.data.user, isAuthenticated: true, isCheckingAuth: false, isLoading: false });
                    console.log("refreshed token");
                    localStorage.setItem('accessToken', response.data.data.accessToken);
                    return
                } catch (error) {
                    const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
                    set({ user: null, isAuthenticated: false, isCheckingAuth: false, isLoading: false });
                    return new Error(errorMessage);
                }
            }
            set({ user: null, isAuthenticated: false, isCheckingAuth: false, isLoading: false });
            return new Error(errorMessage);
        }
    },

    logout: async () => {
        set({isLoading: true, error: null});
        try {
            const token = localStorage.getItem('accessToken');
            await axios.get(`${API_URL}/logout`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            set({ user: null, isAuthenticated: false, isLoading: false });
            localStorage.removeItem('accessToken');
        } catch (error) {
            const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
            set({ user: null, error: errorMessage, isLoading: false });
            return new Error(error.message);
        }
    },

    forgotPassword: async(email) => {
      set({isLoading: true, error: null});
      try {
        await axios.post(`${API_URL}/forgot-password`, {email});
        set({isLoading: false});
      } catch(error){
        const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
        return new Error(errorMessage);
      }
    },

    resetPassword: async(token, password) => {
      set({isLoading: true, error: null});
      try {
        await axios.post(`${API_URL}/reset-password/${token}`, {password});
        set({isLoading: false});
      } catch(error){
        const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
        set({error: errorMessage, isLoading: false});
        return new Error(errorMessage);
      }
    }

}));

export default userAuthStore;