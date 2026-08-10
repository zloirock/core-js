# scripts

Build, bundling and maintenance scripts for the monorepo.

## Target environment

Node `^22.18.0 || >=24.11.0`, running under `zx` through the `zxi` bootstrap:

```sh
npm run zxi [time] [cd] path/to/script.mjs
```

That means, inside such a script:

- the `zx` globals are ambient - do not import them
- `globalsZX` in `tests/eslint/eslint.config.js` is the list of them, and the lint config enforces it: an undeclared global is reported as undefined. The list is curated, not everything `zx` injects, so a feature a script needs is declared there first
- `fs` is fs-extra rather than `node:fs`, so `pathExists`, `outputFile` and the rest of it are available, and `glob` is globby
- `$.verbose` is on
- if the script's own directory contains a `package.json`, `zxi` installs its dependencies first and prefers its local binaries. A `"zxi": { "install": [...] }` field there names further directories to install, for a suite that imports a module from another one - such a module resolves its dependencies where it lives, not where it is imported from. One level only: a listed directory's own field is not followed
- `time` prints the duration, `cd` runs the script with its own directory as the working directory

The path is resolved against the repository root, not the current directory, so `zxi` is run from the root and given a root-relative path.

Not everything here is a zx script: `prepare-monorepo.mjs` runs before dependencies exist, so it uses only `node:` builtins and plain `node`.

## The generation pipeline

`prepare.mjs` is the whole of `npm run prepare`, and the order is a dependency chain, not a preference:

- `clean.mjs` deletes what the following steps regenerate - the entry layers of `packages/core-js`, the test bundles, and everything in `packages/core-js-pure` outside a whitelist of hand-written files. A new hand-written file there has to join that whitelist or it disappears on the next prepare. No script of its own, it only runs as part of prepare
- `build-entries-and-types/` (`npm run build-entries`) turns the feature registry into the entry points and `entries.json`; it has its own `AGENTS.md`
- `copy.mjs` copies `core-js` into `core-js-pure`, lays `override/` over the result, and distributes `LICENSE` to every package. Also has no script of its own
- `build-compat/` (`npm run build-compat`) generates the `.json` of `@core-js/compat` from its `src/*.mjs`, plus `tests/compat/compat-data.js`. It runs last because it reads the `entries.json` that `build-entries-and-types/` wrote

Type definitions come from that same directory (`npm run build-types`), but not from this pipeline - they are built in the lint gate.

## The rest

Run them through the npm script, never with a bare `node` - the bootstrap is what supplies the ambient globals and the local dependencies. Several script names do not match their file names, which is the other reason not to guess.

- `zxi.mjs` (`npm run zxi`) - the bootstrap described above
- `prepare-monorepo.mjs` (`npm run prepare-monorepo`, alias `p`) - the dependency side: wipes `node_modules`, copies `package.tpl.json` to `package.json`, installs
- `bundle-package/` (`npm run bundle-package`) - the browser bundle of the library, plain and minified. The modern variant is a second run, `npm run bundle-package esmodules`; the full set of shipped bundles is both
- `bundle-tests/` (`npm run bundle-tests`, or `bundle-tests-unit` and `bundle-e2e-usage-pure` separately) - the QUnit and e2e bundles under `tests/bundles/`, and the index files that list what goes into them. `npm run bundle` is this plus `bundle-package`
- `check-unused-modules.mjs` (`npm run check-unused-modules`) - reports modules, internals and pure overrides that nothing references. It prints its findings without failing
- `check-compat-data-mapping.mjs` (`npm run check-mapping`) - compares the compat data against upstream release histories, so it goes online
- `check-dependencies/` (`npm run check-dependencies`) - reports outdated dependencies of every workspace, printing a table per package and failing nothing
- `check-actions/` (`npm run check-actions`) - checks the GitHub Actions versions; the one check that `npm run check` leaves out
- `canon/` (`npm run canon`) - canonical-helper search over the plugin packages and the `@core-js/compat` sources, to run before writing a new function or branch there; its `delta` subcommand audits a diff's added symbols afterwards. Has its own `AGENTS.md` with the command reference
- `update-version.mjs` (`npm run update-version`, alias `u`) - the version bump: rewrites the version and the year wherever they are spelled out, from the READMEs and `CHANGELOG.md` to `LICENSE`, the shared store of the runtime and the docs
- `prepublish.mjs` (runs as the first half of `npm run publish`) - the release gate; among other things it refuses to publish while the by-versions data still carries an `unreleased` bucket
- `downloads-by-versions.mjs` (`npm run downloads`) - npm download statistics grouped by version
- `usage/` (`npm run usage`) - measures core-js usage across the top sites, with a real browser

## Rules

- Console output convention: phase lines on green, labels, file names and numbers in cyan, rewrites in yellow, failures in red; no plain white base
