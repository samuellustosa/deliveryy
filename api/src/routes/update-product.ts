import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function updateProduct(app: FastifyInstance) {
  // Nota: Para usar app.authenticate, você deve ter feito o app.decorate('authenticate', ...) no server.ts
  // Caso não tenha feito, use: { onRequest: [async (request) => await request.jwtVerify()] }
  
  app.put('/products/:id', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    const paramsSchema = z.object({ 
      id: z.string().uuid("ID inválido") 
    })

    const bodySchema = z.object({
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      price: z.number().positive().optional(),
    })

    // Validação de entrada
    const { id } = paramsSchema.parse(request.params)
    const body = bodySchema.parse(request.body)

    // Filtra apenas os campos enviados (evita enviar undefined para o Prisma)
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== undefined)
    )

    // Verifica se há dados para atualizar
    if (Object.keys(updateData).length === 0) {
      return reply.status(400).send({ message: "Nenhum dado fornecido para atualização." })
    }

    try {
      await prisma.product.update({
        where: { id },
        data: updateData
      })

      return reply.status(204).send()
    } catch (error) {
      return reply.status(404).send({ message: "Produto não encontrado." })
    }
  })
}