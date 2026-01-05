# 使用Node.js基础镜像构建应用
FROM node:16-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install

# 复制源代码并构建
COPY . .
RUN chmod +x node_modules/.bin/vite && npm run build

# 使用nginx作为生产环境
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

# 创建启动脚本
RUN echo '#!/bin/sh' > /docker-entrypoint.sh &&     echo 'if [ -z "$PORT" ]; then' >> /docker-entrypoint.sh &&     echo '  PORT=8080' >> /docker-entrypoint.sh &&     echo 'fi' >> /docker-entrypoint.sh &&     echo 'sed -i "s/listen 80;/listen $PORT;/g" /etc/nginx/nginx.conf' >> /docker-entrypoint.sh &&     echo 'exec nginx -g "daemon off;"' >> /docker-entrypoint.sh &&     chmod +x /docker-entrypoint.sh

# 使用启动脚本
CMD ["/docker-entrypoint.sh"]