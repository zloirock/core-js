import { createUnplugin } from 'unplugin';
import { stripQueryHash } from '@core-js/polyfill-provider/helpers';
import createPlugin from './internals/plugin.js';

// match JS/TS extensions anchored at end-of-path; `.d.ts` declaration files excluded.
// Flow (.flow) is not listed - oxc-parser cannot parse Flow syntax
const JS_RE = /\.[cm]?[jt]sx?$/;
const DTS_RE = /\.d\.[cm]?tsx?$/;
// Vue / Svelte / Astro SFC sub-blocks travel as `App.vue?vue&type=script&lang=ts` /
// `App.svelte?ts` / `App.astro?raw`. pattern accepts the same extension alphabet as JS_RE;
// declaration-block `lang=d.ts` wouldn't match this pattern anyway (the `[cm]?[jt]sx?`
// alternation demands a `[jt]` char, which `d.ts` doesn't have)
const SFC_LANG_RE = /[&?]lang=[cm]?[jt]sx?(?:&|$)/;
// SFC sub-block missing `lang=`: Svelte 5 / Vue / Astro default `<script>` to JS
const SFC_DEFAULT_JS_RE = /[&?](?:astro|svelte|vue)&type=(?:module|script)(?:&|$)/;

// Vite asset-import queries: `?url`, `?raw`, `?worker`, `?worklet`, `?inline` transform
// the module into a URL / string / instantiated Worker etc; the resolved body isn't
// user-authored JS (even though the path has a JS extension). skip to avoid injecting
// polyfills into the Vite asset plugin's own synthetic output
const VITE_ASSET_QUERY_RE = /[&?](?:inline|raw|url|worker|worklet)(?:=|$|&)/;

// `\0` marks virtual modules (some bundlers embed it mid-id in the query component, not
// just as a prefix); `?commonjs-` is Rollup commonjs-plugin proxies whose bodies aren't
// user source
export function shouldTransform(id) {
  // `\0` marks virtual modules (rollup / vite); `?commonjs-*` / `?commonjsExternal`
  // cover Rollup commonjs-plugin proxy/external bodies
  if (id.includes('\0') || id.includes('?commonjs-') || id.includes('?commonjsExternal')) return false;
  if (VITE_ASSET_QUERY_RE.test(id)) return false;
  // strip query/hash up-front so `lang=d.ts` or `?output=main.js` don't fool the
  // `$`-anchored regex into treating the id as a JS/TS file. performing the strip
  // unconditionally is cheaper than adding a `.includes('?')` fast-path guard
  const base = stripQueryHash(id);
  if (JS_RE.test(base) && !DTS_RE.test(base)) return true;
  if (SFC_LANG_RE.test(id)) return true;
  // explicit non-JS `lang=` (e.g. `lang=d.ts`, `lang=scss`) blocks the default-JS fallback
  return !id.includes('lang=') && SFC_DEFAULT_JS_RE.test(id);
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
