// Platform types
export type MessengerPlatform = "telegram" | "facebook";

// Base entity interface with common fields
interface BaseEntity {
  id: number;
  created_at: Date;
  updated_at: Date;
}

// User entity
export interface User extends BaseEntity {
  platform_id: string;
  platform_type: MessengerPlatform;
  name: string;
  abn: string;
  email?: string;
  gst_registered: boolean;
  last_invoice_number: number;
}

// Client entity
export interface Client extends BaseEntity {
  user_id: number;
  name: string;
  abn?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_favorite: boolean;
  last_invoice_date?: Date;
}

// Invoice status type
export type InvoiceStatus = "draft" | "sent" | "paid" | "cancelled";

// Invoice entity
export interface Invoice extends BaseEntity {
  user_id: number;
  client_id: number;
  invoice_number: number;
  date: Date;
  description: string;
  amount: number;
  gst_amount?: number;
  gst_included: boolean;
  pdf_url: string;
  status: InvoiceStatus;
}

// Request types for API endpoints
export interface CreateClientRequest {
  name: string;
  abn?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface CreateInvoiceRequest {
  client_id: number;
  description: string;
  amount: number;
  gst_included: boolean;
  date?: Date; // If not provided, will use current date
}

// Response types
export interface ClientWithInvoiceCount extends Client {
  invoice_count: number;
  total_amount: number;
}

export interface InvoiceWithClientDetails extends Invoice {
  client: Client;
}
