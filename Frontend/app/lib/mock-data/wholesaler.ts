export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  unit: "kg" | "liter" | "piece" | "box" | "packet";
  description?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Order {
  id: string;
  retailerId: string;
  retailerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "approved" | "rejected" | "completed";
  orderDate: string;
  notes?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  retailerName: string;
  amount: number;
  paymentMode: "cash" | "upi" | "bank_transfer" | "cheque";
  transactionId?: string;
  paymentDate: string;
  status: "pending" | "completed" | "failed";
  notes?: string;
}

export interface Invoice {
  invoiceNumber: string;
  orderId: string;
  wholesalerName: string;
  wholesalerAddress: string;
  wholesalerGST?: string;
  retailerName: string;
  retailerAddress: string;
  retailerGST?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  totalAmount: number;
  invoiceDate: string;
}

// Mock Products
export const mockProducts: Product[] = [
  {
    id: "P001",
    name: "Basmati Rice",
    category: "Grains",
    price: 85,
    stock: 500,
    unit: "kg",
    description: "Premium quality basmati rice",
  },
  {
    id: "P002",
    name: "Wheat Flour",
    category: "Grains",
    price: 45,
    stock: 800,
    unit: "kg",
    description: "Whole wheat flour",
  },
  {
    id: "P003",
    name: "Sunflower Oil",
    category: "Cooking Oil",
    price: 180,
    stock: 300,
    unit: "liter",
    description: "Refined sunflower oil",
  },
  {
    id: "P004",
    name: "Sugar",
    category: "Sweeteners",
    price: 42,
    stock: 600,
    unit: "kg",
    description: "White crystal sugar",
  },
  {
    id: "P005",
    name: "Tea Powder",
    category: "Beverages",
    price: 320,
    stock: 150,
    unit: "kg",
    description: "Premium tea powder",
  },
  {
    id: "P006",
    name: "Toor Dal",
    category: "Pulses",
    price: 120,
    stock: 400,
    unit: "kg",
    description: "Yellow toor dal",
  },
  {
    id: "P007",
    name: "Red Chilli Powder",
    category: "Spices",
    price: 280,
    stock: 200,
    unit: "kg",
    description: "Pure red chilli powder",
  },
  {
    id: "P008",
    name: "Turmeric Powder",
    category: "Spices",
    price: 240,
    stock: 180,
    unit: "kg",
    description: "Pure turmeric powder",
  },
  {
    id: "P009",
    name: "Salt",
    category: "Seasonings",
    price: 20,
    stock: 1000,
    unit: "kg",
    description: "Iodized salt",
  },
  {
    id: "P010",
    name: "Biscuits Pack",
    category: "Snacks",
    price: 150,
    stock: 250,
    unit: "box",
    description: "Assorted biscuits - 24 packets per box",
  },
];

