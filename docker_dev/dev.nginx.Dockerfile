FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY docker_dev/nginx/nginx.dev.conf /etc/nginx/nginx.conf

EXPOSE 80