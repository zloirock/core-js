# Standalone polyfill service container

## Purpose and scope

Build a standalone HTTP container from the `polyfill-service` branch of this monorepo. The container consumes a complete, application-provided core-js module manifest, computes the browser selection plan, builds the baseline, warms the remaining bundles, and serves browser-specific JavaScript. It does not inspect application code or generate the manifest.

The application includes an ordinary blocking `<script src="/polyfills.js"></script>` before its scripts. A same-origin proxy forwards that path to the container. The application does not run the service, build bundles, or select a browser. Proxy routing, rollout coordination, and manifest generation remain the application's responsibilities.

Implement this work on the separate `service-container` branch based on `polyfill-service`. Do not replace the existing Express middleware or its delivery modes.

## Components and interfaces

- **Manifest loader:** Read a JSON file once during startup from `CORE_JS_MANIFEST_PATH`. Accept only a JSON object with exactly one field, `modules`: an array of exact module names from `@core-js/compat` data. Accept an empty list, duplicates, and any order; normalize duplicates before passing the list to the service. Reject missing or unreadable files, malformed JSON, additional fields, invalid element types, and unknown names. Never interpret a bad manifest as a request for all modules. The manifest does not select the core-js version or container settings. Changing the file requires a new container instance.
- **Service composition:** Instantiate the existing `@core-js/service` with the validated list as `scope`, `delivery: 'fixed'`, `route: '/'` (normalized by the existing configuration to an empty prefix, making `scriptUrl` equal `/polyfills.js`), and `ignoreBrowserslistConfig: true`. The image supplies its own core-js version. Build the plan and baseline through the existing service; call `start()` once and observe both `ready` and `warmed`. Do not build on visitor requests. Keep bundle selection, compression negotiation, response headers, and validators in `serveScript` rather than implementing them again in the HTTP adapter.
- **HTTP adapter:** Run Fastify in the container. Register only `GET /status` and `GET /polyfills.js`; no Express dependency or application HTML interception. For the script route, hand the raw Node request and response to `serveScript`, and tell Fastify that the response is owned by that handler. Unexpected request-time failures are logged and returned as an uncacheable server error if no response has been sent.
- **Runtime entry point:** Start listening before attempting manifest loading and service creation, so the status endpoint remains reachable even if either fails synchronously. Bind to `HOST` and `PORT` (defaults: `0.0.0.0` and `3000`); require `CORE_JS_MANIFEST_PATH`. Reject invalid listener settings before listening. On shutdown, stop accepting connections and allow accepted requests to finish, then exit. Deployment starts a replacement instance with its own manifest and switches the proxy after checking its status; the service does not coordinate the switch.

The adapter uses the service's public `start()` and `serveScript` surface. If that surface cannot expose an observed warm-up failure or support raw-response delegation cleanly, make the smallest focused change to the package and protect it with tests. Keep the existing layer boundaries and document new invariants in `INVARIANTS.md`.

## State and error contract

`GET /status` returns HTTP 200 with JSON in all service states, including failures. It is not itself a readiness probe that changes status code. The container reports facts so the deployer can choose whether baseline readiness or full warm-up is required before routing traffic.

| `state` | `baselineReady` | `fullyWarmed` | Meaning |
|---|---|---|---|
| `started` | `false` | `false` | Listening; manifest, plan, or baseline is being prepared. |
| `ready` | `true` | `false` | Baseline is available; remaining buckets are warming. |
| `ready` | `true` | `true` | All planned buckets have completed successfully. |
| `error` | `false` | `false` | Manifest, plan, or baseline failed; no safe bundle is available. |
| `error` | `true` | `false` | A later bucket or final warm-up step failed; baseline remains available. |

On error, add `errorCode`, one of `manifest_invalid`, `plan_failed`, `baseline_build_failed`, or `bundle_build_failed`. Do not include exception text or filesystem paths in the response. Log the underlying failure when it occurs, not on every script request. If multiple buckets fail, report `bundle_build_failed` and retain the detailed failures in logs. An error remains observable for that instance; retrying preparation requires a new instance.

Before baseline readiness, including after a fatal preparation error, `GET /polyfills.js` returns HTTP 503 with `Cache-Control: no-store`. After baseline readiness, route script requests to `serveScript`: a cold or failed bucket falls back to the baseline; a ready bucket gets its own bytes. During warm-up, status transitions to `ready` as soon as baseline exists. After warm-up, set `fullyWarmed: true` only if no bucket failed and no final warm-up step failed.

Keep the existing fixed-URL cache semantics: `Cache-Control: private, no-cache`, `Vary: User-Agent, Accept-Encoding`, and an `ETag` for the currently selected representation. A matching `If-None-Match` returns 304; a bucket becoming ready, a change of encoding, or a new service generation must not confirm old bytes with a stale 304. The proxy preserves `User-Agent`, `Accept-Encoding`, and `If-None-Match`, does not independently cache this route, and does not emit a stale 304 across a release switch. The fixed address must not use immutable caching.

## Image and deployment

Provide a Dockerfile built from the monorepo root. Install dependencies from the pinned lockfile, generate the repository outputs that the service and builder import, and package only the runtime files and dependencies needed to start the Fastify HTTP service and build bundles. Keep application-specific manifests out of the image. Pin the runtime to a Node release within the repository's supported range. Document a build command, a run command with a read-only manifest mount, the script tag, same-origin proxy requirements, the status contract, and the fact that an image and application manifest may change independently. Avoid shipping test fixtures or unrelated workspace development tools in the final image.

Fastify is a runtime dependency of the standalone server, not of applications that only install the existing service middleware. Place the standalone entry point and its dependency where the image can resolve them without silently changing the package's existing public API.

## Verification

- Unit tests cover manifest validation, normalized scope, listener configuration, status transitions, and error classification, including plan creation failures before `start()` and bucket failures after baseline readiness.
- Real HTTP tests cover both routes, refusal before baseline readiness, valid baseline response, warm-up transition to a bucket, content codings, conditional 304, changed generation, and failures that leave `/status` reachable. Check unknown routes and graceful shutdown.
- Build the Docker image from this branch, run it with a mounted fixture manifest, request `/status` and `/polyfills.js`, and confirm that startup and delivery work with runtime dependencies from the image rather than the host checkout. If Docker is unavailable, report that image verification was not run.
- Run the service test runner, scoped lint and spelling checks for changed files, and the repository's required final test gate. Preserve the existing Express behavior and tests.

## Out of scope

Generating the complete application manifest; an application-side code adapter; proxy configuration tied to one deployment platform; a redirect to immutable bundle URLs; release orchestration, shared storage, and cross-container coordination. The proxy owner must ensure the manifest covers all modules the application may use before its own target-browser filtering.
