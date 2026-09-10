import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("customer"), // customer | admin | super_admin
  createdAt: text("created_at").notNull(),
});

export const organizers = sqliteTable("organizers", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company").notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  submittedAt: text("submitted_at").notNull(),
});

export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  venue: text("venue").notNull(),
  city: text("city").notNull(),
  date: text("date").notNull(),
  time: text("time"),
  genre: text("genre").notNull(),
  status: text("status").notNull().default("draft"), // draft | published
  organizerId: text("organizer_id"),
  highDemand: integer("high_demand", { mode: "boolean" }).notNull().default(false),
  purchaseLimit: integer("purchase_limit").notNull().default(4),
  description: text("description"),
  poster: text("poster"),
});

export const ticketCategories = sqliteTable("ticket_categories", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull(),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  quota: integer("quota").notNull(),
  sold: integer("sold").notNull().default(0),
});

export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  eventId: text("event_id").notNull(),
  categoryId: text("category_id").notNull(),
  qty: integer("qty").notNull(),
  total: integer("total").notNull(),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  status: text("status").notNull().default("paid"), // paid | refund_requested | refunded | blocked
  createdAt: text("created_at").notNull(),
  flagged: integer("flagged", { mode: "boolean" }).notNull().default(false),
  flagReason: text("flag_reason"),
});

export const refundRequests = sqliteTable("refund_requests", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull(),
  reason: text("reason").notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  createdAt: text("created_at").notNull(),
});

export const supportTickets = sqliteTable("support_tickets", {
  id: text("id").primaryKey(),
  buyerName: text("buyer_name").notNull(),
  buyerEmail: text("buyer_email").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull().default("open"), // open | closed
  createdAt: text("created_at").notNull(),
});

export const supportMessages = sqliteTable("support_messages", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull(),
  from: text("from").notNull(), // customer | admin
  text: text("text").notNull(),
  at: text("at").notNull(),
});

export const wishlist = sqliteTable("wishlist", {
  id: text("id").primaryKey(),
  buyerEmail: text("buyer_email").notNull(),
  eventId: text("event_id").notNull(),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  toEmail: text("to_email").notNull(),
  message: text("message").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
});
