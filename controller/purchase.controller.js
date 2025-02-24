// controllers/purchaseController.js
const Purchase = require('../model/Purchase');
const User = require('../model/User');

exports.registerPurchase = async (req, res) => {
  try {
    const { dni, amountInEuros, purchaseDate, invoiceNumber, observation } = req.body;
    // Buscar usuario por DNI
    const user = await User.findOne({ where: { dni } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const pointsToAssign = Math.floor(amountInEuros);

    // Crear registro de compra con los nuevos campos
    const purchase = await Purchase.create({
      userId: user.id,
      amountInEuros,
      pointsAssigned: pointsToAssign,
      purchaseDate,      // nuevo
      invoiceNumber,     // nuevo
      observation        // nuevo
    });

    // Asignar puntos al usuario y actualizar nivel
    user.points += pointsToAssign;
    if (user.points >= 4000) user.level = 'Platinum';
    else if (user.points >= 2000) user.level = 'Gold';
    else if (user.points >= 1000) user.level = 'Silver';
    else user.level = 'Blanco';
    await user.save();

    res.status(201).json({
      message: 'Compra registrada y puntos asignados',
      purchase,
      userPoints: user.points,
      userLevel: user.level
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al registrar compra' });
  }
};
