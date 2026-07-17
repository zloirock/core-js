// Bundling core for the e2e-libs suite. Provides:
//   - method/phase enumeration and unplugin option construction
//   - temp-entry generation (entries live UNDER this dir so bare `rxjs`/`core-js` imports resolve)
//   - throughputBuilders: one per bundler, returns { bytes }, does NOT execute (measures processing)
//   - runtimeBuild: rollup + Babel (syntax->ES5, both Babel 7 and 8) + unplugin(post) (stdlib), UMD
//   - captureInjections: which core-js/@core-js/pure specifiers unplugin emits (bundler-invariant)
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import unplugin from '@core-js/unplugin';
import { createRequire } from 'node:module';
import { mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const HERE = dirname(fileURLToPath(import.meta.url));
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
    babelToolchains[version] = { core: req('@babel/core'), preset: req.resolve('@babel/preset-env') };
  }
  return babelToolchains[version];
}

// A rollup transform that down-compiles syntax to ES5 with a specific Babel core + preset-env.
// core-js internals are already ES5, so skip them (unplugin still injects them, unbabeled).
const BABEL_EXCLUDE = [/[/\\]core-js(?:-pure)?[/\\]/, /[/\\]@core-js[/\\]/];
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

// Returns the ES5 UMD bundle code (global name `E2E`, exposing `run`), down-compiled with Babel
// `babelVersion` ('7' | '8'). For usage-* methods pass a phase; entry-global ignores it. Ordering
// matters: raw Rollup ignores unplugin's enforce:'post' field (enforce is a Vite/webpack-family
// concept, not a raw-Rollup one), so transform order = array order. babel is listed FIRST so it
// down-compiles to ES5, and unplugin runs LAST so its stdlib injection sees babel's helper output.
export async function runtimeBuild(exerciseAbs, method, phase, babelVersion = '7') {
  const effPhase = method === 'entry-global' ? undefined : (phase ?? 'post');
  return withEntry(exerciseAbs, method, `rt-${ babelVersion }-${ method }-${ effPhase ?? 'x' }`, async entry => {
    const build = await rollup({
      input: entry,
      plugins: [makeBabelPlugin(babelVersion), nodeResolve(), commonjs(), u('rollup', method, effPhase)],
      onwarn() { /* ignore bundler warnings */ },
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
const SPEC_RE = /(?:from|import|require\()\s*["'](?<spec>(?:core-js|@core-js\/pure)\/[^"']+)["']/g;
function recorder(sink) {
  return {
    name: 'injection-recorder',
    transform(code) {
      for (const m of code.matchAll(SPEC_RE)) sink.add(m.groups.spec.replace(/\.m?js$/, ''));
      return null;
    },
  };
}

export async function captureInjections(exerciseAbs, method, phase) {
  return withEntry(exerciseAbs, method, `snap-${ method }-${ phase ?? 'x' }`, async entry => {
    const sink = new Set();
    const build = await rollup({ input: entry, plugins: [u('rollup', method, phase), recorder(sink), nodeResolve(), commonjs()], onwarn() { /* ignore bundler warnings */ } });
    await build.generate({ format: 'es' });
    await build.close();
    return [...sink].sort();
  });
}
