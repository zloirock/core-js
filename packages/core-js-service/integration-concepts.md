# Integration concepts for @core-js/service

This document describes possible integrations, not features supported by the current package. The [README](README.md) describes the implemented Express middleware and framework-independent API. None of the container variants or delivery alternatives below is an implementation commitment.

All three integrations aim to deliver the smallest polyfill bundle that covers both the application's possible core-js usage and the visitor's browser. The application must provide its **complete** set of possible modules before its own build filters them for target browsers. Inferring that set from already-filtered imports would omit modules needed by older visitors. How the application build produces this set remains open.

## Integration models

### Middleware builds and serves in each application process

**Use when:** A server application controls its HTML and can install middleware without a separate build deployment.

Each process computes a browser-to-bundle plan, builds a baseline, warms the other bundles, inserts a browser-specific script URL into HTML, and serves the bundles. Delivery scales with application processes. The cost is repeating the build in every process, which is acceptable because the build is fast, and coupling HTML interception to framework behavior, compression, streaming, content security policy, and HTML caching. This is the model implemented today; it does not provide a drop-in integration for static sites.

### One-off container builds; application processes serve

**Status:** Set aside. Building the plan and bundles is fast, so moving it out of the application process does not justify another infrastructure component and another point of failure. A many-instance application uses the middleware model, with each process building its own bundles. Reconsider this model only if measurements show that the build is a real startup or resource cost for such a deployment.

**Intended for:** A many-instance application that should build each release once without making one container the HTTP bottleneck.

A one-off container takes the application's complete module manifest, computes a selection plan, builds bundles, publishes the release through a storage interface, and exits. Each application process loads the published plan into memory when the application activates it. A thin delivery layer selects a bundle and reads the already-built artifact; it never builds during startup or on a visitor request. HTML integration remains the application's responsibility. A shared volume works when all readers are on one node; across nodes, the application must provide shared storage or distribute the result. The storage contract should not require filesystem paths: another implementation may use object storage.

The release has an identifier, an immutable published plan (browser thresholds to bundle IDs and a baseline ID), and fully written bundles. The builder publishes the plan and baseline first and signals that they are available. It then automatically builds the remaining buckets, makes each visible only after a complete write, and signals full readiness when they are all available. If a bucket fails, the build reports an error without claiming full readiness; the published baseline remains usable. These signals describe the **release**, not the lifetime of the builder container; their transport is not yet specified.

On first deployment, the application can activate a release when its baseline is available to avoid waiting for the complete warm-up. On updates, it can keep the old release active until the new one is fully ready. Those are application deployment choices, not service modes. A reader that encounters an unbuilt bucket uses the baseline, does not cache the miss forever, and can use the bucket on a later request without reloading the immutable plan. Found immutable bundles may be cached in process. A process validates a new plan before atomically replacing its active plan; a request uses one release throughout. The application coordinates activation across processes and decides when old releases are no longer needed. The builder does not remove them.

This option removes redundant builds without centralizing visitor traffic. It does require a release contract, artifact access for every reader, and integration and activation work in the application. It is **not** a single separate HTTP service shared by all application instances.

### Manual script tag; separate HTTP container builds and serves

**Use when:** A static site or an application without a suitable adapter needs minimal in-process integration.

The application places an ordinary blocking script tag before its own scripts:

```html
<script src="/polyfills.js"></script>
```

A long-running container reads the application's module manifest, computes a plan, builds a baseline, warms the remaining bundles, selects an answer for each visitor, and serves the JavaScript. A same-origin proxy routes the script path to that container. No middleware or framework adapter is required in the application. The HTML stays the same across browsers. A container may be placed per shard if the application's architecture calls for that, but one container serving traffic for many high-load application instances could become the bottleneck. Serving containers must scale to the traffic they receive; this model is distinct from the one-off builder model.

The proposed manifest is a JSON object with one required field:

```json
{
  "modules": ["es.array.from", "es.promise"]
}
```

`modules` lists exact module names recognized by `@core-js/compat`; ordering and duplicates do not matter, and an empty list is allowed. Missing files, invalid shapes, extra fields, and unknown names are errors, not reasons to fall back to every module. The service image supplies its own core-js version: the manifest does not install or choose it. A schema version is not currently justified. The application build might emit this manifest as an artifact, but the mechanism is undecided. The container reads it at startup rather than watching it for changes.

For an update, the application can start a neighboring container with the new manifest and switch its proxy after checking readiness. The service reports readiness; the application and its infrastructure decide **when** to switch and how to align the manifest with the application code and HTML. The old container finishes accepted requests. A proposed `GET /status` returns HTTP 200 even in an error state, with `state` (`started`, `ready`, or `error`), `baselineReady`, `fullyWarmed`, and a short machine-readable `errorCode` in the error state. `ready` means that the baseline can be served, not that every bucket is warmed. A failure to build a later bucket leaves the baseline available and reports `error` with `fullyWarmed: false`; an invalid manifest or missing baseline reports `error` with `baselineReady: false`. The server should log the underlying error without repeating it on every script request. Until the baseline is ready, `/polyfills.js` responds with `503` and `Cache-Control: no-store`.

