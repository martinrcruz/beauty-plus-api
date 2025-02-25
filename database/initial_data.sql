-- Asegúrate de que las tablas estén creadas antes de ejecutar este script.
-- Por defecto, Sequelize generará las tablas con nombres en plural: "Users", "Coupons", "Purchases" y "Redemptions"
-- (a menos que hayas configurado lo contrario en cada modelo).

-- ========================
--   INSERTAR USUARIOS
-- ========================
INSERT INTO "Users" ("id", "fullName", "dni", "email", "password", "role", "points", "level", "createdAt", "updatedAt")
VALUES 
  (1, 'Juan Pérez',       '12345678A', 'juan@example.com',   'martin123', 'client',       0, 'Blanco', NOW(), NOW()),
  (2, 'María González',   '87654321B', 'maria@example.com',  'martin123', 'admin',        0, 'Blanco', NOW(), NOW()),
  (3, 'Carlos Ramírez',   '98765432C', 'carlos@example.com', 'martin123', 'receptionist',  0, 'Blanco', NOW(), NOW());

-- ========================
--   INSERTAR CUPONES
-- ========================
INSERT INTO "Coupons" ("id", "title", "image", "costInPoints", "discountBlanco", "discountSilver", "discountGold", "discountPlatinum", "isHighlighted", "isActive", "createdAt", "updatedAt")
VALUES
  (1, 'Cupón 10% Descuento', 'imagen_cupon_10.jpg', 100, 10, 12, 15, 18, false, true,NOW(), NOW()),
  (2, 'Cupón 2x1 Botox',   'imagen_2x1.jpg',      200,  0,  0,  0,  0,  false, true, NOW(), NOW()),
  (3, 'Promoción 15% Off',   'promo_15.jpg',       150, 15, 17, 20, 25,  true,  true, NOW(), NOW()),
  (4, 'Cupón 5€ de descuento','promo_5e.jpg',      80,   0,  0,  0,  0,  false, true, NOW(), NOW()),
  (5, 'Cupón Gold 20% Off',  'gold_20.jpg',        250,  0,  5, 20, 25,  true,  true, NOW(), NOW());

-- ========================
--   INSERTAR COMPRAS
-- ========================
-- Supongamos que el cliente (id=1) realiza algunas compras
INSERT INTO "Purchases" ("id", "amountInEuros", "pointsAssigned", "userId", "createdAt", "updatedAt")
VALUES
  (1,  50.00, 50, 1,NOW(),NOW()),  -- Compra de 50€, asume que se asignaron 10 puntos
  (2, 120.00, 120, 1,NOW(),NOW()),  -- Compra de 120€, se asignan 30 puntos
  (3, 200.00, 200, 1,NOW(),NOW());  -- Compra de 200€, se asignan 50 puntos

-- ========================
--   INSERTAR CANJES
-- ========================
-- Ejemplo: El usuario con id=1 canjea algunos cupones
INSERT INTO "Redemptions" ("id", "status", "userId", "couponId", "createdAt", "updatedAt")
VALUES
  (1, 'pending', 1, 1,NOW(),NOW()), -- El usuario 1 canjea el cupón con id=1, aún pendiente de uso
  (2, 'used',    1, 3,NOW(),NOW()), -- El usuario 1 canjea el cupón con id=3 y ya se ha usado
  (3, 'pending', 1, 5,NOW(),NOW()); -- El usuario 1 canjea el cupón con id=5, pendiente

-- Ajusta si lo deseas para más ejemplos o para probar distintos estados y relaciones.
