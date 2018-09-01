FROM node:slim
RUN mkdir -p /src/app && npm install -g yarn nodemon
WORKDIR /src/app
COPY ./src /src/app
RUN yarn install

EXPOSE 3000

CMD yarn prod