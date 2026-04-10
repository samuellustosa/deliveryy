import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function signup(app: FastifyInstance) {
  app.post('/signup', async (request, reply) => {
    try {
      // 1. Validação com mensagens de erro amigáveis
      const signupSchema = z.object({
        email: z.string().email("Formato de e-mail inválido"),
        password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres")
      })

      const { email, password } = signupSchema.parse(request.body)
      const normalizedEmail = email.toLowerCase().trim()

      // 2. Verifica se o utilizador já existe
      const userExists = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      })

      if (userExists) {
        return reply.status(400).send({ message: 'Este e-mail já está em uso.' })
      }

      // 3. Cria o UTILIZADOR (Dono)
      // Usamos o split para sugerir um nome, mas garantimos o fallback
      const suggestedName = normalizedEmail.split('@')[0]

      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          password: password,
          // A correção está aqui: garantimos que o resultado seja string ou null
          name: normalizedEmail.split('@')[0] || null, 
        }
      })

      // 4. Gera o Token JWT inicial (Aqui o sub ainda é o USER ID)
      const token = app.jwt.sign(
        { email: user.email },
        { sub: user.id, expiresIn: '1d' }
      )

      return reply.status(201).send({ 
        token,
        message: "Conta criada com sucesso! Prossiga para criar sua loja." 
      })

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          message: "Erro de validação", 
          errors: error.flatten().fieldErrors 
        })
      }
      
      console.error('ERRO NO PRISMA DURANTE SIGNUP:', error)
      return reply.status(500).send({ message: 'Erro interno ao criar conta.' })
    }
  })
}