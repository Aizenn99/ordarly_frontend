import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  cart: null,
  isLoading: false,
  error: null,
};

// 1. Add or update item in the cart
export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async (formdata, thunkAPI) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/staff/cart/add-up`,
        formdata,
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// 2. Get cart for a table
export const getCartByTable = createAsyncThunk(
  "cart/getCartByTable",
  async (tableName, thunkAPI) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/staff/cart/${tableName}`
      );
      return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// 3. Remove item from cart
export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async ({ tableName, itemId }, thunkAPI) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/staff/cart/remove-item`,
        { tableName, itemId },
        { headers: { "Content-Type": "application/json" } }
      );
      return response.data.cart;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

// 4. Clear cart after bill
export const clearCartByTable = createAsyncThunk(
  "cart/clearCartByTable",
  async (tableName, thunkAPI) => {
    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/staff/cart/clear/${tableName}`
      );
      return tableName;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

const StaffCartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addItemToCart.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(getCartByTable.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCartByTable.fulfilled, (state, action) => {
        state.isLoading = false;
        state.cart = action.payload;
      })
      .addCase(getCartByTable.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(removeItemFromCart.fulfilled, (state, action) => {
        state.cart = action.payload;
      })

      .addCase(clearCartByTable.fulfilled, (state, action) => {
        if (state.cart?.tableName === action.payload) {
          state.cart = null;
        }
      });
  },
});

export default StaffCartSlice.reducer;
