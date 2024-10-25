#!/bin/bash
docker rm -f web_felonious_forums
docker build -t web_felonious_forums .
docker run --name=web_felonious_forums --rm -p1337:1337 -it web_felonious_forums
