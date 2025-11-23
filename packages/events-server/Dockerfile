FROM node:22 AS build

WORKDIR /code

# Install dependencies before compiling the code.
COPY package.json package-lock.json tsconfig.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/common/tsconfig.json ./packages/common/
COPY packages/events-server/package.json ./packages/events-server/
COPY packages/events-server/tsconfig.json ./packages/events-server/

RUN npm ci

COPY packages/common/src/ ./packages/common/src/
RUN npm run build --workspace @radioterio/common

COPY packages/events-server/src/ ./packages/events-server/src/
RUN npm run build --workspace @radioterio/events-server

RUN npm prune --production


FROM node:22 AS start

ARG BUILD
ENV BUILD=${BUILD}

WORKDIR /code

COPY --from=build /code/node_modules/ ./node_modules/
COPY --from=build /code/packages/common/lib/ ./packages/common/lib/
COPY --from=build /code/packages/common/package.json ./packages/common/

COPY --from=build /code/packages/events-server/dist/ ./packages/events-server/dist/
COPY --from=build /code/packages/events-server/package.json ./packages/events-server/

WORKDIR /code/packages/events-server/dist

CMD ["node", "--enable-source-maps", "./index.js"]

