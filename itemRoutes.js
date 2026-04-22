const express = require('express');
const router = express.Router();
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
  getStats
} = require('../controllers/itemController');
const verifyToken = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

router.get('/stats', getStats);
router.get('/', getItems);
router.get('/:id', getItem);
router.post('/', createItem);
router.put('/:id', updateItem);
router.delete('/:id', deleteItem);

module.exports = router;
