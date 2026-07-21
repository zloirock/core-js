# e2e-libs transpile + throughput suite — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **⚠️ Post-implementation note — the shipped `tests/e2e-libs/` code is the source of truth, not the verbatim snippets below.** Review/execution changed several things after this plan was authored: Task 4's `runtimeBuild` plugin order was corrected to **`[babel, …, unplugin]`** (babel first — raw Rollup ignores unplugin's `enforce`, so array order decides; the `[unplugin, babel]` shown below was wrong); the `stripComments` pass and the naive `isES5-ish` grep were dropped (ES5-ness is verified by an acorn `ecmaVersion:5` parse instead); `byName` was never shipped; the exercise has **24** checks (not 20); `rxjs` resolved to `^7.8.2`; and code-review hardened the runners (isolated child-process pre-flight, `injections>0`/empty-`checks` gates, `lib.methods` iteration, per-cell error isolation, HTML escaping). Read the committed files.

**Goal:** Build a registry-driven suite under `tests/e2e-libs/` that runs a library through `@core-js/unplugin` in two tiers — a **throughput** benchmark across all bundlers, and a **runtime** tier that combines Babel (syntax → ES5) with unplugin (stdlib polyfills) to emit self-checking ES5/IE11 artifacts — seeded with **RxJS**.

**Architecture:** A `libraries.mjs` registry describes each library (name, tiers, exercise path, methods). `build.mjs` holds the bundling core: per-bundler throughput builders, a rollup+Babel+unplugin runtime builder emitting UMD ES5, temp-entry generation, and an injection recorder. Three runners consume it — `throughput.mjs` (measure + report), `artifacts.mjs` (ES5 bundle + HTML self-check + node pre-flight + manifest), `snapshot.mjs` (injection regression). The RxJS exercise is deterministic, headless, and self-verifying (`run()` returns `{ results, checks }`, each check carries its own `pass`).

**Tech Stack:** Node 22 (nvm: `~/.nvm/versions/node/v22.20.0/bin/node`), `@core-js/unplugin` (workspace), rollup + rolldown + esbuild + vite + webpack + rspack + rsbuild + farm, `@rollup/plugin-babel` + `@babel/preset-env`, rxjs ^7.

---

## Conventions for the executor

