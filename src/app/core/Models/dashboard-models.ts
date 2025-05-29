// Date range and filtering parameters
export interface DateRangeParams {
  period?: 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'year' | string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;
}

export interface ListParams extends DateRangeParams {
  limit?: number;
}

export interface ProductListParams extends ListParams {
  sortBy?: 'revenue' | 'quantity';
}

export interface SalesChartParams {
  year?: number; // Optional year for sales charts
}
export interface YearlySalesData {
  monthlySales: { month: number; totalRevenue: number; salesCount: number }[];
}

export interface MonthlySalesData {
  month: number;
  dailySales: { day: number; totalRevenue: number; salesCount: number }[];
}

export interface WeeklySalesData {
  week: number;
  dailySales: { date: string; totalRevenue: number; salesCount: number }[];
}

export interface SalesChartData {
  year: number;
  yearlySales: YearlySalesData;
  monthlySales: MonthlySalesData[];
  weeklySales: WeeklySalesData[];
}

export interface LowStockParams {
  threshold?: number;
  limit?: number;
}

// --- Response Models ---

// Generic API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Sales summary
export interface SalesSummaryData {
  totalRevenue: number;
  numberOfSales: number;
  averageOrderValue: number;
}

// Sales trends per day
export interface SalesTrendData {
  _id: string; // YYYY-MM-DD
  dailyRevenue: number;
  dailySalesCount: number;
}

// Product insights (used for low stock, top-selling, etc.)
export interface ProductInsightData {
  productId: string;
  title: string;
  slug?: string;
  thumbnail?: string;
  totalRevenue?: number;
  totalQuantitySold?: number;
  stock?: number;
  sku?: string;
  availabilityStatus?: string; // e.g. 'low_stock', 'out_of_stock'
}

// Inventory total value
export interface InventoryValueData {
  totalValue: number;
  totalItemsInStock: number;
}

// Customer insights (used for top buyers, outstanding payments, etc.)
export interface CustomerInsightData {
  _id: string;
  fullname: string;
  email?: string;
  mobileNumber?: string;
  remainingAmount?: number;
  totalPurchasedAmount?: number;
  periodPurchasedAmount?: number;
  totalPurchasedAmountGlobal?: number;
}

// Payment method summary
export interface PaymentMethodData {
  _id: string; // paymentMethod type (e.g. 'Cash', 'UPI')
  totalAmount: number;
  count: number;
}

// Reviews with linked user and product data
export interface ReviewData {
  _id: string;
  rating: number;
  userreview: string;
  createdAt: string;
  user: {
    _id: string;
    fullname: string;
    email?: string;
  };
  product: {
    _id: string;
    title: string;
    thumbnail?: string;
    slug?: string;
  };
}

// Consolidated dashboard summary
export interface ConsolidatedSummaryData {
  sales: SalesSummaryData;
  products: {
    lowStock: ProductInsightData[];
    topSelling: ProductInsightData[];
  };
  customers: {
    outstandingPayments: CustomerInsightData[];
    newCustomersCount: number;
  };
  payments: {
    totalReceived: number;
  };
}
