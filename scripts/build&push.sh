#!/bin/bash

BUILD_TAG=$(cat package.json | jq .version --raw-output)

# build
docker build -t gperreymond/openfaas-node-moleculer:$BUILD_TAG .
docker tag  gperreymond/openfaas-node-moleculer:$BUILD_TAG  gperreymond/openfaas-node-moleculer:latest

# push
docker push gperreymond/openfaas-node-moleculer:$BUILD_TAG
docker push gperreymond/openfaas-node-moleculer:latest
