import { deepEqual } from 'node:assert/strict';
import { pathToFileURL } from 'node:url';
import { KNOWN_BUNDLERS, isChunkLoaderBundler } from '../../packages/core-js-unplugin/internals/plugin-helpers.js';
import { makeBundlers, withTmpDir } from './bundlers.mjs';
import { METHODS as methods, phasesFor, pluginOpts } from './matrix.mjs';

const { readFile, writeFile } = fs;
const { dirname, join, resolve } = path;

const testDir = import.meta.dirname;
const unpluginPath = resolve(testDir, '../../packages/core-js-unplugin/index.js');

function inputOf(method) {
  return resolve(testDir, `input-${ method }.js`);
}

const expected = {
  clamp: 4,
  cooked: 'hello',
};

// --- helpers ---

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

// --- builders ---
// each returns { code, ext?, map?, verifier? }. `verifier` defaults to verifyInNode; `map` is the key
// rollup and vite add, and `assertMapShape` below consumes it. `bundlers.mjs` carries the full table -
// a builder here is that plus the two that are not plain bundler runs.

const unplugin = await import('@core-js/unplugin');

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

// The plugin's own name, read off an instance rather than spelled anywhere: `bundlers.mjs` escalates
// the warning unplugin reports its own parse failures through, and a literal copy of the name would
// stop matching on a rename in the plugin with every leg still green. The phase suffix - `:post` here
// - comes off with the split. `tests/e2e-libs/build.mjs` derives it the same way, for the same gate.
const [UNPLUGIN_NAME] = [unplugin.rollup(pluginOpts('usage-global', 'post'))].flat()[0].name.split(':', 1);

// `root` is a parameter rather than a constant inside `bundlers.mjs` because only the caller knows
// it: vite, rsbuild and farm resolve from it, and each silently falls back to the working directory
// otherwise. This suite roots them where its inputs live, which is this directory
const bundlers = makeBundlers({ root: testDir, unpluginName: UNPLUGIN_NAME });

// The bundler axis is kept by hand in six places at once - the adapters in `bundlers.mjs`, the two
// leg lists below, and three sets inside `@core-js/unplugin` that name bundlers as strings - so
// something has to compare what it can: an adapter added without a leg entry produces a full green
// method x phase grid with no cells on either leg, exit 0, and no line saying so. Two of those sets
// are compared here; the third, `PRE_POST_UNSAFE_BUNDLERS`, is private to the plugin - which is why
// the `pre+post` list below is the one nothing answers for, as AGENTS.md says.
//
// Cross-checks rather than derivation, deliberately - `matrix.mjs` states why an axis derived from the
// code under test stops covering whatever that code drops.
//
// Against the NAMED exports, which are what this package advertises: one entry pair per binding. The
// default export is wider - it publishes whatever upstream's `createUnplugin` returned - so switching
// this to it would demand a cell for every bundler unplugin can name, which is a decision for
// `packages/core-js-unplugin` and not for a suite. bun is the exception with a reason: it builds
// inside a spawned process, so it has a builder here rather than an adapter in `bundlers.mjs`.
const targeted = Object.keys(unplugin).filter(name => KNOWN_BUNDLERS.has(name) && name !== 'bun');
const adapters = Object.keys(bundlers);
const missingAdapter = targeted.filter(name => !adapters.includes(name));
const unknownAdapter = adapters.filter(name => !KNOWN_BUNDLERS.has(name));
if (missingAdapter.length || unknownAdapter.length) {
  throw new Error('the bundler axis disagrees with @core-js/unplugin:'
    + `${ missingAdapter.length ? ` the plugin exports an adapter for ${ missingAdapter.join(', ') } and this suite has none;` : '' }`
    + `${ unknownAdapter.length ? ` the plugin does not know ${ unknownAdapter.join(', ') };` : '' }`
    + ' every bundler core-js ships an entry pair for gets a cell here');
}

// A chunk-loader classification earns a bundler an extra `es.promise.all`, and the dynamic-import leg
// at the end of this file is the only place it is observable, so a classified bundler with an adapter
// here has to have a cell there: the list is kept by hand and a name dropped from it takes its
// coverage along in silence. Over the adapters, not over the plugin's set - that set names bundlers
// this suite has nothing to drive. Answered up here with the check above, since both read the
// adapters alone: at the leg itself it would report after the whole grid had already run.
const DYNAMIC_LEG = new Set(['esbuild', 'rollup', 'rolldown', 'vite', 'webpack', 'rspack', 'rsbuild', 'farm']);
const unexercisedChunkLoaders = adapters.filter(name => isChunkLoaderBundler(name) && !DYNAMIC_LEG.has(name));
if (unexercisedChunkLoaders.length) {
  throw new Error(`${ unexercisedChunkLoaders.join(', ') } is classified as a chunk loader in @core-js/unplugin`
    + ' and has no dynamic-import cell - the one leg where that classification is observable');
}

// every bundler is driven the same way here - unplugin's binding for that tool, plus whatever
// sibling the leg registers beside it - so the matrix is derived rather than spelled out
const throughUnplugin = Object.fromEntries(Object.keys(bundlers).map(name => [name, (input, method, phase, extra = {}) => {
  const plugins = [...extra.siblings ?? [], unplugin[name](pluginOpts(method, phase))];
  return bundlers[name](input, plugins, extra);
}]));

const builders = {
  // babel-plugin has no `phase` option - receives base opts regardless
  async babel(input, method) {
    const { transformAsync } = await import('@babel/core');
    const source = await readFile(input, 'utf8');
    const { code } = await transformAsync(source, {
      filename: input,
      plugins: [['@core-js', pluginOpts(method)]],
    });
    return bundlers.esbuild({ stdin: { contents: code, resolveDir: dirname(input), loader: 'js' } });
  },

  ...throughUnplugin,

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
    // through the shared matrix rather than a local special-case: that babel-plugin has no phase of
    // its own is one fact, and `matrix.mjs` is where both bundler suites read it from
    const phases = phasesFor(method, name === 'babel' ? 'babel-plugin' : 'unplugin');
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
for (const name of DYNAMIC_LEG) {
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
