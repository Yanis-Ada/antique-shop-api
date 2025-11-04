# Antique Shop API

A professional marketplace backend API for furniture trading between individuals, built with TypeScript and Express.js.

## Project Overview

This API powers a furniture marketplace with three distinct user roles and a complete validation workflow:

- **Sellers**: Register, manage profiles, and list furniture for sale
- **Administrators**: Validate/reject listings and manage marketplace content
- **Consumers**: Browse approved listings and manage shopping cart


## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

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
   PORT=3000
   DATABASE_PATH=./database/antique_shop.db
   SESSION_SECRET=your-super-secret-key-change-this-in-production
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   FRONTEND_URL=http://localhost:3001
   NODE_ENV=development
   ```