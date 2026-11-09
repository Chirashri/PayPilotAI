# 🚀 PayPilot AI

**AI-powered invoice, payment, and financial management platform built for the PayPal AI Hackathon 2026.**

PayPilot AI helps businesses manage invoices, track payments, monitor revenue, and automate payment follow-ups from a single dashboard.

It combines **PayPal Sandbox**, **Google Gemini AI**, **MongoDB Atlas**, and **Resend** to provide an intelligent payment management experience.

---

## 🌐 Live Demo

### 🔗 (https://paypilot-ai-git-main-chirashris-projects.vercel.app/)

        (https://paypilot-qi44z4x6s-chirashris-projects.vercel.app/)

**Frontend:** Vercel  
**Backend:** Render  
**Database:** MongoDB Atlas

### 📂 GitHub Repository

[https://github.com/Chirashri/PayPilotAI](https://github.com/Chirashri/PayPilotAI)

---

## ✨ Features

### 📊 Financial Dashboard

- Real-time financial overview
- Total invoiced amount
- Paid, pending, and overdue amounts
- Payment transaction statistics
- Monthly revenue analytics
- AI-generated financial insights

### 🧾 Invoice Management

- Create and manage invoices
- Track invoice payment status
- Customer and invoice details
- Due-date tracking
- Automatic overdue identification
- Paid invoice editing protection
- Delete and manage invoice records

### 💳 PayPal Payments

- PayPal Sandbox integration
- Create PayPal payment orders
- PayPal checkout
- Secure payment capture
- Automatically update invoice status after successful payment
- Transaction tracking
- Dashboard updates after payment

### 🤖 PayPilot AI Assistant

- Ask questions about business finances
- Analyze revenue and payment data
- Get financial summaries
- Answer financial questions using live application data
- Context-aware AI responses

### 🔔 AI Payment Reminders

- Identify overdue invoices
- Calculate late payment fees
- Generate personalized payment reminders using Google Gemini
- Review and edit AI-generated reminders
- Copy reminders for manual use
- Send reminders through email using Resend

### 📈 Analytics

- Monthly revenue trends
- Payment performance
- Transaction summaries
- Average payment value
- Business performance insights
- AI-powered dashboard recommendations

---

## 🏗️ System Architecture

```text
                         ┌──────────────────────┐
                         │      PayPilot AI     │
                         │    React + Vite      │
                         │      Frontend        │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                         ┌──────────────────────┐
                         │   Node.js + Express  │
                         │     Backend API      │
                         └───────┬──────┬───────┘
                                 │      │
                    ┌────────────┘      └──────────────┐
                    ▼                                  ▼
           ┌─────────────────┐                ┌─────────────────┐
           │  MongoDB Atlas  │                │ External APIs   │
           │   Data Storage  │                │                 │
           └─────────────────┘                │ • PayPal        │
                                              │ • Gemini AI     │
                                              │ • Resend        │
                                              └─────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

- React
- Vite
- Axios
- Recharts
- CSS

### Backend

- Node.js
- Express.js
- Mongoose
- MongoDB Atlas
- REST APIs

### AI & Integrations

- Google Gemini API
- PayPal Sandbox
- Resend

### Development & Deployment

- Git
- GitHub
- Vercel
- Render

---

## 📁 Project Structure

```text
PayPilotAI/
│
├── client/
│   ├── public/
│   └── src/
│       ├── pages/
│       ├── services/
│       ├── App.jsx
│       ├── App.css
│       └── main.jsx
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── server.js
│
├── .gitignore
└── README.md
```

---

## ⚙️ Getting Started

### Prerequisites

Make sure you have the following:

- Node.js
- npm
- MongoDB Atlas account
- PayPal Developer account
- Google Gemini API access
- Resend account

---

### 1. Clone the Repository

```bash
git clone https://github.com/Chirashri/PayPilotAI.git
cd PayPilotAI
```

---

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

---

### 3. Configure Backend Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_BASE_URL=your_paypal_sandbox_url

GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=your_gemini_model

RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=your_sender_email
```

> ⚠️ **Important:** Never commit `.env` files, API keys, or secrets to GitHub.

---

### 4. Start the Backend

```bash
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

---

### 5. Install Frontend Dependencies

Open another terminal:

```bash
cd client
npm install
```

---

### 6. Configure Frontend Environment Variables

Create a `.env` file inside the `client` directory.

```env
VITE_API_URL=http://localhost:5000/api
VITE_PAYPAL_CLIENT_ID=your_paypal_client_id
```

> The PayPal Client ID is used by the frontend for the PayPal checkout integration.
>
> **Never put the PayPal Client Secret in the frontend.**

---

### 7. Start the Frontend

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

---

## 🔐 Security

PayPilot AI follows basic security practices for handling application credentials:

- Environment variables are stored in `.env` files
- `.env` files are excluded through `.gitignore`
- API credentials are not stored directly in source code
- PayPal Client Secret is handled by the backend
- Sensitive API requests are performed server-side
- Production environment variables are configured through Vercel and Render

---

## 💰 PayPal Sandbox Payment Flow

PayPilot AI uses **PayPal Sandbox** for development and demonstration purposes.

**No real money is processed through the application.**

The payment flow is:

```text
Invoice
   ↓
Create PayPal Order
   ↓
PayPal Sandbox Checkout
   ↓
Capture Payment
   ↓
Update Invoice Status
   ↓
Record Transaction
   ↓
Update Dashboard
```

---

## 🤖 AI Capabilities

Google Gemini powers several intelligent features within PayPilot AI:

- Financial question answering
- Dashboard insights
- Payment reminder generation
- Personalized overdue payment communication

The AI assistant uses application financial data to provide **context-aware responses** rather than operating as a standalone chatbot.

---

## 📧 AI Payment Reminder Workflow

PayPilot AI integrates **Resend** to deliver payment reminder emails.

```text
Overdue Invoice
       ↓
Calculate Late Payment Fee
       ↓
Generate AI Reminder
       ↓
Review / Edit Message
       ↓
Send Email
       ↓
Customer Receives Reminder
```

---

## 🧮 Late Payment Fees

For overdue unpaid invoices, PayPilot AI supports a one-time late payment fee.

### Default Configuration

```text
Late Payment Fee = 2% of original invoice amount
```

The application displays:

- Original invoice amount
- Late payment fee percentage
- Late payment fee amount
- Total outstanding amount

Late fees are **not applied before or on the invoice due date**.

---

## 🌐 Deployment

PayPilot AI is deployed using:

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |
| Payments | PayPal Sandbox |
| AI | Google Gemini |
| Email | Resend |

### Production URLs

**Frontend:**  
https://paypilot-ai-liart.vercel.app/

**Backend:**  
https://paypilotai-pnaa.onrender.com

**GitHub:**  
https://github.com/Chirashri/PayPilotAI

---

## 🎯 PayPal AI Hackathon 2026

PayPilot AI was built for the **PayPal AI Hackathon 2026**.

The project demonstrates how AI can be combined with payment infrastructure to improve:

- Invoice management
- Payment tracking
- Financial visibility
- Revenue analysis
- Customer payment follow-up
- Automated financial communication

The goal is to bring **payments, financial intelligence, and AI-powered automation** together in one platform.

---

## 👩‍💻 Author

**Chirashri Jagannatha Sapaliga**

Computer Science & Engineering

GitHub:  
https://github.com/Chirashri/PayPilotAI

---

## 📌 Project Status

**Status:** Hackathon Project — Active Development

PayPilot AI is an AI-powered payment and financial management solution developed for the **PayPal AI Hackathon 2026**.
