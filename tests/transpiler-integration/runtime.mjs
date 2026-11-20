import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { deepEqual } from 'node:assert/strict';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

export async function withTmpDir(fn, prefix = 'transpiler-test-') {
  const dir = await mkdtemp(join(tmpdir(), prefix));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// every plugin-minted temp the output USES must also be declared: a pass that emits a memo
// without contributing its `var` produces a bundle that dies with `X is not defined` at
// runtime - and only on the code paths that reach it, which a value assertion can miss
function assertRefsDeclared(code, label) {
  const declared = new Set();
  for (const match of code.matchAll(/\bvar\s+(?<names>[^\n;]+);/g)) {
    for (const name of match.groups.names.split(',')) declared.add(name.trim().split(/\s/u, 1)[0]);
  }
  const undeclared = new Set();
  for (const match of code.matchAll(/\b(?<temp>_ref\d*)\b/g)) {
    if (!declared.has(match.groups.temp)) undeclared.add(match.groups.temp);
  }
  if (undeclared.size) throw new Error(`${ label }: undeclared plugin temps ${ [...undeclared].join(', ') }`);
}

// Every bundle owns its globals and module cache. Even a previous global cell must not
// supply a missing polyfill to the next cell; the worker exits before the directory is removed.
// Assert before serialization: JSON alone hides boxed primitives and custom toJSON methods.
async function verifyResult(code, label, expression, expected, ext, strip = false) {
  assertRefsDeclared(code, label);
  await withTmpDir(async dir => {
    const file = join(dir, `bundle${ ext }`);
    await writeFile(file, code);
    const probe = join(dir, 'probe.mjs');
    await writeFile(probe, `import { deepEqual } from 'node:assert/strict';
      import * as mod from ${ JSON.stringify(pathToFileURL(file).href) };
      const results = mod.results ?? mod.default?.results ?? mod.default ?? mod;
      export const r = ${ expression };
      deepEqual(r, ${ JSON.stringify(expected) });
      export const effects = [];`);
    deepEqual(await runInWorker(probe, { strip, stripGlobals: [], nativeAlias: false }),
      `OK|${ JSON.stringify(expected) }|[]`, `${ label }: fresh realm`);
  });
}

export function verifyInNode(code, label, ext = '.mjs') {
  return verifyResult(code, label, '[results.clamp, results.cooked]', [4, 'hello'], ext);
}

// The sibling adds Array#at between the two passes. Execute its result without the native method.
export async function verifyPhases(code, label, ext = '.mjs') {
  const expression = '[results.patched, results.control, mod.injected ?? results.injected]';
  const expected = ['patched', 4, 'sib'];
  await verifyResult(code, label, expression, expected, ext);
  return verifyResult(code, label, expression, expected, ext, true);
}

// The lazy body must run through the bundler's loader and own its polyfills without natives.
export async function verifyDynamic(code, label, ext = '.mjs') {
  await verifyResult(code, label, '[await results.lazy, results.control]', [2, 4], ext);
  return verifyResult(code, label, '[await results.lazy, results.control]', [2, 4], ext, true);
}
