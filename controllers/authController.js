const User = require("../models/User");
const bcrypt = require("bcryptjs");

const ALLOWED_ROLES = ['technician', 'staff', 'admin'];

// REGISTER
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;
    if (!username || !password) return res.status(400).json({ error: "Username & password required" });

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ error: "Username already exists" });

    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ error: "Email already exists" });
    }

    let userRole = role;
    if (role && !ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    if (!role) userRole = undefined; // Let schema default handle

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ username, email, fullName, password: hashed, role: userRole });
    await user.save();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ message: "User registered successfully", user: userObj });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Store user info in session
    req.session.userId = user._id;
    req.session.role = user.role;
    req.session.username = user.username;

    res.json({ 
      message: "Login successful", 
      role: user.role, 
      username: user.username,
      userId: user._id 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// GET CURRENT USER
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ message: "Logout successful" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
