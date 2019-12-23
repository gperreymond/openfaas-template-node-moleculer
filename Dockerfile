FROM openfaas/of-watchdog:0.7.2 as watchdog
FROM node:12.13.0-alpine as ship
MAINTAINER Gilles Perreymond <gperreymond@gmail.com>

# prepare openfaas
COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog
RUN apk --no-cache add curl ca-certificates && \
    addgroup -S app && \
    adduser -S -g app app

# prepare the destination
RUN mkdir -p /usr/app
WORKDIR /usr/app

# add source files
COPY . /usr/app

# root user used in docker:dind during CI, cf https://docs.npmjs.com/misc/config
RUN npm config set unsafe-perm true

# make the install in the container to avoid compilation problems
RUN yarn install --production && \
    yarn autoclean --init && \
    yarn autoclean --force

# chmod for tmp is for a buildkit issue (@alexellis)
RUN chown app:app -R /home/app && \
    chmod 777 /tmp

USER app

ENV cgi_headers="true"
ENV fprocess="node index.js"
EXPOSE 3000

HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]
