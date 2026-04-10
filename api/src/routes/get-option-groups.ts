// api/src/routes/get-option-groups.ts
import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getOptionGroups(app: FastifyInstance) {
  app.get('/option-groups', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    // Pegamos o ID do usuário que vem do token
    const { sub: userId } = request.user as { sub: string }

    // Primeiro, precisamos achar a LOJA desse usuário
    const store = await prisma.store.findFirst({
      where: { userId: userId } 
    })

    if (!store) {
      return reply.status(404).send({ message: "Loja não encontrada." })
    }

    const groups = await prisma.optionGroup.findMany({
      where: { storeId: store.id },
      include: { options: true }
    })

    return groups
  })
}