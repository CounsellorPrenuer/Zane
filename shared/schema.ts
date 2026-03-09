import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, decimal, index, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table - Required for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - Updated for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  phone: text("phone"),
  role: text("role").notNull().default('client'), // client, admin
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Consultations table - now supports public submissions
export const consultations = pgTable("consultations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Now nullable for public submissions
  // Contact information for public submissions
  contactName: varchar("contact_name").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone"),
  serviceType: text("service_type").notNull(), // career_guidance, admission_support, holistic_learning
  preferredDate: timestamp("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  duration: integer("duration").notNull().default(60), // minutes
  status: text("status").notNull().default('pending'), // pending, confirmed, completed, cancelled
  notes: text("notes"),
  meetingLink: text("meeting_link"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Workshops table
export const workshops = pgTable("workshops", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // seminar, workshop, webinar
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull(), // minutes
  capacity: integer("capacity").notNull(),
  registeredCount: integer("registered_count").notNull().default(0),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default('active'), // active, cancelled, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Workshop registrations - now supports public submissions
export const workshopRegistrations = pgTable("workshop_registrations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Now nullable for public submissions
  workshopId: varchar("workshop_id").references(() => workshops.id),
  workshopTitle: text("workshop_title").notNull(), // For frontend workshops
  // Contact information for public registrations
  contactName: varchar("contact_name").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone"),
  registrationDate: timestamp("registration_date").notNull().defaultNow(),
  status: text("status").notNull().default('pending'), // pending, confirmed, cancelled
  notes: text("notes"),
});

// Payment plans
export const paymentPlans = pgTable("payment_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(), // Student Plan, Professional Plan
  type: text("type").notNull(), // student, professional
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  features: text("features").array().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User subscriptions
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  planId: varchar("plan_id").references(() => paymentPlans.id).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  status: text("status").notNull().default('active'), // active, expired, cancelled
  paymentId: text("payment_id"),
  razorpaySubscriptionId: text("razorpay_subscription_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Payments table - tracks all payment transactions
export const payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Can be null for guest payments
  // Contact information for guest payments
  contactName: varchar("contact_name"),
  contactEmail: varchar("contact_email"),
  contactPhone: varchar("contact_phone"),

  // Payment details
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default('INR'),
  paymentType: text("payment_type").notNull(), // consultation, workshop, subscription
  referenceId: varchar("reference_id"), // ID of consultation, workshop, or subscription

  // Payment gateway details
  paymentGateway: text("payment_gateway").notNull().default('razorpay'), // razorpay, stripe, paypal
  gatewayPaymentId: text("gateway_payment_id"),
  gatewayOrderId: text("gateway_order_id"),

  // Payment status and metadata
  status: text("status").notNull().default('pending'), // pending, completed, failed, cancelled, refunded
  paymentMethod: text("payment_method"), // card, netbanking, upi, wallet
  description: text("description"),
  notes: jsonb("notes"), // Additional payment metadata

  // Timestamps
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Blogs table - for content management
export const blogs = pgTable("blogs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  summary: text("summary"), // Short excerpt for previews
  slug: text("slug").notNull().unique(), // URL-friendly version of title
  status: text("status").notNull().default('draft'), // draft, published, archived
  author: text("author").notNull(), // Author name
  featured: boolean("featured").notNull().default(false), // Featured blog posts
  tags: text("tags").array().default([]), // Array of tags
  metaTitle: text("meta_title"), // SEO meta title
  metaDescription: text("meta_description"), // SEO meta description
  readingTime: integer("reading_time"), // Estimated reading time in minutes
  publishedAt: timestamp("published_at"), // When the blog was published
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Coupons table
export const coupons = pgTable("coupons", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: varchar("code").notNull().unique(),
  discountType: text("discount_type").notNull(), // percentage, fixed
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  minBookingAmount: decimal("min_booking_amount", { precision: 10, scale: 2 }).default('0'),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }), // Useful for percentage discounts
  expiryDate: timestamp("expiry_date"),
  isActive: boolean("is_active").notNull().default(true),
  usageCount: integer("usage_count").notNull().default(0),
  usageLimit: integer("usage_limit"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Contact messages table - for contact form submissions
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  status: text("status").notNull().default('unread'), // unread, read, replied
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Mentoria bookings table - for Mentoria program purchases
export const mentoriaBookings = pgTable("mentoria_bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id), // Nullable for guest purchases

  // Contact information
  contactName: varchar("contact_name").notNull(),
  contactEmail: varchar("contact_email").notNull(),
  contactPhone: varchar("contact_phone").notNull(),

  // Program details
  category: text("category").notNull(), // 8-9, 10-12, graduates, professionals
  tier: text("tier").notNull(), // standard, premium
  programName: text("program_name").notNull(), // Discover, Achieve, Ascend, Advance
  // Pricing after discount
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
  discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
  couponCode: text("coupon_code"),

  // Payment details
  paymentId: varchar("payment_id").references(() => payments.id),
  orderId: text("order_id"), // Razorpay order ID for verification
  paymentStatus: text("payment_status").notNull().default('pending'), // pending, completed, failed

  // Booking status
  status: text("status").notNull().default('pending'), // pending, confirmed, completed, cancelled
  notes: text("notes"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  consultations: many(consultations),
  workshopRegistrations: many(workshopRegistrations),
  subscriptions: many(subscriptions),
  payments: many(payments),
  mentoriaBookings: many(mentoriaBookings),
}));

export const consultationsRelations = relations(consultations, ({ one }) => ({
  user: one(users, {
    fields: [consultations.userId],
    references: [users.id],
  }),
}));

export const workshopsRelations = relations(workshops, ({ many }) => ({
  registrations: many(workshopRegistrations),
}));

export const workshopRegistrationsRelations = relations(workshopRegistrations, ({ one }) => ({
  user: one(users, {
    fields: [workshopRegistrations.userId],
    references: [users.id],
  }),
  workshop: one(workshops, {
    fields: [workshopRegistrations.workshopId],
    references: [workshops.id],
  }),
}));

export const paymentPlansRelations = relations(paymentPlans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
  plan: one(paymentPlans, {
    fields: [subscriptions.planId],
    references: [paymentPlans.id],
  }),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
}));

export const mentoriaBookingsRelations = relations(mentoriaBookings, ({ one }) => ({
  user: one(users, {
    fields: [mentoriaBookings.userId],
    references: [users.id],
  }),
  payment: one(payments, {
    fields: [mentoriaBookings.paymentId],
    references: [payments.id],
  }),
}));

// Note: Blogs don't have relations since author is stored as text

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkshopSchema = createInsertSchema(workshops).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWorkshopRegistrationSchema = createInsertSchema(workshopRegistrations).omit({
  id: true,
  registrationDate: true,
});

export const insertPaymentPlanSchema = createInsertSchema(paymentPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBlogSchema = createInsertSchema(blogs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMentoriaBookingSchema = createInsertSchema(mentoriaBookings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCouponSchema = createInsertSchema(coupons).omit({
  id: true,
  createdAt: true,
  usageCount: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;
export type Workshop = typeof workshops.$inferSelect;
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type WorkshopRegistration = typeof workshopRegistrations.$inferSelect;
export type InsertWorkshopRegistration = z.infer<typeof insertWorkshopRegistrationSchema>;
export type PaymentPlan = typeof paymentPlans.$inferSelect;
export type InsertPaymentPlan = z.infer<typeof insertPaymentPlanSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Blog = typeof blogs.$inferSelect;
export type InsertBlog = z.infer<typeof insertBlogSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type MentoriaBooking = typeof mentoriaBookings.$inferSelect;
export type InsertMentoriaBooking = z.infer<typeof insertMentoriaBookingSchema>;
export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = z.infer<typeof insertCouponSchema>;