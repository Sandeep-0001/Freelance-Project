# ReferGrow

A referral-based membership platform with binary tree structure and business volume (BV) income distribution.

## Project Structure

This is a monorepo containing two main applications:

- **Backend** (`/backend`): Express.js REST API server
- **Frontend** (`/frontend`): Next.js web application

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)


## Features

### User Features
- User registration with referral codes
- Binary tree referral structure (left/right placement)
- Purchase services to generate Business Volume (BV)
- View referral tree and income history
- Account management

### Admin Features
- Dashboard with statistics
- Service management (create, update, activate/deactivate)
- Distribution rule management
- View all users and transactions
- User management

### Technical Features
- JWT-based authentication (httpOnly cookies)
- Automatic binary tree placement
- Multi-level income distribution
- Transaction-safe BV calculations (with fallback for non-transactional MongoDB)
- Email notifications
- Rate limiting and security middleware
- Role-based access control (admin, user)

## Tech Stack

### Backend
- Express.js - REST API framework
- MongoDB/Mongoose - Database
- TypeScript - Type safety
- JWT (jose) - Authentication
- Nodemailer - Email service

### Frontend
- Next.js 15+ - React framework (App Router)
- React 19 - UI library
- TypeScript - Type safety
- Tailwind CSS - Styling


## Notes

- The referral tree supports unlimited depth in the data model
- The UI/API tree view is intentionally depth-limited for response safety
- If your MongoDB doesn't support transactions (common in local dev), the purchase + income write falls back to non-transactional writes
- Authentication uses httpOnly cookies for enhanced security

## License

Private - All rights reserved
