import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getStores(app: FastifyInstance) {
  app.get('/stores', { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      // Agora o 'sub' já é o ID da LOJA conforme configuramos no login.ts
      const storeId = request.user.sub 

      const stores = await prisma.store.findMany({
        where: {
          id: storeId // Busca diretamente pelo ID da loja que vem no token
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

      // Se não encontrar nada, o frontend receberá uma lista vazia []
      // O Dashboard.tsx pegará stores[0] que será undefined se a lista estiver vazia
      return stores 
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: "Erro ao listar as lojas." })
    }
  })
}