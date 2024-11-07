FROM ubuntu:latest

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN apt-get update && apt-get install -y curl
RUN curl --silent --location https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y \
    nodejs \
    redis
RUN echo "$(node -v)"
RUN echo "$(npm -v)"
RUN npm install 

COPY ./packages/prisma/schema.prisma ./packages/prisma

WORKDIR /usr/src/app

COPY . .

# express server port: 3001
EXPOSE 3001

RUN npm run build

CMD [ "npm","run","dev:docker" ]