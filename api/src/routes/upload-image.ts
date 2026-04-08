import type { FastifyInstance } from 'fastify'
import cloudinary from '../lib/cloudinary.js'
import { prisma } from '../lib/prisma.js'
// CORREÇÃO: Usando 'import type' para as interfaces do Cloudinary
import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

export async function uploadImage(app: FastifyInstance) {
  app.post('/products/:id/image', {
    onRequest: [async (request) => await request.jwtVerify()]
  }, async (request, reply) => {
    const data = await request.file()

    if (!data) {
      return reply.status(400).send({ message: 'Nenhuma imagem enviada.' })
    }

    const { id } = request.params as { id: string }

    try {
      // Promise tipada corretamente
      const uploadResponse = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'deliveryy' },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) {
              reject(error)
            } else if (result) {
              resolve(result)
            } else {
              reject(new Error('Erro desconhecido no upload.'))
            }
          }
        )
        data.file.pipe(uploadStream)
      })

      const imageUrl = uploadResponse.secure_url

      // Atualiza o produto no banco Neon de Piripiri
      await prisma.product.update({
        where: { id },
        data: { imageUrl }
      })

      return reply.status(201).send({ imageUrl })
    } catch (error) {
      console.error(error)
      return reply.status(500).send({ message: 'Erro ao fazer upload da imagem.' })
    }
  })
}