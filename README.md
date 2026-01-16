# Mudra Plus Backend

Backend API built with Node.js, Express, and Prisma PostgreSQL.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Prisma** - ORM for PostgreSQL
- **PostgreSQL** - Database

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. Install dependencies:
```cmd
npm install
```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your PostgreSQL connection string

3. Initialize Prisma:
```cmd
npx prisma generate
npx prisma migrate dev --name init
```

### Running the Application

Development mode with auto-reload:
```cmd
npm run dev
```

Production mode:
```cmd
npm start
```

### Prisma Commands

Generate Prisma Client:
```cmd
npm run prisma:generate
```

Create and apply migrations:
```cmd
npm run prisma:migrate
```

Open Prisma Studio (Database GUI):
```cmd
npm run prisma:studio
```

## API Endpoints

### Health Check
- `GET /health` - Check server and database status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## Project Structure

```
mudraplusbackend/
├── prisma/
│   └── schema.prisma      # Database schema
├── routes/
│   └── users.js           # User routes
├── index.js               # Main application file
├── package.json           # Dependencies
├── .env                   # Environment variables (not in git)
├── .env.example           # Example environment variables
└── README.md             # This file
```

## Environment Variables

- `DATABASE_URL` - PostgreSQL connection string
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
