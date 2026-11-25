import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { deepEqual } from 'node:assert/strict';
import { parseAsync, traverse } from '@babel/core';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

export async function withCleanup(work, cleanup) {
  let result;
  try {
    result = await work();
  } catch (error) {
    try {
      await cleanup();
    } catch (cleanupError) {
      const message = error instanceof Error ? error.message : String(error);
      const details = cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
      throw new AggregateError([error, cleanupError], `${ message } (cleanup also failed: ${ details })`, { cause: error });
    }
    throw error;
  }
  await cleanup();
  return result;
}

export async function withTmpDir(fn, prefix = 'transpiler-test-') {
  const dir = await mkdtemp(join(tmpdir(), prefix));
  return withCleanup(() => fn(dir), () => rm(dir, { recursive: true, force: true }));
}

// Catch unbound temporaries even in branches the runtime probe cannot reach.
async function assertRefsDeclared(code, label, sourceType) {
  if (!/\b_ref\d*\b/u.test(code)) return;
  const ast = await parseAsync(code, { babelrc: false, configFile: false, sourceType });
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
async function verifyResult(code, label, expression, expected, ext, { strip = false, chunks = [], beforeLoad = '' } = {}) {
  await assertRefsDeclared(code, label, ext === '.cjs' ? 'commonjs' : 'module');
  for (const chunk of chunks) await assertRefsDeclared(chunk.code, `${ label }/${ chunk.fileName }`, 'module');
  await withTmpDir(async dir => {
    const file = join(dir, `bundle${ ext ?? '.mjs' }`);
    await writeFile(file, code);
    for (const chunk of chunks) await writeFile(join(dir, chunk.fileName), chunk.code);
    const probe = join(dir, 'probe.mjs');
    await writeFile(probe, `import { deepEqual } from 'node:assert/strict';
      ${ beforeLoad }
      const mod = await import(${ JSON.stringify(pathToFileURL(file).href) });
      const results = mod.results ?? mod.default?.results ?? mod.default ?? mod;
      export const r = ${ expression };
      deepEqual(r, ${ JSON.stringify(expected) });
      export const effects = [];`);
    deepEqual(await runInWorker(probe, { strip, stripGlobals: [], nativeAlias: false }),
      `OK|${ JSON.stringify(expected) }|[]`, `${ label }: fresh realm`);
  });
}

export function verifyInNode(code, label, ext, method) {
  if (method === 'entry-global') {
    return verifyResult(code, label, '[results.clamp, results.cooked, typeof JSON.isRawJSON]', [4, 'hello', 'undefined'], ext, {
      beforeLoad: 'delete JSON.isRawJSON;',
    });
  }
  return verifyResult(code, label, '[results.clamp, results.cooked]', [4, 'hello'], ext);
}

// The sibling adds Array#at between the two passes. Execute its result without the native method.
export async function verifyPhases(code, label, ext = '.mjs') {
  const expression = '[results.patched, results.control, mod.injected ?? results.injected]';
  const expected = ['patched', 4, 'sib'];
  await verifyResult(code, label, expression, expected, ext);
  return verifyResult(code, label, expression, expected, ext, { strip: true });
}

// The lazy body must run through the bundler's loader and own its polyfills without natives.
export async function verifyDynamic(code, label, ext = '.mjs') {
  await verifyResult(code, label, '[await results.lazy, results.control]', [2, 4], ext);
  return verifyResult(code, label, '[await results.lazy, results.control]', [2, 4], ext, { strip: true });
}

export async function verifySplitDynamic({ code, chunks, dynamicImports }, label) {
  // Rollup can re-export the entry from a shared chunk which owns the import() itself.
  const targets = new Set([...dynamicImports, ...chunks.flatMap(chunk => chunk.dynamicImports)]);
  const lazyChunk = chunks.find(chunk => chunk.isDynamicEntry && targets.has(chunk.fileName));
  if (!lazyChunk) throw new Error(`${ label }: expected a separate dynamic chunk`);
  const expression = '[await results.lazy, results.control]';
  const expected = [2, 4];
  await verifyResult(code, label, expression, expected, '.mjs', { strip: true, chunks });
  // The entry must still load. Only awaiting its lazy export should see the missing module.
  const missing = '[await results.lazy.then(() => null, error => error.code), results.control]';
  await verifyResult(code, label, missing, ['ERR_MODULE_NOT_FOUND', 4], '.mjs', {
    strip: true, chunks: chunks.filter(chunk => chunk !== lazyChunk),
  });
}
