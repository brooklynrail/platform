# via https://github.com/tpAtalas/tp-next-todos/wiki/Deploy-Next.js-App-into-Google-Cloud-Run(GCR)-with-Docker

FROM --platform=linux/amd64 node:18-alpine AS deps

WORKDIR /src

ADD package.json /src

RUN yarn install

ADD .env /src

CMD ["yarn", "refresh"]