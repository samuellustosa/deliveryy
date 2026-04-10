import type { FastifyInstance } from 'fastify'
import cloudinary from '../lib/cloudinary.js'
import { prisma } from '../lib/prisma.js'
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
    
    // 1. Pegamos o storeId do token (ID da Loja logada)
    const { sub: storeId } = request.user as { sub: string }

    try {
      // 2. Verificamos se o produto realmente pertence a esta loja ANTES do upload
      const product = await prisma.product.findFirst({
        where: { id, storeId }
      })

      if (!product) {
        return reply.status(404).send({ 
          message: 'Produto não encontrado ou você não tem permissão para editá-lo.' 
        })
      }

      // 3. Upload para o Cloudinary (Só acontece se o produto for seu)
      const uploadResponse = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'deliveryy' },
          (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
            if (error) reject(error)
            else if (result) resolve(result)
            else reject(new Error('Erro desconhecido no upload.'))
          }
        )
        data.file.pipe(uploadStream)
      })

      const imageUrl = uploadResponse.secure_url

      // 4. Atualiza o banco Neon de Piripiri com a trava do storeId
      await prisma.product.update({
        where: { id },
        data: { imageUrl }
      })

      return reply.status(201).send({ imageUrl })
      
    } catch (error) {
      console.error('Erro no upload Cloudinary:', error)
      return reply.status(500).send({ message: 'Erro ao processar a imagem.' })
    }
  })
}