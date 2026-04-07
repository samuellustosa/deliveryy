import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createStore(app: FastifyInstance) {
  app.post('/stores', async (request, reply) => {
    try {
      // 1. Validação com Zod
      const createStoreSchema = z.object({
        name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
        // Transforma espaços em hifens e remove acentos básicos (opcional)
        slug: z.string()
          .toLowerCase()
          .trim()
          .transform(val => val.replace(/\s+/g, '-')),
        phone: z.string(),
        // .default() garante que o tipo seja 'string' e não 'string | undefined'
        niche: z.string().default('gastronomia'),
      })

      const { name, slug, phone, niche } = createStoreSchema.parse(request.body)

      // 2. Verifica se o slug já está em uso
      const storeExists = await prisma.store.findUnique({ 
        where: { slug } 
      })

      if (storeExists) {
        return reply.status(400).send({ 
          message: 'Este link (slug) já está em uso.' 
        })
      }

      // 3. Criação da loja
      // O TypeScript agora aceita 'niche' pois o Zod garante que ele é uma string
      const store = await prisma.store.create({
        data: { 
          name, 
          slug, 
          phone, 
          niche 
        }
      })

      return reply.status(201).send({ 
        storeId: store.id,
        message: "Loja criada com sucesso!"
      })

    } catch (error) {
      // Tratamento de erro de validação do Zod
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          message: "Erro de validação", 
          errors: error.flatten().fieldErrors 
        })
      }

      console.error(error)
      return reply.status(500).send({ message: "Erro interno no servidor." })
    }
  })
}