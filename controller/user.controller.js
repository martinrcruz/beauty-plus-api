// controllers/userController.js

const User = require('../model/User');
const bcrypt = require('bcrypt');
const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

/**
 * Genera el código QR basado en DNI + email
 * y retorna la URL pública de la imagen creada.
 * Se asume que en index.js se hace:
 *   app.use('/uploads/user-qr', express.static('uploads/user-qr'));
 */
async function generateUserQR(dni, email, req) {
  // Genera un string que identifique al usuario
  const codeString = `${dni}-${email}`;

  // Crea la carpeta /uploads/user-qr si no existe
  const qrFolder = path.join(__dirname, '../uploads/user-qr');
  if (!fs.existsSync(qrFolder)) {
    fs.mkdirSync(qrFolder, { recursive: true });
  }

  // Genera un nombre de archivo
  const fileName = `qruser_${Date.now()}.png`;
  const filePath = path.join(qrFolder, fileName);

  // Generar el QR code en formato PNG
  await QRCode.toFile(filePath, codeString, {
    errorCorrectionLevel: 'H'
  });

  // Retorna la URL pública
  return `${req.protocol}://${req.get('host')}/uploads/user-qr/${fileName}`;
}

/**
 * GET /profile
 * Obtiene el perfil del usuario logueado (excluyendo password)
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener perfil' });
  }
};

/**
 * PUT /profile
 * Actualiza perfil del usuario logueado.
 * Maneja avatar (req.file), contraseña, y genera QR si no existía.
 */
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const {
      fullName,
      email,
      dni,
      phone,
      dateOfBirth,
      address,
      password,
      role,
      points
    } = req.body;

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (dni !== undefined) user.dni = dni;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;

    if (role !== undefined) user.role = role;
    if (points !== undefined) user.points = points;

    // Recalcular nivel
    if (user.points >= 4000) user.level = 'Platinum';
    else if (user.points >= 2000) user.level = 'Gold';
    else if (user.points >= 1000) user.level = 'Silver';
    else user.level = 'Blanco';

    // Encriptar contraseña si se envía
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Manejar avatar si se subió un archivo
    if (req.file) {
      user.avatar = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    }

    // Revisar si no tiene qrCodeImage, crearlo
    // (o si deseas regenerar cuando cambie DNI o email, puedes comparar con oldUser)
    if (!user.qrCodeImage) {
      const qrUrl = await generateUserQR(user.dni, user.email, req);
      user.qrCodeImage = qrUrl;
    }

    await user.save();

    // Excluir password de la respuesta
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({ message: 'Perfil actualizado', user: userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

/**
 * POST /api/users (o donde definas)
 * Crea un usuario, encripta la contraseña ingresada, y genera su QR
 */
exports.createUser = async (req, res) => {
  try {
    const {
      fullName,
      email,
      role,
      points,
      dni,
      phone,
      dateOfBirth,
      address,
      password
    } = req.body;

    // Verificar si el email ya existe
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: 'El email ya está en uso' });
    }

    // Encriptar contraseña que el usuario ingresa
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // Si no se envía password, define una por defecto
      hashedPassword = await bcrypt.hash('Temporal123', 10);
    }

    // Crear usuario 
    const newUser = await User.create({
      fullName,
      email,
      role: role || 'client',
      points: points || 0,
      dni: dni || '',
      phone: phone || '',
      dateOfBirth: dateOfBirth || null,
      address: address || '',
      password: hashedPassword
    });

    // Calcular nivel según puntos
    if (newUser.points >= 4000) newUser.level = 'Platinum';
    else if (newUser.points >= 2000) newUser.level = 'Gold';
    else if (newUser.points >= 1000) newUser.level = 'Silver';
    else newUser.level = 'Blanco';

    // Generar el QR code (dni + email) y guardarlo en newUser.qrCodeImage
    const qrUrl = await generateUserQR(newUser.dni, newUser.email, req);
    newUser.qrCodeImage = qrUrl;

    await newUser.save();

    // Excluir la contraseña del objeto que devolvemos
    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json({ message: 'Usuario creado con éxito', user: userResponse });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

/**
 * GET /api/users (admin)
 * Retorna todos los usuarios (excluyendo password)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['updatedAt', 'DESC']]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener lista de usuarios' });
  }
};

/**
 * Admin: actualizar usuario por ID (similar a updateProfile, pero para Admin)
 */
exports.adminUpdateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fullName,
      email,
      role,
      points,
      dni,
      phone,
      dateOfBirth,
      address
    } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Actualizar campos
    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (points !== undefined) user.points = points;
    if (dni !== undefined) user.dni = dni;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;

    // Recalcular nivel
    if (user.points >= 4000) user.level = 'Platinum';
    else if (user.points >= 2000) user.level = 'Gold';
    else if (user.points >= 1000) user.level = 'Silver';
    else user.level = 'Blanco';

    // Podrías encriptar password si te lo envían, etc.

    await user.save();
    res.status(200).json({ message: 'Usuario actualizado', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};
