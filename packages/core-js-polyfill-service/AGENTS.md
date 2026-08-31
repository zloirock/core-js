# @core-js/polyfill-service

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

## Domain

The rules and the vocabulary: no I/O, no framework, no knowledge of where the data came from. Each
trap below is named, and the suite names its assertions after them.

- **target-key-1** - the key, `<engine> <version>` in the vocabulary of the compat data, is built
  in one place. browserslist spells four of the engines differently (`ios_saf`, `and_chr`,
  `and_ff`, `op_mob`), so a second copy of that mapping does not throw when it drifts - it stops
  matching mobile traffic, and the visitor looks unrecognized instead. The canonical name is
  therefore ASKED of the compat parser rather than copied out of its private tables
- **target-key-2** - versions are compared as semver, never as numbers or strings. `parseFloat`
  puts `26.10` below `26.2`, and the visitor gets an older bundle than they need
- **targets-1** - an engine of the declared targets never disappears without a word, and neither
  does the declaration as a whole. The parser drops what it does not track silently: one key lost
  sends its visitors to the baseline, and a declaration from which NOTHING survived leaves an empty
  plan - every visitor on the baseline and the service quietly no longer doing the one thing it is
  for. The keys are reported one by one, the empty whole once more
- **buckets-1** - the same module list is the same bundle name, whichever engine asked for it and
  whatever order the list arrived in
- **buckets-2** - the matcher table and the warm-up list are two projections of one pass. Two
  passes could drift, and a matcher naming a bundle the warm-up never built means a build on the
  request path - the one thing the warm-up exists to prevent
- **buckets-3** - the bundle name tells apart everything that tells the bytes apart: the module
  list, both package versions, and `minify`. That address is served with `immutable` for a year,
  so turning a constant into an option without hashing it serves the wrong file for that year, and
  nothing repairs it at the clients that cached it
- **Every version that decides the BYTES is in the name, and the boundary is the published
  package.** core-js is what is polyfilled, `@core-js/compat` decides which modules, `@core-js/builder`
  decides how they are compiled - all three are hashed. Their own dependencies are deliberately not:
  a resolved tree differs between machines, and identifiers that differ between machines cannot name
  one shared store. `bowser` and `caniuse-lite` are out for the opposite reason - they decide which
  bundle a visitor is sent to and the order the warm-up builds in, never the bytes of one bundle
- **buckets-4** - the generation names the whole plan where a bundle name names one bundle: the
  scope, `exclude`, the declared targets, all three package versions and `minify`. One module added to
  the scope renames most of the bundles under it, so a store that kept every plan in one directory
  would collect a full plan of dead files per deploy. `exclude` belongs in it for the same reason
  the scope does - it decides the module list of every bucket - and a pattern reaches the hash
  through `String`, never `JSON.stringify`, which renders a RegExp as `{}`
- **matcher-1** - the nearest threshold below needs a superset of what the visitor needs. It is the
  only miss in the service that costs a broken page rather than extra bytes, and it holds because
  the compat data records the version a module is known to be CORRECT from - not because of any
  code here. That is why the suite checks it against the real data instead of a fixture
- **resolver-1** - every failure to identify the visitor leads to the baseline, never past it.
  There is no "probably Chrome 90" branch: a confident wrong answer costs a missing module and a
  broken page, while "I do not know" costs a few kilobytes
- **resolver-2** - a version the resolver reports is never HIGHER than the real one, whichever
  token it came from. Apple froze the iOS token at 18_7 with iOS 26 and Chromium zeroes its own
  minor (`Chrome/143.0.0.0`), so both read low, and the matcher's nearest-threshold-below turns
  that into extra bytes rather than a missing module. The rule is about the SOURCE, not the
  number: a hard-coded "no `Version/` means iOS 18" would break an in-app WebView on a real iOS 15
- **resolver-3** - an engine that does not put a minor version in its UA has no minor thresholds in
  the compat data either. Chromium writes `Chrome/143.0.0.0` and Firefox freezes its minor, so a
  threshold at `143.0.1` would be one this service can never resolve exactly. It holds today for
  the ecosystem's reasons, not ours - browserslist reports majors alone for those engines - and if
  it stops holding the visitor is placed one threshold low, which is extra bytes
- **resolver-4** - an engine whose UA carries no authoritative version token does not get one
  invented. The case that matters is the in-app WKWebView, which carries no `Version/` at all;
  a version built upwards there hands a thin bundle to what may be an old engine
