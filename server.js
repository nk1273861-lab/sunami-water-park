// server.js
// Sunami Water Park backend — handles bookings, food add-ons,
// reviews, and a small password-protected admin API.

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const basicAuth = require('express-basic-auth');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- Admin auth ----------
// Change these in your .env file before going live.
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'changeme123';

const adminAuth = basicAuth({
  users: { [ADMIN_USER]: ADMIN_PASS },
  challenge: true,
  realm: 'Sunami Water Park Admin'
});

// ---------- Pricing (single source of truth, server-side) ----------
const PRICES = { adult: 499, kid: 349, group: 399 };
const FOOD_PRICES = { food_thali: 150, food_snacks: 90, food_drink: 40, food_icecream: 60 };

function calcTotal(body) {
  let base = 0;
  if (body.ticket_type === 'School/Group') {
    base = (parseInt(body.group_size) || 0) * PRICES.group;
  } else {
    base = (parseInt(body.adults) || 0) * PRICES.adult + (parseInt(body.kids) || 0) * PRICES.kid;
  }
  let foodTotal = 0;
  const foodItems = [];
  Object.keys(FOOD_PRICES).forEach((key) => {
    if (body[key]) {
      foodTotal += FOOD_PRICES[key];
      foodItems.push(key);
    }
  });
  return { total: base + foodTotal, foodItems };
}

// ---------- Public: create a booking ----------
app.post('/api/bookings', (req, res) => {
  const b = req.body;
  if (!b.visitor_name || !b.visitor_phone || !b.visit_date || !b.ticket_type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const { total, foodItems } = calcTotal(b);
  const stmt = db.prepare(`
    INSERT INTO bookings
      (ticket_type, adults, kids, group_size, food_items, total_amount, visitor_name, visitor_phone, visitor_email, visit_date, notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)
  `);
  const info = stmt.run(
    b.ticket_type,
    b.adults || 0,
    b.kids || 0,
    b.group_size || 0,
    JSON.stringify(foodItems),
    total,
    b.visitor_name,
    b.visitor_phone,
    b.visitor_email || '',
    b.visit_date,
    b.notes || ''
  );
  res.json({ success: true, bookingId: info.lastInsertRowid, total });
});

// ---------- Public: submit a review (goes in as "pending") ----------
app.post('/api/reviews', (req, res) => {
  const r = req.body;
  if (!r.reviewer_name || !r.review_text || !r.rating) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const stmt = db.prepare(`
    INSERT INTO reviews (reviewer_name, reviewer_visit, rating, review_text)
    VALUES (?,?,?,?)
  `);
  const info = stmt.run(r.reviewer_name, r.reviewer_visit || '', r.rating, r.review_text);
  res.json({ success: true, reviewId: info.lastInsertRowid });
});

// ---------- Public: get approved reviews only ----------
app.get('/api/reviews', (req, res) => {
  const rows = db.prepare('SELECT * FROM reviews WHERE approved = 1 ORDER BY created_at DESC LIMIT 20').all();
  res.json(rows);
});

// ---------- Admin: view all bookings ----------
app.get('/api/admin/bookings', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM bookings ORDER BY created_at DESC').all();
  res.json(rows);
});

// ---------- Admin: update a booking's status ----------
app.post('/api/admin/bookings/:id/status', adminAuth, (req, res) => {
  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(req.body.status, req.params.id);
  res.json({ success: true });
});

// ---------- Admin: view all reviews (pending + approved) ----------
app.get('/api/admin/reviews', adminAuth, (req, res) => {
  const rows = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
  res.json(rows);
});

// ---------- Admin: approve a review so it becomes public ----------
app.post('/api/admin/reviews/:id/approve', adminAuth, (req, res) => {
  db.prepare('UPDATE reviews SET approved = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ---------- Admin: delete a review ----------
app.delete('/api/admin/reviews/:id', adminAuth, (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ---------- Admin dashboard page (password-protected) ----------
app.get('/admin', adminAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Sunami Water Park server running on http://localhost:${PORT}`);
});
