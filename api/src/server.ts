import 'dotenv/config' // <--- ESSA TEM QUE SER A PRIMEIRA LINHA DO ARQUIVO
import fastify from 'fastify'
import cors from '@fastify/cors'
import { createStore } from './routes/create-store.js'
import { getStoreMenu } from './routes/get-store-menu.js'
import { createCategory } from './routes/create-category.js'
import { createProduct } from './routes/create-product.js'
import { createOrder } from './routes/create-order.js'
import { getStores } from './routes/get-stores.js'
import { getOrders } from './routes/get-orders.js'
import { updateOrderStatus } from './routes/update-order-status.js'
import jwt from '@fastify/jwt'
import { updateProduct } from './routes/update-product.js'
import { deleteProduct } from './routes/delete-product.js'
import { patchProductStatus } from './routes/patch-product-status.js'
import multipart from '@fastify/multipart';
import { uploadImage } from './routes/upload-image.js';
import { login } from './routes/login.js'

const app = fastify()

app.register(cors, { origin: '*' }) // Libera acesso para o seu Frontend
app.register(jwt, {
  secret: process.env.JWT_SECRET || 'sua-chave-secreta-aqui'
})

// Decorator para verificar se o usuário está logado
app.decorate('authenticate', async (request, reply) => {
  try {
    await request.jwtVerify()
  } catch (err) {
    reply.send(err)
  }
})

// Registro das rotas
app.register(createStore)
app.register(getStoreMenu)
app.register(createCategory)
app.register(createProduct)  
app.register(createOrder)
app.register(getStores)

app.register(getOrders)
app.register(updateOrderStatus)
app.register(updateProduct)
app.register(deleteProduct)
app.register(patchProductStatus)
app.register(login)
app.register(uploadImage)

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 HTTP Server running on http://localhost:3333')
})

app.register(multipart, {
  limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});