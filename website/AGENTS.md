# website

The generator of the documentation site. Its content comes from `docs/`.

## Target environment

Two of them:

- the build itself is Node `^22.18.0 || >=24.11.0`, with its own `package.json` and Vite as the bundler
- the pages are held to the same baseline as the library: the site of a polyfill has to run where the polyfill runs. `vite.config.mjs` states it - the legacy plugin targets IE 11, Chrome 38, Safari 7.1 and Firefox 15, and the CSS target is IE 11 - so `src/js/` and `src/scss/` are written against that, not against a current browser. The legacy plugin injects no polyfills of its own; the pages load a built core-js bundle instead

## Commands

```sh
npm run build-website-local    # what you want locally: builds core-js, gathers the docs inputs, renders the current branch
npm run build-website          # only the rendering step, over whatever is already in the tree
```

`index.mjs` is that rendering step: clean, Vite build, page generation, asset copy. Nothing here builds several versions - `scripts/runner.mjs`, `runner.sh` and `scripts/helpers.mjs` do, and they are not run from here: two workflows ship exactly those three files to the deploy server, where a bare `node` runs them with no repository, no `node_modules` and no zx around. So `runner.mjs` and `helpers.mjs` must stay on `node:` builtins alone - do not convert them to the zx ambient globals the rest of the build enjoys. A push to `master` covers every version in the registry; a push to any other branch builds that branch alone, into its own path.

## Layout

- `config/config.mjs` - paths of the input and output directories
- `config/versions.json` - the versions registry: label, branch or tag, output path, and exactly one default
- `scripts/helpers.mjs` - shared by the local and the deployed build: the version registry, branch checkout and install, and the copy steps for blog posts, `CHANGELOG.md` / `CONTRIBUTING.md` / `SECURITY.md`, Babel standalone and the core-js bundles
- `build.mjs` - page generation, including the menu and the `{docs-version}` substitution
- `src/` - the site's own assets, hand-written except `src/public/`
- `dist/`, `templates/`, `src/public/` - generated and gitignored

## Rules

- The build writes into `docs/web/`. Files it puts there are outputs, not sources - see `docs/AGENTS.md`
- Adding a version means an entry in `config/versions.json`; the default flag belongs to exactly one of them
- `{docs-version}` is resolved here, so a link written without it in `docs/` cannot be fixed at build time
