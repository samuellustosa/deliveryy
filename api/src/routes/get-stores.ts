import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

// Certifique-se de que o nome aqui é exatamente 'getStores'
export async function getStores(app: FastifyInstance) {
  app.get('/stores', { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      const userId = request.user.sub 

      const stores = await prisma.store.findMany({
        where: {
          userId: userId 
        },
        select: {
          id: true,
          name: true,
          slug: true,
          niche: true,
          phone: true,
          categories: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      })

      return stores 
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: "Erro ao listar as lojas." })
    }
  })
}