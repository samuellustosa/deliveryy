import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function deleteProduct(app: FastifyInstance) {
  app.delete('/products/:id', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid("ID do produto inválido"),
    })

    const { id } = paramsSchema.parse(request.params)

    try {
      // 1. Pega o ID da loja logada do token
      const { sub: storeId } = request.user as { sub: string }

      // 2. Tenta deletar garantindo que o produto PERTENCE à loja
      // Usamos deleteMany porque ele permite filtrar por dois campos ao mesmo tempo
      const { count } = await prisma.product.deleteMany({
        where: { 
          id,
          storeId, // Segurança: só deleta se o produto for desta loja
        },
      })

      if (count === 0) {
        return reply.status(404).send({ 
          message: "Produto não encontrado ou você não tem permissão para excluí-lo." 
        })
      }

      return reply.status(204).send()
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: "Erro interno ao excluir o produto." })
    }
  })
}