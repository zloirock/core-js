import { fileURLToPath } from 'node:url';
import { access, mkdir, readFile, symlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { deepEqual, rejects, strictEqual } from 'node:assert/strict';
import { rollup } from '@core-js/unplugin';
import { pluginOpts } from './matrix.mjs';
import { makeBundlers } from './bundlers.mjs';
import { withCleanup, withTmpDir, verifyInNode, verifyPhases, verifyDynamic, verifySplitDynamic } from './runtime.mjs';

// An earlier global bundle must never supply natives to a later cell, even when
// the latter returns an awaited result or a CommonJS default export.
const install = 'Number.prototype.clamp = function () { return 4; }; String.cooked = function () { return "hello"; };';
const read = '{ clamp: (2).clamp(4, 6), cooked: String.cooked`hello` }';
const lazyValue = '"core-js dynamic fixture"';
const before = [Object.getOwnPropertyDescriptor(Number.prototype, 'clamp'), Object.getOwnPropertyDescriptor(String, 'cooked')];
let checks = 0;
for (const [ext, exportResults] of [
  ['.mjs', value => `export const results = ${ value };`],
  ['.cjs', value => `module.exports = { results: ${ value } };`],
  ['.mjs', value => `export default ${ value };`],
  ['.cjs', value => `module.exports = ${ value };`],
]) {
  await verifyInNode(install + exportResults(read), `installed/${ ext }`, ext);
  deepEqual([Object.getOwnPropertyDescriptor(Number.prototype, 'clamp'), Object.getOwnPropertyDescriptor(String, 'cooked')], before);
  checks += 2;
  for (const [verify, result] of [
    [verifyInNode, read],
    [verifyPhases, '{ patched: "patched", control: (2).clamp(4, 6), injected: "sib" }'],
    [verifyDynamic, '{ lazy: Promise.resolve().then(() => [1, 2].at(-1)), control: (2).clamp(4, 6) }'],
  ]) {
    await rejects(verify(exportResults(result), `missing/${ ext }`, ext), { actual: 'ERR|TypeError' });
    checks++;
  }
  await rejects(verifyInNode(`Number.prototype.clamp = function () { return 4; };${ exportResults(read) }`, 'missing cooked', ext), { actual: 'ERR|TypeError' });
  checks++;
  await verifyPhases(install + exportResults('{ patched: "patched", control: (2).clamp(4, 6), injected: "sib" }'), `phases/${ ext }`, ext);
  await verifyDynamic(exportResults(`{ lazy: Promise.resolve(${ lazyValue }), control: 4 }`), `dynamic/${ ext }`, ext);
  await rejects(verifyDynamic(exportResults('{ lazy: Promise.reject(new RangeError()), control: 4 }'), 'rejected lazy', ext), { actual: 'ERR|RangeError' });
  await rejects(verifyDynamic(exportResults(`{ lazy: Promise.resolve().then(() => [1, ${ lazyValue }].at(-1)), control: 4 }`),
    'missing lazy polyfill', ext), { actual: 'ERR|TypeError' });
  await rejects(verifyInNode(exportResults('{ clamp: 3, cooked: "hello" }'), 'wrong value', ext), { actual: 'ERR|AssertionError' });
  await rejects(verifyDynamic(exportResults(`{ lazy: Promise.resolve(Array.prototype.at ? ${ lazyValue } : "wrong"), control: 4 }`),
    'wrong stripped value', ext), { actual: 'ERR|AssertionError' });
  await rejects(verifyInNode('throw new SyntaxError();', 'bundle throw', ext), { actual: 'ERR|SyntaxError' });
  await rejects(verifyInNode(exportResults('{ clamp: _ref, cooked: "hello" }'), 'undeclared temp', ext), /undeclared plugin temps _ref/u);
  const deadRead = 'function f() { var _ref; } if (false) consume(_ref);';
  await rejects(verifyInNode(deadRead + exportResults('{ clamp: 4, cooked: "hello" }'), 'sibling scope', ext),
    /undeclared plugin temps _ref/u);
  await verifyInNode(`function f() { if (false) consume(_ref); var _ref; }${ exportResults('{ clamp: 4, cooked: "hello" }') }`,
    'hoisted local', ext);
  for (const receiver of ['["before", "sib"]', 'values']) {
    const results = exportResults(`{ patched: "patched", control: 4, injected: ${ receiver }.at(-1) }`);
    const raw = `const values = ["before", "sib"];${ results }`;
    await rejects(verifyPhases(raw, 'missed post', ext), { actual: 'ERR|TypeError' });
  }
  for (const [verify, result] of [
    [verifyInNode, '{ clamp: new Number(4), cooked: "hello" }'],
    [verifyInNode, '{ clamp: 4, cooked: new String("hello") }'],
    [verifyInNode, '{ clamp: { toJSON() { return 4; } }, cooked: "hello" }'],
    [verifyPhases, '{ patched: new String("patched"), control: 4, injected: "sib" }'],
    [verifyDynamic, `{ lazy: Promise.resolve(new String(${ lazyValue })), control: 4 }`],
  ]) {
    await rejects(verify(exportResults(result), 'boxed result', ext), { actual: 'ERR|AssertionError' });
    checks++;
  }
  checks += 12;
}
let temporary;
await rejects(withTmpDir(async dir => {
  temporary = dir;
  await access(dir);
  throw new RangeError('cleanup control');
}, "transpiler runtime's control-"), /cleanup control/u);
await rejects(access(temporary), { code: 'ENOENT' });
checks += 2;
const bundlers = makeBundlers({ root: import.meta.dirname, unpluginName: 'fixture' });
const warnings = [];
const { warn } = console;
try {
  console.warn = warning => warnings.push(warning);
  await rejects(bundlers.esbuild({ stdin: { contents: '' } }, [{
    name: 'fixture',
    setup(build) {
      build.onStart(() => ({ warnings: [{ text: 'build warning' }], errors: [{ text: 'build failure' }] }));
    },
  }]), /build failure/u);
} finally {
  console.warn = warn;
}
deepEqual(warnings, ['[esbuild] [fixture] build warning']);
checks += 2;
const controlBundlers = makeBundlers({ root: import.meta.dirname, unpluginName: 'entry-global-control' });
const uncontrolledEntry = await controlBundlers.esbuild(fileURLToPath(new URL('./input-entry-global.js', import.meta.url)));
await rejects(verifyInNode(uncontrolledEntry.code, 'entry without a provider', uncontrolledEntry.ext, 'entry-global'),
  { actual: 'ERR|AssertionError' });
checks++;
// Virtual module ids bypass the provider. Keep the real lazy source and transform the entry as usual.
const dynamicEntry = fileURLToPath(new URL('./input-dynamic.js', import.meta.url));
const lazyId = '\0lazy-chunk.js';
const unprocessedLazy = await controlBundlers.rollup(dynamicEntry, [{
  name: 'unprocessed-lazy-control',
  resolveId(source) {
    return source === './lazy-chunk.js' ? lazyId : null;
  },
  load(id) {
    if (id === lazyId) return readFile(new URL('./lazy-chunk.js', import.meta.url), 'utf8');
    return null;
  },
}, rollup(pluginOpts('usage-global', undefined, { targets: { ie: 11 } }))], { splitDynamic: true });
await verifySplitDynamic(unprocessedLazy, 'unprocessed lazy module', { lazyError: 'TypeError' });
checks++;
const eagerChunk = { fileName: 'eager.mjs', code: 'export const n = 2;', isDynamicEntry: false, dynamicImports: [] };
const eagerEntry = 'import { n } from "./eager.mjs"; export const results = { lazy: Promise.resolve(n), control: 4 };';
await rejects(verifySplitDynamic({ code: eagerEntry, chunks: [eagerChunk], dynamicImports: [] }, 'static import'),
  /: expected a separate dynamic chunk to compute the lazy value$/u);
const flatPolyfill = 'Array.prototype.flat ??= function () { return [].concat(...this); };';
const atPolyfill = 'Array.prototype.at ??= function (index) { return this[index < 0 ? this.length + index : index]; };';
const lazyComputation = `[1, [${ lazyValue }]].flat().at(-1)`;
const lazyChunk = {
  fileName: 'lazy.mjs',
  code: `export const value = typeof window === "object" ? _ref : ${ lazyComputation };`,
  isDynamicEntry: true,
  dynamicImports: [],
};
await rejects(verifySplitDynamic({
  code: 'export const results = { lazy: import("./lazy.mjs").then(mod => mod.value), control: 4 };',
  chunks: [lazyChunk], dynamicImports: [lazyChunk.fileName],
}, 'split'), /split\/lazy\.mjs: undeclared plugin temps _ref/u);
const splitCode = 'export const results = { lazy: import("./lazy.mjs").then(mod => mod.value), control: 4 };';
await rejects(verifySplitDynamic({
  code: splitCode,
  chunks: [{ ...lazyChunk, code: `function unused() { var _ref; } ${ lazyChunk.code }` }],
  dynamicImports: [lazyChunk.fileName],
}, 'split scope'), /split scope\/lazy\.mjs: undeclared plugin temps _ref/u);
const splitBinding = {
  code: atPolyfill + splitCode,
  chunks: [
    eagerChunk,
    { ...lazyChunk, code: `${ flatPolyfill }
      import { n as _ref } from "./eager.mjs";
      export const value = _ref === 2 ? { _ref3: ${ lazyComputation } }._ref3 : "";` },
  ],
  dynamicImports: [lazyChunk.fileName],
};
await verifySplitDynamic(splitBinding, 'split binding');
await rejects(verifySplitDynamic({ ...splitBinding, code: `throw new RangeError(); ${ splitBinding.code }` }, 'entry throws'),
  { message: 'entry throws: lazy chunk probe failed (ERR|RangeError)' });
await rejects(verifySplitDynamic({ ...splitBinding, chunks: [eagerChunk] }, 'missing import'),
  { message: 'missing import: lazy chunk probe failed (ERR|Error)' });
const [sharedChunk, bindingChunk] = splitBinding.chunks;
await verifySplitDynamic({
  ...splitBinding,
  chunks: [sharedChunk, {
    ...bindingChunk,
    code: `function unused() { return ${ lazyComputation }; }
      ${ bindingChunk.code.replace('.flat().at', '["flat"]()["at"]') }`,
  }],
}, 'live lazy computation after an unused duplicate');
await verifySplitDynamic({
  ...splitBinding,
  chunks: [sharedChunk, { ...bindingChunk, code: bindingChunk.code.replace('js dynamic', 'js\\x20dynamic') }],
}, 'escaped lazy operand');
await verifySplitDynamic({
  ...splitBinding,
  chunks: [sharedChunk, { ...bindingChunk, code: bindingChunk.code
    .replace('export const value', `const nested = [1, [${ lazyValue }]]; const flattened = nested.flat(); export const value`)
    .replace(lazyComputation, 'flattened.at(-1)') }],
}, 'local array bindings');
// A computed key and a dead copy in a different output file must not change which chunk is selected.
await verifySplitDynamic({
  ...splitBinding,
  chunks: [
    { ...sharedChunk, code: `${ sharedChunk.code } function unused() { return ${ lazyComputation }; }` },
    { ...bindingChunk, code: `const flatten = "flat"; ${ bindingChunk.code.replace('.flat()', '[flatten]()') }` },
  ],
}, 'computed method with duplicate in another file');
await rejects(verifySplitDynamic({
  code: splitCode,
  chunks: [{ ...lazyChunk, code: `const native = typeof Array.prototype.at === "function";
    ${ flatPolyfill }${ atPolyfill }
    const value = ${ lazyComputation };
    export { result as value };
    const result = native && value === ${ lazyValue } ? "wrong" : value;` }],
  dynamicImports: [lazyChunk.fileName],
}, 'unmodified native result'), { actual: 'ERR|AssertionError', message: /unmodified native result\/native/u });
await verifySplitDynamic({ ...splitBinding, code: `// ${ lazyValue }\n${ splitBinding.code }` }, 'entry comment with lazy value');
await rejects(verifySplitDynamic({
  ...splitBinding,
  chunks: [sharedChunk, { ...bindingChunk, isDynamicEntry: false }],
}, 'static metadata'), /lazy\.mjs must be a dynamic entry targeted by import/u);
await rejects(verifySplitDynamic({ ...splitBinding, dynamicImports: [] }, 'missing dynamic target'),
  /lazy\.mjs must be a dynamic entry targeted by import/u);
const misplacedValue = `const value = ${ lazyComputation };
  export const results = { lazy: import("./lazy.mjs").then(() => value), control: 4 };`;
await rejects(verifySplitDynamic({
  code: misplacedValue,
  chunks: [{ fileName: 'lazy.mjs', code: `export const marker = ${ lazyValue };` }],
}, 'lazy computation in the entry'), /: expected a separate dynamic chunk to compute the lazy value$/u);

// Both methods work in the stripped realm, but the entry supplied them and computed the result.
const entryComputesLazy = {
  code: `${ flatPolyfill }${ atPolyfill }
    export const results = { lazy: import("./lazy.mjs").then(mod => [1, [mod.marker]].flat().at(-1)), control: 4 };`,
  chunks: [{ ...lazyChunk, code: `export const marker = ${ lazyValue };` }],
  dynamicImports: [lazyChunk.fileName],
};
await rejects(verifySplitDynamic(entryComputesLazy, 'entry computes lazy value'), /: expected a separate dynamic chunk to compute the lazy value$/u);
await rejects(verifySplitDynamic({
  ...entryComputesLazy,
  code: `${ atPolyfill } export const results = { lazy: import("./lazy.mjs").then(mod => mod.items.at(-1)), control: 4 };`,
  chunks: [{ ...lazyChunk, code: `${ flatPolyfill } export const items = [1, [${ lazyValue }]].flat();` }],
}, 'only flat runs in lazy chunk'), /: expected a separate dynamic chunk to compute the lazy value$/u);
await rejects(verifySplitDynamic({
  ...entryComputesLazy,
  chunks: [{ ...lazyChunk, code: `${ entryComputesLazy.chunks[0].code } function unused() { return ${ lazyComputation }; }` }],
}, 'dead lazy computation'), /: expected a separate dynamic chunk to compute the lazy value$/u);

await rejects(verifySplitDynamic({
  code: splitCode,
  chunks: [{ ...lazyChunk, code: `export const value = Array.prototype.at ? ${ lazyComputation } : "wrong";` }],
  dynamicImports: [lazyChunk.fileName],
}, 'fulfilled lazy module', { lazyError: 'TypeError' }), /fulfilled lazy module\/lazy rejection: fresh realm/u);

await rejects(verifySplitDynamic({
  code: `if (!Array.prototype.at) throw new TypeError(); ${ splitCode }`,
  chunks: [{ ...lazyChunk, code: `export const value = ${ lazyComputation };` }],
  dynamicImports: [lazyChunk.fileName],
}, 'entry failure', { lazyError: 'TypeError' }), /entry failure\/lazy rejection: fresh realm/u);

await withTmpDir(async dir => {
  const physical = resolve(dir, 'physical');
  const alias = join(dir, 'alias');
  await mkdir(physical);
  await symlink(physical, alias, process.platform === 'win32' ? 'junction' : 'dir');
  await writeFile(join(physical, 'package.json'), '{"type":"module"}');
  const tempVariable = process.platform === 'win32' ? 'TEMP' : 'TMPDIR';
  const previous = process.env[tempVariable];
  try {
    process.env[tempVariable] = alias;
    await verifySplitDynamic(splitBinding, 'ES modules under a symlinked temp directory');
    await verifySplitDynamic({
      code: `Promise.all ??= () => {};
        module.exports = { results: { lazy: import("./lazy.js").then(mod => mod.default), control: 4 } };`,
      ext: '.cjs',
      chunks: [{ fileName: 'lazy.js', code: `${ flatPolyfill }${ atPolyfill } module.exports = ${ lazyComputation };` }],
    }, 'CommonJS chunks under a module package');
  } finally {
    if (previous === undefined) delete process.env[tempVariable];
    else process.env[tempVariable] = previous;
  }
});
checks += 22;
const primary = new Error('primary failure');
const cleanup = new Error('cleanup failure');
await rejects(withCleanup(() => { throw primary; }, () => {
  throw cleanup;
}), error => {
  strictEqual(error.cause, primary);
  deepEqual(error.errors, [primary, cleanup]);
  return true;
});
await rejects(withCleanup(() => 1, () => { throw cleanup; }), error => error === cleanup);
checks += 2;
console.log(`integration-runtime: ${ checks } passed, 0 failed`);
