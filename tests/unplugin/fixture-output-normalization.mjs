import { equal, notEqual, ok } from 'node:assert/strict';
import { parseSync } from 'oxc-parser';
import { commentSignature, strip } from './structural.mjs';

function identity(source) {
  // eslint-disable-next-line node/no-sync -- fixture comparisons use the synchronous parser
  const parsed = parseSync('input.ts', source, { sourceType: 'module' });
  equal(parsed.errors.filter(error => error.severity === 'Error').length, 0);
  const before = JSON.stringify(parsed.program);
  const normalized = strip(parsed.program);
  equal(JSON.stringify(parsed.program), before); // Comment-placement checks still need the original tree.
  equal(JSON.stringify(strip(parsed.program.body)), JSON.stringify(strip(structuredClone(parsed.program.body))));
  return JSON.stringify([normalized, commentSignature(parsed.comments)]);
}

for (const [left, right] of [
  ['const a = f(), b = g();', 'const a = f(); const b = g();'],
  ['function f() { let a = x(), b = y(); }', 'function f() { let a = x(); let b = y(); }'],
  ['a(), b();', 'a(); b();'],
  ['(a(), (b(), c()));', 'a(); b(); c();'],
  ['name = method; ({ [key]: value } = source);', '(name = method, { [key]: value } = source);'],
  ['switch (x) { case 1: a(), b(); }', 'switch (x) { case 1: a(); b(); }'],
  ['function f() { var _ref2, _ref; use(_ref, _ref2); }', 'function f() { var _ref, _ref2; use(_ref, _ref2); }'],
  ['function f() { var _ref3, _ref2; const a = f(_ref2), b = g(_ref3); }',
    'function f() { var _ref2, _ref3; const a = f(_ref2); const b = g(_ref3); }'],
  ['const _ref = f(); use(_ref);', 'const _ref2 = f(); use(_ref2);'],
  ['const _unused = f(); use(_unused);', 'const _unused2 = f(); use(_unused2);'],
  ['let _ref = 1, _unused = 2; use(_ref, _unused);', 'let _ref2 = 1, _unused2 = 2; use(_ref2, _unused2);'],
  ['function f(_ref) { return _ref; } function g(_ref) { return _ref; }',
    'function f(_ref2) { return _ref2; } function g(_ref3) { return _ref3; }'],
  ['let _ref = 0; _ref = f(); use(_ref);', 'let _ref2 = 0; _ref2 = f(); use(_ref2);'],
  ['const _ref = 1; use(object[_ref]);', 'const _ref2 = 1; use(object[_ref2]);'],
  ['declare function f([x]?: number[]): void; const a = x(), b = y();',
    'declare function f([x]?: number[]): void; const a = x(); const b = y();'],
]) equal(identity(left), identity(right));

for (const [left, right] of [
  ['const a = f(), b = g();', 'const b = g(); const a = f();'],
  ['first = f(), second = g();', 'second = g(); first = f();'],
  ['let a = b, b = 1;', 'let b = 1; let a = b;'],
  ['for (let a = f(), b = g();;) {}', 'for (let a = f();;) { let b = g(); }'],
  ['if (c) var a = f(), b = g();', 'if (c) { var a = f(); var b = g(); }'],
  ['("use strict", f());', '"use strict"; f();'],
  ['(o.m)();', '(0, o.m)();'],
  ['let a = 1; { let b = 2; use(a, b); }', 'let a = 1, b = 2; { use(a, b); }'],
  ['function f() { var _ref = a(), _ref2 = b(); return [_ref, _ref2]; }',
    'function f() { var _ref2 = b(), _ref = a(); return [_ref, _ref2]; }'],
  ['function f() { var _ref, _ref2; _ref = a(); _ref2 = b(); return [_ref, _ref2]; }',
    'function f() { var _ref, _ref2; _ref = a(); _ref2 = b(); return [_ref2, _ref]; }'],
  ['function f() { var b, a; use(a, b); }', 'function f() { var a, b; use(a, b); }'],
  ['function f() { var _ref; { use(_ref); } }', 'function f() { { var _ref; use(_ref); } }'],
  ['(0, object).member;', 'object.member;'],
  ['a(), b(); // keep', 'a(); b();'],
  ['/* first */ a(), /* second */ b();', '/* second */ a(); /* first */ b();'],
  ['const a = f(_ref), b = g(_ref2);', 'const a = f(_ref2), b = g(_ref2);'],
  ['var _ref, _ref2; const a = f(_ref), b = g(_ref2);', 'var _ref, _ref2; const a = f(_ref2), b = g(_ref2);'],
  ['a(_ref), b(_ref2);', 'a(_ref2), b(_ref2);'],
  ['const _ref = f(), a = _ref, _ref2 = g(), b = _ref2;', 'const _ref = f(), a = _ref, _ref2 = g(), b = _ref;'],
  ['const _ref = 1; function f(_ref2) { return () => _ref; }', 'const _ref = 1; function f(_ref2) { return () => _ref2; }'],
  ['object._ref;', 'object._ref2;'],
  ['const object = { _ref: 1 };', 'const object = { _ref2: 1 };'],
  ['import { _ref as x } from "m";', 'import { _ref2 as x } from "m";'],
  ['const _ref = 1; export { _ref };', 'const _ref2 = 1; export { _ref2 };'],
  ['const _ref = 1; type X = N._ref;', 'const _ref2 = 1; type X = N._ref2;'],
  ['const _ref = 1; const object = { _ref };', 'const _ref2 = 1; const object = { _ref2 };'],
  ['_ref;', '_ref2;'],
  ['var _unused, _unused2; use(_unused, _unused2);', 'var _unused, _unused2; use(_unused2, _unused2);'],
  ['const _ref = 1; declare function f([x]?: number[]): void; use(_ref);',
    'const _ref2 = 1; declare function f([x]?: number[]): void; use(_ref2);'],
  ['const _ref = 1; function f() { type F = ([x]?: number[]) => void; } use(_ref);',
    'const _ref2 = 1; function f() { type F = ([x]?: number[]) => void; } use(_ref2);'],
]) notEqual(identity(left), identity(right));

// Each binding's sites are collected once, even when many references resolve to it.
const { set } = WeakMap.prototype;
let bindingSites = 0;
/* eslint-disable no-extend-native -- synchronous complexity probe; restored in finally */
try {
  WeakMap.prototype.set = function (key, value) {
    if (key?.type === 'Identifier' && value?.identifierPath) bindingSites++;
    return set.call(this, key, value);
  };
  identity(`let _ref = 0; use(${ Array(128).fill('_ref').join(',') });`);
} finally {
  WeakMap.prototype.set = set;
}
/* eslint-enable no-extend-native -- end of synchronous probe */
ok(bindingSites > 0 && bindingSites <= 256);

echo(chalk.green('fixture-output-normalization: statement lists and temporary bindings passed'));
