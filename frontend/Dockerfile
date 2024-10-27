FROM node as builder

WORKDIR /app

COPY . .

RUN yarn

RUN yarn build

FROM thistine/simple-http-server

WORKDIR /app

COPY --from=builder /app/dist ./static/display

EXPOSE 4000
