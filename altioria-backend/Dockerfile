# syntax=docker/dockerfile:1

FROM node:24-bookworm-slim AS dependencies

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci


FROM dependencies AS build

COPY . .

RUN DATABASE_URL=postgresql://postgres:postgres@postgres:5432/altioria \
    npx prisma generate

RUN npm run build


FROM dependencies AS production-dependencies

RUN npm prune --omit=dev


FROM node:24-bookworm-slim AS production

WORKDIR /app

ENV NODE_ENV=production

COPY --from=production-dependencies /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY package.json ./

EXPOSE 3000

CMD ["node", "dist/main.js"]