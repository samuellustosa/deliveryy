// api/src/routes/delete-option-group.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function deleteOptionGroup(app: FastifyInstance) {
  app.delete('/option-groups/:id', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { sub: storeId } = request.user as { sub: string }

    // Verifica se o grupo pertence à loja do usuário antes de deletar
    const group = await prisma.optionGroup.findFirst({
      where: { id, storeId }
    })

    if (!group) {
      return reply.status(404).send({ message: "Grupo não encontrado ou não pertence à sua loja." })
    }

    await prisma.optionGroup.delete({
      where: { id }
    })

    return reply.status(204).send()
  })
}