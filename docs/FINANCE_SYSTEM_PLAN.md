# 💰 Finance System - Implementation Plan

## Overview
Complete financial tracking system for worker salaries, client billing, invoicing, and payments.

---

## 🗄️ Phase 1: Database Schema

### Tables to Create:

#### 1. **WorkerSalary**
```prisma
model WorkerSalary {
  id            String   @id @default(cuid())
  workerId      String
  worker        User     @relation(fields: [workerId], references: [id], onDelete: Cascade)

  // Salary Info
  amount        Float    // Monthly/hourly rate
  salaryType    String   // MONTHLY, HOURLY, PER_REVIEW
  currency      String   @default("USD")

  // Period
  effectiveFrom DateTime
  effectiveTo   DateTime?

  // Payment tracking
  isPaid        Boolean  @default(false)
  paidAt        DateTime?
  paidBy        String?  // Admin who paid
  paymentMethod String?  // BANK, CASH, PAYPAL, etc
  notes         String?  @db.Text

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([workerId])
  @@index([effectiveFrom])
}
```

#### 2. **ClientBilling**
```prisma
model ClientBilling {
  id          String   @id @default(cuid())
  clientId    String
  client      Client   @relation(fields: [clientId], references: [id], onDelete: Cascade)

  // Billing Info
  amount      Float
  description String
  billingType String   // MONTHLY, PER_REVIEW, ONE_TIME, CUSTOM
  currency    String   @default("USD")

  // Period
  billingDate DateTime
  dueDate     DateTime

  // Payment tracking
  isPaid      Boolean  @default(false)
  paidAt      DateTime?
  paidAmount  Float?
  paymentMethod String?
  transactionId String?

  // Status
  status      String   @default("PENDING") // PENDING, SENT, PAID, OVERDUE, CANCELLED

  // Invoice
  invoiceId   String?
  invoice     Invoice? @relation(fields: [invoiceId], references: [id])

  notes       String?  @db.Text
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  createdBy   String   // Admin who created

  @@index([clientId])
  @@index([billingDate])
  @@index([status])
}
```

#### 3. **Invoice**
```prisma
model Invoice {
  id            String   @id @default(cuid())
  invoiceNumber String   @unique // INV-2024-0001

  // Client info
  clientId      String
  client        Client   @relation(fields: [clientId], references: [id])

  // Invoice details
  issueDate     DateTime @default(now())
  dueDate       DateTime
  amount        Float
  tax           Float?   @default(0)
  discount      Float?   @default(0)
  totalAmount   Float    // amount + tax - discount
  currency      String   @default("USD")

  // Items
  items         Json     // Array of line items

  // Status
  status        String   @default("DRAFT") // DRAFT, SENT, PAID, OVERDUE, CANCELLED
  isPaid        Boolean  @default(false)
  paidAt        DateTime?
  paidAmount    Float?

  // Relations
  billings      ClientBilling[]
  payments      Payment[]

  // Notes & attachments
  notes         String?  @db.Text
  attachmentUrl String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  createdBy     String   // Admin who created

  @@index([clientId])
  @@index([invoiceNumber])
  @@index([status])
}
```

#### 4. **Payment**
```prisma
model Payment {
  id              String   @id @default(cuid())

  // Payment type
  paymentType     String   // INVOICE, WORKER_SALARY, EXPENSE, OTHER

  // Related entities
  invoiceId       String?
  invoice         Invoice? @relation(fields: [invoiceId], references: [id])
  clientId        String?
  client          Client?  @relation(fields: [clientId], references: [id])
  workerId        String?
  worker          User?    @relation(fields: [workerId], references: [id])

  // Payment details
  amount          Float
  currency        String   @default("USD")
  paymentMethod   String   // BANK, CASH, PAYPAL, STRIPE, WIRE, CHECK
  transactionId   String?
  paymentDate     DateTime @default(now())

  // Status
  status          String   @default("COMPLETED") // PENDING, COMPLETED, FAILED, REFUNDED

  // Notes
  notes           String?  @db.Text
  receiptUrl      String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  createdBy       String   // Admin who recorded

  @@index([invoiceId])
  @@index([clientId])
  @@index([workerId])
  @@index([paymentDate])
}
```

---

## 🔌 Phase 2: API Endpoints

### Worker Salary Endpoints:
- `POST   /api/finance/worker-salary` - Create salary record
- `GET    /api/finance/worker-salary?workerId=xxx` - Get worker salaries
- `GET    /api/finance/worker-salary/[id]` - Get single salary record
- `PATCH  /api/finance/worker-salary/[id]` - Update salary
- `POST   /api/finance/worker-salary/[id]/pay` - Mark as paid
- `DELETE /api/finance/worker-salary/[id]` - Delete salary record

