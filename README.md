[![Moleculer logo](./banner-moleculer.png)](https://moleculer.services/)

## Serverless Functions, Made Simple

[OpenFaaS®](https://www.openfaas.com/) makes it simple to deploy both functions and existing code to Kubernetes.

[![CircleCI](https://circleci.com/gh/gperreymond/openfaas-template-node-moleculer.svg?style=shield)](https://circleci.com/gh/gperreymond/openfaas-template-node-moleculer) [![Coverage Status](https://coveralls.io/repos/github/gperreymond/openfaas-template-node-moleculer/badge.svg?branch=master)](https://coveralls.io/github/gperreymond/openfaas-template-node-moleculer?branch=master) [![Docker](https://img.shields.io/badge/docker-ready-blue)](https://hub.docker.com/repository/docker/gperreymond/openfaas-node-moleculer)

## Features

* moleculer: 0.14.0-beta6
* moleculer-web: 0.8.5

## Environment vars

* APP_RABBITMQ_URI: amqp://username:password@localhost:5672 (default)
* APP_RABBITMQ_PREFETCH: 1 (default)
* APP_MOLECULER_LOGGER: true (default)
* APP_MOLECULER_METRICS: true (default)

I choose rabbitmq as broker, over nats ; Because of prefetch, the webui admin, the replay, the deadletter, etc.  
Usually I take nats but not this time!

## Architecture

![Global schema](./global-schema.png)

## Mandatory knowledge

* First you need to know how works openfass
* Second you need to know how work moleculer and moculer-web

Configuration of moleculer with services:

```js
// Load all domains as services
await broker.loadServices()
```

Configuration of moculer-web service:

```js
// Load API Gateway
broker.createService({
  mixins: [ApiService],
  settings: {
    path: '/',
    routes: [{
      mappingPolicy: 'restrict',
      mergeParams: true,
      aliases
    }]
  }
})
```

## Dummy service as faas

* Create a dummy service with two actions
* Open two routes from moleculer gateway, who match the two actions
* Create the dockerfile
* Create the openfaas deployment

### Create a dummy service with two actions  

```js
/**
filename: dummy.service.js
**/
module.exports = {
  name: 'Dummy',
  actions: {
    HelloWorldCommand: require('./actions/HelloWorldCommand'),
    NotHelloWorldQuery: require('./actions/NotHelloWorldQuery')
  }
}
```

### Open two routes from moleculer gateway, who match the two actions  

Property __metadata.aliases__ is from __moleculer-web__, it will expose the actions you want.


```js
/**
filename: dummy.service.js
**/
module.exports = {
  name: 'Dummy',
  metadata: {
    aliases: {
      'POST dummy/hello-world': [
        'Dummy.HelloWorldCommand'
      ],
      'GET dummy/not-hello-world': 'Dummy.NotHelloWorldQuery'
    }
  },
  actions: {
    HelloWorldCommand: require('./actions/HelloWorldCommand'),
    NotHelloWorldQuery: require('./actions/NotHelloWorldQuery')
  }
}
```

### Create the dockerfile  

A very simple thing to do, because moleculer is configure to load all services in __services__ directory, just do this:

```sh
# Dockerfile
FROM gperreymond/openfaas-node-moleculer
COPY . services
```

### Create the openfaas deployment  

```yaml
# stack.yaml
version: 1.0

provider:
  name: openfaas
  gateway: [url of the openfass admin]

functions:
  dummy-service:
    lang: dockerfile
    image: [docker hub image name]
    handler: [path of you service in the repository]
    # some env to overwrite
    environment:
      APP_RABBITMQ_URI: amqp://admin:password@rabbitmq.docker.localhost:5672
      APP_RABBITMQ_PREFETCH: 2
    # mandatory for blue/green
    annotations:
      com.openfaas.health.http.path: "/hc"
      com.openfaas.health.http.initialDelay: "30s"
```

## Final directory architecture

```sh
[dummy]
   [actions]
      HelloWorldCommand.js
      NotHelloWorldQuery.js
   .dockerignore
   Dockerfile
   dummy.service.js

stack.yaml
```
