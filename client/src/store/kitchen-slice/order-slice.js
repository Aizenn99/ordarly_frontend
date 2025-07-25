import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  orders: [],
  isLoading: false,
  error: null,
};

// ✅ 1. Send new KOT
export const sendToKitchen = createAsyncThunk(
  "kitchen/sendToKitchen",
  async (orderData, thunkAPI) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/kitchen/send`,
        orderData
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to send order"
      );
    }
  }
);

// ✅ 2. Mark cart items as sent to kitchen
export const markItemsAsSentToKitchen = createAsyncThunk(
  "cart/markItemsAsSentToKitchen",
  async (tableName, thunkAPI) => {
    try {
      console.log("Calling API for table:", tableName); // 🪵 debug log

      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/kitchen/cart/${tableName}/kot-sent`
      );
      return response.data;
    } catch (error) {
      console.error("Error in markItemsAsSentToKitchen:", error); // 🪵 debug log
      return thunkAPI.rejectWithValue(
        error.response?.data?.error || "Failed to mark items as sent"
      );
    }
  }
);


// ✅ 3. Fetch all active kitchen orders
export const fetchKitchenOrders = createAsyncThunk(
  "kitchen/fetchKitchenOrders",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/kitchen/orders`);
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to fetch orders"
      );
    }
  }
);

// ✅ 4. Update KOT status
export const updateKOTStatus = createAsyncThunk(
  "kitchen/updateKOTStatus",
  async ({ kotNumber, status }, thunkAPI) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/kitchen/${kotNumber}/status`,
        { status }
      );
      return res.data;
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.error || "Failed to update order"
      );
    }
  }
);

const kitchenOrderSlice = createSlice({
  name: "kitchen",
  initialState,
  reducers: {
    clearKitchenOrders: (state) => {
      state.orders = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 🔄 Send to Kitchen
    builder
      .addCase(sendToKitchen.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendToKitchen.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders.unshift(action.payload);
      })
      .addCase(sendToKitchen.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // 🔄 Fetch Kitchen Orders
    builder
      .addCase(fetchKitchenOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchKitchenOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload;
      })
      .addCase(fetchKitchenOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // 🔄 Update KOT Status
    builder
      .addCase(updateKOTStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateKOTStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.orders.findIndex(
          (order) => order.kotNumber === action.payload.kotNumber
        );
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateKOTStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // 🔄 Mark Items as Sent
    builder
      .addCase(markItemsAsSentToKitchen.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(markItemsAsSentToKitchen.fulfilled, (state) => {
        state.isLoading = false;
        // No changes needed in orders — it updates the cart
      })
      .addCase(markItemsAsSentToKitchen.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearKitchenOrders } = kitchenOrderSlice.actions;

export default kitchenOrderSlice.reducer;
