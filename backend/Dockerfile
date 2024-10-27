FROM node:alpine AS packagebuilder

WORKDIR /app

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn

FROM node:alpine AS package

WORKDIR /app

COPY package.json ./package.json
COPY yarn.lock ./yarn.lock

RUN yarn --production

FROM node:alpine AS builder

WORKDIR /app

COPY --from=packagebuilder /app/node_modules ./node_modules
COPY . .

RUN yarn build

FROM node:alpine AS runner

WORKDIR /app

COPY --from=package /app/node_modules ./node_modules

COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "dist/index.js"]
