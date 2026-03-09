import { Hono } from 'hono';
import { cors } from 'hono/cors';
import Razorpay from 'razorpay';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { pgTable, text, varchar, timestamp, decimal } from 'drizzle-orm/pg-core';
import { eq } from 'drizzle-orm';

// Database Schema (Re-defined for worker environment)
const mentoriaBookings = pgTable("mentoria_bookings", {
    id: varchar("id").primaryKey(),
    contactName: varchar("contact_name").notNull(),
    contactEmail: varchar("contact_email").notNull(),
    contactPhone: varchar("contact_phone").notNull(),
    category: text("category").notNull(),
    tier: text("tier").notNull(),
    programName: text("program_name").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    originalPrice: decimal("original_price", { precision: 10, scale: 2 }).notNull(),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default('0'),
    couponCode: text("coupon_code"),
    orderId: text("order_id"),
    paymentStatus: text("payment_status").notNull().default('pending'),
    status: text("status").notNull().default('pending'),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

const coupons = pgTable("coupons", {
    id: varchar("id").primaryKey(),
    code: varchar("code").notNull().unique(),
    discountType: text("discount_type").notNull(),
    discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
    minBookingAmount: decimal("min_booking_amount", { precision: 10, scale: 2 }).default('0'),
    isActive: text("is_active"), // Simplified for this environment
});

// Pricing Data
const MENTORIA_PRICES: Record<string, any> = {
    '8-9': { standard: 5500, premium: 15000 },
    '10-12': { standard: 10000, premium: 25000 },
    'graduates': { standard: 15000, premium: 35000 },
    'professionals': { standard: 25000, premium: 50000 },
};

type Bindings = {
    RAZORPAY_KEY_ID: string;
    RAZORPAY_KEY_SECRET: string;
    DATABASE_URL: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', cors());

// Health check
app.get('/', (c) => c.text('Zane Backend Worker is live!'));

/**
 * Ported: Create a pending Mentoria booking
 */
app.post('/api/create-pending-booking', async (c) => {
    const { contactName, contactEmail, contactPhone, category, tier, programName, orderId, couponCode } = await c.req.json();
    
    if (!contactEmail || !category || !tier) {
        return c.json({ error: 'Missing required fields' }, 400);
    }

    const sql = neon(c.env.DATABASE_URL);
    const db = drizzle(sql);

    // Get pricing
    const originalPrice = MENTORIA_PRICES[category]?.[tier];
    if (!originalPrice) return c.json({ error: 'Invalid category or tier' }, 400);

    let finalPrice = originalPrice;
    let discountAmount = 0;

    // Optional Coupon Validation (Simplified)
    if (couponCode) {
        // You can add DB check here if needed
    }

    try {
        const id = crypto.randomUUID();
        await db.insert(mentoriaBookings).values({
            id,
            contactName,
            contactEmail,
            contactPhone,
            category,
            tier,
            programName,
            originalPrice: originalPrice.toString(),
            price: finalPrice.toString(),
            discountAmount: discountAmount.toString(),
            couponCode: couponCode || null,
            orderId: orderId || null,
            status: 'pending',
            paymentStatus: 'pending'
        });

        return c.json({ booking: { id, status: 'pending' } });
    } catch (error: any) {
        console.error('DB Error:', error);
        return c.json({ error: 'Failed to save booking' }, 500);
    }
});

/**
 * Create Razorpay Order
 */
app.post('/api/create-order', async (c) => {
    const { amount, currency = 'INR', notes } = await c.req.json();

    if (!amount) return c.json({ error: 'Amount required' }, 400);

    try {
        const razorpay = new Razorpay({
            key_id: c.env.RAZORPAY_KEY_ID,
            key_secret: c.env.RAZORPAY_KEY_SECRET,
        });

        const order = await razorpay.orders.create({
            amount: Math.round(amount * 100), // Convert to paise
            currency,
            notes,
        });

        return c.json(order);
    } catch (error: any) {
        console.error('Razorpay Error:', error);
        return c.json({ error: error.message || 'Failed to create order' }, 500);
    }
});

/**
 * Verify Payment Signature & Update DB Status
 */
app.post('/api/verify-payment', async (c) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = await c.req.json();
    const secret = c.env.RAZORPAY_KEY_SECRET;
    const message = razorpay_order_id + "|" + razorpay_payment_id;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(message);

    const key = await crypto.subtle.importKey(
        'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', key, messageData);
    const generated_signature = Array.from(new Uint8Array(signature))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

    if (generated_signature === razorpay_signature) {
        const sql = neon(c.env.DATABASE_URL);
        const db = drizzle(sql);

        if (bookingId) {
            try {
                await db.update(mentoriaBookings)
                    .set({ 
                        status: 'confirmed', 
                        paymentStatus: 'completed',
                        updatedAt: new Date()
                    })
                    .where(eq(mentoriaBookings.id, bookingId));
            } catch (dbError) {
                console.error('Failed to update booking status:', dbError);
            }
        }
        
        return c.json({ status: 'ok' });
    } else {
        return c.json({ status: 'failed' }, 400);
    }
});

export default app;
