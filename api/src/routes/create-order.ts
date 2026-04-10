import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createOrder(app: FastifyInstance) {
  app.post('/orders', async (request, reply) => {
    try {
      const createOrderSchema = z.object({
        customerName: z.string().min(1, "Nome é obrigatório"),
        customerPhone: z.string().min(8, "Telefone inválido"),
        type: z.enum(['DELIVERY', 'PICKUP', 'ONSITE']),
        // Usamos .nullable() ou transformamos undefined em null para o Prisma
        zipCode: z.string().optional().nullable(),
        street: z.string().optional().nullable(),
        number: z.string().optional().nullable(),
        complement: z.string().optional().nullable(),
        reference: z.string().optional().nullable(),
        city: z.string().optional().nullable(),
        state: z.string().optional().nullable(),
        address: z.string().min(5, "Endereço completo é obrigatório"),
        deliveryFee: z.number().default(0),
        total: z.number().positive(),
        storeId: z.string().uuid(),
        items: z.array(z.object({
          productId: z.string().uuid(),
          quantity: z.number().int().positive(),
          price: z.number().positive()
        })).min(1)
      })

      const data = createOrderSchema.parse(request.body)

      const storeExists = await prisma.store.findUnique({
        where: { id: data.storeId }
      })

      if (!storeExists) {
        return reply.status(404).send({ message: "Loja não encontrada." })
      }

      // 3. Criando o pedido garantindo que 'undefined' vire 'null'
      const order = await prisma.order.create({
        data: {
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          type: data.type,
          // O operador ?? null garante que se for undefined, envia null para o banco
          zipCode: data.zipCode ?? null,
          street: data.street ?? null,
          number: data.number ?? null,
          complement: data.complement ?? null,
          reference: data.reference ?? null,
          city: data.city ?? null,
          state: data.state ?? null,
          address: data.address,
          deliveryFee: data.deliveryFee,
          total: data.total,
          storeId: data.storeId,
          status: 'PENDING',
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price
            }))
          }
        }
      })

      return reply.status(201).send({ 
        orderId: order.id,
        message: "Pedido enviado com sucesso!" 
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "Dados inválidos", errors: error.flatten().fieldErrors })
      }
      console.error(error)
      return reply.status(500).send({ message: "Erro ao processar pedido." })
    }
  })
}