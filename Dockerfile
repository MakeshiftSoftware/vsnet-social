FROM node:alpine

RUN yarn global add nodemon

EXPOSE 3000

WORKDIR /app

# Bundle app
COPY src src/
COPY package.json .
COPY yarn.lock .

# Install app dependencies
RUN yarn install --production

CMD [ "yarn", "run", "dev"]