import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function getOrderDetails(app: FastifyInstance) {
  // Nota: Esta rota é pública para que o cliente possa rastrear o pedido pelo link
  app.get('/orders/:id', async (request, reply) => {
    try {
      const getOrderParams = z.object({
        id: z.string().uuid("ID de pedido inválido"),
      })

      const { id } = getOrderParams.parse(request.params)

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          store: {
            select: { 
              name: true, 
              phone: true 
            }
          },
          items: {
            include: {
              product: { 
                select: { 
                  name: true, 
                  imageUrl: true 
                } 
              }
            }
          }
        }
      })

      if (!order) {
        return reply.status(404).send({ message: "Pedido não encontrado." })
      }

      return order
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "ID de pedido inválido." })
      }
      
      console.error(error)
      return reply.status(500).send({ message: "Erro ao buscar detalhes do pedido." })
    }
  })
}