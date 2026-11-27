# ERP Management Backend

Complete, modular, multi-tenant **ERP Management Backend** built with **NestJS**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **JWT + Passport**, **class-validator**, and **Swagger**.

## Key Architecture Highlights

- **Strict Separation of Sales and Services**:
  - `src/sales/` — Leads, Sales, Quotations, Sales Orders, Sales Invoices, Sales Returns, Sales Reports.
  - `src/services/` — Service Categories, Service Enquiries, Service Requests, Service Assignments, Work Orders, Work Progress, Service Completion, Service Reports.
- **Multi-Company Isolation**: Every tenant-scoped record includes `companyId`, enforced via `CompanyGuard`, `@CompanyId()`, and service-level Prisma filters.
- **Role-Based Access Control (RBAC)**: `SUPER_ADMIN`, `ADMIN`, `HR`, `ACCOUNTANT`, `SUPERVISOR`, `STORE_MANAGER`, `EMPLOYEE`.
- **Reusable Pagination, Search & Filtering**: `src/common/dto/pagination.dto.ts` + `src/common/utils/pagination.util.ts`.

## Setup

1. Copy `.env.example` to `.env` and configure `DATABASE_URL`, `JWT_SECRET`, and `JWT_REFRESH_SECRET`:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Generate Prisma Client and run migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
4. Start the server:
   ```bash
   npm run start:dev
   ```
5. Open Swagger UI at `http://localhost:5000/api/docs`.
