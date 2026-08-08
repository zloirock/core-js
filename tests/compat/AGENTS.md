# compat tests

Runtime feature-detection probes backing the data of `@core-js/compat`, plus one runner per engine.

## Target environment

Same syntax tier as the polyfill code - engines about IE11, ES5, as described in `packages/core-js/AGENTS.md` - because the probes have to run wherever the data is measured, down to the oldest engine in the table. The opposite holds for built-ins: unlike the polyfill sources, a probe is *supposed* to touch the modern ones, and the lint config allows it exactly here.

`tests.js` runs under Node, Bun, Deno, Hermes and Rhino through the runners below, and in browsers through `browsers-runner.js` and `index.html`.

Older versions in `data.mjs` are recorded history, not a target: they do not lower the bar for this file.

Getting the syntax wrong here costs more than elsewhere - a parse error does not fail one probe, it kills the entire run for that engine.

## Rules

- A probe returns a truthy value when the engine's implementation is good enough to use. Presence is enough only where no engine ever shipped it broken; everywhere else the probe exercises the behavior that was wrong somewhere, with a link to the bug it stands for. Data that claims support for a broken implementation is worse than no data at all
- Every module added to `packages/core-js-compat/src/data.mjs` needs a probe here under the same module name, and the check runs both ways: a probe with no data entry fails too. An `esnext.` module may be covered by its `es.` probe
- `compat-data.js` and `rhino.jar` are generated or fetched and gitignored; the `*-adapter.mjs` files, `common-runner.js` and `index.html` are runner plumbing, and a new runner file also has to be listed in `metadata.json`
- Validate the data with `npm run test-compat-data`. To measure an engine, run its probe script with that engine installed: `npm run compat-node`, `compat-bun`, `compat-deno`, and `compat-hermes` / `compat-rhino` with the path to the binary or the jar as an argument. `npm run compat-node json` and `compat-deno json` print the result as JSON instead of a report; browsers are measured by opening `index.html`
