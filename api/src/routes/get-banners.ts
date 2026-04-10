import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getBanners(app: FastifyInstance) {
  app.get('/banners', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    try {
      // O 'sub' no seu token agora já carrega o ID da LOJA (Store ID)
      const { sub: storeId } = request.user as { sub: string }

      const banners = await prisma.banner.findMany({
        where: { 
          storeId 
        },
        orderBy: { 
          createdAt: 'desc' 
        },
      })

      return banners
    } catch (error) {
      console.error('Erro ao buscar banners:', error)
      return reply.status(500).send({ message: "Erro interno ao listar banners." })
    }
  })
}