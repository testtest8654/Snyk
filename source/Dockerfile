FROM php:apache

WORKDIR /var/www/html

# Install dependencies
RUN apt-get update
RUN apt-get install -y git zip 
RUN apt-get clean
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Configuration
RUN sed -i 's#DocumentRoot .*#DocumentRoot /var/www/html/public#' /etc/apache2/sites-available/000-default.conf
RUN echo 'SetEnv CI_ENV production' >> /etc/apache2/sites-available/000-default.conf
RUN rm /usr/local/lib/php/*cmd.php

# Change Apache to listen on port 8000
RUN sed -i 's/Listen 80/Listen 8000/' /etc/apache2/ports.conf
RUN sed -i 's/<VirtualHost \*:80>/<VirtualHost *:8000>/' /etc/apache2/sites-available/000-default.conf

COPY src .
# Generate source download
RUN mkdir -p application/cache
RUN mkdir /tmp/source
RUN cp -r . /tmp/source/src
COPY Dockerfile /tmp/source/
RUN cd /tmp && zip -r $(cd -)/public/source.zip source
RUN rm -r /tmp/source
# Install
RUN composer install
RUN chown -R www-data:www-data application/cache || true

# Optimize views
RUN sed -i ':a;N;$!ba;s/\n//g' application/views/*
RUN sed -i 's/>\s*</></g' application/views/*

# Expose the new port
EXPOSE 8000

CMD ["apache2-foreground"]
