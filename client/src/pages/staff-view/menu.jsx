import {
  fetchCategories,
  fetchSubCategory,
  getMenuItem,
} from "@/store/admin-slice/menuItem";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { LuUtensils } from "react-icons/lu";
import { Sheet, SheetContent, SheetHeader } from "@/components/ui/sheet";
import { useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import {
  addItemToCart,
  getCartByTable,
  removeItemFromCart,
} from "@/store/staff-slice/cart";
import { HiOutlineShoppingCart } from "react-icons/hi2";
import { Separator } from "@/components/ui/separator";
import { deleteBill, generateBill } from "@/store/staff-slice/Bill";
import {
  markItemsAsSentToKitchen,
  sendToKitchen,
} from "@/store/kitchen-slice/order-slice";
import { changeTableStatus, getTable } from "@/store/admin-slice/table";
import { IoSearchSharp } from "react-icons/io5";
import debounce from "lodash.debounce";

const StaffMenu = () => {

  const location   = useLocation();
const state      = location.state || {};
const tableName  = state.tableName;
const guestCount = state.guestCount;

  const { menuItem, menucategoris, subcats } = useSelector(
    (state) => state.adminMenuItem
  );
  const { user } = useSelector((state) => state.auth);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [quantities, setQuantities] = useState(() => {
    const saved = localStorage.getItem("cart_quantities");
    return saved ? JSON.parse(saved) : {};
  });
  const [searchQuery, setSearchQuery] = useState("");

  const apiBaseURL = import.meta.env.VITE_API_URL; // Make sure it's set to IP
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

  const [openCart, setopenCart] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cart, setCart] = useState(null);

  useEffect(() => {
    localStorage.setItem("cart_quantities", JSON.stringify(quantities));
  }, [quantities]);

  const dispatch = useDispatch();

  const isEditMode = !!state?.items && !!state?.billNumber;

  useEffect(() => {
    if (!state?.tableName) {
      setQuantities({}); // reset all quantities to 0
    }
  }, [state?.tableName]);

  useEffect(() => {
    dispatch(getMenuItem());
    dispatch(fetchCategories());
    dispatch(fetchSubCategory());
  }, [dispatch]);

  const hasRestoredCart = useRef(false);

  useEffect(() => {
    const restoreCartFromBill = async () => {
      if (
        state?.items &&
        !hasRestoredCart.current &&
        menuItem.length > 0 &&
        (!cart || !cart.items || cart.items.length === 0)
      ) {
        hasRestoredCart.current = true;

        const validItemIds = new Set(menuItem.map((m) => m._id));
        console.log("✅ Valid Menu Item IDs:", [...validItemIds]);

        const itemsToRestore = state.items.filter((item) => {
          const id = item.itemId?._id || item.itemId || item._id;
          return validItemIds.has(id);
        });

        console.log("🛒 Filtered Items to Restore:", itemsToRestore);

        try {
          // 🛠 Add all items back to cart
          const addPromises = itemsToRestore.map((item) =>
            dispatch(
              addItemToCart({
                tableName: state.tableName,
                guestCount: state.guestCount,
                itemId: item.itemId?._id || item.itemId || item._id,
                quantity: item.quantity,
                note: item.note || "",
              })
            ).unwrap()
          );

          await Promise.all(addPromises);

          // 🔄 Fetch updated cart
          const updatedCart = await dispatch(
            getCartByTable(state.tableName)
          ).unwrap();
          setCart(updatedCart);
          setCartItems(updatedCart.items || []);
          toast.success("✅ Cart restored from bill");

          // 🗑️ Delete previous bill if billNumber exists
          if (state.billNumber) {
            await dispatch(deleteBill(state.billNumber)).unwrap();
            console.log("🗑️ Deleted original bill:", state.billNumber);
          }
        } catch (err) {
          console.error("❌ Failed to restore cart or delete bill:", err);
          toast.error("❌ Failed to restore cart or delete bill");
        }
      }
    };

    restoreCartFromBill();
  }, [
    state?.items,
    cart,
    dispatch,
    menuItem.length,
    state?.tableName,
    state?.guestCount,
  ]);

  useEffect(() => {
    if (!state?.tableName) {
      setCart(null);
    }
  }, [state?.tableName]);

  useEffect(() => {
  if (openCart && tableName) {
    dispatch(getCartByTable(tableName))
      .unwrap()
      .then(res => {
        setCart(res);
        setCartItems(res.items || []);      // ← add this
        setQuantities(() => {
          const initial = {};
          res.items.forEach(item => {
            const id = item.itemId?._id || item.itemId;
            initial[id] = item.quantity;
          });
          return initial;
        });
      })
      .catch(() => toast.error("Failed to fetch cart"));
  }
}, [openCart, tableName, dispatch]);

  useEffect(() => {
    if (cart?.items?.length) {
      const initialQuantities = {};
      cart.items.forEach((item) => {
        const itemId = item.itemId?._id || item.itemId;
        initialQuantities[itemId] = item.quantity;
      });
      setQuantities(initialQuantities);
    } else {
      // 🧼 clear if cart is empty
      setQuantities({});
    }
  }, [cart]);

  useEffect(() => {
    if (!cart || cart.items === undefined) {
      const saved = localStorage.getItem("cart_quantities");
      if (saved) {
        setQuantities(JSON.parse(saved));
      }
    }
  }, [cart]);

  useEffect(() => {
    if (!state?.tableName) {
      setCart(null);
      setQuantities({});
      localStorage.removeItem("cart_quantities");
    }
  }, [state?.tableName]);

  useEffect(() => {
    if (state?.tableName) {
      dispatch(getCartByTable(state.tableName))
        .unwrap()
        .then((data) => {
          if (data?.items?.length > 0) {
            setCart(data);
          }
        });
    }
  }, [state?.tableName]);

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setOpenMenu(true);
  };

  


  const debouncedUpdate = useMemo(
  () =>
    debounce((id, qty) => {
      dispatch(addItemToCart({ tableName, guestCount, itemId: id, quantity: qty }))
        .unwrap()
        .catch(() => toast.error("Failed to sync quantity"));
    }, 40),
  [dispatch, tableName, guestCount]
);

