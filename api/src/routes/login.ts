// api/src/routes/login.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function login(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email("E-mail inválido"), // Mudou de phone para email
      password: z.string().min(1, "Senha é obrigatória")
    })

    const { email, password } = loginSchema.parse(request.body)

    // Agora busca na tabela User (Dono)
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    // Compara a senha (no futuro, use bcrypt aqui)
    if (!user || user.password !== password.trim()) {
      return reply.status(401).send({ message: 'E-mail ou senha incorretos' })
    }

    const token = app.jwt.sign({ 
      sub: user.id,
      email: user.email 
    })

    return { token }
  })
}