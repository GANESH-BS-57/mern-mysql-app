const db = require('../config/db');

// GET /api/items
exports.getItems = async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT * FROM items WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/items/:id
exports.getItem = async (req, res) => {
  try {
    const [items] = await db.query(
      'SELECT * FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }
    res.json({ success: true, item: items[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/items
exports.createItem = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required.' });
    }

    const [result] = await db.query(
      'INSERT INTO items (user_id, title, description, status) VALUES (?, ?, ?, ?)',
      [req.user.id, title, description || null, status || 'active']
    );

    res.status(201).json({ success: true, message: 'Item created successfully.', id: result.insertId });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/items/:id
exports.updateItem = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const [existing] = await db.query(
      'SELECT id FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    await db.query(
      'UPDATE items SET title = ?, description = ?, status = ? WHERE id = ? AND user_id = ?',
      [title, description, status, req.params.id, req.user.id]
    );

    res.json({ success: true, message: 'Item updated successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/items/:id
exports.deleteItem = async (req, res) => {
  try {
    const [existing] = await db.query(
      'SELECT id FROM items WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Item not found.' });
    }

    await db.query('DELETE FROM items WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ success: true, message: 'Item deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/stats
exports.getStats = async (req, res) => {
  try {
    const [stats] = await db.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM items WHERE user_id = ?`,
      [req.user.id]
    );
    res.json({ success: true, stats: stats[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
