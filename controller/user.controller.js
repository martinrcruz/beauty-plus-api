// controllers/userController.js
const User = require('../model/User');
const bcrypt = require('bcrypt');

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
      password
    } = req.body;

    if (fullName !== undefined) user.fullName = fullName;
    if (email !== undefined) user.email = email;
    if (dni !== undefined) user.dni = dni;
    if (phone !== undefined) user.phone = phone;
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (address !== undefined) user.address = address;

    // Si se envía una nueva contraseña
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    // Si se ha subido un avatar, actualiza la URL
    if (req.file) {
      // Uso correcto de backticks para interpolar variables
      user.avatar = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    }

    await user.save();
    res.status(200).json({ message: 'Perfil actualizado', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar perfil' });
  }
};

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
      address
    } = req.body;

    // Verificar si el email ya existe
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(400).json({ message: 'El email ya está en uso' });
    }

    // Crear usuario (asumiendo un password genérico o vacío, depende de tu lógica)
    const newUser = await User.create({
      fullName,
      email,
      role: role || 'client',
      points: points || 0,
      dni: dni || '',
      phone: phone || '',
      dateOfBirth: dateOfBirth || null,
      address: address || '',
      password: 'Temporal123' // O maneja otra lógica para la contraseña
    });

    // Calcular nivel según puntos
    if (newUser.points >= 4000) newUser.level = 'Platinum';
    else if (newUser.points >= 2000) newUser.level = 'Gold';
    else if (newUser.points >= 1000) newUser.level = 'Silver';
    else newUser.level = 'Blanco';

    await newUser.save();

    res.status(201).json({ message: 'Usuario creado con éxito', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

// (Admin) Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
  try {
    // Se excluye la contraseña y se ordena por 'updatedAt' descendente
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

    await user.save();
    res.status(200).json({ message: 'Usuario actualizado', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar usuario' });
  }
};
