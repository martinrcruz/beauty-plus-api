// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');
const { uploadProfile } = require('../middleware/upload.middleware');


// Perfil (cliente logueado)
router.get('/profile', authMiddleware(), userController.getProfile);
router.put('/profile', authMiddleware(), uploadProfile.single('avatar'), userController.updateProfile);



// Admin: listar todos los usuarios
router.get('/', authMiddleware('admin'), userController.getAllUsers);
// Admin: actualizar usuario
router.put('/:id', authMiddleware('admin'), userController.adminUpdateUser);

router.post('/', authMiddleware('admin'), userController.createUser);


module.exports = router;
