import {
  users,
  consultations,
  workshops,
  workshopRegistrations,
  paymentPlans,
  subscriptions,
  payments,
  blogs,
  contactMessages,
  mentoriaBookings,
  type User,
  type InsertUser,
  type UpsertUser,
  type Consultation,
  type InsertConsultation,
  type Workshop,
  type InsertWorkshop,
  type WorkshopRegistration,
  type InsertWorkshopRegistration,
  type PaymentPlan,
  type InsertPaymentPlan,
  type Subscription,
  type InsertSubscription,
  type Payment,
  type InsertPayment,
  type Blog,
  type InsertBlog,
  type ContactMessage,
  type InsertContactMessage,
  type MentoriaBooking,
  type InsertMentoriaBooking,
  coupons,
  type Coupon,
  type InsertCoupon
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User methods - Required for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Consultation methods
  getConsultations(): Promise<Consultation[]>;
  getAllConsultations(): Promise<Consultation[]>; // Admin method
  getConsultationsByUser(userId: string): Promise<Consultation[]>;
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  updateConsultation(id: string, updates: Partial<InsertConsultation>): Promise<Consultation>; // Admin method
  updateConsultationStatus(id: string, status: string): Promise<void>;
  deleteConsultation(id: string): Promise<void>; // Admin method

  // Workshop methods
  getWorkshops(): Promise<Workshop[]>;
  getWorkshop(id: string): Promise<Workshop | undefined>;
  createWorkshop(workshop: InsertWorkshop): Promise<Workshop>;
  updateWorkshop(id: string, updates: Partial<InsertWorkshop>): Promise<Workshop>; // Admin method
  deleteWorkshop(id: string): Promise<void>; // Admin method
  registerForWorkshop(registration: InsertWorkshopRegistration): Promise<WorkshopRegistration>;
  createWorkshopRegistration(registration: InsertWorkshopRegistration): Promise<WorkshopRegistration>; // Public method
  getAllWorkshopRegistrations(): Promise<WorkshopRegistration[]>; // Admin method
  getUserWorkshopRegistrations(userId: string): Promise<WorkshopRegistration[]>;

  // Payment plan methods
  getPaymentPlans(): Promise<PaymentPlan[]>;
  createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan>;

  // Subscription methods
  createSubscription(subscription: InsertSubscription): Promise<Subscription>;
  getUserSubscriptions(userId: string): Promise<Subscription[]>;

  // Payment methods
  getPayments(): Promise<Payment[]>; // Admin method
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePaymentStatus(id: string, status: string): Promise<Payment>;
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  getPaymentsByType(type: string): Promise<Payment[]>; // Admin method

  // Blog methods
  getBlogs(): Promise<Blog[]>; // Public method - get published blogs
  getAllBlogs(): Promise<Blog[]>; // Admin method - get all blogs
  getBlog(id: string): Promise<Blog | undefined>;
  getBlogBySlug(slug: string): Promise<Blog | undefined>; // Public method
  createBlog(blog: InsertBlog): Promise<Blog>; // Admin method
  updateBlog(id: string, updates: Partial<InsertBlog>): Promise<Blog>; // Admin method
  deleteBlog(id: string): Promise<void>; // Admin method
  getFeaturedBlogs(): Promise<Blog[]>; // Public method

  // Contact message methods
  getContactMessages(): Promise<ContactMessage[]>; // Admin method - get all contact messages
  getContactMessage(id: string): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>; // Public method
  updateContactMessageStatus(id: string, status: string): Promise<ContactMessage>; // Admin method
  deleteContactMessage(id: string): Promise<void>; // Admin method

  // Mentoria booking methods
  createMentoriaBooking(booking: InsertMentoriaBooking): Promise<MentoriaBooking>;
  getAllMentoriaBookings(): Promise<MentoriaBooking[]>; // Admin method
  getMentoriaBooking(id: string): Promise<MentoriaBooking | undefined>;
  updateMentoriaBooking(id: string, updates: Partial<InsertMentoriaBooking>): Promise<MentoriaBooking>;
  updateMentoriaBookingStatus(id: string, status: string): Promise<MentoriaBooking>;

  // Coupon methods
  getCouponByCode(code: string): Promise<Coupon | undefined>;
  getAllCoupons(): Promise<Coupon[]>;
  createCoupon(coupon: InsertCoupon): Promise<Coupon>;
  updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return user;
  }

  // Consultation methods
  async getConsultations(): Promise<Consultation[]> {
    return await db.select().from(consultations).orderBy(desc(consultations.createdAt));
  }

  async getConsultationsByUser(userId: string): Promise<Consultation[]> {
    return await db
      .select()
      .from(consultations)
      .where(eq(consultations.userId, userId))
      .orderBy(desc(consultations.createdAt));
  }

  async createConsultation(consultation: InsertConsultation): Promise<Consultation> {
    const [newConsultation] = await db
      .insert(consultations)
      .values({
        ...consultation,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newConsultation;
  }

  async updateConsultationStatus(id: string, status: string): Promise<void> {
    await db
      .update(consultations)
      .set({ status, updatedAt: new Date() })
      .where(eq(consultations.id, id));
  }

  // Admin methods for consultations
  async getAllConsultations(): Promise<Consultation[]> {
    return await db.select().from(consultations).orderBy(desc(consultations.createdAt));
  }

  async updateConsultation(id: string, updates: Partial<InsertConsultation>): Promise<Consultation> {
    const [updatedConsultation] = await db
      .update(consultations)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(consultations.id, id))
      .returning();
    return updatedConsultation;
  }

  async deleteConsultation(id: string): Promise<void> {
    await db.delete(consultations).where(eq(consultations.id, id));
  }

  // Workshop methods
  async getWorkshops(): Promise<Workshop[]> {
    return await db.select().from(workshops).orderBy(desc(workshops.scheduledDate));
  }

  async getWorkshop(id: string): Promise<Workshop | undefined> {
    const [workshop] = await db.select().from(workshops).where(eq(workshops.id, id));
    return workshop || undefined;
  }

  async createWorkshop(workshop: InsertWorkshop): Promise<Workshop> {
    const [newWorkshop] = await db
      .insert(workshops)
      .values({
        ...workshop,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newWorkshop;
  }

  async registerForWorkshop(registration: InsertWorkshopRegistration): Promise<WorkshopRegistration> {
    // Use transaction to ensure atomicity
    // Only works with database workshops (workshopId is required)
    if (!registration.workshopId) {
      throw new Error('Workshop ID is required for database workshop registration');
    }

    const workshopId = registration.workshopId; // Store in variable to help TypeScript

    return await db.transaction(async (tx) => {
      // Check if workshop exists and has capacity
      const [workshop] = await tx
        .select()
        .from(workshops)
        .where(eq(workshops.id, workshopId));

      if (!workshop) {
        throw new Error('Workshop not found');
      }

      if (workshop.registeredCount >= workshop.capacity) {
        throw new Error('Workshop is full');
      }

      // Insert registration (unique constraint will prevent duplicates)
      const [newRegistration] = await tx
        .insert(workshopRegistrations)
        .values(registration)
        .returning();

      // Update workshop registered count
      await tx
        .update(workshops)
        .set({
          registeredCount: workshop.registeredCount + 1,
          updatedAt: new Date()
        })
        .where(eq(workshops.id, workshopId));

      return newRegistration;
    });
  }

  async getUserWorkshopRegistrations(userId: string): Promise<WorkshopRegistration[]> {
    return await db
      .select()
      .from(workshopRegistrations)
      .where(eq(workshopRegistrations.userId, userId));
  }

  // Admin methods for workshops
  async updateWorkshop(id: string, updates: Partial<InsertWorkshop>): Promise<Workshop> {
    const [updatedWorkshop] = await db
      .update(workshops)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(workshops.id, id))
      .returning();
    return updatedWorkshop;
  }

  async deleteWorkshop(id: string): Promise<void> {
    await db.delete(workshops).where(eq(workshops.id, id));
  }

  // Public workshop registration method (no user required)
  async createWorkshopRegistration(registration: InsertWorkshopRegistration): Promise<WorkshopRegistration> {
    // For frontend hardcoded workshops (workshopId is null, workshopTitle is set)
    // Simply insert the registration without capacity checks
    const [newRegistration] = await db
      .insert(workshopRegistrations)
      .values(registration)
      .returning();

    return newRegistration;
  }

  // Admin method to get all workshop registrations
  async getAllWorkshopRegistrations(): Promise<WorkshopRegistration[]> {
    return await db
      .select()
      .from(workshopRegistrations)
      .orderBy(desc(workshopRegistrations.registrationDate));
  }

  // Payment plan methods
  async getPaymentPlans(): Promise<PaymentPlan[]> {
    return await db.select().from(paymentPlans).where(eq(paymentPlans.isActive, true));
  }

  async createPaymentPlan(plan: InsertPaymentPlan): Promise<PaymentPlan> {
    const [newPlan] = await db
      .insert(paymentPlans)
      .values({
        ...plan,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newPlan;
  }

  // Subscription methods
  async createSubscription(subscription: InsertSubscription): Promise<Subscription> {
    const [newSubscription] = await db
      .insert(subscriptions)
      .values({
        ...subscription,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newSubscription;
  }

  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .orderBy(desc(subscriptions.createdAt));
  }

  // Payment methods
  async getPayments(): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const [newPayment] = await db
      .insert(payments)
      .values({
        ...payment,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newPayment;
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment> {
    const [updatedPayment] = await db
      .update(payments)
      .set({
        status,
        paidAt: status === 'completed' ? new Date() : null,
        updatedAt: new Date()
      })
      .where(eq(payments.id, id))
      .returning();
    return updatedPayment;
  }

  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  async getPaymentsByType(type: string): Promise<Payment[]> {
    return await db
      .select()
      .from(payments)
      .where(eq(payments.paymentType, type))
      .orderBy(desc(payments.createdAt));
  }

  // Blog methods
  async getBlogs(): Promise<Blog[]> {
    // Public method - only return published blogs
    return await db
      .select()
      .from(blogs)
      .where(eq(blogs.status, 'published'))
      .orderBy(desc(blogs.publishedAt), desc(blogs.createdAt));
  }

  async getAllBlogs(): Promise<Blog[]> {
    // Admin method - get all blogs regardless of status
    return await db
      .select()
      .from(blogs)
      .orderBy(desc(blogs.createdAt));
  }

  async getBlog(id: string): Promise<Blog | undefined> {
    const [blog] = await db.select().from(blogs).where(eq(blogs.id, id));
    return blog || undefined;
  }

  async getBlogBySlug(slug: string): Promise<Blog | undefined> {
    // Public method - only return published blogs
    const [blog] = await db
      .select()
      .from(blogs)
      .where(sql`${blogs.slug} = ${slug} AND ${blogs.status} = 'published'`);
    return blog || undefined;
  }

  async createBlog(blog: InsertBlog): Promise<Blog> {
    const [newBlog] = await db
      .insert(blogs)
      .values({
        ...blog,
        publishedAt: blog.status === 'published' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newBlog;
  }

  async updateBlog(id: string, updates: Partial<InsertBlog>): Promise<Blog> {
    const updateData: any = {
      ...updates,
      updatedAt: new Date(),
    };

    // Set publishedAt when status changes to published
    if (updates.status === 'published') {
      const [currentBlog] = await db.select().from(blogs).where(eq(blogs.id, id));
      if (currentBlog && !currentBlog.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    const [updatedBlog] = await db
      .update(blogs)
      .set(updateData)
      .where(eq(blogs.id, id))
      .returning();
    return updatedBlog;
  }

  async deleteBlog(id: string): Promise<void> {
    await db.delete(blogs).where(eq(blogs.id, id));
  }

  async getFeaturedBlogs(): Promise<Blog[]> {
    // Public method - get featured published blogs
    return await db
      .select()
      .from(blogs)
      .where(sql`${blogs.status} = 'published' AND ${blogs.featured} = true`)
      .orderBy(desc(blogs.publishedAt), desc(blogs.createdAt));
  }

  // Contact message methods
  async getContactMessages(): Promise<ContactMessage[]> {
    // Admin method - get all contact messages
    return await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: string): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message || undefined;
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db
      .insert(contactMessages)
      .values({
        ...message,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newMessage;
  }

  async updateContactMessageStatus(id: string, status: string): Promise<ContactMessage> {
    const [updatedMessage] = await db
      .update(contactMessages)
      .set({
        status,
        updatedAt: new Date()
      })
      .where(eq(contactMessages.id, id))
      .returning();
    return updatedMessage;
  }

  async deleteContactMessage(id: string): Promise<void> {
    await db.delete(contactMessages).where(eq(contactMessages.id, id));
  }

  // Mentoria booking methods
  async createMentoriaBooking(booking: InsertMentoriaBooking): Promise<MentoriaBooking> {
    const [newBooking] = await db
      .insert(mentoriaBookings)
      .values({
        ...booking,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    return newBooking;
  }

  async getAllMentoriaBookings(): Promise<MentoriaBooking[]> {
    return db.select().from(mentoriaBookings).orderBy(desc(mentoriaBookings.createdAt));
  }

  async getMentoriaBooking(id: string): Promise<MentoriaBooking | undefined> {
    const [booking] = await db.select().from(mentoriaBookings).where(eq(mentoriaBookings.id, id));
    return booking || undefined;
  }

  async updateMentoriaBooking(id: string, updates: Partial<InsertMentoriaBooking>): Promise<MentoriaBooking> {
    const [updated] = await db
      .update(mentoriaBookings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(mentoriaBookings.id, id))
      .returning();
    return updated;
  }

  async updateMentoriaBookingStatus(id: string, status: string): Promise<MentoriaBooking> {
    const [updated] = await db
      .update(mentoriaBookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(mentoriaBookings.id, id))
      .returning();
    return updated;
  }

  // Coupon methods
  async getCouponByCode(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db.select().from(coupons).where(eq(coupons.code, code));
    return coupon || undefined;
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  }

  async createCoupon(couponData: InsertCoupon): Promise<Coupon> {
    const [newCoupon] = await db
      .insert(coupons)
      .values({
        ...couponData,
        createdAt: new Date(),
      })
      .returning();
    return newCoupon;
  }

  async updateCoupon(id: string, updates: Partial<InsertCoupon>): Promise<Coupon> {
    const [updatedCoupon] = await db
      .update(coupons)
      .set(updates)
      .where(eq(coupons.id, id))
      .returning();
    return updatedCoupon;
  }
}

export const storage = new DatabaseStorage();
