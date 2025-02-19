FROM alpine:3.18.4

# Init
RUN apk update && \
    apk add --no-cache nodejs npm chromium && \
# Create user
    adduser -D -u 1000 challenge && \
    echo "challenge:$(head -c 32 /dev/urandom | base64)" | chpasswd;

# Copy flag
COPY ./flag.txt /flag.txt

# Copy chall data
WORKDIR /app/
COPY src/ .
RUN npm install;
RUN chmod -R 755 /app/;

# Switch user
USER 1000:1000

# Start
CMD ["node", "/app/app.js"]
