# @core-js/polyfill-service

Serves each visitor a core-js bundle built for their browser: detects the engine from the request,
picks the bundle whose module list that engine needs, and injects the script tag into the HTML.

## Target environment

The only RUNTIME package in the repository - it runs in production, under traffic; everything else
here is build-time. Node `^22.18.0 || >=24.11.0`, ESM, and nothing in it is ever parsed by a browser.

The polyfill floor is held by what it serves, not by what it is: the bundles come out of
`@core-js/builder`, and that is where the ES5-ness of the output is decided.

## Layout

The package root holds the entry points only; `internals/` holds the layers, one directory each -
`domain/`, `application/`, `infrastructure/`, `ui/`.

Dependencies point inward: UI to Application to Domain. Infrastructure implements what the layers
above declare and imports nothing but those declarations. ⚠ Nothing enforces this - an import that
goes the other way costs no test and no lint error, and the layer boundary is gone.

**A port is declared by the layer that uses it, not by the one that implements it**, and comes in
as an argument. There is no container: the graph is assembled in `index.js`, which is the only file
that knows every module.

## Domain

The rules and the vocabulary: no I/O, no framework, no knowledge of where the data came from. Each
trap below is named, and the suite names its assertions after them.

- **target-key-1** - the key, `<engine> <version>` in the vocabulary of the compat data, is built
  in one place. ⚠ browserslist spells four of the engines differently (`ios_saf`, `and_chr`,
  `and_ff`, `op_mob`), so a second copy of that mapping does not throw when it drifts - it stops
  matching mobile traffic, and the visitor looks unrecognized instead. The canonical name is
  therefore ASKED of the compat parser rather than copied out of its private tables
- **target-key-2** - versions are compared as semver, never as numbers or strings. `parseFloat`
  puts `26.10` below `26.2`, and the visitor gets an older bundle than they need
- **targets-1** - an engine of the declared targets never disappears without a word. ⚠ The parser
  drops what it does not track silently: one key lost sends its visitors to the baseline, every key
  lost leaves an empty declaration, which compat reads as "everything"
- **buckets-1** - the same module list is the same bundle name, whichever engine asked for it and
  whatever order the list arrived in
- **buckets-2** - the matcher table and the warm-up list are two projections of one pass. ⚠ Two
  passes could drift, and a matcher naming a bundle the warm-up never built means a build on the
  request path - the one thing the warm-up exists to prevent
- **buckets-3** - the bundle name tells apart everything that tells the bytes apart: the module
  list, both package versions, and `minify`. ⚠ That address is served with `immutable` for a year,
  so turning a constant into an option without hashing it serves the wrong file for that year, and
  nothing repairs it at the clients that cached it
- **buckets-4** - the generation names the whole plan where a bundle name names one bundle: the
  scope, the declared targets, both package versions and `minify`. ⚠ One module added to the scope
  renames most of the bundles under it, so a store that kept every plan in one directory would
  collect a full plan of dead files per deploy
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
  that into extra bytes rather than a missing module. ⚠ The rule is about the SOURCE, not the
  number: a hard-coded "no `Version/` means iOS 18" would break an in-app WebView on a real iOS 15
- **resolver-4** - an engine whose UA carries no authoritative version token does not get one
  invented. ⚠ The case that matters is the in-app WKWebView, which carries no `Version/` at all;
  a version built upwards there hands a thin bundle to what may be an old engine
- **resolver-5** - on iOS the engine is WebKit whatever the browser calls itself. ⚠ Both parsers
  answer `Chrome 140` to a `CriOS/` string, and handing that to compat as real Chrome builds a
  bundle far thinner than WebKit needs. Chrome on iPhone is 2.84% of world traffic

## Application

The scenarios: they coordinate the domain and the infrastructure and carry no rules of their own.

- **configure-1** - a misspelled option does not pass silently. ⚠ Afterwards nothing can tell "not
  set" from "set, spelled wrong", and the service runs on a default the developer did not ask for.
  The list of known names is the destructuring in the signature and nothing else, so the two cannot
  drift apart
