// The complete parameter caller census, read through both scope trackers. A rewrite needs live
// source paths and the actual callable identity; a default-type proof needs the same caller set.
// Unknown callers are distinct from an empty set, and nested names never identify another body.
import { createChecker } from './harness.mjs';
import { resolveCallArgument } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';

const { check, checkDeep, finish, runBoth } = createChecker('parameter-call-sites');

function checkCalls(label, source, expected, neverOverridden = false, sourceType = 'module') {
  runBoth(label, source, (adapter, program, caseLabel) => {
    const parameter = adapter.pickPath(program, 'AssignmentPattern', path => path.node.left?.name === 'value'
      && path.parentPath?.node?.params?.includes(path.node));
    check(`${ caseLabel }: parameter found`, Boolean(parameter), true);
    if (!parameter) return;
    const resolver = adapter.makeResolver();
    const sites = resolver.parameterCallSites(parameter);
    const supplied = sites?.map(({ pairing, argIndex }) => {
      if (pairing.argsUnknown) return '<unknown>';
      const arg = resolveCallArgument(pairing.args, argIndex);
      return arg ? source.slice(arg.start, arg.end) : '<missing>';
    }).sort() ?? null;
    checkDeep(`${ caseLabel }: supplied slots`, supplied, expected?.toSorted() ?? null);
    check(`${ caseLabel }: default authority`, resolver.paramDefaultNeverOverridden(parameter), neverOverridden);
    if (sites) {
      check(`${ caseLabel }: live invocation paths`, sites.every(({ callPath }) => callPath.node && callPath.scope), true);
      check(`${ caseLabel }: invocation uniqueness`, new Set(sites.map(site => site.callPath.node)).size, sites.length);
    }
  }, undefined, sourceType);
}

checkCalls('declaration, two supplied values', 'function f(value = []) {} f([1]); f([2]);', ['[1]', '[2]']);
checkCalls('empty caller set', 'function f(value = []) {}', [], true);
checkCalls('missing and undefined arguments', 'function f(value = []) {} f(); f(undefined); f(void 1);',
  ['<missing>', 'undefined', 'void 1'], true);
checkCalls('declarator arrow', 'const f = (value = []) => value; f([1]);', ['[1]']);
checkCalls('named expression, outer and recursive names',
  'const f = function inner(value = []) { if (value.length) inner(); }; f([1]);', ['[1]', '<missing>']);
checkCalls('named IIFE with exported result',
  'export const result = (function inner(value = []) { return value; })([1]);', ['[1]']);
checkCalls('named IIFE with only default',
  'export const result = (function inner(value = []) { return value; })();', ['<missing>'], true);
checkCalls('named IIFE recursive argument',
  'export const result = (function inner(value = []) { if (value.length) return inner([2]); })();', ['<missing>', '[2]']);
checkCalls('private declaration inside exported result',
  'export const result = (() => { function read(value = []) { return value; } return read([1]); })();', ['[1]']);
checkCalls('private arrow inside exported function',
  'export function outer() { const read = (value = []) => value; return read([1]); }', ['[1]']);
checkCalls('private declaration returned by exported result',
  'export const result = (() => { function read(value = []) { return value; } return read; })();', null);
checkCalls('sequence callee', 'function f(value = []) {} (0, f)([1]);', ['[1]']);
checkCalls('inline array spread coordinates', 'function f(value = []) {} f(...[[1]]);', ['[1]']);
checkCalls('direct call invoker', 'function f(value = []) {} f.call(null, [1]);', ['[1]']);
checkCalls('direct apply invoker', 'function f(value = []) {} f.apply(null, [[1]]);', ['[1]']);
checkCalls('reflect apply invoker', 'function f(value = []) {} Reflect.apply(f, null, [[1]]);', ['[1]']);
checkCalls('bound immediate invocation', 'function f(value = []) {} f.bind(null, [1])();', ['[1]']);
checkCalls('unknown apply arguments', 'function f(value = []) {} f.apply(null, args);', ['<unknown>']);
checkCalls('shadowed Reflect is an unknown invoker',
  'function f(value = []) {} function run(Reflect) { Reflect.apply(f, null, []); }', null);
checkCalls('TS this parameter uses runtime slot',
  'function f(this: unknown, value = []) {} f([1]);', ['[1]']);
checkCalls('tag interpolation uses parameter index',
  // eslint-disable-next-line no-template-curly-in-string -- the test source contains a tagged template
  'function f(strings, value = []) {} f`a${[1]}b`;', ['[1]']);
checkCalls('IIFE arguments resolve outside parameter shadows',
  '((undefined, value = []) => value)(5, undefined);', ['undefined'], true);
checkCalls('declaration name shadowed by its parameter',
  'function f(f, value = []) { f([2]); } f(other, [1]);', ['[1]']);
