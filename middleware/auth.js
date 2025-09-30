exports.protect = (req, res, next) => {
  // Check if user is logged in via session
  if (!req.session.userId) {
    return res.status(401).json({ error: "Not authorized, please login" });
  }

  // Add user info to request object for compatibility
  req.user = {
    id: req.session.userId,
    role: req.session.role,
    username: req.session.username
  };
  
  next();
};

// Role-based access
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient role" });
    }
    next();
  };
};
