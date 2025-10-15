FROM node:20.11-alpine AS build
WORKDIR /app
COPY frontend/webapp/package.json ./
RUN npm install
COPY frontend/webapp ./
RUN npm run build -- --configuration production

FROM nginx:1.25-alpine
COPY infra/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/webapp /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
