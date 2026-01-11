import { create } from 'zustand';
import { disasterAPI } from '../api/client';

export const useDisasterStore = create((set, get) => ({
  events: [],
  selectedEvent: null,
  funds: [],
  loading: false,
  error: null,

  // Events
  fetchEvents: async (page = 1) => {
    set({ loading: true, error: null });
    try {
      const response = await disasterAPI.listEvents(page);
      set({ events: response.data.events });
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  getEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const response = await disasterAPI.getEvent(eventId);
      set({ selectedEvent: response.data });
      return response.data;
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  createEvent: async (formData) => {
    set({ loading: true, error: null });
    try {
      const response = await disasterAPI.createEvent(formData);
      set((state) => ({
        events: [response.data, ...state.events],
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  verifyEvent: async (eventId) => {
    set({ loading: true, error: null });
    try {
      const response = await disasterAPI.verifyEvent(eventId);
      set((state) => ({
        events: state.events.map((e) =>
          e.id === eventId ? { ...e, is_verified: true } : e
        ),
      }));
      return response.data;
    } catch (error) {
      set({ error: error.message });
    } finally {
      set({ loading: false });
    }
  },

  // Funds
  createFund: async (data) => {
    set({ loading: true, error: null });
    try {
      const response = await disasterAPI.createFund(data);
      return response.data;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

export const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem('authToken'),
  isAuthenticated: !!localStorage.getItem('authToken'),

  login: (user, token) => {
    localStorage.setItem('authToken', token);
    set({ user, token, isAuthenticated: true });
  },

  logout: () => {
    localStorage.removeItem('authToken');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