- **configure-2** - what comes out has no half-filled fields: nothing downstream has to decide
  whether a path is absolute or a version is a range
- **configure-3** - the scope is required. ⚠ Falling back to the whole of core-js would work - at
  twice the buckets and several times the disk - and the developer would never hear about it
- **build-plan-1** - the plan is ready before the first request is taken; without it the matcher
  cannot name even the baseline. It is a step of its own for that reason: the warm-up reads it once
  and may run later or from outside, the matcher reads it on every request and from the first one
- **warm-1** - the baseline is built first and requests wait for it; everything else warms under
  traffic, because a miss goes to the baseline. ⚠ A failure to build the baseline is a startup
  failure: there is nothing to rise to, and holding requests with a 503 would need a retry policy
  and a redirect that cannot loop back on itself
- **warm-2** - building the same input twice is harmless, which is why there are no locks. The
  identifier is the hash of the input, so a duplicate build writes the same bytes under the same
  name; a stale lock would be a worse failure than the wasted CPU
- ⚠ **`targets: null` does not mean "no targets" to compat** - it sends compat looking for a
  browserslist config of its own. So the declaration is resolved once, in `configure`, where the
  project config either becomes the declaration or nothing does; and "everything" is spelled out
  (`ignoreBrowserslistConfig: true`) wherever a module list is asked for. Left to compat, the
  BASELINE alone would pick the config up and come out narrower than the plan around it
- **get-bundle-1** - under an identifier travel its own bytes and nothing else. ⚠ Substituting the
  baseline while a bucket is still cold is the shortcut that must not be taken: the address is
  served with `immutable` for a year, so that client keeps the wrong bundle for a year and the
  warm-up finishing changes nothing for them. A cold bucket is a redirect, not a body
- ⚠ **Unknown means the STORE does not have it**, not that the current plan does not name it. A page
  from the deploy before this one is already in a browser and its tag is parser-blocking, so a bundle
  the store still holds is served whoever planned it; how many deploys that survives is `retain`.
  Both misses cost a lookup in memory and nothing else

## UI

Delivery: everything that knows about the protocol. Only `adapter/express` knows about a framework.

- **serve-1** - the same file under the same address for a year, which is what the identifier has
  to be worth. ⚠ The moment something fixed by a constant becomes an option and stays out of the
  hash, one address serves the wrong file for a year, and nothing repairs it at the clients that
  cached it
- **serve-2** - the work done per request does not grow with what the client sent. An unknown
  identifier is a 404 and nothing else, and the `Accept-Encoding` parser stops after a fixed number
  of entries. ⚠ Otherwise the path is an amplifier: a cheap request against expensive work, and the
  request is written by whoever sent it
- ⚠ **`Accept-Encoding` is parsed, never searched.** Testing whether it contains `gzip` breaks on
  exactly `gzip;q=0` - the case the uncompressed copy is stored for. The uncompressed form is
  acceptable by default but ranked LAST: read as a full q=1 it would beat every coding the client
  asked for with a q of its own
- ⚠ **The ETag carries the encoding.** The gzip copy and the uncompressed one are different bytes
  under one identifier, and a shared tag lets a cache hand one to a client that asked for the other
- **script-tag-1** - the tag runs before the code that counts on it; arriving late is
  indistinguishable from not arriving
- **script-tag-2** - and never before the charset declaration, which is why that one is found by
  scanning rather than by a pattern. ⚠ A browser decides the encoding of a document from its first
  1024 bytes; a declaration pushed past that boundary stops working and the whole page is decoded
  wrong. ⚠ For the same class of reason the tag never goes in at position 0 of a document with a
  doctype: a doctype that is not first means quirks mode
