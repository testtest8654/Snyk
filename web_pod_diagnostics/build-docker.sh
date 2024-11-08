#!/bin/bash
export DOCKER_HOST="ssh://root@178.62.64.69"
docker build --tag=web_pod_diagnostics .
docker run -it -p 1337:80 --rm --name=web_pod_diagnostics web_pod_diagnostics

