![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/@core-js/service.svg)](https://www.npmjs.com/package/@core-js/service)

</div>

**I highly recommend reading this: [So, what's next?](https://github.com/zloirock/core-js/blob/master/docs/2023-02-14-so-whats-next.md)**
---

A bundle built for every browser instead of one built for the oldest of them. The service detects
the visitor's engine from the request, serves it a [`core-js`](https://core-js.io) bundle carrying
the modules that engine actually lacks. The Express middleware injects a script tag into the
HTML response; the standalone container serves a script that the application includes itself.
An application keeps working down to the floor `core-js` supports, and current browsers stop
paying for that in bytes.

What the application can reach for - its **scope** - is decided by the application build, not by
this service. Pass the complete module list to the container in a manifest or to the middleware
as `scope`.

The Express middleware below integrates the service into an application, including one that runs
in many instances. Set `delivery: 'fixed'` to give every browser the same tag,
`<script src="/__core-js/polyfills.js">`, and pick the bundle when the browser requests the script:
see [One address for every browser](#one-address-for-every-browser). A standalone HTTP container
is also available; see [Run the standalone container](#run-the-standalone-container). For the
set-aside one-off container builder and other delivery strategies, see
[Integration concepts](integration-concepts.md). Those concepts are not package options.

```js
import express from 'express';
import compression from 'compression';
import polyfillService from '@core-js/service/express';

const app = express();

app.use(compression());
// AFTER `compression`, never before it - see below
app.use(polyfillService({
  // the modules the application can reach for, as the build sees them. required
  scope: ['es.array.at', 'es.object.group-by', 'es.iterator.map'],
  // the declared support, in browserslist or @core-js/compat format
  // when not specified, the project browserslist config is used if present,
  // and the whole floor of core-js when there is none
  targets: '> 0.5%, not dead, ie 11',
  // how many generations of bundles stay on disk beside the one being served, `1` by default:
  // enough for the page of the deploy just replaced, and for a rollback to find its bundles.
  // `0` keeps only the generation being served, `null` keeps every generation forever
  // retain: 1,
  // directory to search for browserslist config (for monorepos)
  // configPath: './packages/app',
  // browserslist environment
  // browserslistEnv: 'production',
  // set to `true` to ignore browserslist config
  // ignoreBrowserslistConfig: false,
  // a blacklist of entries / modules, by default - empty list
  // exclude: [/^es\.math\./],
  // used `core-js` version: 'node_modules' (default), 'package.json', or an explicit
  // SemVer string with the minor component, e.g. '4.1'
  // version: 'node_modules',
  // minify the bundles, `true` by default. part of the identity of a bundle
  // minify: true,
  // where the bundles are kept between restarts. by default they live in memory alone
  // and are built again on every start
  // directory: './node_modules/.cache/core-js-service',
  // which representations of every bundle are stored, keyed by the coding a client asks for.
  // `true` takes the defaults of `node:zlib`, an object configures the compressor. brotli is off
  // by default: only a little smaller than gzip, at about the cost of building the bundle again
  // compression: { identity: true, gzip: true },
  // where the bundles are mounted
  // route: '/__core-js',
  // what the tag points at: 'bundle' (default) or 'fixed' - see "One address for every browser"
  // delivery: 'bundle',
  // where developer-facing warnings go, `console.warn` by default
  // warn: message => logger.warn(message),
}));

app.get('/', (request, response) => response.render('index'));
```

## Run the standalone container

The container serves a fixed `/polyfills.js` URL without Express or HTML interception. Provide a
complete manifest of the core-js modules your application might use, **before** its own
browser-target filtering. The container does not generate this manifest or provide an application
adapter. Create `app-modules.json` at the monorepo root, for example:

```json
{
  "modules": ["es.array.from", "es.promise"]
}
```

From the monorepo root, build the image and run it with the manifest mounted read-only:

```sh
docker build -f packages/core-js-service-container/Dockerfile -t core-js-service .
docker run --rm -p 3000:3000 -v "$PWD/app-modules.json:/config/modules.json:ro" \
  -e CORE_JS_MANIFEST_PATH=/config/modules.json core-js-service
```

The container listens on `0.0.0.0:3000` by default. Set `HOST` and `PORT` to change the listener.
The image supplies its own core-js version; the application manifest and image can change
independently. The container reads the manifest once at startup, so changing it requires a new
instance. Deploy a replacement instance with the desired image and manifest, check its status, and
then switch traffic; the container does not coordinate the switch.

Place a blocking tag before your application scripts in the HTML:

```html
<script src="/polyfills.js"></script>
<script src="/app.js"></script>
```

Route `/polyfills.js` through a same-origin proxy to the container. Forward `User-Agent`,
`Accept-Encoding`, and `If-None-Match` unchanged. Do not independently cache this path or emit a
stale `304` during an instance switch. In particular, do not add an encoding the browser did not
request: the service uses `Accept-Encoding` to identify some browsers. The script response uses
`Cache-Control: private, no-cache`, `Vary: User-Agent, Accept-Encoding`, and an `ETag` for the
selected representation. The browser revalidates the URL; a changed generation, encoding, or
newly ready bundle must not confirm old bytes with a `304`.

Check `GET /status` to decide when to route traffic. It always returns HTTP `200` with JSON,
including after an error; do not treat the HTTP status alone as a readiness check:

| `state` | `baselineReady` | `fullyWarmed` | Meaning |
|---|---|---|---|
| `started` | `false` | `false` | Preparing the manifest, plan, or baseline. |
| `ready` | `true` | `false` | The baseline is available; other bundles are warming. |
| `ready` | `true` | `true` | All planned bundles are available. |
| `error` | `false` | `false` | Preparation failed; no bundle is available. |
| `error` | `true` | `false` | Later warm-up failed; the baseline remains available. |

On error, the response includes `errorCode`: `manifest_invalid`, `plan_failed`,
`baseline_build_failed`, or `bundle_build_failed`. It does not expose exception text or filesystem
paths. Until the baseline is ready, `/polyfills.js` returns `503` with `Cache-Control: no-store`.
Afterward, a bundle that has not warmed or failed to build falls back to the baseline. An error
persists for that instance; start a replacement instance to retry preparation. Choose whether to
switch traffic after baseline readiness or full warm-up based on your deployment requirements.

## Register it after `compression`

This reads backwards and is not. Both this middleware and `compression` replace `res.write`, and
the one registered **later** ends up on the outside and sees the body first. Registered before
`compression`, this middleware is handed bytes that are already gzip, nothing can be inserted, and
the page silently arrives with no polyfills at all. It notices that case and warns, but the fix is
the order.

## Behind a prefix

An application that lives under a path can be arranged either way, and the addresses come out the
same:

```js
// mounted under the prefix - the tag and the redirect are written from the mount point
app.use('/app', polyfillService({ scope }));

// or mounted at the root, with the prefix in the route
app.use(polyfillService({ scope, route: '/app/__core-js' }));
```

Use one or the other. With both, the prefix ends up in the address twice - `/app/app/__core-js/...`,
which works but is nobody's intention.

## Behind a proxy or a CDN

The bundle a page links to is chosen from two request headers: `User-Agent` and, for Firefox on
iOS, `Accept-Encoding`. The page says so in `Vary: User-Agent, Accept-Encoding`, so a cache in front
of the application has to key HTML on both. A cache that ignores `Vary` serves one visitor's
bundle to every visitor.

A proxy that rewrites `Accept-Encoding` on the way in is safe when it removes codings and unsafe
when it adds them. The service reads `zstd` as a sign of iOS 26.2 or later, so a proxy that adds
`zstd` for a client that never asked for it gets an older iPhone a bundle that is too thin.

## What it does at startup

Installing the middleware starts two things. The **plan** - which engine versions collapse into
which bundles - is computed from the compat data in about a tenth of a second, and the **baseline**
bundle, the one every unrecognized visitor gets, is built first. Requests wait for those two and
for nothing else: the rest of the bundles are built under traffic, and a visitor whose bundle is
not ready yet is redirected to the baseline for that one request.

A bundle is named by the hash of everything that decides its bytes, so its address is answered with
`Cache-Control: public, max-age=31536000, immutable`.

## One address for every browser

By default the tag points at the bundle chosen for the visitor, so the page differs by browser and
carries `Vary: User-Agent, Accept-Encoding`. With `delivery: 'fixed'`, every page gets the same
tag, and the bundle is chosen when the browser requests the script:

```html
<script src="/__core-js/polyfills.js"></script>
```

- The page no longer varies by browser, and the middleware adds nothing to its `Vary`.
- The script is answered with `Cache-Control: private, no-cache` and
  `Vary: User-Agent, Accept-Encoding`. The browser keeps the bytes and revalidates them on every
  page load; an unchanged script costs a `304` without a body. A shared cache or a CDN must not
  keep this address.
- A bundle that is not built yet is answered with the baseline at the same address, without a
  redirect. The next page load after it is built gets the visitor's own bundle.
- The `ETag` changes with every deploy, so a browser never confirms the previous deploy's bytes.
- Until the baseline is ready, the address answers `503` with `Cache-Control: no-store`.

The bundle addresses keep working in this mode, so pages cached before the switch still load
their scripts. In the default mode, nothing answers `polyfills.js`.

Choose the default when your bundles should be cached by a CDN for a year. Choose `'fixed'` when
one copy of the page has to serve every browser, and a revalidation request on each page load is
acceptable.

## Without Express

The middleware carries the service it runs on, for a status endpoint or a second router:

```js
const polyfills = polyfillService({ scope });

app.use(polyfills);
app.get('/__report', async (request, response) => {
  const bundleId = polyfills.service.chooseBundle(request.headers);
  response.json({
    bundleId,
    // the engine and version this visitor was taken for, `null` when none was recognized
    visitor: polyfills.service.identify(request.headers),
    modules: await polyfills.service.bundles.modules(bundleId),
  });
});
```

`@core-js/service` itself knows nothing about a framework:

```js
import createService from '@core-js/service';

const service = createService({ scope });
const { ready } = service.start();

await ready;

// request headers -> what the tag points at: the visitor's own bundle, or the fixed address
const src = service.srcFor(request.headers);

// with `delivery: 'fixed'`, one address for everyone and a handler that picks the bundle
// router.get(service.scriptUrl, (request, response) => service.serveScript(request, response));
// the beginning of the page -> the same beginning, with the tag where it runs first
const markup = service.scriptTag(prefix, { src, csp: null });
```

When using TypeScript, make sure to set `esModuleInterop` to `true`.
