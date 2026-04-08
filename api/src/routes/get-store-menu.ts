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

      // Busca a loja e traz as categorias e produtos ativos
      const store = await prisma.store.findUnique({
        where: { slug },
        include: {
          categories: {
            // Se o campo 'order' não existir ou for nulo, ele ordena pelo ID ou nome
            orderBy: { 
              name: 'asc' // Ordenação por nome é mais segura para começar
            },
            include: {
              products: {
                where: { 
                  isActive: true // Só mostra o que tem no estoque!
                },
                orderBy: {
                  name: 'asc'
                }
              }
            }
          }
        }
      })

      if (!store) {
        return reply.status(404).send({ message: 'Loja não encontrada.' })
      }

      // Opcional: Filtra categorias que não possuem produtos ativos
      const menu = {
        ...store,
        categories: store.categories.filter(cat => cat.products.length > 0)
      }

      return menu
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: "Erro ao carregar o cardápio." })
    }
  })
}