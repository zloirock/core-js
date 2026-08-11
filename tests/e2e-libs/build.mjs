// Bundling core for the e2e-libs suite. Provides:
//   - method/phase enumeration and unplugin option construction
//   - temp-entry generation (entries live UNDER this dir so bare `rxjs`/`core-js` imports resolve)
//   - throughputBuilders: one per bundler, returns { bytes }, does NOT execute (measures processing)
//   - runtimeBuild: rollup + Babel (syntax->ES5, the suite's own Babel 7) + unplugin (post for usage-*,
//     pre for entry-global) (stdlib), UMD
//   - captureInjections: which core-js/@core-js/pure specifiers unplugin emits - via rollup ONLY,
//     so a runner must not read it as what some other bundler emitted
//   - reporting helpers shared by the runners: wireSize (minify+gzip), errorReason (one-line)
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import unplugin from '@core-js/unplugin';
import { transform as esbuildTransform } from 'esbuild';
import { parse as acornParse } from 'acorn';
import { makeBundlers } from '../transpiler-integration/bundlers.mjs';
import { createRequire } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve as resolvePath } from 'node:path';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';

const gzipP = promisify(gzip);

export const HERE = import.meta.dirname;
const TMP = join(HERE, '.tmp');

export const METHODS = ['entry-global', 'usage-global', 'usage-pure'];

// The two polyfill providers this repo ships. They are not interchangeable in shape: unplugin is a
// BUNDLER plugin, so it runs beside Babel and a `phase` decides whether it reads the source or
// Babel's output; `@core-js/babel-plugin` runs INSIDE the same Babel pass and therefore has no phase
// at all - one traversal, one result. That asymmetry is why the runtime tier treats babel-plugin as
// the REFERENCE and every unplugin phase as a delta against it (see runtime.mjs).
export const PROVIDERS = ['babel-plugin', 'unplugin'];

// `entry-global` carries no phase for either provider (it expands `import 'core-js'`, so its set is a
// function of `targets` alone), and babel-plugin carries none for any method.
export function phasesFor(m, provider = 'unplugin') {
  return provider === 'babel-plugin' || m === 'entry-global' ? [undefined] : ['pre', 'post', 'pre+post'];
}

function pluginOpts(method, phase) {
  const opts = { method, version: '4.0', mode: 'full', targets: { ie: 11 } };
  if (phase) opts.phase = phase;
  return opts;
}

