import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function updateProduct(app: FastifyInstance) {
  app.put('/products/:id', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    try {
      // 1. O 'sub' do token agora já é o ID da LOJA
      const { sub: storeId } = request.user as { sub: string }

      const paramsSchema = z.object({ 
        id: z.string().uuid("ID inválido") 
      })

      // 2. Schema ajustado para aceitar campos opcionais corretamente
      const bodySchema = z.object({
        name: z.string().min(1, "O nome não pode ser vazio").optional(),
        description: z.string().optional().nullable(),
        price: z.number().positive("O preço deve ser maior que zero").optional(),
        categoryId: z.string().uuid("Categoria inválida").optional(),
        imageUrl: z.string().url("URL da imagem inválida").optional().nullable()
      })

      const { id } = paramsSchema.parse(request.params)
      const body = bodySchema.parse(request.body)

      // 3. Monta o objeto de atualização apenas com campos definidos
      // Usamos 'null' explicitamente para campos que o Prisma permite limpar
      const updateData: any = {}
      if (body.name !== undefined) updateData.name = body.name
      if (body.description !== undefined) updateData.description = body.description ?? null
      if (body.price !== undefined) updateData.price = body.price
      if (body.categoryId !== undefined) updateData.categoryId = body.categoryId
      if (body.imageUrl !== undefined) updateData.imageUrl = body.imageUrl ?? null

      if (Object.keys(updateData).length === 0) {
        return reply.status(400).send({ message: "Nenhum dado fornecido para atualização." })
      }

      // 4. Update com trava de segurança (storeId)
      const { count } = await prisma.product.updateMany({
        where: { 
          id,
          storeId 
        },
        data: updateData
      })

      if (count === 0) {
        return reply.status(404).send({ 
          message: "Produto não encontrado ou você não tem permissão para editá-lo." 
        })
      }

      return reply.status(204).send()

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          message: "Erro de validação", 
          errors: error.flatten().fieldErrors 
        })
      }

      console.error('Erro ao editar produto:', error)
      return reply.status(500).send({ message: "Erro interno ao atualizar produto." })
    }
  })
}