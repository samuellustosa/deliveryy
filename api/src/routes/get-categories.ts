import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getCategories(app: FastifyInstance) {
  app.get('/categories', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    // Agora o 'sub' já é o ID da LOJA diretamente
    const { sub: storeId } = request.user as { sub: string }

    try {
      // Busca categorias vinculadas diretamente ao ID da loja do token
      const categories = await prisma.category.findMany({
        where: {
          storeId: storeId // Filtro direto e muito mais rápido
        },
        orderBy: {
          name: 'asc'
        }
      })

      return categories
    } catch (error) {
      console.error('Erro ao buscar categorias:', error)
      return reply.status(500).send({ message: 'Erro interno ao buscar categorias.' })
    }
  })
}