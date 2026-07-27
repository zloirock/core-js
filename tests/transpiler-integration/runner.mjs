import { deepStrictEqual } from 'node:assert';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const { mkdtemp, readFile, rm, writeFile } = fs;
const { dirname, join, resolve } = path;

const testDir = import.meta.dirname;
const unpluginPath = resolve(testDir, '../../packages/core-js-unplugin/index.js');
const methods = ['entry-global', 'usage-global', 'usage-pure'];

function inputOf(method) {
  return resolve(testDir, `input-${ method }.js`);
}

function pluginOpts(method, phase) {
  const opts = { method, version: '4.0', mode: 'full' };
  if (phase) opts.phase = phase;
  return opts;
}

// `entry-global` rejects `phase`; everything else runs across all three.
function phasesFor(method) {
  return method === 'entry-global' ? [undefined] : ['pre', 'post', 'pre+post'];
}

const expected = {
  filterReject: [2, 4],
  uniqueBy: [1, 2, 3],
  setFrom: 3,
  cooked: 'hello',
};

// --- helpers ---

async function withTmpDir(fn) {
  const dir = await mkdtemp(join(os.tmpdir(), 'transpiler-test-'));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// node verifier: import bundle, extract results, compare against expected
async function verifyInNode(code, label, ext = '.mjs') {
  assertRefsDeclared(code, label);
  await withTmpDir(async dir => {
    const file = join(dir, `bundle${ ext }`);
    await writeFile(file, code);
    const mod = await import(pathToFileURL(file).href);
    const results = mod.results ?? mod.default?.results ?? mod.default ?? mod;
    deepStrictEqual([...results.filterReject], expected.filterReject, `${ label }: filterReject`);
    deepStrictEqual([...results.uniqueBy], expected.uniqueBy, `${ label }: uniqueBy`);
    deepStrictEqual(results.setFrom, expected.setFrom, `${ label }: setFrom`);
    deepStrictEqual(results.cooked, expected.cooked, `${ label }: cooked`);
  });
}

// every plugin-minted temp the output USES must also be declared: a pass that emits a memo
// without contributing its `var` produces a bundle that dies with `X is not defined` at
// runtime - and only on the code paths that reach it, which a value assertion can miss
function assertRefsDeclared(code, label) {
  const declared = new Set();
  for (const match of code.matchAll(/\bvar\s+(?<names>[^\n;]+);/g)) {
    for (const name of match.groups.names.split(',')) declared.add(name.trim().split(/\s/u, 1)[0]);
  }
  const undeclared = new Set();
  for (const match of code.matchAll(/\b(?<temp>_ref\d*)\b/g)) {
    if (!declared.has(match.groups.temp)) undeclared.add(match.groups.temp);
  }
  if (undeclared.size) throw new Error(`${ label }: undeclared plugin temps ${ [...undeclared].join(', ') }`);
}

// pre+post contract verifier: the runtime must observe the user's Map patch (pre recorded the
// mutation before the sibling mangled its spelling), and the control stays polyfilled
async function verifyPhases(code, label, ext = '.mjs') {
  assertRefsDeclared(code, label);
  await withTmpDir(async dir => {
    const file = join(dir, `bundle${ ext }`);
    await writeFile(file, code);
    const mod = await import(pathToFileURL(file).href);
    const results = mod.results ?? mod.default?.results ?? mod.default ?? mod;
    deepStrictEqual(results.patched, 'patched', `${ label }: patched static observed`);
    deepStrictEqual([...results.control], expected.filterReject, `${ label }: control`);
    deepStrictEqual(mod.injected ?? results.injected, 'sib', `${ label }: sibling-injected call ran`);
    // the injected call is sibling-authored code the POST pass alone can see: it must be
    // substituted there, or this leg silently degrades to testing the native method
    // bundlers spell the injected helper binding every which way (farm prefixes it, CJS interop
    // wraps it in `(0, ns.default)`), so assert the ABSENCE of the raw call instead: whatever
    // the helper is named, a substituted call no longer reads the method off the array literal
    if (/\[\s*(?<q1>["'])s\k<q1>\s*,\s*(?<q2>["'])ib\k<q2>\s*\]\s*\.\s*join\s*\(/u.test(code)) {
      throw new Error(`${ label }: sibling-injected call was left unpolyfilled`);
    }
  });
}

// dynamic-import verifier: the lazy module resolves through the bundler's loader machinery
// and its own body ran polyfilled
async function verifyDynamic(code, label, ext = '.mjs') {
  assertRefsDeclared(code, label);
  await withTmpDir(async dir => {
    const file = join(dir, `bundle${ ext }`);
    await writeFile(file, code);
    const mod = await import(pathToFileURL(file).href);
    const results = mod.results ?? mod.default?.results ?? mod.default ?? mod;
    deepStrictEqual(await results.lazy, 2, `${ label }: lazy chunk value`);
    deepStrictEqual([...results.control], expected.filterReject, `${ label }: control`);
  });
}

// bun-mode output mixes CJS/ESM and isn't loadable by node — verify inside bun instead.
// usage-pure exports results; global methods patch globals.
async function verifyInBun(code, label, method) {
  await withTmpDir(async dir => {
    const bundle = join(dir, 'bundle.js');
    await writeFile(bundle, code);
    const script = join(dir, 'verify.mjs');
    const url = JSON.stringify(pathToFileURL(bundle).href);
    const exp = JSON.stringify(expected);
    const body = method === 'usage-pure' ? `
      const mod = await import(${ url });
      deepStrictEqual([...mod.filterReject], exp.filterReject);
      deepStrictEqual([...mod.uniqueBy], exp.uniqueBy);
      strictEqual(mod.setFrom, exp.setFrom);
      strictEqual(mod.cooked, exp.cooked);
    ` : `
      await import(${ url });
      deepStrictEqual([1,2,3,4].filterReject(x => x % 2), exp.filterReject);
      deepStrictEqual([1,2,3,2,1].uniqueBy(), exp.uniqueBy);
      strictEqual(Set.from([1,2,3]).size, exp.setFrom);
      strictEqual(String.cooked\`hello\`, exp.cooked);
    `;
    await writeFile(script, `
      import { deepStrictEqual, strictEqual } from 'node:assert';
      const exp = ${ exp };${ body }
    `);
    try {
      await $({ quiet: true })`bun ${ script }`;
    } catch (error) {
      throw new Error(`${ label }: ${ error.stderr ?? error.message }`, { cause: error });
    }
  });
}

async function esbuildBundle(stdinOrEntry) {
  const { build } = await import('esbuild');
  const result = await build({
    ...stdinOrEntry,
    bundle: true,
    write: false,
    format: 'cjs',
    platform: 'node',
  });
  return { code: result.outputFiles[0].text, ext: '.cjs' };
}

async function webpackLikeBundle(compiler, input, plugin, extra = {}) {
  return withTmpDir(async dir => {
    const filename = 'out.mjs';
    const plugins = [...extra.siblings ?? [], plugin];
    // the dynamic-import leg must stay a single node-loadable file - fold async chunks back in
    if (extra.inlineDynamic) plugins.push(new compiler.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
    const instance = compiler({
      mode: 'production',
      devtool: false,
      entry: input,
      output: { path: dir, filename, module: true, library: { type: 'module' } },
      experiments: { outputModule: true },
      optimization: { minimize: false },
      plugins,
    });
    try {
      const stats = await promisify(instance.run.bind(instance))();
      if (stats.hasErrors()) throw new Error(stats.compilation.errors[0].message);
    } finally {
      await promisify(instance.close.bind(instance))();
    }
    return { code: await readFile(join(dir, filename), 'utf8') };
  });
}

// --- builders ---
// each returns { code, ext?, verifier? }. verifier defaults to verifyInNode.

const unplugin = await import('@core-js/unplugin');
function pluginFor(name) { return (...args) => unplugin[name](...args); }

// sibling plugin for the pre+post contract legs: registered WITHOUT enforce (the "normal"
// slot our pre/post stages must straddle), it mangles the phases-input's mutation spelling
// into a computed key the post pass cannot read. if the bundler does not order our pre
// BEFORE this sibling, the mutation goes unrecorded and the runtime observes a pristine
// ponyfill instead of the user patch - which `verifyPhases` fails on
const { createUnplugin } = await import('unplugin');
const siblingMangler = createUnplugin(() => ({
  name: 'integration-sibling-mangler',
  transform(code) {
    // scoped to the phases input by its class marker. matches only the RAW-source spelling
    // (a leading boundary rejects the pre pass's `_globalThis.` rewrite), so with correct
    // ordering the sibling no-ops. with broken ordering it mangles the raw source two ways at
    // once: the mutation key becomes a reassigned-`let` (GENUINELY unreadable - const aliases
    // and literal concats fold in the resolver, so those would not discriminate), and a
    // POLYFILLABLE call lands beside it, which the post pass must both inject and declare
    if (!code.includes('PatchedMap')) return null;
    // two jobs, both scoped to the phases input by its class marker:
    //   1. ORDER discrimination - a RAW mutation spelling means our pre pass has not run yet,
    //      so mangle the key into a reassigned-`let` no pass can read (const aliases and
    //      literal concats fold in the resolver, so those would not discriminate). with the
    //      correct pre -> sibling -> post interleave the spelling is already rewritten and
    //      this leg no-ops
    //   2. INJECTION into sibling-introduced code - replace the marker with a polyfillable
    //      call, which only the POST pass can ever see. it must be substituted AND have its
    //      temps declared, or the bundle dies with `X is not defined` at runtime
    let out = code.replace(/(?<![\w$.])globalThis\.Map =/,
      "let __mangledKey = 'Ma'; __mangledKey += 'p'; globalThis[__mangledKey] =");
    out = out.replace("'SIBLING_INJECTS_HERE'", "['s', 'ib'].join('')");
    return out === code ? null : { code: out, map: null };
  },
}));

const builders = {
  // babel-plugin has no `phase` option — receives base opts regardless
  async babel(input, method) {
    const { transformAsync } = await import('@babel/core');
    const source = await readFile(input, 'utf8');
    const { code } = await transformAsync(source, {
      filename: input,
      plugins: [['@core-js', pluginOpts(method)]],
    });
    return esbuildBundle({ stdin: { contents: code, resolveDir: dirname(input), loader: 'js' } });
  },

  async esbuild(input, method, phase, extra = {}) {
    return esbuildBundle({
      entryPoints: [input],
      plugins: [...extra.siblings ?? [], pluginFor('esbuild')(pluginOpts(method, phase))],
    });
  },

  async rollup(input, method, phase, extra = {}) {
    const { rollup } = await import('rollup');
    const nodeResolve = (await import('@rollup/plugin-node-resolve')).default;
    const commonjs = (await import('@rollup/plugin-commonjs')).default;
    const bundle = await rollup({
      input,
      plugins: [...extra.siblings ?? [], pluginFor('rollup')(pluginOpts(method, phase)), nodeResolve(), commonjs()],
    });
    const { output } = await bundle.generate({
      format: 'es', sourcemap: true, inlineDynamicImports: !!extra.inlineDynamic,
    });
    return { code: output[0].code, map: output[0].map };
  },

  async vite(input, method, phase, extra = {}) {
    const { build } = await import('vite');
    const result = await build({
      root: testDir,
      logLevel: 'silent',
      build: {
        write: false,
        sourcemap: true,
        lib: { entry: input, formats: ['es'] },
        minify: false,
        commonjsOptions: { include: [/core-js/] },
        // vite bundles with rolldown, so the output option follows rolldown's spelling
        rollupOptions: extra.inlineDynamic ? { output: { codeSplitting: false } } : {},
      },
      resolve: { dedupe: ['core-js'] },
      plugins: [...extra.siblings ?? [], pluginFor('vite')(pluginOpts(method, phase))],
    });
    const [{ output }] = Array.isArray(result) ? result : [result];
    return { code: output[0].code, map: output[0].map };
  },

  async webpack(input, method, phase, extra = {}) {
    const wp = (await import('webpack')).default;
    return webpackLikeBundle(wp, input, pluginFor('webpack')(pluginOpts(method, phase)), extra);
  },

  async rspack(input, method, phase, extra = {}) {
    const { rspack } = await import('@rspack/core');
    return webpackLikeBundle(rspack, input, pluginFor('rspack')(pluginOpts(method, phase)), extra);
  },

  // rsbuild drives rspack: same chunk-loader semantics, plugin passed through unplugin's
  // rsbuild adapter. environments-based config keeps the output a single node-loadable file
  async rsbuild(input, method, phase, extra = {}) {
    const { createRsbuild } = await import('@rsbuild/core');
    return withTmpDir(async dir => {
      const rsbuild = await createRsbuild({
        cwd: testDir,
        rsbuildConfig: {
          mode: 'production',
          logLevel: 'error',
          source: { entry: { index: input } },
          plugins: [...extra.siblings ?? [], pluginFor('rsbuild')(pluginOpts(method, phase))],
          output: {
            target: 'node',
            distPath: { root: dir },
            filenameHash: false,
            minify: false,
            sourceMap: false,
          },
          performance: { chunkSplit: { strategy: 'all-in-one' } },
          tools: {
            rspack: async config => {
              config.output = { ...config.output, module: true, library: { type: 'module' } };
              config.experiments = { ...config.experiments, outputModule: true };
              // the dynamic-import leg must stay a single node-loadable file
              if (extra.inlineDynamic) {
                const { rspack } = await import('@rspack/core');
                config.plugins.push(new rspack.optimize.LimitChunkCountPlugin({ maxChunks: 1 }));
              }
              return config;
            },
          },
        },
      });
      await rsbuild.build();
      return { code: await readFile(join(dir, 'index.js'), 'utf8') };
    });
  },

  async rolldown(input, method, phase, extra = {}) {
    const { build } = await import('rolldown');
    return withTmpDir(async dir => {
      const file = join(dir, 'out.mjs');
      await build({
        input,
        platform: 'node',
        treeshake: false,
        plugins: [...extra.siblings ?? [], pluginFor('rolldown')(pluginOpts(method, phase))],
        output: {
          format: 'esm', file, externalLiveBindings: false, keepNames: true,
          // rolldown spells single-chunk output as `codeSplitting: false` and deprecated
          // `inlineDynamicImports`, which warns whenever the key is PRESENT - even set to `false`
          ...extra.inlineDynamic ? { codeSplitting: false } : {},
        },
      });
      return { code: await readFile(file, 'utf8') };
    });
  },

  async farm(input, method, phase, extra = {}) {
    const { build, Logger } = await import('@farmfe/core');
    // Logger level: 'error' doesn't silence "Build completed" — override info methods directly
    function noop() { /* empty */ }
    const silent = Object.assign(new Logger({ level: 'error' }), {
      info: noop, warn: noop, debug: noop, trace: noop, infoOnce: noop, warnOnce: noop, logMessage: noop,
    });
    return withTmpDir(async dir => {
      await build({
        root: testDir,
        logger: silent,
        plugins: [...extra.siblings ?? [], pluginFor('farm')(pluginOpts(method, phase))],
        compilation: {
          input: { index: input },
          output: { path: dir, targetEnv: 'node', format: 'cjs' },
          minify: false,
          sourcemap: false,
          lazyCompilation: false,
          persistentCache: false,
          // force single-file output — otherwise farm splits into __farm_runtime.js + chunks
          partialBundling: { enforceResources: [{ name: 'index', test: ['.+'] }] },
        },
        server: { hmr: false },
      });
      // farm emits .js but test dir has `"type": "module"` — force CJS via .cjs extension
      return { code: await readFile(join(dir, 'index.js'), 'utf8'), ext: '.cjs' };
    });
  },

  // build in bun (Bun.build API only available in bun runtime, so spawn bun),
  // then verify in bun (output mixes CJS/ESM and can't be loaded by node)
  async bun(input, method, phase) {
    return withTmpDir(async dir => {
      const buildScript = join(dir, 'build.mjs');
      await writeFile(buildScript, `
        import { bun as plugin } from ${ JSON.stringify(pathToFileURL(unpluginPath).href) };
        const result = await Bun.build({
          entrypoints: [${ JSON.stringify(input) }],
          outdir: ${ JSON.stringify(dir) },
          target: 'node',
          naming: 'bundle.js',
          plugins: [plugin(${ JSON.stringify(pluginOpts(method, phase)) })],
        });
        if (!result.success) { for (const l of result.logs) console.error(l); process.exit(1); }
      `);
      await $({ quiet: true })`bun ${ buildScript }`;
      return { code: await readFile(join(dir, 'bundle.js'), 'utf8'), verifier: 'bun' };
    });
  },
};

// --- run ---

const hasBun = await which('bun', { nothrow: true });
let failures = 0;

// structural check on the bundler's final sourcemap — confirms our per-module maps
// chain through correctly (rollup/vite merge them into a single output map)
function assertMapShape(label, map) {
  if (!map) throw new Error('expected a sourcemap but got none');
  if (map.version !== 3) throw new Error(`map version ${ map.version } (expected 3)`);
  if (!Array.isArray(map.sources)) throw new Error('map.sources is not an array');
  if (typeof map.mappings !== 'string') throw new Error('map.mappings is not a string');
}

for (const [name, build] of Object.entries(builders)) {
  if (name === 'bun' && !hasBun) {
    echo(chalk.yellow('bun: skipped (not installed)'));
    continue;
  }
  for (const method of methods) {
    // babel-plugin ignores `phase`; other builders exercise the full range
    const phases = name === 'babel' ? [undefined] : phasesFor(method);
    for (const phase of phases) {
      const label = phase ? `${ name }/${ method }/${ phase }` : `${ name }/${ method }`;
      try {
        const { code, ext, map, verifier } = await build(inputOf(method), method, phase);
        if (verifier === 'bun') await verifyInBun(code, label, method);
        else await verifyInNode(code, label, ext);
        if (name === 'rollup' || name === 'vite') assertMapShape(label, map);
        echo(chalk.green(`${ label } passed`));
      } catch (error) {
        echo(chalk.red(`${ label } failed: ${ error.message }`));
        failures++;
      }
    }
  }
}

// --- pre+post contract legs ---
// only bundlers where pre+post ordering is expressible run this leg: esbuild / bun fall back
// to single-mode 'post' by design (see PRE_POST_UNSAFE_BUNDLERS in the plugin) and would
// legitimately miss the pre-recorded mutation; babel-plugin has no phases at all
const phasesInput = resolve(testDir, 'input-phases.js');
for (const name of ['rollup', 'rolldown', 'vite', 'webpack', 'rspack', 'rsbuild', 'farm']) {
  const label = `${ name }/usage-pure/pre+post contract`;
  try {
    const { code, ext } = await builders[name](phasesInput, 'usage-pure', 'pre+post',
      { siblings: [siblingMangler[name]()] });
    await verifyPhases(code, label, ext);
    echo(chalk.green(`${ label } passed`));
  } catch (error) {
    echo(chalk.red(`${ label } failed: ${ error.message }`));
    failures++;
  }
}

// --- dynamic-import legs ---
// usage-global exercises the chunk-loader machinery (dynamic import wrapped in the bundler's
// chunk fetch promises); the lazy module's own body must come out polyfilled too
// bun stays out: its builder runs in a spawned Bun.build script that cannot thread the
// single-file forcing, and bun is not a chunk-loader bundler (no Promise.all wrapper)
const dynamicInput = resolve(testDir, 'input-dynamic.js');
for (const name of ['esbuild', 'rollup', 'rolldown', 'vite', 'webpack', 'rspack', 'rsbuild', 'farm']) {
  const label = `${ name }/usage-global/dynamic-import`;
  try {
    const { code, ext } = await builders[name](dynamicInput, 'usage-global', undefined,
      { inlineDynamic: true });
    await verifyDynamic(code, label, ext);
    echo(chalk.green(`${ label } passed`));
  } catch (error) {
    echo(chalk.red(`${ label } failed: ${ error.message }`));
    failures++;
  }
}

if (failures) throw new Error(`${ failures } integration test(s) failed`);
echo(chalk.green('\nAll integration tests passed'));
