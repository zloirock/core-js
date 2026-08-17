// The bundling core of the suite: option construction, temp entries, the runtime build, and the
// gates and reporting helpers the runners share.
import { rollup } from 'rollup';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import unplugin from '@core-js/unplugin';
import { transform as esbuildTransform } from 'esbuild';
import { parse as acornParse } from 'acorn';
import { METHODS, phasesFor, pluginOpts as matrixOpts } from '../transpiler-integration/matrix.mjs';
import { discard } from './diagnostics.mjs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
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

// The one axis this suite adds to the shared options, and the floor the whole thing is about. ONE
// declaration, consumed both by the provider - which selects modules for it - and by preset-env, which
// lowers syntax to it: two spellings could drift into Babel compiling for one engine while core-js
// polyfills for another, and every gate would stay green, since each asks only about its own half.
const IE11 = { ie: 11 };
function pluginOpts(method, phase) {
  return matrixOpts(method, phase, { targets: IE11 });
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
    // through `discard`: a bare `rm` here throws INSIDE the `finally`, which replaces whatever this
    // cell was about to report - and reddens a cell that had just passed
    await discard(() => rm(file, { force: true }), relative(HERE, file));
  }
}

export const u = (bundler, method, phase) => unplugin[bundler](pluginOpts(method, phase));

// What every bundle of this suite is: one UMD file with a global name, loadable by the node pre-flight
// and by a `<script>` in IE11 alike. Shared, because pipeline.mjs publishes sizes of bundles that have
// to be the same shape as the ones runtime.mjs ships - two copies that drifted would have the report
// describing an artifact nobody runs.
export const UMD_OUTPUT = { format: 'umd', name: 'E2E', esModule: false };

