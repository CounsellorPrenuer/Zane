import type { Express } from "express";
import { createServer, type Server } from "http";
import rateLimit from "express-rate-limit";
import { createAdminSession, adminLogin, adminLogout, adminStatus, requireAdmin } from "./adminAuth";
import { insertConsultationSchema, insertWorkshopRegistrationSchema, insertWorkshopSchema, insertPaymentSchema, insertBlogSchema, insertContactMessageSchema, insertMentoriaBookingSchema, insertCouponSchema } from "@shared/schema";
import { storage } from "./storage";
import { createRazorpayOrder, verifyRazorpayPayment } from "./razorpayConfig";
import { getMentoriaPrice } from "@shared/pricing";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup admin session middleware
  app.use(createAdminSession());

  // Rate limiting for contact form to prevent spam
  const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // Limit each IP to 3 contact form submissions per windowMs
    message: {
      error: 'Too many contact form submissions. Please try again later.',
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  });

  // Rate limiting for workshop registrations to prevent spam
  const workshopRegistrationLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 workshop registrations per windowMs
    message: {
      error: 'Too many registration attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Admin authentication routes
  app.post('/api/admin/login', adminLogin);
  app.post('/api/admin/logout', requireAdmin, adminLogout);
  app.get('/api/admin/status', adminStatus);

  // Public routes (no authentication required)

  // Public consultation booking
  app.post('/api/consultations', async (req, res) => {
    try {
      const consultationData = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(consultationData);
      res.status(201).json(consultation);
    } catch (error) {
      console.error('Error creating consultation:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to book consultation' });
    }
  });

  // Get public workshops
  app.get('/api/workshops', async (req, res) => {
    try {
      const workshops = await storage.getWorkshops();
      res.json(workshops);
    } catch (error) {
      console.error('Error fetching workshops:', error);
      res.status(500).json({ message: 'Failed to fetch workshops' });
    }
  });

  // Public workshop registration
  app.post('/api/workshop-registrations', workshopRegistrationLimiter, async (req, res) => {
    try {
      const registrationData = insertWorkshopRegistrationSchema.parse(req.body);
      const registration = await storage.createWorkshopRegistration(registrationData);
      res.status(201).json(registration);
    } catch (error) {
      console.error('Error creating workshop registration:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to register for workshop' });
    }
  });

  // Mentoria booking routes with payment integration
  const mentoriaBookingLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 booking attempts per windowMs
    message: {
      error: 'Too many booking attempts. Please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Create a pending Mentoria booking (called after Razorpay order is created by worker)
  app.post('/api/mentoria-bookings/create-pending', async (req, res) => {
    try {
      const { couponCode, orderId, ...rest } = req.body;
      const bookingData = insertMentoriaBookingSchema.omit({
        paymentId: true,
        paymentStatus: true,
        status: true,
        price: true,
        originalPrice: true,
        discountAmount: true,
        couponCode: true,
      }).parse(rest);

      const originalPrice = getMentoriaPrice(bookingData.category, bookingData.tier as 'standard' | 'premium');
      if (!originalPrice) {
        return res.status(400).json({ message: 'Invalid category or tier' });
      }

      let discountedPrice = originalPrice;
      let discountAmount = 0;
      let appliedCoupon = null;

      if (couponCode) {
        const coupon = await storage.getCouponByCode(couponCode);
        if (coupon && coupon.isActive) {
          const { calculateDiscount, calculateFinalPrice } = await import("@shared/pricing");
          discountAmount = calculateDiscount(
            originalPrice,
            coupon.discountType,
            coupon.discountValue,
            coupon.maxDiscount || undefined
          );
          discountedPrice = calculateFinalPrice(originalPrice, discountAmount);
          appliedCoupon = coupon;
        }
      }

      // Create booking record in pending state
      const booking = await storage.createMentoriaBooking({
        ...bookingData,
        originalPrice: originalPrice.toString(),
        price: discountedPrice.toString(),
        discountAmount: discountAmount.toString(),
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        orderId: orderId,
        paymentStatus: 'pending',
        status: 'pending',
      });

      res.status(201).json({ booking });
    } catch (error) {
      console.error('Error creating pending booking:', error);
      res.status(500).json({ message: 'Failed to create pending booking' });
    }
  });

  // Internal endpoint for Cloudflare Worker to update booking status after verification
  app.post('/api/internal/mentoria-bookings/update-status', async (req, res) => {
    try {
      const { bookingId, status, paymentStatus } = req.body;
      if (!bookingId) return res.status(400).json({ message: 'Booking ID required' });

      const booking = await storage.getMentoriaBooking(bookingId);
      if (!booking) return res.status(404).json({ message: 'Booking not found' });

      const updatedBooking = await storage.updateMentoriaBooking(bookingId, {
        status: status || 'confirmed',
        paymentStatus: paymentStatus || 'completed',
      });

      res.json({ success: true, booking: updatedBooking });
    } catch (error) {
      console.error('Error updating booking status:', error);
      res.status(500).json({ message: 'Internal error updating booking' });
    }
  });

  // Verify Mentoria booking payment
  app.post('/api/mentoria-bookings/verify-payment', async (req, res) => {
    try {
      const {
        bookingId,
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      } = req.body;

      if (!bookingId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return res.status(400).json({ message: 'Missing required payment verification data' });
      }

      // Get booking first to verify order_id
      const booking = await storage.getMentoriaBooking(bookingId);
      if (!booking) {
        return res.status(404).json({ message: 'Booking not found' });
      }

      // Verify that the order_id matches
      if (booking.orderId !== razorpay_order_id) {
        console.error(`Order ID mismatch: booking has ${booking.orderId}, received ${razorpay_order_id}`);
        return res.status(400).json({ message: 'Order ID mismatch' });
      }

      // Verify Razorpay signature
      const isValidSignature = verifyRazorpayPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValidSignature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }

      // Update payment status
      if (booking.paymentId) {
        await storage.updatePaymentStatus(booking.paymentId, 'completed');
      }

      // Update booking status
      const updatedBooking = await storage.updateMentoriaBooking(bookingId, {
        paymentStatus: 'completed',
        status: 'confirmed',
      });

      res.json({
        success: true,
        booking: updatedBooking,
        message: 'Payment verified and booking confirmed successfully'
      });
    } catch (error) {
      console.error('Error verifying Mentoria payment:', error);
      res.status(500).json({ message: 'Failed to verify payment' });
    }
  });

  // Internal endpoint for Cloudflare Worker to validate coupons
  app.post('/api/internal/coupons/validate', async (req, res) => {
    try {
      const { code, minAmount } = req.body;
      if (!code) return res.status(400).json({ valid: false, message: 'Code required' });

      const coupon = await storage.getCouponByCode(code);

      if (!coupon || !coupon.isActive) {
        return res.json({ valid: false, message: 'Invalid or inactive coupon' });
      }

      if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) {
        return res.json({ valid: false, message: 'Coupon expired' });
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.json({ valid: false, message: 'Usage limit reached' });
      }

      if (minAmount && Number(coupon.minBookingAmount) > Number(minAmount)) {
        return res.json({ valid: false, message: `Minimum amount of ₹${coupon.minBookingAmount} required` });
      }

      res.json({
        valid: true,
        coupon: {
          code: coupon.code,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscount: coupon.maxDiscount,
        }
      });
    } catch (error) {
      console.error('Error validating coupon:', error);
      res.status(500).json({ message: 'Internal validation error' });
    }
  });

  // Public blog routes
  app.get('/api/blogs', async (req, res) => {
    try {
      const blogs = await storage.getBlogs();
      res.json(blogs);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      res.status(500).json({ message: 'Failed to fetch blogs' });
    }
  });

  app.get('/api/blogs/featured', async (req, res) => {
    try {
      const featuredBlogs = await storage.getFeaturedBlogs();
      res.json(featuredBlogs);
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
      res.status(500).json({ message: 'Failed to fetch featured blogs' });
    }
  });

  app.get('/api/blogs/slug/:slug', async (req, res) => {
    try {
      const { slug } = req.params;
      const blog = await storage.getBlogBySlug(slug);
      if (!blog) {
        return res.status(404).json({ message: 'Blog post not found' });
      }
      res.json(blog);
    } catch (error) {
      console.error('Error fetching blog by slug:', error);
      res.status(500).json({ message: 'Failed to fetch blog post' });
    }
  });

  // Contact form submission (public endpoint)
  app.post('/api/contact', contactLimiter, async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const message = await storage.createContactMessage(messageData);
      res.status(201).json({
        success: true,
        message: 'Your message has been received. We\'ll get back to you within 24 hours.',
        data: message
      });
    } catch (error) {
      console.error('Error creating contact message:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors
        });
      }
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Admin-only routes (authentication required)

  // Admin dashboard - get all consultations
  app.get('/api/admin/consultations', requireAdmin, async (req, res) => {
    try {
      const consultations = await storage.getAllConsultations();
      res.json(consultations);
    } catch (error) {
      console.error('Error fetching consultations:', error);
      res.status(500).json({ message: 'Failed to fetch consultations' });
    }
  });

  // Admin dashboard - get all workshop registrations
  app.get('/api/admin/workshop-registrations', requireAdmin, async (req, res) => {
    try {
      const registrations = await storage.getAllWorkshopRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error('Error fetching workshop registrations:', error);
      res.status(500).json({ message: 'Failed to fetch workshop registrations' });
    }
  });

  // Admin Mentoria bookings
  app.get('/api/admin/mentoria-bookings', requireAdmin, async (req, res) => {
    try {
      const bookings = await storage.getAllMentoriaBookings();
      res.json(bookings);
    } catch (error) {
      console.error('Error fetching Mentoria bookings:', error);
      res.status(500).json({ message: 'Failed to fetch Mentoria bookings' });
    }
  });

  // Admin workshop management
  app.post('/api/admin/workshops', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertWorkshopSchema.parse(req.body);
      const workshop = await storage.createWorkshop(validatedData);
      res.status(201).json(workshop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors
        });
      }
      console.error('Error creating workshop:', error);
      res.status(500).json({ message: 'Failed to create workshop' });
    }
  });

  app.put('/api/admin/workshops/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateSchema = insertWorkshopSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const workshop = await storage.updateWorkshop(id, validatedData);
      res.json(workshop);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors
        });
      }
      console.error('Error updating workshop:', error);
      res.status(500).json({ message: 'Failed to update workshop' });
    }
  });

  app.delete('/api/admin/workshops/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteWorkshop(id);
      res.json({ message: 'Workshop deleted successfully' });
    } catch (error) {
      console.error('Error deleting workshop:', error);
      res.status(500).json({ message: 'Failed to delete workshop' });
    }
  });

  // Admin consultation management
  app.put('/api/admin/consultations/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateSchema = insertConsultationSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const consultation = await storage.updateConsultation(id, validatedData);
      res.json(consultation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors
        });
      }
      console.error('Error updating consultation:', error);
      res.status(500).json({ message: 'Failed to update consultation' });
    }
  });

  app.delete('/api/admin/consultations/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteConsultation(id);
      res.json({ message: 'Consultation deleted successfully' });
    } catch (error) {
      console.error('Error deleting consultation:', error);
      res.status(500).json({ message: 'Failed to delete consultation' });
    }
  });

  // Payment management routes

  // Get all payments (admin only)
  app.get('/api/admin/payments', requireAdmin, async (req, res) => {
    try {
      const payments = await storage.getPayments();
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  });

  // Create new payment with Razorpay order (server-authoritative pricing)
  app.post('/api/payments', async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.omit({ amount: true }).parse(req.body);

      // Server-authoritative pricing based on paymentType
      let amount: number;
      switch (validatedData.paymentType) {
        case 'consultation':
          amount = 299900; // ₹2,999 in paise
          break;
        case 'workshop':
          // For workshops, determine price based on referenceId or default
          const workshopId = validatedData.referenceId;
          if (workshopId === 'workshop-0') amount = 299900; // Leadership Skills
          else if (workshopId === 'workshop-1') amount = 199900; // Digital Marketing  
          else if (workshopId === 'workshop-2') amount = 149900; // Career Transition
          else amount = 299900; // Default workshop price
          break;
        default:
          return res.status(400).json({ message: 'Invalid payment type' });
      }

      const receipt = `receipt_${Date.now()}`;

      const razorpayOrder = await createRazorpayOrder({
        amount,
        currency: 'INR',
        receipt,
        notes: {
          paymentType: validatedData.paymentType,
          contactName: validatedData.contactName || '',
          contactEmail: validatedData.contactEmail || '',
        },
      });

      // Create payment record with server-computed amount
      const paymentData = {
        ...validatedData,
        amount: (amount / 100).toString(), // Store as rupees
        currency: 'INR',
        gatewayOrderId: razorpayOrder.id,
        status: 'pending',
      };

      const payment = await storage.createPayment(paymentData);

      res.status(201).json({
        ...payment,
        razorpayOrderId: razorpayOrder.id,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors
        });
      }
      console.error('Error creating payment:', error);
      res.status(500).json({ message: 'Failed to create payment order' });
    }
  });

  // Verify and complete payment (public endpoint with signature verification)
  app.post('/api/payments/verify', async (req, res) => {
    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        payment_id,
        contactName,
        contactEmail,
        contactPhone,
        message
      } = req.body;

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !payment_id) {
        return res.status(400).json({ message: 'Missing required payment verification data' });
      }

      // Verify Razorpay signature
      const isValidSignature = verifyRazorpayPayment(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );

      if (!isValidSignature) {
        return res.status(400).json({ message: 'Invalid payment signature' });
      }

      // Update payment status to completed
      const payment = await storage.updatePaymentStatus(payment_id, 'completed');

      // Create the corresponding booking/registration
      let booking = null;
      if (payment.paymentType === 'consultation') {
        const consultationData = {
          contactName: contactName || payment.contactName || '',
          contactEmail: contactEmail || payment.contactEmail || '',
          contactPhone: contactPhone || payment.contactPhone || '',
          serviceType: 'Career Guidance Consultation',
          preferredDate: new Date(),
          preferredTime: '10:00', // Default time, can be updated later
          status: 'confirmed',
          paymentId: payment_id,
          notes: message || ''
        };
        booking = await storage.createConsultation(consultationData);
      }
      // Workshop registrations no longer require payment
      // Workshops are registered directly without payment flow

      res.json({
        success: true,
        payment,
        booking,
        message: 'Payment verified and booking created successfully'
      });
    } catch (error) {
      console.error('Error verifying payment:', error);
      res.status(500).json({ message: 'Failed to verify payment' });
    }
  });

  // Update payment status (admin only)
  app.put('/api/admin/payments/:id/status', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status || !['pending', 'completed', 'failed', 'refunded'].includes(status)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }

      const payment = await storage.updatePaymentStatus(id, status);
      res.json(payment);
    } catch (error) {
      console.error('Error updating payment status:', error);
      res.status(500).json({ message: 'Failed to update payment status' });
    }
  });

  // Get payments by type (admin only)
  app.get('/api/admin/payments/type/:type', requireAdmin, async (req, res) => {
    try {
      const { type } = req.params;
      const payments = await storage.getPaymentsByType(type);
      res.json(payments);
    } catch (error) {
      console.error('Error fetching payments by type:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  });

  // Admin blog management routes

  // Get all blogs (admin only - includes drafts)
  app.get('/api/admin/blogs', requireAdmin, async (req, res) => {
    try {
      const blogs = await storage.getAllBlogs();
      res.json(blogs);
    } catch (error) {
      console.error('Error fetching all blogs:', error);
      res.status(500).json({ message: 'Failed to fetch blogs' });
    }
  });

  // Get single blog by ID (admin only)
  app.get('/api/admin/blogs/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const blog = await storage.getBlog(id);
      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }
      res.json(blog);
    } catch (error) {
      console.error('Error fetching blog:', error);
      res.status(500).json({ message: 'Failed to fetch blog' });
    }
  });

  // Generate blog content with AI (admin only)
  app.post('/api/admin/blogs/generate', requireAdmin, async (req, res) => {
    try {
      const { topic, keywords, tone, wordCount } = req.body;

      if (!topic) {
        return res.status(400).json({ message: 'Topic is required' });
      }

      const { generateBlogContent } = await import('./openai.js');

      const generatedBlog = await generateBlogContent({
        topic,
        keywords: keywords || [],
        tone: tone || 'professional',
        wordCount: wordCount || 800,
      });

      res.json(generatedBlog);
    } catch (error) {
      console.error('Error generating blog:', error);
      res.status(500).json({
        message: error instanceof Error ? error.message : 'Failed to generate blog content'
      });
    }
  });

  // Create new blog (admin only)
  app.post('/api/admin/blogs', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBlogSchema.parse(req.body);
      const blog = await storage.createBlog(validatedData);
      res.status(201).json(blog);
    } catch (error) {
      console.error('Error creating blog:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors
        });
      }
      res.status(500).json({ message: 'Failed to create blog' });
    }
  });

  // Update blog (admin only)
  app.put('/api/admin/blogs/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updateSchema = insertBlogSchema.partial();
      const validatedData = updateSchema.parse(req.body);
      const blog = await storage.updateBlog(id, validatedData);
      res.json(blog);
    } catch (error) {
      console.error('Error updating blog:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: error.errors
        });
      }
      res.status(500).json({ message: 'Failed to update blog' });
    }
  });

  // Delete blog (admin only)
  app.delete('/api/admin/blogs/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteBlog(id);
      res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
      console.error('Error deleting blog:', error);
      res.status(500).json({ message: 'Failed to delete blog' });
    }
  });

  // Admin contact message management
  app.get('/api/admin/contact-messages', requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      res.status(500).json({ message: 'Failed to fetch contact messages' });
    }
  });

  app.get('/api/admin/contact-messages/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const message = await storage.getContactMessage(id);
      if (!message) {
        return res.status(404).json({ message: 'Contact message not found' });
      }
      res.json(message);
    } catch (error) {
      console.error('Error fetching contact message:', error);
      res.status(500).json({ message: 'Failed to fetch contact message' });
    }
  });

  app.put('/api/admin/contact-messages/:id/status', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['unread', 'read', 'replied'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }

      const message = await storage.updateContactMessageStatus(id, status);
      res.json(message);
    } catch (error) {
      console.error('Error updating contact message status:', error);
      res.status(500).json({ message: 'Failed to update contact message status' });
    }
  });

  app.delete('/api/admin/contact-messages/:id', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContactMessage(id);
      res.json({ message: 'Contact message deleted successfully' });
    } catch (error) {
      console.error('Error deleting contact message:', error);
      res.status(500).json({ message: 'Failed to delete contact message' });
    }
  });

  // Admin Coupon Management
  app.get('/api/admin/coupons', requireAdmin, async (req, res) => {
    try {
      const coupons = await storage.getAllCoupons();
      res.json(coupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      res.status(500).json({ message: 'Failed to fetch coupons' });
    }
  });

  app.post('/api/admin/coupons', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertCouponSchema.parse(req.body);
      const coupon = await storage.createCoupon(validatedData);
      res.status(201).json(coupon);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Validation failed', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create coupon' });
    }
  });

  app.put('/api/admin/coupons/:id/toggle', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const coupon = await storage.updateCoupon(id, { isActive });
      res.json(coupon);
    } catch (error) {
      console.error('Error toggling coupon:', error);
      res.status(500).json({ message: 'Failed to toggle coupon' });
    }
  });

  // Admin dashboard statistics endpoint
  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const [consultations, workshops, registrations, payments] = await Promise.all([
        storage.getAllConsultations(),
        storage.getWorkshops(),
        storage.getAllWorkshopRegistrations(),
        storage.getPayments()
      ]);

      const stats = {
        totalBookings: consultations.length + registrations.length,
        totalConsultations: consultations.length,
        totalWorkshopRegistrations: registrations.length,
        totalPayments: payments.length,
        totalRevenue: payments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + Number(p.amount), 0),
        recentBookings: [...consultations, ...registrations]
          .sort((a, b) => {
            const aDate = 'createdAt' in a ? a.createdAt : a.registrationDate;
            const bDate = 'createdAt' in b ? b.createdAt : b.registrationDate;
            return new Date(bDate).getTime() - new Date(aDate).getTime();
          })
          .slice(0, 5),
        recentPayments: payments
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: 'Failed to fetch admin statistics' });
    }
  });

  return createServer(app);
}