FROM node:22-alpine AS base
WORKDIR /app

COPY package*.json ./

FROM base AS deps
RUN npm install

FROM deps AS dev
ENV NODE_ENV=development
ENV CHOKIDAR_USEPOLLING=true
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

FROM deps AS build
ARG REACT_APP_API_URL=http://localhost:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS stage
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
