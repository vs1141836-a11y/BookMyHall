# BookMyHall 🏰

BookMyHall is a premium, modern, and offline-resilient **Function Hall Booking & Event Planning Platform** built to streamline venue discovering, interactive 360° virtual tours, customizable catering/decoration package checkouts, payment simulations, and booking tracking.

---

## 🚀 Key Features

### 1. 🔍 Advanced Venue Discovery
- **Location-Based Search**: Filter function halls by city, date availability, event categories, and guest capacities.
- **Dynamic Category Selector**: Custom-tailored event icons for major Indian celebrations (Marriage, Reception, Engagement, Birthday, Naming Ceremony, Housewarming, etc.).

### 2. 📸 Interactive 360° Virtual Tour
- **True WebGL Panorama**: Integrated high-resolution equirectangular Wedding Hall panorama powered by **Pannellum**.
- **Interactive Controls**: Smooth drag-and-rotate controls (gyroscope-enabled on mobile) with programmatically linked button triggers for **Zoom In**, **Zoom Out**, **Reset View**, and **Fullscreen**.

### 3. 💳 Modern Checkout & Payment Gateway
- **Interactive Accordion Gateway**: Supports Google Pay, PhonePe, Paytm, BHIM UPI (with active regex handle validator), Credit/Debit Cards, Net Banking, and Wallets.
- **GST & Fee Breakdowns**: Modern summary card compiling hall base rent, catering packages, decoration upgrades, GST (18%), and gateway convenience fees.
- **Flexible Payments**: Choice between 30% Advance Deposit and Full Payment checkouts.

### 4. 📊 Live Timeline Tracking & Invoice Receipts
- **Status Timeline**: Real-time progress bar (Request Sent ➡️ Owner Confirmed ➡️ Advance Paid ➡️ Event Completed).
- **Printable Vector Invoice**: Instantly downloadable PDF invoices detailing transaction records with a mock verification QR code.

### 5. 🛡️ Route Protection & Host Panel
- **Role-based Authentication**: Secured customer routes and dashboard views.
- **Host Dashboard**: Venue owners can manage incoming bookings (Accept/Reject) and progress booking status milestones.

---

## 🛠️ Tech Stack

- **Frontend**: React (v19), Tailwind CSS, Vite, Lucide Icons, Recharts, Leaflet Maps, Pannellum WebGL.
- **Backend**: Node.js, Express, JSON Web Tokens (JWT), Nodemon, Nodemailer (Ethereal test fallbacks), PDFKit.
- **Resilience**: Sandbox Mode fallback to a local `mock_db.json` file when MongoDB is disconnected or offline.

---

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/vs1141836-a11y/BookMyHall.git
cd BookMyHall

# Install monorepo, backend, and frontend dependencies
npm run install-all
```

### 2. Configure Environment Variables
Create a `.env` file inside the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key_here
MONGO_URI=mongodb://localhost:27017/bookmyhall

# SMTP configuration (Optional, falls back to Ethereal mailer)
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_user
SMTP_PASS=your_password
```

### 3. Run Locally
Start both the Express backend and the Vite frontend simultaneously:
```bash
npm run dev
```
- **Vite Client**: `http://localhost:5173`
- **Express API**: `http://localhost:5000`

---

## ☁️ Deployment

### Frontend (Vercel)
1. Import the repository in **Vercel**.
2. Select **`frontend`** as the Root Directory.
3. Configure the **`VITE_API_URL`** environment variable:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<your-backend-render-domain>.onrender.com/api`
4. Click **Deploy**.

### Backend (Render)
1. Create a **Web Service** on Render.
2. Select **`backend`** as the Root Directory.
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Configure Environment Variables in the Render Dashboard (`NODE_ENV=production`, `PORT=5000`, `JWT_SECRET`, etc.).
6. Click **Deploy**.
