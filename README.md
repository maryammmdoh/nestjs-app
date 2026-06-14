<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
## Description

A RESTful API built with **NestJS**, **MongoDB**, and **Mongoose** — featuring user authentication and management.

## 📬 API Documentation

[![Run in Postman](https://run.pstmn.io/button.svg)](https://documenter.getpostman.com/view/47293612/2sBXwsNAwC)

🔗 [View Full API Docs on Postman](https://documenter.getpostman.com/view/47293612/2sBXwsNAwC)

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| NestJS | Backend framework |
| MongoDB + Mongoose | Database |
| ConfigModule | Environment variables |
| class-validator | DTO validation |

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Create `src/.env.dev`:
```env
DB_URL_LOCAL=mongodb://localhost:27017/NestAppDB
PORT=3000
```

### 3. Run the app
```bash
# Development (watch mode)
npm run start:dev

# Production
npm run start:prod
```

---

## 🌐 API Endpoints

### App
| Method | URL | Description |
|---|---|---|
| `GET` | `/` | Health check |

### Auth
| Method | URL | Description |
|---|---|---|
| `GET` | `/auth` | Auth page |
| `POST` | `/auth/signup` | Register a new user |

### User
| Method | URL | Description |
|---|---|---|
| `GET` | `/user` | Get all users |

---

## 🏗️ Architecture

```
Request
   │
   ▼
Controller        ← receives HTTP request, calls Service
   │
   ▼
Service           ← business logic, calls Repo
   │
   ▼
Repo (UserRepo)   ← talks to MongoDB via Mongoose
   │
   ▼
MongoDB
```

> **Rule:** Controller → Service → Repo → DB. Each layer only talks to the one below it.

---



