\# PayPilot AI



> \*\*AI-powered invoice, payment, and financial management platform built for the PayPal AI Hackathon 2026.\*\*



PayPilot AI helps businesses manage invoices, track payments, monitor revenue, and automate payment follow-ups from a single dashboard. It combines \*\*PayPal payments\*\*, \*\*Google Gemini AI\*\*, \*\*MongoDB Atlas\*\*, and \*\*Resend email delivery\*\* to provide an intelligent payment management experience.



\---



\## 🚀 Features



\### 📊 Financial Dashboard

\- Real-time revenue overview

\- Total invoiced, paid, pending, and overdue amounts

\- Payment transaction statistics

\- Monthly revenue analytics

\- AI-generated financial insights



\### 🧾 Invoice Management

\- Create and manage invoices

\- Track invoice payment status

\- Customer and invoice details

\- Due-date tracking

\- Automatic overdue identification

\- Protection against editing paid invoices



\### 💳 PayPal Payments

\- PayPal Sandbox integration

\- Create PayPal payment orders

\- Capture payments securely

\- Automatically update invoice status after successful payment

\- Transaction tracking



\### 🤖 PayPilot AI Assistant

\- Ask questions about business finances

\- Analyze revenue and payment data

\- Provide financial summaries

\- Answer questions using live application data



\### 🔔 AI Payment Reminders

\- Automatically identify overdue invoices

\- Calculate late payment fees

\- Generate personalized payment reminders using Google Gemini

\- Review and edit AI-generated messages

\- Send reminders through email

\- Copy reminders for manual use



\### 📈 Analytics

\- Monthly revenue trends

\- Payment performance

\- Transaction summaries

\- Average payment value

\- Business performance insights



\---



\## 🏗️ System Architecture



```text

&#x20;                   ┌──────────────────────┐

&#x20;                   │      PayPilot AI     │

&#x20;                   │      React Client    │

&#x20;                   └──────────┬───────────┘

&#x20;                              │

&#x20;                              │ REST API

&#x20;                              ▼

&#x20;                   ┌──────────────────────┐

&#x20;                   │   Node.js + Express  │

&#x20;                   │      Backend API     │

&#x20;                   └───────┬──────┬───────┘

&#x20;                           │      │

&#x20;             ┌─────────────┘      └──────────────┐

&#x20;             ▼                                    ▼

&#x20;    ┌─────────────────┐                  ┌─────────────────┐

&#x20;    │  MongoDB Atlas  │                  │  External APIs  │

&#x20;    │   Data Storage  │                  │                 │

&#x20;    └─────────────────┘                  │ • PayPal        │

&#x20;                                         │ • Gemini AI     │

&#x20;                                         │ • Resend        │

&#x20;                                         └─────────────────┘

```



\---



\## 🛠️ Technology Stack



\### Frontend



\- React

\- Vite

\- Axios

\- Recharts

\- CSS



\### Backend



\- Node.js

\- Express.js

\- Mongoose

\- MongoDB Atlas

\- REST APIs



\### AI \& Integrations



\- Google Gemini API

\- PayPal Sandbox

\- Resend



\### Development \& Deployment



\- Git

\- GitHub

\- Render

\- Vercel



\---



\## 📁 Project Structure



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



\---



\## ⚙️ Getting Started



\### Prerequisites



Make sure the following are installed:



\- Node.js

\- npm

\- MongoDB Atlas account

\- PayPal Developer account

\- Google Gemini API access

\- Resend account



\### 1. Clone the repository



```bash

git clone https://github.com/Chirashri/PayPilotAI.git

cd PayPilotAI

```



\### 2. Install backend dependencies



```bash

cd server

npm install

```



\### 3. Configure backend environment variables



Create a `.env` file inside the `server` directory.



```env

PORT=5000



MONGODB\_URI=your\_mongodb\_connection\_string



PAYPAL\_CLIENT\_ID=your\_paypal\_client\_id

PAYPAL\_CLIENT\_SECRET=your\_paypal\_client\_secret

PAYPAL\_BASE\_URL=your\_paypal\_sandbox\_url



GEMINI\_API\_KEY=your\_gemini\_api\_key

GEMINI\_MODEL=your\_gemini\_model



RESEND\_API\_KEY=your\_resend\_api\_key

RESEND\_FROM\_EMAIL=your\_sender\_email

```



> \*\*Important:\*\* Never commit `.env` files or API keys to GitHub.



\### 4. Start the backend



```bash

npm run dev

```



The backend runs on:



```text

http://localhost:5000

```



\### 5. Install frontend dependencies



Open another terminal:



```bash

cd client

npm install

```



\### 6. Start the frontend



```bash

npm run dev

```



The frontend runs on:



```text

http://localhost:5173

```



\---



\## 🔐 Security



PayPilot AI follows basic security practices for handling application credentials:



\- Environment variables are stored in `.env`

\- `.env` files are excluded through `.gitignore`

\- API credentials are not stored in source code

\- PayPal credentials are handled by the backend

\- Sensitive API requests are performed server-side



\---



\## 💰 PayPal Sandbox



PayPilot AI uses the \*\*PayPal Sandbox\*\* environment for development and demonstration.



No real money is processed through the application.



The payment flow includes:



```text

Invoice

&#x20;  ↓

Create PayPal Order

&#x20;  ↓

PayPal Sandbox Checkout

&#x20;  ↓

Capture Payment

&#x20;  ↓

Update Invoice

&#x20;  ↓

Record Transaction

&#x20;  ↓

Update Dashboard

```



\---



\## 🤖 AI Capabilities



Google Gemini powers several intelligent features within PayPilot AI:



\- Financial question answering

\- Dashboard insights

\- Payment reminder generation

\- Personalized overdue payment communication



The AI assistant uses application financial data to provide context-aware responses rather than operating as a standalone chatbot.



\---



\## 📧 Email Reminders



PayPilot AI integrates \*\*Resend\*\* to deliver payment reminder emails.



The reminder workflow is:



```text

Overdue Invoice

&#x20;     ↓

Calculate Late Fee

&#x20;     ↓

Generate AI Reminder

&#x20;     ↓

Review / Edit Message

&#x20;     ↓

Send Email

&#x20;     ↓

Customer Receives Reminder

```



\---



\## 🧮 Late Payment Fees



For overdue unpaid invoices, PayPilot AI supports a one-time late payment fee.



The current default configuration is:



```text

Late Payment Fee = 2% of original invoice amount

```



The application displays:



\- Original invoice amount

\- Late payment fee

\- Total outstanding amount



Late fees are not applied before or on the invoice due date.



\---



\## 🌐 Deployment



The application is designed to be deployed using:



\- \*\*Frontend:\*\* Vercel

\- \*\*Backend:\*\* Render

\- \*\*Database:\*\* MongoDB Atlas



Production environment variables should be configured through the respective deployment platforms rather than committed to the repository.



\---



\## 🎯 Hackathon



\*\*PayPal AI Hackathon 2026\*\*



PayPilot AI demonstrates how AI can be combined with payment infrastructure to improve invoice management, financial visibility, and customer payment follow-up.



\---



\## 👩‍💻 Author



\*\*Chirashri Jagannatha Sapaliga\*\*



Computer Science \& Engineering



\---



\## 📌 Project Status



\*\*Status:\*\* Hackathon Project — Active Development



PayPilot AI is being developed as an AI-powered payment and financial management solution for the PayPal AI Hackathon 2026.

