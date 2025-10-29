require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const methodOverride = require('method-override');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect DB
const connectDB = require('./config/db');
connectDB();

// Log mongoose connection events so we can see connection status in Render logs
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected');
});
mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

// view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change_this',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/groc',
      ttl: 14 * 24 * 60 * 60
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 }
  })
);

// flash-like helper
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

// routes
app.use('/', require('./routes/index'));
app.use('/products', require('./routes/products'));
app.use('/cart', require('./routes/cart'));
app.use('/admin', require('./routes/admin'));
app.use('/auth', require('./routes/auth'));

// Bind to 0.0.0.0 so platform port scanning can detect the open port
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
