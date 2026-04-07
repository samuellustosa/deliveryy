import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function patchProductStatus(app: FastifyInstance) {
  app.patch('/products/:id/status', { onRequest: [app.authenticate] }, async (request, reply) => {
    const paramsSchema = z.object({ id: z.string().uuid() })
    const bodySchema = z.object({ isActive: z.boolean() })

    const { id } = paramsSchema.parse(request.params)
    const { isActive } = bodySchema.parse(request.body)

    await prisma.product.update({
      where: { id },
      data: { isActive }
    })

    return reply.status(204).send()
  })
}