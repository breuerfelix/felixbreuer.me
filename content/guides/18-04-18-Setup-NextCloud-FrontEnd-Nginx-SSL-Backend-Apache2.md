---
layout: post
title: Setup NextCloud Server with Nginx SSL Reverse-Proxy and Apache2 Backend
date: 2018-04-18 17:00:00 +01:00
modify_date: 2018-04-24 11:00:00 +01:00
tags: nextcloud server ubuntu16.04 setup apache2 nginx reverseproxy ssl linux
category: tutorial
---

In the next few chapters we gonna setup a [NextCloud](https://nextcloud.com) Server from scratch.  
There are alot of tutorials out there already covering this topic, but in our case we gonna use [Nginx](http://nginx.org) to serve the SSL-Certificates and proxy the connection to an [Apache2](https://httpd.apache.org) service which is serving NextCloud.  
You can either use an existing Nginx configuration or follow the guide and deploy a new one.<!--more-->

The Linux-Distribution doesn't really matter if you are a little familiar with it, but we going to use Ubuntu Server 16.04 LTS.  
For the purposes of this tutorial we gonna set up NextCloud under the Domain __"https://cloud.example.com/"__.  
Even though this is a step by step tutorial, it is always possible to skip some parts if you already configured them.

# Installing NextCloud
There are two ways of installing NextCloud.  
The first one is the fully automated option using 'snap' packages.  
I don't recommend doing it this way because you dont have control over everything you wanna do.  
Especially in a custom setup like ours, it is always better to do everything by yourself.

## 'snap' Install
Anyways, if you are a lazy person and want to take that risk... Lets's go!  
If not already installed, install the `snap` package manager:
```bash
$ sudo apt-get install snapd
```
Get the NextCloud snap package:
```bash
$ sudo snap install nextcloud
```
Install NextCloud:
```bash
$ sudo nextcloud.manual-install replace_with_admin_username replace_with_admin_password
```

## Manual Install
In this chapter we are going through the installation step by step.  
First of all we need to install all dependencies. Don't be scared... these are alot but only small ones.
```bash
$ sudo apt-get update
$ sudo apt-get upgrade
$ sudo apt-get install apache2 libapache2-mod-php7.0 bzip2
$ sudo apt-get install php7.0-gd php7.0-json php7.0-mysql php7.0-curl php7.0-mbstring
$ sudo apt-get install php7.0-intl php7.0-mcrypt php-imagick php7.0-xml php7.0-zip
```
### SQL Database
NextCloud is recommending [MariaDB](https://mariadb.org) as the database software so let's install and configure it:
```bash
$ sudo apt-get install mariadb-server php-mysql
```
MariaDB won't set up any password for the `root` user. Even though it's only possible to access the database via `sudo` command so it doesn't really matter.  
Enter the database:
```bash
$ sudo mysql -u root
```
Create a database for NextCloud:
```sql
# CREATE DATABASE nextcloud;
```
Create a user for NextCloud:
```sql
# CREATE USER 'replace_with_username'@'localhost' IDENTIFIED BY 'replace_with_password';
```
Last step is to give the newly created user all privilegies for the new database:
```sql
# GRANT ALL PRIVILEGES ON nextcloud.* TO 'replace_with_username'@'localhost';
# FLUSH PRIVILEGES;
```
Press __CTRL + D__ to exit the mysql database.

### NextCloud Files

Download NextCloud-13 Files:
```bash
$ cd /var/www
$ sudo wget https://download.nextcloud.com/server/releases/latest-13.tar.bz2 -O nextcloud-13-latest.tar.bz2
```
Extract the archiv:
```bash
$ sudo tar -xvjf nextcloud-13-latest.tar.bz2
```
Grant the permissions recursivly and remove the downloaded archiv:
```bash
$ sudo chown -R www-data:www-data nextcloud
$ sudo rm nextcloud-13-latest.tar.bz2
```

# Configuring
The order in configuring all parts is irrelevant but if we do it in my way, we can test each step more efficiently.

## Apache2
We will configure Apache to handle only localhost connections via http traffic.  
It will serve NextCloud on the backend. This is really comfortable because we dont have to worry about Https-Traffic or SSL-Certs over here.

First of all we have to make sure the Apache service isn't listening on port 80 or 443. Nginx will do that in the future.  
We will change these ports to 8080 or 4443.
Edit the __/etc/apache2/ports.conf__ for listening on another port:  
```bash
$ cd /etc/apache2
$ sudo vi ports.conf
```
Change `Listen 80` to `Listen 8080`.  
Save and close the File.

Now we gonna create a new Virtual-Host file for NextCloud:
```bash
$ cd /etc/apache2/sites-available
$ sudo touch nextcloud.conf
$ sudo vi nextcloud.conf
```
Paste in the following content:
```apache
<VirtualHost 127.0.0.1:8080>
    Alias /nextcloud "/var/www/nextcloud/"

    <Directory /var/www/nextcloud/>
        Options +FollowSymlinks
        AllowOverride All

        <IfModule mod_dav.c>
            Dav off
        </IfModule>

        SetEnv HOME /var/www/nextcloud
        SetEnv HTTP_HOME /var/www/nextcloud
    </Directory>

    ErrorLog /var/log/apache2/nextcloud-error_log
    CustomLog /var/log/apache2/nextcloud-access_log common
</VirtualHost>
```
Enable the new host file and some mods NextCloud needs:
```bash
$ sudo a2ensite nextcloud
$ sudo a2enmod rewrite headers env dir mime
```
We can disable the default Apache site because Nginx is going to handle this. This will avoid problems between Apache and Nginx:
```bash
$ sudo a2dissite 000-default
```
Restart Apache:
```bash
$ sudo service apache2 restart
```

## Nginx
Nginx will be our 'Connection-Resolver'. Whenever an http or https request is made to our server, Nginx will decide what to do with it.  
We are going to set up a Server-Block, listening on port 443 and url "https://cloud.example.com/", for the https-reverse-proxy to our NextCloud Apache service.  
If you want to see some more useful Server-Block examples, [Click Here!](/tutorial/Nginx-Server-Blocks.html)

Install Nginx:
```bash
$ sudo apt-get install nginx
```
_Optional:_ I recommend setting up a firewall. [Click Here!](https://www.digitalocean.com/community/tutorials/how-to-set-up-a-firewall-with-ufw-on-ubuntu-16-04)  
Modify the Firewall (if installed):
```bash
$ sudo ufw allow 'Nginx Full'
```
Create a Server-Block file for NextCloud:
```bash
$ cd /etc/nginx/sites-available
$ sudo touch nextcloud
$ sudo vi nextcloud
```
Paste in the following content:
```nginx
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;

    server_name cloud.example.com;

    client_max_body_size 0;
    underscores_in_headers on;

    location ~ {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Front-End-Https on;

        proxy_headers_hash_max_size 512;
        proxy_headers_hash_bucket_size 64;

        proxy_buffering off;
        proxy_redirect off;
        proxy_max_temp_file_size 0;
        proxy_pass http://127.0.0.1:8080;
    }
}
```
Enable 'nextcloud' Server-Block:
```bash
$ sudo ln -s /etc/nginx/sites-available/nextcloud /etc/nginx/sites-enabled/
```
Test the configuration file.  
If the output doesn't display that the files are okay, check if you made a syntax or spelling mistake.
```bash
$ sudo nginx -t
```

_Optional:_ If you want to upload large files you should also increase the proxy-timeout settings in __/etc/nginx/nginx.conf__.  
Add the following lines anywhere in the `http {}` block:
```nginx
proxy_connect_timeout 1000;
proxy_send_timeout 1000;
proxy_read_timeout 1000;
send_timeout 1000;
```
Restart Nginx service:
```bash
$ sudo service nginx restart
```

### SSL-Certificates
There are alot of tutorials out there covering that topic.  
You can either use self-signed certificates or let Let's Enctypt handle that for you.
We will roughly go through this chapter but if you want to have more overview just look at [Digital Ocean's Article](https://www.digitalocean.com/community/tutorials/how-to-set-up-let-s-encrypt-with-nginx-server-blocks-on-ubuntu-16-04) about setting up Nginx with Let's Encrypt.

Install Certbot:
```bash
$ sudo add-apt-repository ppa:certbot/certbot
$ sudo apt-get update
$ sudo apt-get install python-certbot-nginx
```
Make sure your Nginx configuration works and is set up with the correct `server_name`.  
Certbot will scan all of Nginx's server blocks and searches for your domain name. The certificates then will be added to that configuration file automaticly.

Obtaining cerificates:
```bash
$ sudo certbot --nginx -d cloud.example.com
```
During this process we will be asked if Certbot should also redirect all Http traffic to Https.  
I recommend doing it on your own for example by checking out my Server-Block Examples (_coming soon_).  
Otherwise just press '2' and Certbot will handle that for us.

#### Renewing Certificates
To renew the certificates when they are expired we can simply type:
```bash
$ sudo certbot renew
```
As a lazy person I would highly suggest to set up a `crontab job' which runs this command every month.

### Optimizing SSL Nginx Settings

There is a really good guide how to customize your Nginx SSL-Settings to score an 'A+' on several Testsites.  
This step is optional and can be done later on if you are interested in that kind of stuff.  
[Useful Server-Blocks](/tutorial/Nginx-Server-Blocks.html)  
[External Arcticle](https://bjornjohansen.no/optimizing-https-nginx)

## Nextcloud
You can already access NextCloud via your domain, but it will be a little bit buggy.  
NextCloud still thinks that it's been hosted on `127.0.0.1`. This will break some forwarding.

To change these settings we have to edit the `config.php`file of NextCloud.  
Open __/var/www/nextcloud/config/config.php__:
```bash
$ cd /var/www/nextcloud/config
$ sudo vi config.php
```
Insert or edit the following lines:
```php
'trusted_domains' =>
array (
    0 => '127.0.0.1:8080',
    1 => 'cloud.example.com',
),
'overwritehost' => 'cloud.example.com',
'overwriteprotocol' => 'https',
'overwritewebroot' => '/',
'overwrite.cli.url' => 'https://cloud.example.com/',
'htaccess.RewriteBase' => '/',
'trusted_proxies' => ['127.0.0.1'],
```
Save and close the file.

Browse to __https://cloud.example.com/__ and finish the guided setup.  
You have to enter the admin account details you want to use and the SQL user. password and database name we created in the tutorial.  
After submitting these infos NextCloud is ready to use.