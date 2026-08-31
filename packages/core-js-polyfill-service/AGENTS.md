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

## Notes

- ⚠ `packages/core-js-polyfill-service/**` has to stay in the `sourceType: 'module'` list of
  `tests/eslint/eslint.config.js` - the default there is `script`, and the failure is a parse error
  on the first `import`
- `LICENSE` is copied into every package by `scripts/copy.mjs` and is gitignored per package, so a
  new package needs its own line in `.gitignore` or the copy shows up as an untracked file

## Tests

`npm run test-polyfill-service` - `tests/polyfill-service/`.
