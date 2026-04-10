// api/src/routes/delete-option-group.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function deleteOptionGroup(app: FastifyInstance) {
  app.delete('/option-groups/:id', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    // Valida o ID que vem na URL
    const { id } = z.object({ id: z.string().uuid() }).parse(request.params)
    const { sub: idFromToken } = request.user as { sub: string }

    // 1. Primeiro encontramos a loja do usuário (usando a lógica de OR)
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { userId: idFromToken },
          { id: idFromToken }
        ]
      }
    })

    if (!store) {
      return reply.status(404).send({ message: "Loja não encontrada." })
    }

    // 2. Agora verificamos se o grupo pertence a ESSA loja específica
    const group = await prisma.optionGroup.findFirst({
      where: { 
        id, 
        storeId: store.id 
      }
    })

    if (!group) {
      return reply.status(404).send({ 
        message: "Grupo não encontrado ou não pertence à sua loja." 
      })
    }

    // 3. Se tudo estiver certo, deletamos
    await prisma.optionGroup.delete({
      where: { id }
    })

    return reply.status(204).send()
  })
}