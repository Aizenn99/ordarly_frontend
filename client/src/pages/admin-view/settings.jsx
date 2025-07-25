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

// ✅ Initial Form States
const initialTaxFormData = { taxPercentage: "", taxName: "" };
const initialDeliveryFormData = { deliveryCharge: "", deliveryZones: "" };
const initialDiscountFormData = { discountName: "", discountPercentage: "" };
const initialPackageFormData = { packageName: "", packagePrice: "" };
const initialServiceFormData = { serviceName: "", servicePrice: "" };
const initialReceiptFormData = {
  receiptHeader: "",
  bussinessNumber: "",
  receiptFooter: "",
  receiptAddress: "",
};

const AdminSettings = () => {
  const dispatch = useDispatch();
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [open, setOpen] = useState(false);

  const [taxFormData, setTaxFormData] = useState(initialTaxFormData);
  const [deliveryData, setDeliveryData] = useState(initialDeliveryFormData);
  const [discountData, setDiscountData] = useState(initialDiscountFormData);
  const [packageData, setPackageData] = useState(initialPackageFormData);
  const [serviceData, setServiceData] = useState(initialServiceFormData);
  const [receiptData, setReceiptData] = useState(initialReceiptFormData);

  const {
    TAX = [],
    DELIVERY = [],
    DISCOUNT = [],
    PACKAGE = [],
    SERVICE_CHARGE = [],
    RECEIPT = [],
  } = useSelector((state) => state.adminSettings);

  const handleSubmit = async (type, data, resetFunc, e) => {
    try {
      e.preventDefault();

      let mappedData = { type: type.toUpperCase() };

      switch (type) {
        case "tax":
          mappedData.name = data.taxName;
          mappedData.value = Number(data.taxPercentage);
          mappedData.unit = "PERCENTAGE";
          break;
        case "delivery":
          mappedData.name = "Delivery Zones";
          mappedData.value = Number(data.deliveryCharge);
          mappedData.unit = "AMOUNT";
          break;
        case "discount":
          mappedData.name = data.discountName;
          mappedData.value = Number(data.discountPercentage);
          mappedData.unit = "PERCENTAGE";
          break;
        case "package":
          mappedData.name = data.packageName;
          mappedData.value = Number(data.packagePrice);
          mappedData.unit = "AMOUNT";
          break;
        case "service":
          mappedData.type = "SERVICE_CHARGE"; // 👈 force correct backend expected type
          mappedData.name = data.serviceName;
          mappedData.value = Number(data.servicePrice);
          mappedData.unit = "PERCENTAGE";
          break;
        case "receipt":
          mappedData.name = "Receipt Template";
          mappedData.value = data;
          mappedData.unit = "TEMPLATE";
          break;
        default:
          break;
      }

      await dispatch(addSetting(mappedData)).unwrap();
      toast.success(`${type.toUpperCase()} setting added successfully`);
      resetFunc();
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add setting");
    }
  };

  useEffect(() => {
    dispatch(fetchSettings("TAX"));
    dispatch(fetchSettings("DELIVERY"));
    dispatch(fetchSettings("DISCOUNT"));
    dispatch(fetchSettings("PACKAGE"));
    dispatch(fetchSettings("SERVICE_CHARGE"));
    dispatch(fetchSettings("RECEIPT"));
  }, [dispatch]);

  const renderSettingList = (items = []) => (
    <div className="overflow-y-auto max-h-64 mb-4">
      {items.length > 0 ? (
        items.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between border-b px-2 mb-2 py-1"
          >
            <span className="text-sm">{item.name || item.type}</span>
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
      description: "Configure delivery options and fees for your orders.",
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
      description: "Set up and manage discount codes and promotions.",
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
      description: "Manage package options and settings for your business.",
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
      name: "Service Charges Settings",
      description: "Configure service charges for your orders.",
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
      description: "Manage receipt settings and templates for your business.",
      content: (
        <>
          {renderSettingList(RECEIPT)}
          <CommonForm
            formData={receiptData}
            setformData={setReceiptData}
            buttonText="Add"
            formControls={receiptSettingstFormControls}
            onSubmit={(e) =>
              handleSubmit(
                "receipt",
                receiptData,
                () => setReceiptData(initialReceiptFormData),
                e
              )
            }
          />
        </>
      ),
    },
    {
      name: "Payment Settings",
      description: "Manage payment methods and settings for your business.",
      content: <p>Enable/disable payment methods like UPI, Cash, Card.</p>,
    },
    {
      name: "Roundoff Settings",
      description: "Configure roundoff settings for your bills.",
      content: <p>Enable auto round-off and rounding logic.</p>,
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
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="text-primary1">{item.name}</SheetTitle>
                <SheetDescription>{item.description}</SheetDescription>
              </SheetHeader>
              <div className="mt-4 p-3">{item.content}</div>
            </SheetContent>
          </Sheet>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
