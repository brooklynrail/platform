FROM node:18.18.0-alpine

WORKDIR /src

ADD package.json /src

RUN yarn install

ADD .env /src

CMD ["yarn", "dev"]