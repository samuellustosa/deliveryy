import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function getOrders(app: FastifyInstance) {
  app.get('/stores/:storeId/orders', async (request, reply) => {
    const getOrdersParams = z.object({
      storeId: z.string().uuid()
    })

    const { storeId } = getOrdersParams.parse(request.params)

    const orders = await prisma.order.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' }
    })

    return { orders }
  })
}