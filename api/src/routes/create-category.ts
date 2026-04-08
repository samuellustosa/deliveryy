import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createCategory(app: FastifyInstance) {
  app.post('/categories', {
    // 1. Só deixa passar se estiver logado
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    
    // 2. Pega o ID da sua loja (Samuel's Burger) direto do Token
    const { sub: storeId } = request.user as { sub: string }

    // 3. Validação: agora só precisamos do nome!
    const createCategorySchema = z.object({
      name: z.string().min(1, "O nome da categoria é obrigatório"),
    })

    const { name } = createCategorySchema.parse(request.body)

    try {
      const category = await prisma.category.create({
        data: {
          name,
          storeId, // Vinculado automaticamente
          // Se o seu banco pedir 'slug', adicione a linha abaixo:
          // slug: name.toLowerCase().replace(/ /g, '-')
        }
      })

      return reply.status(201).send({ 
        categoryId: category.id,
        message: "Categoria criada com sucesso!" 
      })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: "Erro ao criar categoria no banco Neon." })
    }
  })
}