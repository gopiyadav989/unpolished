<div align="center">

# 🚀 Unpolished Blog Platform

### **Modern Blogging Platform with Social Features**

[![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Hono.js](https://img.shields.io/badge/Hono.js-4.7.7-000000?style=for-the-badge&logo=hono)](https://hono.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.12.0-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.1.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

[![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)](https://github.com/yourusername/unpolished)
[![Deployment](https://img.shields.io/badge/Deployment-Live-brightgreen?style=for-the-badge)](https://unpolished-blog.vercel.app)

</div>

---

## 📋 Table of Contents

- [🚀 Quick Start](#-quick-start)
- [🛠️ Tech Stack](#️-tech-stack)
- [📁 Project Structure](#-project-structure)
- [📊 API Endpoints](#-api-endpoints)
- [🔧 Development](#-development)
- [🚀 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Git

### Installation

1. **Clone & Install**
```bash
git clone https://github.com/yourusername/unpolished.git
cd unpolished

# Install all dependencies
cd frontend && npm install
cd ../backend && npm install
cd ../common && npm install
```

2. **Environment Setup**
```bash
# Backend (.env)
DATABASE_URL="postgresql://username:password@localhost:5432/unpolished"
JWT_SECRET="your-super-secret-jwt-key"
CORS_ORIGIN="http://localhost:5173"

# Frontend (.env)
VITE_API_URL="http://localhost:8787/api/v1"
```

3. **Database Setup**
```bash
cd backend
npx prisma generate
npx prisma db push
```

4. **Start Development**
```bash
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend  
cd frontend && npm run dev
```

5. **Access**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8787

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Database |
|----------|---------|----------|
| React 19 | Hono.js | PostgreSQL |
| TypeScript | Prisma ORM | Prisma |
| Tailwind CSS | JWT Auth | bcrypt |
| BlockNote | Cloudflare Workers | - |

</div>

### 🏗️ Architecture Overview

<div align="center">

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React.js 19] --> B[TypeScript]
        B --> C[Tailwind CSS]
        C --> D[BlockNote Editor]
    end
    
    subgraph "API Gateway"
        E[Hono.js Server] --> F[JWT Auth]
        F --> G[Rate Limiting]
        G --> H[CORS]
    end
    
    subgraph "Data Layer"
        I[Prisma ORM] --> J[PostgreSQL]
    end
    
    A --> E
    E --> I
    I --> J
```

</div>

---

## 📁 Project Structure

```
unpolished/
├── frontend/          # React app
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── pages/       # Page components
│   │   └── hooks/       # Custom hooks
├── backend/           # Hono.js API
│   ├── src/routes/     # API routes
│   └── prisma/         # Database schema
└── common/            # Shared utilities
```

---

## 📊 API Endpoints

<div align="center">

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/signup` | Register user |
| `POST` | `/api/v1/auth/signin` | Login user |
| `GET` | `/api/v1/auth/me` | Get current user |
| `GET` | `/api/v1/blog` | Get all blogs |
| `POST` | `/api/v1/blog` | Create blog |
| `GET` | `/api/v1/blog/:id` | Get blog by ID |
| `PUT` | `/api/v1/blog/:id` | Update blog |
| `DELETE` | `/api/v1/blog/:id` | Delete blog |
| `GET` | `/api/v1/profile/:username` | Get user profile |
| `POST` | `/api/v1/comments` | Create comment |

</div>

### 🔐 Authentication Flow

<div align="center">

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant B as Backend
    participant D as Database
    
    U->>F: Enter credentials
    F->>B: POST /auth/signin
    B->>D: Verify credentials
    D->>B: User data
    B->>B: Generate JWT token
    B->>F: Return token
    F->>F: Store token
    F->>U: Redirect to dashboard
```

</div>

---

## 🔧 Development

### Commands
```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run lint         # Lint code

# Backend
npm run dev          # Start dev server
npm run deploy       # Deploy to Cloudflare
npx prisma studio    # Open database GUI
```

### Database
```bash
npx prisma migrate dev --name migration_name
npx prisma generate
npx prisma db push
```

---

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel --prod
```

### Backend (Cloudflare Workers)
```bash
cd backend
npm run deploy
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

<div align="center">

**Made with ❤️ by the Unpolished Team**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/yourusername)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/yourusername)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/yourusername)

**⭐ Star this repository if you found it helpful!**

</div>
