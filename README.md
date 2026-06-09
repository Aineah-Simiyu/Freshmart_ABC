# FreshMart Inventory Management System

FreshMart is a full-stack inventory management system built for a fruits and vegetables store. The application allows authenticated users to manage products, record sales, monitor stock levels, and view sales reports.

## Features

- Session-based authentication
- Product management (Create, Read, Update, Delete)
- Sales recording with automatic stock deduction
- Dashboard with inventory and sales metrics
- Stock and sales reports
- Responsive user interface

## Tech Stack

### Backend
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- MySQL
- Express Session
- Zod

### Frontend
- React
- Vite
- TypeScript
- Tailwind CSS
- TanStack Query
- React Router

## Setup

### Environment Variables

Create a `.env` file inside `backend/`:

```env
PORT=5000
DATABASE_URL="mysql://root:password@localhost:3306/freshmart_db"
SESSION_SECRET=change-me
CLIENT_URL=http://localhost:5173
```

### Install Dependencies

```bash
npm install

cd backend
npm install

cd ../frontend
npm install
```

### Database Setup

```bash
cd backend

npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

### Run the Application

From the project root:

```bash
npm run dev
```

Or run services separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Default Credentials

```txt
Email: admin@freshmart.com
Password: admin123
```

## Project Structure

```txt
backend/
 ├── modules/
 │   ├── auth
 │   ├── products
 │   ├── sales
 │   └── reports

frontend/
 ├── pages/
 ├── components/
 ├── api/
 └── contexts/
```

Backend request flow:

```txt
Route → Controller → Service → Repository → Prisma
```

## API Endpoints

### Authentication

```http
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

### Products

```http
GET    /api/products
POST   /api/products
PUT    /api/products/:id
DELETE /api/products/:id
```

### Sales

```http
GET  /api/sales
POST /api/sales
```

### Reports

```http
GET /api/reports/dashboard
GET /api/reports/stock
GET /api/reports/sales
```

## Notes

- Product stock is automatically reduced when a sale is recorded.
- Sales that exceed available stock are rejected.
- All routes except login require authentication.