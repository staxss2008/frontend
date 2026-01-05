# 使用Node.js基础镜像构建应用
FROM node:16-alpine as build-stage

WORKDIR /app
COPY package*.json ./
RUN npm ci

# 复制源代码并构建
COPY . .
RUN npx --yes vite build

# 使用nginx作为生产环境
FROM nginx:alpine as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# 创建nginx配置文件
RUN echo 'events { worker_connections 1024; }' > /etc/nginx/nginx.conf &&     echo 'http {' >> /etc/nginx/nginx.conf &&     echo '    include       /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf &&     echo '    default_type  application/octet-stream;' >> /etc/nginx/nginx.conf &&     echo '    log_format main '"'"'$remote_addr - $remote_user [$time_local] "$request" '"'"' >> /etc/nginx/nginx.conf &&     echo '                    '"'"'$status $body_bytes_sent "$http_referer" '"'"' >> /etc/nginx/nginx.conf &&     echo '                    '"'"'"$http_user_agent" "$http_x_forwarded_for"'"'"';' >> /etc/nginx/nginx.conf &&     echo '    access_log /var/log/nginx/access.log main;' >> /etc/nginx/nginx.conf &&     echo '    error_log /var/log/nginx/error.log;' >> /etc/nginx/nginx.conf &&     echo '    gzip on;' >> /etc/nginx/nginx.conf &&     echo '    gzip_vary on;' >> /etc/nginx/nginx.conf &&     echo '    gzip_min_length 1024;' >> /etc/nginx/nginx.conf &&     echo '    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;' >> /etc/nginx/nginx.conf &&     echo '    server {' >> /etc/nginx/nginx.conf &&     echo '        listen $PORT;' >> /etc/nginx/nginx.conf &&     echo '        server_name localhost;' >> /etc/nginx/nginx.conf &&     echo '        location / {' >> /etc/nginx/nginx.conf &&     echo '            root /usr/share/nginx/html;' >> /etc/nginx/nginx.conf &&     echo '            index index.html index.htm;' >> /etc/nginx/nginx.conf &&     echo '            try_files $uri $uri/ /index.html;' >> /etc/nginx/nginx.conf &&     echo '        }' >> /etc/nginx/nginx.conf &&     echo '        location /api/ {' >> /etc/nginx/nginx.conf &&     echo '            proxy_pass $BACKEND_URL/;' >> /etc/nginx/nginx.conf &&     echo '            proxy_set_header Host $host;' >> /etc/nginx/nginx.conf &&     echo '            proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/nginx.conf &&     echo '            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/nginx.conf &&     echo '            proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/nginx.conf &&     echo '        }' >> /etc/nginx/nginx.conf &&     echo '        error_page 500 502 503 504 /50x.html;' >> /etc/nginx/nginx.conf &&     echo '        location = /50x.html {' >> /etc/nginx/nginx.conf &&     echo '            root /usr/share/nginx/html;' >> /etc/nginx/nginx.conf &&     echo '        }' >> /etc/nginx/nginx.conf &&     echo '    }' >> /etc/nginx/nginx.conf &&     echo '}' >> /etc/nginx/nginx.conf

EXPOSE 80
CMD ["sh", "-c", "envsubst '$$PORT $$BACKEND_URL' < /etc/nginx/nginx.conf > /etc/nginx/nginx.conf.tmp && mv /etc/nginx/nginx.conf.tmp /etc/nginx/nginx.conf && nginx -g 'daemon off;'"]