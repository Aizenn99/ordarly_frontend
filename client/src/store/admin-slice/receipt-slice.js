// src/store/admin/receiptSettingsSlice.js

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

const initialState = {
  isLoading: false,
  error: null,
  // single singleton object
  data: {
    header: "",
    businessNumber: "",
    address: "",
    footer: "",
    isActive: true,
  },
};

// ─────────────────────────────
// 🟢 Fetch Receipt Settings
// ─────────────────────────────
export const fetchReceiptSettings = createAsyncThunk(
  "receiptSettings/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_BASE}/receipt`, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─────────────────────────────
// 🟢 Create Receipt Settings
// ─────────────────────────────
export const createReceiptSettings = createAsyncThunk(
  "receiptSettings/create",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_BASE}/receipt`, formData, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─────────────────────────────
// 🟢 Update Receipt Settings
// ─────────────────────────────
export const updateReceiptSettings = createAsyncThunk(
  "receiptSettings/update",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_BASE}/receipt`, formData, {
        withCredentials: true,
      });
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ─────────────────────────────
// 🟢 Delete a Single Field
// ─────────────────────────────
export const deleteReceiptField = createAsyncThunk(
  "receiptSettings/deleteField",
  async (fieldName, { rejectWithValue }) => {
    try {
      const response = await axios.delete(
        `${API_BASE}/receipt/${fieldName}`,
        { withCredentials: true }
      );
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const receiptSettingsSlice = createSlice({
  name: "receiptSettings",
  initialState,
  reducers: {
    // you can add synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      // ─ Fetch ─────────────────────────────────
      .addCase(fetchReceiptSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReceiptSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(fetchReceiptSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ─ Create ────────────────────────────────
      .addCase(createReceiptSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createReceiptSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(createReceiptSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ─ Update ────────────────────────────────
      .addCase(updateReceiptSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateReceiptSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(updateReceiptSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // ─ Delete Field ──────────────────────────
      .addCase(deleteReceiptField.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteReceiptField.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
      })
      .addCase(deleteReceiptField.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default receiptSettingsSlice.reducer;
