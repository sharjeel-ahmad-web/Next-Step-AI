# Backend (Laravel) Dockerfile
FROM php:8.2-fpm

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    locales \
    zip \
    libzip-dev \
    git \
    curl \
    libonig-dev \
    sqlite3 \
    libsqlite3-dev \
    libmagickwand-dev \
    && rm -rf /var/lib/apt/lists*

# Install PHP extensions
RUN docker-php-ext-install pdo_sqlite pdo_mysql mbstring exif pcntl bcmath gd zip

# Install ImageMagick and Imagick extension for PDF/image generation
RUN apt-get update && apt-get install -y libssl-dev && rm -rf /var/lib/apt/lists/* && \
    pecl install imagick && \
    docker-php-ext-enable imagick && \
    pecl install mongodb && \
    docker-php-ext-enable mongodb || true

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application files
COPY composer.json /app/

# Install PHP dependencies (ignore MongoDB extension requirement if not available)
RUN composer install --no-interaction --optimize-autoloader --ignore-platform-req=ext-mongodb

# Copy the rest of application
COPY . /app/

# Create necessary directories and set permissions
RUN mkdir -p /app/storage/logs \
    && chmod -R 755 /app/storage \
    && chmod -R 755 /app/bootstrap/cache \
    && chown -R www-data:www-data /app

# Generate app key if not exists
RUN php artisan key:generate --force || true

# Expose port (for reference, actual port is configured in docker-compose)
EXPOSE 8000

# Run Laravel application
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]
