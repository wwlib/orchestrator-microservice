FROM node:14-buster-slim

ARG BUILD_DIR="/usr/app"
ARG CONTAINER_USER="node"
ARG CONTAINER_EXPOSE_PORT="8000"

WORKDIR $BUILD_DIR
RUN chown -R $CONTAINER_USER:$CONTAINER_USER $BUILD_DIR
USER $CONTAINER_USER

COPY --chown=${CONTAINER_USER} . .

RUN npm install
RUN ./node_modules/.bin/bf config:set:telemetry -d
ENV BF_CLI_TELEMETRY=false
RUN chmod +x ./orchestrator-files/downloadModel.sh
RUN chmod +x ./orchestrator-files/generateSnapshots.sh
RUN ./orchestrator-files/downloadModel.sh
RUN ./orchestrator-files/generateSnapshots.sh
RUN npm run build

CMD ["node", "./dist/index.js"]
