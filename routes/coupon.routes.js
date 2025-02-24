// routes/couponRoutes.js
const express = require('express');
const router = express.Router();
const couponController = require('../controller/coupon.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { uploadQR } = require('../middleware/upload.middleware');
const { uploadCoupon } = require('../middleware/upload.middleware');

// ADMIN crea cupones
router.post('/', authMiddleware('admin'),uploadCoupon.single('couponImage'), couponController.createCoupon);

router.get('/admin-all', authMiddleware('admin'), couponController.adminGetAllCoupons);

// ADMIN: actualizar cupón
router.put('/:id', authMiddleware('admin'),uploadCoupon.single('couponImage'), couponController.updateCoupon);

// ADMIN: eliminar cupón
router.delete('/:id', authMiddleware('admin'), couponController.deleteCoupon);

// (General) Obtener cupones activos
router.get('/', authMiddleware(), couponController.getAllCoupons);

// (General) Obtener cupones destacados
router.get('/highlighted', authMiddleware(), couponController.getHighlightedCoupons);

// (Cliente) Historial de cupones canjeados
router.get('/my-redemptions', authMiddleware('client'), couponController.getMyRedemptions);

// (Cliente) Canjear cupón
router.post('/redeem', authMiddleware('client'), couponController.redeemCoupon);

// (Recepcionista/Admin) Usar cupón
router.post('/use', authMiddleware(['receptionist', 'admin']), couponController.useCoupon);

router.get('/:id', authMiddleware(), couponController.getCouponDetail);

router.get('/coupon-detail/:id', authMiddleware(), couponController.getCouponDetail);


module.exports = router;
