import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getStores(app: FastifyInstance) {
  app.get('/stores', async (request, reply) => {
    try {
      // 1. Busca as lojas selecionando apenas o necessário para a vitrine
      const stores = await prisma.store.findMany({
        select: {
          id: true,
          name: true,
          slug: true,
          niche: true,
          // logoUrl: true, // Certifique-se que este campo existe no seu Prisma
          phone: true,   // Útil para exibir o contato na vitrine
        },
        orderBy: {
          name: 'asc' // Organiza por ordem alfabética
        }
      })

      // 2. Retorna o array de lojas
      return { stores }

    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: "Erro ao listar as lojas." })
    }
  })
}