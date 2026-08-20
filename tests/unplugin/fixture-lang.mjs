// fixture-language resolution shared by the unplugin fixture runner and the AST-engine
// roundtrip gate: the babel-shaped options sidecar decides the oxc parse dialect
import { access, readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function loadBabelOptions(directory) {
  for (const file of ['options.json', 'options.mjs']) {
    const full = join(directory, file);
    if (!await exists(full)) continue;
    // fs-extra's readJson (the lifted original) strips a BOM before parsing; JSON.parse throws on it
    if (file.endsWith('.json')) return JSON.parse((await readFile(full, 'utf8')).replace(/^\uFEFF/, ''));
    return (await import(pathToFileURL(resolve(full)).href)).default;
  }
  return null;
}

// oxc-parser auto-enables JSX/TS based on file extension. `.ts` covers the typescript
// plugin (default fallback), `.jsx` for JSX-only without TS, `.tsx` when both. matrix
// of the 4 filds: (jsx, ts) → '.tsx'; (jsx, !ts) → '.jsx'; (!jsx, ts) → '.ts';
// (!jsx, !ts) → '.ts' (default — typescript-friendly is the safe default)
export function inferTestId(babelOptions) {
  if (babelOptions.filename) return babelOptions.filename;
  const parserPlugins = babelOptions.parserOpts?.plugins ?? [];
  const hasJsx = parserPlugins.includes('jsx');
  const hasTs = parserPlugins.includes('typescript');
  if (hasJsx) return hasTs ? 'input.tsx' : 'input.jsx';
  return 'input.ts';
}

// the @core-js plugin's own options out of the babel-shaped fixture options; `targets`
// falls through from the top level and a babel-loader caller pins the webpack bundler
export function extractPluginOptions(babelOptions) {
  for (const plugin of babelOptions.plugins ?? []) {
    if (Array.isArray(plugin) && plugin[0] === '@core-js') {
      const options = { ...plugin[1] };
      if (!options.targets && babelOptions.targets) options.targets = babelOptions.targets;
      if (babelOptions.caller?.name === 'babel-loader') options.bundler = 'webpack';
      return options;
    }
  }
  return null;
}

const SKIP_DIRS = new Set([
  'source-script',
  'cjs-transform-export',
  // babel-only: regression depends on `transform-destructuring` rewriting the param's
  // ObjectPattern to `_ref` Identifier between core-js's pre-traversal and programExit
  // emission. unplugin extracts only `@core-js` from `babelOptions.plugins` and runs it
  // standalone, so the AST shape that triggered the bug never appears here
  'audit-synth-swap-survives-transform-destructuring',
  // babel-only: late-CJS detection diagnostic depends on a sibling babel plugin
  // (`@babel/plugin-transform-modules-commonjs`) running after our programExit. unplugin
  // doesn't have a babel plugin chain - it parses with oxc and runs core-js standalone,
  // so the markersGone trigger never fires here. SKIP_DIRS matches by basename so the
  // single entry covers both usage-pure and usage-global copies of the fixture
  'audit-late-cjs-rewriter-warning',
  // babel-only: depends on `transform-object-rest-spread` inlining `Object.assign` for the spread
  // under setSpreadProperties, which our post-pass then polyfills. unplugin runs core-js standalone
  // (no babel plugin chain), so the spread is never lowered to an Object.assign here
  'audit-object-spread-introduced-assign-polyfills',
]);

// flow language fixtures: oxc-parser doesn't support Flow syntax, so unplugin can't run
// them. detection routes through the explicit `flow` parser plugin in options.json -
// earlier name-based heuristic (`dirName.includes('-flow-')`) over-skipped unrelated
// audit fixtures whose names merely mention `flow` (e.g. `*-control-flow-bail`,
// `*-flow-multi-hop`, `*-flow-segments`), all of which actually parse as TS or vanilla JS
export function shouldSkip(dirName, babelOptions) {
  if (SKIP_DIRS.has(dirName)) return true;
  const plugins = babelOptions?.parserOpts?.plugins ?? [];
  return plugins.some(p => (typeof p === 'string' ? p : p?.[0]) === 'flow');
}

// machine paths as the baselines store them. TWO DISTINCT escaping domains, confused twice
// already - once each way: `slashifyPath` walks a FILESYSTEM string, where a Windows
// separator is ONE backslash; the code-side matcher below targets the ESCAPED separator
// spelling inside emitted string literals, which is TWO - and touching single backslashes
// in code would mangle every regex and String.raw escape
export function slashifyPath(machinePath) {
  return machinePath.replaceAll('\\', '/');
}
const ROOT = slashifyPath(resolve(import.meta.dirname, '../..'));
export function normalizeMachinePaths(code) {
  return code.replaceAll('\\\\', '/').replaceAll(ROOT, '<CWD>');
}
