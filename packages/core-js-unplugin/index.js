import { createUnplugin } from 'unplugin';
import createPlugin from './internals/plugin.js';
import { moduleIdLanguage, stripQueryHash } from '@core-js/polyfill-provider/helpers/path-normalize';
import { brand } from '@core-js/polyfill-provider/helpers/error-tag';
import { esbuildSetup, webpackModuleType } from './internals/host-loading.js';
import {
  isHtmlProxyScript,
  isSfcScriptBlock,
  isSfcSourceFile,
  isViteAssetQuery,
  parseModuleId,
} from './internals/sfc-shapes.js';

// `enforce` says where this sub-plugin sits against the framework plugins that COMPILE an SFC: at
// `pre` such an id still holds the author's markup, at `post` the JavaScript they turned it into.
// It is the only phase-dependent input here; every other rule is a language fact of the id.
export function shouldTransform(id, enforce = 'pre') {
  // `\0` marks virtual modules; `?commonjs-*` / `?commonjsExternal` are Rollup commonjs-plugin proxy /
  // external bodies. these are raw-id guards (the commonjs markers are anchored to the first `?` and
  // `\0` can sit mid-id), kept verbatim rather than folded into the structured query parse
  if (id.includes('\0') || id.includes('?commonjs-') || id.includes('?commonjsExternal')) return false;
  const compiled = enforce === 'post';
  const parsed = parseModuleId(id);
  const { path, params } = parsed;
  // Vite asset imports: resolved body isn't user JS even if the path looks like one
  if (isViteAssetQuery(params)) return false;
  // a real JS/TS source file by extension, `.d.ts` declarations excluded - the language canon
  // answers both, case-insensitively, and is the same answer the parser's dialect is read from
  if (moduleIdLanguage(path)) return true;
  if (isHtmlProxyScript(params)) return true;
  // a framework SOURCE file's bare id, once its own plugin has compiled it into a module
  if (compiled && isSfcSourceFile(parsed)) return true;
  return isSfcScriptBlock(params, { compiled });
}

const VALID_PHASES = new Set(['pre', 'post', 'pre+post']);

// Bun and esbuild have no interleaving slot around a sibling component compiler.
// Their pre+post request therefore becomes one pass, with a warning; even at post,
// raw component ids remain excluded. Ordered hosts keep separate pre/post hooks.
const PRE_POST_UNSAFE_BUNDLERS = new Set(['bun', 'esbuild']);

