import { mkdir, mkdtemp, realpath, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import { deepEqual } from 'node:assert/strict';
import { parseAsync, traverse } from '@babel/core';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';

const LAZY_VALUE = 'core-js dynamic fixture';

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
  try {
    return await fn(dir);
  } finally {
    try {
      await rm(dir, { recursive: true, force: true });
    } catch (error) {
      console.warn(`could not remove ${ dir }: ${ error.message }`);
    }
  }
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
// Compare before serialization: JSON alone hides boxed primitives and custom toJSON methods.
// Use a fixed assertion message because Node's value diff can need stripped built-ins.
async function withBundle(code, label, ext, chunks, run) {
  await assertRefsDeclared(code, label, ext === '.cjs' ? 'commonjs' : 'module');
  for (const chunk of chunks) await assertRefsDeclared(chunk.code, `${ label }/${ chunk.fileName }`, ext === '.cjs' ? 'commonjs' : 'module');
  return withTmpDir(async temp => {
    // Node reports resolved module paths in stack frames, including under a symlinked TMPDIR.
    const dir = await realpath(temp);
    const file = join(dir, `bundle${ ext ?? '.mjs' }`);
    // Farm emits CommonJS chunks with .js extensions. Give them their own package scope.
    if (ext === '.cjs' && chunks.length) await writeFile(join(dir, 'package.json'), '{"type":"commonjs"}');
    await writeFile(file, code);
    for (const chunk of chunks) {
      const target = join(dir, chunk.fileName);
      await mkdir(dirname(target), { recursive: true });
      await writeFile(target, chunk.code);
    }
    const probe = join(dir, 'probe.mjs');
    return run(file, probe, dir);
  });
}

async function verifyResult(code, label, expression, expected, ext, { strip = false, chunks = [], beforeLoad = '' } = {}) {
  await withBundle(code, label, ext, chunks, async (file, probe) => {
    await writeFile(probe, `import { AssertionError } from 'node:assert/strict';
      import { isDeepStrictEqual } from 'node:util';
      ${ beforeLoad }
      const mod = await import(${ JSON.stringify(pathToFileURL(file).href) });
      const results = mod.results ?? mod.default?.results ?? mod.default ?? mod;
      export const r = ${ expression };
      if (!isDeepStrictEqual(r, ${ JSON.stringify(expected) })) {
        throw new AssertionError({ message: 'Unexpected bundle result' });
      }
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
  const expression = '[await results.lazy, results.control]';
  const expected = [LAZY_VALUE, 4];
  await verifyResult(code, label, expression, expected, ext);
  return verifyResult(code, label, expression, expected, ext, { strip: true });
}

async function findLazyChunk(code, label, ext, chunks) {
  const tracker = new URL('./lazy-chunk-probe.mjs', import.meta.url).href;
  const key = await withBundle(code, label, ext, chunks, async (file, probe, dir) => {
    const files = chunks.map(chunk => join(dir, chunk.fileName));
    await writeFile(probe, `import { trackLazyResult } from ${ JSON.stringify(tracker) };
      const tokens = trackLazyResult(${ JSON.stringify(files) }, ${ JSON.stringify(LAZY_VALUE) });
      const mod = await import(${ JSON.stringify(pathToFileURL(file).href) });
      const results = mod.results ?? mod.default?.results ?? mod.default ?? mod;
      export const r = tokens.indexOf(await results.lazy);
      export const effects = [];`);
    return runInWorker(probe, { strip: false, stripGlobals: [], nativeAlias: false });
  });
  if (key === 'OK|-1|[]') throw new Error(`${ label }: expected a separate dynamic chunk to compute the lazy value`);
  const chunk = chunks.find((_, index) => key === `OK|${ index }|[]`);
  if (!chunk) throw new Error(`${ label }: lazy chunk probe failed (${ key })`);
  return chunk;
}

export async function verifySplitDynamic({ code, ext = '.mjs', chunks, dynamicImports }, label, { lazyError } = {}) {
  // Rollup can re-export the entry from a shared chunk which owns the import() itself.
  const targets = dynamicImports && new Set([...dynamicImports, ...chunks.flatMap(chunk => chunk.dynamicImports)]);
  const lazyChunk = await findLazyChunk(code, label, ext, chunks);
  if (targets && (!lazyChunk.isDynamicEntry || !targets.has(lazyChunk.fileName))) {
    throw new Error(`${ label }: ${ lazyChunk.fileName } must be a dynamic entry targeted by import()`);
  }
  const expression = targets ? '[await results.lazy, results.control]' : '[await results.lazy, results.control, typeof Promise.all]';
  const expected = targets ? [LAZY_VALUE, 4] : [LAZY_VALUE, 4, 'function'];
  const beforeLoad = targets ? '' : 'delete Promise.all;';
  await verifyResult(code, `${ label }/native`, expression, expected, ext, { chunks });
  if (lazyError) {
    const rejection = '[await results.lazy.then(() => null, error => error?.name), results.control]';
    await verifyResult(code, `${ label }/lazy rejection`, rejection, [lazyError, 4], ext, { strip: true, chunks, beforeLoad });
  } else {
    await verifyResult(code, `${ label }/stripped`, expression, expected, ext, { strip: true, chunks, beforeLoad });
  }
  // The entry must still load. Only awaiting its lazy export should see the missing module.
  const missing = `[await results.lazy.then(() => null, error => ${ targets ? 'error.code' : 'true' }), results.control]`;
  await verifyResult(code, `${ label }/missing lazy chunk`, missing, [targets ? 'ERR_MODULE_NOT_FOUND' : true, 4], ext, {
    strip: true, beforeLoad, chunks: chunks.filter(chunk => chunk !== lazyChunk),
  });
}
