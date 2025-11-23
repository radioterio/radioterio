FROM node:22 AS build

WORKDIR /code

# Install dependencies before compiling the code.
COPY package.json package-lock.json tsconfig.json ./
COPY packages/common/package.json ./packages/common/
COPY packages/common/tsconfig.json ./packages/common/
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/frontend/tsconfig.json ./packages/frontend/
COPY packages/frontend/next.config.ts ./packages/frontend/
COPY packages/frontend/tailwind.config.js ./packages/frontend/
COPY packages/frontend/postcss.config.mjs ./packages/frontend/

RUN npm ci

COPY packages/common/src/ ./packages/common/src/
RUN npm run build --workspace @radioterio/common

COPY packages/frontend/src/ ./packages/frontend/src/
COPY packages/frontend/public/ ./packages/frontend/public/
RUN npm run build --workspace @radioterio/frontend


FROM node:22 AS start

ARG BUILD
ENV BUILD=${BUILD}
ENV NODE_ENV=production

WORKDIR /code

COPY --from=build /code/node_modules/ ./node_modules/
COPY --from=build /code/packages/common/lib/ ./packages/common/lib/
COPY --from=build /code/packages/common/package.json ./packages/common/

COPY --from=build /code/packages/frontend/.next/ ./packages/frontend/.next/
COPY --from=build /code/packages/frontend/public/ ./packages/frontend/public/
COPY --from=build /code/packages/frontend/package.json ./packages/frontend/
COPY --from=build /code/packages/frontend/next.config.ts ./packages/frontend/

WORKDIR /code/packages/frontend

EXPOSE 3000

CMD ["npm", "start"]

