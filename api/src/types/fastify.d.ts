import '@fastify/jwt'

declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      sub: string
    }
  }
}