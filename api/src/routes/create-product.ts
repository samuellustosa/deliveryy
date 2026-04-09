import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createProduct(app: FastifyInstance) {
  app.post('/products', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    try {
      // 1. O 'sub' do token é o USER ID, não o STORE ID
      const { sub: userId } = request.user as { sub: string }

      // 2. Precisamos encontrar a LOJA que pertence a este usuário
      const store = await prisma.store.findFirst({
        where: { userId }
      })

      if (!store) {
        return reply.status(404).send({ message: 'Loja não encontrada para este usuário.' })
      }

      const storeId = store.id // Agora temos o ID real da loja

      // 3. Validação do Body
      const createProductSchema = z.object({
        name: z.string().min(1, "O nome do produto é obrigatório"),
        description: z.string().optional(),
        price: z.number().positive("O preço deve ser maior que zero"),
        categoryId: z.string().uuid("ID da categoria inválido"),
        imageUrl: z.string().optional().nullable()
      })

      const { name, description, price, categoryId, imageUrl } = createProductSchema.parse(request.body)

      // 4. Verificação: A categoria pertence a esta loja específica?
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          storeId: storeId, // Filtro usando o ID real da loja
        },
      })

      if (!category) {
        return reply.status(400).send({ 
          message: 'A categoria informada não existe ou não pertence à sua loja.' 
        })
      }

      // 5. Criação do Produto vinculada à loja correta
      const product = await prisma.product.create({
        data: {
          name,
          description: description ?? null,
          price,
          categoryId,
          storeId,
          imageUrl: imageUrl ?? null
        }
      })

      return reply.status(201).send({ 
        productId: product.id,
        message: "Produto criado com sucesso!"
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          message: "Erro de validação", 
          errors: error.flatten().fieldErrors 
        })
      }

      console.error(error)
      return reply.status(500).send({ message: "Erro interno ao criar produto." })
    }
  })
}