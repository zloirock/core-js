// Transpiler-fuzz harness: run the same source through BOTH plugins (usage-pure), then compare
// only what actually matters - the injected import-set (strict) and runtime behaviour (native ==
// babel == unplugin). Body-shape (AST codegen vs text rewrite) is deliberately NOT compared: that
// divergence is architectural (the `output-unplugin.mjs` sidecars), not a bug.
import { transformAsync } from '@babel/core';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import tsStrip from '@babel/plugin-transform-typescript';
import decoratorsPlugin from '@babel/plugin-proposal-decorators';
import classPropsPlugin from '@babel/plugin-transform-class-properties';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createPlugin from '../../packages/core-js-unplugin/internals/plugin.js';

const TMP = join(dirname(fileURLToPath(import.meta.url)), 'tmp');
// `decorators-legacy` is harmless for non-decorator TS, so one parser config covers all TS snippets
const TS_PARSER = { plugins: ['typescript', 'decorators-legacy'] };
// strip TS to runnable JS; legacy decorators + class properties make decorated classes executable
const STRIP_PLUGINS = [[decoratorsPlugin, { legacy: true }], classPropsPlugin, tsStrip];

export async function transformBabel(src, options, ts = false) {
  const out = await transformAsync(src, {
    plugins: [[babelPlugin, options]],
    filename: ts ? 'input.ts' : 'input.mjs',
    sourceType: 'module',
    parserOpts: ts ? TS_PARSER : undefined,
    configFile: false,
    babelrc: false,
  });
  return out.code;
}

export function transformUnplugin(src, options, ts = false) {
  return createPlugin(options).transform(src, ts ? 'input.ts' : 'input.mjs')?.code ?? src;
}

// injected core-js import paths, normalized so @core-js/pure and core-js compare equal
const IMPORT_RE = /["'](?<path>@?core-js(?:\/pure)?\/[^"']+)["']/u;
export function importSet(code) {
  const set = new Set();
  for (const raw of code.split('\n')) {
    const line = raw.trim();
    if (!line.startsWith('import') && !line.includes('require(')) continue;
    const found = IMPORT_RE.exec(line);
    if (found) set.add(found.groups.path.replace('@core-js/pure', 'core-js'));
  }
  return set;
}

// stable serialization for runtime comparison: distinguishes undefined / non-finite / bigint /
// function so e.g. `undefined` and `null` never collide
export function serialize(value) {
  return JSON.stringify(value, (key, val) => {
    if (val === undefined) return '__undefined__';
    if (typeof val === 'function') return '__function__';
    if (typeof val === 'bigint') return `${ val }n`;
    if (typeof val === 'number' && !Number.isFinite(val)) return `__${ val }__`;
    return val;
  }) ?? '__undefined__';
}

// strip TS syntax so a TS plugin-output becomes runnable; only TS nodes are removed, the injected
// polyfill imports / rewrites are untouched
async function stripTypeScript(code) {
  const out = await transformAsync(code, { plugins: STRIP_PLUGINS, parserOpts: TS_PARSER, filename: 'x.ts', configFile: false, babelrc: false });
  return out.code;
}

let counter = 0;
// execute a module text and capture the observable (`export const r` + `export const effects`) or
// the thrown error name. fresh filename per write so dynamic import is not cached
async function evalModule(code, ts = false) {
  await mkdir(TMP, { recursive: true });
  const file = join(TMP, `m${ counter++ }.mjs`);
  await writeFile(file, ts ? await stripTypeScript(code) : code);
  try {
    const mod = await import(pathToFileURL(file).href);
    return { ok: true, r: mod.r, effects: mod.effects };
  } catch (error) {
    return { ok: false, errorName: error?.name ?? 'Error' };
  }
}

function runtimeKey(result) {
  return result.ok ? `OK|${ serialize(result.r) }|${ serialize(result.effects) }` : `ERR|${ result.errorName }`;
}

function setEqual(a, b) {
  return a.size === b.size && [...a].every(x => b.has(x));
}

// run both oracles on one snippet; returns the verdict + raw materials for reporting. a transform
// that THROWS (e.g. an unplugin composition invariant) is itself a bug - captured, not propagated
export async function checkSnippet(src, options, ts = false) {
  let babelOut;
  let unpluginOut;
  let babelError = null;
  let unpluginError = null;
  try {
    babelOut = await transformBabel(src, options, ts);
  } catch (error) {
    babelError = error?.message ?? String(error);
  }
  try {
    unpluginOut = transformUnplugin(src, options, ts);
  } catch (error) {
    unpluginError = error?.message ?? String(error);
  }
  if (babelError || unpluginError) return { transformCrash: true, babelError, unpluginError };

  const babelImports = importSet(babelOut);
  const unpluginImports = importSet(unpluginOut);

  const native = runtimeKey(await evalModule(src, ts));
  const babelRun = runtimeKey(await evalModule(babelOut, ts));
  const unpluginRun = runtimeKey(await evalModule(unpluginOut, ts));

  return {
    importMismatch: !setEqual(babelImports, unpluginImports),
    runtimeMismatch: !(native === babelRun && babelRun === unpluginRun),
    pluginRuntimeDiverge: babelRun !== unpluginRun,
    babelImports,
    unpluginImports,
    native,
    babelRun,
    unpluginRun,
  };
}
