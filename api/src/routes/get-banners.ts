import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../plugins/authenticate.js'

export async function getBanners(app: FastifyInstance) {
  app.get('/banners', { preHandler: [authenticate] }, async (request) => {
    // CORREÇÃO: Tipagem manual para o TypeScript reconhecer o 'sub'
    const user = request.user as { sub: string }
    const storeId = user.sub

    const banners = await prisma.banner.findMany({
      where: { storeId },
      orderBy: { 
        createdAt: 'desc' 
      },
    })

    return banners
  })
}