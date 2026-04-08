import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function signup(app: FastifyInstance) {
  app.post('/signup', async (request, reply) => {
    // 1. Validação dos dados que vêm do Frontend
    const signupSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    })

    const { email, password } = signupSchema.parse(request.body)

    try {
      // 2. Verifica se já existe uma loja com esse "email" (campo phone)
      const userExists = await prisma.store.findUnique({
        where: { phone: email }
      })

      if (userExists) {
        return reply.status(400).send({ message: 'Este e-mail já está em uso.' })
      }

      // 3. Cria a nova loja no banco Neon
      const store = await prisma.store.create({
        data: {
          name: "Minha Loja", // Nome padrão inicial
          slug: `loja-${Date.now()}`, // Gera um slug único temporário
          phone: email, // Salvando e-mail no campo phone para o login
          password: password, // Salvando a senha (que o TS agora reconhece)
          niche: "gastronomia",
        }
      })

      return reply.status(201).send({ storeId: store.id })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Erro ao criar conta no banco de dados.' })
    }
  })
}