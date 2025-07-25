import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  menuItem: [],
  menucategoris: [],
  subcats: [],
};

// ===== Menu Items =====

export const addMenuItem = createAsyncThunk(
  "admin/add-menu-item",
  async (formdata) => {
    const result = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/admin/add-menu`,
      formdata
    );
    return result?.data;
  }
);

export const getMenuItem = createAsyncThunk("admin/get-menu-item", async () => {
  const result = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/fetch-menu`, {
    headers: { "Content-Type": "application/json" },
  });
  return result?.data;
});

export const deleteMenuItem = createAsyncThunk(
  "admin/delete-menu-item",
  async (id) => {
    const result = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/admin/delete-menu/${id}`,
      { headers: { "Content-Type": "application/json" } }
    );
    return result?.data;
  }
);

export const updateMenuItem = createAsyncThunk(
  "admin/update-menu-item",
  async ({ id, formdata }) => {
    const result = await axios.put(
      `${import.meta.env.VITE_API_URL}/api/admin/update-menu/${id}`,
      formdata,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return result?.data;
  }
);

// ===== Categories =====

export const addcategory = createAsyncThunk(
  "admin/add-category",
  async (formdata) => {
    const result = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/admin/add-category`,
      formdata
    );
    return result?.data;
  }
);

export const fetchCategories = createAsyncThunk(
  "admin/fetch-categories",
  async () => {
    const result = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/admin/fetch-categories`,
      { headers: { "Content-Type": "application/json" } }
    );
    return result?.data;
  }
);

export const deletecategory = createAsyncThunk(
  "admin/delete-category",
  async (id) => {
    const result = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/admin/delete-category/${id}`,
      { headers: { "Content-Type": "application/json" } }
    );
    return result?.data;
  }
);

// ===== Subcategories =====

export const addSubCategory = createAsyncThunk(
  "admin/add-subcategory",
  async (formdata) => {
    const result = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/admin/add-subcategory`,
      formdata
    );
    return result?.data;
  }
);

export const fetchSubCategory = createAsyncThunk(
  "admin/fetch-subcategory",
  async () => {
    const result = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/admin/fetch-subcategories`,
      { headers: { "Content-Type": "application/json" } }
    );
    return result?.data;
  }
);

export const deleteSubCategory = createAsyncThunk(
  "admin/delete-subcategory",
  async (id) => {
    const result = await axios.delete(
      `${import.meta.env.VITE_API_URL}/api/admin/delete-subcategory/${id}`,
      { headers: { "Content-Type": "application/json" } }
    );
    return result?.data;
  }
);

// ===== Slice =====

export const AdminmenuItemSlice = createSlice({
  name: "adminMenuItem",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Menu Items
      .addCase(addMenuItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menuItem = Array.isArray(action.payload?.listOfMenuItems)
          ? action.payload.listOfMenuItems
          : [];
      })
      .addCase(addMenuItem.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(getMenuItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menuItem = Array.isArray(action.payload?.listOfMenuItems)
          ? action.payload.listOfMenuItems
          : [];
      })
      .addCase(getMenuItem.rejected, (state) => {
        state.isLoading = false;
        state.menuItem = [];
      })
      .addCase(deleteMenuItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menuItem = action.payload.listOfMenuItems || [];
      })
      .addCase(deleteMenuItem.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(updateMenuItem.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateMenuItem.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menuItem = Array.isArray(action.payload?.listOfMenuItems)
          ? action.payload.listOfMenuItems
          : [];
      })
      .addCase(updateMenuItem.rejected, (state) => {
        state.isLoading = false;
      })

      // Categories
      .addCase(addcategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addcategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menucategoris = Array.isArray(action.payload?.listOfCategories)
          ? action.payload.listOfCategories
          : [];
      })
      .addCase(addcategory.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;

        const fallback =
          action.payload?.listOfCategories ||
          action.payload?.categories ||
          action.payload?.data?.listOfCategories ||
          [];

        state.menucategoris = Array.isArray(fallback) ? fallback : [];
      })
      .addCase(fetchCategories.rejected, (state) => {
        state.isLoading = false;
        state.menucategoris = [];
      })
      .addCase(deletecategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deletecategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.menucategoris = Array.isArray(action.payload?.listOfCategories)
          ? action.payload.listOfCategories
          : [];
      })
      .addCase(deletecategory.rejected, (state) => {
        state.isLoading = false;
      })

      // Subcategories
      .addCase(addSubCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addSubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subcats = Array.isArray(action.payload?.listOfSubCategories)
          ? action.payload.listOfSubCategories
          : [];
      })
      .addCase(addSubCategory.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchSubCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchSubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        const fallback =
          action.payload?.listOfSubCategories ||
          action.payload?.subcategories ||
          action.payload?.data?.listOfSubCategories ||
          [];
        state.subcats = Array.isArray(fallback) ? fallback : [];
      })
      .addCase(fetchSubCategory.rejected, (state) => {
        state.isLoading = false;
        state.subcats = [];
      })
      .addCase(deleteSubCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteSubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subcats = Array.isArray(action.payload?.listOfSubCategories)
          ? action.payload.listOfSubCategories
          : [];
      })
      .addCase(deleteSubCategory.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default AdminmenuItemSlice.reducer;
