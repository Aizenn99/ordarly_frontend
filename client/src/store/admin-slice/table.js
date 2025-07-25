import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

// ✅ Initial State
const initialState = {
  isLoading: false,
  tables: [],
  spaces: [], // Assuming you want to store spaces in the same state
  error: null,
};

// ✅ Get Tables
export const getTable = createAsyncThunk("admin/get-table", async () => {
  const result = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/admin/fetch-tables`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return result.data.data; // return only the array of tables
});

// ✅ Add Table
export const addTable = createAsyncThunk(
  "admin/add-table",
  async (formData) => {
    const result = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/admin/add-table`,
      formData
    );
    return result.data; // full payload
  }
);

// ✅ Update Table
export const updateTable = createAsyncThunk(
  "admin/update-table",
  async ({ id, formdata }) => {
    const result = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/admin/update-table/${id}`,
      formdata,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return result.data; // updated table inside result.data.data
  }
);

// ✅ Delete Table
export const deleteTable = createAsyncThunk(
  "admin/delete-table",
  async (id) => {
    const result = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/admin/delete-table/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return result.data; // deleted table info
  }
);

// ✅ Add Spaces
export const addSpaces = createAsyncThunk(
  "admin/add-spaces",
  async (formdata) => {
    const result = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/admin/add-spaces`,
      formdata
    );
    return result.data;
  }
);

// ✅ Fetch Spaces
export const fetchSpaces = createAsyncThunk("admin/fetch-spaces", async () => {
  const result = await axios.get(
    `${import.meta.env.VITE_API_URL}/api/admin/fetch-spaces`,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return result.data; // return the array of spaces
});

// ✅ Slice
export const tableSlice = createSlice({
  name: "adminTable",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Get Tables
      .addCase(getTable.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTable.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tables = action.payload;
      })
      .addCase(getTable.rejected, (state) => {
        state.isLoading = false;
      })

      // Add Table
      .addCase(addTable.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addTable.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tables.push(action.payload.data); // Add the new table to the array
      })
      .addCase(addTable.rejected, (state) => {
        state.isLoading = false;
      })

      // Update Table
      .addCase(updateTable.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateTable.fulfilled, (state, action) => {
        state.isLoading = false;
        const updatedTable = action.payload.data;
        state.tables = state.tables.map((table) =>
          table._id === updatedTable._id ? updatedTable : table
        );
      })
      .addCase(updateTable.rejected, (state) => {
        state.isLoading = false;
      })

      // Delete Table
      .addCase(deleteTable.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteTable.fulfilled, (state, action) => {
        state.isLoading = false;
        const deletedId = action.payload.data._id;
        state.tables = state.tables.filter((table) => table._id !== deletedId);
      })
      .addCase(deleteTable.rejected, (state) => {
        state.isLoading = false;
      })

      // Add Spaces (optional)
      .addCase(addSpaces.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addSpaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spaces.push(action.payload.data);
      })

      .addCase(addSpaces.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchSpaces.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSpaces.fulfilled, (state, action) => {
        state.isLoading = false;
        state.spaces = action.payload.data; // Store fetched spaces
      })
      .addCase(fetchSpaces.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default tableSlice.reducer;
