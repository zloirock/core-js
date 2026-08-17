# transpiler-integration

The plugins driven through the real build tools rather than through a test harness: every supported bundler, every injection method, every phase, and the result executed. This is where an assumption about a hook, a module id or a chunk shape breaks - a fixture cannot see any of that.

## Target environment

Node `^22.18.0 || >=24.11.0`, with its own `package.json` pinning the bundlers. Run with `npm run test-transpiler-integration`. Each case builds into a temporary directory and runs the bundle, so the suite is slow by nature.

## Layout

- `bundlers.mjs` - the bundler adapters themselves, one per tool: everything each one needs to emit a single node-loadable file, so `runner.mjs` is left with the matrix. `root` is the only thing the caller supplies, because it is the only thing the module cannot know: vite, rsbuild and farm resolve from it and fall back to the working directory in silence
- `matrix.mjs` - the methods, the phases each one supports, and the plugin options that select them, shared with `tests/e2e-libs`. `deadline.mjs` - the bound a runner puts on a wait, beside it under the same contract. Neither pulls anything in, which is what lets that suite import them without installing this directory; keep it that way
- `runner.mjs` - the matrix: those adapters crossed with the three methods and the phases each one supports, plus the two builders that are not plain bundler runs - babel-plugin, which has no phase of its own, and bun, which builds and verifies inside bun
- `input-<method>.js` - the source for each injection method, plus `input-phases.js` for the pre/post interaction and `input-dynamic.js` for dynamic import
- `lazy-chunk.js` - the body of a lazily imported module, written so its value can only be right if the polyfill reached the chunk, not just the loader

## Rules

- The assertion is the runtime result of the built bundle, not its text - plus a check that every generated reference it contains is actually declared, which is how a mangled or half-applied injection is caught
- No targets are passed: the cases run with `mode: 'full'`, so what gets injected depends on the features the inputs use and not on a browser list. The core-js version is the installed one - `matrix.mjs` asks the provider for `node_modules` rather than naming a minor, so both bundler suites describe the workspace package they actually bundle
- Adding a bundler means adding an adapter to `bundlers.mjs` - and `runner.mjs` refuses to start unless that name is in `KNOWN_BUNDLERS` and, when the plugin classifies it as a chunk loader, in the dynamic-import leg too. It also means deciding what that tool's warnings do, and only `strictWarn` escalates: on the rollup family a specifier the plugin injected and the tool cannot resolve becomes an external import and the bundle comes back whole, so an adapter registered without it verifies a bundle the polyfill never reached. esbuild and the webpack family error on that themselves, so there `reportWarnings` only PRINTS what is left: those two hand warnings back as bare messages with no code to escalate on, so the plugin's own report of a module its parser could not read reaches the log and reddens nothing. rsbuild and farm have neither, both having turned their logging down, and nothing checks that either. The `pre+post` leg list is the one still kept by hand and checked by nothing: a bundler left out of it loses that coverage in silence, and the set that would answer for it - `PRE_POST_UNSAFE_BUNDLERS` - is private to the plugin
- Keep the inputs exercising features that really are polyfilled, or the run passes without any injection having happened
