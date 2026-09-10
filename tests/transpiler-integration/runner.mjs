import { deepEqual } from 'node:assert/strict';
import { censusWalkTruncations } from '@core-js/polyfill-provider/detect-usage/mutations';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const { mkdtemp, readFile, rm, writeFile } = fs;
const { dirname, join, resolve } = path;
const { cyan, green, red, yellow } = chalk;

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

// every cell of every leg goes through `runLeg`, so this is the run's denominator. `failures`
// counts what went WRONG and never what was attempted, so a phase / builder / method list that
// stops yielding prints the same final line and exits 0 (measured: 19 cells instead of 93).
// the floor sits under the 86 a machine WITHOUT bun runs (the bun row costs 7 of the 93), which
// is the only legitimate narrowing this matrix has
let cells = 0;
const CELL_FLOOR = 82;

// `entry-global` rejects `phase`; everything else runs across all three.
function phasesFor(method) {
  return method === 'entry-global' ? [undefined] : ['pre', 'post', 'pre+post'];
}

const expected = {
  clamp: 4,
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
    deepEqual(results.clamp, expected.clamp, `${ label }: clamp`);
    deepEqual(results.cooked, expected.cooked, `${ label }: cooked`);
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
    deepEqual(results.patched, 'patched', `${ label }: patched static observed`);
    deepEqual(results.control, expected.clamp, `${ label }: control`);
    deepEqual(mod.injected ?? results.injected, 'sib', `${ label }: sibling-injected call ran`);
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
    deepEqual(await results.lazy, 2, `${ label }: lazy chunk value`);
    deepEqual(results.control, expected.clamp, `${ label }: control`);
  });
}

