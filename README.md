# Task Manager App

A full-stack task management system with authentication, search, filtering, and progress tracking.

***

## Features

* User authentication (JWT-based login and registration)
* Full CRUD operations for tasks
* Search tasks by title or description
* Filter tasks by status (Pending, In Progress, Completed)
* Task completion progress tracking
* Responsive user interface

***

## Tech Stack

**Backend**

* Node.js
* Express.js
* MongoDB
* JWT Authentication

**Frontend**

* React
* Vite
* Axios

***

## Database Schema

**Task Model**

| Field       | Type     | Required | Description                    |
|-------------|----------|----------|--------------------------------|
| title       | String   | Yes      | Task title                     |
| description | String   | Yes      | Task description               |
| status      | String   | Yes      | Pending, In Progress, Completed|
| dueDate     | Date     | Yes      | Task deadline                  |
| userId      | ObjectId | Yes      | Reference to the user          |
| createdAt   | Date     | Auto     | Timestamp                      |
| updatedAt   | Date     | Auto     | Timestamp                      |

**User Model**

| Field    | Type   | Required | Description        |
|----------|--------|----------|--------------------|
| username | String | Yes      | Unique username    |
| password | String | Yes      | Hashed password    |

***

## Validation

The backend uses `express-validator` to ensure the integrity of task titles, descriptions, and due dates before they reach the database.

***

## Setup Instructions

### Prerequisites

Make sure you have installed:

* Node.js
* MongoDB

***

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

***

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

***

## Testing

You can run the backend unit tests using Jest. Use the following command:

```bash
cd backend && npm test
```

***

## Environment Variables

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_secret_key
```

***

## Project Structure

```
task-manager-app/
│
├── backend/      # API and database logic
├── frontend/     # React frontend
└── README.md
```

***

## License

This project is licensed under the MIT License.