// The bundling core of the suite: option construction, temp entries, the runtime build, and the
// gates and reporting helpers the runners share.
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import unplugin from '@core-js/unplugin';
import { transform as esbuildTransform } from 'esbuild';
import { parse as acornParse } from 'acorn';
import { METHODS, phasesFor, pluginOpts as matrixOpts } from '../transpiler-integration/matrix.mjs';
import { createRequire } from 'node:module';
import { existsSync, statSync } from 'node:fs';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve as resolvePath } from 'node:path';
import { promisify } from 'node:util';
import { gzip } from 'node:zlib';

const gzipP = promisify(gzip);

export const HERE = import.meta.dirname;
const TMP = join(HERE, '.tmp');

// The methods and phases are the shared matrix, re-exported so the runners here have one import for
// everything the build takes.
export { METHODS, phasesFor };

// unplugin is a bundler plugin and takes a phase; babel-plugin runs inside the Babel pass and has
// none. That asymmetry is what the runtime tier's reference/delta pairing is built on.
export const PROVIDERS = ['babel-plugin', 'unplugin'];

// the one axis this suite adds to the shared options: everything it builds is aimed at IE11
function pluginOpts(method, phase) {
  return matrixOpts(method, phase, { targets: { ie: 11 } });
}

// The entry has to sit under HERE/.tmp for its bare `core-js` / `rxjs` imports to resolve to the
// suite's node_modules; the pid+hrtime suffix keeps concurrent runs off each other's paths.
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

export const u = (bundler, method, phase) => unplugin[bundler](pluginOpts(method, phase));

// -------- runtime builder: ES5 UMD via Babel(syntax) + a stdlib provider --------
// A custom transform rather than @rollup/plugin-babel, so the suite's own @babel/core and
// preset-env drive the down-compile directly.
const localRequire = createRequire(join(HERE, 'package.json'));
let cachedToolchain;
function babelToolchain() {
  if (!cachedToolchain) {
    cachedToolchain = {
      // everything but the preset comes from the repo root, which `localRequire` walks up to: the same
      // @babel/core the rest of the monorepo builds with, and the type strip it already uses in
      // `scripts/bundle-tests`. The preset stays local because the root has none - and it is what a
      // third-party corpus needs, since the root's hand-written plugin list is tuned for first-party
      // sources and lowers no modern regexp syntax.
      //
      // Each is an absolute path rather than a bare name: Babel resolves a bare one from the file being
      // compiled, which here is a library module deep in node_modules.
      core: localRequire('@babel/core'),
      preset: localRequire.resolve('@babel/preset-env'),
      ts: localRequire.resolve('@babel/plugin-transform-typescript'),
      corejs: localRequire.resolve('@core-js/babel-plugin'),
    };
  }
  return cachedToolchain;
}

// -------- TypeScript sources --------
// Packages consumed as their TypeScript SOURCE, which is what gives the `pre` phase something to be
// about (see exercises/htmlparser2.mjs). Only packages that actually ship `src/**/*.ts` are listed.
//
// A property of the toolchain rather than of a fixture, hence here and not in libraries.mjs.
//
// All of them are DECLARED in this suite's package.json even though some arrive only through another
// package's graph: that declaration is what makes npm hoist them to this directory's node_modules
// root, the single place the path below looks.
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

