# 📅 SyncStudy

### Real-Time Collaborative Study Platform

SyncStudy is a unified, real-time dashboard designed to streamline group collaboration. It replaces scattered tools (WhatsApp, Trello, Google Calendar) with a single platform where study groups can chat, plan tasks, schedule events, and share resources instantly.

### 🚀 **Live Demo:** [https://collaborative-study-planner.vercel.app/](https://collaborative-study-planner.vercel.app/)

---

## ✨ Key Features

* **⚡ Real-Time Collaboration:** Powered by **Socket.io**, ensuring that every action (message, task move, calendar event) is instantly reflected on all group members' screens.
* **📋 Collaborative Kanban Board:** A drag-and-drop task board (To Do, In Progress, Done) with **optimistic UI updates** for a lag-free user experience.
* **💬 Live Group Chat:** Instant messaging with real-time delivery and history fetching.
* **📅 Shared Calendar:** A synchronized group calendar for scheduling deadlines, meetings, and study sessions.
* **🎨 Interactive Whiteboard:** A live, multi-user whiteboard for brainstorming and drawing ideas together.
* **file_folder File Sharing:** Secure document and resource sharing, powered by **Cloudinary**.
* **🔔 Smart Notifications:** Real-time alerts for task assignments, new messages, and invites.
* **🔐 Secure Access:** Role-based access (Admin/Member) and secure, time-sensitive invite links.

---

## 🛠️ Tech Stack

### **Frontend**
* **React.js (Vite):** Fast, component-based UI.
* **Tailwind CSS:** Responsive styling.
* **Socket.io Client:** For real-time bidirectional communication.
* **@hello-pangea/dnd:** For the Kanban drag-and-drop functionality.
* **React Big Calendar:** For the calendar interface.
* **Context API:** For global state management (Auth, Socket, Notifications).

### **Backend**
* **Node.js & Express:** RESTful API architecture.
* **MongoDB & Mongoose:** NoSQL database with complex schema relationships (Groups -> Tasks/Events/Members).
* **Socket.io:** Event-driven architecture for handling real-time rooms and broadcasts.
* **JWT:** Secure user authentication.
* **Cloudinary:** Cloud storage for file uploads.

---

## 🔄 Real-Time Architecture

SyncStudy uses a **Room-based Socket Architecture** to manage data flow:

1.  **User Rooms:** Upon login, every user joins a private room (`socket.join(userId)`). This is used for personal notifications (e.g., "You were assigned a task").
2.  **Group Rooms:** When viewing a group, the user joins a public room (`socket.join(groupId)`). This is used for broadcasting shared state changes (e.g., moving a task card, sending a chat message).

---

## 💻 Local Installation

Follow these steps to run SyncStudy locally.

### 1. Clone the Repository
```bash
git clone [https://github.com/chakriappu140/syncstudy.git](https://github.com/chakriappu140/syncstudy.git)
cd syncstudy
```
### 2. Backend Setup
```bash
cd backend
npm install
```
Create a .env file in the backend folder with the following variables:
``` Code snippet
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
# Cloudinary Credentials for File Uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
Start the server:
```bash
npm start
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd frontend
npm install
```
Create a .env file in the frontend folder:
```Code snippet
VITE_API_BASE_URL=http://localhost:5000
```
Start the React app:
```bash
npm run dev
```

### 📡 API Endpoints
#### Auth
* POST /api/users - Register.
* POST /api/users/login - Login.
#### Groups
* POST /api/groups - Create a new group.
* GET /api/groups/my-groups - Fetch user's groups.
* POST /api/groups/:groupId/invite - Generate 1-hour invite token.
* POST /api/groups/join/:token - Join via link.
#### Features (Nested Routes)
* GET/POST /api/groups/:groupId/tasks - Kanban Board.
* GET/POST /api/groups/:groupId/calendar - Calendar Events.
* GET/POST /api/groups/:groupId/messages - Group Chat.
* POST /api/groups/:groupId/files - Upload Files.

### 👤 Author
Anekula Chakravarthy
* LinkedIn: [View Profile](https://www.linkedin.com/in/chakravarthy-anekula-2968a9257)
* GitHub: [chakriappu140](https://github.com/chakriappu140)

* This project demonstrates complex state management, real-time WebSocket integration, and full-stack architecture.
