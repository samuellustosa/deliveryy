import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createCategory(app: FastifyInstance) {
  app.post('/categories', async (request, reply) => {
    const createCategorySchema = z.object({
      name: z.string(),
      storeId: z.string().uuid(),
    })

    const { name, storeId } = createCategorySchema.parse(request.body)

    const category = await prisma.category.create({
      data: {
        name,
        storeId,
      }
    })

    return reply.status(201).send({ categoryId: category.id })
  })
}