# Client Lead Management System (Mini CRM)

> A full-stack lead management platform built for web development agencies, freelancers, and startups to convert incoming website inquiries into paying clients.

---

## 📌 Project Overview

When potential clients fill out a contact form on a business website, businesses need an organized system to:
1. **Store** incoming leads securely in a database.
2. **Track** lead status through a clear sales pipeline (`NEW` → `CONTACTED` → `IN_PROGRESS` → `CONVERTED` / `LOST`).
3. **Log** follow-up notes and record an audit timeline of all client interactions.
4. **Analyze** conversion metrics and export client records.

This project delivers an end-to-end Mini CRM solution with a modern Express backend, MongoDB database, and React frontend.

---

## ⚡ Key Features

- **🎯 Public Website Contact Form Demo**: Live embedded/standalone client inquiry form that pushes leads directly into the CRM backend in real time.
- **🛡️ Security & Rate Limiting**: `POST /api/public/contact` is protected by `express-rate-limit` (5 submissions per 15 minutes per IP) and strict input validation.
- **🔑 Admin Authentication**: Secure JWT token authentication with bcrypt password hashing. Default admin credentials configured safely via environment variables.
- **📈 Analytics Overview**: KPI summary cards displaying Total Leads, New Leads, In Progress, Converted Clients, and Conversion Rate (%).
- **🔄 Status Pipeline Management**: One-click status transitions through `NEW` → `CONTACTED` → `IN_PROGRESS` → `CONVERTED` (Success Terminal) or `LOST` (Closed Terminal).
- **📜 Chronological Activity Timeline**: Integrated `lead_activities` audit log recording lead creation, status updates, and timestamped follow-up notes.
- **🔍 Multi-Filter & Search**: Instant real-time search by lead name, email, or company, with status tabs and source dropdown filters (`Website Form`, `Referral`, `LinkedIn`, `Direct`).
- **⚠️ Delete Confirmation Dialog**: Safety modal requiring explicit user confirmation before permanently removing leads and cascading activities.
- **📥 CSV Data Export**: One-click download of all CRM client records as a formatted CSV file.

---

## 🏗️ Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 18 + Vite | Modern, high-performance Single Page Application |
| **Styling** | Tailwind CSS + Lucide React | Modern dark/glassmorphic design system with icons |
| **Backend** | Node.js + Express.js | RESTful API server |
| **Database** | MongoDB | NoSQL database managed using Mongoose |
| **Auth & Security** | JWT + bcryptjs + express-rate-limit | Token auth, password encryption, and API rate limiting |

---

## 📁 Repository Structure

```
client-lead-crm/
├── backend/
│   ├── src/
│   │   ├── │config/database.js       # MongoDB/Mongoose database connection
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT verification
│   │   │   ├── validate.middleware.js # Form & input validation
│   │   │   └── rateLimiter.js       # Public endpoint rate limiter
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # Admin login & profile
│   │   │   └── lead.controller.js   # Lead CRUD, activities, analytics & export
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── public.routes.js
│   │   │   └── lead.routes.js
│   │   ├── seed.js                  # Database seed script
│   │   └── server.js                # Express app entry point
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top header navigation
│   │   │   ├── AnalyticsSummary.jsx # KPI analytics cards
│   │   │   ├── LeadTable.jsx        # Searchable & filterable lead table
│   │   │   ├── LeadDetailDrawer.jsx # Status switcher & Activity timeline drawer
│   │   │   ├── ConfirmModal.jsx     # Delete confirmation dialog
│   │   │   ├── AddLeadModal.jsx     # Manual lead creation modal
│   │   │   └── Toast.jsx            # Dynamic notification alerts
│   │   ├── pages/
│   │   │   ├── Login.jsx            # Secure admin login view
│   │   │   ├── Dashboard.jsx        # Admin CRM dashboard view
│   │   │   └── PublicForm.jsx       # Public contact form landing page demo
│   │   ├── context/AuthContext.jsx  # Auth state management
│   │   └── services/api.js          # Axios API service
│   └── package.json
└── README.md
```

---

## 🚀 Quick Setup Instructions

### 1. Prerequisites
Ensure you have **Node.js (v18+)** and **npm** installed on your machine.

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Run database migration & seed sample data
npm run seed

# Start Express server (runs on http://localhost:5000)
npm run dev
```

### 3. Frontend Setup
In a separate terminal tab/window:
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development server (runs on http://localhost:5173)
npm run dev
```

---

## 🔑 Demo Credentials

- **Admin Email**: `admin@crm.com`
- **Admin Password**: `admin123`
*(Configurable via `backend/.env` file)*

---

## 📡 API Endpoint Reference

### Public API
| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/public/contact` | Submit contact form | Rate Limited (5 req / 15 min), Validated |

### Authentication API
| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Log in as admin and receive JWT token | Public |
| `GET` | `/api/auth/me` | Verify current admin token profile | JWT Protected |

### Admin Lead Management API
| Method | Endpoint | Description | Security |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/leads` | List all leads (supports `search`, `status`, `source`) | JWT Protected |
| `POST` | `/api/leads` | Create lead manually | JWT Protected |
| `GET` | `/api/leads/:id` | Get lead details & activity timeline | JWT Protected |
| `PATCH` | `/api/leads/:id/status` | Update status & record timeline activity | JWT Protected |
| `POST` | `/api/leads/:id/notes` | Add follow-up note to lead timeline | JWT Protected |
| `DELETE` | `/api/leads/:id` | Delete lead and associated activities | JWT Protected |
| `GET` | `/api/leads/analytics` | Retrieve KPI metrics and conversion rates | JWT Protected |
| `GET` | `/api/leads/export` | Download leads as CSV file | JWT Protected |

---

## 💼 Real-World Business Value

1. **Faster Response Times**: Businesses can view new contact form inquiries instantly on the dashboard as `NEW` leads.
2. **Accountability & Audit Trail**: Every status update and follow-up call note is recorded in the activity timeline with author and date tags.
3. **Data-Driven Insights**: Real-time conversion rate metrics help agency owners evaluate marketing source performance and closing effectiveness.
