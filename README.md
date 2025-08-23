# ⚡ EV Recharge Bunk Web App

A **MERN Stack** web application that helps users easily locate nearby **EV recharge bunks**, view details, check slot availability, and book charging sessions.

---

## 🚀 Features

- 🔐 **User Authentication** – Login & Register securely  
- 📍 **Search Nearby EV Bunks** – Find charging stations around you  
- 🏠 **Bunk Details** – View address, contact number, and Google Maps location  
- 🔋 **Slot Availability** – Check real-time slot vacancy for EV charging  

---

## 🧰 Technologies Used

### Frontend
- [React.js](https://reactjs.org/) — Component-based UI library  
- [React Router](https://reactrouter.com/) — Client-side routing  
- [Axios](https://axios-http.com/) — API requests
- [Leaflet](https://leafletjs.com/) — Interactive maps with OpenStreetMap  

### Backend
- [Node.js](https://nodejs.org/) — JavaScript runtime  
- [Express.js](https://expressjs.com/) — Backend framework  
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) — Cloud-hosted NoSQL database  
- [Mongoose](https://mongoosejs.com/) — Object Data Modeling (ODM) for MongoDB  
- [JWT](https://jwt.io/) — Authentication  
- [bcrypt](https://www.npmjs.com/package/bcrypt) — Password hashing  
- [dotenv](https://www.npmjs.com/package/dotenv) — Environment variable management  

### Other Tools
- [OpenStreetMap](https://www.openstreetmap.org/) — Location & mapping (with Leaflet) 

---

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/vyshnvv/evrechargebunk-web-app
cd evrechargebunk-web-app
```
### 2. Install Dependencies

```bash
cd server
npm install
```

```bash
cd client
npm install
```

### 3. Set Up Environment Variables
Create a .env file inside the server/ directory with the following content:

```bash
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret_key
```
Replace ```your_mongodb_atlas_connection_string``` and ```your_jwt_secret_key``` with actual values.
Use ```openssl rand -base64 32``` to create a JWT secret or provide a random string.


### 4. Build the App
From the root directory:

```bash
npm run build
```

### 5. Start Development Servers

Backend (Express + Socket.IO)
```bash
cd server
npm run dev
```

Frontend (React)
```bash
cd client
npm run dev
```


## 🌐 Live Demo

[https://tictactoe-f147.onrender.com](https://tictactoe-ptmq.onrender.com)


