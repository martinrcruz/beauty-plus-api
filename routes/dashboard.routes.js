const express = require('express');
const router = express.Router();
const dashboardController = require('../controller/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Endpoint para Dashboard del Cliente (solo clientes)
router.get('/client', authMiddleware('client'), dashboardController.getClientDashboard);

// Endpoint para Dashboard del Recepcionista (solo recepcionista)
router.get('/receptionist', authMiddleware('receptionist'), dashboardController.getReceptionistDashboard);

// Endpoint para Dashboard del Administrador (solo admin)
router.get('/admin', authMiddleware('admin'), dashboardController.getAdminDashboard);

module.exports = router;
