import { Platform } from "react-native";

// Automatically select localhost for iOS / Web and 10.0.2.2 for Android Emulator
const DEFAULT_HOST = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;

let activeAuthToken = "";
let activeUserEmail = "dinda@example.com";
let activeUserId = "";

export function setApiAuth(token: string, email: string, userId?: string) {
  activeAuthToken = token;
  activeUserEmail = email;
  if (userId) activeUserId = userId;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(activeAuthToken ? { Authorization: `Bearer ${activeAuthToken}` } : {}),
    ...(activeUserEmail ? { "x-user-email": activeUserEmail } : {}),
    ...(activeUserId ? { "x-user-id": activeUserId } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (payload: { email: string; password: string }) =>
    request<{ success: boolean; token: string; user: any }>("/api/auth/mobile-login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  register: (payload: any) =>
    request<{ message: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Events
  getEvents: () => request<any[]>("/api/events"),
  getEvent: (id: string) => request<any>(`/api/events/${id}`),

  // Queue
  joinQueue: (eventId: string) =>
    request<{ queueToken: string; queueNumber: number; status: string; position: number; estimatedWaitSeconds: number }>("/api/queue/join", {
      method: "POST",
      body: JSON.stringify({ eventId }),
    }),
  getQueueStatus: (token: string) =>
    request<{ status: string; queueNumber: number; position?: number; estimatedWaitSeconds?: number; canCheckout: boolean }>(`/api/queue/status?token=${token}`),

  // Checkout & Orders
  checkout: (payload: any) =>
    request<any>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getOrder: (id: string) => request<any>(`/api/orders/${id}`),

  // Tickets
  getMyTickets: () => request<any[]>("/api/tickets"),
  getTicketDetail: (id: string) => request<any>(`/api/tickets/${id}`),

  // Refund & Checkin
  requestRefund: (
    orderId: string,
    payload: {
      reason: string;
      bankName: string;
      bankAccountNo: string;
      bankAccountName: string;
    }
  ) =>
    request<any>(`/api/orders/${orderId}/refund`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  validateCheckIn: (payload: {
    ticketCode: string;
    dynamicQrToken: string;
    gateName?: string;
  }) =>
    request<any>("/api/checkin/validate", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // Wishlist
  getWishlist: () => request<any[]>("/api/wishlist"),
  toggleWishlist: (eventId: string) =>
    request<{ wished: boolean }>("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ eventId }),
    }),
};
