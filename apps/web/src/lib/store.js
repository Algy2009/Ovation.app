"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

const DataContext = createContext(null);

async function api(path, options) {
  const res = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.error || "Terjadi kesalahan. Coba lagi.");
  }
  return body;
}

export function DataProvider({ children }) {
  const { data: authData, status } = useSession();
  const role = authData?.user?.role;
  const email = authData?.user?.email;
  const isStaff = role === "admin" || role === "super_admin";
  const isCustomer = role === "customer";

  const [events, setEvents] = useState([]);
  const [organizers, setOrganizers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [refundRequests, setRefundRequests] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [eventsLoaded, setEventsLoaded] = useState(false);

  const refreshEvents = useCallback(async () => {
    const rows = await api("/api/events");
    setEvents(rows);
    setEventsLoaded(true);
  }, []);

  const refreshOrganizers = useCallback(async () => {
    setOrganizers(await api("/api/organizers"));
  }, []);
  const refreshOrders = useCallback(async () => {
    const qs = isStaff ? "" : "?mine=1";
    setOrders(await api(`/api/orders${qs}`));
  }, [isStaff]);
  const refreshRefunds = useCallback(async () => {
    setRefundRequests(await api("/api/refunds"));
  }, []);
  const refreshSupport = useCallback(async () => {
    const qs = isStaff ? "" : "?mine=1";
    setSupportTickets(await api(`/api/support${qs}`));
  }, [isStaff]);
  const refreshWishlist = useCallback(async () => {
    setWishlist(await api("/api/wishlist"));
  }, []);
  const refreshNotifications = useCallback(async () => {
    setNotifications(await api("/api/notifications"));
  }, []);

  // Public data: always load once.
  useEffect(() => {
    refreshEvents().catch(() => {});
  }, [refreshEvents]);

  // Session-scoped data: load once we know who's signed in (or that no one is).
  useEffect(() => {
    if (status === "loading") return;
    if (isStaff) {
      refreshOrganizers().catch(() => {});
      refreshOrders().catch(() => {});
      refreshRefunds().catch(() => {});
      refreshSupport().catch(() => {});
    } else {
      setOrganizers([]);
      setRefundRequests([]);
    }
    if (isCustomer) {
      refreshOrders().catch(() => {});
      refreshSupport().catch(() => {});
      refreshWishlist().catch(() => {});
    } else if (!isStaff) {
      setOrders([]);
      setSupportTickets([]);
      setWishlist([]);
    }
    if (authData?.user) {
      refreshNotifications().catch(() => {});
    } else {
      setNotifications([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, role, email]);

  const api_ = useMemo(() => {
    return {
      loading: !eventsLoaded,
      events,
      organizers,
      orders,
      refundRequests,
      supportTickets,
      wishlist,
      notifications,

      // ---------- events ----------
      async addEvent(event) {
        const { id } = await api("/api/events", { method: "POST", body: JSON.stringify(event) });
        await refreshEvents();
        return id;
      },
      async updateEvent(id, patch) {
        await api(`/api/events/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
        await refreshEvents();
      },
      async deleteEvent(id) {
        await api(`/api/events/${id}`, { method: "DELETE" });
        await refreshEvents();
      },
      getEvent(id) {
        return events.find((e) => e.id === id) ?? null;
      },
      async addCategory(eventId, category) {
        await api(`/api/events/${eventId}/categories`, { method: "POST", body: JSON.stringify(category) });
        await refreshEvents();
      },
      async updateCategory(eventId, categoryId, patch) {
        await api(`/api/events/${eventId}/categories/${categoryId}`, { method: "PATCH", body: JSON.stringify(patch) });
        await refreshEvents();
      },
      async deleteCategory(eventId, categoryId) {
        await api(`/api/events/${eventId}/categories/${categoryId}`, { method: "DELETE" });
        await refreshEvents();
      },

      // ---------- organizers ----------
      async approveOrganizer(id) {
        await api(`/api/organizers/${id}`, { method: "PATCH", body: JSON.stringify({ status: "approved" }) });
        await refreshOrganizers();
      },
      async rejectOrganizer(id) {
        await api(`/api/organizers/${id}`, { method: "PATCH", body: JSON.stringify({ status: "rejected" }) });
        await refreshOrganizers();
      },

      // ---------- orders ----------
      getOrdersFor(buyerEmail) {
        return orders
          .filter((o) => o.buyerEmail === buyerEmail)
          .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
      },
      getOrder(id) {
        return orders.find((o) => o.id === id) ?? null;
      },
      async createOrder({ eventId, categoryId, qty }) {
        const { id } = await api("/api/orders", {
          method: "POST",
          body: JSON.stringify({ eventId, categoryId, qty }),
        });
        await Promise.all([refreshEvents(), refreshOrders(), refreshNotifications()]);
        return id;
      },
      async requestRefund(orderId, refundInput) {
        const payload =
          typeof refundInput === "string"
            ? { reason: refundInput, bankName: "BCA", bankAccountNumber: "1234567890", bankAccountHolder: "Customer" }
            : refundInput;
        await api("/api/refunds", {
          method: "POST",
          body: JSON.stringify({ orderId, ...payload }),
        });
        await Promise.all([refreshOrders(), refreshRefunds()]);
      },
      async approveRefund(refundId) {
        await api(`/api/refunds/${refundId}`, { method: "PATCH", body: JSON.stringify({ status: "SUPERADMIN_APPROVED" }) });
        await Promise.all([refreshRefunds(), refreshOrders()]);
      },
      async rejectRefund(refundId) {
        await api(`/api/refunds/${refundId}`, { method: "PATCH", body: JSON.stringify({ status: "REJECTED" }) });
        await Promise.all([refreshRefunds(), refreshOrders()]);
      },
      async blockOrder(orderId) {
        await api(`/api/orders/${orderId}`, { method: "PATCH", body: JSON.stringify({ status: "CANCELLED" }) });
        await refreshOrders();
      },
      async clearFlag(orderId) {
        await api(`/api/orders/${orderId}`, { method: "PATCH", body: JSON.stringify({ flagged: false }) });
        await refreshOrders();
      },

      // ---------- wishlist ----------
      isWishlisted(buyerEmail, eventId) {
        return wishlist.some((w) => w.eventId === eventId);
      },
      async toggleWishlist(_buyerEmail, eventId) {
        await api("/api/wishlist", { method: "POST", body: JSON.stringify({ eventId }) });
        await refreshWishlist();
      },
      getWishlistFor() {
        const ids = wishlist.map((w) => w.eventId);
        return events.filter((e) => ids.includes(e.id));
      },

      // ---------- support ----------
      async createTicket({ subject, message }) {
        await api("/api/support", { method: "POST", body: JSON.stringify({ subject, message }) });
        await refreshSupport();
      },
      async replyTicket(ticketId, text) {
        await api(`/api/support/${ticketId}/messages`, { method: "POST", body: JSON.stringify({ text }) });
        await Promise.all([refreshSupport(), refreshNotifications()]);
      },
      async closeTicket(ticketId) {
        await api(`/api/support/${ticketId}`, { method: "PATCH", body: JSON.stringify({ status: "closed" }) });
        await refreshSupport();
      },
      getTicketsFor(buyerEmail) {
        return supportTickets.filter((t) => t.buyerEmail === buyerEmail);
      },

      // ---------- notifications ----------
      getNotificationsFor() {
        return notifications;
      },
      async markNotificationsRead() {
        await api("/api/notifications", { method: "PATCH" });
        await refreshNotifications();
      },
    };
  }, [
    eventsLoaded,
    events,
    organizers,
    orders,
    refundRequests,
    supportTickets,
    wishlist,
    notifications,
    refreshEvents,
    refreshOrganizers,
    refreshOrders,
    refreshRefunds,
    refreshSupport,
    refreshWishlist,
    refreshNotifications,
  ]);

  return <DataContext.Provider value={api_}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}
