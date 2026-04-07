import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function getStoreMenu(app: FastifyInstance) {
  app.get('/menu/:slug', async (request, reply) => {
    const getMenuParams = z.object({
      slug: z.string()
    })

    const { slug } = getMenuParams.parse(request.params)

    // Busca a loja e inclui as categorias com seus respectivos produtos
    const store = await prisma.store.findUnique({
      where: { slug },
      include: {
        categories: {
          orderBy: { order: 'asc' },
          include: {
            products: {
              where: { isActive: true }
            }
          }
        }
      }
    })

    if (!store) {
      return reply.status(404).send({ message: 'Loja não encontrada.' })
    }

    return store
  })
}