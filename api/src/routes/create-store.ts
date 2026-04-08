import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createStore(app: FastifyInstance) {
  app.post('/stores', async (request, reply) => {
    try {
      // 1. Validação com Zod
      const createStoreSchema = z.object({
        name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
        slug: z.string()
          .toLowerCase()
          .trim()
          .transform(val => val.replace(/\s+/g, '-')),
        phone: z.string().min(8, "Telefone inválido"),
        niche: z.string().default('gastronomia'),
        // ADICIONADO: Senha é obrigatória no seu novo banco
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
      })

      const { name, slug, phone, niche, password } = createStoreSchema.parse(request.body)

      // 2. Verifica se o slug ou o telefone (email) já estão em uso
      const storeExists = await prisma.store.findFirst({ 
        where: {
          OR: [
            { slug },
            { phone }
          ]
        }
      })

      if (storeExists) {
        return reply.status(400).send({ 
          message: 'Este link (slug) ou e-mail/telefone já está em uso.' 
        })
      }

      // 3. Criação da loja
      const store = await prisma.store.create({
        data: { 
          name, 
          slug, 
          phone, 
          niche,
          password // Agora o Prisma não reclama mais
        }
      })

      return reply.status(201).send({ 
        storeId: store.id,
        message: "Loja criada com sucesso!"
      })

    } catch (error) {
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