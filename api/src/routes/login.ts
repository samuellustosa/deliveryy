// api/src/routes/login.ts
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function login(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email("E-mail inválido"),
      password: z.string().min(1, "Senha é obrigatória")
    })

    const { email, password } = loginSchema.parse(request.body)

    // 1. Busca o usuário (dono) pelo e-mail
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    // 2. Validação de senha simples (considere usar bcrypt no futuro)
    if (!user || user.password !== password.trim()) {
      return reply.status(401).send({ message: 'E-mail ou senha incorretos' })
    }

    // 3. BUSCA A LOJA VINCULADA AO USUÁRIO
    // No seu schema, um User pode ter várias lojas, aqui pegamos a primeira vinculada.
    const store = await prisma.store.findFirst({
      where: { userId: user.id }
    })

    if (!store) {
      return reply.status(404).send({ message: 'Nenhuma loja encontrada para este usuário.' })
    }

    // 4. GERA O TOKEN COM O ID DA LOJA NO 'SUB'
    // Isso garante que as rotas de pedido (Orders) funcionem com a trava de segurança.
    const token = app.jwt.sign(
      { 
        email: user.email,
        userName: user.name 
      }, 
      { 
        sub: store.id, // O segredo da correção está aqui
        expiresIn: '7d' 
      }
    )

    return { token }
  })
}