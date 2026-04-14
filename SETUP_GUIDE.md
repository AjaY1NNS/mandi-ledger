# MandiLedger – Complete Setup Guide

## Prerequisites
- Node.js 18+ installed
- A Google account (for Firebase + Google Sheets)
- Git (optional)

---

## Step 1 – Firebase Setup

### 1.1 Create a Firebase Project
1. Go to https://console.firebase.google.com
2. Click **Add project** → name it `MandiLedger`
3. Disable Google Analytics (optional) → **Create project**

### 1.2 Enable Email/Password Authentication
1. In Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Email/Password** → Save

### 1.3 Add a Web App
1. Project Overview → click the **</>** (Web) icon
2. Register app with nickname `MandiLedger`
3. Copy the `firebaseConfig` object — you'll need these values

### 1.4 Create Users in Firebase Auth
1. **Authentication** → **Users** → **Add user**
2. Add admin: `admin@yourdomain.com` / strong password
3. Add staff: `staff@yourdomain.com` / strong password

---

## Step 2 – Google Sheets Setup

### 2.1 Create the Spreadsheet
1. Go to https://sheets.google.com → create a new spreadsheet
2. Name it **MandiLedger Database**
3. Copy the Spreadsheet ID from the URL:
   `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

### 2.2 Create the "Entries" sheet
Rename **Sheet1** to `Entries` and add these headers in **Row 1**:

| A | B | C | D | E | F | G | H | I | J | K | L | M | N | O |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| id | date | vehicleCount | vehicleNumber | billNumber | buyer | seller | commodity | rate | weight | comment | createdBy | createdAt | updatedAt | updatedBy |

### 2.3 Create the "Users" sheet
Add a new tab named `Users` with these headers in **Row 1**:

| A | B |
|---|---|
| email | role |

Add your users:
```
admin@yourdomain.com    admin
staff@yourdomain.com    staff
```

---

## Step 3 – Google Apps Script Backend

### 3.1 Create the Apps Script project
1. In your Google Sheet → **Extensions** → **Apps Script**
2. Delete the default `function myFunction()` code
3. Copy the entire content of `backend/Code.gs` and paste it
4. Save (Ctrl+S)

### 3.2 Set Script Properties
1. In Apps Script → **Project Settings** (gear icon) → **Script properties**
2. Add these properties:
   - `SPREADSHEET_ID` → your spreadsheet ID from Step 2.1
   - `FIREBASE_PROJECT_ID` → your Firebase project ID (e.g., `mandyledger-abc12`)

### 3.3 Deploy as Web App
1. **Deploy** → **New deployment**
2. Type: **Web app**
3. Settings:
   - Description: `MandiLedger API v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy** → authorize permissions → copy the **Web app URL**

> **Important:** Every time you edit `Code.gs`, you must create a **new deployment** to apply changes. The URL stays the same for the same deployment type.

---

## Step 4 – Frontend Setup

### 4.1 Install dependencies
```bash
cd frontend
npm install
```

### 4.2 Configure environment variables
```bash
# Copy the example file
cp .env.example .env
```

Edit `.env` with your actual values:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=mandyledger-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=mandyledger-xxx
VITE_FIREBASE_STORAGE_BUCKET=mandyledger-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

VITE_API_BASE_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

### 4.3 Run in development
```bash
npm run dev
```
The app opens at http://localhost:3000

### 4.4 Build for production
```bash
npm run build
# Output is in frontend/dist/
```

---

## Step 5 – Deploy Frontend (Optional)

### Option A – Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting   # select 'dist' as public dir, SPA: yes
npm run build
firebase deploy
```

### Option B – Vercel
```bash
npm install -g vercel
cd frontend
vercel --prod
```

### Option C – Netlify
1. Connect your GitHub repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify dashboard

---

## API Reference

All requests go to:
```
GET  {VITE_API_BASE_URL}?action=<action>&token=<firebase_id_token>
POST {VITE_API_BASE_URL}   body: { action, token, ...fields }
```

> The frontend Axios service automatically appends the Firebase JWT token to every request via the `Authorization` header. The Apps Script backend reads it from the `token` field in the request body/params (see `extractToken` in `Code.gs`).

### Actions

| Action | Method | Required fields | Auth |
|--------|--------|-----------------|------|
| `list` | GET | — | Any role |
| `getUser` | GET | `email` | Any role |
| `add` | POST | date, vehicleNumber, billNumber, buyer, seller, commodity, rate, weight | Any role |
| `update` | POST | id + any fields | Own entries (staff) / All (admin) |
| `delete` | POST | id | Admin only |

### Response envelope
```json
{ "status": "ok", "message": "...", "data": {} }
{ "status": "error", "message": "...", "code": 403 }
```

---

## Updating the Token in API Calls

The frontend `api.js` adds the Firebase JWT via Axios interceptor:
```js
config.headers.Authorization = `Bearer ${token}`
```

In `Code.gs`, `extractToken()` reads from `e.parameter.token` or the POST body.
To support the `Authorization` header pattern (not natively available in GAS), you can use
the `token` field approach already implemented, or switch to Cloud Functions for full
header support.

---

## Project Structure

```
MandiLedger/
├── backend/
│   ├── Code.gs            ← Google Apps Script backend
│   └── appsscript.json    ← GAS manifest
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/    ← Modal, ConfirmDialog, LoadingSpinner, EmptyState
│   │   │   ├── dashboard/ ← DataTable, DataCard, SearchFilter, Pagination, StatsBar
│   │   │   ├── forms/     ← EntryForm
│   │   │   └── layout/    ← Header, Layout
│   │   ├── context/       ← AuthContext, AppContext
│   │   ├── hooks/         ← useEntries, useFilteredEntries, useConfirm
│   │   ├── pages/         ← LoginPage, DashboardPage
│   │   ├── services/      ← firebase.js, api.js
│   │   └── utils/         ← constants.js, helpers.js, validators.js
│   ├── .env.example
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── SETUP_GUIDE.md
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS error on API calls | Redeploy Apps Script as Web App with access = "Anyone" |
| "Invalid token" from backend | Check FIREBASE_PROJECT_ID script property matches your project |
| Role shows as "staff" for admin | Verify the Users sheet has the exact email and role = "admin" |
| Entries not saving | Check Sheets ID in script properties; check Apps Script execution logs |
| Build fails | Run `npm install` and check Node.js version (18+) |
| Firebase auth/invalid-credential | Enable Email/Password in Firebase Auth sign-in methods |
