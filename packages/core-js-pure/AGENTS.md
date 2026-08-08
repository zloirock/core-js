# @core-js/pure

The pure / ponyfill flavor: the same features exposed as module exports, without touching anything global.

## Target environment

Same baseline as `core-js`: engines about IE11, ES5 syntax plus the runtime additions listed in `packages/core-js/AGENTS.md`.

## What is hand-written here

`override/`, and at the package root `README.md`, `package.tpl.json` and `.npmignore`. Everything else is copied from `packages/core-js` by `scripts/copy.mjs` and wiped by `scripts/clean.mjs` on every `npm run prepare` - which is to say on every `npm test`, `npm run lint` and `refresh`, so an edit anywhere else is silently lost almost immediately.

`override/` mirrors the paths it replaces: `override/internals/x.js` overwrites the copied `internals/x.js` after the copy step, `override/modules/y.js` overwrites `modules/y.js`.

An override is the heavy instrument, and not the first one to reach for. When a shared module only needs to behave differently in the pure flavor, it branches on the `internals/is-pure` constant in place - dozens of modules do - and the whole file stays shared. Write an override only when the two implementations genuinely diverge.

`clean.mjs` keeps a whitelist of hand-written files at the package root - a new one has to be added there, or it disappears on the next prepare.

## Semantics

- No global built-in may be added or mutated, on any code path, including feature detection. The one deliberate exception is the `__core-js_shared__` store that `internals/shared-store.js` installs - shared state and debugging info live there by design, do not "fix" it
- Everything must work when the corresponding global built-in is missing, broken, or replaced
- The pure flavor gives no guarantee about `.name` of the exported methods - `make-built-in` is a no-op here
- The whole TypedArray family is stubbed out, constructors included: the overrides are empty and the entry points still resolve, to an empty object
