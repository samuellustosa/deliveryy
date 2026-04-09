// api/src/routes/get-orders.ts
import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export async function getOrders(app: FastifyInstance) {
  app.get('/orders', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    const { sub: userId } = request.user as { sub: string };
    const querySchema = z.object({ date: z.string().optional() });
    const { date } = querySchema.parse(request.query);

    const store = await prisma.store.findFirst({ where: { userId } });
    if (!store) return reply.status(404).send({ message: "Loja não encontrada." });

    // Fuso horário local (América/Fortaleza ou Sao_Paulo é o mesmo para o Piauí)
    const timeZone = 'America/Fortaleza'; 
    
    // Se não vier data, usa "agora" no fuso local
    const referenceDate = date ? parseISO(date) : toZonedTime(new Date(), timeZone);

    // Define o range do dia considerando o fuso
    const start = startOfDay(referenceDate);
    const end = endOfDay(referenceDate);

    const orders = await prisma.order.findMany({
      where: { 
        storeId: store.id,
        createdAt: {
          gte: start,
          lte: end
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return orders;
  });
}