const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  location: { type: String },
  contact: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Client", ClientSchema);
