import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function deleteProduct(app: FastifyInstance) {
  app.delete('/products/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const paramsSchema = z.object({ id: z.string().uuid() })
    const { id } = paramsSchema.parse(request.params)

    await prisma.product.delete({
      where: { id }
    })

    return reply.status(204).send()
  })
}