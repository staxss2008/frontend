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

# 创建nginx配置模板
RUN echo 'events { worker_connections 1024; }' > /etc/nginx/nginx.conf.template &&     echo 'http {' >> /etc/nginx/nginx.conf.template &&     echo '    include       /etc/nginx/mime.types;' >> /etc/nginx/nginx.conf.template &&     echo '    default_type  application/octet-stream;' >> /etc/nginx/nginx.conf.template &&     echo '    log_format main '"'"'$remote_addr - $remote_user [$time_local] "$request" '"'"' >> /etc/nginx/nginx.conf.template &&     echo '                    '"'"'$status $body_bytes_sent "$http_referer" '"'"' >> /etc/nginx/nginx.conf.template &&     echo '                    '"'"'"$http_user_agent" "$http_x_forwarded_for"'"'"';' >> /etc/nginx/nginx.conf.template &&     echo '    access_log /var/log/nginx/access.log main;' >> /etc/nginx/nginx.conf.template &&     echo '    error_log /var/log/nginx/error.log;' >> /etc/nginx/nginx.conf.template &&     echo '    gzip on;' >> /etc/nginx/nginx.conf.template &&     echo '    gzip_vary on;' >> /etc/nginx/nginx.conf.template &&     echo '    gzip_min_length 1024;' >> /etc/nginx/nginx.conf.template &&     echo '    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;' >> /etc/nginx/nginx.conf.template &&     echo '    server {' >> /etc/nginx/nginx.conf.template &&     echo '        listen $$PORT;' >> /etc/nginx/nginx.conf.template &&     echo '        server_name localhost;' >> /etc/nginx/nginx.conf.template &&     echo '        location / {' >> /etc/nginx/nginx.conf.template &&     echo '            root /usr/share/nginx/html;' >> /etc/nginx/nginx.conf.template &&     echo '            index index.html index.htm;' >> /etc/nginx/nginx.conf.template &&     echo '            try_files $uri $uri/ /index.html;' >> /etc/nginx/nginx.conf.template &&     echo '        }' >> /etc/nginx/nginx.conf.template &&     echo '        location /api/ {' >> /etc/nginx/nginx.conf.template &&     echo '            proxy_pass http://backend:8080/;' >> /etc/nginx/nginx.conf.template &&     echo '            proxy_set_header Host $host;' >> /etc/nginx/nginx.conf.template &&     echo '            proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/nginx.conf.template &&     echo '            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/nginx.conf.template &&     echo '            proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/nginx.conf.template &&     echo '        }' >> /etc/nginx/nginx.conf.template &&     echo '        error_page 500 502 503 504 /50x.html;' >> /etc/nginx/nginx.conf.template &&     echo '        location = /50x.html {' >> /etc/nginx/nginx.conf.template &&     echo '            root /usr/share/nginx/html;' >> /etc/nginx/nginx.conf.template &&     echo '        }' >> /etc/nginx/nginx.conf.template &&     echo '    }' >> /etc/nginx/nginx.conf.template &&     echo '}' >> /etc/nginx/nginx.conf.template

# 使用envsubst替换环境变量并启动nginx
CMD sh -c "envsubst '\$$PORT' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf && nginx -g 'daemon off;'"