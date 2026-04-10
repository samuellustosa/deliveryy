// api/src/routes/get-store-menu.ts

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
              category: true,
              optionGroups: { 
                include: { options: true }
              }
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

      /**
       * O ERRO OCORRIA AQUI:
       * Precisamos extrair explicitamente as propriedades do 'store' para o objeto de retorno
       * para que o TypeScript no frontend (MenuData) consiga mapear corretamente.
       */
      return {
        store: {
          id: store.id,
          name: store.name,
          slug: store.slug,
          niche: store.niche,
          phone: store.phone,
          logoUrl: store.logoUrl,     // Certifique-se que esta linha existe
          coverUrl: store.coverUrl,   // Certifique-se que esta linha existe
          deliveryFee: store.deliveryFee,
        },
        categories: store.categories,
        products: store.products,
        banners: store.banners || []
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "Slug inválido." })
      }
      console.error('Erro ao carregar cardápio:', error)
      return reply.status(500).send({ message: "Erro ao carregar o cardápio." })
    }
  })
}