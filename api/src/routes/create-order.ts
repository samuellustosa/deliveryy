import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createOrder(app: FastifyInstance) {
  app.post('/orders', async (request, reply) => {
    const createOrderSchema = z.object({
      customerName: z.string(),
      customerPhone: z.string(),
      address: z.string(),
      total: z.number(),
      storeId: z.string().uuid(),
    })

    const { customerName, customerPhone, address, total, storeId } = createOrderSchema.parse(request.body)

    const order = await prisma.order.create({
      data: {
        customerName,
        customerPhone,
        address,
        total,
        storeId,
        status: 'PENDING'
      }
    })

    return reply.status(201).send({ orderId: order.id })
  })
}