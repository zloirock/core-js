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

## Notes

- ⚠ `packages/core-js-polyfill-service/**` has to stay in the `sourceType: 'module'` list of
  `tests/eslint/eslint.config.js` - the default there is `script`, and the failure is a parse error
  on the first `import`
- `LICENSE` is copied into every package by `scripts/copy.mjs` and is gitignored per package, so a
  new package needs its own line in `.gitignore` or the copy shows up as an untracked file

## Tests

`npm run test-polyfill-service` - `tests/polyfill-service/`.
