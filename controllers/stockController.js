const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Client = require('../models/Client');
const mongoose = require('mongoose');

exports.createMovement = async (req, res) => {
  try {
    const { product, movementType, quantity, client, soldItems } = req.body;
    
    // Validate required fields
    if (!product || !movementType || !quantity) {
      return res.status(400).json({ error: 'Product, movementType and quantity are required' });
    }

    // Validate movement type
    if (!['PURCHASE', 'SALE'].includes(movementType)) {
      return res.status(400).json({ error: 'Movement type must be PURCHASE or SALE' });
    }

    // Check if product exists
    const productExists = await Product.findById(product);
    if (!productExists) {
      return res.status(400).json({ error: 'Product not found' });
    }

    // For sales, validate client if provided
    if (movementType === 'SALE' && client) {
      const clientExists = await Client.findById(client);
      if (!clientExists) {
        return res.status(400).json({ error: 'Client not found' });
      }
    }

    // For sales, check stock availability and validate serial numbers
    if (movementType === 'SALE') {
      // Check if product has enough quantity
      if (quantity > productExists.quantity) {
        return res.status(400).json({ 
          error: 'Not enough stock', 
          availableStock: productExists.quantity,
          requestedQuantity: quantity 
        });
      }

      // If soldItems are provided, validate serial numbers
      if (soldItems && Array.isArray(soldItems)) {
        for (const item of soldItems) {
          if (item.serialNumber) {
            // Check if serial number exists and is available
            const serialExists = productExists.items.find(
              productItem => productItem.serialNumber === item.serialNumber && productItem.isAvailable
            );
            
            if (!serialExists) {
              return res.status(400).json({ 
                error: `Serial number ${item.serialNumber} not found or not available` 
              });
            }
          }
        }
      }
    }

    // Create the movement
    const movement = new StockMovement({
      product,
      movementType,
      quantity,
      client: movementType === 'SALE' ? client : undefined,
      soldItems: movementType === 'SALE' ? soldItems : undefined
    });

    await movement.save();

    // Update product quantity and serial number availability
    if (movementType === 'PURCHASE') {
      await Product.findByIdAndUpdate(product, {
        $inc: { quantity: quantity }
      });
    } else if (movementType === 'SALE') {
      // Update product quantity
      await Product.findByIdAndUpdate(product, {
        $inc: { quantity: -quantity }
      });

      // Update serial number availability if soldItems provided
      if (soldItems && Array.isArray(soldItems)) {
        for (const item of soldItems) {
          if (item.serialNumber) {
            await Product.updateOne(
              { 
                _id: product, 
                'items.serialNumber': item.serialNumber 
              },
              { 
                $set: { 'items.$.isAvailable': false } 
              }
            );
          }
        }
      }
    }

    // Populate the response
    await movement.populate('product client');
    res.status(201).json(movement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMovements = async (req, res) => {
  try {
    const { product, movementType, client, startDate, endDate } = req.query;
    let query = {};

    // Filter by product if provided
    if (product) {
      query.product = product;
    }

    // Filter by movement type if provided
    if (movementType) {
      query.movementType = movementType;
    }

    // Filter by client if provided
    if (client) {
      query.client = client;
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const movements = await StockMovement.find(query)
      .populate('product', 'name category purchasePrice sellingPrice')
      .populate('client', 'name email')
      .sort('-createdAt');
    
    res.json(movements);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

exports.getMovementById = async (req, res) => {
  try {
    const movement = await StockMovement.findById(req.params.id)
      .populate('product', 'name category purchasePrice sellingPrice quantity')
      .populate('client', 'name email phone');
    
    if (!movement) return res.status(404).json({ error: 'Movement not found' });
    
    res.json(movement);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

exports.updateMovement = async (req, res) => {
  try {
    const updated = await StockMovement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteMovement = async (req, res) => {
  try {
    const d = await StockMovement.findByIdAndDelete(req.params.id);
    if (!d) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Stock balance endpoint
exports.getStockBalance = async (req, res) => {
  try {
    const stock = await StockMovement.aggregate([
      { $group: {
        _id: '$product',
        purchased: { $sum: { $cond: [{ $eq: ['$movementType', 'PURCHASE'] }, '$quantity', 0] } },
        sold: { $sum: { $cond: [{ $eq: ['$movementType', 'SALE'] }, '$quantity', 0] } }
      }},
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $lookup: { from: 'categories', localField: 'product.category', foreignField: '_id', as: 'category' } },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $project: {
         productId: '$_id',
         name: '$product.name',
         category: { name: '$category.name', _id: '$category._id' },
         purchasePrice: '$product.purchasePrice',
         sellingPrice: '$product.sellingPrice',
         currentStock: { $subtract: ['$purchased', '$sold'] },
         purchased: 1,
         sold: 1,
         totalValue: { $multiply: [{ $subtract: ['$purchased', '$sold'] }, '$product.purchasePrice'] }
      }}
    ]);
    res.json(stock);
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
};

// Get serial number tracking
exports.getSerialNumberHistory = async (req, res) => {
  try {
    const { serialNumber } = req.params;
    
    const movements = await StockMovement.find({
      'soldItems.serialNumber': serialNumber
    })
      .populate('product', 'name')
      .populate('client', 'name email')
      .sort('-createdAt');
    
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get client sales report
exports.getClientSalesReport = async (req, res) => {
  try {
    const { clientId, startDate, endDate } = req.query;
    
    let query = { movementType: 'SALE' };
    
    if (clientId) {
      query.client = clientId;
    }
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const sales = await StockMovement.find(query)
      .populate('product', 'name purchasePrice sellingPrice')
      .populate('client', 'name email')
      .sort('-createdAt');
    
    // Calculate totals
    const totalSales = sales.length;
    const totalQuantity = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    const totalValue = sales.reduce((sum, sale) => {
      const productValue = sale.product.sellingPrice || sale.product.purchasePrice;
      return sum + (sale.quantity * productValue);
    }, 0);
    
    res.json({
      sales,
      summary: {
        totalSales,
        totalQuantity,
        totalValue
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get product movement history
exports.getProductMovementHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { startDate, endDate } = req.query;
    
    let query = { product: productId };
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    
    const movements = await StockMovement.find(query)
      .populate('client', 'name email')
      .sort('-createdAt');
    
    res.json(movements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get sales summary by date range
exports.getSalesSummary = async (req, res) => {
  try {
    const { startDate, endDate, groupBy } = req.query;
    
    let matchQuery = { movementType: 'SALE' };
    
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }
    
    let groupQuery = {};
    
    switch (groupBy) {
      case 'day':
        groupQuery = {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }
        };
        break;
      case 'month':
        groupQuery = {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }
        };
        break;
      case 'product':
        groupQuery = { _id: '$product' };
        break;
      default:
        groupQuery = { _id: null };
    }
    
    const summary = await StockMovement.aggregate([
      { $match: matchQuery },
      { $lookup: { from: 'products', localField: 'product', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $group: {
        ...groupQuery,
        totalSales: { $sum: 1 },
        totalQuantity: { $sum: '$quantity' },
        totalValue: { 
          $sum: { 
            $multiply: [
              '$quantity', 
              { $ifNull: ['$product.sellingPrice', '$product.purchasePrice'] }
            ]
          }
        }
      }},
      { $sort: { _id: 1 } }
    ]);
    
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
