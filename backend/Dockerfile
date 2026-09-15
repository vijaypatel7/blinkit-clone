FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev


FROM node:20-alpine AS runner

ENV NODE_ENV=production

WORKDIR /app

RUN addgroup -S nodejs -g 1001 && \
    adduser -S nodeuser -u 1001 -G nodejs

COPY --from=deps /app/node_modules ./node_modules

COPY package*.json ./

COPY src ./src

RUN chown -R nodeuser:nodejs /app

USER nodeuser

EXPOSE 3000

CMD ["node", "src/server.js"]