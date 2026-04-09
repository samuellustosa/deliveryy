import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createCategory(app: FastifyInstance) {
  app.post('/categories', {
    // 1. Verifica se o Samuel está logado
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    
    try {
      // 2. O 'sub' é o ID do USUÁRIO (Samuel)
      const { sub: userId } = request.user as { sub: string }

      // 3. Busca a LOJA real do Samuel para pegar o ID correto dela
      const store = await prisma.store.findFirst({
        where: { userId }
      })

      if (!store) {
        return reply.status(404).send({ message: "Loja não encontrada para este usuário." })
      }

      // 4. Validação do nome
      const createCategorySchema = z.object({
        name: z.string().min(1, "O nome da categoria é obrigatório"),
      })

      const { name } = createCategorySchema.parse(request.body)

      // 5. Cria a categoria vinculada ao ID real da LOJA
      const category = await prisma.category.create({
        data: {
          name,
          storeId: store.id, // Agora sim, usando o ID da Store e não do User
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