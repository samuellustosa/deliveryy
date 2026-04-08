import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function patchProductStatus(app: FastifyInstance) {
  app.patch('/products/:id/status', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    try {
      const { sub: storeId } = request.user as { sub: string }

      const paramsSchema = z.object({ 
        id: z.string().uuid("ID do produto inválido") 
      })
      
      // 3. Validação do corpo - Forma simplificada que o TS aceita
      const bodySchema = z.object({ 
        isActive: z.boolean({
          message: "O status isActive é obrigatório e deve ser booleano"
        }) 
      })

      const { id } = paramsSchema.parse(request.params)
      const { isActive } = bodySchema.parse(request.body)

      const { count } = await prisma.product.updateMany({
        where: { 
          id,
          storeId 
        },
        data: { isActive }
      })

      if (count === 0) {
        return reply.status(404).send({ 
          message: "Produto não encontrado ou sem permissão." 
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
      return reply.status(500).send({ message: "Erro interno ao atualizar status." })
    }
  })
}