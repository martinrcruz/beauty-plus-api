// routes/purchaseRoutes.js
const express = require('express');
const router = express.Router();
const purchaseController = require('../controller/purchase.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Solo recepcionista o admin pueden registrar compras
router.post('/', authMiddleware(['receptionist', 'admin']), purchaseController.registerPurchase);

module.exports = router;
