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
      
      // O 'sub' do seu token JWT já contém o storeId
      const { sub: storeId } = request.user as { sub: string }

      // CORREÇÃO MESTRA: Usar deleteMany evita o Erro 500 caso o ID seja inválido 
      // ou não pertença à loja, e faz o filtro de segurança em uma única operação.
      const { count } = await prisma.banner.deleteMany({
        where: { 
          id, 
          storeId // Só deleta se o banner for realmente desta loja
        }
      })

      // Se o count for 0, significa que o ID não existia ou não era daquela loja
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

      // Log detalhado no seu terminal para debug
      console.error('Erro ao deletar banner:', error)
      return reply.status(500).send({ message: "Erro interno ao deletar banner." })
    }
  })
}