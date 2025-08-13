FROM node:20-alpine
WORKDIR /app

# 构建期可传的 schema 路径，默认 /app/prisma/schema.prisma
ARG PRISMA_SCHEMA=/app/prisma/schema.prisma

RUN apk add --no-cache dumb-init

# CI 上传的运行产物与 prisma 目录
COPY .output ./.output
COPY prisma ./prisma

# 仅安装运行期需要的依赖并生成 Prisma Client
RUN npm i --omit=dev @prisma/client && npx prisma generate --schema=$PRISMA_SCHEMA 

COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000 NITRO_HOST=0.0.0.0 NITRO_PORT=3000 \
    PRISMA_SCHEMA=/app/prisma/schema.prisma
EXPOSE 3000

ENTRYPOINT ["dumb-init","--"]
CMD ["sh","./entrypoint.sh"]