### Client Billing Endpoints:
- `POST   /api/finance/client-billing` - Create billing
- `GET    /api/finance/client-billing?clientId=xxx` - Get client billings
- `GET    /api/finance/client-billing/[id]` - Get single billing
- `PATCH  /api/finance/client-billing/[id]` - Update billing
- `POST   /api/finance/client-billing/[id]/pay` - Record payment
- `DELETE /api/finance/client-billing/[id]` - Delete billing

### Invoice Endpoints:
- `POST   /api/finance/invoices` - Create invoice
- `GET    /api/finance/invoices?clientId=xxx` - Get invoices
- `GET    /api/finance/invoices/[id]` - Get single invoice
- `GET    /api/finance/invoices/[id]/pdf` - Generate PDF
- `PATCH  /api/finance/invoices/[id]` - Update invoice
- `POST   /api/finance/invoices/[id]/send` - Send invoice to client
- `DELETE /api/finance/invoices/[id]` - Delete invoice

### Payment Endpoints:
- `POST   /api/finance/payments` - Record payment
- `GET    /api/finance/payments?type=xxx` - Get payments
- `GET    /api/finance/payments/[id]` - Get single payment
- `PATCH  /api/finance/payments/[id]` - Update payment
- `DELETE /api/finance/payments/[id]` - Delete payment

### Reports Endpoints:
- `GET    /api/finance/reports/overview` - Financial overview
- `GET    /api/finance/reports/worker-earnings` - Worker earnings report
- `GET    /api/finance/reports/client-revenue` - Client revenue report
- `GET    /api/finance/reports/profit-loss` - Profit & loss statement

---

## 🎨 Phase 3: UI Components

### Dashboard
**File:** `src/app/(dashboard)/finance/page.tsx`
- Financial overview cards
- Recent transactions
- Pending payments
- Revenue/expense charts

### Worker Salary Management
**File:** `src/app/(dashboard)/finance/workers/page.tsx`
- Worker salary list
- Add/edit salary modal
- Payment tracking
- Salary history

### Client Billing
**File:** `src/app/(dashboard)/finance/clients/page.tsx`
- Client billing list
- Create billing modal
- Payment status
- Overdue alerts

### Invoices
**File:** `src/app/(dashboard)/finance/invoices/page.tsx`
- Invoice list with filters
- Create invoice modal
- Invoice preview
- PDF generation
- Send invoice via email

### Payments
**File:** `src/app/(dashboard)/finance/payments/page.tsx`
- Payment history
- Record payment modal
- Payment methods
- Receipt management

### Reports
**File:** `src/app/(dashboard)/finance/reports/page.tsx`
- Financial charts
- Profit & loss
- Worker earnings
- Client revenue
- Export to CSV/PDF

---

## 📊 Features

### Core Features:
- ✅ Worker salary tracking (monthly/hourly/per-review)
- ✅ Client billing management
- ✅ Professional invoice generation
- ✅ Payment tracking & receipts
- ✅ Financial reports & analytics
- ✅ PDF export for invoices
- ✅ Email integration
- ✅ Multi-currency support
- ✅ Overdue payment alerts
- ✅ Profit & loss calculations

### Advanced Features:
- ⏳ Recurring billing (future)
- ⏳ Tax calculations (future)
- ⏳ Expense tracking (future)
- ⏳ Payroll integration (future)
- ⏳ Stripe/PayPal integration (future)

---

## 🚀 Implementation Order

### Day 1: Database & Basic API
1. ✅ Create Prisma schema
2. ✅ Run migrations
3. ✅ Create basic CRUD APIs
4. ✅ Test with Postman

### Day 2: UI Components
1. ✅ Finance dashboard page
2. ✅ Worker salary page
3. ✅ Client billing page
4. ✅ Invoice page

### Day 3: Advanced Features
1. ✅ Invoice PDF generation
2. ✅ Email sending
3. ✅ Reports & charts
4. ✅ Testing & bug fixes

---

## 🎯 Success Criteria

- ✅ Admins can track worker salaries
- ✅ Admins can bill clients
- ✅ Professional invoices can be generated
- ✅ Payments are tracked accurately
- ✅ Financial reports are available
- ✅ System is secure (admin-only access)
- ✅ All data is auditable (createdBy, updatedAt)

---

**Status:** Ready to implement
**Estimated Time:** 2-3 days
**Priority:** High
