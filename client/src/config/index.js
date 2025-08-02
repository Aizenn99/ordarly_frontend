export const registerFormControls = [
  {
    name: "username",
    label: "User Name",
    placeholder: "Enter your user name",
    componentType: "input",
    type: "text",
  },
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
  {
    name: "role",
    label: "Role",
    componentType: "select",
    options: [
      { id: "staff", label: "Staff" },
      { id: "admin", label: "Admin" },
      { id: "kitchen", label: "Kitchen" },
    ],
    placeholder: "Select user role",
  }
];

export const loginFormControls = [
  {
    name: "email",
    label: "Email",
    placeholder: "Enter your email",
    componentType: "input",
    type: "email",
  },
  {
    name: "password",
    label: "Password",
    placeholder: "Enter your password",
    componentType: "input",
    type: "password",
  },
];

export const addMenuItemsFormControls = [
  {
    label: "Title",
    name: "title",
    componentType: "input",
    type: "text",
    placeholder: "Enter product title",
  },
  {
    label: "Description",
    name: "description",
    componentType: "textarea",
    placeholder: "Enter product description",
  },
  {
    label: "Category",
    name: "category",
    componentType: "select",
    options: [
     
    ],
  },
  {
    label: "Subcategory",
    name: "subcategory",
    componentType: "select",
    options: [
      
    ],
  },
  {
    label: "Price",
    name: "price",
    componentType: "input",
    type: "number",
    placeholder: "Enter product price",
  },
];

export const addCategoryFormControls = [
  {
    label: "Category Name",
    name: "name",
    componentType: "input",
    type: "text",
    placeholder: "Enter category name",
  }
];

export const addSubCategoryFormControls = [
  {
    label: "Subcategory Name",
    name: "name",
    componentType: "input",
    type: "text",
    placeholder: "Enter subcategory name",
  }
];

export const addTableFormControls = [
  {
    label: "Table Name",
    name: "tableName",
    componentType: "input",
    type: "text",
    placeholder: "Enter table name",
  },
  {
    label: "Capacity",
    name: "capacity",
    componentType: "input",
    type: "number",
    placeholder: "Enter table capacity",
  },
  {
    label: "Status",
    name: "status",
    componentType: "select",
    options: [
      { id: "1", label: "available" },
      { id: "2", label: "reserved" },
      { id: "3", label: "occupied" },
    ],
  },
  {
    label: "Spaces",
    name: "spaces",
    componentType: "select",
    options: [
      
    ],
  },
];

export const taxSettingsFormControls = [
  {
    label: "Tax Name",
    name: "taxName",
    componentType: "input",
    type: "text",
    placeholder: "Enter Tax Name",
  },
  {
    label: "Tax Percentage",
    name: "taxPercentage",
    componentType: "input",
    type: "number",
    placeholder: "Enter Tax Percentage",
  },
]

export const deliverySettingsFormControls = [
  {
    label: "Delivery Charge",
    name: "deliveryCharge",
    componentType: "input",
    type: "number",
    placeholder: "Enter Delivery Charge",
  },
  {
    label: "Delivery Zones",
    name: "deliveryZones",
    componentType: "input",
    type: "text",
    placeholder: "Enter Delivery Zones (comma separated)",
  },
];

export const DiscountSettingsFormControls = [
  {
    label: "Discount Name",
    name: "discountName",
    componentType: "input",
    type: "text",
    placeholder: "Enter Discount Name",
  },
  {
    label: "Discount Percentage",
    name: "discountPercentage",
    componentType: "input",
    type: "number",
    placeholder: "Enter Discount Percentage",
  },
];

export const PackageSettingsFormControls = [
  {
    label: "Package Name",
    name: "packageName",
    componentType: "input",
    type: "text",
    placeholder: "Enter Package Name",
  },
  {
    label: "Package Price",
    name: "packagePrice",
    componentType: "input",
    type: "number",
    placeholder: "Enter Package Price",
  },
];

export const serviceChargeSettingsFormControls = [
  {
    label: "Service Charge Name",
    name: "serviceName",
    componentType: "input",
    type: "text",
    placeholder: "Charge Name",
  },
  {
    label: "Service Charge Percentage",
    name: "servicePrice",
    componentType: "input",
    type: "number",
    placeholder: "Percentage",
  },
];

export const receiptSettingstFormControls = [
  {
    label: "Receipt Header",
    name: "receiptHeader",
    componentType: "input",
    type: "text",
    placeholder: "Enter receipt header",
  },
  {
    label: "Business Number",
    name: "businessNumber",
    componentType: "input",
    type: "text",
    placeholder: "Enter business number",
  },
  {
    label: "Receipt Address",
    name: "receiptAddress",
    componentType: "input",
    type: "text",
    placeholder: "Enter receipt address",

  },
  {
    label: "Receipt Footer",
    name: "receiptFooter",
    componentType: "input",
    type: "text",
    placeholder: "Enter receipt footer",
  },

];


export const addSpacesFormControls = [
  {
    
    label: "SpaceName",
    name: "SpaceName",
    componentType: "input",
    type: "text",
    placeholder: "Enter space name",
  }
];