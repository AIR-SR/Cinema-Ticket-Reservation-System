# Stage 1: Build stage
FROM node:23-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Pass the environment variable during the build process
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm install --production

COPY src ./src
COPY public ./public

RUN npm run build

# Stage 2: Production stage
FROM nginx:stable-alpine

WORKDIR /usr/share/nginx/html

COPY --from=builder /app/build ./
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
