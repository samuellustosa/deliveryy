import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function updateProduct(app: FastifyInstance) {
  app.put('/products/:id', { onRequest: [app.authenticate] }, async (request, reply) => {
    const paramsSchema = z.object({ 
      id: z.string().uuid() 
    })

    const bodySchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
    })

    const { id } = paramsSchema.parse(request.params)
    const body = bodySchema.parse(request.body)

    // Remove chaves que são 'undefined' para satisfazer o exactOptionalPropertyTypes
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined)
    )

    await prisma.product.update({
      where: { id },
      data: updateData
    })

    return reply.status(204).send()
  })
}