useEffect(() => {
  return () => debouncedUpdate.cancel();
}, [debouncedUpdate]);

  function handleAddClick(id) {
    if (!tableName) return toast.error('Pick a table first');
    // Optimistic UI
    setQuantities(q => ({ ...q, [id]: 1 }));
    setCartItems(cs => [...cs, { itemId: id, quantity: 1 }]);
    // Fire & forget
    dispatch(addItemToCart({ tableName, guestCount, itemId: id, quantity: 1 }))
      .unwrap().catch(() => {
        // roll back on error
        setQuantities(q => { const c={...q}; delete c[id]; return c; });
        setCartItems(cs => cs.filter(x => x.itemId !== id));
        toast.error('Add failed');
      });
  }

  // 3. Handle increase
  function handleIncrease(id) {
    const newQty = (quantities[id]||0) + 1;
    setQuantities(q => ({ ...q, [id]: newQty }));
    setCartItems(cs => cs.map(x => x.itemId===id ? { ...x, quantity: newQty } : x));
    debouncedUpdate(id, newQty);
  }

  // 4. Handle decrease
  function handleDecrease(id) {
    const newQty = (quantities[id]||1) - 1;
    if (newQty <= 0) {
      setQuantities(q => { const c={...q}; delete c[id]; return c; });
      setCartItems(cs => cs.filter(x => x.itemId !== id));
      dispatch(removeItemFromCart({ tableName, itemId: id })).unwrap().catch(() => toast.error('Remove failed'));
    } else {
      setQuantities(q => ({ ...q, [id]: newQty }));
      setCartItems(cs => cs.map(x => x.itemId===id ? { ...x, quantity: newQty } : x));
      debouncedUpdate(id, newQty);
    }
  }




  const handleGenerateBill = () => {
    if (!state?.tableName) {
      toast.error("Please select the table first");
      return;
    }

    dispatch(
      generateBill({
        tableName: state.tableName,
        spaceName: state.spaceName,
        paymentMethod: "CASH", // ✅ Required for backend
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Bill generated successfully");

        // ✅ If it's NOT in edit mode → mark table as available
        if (!isEditMode && state?.tableId) {
          dispatch(
            changeTableStatus({
              id: state.tableId,
              formdata: { status: "available" },
            })
          );
        }

        // 🧹 Clear localStorage data
        localStorage.removeItem("cart_quantities");

        const guestInfoMap =
          JSON.parse(localStorage.getItem("guestInfoMap")) || {};
        delete guestInfoMap[state.tableName];
        localStorage.setItem("guestInfoMap", JSON.stringify(guestInfoMap));

        setopenCart(false);
        setCart(null);
        setQuantities({});
        setCartItems([]);
      })
      .catch(() => toast.error("Failed to generate bill"));
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

        const searchMatch = searchQuery
          ? item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            menucategoris
              .find((c) => c._id === item.category)
              ?.name?.toLowerCase()
              ?.includes(searchQuery.toLowerCase()) ||
            subcats
              .find((s) => s._id === item.subcategory)
              ?.name?.toLowerCase()
              ?.includes(searchQuery.toLowerCase())
          : true;

        return categoryMatch && subCatMatch && searchMatch;
      })
    : [];

  const totalItems = cartItems?.length || 0;
 const subtotal = cartItems.reduce((sum, item) => {
  const price = item.itemId?.price || 0;
  return sum + price * item.quantity;
}, 0);
  const charges = Math.round(subtotal * 0.05); // or use .toFixed(2) if decimals are needed
 

  function handleSendToKitchen() {
    if (!state?.tableName || !state?.spaceName) {
      toast.error("Table or Space not selected");
      return;
    }

    if (!cart || cart.items?.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    const unsentValidItems = cart.items
      .map((item) => {
        const sentQty = item.sentQuantity || 0;
        const diffQty = item.quantity - sentQty;

        if (item?.itemId?.title && diffQty > 0) {
          return {
            itemId: item.itemId._id,
            itemName: item.itemId.title,
            quantity: diffQty,
            note: item.note || "",
          };
        }

        console.warn("❌ Skipped item (nothing new to send):", item);
        return null;
      })
      .filter(Boolean); // Remove nulls

    if (unsentValidItems.length === 0) {
      toast.info("No new valid items to send to kitchen");
      return;
    }

    const kotPayload = {
      tableName: state.tableName,
      spaceName: state.spaceName,
      guestCount: state.guestCount || 1,
      username: user?.userName || "unknown_staff",
      items: unsentValidItems,
    };

    // ✅ First update table status to "occupied"
    dispatch(
      changeTableStatus({
        id: state.tableId,
        formdata: { status: "occupied" },
      })
    )
      .unwrap()
      .then(() => {
        dispatch(getTable()); // refresh tables
      })
      .catch((err) => {
        console.error("⚠️ Failed to update table status:", err);
      });

    // ✅ Then send KOT
    dispatch(sendToKitchen(kotPayload))
      .unwrap()
      .then((res) => {
        toast.success(`✅ Order sent to kitchen (KOT #${res.kotNumber})`);

        // ❌ useState(...) is wrong — ✅ use the setter directly:
        setopenCart(false); // ✅ FIXED

        // ✅ Mark sent quantities in backend
        dispatch(markItemsAsSentToKitchen(state.tableName))
          .unwrap()
          .then(() => {
            dispatch(getCartByTable(state.tableName)); // Refresh cart
          })
          .catch(() => {
            toast.error("⚠️ Failed to mark items as sent");
          });
      })
      .catch(() => {
        toast.error("❌ Failed to send order to kitchen");
      });
  }

  return (
    <>
      <div className="p-3 md:p-1">
        {state?.tableName && (
          <div className="flex p-3 md:p-1 justify-between bg-gray-100 border-b mb-3 rounded-2xl items-center">
            <span className="text-sm font-semibold text-black">
              Table | <span className="text-primary1">{state.tableName}</span>
            </span>
            <span className="text-sm font-semibold text-black">
              Guest | <span className="text-primary1">{state.guestCount}</span>
            </span>
          </div>
        )}

        <div className="flex flex-col bg-gray-100 rounded-2xl border p-2 gap-1 ">
          <div className=" py-2 relative">
            <IoSearchSharp className="absolute left-3 top-1/2 -translate-y-1/2 text-primary1 w-5 h-5" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.trimStart())}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary1"
            />
          </div>
          <div className="w-full max-w-[380px] sm:max-w-full">
            <h2 className="font-semibold sticky top-0 z-9 text-md bg-gray-100 p-1 px-4 ">
              Categories
            </h2>
            <div className="overflow-x-auto scrollbar-hide w-full">
              <div className="flex gap-3 px-2 w-max">
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
          </div>
          <div className="w-full max-w-[380px] sm:max-w-full">
            <h2 className="font-semibold sticky top-0 z-9 text-md p-1 bg-gray-100 px-4">
              Sub Categories
            </h2>
            <div className="overflow-x-auto scrollbar-hide w-full">
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
        </div>

        <div className="bg-white rounded-xl mt-4">
          <h2 className="font-semibold text-xl mb-4 ml-4">Menu Items</h2>
          {filteredMenuItem.length === 0 ? (
            <p className="text-sm text-gray-500">
              No items match the selected filters.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 bg-gray-100 p-2 rounded-2xl md:grid-cols-4 gap-6">
              {filteredMenuItem.map((item) => (
                <div
                  key={item._id}
                  className="cursor-pointer bg-[#E3F4F4] shadow-lg rounded-xl max-h-[280px] min-h-[255px] flex flex-col overflow-hidden"
                >
                  <img
                    onClick={() => handleItemClick(item)}
                    src={fixImageURL(item.imageURL)}
                    alt={item.title || "Item"}
                    className="w-full h-36 object-cover rounded-t-xl"
                  />

                  <div className="p-3 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-semibold text-md text-gray-800 mb-1">
                        {item.title}
                      </h3>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className=" text-sm text-black">
                        ₹ {item.price}
                      </span>
                      {state?.tableName && quantities[item._id] ? (
                        <div className="flex items-center gap-1">
                          <button
                            className="bg-red-500 text-white w-6 h-6 rounded-full"
                            onClick={() => handleDecrease(item._id)}
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={quantities[item._id]}
                            readOnly
                            className="w-8 text-center text-sm bg-transparent border-none outline-none"
                          />
                          <button
                            className="bg-red-500 text-white w-6 h-6 rounded-full"
                            onClick={() => handleIncrease(item._id)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
                          onClick={() => handleAddClick(item._id)}
                        >
                          ADD
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="fixed bottom-26 right-6 z-50">
        <button
          onClick={() => setopenCart(true)}
          className="relative border flex items-center justify-center bg-white text-primary1 rounded-full w-14 h-14 text-3xl shadow-lg"
          title="View Cart"
        >
          <HiOutlineShoppingCart />

          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          )}
        </button>
      </div>
      <Sheet onOpenChange={setopenCart} open={openCart}>
        <SheetContent className="w-90 overflow-auto" side="right">
          <SheetHeader>
            <div className="flex items-center mt-8 justify-between">
              <span className="text-sm font-semibold text-black">
                Table |{" "}
                <span className="text-primary1">{state?.tableName}</span>
              </span>
              <span className="text-sm font-semibold text-black">
                Guest |{" "}
                <span className="text-primary1">{state?.guestCount}</span>
              </span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2">
              Items Cart <HiOutlineShoppingCart />
            </div>
          </SheetHeader>

          <div className="flex flex-col gap-4 p-3 h-full">
            {!cart?.items || cart.items.length === 0 ? (
              <p className="text-sm text-gray-500 text-center">
                No items in cart.
              </p>
            ) : (
              <>
                {/* Scrollable Items Section */}
                <div className="flex-1 overflow-y-auto">
                  <div className="bg-gray-100 rounded-2xl p-4 space-y-4">
                    {(cart.items || [])
                      .filter((cartItem) => {
                        const itemId = cartItem.itemId?._id || cartItem.itemId;
                        return menuItem.some((m) => m._id === itemId);
                      })
                      .map((cartItem) => {
                        const itemId = cartItem.itemId?._id || cartItem.itemId;
                        const menuData = menuItem.find((i) => i._id === itemId);
                        if (!menuData) {
                          console.warn(
                            "⚠️ menuData not found for item:",
                            cartItem
                          );
                          return null;
                        }

                        const category = menucategoris.find(
                          (cat) => cat._id === menuData?.category
                        );

                        const isFullySent =
                          (cartItem.sentQuantity || 0) >= cartItem.quantity;

                        return (
                          <div
                            key={cartItem._id}
                            className={`p-3 flex flex-col gap-1 min-h-[70px] ${
                              isFullySent ? "opacity-50" : ""
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-md flex items-center gap-2 font-semibold text-gray-800">
                                {category?.icon ? (
                                  <img
                                    src={category.icon}
                                    alt={category.name}
                                    className="w-4 h-4"
                                  />
                                ) : (
                                  <LuUtensils className="w-4 h-4" />
                                )}
                                {menuData.title}
                              </span>

                              <span className="text-sm font-semibold text-black">
                                Qty: {cartItem.quantity}
                              </span>
                            </div>

                            <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>₹ {menuData.price}</span>
                              <span className="text-black font-medium">
                                ₹ {menuData.price * cartItem.quantity}
                              </span>
                            </div>

                            {isFullySent && (
                              <span className="text-xs text-green-600 mt-1">
                                ✅ Sent to Kitchen
                              </span>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Divider */}
                <Separator className="h-[1px] bg-black opacity-70 my-3 rounded-full" />

                {/* Totals & Action Buttons */}
                <div className="space-y-2 bg-gray-100 rounded-2xl p-4 mb-4 text-sm text-gray-700">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-medium">₹ {subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Charges</span>
                    <span className="font-medium">₹ {charges}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-black">
                    <span>Total</span>
                    <span>₹ {subtotal + charges}</span>
                  </div>

                  <div className="flex justify-between items-center gap-2 mt-4">
                    <button
                      onClick={handleSendToKitchen}
                      className="bg-primary1 text-white font-semibold py-2 w-full rounded-full"
                    >
                      Send To Kitchen
                    </button>
                    <button
                      onClick={handleGenerateBill}
                      className="bg-primary1 text-white font-semibold py-2 w-full rounded-full"
                    >
                      {isEditMode ? "Edit Bill" : "Generate Bill"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <Sheet onOpenChange={setOpenMenu} open={openMenu}>
        <SheetContent
          className="h-2/3 rounded-t-xl overflow-auto p-3 bg-[#E3F4F4]"
          side="bottom"
        >
          {selectedItem && (
            <div className="flex flex-col h-full gap-3">
              <div className="bg-white rounded-xl p-4">
                <img
                  src={fixImageURL(selectedItem.imageURL)}
                  alt={selectedItem.title}
                  className="w-full h-54 object-cover rounded-3xl"
                />

                <div className="flex items-center gap-2 mt-3">
                  {(() => {
                    const category = menucategoris.find(
                      (cat) => cat._id === selectedItem.category
                    );
                    return category ? (
                      <>
                        {category.icon ? (
                          <img
                            src={category.icon}
                            alt={category.name}
                            className="w-6 h-6"
                          />
                        ) : (
                          <LuUtensils className="w-5 h-5" />
                        )}
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                      </>
                    ) : null;
                  })()}
                </div>
                <div className="flex justify-between items-center mt-2">
                  <h2 className="text-xl font-bold">{selectedItem.title}</h2>
                  <span className="text-lg font-semibold text-primary1">
                    ₹ {selectedItem.price}
                  </span>
                </div>
                <p className="text-sm text-gray-600 overflow-y-auto scrollbar-hide mt-1 max-h-[100px]">
                  {selectedItem.description}
                </p>
              </div>
              <div className="p-4 bg-white"></div>
              <div className="mt-auto">
                {state?.tableName && quantities[selectedItem._id] ? (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      className="bg-primary1 text-white w-30 h-10 text-2xl rounded-lg"
                      onClick={() => handleDecrease(selectedItem._id)}
                    >
                      -
                    </button>
                    <input
                      type="text"
                      value={quantities[selectedItem._id]}
                      readOnly
                      className="w-10 text-center text-lg  bg-transparent border-none outline-none"
                    />
                    <button
                      className="bg-primary1 text-white w-30 h-10 text-2xl rounded-lg"
                      onClick={() => handleIncrease(selectedItem._id)}
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAddClick(selectedItem._id)}
                    className="bg-primary1 w-full text-white py-2 px-4 rounded-lg mt-4"
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default StaffMenu;
