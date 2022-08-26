# base stage
FROM node:16.17-alpine AS base
WORKDIR /app
COPY package*.json /
EXPOSE 3000

# development stage
# in compose we will use bind mounts
# there will be no need to install packages
# or to run any start script
FROM base AS dev-bind
ENV NODE_ENV=development
# RUN yarn global add nodemon && yarn install
# COPY . / 
# CMD ["yarn", "start:dev"]

# development stage
FROM base AS dev
ENV NODE_ENV=development
RUN yarn global add nodemon && yarn install
COPY . / 
CMD ["yarn", "start:dev"]

# production stage
FROM base AS production
ENV NODE_ENV=production
RUN npm ci
COPY . /
CMD ["node" , "index.js"]
