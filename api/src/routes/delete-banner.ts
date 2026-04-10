import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function deleteBanner(app: FastifyInstance) {
  app.delete('/banners/:id', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    try {
      const deleteBannerParams = z.object({
        id: z.string().uuid("ID do banner inválido"),
      })

      const { id } = deleteBannerParams.parse(request.params)
      const { sub: storeId } = request.user as { sub: string }

      // Usar deleteMany é mais seguro: ele filtra pelo ID e pela LOJA ao mesmo tempo.
      // Se não encontrar nada, o 'count' será 0 e não dispara erro 500.
      const { count } = await prisma.banner.deleteMany({
        where: { 
          id, 
          storeId 
        }
      })

      if (count === 0) {
        return reply.status(404).send({ 
          message: 'Banner não encontrado ou você não tem permissão para removê-lo.' 
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

      console.error('Erro ao deletar banner:', error)
      return reply.status(500).send({ message: "Erro interno ao deletar banner." })
    }
  })
}