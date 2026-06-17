import { createUnplugin } from 'unplugin';
import createPlugin from './internals/plugin.js';
import { isSfcScriptBlock, isViteAssetQuery, parseModuleId } from './internals/sfc-shapes.js';

// match JS/TS extensions anchored at end-of-path; `.d.ts` declaration files excluded.
// Flow (.flow) is not listed - oxc-parser cannot parse Flow syntax.
// case-insensitive: Windows FS is typically case-insensitive and build tools may normalize
// extensions to upper-case (`.JS` / `.TSX`); lower-case-only match would skip those ids
const JS_RE = /\.[cm]?[jt]sx?$/i;
const DTS_RE = /\.d\.[cm]?tsx?$/i;

export function shouldTransform(id) {
  // `\0` marks virtual modules; `?commonjs-*` / `?commonjsExternal` are Rollup commonjs-plugin proxy /
  // external bodies. these are raw-id guards (the commonjs markers are anchored to the first `?` and
  // `\0` can sit mid-id), kept verbatim rather than folded into the structured query parse
  if (id.includes('\0') || id.includes('?commonjs-') || id.includes('?commonjsExternal')) return false;
  const { path, params } = parseModuleId(id);
  // Vite asset imports: resolved body isn't user JS even if the path looks like one
  if (isViteAssetQuery(params)) return false;
  // a real JS/TS file by extension, excluding `.d.ts` declarations
  if (JS_RE.test(path) && !DTS_RE.test(path)) return true;
  // otherwise admit only a runnable SFC script / module sub-block
  return isSfcScriptBlock(params);
}

const VALID_PHASES = ['pre', 'post', 'pre+post'];

// bundlers where `phase: 'pre+post'` doesn't reliably enforce pre-then-post ordering against
// sibling plugins. upstream unplugin's `enforce` field is dropped silently on bun (no
// priority concept; bun processes Bun.plugin() registrations in declaration order without
// inter-plugin interleaving slots). esbuild emulates the `transform` hook through a first-wins
// `onLoad`, so two sibling plugin instances can't both run on one module - whichever esbuild
// calls first wins and the other pass is silently dropped, which breaks pre-then-post. on farm
// `enforce` IS honored via priority mapping (pre->102 / post->98), so sibling default-priority
// 100 lands BETWEEN our pre and post - that's the design intent for pre+post. fall back to
// single-mode 'post' only where the ordering truly breaks; user gets a one-time warn
const PRE_POST_UNSAFE_BUNDLERS = new Set(['bun', 'esbuild']);

// `phase` controls when the plugin runs. See index.d.ts for the full trade-off matrix.
// `entry-global` is pinned to pre so `import 'core-js'` is seen before siblings transform it.
const unplugin = createUnplugin((options, meta) => {
  const { phase, ...rest } = options;
  const isEntryGlobal = rest.method === 'entry-global';

  // treat explicit `null` like `undefined` so `{ phase: cond ? 'post' : null }` falls back.
  // explicit `'pre'` is also accepted as a no-op (matches the d.ts contract: `phase?: 'pre'`)
  if (isEntryGlobal && phase !== undefined && phase !== null && phase !== 'pre') {
    throw new TypeError('[core-js] `phase` option is not supported for `entry-global` - it always runs at pre');
  }

  const effective = isEntryGlobal ? 'pre' : phase ?? 'pre';
  if (!VALID_PHASES.includes(effective)) {
    // show the string value quoted, otherwise show its type - avoids JSON.stringify
    // blowing up on BigInt, circular objects, Symbol, etc.
    const got = typeof phase === 'string' ? `'${ phase }'` : typeof phase;
    throw new TypeError(`[core-js] invalid \`phase\` option: ${ got } - expected 'pre', 'post', or 'pre+post'`);
  }

  // bundler-specific phase fallback. on bun the upstream sibling-ordering machinery doesn't
  // honor `enforce` (no priority concept; Bun.plugin hosts process transformHooks in array
  // order without inter-plugin interleaving slots). configured `pre+post` would silently
  // produce single-host concatenation without sibling intervention - downgrade to single-mode
  // 'post' (safer: runs after all siblings, sees their helper output) and surface a one-time
  // warn so user can correlate the cadence shift. entry-global is pinned to 'pre' upstream
  // regardless of bundler - this fallback only affects the explicit `pre+post` opt-in
  const bundler = meta?.framework;
  const fallbackToPost = effective === 'pre+post' && PRE_POST_UNSAFE_BUNDLERS.has(bundler);
  if (fallbackToPost) {
    // eslint-disable-next-line no-console -- one-time bundler-specific cadence warning
    console.warn(`[core-js] \`phase: 'pre+post'\` is not reliably honored on \`${ bundler }\` (upstream sibling-ordering gap); falling back to single-mode 'post'`);
  }
  const resolvedPhase = fallbackToPost ? 'post' : effective;
  const plugin = createPlugin({ ...rest, bundler });

  function stage(enforce, pass) {
    return {
      name: `${ plugin.name }:${ enforce }`,
      enforce,
      transformInclude: shouldTransform,
      // forward bundler's `this` (carrying `.warn`) into plugin.transform so internal
      // diagnostics (parse failures, ImportInjector fallbacks) actually surface; without
      // `.call(this, ...)` the inner `this?.warn` is undefined and warnings drop silently
      transform(code, id) { return plugin.transform.call(this, code, id, pass); },
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
  // standalone `phase: 'post'` MUST dispatch `pass='post'` (not `'single'`) so plugin.js's
  // `enableReferenceTracking` + Identifier visitor for usage-pure activate. without this,
  // standalone post mode emits dead imports through `pruneUnusedRefs` filter being off
  // (see plugin.js: `trackReferences = pass === 'post'`). standalone `phase: 'pre'` stays
  // at `pass='single'` - 'pre' would enable `deferImports` expecting a follow-up post pass
  // that never comes
  const subs = resolvedPhase === 'pre+post'
    ? [stage('pre', 'pre'), stage('post', 'post')]
    : [stage(resolvedPhase, resolvedPhase === 'post' ? 'post' : 'single')];
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
export const { rolldown } = unplugin;
export const { farm } = unplugin;
export const { bun } = unplugin;
