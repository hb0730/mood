import { z } from 'zod'
import { prisma } from '../prisma'

const schema = z.object({
  content: z.string().min(1).max(1000),
  emotion: z.string().min(1),
  isAnonymous: z.boolean().default(true),
  tags: z.array(z.string()).optional().default([]),
  userId: z.string().optional(),
  author: z.string().max(20).optional(),
})

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const data = schema.parse(body)
  
  const created = await prisma.emotionPost.create({
    data: {
      content: data.content,
      emotion: data.emotion,
      isAnonymous: data.isAnonymous,
      userId: data.userId,
      author: data.isAnonymous ? null : data.author,
      tags: data.tags && data.tags.length > 0 ? JSON.stringify(data.tags) : null,
    },
  })
  
  return created
})


