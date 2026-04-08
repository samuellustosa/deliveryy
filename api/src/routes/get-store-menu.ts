import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function getStoreMenu(app: FastifyInstance) {
  app.get('/menu/:slug', async (request, reply) => {
    try {
      const getMenuParams = z.object({
        slug: z.string().min(1)
      })

      const { slug } = getMenuParams.parse(request.params)

      const store = await prisma.store.findUnique({
        where: { slug },
        include: {
          categories: {
            orderBy: { name: 'asc' }
          },
          products: {
            where: { isActive: true },
            orderBy: { name: 'asc' }
          },
          // ADICIONE ISSO: Busca os banners cadastrados pelo lojista
          banners: {
            orderBy: { createdAt: 'desc' } // Mostra os mais novos primeiro
          }
        }
      })

      if (!store) {
        return reply.status(404).send({ message: 'Loja não encontrada.' })
      }

      return {
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          niche: store.niche,
          phone: store.phone,
        },
        categories: store.categories,
        products: store.products,
        // Retorna a lista de banners para o frontend
        banners: store.banners || []
      }
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: "Erro ao carregar o cardápio." })
    }
  })
}