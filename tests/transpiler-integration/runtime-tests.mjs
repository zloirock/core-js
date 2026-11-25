import { fileURLToPath } from 'node:url';
import { access } from 'node:fs/promises';
import { deepEqual, rejects, strictEqual } from 'node:assert/strict';
import { makeBundlers } from './bundlers.mjs';
import { withCleanup, withTmpDir, verifyInNode, verifyPhases, verifyDynamic, verifySplitDynamic } from './runtime.mjs';

// An earlier global bundle must never supply natives to a later cell, even when
// the latter returns an awaited result or a CommonJS default export.
const install = 'Number.prototype.clamp = function () { return 4; }; String.cooked = function () { return "hello"; };';
const read = '{ clamp: (2).clamp(4, 6), cooked: String.cooked`hello` }';
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
  await verifyDynamic(exportResults('{ lazy: Promise.resolve(2), control: 4 }'), `dynamic/${ ext }`, ext);
  await rejects(verifyDynamic(exportResults('{ lazy: Promise.reject(new RangeError()), control: 4 }'), 'rejected lazy', ext), { actual: 'ERR|RangeError' });
  await rejects(verifyDynamic(exportResults('{ lazy: Promise.resolve().then(() => [1, 2].at(-1)), control: 4 }'), 'missing lazy polyfill', ext), { actual: 'ERR|TypeError' });
  await rejects(verifyInNode(exportResults('{ clamp: 3, cooked: "hello" }'), 'wrong value', ext), { actual: 'ERR|AssertionError' });
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
    [verifyDynamic, '{ lazy: Promise.resolve(new Number(2)), control: 4 }'],
  ]) {
    await rejects(verify(exportResults(result), 'boxed result', ext), { actual: 'ERR|AssertionError' });
    checks++;
  }
  checks += 11;
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
const eagerChunk = { fileName: 'eager.mjs', code: 'export const n = 2;', isDynamicEntry: false, dynamicImports: [] };
const eagerEntry = 'import { n } from "./eager.mjs"; export const results = { lazy: Promise.resolve(n), control: 4 };';
await rejects(verifySplitDynamic({ code: eagerEntry, chunks: [eagerChunk], dynamicImports: [] }, 'static import'),
  /expected a separate dynamic chunk/u);
const lazyChunk = { fileName: 'lazy.mjs', code: 'export const value = typeof window === "object" ? _ref : 2;', isDynamicEntry: true, dynamicImports: [] };
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
await verifySplitDynamic({
  code: splitCode,
  chunks: [
    eagerChunk,
    { ...lazyChunk, code: 'import { n as _ref } from "./eager.mjs"; export const value = { _ref3: _ref }._ref3;' },
  ],
  dynamicImports: [lazyChunk.fileName],
}, 'split binding');
checks += 4;
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
