---
layout: post
title: Useful Nginx Server Blocks
date: 2018-04-24 11:00:00 +01:00
modify_date: 2018-06-22 11:00:00 +01:00
tags: linux nginx serverblocks server http https proxy ssl certificates reverseproxy
category: tutorial
---

In the past weeks I set up some different webservers with [Nginx](http://nginx.org). Nginx is more leightweight and easy to handle than [Apache2](https://httpd.apache.org).

There are alot of different usages for webservers. Some are reverse proxy, https, static sites, clouds or php. In this article I wanna share my experiences with different server blocks for some of these cases. It's basically more a little wiki.<!--more-->

## Redirect www to non-www Traffic

This solution works for __any__ subdomain. You can also adjust the `server_names` to redirect from non-www to www Traffic.

```nginx
#redirect all www to non-www Traffic
server {
    listen 443 ssl;
    listen [::]:443 ssl;

    server_name www.example.com;

    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/certificate.pem;

    return 301 https://example.com$request_uri;
}
```

## Redirect Http to Https Traffic

```nginx
#redirect all http to https Traffic
server {
    listen 80;
    listen [::]:80;

    #the underscore is a wildcard for every server name
    server_name _;

    return 301 https://$host$request_uri;
}
```

## SSL Optimization

This server block is 90% based on [this article](https://bjornjohansen.no/optimizing-https-nginx) about optimizing your https server block. It also explains what every line is doing.

```nginx
ssl on;

ssl_session_cache shared:SSL:20m;
ssl_session_timeout 120m;

ssl_protocols TLSv1 TLSv1.1 TLSv1.2;

add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

ssl_prefer_server_ciphers on;
ssl_ciphers ECDH+AESGCM:ECDH+AES256:ECDH+AES128:DHE+AES128:!ADH:!AECDH:!MD5;

ssl_dhparam /etc/nginx/cert/dhparam.pem;

ssl_stapling on;
ssl_stapling_verify on;
```

## Serving Static Files with SSL

```nginx
server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;

    server_name example.com;

    #include ssl custom settings for more safety and faster loading
    #optional (see chapter 'SSL optimization')
    #include /path/to/ssl/optimization.conf;

    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/certificate.pem;

    #path to root directory for your files
    root /var/www/homepage;

    #paths for custom index and error pages. (optional)
    #error_page 404 404.html;
    #index index.html;

    #deny all requests for any access files
    location ~ /\.ht {
        deny all;
    }

    #try to serve files, otherwise show 404 page
    location / {
        try_files $uri $uri/ =404;
    }
}
```

## Reverse Proxy for large File-Transfer

I struggled alot when using a reverse proxy for large file transfers for example when setting up a cloud (like [NextCloud](https://nextcloud.com)) behind a reverse proxy.  
These are my recommended settings which caused the least problems.

```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name example.com;

    #include ssl custom settings for more safety and faster loading
    #optional (see chapter 'SSL optimization')
    #include /path/to/ssl/optimization.conf;

    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/certificate.pem;

    #zero mean unlimited. you can upload any filesize you want
    client_max_body_size 0;
    underscores_in_headers on;

    location ~ {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection $http_connection;
        proxy_set_header Accept-Encoding "";
        proxy_set_header Proxy_Connection $http_connection;
        
        resolver 8.8.8.8;
        
        proxy_headers_hash_max_size 512;
        proxy_headers_hash_bucket_size 64;

        add_header Front-End-Https on;
        proxy_redirect off;
        proxy_buffering off;
        proxy_max_temp_file_size 0;

        proxy_pass http://domaintopass.com;
    }
}
```
