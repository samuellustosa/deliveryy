// api/src/routes/login.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function login(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      // Alterado para 'phone' para bater com o que o Frontend envia
      phone: z.string().min(1, "Identificador é obrigatório"),
      password: z.string().min(1, "Senha é obrigatória")
    })

    const { phone, password } = loginSchema.parse(request.body)

    // Busca o usuário usando o campo 'phone' do banco de dados
    const store = await prisma.store.findFirst({
      where: {
        phone: phone 
      }
    })

    if (!store || store.password !== password) {
      return reply.status(401).send({ message: 'E-mail ou senha incorretos' })
    }

    const token = app.jwt.sign({ 
      sub: store.id,
      email: store.phone 
    })

    return { token }
  })
}