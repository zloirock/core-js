import { createUnplugin } from 'unplugin';
import createPlugin from './internals/plugin.js';

// match JS/TS extensions; strip bundler query/hash suffix (Vite: foo.js?import,
// Vue SFC: foo.ts?v=abc#bar - can have both tokens). exclude .d.ts declaration files.
// Flow (.flow) is not included - oxc-parser cannot parse Flow syntax
const JS_RE = /\.[cm]?[jt]sx?(?:$|[#?])/;
const DTS_RE = /\.d\.[cm]?tsx?(?:$|[#?])/;

// `\0` marks virtual modules (some bundlers embed it mid-id in the query component, not
// just as a prefix); `?commonjs-` is Rollup commonjs-plugin proxies whose bodies aren't
// user source
function shouldTransform(id) {
  if (id.includes('\0') || id.includes('?commonjs-')) return false;
  return JS_RE.test(id) && !DTS_RE.test(id);
}

const VALID_PHASES = ['pre', 'post', 'pre+post'];

// `phase` controls when the plugin runs. See index.d.ts for the full trade-off matrix.
// `entry-global` is pinned to pre so `import 'core-js'` is seen before siblings transform it.
const unplugin = createUnplugin((options, meta) => {
  const { phase, ...rest } = options;
  const isEntryGlobal = rest.method === 'entry-global';

  // treat explicit `null` like `undefined` so `{ phase: cond ? 'post' : null }` falls back
  if (isEntryGlobal && phase !== undefined && phase !== null) {
    throw new TypeError('[core-js-unplugin] `phase` option is not supported for `entry-global` - it always runs at pre');
  }

  const effective = isEntryGlobal ? 'pre' : phase ?? 'pre';
  if (!VALID_PHASES.includes(effective)) {
    // show the string value quoted, otherwise show its type - avoids JSON.stringify
    // blowing up on BigInt, circular objects, Symbol, etc.
    const got = typeof phase === 'string' ? `'${ phase }'` : typeof phase;
    throw new TypeError(`[core-js-unplugin] invalid \`phase\` option: ${ got } - expected 'pre', 'post', or 'pre+post'`);
  }

  const plugin = createPlugin({ ...rest, bundler: meta?.framework });
  const stage = (enforce, pass) => ({
    name: `${ plugin.name }:${ enforce }`,
    enforce,
    transformInclude: shouldTransform,
    transform(code, id) { return plugin.transform(code, id, pass); },
  });

  // clear pre-pass snapshots at build end so long-running dev servers (Vite watch,
  // HMR rebuilds) don't accumulate entries when a post pass is skipped for some id.
  // attach to the last sub-plugin - unplugin invokes buildEnd once per plugin.
  const subs = effective === 'pre+post'
    ? [stage('pre', 'pre'), stage('post', 'post')]
    : [stage(effective, 'single')];
  subs.at(-1).buildEnd = () => plugin.reset();
  return subs;
});

export default unplugin;
export const { vite } = unplugin;
export const { webpack } = unplugin;
export const { rollup } = unplugin;
export const { esbuild } = unplugin;
export const { rspack } = unplugin;
export const { rolldown } = unplugin;
export const { farm } = unplugin;
export const { bun } = unplugin;
