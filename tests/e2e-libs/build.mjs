// Bundling core for the e2e-libs suite. Provides:
//   - method/phase enumeration and unplugin option construction
//   - temp-entry generation (entries live UNDER this dir so bare `rxjs`/`core-js` imports resolve)
//   - throughputBuilders: one per bundler, returns { bytes }, does NOT execute (measures processing)
//   - runtimeBuild: rollup + Babel (syntax->ES5, both Babel 7 and 8) + unplugin (post for usage-*,
//     pre for entry-global) (stdlib), UMD
//   - captureInjections: which core-js/@core-js/pure specifiers unplugin emits — via rollup ONLY,
//     so a runner must not read it as what some other bundler emitted
//   - reporting helpers shared by the runners: wireSize (minify+gzip), errorReason (one-line)
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import unplugin from '@core-js/unplugin';
import { build as esbuildBuild, transform as esbuildTransform } from 'esbuild';
import { parse as acornParse } from 'acorn';
import { createRequire } from 'node:module';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';

const gzipP = promisify(gzip);

export const HERE = import.meta.dirname;
const TMP = join(HERE, '.tmp');

export const METHODS = ['entry-global', 'usage-global', 'usage-pure'];
export const phasesFor = m => m === 'entry-global' ? [undefined] : ['pre', 'post', 'pre+post'];

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

async function withTmpOut(fn) {
  await mkdir(TMP, { recursive: true });
  const dir = join(TMP, `out-${ process.pid }-${ process.hrtime.bigint() }`);
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
    const build = await rollup({ input: entry, plugins: [plugin, nodeResolve(), commonjs()].filter(Boolean), onwarn() { /* ignore bundler warnings */ } });
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
      await build({
        input: entry, platform: 'node', treeshake: false, plugins: [plugin].filter(Boolean),
        output: { format: 'esm', file, externalLiveBindings: false, keepNames: true },
      });
      return { bytes: (await stat(file)).size };
    });
  },
  async esbuild(entry, plugin) {
    // no lazy import here: this module already loads esbuild statically for `wireSize`
    const result = await esbuildBuild({ entryPoints: [entry], plugins: [plugin].filter(Boolean), bundle: true, write: false, format: 'esm', platform: 'node' });
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
    function noop() { /* swallow farm logger output */ }
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
      const stats = await new Promise((resolve, reject) => instance.run((e, s) => e ? reject(e) : resolve(s)));
      if (stats.hasErrors()) throw new Error(stats.compilation.errors[0].message);
    } finally {
      await new Promise(resolve => instance.close(resolve));
    }
    return { bytes: (await stat(join(dir, 'out.mjs'))).size };
  });
}

// farm's native (Rust/SWC) compiler hard-crashes (uncaught, kills the whole process) on the
// workspace v4 core-js modules — it's throughput-only (the runtime tier uses rollup), so it's
// excluded from the active set. The builder stays defined above for easy re-enable if that changes.
export const THROUGHPUT_BUNDLERS = Object.keys(throughputBuilders).filter(name => name !== 'farm');

// The unplugin adapter instance for a bundler + (method, phase).
export const u = (bundler, method, phase) => unplugin[bundler](pluginOpts(method, phase));

// -------- runtime builder: ES5 UMD via Babel(syntax) + unplugin(post, stdlib) --------
// Two isolated Babel toolchains: '7' from the suite's own node_modules, '8' from ./babel8 (kept
// separate because two @babel/core majors can't share one node_modules). @rollup/plugin-babel@6
// only supports @babel/core@7, so Babel runs through a small custom transform plugin instead — which
// also keeps the only variable between the two runs the Babel version itself.
export const BABEL_VERSIONS = ['7', '8'];
const require7 = createRequire(join(HERE, 'package.json'));
const require8 = createRequire(join(HERE, 'babel8', 'package.json'));
const babelToolchains = {};
function babelToolchain(version) {
  if (!babelToolchains[version]) {
    const req = version === '8' ? require8 : require7;
    const core = req('@babel/core');
    // `babel8/node_modules` is gitignored and installed by this suite's `postinstall`, not by zxi
    // (which only installs the runner's own directory). If that install is missing, `createRequire`
    // does NOT fail - node resolution walks up and quietly finds the suite's own @babel/core@7, so
    // every `babel8` artifact would be built by Babel 7 and the dual-Babel tier would silently
    // become a tautology. Assert the major we actually got.
    const [major] = String(core.version).split('.', 1);
    if (major !== version) {
      throw new Error(`Babel ${ version } toolchain resolved to @babel/core@${ core.version } — `
        + 'run `npm install` in tests/e2e-libs (its postinstall installs tests/e2e-libs/babel8)');
    }
    babelToolchains[version] = { core, preset: req.resolve('@babel/preset-env') };
  }
  return babelToolchains[version];
}

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
function babelSyntaxPlugin(core, preset) {
  return {
    name: 'e2e-babel-syntax',
    async transform(code, id) {
      if (BABEL_EXCLUDE.some(re => re.test(id))) return null;
      const out = await core.transformAsync(code, {
        filename: id, configFile: false, babelrc: false, sourceMaps: false, compact: false,
        presets: [[preset, { targets: { ie: '11' }, useBuiltIns: false, modules: false }]],
      });
      return out && typeof out.code === 'string' ? { code: out.code, map: null } : null;
    },
  };
}

