#!/bin/bash
# Secure entrypoint
chmod 600 /entrypoint.sh

# Populate admin and session secret env
echo "ENGINEER_USERNAME=engineer" > /app/services/web/.env
echo "ENGINEER_PASSWORD=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 32 | head -n 1)" >> /app/services/web/.env
chown www-data:www-data /app/services/web/.env

/usr/bin/supervisord -c /etc/supervisord.conf