// -------- runtime builder: ES5 UMD via Babel(syntax) + a stdlib provider --------
// A custom transform rather than @rollup/plugin-babel, so the suite's own @babel/core and
// preset-env drive the down-compile directly.
const localRequire = createRequire(join(HERE, 'package.json'));
let cachedToolchain;
function babelToolchain() {
  if (!cachedToolchain) {
    cachedToolchain = {
      // Babel 8 throughout, the major the monorepo builds with. `@babel/core` and the preset resolve
      // HERE though: preset-env peer-depends on core, so npm installs a copy beside it whether or not
      // this package.json asks for one - dropping the declaration changes the lockfile and nothing
      // else. The preset has to be local anyway, since the root has none: its hand-written plugin
      // list is tuned for first-party sources and lowers no modern regexp syntax, which a
      // third-party corpus needs. The type strip and the core-js plugin do come from the root.
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

// -------- what this run was fed --------
// "Was this the same input?" is the expensive question to answer after the fact, and a snapshot that
// drifts between two machines is answered almost entirely by this.
//
// DERIVED from the declarations that decide what is installed here, never curated. Which package is
// the sole origin of a baseline line is not knowable by reading the list - a transitive dependency
// deep in a fixture's graph can be the only caller of a method - so a list of what feels like input is
// the list that goes stale. The toolchain is in it for the same reason: a Babel bump moves injection
// sets exactly as a library bump does.
async function version(pkg) {
  // resolving `<pkg>/package.json` is the direct route and finds a hoisted or nested copy too, but it
  // fails for packages whose `exports` map does not list it (three, @codemirror/state) - fall back to
  // the flat path under this suite before giving up
  for (const file of [
    () => fileURLToPath(import.meta.resolve(`${ pkg }/package.json`)),
    () => join(NODE_MODULES, pkg, 'package.json'),
  ]) {
    try {
      return JSON.parse(await readFile(file())).version;
    } catch { /* try the next route */ }
  }
  return '?'; // a missing version is diagnostic noise, never a reason to abort a run
}

// `@core-js/pure` is appended rather than declared: it is the runtime of the `usage-pure` cells and
// this directory cannot pin it - see AGENTS.md - so the declarations alone leave out that half of the
// matrix's polyfill source.
//
// The named list is what a reader acts on and is still not the whole input: a TRANSITIVE version moves
// baselines exactly as a declared one does, and nothing declares it here. The lockfile digest is the
// complete half - it stands for every resolved version in the tree, so two runs whose digests agree
// were fed the same packages, and two that differ can be diffed on the file itself.
export async function describeInput() {
  const declared = JSON.parse(await readFile(join(HERE, 'package.json'))).devDependencies ?? {};
  const names = [...new Set([...Object.keys(declared), '@core-js/pure'])].sort();
  const versions = await Promise.all(names.map(name => version(name)));
  return {
    environment: `${ process.platform }/${ process.arch } node ${ process.version }`,
    lockfile: await digestOf(join(HERE, 'package-lock.json')),
    packages: Object.fromEntries(names.map((name, index) => [name, versions[index]])),
  };
}

async function digestOf(file) {
  try {
    return createHash('sha256').update(await readFile(file)).digest('hex').slice(0, 12);
  } catch { return '?'; } // same rule as a missing version: diagnostic noise, never a reason to abort
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
// form instead; `recorder` normalizes for the same reason, and so does every path this suite hands
// to a shell or to a glob.
export function toPosix(p) {
  return p.replaceAll('\\', '/');
}
const TS_SOURCE_ROOTS = [...TS_SOURCE_PACKAGES].map(name => toPosix(join(NODE_MODULES, name, 'src')));

// Every installed package, scoped ones by their full `@scope/name`. Sync and once per process, like
// everything else this file reads off the install.
function nodeModulesEntries() {
  const names = [];
  // eslint-disable-next-line node/no-sync -- once per process, before any build starts
  for (const entry of readdirSync(NODE_MODULES)) {
    if (!entry.startsWith('@')) {
      names.push(entry);
      continue;
    }
    // eslint-disable-next-line node/no-sync -- once per process, before any build starts
    for (const scoped of readdirSync(join(NODE_MODULES, entry))) names.push(`${ entry }/${ scoped }`);
  }
  return names;
}

// A SCOPED name would pass every other check and still do nothing: `resolveId` splits a bare
// specifier at the first `/`, so `@scope/pkg` arrives as `@scope`, never matches the set, and the
// package resolves to its published JS with the whole matrix green - the same silent degradation the
// missing-source check below exists to stop, and one no baseline would notice either. Refuse it here
// rather than teach `resolveId` a two-segment form no entry uses: an untested resolution path would
// be its own way to be quietly wrong. Whoever adds the first scoped package writes both.
//
// A property of the SET, so it is checked once per process, wherever the first chain is built - unlike
// the missing source below, which belongs to the specifier that asked for it.
let setChecked = false;
function assertUsableSet() {
  if (setChecked) return;
  const scoped = [...TS_SOURCE_PACKAGES].filter(name => name.startsWith('@'));
  if (scoped.length) {
    throw new Error(`TS_SOURCE_PACKAGES: ${ scoped.join(', ') } is scoped, which \`tsSources\` cannot `
      + 'resolve - it splits a bare specifier at the first `/`, so the name never matches and the '
      + 'package would silently build from its published JS. Teach `resolveId` the `@scope/name` form first.');
  }
  // `resolveId` answers a bare specifier from the TOP-LEVEL copy whoever the importer is, which is
  // right only while there is exactly one copy. A nested one - npm's answer to a version conflict -
  // would have one package's importer served the other version's sources, mixing two libraries into
  // a build that reports itself as either. Nothing downstream could see it, so refuse it here.
  //
  // Every package in the graph is looked at, not only the listed ones: the importer that gets served
  // the wrong sources is whoever asks, and `domhandler` holding its own `entities` is exactly as
  // silent as `htmlparser2` doing it. One level deep and scoped names included, which is where npm
  // puts a conflicting copy.
  for (const owner of nodeModulesEntries()) {
    for (const name of TS_SOURCE_PACKAGES) {
      // eslint-disable-next-line node/no-sync -- once per process, before any build starts
      if (owner !== name && existsSync(join(NODE_MODULES, owner, 'node_modules', name))) {
        throw new Error(`TS_SOURCE_PACKAGES: ${ owner } carries its own copy of ${ name } - \`tsSources\` `
          + 'resolves every bare specifier to the top-level copy, so the two versions would be mixed '
          + 'silently. Reconcile the pinned versions so npm hoists a single copy.');
      }
    }
  }
  setChecked = true;
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
// node resolution answers `htmlparser2` with its published `dist/**.js`, and the first hook wins.
//
// Two shapes, both from the real graph:
//   bare      `htmlparser2` / `entities/decode`  ->  <pkg>/src/index.ts / <pkg>/src/decode.ts
//   relative  `./Parser.js` from inside one of those `src` dirs  ->  ./Parser.ts
// The relative one is the TS-ESM idiom - the specifier names the file the compiler WILL emit - and
// node's resolver never maps it, so without this every intra-package import resolves to nothing.
// A listed package that cannot be served from source is a hard failure, and the snapshots do not
// guard it: the type-derived injections have a couple of origins each, so one package falling back to
// published JS is masked by the others. Raised against the specifier that asked, not at construction,
// so only the cells importing it fail and the message names the import.
function tsSourceOf(source) {
  const [name, ...rest] = source.split('/');
  if (!TS_SOURCE_PACKAGES.has(name)) return null;
  // the extension is dropped for the same reason the relative branch above drops it: a TS-ESM
  // specifier names the file the compiler WILL emit, and that form is as legal across a package
  // boundary as it is inside one
  const sub = (rest.length ? rest.join('/') : 'index').replace(/\.[cm]?js$/, '');
  const file = firstExistingFile([join(NODE_MODULES, name, 'src', `${ sub }.ts`), join(NODE_MODULES, name, 'src', sub, 'index.ts')]);
  if (file) return file;
  throw new Error(`TS_SOURCE_PACKAGES: '${ source }' has no TypeScript source under node_modules/${ name }/src `
    + '- that package is built from its sources (see build.mjs), and without them this build silently '
    + 'degrades to a published-JS one. Reinstall, or drop the package from the set deliberately.');
}

export function tsSources() {
  assertUsableSet();
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
// candidates above are all built as `<name>.ts` - so this is the regex saying what it means rather
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

// Is this module the LIBRARY's, or the bundler's own? The same question `shouldTransform` asks inside
// `@core-js/unplugin`, and the same answer: a virtual module or a commonjs proxy is machinery rollup
// minted, not code anybody wrote.
//
// Two consumers, and both need the same answer. Transforming the bundler's own modules would compare
// the providers over different module sets - babel-plugin injecting for an interop helper unplugin is
// never asked about - and counting them as library source overstates the reporting tier's `src`.
export function isLibraryModule(id) {
  return !id.includes('\0') && !id.includes('?commonjs-') && !id.includes('?commonjsExternal');
}
function babelSyntaxPlugin({ core, preset, ts, corejs }, { downCompile, coreJs = null }) {
  return {
    name: coreJs ? 'e2e-babel-syntax+core-js' : downCompile ? 'e2e-babel-syntax' : 'e2e-ts-strip',
    async transform(code, id) {
      if (BABEL_EXCLUDE.some(re => re.test(id))) return null;
      if (!isLibraryModule(id)) return null;
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
      const presets = downCompile ? [[preset, { targets: IE11, useBuiltIns: false, modules: false }]] : [];
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
// The prefix belongs to `@core-js/unplugin`, so it is read off an instance rather than spelled here.
// This is the only channel by which unplugin reports its OWN failure - a module oxc could not parse is
// handed back untransformed with a warning - and nothing else in the repo pins that name, so a rename
// there would turn the gate below into a silent no-op.
const [UNPLUGIN_NAME] = [u('rollup', 'usage-global', 'post')].flat()[0].name.split(':', 1);

// `warn` is rollup's own handler, and taking it is not optional: installing `onwarn` REPLACES the
// default printing rather than adding to it, so every code this function does not escalate is
// destroyed unless it is handed back. Required rather than defaulted - rollup always passes it, and a
// default would be a second way to lose the channel silently, which is the defect this shape exists
// against.
export function strictWarn(w, warn) {
  if (w.code === 'UNRESOLVED_IMPORT' || w.code === 'MISSING_EXPORT') throw new Error(`${ w.code }: ${ w.message }`);
  // the one channel by which unplugin reports its own failure: a source oxc cannot parse is warned
  // about and handed back untransformed, so that module loses its injections while the payload gate,
  // the injection count and the ES5 parse all stay green on what the other modules contributed.
  // Other plugins' warnings stay warnings - `w.plugin` is `core-js-unplugin`, or `:pre` / `:post`
  if (w.code === 'PLUGIN_WARNING' && w.plugin?.startsWith(UNPLUGIN_NAME)) {
    throw new Error(`${ w.plugin }: ${ w.message }`);
  }
  warn(w);
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

// How many bytes of core-js reached the chunk. The injection COUNT cannot answer it: the recorder
// matches specifier text, which survives even when rollup drops the module - `sideEffects: false` in
// the pinned core-js tree-shakes every polyfill away while the count still reads healthy. The chunk's
// own module table catches that for every method. The floor is an order of magnitude under the
// smallest payload here, so it separates "nothing arrived" from "a small one" without tracking either.
// The trailing separator is load-bearing: without it `core-js` matches inside `core-js-builder` and
// `core-js-compat`, and a build tool's bytes would count towards the payload.
const CORE_JS_MODULE = /[/\\](?:node_modules|packages)[/\\](?:core-js(?:-pure)?[/\\]|@core-js[/\\])/;
const MIN_CORE_JS_BYTES = 10_000;
export function assertPayload(chunk, label) {
  const bytes = Object.entries(chunk.modules)
    .filter(([id]) => CORE_JS_MODULE.test(id))
    .reduce((n, [, m]) => n + m.renderedLength, 0);
  if (bytes < MIN_CORE_JS_BYTES) throw new Error(`${ label }: only ${ bytes }b of core-js reached the bundle`);
}

// The ES5 UMD bundle, polyfilled by ONE of the two providers.
//
// Plugin ordering is not the array order: raw Rollup ignores plugin-level `enforce` and honours the
// hook-level `order` unplugin sets. `usage-*` is 'post', so unplugin sees Babel's helper output;
// `entry-global` is pinned to 'pre' and needs none. `babel-plugin` builds without unplugin at all,
// which is why they are the reference the phases diff against.
//
// `injected` is the SET, observed inside THIS build: a separate capture would describe a different
// configuration, and a build whose injection had gone no-op would still report a healthy one.
// What a cell is called, everywhere it is called anything: the gates inside the build, the runner's
// line, the artifact directory and the Karma page name the same cell and have to name it the same
// way. Built from the registry entry, never from the file system - `name` and `exercise` are separate
// fields there, so an exercise whose file name differs from its entry would otherwise be reported
// under two identities in one line.
export function cellLabel({ name, provider, method, phase }) {
  return `${ name }/${ provider }/${ method }${ phase ? `/${ phase }` : '' }`;
}

// `lib` is the registry entry rather than a path: the entry is the cell's identity, and a path alone
// leaves this function reconstructing a name from the file system
export async function runtimeBuild(lib, method, phase = 'post', provider = 'unplugin') {
  // entry-global never carries a phase; usage-* default to 'post' (unplugin after babel - see above),
  // but runtime.mjs passes an explicit phase to also build `pre` / `pre+post`. babel-plugin has no
  // phase for any method: it IS the Babel pass, so there is no before/after to choose between.
  //
  // Both corrections below are load-bearing, and the `entry-global` cell is the proof: its caller
  // passes the `undefined` that `phasesFor` gave it, which lands on the parameter DEFAULT and comes
  // back as 'post' - which unplugin rejects for that method (it accepts only `pre` there, as a no-op).
  // Whatever the pair does not support is dropped here rather than forwarded.
  const babel = provider === 'babel-plugin';
  const effPhase = babel ? undefined : phasesFor(method, provider).includes(phase) ? phase : undefined;
  return withEntry(lib.exercise, method, `rt-${ provider }-${ method }-${ effPhase ?? 'x' }`, async entry => {
    const sink = new Set();
    // recorded alongside the set so a snapshot drift can name the module the extra injection came
    // from, without a second build in a different configuration to go looking for it
    const origins = new Map();
    const build = await rollup({
      input: entry,
      // Exactly ONE provider per build. Both at once would inject the union and the cell would stop
      // describing either of them.
      //
      // Every library here resolves to ESM, which is what makes the injection safe: a provider adds an
      // ESM `import` to whatever module it detects a usage in, and `@rollup/plugin-commonjs` refuses
      // that inside a CommonJS module unless `transformMixedEsModules` is on. A library that arrives
      // as CJS would fail loudly on its first injected module, not quietly - that is the flag to
      // reach for then.
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
      const { output } = await build.generate(UMD_OUTPUT);
      const [chunk] = output;
      const label = cellLabel({ name: lib.name, provider, method, phase: effPhase });
      assertNoExternals(chunk, label);
      assertPayload(chunk, label);
      // the ES5 premise belongs to the build, not to whoever remembers to ask: the pre-flight realm
      // and the browser page are both modern, so nothing else here would notice a skipped down-compile
      assertES5(chunk.code, label);
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
          where.add(toPosix(relative(HERE, id)));
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

// What this suite says when something fails is in `diagnostics.mjs`, which has no dependencies: a
// runner that wants one line of it must not have to load rollup, Babel and esbuild first.
