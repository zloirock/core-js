# @core-js/service

Serves each visitor a core-js bundle built for their browser: detects the engine from the request,
picks the bundle whose module list that engine needs, and injects the script tag into the HTML.

## Target environment

The only RUNTIME package in the repository - it runs in production, under traffic; everything else
here is build-time. Node `^22.18.0 || >=24.11.0`, ESM, and nothing in it is ever parsed by a browser.

The polyfill floor is held by what it serves, not by what it is: the bundles come out of
`@core-js/builder`, and that is where the ES5-ness of the output is decided.

## Layout

The package root holds the entry points only - `index.js` for the service itself, `express.js` for
the middleware, `config.js` for the constants; `internals/` holds the layers, one directory each -
`domain/`, `application/`, `infrastructure/`, `ui/`.

Dependencies point inward: UI to Application to Domain. Infrastructure implements what the layers
above declare and imports nothing but those declarations. Nothing enforces this - an import that
goes the other way costs no test and no lint error, and the layer boundary is gone.

**A port is declared by the layer that uses it, not by the one that implements it**, and comes in
as an argument. There is no container: the graph is assembled in `index.js`, which is the only file
that knows every module.

`config.js` sits below all of them - the domain imports it too - so it holds constants and nothing
that reads the environment (`layers-1`, checked by `tests/service/invariants.mjs`).

## The invariants are in `INVARIANTS.md`

Read it before changing anything under `internals/`, and add to it when a change makes a new rule:
the suite names its assertions after those entries, so a rule nobody wrote down is one the next
change drops without a red test. What is where:

| layer | entries |
|---|---|
| `internals/domain/` | `target-*`, `targets-*`, `buckets-*`, `matcher-*`, `resolver-*`, `user-agents-*`, and why every token is read from the STRING rather than taken from the parser |
| `internals/application/` | `configure-*`, `build-plan-1`, `warm-*`, `get-bundle-1`, what `targets: null` means to compat |
| `internals/ui/` | `serve-*`, `script-tag-*`, `adapter-*`, the bound on what a client wrote, the `Accept-Encoding` rules |
| `internals/infrastructure/` | `builder-*`, `bundles-*`, what the store keeps in memory |

`tests/service/invariants.mjs` reads the two apart: every assertion label in the suite has to name
an entry in that document, so a rule dropped from it is a red test rather than a label nobody can
read.

## Types

Nothing in the repository lints or type-checks the hand-written `.d.ts` of a tooling package -
neither this one nor its neighbours. What checks this one is `tests/service/types.mjs`: a
consumer using the whole public surface, compiled with `types: []`. That last part is the point -
a type naming a Node global (`Buffer` is the easy one to reach for) would silently make every
consumer of these types need `@types/node`, so the bytes of a bundle are typed as `Uint8Array`.

## Tests

`npm run test-service` - `tests/service/`, one file per module plus
`adapter-express.mjs`, which runs a real Express application over HTTP: both middleware orders
around `compression`, a streamed response, the bundle route and its 304.
