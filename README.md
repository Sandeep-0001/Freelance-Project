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
- Forgot password with OTP verification via email

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


## Email Setup (Google SMTP)

For the forgot password feature to work, you need to configure Google SMTP:

1. **Get a Gmail Account** (if you don't have one)
   
2. **Enable 2-Step Verification**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification if not already enabled

3. **Create an App Password**
   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "ReferGrow Backend" as the name
   - Click Generate
   - You'll get a 16-character password (e.g., `abcd efgh ijkl mnop`)
   - **Important**: Remove spaces from this password

4. **Update backend/.env**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=abcdefghijklmnop  # 16-char app password without spaces
   SMTP_FROM=your-email@gmail.com
   ```

5. **Restart the backend server**

The forgot password feature will now send OTP codes to users' email addresses.

## Notes

- The referral tree supports unlimited depth in the data model
- The UI/API tree view is intentionally depth-limited for response safety
- If your MongoDB doesn't support transactions (common in local dev), the purchase + income write falls back to non-transactional writes
- Authentication uses httpOnly cookies for enhanced security

## License

Private - All rights reserved
