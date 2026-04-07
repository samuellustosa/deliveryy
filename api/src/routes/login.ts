import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

export async function login(app: FastifyInstance) {
  app.post('/login', async (request, reply) => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string()
    })

    const { email, password } = loginSchema.parse(request.body)

    // Por enquanto, vamos validar com dados do .env para ser rápido
    // No futuro, você buscará isso na tabela 'User' do banco
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = app.jwt.sign({ email })
      return { token }
    }

    return reply.status(401).send({ message: 'Credenciais inválidas' })
  })
}