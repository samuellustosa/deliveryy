import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js' // Importando o prisma

export async function login(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email("E-mail inválido"),
      password: z.string().min(1, "Senha é obrigatória")
    })

    const { email, password } = loginSchema.parse(request.body)

    // 1. Busca o usuário no banco (ajustado para o campo 'phone' onde salvamos o email)
    const store = await prisma.store.findFirst({
      where: {
        phone: email 
      }
    })

    // 2. Valida se a loja existe e se a senha bate
    if (!store || store.password !== password) {
      return reply.status(401).send({ message: 'E-mail ou senha incorretos' })
    }

    // 3. Gera o token JWT usando o ID da loja para o dashboard saber quem é quem
    const token = app.jwt.sign({ 
      sub: store.id,
      email: store.phone 
    })

    return { token }
  })
}