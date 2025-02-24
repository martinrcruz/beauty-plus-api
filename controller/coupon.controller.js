// controllers/couponController.js
const Coupon = require("../model/Coupon");
const Redemption = require("../model/Redemption");
const User = require("../model/User");
const QRCode = require("qrcode");
const path = require("path");
const fs = require("fs");

function generateRedeemCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

exports.getCouponDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }
    res.status(200).json(coupon);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener detalle del cupón" });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    // Campos que vienen en req.body
    const {
      title,
      image,
      costInPoints,
      discountBlanco,
      discountSilver,
      discountGold,
      discountPlatinum,
      isHighlighted,
      productType,
      productDescription,
      invoiceNumber,
      redemptionDate
    } = req.body;

    // Revisamos si se envió un archivo 'couponImage'
    let couponImage = '';
    if (req.file) {
      // Asume que en tu index.js o similar haces algo como:
      // app.use('/uploads/coupons', express.static('uploads/coupons'));
      // y multer({ dest: 'uploads/coupons/' }) 
      // de modo que req.file.filename contenga el nombre
      couponImage = `${req.protocol}://${req.get('host')}/uploads/coupons/${req.file.filename}`;
    }

    // Genera un redeemCode aleatorio (para el QR code)
    const redeemCode = generateRedeemCode();

    // Generación del QR code (para el redeemCode)
    const qrFolder = path.join(__dirname, '../uploads/coupons');
    if (!fs.existsSync(qrFolder)) {
      fs.mkdirSync(qrFolder, { recursive: true });
    }
    const filename = `coupon_${Date.now()}.png`;
    const qrFilePath = path.join(qrFolder, filename);

    await QRCode.toFile(qrFilePath, redeemCode, { errorCorrectionLevel: 'H' });
    couponImage = `${req.protocol}://${req.get('host')}/uploads/coupons/${filename}`;

    // Creamos el cupón
    const newCoupon = await Coupon.create({
      title,
      image:couponImage,
      costInPoints,
      discountBlanco,
      discountSilver,
      discountGold,
      discountPlatinum,
      isHighlighted,
      productType,
      productDescription,
      invoiceNumber,
      redemptionDate,
      redeemCode,
      couponImage, 
    });

    res.status(201).json({ message: 'Cupón creado', coupon: newCoupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear cupón' });
  }
};