- **resolver-5** - on iOS the engine is WebKit whatever the browser calls itself. Both parsers
  answer `Chrome 140` to a `CriOS/` string, and handing that to compat as real Chrome builds a
  bundle far thinner than WebKit needs. Chrome on iPhone is 2.84% of world traffic

## Application

The scenarios: they coordinate the domain and the infrastructure and carry no rules of their own.

- **configure-1** - a misspelled option does not pass silently. Afterwards nothing can tell "not
  set" from "set, spelled wrong", and the service runs on a default the developer did not ask for.
  The list of known names is the destructuring in the signature and nothing else, so the two cannot
  drift apart
- **configure-2** - what comes out has no half-filled fields: nothing downstream has to decide
  whether a path is absolute or a version is a range
- **configure-3** - the scope is required. Falling back to the whole of core-js would work - at
  twice the buckets and several times the disk - and the developer would never hear about it
- **build-plan-1** - the plan is ready before the first request is taken; without it the matcher
  cannot name even the baseline. It is a step of its own for that reason: the warm-up reads it once
  and may run later or from outside, the matcher reads it on every request and from the first one
- **warm-1** - the baseline is built first and requests wait for it; everything else warms under
  traffic, because a miss goes to the baseline. A failure to build the baseline is a startup
  failure: there is nothing to rise to, and holding requests with a 503 would need a retry policy
  and a redirect that cannot loop back on itself
- **warm-2** - building the same input twice is harmless, which is why there are no locks. The
  identifier is the hash of the input, so a duplicate build writes the same bytes under the same
  name; a stale lock would be a worse failure than the wasted CPU
- **`targets: null` does not mean "no targets" to compat** - it sends compat looking for a
  browserslist config of its own. So the declaration is resolved once, in `configure`, where the
  project config either becomes the declaration or nothing does; and "everything" is spelled out
  (`ignoreBrowserslistConfig: true`) wherever a module list is asked for. Left to compat, the
  BASELINE alone would pick the config up and come out narrower than the plan around it
- **get-bundle-1** - under an identifier travel its own bytes and nothing else. Substituting the
  baseline while a bucket is still cold is the shortcut that must not be taken: the address is
  served with `immutable` for a year, so that client keeps the wrong bundle for a year and the
  warm-up finishing changes nothing for them. A cold bucket is a redirect, not a body
- **Unknown means the STORE does not have it**, not that the current plan does not name it. A page
  from the deploy before this one is already in a browser and its tag is parser-blocking, so a bundle
  the store still holds is served whoever planned it; how many deploys that survives is `retain`.
- **A bundle name covers the module list, never the targets it was built for.** Inside the builder
  `targets` decides the downleveling as well as the filtering, so one identifier can name ES5 bytes
  in one generation and arrow functions in the next. An identifier THIS plan names is therefore
  answered from THIS generation only - anything else hands the previous plan's syntax level to the
  engine this plan routed there. An identifier the plan does not name has no such reader and is
  served from wherever it survives.
  Both misses cost a lookup in memory and nothing else

## UI

Delivery: everything that knows about the protocol. Only `adapter/express` knows about a framework.

- **serve-1** - the same file under the same address for a year, which is what the identifier has
  to be worth. The moment something fixed by a constant becomes an option and stays out of the
  hash, one address serves the wrong file for a year, and nothing repairs it at the clients that
  cached it
- **serve-2** - the work done per request does not grow with what the client sent. An unknown
  identifier is a 404 and nothing else, and the `Accept-Encoding` parser stops after a fixed number
  of entries. Otherwise the path is an amplifier: a cheap request against expensive work, and the
  request is written by whoever sent it
- **Nothing written by the client is read past `HEADER_LIMIT`.** Every header of a request is
  written by whoever sent it, and the work per request must not grow with it: a megabyte of
  `If-None-Match` costs 15 ms of parsing, a megabyte of `User-Agent` costs 24 ms inside the UA
  parser - and that one runs on the HTML path. Past the bound a header is not read AT ALL, never
  truncated: a cut `;q=0` or a cut `Version/` changes what the header says rather than shortening
  it. The three sites - `Accept-Encoding`, `If-None-Match`, `User-Agent` - answer with the safest
  thing the header could have said
- **`Accept-Encoding` is parsed, never searched.** Testing whether it contains `gzip` breaks on
  exactly `gzip;q=0` - the case the uncompressed copy is stored for. The uncompressed form is
  acceptable by default but ranked LAST: read as a full q=1 it would beat every coding the client
  asked for with a q of its own
