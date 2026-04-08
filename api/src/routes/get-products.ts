import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getProducts(app: FastifyInstance) {
  app.get('/products', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    // Pega o ID da loja do token de quem logou
    const { sub: storeId } = request.user as { sub: string }

    const products = await prisma.product.findMany({
      where: { 
        storeId: storeId 
      },
      include: {
        category: true // Traz os dados da categoria junto
      },
      orderBy: { 
        createdAt: 'desc' 
      }
    })

    return products
  })
}