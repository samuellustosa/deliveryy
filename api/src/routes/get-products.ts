import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getProducts(app: FastifyInstance) {
  app.get('/products', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    try {
      // 1. O 'sub' do token é o ID do USUÁRIO
      const { sub: userId } = request.user as { sub: string }

      // 2. Precisamos achar a LOJA desse usuário primeiro
      const store = await prisma.store.findFirst({
        where: { userId }
      })

      if (!store) {
        return reply.status(404).send({ message: 'Loja não encontrada.' })
      }

      // 3. Agora buscamos os produtos usando o ID real da LOJA
      const products = await prisma.product.findMany({
        where: { 
          storeId: store.id 
        },
        include: {
          category: true 
        },
        orderBy: { 
          createdAt: 'desc' 
        }
      })

      return products
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Erro ao buscar produtos.' })
    }
  })
}