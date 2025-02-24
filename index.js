const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const couponRoutes = require('./routes/coupon.routes');
const purchaseRoutes = require('./routes/purchase.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use('/uploads/avatars', express.static('uploads/avatars'));
app.use('/uploads/qr', express.static('uploads/qr'));
app.use('/uploads/coupons', express.static('uploads/coupons'));


const PORT = process.env.PORT || 4000;

sequelize.sync({ alter: true }).then(() => {
  console.log('Base de datos sincronizada');
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
  });
});
