FROM node:13.5.0-slim
RUN mkdir -p /src/app && npm install -g nodemon && apt update && apt install -y python2.7 build-essential \
    && ln -s /usr/bin/python2.7 /usr/local/bin/python
WORKDIR /src/app
COPY ./src /src/app
RUN yarn install \
    && apt remove --purge --auto-remove -y build-essential \
    && rm -rf /var/lib/apt/lists/*

EXPOSE 3000

CMD yarn prod