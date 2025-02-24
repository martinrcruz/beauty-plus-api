// controllers/dashboardController.js
const { Op } = require('sequelize');
const User = require('../model/User');
const Purchase = require('../model/Purchase');
const Redemption = require('../model/Redemption');
const Coupon = require('../model/Coupon');

// Indicadores para Dashboard del Cliente
exports.getClientDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, { attributes: { exclude: ['password'] } });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    // Ejemplo: contamos los cupones activos disponibles (podrías personalizar la lógica)
    const availableCoupons = await Coupon.count({ where: { isActive: true } });
    res.status(200).json({
      fullName: user.fullName,
      points: user.points,
      level: user.level,
      availableCoupons
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener indicadores del cliente' });
  }
};

// Indicadores para Dashboard del Recepcionista
exports.getReceptionistDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dailyPurchases = await Purchase.count({
      where: { createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } }
    });

    const dailyCouponsUsed = await Redemption.count({
      where: { 
        status: 'used',
        updatedAt: { [Op.gte]: today, [Op.lt]: tomorrow }
      }
    });

    const purchases = await Purchase.findAll({
      where: { createdAt: { [Op.gte]: today, [Op.lt]: tomorrow } }
    });
    let dailyTotalEur = 0;
    purchases.forEach(p => {
      dailyTotalEur += p.amountInEuros;
    });

    res.status(200).json({
      dailyPurchases,
      dailyCouponsUsed,
      dailyTotalEur
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener indicadores de recepcionista' });
  }
};

// Indicadores para Dashboard del Administrador
exports.getAdminDashboard = async (req, res) => {
  try {
    const usersCount = await User.count();
    const couponsCount = await Coupon.count();
    // Para reportes usamos un valor dummy, o bien podrías implementar la lógica correspondiente.
    const reportsCount = 5; 
    res.status(200).json({
      usersCount,
      couponsCount,
      reportsCount
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener indicadores de admin' });
  }
};
