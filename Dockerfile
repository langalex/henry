FROM node:24-alpine AS builder

WORKDIR /app
ENV DATABASE_URL=/db/local.db

COPY package*.json ./
RUN npm ci

COPY . .
RUN mkdir /db
RUN npm run prepare
RUN npm run build

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV DATABASE_URL=/db/local.db

COPY --from=builder /app/build ./build
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/drizzle.config.ts ./
COPY --from=builder /app/src/lib/server/db/schema.ts ./src/lib/server/db/

EXPOSE 4000

ENV PORT=4000
ENV HOST=0.0.0.0
VOLUME /db

CMD ["node", "build"]

