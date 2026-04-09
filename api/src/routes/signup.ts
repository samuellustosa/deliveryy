import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function signup(app: FastifyInstance) {
  app.post('/signup', async (request, reply) => {
    // 1. Validação dos dados de entrada
    const signupSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    })

    const { email, password } = signupSchema.parse(request.body)

    try {
      // 2. Verifica se o utilizador já existe usando o NOVO campo email
      const userExists = await prisma.user.findUnique({
        where: { email: email } // Agora aponta para o campo email do schema
      })

      if (userExists) {
        return reply.status(400).send({ message: 'Este e-mail já está em uso.' })
      }

      // 3. Cria o UTILIZADOR no banco (Dono da loja)
     const user = await prisma.user.create({
        data: {
          email: email,
          password: password,
          // Se email.split('@')[0] for undefined, passa null
          name: email.split('@')[0] ?? null, 
        }
      })

      // 4. Gera o Token JWT para o frontend usar no Onboarding da loja
      const token = app.jwt.sign({ sub: user.id })

      return reply.status(201).send({ 
        token,
        message: "Conta criada com sucesso! Prossiga para criar sua loja." 
      })

    } catch (error) {
      // Log detalhado para te ajudar a debugar no terminal
      console.error('ERRO NO PRISMA DURANTE SIGNUP:', error)
      return reply.status(500).send({ message: 'Erro interno ao criar conta.' })
    }
  })
}