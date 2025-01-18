import {create} from "zustand";
import axios from "axios";
import moment from 'moment-timezone';
const API_URL = "http://localhost:5000/api";

axios.defaults.withCredentials = true;

const tourStore = create((set) => ({
    tours: [],
    isLoading: false,
    error: null,
    getTours: async (start, end) => {
        set({isLoading: true, error: null, tours: []});
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.get(`${API_URL}/tours`, {
                params: {
                  start: start,
                  end: end,
                },
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              const events = response.data.data.tours.map(event => ({
                ...event,
                start: moment.tz(event.start, 'UTC').tz('Africa/Cairo').format(),
                end: moment.tz(event.end, 'UTC').tz('Africa/Cairo').format(),
              }));
            set({tours: events, error: null, isLoading: false});
        } catch (error) {
            const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
            set({tours: [], error: errorMessage, isLoading: false});
            return new Error(errorMessage);
        }
    },
    createTour: async (tourData) => {
        set({isLoading: true, error: null});
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.post(`${API_URL}/tours`, tourData, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
            const newTour = {
                ...response.data.data.tour,
                start: moment.tz(response.data.data.tour.start, 'UTC').tz('Africa/Cairo').format(),
                end: moment.tz(response.data.data.tour.end, 'UTC').tz('Africa/Cairo').format(),
            };
            set((state) => ({tours: [...state.tours, newTour], error: null, isLoading: false}));
        } catch (error) {
            const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
            set({error: errorMessage, isLoading: false});
            return new Error(errorMessage);
        }
    },
    updateTour: async (tourId, tourData) => {
        set({isLoading: true, error: null});
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.patch(`${API_URL}/tours/${tourId}`, tourData, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              const newTour = {
                ...response.data.data.tour,
                start: moment.tz(response.data.data.tour.start, 'UTC').tz('Africa/Cairo').format(),
                end: moment.tz(response.data.data.tour.end, 'UTC').tz('Africa/Cairo').format(),
            };
            set((state) => ({
                tours: state.tours.map((tour) =>
                    tour.id === tourId ?  newTour : tour
                ),
                error: null,
                isLoading: false
            }));
        } catch (error) {
            const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
            set({error: errorMessage, isLoading: false});
            return new Error(errorMessage);
        }
    },
    deleteTour: async (tourId) => {
        set({isLoading: true});
        try {
            const accessToken = localStorage.getItem('accessToken');
            await axios.delete(`${API_URL}/tours/${tourId}`,{
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
            set((state) => {
                const events = state.tours.filter((tour) => tour.id !== tourId);
                return {tours: events, error: null, isLoading: false};
            });
        } catch (error) {
            console.log(error.message);
            const errorMessage = error.response?.data?.data?.message || 'Internal Server Error';
            set({error: errorMessage, isLoading: false});
            return new Error(errorMessage);
        }
    },
    generateTourAudio: async (tourId) => {
        set({isLoading: true, error: null});
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await axios.patch(`${API_URL}/tours/${tourId}/generate-audio`, {}, {
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
              const updatedTour = {
                ...response.data.data.tour,
                start: moment.tz(response.data.data.tour.start, 'UTC').tz('Africa/Cairo').format(),
                end: moment.tz(response.data.data.tour.end, 'UTC').tz('Africa/Cairo').format(),
            };
            set((state) => ({
                tours: state.tours.map((tour) =>
                    tour.id === tourId ?  updatedTour : tour
                ),
                error: null,
                isLoading: false
            }));
        } catch (error) {
            console.log(error);
            const errorMessage = error.response.data.message || error.message || 'Internal Server Error';
            set({error: errorMessage, isLoading: false});
            throw new Error(errorMessage);
        }
    },
}));

export default tourStore;