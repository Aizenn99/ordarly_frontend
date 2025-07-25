import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API = import.meta.env.VITE_API_URL;

const initialState = {
  bills: [],
  selectedBill: null,
  isLoading: false,
  error: null,
};

// 1. Generate a new bill
export const generateBill = createAsyncThunk(
  "bill/generateBill",
  async (
    {
      tableName,
      spaceName,
      paymentMethod,
      overrides = {}, // Add overrides like { tax, discount } if needed
    },
    thunkAPI
  ) => {
    try {
      const res = await axios.post(
        `${API}/api/staff/bill/generate`,
        { tableName, spaceName, paymentMethod, ...overrides },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return res.data.bill;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data || "Bill generation failed"
      );
    }
  }
);

// 2. Get bills created by the logged-in staff
export const getAllBills = createAsyncThunk(
  "bill/getAllBills",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API}/api/staff/bills`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch staff bills");
    }
  }
);

// 3. Get all bills (admin)
export const getAllBillsAdmin = createAsyncThunk(
  "bill/getAllBillsAdmin",
  async (_, thunkAPI) => {
    try {
      const res = await axios.get(`${API}/api/staff/bills/admin`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch admin bills");
    }
  }
);

// 4. Get bill by number
export const getBillByNumber = createAsyncThunk(
  "bill/getBillByNumber",
  async (billNumber, thunkAPI) => {
    try {
      const res = await axios.get(`${API}/api/staff/bill/${billNumber}`, {
        withCredentials: true,
      });
      return res.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to fetch bill details");
    }
  }
);

// 5. Mark bill as paid
export const markBillAsPaid = createAsyncThunk(
  "bill/markBillAsPaid",
  async ({ billNumber, paymentMethod }, thunkAPI) => {
    try {
      const res = await axios.patch(
        `${API}/api/staff/bill/mark-paid/${billNumber}`,
        { paymentMethod },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );
      return res.data.bill;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to mark bill as paid");
    }
  }
);

// 6. Delete a bill
export const deleteBill = createAsyncThunk(
  "bill/deleteBill",
  async (billNumber, thunkAPI) => {
    try {
      await axios.delete(`${API}/api/staff/bill/${billNumber}`, {
        withCredentials: true,
      });
      return billNumber;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data || "Failed to delete bill");
    }
  }
);

// =============================
// ✅ Slice
// =============================
const staffBillSlice = createSlice({
  name: "bill",
  initialState,
  reducers: {
    clearSelectedBill(state) {
      state.selectedBill = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔄 Generate
      .addCase(generateBill.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateBill.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bills.unshift(action.payload);
      })
      .addCase(generateBill.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 🔄 Fetch Staff Bills
      .addCase(getAllBills.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllBills.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bills = action.payload;
      })
      .addCase(getAllBills.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 🔄 Fetch Admin Bills
      .addCase(getAllBillsAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAllBillsAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bills = action.payload;
      })
      .addCase(getAllBillsAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // 🔄 Get Single Bill
      .addCase(getBillByNumber.fulfilled, (state, action) => {
        state.selectedBill = action.payload;
      })

      // ✅ Mark Paid
      .addCase(markBillAsPaid.fulfilled, (state, action) => {
        const index = state.bills.findIndex(
          (b) => b.billNumber === action.payload.billNumber
        );
        if (index !== -1) {
          state.bills[index] = action.payload;
        }
      })

      // 🗑 Delete
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.bills = state.bills.filter(
          (b) => b.billNumber !== action.payload
        );
      });
  },
});


// =============================
export const { clearSelectedBill } = staffBillSlice.actions;
export default staffBillSlice.reducer;
