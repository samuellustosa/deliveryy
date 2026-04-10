import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getProducts(app: FastifyInstance) {
  app.get('/products', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    try {
      // O 'sub' do token já é o ID da LOJA
      const { sub: storeId } = request.user as { sub: string }

      const products = await prisma.product.findMany({
        where: { 
          storeId: storeId // Usa o ID direto do token
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