- **The ETag carries the encoding.** The gzip copy and the uncompressed one are different bytes
  under one identifier, and a shared tag lets a cache hand one to a client that asked for the other
- **script-tag-1** - the tag runs before the code that counts on it; arriving late is
  indistinguishable from not arriving
- **script-tag-2** - and never before the charset declaration, which is why that one is found by
  scanning rather than by a pattern. A browser decides the encoding of a document from its first
  1024 bytes; a declaration pushed past that boundary stops working and the whole page is decoded
  wrong. For the same class of reason the tag never goes in at position 0 of a document with a
  doctype: a doctype that is not first means quirks mode
- **script-tag-3** - a policy that blocks the tag fails where nobody looks: modern browsers stay
  quiet about it and the page breaks on the old ones the polyfills were for. A nonce is read from
  the response policy; a policy of hashes alone, or `strict-dynamic` without a nonce, cannot be
  fixed by anything we can put in the tag and is reported to the developer. A policy that permits
  no script at all is the exception, and it has to stay one: the page runs none, so it gets neither a
  tag nor a complaint. It is spelled two ways - `'none'` as the only source, and a source list that is
  EMPTY - and a directive is selected whether or not anything follows its name, or the second spelling
  is never even looked at. Express puts exactly that on the error page it generates for itself, and a
  browser asks for `/favicon.ico` unprompted - reporting it greets every first visit with a warning
  about pages that are fine
- The last-resort anchor, the first `<script`, can be inside a comment or a string, and the tag
  would go in there and never run. It is last for that reason - the anchors above it are the ones
  that matter in practice
- **What a second pass looks for is the TAG, not the address of the bundle.** A page that merely
  links to it - a status page, a documentation sample - carries the address as well, and a bare
  substring search leaves that page without polyfills and without a word
