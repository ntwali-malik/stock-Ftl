require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const clientRoutes = require('./routes/clientRoutes');
const stockRoutes = require('./routes/stockRoutes');
const categoryRoutes = require("./routes/categoryRoutes");
const authRoutes = require("./routes/authRoutes");

connectDB();
const app = express();
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'supersecret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}));

// routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/stock', stockRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
