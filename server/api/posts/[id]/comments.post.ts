import { z } from 'zod'
import { prisma } from '../../../prisma'

const schema = z.object({
  content: z.string().min(1).max(500),
  isAnonymous: z.boolean().default(true),
  author: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')!
  const body = await readBody(event)
  const data = schema.parse(body)
  const created = await prisma.comment.create({
    data: {
      content: data.content,
      isAnonymous: data.isAnonymous,
      author: data.author,
      postId: id,
    },
  })
  return created
})