- **The route is pasted in front of `/<id>.js`, so it is normalized down to the empty string.**
  A route of `'/'` would otherwise produce `//<id>.js` - a protocol-relative URL, which sends the
  browser to a HOST named after the bundle instead of to us. The writer of the address (`urlOf`)
  and its reader (the adapter's pattern) have to agree on that form, and they agree because the
  form is decided in one place
- **A request for the bundle route is answered whatever its method is**, and `next()` is not
  called for it. Accepted: the route is ours, and a POST to a static asset is not worth a branch
- **adapter-1** - the body has to be seen before it is compressed, so this middleware is
  registered AFTER `compression`. That reads backwards and is not: both replace `res.write`, and
  the one that replaces it later ends up on the outside and sees the body first. The failure is
  silent - gzipped bytes, nothing inserted, no polyfills anywhere - so the gzip magic number is
  checked for and reported
- **adapter-2** - `Content-Length` and `ETag` are removed exactly when something was inserted and
  never otherwise. The length no longer matches and cannot be recomputed - only the beginning of
  the response is held - and Express computes the `ETag` from the body BEFORE the edit, so a client
  would revalidate into a 304 and keep an address of a bundle that is no longer theirs
- **adapter-3** - nothing on the HTML path waits. `res.write` cannot be made to, and making it wait
  would mean buffering the whole response and taking over its backpressure, which is the
  interception undone. The plan and the baseline are awaited BEFORE the interception is installed
- **Only the beginning of a response is joined, decoded and re-encoded**; everything past it
  leaves as it arrived, by reference. Doing it to the whole of what is held would make three full
  passes over the entire body to read its first few kilobytes - 39 ms on a 20 MB page against 0.03
- **Borrowed bytes are copied only when they outlive the call that brought them.** `res.write`
  reports the write as done through its callback, and a pooled stream reuses its buffer the moment
  it hears that - so what is held across calls has to be ours. What is flushed inside the same call
  never is. And a chunk can be a `Uint8Array` rather than a Buffer or a string: `String(view)`
  turns one into the comma-separated list of its byte VALUES, destroying the response
- **The buffered prefix is read and written back as latin1, not utf8.** latin1 is byte-preserving,
  so a multi-byte character split across two chunks survives; utf8 would replace the half we hold
  with a replacement character. Every anchor and the tag itself are ASCII
- A baseline that could not be built takes the page out of OUR hands, not out of the visitor's: the
  response is served exactly as it would be without this middleware, and the developer is told
  once. Failing the request instead would turn a missing bundle into a site-wide outage

## Infrastructure

- The UA parser is `bowser`, and the choice is about maintenance rather than accuracy: on
  everything but in-app iOS browsers it and the MIT branch of `ua-parser-js` agree, and there
  resolver-5 decides anyway. `ua-parser-js@2` is AGPL, and its `1.x` branch is marked legacy by its
  author. It throws on an empty user agent, which is a visitor, not an incident
- **builder-1** - the whole target set of a bucket goes to the builder, never a representative.
  `targets` decides two things at once in there - which modules are kept AND whether the syntax
  is downleveled - and there is no order between versions of different engines to pick a lowest
  from. Of 201 buckets built without an application scope, 185 hold more than one engine
- **builder-2** - an old bucket never receives syntax its engine cannot read. This holds because
  of `ModernSyntax` in `@core-js/builder`, not because of anything here: should rolldown start
  emitting something newer, the engine fails to parse THE WHOLE FILE, which is a broken page rather
  than extra weight
- **bundles-1** - what comes out of the store is bytes, never a path. A path would be shorter and
  would pin the store to a local disk forever - not because Redis or S3 are hard to write, but
  because every caller would already be built around a file
- **bundles-2** - the contract is asynchronous even where the implementation is not, so that moving
  to a networked store does not rewrite every caller
- **bundles-3** - a reader never sees a half-written bundle: it is written under a temporary name
  and renamed WITHIN THE SAME DIRECTORY. A rename across a device boundary is not atomic and
  throws, so the OS temporary directory cannot be used here; without atomicity a reader gets a
  truncated file under a valid identifier, and `immutable` nails it into that cache for a year
- **bundles-4** - the store is one directory per generation, every generation holds the whole plan
  that named it, and the prune runs after the new generation is warm, never before it. A prune that
  ran first would take the only bundles anything could be served from if this build failed. It
  removes only directories shaped like a generation - a store pointed at a path holding anything else
  loses nothing of it - never the one being served, and never the `retain` newest of the rest (one by
  default; `0` keeps only the current, `null` prunes nothing). `has` therefore asks about the
  generation being served while `get` answers from any that is retained: a bundle inherited from an
  older generation would leave this one incomplete, and pruning the older one would then cost a
  warm-up nobody asked for. Retention is what lets a page outlive the deploy that replaced it, and
  what makes a rollback find its bundles where it left them. A sidecar that parses but carries no
  module list is treated exactly like one that does not parse - taken as it is, the bundle would
  answer `has` for ever and `modules` never, and the warm-up would keep skipping the rebuild that
  repairs it
- **What the store keeps it reads once, at the start**, and answers from memory afterwards - a
  request names an identifier the client was given, so both a hit and a miss cost a lookup and never
  a walk of the disk. `retain` therefore bounds the memory as well as the disk: a retained generation
  is resident, at the size it takes on disk
- No disk is a working state, not a failure - no permission, no space, a read-only volume. It costs
  another warm-up at the next restart and is reported once
- The module-list port goes to `@core-js/compat`. It is a port, rather than a call from inside the
  domain, so that the bucket logic can be exercised on fixtures: a test that asserts how many
  buckets thirteen engines collapse into is a test that goes red on somebody else's commit
- Traffic shares come from `caniuse-lite`, not from `browserslist.coverage`. That one answers
  with the share of exactly the version asked about: zero for 85% of the thresholds, and mobile
  Chrome carries all of its traffic on the single version browserslist knows - the warm-up queue
  would come out backwards. Folded onto thresholds by nearest-below, the 13 visitor engines account
  for about 96% of world traffic; the headset is not among the 19 agents `caniuse-lite` tracks, so
  its buckets carry no traffic and are warmed last

## Notes

- `packages/core-js-polyfill-service/**` has to stay in the `sourceType: 'module'` list of
  `tests/eslint/eslint.config.js` - the default there is `script`, and the failure is a parse error
  on the first `import`
- `LICENSE` is copied into every package by `scripts/copy.mjs` and is gitignored per package, so a
  new package needs its own line in `.gitignore` or the copy shows up as an untracked file

## Types

Nothing in the repository lints or type-checks the hand-written `.d.ts` of a tooling package -
neither this one nor its neighbours. What checks this one is `tests/polyfill-service/types.mjs`: a
consumer using the whole public surface, compiled with `types: []`. That last part is the point -
a type naming a Node global (`Buffer` is the easy one to reach for) would silently make every
consumer of these types need `@types/node`, so the bytes of a bundle are typed as `Uint8Array`.

## Tests

`npm run test-polyfill-service` - `tests/polyfill-service/`, one file per module plus
`adapter-express.mjs`, which runs a real Express application over HTTP: both middleware orders
around `compression`, a streamed response, the bundle route and its 304.
