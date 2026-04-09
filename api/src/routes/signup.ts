import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function signup(app: FastifyInstance) {
  app.post('/signup', async (request, reply) => {
    const signupSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    })

    const { email, password } = signupSchema.parse(request.body)

    try {
      // 1. Verifica se o usuário já existe (usando o campo phone como e-mail)
      const userExists = await prisma.user.findUnique({
        where: { phone: email }
      })

      if (userExists) {
        return reply.status(400).send({ message: 'Este e-mail já está em uso.' })
      }

      // 2. Cria o USUÁRIO no banco (Dono da loja)
      const user = await prisma.user.create({
        data: {
          phone: email,
          password: password,
        }
      })

      // 3. Gera o Token JWT para o frontend usar no Onboarding
      const token = app.jwt.sign({ sub: user.id })

      return reply.status(201).send({ 
        token,
        message: "Conta criada com sucesso! Prossiga para criar sua loja." 
      })

    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Erro ao criar conta.' })
    }
  })
}