FROM node:22 AS build

WORKDIR /code

# Install dependencies before compiling the code.
COPY package.json package-lock.json tsconfig.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/common/tsconfig.json ./packages/common/
COPY packages/playback-server/package.json ./packages/playback-server/
COPY packages/playback-server/tsconfig.json ./packages/playback-server/

RUN npm ci

COPY packages/common/src/ ./packages/common/src/
RUN npm run build --workspace @radioterio/common

COPY packages/playback-server/src/ ./packages/playback-server/src/
RUN npm run build --workspace @radioterio/playback-server

RUN npm prune --production


FROM node:22 AS start

ARG BUILD
ENV BUILD=${BUILD}

COPY --from=mwader/static-ffmpeg:8.0 /ffmpeg /usr/local/bin/

WORKDIR /code

COPY --from=build /code/node_modules/ ./node_modules/
COPY --from=build /code/packages/common/lib/ ./packages/common/lib/
COPY --from=build /code/packages/common/package.json ./packages/common/

COPY --from=build /code/packages/playback-server/dist/ ./packages/playback-server/dist/
COPY --from=build /code/packages/playback-server/package.json ./packages/playback-server/

WORKDIR /code/packages/playback-server/dist

CMD ["node", "--enable-source-maps", "./index.js"]
