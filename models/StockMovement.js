const mongoose = require("mongoose");

const StockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  movementType: { type: String, enum: ["PURCHASE", "SALE"], required: true },
  quantity: { type: Number, required: true },

  // optional client info for sales
  client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },

  // only used for products with serial numbers
  soldItems: [
    {
      serialNumber: { type: String },
      soldTo: { type: String }
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("StockMovement", StockMovementSchema);
