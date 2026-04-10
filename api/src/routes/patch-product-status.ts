import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function patchProductStatus(app: FastifyInstance) {
  app.patch('/products/:id/status', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    try {
      // O 'sub' do token agora já é o ID da LOJA (Store ID)
      const { sub: storeId } = request.user as { sub: string }

      const paramsSchema = z.object({ 
        id: z.string().uuid("ID do produto inválido") 
      })
      
      const bodySchema = z.object({ 
        isActive: z.boolean({
          // Em vez de required_error ou invalid_type_error, use apenas message
          message: "O status isActive é obrigatório e deve ser um valor booleano (true/false)"
        }) 
      })

      const { id } = paramsSchema.parse(request.params)
      const { isActive } = bodySchema.parse(request.body)

      // Atualiza garantindo que o produto pertence à loja do lojista logado
      const { count } = await prisma.product.updateMany({
        where: { 
          id,
          storeId 
        },
        data: { isActive }
      })

      if (count === 0) {
        return reply.status(404).send({ 
          message: "Produto não encontrado ou você não tem permissão para editá-lo." 
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

      console.error('Erro ao atualizar status do produto:', error)
      return reply.status(500).send({ message: "Erro interno ao atualizar status." })
    }
  })
}