exports.redeemCoupon = async (req, res) => {
  try {
    const { couponId } = req.body;
    const userId = req.user.id;

    // 1) Verificar existencia del usuario y del cupón
    const user = await User.findByPk(userId);
    const coupon = await Coupon.findByPk(couponId);

    if (!user || !coupon) {
      return res.status(404).json({ message: "Usuario o cupón no encontrado" });
    }
    if (!coupon.isActive) {
      return res.status(400).json({ message: "El cupón no está activo" });
    }

    // 2) Verificar si el usuario ya canjeó ese cupón antes
    //    (Regla: no se puede volver a canjear el mismo cupón)
    const existingRedemption = await Redemption.findOne({
      where: {
        userId: userId,
        couponId: couponId,
      },
    });
    if (existingRedemption) {
      return res.status(400).json({
        message:
          "Ya has canjeado este cupón anteriormente. No se permite canjearlo de nuevo.",
      });
    }

    // 3) Verificar puntos suficientes
    if (user.points < coupon.costInPoints) {
      return res
        .status(400)
        .json({
          message: "No tienes suficientes puntos para canjear este cupón.",
        });
    }

    // Descontar puntos
    user.points -= coupon.costInPoints;
    await user.save();

    // 4) Generar un redeemCode único (relacionado al usuario y al cupón)
    //    Podríamos usar: userId-couponId-random
    const randomStr = generateRedeemCode(6);
    const redeemCode = `${userId}-${couponId}-${randomStr}`;

    const qrFolder = path.join(__dirname, "../uploads/qr");
    if (!fs.existsSync(qrFolder)) {
      fs.mkdirSync(qrFolder, { recursive: true });
    }
    const fileName = `qr_${Date.now()}.png`;
    const filePath = path.join(qrFolder, fileName);

    // Usar la librería qrcode
    await QRCode.toFile(filePath, redeemCode, {
      errorCorrectionLevel: "H",
    });

    // URL pública del QR
    const qrCodeUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/qr/${fileName}`;

    // 6) Crear la redención
    const redemption = await Redemption.create({
      userId: userId,
      couponId: couponId,
      status: "pending", // o "DISPONIBLE"
      redeemCode: redeemCode,
      qrCodeImage: qrCodeUrl,
    });

    // 7) Responder
    res.status(200).json({
      message: "Cupón canjeado con éxito.",
      redemption,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al canjear cupón" });
  }
};

exports.getMyRedemptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const redemptions = await Redemption.findAll({
      where: { userId },
      include: [Coupon],
      order: [["updatedAt", "DESC"]],
    });
    // Asegúrate de que en el modelo Redemption existan
    // fields como qrCodeImage, usedAt
    res.status(200).json(redemptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener historial de cupones" });
  }
};

exports.useCoupon = async (req, res) => {
  try {
    const { redemptionId } = req.body;
    const redemption = await Redemption.findByPk(redemptionId, {
      include: [Coupon],
    });
    if (!redemption) {
      return res.status(404).json({ message: "Redención no encontrada" });
    }
    if (redemption.status === "used") {
      return res
        .status(400)
        .json({ message: "Este cupón ya ha sido utilizado" });
    }

    redemption.status = "used";
    await redemption.save();
    res.status(200).json({ message: "Cupón aplicado con éxito", redemption });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al aplicar cupón" });
  }
};

exports.adminGetAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [["updatedAt", "DESC"]] });
    res.status(200).json(coupons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener cupones (admin)" });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }

    // Campos provenientes del cuerpo
    const {
      title,
      image,
      costInPoints,
      discountBlanco,
      discountSilver,
      discountGold,
      discountPlatinum,
      isHighlighted,
      isActive,
      productType,
      productDescription,
      invoiceNumber,
      redemptionDate
    } = req.body;

    // Si se subió un archivo en couponImage, lo usamos para actualizar la imagen
    let couponImageUrl = coupon.couponImage; // Valor actual en la BD

    if (req.file) {
      // Asumiendo tu servidor sirve /uploads/coupons:
      // app.use('/uploads/coupons', express.static('uploads/coupons'));
      couponImageUrl = `${req.protocol}://${req.get('host')}/uploads/coupons/${req.file.filename}`;
    }

    // Actualizamos campos si hay valores nuevos, sino conservar los viejos
    coupon.title = title ?? coupon.title;
    coupon.image = image ?? coupon.image;  // campo "image" si lo usas aún
    coupon.costInPoints = costInPoints ?? coupon.costInPoints;
    coupon.discountBlanco = discountBlanco ?? coupon.discountBlanco;
    coupon.discountSilver = discountSilver ?? coupon.discountSilver;
    coupon.discountGold = discountGold ?? coupon.discountGold;
    coupon.discountPlatinum = discountPlatinum ?? coupon.discountPlatinum;
    coupon.isHighlighted = isHighlighted ?? coupon.isHighlighted;
    coupon.isActive = isActive ?? coupon.isActive;
    coupon.productType = productType ?? coupon.productType;
    coupon.productDescription = productDescription ?? coupon.productDescription;
    coupon.invoiceNumber = invoiceNumber ?? coupon.invoiceNumber;
    coupon.redemptionDate = redemptionDate ?? coupon.redemptionDate;

    // Actualiza el campo con la nueva URL si subieron archivo
    coupon.couponImage = couponImageUrl;

    // Opcional: No se regenera el QR code, a menos que se desee

    await coupon.save();
    res.status(200).json({ message: "Cupón actualizado", coupon });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al actualizar cupón" });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({ message: "Cupón no encontrado" });
    }
    await coupon.destroy();
    res.status(200).json({ message: "Cupón eliminado" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar cupón" });
  }
};

function computeDiscountAndCost(coupon, userLevel) {
  let userDiscount = 0;
  switch (userLevel) {
    case "Blanco":
      userDiscount = coupon.discountBlanco;
      break;
    case "Silver":
      userDiscount = coupon.discountSilver;
      break;
    case "Gold":
      userDiscount = coupon.discountGold;
      break;
    case "Platinum":
      userDiscount = coupon.discountPlatinum;
      break;
    default:
      userDiscount = 0;
      break;
  }
  const finalCostInPoints = Math.floor(
    coupon.costInPoints * (1 - userDiscount / 100)
  );
  return { userDiscount, finalCostInPoints };
}

exports.getAllCoupons = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const coupons = await Coupon.findAll({
      where: { isActive: true },
      order: [["updatedAt", "DESC"]],
    });

    let result;
    if (user.role === "client") {
      result = coupons.map((c) => {
        const { userDiscount, finalCostInPoints } = computeDiscountAndCost(
          c,
          user.level
        );
        return {
          ...c.toJSON(),
          userDiscount,
          finalCostInPoints,
        };
      });
    } else {
      result = coupons;
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener cupones" });
  }
};

exports.getHighlightedCoupons = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const coupons = await Coupon.findAll({
      where: { isHighlighted: true, isActive: true },
      order: [["updatedAt", "DESC"]],
    });
    let result;
    if (user.role === "client") {
      result = coupons.map((c) => {
        const { userDiscount, finalCostInPoints } = computeDiscountAndCost(
          c,
          user.level
        );
        return {
          ...c.toJSON(),
          userDiscount,
          finalCostInPoints,
        };
      });
    } else {
      result = coupons;
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener cupones destacados" });
  }
};
