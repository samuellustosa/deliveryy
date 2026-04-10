// api/src/routes/create-product.ts

import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createProduct(app: FastifyInstance) {
  app.post('/products', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    try {
      // 1. O 'sub' do token é o ID da LOJA (Store ID)
      const { sub: storeId } = request.user as { sub: string }

      // 2. Validação do Body (Incluindo o array de IDs dos complementos)
      const createProductSchema = z.object({
        name: z.string().min(1, "O nome do produto é obrigatório"),
        description: z.string().optional().nullable(),
        price: z.number().positive("O preço deve ser maior que zero"),
        categoryId: z.string().uuid("ID da categoria inválido"),
        imageUrl: z.string().optional().nullable(),
        // Recebe os IDs dos grupos selecionados no frontend
        optionGroupsIds: z.array(z.string().uuid()).optional().default([])
      })

      const { 
        name, 
        description, 
        price, 
        categoryId, 
        imageUrl, 
        optionGroupsIds 
      } = createProductSchema.parse(request.body)

      // 3. Verificação de Segurança: A categoria pertence a esta loja?
      const category = await prisma.category.findFirst({
        where: {
          id: categoryId,
          storeId: storeId,
        },
      })

      if (!category) {
        return reply.status(400).send({ 
          message: 'A categoria informada não existe ou não pertence à sua loja.' 
        })
      }

      // 4. Criação do Produto com vínculo aos OptionGroups
      const product = await prisma.product.create({
        data: {
          name,
          description: description ?? null,
          price,
          categoryId,
          storeId,
          imageUrl: imageUrl ?? null,
          // Lógica de conexão Many-to-Many do Prisma
          optionGroups: {
            connect: optionGroupsIds.map(id => ({ id }))
          }
        },
        // Incluímos no retorno para conferência
        include: {
          optionGroups: true
        }
      })

      return reply.status(201).send({ 
        productId: product.id,
        product,
        message: "Produto criado com sucesso!"
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          message: "Erro de validação", 
          errors: error.flatten().fieldErrors 
        })
      }

      console.error('Erro ao criar produto:', error)
      return reply.status(500).send({ message: "Erro interno ao criar produto." })
    }
  })
}