import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createProduct(app: FastifyInstance) {
  app.post('/products', async (request, reply) => {
    try {
      // 1. Validação com Zod
      const createProductSchema = z.object({
        name: z.string().min(1, "O nome do produto é obrigatório"),
        description: z.string().optional(),
        price: z.number().positive("O preço deve ser maior que zero"),
        categoryId: z.string().uuid("ID da categoria inválido"),
        storeId: z.string().uuid("ID da loja inválido"),
      })

      const { name, description, price, categoryId, storeId } = createProductSchema.parse(request.body)

      // 2. Verificação de Segurança: A categoria pertence a essa loja?
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          storeId: storeId,
        },
      })

      if (!category) {
        return reply.status(400).send({ 
          message: 'A categoria informada não existe ou não pertence a esta loja.' 
        })
      }

      // 3. Criação do Produto
      const product = await prisma.product.create({
        data: {
          name,
          description: description ?? null, // Converte undefined para null (o Prisma aceita null para campos opcionais)
          price,
          categoryId,
          storeId,
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