// Mock Orders
export const mockOrders: Order[] = [
  {
    id: "ORD001",
    retailerId: "R001",
    retailerName: "Local Mart",
    items: [
      {
        productId: "P001",
        productName: "Basmati Rice",
        quantity: 50,
        price: 85,
        total: 4250,
      },
      {
        productId: "P003",
        productName: "Sunflower Oil",
        quantity: 20,
        price: 180,
        total: 3600,
      },
    ],
    totalAmount: 7850,
    status: "pending",
    orderDate: "2024-01-15",
    notes: "Urgent delivery required",
  },
  {
    id: "ORD002",
    retailerId: "R002",
    retailerName: "City Stores",
    items: [
      {
        productId: "P002",
        productName: "Wheat Flour",
        quantity: 100,
        price: 45,
        total: 4500,
      },
      {
        productId: "P004",
        productName: "Sugar",
        quantity: 75,
        price: 42,
        total: 3150,
      },
    ],
    totalAmount: 7650,
    status: "pending",
    orderDate: "2024-01-15",
  },
  {
    id: "ORD003",
    retailerId: "R003",
    retailerName: "Quick Shop",
    items: [
      {
        productId: "P005",
        productName: "Tea Powder",
        quantity: 15,
        price: 320,
        total: 4800,
      },
    ],
    totalAmount: 4800,
    status: "approved",
    orderDate: "2024-01-14",
  },
  {
    id: "ORD004",
    retailerId: "R004",
    retailerName: "Super Bazaar",
    items: [
      {
        productId: "P006",
        productName: "Toor Dal",
        quantity: 60,
        price: 120,
        total: 7200,
      },
      {
        productId: "P007",
        productName: "Red Chilli Powder",
        quantity: 25,
        price: 280,
        total: 7000,
      },
      {
        productId: "P008",
        productName: "Turmeric Powder",
        quantity: 20,
        price: 240,
        total: 4800,
      },
    ],
    totalAmount: 19000,
    status: "completed",
    orderDate: "2024-01-12",
  },
  {
    id: "ORD005",
    retailerId: "R001",
    retailerName: "Local Mart",
    items: [
      {
        productId: "P009",
        productName: "Salt",
        quantity: 100,
        price: 20,
        total: 2000,
      },
      {
        productId: "P010",
        productName: "Biscuits Pack",
        quantity: 30,
        price: 150,
        total: 4500,
      },
    ],
    totalAmount: 6500,
    status: "completed",
    orderDate: "2024-01-10",
  },
  {
    id: "ORD006",
    retailerId: "R005",
    retailerName: "Express Retail",
    items: [
      {
        productId: "P001",
        productName: "Basmati Rice",
        quantity: 80,
        price: 85,
        total: 6800,
      },
    ],
    totalAmount: 6800,
    status: "rejected",
    orderDate: "2024-01-13",
    notes: "Insufficient stock",
  },
  {
    id: "ORD007",
    retailerId: "R002",
    retailerName: "City Stores",
    items: [
      {
        productId: "P003",
        productName: "Sunflower Oil",
        quantity: 40,
        price: 180,
        total: 7200,
      },
      {
        productId: "P004",
        productName: "Sugar",
        quantity: 50,
        price: 42,
        total: 2100,
      },
    ],
    totalAmount: 9300,
    status: "approved",
    orderDate: "2024-01-14",
  },
  {
    id: "ORD008",
    retailerId: "R006",
    retailerName: "Mega Mart",
    items: [
      {
        productId: "P010",
        productName: "Biscuits Pack",
        quantity: 50,
        price: 150,
        total: 7500,
      },
    ],
    totalAmount: 7500,
    status: "pending",
    orderDate: "2024-01-15",
  },
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: "PAY001",
    orderId: "ORD004",
    retailerName: "Super Bazaar",
    amount: 19000,
    paymentMode: "bank_transfer",
    transactionId: "TXN123456789",
    paymentDate: "2024-01-13",
    status: "completed",
  },
  {
    id: "PAY002",
    orderId: "ORD005",
    retailerName: "Local Mart",
    amount: 6500,
    paymentMode: "upi",
    transactionId: "UPI987654321",
    paymentDate: "2024-01-11",
    status: "completed",
  },
  {
    id: "PAY003",
    orderId: "ORD003",
    retailerName: "Quick Shop",
    amount: 4800,
    paymentMode: "cash",
    paymentDate: "2024-01-14",
    status: "pending",
  },
  {
    id: "PAY004",
    orderId: "ORD007",
    retailerName: "City Stores",
    amount: 9300,
    paymentMode: "cheque",
    transactionId: "CHQ445566",
    paymentDate: "2024-01-15",
    status: "pending",
  },
];

// Mock Invoices
export const mockInvoices: Invoice[] = [
  {
    invoiceNumber: "INV-2024-001",
    orderId: "ORD004",
    wholesalerName: "Prime Wholesale Distributors",
    wholesalerAddress: "123 Main Hall Street, Mumbai - 400001",
    wholesalerGST: "27AABCU9603R1ZX",
    retailerName: "Super Bazaar",
    retailerAddress: "456 Market Road, Mumbai - 400002",
    retailerGST: "27AABCU9603R1ZY",
    items: [
      {
        productId: "P006",
        productName: "Toor Dal",
        quantity: 60,
        price: 120,
        total: 7200,
      },
      {
        productId: "P007",
        productName: "Red Chilli Powder",
        quantity: 25,
        price: 280,
        total: 7000,
      },
      {
        productId: "P008",
        productName: "Turmeric Powder",
        quantity: 20,
        price: 240,
        total: 4800,
      },
    ],
    subtotal: 19000,
    tax: 2280,
    totalAmount: 21280,
    invoiceDate: "2024-01-13",
  },
  {
    invoiceNumber: "INV-2024-002",
    orderId: "ORD005",
    wholesalerName: "Prime Wholesale Distributors",
    wholesalerAddress: "123 Main Hall Street, Mumbai - 400001",
    wholesalerGST: "27AABCU9603R1ZX",
    retailerName: "Local Mart",
    retailerAddress: "789 Local Street, Mumbai - 400003",
    retailerGST: "27AABCU9603R1ZZ",
    items: [
      {
        productId: "P009",
        productName: "Salt",
        quantity: 100,
        price: 20,
        total: 2000,
      },
      {
        productId: "P010",
        productName: "Biscuits Pack",
        quantity: 30,
        price: 150,
        total: 4500,
      },
    ],
    subtotal: 6500,
    tax: 780,
    totalAmount: 7280,
    invoiceDate: "2024-01-11",
  },
];

// Dashboard Stats
export interface DashboardStats {
  totalProducts: number;
  pendingOrders: number;
  approvedOrders: number;
  completedOrders: number;
  totalRevenue: number;
  lowStockProducts: number;
}

export const getDashboardStats = (
  products: Product[],
  orders: Order[]
): DashboardStats => {
  return {
    totalProducts: products.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    approvedOrders: orders.filter((o) => o.status === "approved").length,
    completedOrders: orders.filter((o) => o.status === "completed").length,
    totalRevenue: orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.totalAmount, 0),
    lowStockProducts: products.filter((p) => p.stock < 100).length,
  };
};
