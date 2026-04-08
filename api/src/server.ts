import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import { ZodError } from 'zod';

// Importações com extensões .js (Necessário para o seu ambiente NodeNext)
import { createStore } from './routes/create-store.js';
import { createProduct } from './routes/create-product.js';
import { getStores } from './routes/get-stores.js';
import { getStoreMenu } from './routes/get-store-menu.js';
import { createCategory } from './routes/create-category.js';
import { updateProduct } from './routes/update-product.js';
import { deleteProduct } from './routes/delete-product.js';
import { patchProductStatus } from './routes/patch-product-status.js';
import { uploadImage } from './routes/upload-image.js';
import { createOrder } from './routes/create-order.js';
import { getOrders } from './routes/get-orders.js';
import { updateOrderStatus } from './routes/update-order-status.js';
import { login } from './routes/login.js';
import { signup } from './routes/signup.js';
import { getProducts } from './routes/get-products.js';
import { createBanner } from './routes/create-banner.js'
import { getBanners } from './routes/get-banners.js'
import { deleteBanner } from './routes/delete-banner.js'

const app = fastify();

// 1. Registro de Plugins
app.register(multipart);
app.register(cors, { origin: true });
app.register(jwt, {
  secret: process.env.JWT_SECRET || 'delivery-saas-secret-key',
});

// 2. Decorator de Autenticação (ESSENCIAL PARA O SERVIDOR LIGAR)
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ message: 'Token inválido ou ausente.' });
  }
});

// 3. Error Handler Global
app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Erro de validação.',
      errors: error.flatten().fieldErrors,
    });
  }
  console.error(error);
  return reply.status(500).send({ message: 'Erro interno do servidor.' });
});

// 4. Registro de Rotas
app.register(login);
app.register(signup);
app.register(createStore);
app.register(getStores);
app.register(getStoreMenu);
app.register(createCategory);
app.register(createProduct);
app.register(updateProduct);
app.register(deleteProduct);
app.register(getProducts);
app.register(patchProductStatus);
app.register(uploadImage);
app.register(createOrder);
app.register(getOrders);
app.register(updateOrderStatus);
app.register(createBanner);
app.register(getBanners);
app.register(deleteBanner);

// 5. Inicialização (Porta 3333 para o Front encontrar)
app.listen({ 
  port: 3333,
  host: '0.0.0.0' 
}).then(() => {
  console.log('🚀 Servidor rodando em http://localhost:3333');
});