import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createOptionGroup(app: FastifyInstance) {
  app.post('/option-groups', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    const { sub: idFromToken } = request.user as { sub: string }

    const bodySchema = z.object({
      name: z.string(),
      minOptions: z.number().default(0),
      maxOptions: z.number().default(1),
      options: z.array(z.object({
        name: z.string(),
        price: z.number()
      }))
    })

    const { name, minOptions, maxOptions, options } = bodySchema.parse(request.body)

    // LÓGICA INTELIGENTE: Procura a loja pelo ID do Token (userId ou id da loja)
    const store = await prisma.store.findFirst({
      where: {
        OR: [
          { userId: idFromToken },
          { id: idFromToken }
        ]
      }
    })

    if (!store) {
      console.log(`[ERRO CREATE] Nenhuma loja encontrada para o ID: ${idFromToken}`)
      return reply.status(404).send({ message: "Loja não encontrada" })
    }

    const optionGroup = await prisma.optionGroup.create({
      data: {
        name,
        minOptions,
        maxOptions,
        storeId: store.id, // Amarra o complemento à loja certa
        options: {
          create: options
        }
      }
    })

    return reply.status(201).send(optionGroup)
  })
}