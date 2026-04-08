import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function patchProductStatus(app: FastifyInstance) {
  app.patch('/products/:id/status', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    
    // Schema de parâmetros
    const paramsSchema = z.object({ 
      id: z.string().uuid("ID do produto inválido") 
    })
    
    // Schema do corpo - AQUI ESTAVA O ERRO
const bodySchema = z.object({ 
  isActive: z.boolean({
    required_error: "O status isActive é obrigatório",
    invalid_type_error: "O status deve ser um booleano (true ou false)"
  }) 
})

    const { id } = paramsSchema.parse(request.params)
    const { isActive } = bodySchema.parse(request.body)

    await prisma.product.update({
      where: { id },
      data: { isActive }
    })

    return reply.status(204).send()
  })
}