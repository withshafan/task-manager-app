# Task Manager App

A full-stack task management system with authentication, search, filtering, and progress tracking.

---

## Features

* User authentication (JWT-based login & registration)
* Full CRUD operations for tasks
* Search tasks by title or description
* Filter tasks by status (Pending, In Progress, Completed)
* Task completion progress tracking
* Responsive user interface

---

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

---

## Setup Instructions

### Prerequisites

Make sure you have installed:

* Node.js
* MongoDB

---

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

### Environment Variables


```
PORT=5000
MONGO_URI=mongodb://localhost:27017/taskmanager
JWT_SECRET=your_secret_key
```

---

## Project Structure

```
task-manager-app/
│
├── backend/      # API and database logic
├── frontend/     # React frontend
└── README.md
```

---

## License

This project is licensed under the MIT License.