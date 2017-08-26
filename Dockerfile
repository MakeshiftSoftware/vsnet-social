FROM node:8

RUN useradd --user-group --create-home --shell /bin/false app

ENV NPM_CONFIG_LOGLEVEL warn

RUN npm install pm2 -g

# TEMP: needed until official socket and redis packages are stable and published to npm
RUN npm install query-string -g
RUN npm install uws -g
RUN npm install jsonwebtoken -g
RUN npm install ioredis -g
RUN npm install bluebird -g

# Bundle app
COPY src src/
COPY package.json .
COPY ecosystem.config.js .

# Install app dependencies

RUN npm install --production

CMD [ "npm", "run", "dev"]