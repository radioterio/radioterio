#!/bin/bash
set -e

docker build -t radioterio-rtmp-encoder-dev \
             --build-arg USER="$(id -u):$(id -g)" \
             -f Dockerfile \
             --target devenv-cef .

mkdir -p .cargo-cache/git
mkdir -p .cargo-cache/registry
mkdir -p target

docker run --rm -it \
                --name radioterio-rtmp-encoder-dev \
                -v "$(pwd)/.cargo-cache/git":/rust/.cargo/git \
                -v "$(pwd)/.cargo-cache/registry":/rust/.cargo/registry \
                -v "$(pwd):"/code radioterio-rtmp-encoder-dev
                bash -c "export HOME=/rust && source /rust/.cargo/env && exec bash"
