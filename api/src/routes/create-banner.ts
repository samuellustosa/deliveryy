import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { authenticate } from '../plugins/authenticate.js'

export async function createBanner(app: FastifyInstance) {
  app.post('/banners', { preHandler: [authenticate] }, async (request, reply) => {
    const createBannerBody = z.object({
      imageUrl: z.string().url(),
      link: z.string().url().optional(),
    })

    const { imageUrl, link } = createBannerBody.parse(request.body)

    // CORREÇÃO DO ERRO 'sub': Forçamos o TypeScript a entender o formato do usuário no token
    const user = request.user as { sub: string }
    const storeId = user.sub

    // O banner.create agora trata o 'link' para aceitar null em vez de undefined
    const banner = await prisma.banner.create({
      data: {
        imageUrl,
        link: link ?? null, // Se link for undefined, envia null para o banco
        storeId,
      },
    })

    return reply.status(201).send(banner)
  })
}