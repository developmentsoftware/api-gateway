FROM node:slim

RUN mkdir -p /src/app

WORKDIR /src/app
RUN npm install nodemon -g

EXPOSE 3000 5858

CMD npm run start