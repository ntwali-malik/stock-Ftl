const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  fullName: { type: String },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['technician', 'staff', 'admin'], default: 'technician' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
