// Matrix probe: what does @core-js/unplugin inject for plain own data fields (`this.filter`,
// `this.chunks`), per PATH OF INVOCATION — direct `createPlugin().transform()` plus the rollup,
// rolldown, esbuild, vite, webpack and rspack adapters — at `usage-global` / `mode: 'full'` /
// `phase: 'pre'`, targets ie 11.
//
// Established answers (oxc-parser 0.141.0 throughout; full story in REPORT.md):
//   THIS branch's plugin, linux/x64 (every path, repeated runs)  -> none
//   THIS branch's plugin, win32/x64 (rollup adapter, CI)         -> 5 iterator polyfills
//   v4-HEAD plugin (2953b35f34), linux/x64                       -> the same 5, on EVERY path, pre AND post
//
// So on the old code the answer was platform-unstable, and current v4 unified it to the conservative
// five everywhere — the matrix exists to verify exactly that kind of statement in one run, instead of
// comparing runs made months and versions apart (which is how a false "depends on the invocation
// path" conclusion was once reached here — see REPORT.md).
//
// Bundler legs mark `core-js/*` external, so the injected specifiers survive bundling and can be read
// off the output text uniformly. That cannot influence the thing being tested: the injection decision
// is taken while transforming fixture.mjs, before the injected imports are ever resolved. farm is
// excluded (its resolver breaks on the injected specifiers — see e2e-libs/build.mjs) and rsbuild adds
// an app-config layer over the same rspack adapter, so neither would isolate anything new.
//
// Run:  node repro.mjs [--verbose]     (from anywhere inside the core-js monorepo)
// Exit: 0 = rollup-adapter leg clean here, 1 = it over-polyfilled (reproduced), 2 = control failed
//       (detection is not running at all, so any clean verdict would be a false pass)
import { rollup } from 'rollup';
import { build as esbuildBuild } from 'esbuild';
import unplugin from '@core-js/unplugin';
import createPlugin from '../../../packages/core-js-unplugin/internals/plugin.js';
import { mkdir, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';

const HERE = import.meta.dirname;
const TMP = join(HERE, '..', '.tmp'); // e2e-libs/.tmp — already gitignored and lint-ignored
const VERBOSE = process.argv.includes('--verbose');
const FIXTURE = join(HERE, 'fixture.mjs');
const CONTROL = join(HERE, 'control.mjs');

const BASE_OPTS = { method: 'usage-global', version: '4.0', mode: 'full', targets: { ie: 11 } };
function opts(phase) {
  return { ...BASE_OPTS, phase };
}

// iterator-helper polyfills: none of these may be injected for a plain data field
const ITERATOR_POLYFILLS = /^(?:es|esnext)\.(?:async-)?iterator\./;
const SPEC_RE = /(?:from|import|require\()\s*["'](?<spec>core-js\/[^"']+)["']/g;
const CORE_JS_EXTERNAL = /^core-js\//;

function specsIn(code) {
  const found = new Set();
  for (const m of code.matchAll(SPEC_RE)) {
    found.add(m.groups.spec.replace(/\.m?js$/, '').replace(/^core-js\/modules\//, ''));
  }
  return [...found].sort();
}

async function withTmpOut(fn) {
  await mkdir(TMP, { recursive: true });
  const dir = join(TMP, `repro-out-${ process.pid }-${ process.hrtime.bigint() }`);
  await mkdir(dir, { recursive: true });
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// webpack and rspack share one config shape; `module ${ request }` externals keep the injected
// imports as import statements in the module output, where specsIn can read them
async function webpackLike(compiler, entry, phase, adapter) {
  return withTmpOut(async dir => {
    const instance = compiler({
      mode: 'production', devtool: false, entry,
      output: { path: dir, filename: 'out.mjs', module: true, library: { type: 'module' } },
      experiments: { outputModule: true }, optimization: { minimize: false },
      externalsType: 'module', externals: [CORE_JS_EXTERNAL],
      plugins: [adapter(opts(phase))],
    });
    try {
      const stats = await new Promise((resolve, reject) => instance.run((e, st) => e ? reject(e) : resolve(st)));
      if (stats.hasErrors()) throw new Error(stats.compilation.errors[0].message);
    } finally {
      await new Promise(resolve => instance.close(resolve));
    }
    return specsIn(await readFile(join(dir, 'out.mjs'), 'utf8'));
  });
}

const legs = {
  // the plugin invoked directly, exactly the way tests/unplugin drives the transpiler fixtures —
  // no bundler, no adapter. `phase` is stripped: it only orders the plugin among bundler siblings,
  // and this layer validates its options and rejects it outright ("Unknown plugin option: phase"),
  // the same rejection that keeps `phase` out of the shared transpiler fixtures.
  async direct(entry) {
    const source = await readFile(entry, 'utf8');
    const out = createPlugin(BASE_OPTS).transform(source, entry);
    return specsIn(out && typeof out.code === 'string' ? out.code : source);
  },
  async rollup(entry, phase) {
    const build = await rollup({
      input: entry, external: CORE_JS_EXTERNAL,
      plugins: [unplugin.rollup(opts(phase))],
      onwarn() { /* the matrix favours robustness; the verdict reads the output, not the warnings */ },
    });
    try {
      const { output } = await build.generate({ format: 'es' });
      return specsIn(output[0].code);
    } finally {
      await build.close();
    }
  },
  async rolldown(entry, phase) {
    const { rolldown } = await import('rolldown');
    const build = await rolldown({
      input: entry, platform: 'node', external: CORE_JS_EXTERNAL,
      plugins: [unplugin.rolldown(opts(phase))],
    });
    try {
      const { output } = await build.generate({ format: 'esm' });
      return specsIn(output[0].code);
    } finally {
      await build.close();
    }
  },
  async esbuild(entry, phase) {
    const result = await esbuildBuild({
      entryPoints: [entry], plugins: [unplugin.esbuild(opts(phase))],
      bundle: true, write: false, format: 'esm', platform: 'node',
      external: ['core-js/*'], logLevel: 'silent',
    });
    return specsIn(result.outputFiles[0].text);
  },
  async vite(entry, phase) {
    const { build } = await import('vite');
    const result = await build({
      root: HERE, logLevel: 'silent', configFile: false,
      build: {
        write: false, minify: false,
        lib: { entry, formats: ['es'], fileName: 'bundle' },
        rollupOptions: { external: CORE_JS_EXTERNAL },
      },
      plugins: [unplugin.vite(opts(phase))],
    });
    const [{ output }] = Array.isArray(result) ? result : [result];
    return specsIn(output[0].code);
  },
  async webpack(entry, phase) {
    const wp = (await import('webpack')).default;
    return webpackLike(wp, entry, phase, unplugin.webpack);
  },
  async rspack(entry, phase) {
    const { rspack } = await import('@rspack/core');
    return webpackLike(rspack, entry, phase, unplugin.rspack);
  },
};

function iteratorPolyfills(specs) {
  return specs.filter(spec => ITERATOR_POLYFILLS.test(spec));
}

console.log(`environment: ${ process.platform }/${ process.arch } node ${ process.version }`);

// POSITIVE CONTROL first: a genuine `unknownIterator.filter(...)` must inject. Without this check a
// detector that had simply stopped running would report the same clean matrix as a correct one.
const control = iteratorPolyfills(await legs.rollup(CONTROL, 'pre'));
console.log(`\ncontrol (genuine iterator call, rollup leg, must inject): ${ control.join(', ') || 'NOTHING' }`);
if (!control.length) {
  console.log('! detection is not running at all — the matrix below would be a false pass');
  process.exitCode = 2;
}

// THE MATRIX: the fields fixture contains no iterator whatsoever, so any iterator-helper polyfill in
// any cell is over-polyfilling; the interesting datum is which LEGS say so, on which platform.
console.log("\nfields fixture — iterator-helper polyfills per invocation path (phase 'pre'):");
const answers = new Map();
for (const [name, run] of Object.entries(legs)) {
  let cell;
  try {
    const found = iteratorPolyfills(await run(FIXTURE, 'pre'));
    answers.set(name, found.join(', ') || 'none');
    cell = found.length ? `✗ ${ found.join(', ') }` : '✓ none';
  } catch (err) {
    answers.set(name, `ERROR: ${ err.message }`);
    cell = `? ERROR: ${ String(err.message).split('\n', 1)[0] }`;
  }
  console.log(`  ${ name.padEnd(9) }${ cell }`);
}
const distinct = new Set(answers.values());
if (distinct.size > 1) {
  console.log(`  -> the legs DISAGREE on this one machine (${ distinct.size } distinct answers) — see REPORT.md`);
}

// printed for contrast: on windows `post` gave the same five as `pre`, so the defect is not
// pre-specific once Babel is out of the pipeline
const post = iteratorPolyfills(await legs.rollup(FIXTURE, 'post'));
console.log(`rollup leg at phase 'post': ${ post.join(', ') || 'none' }`);

if (VERBOSE) {
  console.log('\nfull injected sets (phase \'pre\'):');
  for (const [name, run] of Object.entries(legs)) {
    try {
      console.log(`  ${ name }: ${ (await run(FIXTURE, 'pre')).join(', ') || '(nothing)' }`);
    } catch (err) {
      console.log(`  ${ name }: ERROR ${ String(err.message).split('\n', 1)[0] }`);
    }
  }
}

// The exit verdict stays what it has been since the first version: the rollup-adapter leg is the one
// with the established linux-clean / windows-dirty baseline, so IT gates; the rest of the matrix is
// diagnosis, not verdict.
const offenders = iteratorPolyfills(await legs.rollup(FIXTURE, 'pre'));
if (offenders.length) {
  console.log(`\n✗ REPRODUCED — the rollup adapter pulled in ${ offenders.length } iterator-helper polyfill(s) for plain data fields`);
  process.exitCode = 1;
} else if (!process.exitCode) {
  console.log('\n✓ rollup adapter clean in this environment (expected on linux; the matrix above is the point on windows)');
}
