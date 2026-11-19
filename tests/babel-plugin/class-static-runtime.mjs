// Class statics preserve subclass receivers, own slots, captured bases and native opt-out controls.
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { transform as lower } from '@swc/core';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';
import { runInWorker } from '../transpiler-differential/realm-runner.mjs';
import { createChecker, scenarioSource } from '../polyfill-provider/harness.mjs';

const requireBabel = process.env.BABEL_REQUIRE_FROM
  ? createRequire(pathToFileURL(`${ path.resolve(process.env.BABEL_REQUIRE_FROM) }/`).href)
  : createRequire(import.meta.url);
const { transformAsync } = requireBabel('@babel/core');
const { check, finish } = createChecker('class-static-runtime', { tsc: 'Runtime class reassignment, TDZ and inherited static APIs are intentional JavaScript probes.' });
const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };
const TMP = path.join(import.meta.dirname, '../transpiler-differential/tmp');
await fs.ensureDir(TMP);
const DIR = await fs.mkdtemp(path.join(TMP, 'class-static-'));
const cases = [
  ['named', 'class Bag extends Array {} const result = Bag.from([3]); return [result[0], result instanceof Bag];', [3, true], []],
  ['carried-map-static', 'class Bag extends Map {} const groupBy = Bag.groupBy; return [groupBy === Bag.groupBy, groupBy([3], x => x).get(3)[0]];', [true, 3], []],
  ['carried-map-key', 'class Base extends Map {} class Bag extends Base {} return Bag[(effects.push("key"), "groupBy")]([3], x => x).get(3)[0];', 3, ['key']],
  ['carried-map-container',
    `const ns = { inner: { Base: Map } }; const alias = ns.inner;
     function read(Map) { class Bag extends alias[(effects.push("base"), "Base")] {}
       return Bag[(effects.push("key"), "groupBy")]([3], x => x).get(3)[0]; }
     return read(null);`, 3, ['base', 'key']],
  ['carried-map-replaced-base', `// core-js-disable-next-line
     const Native = Map;
     const ns = { Base: Map }; ns.Base = Native;
     class Bag extends ns.Base {} return Bag.groupBy([3], x => x).get(3)[0];`, 3, []],
  ['named-static', 'class Bag extends Array { static read() { return Bag.from([3]); } } return Bag.read() instanceof Bag;', true, []],
  ['named-instance', 'class Bag extends Array { read() { return Bag.of(4); } } const result = new Bag().read(); return [result[0], result instanceof Bag];', [4, true], []],
  ['chain-super', 'class Base extends Array {} class Bag extends Base { static read() { return super.from([3]); } } return Bag.read() instanceof Bag;', true, []],
  ['chain-this',
    'class Base extends Array {} class Middle extends Base {} class Bag extends Middle { static read() { return this.from([3]); } } return Bag.read() instanceof Bag;', true, []],
  ['effectful-base',
    'const ns = { Base: Array }; class Bag extends (effects.push(\'base\'), ns.Base) { static read() { return super.of(3); } } return Bag.read() instanceof Bag;', true, ['base']],
  ['chain-name', 'class Base extends Array {} class Bag extends Base {} return Bag.from([3]) instanceof Bag;', true, []],
  ['super-extracted',
    'class Base extends Array {} class Bag extends Base { static read() { const from = super.from; return from.call(this, [3]); } } return Bag.read() instanceof Bag;', true, []],
  ['super-field', 'class Base extends Array {} class Bag extends Base { static f = super.from; } return Bag.f.call(Bag, [3]) instanceof Bag;', true, []],
  ['super-key-read',
    `class Base extends Array {} class Bag extends Base {
      static read() { const from = super[(effects.push("key"), "from")]; return from.call(this, [3]); }
    } return Bag.read() instanceof Bag;`, true, ['key']],
  ['this-key-read',
    `class Base extends Array {} class Bag extends Base {
      static read() { const from = this[(effects.push("key"), "from")]; return from.call(this, [3]); }
    } return Bag.read() instanceof Bag;`, true, ['key']],
  ['local-iterator', 'class Iterator { static from() { return "user"; } } const I = Iterator; return I.from([3]);', 'user', []],
  ['local-container', 'class Map { static groupBy() { return "user"; } } const box = { C: Map }; return box.C.groupBy([3], x => x);', 'user', []],
  ['opted-native-instance', `// core-js-disable-next-line
const C = Map;
return C.prototype.has.call(new C(), 1);`, false, []],
  ['opted-borrowed-method', `// core-js-disable-next-line
const C = Map;
const m = new Map(); m.set(1, 7);
const get = Map.prototype.get;
return [C.prototype.has.call(m, 1), Reflect.apply(get, m, [1]), m instanceof Map, m.constructor === Map,
  Object.getPrototypeOf(m) === Map.prototype, Map.groupBy([3], x => x).get(3)[0]];`, [true, 7, true, true, true, 3], []],
  ...[
    ['direct', 'return m instanceof Map;', true],
    ['callback', 'return [m].every(x => x instanceof Map);', 'TypeError'],
    ['returned-pair', 'return [m, Map];', 'TypeError'],
    ['returned-copy', 'const copy = (0, m); return [copy, Map];', 'TypeError'],
    ['collection-lookup', 'return !m.has(1) && m instanceof Map;', true],
    ['user-method', 'const user = { isPrototypeOf(x) { return x instanceof Map; } }; return user.isPrototypeOf.call(Map.prototype, m);', 'TypeError'],
    ['borrowed-callback', 'let same; m.set(1, 1); Map.prototype.forEach.call(m, (v, k, x) => { same = x instanceof Map; }); return same;', 'TypeError'],
  ].map(([name, result, onBorrow]) => [
    `opted-consumer-${ name }`,
    `function read(probe) {
      // core-js-disable-next-line
      const C = Map;
      const m = new Map();
      if (probe) C.prototype.has.call(m, 1);
      ${ result }
    }
    function check(probe) {
      try {
        const result = read(probe);
        return Array.isArray(result) ? result[0] instanceof result[1] : result;
      } catch (error) { return error.name; }
    }
    return [check(false), check(true)];`,
    [true, true], [], true, [true, onBorrow],
  ]),
  ...[
    ['shared-constructor', `const a = new Map(), b = new Map(), D = Map;
      return [C.prototype.has.call(a, 1), a instanceof D, b instanceof D, D.prototype.has.call(b, 1)];`, [false, true, true, false]],
    ['shared-new-target', `const m = new Map(), D = Map, other = new D([[1, 7]]);
      return [C.prototype.has.call(m, 1), m instanceof D, D.prototype.get.call(other, 1), other instanceof D, other instanceof Map];`,
    [false, true, 7, true, true]],
    ['shared-methods', `const a = new Map([[1, 1]]), b = new Map([[1, 2]]), c = new Map([[1, 3]]);
      const f = Map.prototype.get, g = Map.prototype.get;
      return [g.call(c, 1), g.call(b, 1), f.call(b, 1), f.call(a, 1), C.prototype.has.call(a, 1), c instanceof Map];`,
    [3, 2, 2, 1, true, true]],
    ['returned-instance', 'function make() { return new Map([[1, 7]]); } return C.prototype.get.call(make(), 1);', 7],
    ['local-holder', 'const box = { m: new Map([[1, 5]]), has: C.prototype.has }; return box.has.call(box.m, 1);', true],
    ['inline-parameter', 'return (m => C.prototype.has.call(m, 1))(new Map([[1, 7]]));', true],
    ['local-parameter', 'function read(m) { return C.prototype.has.call(m, 1); } return read(new Map([[1, 7]]));', true],
    ['iterator', 'const m = new Map([[1, 7]]), iter = C.prototype[Symbol.iterator]; return iter.call(m).next().value;', [1, 7]],
  ].map(([name, body, wanted]) => [`opted-traced-${ name }`, `// core-js-disable-next-line
const C = Map;
${ body }`, wanted, []]),
  ['opted-installed-accessor', `// core-js-disable-next-line
const C = Map;
const prior = Object.getOwnPropertyDescriptor(C.prototype, 'has');
let calls = 0;
try {
  Object.defineProperty(C.prototype, 'has', { configurable: true, get() {
    calls++; return function () { return calls * 10 + (this instanceof C); };
  } });
  return C.prototype.has.call(new Map(), 1);
} finally { Object.defineProperty(C.prototype, 'has', prior); }`, 11, []],
  ['opted-installed-opaque-accessor', `// core-js-disable-next-line
const C = Map;
const prior = Object.getOwnPropertyDescriptor(C.prototype, 'has');
let published;
function install(descriptor) { Object.defineProperty(C.prototype, 'has', descriptor); }
try {
  install({ configurable: true, get() { return function () { published = this; }; } });
  C.prototype.has.call(new Map(), 1);
  return published instanceof Map;
} finally { Object.defineProperty(C.prototype, 'has', prior); }`, true, []],
  ['opted-installed-instance-hook', `// core-js-disable-next-line
const C = Map;
const prior = Object.getOwnPropertyDescriptor(C.prototype, 'has');
let seen;
Object.defineProperty(C, Symbol.hasInstance, { configurable: true, value(x) { seen = x; return true; } });
try {
  Object.defineProperty(C.prototype, 'has', { configurable: true, value: function () { return this instanceof C; } });
  return C.prototype.has.call(new Map());
} finally {
  delete C[Symbol.hasInstance];
  Object.defineProperty(C.prototype, 'has', prior);
  effects.push(seen instanceof Map);
}`, true, [true]],
  ['opted-receiver-key-order', `// core-js-disable-next-line
const C = Map;
const fn = C[(effects.push('prototype'), 'prototype')][(effects.push('key'), 'has')];
return fn.bind((effects.push('instance'), new globalThis.Map()))((effects.push('arg'), 1));`, false, ['prototype', 'key', 'instance', 'arg']],
  ['opted-receiver-pattern', `// core-js-disable-next-line
const C = Set;
const { Set: S, Map: M } = globalThis;
const value = new S(); value.add(3);
return [C.prototype.has.apply(value, [3]), M.groupBy([5], x => x).get(5)[0]];`, [true, 5], []],
  ['opted-nested-receiver-pattern', `// core-js-disable-next-line
const C = Map;
const { Map: { prototype: p }, Set: S } = globalThis;
const local = new Map([[1, 7]]);
return [C.prototype.has.call(local, 1), p.get.call(local, 1), new S([7]).has(7)];`, [true, 7, true], []],
  ['opted-wrong-family', `// core-js-disable-next-line
const C = Map;
try { C.prototype.has.call(new Set(), (effects.push('argument'), 1)); } catch (error) { return error.name; }`, 'TypeError', ['argument']],
  ['opted-inherited-instance', `// core-js-disable-next-line
const C = Map;
class Bag extends Map { constructor() { super(); this.set(1, 7); } }
const value = new Bag();
return [C.prototype.has.call(value, 1), Map.prototype.get.call(value, 1), value instanceof Bag, Bag.groupBy([5], x => x).get(5)[0]];`,
  [true, 7, true, 5], []],
  ['opted-prototype-constructor', `// core-js-disable-next-line
const C = Map;
const value = new Map.prototype.constructor();
return [C.prototype.has.call(value, 1), Map.prototype.has.call(value, 1)];`, [false, false], []],
  ['opted-reflect-construction', `// core-js-disable-next-line
const C = Map;
const value = Reflect.construct(Map, [], Map);
return [C.prototype.has.call(value, 1), Map[Symbol.hasInstance](value), Function.prototype[Symbol.hasInstance].call(Map, value),
  Object.is(value.constructor, Map)];`, [false, true, true, true], []],
  ['opted-borrow-with-factory', `// core-js-disable-next-line
const C = Map;
const local = new Map();
const { has } = Map.prototype;
if (effects.length) { C.prototype.has.call(local, 1); has.call(local, 1); }
const other = Map.groupBy([7], x => x);
return [has.call(other, 7), C.prototype.has.call(new Map(), 1)];`, [true, false], []],
  ['opted-one-method-on-both-brands', `// core-js-disable-next-line
const C = Map;
const local = new Map(), other = Map.groupBy([7], x => x);
const { has } = Map.prototype;
try {
  C.prototype.has.call(local, 1); has.call(local, 1);
  return has.call(other, 7);
} catch (error) { return error.name; }`, true, [], true, 'TypeError'],
  ['opted-selected-callback-argument', `// core-js-disable-next-line
const C = Map;
const local = new Map(), has = Map.prototype.has;
function read(external) {
  if (effects.length) C.prototype.has.call(local, 7);
  return has.call(effects.length ? local : external, 7);
}
return [Map.groupBy([7], x => x)].some(read);`, true, []],
  ['opted-borrow-with-escaped-class', `// core-js-disable-next-line
const C = Map;
class Bag extends Map {}
const m = new Bag();
function read(ctor) { return ctor.groupBy([4], x => x).get(4)[0]; }
if (effects.length) C.prototype.has.call(m, 1);
return read(Bag);`, 4, []],
  ['alias-control', 'const C = Map; return C.prototype.has.call(new Map(), 1);', false, []],
  ['opted-leaf', `// core-js-disable-next-line
const C = Map;
// core-js-disable-next-line
return C.prototype.has.call(new C(), 1);`, false, []],
  ['own-method', 'class Bag extends Array { static from() { effects.push("own"); return 11; } } return Bag.from([3]);', 11, ['own']],
  ['own-getter', 'class Bag extends Array { static get from() { effects.push("get"); return function () { return this === Bag; }; } } return Bag.from([]);', true, ['get']],
  ['own-computed', 'const key = "from"; class Bag extends Array { static [key]() { return 12; } } return Bag.from([]);', 12, []],
  ['own-dynamic', 'function key() { effects.push("key"); return "from"; } class Bag extends Array { static [key()]() { return 13; } } return Bag.from([]);', 13, ['key']],
  ['parent-method', 'class Base extends Array { static from() { return this; } } class Bag extends Base {} return Bag.from([]) === Bag;', true, []],
  ['parent-super',
    'class Base extends Array { static from() { return this; } } class Bag extends Base { static read() { return super.from([]); } } return Bag.read() === Bag;', true, []],
  ['class-alias', 'class Bag extends Array {} const B = Bag; return B.of(3) instanceof Bag;', true, []],
  ['wrapped-class', 'class Bag extends (Array as typeof Array) {} return ((Bag as typeof Bag)!).of(3) instanceof Bag;', true, []],
  ['class-expr', 'const Bag = class extends Array {}; return Bag.of(3) instanceof Bag;', true, []],
  ['shadowed-scope', 'class Bag extends Array {} function read() { const Array = Object; return Bag.of(3) instanceof Bag; } return read();', true, []],
  ['base-capture', 'let Base = Array; class Bag extends Base {} Base = Object; return Bag.of(3) instanceof Bag;', true, []],
  ['key-effects', 'class Bag extends Array {} const result = Bag[(effects.push("key"), "from")]((effects.push("arg"), [3])); return result instanceof Bag;', true, ['key', 'arg']],
  ['optional', 'class Bag extends Array {} return Bag?.from?.([3]) instanceof Bag;', true, []],
  ['argument-escape', 'class Bag extends Array {} function read(from) { return from.call(Bag, [3]); } return read(Bag.from) instanceof Bag;', true, [], false],
  ['argument-read', 'class Bag extends Array {} function read(from) { return typeof from; } return read(Bag.from);', 'function', []],
  // Tags keep their native receiver; passing a class to an opaque callee also keeps its slot live.
  ['tagged-read', 'class Bag extends Array {} const result = Bag.from`x`; return [result[0], result instanceof Bag];', ['x', true], [], false],
  ['new-read', 'class Bag extends Array {} try { new Bag.from([]); return \'missed\'; } catch (error) { return error.name; }', 'TypeError', [], false],
  ['extracted', 'class Bag extends Array {} const from = Bag.from; return from.call(Bag, [3]) instanceof Bag;', true, []],
  ['extracted-and-method',
    `class Base extends Array {}
     class Bag extends Base { static fromBase(xs) { return super.from(xs); } read() { return Bag.of(5); } }
     const of = Bag.of; return [new Bag().read()[0], of.call(Bag, 6)[0]];`,
    [5, 6], []],
  ['extracted-apply-and-method',
    'class Bag extends Array { read() { return Bag.of(5); } } const of = Bag.of; return [new Bag().read()[0], of.apply(Bag, [6])[0]];', [5, 6], []],
  ['extracted-reflect-and-method',
    'class Bag extends Array { read() { return Bag.of(5); } } const of = Bag.of; return [new Bag().read()[0], Reflect.apply(of, Bag, [6])[0]];', [5, 6], []],
  ['extracted-before-reader',
    'class Bag extends Array {} const of = Bag.of; function read() { return Bag.of(5); } return [read()[0], of.call(Bag, 6)[0]];', [5, 6], []],
  ['extracted-parent-alias',
    `class Base extends Array {} const B = Base; class Bag extends B { read() { return Bag.of(5); } }
     const of = B.of; return [new Bag().read()[0], of.call(B, 6)[0]];`, [5, 6], []],
  ['extracted-parent-alias-write',
    `class Base extends Array {} const B = Base; class Bag extends B { read() { return Bag.of(5); } }
     const of = function () { this.of = () => 29; }; of.call(B); return new Bag().read();`, 29, []],
  ['extracted-patched-builtin',
    `Array.of = function () { return 17; }; class Bag extends Array { read() { return Bag.of(5); } }
     const of = Bag.of; return [new Bag().read(), of.call(Bag, 6)];`, [17, 17], []],
  ['extracted-before-write',
    'class Bag extends Array { read() { return Bag.of(5); } } const of = Bag.of; Bag.of = () => 19; return [new Bag().read(), of.call(Bag, 6)[0]];', [19, 6], []],
  ['extracted-own-method',
    `class Bag extends Array { static of() { this.from = () => 23; } read() { return Bag.from([]); } }
     const of = Bag.of; of.call(Bag); return new Bag().read();`, 23, []],
  ['extracted-unknown-method',
    'class Bag extends Array { read() { return Bag.of(5); } } const of = function () { this.of = () => 29; }; of.call(Bag); return new Bag().read();', 29, []],
  ['extracted-constructor-write',
    `class Bag extends Array { constructor(...args) { super(...args); Bag.of = () => 31; } static read() { return Bag.of(5); } }
     const of = Bag.of; of.call(Bag, 6); return Bag.read();`, 31, []],
  ['constructor-write-capture',
    `class Bag extends Array { constructor(...args) { super(...args); effects.push("construct"); Bag.of = () => 31; } }
     const of = Bag.of; return [of.call(Bag, 6)[0], Bag.of(7)];`, [6, 31], ['construct']],
  ['constructor-write-expression',
    `const Bag = class extends Array { constructor(...args) { super(...args); Bag.of = () => 31; } };
     const of = Bag.of; return [of.apply(Bag, [6])[0], Bag.of(7)];`, [6, 31], []],
  ['constructor-default-write',
    `class Bag extends Array { constructor(value = (Bag.from = () => 31)) { super(); } }
     const from = Bag.from; return [from.call(Bag, [6])[0], Bag.from([7])];`, [6, 31], []],
  ['constructor-write-direct',
    `class Bag extends Array { constructor(...args) { super(...args); Bag.of = () => 31; } }
     return [Bag.of(6)[0], Bag.of(7)];`, [6, 31], []],
  ['constructor-write-before-capture',
    `class Bag extends Array { constructor(...args) { super(...args); Bag.of = () => 31; } }
     new Bag(); const of = Bag.of; return of.call(Bag, 6);`, 31, []],
  ['constructor-write-method-before',
    `class Bag extends Array { constructor(...args) { super(...args); Bag.of = () => 31; } static make() { return new Bag(); } }
     Bag.make(); const of = Bag.of; return of.call(Bag, 6);`, 31, []],
  ['constructor-write-field-before',
    `class Bag extends Array { constructor(...args) { super(...args); Bag.of = () => 31; } static value = (() => new Bag())(); }
     const of = Bag.of; return of.call(Bag, 6);`, 31, []],
  ['constructor-write-static-this-before',
    `class Bag extends Array { constructor(...args) { super(...args); Bag.of = () => 31; } static value = new this(); }
     const of = Bag.of; return of.call(Bag, 6);`, 31, []],
  ['constructor-write-static-closure-before',
    `function run(make) { return make(); }
     class Bag extends Array { constructor(...args) { super(...args); Bag.of = () => 31; } static value = run(() => new Bag()); }
     const of = Bag.of; return of.call(Bag, 6);`, 31, []],
  ['constructor-write-alias-before',
    `class Bag extends Array { constructor(...args) { super(...args); Bag.of = () => 31; } }
     const Alias = Bag; new Alias(); const of = Bag.of; return of.call(Bag, 6);`, 31, []],
  ['constructor-write-key-before',
    `class Bag extends Array { constructor(...args) { super(...args); Bag.of = () => 31; } }
     const of = Bag[(new Bag(), "of")]; return of.call(Bag, 6);`, 31, []],
  ['written', 'class Bag extends Array {} Bag.from = function () { effects.push("write"); return this; }; return Bag.from([]) === Bag;', true, ['write']],
  ['container-base-written', 'const ns = { Base: class extends Array {} }; ns.Base.from = () => 17; class Bag extends ns.Base {} return Bag.from([]);', 17, []],
  ['container-base-alias-written',
    'const ns = { Base: class extends Array {} }; const Base = ns.Base; ns.Base.from = () => 17; class Bag extends Base {} return Bag.from([]);', 17, []],
  ['this-destructure',
    'class Base extends Array {} class Bag extends Base { static read() { const { from } = this; return from.call(this, [3]); } } return Bag.read() instanceof Bag;', true, []],
  ['named-optional-result', 'class Base extends Array {} class Bag extends Base {} return Bag.from?.([3]).at(-1);', 3, []],
  ['this-optional-result',
    'class Base extends Array {} class Bag extends Base { static read() { return this.from?.([3]).at(-1); } } return Bag.read();', 3, []],
  ['super-optional-result',
    'class Base extends Array {} class Bag extends Base { static read() { return super.from?.([3]).at(-1); } } return Bag.read();', 3, []],
  ['written-parent', 'class Base extends Array {} Base.from = function () { return this; }; class Bag extends Base {} return Bag.from([]) === Bag;', true, []],
  ['written-prototype', 'class Bag extends Array {} Object.setPrototypeOf(Bag, { from() { return 29; } }); return Bag.from([3]);', 29, []],
  ['reassigned', 'class Bag extends Array {} Bag = class { static from() { return 17; } }; return Bag.from([]);', 17, []],
  ['key-reassigned',
    'class Bag extends Array {} const Original = Bag; class Other extends Array {} const r = Bag[(Bag = Other, "from")]([3]); return [r instanceof Original, r instanceof Other];',
    [true, false], [], false],
  ['arg-reassigned',
    'class Bag extends Array {} const Original = Bag; class Other extends Array {} const r = Bag.from((Bag = Other, [3])); return [r instanceof Original, r instanceof Other];',
    [true, false], [], false],
  ['tdz', 'try { return Bag.from([]); class Bag extends Array {} } catch (error) { return error.name; }', 'ReferenceError', []],
  ['object', 'class Bag extends Object {} return Bag.fromEntries([["value", 3]]).value;', 3, []],
  ['promise', 'class Bag extends Promise {} const result = Bag.withResolvers(); return result.promise instanceof Bag;', true, []],
  ['field-before', 'class Bag extends Array { static result = this.from([3]); } return Bag.result instanceof Bag;', true, []],
  ['field-after', 'class Bag extends Array { static result = Bag.from([3]); static from = () => 19; } return Bag.result instanceof Bag;', true, []],
  ['block-write', 'class Bag extends Array { static { this.from = () => 20; } } return Bag.from([]);', 20, []],
  ['expression-written', 'const Bag = class extends Array {}; Bag.from = function () { return 21; }; return Bag.from([]);', 21, []],
  ['expression-parent-written', 'const Base = class extends Array {}; Base.from = function () { return 22; }; class Bag extends Base {} return Bag.from([]);', 22, []],
  ['key-tdz',
    'try { Bag[(effects.push("key"), "from")]([]); class Bag extends Array {} } catch (error) { return error.name; }', 'ReferenceError', []],
  ['optional-key-tdz',
    'try { Bag?.[(effects.push("key"), "from")]([]); class Bag extends Array {} } catch (error) { return error.name; }', 'ReferenceError', []],
  ['value-tdz', 'try { const f = Bag.from; class Bag extends Array {} return 0; } catch (error) { return error.name; }', 'ReferenceError', []],
  ['named-optional-key',
    'class Bag extends Array {} const result = Bag?.[(effects.push("key"), "of")]?.((effects.push("arg"), 3)); return result instanceof Bag;', true, ['key', 'arg']],
  // A later opaque call cannot prove this assignment reached its receiver; pure keeps the native read.
  ['opaque-assigned-class',
    'let Bag; { const Base = Array; Bag = class extends Base {}; } function read() { const Base = Object; return Bag.of(3) instanceof Bag; } return read();', true, [], false],
];
let index = 0;
try {
  for (const [name, body, expected, events, stripped = true, transformed = expected] of cases) {
    const source = scenarioSource(`export const effects = []; export const r = (() => { ${ body } })();`);
    // Promise's native constructor is already sufficient on this target; only its static is missing.
    const options = name === 'promise' ? { ...OPTIONS, targets: { chrome: 100 } } : OPTIONS;
    const typed = name === 'wrapped-class';
    const filename = typed ? 'input.ts' : 'input.mjs';
    const babel = (await transformAsync(source, {
      filename, configFile: false, babelrc: false, parserOpts: { plugins: typed ? ['typescript'] : [], createParenthesizedExpressions: typed },
      plugins: [[babelPlugin, options]],
    })).code;
    const plugin = createUnplugin(options);
    const pre = plugin.transform(source, filename, 'pre')?.code ?? source;
    const post = plugin.transform(pre, filename, 'post')?.code ?? pre;
    for (const [host, output] of [['native', source], ['babel', babel], ['unplugin', pre], ['pre+post', post]]) {
      for (const lowered of host === 'native' ? [true] : [false, true]) {
        const code = lowered || typed ? (await lower(output, {
          filename, jsc: { parser: { syntax: typed ? 'typescript' : 'ecmascript' }, target: lowered ? 'es2015' : 'es2022' },
          module: { type: 'es6' },
        })).code : output;
        const file = path.join(DIR, `case-${ index++ }.mjs`);
        await fs.outputFile(file, code);
        for (const strip of host === 'native' || !stripped ? [false] : [false, true]) {
          check(`${ name }/${ host }/${ lowered }/${ strip }`, await runInWorker(file, { strip }),
            `OK|${ JSON.stringify(host === 'native' ? expected : transformed) }|${ JSON.stringify(events) }`);
        }
      }
    }
  }
} finally {
  await fs.remove(DIR);
}
finish();
