#!/bin/bash
docker build --tag=web_prying_eyes .
docker run -p 1337:1337 --rm --name=web_prying_eyes web_prying_eyes