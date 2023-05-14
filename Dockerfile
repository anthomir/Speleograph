
ARG NODE_VERSION=16.13.1

FROM node:${NODE_VERSION}-alpine as build
WORKDIR /opt

COPY package.json yarn.lock tsconfig.json tsconfig.compile.json .barrelsby.json ./

RUN yarn install --pure-lockfile


COPY ./src ./src
COPY ./dist ./dist
COPY ./public ./public

FROM node:${NODE_VERSION}-alpine as runtime
ENV WORKDIR /opt
WORKDIR $WORKDIR

RUN apk update && apk add build-base git curl
RUN npm install -g pm2

COPY --from=build /opt .

RUN yarn install --pure-lockfile --production

COPY ./views ./views
COPY processes.config.js .

EXPOSE 8083
ENV PORT 8083
ENV NODE_ENV production

CMD ["pm2-runtime", "start", "processes.config.js", "--env", "production"]
