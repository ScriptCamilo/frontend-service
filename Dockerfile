ARG NODE_VERSION=14

# DEVELOPMENT
FROM node:${NODE_VERSION}-alpine as dev
WORKDIR /app
COPY package*.json .
RUN apk add git
RUN npm ci
COPY . .
CMD [ "npm", "run", "dev" ]

# BUILD
FROM dev as build
WORKDIR /app
USER root
RUN npm run build

# PRODUCTION
FROM nginx:stable-alpine
USER node
COPY --from=build /app/build /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