- **script-tag-3** - a policy that blocks the tag fails where nobody looks: modern browsers stay
  quiet about it and the page breaks on the old ones the polyfills were for. A nonce is read from
  the response policy; a policy of hashes alone, or `strict-dynamic` without a nonce, cannot be
  fixed by anything we can put in the tag and is reported to the developer
- ⚠ The last-resort anchor, the first `<script`, can be inside a comment or a string, and the tag
  would go in there and never run. It is last for that reason - the anchors above it are the ones
  that matter in practice

## Infrastructure

- The UA parser is `bowser`, and the choice is about maintenance rather than accuracy: on
  everything but in-app iOS browsers it and the MIT branch of `ua-parser-js` agree, and there
  resolver-5 decides anyway. `ua-parser-js@2` is AGPL, and its `1.x` branch is marked legacy by its
  author. ⚠ It throws on an empty user agent, which is a visitor, not an incident
- **builder-1** - the whole target set of a bucket goes to the builder, never a representative.
  ⚠ `targets` decides two things at once in there - which modules are kept AND whether the syntax
  is downleveled - and there is no order between versions of different engines to pick a lowest
  from. Of 201 buckets built without an application scope, 185 hold more than one engine
- **builder-2** - an old bucket never receives syntax its engine cannot read. ⚠ This holds because
  of `ModernSyntax` in `@core-js/builder`, not because of anything here: should rolldown start
  emitting something newer, the engine fails to parse THE WHOLE FILE, which is a broken page rather
  than extra weight
- **bundles-1** - what comes out of the store is bytes, never a path. ⚠ A path would be shorter and
  would pin the store to a local disk forever - not because Redis or S3 are hard to write, but
  because every caller would already be built around a file
- **bundles-2** - the contract is asynchronous even where the implementation is not, so that moving
  to a networked store does not rewrite every caller
- **bundles-3** - a reader never sees a half-written bundle: it is written under a temporary name
  and renamed WITHIN THE SAME DIRECTORY. ⚠ A rename across a device boundary is not atomic and
  throws, so the OS temporary directory cannot be used here; without atomicity a reader gets a
  truncated file under a valid identifier, and `immutable` nails it into that cache for a year
- **bundles-4** - the store is one directory per generation, and the sweep runs after the new
  generation is warm, never before it. ⚠ A sweep that ran first would take the only bundles anything
  could be served from if this build failed. It removes only directories shaped like a generation -
  a store pointed at a path holding anything else loses nothing of it - never the generation being
  served, and never one younger than `retain` (an hour by default; `0` keeps only the current one,
  `null` sweeps nothing). Retention is what lets a page outlive the deploy that replaced it, and what
  makes a rollback find its bundles where it left them
- No disk is a working state, not a failure - no permission, no space, a read-only volume. It costs
  another warm-up at the next restart and is reported once
- The module-list port goes to `@core-js/compat`. It is a port, rather than a call from inside the
  domain, so that the bucket logic can be exercised on fixtures: a test that asserts how many
  buckets thirteen engines collapse into is a test that goes red on somebody else's commit
- Traffic shares come from `caniuse-lite`, not from `browserslist.coverage`. ⚠ That one answers
  with the share of exactly the version asked about: zero for 85% of the thresholds, and mobile
  Chrome carries all of its traffic on the single version browserslist knows - the warm-up queue
  would come out backwards. Folded onto thresholds by nearest-below, the 13 visitor engines account
  for about 96% of world traffic; the headset is not among the 19 agents `caniuse-lite` tracks, so
  its buckets carry no traffic and are warmed last

## Notes

- ⚠ `packages/core-js-polyfill-service/**` has to stay in the `sourceType: 'module'` list of
  `tests/eslint/eslint.config.js` - the default there is `script`, and the failure is a parse error
  on the first `import`
- `LICENSE` is copied into every package by `scripts/copy.mjs` and is gitignored per package, so a
  new package needs its own line in `.gitignore` or the copy shows up as an untracked file

## Tests

`npm run test-polyfill-service` - `tests/polyfill-service/`.
