import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createCategory(app: FastifyInstance) {
  app.post('/categories', {
    // 1. Verifica se está logado
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    
    try {
      // 2. Agora o 'sub' JÁ É o ID da LOJA (Store ID)
      const { sub: storeId } = request.user as { sub: string }

      // 3. Validação do nome
      const createCategorySchema = z.object({
        name: z.string().min(1, "O nome da categoria é obrigatório"),
      })

      const { name } = createCategorySchema.parse(request.body)

      // 4. Cria a categoria vinculada diretamente ao ID do token
      const category = await prisma.category.create({
        data: {
          name,
          storeId: storeId, // Usamos o ID que veio no token
        }
      })

      return reply.status(201).send({ 
        categoryId: category.id,
        message: "Categoria criada com sucesso!" 
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ message: "Erro de validação", errors: error.flatten().fieldErrors })
      }
      
      console.error('Erro ao criar categoria:', error)
      return reply.status(500).send({ message: "Erro interno ao criar categoria." })
    }
  })
}