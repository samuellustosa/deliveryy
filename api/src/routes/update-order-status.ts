import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function updateOrderStatus(app: FastifyInstance) {
  app.patch('/orders/:orderId/status', async (request, reply) => {
    const updateStatusParams = z.object({
      orderId: z.string().uuid()
    })

    const updateStatusBody = z.object({
      status: z.enum(['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
    })

    const { orderId } = updateStatusParams.parse(request.params)
    const { status } = updateStatusBody.parse(request.body)

    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    })

    return reply.status(204).send()
  })
}