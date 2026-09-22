# Sunami Water Park — Website with Real Booking System

Ghazipur, Uttar Pradesh ka Sunami Water Park website — ismein ek asli backend aur database hai,
jisse customer ghar baithe ticket book kar sakte hain, khana add kar sakte hain, aur review de sakte hain.
Sab kuch ek database file (`sunami.db`) mein save hota hai jise aap admin panel se dekh sakte ho.

## Ismein kya hai

- `public/index.html` — customer-facing website (booking form, food add-ons, reviews, gallery, contact)
- `public/admin.html` — password-protected admin dashboard (bookings list, revenue, review approval)
- `server.js` — backend (Node.js + Express) jo saare API requests handle karta hai
- `database.js` — SQLite database setup (file-based, koi alag DB server install nahi karna)
- `.env.example` — admin username/password aur port ka template

## 1. Apne computer pe chalane ka tarika

**Zaroorat:** [Node.js](https://nodejs.org) installed hona chahiye (version 18 ya usse upar).

```bash
# project folder ke andar jao
cd sunami-water-park

# dependencies install karo
npm install

# .env file banao
cp .env.example .env
# .env file kholo aur ADMIN_USER / ADMIN_PASS apni pasand ke rakho

# server start karo
npm start
```

Ab browser mein kholo:
- Website: **http://localhost:3000**
- Admin panel: **http://localhost:3000/admin** (username/password wahi jo aapne `.env` mein daala)

Jaise hi koi booking ya review submit hoga, wo turant `sunami.db` file mein save ho jayega aur admin panel mein dikhega.

## 2. GitHub pe upload karne ka tarika

```bash
cd sunami-water-park
git init
git add .
git commit -m "Sunami Water Park website with booking system"
```

Phir GitHub.com pe ek naya empty repository banao, aur:

```bash
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git branch -M main
git push -u origin main
```

`.env` aur `sunami.db` file GitHub pe nahi jaayengi (yeh `.gitignore` mein already excluded hain) — yeh sahi hai, kyunki inmein aapka password aur customer data hota hai.

## 3. Website ko live karna (customers ke liye)

**Important:** GitHub sirf code store karta hai — website ko "live" aur chalta hua rakhne ke liye ek server chahiye jo Node.js chala sake. Sabse aasan free options:

### Option A — Render.com (recommended, free tier available)
1. [render.com](https://render.com) pe sign up karo aur apna GitHub account connect karo.
2. "New Web Service" → apna repo select karo.
3. Build command: `npm install`
4. Start command: `npm start`
5. Environment variables mein `ADMIN_USER` aur `ADMIN_PASS` add karo (same jo .env mein the).
6. Deploy karo — Render ek live URL de dega jaise `sunami-water-park.onrender.com`.

### Option B — Railway.app
Similar process — GitHub repo connect karo, environment variables daalo, deploy.

**Note:** Free hosting tiers par kabhi-kabhi disk temporary hoti hai, matlab lambe time baad `sunami.db` reset ho sakti hai. Agar aap chahte ho data hamesha ke liye persist ho, to hosting provider ka "persistent disk" / paid tier use karo, ya baad mein PostgreSQL jaisa managed database jod sakte hain — bata dena, wo bhi bana dunga.

## 4. Real business info daalna (zaroori, launch se pehle)

`public/index.html` mein jahan-jahan yeh likha hai, wahan replace karo:
- `[ Replace with real photo ... ]` — apni real photos daalo (koi bhi image URL ya local file path)
- `91XXXXXXXXXX` — apna real WhatsApp number
- `[ Replace with real address ]` — park ka real address
- `+91 XXXXX XXXXX` / `info@sunamiwaterpark.com` — real contact details

## 5. Prices badalna

Prices **sirf ek jagah** se control hoti hain — `server.js` file mein, upar yeh block:

```js
const PRICES = { adult: 499, kid: 349, group: 399 };
const FOOD_PRICES = { food_thali: 150, food_snacks: 90, food_drink: 40, food_icecream: 60 };
```

Yahan number badal do, poore website mein automatically wahi price use hogi (frontend calculator bhi isi se match karta hai).

## 6. Reviews ka flow

1. Customer website par review submit karta hai → database mein "pending" status ke saath save hota hai.
2. Aap `/admin` panel mein jaake "Reviews" tab mein wo review dekhte ho.
3. "Approve" button dabate ho → wo review turant website ke Reviews section mein sabko dikhne lagta hai.
4. Agar review sahi nahi laga, "Delete" kar sakte ho.

## Future upgrades (jab chahiye ho, bata dena)

- Email/SMS notification jab nayi booking aaye
- Online payment (Razorpay/UPI) integration
- Customer login + booking history
- Multiple ticket types ke liye QR code generation
