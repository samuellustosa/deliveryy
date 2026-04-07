import 'fastify'

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>
  }
}