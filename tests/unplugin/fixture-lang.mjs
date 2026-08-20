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
