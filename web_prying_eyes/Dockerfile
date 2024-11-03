FROM node:18-bullseye-slim

# Install packages
RUN apt update \
    && apt install -y wget pkg-config build-essential unzip libpng-dev libjpeg-dev libavif-dev libheif-dev supervisor \
    && wget https://github.com/ImageMagick/ImageMagick/archive/refs/tags/7.1.0-33.zip -O /tmp/ImageMagick-7.1.0-33.zip \
    && cd /tmp \
    && unzip ImageMagick-7.1.0-33.zip \
    && cd ImageMagick-7.1.0-33 \
    && ./configure \
    && make -j $(nproc) \
    && make install \
    && ldconfig /usr/local/lib \
    && rm -rf /var/lib/apt/lists/* /tmp/ImageMagick-7.1.0-33

# Setup supervisor
COPY ./config/supervisord.conf /etc/supervisor/supervisord.conf

# Install node application
USER node

# Create directory
RUN mkdir /home/node/app

# Switch working directory
WORKDIR /home/node/app

# Copy challenge files
COPY --chown=node:node ./challenge/ .

# Install node dependencies
RUN npm install

# Expose Node application
EXPOSE 8000

# Switch back to root
USER root

# Start supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]