// bun-mode output mixes CJS/ESM and isn't loadable by node - verify inside bun instead.
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
      deepEqual(mod.clamp, exp.clamp);
      equal(mod.cooked, exp.cooked);
    ` : `
      await import(${ url });
      deepEqual(2.0.clamp(4, 6), exp.clamp);
      equal(String.cooked\`hello\`, exp.cooked);
    `;
    await writeFile(script, `
      import { deepEqual, equal } from 'node:assert/strict';
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
  // babel-plugin has no `phase` option - receives base opts regardless
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
    const { build, NoopLogger } = await import('@farmfe/core');
    // farm's own logger for tests: silences the progress chatter like a hand-nulled `Logger`,
    // but THROWS a build error where the real one prints it and calls `process.exit`
    const silent = new NoopLogger();
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
          // force single-file output - otherwise farm splits into __farm_runtime.js + chunks
          partialBundling: { enforceResources: [{ name: 'index', test: ['.+'] }] },
        },
        server: { hmr: false },
      });
      // farm emits .js but test dir has `"type": "module"` - force CJS via .cjs extension
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

// a bun old enough to miss `file://` import specifiers goes to the npm registry for a package
// named `file:` and fails ALL SEVEN of its cells - with a stack pointing at the plugin's import
// line and no mention of bun, so the row reads as an unplugin defect while 86 cells keep the
// floor green. the version is read, not assumed: three bun binaries can sit on one PATH and the
// Cellar directory name is not the binary's version
const BUN_FLOOR = [1, 0, 0];
const bunBinary = await which('bun', { nothrow: true });
const bunVersion = bunBinary ? (await $({ quiet: true, nothrow: true })`bun --version`).stdout.trim() : null;
const bunTooOld = !!bunVersion && !meetsFloor(bunVersion, BUN_FLOOR);
const hasBun = !!bunBinary && !bunTooOld;

function meetsFloor(version, floor) {
  const parts = version.split('.').map(Number);
  for (const [i, want] of floor.entries()) {
    const got = parts[i] ?? 0;
    if (got !== want) return got > want;
  }
  return true;
}
let failures = 0;

// structural check on the bundler's final sourcemap - confirms our per-module maps
// chain through correctly (rollup/vite merge them into a single output map)
function assertMapShape(label, map) {
  if (!map) throw new Error('expected a sourcemap but got none');
  if (map.version !== 3) throw new Error(`map version ${ map.version } (expected 3)`);
  if (!Array.isArray(map.sources)) throw new Error('map.sources is not an array');
  if (typeof map.mappings !== 'string') throw new Error('map.mappings is not a string');
}

// every leg goes through here: a builder that reports failure by killing the process instead of
// rejecting takes the whole matrix with it - no row for the leg, none of the legs after it, and
// an exit code with nothing printed. turning the exit into a throw keeps that a named red row.
// the WHOLE leg runs inside, not the builder call alone: the verifiers import the built bundle
// into THIS process, and a sibling-plugin factory builds an adapter - either can reach the same
// exit, and both used to sit outside the window (the factory because arguments are evaluated
// before the call they belong to). what still escapes is an exit delivered from a callback
// OUTSIDE the awaited chain: it surfaces as an uncaught exception, and catching those here would
// swallow genuine crashes rather than name one leg
async function runLeg(name, work) {
  cells++;
  const realExit = process.exit;
  function exitTrap(code) {
    throw new Error(`${ name } called process.exit(${ code })`);
  }
  process.exit = exitTrap;
  try {
    return await work();
  } finally {
    process.exit = realExit;
  }
}

for (const name of Object.keys(builders)) {
  if (name === 'bun' && !hasBun) {
    echo(`${ cyan('bun') }: ${ yellow(bunTooOld
      ? `skipped (bun ${ bunVersion } is under the ${ BUN_FLOOR.join('.') } floor - its failures name the plugin, not bun)`
      : 'skipped (not installed)') }`);
    continue;
  }
  for (const method of methods) {
    // babel-plugin ignores `phase`; other builders exercise the full range
    const phases = name === 'babel' ? [undefined] : phasesFor(method);
    async function runCell(phase) {
      const label = [name, method, phase].filter(Boolean).join('/');
      try {
        await runLeg(name, async () => {
          const { code, ext, map, verifier } = await builders[name](inputOf(method), method, phase);
          if (verifier === 'bun') await verifyInBun(code, label, method);
          else await verifyInNode(code, label, ext);
          if (name === 'rollup' || name === 'vite') assertMapShape(label, map);
        });
        echo(`${ cyan(label) } ${ green('passed') }`);
      } catch (error) {
        echo(red(`${ cyan(label) } failed: ${ error.message }`));
        failures++;
      }
    }
    for (const phase of phases) await runCell(phase);
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
    await runLeg(name, async () => {
      const { code, ext } = await builders[name](phasesInput, 'usage-pure', 'pre+post',
        { siblings: [siblingMangler[name]()] });
      await verifyPhases(code, label, ext);
    });
    echo(`${ cyan(label) } ${ green('passed') }`);
  } catch (error) {
    echo(red(`${ cyan(label) } failed: ${ error.message }`));
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
    await runLeg(name, async () => {
      const { code, ext } = await builders[name](dynamicInput, 'usage-global', undefined,
        { inlineDynamic: true });
      await verifyDynamic(code, label, ext);
    });
    echo(`${ cyan(label) } ${ green('passed') }`);
  } catch (error) {
    echo(red(`${ cyan(label) } failed: ${ error.message }`));
    failures++;
  }
}

// --- id-flow legs ---
// Every leg above hands its builder an ordinary module id. A bundler also mints ids whose
// ADMISSION depends on the phase - the sub-blocks a framework plugin splits a component into,
// the component's own bare id, an inline `<script>` lifted out of an .html file, a worker's own
// source - and the table for those (`shouldTransform`) is otherwise held only against strings
// written by hand in `tests/unplugin/unit.mjs`, which cannot see whether a bundler produces such
// an id at all, at which stage, or spelled how. These legs run the real vite pipeline over a
// project that provokes each shape and hold the ACTUAL id stream to that table.
//
// The verdict is read off the plugin's OWN hook rather than by asking the predicate again:
// unplugin's adapter applies `transformInclude` INSIDE the transform wrapper and returns without
// calling the handler when it refuses, so an `undefined` result means REFUSED and any other
// result - `null` included, which is what a pre pass deferring to post returns - means the
// handler ran. A form whose id never reaches a stage fails the leg instead of passing it
// silently, so a cell cannot go green having observed nothing.
const idFlowDir = resolve(testDir, 'id-flow');

// one row per id form. `pre` / `post` are the admission the unit table declares for the shape;
// `injects` names a core-js module only THAT form's body can pull in, which is what proves the
// admitted handler reached the author's code rather than merely being offered the id
const idFlowForms = [
  { label: 'html source file', match: /\/index\.html$/, modes: ['build'], pre: false, post: false },
  {
    label: 'html inline script',
    match: /\/index\.html\?html-proxy&index=\d+\.js$/,
    modes: ['build', 'serve'],
    pre: true,
    post: true,
    injects: 'es.array.at',
  },
  { label: 'SFC source file', match: /\/App\.vue$/, modes: ['build', 'serve'], pre: false, post: true },
  {
    label: 'SFC script block',
    match: /\/App\.vue\?vue&type=script&setup=true&lang\.ts$/,
    modes: ['build'],
    pre: true,
    post: true,
    injects: 'es.string.replace-all',
  },
  { label: 'SFC style block', match: /\/App\.vue\?vue&type=style&/, modes: ['build'], pre: false, post: false },
  { label: 'SFC template block', match: /\/tpl\.html\?vue&type=template&/, modes: ['build', 'serve'], pre: false, post: true },
  { label: 'worker wrapper', match: /\/worker-wrapper\.js\?worker$/, modes: ['build', 'serve'], pre: false, post: false },
  {
    label: 'worker source',
    match: /\/worker-source\.js\?worker_file&type=module$/,
    modes: ['serve'],
    pre: true,
    post: true,
    injects: 'es.array.flat',
  },
];

// wrap the sub-plugins the adapter just built: `offered` is the raw stream reaching each stage,
// `ran` the ids whose handler the include gate actually let through, `emitted` what it returned
function watchIdFlow(plugins, seen) {
  for (const plugin of plugins) {
    const phase = plugin.enforce;
    const { transform } = plugin;
    plugin.transform = async function (code, id, ...rest) {
      seen.offered[phase].add(id);
      const result = await transform.call(this, code, id, ...rest);
      if (result !== undefined) seen.ran[phase].add(id);
      if (result?.code) seen.emitted[phase].set(id, result.code);
      return result;
    };
  }
  return plugins;
}

async function runIdFlow(mode) {
  const seen = {
    offered: { pre: new Set(), post: new Set() },
    ran: { pre: new Set(), post: new Set() },
    emitted: { pre: new Map(), post: new Map() },
    missed: [],
  };
  const vue = (await import('@vitejs/plugin-vue')).default;
  const plugins = [vue(), ...watchIdFlow(pluginFor('vite')(pluginOpts('usage-global', 'pre+post')), seen)];
  const entry = join(idFlowDir, 'index.html');
  if (mode === 'build') {
    const { build } = await import('vite');
    await build({
      root: idFlowDir,
      logLevel: 'silent',
      build: { write: false, minify: false, rollupOptions: { input: entry } },
      plugins,
    });
  } else {
    const { createServer } = await import('vite');
    // the dev pipeline is the only one that mints a worker SOURCE id: a build bundles the worker
    // in a nested pass keyed on the clean path instead. `transformIndexHtml` first, or the inline
    // block's proxy id has nothing behind it
    // `watch: null` is not tidiness: the file watcher this leg never consults is native, and its
    // teardown loses a race with `close()` often enough to matter - measured at 4 runs in 15, each
    // one leaving a REFERENCED libuv async handle that no JS handle backs, so the finished process
    // hangs with nothing to name. Behind a pipe that never closes - the stdin every `run-s` member
    // gets - that is a runner reporting success and then living for over an hour
    const server = await createServer({
      root: idFlowDir,
      logLevel: 'silent',
      server: { middlewareMode: true, hmr: false, watch: null },
      optimizeDeps: { noDiscovery: true, include: [] },
      plugins,
    });
    try {
      await server.transformIndexHtml('/index.html', await readFile(entry, 'utf8'));
      // the SFC's TEMPLATE block is reached only through the module that imports it, and nothing
      // asks for it on its own - so read the specifier the framework plugin just minted out of
      // the compiled SFC rather than spelling its query here, which would assert our guess of it
      const compiled = await server.environments.client.transformRequest('/src/Tpl.vue');
      const block = /["'](?<id>[^"']*[&?]type=template[^"']*)["']/u.exec(compiled?.code ?? '');
      for (const url of [
        '/src/main.js',
        '/src/App.vue',
        block?.groups.id ?? '/src/Tpl.vue?vue&type=template',
        '/index.html?html-proxy&index=0.js',
        '/src/worker-source.js?worker_file&type=module',
        '/src/worker-wrapper.js?worker',
      ]) {
        // a url the pipeline no longer serves is RECORDED, not rethrown: thrown, it would red
        // every form of this run rather than the one whose id went missing. the record rides
        // along to whichever leg then finds its form absent, so the cause is still named
        try {
          await server.environments.client.transformRequest(url);
        } catch (error) {
          seen.missed.push(`${ url } (${ error.message.split('\n', 1)[0] })`);
        }
      }
    } finally {
      await server.close();
    }
  }
  return seen;
}

function assertIdFlowForm(seen, form, label) {
  for (const phase of ['pre', 'post']) {
    const ids = [...seen.offered[phase]].filter(id => form.match.test(id));
    if (!ids.length) {
      const cause = seen.missed.length ? `; unserved: ${ seen.missed.join(', ') }` : '';
      throw new Error(`${ label }: no id of this form reached the ${ phase } stage${ cause }`);
    }
    for (const id of ids) {
      const ran = seen.ran[phase].has(id);
      if (ran !== form[phase]) {
        throw new Error(`${ label }: ${ phase } ${ ran ? 'transformed' : 'refused' } ${ id }, table says ${ form[phase] ? 'admit' : 'refuse' }`);
      }
    }
  }
  if (!form.injects) return;
  // an admitted id proves the gate; only the injection proves the handler reached the body behind
  // it. either phase may carry it - the pre pass defers to post whenever both run
  const carriers = ['pre', 'post'].flatMap(phase => [...seen.emitted[phase]]
    .filter(([id]) => form.match.test(id)).map(([, code]) => code));
  if (carriers.every(code => !code.includes(`core-js/modules/${ form.injects }`))) {
    throw new Error(`${ label }: nothing injected \`${ form.injects }\` into this form's body`);
  }
}

// the two runs happen once each; a run that throws reds every form it was carrying, one row apiece
const idFlowSeen = {};
for (const mode of ['build', 'serve']) {
  try {
    idFlowSeen[mode] = { seen: await runIdFlow(mode) };
  } catch (error) {
    idFlowSeen[mode] = { error };
  }
}
for (const form of idFlowForms) {
  for (const mode of form.modes) {
    const label = `vite:${ mode }/id-flow/${ form.label }`;
    try {
      await runLeg('vite', () => {
        const { seen, error } = idFlowSeen[mode];
        if (error) throw error;
        assertIdFlowForm(seen, form, label);
      });
      echo(`${ cyan(label) } ${ green('passed') }`);
    } catch (error) {
      echo(red(`${ cyan(label) } failed: ${ error.message }`));
      failures++;
    }
  }
}

// the escape census carries a step CEILING under a walk that cannot converge, and truncating there
// costs a degraded answer no output diff can show - the shape stays legal, it is just derived from
// less. this run is the one that feeds the plugin a real framework runtime, so it is where that
// backstop is read: free, and it does not care how fast the machine is. a non-zero count is a
// converge regression in the analysis, not a slow machine
const truncated = censusWalkTruncations();
if (truncated) throw new Error(`the escape census truncated ${ truncated } walk(s) at its step ceiling`);
if (cells < CELL_FLOOR) throw new Error(`integration matrix collapsed: ${ cells } cells ran, under the floor of ${ CELL_FLOOR }`);
if (failures) throw new Error(`${ failures } integration test(s) failed`);
echo(green('\nAll integration tests passed'));
