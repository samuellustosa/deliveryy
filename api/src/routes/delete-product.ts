import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function deleteProduct(app: FastifyInstance) {
  app.delete('/products/:id', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    try {
      const paramsSchema = z.object({
        id: z.string().uuid("ID do produto inválido"),
      })

      const { id } = paramsSchema.parse(request.params)

      // 1. Pega o ID da loja logada direto do token
      const { sub: storeId } = request.user as { sub: string }

      // 2. Tenta deletar garantindo que o produto PERTENCE à loja
      const { count } = await prisma.product.deleteMany({
        where: { 
          id,
          storeId, // Trava de segurança essencial
        },
      })

      if (count === 0) {
        return reply.status(404).send({ 
          message: "Produto não encontrado ou você não tem permissão para excluí-lo." 
        })
      }

      return reply.status(204).send()
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          message: "Dados inválidos", 
          errors: error.flatten().fieldErrors 
        })
      }

      console.error('Erro ao excluir produto:', error)
      return reply.status(500).send({ message: "Erro interno ao excluir o produto." })
    }
  })
}