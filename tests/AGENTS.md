# tests

## Target environment

Runners, harnesses and fixture tooling are Node `^22.18.0 || >=24.11.0`, mostly zx scripts started through `npm run zxi`. Inside such a script the zx globals are ambient - do not import them - and the npm script is the only way to start one: a bare `node` loses the bootstrap's ambient globals and local dependencies; the rest of the bootstrap's contract, the list of those globals included, is in `scripts/AGENTS.md`. That is the tier of everything here except the code that is itself under test, and the suites that run such code state their own tier in their own `AGENTS.md`. They are not the same: the compat probes sit on the polyfill baseline, while the QUnit suites are modern syntax transpiled before it runs.

## Map

| Directory | Command | Covers |
|---|---|---|
| `unit-global/`, `unit-pure/` | `npm run test-unit-node`, `test-unit-karma`, `test-unit-bun` | QUnit tests, one file per polyfill module |
| `unit-node/`, `karma/`, `unit-bun/`, `unit-browser/` | the runners above | environments the unit bundles run in: Node, browsers via Karma and Playwright, Bun, and static HTML pages for manual runs |
| `e2e-usage-pure/` | `npm run test-e2e-usage-pure`, `test-e2e-usage-pure-karma` | runtime behavior of polyfilled code after transformation |
| `transpiler-fixtures/` | the two plugin runners below | shared input/output fixtures for both emitters |
| `babel-plugin/`, `babel-plugin-v7/` | `npm run test-babel-plugin`, `-unit`, `-v7`, `-unit-v7` | `@core-js/babel-plugin` against `@babel/core` 8 and 7 |
| `unplugin/` | `npm run test-unplugin`, `test-unplugin-unit`, `test-unplugin-roundtrip` | `@core-js/unplugin` - the fixture gate holds the default (AST) engine structurally to the babel baseline; roundtrip is the no-op print gate |
| `polyfill-provider/` | `npm run test-polyfill-provider` | the provider itself: resolvers, detectors, helpers, options, cross-parser equivalence, escape-analysis domains |
| `transpiler-differential/` | `npm run test-transpiler-differential`, `test-transpiler-differential-cache` | a generated corpus checked five ways: native == babel == unplugin at runtime, matching import sets, the stripped-realm oracle, the AST-engine print-through leg (printed source must reproduce native), and the AST engine's own rewrite (import set equal to the text leg's, output reproducing native in both realms). Evaluations are cached across runs, so a repeat costs what the edit changed - run it bare, the `pure` / `babel` / `unplugin` tokens narrow what is under test, not the runtime. The second command is the cache's own suite |
| `transpiler-integration/` | `npm run test-transpiler-integration` | real bundlers x methods x phases, runtime-verified |
| `transpiler-perf/` | `npm run test-transpiler-perf` | transpiler perf gates and complexity-class discriminators |
| `e2e-libs/` | `npm run e2e-libs`, `e2e-libs-runtime`, `e2e-libs-pipeline`, `e2e-libs-throughput` | real libraries taken to the ES5 floor through both providers, executed in Node and in real IE11 |
| `compat/` | `npm run compat-node`, `compat-bun`, `compat-deno`, `compat-hermes`, `compat-rhino` | runtime feature probes, one runner per engine |
| `compat-data/`, `compat-tools/` | `npm run test-compat-data`, `test-compat-tools` | that every module in the data has a probe and vice versa; and the query API |
| `entries/` | `npm run test-entries` | that every entry point loads and pulls exactly the modules the compat data claims |
| `type-definitions/` | `npm run test-type-definitions`, `-all`, `npm run types-coverage` | `.d.ts` behavior and coverage |
| `builder/` | `npm run test-builder` | `@core-js/builder` |
| `promises/` | `npm run test-promises` | the Promises/A+ and ES6 promise conformance suites, in both flavors |
| `test262/` | `npm run test262` | the official ECMAScript test suite |
| `eslint/` | `npm run test-eslint` | the flat config itself lives here, in `eslint.config.js` |
| `codespell/` | `npm run codespell [paths]` | spelling; edit loops scope it with paths, gates run it bare |
| `publint/` | `npm run test-publint` | packaging metadata of every workspace package |
| `helpers/` | - | the custom QUnit assertions, the fixture builders and the environment constants every suite imports; restricted like the pure tests, because they import it |
| `wpt-url-resources/` | - | Web Platform Tests data used by `unit-global/web.url.constructor.js` and its pure twin |
| `debug-get-dependencies/` | `npm run debug-get-dependencies` | prints the resolved dependency metadata of every module |

`bundles/` directories are generated and gitignored. The suites build the bundles they need; the inner scripts they delegate to - `test-unit-node-run`, `test-e2e-usage-pure-node` and the like - reuse prebuilt ones. Two silent gaps. The karma unit legs also load `packages/core-js-bundle/index.js` and `minified.js`, which come from `npm run bundle-package`, so run `npm run bundle` after changing runtime code. And nothing here regenerates the pipeline's output, which `entries/`, the transpiler suites and the type tests all read - so `npm run prepare`, plus `npm run build-types` for the types, comes first.

`npm run test-transpiling` is the composite that runs every plugin and provider suite - the fixture and unit runners, e2e, the differential, integration and perf. It is a VERY heavy run and the final gate of transpiler work: one pass, right before the work is handed off - a single plugin's fixtures cannot see a regression that shifts both emitters the same way - and a superset, so putting a member on the same invocation line runs that suite twice. The edit loop takes the suite nearest the change instead, and the differential is normally scoped there by its combinable tokens: `pure` skips the usage-global leg, `babel` / `unplugin` runs one emitter - `npm run test-transpiler-differential pure babel` is the typical loop shape for emitter work. `e2e-libs/` is not part of it and runs beside it in `npm test`, because it verifies the same emitters against code nobody wrote for them; the leg that decides the real floor there is the browser one of the `e2e-libs` CI job, so a plugin change can be green in everything you ran and red in CI.

CI is not the same run as yours, in three ways: the suites differ in both directions - for example, `test262` and the `check` group are in no workflow, while the wider type-definition matrix runs only there; karma adds IE11 and the lint job installs `codespell`, and both join a local run only on a machine that already carries them, so the bottom of the baseline and the spelling gate are exercised there unconditionally; and the heavier jobs are matrixed over the three operating systems and the whole supported Node range, of which you run one point. So a green CI is not a green `npm test` nor the other way round, and a single red matrix cell is a real failure.

The denser suites carry their own `AGENTS.md` with the conventions of the area; the rows above are the map, not the whole story.

## Rules

- A test that exposes a bug is never deleted or retargeted
- Lock all the behavior a fix touches, including boundaries, negatives and forms that already passed - not only the case that failed
- Assertions come from the specification and from the feature's identity, never from the branches of the implementation under test
- Suites that run both in Node and in browsers must branch their `window`-dependent assertions on the environment instead of assuming a browser