checkCalls('NFE name shadowed by its parameter',
  'const f = function inner(inner, value = []) { inner([2]); }; f(other, [1]);', null);
checkCalls('NFE name shadowed by a body var',
  'const f = function inner(value = []) { var inner = other; inner([2]); }; f([1]);', null);
checkCalls('read that drops the callable value', 'function f(value = []) {} typeof f; f();', ['<missing>'], true);
checkCalls('direct export', 'export function f(value = []) {} f();', null);
checkCalls('separate export', 'function f(value = []) {} export { f }; f();', null);
checkCalls('exported declarator NFE', 'export const f = function inner(value = []) {}; f();', null);
checkCalls('callee alias contributes its callers', 'function f(value = []) {} const alias = f; alias();', ['<missing>'], true);
checkCalls('method and its alias share callers',
  'const box = { read(value = []) {} }; const alias = box.read; box.read([1]); alias([2]);', ['[1]', '[2]']);
checkCalls('method alias export opens the caller set',
  'const box = { read(value = []) {} }; export const alias = box.read; alias();', null);
checkCalls('method owner escape opens the caller set',
  'const box = { read(value = []) {} }; sink(box); box.read();', null);
checkCalls('method owner export opens the caller set',
  'export const box = { read(value = []) {} }; box.read();', null);
checkCalls('method mutation opens the caller set',
  'const box = { read(value = []) {} }; box.read = other; box.read();', null);
checkCalls('method unknown key opens the caller set',
  'const box = { read(value = []) {} }; box[key](); box.read();', null);
checkCalls('method duplicate key cannot name the function',
  'const box = { read(value = []) {}, read: other }; box.read();', null);
checkCalls('method this can reach an unspelled caller',
  'const box = { read(value = []) {}, expose() { return this; } }; box.read();', null);
checkCalls('method spread can replace the slot',
  'const box = { read(value = []) {}, ...other }; box.read();', null);
checkCalls('method alias reassignment opens the caller set',
  'const box = { read(value = []) {} }; let alias = box.read; alias = other; alias();', null);
checkCalls('method computed key and invokers',
  'const box = { ["read"](value = []) {} }; box.read.call(null, [1]); Reflect.apply(box.read, null, [[2]]);', ['[1]', '[2]']);
checkCalls('callee reassignment', 'let f = function(value = []) {}; f = other; f();', null);
checkCalls('self-return escapes callable identity',
  'export const result = (function inner(value = []) { return inner; })();', null);
checkCalls('discarded constructed instance', 'class C { constructor(value = []) {} } new C([1]);', ['[1]']);
checkCalls('held constructed instance', 'class C { constructor(value = []) {} } const c = new C([1]);', null);
checkCalls('class expression outer name', 'const C = class Inner { constructor(value = []) {} }; new C([1]);', ['[1]']);
checkCalls('Annex B reaches beyond scoped references',
  'if (ok) { function f(value = []) {} } f([1]);', null, false, 'script');

// A rewrite needs the pristine invoker's identity. The caller census forwards the optional mutation
// verdict to its canonical pairing for named references and the function literal's own invocation.
for (const [label, source, object, key] of [
  ['Reflect.apply', 'function f(value = []) {} Reflect.apply(f, null, []);', 'Reflect', 'apply'],
  ['Function.call', 'function f(value = []) {} f.call(null);', 'Function.prototype', 'call'],
  ['Function.apply', 'function f(value = []) {} f.apply(null, []);', 'Function.prototype', 'apply'],
  ['Function.bind', 'function f(value = []) {} f.bind(null)();', 'Function.prototype', 'bind'],
  ['inline call', '(function(value = []) {}).call(null);', 'Function.prototype', 'call'],
  ['named inline apply', '(function inner(value = []) {}).apply(null, []);', 'Function.prototype', 'apply'],
]) {
  runBoth(`mutation hook: ${ label }`, source, (adapter, program, caseLabel) => {
    const parameter = adapter.pickPath(program, 'AssignmentPattern', path => path.node.left?.name === 'value');
    const resolver = adapter.makeResolver();
    const mutation = { staticIsMutated: (owner, member) => owner === object && member === key };
    check(`${ caseLabel }: pristine site exists`, resolver.parameterCallSites(parameter)?.length, 1);
    check(`${ caseLabel }: modified invoker is unknown`, resolver.parameterCallSites(parameter, mutation), null);
    check(`${ caseLabel }: default query retains its policy`, resolver.paramDefaultNeverOverridden(parameter), true);
  });
}

runBoth('invoker mutation does not reject ordinary calls', 'function f(value = []) {} f();', (adapter, program, label) => {
  const parameter = adapter.pickPath(program, 'AssignmentPattern');
  check(label, adapter.makeResolver().parameterCallSites(parameter, { staticIsMutated: () => true })?.length, 1);
});

finish();
