import type { FastifyInstance } from 'fastify'
import { prisma } from '../lib/prisma.js'

export async function getStores(app: FastifyInstance) {
  app.get('/stores', async () => {
    const stores = await prisma.store.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        niche: true,
        logoUrl: true,
      }
    })

    return { stores }
  })
}