import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getOptionGroups(app: FastifyInstance) {
  app.get('/option-groups', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    const { sub: idFromToken } = request.user as { sub: string }

    // Tenta encontrar a loja onde o ID do token seja o dono (userId) 
    // OU seja a própria loja (id)
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { userId: idFromToken },
          { id: idFromToken }
        ]
      }
    })

    if (!store) {
      // Se não encontrar, retornamos um array vazio para não quebrar o frontend
      // Mas logamos o erro no terminal para você ver o ID
      console.log(`[DEBUG] Nenhuma loja encontrada para o ID do Token: ${idFromToken}`)
      return []
    }

    const groups = await prisma.optionGroup.findMany({
      where: { storeId: store.id },
      include: { 
        options: {
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    })

    return groups
  })
}