import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createProduct(app: FastifyInstance) {
  app.post('/products', {
    // 1. Só permite criar produto se o lojista estiver logado
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    try {
      // 2. Extrai o ID da loja direto do token JWT
      const { sub: storeId } = request.user as { sub: string }

      // 3. Validação: removi o storeId do body, pois agora ele vem do token
      const createProductSchema = z.object({
        name: z.string().min(1, "O nome do produto é obrigatório"),
        description: z.string().optional(),
        price: z.number().positive("O preço deve ser maior que zero"),
        categoryId: z.string().uuid("ID da categoria inválido"),
        imageUrl: z.string().optional() // Caso queira salvar a URL da imagem
      })

      const { name, description, price, categoryId, imageUrl } = createProductSchema.parse(request.body)

      // 4. Verificação de Segurança: A categoria realmente existe e pertence a ESTA loja?
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

      // 5. Criação do Produto no banco Neon
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