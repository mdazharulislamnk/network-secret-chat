# Network Secret Chat 🔒

A secure, private, global chat application built with React and Firebase. This application utilizes a hardcoded "login wall" to prevent unauthorized entry, while securing its backend data using custom Firebase Security Rules and secret tokens hidden via environment variables.

This guide provides a **complete, step-by-step tutorial** for anyone who wants to build, secure, and deploy this exact application from scratch.

---

## Table of Contents
1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Step 1: Initial Project Setup](#step-1-initial-project-setup)
4. [Step 2: Firebase Setup](#step-2-firebase-setup)
5. [Step 3: Firebase Security Rules](#step-3-firebase-security-rules)
6. [Step 4: Writing the Code](#step-4-writing-the-code)
7. [Step 5: Local Testing](#step-5-local-testing)
8. [Step 6: Deployment to Netlify](#step-6-deployment-to-netlify)

---

## Features
*   **Secure Access:** A login wall requiring specific credentials before revealing the chat.
*   **Real-time Global Chat:** Instant messaging powered by Firebase Firestore.
*   **Image Sharing:** Ability to upload and send images seamlessly via Firebase Storage.
*   **Message Management:** Users can delete their own messages.
*   **Security Rules:** Backend protection enforcing a secret token check to prevent unauthorized read/write access.
*   **Modern UI:** Responsive, gradient-animated user interface.

## Tech Stack
*   **Frontend Framework:** React.js
*   **Backend Database:** Firebase (Firestore & Storage)
*   **Styling:** Vanilla CSS
*   **Deployment:** Netlify
*   **Environment Management:** `dotenv` (built into Create React App)

---

## Step 1: Initial Project Setup

1. **Create a new React application:**
   Open your terminal and run:
   ```bash
   npx create-react-app network-secret-chat
   cd network-secret-chat
   ```

2. **Install Firebase SDK:**
   ```bash
   npm install firebase
   ```

3. **Set up Environment Variables:**
   To keep your credentials and Firebase configuration hidden from public repository scanners (like GitHub Secret Scanning), create a file named exactly `.env` in the root of your project directory. 
   *(Note: Ensure `.env` is listed in your `.gitignore` file!)*

   ```env
   # Login Credentials
   REACT_APP_USERNAME=your_secret_username
   REACT_APP_PASSWORD=your_secret_password
   REACT_APP_TOKEN=your_security_token

   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=your_api_key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   REACT_APP_FIREBASE_APP_ID=your_app_id
   ```

---

## Step 2: Firebase Setup

This project relies on Firebase for its real-time database and image storage.

### A. Create the Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **"Add project"** and name it (e.g., `network-secret-chat`).
3. You can disable Google Analytics for a private app.

### B. Register Your Web App
1. On the Project Overview page, click the **Web icon (`</>`)**.
2. Give your app a nickname and click **"Register app"**.
3. Firebase will provide a `firebaseConfig` object. Save these values for your `.env` file.

### C. Enable Firestore & Storage
1. Go to **Build > Firestore Database** and click **"Create database"**. Start in Test Mode (we will lock it down later) and choose a location.
2. Go to **Build > Storage** and click **"Get started"**. Start in Test Mode and choose a location.

---

## Step 3: Firebase Security Rules

Since the Firebase configuration is public in the frontend code, we must use **Firestore Security Rules** to lock down the database. We will enforce that *every* message created, updated, or deleted MUST contain your secret token (`REACT_APP_TOKEN`).

1. In the Firebase Console, go to **Firestore Database** -> **Rules** tab.
2. Replace the default rules with the following code (make sure to replace `"your_security_token"` with the exact token you put in your `.env` file):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /messages/{document} {
      // Anyone can read the messages (if they get past the frontend login)
      allow read: if true;
      
      // ONLY allow writes/deletes if the data contains the correct secret token
      allow create: if request.resource.data.token == "your_security_token";
      allow update: if request.resource.data.token == "your_security_token";
      allow delete: if resource.data.token == "your_security_token";
    }
  }
}
```
3. Click **Publish**. Your database is now 100% secure from unauthorized modifications!

---

## Step 4: Writing the Code

### 1. The Firebase Config (`src/firebase.js`)
Create `src/firebase.js` and use `process.env` to read your keys:

```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### 2. The Application Styles (`src/App.css`)
*(Refer to the repository file for full CSS source)*

### 3. The React Component (`src/App.js`)
*(Refer to the repository file for full React source)*

---

## Step 5: Local Testing

To test your application locally, simply run:
```bash
npm start
```
This will open your browser to `http://localhost:3000`. 

---

## Step 6: Deployment to Netlify

Once everything works perfectly on your computer, you can easily host it on Netlify for free.

### Option 1: Drag & Drop (Manual)
1. Build the production application locally:
   ```bash
   npm run build
   ```
2. Log into [Netlify](https://www.netlify.com/).
3. Navigate to your Team page and drag and drop the newly created **`build`** folder into the Netlify deployment zone.
4. **Important:** The keys are already baked into the `build` folder from your local `.env`.

### Option 2: Continuous Deployment via GitHub (Recommended)
1. Push this repository to your GitHub account.
2. In Netlify, click **"Add new site"** -> **"Import an existing project"**.
3. Select GitHub and select your repository.
4. Go to **Site configuration > Environment variables** and add all the keys from your `.env` file.
5. Click **"Deploy site"**. Netlify will automatically rebuild whenever you push changes to GitHub!
