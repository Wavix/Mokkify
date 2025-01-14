FROM node:20 AS builder

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
RUN pnpm rebuild bcrypt

COPY . .

RUN pnpm build

FROM node:20-alpine AS runner

RUN npm install -g pnpm

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN pnpm install --prod

RUN apk add --no-cache sqlite sqlite-dev
RUN pnpm rebuild

EXPOSE 3000

CMD ["pnpm", "start"]
