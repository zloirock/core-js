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

## Infrastructure

- The UA parser is `bowser`, and the choice is about maintenance rather than accuracy: on
  everything but in-app iOS browsers it and the MIT branch of `ua-parser-js` agree, and there
  resolver-5 decides anyway. `ua-parser-js@2` is AGPL, and its `1.x` branch is marked legacy by its
  author. ⚠ It throws on an empty user agent, which is a visitor, not an incident
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
