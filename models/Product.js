const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Category", 
    required: true 
  },
  purchasePrice: { type: Number, required: true },
  sellingPrice: { type: Number },
  
  // total stock quantity
  quantity: { type: Number, default: 0 }, 

  // optional: only for products with unique serial/kit numbers
  items: [
    {
      serialNumber: { type: String, unique: true, sparse: true }, 
      isAvailable: { type: Boolean, default: true }
    }
  ],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", ProductSchema);
