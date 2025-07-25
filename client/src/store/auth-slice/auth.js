// src/features/auth/authSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// 👇 Ensure this points to your backend
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const initialState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null,

  usersByRole: [], // 👈 new
  usersLoading: false,
  usersError: null,
};

// ==========================================
// ✅ Register User
// ==========================================
export const registerUser = createAsyncThunk(
  "auth/register",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/register`,
        formData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Registration failed" }
      );
    }
  }
);

export const getUsersByRole = createAsyncThunk(
  "auth/getUsersByRole",
  async (role, thunkAPI) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/auth/users/role/${role}`,
        {
          withCredentials: true,
        }
      );
      return response.data.data; // because controller returns { success, data }
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Failed to fetch users" }
      );
    }
  }
);

// ==========================================
// ✅ Login User
// ==========================================
export const loginUser = createAsyncThunk(
  "auth/login",
  async (formData, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/login`,
        formData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Login failed" }
      );
    }
  }
);

// ==========================================
// ✅ Logout User
// ==========================================
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, thunkAPI) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/api/auth/logout`,
        {},
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Logout failed" }
      );
    }
  }
);

export const deleteUser = createAsyncThunk(
  "auth/deleteUser",
  async (userId, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${BASE_URL}/api/auth/delete/${userId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Delete user failed" }
      );
    }
  }
);
    
export const editUser = createAsyncThunk(
  "auth/editUser",
  async ({ userId, updatedData }, thunkAPI) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/api/auth/edit/${userId}`,
        updatedData, // send all updated fields
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Edit user failed" }
      );
    }
  }
);


// ==========================================
// ✅ Check Auth (Token Middleware Check)
// ==========================================
export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/auth/check-auth`, {
        withCredentials: true,
        headers: {
          "Cache-Control": "no-store", // Optional: prevent cache issues
        },
      });
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || { message: "Auth check failed" }
      );
    }
  }
);

// ==========================================
// ✅ Auth Slice
// ==========================================
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message;
      })

      .addCase(getUsersByRole.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(getUsersByRole.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.usersByRole = action.payload;
      })
      .addCase(getUsersByRole.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersByRole = [];
        state.usersError = action.payload?.message;
      })

      .addCase(editUser.pending, (state) => {
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(editUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        const updatedUser = action.payload.data;
        state.usersByRole = state.usersByRole.map((user) =>
          user._id === updatedUser._id ? updatedUser : user
        );
      })
      .addCase(editUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload?.message;
      })

      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message;
      })

      // Check Auth
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = action.payload?.message;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      .addCase(logoutUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })

      .addCase(deleteUser.pending, (state) => { 
        state.usersLoading = true;
        state.usersError = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.usersLoading = false;
        state.usersByRole = state.usersByRole.filter(
          (user) => user._id !== action.payload._id
        );
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.usersLoading = false;
        state.usersError = action.payload?.message;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