// A SCOPED name would pass every other check and still do nothing: `resolveId` splits a bare
// specifier at the first `/`, so `@scope/pkg` arrives as `@scope`, never matches the set, and the
// package resolves to its published JS with the whole matrix green - the same silent degradation the
// missing-source check below exists to stop, and one no baseline would notice either. Refuse it here
// rather than teach `resolveId` a two-segment form no entry uses: an untested resolution path would
// be its own way to be quietly wrong. Whoever adds the first scoped package writes both.
//
// A property of the SET, so it is checked once per process, wherever the first chain is built - unlike
// the missing source below, which belongs to the specifier that asked for it.
let scopedNamesChecked = false;
function assertNoScopedNames() {
  if (scopedNamesChecked) return;
  const scoped = [...TS_SOURCE_PACKAGES].filter(name => name.startsWith('@'));
  if (scoped.length) {
    throw new Error(`TS_SOURCE_PACKAGES: ${ scoped.join(', ') } is scoped, which \`tsSources\` cannot `
      + 'resolve - it splits a bare specifier at the first `/`, so the name never matches and the '
      + 'package would silently build from its published JS. Teach `resolveId` the `@scope/name` form first.');
  }
  scopedNamesChecked = true;
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
// The snapshots do NOT guard this: the type-derived injections come from a couple of origins each, so
// a package that quietly falls back to its published JS is masked by the others and every gate stays
// green while the fixture becomes half a JavaScript build. So a listed package that cannot be served
// from source is a hard failure - but raised HERE, against the specifier that asked for it, rather
// than when the plugin is constructed: only the cells that actually import it are affected, and the
// message names the import instead of accusing all four libraries of one package's missing `src`.
function tsSourceOf(source) {
  const [name, ...rest] = source.split('/');
  if (!TS_SOURCE_PACKAGES.has(name)) return null;
  const sub = rest.length ? rest.join('/') : 'index';
  const file = firstExistingFile([join(NODE_MODULES, name, 'src', `${ sub }.ts`), join(NODE_MODULES, name, 'src', sub, 'index.ts')]);
  if (file) return file;
  throw new Error(`TS_SOURCE_PACKAGES: '${ source }' has no TypeScript source under node_modules/${ name }/src `
    + '- that package is built from its sources (see build.mjs), and without them this build silently '
    + 'degrades to a published-JS one. Reinstall, or drop the package from the set deliberately.');
}

export function tsSources() {
  assertNoScopedNames();
  return {
    name: 'e2e-ts-sources',
    resolveId(source, importer) {
      if (source.startsWith('.')) {
        if (!importer || TS_SOURCE_ROOTS.every(root => !toPosix(importer).startsWith(root))) return null;
        const abs = resolvePath(dirname(importer), source);
        return firstExistingFile([abs.replace(/\.[cm]?js$/, '.ts'), `${ abs }.ts`, join(abs, 'index.ts')]);
      }
      return tsSourceOf(source);
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
// The package boundary (`node_modules/` or `packages/`) is load-bearing: a bare `/core-js/` also
// matches the CHECKOUT DIRECTORY, which `git clone` of this repo produces, and that excludes every
// module in the graph - the ES5 down-compile silently becomes a no-op while the injection count and
// the modern-realm pre-flight both stay green.
const BABEL_EXCLUDE = [/[/\\](?:node_modules|packages)[/\\](?:core-js(?:-pure)?|@core-js[/\\][^/\\]+)[/\\]/];
function babelSyntaxPlugin({ core, preset, ts, corejs }, { downCompile, coreJs = null }) {
  return {
    name: coreJs ? 'e2e-babel-syntax+core-js' : downCompile ? 'e2e-babel-syntax' : 'e2e-ts-strip',
    async transform(code, id) {
      if (BABEL_EXCLUDE.some(re => re.test(id))) return null;
      // the same modules unplugin admits, and for the same reason it refuses these: a virtual module
      // or a commonjs proxy is the bundler's own code, not the library's. Transforming them here would
      // compare the two providers over different module sets - babel-plugin injecting for the interop
      // helper rollup generated, unplugin never asked about it (`shouldTransform` in @core-js/unplugin)
      if (id.includes('\0') || id.includes('?commonjs-') || id.includes('?commonjsExternal')) return null;
      const typescript = TS_EXTENSION.test(id);
      // With `downCompile: false` there is nothing to do to a `.js` module - returning null leaves it
      // byte-identical instead of round-tripping it through Babel's printer, which is what "no
      // transforms" has to mean for the stage that measures it. `coreJs` never pairs with it: the
      // provider has to see every module, not just the `.ts` ones.
      if (!downCompile && !typescript) return null;
      // the type strip is a PLUGIN, and plugins run before presets - types have to be gone before
      // preset-env starts lowering. Only for `.ts` (see tsSources above): applied unconditionally it
      // would switch the parser to TS for every file, and TS resolves `<T>x` and `a < b > (c)`
      // differently from JS.
      const presets = downCompile ? [[preset, { targets: { ie: '11' }, useBuiltIns: false, modules: false }]] : [];
      const plugins = typescript ? [[ts, {}]] : [];
      if (coreJs) plugins.push([corejs, coreJs]);
      // `useBuiltIns: false` above is what leaves the stdlib to a provider. When `coreJs` is set that
      // provider is @core-js/babel-plugin, running as a PLUGIN in this same pass rather than as a
      // second tool downstream - which is the whole difference being measured against unplugin.
      const out = await core.transformAsync(code, {
        filename: id, configFile: false, babelrc: false, sourceMaps: false, compact: false, presets, plugins,
      });
      return out && typeof out.code === 'string' ? { code: out.code, map: null } : null;
    },
  };
}

// Shared by runtimeBuild and pipeline.mjs so both down-compile through the exact same Babel config.
// `coreJs` turns the same pass into the babel-plugin PROVIDER build - the stdlib is injected from
// inside this traversal instead of by a tool downstream.
export function makeBabelPlugin(coreJs = null) {
  return babelSyntaxPlugin(babelToolchain(), { downCompile: true, coreJs });
}

// TYPE ERASURE ONLY, for pipeline's stage [A]: a TS-source library has no buildable "no transforms"
// state, since rollup's parser rejects `.ts`. Erasure is not a down-compile, so the ES5 lowering [A]
// exists to measure is still entirely in the [A] -> [B] delta.
export function makeTsStripPlugin() {
  return babelSyntaxPlugin(babelToolchain(), { downCompile: false });
}

// Swallowing UNRESOLVED_IMPORT is not untidiness, it is the failure mode: rollup turns the specifier
// into an external `require(...)`, so the polyfill leaves the bundle while the node pre-flight still
// passes - node resolves what rollup would not - and the page uploaded to a browser is dead on arrival.
export function strictWarn(w) {
  if (w.code === 'UNRESOLVED_IMPORT' || w.code === 'MISSING_EXPORT') throw new Error(`${ w.code }: ${ w.message }`);
  // the one channel by which unplugin reports its own failure: a source oxc cannot parse is warned
  // about and handed back untransformed, so that module loses its injections while the payload gate,
  // the injection count and the ES5 parse all stay green on what the other modules contributed.
  // Other plugins' warnings stay warnings - `w.plugin` is `core-js-unplugin`, or `:pre` / `:post`
  if (w.code === 'PLUGIN_WARNING' && w.plugin?.startsWith('core-js-unplugin')) {
    throw new Error(`${ w.plugin }: ${ w.message }`);
  }
}

// The other half of the same guard, and NOT covered by strictWarn: rollup warns about an externalised
// node builtin under codes strictWarn drops without a word. An externalised specifier is a
// `require(...)` in the UMD header - fine in node, fatal in the browser these bundles exist for. Every
// build that publishes "the real IE11 bundle" has to call it, or the two stop describing the same thing.
export function assertNoExternals(chunk, label) {
  if (chunk.imports.length) {
    throw new Error(`${ label }: bundle left ${ chunk.imports.length } import(s) external: ${ chunk.imports.join(', ') }`);
  }
}

// How many bytes of core-js actually reached the chunk. The injection COUNT cannot answer this: the
// recorder matches specifier text, which survives in the module source even when rollup then drops
// the module entirely. Flipping `sideEffects` to false in the pinned core-js is enough to do that -
// every side-effect-only polyfill import is tree-shaken away, most of the bundle goes with them, and
// a count-based gate still reads its full healthy number. Measuring the chunk's own module table
// catches that shape for every method, and needs no second build to compare against.
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

// The ES5 UMD bundle, polyfilled by ONE of the two providers.
//
// Plugin ordering is not the array order: raw Rollup ignores the plugin-level `enforce` field but
// honours the hook-level `order` unplugin sets on its transform. `usage-*` is 'post', so unplugin sees
// Babel's helper output; `entry-global` is pinned to 'pre' regardless, which is harmless - it expands
// `import 'core-js'` and needs no helpers. With `provider: 'babel-plugin'` unplugin is absent
// entirely, which is why that build is the reference the phases are diffed against.
//
// `injected` is observed inside THIS build and is the SET, not a count: capturing it in a separate
// pass would describe a different configuration, so a build whose own injection had gone no-op would
// still report a healthy one.
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

// -------- shared gates and reporting helpers --------
// The only check that verifies the runtime tier's premise rather than a proxy for it: the pre-flight
// realm and the browser page are both modern, so a bundle that skipped the down-compile passes
// everything else. It must PARSE, not transform - esbuild's `target: 'es5'` LOWERS what it can and
// accepts arrows, `?.` and `??`, so a gate built on it reports success for ES2020 text.
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
  // The premise is asserted on the INPUT. Parsing the output instead would only ask esbuild whether
  // it emitted what it was just told to emit: `target: 'es5'` lowers what it can and throws on the
  // rest, so such a check can never fire - and could not help where it counts anyway, since a `/a/u`
  // literal leaves as `new RegExp("a", "u")`, which parses as ES5 and dies in IE11 all the same.
  assertES5(code, label);
  // `target: 'es5'` is load-bearing, not cosmetic: without it esbuild minifies to esnext and emits
  // e.g. optional catch bindings, so the published "wire size" would describe a bundle that cannot
  // load in the very engine the artifact targets, and would understate it besides.
  const minText = (await esbuildTransform(code, { minify: true, legalComments: 'none', target: 'es5' })).code;
  const min = Buffer.from(minText);
  return { min: min.length, gz: (await gzipP(min)).length };
}

// Turn an unknown throwable into one console-width line. Child-process failures carry the real
// reason on stderr, not on `message` (which is just "Command failed: ..."), and node prints the
// offending `file:line` BEFORE the actual `TypeError: ...` - so prefer the first line that names an
// error and fall back to the first line at all.
const REASON_MAX = 200; // one terminal row; long enough for a stack's first frame
export function errorReason(err) {
  // each source is tried for CONTENT, not for truthiness: a child whose stderr is a lone newline
  // would otherwise win the `||` chain and reduce the whole line to `FAIL <label>: `. The default
  // `[object Object]` is skipped on the same ground - it is a stringification, not a reason
  for (const source of [err?.stderr, err?.message, err]) {
    const text = String(source ?? '');
    if (text === '[object Object]') continue;
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) continue;
    return (lines.find(l => /^\w*(?:Error|Exception)\b/.test(l)) ?? lines[0]).slice(0, REASON_MAX);
  }
  // nothing said anything - still name what failed rather than print an empty reason
  return [err?.name, err?.exitCode === undefined ? null : `exit ${ err.exitCode }`].filter(Boolean).join(', ')
    || 'failed without a message';
}
