# Invoice-App

A full-stack invoice management application that allows users to register, log in, upload, and if users have admin permission, delete uploaded files

---

## Features
- User registration and secure login
- File uploads (invoices/photos) saved to server
- Users can view / download their uploaded files
- Admins can view, download and delete all user photos
- Role-based access (admin vs. regular user)
- PostgreSQL database integration

---

## Tech Stack

**Frontend:**
- React
- React Router
- Axios API

**Backend:**
- Node.js + Express.js
- PostgreSQL
- bcrypt (password hashing)
- dotenv (config.js / environment variables)

---

## Local Setup

### Prerequisites
- Node.js
- PostgreSQL
- npm

### 1. Clone Repo
- open terminal - bash or powershell
- git clone https://github.com/keleaper/Invoice-App.git
- cd Invoice-App

### 2. Install Dependencies
**Frontend:**
- cd frontend
- npm install

**Backend:**
- cd backend
- npm install

### 3. Run the App
**Frontend:**
- cd frontend
- npm start  // or npm run dev, depending on your setup

**Backend:**
- cd backend
- node server.js

# Admin Access
To view and delete all user uploads, log in with an admin account.
__Make sure is_admin is set to true in the database for the user__