- **Node binary:** this environment has no `node` on PATH. Use `~/.nvm/versions/node/v22.20.0/bin/node` (call it `NODE` below). If a different node ≥22.18 is on PATH, that is fine too.
- **Commits are GATED.** The user's standing rule is *"commit only when I say."* Each task ends with a `git add` + commit **command written out**, but the executor must **stage only and pause for the user's go-ahead before actually committing** (or batch all commits to the end on the user's word). Do not push. Everything lands on branch `v4`.
- **Do not touch** `tests/e2e-d3/` or branch `e2e-d3-unplugin`.
- All new files live under `tests/e2e-libs/`.
- Spec: `docs/superpowers/specs/2026-07-16-e2e-libs-transpile-throughput-suite-design.md`.

## File structure

| File | Responsibility |
|---|---|
| `tests/e2e-libs/package.json` | deps (bundlers + babel + rxjs) |
| `tests/e2e-libs/.gitignore` | ignore `node_modules/`, `.tmp/`, `artifacts/`, `report/` |
| `tests/e2e-libs/exercises/rxjs.mjs` | deterministic RxJS exercise → `run()` returning `{ results, checks }` |
| `tests/e2e-libs/check-exercise.mjs` | dev helper: run one exercise raw, print pass/fail |
| `tests/e2e-libs/libraries.mjs` | registry of libraries |
| `tests/e2e-libs/build.mjs` | bundling core: entry gen, throughput builders, runtime UMD builder, injection recorder |
| `tests/e2e-libs/throughput.mjs` | tier-1 runner + `report/` |
| `tests/e2e-libs/artifacts.mjs` | tier-2 emitter: ES5 UMD + `index.html` + node pre-flight + `manifest.json` |
| `tests/e2e-libs/snapshot.mjs` | injection snapshot per (lib × method) |
| `tests/e2e-libs/snapshots/*.txt` | committed baselines (generated in Task 7) |

---

## Task 1: Scaffold package + install

**Files:**
- Create: `tests/e2e-libs/package.json`
- Create: `tests/e2e-libs/.gitignore`

- [ ] **Step 1: Create `tests/e2e-libs/package.json`**

```json
{
  "name": "tests/e2e-libs",
  "type": "module",
  "private": true,
  "devDependencies": {
    "@babel/core": "^7.24.0",
    "@babel/preset-env": "^7.24.0",
    "@farmfe/core": "^1.7.11",
    "@rollup/plugin-babel": "^6.0.4",
    "@rollup/plugin-commonjs": "^29.0.3",
    "@rollup/plugin-node-resolve": "^16.0.3",
    "@rsbuild/core": "^2.1.5",
    "@rspack/core": "^2.1.3",
    "esbuild": "^0.28.1",
    "rolldown": "^1.1.5",
    "rollup": "^4.62.2",
    "rxjs": "^7.9.0",
    "vite": "^8.1.4",
    "webpack": "^5.108.4"
  }
}
```

- [ ] **Step 2: Create `tests/e2e-libs/.gitignore`**

```gitignore
node_modules/
.tmp/
artifacts/
report/
```

- [ ] **Step 3: Install**

Run: `cd tests/e2e-libs && ~/.nvm/versions/node/v22.20.0/bin/npm install`
(If npm is not co-located with that node, use whatever `npm` pairs with node ≥22.18.)
Expected: installs without error; `tests/e2e-libs/node_modules/rxjs` exists.

- [ ] **Step 4: Verify rxjs + babel resolve**

Run: `~/.nvm/versions/node/v22.20.0/bin/node -e "console.log(require.resolve('rxjs',{paths:['tests/e2e-libs']}))"` — from repo root.
Expected: prints a path ending in `rxjs/dist/...`.

- [ ] **Step 5: Stage + (gated) commit**

```bash
git add tests/e2e-libs/package.json tests/e2e-libs/package-lock.json tests/e2e-libs/.gitignore
git commit -m "test(e2e-libs): scaffold suite package"
```

---

## Task 2: RxJS exercise + self-check helper

**Files:**
- Create: `tests/e2e-libs/exercises/rxjs.mjs`
- Create: `tests/e2e-libs/check-exercise.mjs`

- [ ] **Step 1: Create `tests/e2e-libs/exercises/rxjs.mjs`**

```js
// Deterministic, headless RxJS exercise for the e2e-libs suite.
//
// `run()` returns a Promise of { results, checks }. `results` is a JSON-serializable dump of
// every pipeline's output; `checks` is a list of { label, actual, expected, pass } where each
// entry computed its own `pass` via a JSON deep-equal - so consumers (HTML harness, node
// pre-flight) only render `pass`, they never need their own comparator.
//
// The surface is broad on purpose (creation / transform / filter / combine / subjects / errors /
// aggregate / promise-interop / virtual-time) to maximize the ECMAScript stdlib that core-js must
// inject for the ie:11 target: Promise, Symbol.iterator/observable, internal Map/Set, Array.from,
// plus the iterator-protocol usage that Babel's spread/for-of helpers introduce.
//
// No `async`/generator syntax here (only Promise.then chains) so the ES5 down-compile needs no
// regenerator runtime.
import {
  of, from, range, merge, concat, zip, combineLatest, forkJoin, throwError,
  BehaviorSubject, ReplaySubject, firstValueFrom, lastValueFrom,
  map, filter, reduce, scan, toArray, mergeMap, switchMap, concatMap,
  groupBy, bufferCount, pairwise, distinctUntilChanged, catchError,
  debounceTime, throttleTime,
} from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const collect = obs => firstValueFrom(obs.pipe(toArray()));

export function run() {
  const results = {};
  const checks = [];
  const check = (label, actual, expected) => {
    results[label] = actual;
    checks.push({ label, actual, expected, pass: eq(actual, expected) });
    return actual;
  };

  // --- synchronous subjects (no promises) ---
  const bs = new BehaviorSubject(0);
  const bsSeen = [];
  bs.subscribe(v => bsSeen.push(v));
  bs.next(1);
  bs.next(2);
  check('BehaviorSubject', bsSeen, [0, 1, 2]);

  const rs = new ReplaySubject(2);
  rs.next(1);
  rs.next(2);
  rs.next(3);
  const rsSeen = [];
  rs.subscribe(v => rsSeen.push(v));
  rs.complete();
  check('ReplaySubject_2', rsSeen, [2, 3]);

  // --- virtual-time (value-level, timing-agnostic) ---
  const debounced = [];
  new TestScheduler(() => {}).run(({ cold }) => {
    cold('a-b-c-d|', { a: 1, b: 2, c: 3, d: 4 }).pipe(debounceTime(10)).subscribe(v => debounced.push(v));
  });
  check('debounceTime_keepsLast', debounced, [4]);

  const throttled = [];
  new TestScheduler(() => {}).run(({ cold }) => {
    cold('a-b-c-d|', { a: 1, b: 2, c: 3, d: 4 }).pipe(throttleTime(10)).subscribe(v => throttled.push(v));
  });
  check('throttleTime_keepsFirst', throttled, [1]);

  // --- async operator pipelines ---
  return Promise.all([
    firstValueFrom(of(1, 2, 3, 4, 5).pipe(reduce((a, b) => a + b, 0))),
    collect(of(1, 2, 3).pipe(scan((a, b) => a + b, 0))),
    collect(range(1, 5).pipe(filter(x => x % 2 === 0))),
    collect(merge(of(1), of(2), of(3))),
    collect(concat(of(1, 2), of(3, 4))),
    collect(zip(of(1, 2, 3), of('a', 'b', 'c')).pipe(map(([n, s]) => `${ n }${ s }`))),
    collect(combineLatest([of(1), of(2)])),
    collect(forkJoin([of(1, 2), of(3, 4)])),
    collect(of(1, 2).pipe(mergeMap(x => of(x, x * 10)))),
    collect(of(1, 2, 3).pipe(switchMap(x => of(x * 10)))),
    collect(of(1, 2).pipe(concatMap(x => of(x, x)))),
    collect(of(1, 2, 3, 4, 5, 6).pipe(groupBy(x => x % 2), mergeMap(g => g.pipe(toArray())))),
    collect(range(1, 6).pipe(bufferCount(2))),
    collect(of(1, 2, 3).pipe(pairwise())),
    collect(of(1, 1, 2, 2, 3, 1).pipe(distinctUntilChanged())),
    collect(throwError(() => new Error('boom')).pipe(catchError(() => of('recovered')))),
    firstValueFrom(of(42)),
    lastValueFrom(from([7, 8, 9])),
  ]).then(r => {
    check('reduce_sum', r[0], 15);
    check('scan_running', r[1], [1, 3, 6]);
    check('filter_evens', r[2], [2, 4]);
    check('merge_sync', r[3], [1, 2, 3]);
    check('concat', r[4], [1, 2, 3, 4]);
    check('zip_map', r[5], ['1a', '2b', '3c']);
    check('combineLatest', r[6], [[1, 2]]);
    check('forkJoin', r[7], [[2, 4]]);
    check('mergeMap', r[8], [1, 10, 2, 20]);
    check('switchMap', r[9], [10, 20, 30]);
    check('concatMap', r[10], [1, 1, 2, 2]);
    check('groupBy', r[11], [[1, 3, 5], [2, 4, 6]]);
    check('bufferCount', r[12], [[1, 2], [3, 4], [5, 6]]);
    check('pairwise', r[13], [[1, 2], [2, 3]]);
    check('distinctUntilChanged', r[14], [1, 2, 3, 1]);
    check('catchError', r[15], ['recovered']);
    check('firstValueFrom', r[16], 42);
    check('lastValueFrom', r[17], 9);
    return { results, checks };
  });
}
```

- [ ] **Step 2: Create `tests/e2e-libs/check-exercise.mjs`**

```js
// Dev helper: run ONE exercise raw (no bundler, no polyfills, full node realm) and report which
// self-checks pass. This validates the exercise's own logic and its expected literals before any
// bundling. Usage: node check-exercise.mjs [exercisePathOrLibName]  (default: exercises/rxjs.mjs)
import { dirname, isAbsolute, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const arg = process.argv[2] ?? 'exercises/rxjs.mjs';
const target = isAbsolute(arg) ? arg : join(HERE, arg.includes('/') ? arg : `exercises/${ arg }.mjs`);

const mod = await import(pathToFileURL(target).href);
const { checks } = await mod.run();
const bad = checks.filter(c => !c.pass);
for (const c of checks) {
  console.log(`${ c.pass ? '✓' : '✗' } ${ c.label }${ c.pass ? '' : `  actual=${ JSON.stringify(c.actual) } expected=${ JSON.stringify(c.expected) }` }`);
}
console.log(`\n${ checks.length } checks, ${ bad.length } failing`);
if (bad.length) process.exitCode = 1;
```

- [ ] **Step 3: Run the self-check**

Run: `~/.nvm/versions/node/v22.20.0/bin/node tests/e2e-libs/check-exercise.mjs`
Expected: `20 checks, 0 failing`, all `✓`.

**If a check fails:** the printed `actual` is RxJS's real output for that pipeline — that is a fact about the library, not a polyfill bug. Update the corresponding `expected` literal in `rxjs.mjs` to the observed value, then re-run until `0 failing`. (Most likely candidates for a surprise: `combineLatest` / `forkJoin` synchronous emission shape.)

- [ ] **Step 4: Stage + (gated) commit**

```bash
git add tests/e2e-libs/exercises/rxjs.mjs tests/e2e-libs/check-exercise.mjs
git commit -m "test(e2e-libs): add self-verifying RxJS exercise"
```

---

## Task 3: Library registry

**Files:**
- Create: `tests/e2e-libs/libraries.mjs`

- [ ] **Step 1: Create `tests/e2e-libs/libraries.mjs`**

```js
// Registry of libraries exercised by the suite. Each entry declares which tiers it participates
// in (`throughput` = measured; `runtime` = emitted as an ES5 artifact and verified) and the path
// to its deterministic exercise module (must export `run()` -> Promise<{ results, checks }>).
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

export const libraries = [
  {
    name: 'rxjs',
    tiers: ['throughput', 'runtime'],
    exercise: join(HERE, 'exercises', 'rxjs.mjs'),
    methods: ['entry-global', 'usage-global', 'usage-pure'],
    notes: 'Headless reactive pipelines; exercises Promise/Symbol/Map/Set + Babel iterator helpers.',
  },
];

export const librariesIn = tier => libraries.filter(l => l.tiers.includes(tier));
export const byName = name => libraries.find(l => l.name === name);
```

- [ ] **Step 2: Verify it loads**

Run: `~/.nvm/versions/node/v22.20.0/bin/node -e "import('./tests/e2e-libs/libraries.mjs').then(m=>console.log(m.libraries.map(l=>l.name+':'+l.tiers.join('+')).join(', ')))"`
Expected: `rxjs:throughput+runtime`

- [ ] **Step 3: Stage + (gated) commit**

```bash
git add tests/e2e-libs/libraries.mjs
git commit -m "test(e2e-libs): add library registry"
```

---

## Task 4: Bundling core (`build.mjs`)

**Files:**
- Create: `tests/e2e-libs/build.mjs`

This module has no standalone test; Tasks 5–7 exercise it. It is verified by a smoke build at the end of this task.

- [ ] **Step 1: Create `tests/e2e-libs/build.mjs`**

```js
// Bundling core for the e2e-libs suite. Provides:
//   - method/phase enumeration and unplugin option construction
//   - temp-entry generation (entries live UNDER this dir so bare `rxjs`/`core-js` imports resolve)
//   - throughputBuilders: one per bundler, returns { bytes }, does NOT execute (measures processing)
//   - runtimeBuild: rollup + @rollup/plugin-babel (syntax->ES5) + unplugin(post) (stdlib), UMD output
//   - captureInjections: which core-js/@core-js/pure specifiers unplugin emits (bundler-invariant)
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { babel } from '@rollup/plugin-babel';
import unplugin from '@core-js/unplugin';
import { mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = dirname(fileURLToPath(import.meta.url));
const TMP = join(HERE, '.tmp');

export const METHODS = ['entry-global', 'usage-global', 'usage-pure'];
export const phasesFor = m => (m === 'entry-global' ? [undefined] : ['pre', 'post', 'pre+post']);

export function pluginOpts(method, phase) {
  const opts = { method, version: '4.0', mode: 'full', targets: { ie: 11 } };
  if (phase) opts.phase = phase;
  return opts;
}

// Write a temp entry for (exercise, method), run fn(entryPath), always clean up. The entry sits
// under HERE/.tmp so its `import 'core-js'` / the exercise's `import 'rxjs'` resolve to the suite's
// node_modules. `label` disambiguates concurrent-safe filenames (runs are sequential anyway).
export async function withEntry(exerciseAbs, method, label, fn) {
  await mkdir(TMP, { recursive: true });
  const file = join(TMP, `entry-${ label }.mjs`);
  const spec = JSON.stringify(exerciseAbs);
  const body = method === 'entry-global'
    ? `import 'core-js';\nexport { run } from ${ spec };\n`
    : `export { run } from ${ spec };\n`;
  await writeFile(file, body);
  try {
    return await fn(file);
  } finally {
    await rm(file, { force: true });
  }
}

async function withTmpOut(fn) {
  await mkdir(TMP, { recursive: true });
  const dir = join(TMP, `out-${ process.hrtime.bigint() }`);
  await mkdir(dir, { recursive: true });
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// -------- throughput builders: (entry, plugin|null) -> { bytes } --------
// plugin === null is the baseline (pure library bundle, no injection).
export const throughputBuilders = {
  async rollup(entry, plugin) {
    const build = await rollup({ input: entry, plugins: [plugin, nodeResolve(), commonjs()].filter(Boolean), onwarn() {} });
    try {
      const { output } = await build.generate({ format: 'es' });
      return { bytes: Buffer.byteLength(output[0].code) };
    } finally {
      await build.close();
    }
  },
  async rolldown(entry, plugin) {
    const { build } = await import('rolldown');
    return withTmpOut(async dir => {
      const file = join(dir, 'out.mjs');
      await build({ input: entry, platform: 'node', treeshake: false, plugins: [plugin].filter(Boolean), output: { format: 'esm', file, externalLiveBindings: false, keepNames: true } });
      return { bytes: (await stat(file)).size };
    });
  },
  async esbuild(entry, plugin) {
    const { build } = await import('esbuild');
    const result = await build({ entryPoints: [entry], plugins: [plugin].filter(Boolean), bundle: true, write: false, format: 'esm', platform: 'node' });
    return { bytes: Buffer.byteLength(result.outputFiles[0].text) };
  },
  async vite(entry, plugin) {
    const { build } = await import('vite');
    const result = await build({
      root: HERE, logLevel: 'silent',
      build: { write: false, minify: false, lib: { entry, formats: ['es'], fileName: 'bundle' }, commonjsOptions: { include: [/core-js/, /node_modules/] } },
      resolve: { dedupe: ['core-js'] },
      plugins: [plugin].filter(Boolean),
    });
    const [{ output }] = Array.isArray(result) ? result : [result];
    return { bytes: Buffer.byteLength(output[0].code) };
  },
  async webpack(entry, plugin) {
    const wp = (await import('webpack')).default;
    return webpackLike(wp, entry, plugin);
  },
  async rspack(entry, plugin) {
    const { rspack } = await import('@rspack/core');
    return webpackLike(rspack, entry, plugin);
  },
  async rsbuild(entry, plugin) {
    const { createRsbuild } = await import('@rsbuild/core');
    return withTmpOut(async dir => {
      const rsbuild = await createRsbuild({
        cwd: HERE,
        rsbuildConfig: {
          mode: 'production', logLevel: 'error',
          source: { entry: { index: entry } },
          plugins: [plugin].filter(Boolean),
          output: { target: 'node', distPath: { root: dir }, filenameHash: false, minify: false, sourceMap: false },
          performance: { chunkSplit: { strategy: 'all-in-one' } },
          tools: { rspack: { output: { module: true, library: { type: 'module' } }, experiments: { outputModule: true } } },
        },
      });
      await rsbuild.build();
      return { bytes: (await stat(join(dir, 'index.js'))).size };
    });
  },
  async farm(entry, plugin) {
    const { build, Logger } = await import('@farmfe/core');
    const noop = () => {};
    const silent = Object.assign(new Logger({ level: 'error' }), { info: noop, warn: noop, debug: noop, trace: noop, infoOnce: noop, warnOnce: noop, logMessage: noop });
    return withTmpOut(async dir => {
      await build({
        root: HERE, logger: silent, plugins: [plugin].filter(Boolean),
        compilation: {
          input: { index: entry },
          output: { path: dir, targetEnv: 'node', format: 'cjs' },
          minify: false, sourcemap: false, lazyCompilation: false, persistentCache: false,
          partialBundling: { enforceResources: [{ name: 'index', test: ['.+'] }] },
        },
        server: { hmr: false },
      });
      return { bytes: (await stat(join(dir, 'index.js'))).size };
    });
  },
};

async function webpackLike(compiler, entry, plugin) {
  return withTmpOut(async dir => {
    const instance = compiler({
      mode: 'production', devtool: false, entry,
      output: { path: dir, filename: 'out.mjs', module: true, library: { type: 'module' } },
      experiments: { outputModule: true }, optimization: { minimize: false }, plugins: [plugin].filter(Boolean),
    });
    try {
      const stats = await new Promise((res, rej) => instance.run((e, s) => (e ? rej(e) : res(s))));
      if (stats.hasErrors()) throw new Error(stats.compilation.errors[0].message);
    } finally {
      await new Promise(res => instance.close(res));
    }
    return { bytes: (await stat(join(dir, 'out.mjs'))).size };
  });
}

export const THROUGHPUT_BUNDLERS = ['rollup', 'rolldown', 'esbuild', 'vite', 'webpack', 'rspack', 'rsbuild', 'farm'];

// The unplugin adapter instance for a bundler + (method, phase).
export const u = (bundler, method, phase) => unplugin[bundler](pluginOpts(method, phase));

// -------- runtime builder: ES5 UMD via Babel(syntax) + unplugin(post, stdlib) --------
const babelOpts = {
  babelHelpers: 'inline',
  babelrc: false,
  configFile: false,
  extensions: ['.js', '.mjs', '.cjs'],
  // core-js internals are already ES5; skip them (unplugin still injects them, they just aren't re-babeled).
  exclude: [/[\\/]core-js(-pure)?[\\/]/, /[\\/]@core-js[\\/]/],
  presets: [['@babel/preset-env', { targets: { ie: '11' }, useBuiltIns: false, corejs: false, modules: false }]],
};

// Returns the ES5 UMD bundle code (global name `E2E`, exposing `run`). For usage-* methods pass a
// phase; entry-global ignores it. unplugin runs at enforce:'post' so it sees Babel's helper output.
export async function runtimeBuild(exerciseAbs, method, phase) {
  const effPhase = method === 'entry-global' ? undefined : (phase ?? 'post');
  return withEntry(exerciseAbs, method, `rt-${ method }-${ effPhase ?? 'x' }`, async entry => {
    const build = await rollup({
      input: entry,
      plugins: [u('rollup', method, effPhase), babel(babelOpts), nodeResolve(), commonjs()],
      onwarn() {},
    });
    try {
      const { output } = await build.generate({ format: 'umd', name: 'E2E', esModule: false });
      return output[0].code;
    } finally {
      await build.close();
    }
  });
}

// -------- injection recorder (bundler-invariant set) --------
const SPEC_RE = /(?:from|import|require\()\s*["']((?:core-js|@core-js\/pure)\/[^"']+)["']/g;
function recorder(sink) {
  return { name: 'injection-recorder', transform(code) { for (const m of code.matchAll(SPEC_RE)) sink.add(m[1].replace(/\.m?js$/, '')); return null; } };
}

export async function captureInjections(exerciseAbs, method) {
  return withEntry(exerciseAbs, method, `snap-${ method }`, async entry => {
    const sink = new Set();
    const build = await rollup({ input: entry, plugins: [u('rollup', method), recorder(sink), nodeResolve(), commonjs()], onwarn() {} });
    await build.generate({ format: 'es' });
    await build.close();
    return [...sink].sort();
  });
}
```

- [ ] **Step 2: Smoke-build one throughput cell + one runtime cell + injections**

Create a throwaway probe and run it (delete after):

Run:
```bash
~/.nvm/versions/node/v22.20.0/bin/node --input-type=module -e "
import { throughputBuilders, runtimeBuild, captureInjections, withEntry, u } from './tests/e2e-libs/build.mjs';
import { byName } from './tests/e2e-libs/libraries.mjs';
const rx = byName('rxjs');
const bytes = await withEntry(rx.exercise, 'usage-global', 'probe', e => throughputBuilders.rollup(e, u('rollup','usage-global','post')));
console.log('throughput rollup usage-global/post bytes:', bytes.bytes);
const code = await runtimeBuild(rx.exercise, 'usage-global', 'post');
console.log('runtime UMD bytes:', Buffer.byteLength(code), 'isES5-ish:', !/=>|\bclass\b|\`/.test(code.slice(0,5000)));
console.log('injections usage-global:', (await captureInjections(rx.exercise,'usage-global')).length);
"
```
Expected: three lines printed, `throughput ... bytes` > 0, `runtime UMD bytes` > 0, `injections usage-global` > 0 (a positive count of injected core-js modules).

- [ ] **Step 3: Stage + (gated) commit**

```bash
git add tests/e2e-libs/build.mjs
git commit -m "test(e2e-libs): add bundling core (throughput + runtime UMD + recorder)"
```

---

## Task 5: Throughput runner (`throughput.mjs`)

**Files:**
- Create: `tests/e2e-libs/throughput.mjs`

- [ ] **Step 1: Create `tests/e2e-libs/throughput.mjs`**

```js
// Tier-1 runner: measure how fast each bundler processes a library WITH unplugin vs a plugin-less
// baseline, across method x phase. Emits report/throughput.md + report/throughput.json.
//
// Metric per cell = median of N total-bundle-ms WITH the plugin, minus the per-bundler baseline
// (plugin-less bundle of the usage entry). An internal parse-vs-inject split would need to
// instrument unplugin's transform hook and is intentionally out of scope here.
//
// Usage:  node throughput.mjs [libFilter] [bundlerFilter]     (N via env N=, default 5)
import { throughputBuilders, THROUGHPUT_BUNDLERS, phasesFor, withEntry, u, captureInjections, HERE } from './build.mjs';
import { librariesIn } from './libraries.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const N = Number(process.env.N ?? 5);
const [libFilter, bundlerFilter] = process.argv.slice(2);
const libs = librariesIn('throughput').filter(l => !libFilter || l.name === libFilter);
const bundlers = THROUGHPUT_BUNDLERS.filter(b => !bundlerFilter || b === bundlerFilter);
const METHODS = ['entry-global', 'usage-global', 'usage-pure'];

async function median(fn) {
  const times = [];
  let out;
  for (let i = 0; i < N; i++) {
    const t0 = process.hrtime.bigint();
    out = await fn();
    times.push(Number(process.hrtime.bigint() - t0) / 1e6);
  }
  times.sort((a, b) => a - b);
  return { ms: times[Math.floor(times.length / 2)], out };
}

const rows = [];
for (const lib of libs) {
  // per-(bundler) baseline: plugin-less bundle of the usage entry (no core-js import)
  const baseline = {};
  for (const name of bundlers) {
    try {
      const { ms } = await withEntry(lib.exercise, 'usage-global', `base-${ name }`, e => median(() => throughputBuilders[name](e, null)));
      baseline[name] = ms;
    } catch (err) {
      baseline[name] = null;
      console.log(`baseline ${ name }: ERROR ${ (err.message || err).slice(0, 120) }`);
    }
  }

  for (const name of bundlers) {
    for (const method of METHODS) {
      for (const phase of phasesFor(method)) {
        const label = `${ lib.name }/${ name }/${ method }${ phase ? `/${ phase }` : '' }`;
        try {
          const injections = (await captureInjections(lib.exercise, method)).length;
          const { ms, out } = await withEntry(lib.exercise, method, `${ name }-${ method }-${ phase ?? 'x' }`,
            e => median(() => throughputBuilders[name](e, u(name, method, phase))));
          const base = baseline[name];
          const overhead = base == null ? null : +(ms - base).toFixed(1);
          rows.push({ lib: lib.name, bundler: name, method, phase: phase ?? '', ms: +ms.toFixed(1), baseline: base == null ? null : +base.toFixed(1), overhead, bytes: out.bytes, injections });
          console.log(`✓ ${ label }: ${ ms.toFixed(0) }ms (overhead ${ overhead ?? '?' }ms, ${ out.bytes }b, ${ injections } inj)`);
        } catch (err) {
          rows.push({ lib: lib.name, bundler: name, method, phase: phase ?? '', error: (err.message || String(err)).split('\n')[0].slice(0, 160) });
          console.log(`✗ ${ label }: ${ (err.message || err).split('\n')[0].slice(0, 160) }`);
        }
      }
    }
  }
}

// -------- report --------
const REPORT = join(HERE, 'report');
await mkdir(REPORT, { recursive: true });
await writeFile(join(REPORT, 'throughput.json'), `${ JSON.stringify({ N, rows }, null, 2) }\n`);

const cells = [['entry-global', ''], ['usage-global', 'pre'], ['usage-global', 'post'], ['usage-global', 'pre+post'], ['usage-pure', 'pre'], ['usage-pure', 'post'], ['usage-pure', 'pre+post']];
const head = ['bundler', 'entry', 'ug:pre', 'ug:post', 'ug:p+p', 'up:pre', 'up:post', 'up:p+p'];
const find = (b, m, p) => rows.find(r => r.bundler === b && r.method === m && r.phase === p);
const fmt = c => (!c ? '—' : c.error ? 'ERR' : `${ c.overhead ?? c.ms }`);
let md = `# Throughput (overhead ms over baseline, median of ${ N })\n\n`;
for (const lib of libs) {
  md += `## ${ lib.name }\n\n| ${ head.join(' | ') } |\n| ${ head.map(() => '---').join(' | ') } |\n`;
  for (const b of bundlers) {
    md += `| ${ b } | ${ cells.map(([m, p]) => fmt(find(b, m, p))).join(' | ') } |\n`;
  }
  md += `\n_Cells show unplugin overhead (bundle-with-plugin − plugin-less baseline), in ms. See throughput.json for absolute ms, bytes, injection counts._\n\n`;
}
await writeFile(join(REPORT, 'throughput.md'), md);
console.log(`\nreport → ${ join(REPORT, 'throughput.md') }`);
if (rows.some(r => r.error)) process.exitCode = 1;
```

- [ ] **Step 2: Run a fast filtered smoke (N=1, one bundler)**

Run: `N=1 ~/.nvm/versions/node/v22.20.0/bin/node tests/e2e-libs/throughput.mjs rxjs rollup`
Expected: 7 `✓` lines (entry-global + 3 usage-global phases + 3 usage-pure phases), then `report → .../throughput.md`. `tests/e2e-libs/report/throughput.md` and `throughput.json` created.

- [ ] **Step 3: (optional) full run**

Run: `~/.nvm/versions/node/v22.20.0/bin/node tests/e2e-libs/throughput.mjs rxjs`
Expected: 56 cells across 8 bundlers. Some bundlers may print `✗`/`ERR` (config edge cases) — record them; they are data, not blockers. `report/` regenerated.

- [ ] **Step 4: Stage + (gated) commit**

```bash
git add tests/e2e-libs/throughput.mjs
git commit -m "test(e2e-libs): add throughput runner + report"
```

---

## Task 6: Artifacts runner (`artifacts.mjs`)

**Files:**
- Create: `tests/e2e-libs/artifacts.mjs`

- [ ] **Step 1: Create `tests/e2e-libs/artifacts.mjs`**

```js
// Tier-2 emitter: for each runtime-tier library x method, build an ES5 UMD bundle (Babel syntax +
// unplugin stdlib), run a node PRE-FLIGHT (does it execute and do all self-checks pass, full
// realm), then write a self-contained index.html that reruns the checks in-browser and paints a
// green/red banner. A manifest.json lists everything for manual upload to BrowserStack/SauceLabs.
//
// The node pre-flight is NOT a stripped realm - it only proves the ES5 bundle runs and computes
// correctly at all, catching gross breakage before a manual IE11 pass.
//
// Usage:  node artifacts.mjs [libFilter]
import { runtimeBuild, HERE } from './build.mjs';
import { librariesIn } from './libraries.mjs';
import { createRequire } from 'node:module';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const [libFilter] = process.argv.slice(2);
const libs = librariesIn('runtime').filter(l => !libFilter || l.name === libFilter);
const ART = join(HERE, 'artifacts');
const TMP = join(HERE, '.tmp');

// Load a UMD bundle in node (full realm) via a temp .cjs and return its `run()` result.
async function preflight(code) {
  await mkdir(TMP, { recursive: true });
  const f = join(TMP, `preflight-${ process.hrtime.bigint() }.cjs`);
  await writeFile(f, code);
  try {
    const mod = require(f);
    return await mod.run();
  } finally {
    delete require.cache[require.resolve(f)];
    await rm(f, { force: true });
  }
}

function html(lib, method, checks) {
  const rows = checks.map(c =>
    `<tr class="${ c.pass ? 'ok' : 'bad' }"><td>${ c.label }</td><td>${ c.pass ? 'PASS' : 'FAIL' }</td></tr>`).join('');
  const failing = checks.filter(c => !c.pass).length;
  return `<!doctype html>
<html><head><meta charset="utf-8"><title>e2e-libs ${ lib }/${ method }</title>
<style>
  body{font:14px/1.5 system-ui,sans-serif;margin:2rem;max-width:720px}
  #banner{padding:1rem;border-radius:8px;font-weight:700;font-size:18px;color:#fff}
  .green{background:#166534}.red{background:#991b1b}.wait{background:#525252}
  table{border-collapse:collapse;margin-top:1rem;width:100%}
  td{border:1px solid #ccc;padding:4px 8px}
  tr.ok td:nth-child(2){color:#166534;font-weight:700}
  tr.bad td:nth-child(2){color:#991b1b;font-weight:700}
</style></head>
<body>
  <h1>${ lib } — <code>${ method }</code></h1>
  <div id="banner" class="wait">running…</div>
  <p>Pre-flight in node recorded ${ checks.length - failing }/${ checks.length } passing. This page reruns the same checks in <em>this</em> browser.</p>
  <table id="tbl"><thead><tr><th>check</th><th>result</th></tr></thead><tbody>${ rows }</tbody></table>
  <script src="bundle.js"></script>
  <script>
    E2E.run().then(function (res) {
      var checks = res.checks, bad = checks.filter(function (c) { return !c.pass; });
      var b = document.getElementById('banner');
      b.className = bad.length ? 'red' : 'green';
      b.textContent = bad.length ? ('FAIL — ' + bad.length + '/' + checks.length + ' checks failed') : ('PASS — all ' + checks.length + ' checks green in this browser');
      var body = checks.map(function (c) {
        return '<tr class="' + (c.pass ? 'ok' : 'bad') + '"><td>' + c.label + '</td><td>' + (c.pass ? 'PASS' : 'FAIL') + '</td></tr>';
      }).join('');
      document.querySelector('#tbl tbody').innerHTML = body;
    }).catch(function (err) {
      var b = document.getElementById('banner');
      b.className = 'red';
      b.textContent = 'ERROR — ' + (err && err.message ? err.message : err);
    });
  </script>
</body></html>
`;
}

const manifest = [];
let failed = 0;
for (const lib of libs) {
  for (const method of lib.methods) {
    const label = `${ lib.name }/${ method }`;
    try {
      const code = await runtimeBuild(lib.exercise, method); // usage-* default to phase 'post'
      const { checks } = await preflight(code);
      const bad = checks.filter(c => !c.pass);
      const dir = join(ART, lib.name, method);
      await mkdir(dir, { recursive: true });
      await writeFile(join(dir, 'bundle.js'), code);
      await writeFile(join(dir, 'index.html'), html(lib.name, method, checks));
      manifest.push({ lib: lib.name, method, dir: join(lib.name, method), bytes: Buffer.byteLength(code), checks: checks.length, preflightFailing: bad.length });
      console.log(`${ bad.length ? '✗' : '✓' } ${ label }: ${ checks.length - bad.length }/${ checks.length } preflight (${ Buffer.byteLength(code) }b)`);
      if (bad.length) { failed++; for (const c of bad) console.log(`    FAIL ${ c.label } actual=${ JSON.stringify(c.actual) }`); }
    } catch (err) {
      failed++;
      manifest.push({ lib: lib.name, method, error: (err.message || String(err)).split('\n')[0].slice(0, 200) });
      console.log(`✗ ${ label }: ${ (err.message || err).split('\n')[0].slice(0, 200) }`);
    }
  }
}

await mkdir(ART, { recursive: true });
await writeFile(join(ART, 'manifest.json'), `${ JSON.stringify(manifest, null, 2) }\n`);
console.log(`\nartifacts → ${ ART }\nmanifest → ${ join(ART, 'manifest.json') }`);
console.log('Upload each <lib>/<method>/index.html (+ bundle.js beside it) to BrowserStack/SauceLabs IE11 for the real-engine check.');
if (failed) process.exitCode = 1;
```

- [ ] **Step 2: Run the artifact build for rxjs**

Run: `~/.nvm/versions/node/v22.20.0/bin/node tests/e2e-libs/artifacts.mjs rxjs`
Expected: 3 lines (`✓ rxjs/entry-global`, `✓ rxjs/usage-global`, `✓ rxjs/usage-pure`), each `20/20 preflight`. Files created:
- `tests/e2e-libs/artifacts/rxjs/{entry-global,usage-global,usage-pure}/bundle.js`
- `.../index.html`
- `tests/e2e-libs/artifacts/manifest.json`

**If pre-flight fails** with `X is not a function`/`is not defined`: a stdlib usage was not injected (phase/target issue) — confirm unplugin ran at `post` and `targets:{ie:11}`. **If** `regeneratorRuntime is not defined`: rxjs pulled in an async/generator that Babel down-compiled; add `regenerator-runtime` to `package.json`, `npm install`, and prepend `import 'regenerator-runtime/runtime.js';` inside `withEntry`'s generated body in `build.mjs` (before the `export`).

- [ ] **Step 3: Sanity-check the ES5 bundle is actually ES5**

Run: `grep -nE '=>|\bclass |\`|\.\.\.[a-zA-Z]' tests/e2e-libs/artifacts/rxjs/usage-global/bundle.js | head`
Expected: no arrow functions / `class` / template literals from OUR code path (a few may appear inside string literals; the point is the executable code is ES5). If genuine ES5 syntax leaks appear in executable positions, widen Babel's `include` (rxjs must not be excluded).

- [ ] **Step 4: Stage + (gated) commit**

```bash
git add tests/e2e-libs/artifacts.mjs
git commit -m "test(e2e-libs): add ES5 artifact emitter + node pre-flight + HTML harness"
```

---

## Task 7: Injection snapshot (`snapshot.mjs`)

**Files:**
- Create: `tests/e2e-libs/snapshot.mjs`
- Create (generated): `tests/e2e-libs/snapshots/<lib>.<method>.txt`

- [ ] **Step 1: Create `tests/e2e-libs/snapshot.mjs`**

```js
// Injection snapshot: records WHICH core-js / @core-js/pure specifiers unplugin injects for each
// library x method, and flags drift. This uses the plain unplugin pipeline (no Babel) so the set
// is stable and comparable - it captures what unplugin does with the SOURCE, independent of Babel
// version. Babel-helper-driven injections (a function of the Babel version) are intentionally not
// snapshotted here.
//
// Usage:  node snapshot.mjs             compare vs snapshots/<lib>.<method>.txt (fail on drift)
//         node snapshot.mjs --update    (re)write baselines
import { captureInjections } from './build.mjs';
import { libraries } from './libraries.mjs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const SNAP = join(HERE, 'snapshots');
const UPDATE = process.argv.includes('--update') || process.env.UPDATE === '1';

async function baseline(file) {
  try {
    return (await readFile(file, 'utf8')).split('\n').map(l => l.trim()).filter(Boolean);
  } catch {
    return null;
  }
}

await mkdir(SNAP, { recursive: true });
let drift = 0;
for (const lib of libraries) {
  for (const method of lib.methods) {
    const set = await captureInjections(lib.exercise, method);
    const file = join(SNAP, `${ lib.name }.${ method }.txt`);
    const base = await baseline(file);
    console.log(`\n=== ${ lib.name }/${ method } — ${ set.length } injected ===`);
    for (const s of set) console.log(`  ${ s }`);
    if (UPDATE || !base) {
      await writeFile(file, `${ set.join('\n') }\n`);
      console.log(base ? `  → updated (${ set.length })` : `  → created (${ set.length })`);
      continue;
    }
    const now = new Set(set);
    const old = new Set(base);
    const added = set.filter(s => !old.has(s));
    const removed = base.filter(s => !now.has(s));
    if (!added.length && !removed.length) {
      console.log('  ✓ matches baseline');
    } else {
      drift++;
      for (const s of added) console.log(`  + ${ s }  (new)`);
      for (const s of removed) console.log(`  - ${ s }  (gone)`);
    }
  }
}
if (drift) {
  console.log(`\n✗ injection snapshot drifted in ${ drift } cell(s) — rerun with --update if intended`);
  process.exitCode = 1;
} else {
  console.log('\n✓ injection snapshot done');
}
```

- [ ] **Step 2: Create the baselines**

Run: `~/.nvm/versions/node/v22.20.0/bin/node tests/e2e-libs/snapshot.mjs --update`
Expected: 3 blocks (`rxjs/entry-global`, `rxjs/usage-global`, `rxjs/usage-pure`), each printing a positive injected count and `→ created`. Files `tests/e2e-libs/snapshots/rxjs.*.txt` written.

- [ ] **Step 3: Verify comparison mode is stable**

Run: `~/.nvm/versions/node/v22.20.0/bin/node tests/e2e-libs/snapshot.mjs`
Expected: each cell `✓ matches baseline`, final `✓ injection snapshot done`, exit 0.

- [ ] **Step 4: Stage + (gated) commit**

```bash
git add tests/e2e-libs/snapshot.mjs tests/e2e-libs/snapshots/
git commit -m "test(e2e-libs): add injection snapshot + rxjs baselines"
```

---

## Task 8: Suite README

**Files:**
- Create: `tests/e2e-libs/README.md`

- [ ] **Step 1: Create `tests/e2e-libs/README.md`**

```markdown
# e2e-libs

Runs real libraries through `@core-js/unplugin` in two tiers. Seeded with RxJS.

- **throughput** — measure unplugin's processing cost across all bundlers.
  `node throughput.mjs [libFilter] [bundlerFilter]` → `report/throughput.md` + `.json`
- **runtime** — Babel (syntax → ES5) + unplugin (stdlib polyfills) → ES5 UMD + self-checking HTML.
  `node artifacts.mjs [libFilter]` → `artifacts/<lib>/<method>/{bundle.js,index.html}` + `manifest.json`
  A node pre-flight runs first; the real IE11 check is manual (upload the HTML to BrowserStack/SauceLabs).
- **injection snapshot** — `node snapshot.mjs [--update]` → `snapshots/<lib>.<method>.txt`
- **exercise self-check** — `node check-exercise.mjs [lib]`

Node ≥ 22.18 required. `npm install` here first. Add libraries in `libraries.mjs`.

core-js only polyfills the ECMAScript stdlib (+ a few web primitives); it cannot make DOM/Canvas/
Worker/Node-stream code run on IE11. The runtime tier therefore only holds headless, computational
libraries whose sole legacy barrier is syntax + stdlib.
```

- [ ] **Step 2: Stage + (gated) commit**

```bash
git add tests/e2e-libs/README.md
git commit -m "docs(e2e-libs): add suite README"
```

---

## Self-review

**Spec coverage**

- §1–4 tiering, registry, RxJS seed → Task 3 registry (`tiers`), Task 2 exercise. ✓
- §5 suite layout → Tasks 1–8 create exactly those files (+ `check-exercise.mjs` and `README.md`, small helpers). ✓
- §6 pipeline: throughput plugins / runtime Babel(`useBuiltIns:false`)+unplugin(`post`)/inline helpers/rollup-only-for-ES5 → Task 4 `runtimeBuild` + `babelOpts` + `throughputBuilders`. ✓
- §7 RxJS exercise (operator list, `results`+`checks`, TestScheduler, avoid async) → Task 2. All spec operators covered except `takeWhile`/`sample`/`retry`/`withLatestFrom`/`race`/`AsyncSubject`/`Subject`/`take`/`generate`/`defer`/`exhaustMap`/`count`/`window` — **narrowed** to a confidently-hand-verifiable subset (spec §7 said "broad, to maximize surface", not exhaustive). The kept set already exercises Promise/Symbol/Map/Set/iterator helpers, which is the polyfill point. Not a gap.
- §8 throughput metric (total + baseline delta, N=5, bytes, injections) → Task 5. ✓
- §9 artifacts (ES5 build, bundle.js, index.html self-check, node pre-flight, manifest.json) → Task 6. ✓
- §10 commands → README (Task 8) + each runner's argv. ✓
- §11 phasing (RxJS only, no monsters, no webpack-runtime, no CI, gated commits) → honored; webpack runtime path explicitly deferred. ✓
- §12 open Qs → webpack-runtime deferred (default taken); rxjs import path uses bare `rxjs` (Task 1 Step 4 verifies resolution). ✓

**Placeholder scan:** no TBD/TODO; every file has complete code; the two "if it fails" notes (Task 2 Step 3, Task 6 Step 2) are concrete recovery instructions for known library-behavior/toolchain forks, not deferred work.

**Type/name consistency:** `run()` → `{ results, checks }` with `{ label, actual, expected, pass }` used identically in exercise, `check-exercise.mjs`, `artifacts.mjs` HTML + pre-flight. `withEntry(exerciseAbs, method, label, fn)`, `throughputBuilders[name](entry, plugin|null)`, `runtimeBuild(exerciseAbs, method, phase?)`, `captureInjections(exerciseAbs, method)`, `librariesIn(tier)`, `byName(name)` — signatures match across Tasks 4–7. UMD global `E2E` set by `runtimeBuild` and read by both the HTML (`E2E.run()`) and pre-flight (`require(...).run()`). ✓

**Known risk flagged in-plan:** synchronous emission shape of `combineLatest`/`forkJoin` (Task 2 Step 3 recovery) and possible `regeneratorRuntime` need (Task 6 Step 2 recovery). Both have concrete, deterministic fixes in-line.
