import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createOrder(app: FastifyInstance) {
  app.post('/orders', async (request, reply) => {
    try {
      // 1. Validação rigorosa dos dados do cliente
      const createOrderSchema = z.object({
        customerName: z.string().min(1, "Nome é obrigatório"),
        customerPhone: z.string().min(8, "Telefone inválido"),
        address: z.string().min(5, "Endereço incompleto"),
        total: z.number().positive(),
        storeId: z.string().uuid("ID da loja inválido"),
        // Itens do pedido (opcional, mas bom ter no futuro)
        // items: z.array(z.any()).optional() 
      })

      const { customerName, customerPhone, address, total, storeId } = createOrderSchema.parse(request.body)

      // 2. Verifica se a loja existe antes de criar o pedido
      const storeExists = await prisma.store.findUnique({
        where: { id: storeId }
      })

      if (!storeExists) {
        return reply.status(404).send({ message: "Loja não encontrada." })
      }

      // 3. Cria o pedido no banco Neon
      const order = await prisma.order.create({
        data: {
          customerName,
          customerPhone,
          address,
          total,
          storeId,
          status: 'PENDING' // Todo pedido novo chega como Pendente
        }
      })

      return reply.status(201).send({ 
        orderId: order.id,
        message: "Pedido enviado com sucesso! Aguarde a confirmação." 
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "Dados do pedido inválidos", errors: error.flatten().fieldErrors })
      }
      
      console.error(error)
      return reply.status(500).send({ message: "Erro ao processar pedido." })
    }
  })
}