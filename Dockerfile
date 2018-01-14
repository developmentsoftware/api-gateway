FROM node:slim

RUN mkdir /src

WORKDIR /src
ADD ./src/package.json /src/package.json
ADD ./src/yarn.lock /src/yarn.lock
ADD ./src/env.dist /src/.env
RUN yarn install

EXPOSE 3000 5858

CMD npm start