// Write a temp entry for (exercise, method), run fn(entryPath), always clean up. The entry sits
// under HERE/.tmp so its `import 'core-js'` / the exercise's `import 'rxjs'` resolve to the suite's
// node_modules. `label` keeps the name readable; a pid+hrtime suffix makes it collision-safe across
// concurrent processes sharing the checkout, not just within one run.
export async function withEntry(exerciseAbs, method, label, fn) {
  await mkdir(TMP, { recursive: true });
  const file = join(TMP, `entry-${ label }-${ process.pid }-${ process.hrtime.bigint() }.mjs`);
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

// -------- throughput builders --------
// The adapters themselves are shared with `tests/transpiler-integration`, which is where the
// bundlers are pinned; an empty plugin list is the baseline, the plain library bundle with no
// injection. A corpus of real packages needs the whole of node_modules through vite's CommonJS
// interop, and rollup's warnings about third-party code are not ours to fix.
export const throughputBuilders = makeBundlers({
  root: HERE,
  commonjsInclude: [/core-js/, /node_modules/],
  quiet: true,
});

// farm is excluded from the active set: its resolver fails on the extensionless `core-js/modules/*`
// specifiers the GLOBAL methods inject whose name contains the substring `js` - `es.json.parse`,
// `web.url.to-json` - which node and every other bundler resolve through core-js's
// `exports: { "./modules/*": "./modules/*.js" }`. A name without that substring always resolves, and
// so does a specifier that genuinely ends in `.js`: farm reads the substring as "the extension is
// already there" and skips applying the exports target. Deterministic rather than graph-dependent,
// and `usage-pure` and the plugin-less baseline never reach it. A resolve hook delegating `core-js/*`
// to node's own resolver fixes it; we keep farm out rather than carry that shim until it is fixed
// upstream. Throughput-only either way - the runtime tier is rollup.
export const THROUGHPUT_BUNDLERS = Object.keys(throughputBuilders).filter(name => name !== 'farm');

// The unplugin adapter instance for a bundler + (method, phase).
export const u = (bundler, method, phase) => unplugin[bundler](pluginOpts(method, phase));

// -------- runtime builder: ES5 UMD via Babel(syntax) + a stdlib provider --------
// Babel runs through a small custom transform plugin (below) rather than @rollup/plugin-babel, so the
// suite's own @babel/core / @babel/preset-env drive the down-compile directly.
const localRequire = createRequire(join(HERE, 'package.json'));
let cachedToolchain;
function babelToolchain() {
  if (!cachedToolchain) {
    cachedToolchain = {
      core: localRequire('@babel/core'),
      preset: localRequire.resolve('@babel/preset-env'),
      ts: localRequire.resolve('@babel/preset-typescript'),
      // resolved to an absolute path rather than passed as the bare `'@core-js'` the fixture suites
      // use: Babel's own scoped-name resolution would look for it from the file being compiled, which
      // here is a library module deep in node_modules. Neither this package nor @core-js/unplugin is
      // declared in this suite's package.json - both arrive through the monorepo's workspace links at
      // the repo root, which is what `localRequire` walks up to.
      corejs: localRequire.resolve('@core-js/babel-plugin'),
    };
  }
  return cachedToolchain;
}

// -------- TypeScript sources --------
// Packages consumed as their TypeScript SOURCE instead of their published JS. This is what gives the
// `pre` phase something to be about: unplugin's own docs say `pre` "sees original source with full
// semantic context" while `post` loses the type info a sibling stripped - and on a graph of published
// JS that difference cannot exist, because there is no TS anywhere in it. Feed `.ts` in and the two
// phases stop being nested: `pre` reads type annotations (`onerror(error: Error)` -> `es.error.cause`)
// and resolves receivers from them, `post` reads Babel's helper output. Neither set contains the other.
//
// Only the packages that actually SHIP `src/**/*.ts` in their npm tarball are listed - domhandler,
// domelementtype and boolbase do not, so they stay JS and the graph is deliberately mixed, which is
// what a real TS project's node_modules looks like anyway.
//
// The redirect lives here rather than in libraries.mjs because it is a property of the toolchain (the
// rollup chain must resolve `.ts` and Babel must strip it), not of a fixture: any exercise importing
// `htmlparser2` gets the source build, and that is the point.
//
// NOTE for a future tier change: this only teaches ROLLUP about `.ts`. The throughput tier runs seven
// bundlers with no TS resolution and no Babel at all, so a library listed here must stay out of
// `tiers: ['throughput']` until each of those learns the same trick.
//
// All seven are DECLARED in this suite's package.json, and three of them (`css-what`,
// `dom-serializer`, `nth-check`) only ever arrive through another package's dependency graph - so a
// dependency cleanup reading "nothing imports these" would be wrong to drop them. The declaration is
// what keeps npm hoisting them to this directory's own `node_modules` root, which is the single place
// the path below looks; nested under a parent they would be invisible here and the fixture would fall
// back to published JS (loudly, via `assertTsSources`, but for no good reason).
export const TS_SOURCE_PACKAGES = new Set([
  'htmlparser2', 'domutils', 'dom-serializer', 'entities', 'css-select', 'css-what', 'nth-check',
]);
const NODE_MODULES = join(HERE, 'node_modules');
// Compared against module ids, which come from several plugins and from rollup itself. Ours are built
// with `join`/`resolve` and so carry the platform separator, but the IE11 leg of this suite runs on
// windows-2022, where a single normalized id from any of those sources would make a `startsWith` test
// silently answer `false` - and then every intra-package import resolves to nothing. Compare in one
// form instead; `recorder` and `runKarma` normalize for the same reason.
function toPosix(p) {
  return p.replaceAll('\\', '/');
}
const TS_SOURCE_ROOTS = [...TS_SOURCE_PACKAGES].map(name => toPosix(join(NODE_MODULES, name, 'src')));
function tsEntry(name) {
  return join(NODE_MODULES, name, 'src', 'index.ts');
}

// The snapshots do NOT guard this set, and it is worth knowing by how little. Dropping one package
// at a time from it, almost none of them move a baseline: the type-derived injections the fixture
// exists for come from a couple of origins each, so one origin alone is masked by the other. A
// package that stops shipping `src/` - pruned from a tarball, moved by a major - therefore falls back
// to its published JS with every gate still green, and the fixture goes on calling itself a
// TypeScript build while being half a JavaScript one.
//
// So assert the premise directly instead of hoping a baseline notices. This covers the case that can
// happen silently, an install that no longer has the sources; it deliberately says nothing about
// editing the set above, which is a visible code change with a diff to read.
// Once per process: `tsSources()` is constructed by every rollup chain in the suite.
let tsSourcesVerified = false;
function assertTsSources() {
  if (tsSourcesVerified) return;
  // A SCOPED name would pass every check below and still do nothing: `resolveId` splits a bare
  // specifier at the first `/`, so `@scope/pkg` arrives as `@scope`, never matches the set, and the
  // package resolves to its published JS with the whole matrix green - the same silent degradation
  // the missing-`src` check exists to stop, and one no baseline would notice either. Refuse it here
  // rather than teach `resolveId` a two-segment form no entry uses: an untested resolution path
  // would be its own way to be quietly wrong. Whoever adds the first scoped package writes both.
  const scoped = [...TS_SOURCE_PACKAGES].filter(name => name.startsWith('@'));
  if (scoped.length) {
    throw new Error(`TS_SOURCE_PACKAGES: ${ scoped.join(', ') } is scoped, which \`tsSources\` cannot `
      + 'resolve - it splits a bare specifier at the first `/`, so the name never matches and the '
      + 'package would silently build from its published JS. Teach `resolveId` the `@scope/name` form first.');
  }
  const missing = [...TS_SOURCE_PACKAGES].filter(name => !firstExistingFile([tsEntry(name)]));
  if (missing.length) {
    throw new Error(`TS_SOURCE_PACKAGES: no src/index.ts in ${ missing.join(', ') } - these packages are `
      + 'built from their TypeScript sources (see build.mjs); without them the htmlparser2 fixture '
      + 'silently degrades to a published-JS build. Reinstall, or drop them from the set deliberately.');
  }
  tsSourcesVerified = true;
}

// A directory has to be rejected explicitly, not just skipped: an extensionless specifier such as
// `./vocabularies/discriminator` makes the first candidate the path itself, and a bare `existsSync`
// answers `true` for the directory - which rollup then tries to read as a module.
//
// Sync on purpose. `resolveId` runs once per specifier, rollup resolves them concurrently, and an
// async hook here would buy nothing while making the hook's ordering against `nodeResolve` harder to
// reason about - which is the one property this plugin depends on.
function firstExistingFile(candidates) {
  for (const candidate of candidates) {
    // eslint-disable-next-line node/no-sync -- see above
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

// Resolve into the TS sources of the packages above. MUST sit before `nodeResolve()` in every chain:
// node resolution answers `htmlparser2` with the published `dist/**.js` (that is what the package's
// `exports` map says), and whichever hook answers first wins.
//
// Two shapes to cover, both taken from the real graph:
//   bare      `htmlparser2` / `entities/decode`  ->  <pkg>/src/index.ts / <pkg>/src/decode.ts
//   relative  `./Parser.js` from inside one of those `src` dirs  ->  ./Parser.ts
// The relative case is the TS-ESM idiom (the specifier names the file the compiler WILL emit, not the
// one on disk); node's resolver never does this mapping, so without it every intra-package import
// falls through to `nodeResolve` and resolves to nothing.
export function tsSources() {
  assertTsSources();
  return {
    name: 'e2e-ts-sources',
    resolveId(source, importer) {
      if (source.startsWith('.')) {
        if (!importer || TS_SOURCE_ROOTS.every(root => !toPosix(importer).startsWith(root))) return null;
        const abs = resolvePath(dirname(importer), source);
        return firstExistingFile([abs.replace(/\.[cm]?js$/, '.ts'), `${ abs }.ts`, join(abs, 'index.ts')]);
      }
      const [name, ...rest] = source.split('/');
      if (!TS_SOURCE_PACKAGES.has(name)) return null;
      const sub = rest.length ? rest.join('/') : 'index';
      return firstExistingFile([join(NODE_MODULES, name, 'src', `${ sub }.ts`), join(NODE_MODULES, name, 'src', sub, 'index.ts')]);
    },
  };
}

// `.d.ts` is deliberately NOT TypeScript here. Stripping one would erase it to an empty module and
// hand rollup a silently empty dependency; leaving it alone makes rollup's own parser reject it, which
// is the answer a declaration file in a runtime graph deserves. Nothing resolves one today - the
// candidates below are all built as `<name>.ts` - so this is the regex saying what it means rather
// than a live path.
export const TS_EXTENSION = /(?<!\.d)\.[cm]?ts$/;

// A rollup transform that down-compiles syntax to ES5 with a specific Babel core + preset-env.
// core-js internals are already ES5, so skip them (unplugin still injects them, unbabeled).
//
// The package boundary (`node_modules/` or `packages/`) is load-bearing, not decoration. Matching a
// bare `/core-js/` anywhere in the absolute module id also matches the CHECKOUT DIRECTORY - and
// `git clone` of this repo produces exactly that name - which excluded every module in the graph,
// silently reducing the whole ES5 down-compile to a no-op while `injections > 0` still held and the
// pre-flight (a modern node realm) still passed. Every cell printed green with exit 0. This checkout
// happens to be named `core-js-v4`, which is the only reason it was not visible here.
const BABEL_EXCLUDE = [/[/\\](?:node_modules|packages)[/\\](?:core-js(?:-pure)?|@core-js[/\\][^/\\]+)[/\\]/];
function babelSyntaxPlugin({ core, preset, ts, corejs }, { downCompile, coreJs = null }) {
  return {
    name: coreJs ? 'e2e-babel-syntax+core-js' : downCompile ? 'e2e-babel-syntax' : 'e2e-ts-strip',
    async transform(code, id) {
      if (BABEL_EXCLUDE.some(re => re.test(id))) return null;
      const typescript = TS_EXTENSION.test(id);
      // With `downCompile: false` there is nothing to do to a `.js` module - returning null leaves it
      // byte-identical instead of round-tripping it through Babel's printer, which is what "no
      // transforms" has to mean for the stage that measures it. `coreJs` never pairs with it: the
      // provider has to see every module, not just the `.ts` ones.
      if (!downCompile && !typescript) return null;
      // preset-typescript ONLY for `.ts` (see tsSources above). Presets apply in REVERSE order, so
      // listing it last is what makes it run FIRST - types have to be gone before preset-env starts
      // lowering. Adding it unconditionally would also be wrong in principle: it switches the parser
      // to TS for every file, and TS resolves `<T>x` and `a < b > (c)` differently from JS.
      const presets = downCompile ? [[preset, { targets: { ie: '11' }, useBuiltIns: false, modules: false }]] : [];
      if (typescript) presets.push([ts, {}]);
      // `useBuiltIns: false` above is what leaves the stdlib to a provider. When `coreJs` is set that
      // provider is @core-js/babel-plugin, running as a PLUGIN in this same pass rather than as a
      // second tool downstream - which is the whole difference being measured against unplugin.
      const out = await core.transformAsync(code, {
        filename: id, configFile: false, babelrc: false, sourceMaps: false, compact: false, presets,
        ...coreJs ? { plugins: [[corejs, coreJs]] } : {},
      });
      return out && typeof out.code === 'string' ? { code: out.code, map: null } : null;
    },
  };
}

// Public: the rollup Babel(syntax->ES5, + TS strip for `.ts`) transform. Used by runtimeBuild and by
// pipeline.mjs so both share the exact same Babel config.
//
// `coreJs` (optional) turns the same pass into the babel-plugin PROVIDER build: pass the plugin
// options and @core-js/babel-plugin injects the stdlib from inside this traversal. Left out, the pass
// only lowers syntax and the stdlib is somebody else's job (unplugin, downstream).
export function makeBabelPlugin(coreJs = null) {
  return babelSyntaxPlugin(babelToolchain(), { downCompile: true, coreJs });
}

// Public: TYPE ERASURE ONLY, for pipeline's stage [A] ("the library alone, no down-compile"). A
// TS-source library has no buildable "no transforms" state - rollup's own parser rejects `.ts` - so
// [A] strips types and stops there. Erasure is not a down-compile: what [A] exists to measure, the
// cost Babel's ES5 lowering adds on top of it, is still entirely in the [A] -> [B] delta. On a graph
// with no `.ts` in it this plugin is a no-op on every module.
export function makeTsStripPlugin() {
  return babelSyntaxPlugin(babelToolchain(), { downCompile: false });
}

// A rollup `onwarn` used by `runtimeBuild`, `captureInjections` and every build pipeline.mjs makes
// (its `timedBuild` covers stages [A]/[B]/[C] and the warm-up). It exists for the builds gated on
// unplugin's injections landing: swallowing UNRESOLVED_IMPORT there is not
// tidiness, it is the failure mode: rollup turns the unresolved specifier into an external
// `require(...)`, so the polyfill leaves the bundle while the node pre-flight still passes (node
// resolves what rollup would not) and the operator uploads something dead on arrival in a browser.
export function strictWarn(w) {
  if (w.code === 'UNRESOLVED_IMPORT' || w.code === 'MISSING_EXPORT') throw new Error(`${ w.code }: ${ w.message }`);
}

// The other half of the same guard, and NOT covered by strictWarn. rollup DOES warn about an
// externalised node builtin - MISSING_NODE_BUILTINS and MISSING_GLOBAL_NAME - but strictWarn only
// throws on UNRESOLVED_IMPORT / MISSING_EXPORT and drops every other code without a word, so the
// warning goes nowhere. An externalised specifier is a `require(...)` in the UMD header: fine in
// node, fatal in the browser these bundles exist for. Called by runtimeBuild and by pipeline's
// timedBuild (so [A]/[B]/[C] and the warm-up all get it), which is what stops the two builds that
// publish "the real IE11 bundle" drifting apart - they already did once, with only runtimeBuild
// carrying the check.
export function assertNoExternals(chunk, label) {
  if (chunk.imports.length) {
    throw new Error(`${ label }: bundle left ${ chunk.imports.length } import(s) external: ${ chunk.imports.join(', ') }`);
  }
}

// How many bytes of core-js actually reached the chunk. The injection COUNT cannot answer this: the
// recorder matches specifier text, which survives in the module source even when rollup then drops
// the module entirely. Flipping `sideEffects` to false in the pinned core-js is enough to do that -
// every side-effect-only polyfill import is tree-shaken away, most of the bundle goes with them, and
// a count-based gate still reads its full healthy number. throughput.mjs catches that shape by
// comparing against a plugin-less baseline; measuring the chunk's own module table works for every
// method and needs no second build to compare against.
// The floor below is an order of magnitude under the smallest payload any cell of this suite
// produces, so it discriminates "nothing arrived" from "a small one" without tracking either.
const CORE_JS_MODULE = /[/\\](?:node_modules|packages)[/\\](?:core-js(?:-pure)?|@core-js[/\\])/;
const MIN_CORE_JS_BYTES = 10_000;
export function assertPayload(chunk, label) {
  const bytes = Object.entries(chunk.modules)
    .filter(([id]) => CORE_JS_MODULE.test(id))
    .reduce((n, [, m]) => n + m.renderedLength, 0);
  if (bytes < MIN_CORE_JS_BYTES) throw new Error(`${ label }: only ${ bytes }b of core-js reached the bundle`);
}

// Returns the ES5 UMD bundle code (global name `E2E`, exposing `run`), down-compiled with Babel and
// polyfilled by ONE of the two providers.
//
// `provider: 'unplugin'` - usage-* build at phase 'post' by default, entry-global at no phase.
// Ordering matters: raw Rollup ignores the plugin-level `enforce:'post'` field (that is a
// Vite/webpack-family concept), but it DOES honour the hook-level `order` that unplugin sets on its
// transform. For `usage-*` that order is 'post', so unplugin runs AFTER babel and its injection sees
// babel's helper output; listing babel FIRST just keeps array order agreeing with that.
// `entry-global` is the exception - unplugin pins it to order 'pre' regardless (see
// @core-js/unplugin), so there it runs BEFORE babel. That is fine: entry-global only expands
// `import 'core-js'` and needs no helper output.
//
// `provider: 'babel-plugin'` - no unplugin in the chain at all; @core-js/babel-plugin rides inside
// the Babel transform. There is nothing to order and no phase to pick, which is exactly why
// runtime.mjs uses this build as the reference the unplugin phases are diffed against.
//
// Returns `{ code, chunk, injected }`, all observed inside THIS build: capturing the injected set
// with a separate pass would describe a different configuration (different provider, different
// phase, no Babel), so a build whose own injection had gone no-op would still report a healthy set.
// That is why `injected` is the SET, not a count - runtime.mjs snapshots it, gates on it and ships
// the very bundle it came from, all from this one build. What proves the ES5 down-compile ran is
// `assertES5(code)`, which every caller runs.
export async function runtimeBuild(exerciseAbs, method, phase = 'post', provider = 'unplugin') {
  // entry-global never carries a phase; usage-* default to 'post' (unplugin after babel - see above),
  // but runtime.mjs passes an explicit phase to also build `pre` / `pre+post`. babel-plugin has no
  // phase for any method: it IS the Babel pass, so there is no before/after to choose between.
  const babel = provider === 'babel-plugin';
  const effPhase = babel ? undefined : phasesFor(method, provider).includes(phase) ? phase : undefined;
  return withEntry(exerciseAbs, method, `rt-${ provider }-${ method }-${ effPhase ?? 'x' }`, async entry => {
    const sink = new Set();
    // recorded alongside the set so a snapshot drift can name the module the extra injection came
    // from, without a second build in a different configuration to go looking for it
    const origins = new Map();
    const build = await rollup({
      input: entry,
      // Exactly ONE provider per build. Both at once would inject the union and the cell would stop
      // describing either of them.
      plugins: [
        tsSources(),
        makeBabelPlugin(babel ? pluginOpts(method) : null),
        nodeResolve(),
        commonjs(),
        ...babel ? [] : [u('rollup', method, effPhase)],
        recorder(sink, origins),
      ],
      onwarn: strictWarn,
    });
    try {
      const { output } = await build.generate({ format: 'umd', name: 'E2E', esModule: false });
      const [chunk] = output;
      const label = `${ provider }/${ method }/${ effPhase ?? 'entry' }`;
      assertNoExternals(chunk, label);
      assertPayload(chunk, label);
      return { code: chunk.code, chunk, injected: [...sink].sort(), origins };
    } finally {
      await build.close();
    }
  });
}

// -------- injection recorder (rollup-derived set; NOT what another bundler emitted) --------
const SPEC_RE = /(?:from|import|require\()\s*["'](?<spec>(?:core-js|@core-js\/pure)\/[^"']+)["']/g;
// The recorder must observe each module AFTER unplugin has injected into it. unplugin declares its
// transform in object form with an explicit `order` ('post' for `phase: 'post'`), which raw Rollup
// DOES honour - so array position alone is not enough: an unordered recorder would run first and
// see nothing. Declaring the recorder `order: 'post'` too puts it in the same bucket, where array
// order decides, and it is listed after unplugin.
// `origins` is optional: a Map of specifier -> Set of the module ids unplugin injected it into. The
// set alone says WHAT was injected, which is all a passing snapshot needs; when one drifts, the only
// question worth answering is WHERE the extra (or missing) injection came from, and that is the piece
// the plain set throws away. Ids are normalized to forward slashes and made relative to the suite so
// a linux baseline and a windows run print comparable paths.
export function recorder(sink, origins) {
  return {
    name: 'injection-recorder',
    transform: {
      order: 'post',
      handler(code, id) {
        for (const m of code.matchAll(SPEC_RE)) {
          const spec = m.groups.spec.replace(/\.m?js$/, '');
          sink.add(spec);
          if (!origins) continue;
          let where = origins.get(spec);
          if (!where) origins.set(spec, where = new Set());
          where.add(relative(HERE, id).replaceAll('\\', '/'));
        }
        return null;
      },
    },
  };
}

// Plain unplugin, NO Babel: what unplugin makes of the SOURCE alone. throughput.mjs uses this as the
// per-cell reference count to compare the other bundlers against, where Babel would only add work
// that is not being measured. Note that without Babel in front of it the phase axis collapses -
// `pre`, `post` and `pre+post` all inject the identical set (measured on every fixture) - so this is
// NOT the capture to snapshot a phase matrix with - runtime.mjs snapshots the set `runtimeBuild`
// produces, where Babel runs first and the phases separate.
export async function captureInjections(exerciseAbs, method, phase) {
  return withEntry(exerciseAbs, method, `snap-${ method }-${ phase ?? 'x' }`, async entry => {
    const sink = new Set();
    const build = await rollup({ input: entry, plugins: [tsSources(), u('rollup', method, phase), recorder(sink), nodeResolve(), commonjs()], onwarn: strictWarn });
    try {
      await build.generate({ format: 'es' });
      return [...sink].sort();
    } finally {
      await build.close();
    }
  });
}

// -------- shared gates and reporting helpers --------
// Assert a bundle really is ES5. This is the only check that verifies the runtime tier's premise
// rather than a proxy for it: the node pre-flight runs in a modern realm and the browser page in a
// modern browser, so a bundle that skipped the down-compile passes everything else.
//
// It must PARSE, not transform. esbuild's `target: 'es5'` LOWERS what it can and only throws for
// what it cannot, so it happily accepts arrows, template literals, `?.`, `??` and `**` - all of
// which are SyntaxErrors in IE11 - a gate built on it reports success for a bundle that never got
// down-compiled. acorn at `ecmaVersion: 5` answers the actual question: does an ES5 parser accept
// this text.
export function assertES5(code, label) {
  try {
    acornParse(code, { ecmaVersion: 5 });
  } catch (err) {
    throw new Error(`${ label }: bundle is not ES5 - ${ err.message }`);
  }
}

// "wire size" of a bundle: minify (esbuild, keeps ES5) + gzip - what you'd actually ship. Shared so
// pipeline.md and artifacts/manifest.json cannot drift apart if the minify settings ever change.
export async function wireSize(code, label = 'wire size') {
  // `target: 'es5'` is load-bearing, not cosmetic: without it esbuild minifies to esnext and emits
  // e.g. optional catch bindings, so the published "wire size" would describe a bundle that cannot
  // load in the very engine the artifact targets, and would understate it besides. Parse what
  // is actually measured rather than trusting the option: this number is published to manifest.json
  // and pipeline.md as shippable, so it carries the same ES5 premise the bundle itself does.
  const minText = (await esbuildTransform(code, { minify: true, legalComments: 'none', target: 'es5' })).code;
  assertES5(minText, `${ label } (minified)`);
  const min = Buffer.from(minText);
  return { min: min.length, gz: (await gzipP(min)).length };
}

// Turn an unknown throwable into one console-width line. Child-process failures carry the real
// reason on stderr, not on `message` (which is just "Command failed: ..."), and node prints the
// offending `file:line` BEFORE the actual `TypeError: ...` - so prefer the first line that names an
// error and fall back to the first line at all.
const REASON_MAX = 200; // one terminal row; long enough for a stack's first frame
export function errorReason(err) {
  const lines = String(err?.stderr || err?.message || err).split('\n').map(l => l.trim()).filter(Boolean);
  return (lines.find(l => /^\w*(?:Error|Exception)\b/.test(l)) ?? lines[0] ?? '').slice(0, REASON_MAX);
}
