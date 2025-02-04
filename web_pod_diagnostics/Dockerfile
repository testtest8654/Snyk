FROM python:3.11.2-bullseye

# Install latest chrome dev package and fonts to support major charsets (Chinese, Japanese, Arabic, Hebrew, Thai and a few others)
# Note: this installs the necessary libs to make the bundled version of Chromium that Puppeteer
# installs, work.
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
    && apt-get update \
    && apt-get install -y google-chrome-stable fonts-ipafont-gothic fonts-wqy-zenhei fonts-thai-tlwg fonts-kacst fonts-freefont-ttf libxss1 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install Node & other packages
RUN apt update \
    && wget -q -O - https://deb.nodesource.com/setup_18.x | bash - \
    && apt -y install supervisor nodejs gcc nginx \
    && rm -rf /var/lib/apt/lists/* 

# Setup Nginx
COPY conf/nginx.conf /etc/nginx/nginx.conf
RUN mkdir /var/run/nginx && chown www-data:www-data /var/run/nginx

# Setup Node applications
RUN mkdir -p /app/services/pdf /app/services/stats

COPY challenge/pdf/package.json /app/services/pdf/package.json
RUN cd /app/services/pdf && npm install

COPY challenge/stats/package.json /app/services/stats/package.json
RUN cd /app/services/stats && npm install

# Install Python requirements
COPY conf/requirements.txt /root/requirements.txt

RUN pip install -r /root/requirements.txt \
    && rm /root/requirements.txt

# Disable buffered Python & pycache
ENV PYTHONUNBUFFERED=TRUE
ENV PYTHONDONTWRITEBYTECODE=1

# Setup flag
COPY conf/flag /flag
COPY conf/readflag.c /root/readflag.c

RUN gcc /root/readflag.c -o /readflag \
    && chown root:root /readflag \
    && chmod +s /readflag \
    && rm /root/readflag.c \
    && chmod 400 /flag

# Setup configs
COPY conf/supervisord.conf /etc/supervisor/supervisord.conf

# Copy application files
COPY challenge/web /app/services/web
COPY challenge/stats/*.js /app/services/stats/
COPY challenge/pdf/*.js /app/services/pdf/

# Create reports directory
RUN mkdir -p /app/services/web/reports

# Setup superivsord
COPY conf/supervisord.conf /etc/supervisord.conf

# Expose nginx
EXPOSE 80

# Populate database and start supervisord
COPY --chown=root ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT /entrypoint.sh