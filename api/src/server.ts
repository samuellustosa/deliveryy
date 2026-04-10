import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import jwt from '@fastify/jwt';
import { ZodError } from 'zod';

// Importações das rotas
import { createStore } from './routes/create-store.js';
import { createProduct } from './routes/create-product.js';
import { getStores } from './routes/get-stores.js';
import { getStoreMenu } from './routes/get-store-menu.js';
import { createCategory } from './routes/create-category.js';
import { getCategories } from './routes/get-categories.js';
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
import { getBanners } from './routes/get-banners.js';
import { deleteBanner } from './routes/delete-banner.js';
import { getOrderDetails } from './routes/get-order-details.js';
import { uploadBanner } from './routes/upload-banner.js'

const app = fastify();

// 1. Registro de Plugins (CORS corrigido para aceitar PATCH)
app.register(multipart);
app.register(cors, { 
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

app.register(jwt, {
  secret: process.env.JWT_SECRET || 'delivery-saas-secret-key',
});

// 2. Decorator de Autenticação
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
app.register(getCategories);
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
app.register(getBanners);
app.register(deleteBanner);
app.register(getOrderDetails);
app.register(uploadBanner);

// 5. Inicialização
app.listen({ 
  port: 3333,
  host: '0.0.0.0' 
}).then(() => {
  console.log('🚀 Servidor rodando em http://localhost:3333');
});