import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function updateProduct(app: FastifyInstance) {
  app.put('/products/:id', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    try {
      // 1. Pega o ID da loja logada direto do Token JWT
      const { sub: storeId } = request.user as { sub: string }

      const paramsSchema = z.object({ 
        id: z.string().uuid("ID inválido") 
      })

      // 2. Schema com mensagens simples para evitar erro de tipagem no TS
      const bodySchema = z.object({
        name: z.string().min(1, { message: "Nome inválido" }).optional(),
        description: z.string().optional(),
        price: z.number().positive({ message: "Preço deve ser positivo" }).optional(),
        categoryId: z.string().uuid().optional(),
      })

      const { id } = paramsSchema.parse(request.params)
      const body = bodySchema.parse(request.body)

      // 3. Filtra apenas os campos enviados
      const updateData = Object.fromEntries(
        Object.entries(body).filter(([_, value]) => value !== undefined)
      )

      if (Object.keys(updateData).length === 0) {
        return reply.status(400).send({ message: "Nenhum dado fornecido para atualização." })
      }

      // 4. Update com trava de segurança (storeId)
      const { count } = await prisma.product.updateMany({
        where: { 
          id,
          storeId // Só edita se o produto for do dono logado
        },
        data: updateData
      })

      if (count === 0) {
        return reply.status(404).send({ 
          message: "Produto não encontrado ou sem permissão para editar." 
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

      console.error(error)
      return reply.status(500).send({ message: "Erro interno ao atualizar produto." })
    }
  })
}