import { Timestamp } from "firebase/firestore";

// ─── User & Auth ────────────────────────────────────────────────────────────

export type UserRole = "farmer" | "buyer" | "expert" | "lgu" | "admin";

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  barangay?: string;
  municipality?: string;
  contactNumber?: string;
  isApproved: boolean;
  createdAt: string;
  // Farmer-specific
  farmName?: string;
  farmSize?: number;
  cropTypes?: string[];
  farmPhoto?: string;
  farmLocation?: { lat: number; lng: number };
  // LGU-specific
  office?: string;
  idNumber?: string;
  // Buyer-specific
  deliveryAddress?: string;
}

// ─── Products & Marketplace ──────────────────────────────────────────────────

export type ProductStatus = "active" | "sold" | "expired" | "draft";
export type ProductUnit = "kg" | "sack" | "piece" | "bundle" | "tray" | "liter";

export interface Product {
  id: string;
  farmerId: string;
  farmerName?: string;
  cropName: string;
  quantity: number;
  unit: ProductUnit;
  price: number;
  description?: string;
  photos: string[];
  status: ProductStatus;
  pickupAvailable: boolean;
  deliveryAvailable: boolean;
  availableDates?: string;
  location: {
    barangay: string;
    municipality: string;
    lat?: number;
    lng?: number;
  };
  viewCount: number;
  inquiryCount: number;
  createdAt: string;
  updatedAt?: string;
}

// ─── Orders ─────────────────────────────────────────────────────────────────

export type OrderStatus = "pending" | "confirmed" | "ready" | "completed" | "cancelled";

export interface OrderMessage {
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  farmerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unit: ProductUnit;
  totalPrice: number;
  deliveryNotes?: string;
  status: OrderStatus;
  messages: OrderMessage[];
  createdAt: string;
  updatedAt?: string;
}

// ─── Financial Tracker ───────────────────────────────────────────────────────

export type FinancialType = "income" | "expense";
export type IncomeCategory = "crop_sale" | "aid_received" | "other_income";
export type ExpenseCategory =
  | "seeds"
  | "fertilizer"
  | "labor"
  | "equipment"
  | "transport"
  | "other_expense";

export interface FinancialRecord {
  id: string;
  farmerId: string;
  type: FinancialType;
  amount: number;
  category: IncomeCategory | ExpenseCategory;
  date: string;
  notes?: string;
  createdAt: string;
}

// ─── Harvest Log ─────────────────────────────────────────────────────────────

export interface HarvestLog {
  id: string;
  farmerId: string;
  cropName: string;
  quantity: number;
  unit: ProductUnit;
  harvestDate: string;
  notes?: string;
  createdAt: string;
}

// ─── Aid Programs ────────────────────────────────────────────────────────────

export type AidType = "subsidy" | "loan" | "seed" | "training" | "other";
export type ApplicationStatus =
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected"
  | "resubmit";

export interface AidProgram {
  id: string;
  title: string;
  description: string;
  type: AidType;
  eligibility: string;
  requiredDocuments: string[];
  deadline: string;
  slotsAvailable: number;
  contactPerson: string;
  managedBy: string; // LGU uid
  isPublished: boolean;
  createdAt: string;
}

export interface AidApplication {
  id: string;
  farmerId: string;
  farmerName: string;
  programId: string;
  programTitle: string;
  status: ApplicationStatus;
  submittedDocs: string[]; // Cloudinary URLs
  referenceNumber: string;
  reviewerNotes?: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

// ─── Market Prices ───────────────────────────────────────────────────────────

export interface MarketPrice {
  id: string;
  cropName: string;
  pricePerKg: number;
  source: string;
  date: string;
  previousPrice?: number;
  updatedBy: string;
}

export interface PriceTrendEntry {
  date: string;
  price: number;
}

// ─── Forum ───────────────────────────────────────────────────────────────────

export interface ForumAnswer {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  body: string;
  upvotes: number;
  isBestAnswer: boolean;
  createdAt: string;
}

export interface ForumPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  title: string;
  body: string;
  tags: string[];
  answers: ForumAnswer[];
  answerCount: number;
  views: number;
  isResolved: boolean;
  createdAt: string;
}

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType =
  | "order_placed"
  | "order_confirmed"
  | "order_cancelled"
  | "order_completed"
  | "aid_status_changed"
  | "new_message"
  | "price_alert"
  | "forum_answer";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
