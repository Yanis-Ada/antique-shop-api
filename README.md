# Antique Shop API

A marketplace backend API for furniture trading between individuals, built with TypeScript and Express.js.

## Project Overview

This API powers a furniture marketplace with three distinct user roles and a complete validation workflow:

- **Sellers**: Register, manage profiles, and list furniture for sale
- **Administrators**: Validate/reject listings and manage marketplace content
- **Consumers**: Browse approved listings

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Yanis-Ada/antique-shop-api.git
   cd antique-shop-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   PORT=3001
   DATABASE_PATH=./database/antique_shop.db
   DATABASE_URL="file:./database/antique_shop.db"
   FRONTEND_URL=http://localhost:3000
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

## Features

- **JWT Authentication**: Authenticates and authorizes users via JWT tokens
- **Password Hashing**: Uses bcrypt to securely hash user passwords
- **User Roles**: Seller, Administrator, Consumer (all roles active)
- **Basic User & Listing Management**: Register, view profile, and create furniture listings
- **REST API**: Endpoints follow REST conventions (GET, POST, PUT, DELETE)
- **CORS Enabled**: Allows frontend to communicate with the API
- **Manual Testing**: API endpoints tested via Postman
- **No shopping cart implemented yet**

## Tech Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: SQLite
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **HTTP Middleware**: express.json, cors

## Learn More

- [Express Documentation](https://expressjs.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)