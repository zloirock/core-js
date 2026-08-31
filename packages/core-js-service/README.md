![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/@core-js/service.svg)](https://www.npmjs.com/package/@core-js/service)

</div>

**I highly recommend reading this: [So, what's next?](https://github.com/zloirock/core-js/blob/master/docs/2023-02-14-so-whats-next.md)**
---

A bundle built for every browser instead of one built for the oldest of them. The service detects
the visitor's engine from the request, serves it a [`core-js`](https://core-js.io) bundle carrying
the modules that engine actually lacks, and injects the script tag into the HTML response. An
application keeps working down to the floor `core-js` supports, and current browsers stop paying
for that in bytes.

What the application can reach for - its **scope** - is decided by the build, not by this service:
`@core-js/unplugin` and its relatives already work it out, and the list is passed in as it is.

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
  // by default: 12% smaller than gzip, at about the cost of building the bundle again
  // compression: { identity: true, gzip: true },
  // where the bundles are mounted
  // route: '/__core-js',
  // where developer-facing warnings go, `console.warn` by default
  // warn: message => logger.warn(message),
}));

app.get('/', (request, response) => response.render('index'));
```

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

## What it does at startup

Installing the middleware starts two things. The **plan** - which engine versions collapse into
which bundles - is computed from the compat data in about a tenth of a second, and the **baseline**
bundle, the one every unrecognized visitor gets, is built first. Requests wait for those two and
for nothing else: the rest of the bundles are built under traffic, and a visitor whose bundle is
not ready yet is redirected to the baseline for that one request.

A bundle is named by the hash of everything that decides its bytes, so its address is answered with
`Cache-Control: public, max-age=31536000, immutable`.

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

// request headers -> the address of the bundle for that visitor
const src = service.urlOf(service.chooseBundle(request.headers));
// the beginning of the page -> the same beginning, with the tag where it runs first
const markup = service.scriptTag(prefix, { src, csp: null });
```

When using TypeScript, make sure to set `esModuleInterop` to `true`.
