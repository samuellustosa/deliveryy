import type { FastifyInstance } from 'fastify';
import multer from 'multer';
import cloudinary from '../lib/cloudinary.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export async function uploadImage(app: FastifyInstance) {
  // Rota protegida: só o lojista logado sobe fotos
  app.post('/upload', { onRequest: [app.authenticate] }, async (request, reply) => {
    const data = await request.file(); // Necessário registrar @fastify/multipart
    
    if (!data) {
      return reply.status(400).send({ message: 'Nenhum arquivo enviado.' });
    }

    // Envia para o Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'delivery-system' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      data.file.pipe(uploadStream);
    });

    return { imageUrl: (result as any).secure_url };
  });
}