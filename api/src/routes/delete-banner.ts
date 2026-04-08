import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../plugins/authenticate.js'

export async function deleteBanner(app: FastifyInstance) {
  app.delete('/banners/:id', { preHandler: [authenticate] }, async (request, reply) => {
    const deleteBannerParams = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteBannerParams.parse(request.params)
    
    // CORREÇÃO: Tipagem manual para o TypeScript reconhecer o 'sub'
    const user = request.user as { sub: string }
    const storeId = user.sub

    // Verifica se o banner pertence à loja antes de deletar (Segurança)
    const banner = await prisma.banner.findFirst({
      where: { 
        id, 
        storeId 
      }
    })

    if (!banner) {
      return reply.status(404).send({ message: 'Banner não encontrado ou você não tem permissão.' })
    }

    await prisma.banner.delete({ 
      where: { id } 
    })

    return reply.status(204).send()
  })
}