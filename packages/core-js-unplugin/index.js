import { createUnplugin } from 'unplugin';
import { stripQueryHash } from '@core-js/polyfill-provider/helpers/path-normalize';
import createPlugin from './internals/plugin.js';

// match JS/TS extensions anchored at end-of-path; `.d.ts` declaration files excluded.
// Flow (.flow) is not listed - oxc-parser cannot parse Flow syntax.
// case-insensitive: Windows FS is typically case-insensitive and build tools may normalize
// extensions to upper-case (`.JS` / `.TSX`); lower-case-only match would skip those ids
const JS_RE = /\.[cm]?[jt]sx?$/i;
const DTS_RE = /\.d\.[cm]?tsx?$/i;
// Vue / Svelte / Astro SFC sub-blocks travel as `App.vue?vue&type=script&lang=ts` /
// `App.svelte?ts` / `App.astro?raw`. pattern accepts the same extension alphabet as JS_RE;
// declaration-block `lang=d.ts` wouldn't match this pattern anyway (the `[cm]?[jt]sx?`
// alternation demands a `[jt]` char, which `d.ts` doesn't have)
const SFC_LANG_RE = /[&?]lang=[cm]?[jt]sx?(?:&|$)/;
// SFC sub-block missing `lang=`: Svelte 5 / Vue / Astro default `<script>` to JS
const SFC_DEFAULT_JS_RE = /[&?](?:astro|svelte|vue)&type=(?:module|script)(?:&|$)/;
// non-JS SFC sub-blocks: `<style lang="ts">` / `<template lang="ts">` exist but their bodies
// are CSS / markup, not runnable JS. SFC_LANG_RE would accept them on extension match alone;
// this gate keeps polyfill injection off the style / template halves of the file
const SFC_NON_JS_TYPE_RE = /[&?]type=(?:style|template)(?:&|$)/;

// Vite asset-import queries: `?url`, `?raw`, `?worker`, `?worklet`, `?inline` transform
// the module into a URL / string / instantiated Worker etc; the resolved body isn't
// user-authored JS (even though the path has a JS extension). skip to avoid injecting
// polyfills into the Vite asset plugin's own synthetic output. the `worker` branch also
// accepts `?worker-module` / `?worker_file` sub-forms that Vite emits for ESM workers.
// also covers Vite internal proxy queries: `?html-proxy` (HTML inline scripts wrapped by
// Vite, already processed by Vite's own pipeline), `?css` (CSS-as-JS modules with no
// runtime polyfill surface), `?used` (Vite tree-shaking marker), `?direct` (Vite
// post-processing escape hatch), `?import` (Vite import-wrapping bypass)
const VITE_ASSET_QUERY_RE = /[&?](?:css|direct|html-proxy|import|inline|raw|url|used|worker(?:[-_][a-z]+)?|worklet)(?:=|$|&)/;

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
  if (SFC_LANG_RE.test(id) && !SFC_NON_JS_TYPE_RE.test(id)) return true;
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
    throw new TypeError('[core-js] `phase` option is not supported for `entry-global` - it always runs at pre');
  }

  const effective = isEntryGlobal ? 'pre' : phase ?? 'pre';
  if (!VALID_PHASES.includes(effective)) {
    // show the string value quoted, otherwise show its type - avoids JSON.stringify
    // blowing up on BigInt, circular objects, Symbol, etc.
    const got = typeof phase === 'string' ? `'${ phase }'` : typeof phase;
    throw new TypeError(`[core-js] invalid \`phase\` option: ${ got } - expected 'pre', 'post', or 'pre+post'`);
  }

  const plugin = createPlugin({ ...rest, bundler: meta?.framework });
  const stage = (enforce, pass) => ({
    name: `${ plugin.name }:${ enforce }`,
    enforce,
    transformInclude: shouldTransform,
    transform(code, id) { return plugin.transform(code, id, pass); },
  });

  // bound snapshot retention in long-running dev servers. attach to the last sub-plugin -
  // unplugin invokes buildEnd / watchChange once per plugin instance:
  //   `buildEnd`     - clear all pre-pass snapshots when the build ends (Vite watch,
  //                    HMR rebuilds, programmatic stop). prevents unbounded accumulation
  //                    when a post pass was skipped for some id (tree-shake, sibling bail)
  //   `watchChange`  - per-file invalidation when a file is edited/added/removed during
  //                    dev. drops only the changed file's snapshot so other files' state
  //                    survives. without this, HMR sessions accumulated orphan snapshots
  const subs = effective === 'pre+post'
    ? [stage('pre', 'pre'), stage('post', 'post')]
    : [stage(effective, 'single')];
  Object.assign(subs.at(-1), {
    buildEnd: () => plugin.reset(),
    watchChange: id => plugin.invalidateSnapshot(id),
  });
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
