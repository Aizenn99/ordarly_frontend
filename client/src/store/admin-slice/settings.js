import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API_BASE = `${import.meta.env.VITE_API_URL}/api/settings`;

// ✅ Initial State: settings stored by type
const initialState = {
  isLoading: false,
  error: null,
  TAX: [],
  DELIVERY: [],
  DISCOUNT: [],
  PACKAGE: [],
  SERVICE_CHARGE: [],
  RECEIPT: [],
};

// ✅ Fetch Settings by Type
export const fetchSettings = createAsyncThunk(
  "admin/fetch-settings",
  async (type) => {
    const response = await axios.get(`${API_BASE}/fetch-settings/${type}`, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return {
      type,
      settings: response.data.data, // return array of settings
    };
  }
);

// ✅ Add Setting
export const addSetting = createAsyncThunk(
  "admin/add-setting",
  async (formData) => {
    const response = await axios.post(`${API_BASE}/add-setting`, formData, {
      withCredentials: true,
    });
    return response.data.data; // return new setting object
  }
);

// ✅ Update Setting
export const updateSetting = createAsyncThunk(
  "admin/update-setting",
  async ({ id, formData }) => {
    const response = await axios.put(
      `${API_BASE}/update-setting/${id}`,
      formData,
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    return response.data.data;
  }
);

// ✅ Delete Setting
export const deleteSetting = createAsyncThunk(
  "admin/delete-setting",
  async (id) => {
    const response = await axios.delete(`${API_BASE}/delete-setting/${id}`, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return response.data.data;
  }
);

// ✅ Slice
export const settingsSlice = createSlice({
  name: "adminSettings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // 🔄 Fetch
      .addCase(fetchSettings.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        const { type, settings } = action.payload;
        if (type && Array.isArray(settings)) {
          state[type] = settings;
        }
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to fetch settings";
      })

      // ➕ Add
      .addCase(addSetting.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addSetting.fulfilled, (state, action) => {
        state.isLoading = false;
        const newSetting = action.payload;
        const type = newSetting.type;
        if (type && state[type]) {
          state[type].push(newSetting);
        }
      })
      .addCase(addSetting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to add setting";
      })

      // ✏️ Update
      .addCase(updateSetting.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        state.isLoading = false;
        const updated = action.payload;
        const type = updated.type;
        if (type && state[type]) {
          state[type] = state[type].map((s) =>
            s._id === updated._id ? updated : s
          );
        }
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to update setting";
      })

      // ❌ Delete
      .addCase(deleteSetting.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSetting.fulfilled, (state, action) => {
        state.isLoading = false;
        const deleted = action.payload;
        const type = deleted.type;
        if (type && state[type]) {
          state[type] = state[type].filter((s) => s._id !== deleted._id);
        }
      })
      .addCase(deleteSetting.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || "Failed to delete setting";
      });
  },
});

export default settingsSlice.reducer;
