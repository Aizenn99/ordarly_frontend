import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// 👇 Thunk to fetch metrics
export const fetchDashboardMetrics = createAsyncThunk(
  "dashboard/fetchMetrics",
  async ({ startDate, endDate }, thunkAPI) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/dashboard/metrics`, {
        params: { startDate, endDate }, // ✅ Automatically encoded
      });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch metrics", error);
      return thunkAPI.rejectWithValue(error.response?.data?.error || "Unknown error");
    }
  }
);

// 🧾 Initial state
const initialState = {
  metrics: null,
  isLoading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMetrics.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMetrics.fulfilled, (state, action) => {
        state.isLoading = false;
        state.metrics = action.payload;
      })
      .addCase(fetchDashboardMetrics.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
