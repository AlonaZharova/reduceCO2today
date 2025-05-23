# 🌱 Reduce CO2 Today – Information Systems Project
 
This is a full-stack web application built to TODO.
 
The documentation describes browser-based functionality for user interaction and background notifications, as well as server-side routing and data processing.
 
---
 
## 📁 Project Structure
 
### 🔸 **Browser Side (Client)**
 
Located in the `public/` folder. These scripts run in the user's browser and handle user interactions, push notifications, and UI logic.
 
```
public/
│
├── js/
│   ├── chart.js                     # visualizes data recieved from the ReduceCO2-API
│   ├── main2.js                     # Main frontend logic
│   ├── mapScript.js                 # Manages map-related functionality
│   ├── navScript.js                 # Controls navigation UI
│   └── subscription.js              # Manages user to the ReduceCO2-API
```
 
> ✅ These scripts are **loaded in the browser** and use browser-only APIs like `localStorage`, `navigator.serviceWorker`, and `Notification`.
 
---
 
### 🔹 **Server Side (Node.js / Express)**
 
Handles all backend logic, including routing, user authentication, database access, and Firebase Admin SDK functionality.
 
```
routes/
├── auth.routes.js                  # Authentication routes
├── subscribe.routes.js             # ReduceCO2-API subscription logic
├── api.routes.js                   # Other domain-specific routes
...
 
app.js                              # Main Express application configuration
server.js                           # Entry point that starts the Express server
```
 
> ❌ These files run in **Node.js**, not in the browser. They **cannot use browser APIs** (like `localStorage`, `window`, or `navigator`).
 
---
 
## 💪 Technologies Used
 
* **Frontend:**
 
  * HTML/CSS + Tailwind
  * JavaScript (Browser APIs)
  * Firebase JS SDK (`firebase-messaging.js`)
  * Service Workers for background notifications
 
* **Backend:**
 
  * Node.js + Express
  * MongoDB + Mongoose
  * Firebase Admin SDK (for server-side FCM logic)
 
---
 
## ✅ Family and Friends Use Case
 
1. User visits the site and allows push notifications.
2. The browser registers a service worker and retrieves an FCM token using `firebase-messaging.js`.
3. The token is stored in `localStorage` and optionally sent to the server to subscribe the user to a topic (like `Monetary`, `Environmental`, etc.).
4. The server uses the Admin SDK to subscribe the token to the topic.
5. The user receives targeted push notifications based on their subscription.
 
---
📂 Environment Variables
 
This project uses environment variables stored in a .env file. Create one at the root of your project with the following keys:
 
MONGODB_URI="mongodb+srv://USERNAME:PASSWORD@infsystems.xuftu5t.mongodb.net/infsystems"
SESSION_SECRET="SESSION_SECRET"
GMAIL_PWD="GMAIL_PWD"
 
To get assess to MONGODB and GOOGLE Cloud get in touch with the Repo owner
 
⚠️ Important: Never commit your .env file to version control (add it to .gitignore).
 
---
 
## 📬 Contribution
 
Feel free to fork this repo, open issues, or submit pull requests to help improve this system!