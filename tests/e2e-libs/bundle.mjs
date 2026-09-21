// One bundle: the chain that turns a library into a polyfilled ES5 one, and the gates it must pass.
import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import unplugin from '@core-js/unplugin';
import { rollup } from 'rollup';
import { assertES5 } from '../../scripts/assert-es5.mjs';
import { makeStrictWarn } from '../transpiler-integration/warning-policy.mjs';
import { makeBabelPlugin } from './babel.mjs';
import { pluginOpts } from './cells.mjs';
import { HERE, isCoreJsModule, toPosix } from './paths.mjs';
import { tsSources } from './ts-sources.mjs';
import { join, relative } from 'node:path';

// UMD so the pre-flight and a `<script>` load it alike; no sourcemap, since nothing here reads one
const UMD_OUTPUT = { format: 'umd', name: 'E2E', esModule: false, sourcemap: false };

// off a live instance: a literal is the copy whose drift is silent, and `strictWarn` would just stop
// matching. `pre+post` returns two plugins, hence the flatten.
const [probe] = [unplugin.rollup(pluginOpts({ method: 'usage-global', phase: 'post' }))].flat();
const [UNPLUGIN_NAME] = probe.name.split(':', 1);
const strictWarn = makeStrictWarn(UNPLUGIN_NAME);

// the id must be a path UNDER THIS DIRECTORY: `nodeResolve` answers a bare `rxjs` relative to the
// importer, and a `\0` id has no directory at all
const VIRTUAL_ENTRY = join(HERE, '__entry__.mjs');
function entryPlugin({ exercise, entryGlobal }) {
  const spec = JSON.stringify(exercise);
  const body = entryGlobal ? `import 'core-js';\nexport { run } from ${ spec };\n` : `export { run } from ${ spec };\n`;
  return {
    name: 'e2e-entry',
    resolveId: source => source === VIRTUAL_ENTRY ? VIRTUAL_ENTRY : null,
    load: id => id === VIRTUAL_ENTRY ? body : null,
  };
}

// NOT `importSet` next door: it folds `@core-js/pure` into `core-js`, the very thing a baseline records
const SPEC_RE = /(?:from|import|require\()\s*["'](?<spec>(?:core-js|@core-js\/pure)\/[^"']+)["']/g;

// The recorder reads TEXT, so it answers for a specifier only while it is still spelled the way a
// provider wrote it - and it reads at two points, because no single one sees every provider. The
// unordered pass stands in front of `commonjs()` in the chain: by the post bucket, commonjs has turned
// every `require` in a CommonJS module into an import of a resolved `\0` id this scan cannot read, and
// that is where the babel-plugin and unplugin's `pre` write. The `post` pass is for unplugin's own
// `post`, which runs in that same bucket, ahead of it and after commonjs. Ids go posix so baselines
// compare across platforms.
function recorder() {
  const specifiers = new Set();
  const origins = new Map();
  function scan(code, id) {
    for (const m of code.matchAll(SPEC_RE)) {
      const spec = m.groups.spec.replace(/\.m?js$/, '');
      specifiers.add(spec);
      let where = origins.get(spec);
      if (!where) origins.set(spec, where = new Set());
      where.add(toPosix(relative(HERE, id)));
    }
    return null;
  }
  return {
    result: () => ({ injected: [...specifiers].sort(), origins }),
    plugins: [
      { name: 'injection-recorder', transform: scan },
      { name: 'injection-recorder-post', transform: { order: 'post', handler: scan } },
    ],
  };
}

// an injection rollup cannot resolve becomes an external `require`: the polyfill leaves the bundle and
// the pre-flight still passes, because node resolves what rollup would not
function noExternals({ chunk }, label) {
  if (chunk.imports.length) {
    throw new Error(`${ label }: bundle left ${ chunk.imports.length } import(s) external: ${ chunk.imports.join(', ') }`);
  }
}

// the ES5 premise belongs to the build: the pre-flight realm and every browser but IE11 are modern
function es5({ code }, label) {
  assertES5(code, label);
}

// the COUNT cannot answer this: specifier TEXT outlives `sideEffects: false` tree-shaking the polyfills
const MIN_CORE_JS_BYTES = 10_000;
function payload({ chunk }, label) {
  const bytes = Object.entries(chunk.modules)
    .filter(([id]) => isCoreJsModule(id))
    .reduce((n, [, m]) => n + m.renderedLength, 0);
  if (bytes < MIN_CORE_JS_BYTES) throw new Error(`${ label }: only ${ bytes }b of core-js reached the bundle`);
}

// a build that injected nothing has verified nothing
function injected({ injected: specifiers }, label) {
  if (!specifiers.length) throw new Error(`${ label }: the provider injected 0 polyfills`);
}

const GATES = [noExternals, es5, payload, injected];

// ONE provider per bundle: both would inject the union and the cell would describe neither. A graph may
// hold CommonJS - echarts' does, through the packages its exercise reads the SVG with - and a provider
// writes a `require` into such a module rather than an import, which `commonjs()` then converts with the
// module's own; unplugin's `post` writes an import into the module it has already converted.
export async function buildCell(cell) {
  const record = recorder();
  // `nodeResolve` LAST: asked first it answers a bare `htmlparser2` with the published JS; the
  // recorder's unordered pass in front of `commonjs()`, which rewrites what it has to read
  const bundle = await rollup({
    input: VIRTUAL_ENTRY,
    plugins: [
      entryPlugin({ exercise: cell.lib.exercise, entryGlobal: cell.method === 'entry-global' }),
      tsSources(),
      makeBabelPlugin(cell.isReference ? pluginOpts(cell) : null),
      ...cell.isReference ? [] : [unplugin.rollup(pluginOpts(cell))],
      ...record.plugins,
      nodeResolve(),
      commonjs(),
    ],
    onwarn: strictWarn,
  });
  try {
    const [chunk] = (await bundle.generate(UMD_OUTPUT)).output;
    const result = { code: chunk.code, chunk, ...record.result() };
    for (const check of GATES) check(result, cell.label);
    return result;
  } finally {
    await bundle.close();
  }
}
