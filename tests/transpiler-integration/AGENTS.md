# transpiler-integration

The plugins driven through the real build tools rather than through a test harness: every supported bundler, every injection method, every phase, and the result executed. This is where an assumption about a hook, a module id or a chunk shape breaks - a fixture cannot see any of that.

## Target environment

Node `^22.18.0 || >=24.11.0`, with its own `package.json` pinning the bundlers. Run with `npm run test-transpiler-integration`. Each case builds into a temporary directory and runs the bundle, so the suite is slow by nature.

## Layout

- `bundlers.mjs` - the bundler adapters themselves, one per tool, shared with `tests/e2e-libs`: this is the directory that pins the bundlers, and a suite that consumes them names it in the `zxi.installExternalDirs` field of its own `package.json`. `makeBundlers` takes only what its two callers genuinely disagree on
- `runner.mjs` - the matrix: those adapters crossed with the three methods and the phases each one supports, plus the two builders that are not plain bundler runs - babel-plugin, which has no phase of its own, and bun, which builds and verifies inside bun
- `input-<method>.js` - the source for each injection method, plus `input-phases.js` for the pre/post interaction and `input-dynamic.js` for dynamic import
- `lazy-chunk.js` - the body of a lazily imported module, written so its value can only be right if the polyfill reached the chunk, not just the loader

## Rules

- The assertion is the runtime result of the built bundle, not its text - plus a check that every generated reference it contains is actually declared, which is how a mangled or half-applied injection is caught
- No targets are passed: the cases run with `mode: 'full'` and a pinned `core-js` version, so what gets injected depends on the features the inputs use, not on a browser list
- Adding a bundler means adding an adapter to `bundlers.mjs`, and checking whether it belongs to the sets in `@core-js/unplugin` that name bundlers by hand. `tests/e2e-libs` derives its own list from that same map, so the adapter is the single place the tool is configured and the two suites differ only in the options `makeBundlers` takes
- Keep the inputs exercising features that really are polyfilled, or the run passes without any injection having happened
