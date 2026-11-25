import { mkdtemp, readFile, readdir, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { deepEqual, ok } from 'node:assert/strict';
import { parse } from '@babel/parser';
import { traverse } from '@babel/core';
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
  if (!/\b_ref\d*\b/u.test(code)) return;
  const ast = parse(code, { sourceType: 'unambiguous', allowReturnOutsideFunction: true });
  traverse(ast, {
    Program(path) {
      const undeclared = Object.keys(path.scope.globals).filter(name => /^_ref\d*$/u.test(name));
      if (undeclared.length) throw new Error(`${ label }: undeclared plugin temps ${ undeclared.join(', ') }`);
      path.stop();
    },
  });
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
// Run against the actual output tree so relative chunk URLs, including Farm's runtime, survive.
export async function verifySplitDynamic(dir, filename, type) {
  const entry = join(dir, filename);
  const files = (await readdir(dir, { recursive: true })).filter(name => /\.[cm]?js$/u.test(name));
  const chunks = [];
  for (const name of files) {
    const code = await readFile(join(dir, name), 'utf8');
    assertRefsDeclared(code, name);
    if (code.includes('core-js lazy chunk witness')) chunks.push(name);
  }
  ok(chunks.length === 1 && chunks[0] !== filename, `expected the lazy body in a separate chunk: ${ chunks }`);
  await writeFile(join(dir, 'package.json'), JSON.stringify({ type }));
  const probe = join(dir, 'verify-dynamic.mjs');
  for (const strip of [false, true]) {
    await writeFile(probe, `${ strip ? 'delete Promise.all;' : '' }
      const mod = await import(${ JSON.stringify(pathToFileURL(entry).href) });
      const { results } = mod.default ?? mod;
      export const r = [await results.lazy, results.control, typeof Promise.all];
      export const effects = [];`);
    deepEqual(await runInWorker(probe, { strip, stripGlobals: [], nativeAlias: false }), 'OK|[2,4,"function"]|[]');
  }
}

export async function verifyDynamic(code, label, ext = '.mjs') {
  await verifyResult(code, label, '[await results.lazy, results.control]', [2, 4], ext);
  return verifyResult(code, label, '[await results.lazy, results.control]', [2, 4], ext, true);
}
