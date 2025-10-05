FROM node:22 AS build

WORKDIR /code

# Install dependencies before compiling the code.
COPY package.json package-lock.json tsconfig.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/common/tsconfig.json ./packages/common/
COPY packages/api-server/package.json ./packages/api-server/
COPY packages/api-server/tsconfig.json ./packages/api-server/

RUN npm ci

COPY packages/common/src/ ./packages/common/src/
RUN npm run build --workspace @radioterio/common

COPY packages/api-server/src/ ./packages/api-server/src/
RUN npm run build --workspace @radioterio/api-server

RUN npm prune --production


FROM node:22 AS start

ARG BUILD
ENV BUILD=${BUILD}

WORKDIR /code

COPY --from=build /code/node_modules/ ./node_modules/
COPY --from=build /code/packages/common/lib/ ./packages/common/lib/
COPY --from=build /code/packages/common/package.json ./packages/common/

COPY --from=build /code/packages/api-server/dist/ ./packages/api-server/dist/
COPY --from=build /code/packages/api-server/package.json ./packages/api-server/

WORKDIR /code/packages/api-server/dist

CMD ["node", "--enable-source-maps", "./index.js"]
