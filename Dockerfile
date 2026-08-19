# Alpine on both stages: sqlite3 ships linuxmusl prebuilds, while its glibc
# prebuilds require glibc >= 2.38 (newer than Debian bookworm provides)
FROM node:22-alpine AS builder

RUN npm install -g pnpm@10

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

FROM node:22-alpine AS runner

RUN npm install -g pnpm@10

WORKDIR /app

COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

RUN pnpm install --prod

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD wget -qO- http://127.0.0.1:3000/health || exit 1

CMD ["pnpm", "start"]
