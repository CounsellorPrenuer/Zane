# Design Guidelines for Academy for Skill and Knowledge (ASK)

## Design Approach
**Reference-Based Approach** - Drawing inspiration from professional education platforms like LinkedIn Learning, Coursera, and modern business consulting websites. The design should convey trust, professionalism, and accessibility while maintaining an inspiring tone for students and professionals.

## Core Design Elements

### Color Palette
**Primary Colors:**
- Deep Professional Blue: 220 85% 25% (main brand color)
- Clean White: 0 0% 98% (backgrounds, text contrast)

**Accent Colors:**
- Success Orange: 25 90% 55% (CTAs, highlights)
- Growth Green: 140 60% 45% (secondary accents, success states)
- Neutral Gray: 220 10% 65% (supporting text, borders)

**Dark Mode Support:**
- Background: 220 25% 8%
- Cards/Surfaces: 220 15% 12%
- Text: 220 5% 92%

### Typography
**Primary Font:** Inter (Google Fonts) - clean, professional sans-serif
**Headings:** Weights 600-700, sizes from 2xl to 6xl
**Body Text:** Weight 400-500, optimized for readability
**CTAs:** Weight 600, slightly larger sizing for prominence

### Layout System
**Spacing Units:** Consistent use of Tailwind units 4, 6, 8, 12, 16 for margins, padding, and gaps
**Grid System:** 12-column responsive grid with generous whitespace
**Section Spacing:** py-16 for desktop, py-12 for mobile between major sections

### Component Library

**Navigation:**
- Sticky header with transparent-to-solid transition on scroll
- Logo left-aligned, navigation center, CTA button right-aligned
- Mobile: Hamburger menu with slide-out overlay

**Buttons:**
- Primary: Solid orange background with rounded corners
- Secondary: Outline style with blue border
- CTAs on images: variant="outline" with blurred backgrounds

**Cards:**
- Clean white/dark surfaces with subtle shadows
- Rounded corners (rounded-lg)
- Hover effects with gentle lift and shadow increase

**Forms:**
- Floating labels or clear placeholder text
- Blue accent borders on focus
- Validation states with green/red indicators

**Admin Dashboard:**
- Clean, data-focused interface following material design principles
- Sidebar navigation with main content area
- Cards for statistics and CRUD operations

### Visual Hierarchy
**Hero Section:** Large, impactful with ASK logo, compelling headline, and dual CTAs
**Services:** Grid layout with icon-text-description pattern
**About:** Two-column layout featuring Zane's profile photo and credentials
**Workshops:** Card-based layout with dates, descriptions, and registration CTAs
**Contact:** Split layout with form and contact information

### Animations
**Minimal and Professional:**
- Smooth scrolling between sections
- Subtle fade-in animations for content on scroll
- Gentle hover effects on interactive elements
- Loading states for payment processing

### Mobile Responsiveness
**Mobile-First Design:**
- Stack columns vertically on small screens
- Touch-friendly button sizing (minimum 44px)
- Readable typography without zooming
- Optimized form layouts

## Images Section

**Hero Image:** Large banner image showcasing professional learning environment or career guidance session (1920x800px)
**Profile Photo:** Zane E. Cuxton's professional headshot for About section (400x400px)
**Service Icons:** Professional iconography for each service offering
**Workshop Images:** Classroom/seminar photos for workshop cards (600x400px)
**Background Elements:** Subtle geometric patterns or gradients for section dividers

The website features a prominent hero image that should convey professionalism and educational excellence, setting the tone for the entire user experience.