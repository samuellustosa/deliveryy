import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getCategories(app: FastifyInstance) {
  app.get('/categories', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    const { sub: userId } = request.user as { sub: string }

    try {
      // Busca categorias da loja que pertence ao usuário logado
      const categories = await prisma.category.findMany({
        where: {
          store: {
            userId: userId
          }
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