import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'

export async function signup(app: FastifyInstance) {
  app.post('/signup', async (request, reply) => {
    try {
      const signupSchema = z.object({
        email: z.string().email("E-mail inválido"),
        password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
      })

      const { email, password } = signupSchema.parse(request.body)

      // Verifica se já existe um ADM ou loja com esse e-mail (usando o campo phone como exemplo)
      const userExists = await prisma.store.findFirst({
        where: { phone: email }
      })

      if (userExists) {
        return reply.status(400).send({ message: "Este e-mail já está cadastrado." })
      }

      // Criação inicial (ajuste conforme seu modelo de User no futuro)
      // Por enquanto, criaremos uma loja vinculada a este e-mail
      await prisma.store.create({
        data: {
          name: "Minha Nova Loja",
          slug: `loja-${Date.now()}`,
          phone: email, // Armazenando e-mail no campo phone para teste rápido
          niche: "gastronomia"
        }
      })

      return reply.status(201).send({ message: "Cadastro realizado com sucesso!" })

    } catch (error) {
      if (error instanceof z.ZodError) {
        return reply.status(400).send({ 
          message: "Erro de validação", 
          errors: error.flatten().fieldErrors 
        })
      }
      return reply.status(500).send({ message: "Erro interno no servidor." })
    }
  })
}