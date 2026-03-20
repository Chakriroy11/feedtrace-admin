#  FeedTrace Admin Console
> **AI-Driven E-Commerce Trust & Advertisement Management System**

FeedTrace Admin is the backbone of the FeedTrace ecosystem. It leverages AI to verify customer reviews, manage product inventories, and handle sponsor-driven advertisements through a fully responsive, modern dashboard.

---

##  Key Features

### 1. AI Review Triage & Moderation
* **OCR Verification:** Automatically scans uploaded bills and invoices to cross-reference Order IDs and purchase dates.
* **Trust Scoring:** Assigns a percentage-based "Trust Score" to reviews based on bill clarity and data match.
* **Live Alerts:** Real-time notifications for flagged reviews that need human intervention.

### 2. Sponsor Ad Management
* **Campaign Controller:** Create and toggle active ads that appear on the consumer-facing footer.
* **Coupon Engine:** Manage brand-specific discount codes and promotional text.
* **Visual Previews:** Upload and manage sponsor branding assets with live status tracking.

### 3. Dynamic Product Management
* **Multi-Tier Categories:** Logic-gated category and sub-category selection.
* **Variant Engine:** Manage complex product SKU variants including color-specific pricing and storage options.
* **Deep Specs:** Context-aware specification forms tailored to specific product types (Mobiles, Laptops, etc.).

---

##  Mobile-First Responsive Design
The Admin Phase is built using a **Mobile-First** architecture, ensuring admins can moderate reviews or update inventory on the go:
* **Adaptive Sidebar:** Switches from a vertical desktop sidebar to a scrollable bottom navigation bar on mobile.
* **Fluid Grids:** Statistical cards and data tables reflow from a 4-column layout to a touch-friendly 1-column flow.
* **Touch-Optimized Actions:** Large hit-areas for Approve/Reject and Delete buttons to prevent errors.

---

##  Tech Stack
* **Frontend:** React.js, Vite
* **Icons:** Lucide-React
* **State Management:** React Hooks (useState, useEffect)
* **Responsive Logic:** Custom `useResponsive` Hook
* **Notifications:** React-Hot-Toast
* **Backend Integration:** Node.js, Express, MongoDB

---

##  How to Run
1. Navigate to the `Admin-frontend` folder.
2. Install dependencies:
   ```bash
   npm install