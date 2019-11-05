# short-link

建立/etc/short-link/config.json
```json
{
  "db": "mongodb://localhost:27017/sl",
  "apiPort": 3002,
  "uploadFoler": "/opt/short-link/upload",
  "username": "",
  "password": "",
  "debug": true,
  "jwtSecret": ""
}
```

## nginx配置

### 反向代理
/etc/nginx/sites-available/sl
```
location / {
    # First attempt to serve request as file, then
    # as directory, then fall back to displaying a 404.
    try_files $uri $uri/ /index.html =404;
}

location /api {
    proxy_pass http://127.0.0.1:3002/api;
    proxy_redirect off;
}

location ~ ^/(?!api.*).*$ {
    proxy_pass http://127.0.0.1:3002;
    proxy_redirect off;
}
```