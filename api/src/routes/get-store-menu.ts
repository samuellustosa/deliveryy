import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function getStoreMenu(app: FastifyInstance) {
  app.get('/menu/:slug', async (request, reply) => {
    try {
      const getMenuParams = z.object({
        slug: z.string().min(1)
      })

      let { slug } = getMenuParams.parse(request.params)

      // Lógica extra: Se o slug for 'me', tentamos pegar o ID da loja do token
      // Isso ajuda a carregar os dados da loja no Dashboard sem erro de 'undefined'
      if (slug === 'me') {
        try {
          const user = await request.jwtVerify() as { sub: string }
          const storeFromToken = await prisma.store.findUnique({
            where: { id: user.sub }
          })
          if (storeFromToken) {
            slug = storeFromToken.slug
          }
        } catch (e) {
          return reply.status(401).send({ message: "Não autorizado para ver 'me'." })
        }
      }

      const store = await prisma.store.findUnique({
        where: { slug },
        include: {
          categories: {
            orderBy: { name: 'asc' }
          },
          products: {
            where: { isActive: true },
            orderBy: { name: 'asc' },
            include: {
              category: true // Útil para filtrar produtos por categoria no frontend
            }
          },
          banners: {
            orderBy: { createdAt: 'desc' }
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
        banners: store.banners || []
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "Slug inválido." })
      }
      console.error(error)
      return reply.status(500).send({ message: "Erro ao carregar o cardápio." })
    }
  })
}