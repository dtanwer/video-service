FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Install FFmpeg for video processing
RUN apk add --no-cache ffmpeg

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/uploads ./uploads

EXPOSE 3001

CMD ["npm", "run", "start:prod"]
