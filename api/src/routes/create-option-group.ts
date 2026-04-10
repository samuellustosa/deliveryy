// api/src/routes/create-option-group.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createOptionGroup(app: FastifyInstance) {
  app.post('/option-groups', async (request, reply) => {
    const user = await request.jwtVerify() as { sub: string }
    
    const bodySchema = z.object({
      name: z.string(),
      minOptions: z.number().default(0),
      maxOptions: z.number().default(1),
      options: z.array(z.object({
        name: z.string(),
        price: z.number().default(0)
      }))
    })

    const { name, minOptions, maxOptions, options } = bodySchema.parse(request.body)

    // Busca a loja do usuário logado
    const store = await prisma.store.findFirst({ where: { userId: user.sub } })
    if (!store) return reply.status(404).send({ message: "Loja não encontrada" })

    const group = await prisma.optionGroup.create({
      data: {
        name,
        minOptions,
        maxOptions,
        storeId: store.id,
        options: {
          create: options
        }
      }
    })

    return reply.status(201).send(group)
  })
}