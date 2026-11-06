import { Platform } from "react-native";

// Automatically select localhost for iOS / Web and 10.0.2.2 for Android Emulator
const DEFAULT_HOST = Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000";
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_HOST;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
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

  // Wishlist
  getWishlist: () => request<any[]>("/api/wishlist"),
  toggleWishlist: (eventId: string) =>
    request<{ wished: boolean }>("/api/wishlist", {
      method: "POST",
      body: JSON.stringify({ eventId }),
    }),

  // Auth
  register: (payload: any) =>
    request<{ message: string; user: any }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

