import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function createStore(app: FastifyInstance) {
  // Mantemos o authenticate pois aqui o usuário está se cadastrando como dono
  app.post('/stores', { preHandler: [app.authenticate] }, async (request, reply) => {
    try {
      const createStoreSchema = z.object({
        name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
        slug: z.string()
          .toLowerCase()
          .trim()
          .transform(val => val.replace(/\s+/g, '-')),
        phone: z.string().min(8, "Telefone inválido"),
        niche: z.string().default('gastronomia'),
        // A senha da loja pode ser a mesma do usuário ou uma específica
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres")
      })

      const { name, slug, phone, niche, password } = createStoreSchema.parse(request.body)
      
      // Aqui o 'sub' ainda é o ID do Usuário (Samuel), pois a loja está sendo criada agora
      const userId = (request.user as { sub: string }).sub

      // 1. Verifica se o slug ou telefone já existem para evitar duplicidade
      const storeExists = await prisma.store.findFirst({ 
        where: {
          OR: [{ slug }, { phone }]
        }
      })

      if (storeExists) {
        return reply.status(400).send({ 
          message: 'Este link (slug) ou telefone já está em uso.' 
        })
      }

      // 2. Cria a loja vinculada ao ID do usuário
      const store = await prisma.store.create({
        data: { 
          name, 
          slug, 
          phone, 
          niche,
          password,
          userId: userId 
        }
      })

      // 3. Resposta de sucesso
      return reply.status(201).send({ 
        storeId: store.id,
        slug: store.slug,
        message: "Loja criada com sucesso! Agora saia e entre novamente para ativar seu painel."
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