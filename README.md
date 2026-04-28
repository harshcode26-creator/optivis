# 🚀 Optivis — Team Check-in & Insights Platform

Optivis is a full-stack SaaS platform that helps teams track weekly progress, identify blockers, and gain actionable insights — all in one place.

It is designed for modern teams who want **visibility + accountability + simplicity** without heavy HR tools.

---

## 🌐 Live Demo

👉 http://optivis-delta.vercel.app

---

## 🧠 Problem It Solves

In many teams:

* Managers don’t know what employees are working on
* Blockers are reported too late
* Weekly updates are inconsistent
* Tools are either too heavy or ignored

👉 Optivis solves this by making check-ins:

* simple to submit
* structured for insights
* useful for both employees and managers

---

## ✨ Key Features

### 🔐 Authentication & Workspace System

* Create workspace (Admin)
* Join workspace via **shareable link + join code**
* Role-based access (Admin / Employee)

---

### 📝 Check-in System

* Admin creates weekly/monthly check-ins
* Employees submit responses
* Automatic assignment to all workspace members

---

### 📊 Admin Dashboard

* Total check-ins
* Submission rate
* Review tracking
* Average sentiment

---

### 🚧 Blocker Detection

* Automatically detects keywords like:

  * delay
  * issue
  * blocked
* Aggregates blockers across team

---

### 🧠 AI Insights (LLM-powered)

* Generates smart summaries of team activity
* Uses free models via OpenRouter
* Fallback system for reliability

---

### 🔔 Notifications

* Admin gets notified when employees submit check-ins
* Direct navigation to review page

---

### 📈 Employee Dashboard

* Personal check-in history
* Submission tracking
* Streak system (engagement)

---

### ⚡ Smart UX Features

* Pre-filled join links
* Auto-generated check-in titles (weekly/monthly)
* LocalStorage for reusable questions
* Cold start handling for backend (Render)

---

## 🏗️ Tech Stack

### Frontend

* React (Vite)
* Axios
* React Router

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### AI / Insights

* OpenRouter API
* Multiple free LLM models with fallback

### Deployment

* Frontend → Vercel
* Backend → Render
* Database → MongoDB Atlas

---

## ⚙️ Environment Variables

### Backend (.env)

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
```

---

### Frontend (.env)

```env
VITE_API_URL=https://optivis.onrender.com/api
```

---

## 🚀 Getting Started (Local Setup)

### 1. Clone repo

```bash
git clone https://github.com/your-username/optivis.git
cd optivis
```

---

### 2. Backend setup

```bash
cd backend
npm install
npm run dev
```

---

### 3. Frontend setup

```bash
npm install
npm run dev
```

---

## 🔐 Roles & Access

| Role     | Permissions                                         |
| -------- | --------------------------------------------------- |
| Admin    | Create check-ins, view insights, review submissions |
| Employee | Submit check-ins, view personal dashboard           |

---

## 📸 Screenshots

(Add your UI screenshots here)

* Login Page
* Admin Dashboard
* Employee Dashboard
* Check-in Form

---

## 🚧 Known Limitations

* Render free tier causes cold start delay (~20 sec)
* No real-time (WebSocket) updates yet
* Basic sentiment analysis (rule-based + LLM)

---

## 🚀 Future Improvements

* Real-time notifications (WebSockets)
* Slack / WhatsApp integration
* Advanced analytics dashboard
* Team-level performance trends
* Mobile responsiveness improvements

---

## 👨‍💻 Author

Harsh
Full Stack Developer (MERN)

---

## ⭐ Why This Project Matters

This is not just a CRUD app.

It demonstrates:

* Real-world SaaS architecture
* Role-based system design
* API design + integration
* LLM integration with fallback
* End-to-end deployment

---

## 📬 Feedback

If you have suggestions or feedback, feel free to open an issue or connect.

---

## ⭐ Show Support

If you found this useful, consider giving it a star ⭐
