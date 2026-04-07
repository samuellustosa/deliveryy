import 'dotenv/config' // <--- ESSA TEM QUE SER A PRIMEIRA LINHA DO ARQUIVO
import fastify from 'fastify'
import cors from '@fastify/cors'
import { createStore } from './routes/create-store.js'
import { getStoreMenu } from './routes/get-store-menu.js'
import { createCategory } from './routes/create-category.js'
import { createProduct } from './routes/create-product.js'
const app = fastify()

app.register(cors, { origin: '*' }) // Libera acesso para o seu Frontend

// Registro das rotas
app.register(createStore)
app.register(getStoreMenu)
app.register(createCategory)
app.register(createProduct)  

app.listen({ port: 3333 }).then(() => {
  console.log('🚀 HTTP Server running on http://localhost:3333')
})