FROM php:8.2-apache

# Рабочая директория
WORKDIR /var/www/html

# Копируем все файлы в веб-корень
COPY . /var/www/html

# (по желанию) включаем mod_rewrite
RUN a2enmod rewrite
