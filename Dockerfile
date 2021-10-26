# syntax=docker/dockerfile:1
FROM node:current-slim
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "./bin/www"]