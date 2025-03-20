# Employee Attendance Tracking Backend

This is the backend server for the Employee Attendance Tracking App, which handles user authentication, office location data, attendance records, and API endpoints that interact with the mobile app.

## Features

- User authentication using Firebase
- Office location management with geospatial capabilities
- Attendance tracking with check-in/check-out functionality
- Location verification to ensure employees are within office radius
- Role-based access control (employee, manager, admin)
- Attendance reporting and history

## Tech Stack

- Node.js with Express.js
- MongoDB for database
- Firebase Authentication
- GeoLib for geospatial calculations

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Firebase project with Authentication enabled

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on the `.env.example` file
4. Set up Firebase:
   - Create a Firebase project in the Firebase console
   - Enable Authentication
   - Generate a new private key in Project settings > Service accounts
   - Save the JSON file as `config/firebase-service-account.json`

## Configuration

Configure the application by setting the following environment variables in the `.env` file:

```
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/employee-attendance

# Geolocation Settings
MAX_DISTANCE_METERS=200
```

## Running the Application

### Development mode

```
npm run dev
```

### Production mode

```
npm start
```

## API Endpoints

### Office Locations

- `GET /api/office-location` - Get all office locations
- `GET /api/office-location/:id` - Get office location by ID
- `POST /api/office-location` - Create a new office location (Admin only)
- `PUT /api/office-location/:id` - Update an office location (Admin only)
- `DELETE /api/office-location/:id` - Delete an office location (Admin only)

### Attendance

- `POST /api/attendance/check-in` - Employee check-in with location verification
- `POST /api/attendance/check-out` - Employee check-out
- `GET /api/attendance/history/:userId` - Get attendance history for a user
- `GET /api/attendance/current` - Get current user's active attendance
- `GET /api/attendance/daily-report` - Get daily attendance report (Admin/Manager only)

## License

ISC