FROM python:3.12-slim

# Copy flag
COPY flag.txt /flag.txt

# Install necessary packages
RUN apt-get update && apt-get install -y \
    supervisor \
    bash \
    dbus \
    fonts-dejavu-core \
    xvfb \
    libstdc++6 \
    libasound2 \
    libnss3 \
    libnspr4 \
    libsqlite3-0 \
    libgl1-mesa-glx \
    bzip2 \
    libgtk-3-0 \
    gcc \
    g++ \
    make \
    libffi-dev \
    openssl \
    wget \
    file \
    pkg-config \
    zlib1g-dev \
    libssl-dev \
    libcurl4-openssl-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install curl
ENV CURL_VERSION=7.70.0
RUN wget https://curl.haxx.se/download/curl-${CURL_VERSION}.tar.gz && tar xfz curl-${CURL_VERSION}.tar.gz \
    && cd curl-${CURL_VERSION}/ && ./configure --with-ssl \
    && make -j 16 && make install

# Install a specific version of Firefox
ARG FIREFOX_VERSION=125.0.1
RUN curl -L "https://ftp.mozilla.org/pub/firefox/releases/${FIREFOX_VERSION}/linux-x86_64/en-US/firefox-${FIREFOX_VERSION}.tar.bz2" -o /tmp/firefox.tar.bz2 \
    && tar -xjf /tmp/firefox.tar.bz2 -C /opt/ \
    && chmod +x /opt/firefox/firefox \
    && rm /tmp/firefox.tar.bz2

# Set necessary environment variables
ENV LD_LIBRARY_PATH=/lib:/usr/lib:/usr/local/lib:/opt/firefox
ENV PATH=$PATH:/opt/firefox

# Install Geckodriver
ARG GECKODRIVER_VERSION=0.33.0
RUN curl -L "https://github.com/mozilla/geckodriver/releases/download/v${GECKODRIVER_VERSION}/geckodriver-v${GECKODRIVER_VERSION}-linux64.tar.gz" -o /tmp/geckodriver.tar.gz \
    && tar -xzf /tmp/geckodriver.tar.gz -C /usr/local/bin \
    && chmod +x /usr/local/bin/geckodriver \
    && rm /tmp/geckodriver.tar.gz

# Upgrade pip and setuptools
RUN python -m pip install --upgrade pip setuptools

# Setup app
RUN mkdir -p /app

# Switch working environment
WORKDIR /app/store

# Add application
COPY src/store .

# Install dependencies
RUN pip install -r requirements.txt

# Switch working environment
WORKDIR /app/product_api

# Add application
COPY src/product_api .

# Install dependencies
RUN pip install -r requirements.txt

# Setup supervisor
COPY conf/supervisord.conf /etc/supervisord.conf

# Expose port the server is reachable on
EXPOSE 1337

# Disable pycache
ENV PYTHONDONTWRITEBYTECODE=1

# Create database and start supervisord
COPY --chown=root entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