// `phase` controls when the plugin runs. See index.d.ts for the full trade-off matrix.
// `entry-global` is pinned to pre so `import 'core-js'` is seen before siblings transform it.
const unplugin = createUnplugin((options, meta) => {
  const { phase, ...rest } = options ?? {};
  const isEntryGlobal = rest.method === 'entry-global';

  // treat explicit `null` like `undefined` so `{ phase: cond ? 'post' : null }` falls back.
  // explicit `'pre'` is also accepted as a no-op (matches the d.ts contract: `phase?: 'pre'`)
  if (isEntryGlobal && phase !== undefined && phase !== null && phase !== 'pre') {
    throw new TypeError(brand('`phase` option is not supported for `entry-global` - it always runs at pre'));
  }

  const effective = isEntryGlobal ? 'pre' : phase ?? 'pre';
  if (!VALID_PHASES.has(effective)) {
    // show the string value quoted, otherwise show its type - avoids JSON.stringify
    // blowing up on BigInt, circular objects, Symbol, etc.
    const got = typeof phase === 'string' ? `'${ phase }'` : typeof phase;
    throw new TypeError(brand(`invalid \`phase\` option: ${ got } - expected 'pre', 'post', or 'pre+post'`));
  }

  // A phase label cannot turn esbuild/Bun's raw onLoad input into compiled code.
  // Keep the single-pass fallback observable without broadening its admission.
  const bundler = meta?.framework;
  const fallbackToPost = effective === 'pre+post' && PRE_POST_UNSAFE_BUNDLERS.has(bundler);
  if (fallbackToPost) {
    // eslint-disable-next-line no-console -- one-time bundler-specific cadence warning
    console.warn(brand(`\`phase: 'pre+post'\` is not reliably honored on \`${ bundler }\` (upstream sibling-ordering gap); falling back to single-mode 'post'`));
  }
  const resolvedPhase = fallbackToPost ? 'post' : effective;
  const plugin = createPlugin({ ...rest, bundler });
  let viteCacheRoot;

  function stage(enforce, pass, compiledOnly = false) {
    const admissionPhase = PRE_POST_UNSAFE_BUNDLERS.has(bundler) ? 'pre' : enforce;
    function include(id) {
      return (!viteCacheRoot || !stripQueryHash(id).replaceAll('\\', '/').startsWith(viteCacheRoot))
        && shouldTransform(id, admissionPhase) && (!compiledOnly || !shouldTransform(id, 'pre'));
    }
    // forward bundler's `this` (carrying `.warn`) into plugin.transform so internal
    // diagnostics (parse failures, ImportInjector fallbacks) actually surface; without
    // `.call(this, ...)` the inner `this?.warn` is undefined and warnings drop silently
    function transform(code, id, hookOptions) {
      // Vite runs ONE plugin instance across several environments (client / ssr / custom): the same
      // id, the same object, independent pipelines - so the pre-to-post snapshot must be partitioned
      // by them or one environment's state lands in another's output. Vite 6+ names the environment
      // on the hook context and covers the custom ones; older Vite only flags `options.ssr`. every
      // other host runs a single pipeline (webpack's loader passes no third argument at all) and
      // shares the default bucket
      const environment = this?.environment?.name ?? (hookOptions?.ssr ? 'ssr' : '');
      const moduleType = bundler === 'webpack' || bundler === 'rspack' || bundler === 'rsbuild'
        ? webpackModuleType(this) : undefined;
      if (moduleType === null) return null;
      return plugin.transform.call(this, code, id, pass, environment, { moduleType, loader: hookOptions?.loader });
    }
    return {
      name: `${ plugin.name }:${ enforce }`,
      enforce,
      transformInclude: include,
      // Optimized dependency chunks can contain core-js itself. Their generated paths no
      // longer carry package ownership, and Vite owns their already-bundled dependency graph.
      vite: { configResolved(config) { viteCacheRoot = `${ config.cacheDir.replaceAll('\\', '/').replace(/\/$/, '') }/`; } },
      // rollup / rolldown ignore the vite-style top-level `enforce` (upstream maps it for
      // webpack-family rules, farm priorities and vite's plugin sorting, but its rollup
      // conversion leaves the field foreign) - without ordering, `pre+post` degenerates to two
      // adjacent passes that never straddle sibling plugins. express the ordering there with
      // the per-hook object form (`transform: { order, handler }`), which rollup >= 3 /
      // rolldown honor natively and upstream's hook normalization passes through
      ...bundler === 'esbuild' ? { esbuild: { setup: esbuildSetup(include, transform) } } : {
        transform: bundler === 'rollup' || bundler === 'rolldown'
          ? { order: enforce, handler: transform }
          : transform,
      },
    };
  }

  // bound snapshot retention in long-running dev servers. attach to the last sub-plugin -
  // unplugin invokes buildEnd / watchChange once per plugin instance:
  //   `buildEnd`     - clear all pre-pass snapshots when the build ends (Vite watch,
  //                    HMR rebuilds, programmatic stop). prevents unbounded accumulation
  //                    when a post pass was skipped for some id (tree-shake, sibling bail)
  //   `watchChange`  - per-file invalidation when a file is edited/added/removed during
  //                    dev. drops only the changed file's snapshot so other files' state
  //                    survives. without this, HMR sessions accumulated orphan snapshots
  // standalone `phase: 'post'` MUST dispatch `pass='post'` (not `'single'`) so the post-only
  // machinery activates: orphan-ref and rest-sentinel adoption of a prior pass's spellings.
  // standalone `phase: 'pre'` stays at `pass='single'` - 'pre' would enable `deferImports`
  // expecting a follow-up post pass that never comes
  const subs = resolvedPhase === 'pre+post'
    ? [stage('pre', 'pre'), stage('post', 'post')]
    : [stage(resolvedPhase, resolvedPhase === 'post' ? 'post' : 'single')];
  // Components reach pre as markup. Give only those ids a post slot after their compiler;
  // ordinary JS keeps its single pass and entry imports are still caught before siblings.
  if (resolvedPhase === 'pre' && !PRE_POST_UNSAFE_BUNDLERS.has(bundler)) subs.push(stage('post', 'single', true));
  Object.assign(subs.at(-1), {
    buildEnd() { plugin.reset(); },
    watchChange(id) { plugin.invalidateSnapshot(id); },
  });
  return subs;
});

export default unplugin;
export const { vite } = unplugin;
export const { webpack } = unplugin;
export const { rollup } = unplugin;
export const { esbuild } = unplugin;
export const { rspack } = unplugin;
export const { rsbuild } = unplugin;
export const { rolldown } = unplugin;
export const { farm } = unplugin;
export const { bun } = unplugin;
