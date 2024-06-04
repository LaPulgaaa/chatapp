FROM node:20-alpine3.18

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install 

COPY ./packages/prisma/schema.prisma ./packages/prisma

WORKDIR /usr/src/app

COPY . .

# nextjs frontend port: 3000
EXPOSE 3000 

CMD [ "npm","run","dev:docker" ]