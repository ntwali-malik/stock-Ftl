const Client = require('../models/Client');

exports.createClient = async (req, res) => {
  try {
    const c = new Client(req.body);
    await c.save();
    res.status(201).json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find().sort('-createdAt');
    res.json(clients);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getClientById = async (req, res) => {
  try {
    const c = await Client.findById(req.params.id);
    if (!c) return res.status(404).json({ error: 'Client not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateClient = async (req, res) => {
  try {
    const c = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ error: 'Client not found' });
    res.json(c);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteClient = async (req, res) => {
  try {
    const c = await Client.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ error: 'Client not found' });
    res.json({ message: 'Client deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};
