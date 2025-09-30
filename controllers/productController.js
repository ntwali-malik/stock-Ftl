const Product = require('../models/Product');
const Category = require('../models/Category');

exports.createProduct = async (req, res) => {
  try {
    const { name, category, purchasePrice, sellingPrice, quantity, items } = req.body;
    
    // Validate required fields
    if (!name || !category || !purchasePrice) {
      return res.status(400).json({ error: 'Name, category, and purchase price are required' });
    }

    // Check if category exists
    const categoryExists = await Category.findById(category);
    if (!categoryExists) {
      return res.status(400).json({ error: 'Category not found' });
    }

    // Validate items array if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.serialNumber) {
          // Check for duplicate serial numbers
          const existingProduct = await Product.findOne({
            'items.serialNumber': item.serialNumber
          });
          if (existingProduct) {
            return res.status(400).json({ 
              error: `Serial number ${item.serialNumber} already exists` 
            });
          }
        }
      }
    }

    const product = new Product({
      name,
      category,
      purchasePrice,
      sellingPrice: sellingPrice || null,
      quantity: quantity || 0,
      items: items || []
    });

    await product.save();
    
    // Populate category information in response
    await product.populate('category', 'name');
    res.status(201).json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Product with this name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    let query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Search by name if provided
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    // Filter by price range if provided
    if (minPrice || maxPrice) {
      query.purchasePrice = {};
      if (minPrice) query.purchasePrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.purchasePrice.$lte = parseFloat(maxPrice);
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort('-createdAt');
    
    res.json(products);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name');
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    res.json(product);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { category, items } = req.body;
    
    // Check if category exists if being updated
    if (category) {
      const categoryExists = await Category.findById(category);
      if (!categoryExists) {
        return res.status(400).json({ error: 'Category not found' });
      }
    }

    // Validate items array if being updated
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (item.serialNumber) {
          // Check for duplicate serial numbers (excluding current product)
          const existingProduct = await Product.findOne({
            _id: { $ne: req.params.id },
            'items.serialNumber': item.serialNumber
          });
          if (existingProduct) {
            return res.status(400).json({ 
              error: `Serial number ${item.serialNumber} already exists` 
            });
          }
        }
      }
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    ).populate('category', 'name');
    
    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    res.json(product);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Product with this name already exists' });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

// Add serial number to a product
exports.addSerialNumber = async (req, res) => {
  try {
    const { serialNumber } = req.body;
    
    if (!serialNumber) {
      return res.status(400).json({ error: 'Serial number is required' });
    }

    // Check if serial number already exists
    const existingProduct = await Product.findOne({
      'items.serialNumber': serialNumber
    });
    
    if (existingProduct) {
      return res.status(400).json({ 
        error: `Serial number ${serialNumber} already exists` 
      });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        $push: { 
          items: { 
            serialNumber, 
            isAvailable: true 
          } 
        },
        $inc: { quantity: 1 }
      },
      { new: true }
    ).populate('category', 'name');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove serial number from a product
exports.removeSerialNumber = async (req, res) => {
  try {
    const { serialNumber } = req.body;
    
    if (!serialNumber) {
      return res.status(400).json({ error: 'Serial number is required' });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { 
        $pull: { 
          items: { serialNumber } 
        },
        $inc: { quantity: -1 }
      },
      { new: true }
    ).populate('category', 'name');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update stock quantity
exports.updateStock = async (req, res) => {
  try {
    const { quantity, operation } = req.body; // operation: 'add', 'subtract', 'set'
    
    if (typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Quantity must be a number' });
    }

    let updateQuery = {};
    
    switch (operation) {
      case 'add':
        updateQuery = { $inc: { quantity: quantity } };
        break;
      case 'subtract':
        updateQuery = { $inc: { quantity: -quantity } };
        break;
      case 'set':
        updateQuery = { $set: { quantity: quantity } };
        break;
      default:
        return res.status(400).json({ 
          error: 'Operation must be: add, subtract, or set' 
        });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true }
    ).populate('category', 'name');

    if (!product) return res.status(404).json({ error: 'Product not found' });
    
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get products by category
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const products = await Product.find({ category: categoryId })
      .populate('category', 'name')
      .sort('-createdAt');
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get low stock products (quantity below threshold)
exports.getLowStockProducts = async (req, res) => {
  try {
    const threshold = parseInt(req.query.threshold) || 10;
    
    const products = await Product.find({ 
      quantity: { $lt: threshold } 
    })
      .populate('category', 'name')
      .sort('quantity');
    
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
