ARG TEMP_PACKAGES_DIR='/tmp/packages'
FROM node:lts-alpine as base

FROM base as dependencies
ARG TEMP_PACKAGES_DIR

COPY package.json .
COPY package-lock.json .

RUN npm install
RUN cp -R node_modules $TEMP_PACKAGES_DIR

FROM base as release
ARG TEMP_PACKAGES_DIR
WORKDIR /app
COPY --from=dependencies $TEMP_PACKAGES_DIR node_modules
COPY . ./

CMD ["npm", "start"]
