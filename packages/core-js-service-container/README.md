# Connect an application to the containerized polyfill service

The standalone container reads a module manifest, builds browser-specific core-js bundles, and serves them at `/polyfills.js`. Your application supplies the manifest, includes a blocking script tag, and proxies that path to the container. The container does not modify your HTML or generate the manifest.

## Prerequisite: a ready module manifest

Before starting the container, you need a JSON manifest containing the complete list of core-js modules your browser application might use, **before filtering by browser targets**. Producing this list is outside the scope of the container integration; this repository does not provide a manifest generator for applications.

The container accepts a JSON object with only a `modules` array of exact names from `@core-js/compat/data`. For example, a provided manifest might contain:

```json
{
  "modules": ["es.array.from", "es.promise.constructor"]
}
```

The example below assumes the ready manifest is available as `app-modules.json` in the monorepo root. The container runs as the unprivileged `node` user (UID `1000`), so that user must be able to read the mounted file. An unknown module name causes startup to fail. The container reads the file once at startup; to use a different manifest, start a replacement container. The image supplies the core-js version independently of the manifest.

## Build and start the container

Run these commands from the repository root. The image is built from the current checkout of the monorepo:

```sh
docker build -f packages/core-js-service-container/Dockerfile -t core-js-service .
image_id=$(docker image inspect --format '{{.Id}}' core-js-service)
docker run --rm --name core-js-service -p 127.0.0.1:3000:3000 \
  --mount "type=bind,source=$PWD/app-modules.json,target=/config/modules.json,readonly" \
  --mount type=volume,source=core-js-service-cache,target=/var/cache/core-js \
  -e CORE_JS_MANIFEST_PATH=/config/modules.json \
  -e CORE_JS_CACHE_DIR=/var/cache/core-js \
  -e CORE_JS_IMAGE_DIGEST="$image_id" "$image_id"
```

This example makes the service available to a proxy running on the same host. If your proxy runs in a different container or on another host, connect it to the service over your deployment network instead; do not use `127.0.0.1` as the proxy's upstream address unless both processes share a network namespace. The container listens on `0.0.0.0:3000` by default. Set `HOST` or `PORT` if your deployment needs a different listener, and update the port mapping and proxy address accordingly.

The root-level `app-modules.json` is excluded from the Docker build context. You can also keep the
manifest with your application outside the monorepo and use its absolute path as the mount source.

The named volume keeps bundles across container replacements. Reuse the volume for the same
application. `CORE_JS_CACHE_DIR` points to its mount and requires `CORE_JS_IMAGE_DIGEST`, the local
image ID shown above or the platform-specific image digest from your registry. Each image gets a
separate directory in the volume because builds of the image can differ under the same core-js version.
Directories for previous images remain available for rollbacks. The `node` user (UID `1000`) needs
write access if you mount your own directory.

On restart with the same image and module set, the service loads complete bundles from the cache
and builds any that are missing, incomplete, or damaged. The baseline becomes ready as soon as it is
available. With `CORE_JS_CACHE_DIR` unset, the service stores bundles in memory. It also falls back
to memory and logs a warning if writing to the cache fails.

## Check readiness

Request the status endpoint before sending application traffic to the container:

```sh
curl -fsS http://127.0.0.1:3000/status
```

The endpoint always returns HTTP `200`, **including when preparation fails**. Inspect the JSON fields instead of using the HTTP status as a readiness signal:

| Condition | Meaning |
|---|---|
| `state: "started"`, `baselineReady: false` | The manifest, plan, or baseline is still being prepared. |
| `state: "ready"`, `baselineReady: true`, `fullyWarmed: false` | The baseline works; other bundles are still warming. |
| `state: "ready"`, `baselineReady: true`, `fullyWarmed: true` | All planned bundles are ready. |
| `state: "error"`, `baselineReady: false` | Preparation failed; the script endpoint is unavailable. |
| `state: "error"`, `baselineReady: true` | Later warm-up failed; the baseline remains available. |

Before `baselineReady` is true, `/polyfills.js` returns `503` with `Cache-Control: no-store`. Afterward, the service can return the baseline while a visitor's bundle is still warming. For a deployment that requires all planned bundles to be built before switching traffic, wait for both `state: "ready"` and `fullyWarmed: true`. On error, check the container logs: `/status` reports an `errorCode` (`manifest_invalid`, `plan_failed`, `baseline_build_failed`, or `bundle_build_failed`) without exposing exception details. A failed instance does not retry preparation; start a replacement instance after correcting the cause.

## Proxy the script through your application origin

Make `/polyfills.js` on your application's origin forward to the container's `/polyfills.js`. For example, if NGINX runs on the same host as the container above, add this location to the application's server block:

```nginx
location = /polyfills.js {
    proxy_pass http://127.0.0.1:3000/polyfills.js;
    proxy_set_header User-Agent $http_user_agent;
    proxy_set_header Accept-Encoding $http_accept_encoding;
    proxy_set_header If-None-Match $http_if_none_match;
    proxy_cache off;
}
```

Forward the visitor's `User-Agent`, `Accept-Encoding`, and `If-None-Match` without adding encodings that the browser did not request. Do not put a shared cache in front of this path or generate a `304` from a stale copy during a container switch. Preserve the response headers: the service uses `Cache-Control: private, no-cache`, `Vary: User-Agent, Accept-Encoding`, and an `ETag` for the selected representation. Keep `/status` accessible to your deployment's health check; it does not have to be exposed to visitors.

## Add the script to your HTML

Place a normal, blocking script tag before any application script that needs polyfills. Use the same-origin path handled by your proxy:

```html
<script src="/polyfills.js"></script>
<script src="/app.js"></script>
```

Do not add `async` or `defer` to the polyfill tag: dependent application code must run only after it loads. The application does not need the Express middleware when it uses this container.

## Verify the integration

After the proxy points to a ready container, request the script through your application's origin:

```sh
curl -i -H 'Accept-Encoding: identity' https://your-app.example/polyfills.js
```

Expect HTTP `200` with JavaScript, `Vary: User-Agent, Accept-Encoding`, and an `ETag`. Load an application page and confirm that `/polyfills.js` finishes before your application scripts run. If the script returns `503`, check `/status` and the container logs before routing traffic to that instance.

## Update the service

For a new manifest or image, start a replacement container without stopping the current one. Wait for your required readiness state, then switch the application's proxy to the replacement. Keep the old instance available until traffic has moved. The container does not perform that switch, and editing the mounted manifest does not update an already running instance.
