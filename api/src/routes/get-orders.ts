import type { FastifyInstance } from 'fastify';
import { prisma } from '../lib/prisma.js';
import { z } from 'zod';
import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export async function getOrders(app: FastifyInstance) {
  app.get('/orders', { 
    onRequest: [async (request) => await request.jwtVerify()] 
  }, async (request, reply) => {
    // Agora o 'sub' já é o ID da LOJA
    const { sub: storeId } = request.user as { sub: string };
    
    const querySchema = z.object({ date: z.string().optional() });
    const { date } = querySchema.parse(request.query);

    const timeZone = 'America/Fortaleza'; 
    const referenceDate = date ? parseISO(date) : toZonedTime(new Date(), timeZone);

    const start = startOfDay(referenceDate);
    const end = endOfDay(referenceDate);

    const orders = await prisma.order.findMany({
      where: { 
        storeId: storeId, // Usa o ID direto do token
        createdAt: {
          gte: start,
          lte: end
        }
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return orders;
  });
}