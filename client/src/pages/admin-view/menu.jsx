import InfoCard from "@/components/admin-view/menu/InfoCard";
import React, { useEffect, useState } from "react";
import { IoFastFoodOutline } from "react-icons/io5";
import { CiCircleList } from "react-icons/ci";
import { MdDeleteOutline, MdFilterList } from "react-icons/md";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import ProductImageUpload from "@/components/admin-view/menu/ProductImageUpload";
import CommonForm from "@/components/common/form";
import {
  addCategoryFormControls,
  addMenuItemsFormControls,
  addSubCategoryFormControls,
} from "@/config";
import { useDispatch, useSelector } from "react-redux";
import {
  addcategory,
  addMenuItem,
  addSubCategory,
  deletecategory,
  deleteMenuItem,
  deleteSubCategory,
  fetchCategories,
  fetchSubCategory,
  getMenuItem,
  updateMenuItem,
} from "@/store/admin-slice/menuItem";
import { toast } from "react-hot-toast";
import { Emoji } from "emoji-picker-react";
import EmojiPickerPopup from "@/components/admin-view/menu/EmojiPicker";

const initialformData = {
  imageURL: null,
  title: "",
  description: "",
  category: "",
  subcategory: "",
  price: "",
};

const AdminMenu = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [open, setOpen] = useState(false);
  const [openMenu, setopenMenu] = useState(false);
  const [openCategory, setopenCategory] = useState(false);
  const [openSubCategory, setopenSubCategory] = useState(false);
  const [formData, setformData] = useState(initialformData);
  const [currentEditedId, setCurrentEditedId] = useState(null);

  const dispatch = useDispatch();
  const { menuItem, menucategoris, subcats } = useSelector(
    (state) => state.adminMenuItem
  );

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchSubCategory());
    dispatch(getMenuItem());
  }, [dispatch]);

  useEffect(() => {
    if (!openMenu) {
      setformData(initialformData);
      setCurrentEditedId(null);
    }
  }, [openMenu]);

  const onSubmit = (e) => {
    e.preventDefault();
    const action = currentEditedId
      ? updateMenuItem({ formdata: formData, id: currentEditedId })
      : addMenuItem(formData);

    dispatch(action)
      .then((res) => {
        const payload = res?.payload;
        if (payload?.success) {
          toast.success(currentEditedId ? "Menu Updated" : "Menu Item Added");
          dispatch(getMenuItem());
          setTimeout(() => setopenMenu(false), 300);
        } else {
          toast.error(payload?.message || "Something went wrong");
        }
      })
      .catch(() => toast.error("Something went wrong. Please try again."));
  };

  //add category submit

  const onSubmitCategory = (e) => {
    e.preventDefault();

    if (!formData.name || !formData.icon) {
      toast.error("Please provide category name and icon.");
      return;
    }

    dispatch(addcategory(formData))
      .then((res) => {
        const payload = res?.payload;
        if (payload?.success) {
          toast.success("Category Added Successfully");
          dispatch(fetchCategories());
          setformData(initialformData);
          setTimeout(() => setopenCategory(false), 300);
        } else {
          toast.error(payload?.message || "Failed to add category");
        }
      })
      .catch(() => toast.error("Something went wrong. Please try again."));
  };

  //add sub category submit

  const onSubmitSubCategory = (e) => {
    e.preventDefault();

    dispatch(addSubCategory(formData))
      .then((res) => {
        const payload = res?.payload;
        if (payload?.success) {
          toast.success("Sub-Category Added Successfully");
          dispatch(fetchSubCategory());
          setformData(initialformData);
          setTimeout(() => setopenSubCategory(false), 300);
        } else {
          toast.error(payload?.message || "Failed to add sub-category");
        }
      })
      .catch(() => toast.error("Something went wrong. Please try again."));
  };

  const handledelete = (id) => {
    dispatch(deleteMenuItem(id)).then((res) => {
      const payload = res?.payload;
      if (payload?.success) {
        toast.success("Menu Item Deleted Successfully");
        dispatch(getMenuItem());
      } else {
        toast.error(payload?.message || "Failed to delete");
      }
    });
  };

  const handlechange = (field, value) => {
    setformData((prev) => ({ ...prev, [field]: value }));
  };
   const fixImageURL = (url) => {
    // If it's already a full URL but has localhost, replace with actual IP
    if (url?.startsWith("http://localhost")) {
      return url.replace("http://localhost:8000", import.meta.env.VITE_API_URL);
    }

    // If it's a relative URL like /uploads/...
    if (url?.startsWith("/uploads")) {
      return `${import.meta.env.VITE_API_URL}${url}`;
    }

    // Else return as is
    return url || "/placeholder.png";
  };

  const generateDynamicMenuFormControls = () => {
    return addMenuItemsFormControls.map((control) => {
      if (control.name === "category") {
        return {
          ...control,
          options: menucategoris.map((cat) => ({
            id: cat._id,
            label: (
              <div className="flex items-center gap-2">
                {cat.icon && <Emoji unified={cat.icon} size={18} />}
                <span>{cat.name}</span>
              </div>
            ),
            value: cat._id,
          })),
        };
      }

      if (control.name === "subcategory") {
        return {
          ...control,
          options: subcats.map((sub) => ({
            id: sub._id,
            label: sub.name,
            value: sub._id,
          })),
        };
      }

      return control;
    });
  };

  const filteredMenuItem = Array.isArray(menuItem)
    ? menuItem.filter((item) => {
        const categoryMatch = selectedCategory
          ? menucategoris.find((c) => c._id === item.category)?.name ===
            selectedCategory
          : true;

        const subCatMatch = selectedSubCategory
          ? subcats.find((s) => s._id === item.subcategory)?.name ===
            selectedSubCategory
          : true;

        return categoryMatch && subCatMatch;
      })
    : [];

  return (
    <>
      <div className="h-full bg-[#E3F4F4] rounded-2xl p-3">
        {/* Info Cards */}
        <div className="grid md:grid-cols-3 grid-cols-1 gap-3">
          <InfoCard
            icon={<IoFastFoodOutline />}
            color="bg-primary1"
            value={menuItem.length}
            label="Total Items"
          />
          <InfoCard
            icon={<CiCircleList />}
            color="bg-primary1"
            value={menucategoris.length}
            label="Total Category"
          />
          <InfoCard
            icon={<MdFilterList />}
            color="bg-primary1"
            value={subcats.length}
            label="Total Sub-Category"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col bg-white rounded-2xl p-3 gap-2 mt-10">
          <div className="w-full overflow-x-auto max-w-[360px] sm:max-w-full">
            <h2 className="font-semibold text-md mb-3">Categories</h2>
            <div className="flex gap-3 px-2 pb-2 w-max">
              {menucategoris.map((cat) => (
                <button
                  key={cat._id}
                  onClick={() =>
                    setSelectedCategory(
                      cat.name === selectedCategory ? null : cat.name
                    )
                  }
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm shadow transition whitespace-nowrap ${
                    selectedCategory === cat.name
                      ? "bg-primary1 text-white"
                      : "bg-[#E3F4F4] text-black"
                  }`}
                >
                  {cat.icon ? (
                    <img src={cat.icon} alt={cat.name} className="w-5 h-5" />
                  ) : (
                    <LuUtensils className="w-5 h-5" />
                  )}
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full overflow-x-auto max-w-[360px] sm:max-w-full">
            <h2 className="font-semibold text-md mb-2">Sub Categories</h2>
            <div className="flex gap-3 px-2 pb-2 w-max">
              {subcats
                .filter((sub) => {
                  if (selectedCategory) {
                    // When a category is selected, only show subcategories with items under that category
                    const category = menucategoris.find(
                      (cat) => cat.name === selectedCategory
                    );
                    if (!category) return false;

                    return menuItem.some(
                      (item) =>
                        item.category?.toString() ===
                          category._id?.toString() &&
                        item.subcategory?.toString() === sub._id?.toString()
                    );
                  } else {
                    // When no category is selected, show subcategories that have any items
                    return menuItem.some(
                      (item) =>
                        item.subcategory?.toString() === sub._id?.toString()
                    );
                  }
                })
                .map((sub) => (
                  <button
                    key={sub._id}
                    onClick={() =>
                      setSelectedSubCategory(
                        sub.name === selectedSubCategory ? null : sub.name
                      )
                    }
                    className={`p-2 rounded-lg text-sm shadow transition whitespace-nowrap border ${
                      selectedSubCategory === sub.name
                        ? "bg-primary1 text-white border-primary1"
                        : "bg-[#E3F4F4] text-primary1 border-primary1"
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-8 bg-white p-4 rounded-xl">
          <h2 className="font-semibold text-xl mb-4">Menu Items</h2>
          {filteredMenuItem.length === 0 ? (
            <p className="text-sm text-gray-500">
              No items match the selected filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {filteredMenuItem.map((item) => (
                <div
                  key={item._id}
                  className="bg-white shadow rounded-xl h-[280px] overflow-hidden relative"
                >
                   <img
                    onClick={() => handleItemClick(item)}
                    src={fixImageURL(item.imageURL)}
                    alt={item.title || "Item"}
                    className="w-full h-36 object-cover rounded-t-xl"
                  />
                  <div className="p-3">
                    <h3 className="font-semibold text-md text-gray-800 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.description}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm text-black">
                        ₹ {item.price}
                      </span>
                      <button
                        className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                        onClick={() => handledelete(item._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Add Button */}
      <Sheet onOpenChange={setOpen} open={open}>
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-primary1 text-white rounded-full w-14 h-14 text-3xl shadow-lg"
          title="Add New Item"
        >
          +
        </button>

        <SheetContent className="w-96" side="right">
          <SheetHeader className="border-b">
            <SheetTitle className="mb-6">Add Options</SheetTitle>
          </SheetHeader>
          <div className="p-4 flex flex-col gap-2">
            <div
              onClick={() => setopenMenu(true)}
              className="card bg-[#E3F4F4] text-primary1 flex items-center justify-center cursor-pointer p-4 rounded-lg"
            >
              <span className="text-lg font-semibold">Add Menu Items</span>
            </div>
            <div
              onClick={() => setopenCategory(true)}
              className="card bg-[#E3F4F4] text-primary1 flex items-center justify-center cursor-pointer p-4 rounded-lg"
            >
              <span className="text-lg font-semibold">Add Category</span>
            </div>
            <div
              onClick={() => setopenSubCategory(true)}
              className="card bg-[#E3F4F4] text-primary1 flex items-center justify-center cursor-pointer p-4 rounded-lg"
            >
              <span className="text-lg font-semibold">Add Sub-Category</span>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Menu Item Sheet */}
      <Sheet onOpenChange={setopenMenu} open={openMenu}>
        <SheetContent className="w-96 overflow-y-scroll" side="right">
          <SheetHeader className="border-b">
            <SheetTitle>Add Menu Items</SheetTitle>
          </SheetHeader>
          <div className="p-4 flex flex-col gap-2">
            <ProductImageUpload
              setImageUrlInForm={(url) =>
                setformData((prev) => ({ ...prev, imageURL: url }))
              }
            />
            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setformData={setformData}
              buttonText={"Add"}
              formControls={generateDynamicMenuFormControls()}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Category Sheet */}
      <Sheet onOpenChange={setopenCategory} open={openCategory}>
        <SheetContent className="w-96 overflow-y-scroll" side="right">
          <SheetHeader className="border-b">
            <SheetTitle>Add Category</SheetTitle>
          </SheetHeader>
          <div className="p-4 flex flex-col gap-2">
            <div className="overflow-y-auto max-h-100 mb-10">
              {menucategoris && menucategoris.length > 0 ? (
                menucategoris.map((category) => (
                  <div
                    key={category._id}
                    className="flex items-center justify-between border-b px-2 mb-2 py-1"
                  >
                    <span className="text-sm flex items-center gap-2">
                      {category.icon ? (
                        <img
                          src={category.icon}
                          alt={category.name}
                          className="w-6 h-6"
                        />
                      ) : (
                        <LuUtensils />
                      )}
                      {category.name}
                    </span>
                    <MdDeleteOutline
                      className="text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => {
                        dispatch(deletecategory(category._id)).then((res) => {
                          const payload = res?.payload;
                          if (payload?.success) {
                            toast.success("Category Deleted Successfully");
                            dispatch(fetchCategories());
                          } else {
                            toast.error(payload?.message || "Failed to delete");
                          }
                        });
                      }}
                    />
                  </div>
                ))
              ) : (
                <p>No categories available.</p>
              )}
            </div>
            <EmojiPickerPopup
              icon={formData.icon}
              onSelect={(selectedIcon) => handlechange("icon", selectedIcon)}
            />
            <CommonForm
              onSubmit={onSubmitCategory}
              formData={formData}
              setformData={setformData}
              buttonText={"Add Category"}
              formControls={addCategoryFormControls}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Add Sub-Category Sheet */}
      <Sheet onOpenChange={setopenSubCategory} open={openSubCategory}>
        <SheetContent className="w-96 overflow-y-scroll" side="right">
          <SheetHeader className="border-b">
            <SheetTitle>Add Sub-Category</SheetTitle>
          </SheetHeader>
          <div className="p-4 flex flex-col gap-2">
            <div className="overflow-y-auto max-h-100 mb-10">
              {subcats && subcats.length > 0 ? (
                subcats.map((subcat) => (
                  <div
                    key={subcat._id}
                    className="flex items-center justify-between border-b px-2 mb-2 py-1"
                  >
                    <span className="text-sm">{subcat.name}</span>
                    <MdDeleteOutline
                      className="text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => {
                        dispatch(deleteSubCategory(subcat._id)).then((res) => {
                          const payload = res?.payload;
                          if (payload?.success) {
                            toast.success("Sub-Category Deleted Successfully");
                            dispatch(fetchSubCategory());
                          } else {
                            toast.error(payload?.message || "Failed to delete");
                          }
                        });
                      }}
                    />
                  </div>
                ))
              ) : (
                <p>No sub-categories available.</p>
              )}
            </div>
            <CommonForm
              onSubmit={onSubmitSubCategory}
              formData={formData}
              setformData={setformData}
              buttonText={"Add Sub-Category"}
              formControls={addSubCategoryFormControls}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default AdminMenu;
