![logo](https://user-images.githubusercontent.com/2213682/146607186-8e13ddef-26a4-4ebf-befd-5aac9d77c090.png)

<div align="center">

[![fundraising](https://opencollective.com/core-js/all/badge.svg?label=fundraising)](https://opencollective.com/core-js) [![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/zloirock/core-js/blob/master/CONTRIBUTING.md) [![version](https://img.shields.io/npm/v/@core-js/polyfill-service.svg)](https://www.npmjs.com/package/@core-js/polyfill-service)

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
import polyfillService from '@core-js/polyfill-service/express';

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
  // directory: './node_modules/.cache/core-js-polyfill-service',
  // store a brotli encoding beside gzip: 13% smaller than gzip, at four times the cost
  // of the build itself
  // brotli: false,
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
  response.json({ bundleId, modules: await polyfills.service.bundles.modules(bundleId) });
});
```

`@core-js/polyfill-service` itself knows nothing about a framework:

```js
import createService from '@core-js/polyfill-service';

const service = createService({ scope });
const { ready } = service.start();

await ready;

// request headers -> the address of the bundle for that visitor
const src = service.urlOf(service.chooseBundle(request.headers));
// the beginning of the page -> the same beginning, with the tag where it runs first
const markup = service.scriptTag(prefix, { src, csp: null });
```

When using TypeScript, make sure to set `esModuleInterop` to `true`.
