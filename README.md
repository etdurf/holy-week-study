# Holy Week Study Experience

A family accountability tracker for the [Holy Week Study Experience](https://www.churchofjesuschrist.org/study/manual/easter-plan?lang=eng). Progress syncs in real-time across all devices using Firebase.

## Setup Guide (15 minutes total)

### Step 1: Create a Firebase Project (5 min)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **Add project**
3. Name it `holy-week-study` (or anything you want)
4. Turn off Google Analytics (not needed) → **Create project**
5. Once created, click the **Web** icon (`</>`) to add a web app
6. Nickname it `holy-week` → **Register app**
7. You'll see a config block like this — **copy it**:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "holy-week-study.firebaseapp.com",
  databaseURL: "https://holy-week-study-default-rtdb.firebaseio.com",
  projectId: "holy-week-study",
  storageBucket: "holy-week-study.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

8. Open `src/firebase.js` in this project and **paste your config** replacing the placeholder values

### Step 2: Enable the Realtime Database (2 min)

1. In the Firebase console sidebar, click **Build** → **Realtime Database**
2. Click **Create Database**
3. Choose any location → **Next**
4. Select **Start in test mode** → **Enable**

> ⚠️ Test mode is open for 30 days. For a family app this is fine. If you want it to last longer, go to **Realtime Database → Rules** and set:
>
> ```json
> {
>   "rules": {
>     ".read": true,
>     ".write": true
>   }
> }
> ```

### Step 3: Push to GitHub (3 min)

1. Create a new repo at [github.com/new](https://github.com/new) called `holy-week-study`
2. In your terminal:

```bash
cd holy-week-app
npm install
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/holy-week-study.git
git push -u origin main
```

### Step 4: Deploy to GitHub Pages (2 min)

```bash
npm run deploy
```

Then in GitHub:

1. Go to your repo → **Settings** → **Pages**
2. Set source to **Deploy from a branch**
3. Select `gh-pages` branch, `/ (root)` → **Save**
4. Wait ~1 minute, then your site is live at:

```
https://YOUR_USERNAME.github.io/holy-week-study/
```

### Step 5: Share the Link

Drop the link in the family group text. Everyone opens it on their phone, picks their group, and you're good to go!

## How It Works

- **Real-time sync**: When Ethan & Leka check off a day, Jackson & Lucy see it update instantly on their phones
- **No accounts needed**: Each phone picks a group on first visit and remembers it
- **Progress visible to all**: The scoreboard shows all three groups' progress with live-updating bars
- **Both tracks**: New Testament (9 days with activities) and Book of Mormon (8 days, study only)

## ⚠️ Important Config Notes

**`vite.config.js`** — The `base` must match your GitHub repo name:
```js
base: '/holy-week-study/',
```
If you named your repo differently, update this.

**`src/firebase.js`** — Must contain your actual Firebase config. The `databaseURL` field is required for Realtime Database.

## Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`

## Tech Stack

- React 18 + Vite
- Firebase Realtime Database (free tier)
- GitHub Pages (free hosting)
- Zero auth / zero backend code
