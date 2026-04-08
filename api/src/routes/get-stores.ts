import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getStores(app: FastifyInstance) {
  app.get('/stores', async (request, reply) => {
    try {
      // 1. Busca as lojas incluindo as categorias relacionadas
      const stores = await prisma.store.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          niche: true,
          phone: true,
          // CRÍTICO: Você precisa incluir as categorias aqui dentro do select
          categories: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      })

      // 2. Retorna o array diretamente (conforme o seu Products.tsx espera)
      return stores 

    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: "Erro ao listar as lojas." })
    }
  })
}