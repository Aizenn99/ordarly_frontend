// src/components/AdminSettings.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import CommonForm from "@/components/common/form";
import {
  deliverySettingsFormControls,
  DiscountSettingsFormControls,
  PackageSettingsFormControls,
  receiptSettingstFormControls,
  serviceChargeSettingsFormControls,
  taxSettingsFormControls,
} from "@/config";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  addSetting,
  deleteSetting,
  fetchSettings,
} from "@/store/admin-slice/settings";

import { MdDeleteOutline } from "react-icons/md";
import { deleteReceiptField, fetchReceiptSettings, updateReceiptSettings } from "@/store/admin-slice/receipt-slice";

// ✅ Initial Form States
const initialTaxFormData = { taxPercentage: "", taxName: "" };
const initialDeliveryFormData = { deliveryCharge: "", deliveryZones: "" };
const initialDiscountFormData = {
  discountName: "",
  discountPercentage: "",
};
const initialPackageFormData = { packageName: "", packagePrice: "" };
const initialServiceFormData = { serviceName: "", servicePrice: "" };
const initialReceiptFormData = {
  receiptHeader: "",
  businessNumber: "",
  receiptAddress: "",
  receiptFooter: "",
};

export default function AdminSettings() {
  const dispatch = useDispatch();
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [open, setOpen] = useState(false);

  // form states
  const [taxFormData, setTaxFormData] = useState(initialTaxFormData);
  const [deliveryData, setDeliveryData] = useState(initialDeliveryFormData);
  const [discountData, setDiscountData] = useState(initialDiscountFormData);
  const [packageData, setPackageData] = useState(initialPackageFormData);
  const [serviceData, setServiceData] = useState(initialServiceFormData);
  const [receiptData, setReceiptData] = useState(initialReceiptFormData);

  // existing array-based settings
  const {
    TAX = [],
    DELIVERY = [],
    DISCOUNT = [],
    PACKAGE = [],
    SERVICE_CHARGE = [],
  } = useSelector((state) => state.adminSettings);

  // singleton receipt settings
  const {
    data: receipt,
    isLoading: isReceiptLoading,
    error: receiptError,
  } = useSelector((state) => state.receiptSettings);

  // fetch all on mount
  useEffect(() => {
    dispatch(fetchSettings("TAX"));
    dispatch(fetchSettings("DELIVERY"));
    dispatch(fetchSettings("DISCOUNT"));
    dispatch(fetchSettings("PACKAGE"));
    dispatch(fetchSettings("SERVICE_CHARGE"));
    dispatch(fetchReceiptSettings());
  }, [dispatch]);

  // seed receipt form when data arrives
  useEffect(() => {
    if (receipt) {
      setReceiptData({
        receiptHeader: receipt.header,
        businessNumber: receipt.businessNumber,
        receiptAddress: receipt.address,
        receiptFooter: receipt.footer,
      });
    }
  }, [receipt]);

  // ────────────────────────────────────────
  // old addSetting handler (for TAX, DELIVERY, etc.)
  // ────────────────────────────────────────
  const handleSubmit = async (type, data, resetFunc, e) => {
    e.preventDefault();
    try {
      let mapped = { type: type.toUpperCase() };
      switch (type) {
        case "tax":
          mapped.name = data.taxName;
          mapped.value = Number(data.taxPercentage);
          mapped.unit = "PERCENTAGE";
          break;
        case "delivery":
          mapped.name = "Delivery Zones";
          mapped.value = Number(data.deliveryCharge);
          mapped.unit = "AMOUNT";
          break;
        case "discount":
          mapped.name = data.discountName;
          mapped.value = Number(data.discountPercentage);
          mapped.unit = "PERCENTAGE";
          break;
        case "package":
          mapped.name = data.packageName;
          mapped.value = Number(data.packagePrice);
          mapped.unit = "AMOUNT";
          break;
        case "service":
          mapped.type = "SERVICE_CHARGE";
          mapped.name = data.serviceName;
          mapped.value = Number(data.servicePrice);
          mapped.unit = "PERCENTAGE";
          break;
        default:
          return;
      }
      await dispatch(addSetting(mapped)).unwrap();
      toast.success(`${type.toUpperCase()} setting added`);
      resetFunc();
      setOpen(false);
    } catch {
      toast.error("Failed to add setting");
    }
  };

  // ────────────────────────────────────────
  // receipt-specific handlers
  // ────────────────────────────────────────
  const handleReceiptSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateReceiptSettings({
          header: receiptData.receiptHeader,
          businessNumber: receiptData.businessNumber,
          address: receiptData.receiptAddress,
          footer: receiptData.receiptFooter,
        })
      ).unwrap();
      toast.success("Receipt settings saved");
      setOpen(false);
    } catch {
      toast.error("Failed to save receipt settings");
    }
  };

  const handleClearReceiptField = async (field) => {
    try {
      await dispatch(deleteReceiptField(field)).unwrap();
      toast.success(`${field} cleared`);
    } catch {
      toast.error(`Failed to clear ${field}`);
    }
  };

  // ────────────────────────────────────────
  // render list for array-based settings
  // ────────────────────────────────────────
  const renderSettingList = (items = []) => (
    <div className="overflow-y-auto max-h-64 mb-4">
      {items.length > 0 ? (
        items.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between border-b px-2 mb-2 py-1"
          >
            <span className="text-sm">
              {item.name} | {item.value}
              {item.unit === "PERCENTAGE"
                ? "%"
                : item.unit === "AMOUNT"
                ? "₹"
                : ""}
            </span>
            <MdDeleteOutline
              onClick={() => dispatch(deleteSetting(item._id))}
              className="text-red-500 cursor-pointer hover:text-red-700"
            />
          </div>
        ))
      ) : (
        <p className="text-xs text-gray-500">No settings added.</p>
      )}
    </div>
  );

  // ────────────────────────────────────────
  // render current receipt settings
  // ────────────────────────────────────────
  const renderReceiptCurrent = () => {
    if (isReceiptLoading) return <p>Loading receipt…</p>;
    if (receiptError) return <p className="text-red-500">{receiptError}</p>;

    return (
    <div className="bg-white shadow-sm p-4 rounded-lg mb-6">
  <h3 className="text-lg font-semibold mb-4 border-b pb-2">
    Current Receipt
  </h3>

  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
    <div>
      <dt className="text-xs font-medium text-gray-500">Header</dt>
      <dd className="mt-1 text-gray-900">{receipt.header || "—"}</dd>
    </div>
    <div>
      <dt className="text-xs font-medium text-gray-500">Address</dt>
      <dd className="mt-1 text-gray-900">{receipt.address || "—"}</dd>
    </div>
    <div>
      <dt className="text-xs font-medium text-gray-500">Business #</dt>
      <dd className="mt-1 text-gray-900">{receipt.businessNumber || "—"}</dd>
    </div>
    <div>
      <dt className="text-xs font-medium text-gray-500">Footer</dt>
      <dd className="mt-1 text-gray-900">{receipt.footer || "—"}</dd>
    </div>
  </dl>

  <div className="flex flex-wrap gap-2 mt-4">
    {["header", "address", "businessNumber", "footer"].map((f) => (
      <button
        key={f}
        onClick={() => handleClearReceiptField(f)}
        className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium hover:bg-red-100 transition"
      >
        Clear {f}
      </button>
    ))}
  </div>
</div>

    );
  };

  // ────────────────────────────────────────
  // define each sheet's content
  // ────────────────────────────────────────
  const settingsItems = [
    {
      name: "Tax Settings",
      description: "Manage tax rates and settings for your business.",
      content: (
        <>
          {renderSettingList(TAX)}
          <CommonForm
            formData={taxFormData}
            setformData={setTaxFormData}
            buttonText="Add"
            formControls={taxSettingsFormControls}
            onSubmit={(e) =>
              handleSubmit(
                "tax",
                taxFormData,
                () => setTaxFormData(initialTaxFormData),
                e
              )
            }
          />
        </>
      ),
    },
    {
      name: "Delivery Settings",
      description: "Configure delivery options and fees.",
      content: (
        <>
          {renderSettingList(DELIVERY)}
          <CommonForm
            formData={deliveryData}
            setformData={setDeliveryData}
            buttonText="Add"
            formControls={deliverySettingsFormControls}
            onSubmit={(e) =>
              handleSubmit(
                "delivery",
                deliveryData,
                () => setDeliveryData(initialDeliveryFormData),
                e
              )
            }
          />
        </>
      ),
    },
    {
      name: "Discount Settings",
      description: "Set up and manage discounts and promotions.",
      content: (
        <>
          {renderSettingList(DISCOUNT)}
          <CommonForm
            formData={discountData}
            setformData={setDiscountData}
            buttonText="Add"
            formControls={DiscountSettingsFormControls}
            onSubmit={(e) =>
              handleSubmit(
                "discount",
                discountData,
                () => setDiscountData(initialDiscountFormData),
                e
              )
            }
          />
        </>
      ),
    },
    {
      name: "Package Settings",
      description: "Manage package options and pricing.",
      content: (
        <>
          {renderSettingList(PACKAGE)}
          <CommonForm
            formData={packageData}
            setformData={setPackageData}
            buttonText="Add"
            formControls={PackageSettingsFormControls}
            onSubmit={(e) =>
              handleSubmit(
                "package",
                packageData,
                () => setPackageData(initialPackageFormData),
                e
              )
            }
          />
        </>
      ),
    },
    {
      name: "Service Charges",
      description: "Configure service charge percentages.",
      content: (
        <>
          {renderSettingList(SERVICE_CHARGE)}
          <CommonForm
            formData={serviceData}
            setformData={setServiceData}
            buttonText="Add"
            formControls={serviceChargeSettingsFormControls}
            onSubmit={(e) =>
              handleSubmit(
                "service",
                serviceData,
                () => setServiceData(initialServiceFormData),
                e
              )
            }
          />
        </>
      ),
    },
    {
      name: "Receipt Settings",
      description: "Manage receipt header, address, business #, and footer.",
      content: (
        <>
          {renderReceiptCurrent()}
          <CommonForm
            formData={receiptData}
            setformData={setReceiptData}
            buttonText="Save"
            formControls={receiptSettingstFormControls}
            onSubmit={handleReceiptSubmit}
          />
        </>
      ),
    },
    {
      name: "Payment Settings",
      description: "Enable/disable payment methods like UPI, Cash, Card.",
      content: <p>Coming soon…</p>,
    },
    {
      name: "Roundoff Settings",
      description: "Configure automatic rounding logic for bills.",
      content: <p>Coming soon…</p>,
    },
  ];

  return (
    
    <div className="p-4">
      <h1 className="text-2xl text-primary1 font-semibold mb-4">
        Admin Settings
      </h1>
      <p className="text-muted-foreground tracking-tight mb-6">
        Manage your business settings and preferences.
      </p>

      <div className="grid grid-cols-2 p-4 rounded-lg gap-4">
        {settingsItems.map((item, index) => (
          <Sheet
            key={index}
            open={open && selectedSetting?.name === item.name}
            onOpenChange={setOpen}
          >
            <SheetTrigger asChild>
              <div
                onClick={() => setSelectedSetting(item)}
                className="bg-white rounded-lg shadow-md p-4 hover:bg-gray-200 border-[1px] border-primary1 cursor-pointer"
              >
                <h2 className="text-lg text-primary1 font-semibold mb-2">
                  {item.name}
                </h2>
                <p className="text-muted-foreground text-xs">
                  {item.description}
                </p>
              </div>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto scrollbar-hidden">
              <SheetHeader>
                <SheetTitle className="text-primary1">{item.name}</SheetTitle>
                <SheetDescription>{item.description}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 p-4">{item.content}</div>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  );

  
}
