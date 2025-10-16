# Stage 1 - build the Angular application
FROM node:20-alpine AS build

WORKDIR /app

COPY frontend/webapp/package.json frontend/webapp/package-lock.json ./
RUN npm ci

COPY frontend/webapp/ ./

RUN npm run build -- --configuration production

# Stage 2 - serve via nginx
FROM nginx:1.27-alpine AS production

RUN rm /etc/nginx/conf.d/default.conf
COPY frontend/webapp/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist/webapp/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
