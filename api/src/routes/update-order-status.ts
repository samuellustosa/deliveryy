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

      // Correção do ZodEnum: Usando a chave 'message' conforme sugerido pelo erro do compilador
      const updateStatusBody = z.object({
        status: z.enum(['PENDING', 'PREPARING', 'SHIPPED', 'DELIVERED', 'CANCELLED'], {
          message: "Status inválido fornecido"
        })
      })

      const { orderId } = updateStatusParams.parse(request.params)
      const { status } = updateStatusBody.parse(request.body)

      // 1. Busca o pedido para validar existência e propriedade
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      })

      if (!order) {
        return reply.status(404).send({ message: "Pedido não encontrado." })
      }

      // 2. Verifica se a loja do token é a dona do pedido
      if (order.storeId !== storeId) {
        return reply.status(403).send({ 
          message: "Você não tem permissão para alterar este pedido." 
        })
      }

      // 3. Atualiza o status
      await prisma.order.update({
        where: { id: orderId },
        data: { status }
      })

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