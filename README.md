# Cuppa Place

Cuppa Place is a full-stack web application featuring a Next.js frontend and an Express/Node.js backend. 

## Project Structure

This repository is divided into two main parts:

- `/frontend` - The frontend web application built with Next.js, React, Tailwind CSS, and Framer Motion.
- `/backend` - The backend API server built with Node.js, Express, Sequelize (MySQL), and Socket.io.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [MySQL](https://www.mysql.com/)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables by creating a `.env` file (refer to existing configurations or `.env.example` if present).
4. Run the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Technologies Used

### Frontend
- Next.js (App Router)
- React
- Tailwind CSS
- Radix UI
- Framer Motion
- Axios
- Recharts
- Socket.io Client

### Backend
- Node.js
- Express
- Sequelize ORM
- MySQL
- Socket.io
- JsonWebToken (JWT)
- Bcryptjs
- Nodemailer
- Multer

## License

This project is licensed under the MIT License.