// Public: the rollup Babel(syntax->ES5) transform for a given Babel major ('7' | '8'). Used by
// runtimeBuild and by pipeline.mjs so both share the exact same Babel config.
export function makeBabelPlugin(babelVersion = '7') {
  const { core, preset } = babelToolchain(babelVersion);
  return babelSyntaxPlugin(core, preset);
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
// every side-effect-only polyfill import is tree-shaken away, the bundle loses ~87% of its bytes,
// and a count-based gate still reads a healthy 318. throughput.mjs catches that shape by comparing
// against a plugin-less baseline; measuring the chunk's own module table works for every method and
// needs no second build to compare against.
// Smallest real payload measured across the suite is ~218 KB (codemirror/usage-pure).
const CORE_JS_MODULE = /[/\\](?:node_modules|packages)[/\\](?:core-js(?:-pure)?|@core-js[/\\])/;
export function assertPayload(chunk, label, min = 10_000) {
  const bytes = Object.entries(chunk.modules)
    .filter(([id]) => CORE_JS_MODULE.test(id))
    .reduce((n, [, m]) => n + m.renderedLength, 0);
  if (bytes < min) throw new Error(`${ label }: only ${ bytes }b of core-js reached the bundle`);
}

// Returns the ES5 UMD bundle code (global name `E2E`, exposing `run`), down-compiled with Babel
// `babelVersion` ('7' | '8'). usage-* build at phase 'post', entry-global at no phase. Ordering
// matters: raw Rollup ignores the plugin-level `enforce:'post'` field (that is a Vite/webpack-family
// concept), but it DOES honour the hook-level `order` that unplugin sets on its transform. For
// `usage-*` that order is 'post', so unplugin runs AFTER babel and its injection sees babel's helper
// output; listing babel FIRST just keeps array order agreeing with that. `entry-global` is the
// exception - unplugin pins it to order 'pre' regardless (see @core-js/unplugin), so there it runs
// BEFORE babel. That is fine: entry-global only expands `import 'core-js'` and needs no helper output.
//
// Returns `{ code, injections }`, both observed inside THIS build: counting injections with a
// separate `captureInjections` pass would gate on a different unplugin configuration (different
// phase, no Babel), so a build whose own injection had gone no-op would still show a healthy number.
// What proves the ES5 down-compile ran is `assertES5(code)`, which every caller runs.
export async function runtimeBuild(exerciseAbs, method, babelVersion = '7') {
  const effPhase = method === 'entry-global' ? undefined : 'post';
  return withEntry(exerciseAbs, method, `rt-${ babelVersion }-${ method }-${ effPhase ?? 'x' }`, async entry => {
    const sink = new Set();
    const build = await rollup({
      input: entry,
      plugins: [makeBabelPlugin(babelVersion), nodeResolve(), commonjs(), u('rollup', method, effPhase), recorder(sink)],
      onwarn: strictWarn,
    });
    try {
      const { output } = await build.generate({ format: 'umd', name: 'E2E', esModule: false });
      const [chunk] = output;
      const label = `${ method }/babel${ babelVersion }`;
      assertNoExternals(chunk, label);
      assertPayload(chunk, label);
      return { code: chunk.code, injections: sink.size };
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
export function recorder(sink) {
  return {
    name: 'injection-recorder',
    transform: {
      order: 'post',
      handler(code) {
        for (const m of code.matchAll(SPEC_RE)) sink.add(m.groups.spec.replace(/\.m?js$/, ''));
        return null;
      },
    },
  };
}

export async function captureInjections(exerciseAbs, method, phase) {
  return withEntry(exerciseAbs, method, `snap-${ method }-${ phase ?? 'x' }`, async entry => {
    const sink = new Set();
    const build = await rollup({ input: entry, plugins: [u('rollup', method, phase), recorder(sink), nodeResolve(), commonjs()], onwarn: strictWarn });
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
// what it cannot, so it happily accepts arrows, template literals, `?.`, `??` and `**` — all of
// which are SyntaxErrors in IE11. An earlier version of this gate used it and looked like it worked
// only because the sample happened to contain `const`. acorn at `ecmaVersion: 5` answers the actual
// question: does an ES5 parser accept this text.
export function assertES5(code, label) {
  try {
    acornParse(code, { ecmaVersion: 5 });
  } catch (err) {
    throw new Error(`${ label }: bundle is not ES5 — ${ err.message }`);
  }
}

// "wire size" of a bundle: minify (esbuild, keeps ES5) + gzip — what you'd actually ship. Shared so
// pipeline.md and artifacts/manifest.json cannot drift apart if the minify settings ever change.
export async function wireSize(code, label = 'wire size') {
  // `target: 'es5'` is load-bearing, not cosmetic: without it esbuild minifies to esnext and emits
  // e.g. optional catch bindings, so the published "wire size" would describe a bundle that cannot
  // load in the very engine the artifact targets (and would understate it by ~400 bytes). Parse what
  // is actually measured rather than trusting the option: this number is published to manifest.json
  // and pipeline.md as shippable, so it carries the same ES5 premise the bundle itself does.
  const minText = (await esbuildTransform(code, { minify: true, legalComments: 'none', target: 'es5' })).code;
  assertES5(minText, `${ label } (minified)`);
  const min = Buffer.from(minText);
  return { min: min.length, gz: (await gzipP(min)).length };
}

// Turn an unknown throwable into one console-width line. Child-process failures carry the real
// reason on stderr, not on `message` (which is just "Command failed: ..."), and node prints the
// offending `file:line` BEFORE the actual `TypeError: ...` — so prefer the first line that names an
// error and fall back to the first line at all.
const REASON_MAX = 200; // one terminal row; long enough for a stack's first frame
export function errorReason(err) {
  const lines = String(err?.stderr || err?.message || err).split('\n').map(l => l.trim()).filter(Boolean);
  return (lines.find(l => /^\w*(?:Error|Exception)\b/.test(l)) ?? lines[0] ?? '').slice(0, REASON_MAX);
}
