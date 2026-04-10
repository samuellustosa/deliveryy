import type { FastifyInstance } from 'fastify'
import cloudinary from '../lib/cloudinary.js'
import { prisma } from '../lib/prisma.js'
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

export async function uploadBanner(app: FastifyInstance) {
  app.post('/banners/upload', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({ message: 'Nenhuma imagem enviada.' })
    }

    const { sub: storeId } = request.user as { sub: string }

    try {
      const uploadResponse = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'deliveryy/banners' },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) reject(error)
            else if (result) resolve(result)
            else reject(new Error('Erro no upload.'))
          }
        )
        data.file.pipe(uploadStream)
      })

      // Cria o banner no banco já com a URL do Cloudinary
      const banner = await prisma.banner.create({
        data: {
          imageUrl: uploadResponse.secure_url,
          storeId
        }
      })

      return reply.status(201).send(banner)
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Erro ao processar upload do banner.' })
    }
  })
}