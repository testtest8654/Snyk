#!/bin/sh
docker rm -f web_artificial_university
docker build -t web_artificial_university .
docker run --name=web_artificial_university --rm -p1337:1337 -it web_artificial_university