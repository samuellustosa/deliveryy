// api/src/routes/login.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function login(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      phone: z.string().min(1, "Identificador é obrigatório"),
      password: z.string().min(1, "Senha é obrigatória")
    })

    const { phone, password } = loginSchema.parse(request.body)

    // Procure exatamente como está no banco
    const store = await prisma.store.findUnique({
      where: {
        phone: phone.trim() // Remove espaços acidentais
      }
    })

    // IMPORTANTE: Compare a senha (idealmente você usaria bcrypt, mas mantendo seu padrão:)
    if (!store || store.password !== password.trim()) {
      return reply.status(401).send({ message: 'Telefone ou senha incorretos' })
    }

    const token = app.jwt.sign({ 
      sub: store.id,
      phone: store.phone 
    })

    return { token }
  })
}