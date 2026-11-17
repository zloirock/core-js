FROM node:26.13.0-bookworm-slim AS build
WORKDIR /app
COPY . .
RUN cp packages/core-js/package.tpl.json packages/core-js/package.json \
 && cp packages/core-js-pure/package.tpl.json packages/core-js-pure/package.json \
 && cp packages/core-js-types/package.tpl.json packages/core-js-types/package.json \
 && npm ci --no-audit --no-fund \
 && npm run prepare

FROM build AS dependencies
RUN npm ci --omit=dev --workspace=@core-js/service-container --ignore-scripts --no-audit --no-fund

FROM node:26.13.0-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/core-js/package.json /app/packages/core-js/LICENSE ./packages/core-js/
COPY --from=dependencies /app/packages/core-js/modules ./packages/core-js/modules
COPY --from=dependencies /app/packages/core-js/internals ./packages/core-js/internals
COPY --from=dependencies /app/packages/core-js-compat/*.js /app/packages/core-js-compat/*.json /app/packages/core-js-compat/LICENSE ./packages/core-js-compat/
COPY --from=dependencies /app/packages/core-js-builder/*.js /app/packages/core-js-builder/package.json /app/packages/core-js-builder/LICENSE ./packages/core-js-builder/
COPY --from=dependencies /app/packages/core-js-service/index.js /app/packages/core-js-service/config.js /app/packages/core-js-service/package.json /app/packages/core-js-service/LICENSE ./packages/core-js-service/
COPY --from=dependencies /app/packages/core-js-service/internals/application ./packages/core-js-service/internals/application
COPY --from=dependencies /app/packages/core-js-service/internals/domain ./packages/core-js-service/internals/domain
COPY --from=dependencies /app/packages/core-js-service/internals/infrastructure ./packages/core-js-service/internals/infrastructure
COPY --from=dependencies /app/packages/core-js-service/internals/ui/*.js ./packages/core-js-service/internals/ui/
COPY --from=dependencies /app/packages/core-js-service-container/*.js /app/packages/core-js-service-container/package.json ./packages/core-js-service-container/
COPY LICENSE ./LICENSE
COPY LICENSE ./packages/core-js-service-container/LICENSE
RUN install -d -o node -g node /var/cache/core-js
USER node
EXPOSE 3000
CMD ["node", "packages/core-js-service-container/index.js"]