The proposed fixed URL serves JavaScript directly. The server selects the currently available bucket or baseline, then compares `If-None-Match` with the `ETag` of the representation it would return **now**. Different bytes, including different content codings, need different validators. `Cache-Control: private, no-cache` permits browser storage but requires revalidation; a matching validator gets `304`, while a changed release or a newly ready bucket gets fresh JavaScript. The proxy must preserve `User-Agent`, `Accept-Encoding`, and `If-None-Match`, avoid caching that path independently, and not produce a stale `304` during a switch. The response needs a consistent `Vary: User-Agent, Accept-Encoding`. Long-lived `immutable` caching is inappropriate for this mutable URL.

The status endpoint, container, and manifest loading are proposals, **not** current package endpoints or options. The fixed-URL handler itself exists: the middleware's `delivery: 'fixed'` mode and `service.serveScript` implement the response rules above for one process, and a container would reuse them. The proxy rules remain the container's concern.

## Choosing a script URL and cache strategy

URL delivery is a separate decision from the integration model. Do not assume a many-instance deployment requires a fixed URL, or that every container must serve JavaScript directly.

- **Insert the specific immutable bundle URL into HTML.** The browser fetches the file directly and can reuse a long-lived browser or content delivery network (CDN) cache. HTML now varies by browser; if a shared cache serves HTML, the application must ensure that a visitor cannot receive another browser's bundle URL. The application owns its HTML cache policy. This is the middleware's default, `delivery: 'bundle'`.
- **Use one URL that returns JavaScript.** HTML is browser-independent, and the server chooses a bundle on each script request. A private, revalidated response saves unchanged JavaScript bytes in the browser, but still makes a conditional request; it is not a shared CDN-cached JavaScript response. This is the middleware's `delivery: 'fixed'` mode, and the proposed behavior of the standalone container.
- **Use one URL that redirects to an immutable bundle URL.** HTML remains browser-independent and the target JavaScript can be CDN-cached. The selection endpoint still receives requests and adds a network transition before the blocking script executes. Its redirect must not remain cached as a stale choice across release changes. This can suit applications that need both shared HTML caching and immutable CDN-hosted JavaScript, but it is not the default: where a specific URL can safely be inserted, the extra transition buys little; where direct fixed-URL delivery suffices, it adds moving parts. A single selection container would still need to scale with incoming requests. This redirect is different from the current middleware's redirect **to the baseline when a known bucket is cold**.

For a high-load application, publishing immutable files to S3 or another shared store and serving them directly through a CDN can combine specific URLs with distributed delivery. If a file request goes directly to the CDN, another application process's active plan does not validate the bundle ID and cannot reject it merely because that process has a different plan. A `404` from plan disagreement is possible when the file request instead passes through a process that checks IDs against **its own** current plan, as the current `get-bundle` contract does. This is a routing distinction, not a reason to require one fixed URL.

One possible layout gives each release a separate URL space, such as `/polyfills/<releaseId>/<bundleId>.js`. A new release does not overwrite the old one. Keep old files while any page or in-flight request can still reference them; the safe retention period depends on the application's deployment and HTML cache, not on a universal number of releases. The current middleware has its own `retain` setting; that default does not define retention for a future CDN deployment. Never serve baseline bytes under an immutable URL that promises a different bundle. During incomplete warm-up, either choose a separate baseline URL or delay publication of links to the incomplete release; which approach fits depends on the integration.

## What has been checked and what remains open

A [browser-cache experiment](browser-cache-probe.md) tested a blocking script with `private, no-cache`, `ETag`, and `If-None-Match`. In Sauce Labs, IE11, Firefox 15, Chrome 67, Safari 14.1, iOS Safari 14.0, and Chrome 95 on Android 5.0 revalidated unchanged JavaScript with `304` and executed changed JavaScript after a `200` at the same URL. Chrome 38 and Safari 7.1 were unavailable; the Android version did not imply an equally old Chrome version. The experiment did **not** test switching a real proxy between containers, CDN caching, or the cost of a redirect. These results support the fixed-URL mode on the tested browsers, not a claim that the container design has been validated end to end.

Before implementing a new integration, decide how to generate and validate the complete application manifest, serialize and publish a release plan, distribute artifacts and activation signals, choose delivery during partial warm-up, and determine safe artifact retention for that application's HTML cache. Measure the additional redirect transition for an application that actually needs both browser-independent HTML and immutable CDN-hosted bundles; do not introduce it solely to avoid a plan mismatch that direct CDN delivery cannot cause.
