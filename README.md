# HeroX Dashboard

A modern Next.js dashboard with authentication that integrates with the HeroX FastAPI backend.

## Features

- **Authentication System**: Signup and login with JWT tokens
- **Protected Routes**: Automatic redirection based on authentication status
- **Modern UI**: Built with Shadcn UI components and Tailwind CSS
- **Dark Mode Support**: Automatic dark mode detection
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Notifications**: Toast notifications for success/error states

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Authentication**: JWT tokens with js-cookie
- **Notifications**: Sonner toast notifications

## Getting Started

### Prerequisites

- Node.js 18+ 
- FastAPI backend running on `http://localhost:8000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Backend Integration

The frontend connects to the FastAPI backend at `http://localhost:8000`. Make sure your backend is running with the following endpoints:

- `POST /api/v1/signup` - User registration
- `POST /api/v1/login` - User authentication
- `GET /api/v1/me` - Get current user info

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard routes
│   ├── login/            # Login page
│   ├── signup/           # Signup page
│   └── layout.tsx        # Root layout with providers
├── components/           # Reusable components
│   ├── ui/              # Shadcn UI components
│   ├── DashboardLayout.tsx
│   └── ProtectedRoute.tsx
├── contexts/            # React contexts
│   └── AuthContext.tsx  # Authentication context
└── lib/                 # Utility functions
    ├── auth.ts          # Authentication service
    └── utils.ts         # General utilities
```

## Authentication Flow

1. **Unauthenticated users** are redirected to `/login`
2. **Successful login/signup** redirects to `/dashboard`
3. **Protected routes** automatically check authentication status
4. **JWT tokens** are stored in cookies for persistence

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting
- `npm run format` - Format code

## Environment Variables

No environment variables are required for development. The API base URL is hardcoded to `http://localhost:8000` in `src/lib/auth.ts`.

For production, you may want to add:
- `NEXT_PUBLIC_API_URL` - Backend API URL
