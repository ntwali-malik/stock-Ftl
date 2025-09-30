const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.createUser = async (req, res) => {
  try {
    const { username, fullName, email, password, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'username & password required' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, fullName, email, password: hashed, role });
    await user.save();
    user.password = undefined;
    res.status(201).json(user);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'duplicate key' });
    res.status(500).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateUser = async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    const u = await User.findByIdAndDelete(req.params.id);
    if (!u) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
