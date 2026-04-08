import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function deleteProduct(app: FastifyInstance) {
  app.delete('/products/:id', { 
    // Substituído app.authenticate por uma função real que verifica o JWT
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    const paramsSchema = z.object({
      id: z.string().uuid("ID do produto inválido"),
    })

    const { id } = paramsSchema.parse(request.params)

    try {
      await prisma.product.delete({
        where: { id },
      })

      return reply.status(204).send()
    } catch (error) {
      return reply.status(404).send({ message: "Produto não encontrado ou já removido." })
    }
  })
}