# Task Manager App

A full-stack task management system with authentication, search, filtering, real‑time notifications, analytics dashboard, dark mode, and file attachments.

> **Live Demo (Frontend only):** [https://task-manager-app-fgwm.vercel.app/](https://task-manager-app-fgwm.vercel.app/)  
> *Note: The backend is not deployed on the live URL because free hosting platforms do not support persistent WebSocket (Socket.IO) connections. All features work perfectly when running locally – see the video and setup instructions below.*

---

## Features

- ✅ User authentication (JWT‑based login & registration)  
- ✅ Full CRUD operations for tasks  
- ✅ Search tasks by title or description  
- ✅ Filter tasks by status (Pending, In Progress, Completed)  
- ✅ Task completion progress bar  
- ✅ **Collaboration**: Share tasks with other users  
- ✅ **Real‑time notifications** (Socket.IO) when a task is shared or its status changes  
- ✅ **Analytics dashboard** with pie chart (status distribution) and line chart (weekly/monthly trends)  
- ✅ **Dark mode** toggle  
- ✅ **File attachments** (images, PDFs, documents)  
- ✅ Responsive, modern UI  

---

## Tech Stack

**Backend**  
- Node.js, Express.js, MongoDB, JWT, Socket.IO, Multer, express‑validator

**Frontend**  
- React, Vite, Axios, Recharts, Socket.IO client

---

## Database Schema

**Task Model**

| Field       | Type     | Required | Description                    |
|-------------|----------|----------|--------------------------------|
| title       | String   | Yes      | Task title                     |
| description | String   | Yes      | Task description               |
| status      | String   | Yes      | Pending, In Progress, Completed|
| dueDate     | Date     | Yes      | Task deadline                  |
| owner       | ObjectId | Yes      | User who created the task      |
| sharedWith  | [ObjectId]| No      | Users with whom the task is shared |
| attachments | Array    | No       | File metadata (name, path, etc.) |
| createdAt   | Date     | Auto     | Timestamp                      |
| updatedAt   | Date     | Auto     | Timestamp                      |

**User Model**

| Field    | Type   | Required | Description        |
|----------|--------|----------|--------------------|
| username | String | Yes      | Unique username    |
| password | String | Yes      | Hashed password    |

**Notification Model**

| Field     | Type     | Required | Description                          |
|-----------|----------|----------|--------------------------------------|
| userId    | ObjectId | Yes      | Recipient user                       |
| type      | String   | Yes      | `task_shared` or `task_status_updated`|
| message   | String   | Yes      | Notification text                    |
| taskId    | ObjectId | No       | Related task                         |
| read      | Boolean  | No       | Read status (default false)          |
| createdAt | Date     | Auto     | Timestamp                            |

---

## Validation & Testing

- **Validation**: Backend uses `express-validator` to validate task titles, descriptions, due dates, and sharing inputs.  
- **Testing**: Backend unit tests (Jest + Supertest) – run `cd backend && npm test`.

---

## Setup Instructions (Local Development)

### Prerequisites
- Node.js (v20+ recommended)
- MongoDB (running locally or MongoDB Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/withshafan/task-manager-app.git
cd task-manager-app
```

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
JWT_SECRET=secret_key
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