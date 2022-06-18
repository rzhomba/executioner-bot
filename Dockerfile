FROM node:18-alpine
ENV NODE_ENV=production

WORKDIR rzhomba/src/executioner

COPY . .

RUN npm install
