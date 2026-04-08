import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function updateOrderStatus(app: FastifyInstance) {
  app.patch('/orders/:orderId/status', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    try {
      const { sub: storeId } = request.user as { sub: string }

      const updateStatusParams = z.object({
        orderId: z.string().uuid("ID do pedido inválido")
      })

      // 3. Validação simplificada: Removido invalid_type_error e errorMap
      // O TS só aceita 'message' ou nada nesta sua versão
      const updateStatusBody = z.object({
        status: z.enum(['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
          message: "Status inválido fornecido"
        })
      })

      const { orderId } = updateStatusParams.parse(request.params)
      const { status } = updateStatusBody.parse(request.body)

      const { count } = await prisma.order.updateMany({
        where: {
          id: orderId,
          storeId 
        },
        data: { status }
      })

      if (count === 0) {
        return reply.status(404).send({ 
          message: "Pedido não encontrado ou sem permissão." 
        })
      }

      return reply.status(204).send()

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          message: "Erro de validação", 
          errors: error.flatten().fieldErrors 
        })
      }

      console.error(error)
      return reply.status(500).send({ message: "Erro interno no servidor." })
    }
  })
}