import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { JwtService } from '@nestjs/jwt/dist/jwt.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const jwtService = new JwtService();

  // Habilitar CORS para el Frontend
  app.enableCors();

  const catalogUrl = process.env.CATALOG_SERVICE_URL || 'http://localhost:3000';
  const cartUrl = process.env.CART_SERVICE_URL || 'http://localhost:3001';
  const orderUrl = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';
  const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://localhost:3003';
  const analyticsUrl = process.env.ANALYTICS_SERVICE_URL || 'http://localhost:3004';

  const requireAuth = (req, res, next) => {
    if (req.path.includes('/health') || req.path === '/health') {
      return next();
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Acceso denegado: Token Bearer no proporcionado',
        error: 'Unauthorized',
      });
    }

    const token = authHeader.split(' ')[1];

    try {
      const payload = jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super_secret_key_123456789',
      });

      // Inyección de identidad en cabeceras para los microservicios downstream
      req.headers['x-user-id'] = payload.sub || payload.userId;
      req.headers['x-user-role'] = payload.role || 'USER';

      next();
    } catch (err) {
      return res.status(401).json({
        statusCode: 401,
        message: 'Token inválido o expirado',
        error: 'Unauthorized',
      });
    }
  };

  // 🔒 1. Middleware de Autenticación (se ejecuta primero)
  app.use('/api/cart', requireAuth);
  app.use('/api/orders', requireAuth);

  // Direct microservice routing for health checks and endpoints
  app.use(
    '/catalog',
    createProxyMiddleware({
      target: catalogUrl,
      changeOrigin: true,
      pathRewrite: { '^/catalog': '' },
      logger: console,
    }),
  );

  app.use(
    '/cart',
    createProxyMiddleware({
      target: cartUrl,
      changeOrigin: true,
      pathRewrite: { '^/cart': '' },
      logger: console,
    }),
  );

  app.use(
    '/orders',
    createProxyMiddleware({
      target: orderUrl,
      changeOrigin: true,
      pathRewrite: { '^/orders': '' },
      logger: console,
    }),
  );

  app.use(
    '/inventory',
    createProxyMiddleware({
      target: inventoryUrl,
      changeOrigin: true,
      pathRewrite: { '^/inventory': '' },
      logger: console,
    }),
  );

  app.use(
    '/analytics',
    createProxyMiddleware({
      target: analyticsUrl,
      changeOrigin: true,
      pathRewrite: { '^/analytics': '' },
      logger: console,
    }),
  );

  // Redirecciones Proxy
  app.use(
    '/api/products',
    createProxyMiddleware({
      target: catalogUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/products/' },
      logger: console,
    }),
  );

  app.use(
    '/api/cart',
    createProxyMiddleware({
      target: cartUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/cart/' },
      logger: console,
    }),
  );

  app.use(
    '/api/orders',
    createProxyMiddleware({
      target: orderUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/orders/' },
      logger: console,
    }),
  );

  app.use(
    '/api/inventory',
    createProxyMiddleware({
      target: inventoryUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/inventory' },
      logger: console,
    }),
  );

  app.use(
    '/api/analytics',
    createProxyMiddleware({
      target: analyticsUrl,
      changeOrigin: true,
      pathRewrite: { '^/': '/analytics/' },
      logger: console,
    }),
  );

  const port = process.env.PORT || 8000;
  await app.listen(port);
  console.log(`🌐 API Gateway corriendo en http://localhost:${port}`);
}
bootstrap();