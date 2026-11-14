// A census may only call a static read served when the claim side can name the same slot.
// Unknown keys, class barriers and accessor exports must retain the constructor's namespace.
import { adapters, createChecker, findNode } from './harness.mjs';
import {
  classStaticCallSlot, classStaticSlotMember, collectFileCensus, propertyKeyName,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { findNamespaceMemberValue } from '../../packages/core-js-polyfill-provider/helpers/class-walk.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, finish } = createChecker('census-static-reads');

function census(parser, source, sourceType = 'module') {
  const program = parser.parseAndScope(source, sourceType);
  return collectFileCensus(program.node, [mutationShapesReducer(null), escapedCtorReferencesReducer()]).escapedCtorNames;
}

for (const parser of adapters) {
  // An unrelated heritage does not make the own-escape query resolve the same slot again.
  const inspections = [];
  for (const heritage of ['', 'extends Error']) {
    const program = parser.parseAndScope(`const box = { C: Map }; hand(box.C); class Sub ${ heritage } {}`).node;
    const object = findNode(program, node => node.type === 'ObjectExpression');
    const { properties } = object;
    let reads = 0;
    Object.defineProperty(object, 'properties', { configurable: true, get() {
      reads++;
      return properties;
    } });
    const { escapedCtorNames } = collectFileCensus(program, [mutationShapesReducer(null), escapedCtorReferencesReducer()]);
    check(`${ parser.name }/${ heritage }: own escape retained`, escapedCtorNames.has('Map', false, true), true);
    check(`${ parser.name }/${ heritage }: slot counter is live`, reads > 0, true);
    inspections.push(reads);
  }
  check(`${ parser.name }: own query reuses the resolved slot`, inspections[1], inspections[0]);
  for (const [name, source, own, constructor = 'Map'] of [
    ['base', 'const M = Map; hand(M); class Sub extends M {} Sub.groupBy;', true],
    ['subclass', 'class Sub extends Map {} hand(Sub); Sub.groupBy;', false],
    ['captured call', 'class Sub extends Array {} const of = Sub.of; of.call(Sub, 1);', false, 'Array'],
    ['wrapped base', 'class Sub extends (effect(), Map) {} hand(Sub); Sub.groupBy;', false],
    ['public slot', 'class Sub extends Array { static M = Map; } hand(Sub);', true],
    ['private slot', 'class Sub extends Array { static #M = Map; } hand(Sub);', false],
    ['namesake', 'class Map {} class Sub extends Map {} hand(Map); Sub.groupBy;', false],
    ['returned base', 'function base() { return Map; } hand(base()); class Sub extends Map {} Sub.groupBy;', true],
    ['base through member', 'const box = { C: Map }; class Sub extends box.C {} hand(box.C);', true],
    ['inherited member', 'const box = { C: Map }; class Sub extends box.C {} hand(Sub);', false],
    ['own member', 'const box = { C: Map }; class Sub extends Array { static value = box.C; } hand(Sub);', true],
    ['written member', 'const box = {}; box.C = Map; class Sub extends Array { static value = box; } hand(Sub);', true],
    ['separate visits', 'const box = { C: Map }; class Sub extends box.C {} hand(Sub); hand(box.C);', true],
    ['shadowed member', 'function use(Map) { const box = { C: Map }; class Sub extends box.C {} hand(Sub); } use({});', false],
  ]) for (const reverse of [false, true]) {
    const program = parser.parseAndScope(source, 'module');
    const reducers = [mutationShapesReducer(null), escapedCtorReferencesReducer()];
    const facts = collectFileCensus(program.node, reverse ? reducers.reverse() : reducers).escapedCtorNames;
    check(`${ parser.name }/own escape/${ name }/${ reverse }`, facts.has(constructor, false, true), own);
  }
  for (const [name, source, held, unnamed] of [
    ['named', 'class Sub extends Map {} Sub.groupBy;', true, false],
    ['own', 'class Sub extends Map { static groupBy() {} } Sub.groupBy;', false, false],
    ['unknown', 'class Sub extends Map {} Sub[key];', true, true],
    ['shadowed', 'class Map {} class Sub extends Map {} Sub.groupBy;', false, false],
  ]) for (const reverse of [false, true]) {
    const program = parser.parseAndScope(source, 'module');
    const reducers = [mutationShapesReducer(null), escapedCtorReferencesReducer()];
    const facts = collectFileCensus(program.node, reverse ? reducers.reverse() : reducers).escapedCtorNames;
    check(`${ parser.name }/inherited/${ name }/${ reverse }/held`, facts.has('Map', true), held);
    check(`${ parser.name }/inherited/${ name }/${ reverse }/unnamed`, facts.readsUnnamedStatic('Map'), unnamed);
  }
  for (const [name, source, full = true] of [
    ['selected realm', 'var root = typeof window !== "undefined" ? window : undefined; root.Promise.resolve;'],
    ['literal realm alias', 'const w = globalThis.window; const [{ resolve }] = [w.Promise];'],
    ['optional loop element', 'for (const { resolve } of [globalThis.window?.Promise]) use(resolve);'],
    ['parameter default', 'function f({ Promise } = globalThis) { return Promise.resolve; } f();'],
    ['renamed parameter', 'function f({ Promise: P } = globalThis) { return P.resolve; } f();'],
    ['parameter alias', 'function f({ Promise: P } = globalThis) { const C = P; return C.resolve; } f();'],
    ['IIFE parameter', '(({ Promise }) => Promise.resolve)(globalThis);'],
    ['closed caller', 'function f({ Promise }) { return Promise.resolve; } f(globalThis);'],
    ['literal parameter', 'function f({ P } = { P: Promise }) { return P.resolve; } f();'],
    ['loop assignment', 'let P; for ({ Promise: P } of [globalThis]) P.resolve;'],
    ['loop declaration served', 'for (const { Promise: P } of [globalThis]) P.resolve;', false],
    ['catch binding', 'try { throw Promise; } catch ({ resolve }) { use(resolve); }'],
    ['nested assignment default', 'let length, other; ({ resolve: { length = 9 }, other } = Promise);'],
    ['for init residual', 'let resolve; for ({ Promise: { resolve } = {} } = (undefined || globalThis); false;) {}'],
    ['field residual', 'let resolve; class C { value = ({ Promise: { resolve } = {} } = (undefined || globalThis)); }'],
    ['direct alias served', 'const P = Promise; P.resolve;', false],
    ['direct pattern served', 'const { resolve } = Promise;', false],
    ['no static read', 'function f({ Promise } = globalThis) { return Promise.name; } f();', false],
    ['unrelated shadow', 'function f({ Promise } = globalThis) { { const Promise = {}; use(Promise.resolve); } } f();', false],
    ['custom parameter', 'function f({ P } = { P: {} }) { return P.resolve; } f();', false],
  ]) check(`${ parser.name }/retained constructor/${ name }`, census(parser, source).has('Promise', true), full);

  for (const reverse of [false, true]) {
    const reads = ['const [{ groupBy }] = [a.Map];', 'const [{ resolve }] = [b.Promise];'];
    if (reverse) reads.reverse();
    const facts = census(parser, `var a, b; if (unknown) { a = b.self; b = a.self; } a = globalThis.window; ${ reads.join(' ') }`);
    check(`${ parser.name }/cyclic realm/Promise/${ reverse }`, facts.has('Promise', true), true);
    check(`${ parser.name }/cyclic realm/Map/${ reverse }`, facts.has('Map', true), true);
  }
  check(`${ parser.name }/cycle without realm`, census(parser,
    'var a, b; a = b.self; b = a.self; const [{ resolve }] = [b.Promise];').has('Promise', true), false);

  for (const reverse of [false, true]) {
    const readers = [
      'function direct() { const C = Map; return C.groupBy; } direct();',
      'function retained({ M: C } = { M: Map }) { return C.groupBy; } retained();',
    ];
    if (reverse) readers.reverse();
    check(`${ parser.name }/retained bindings keep their scope/${ reverse }`, census(parser, readers.join(' ')).has('Map', true), true);
  }

  for (const [hop, source, read] of [
    ['', 'Promise', 'C3000.resolve;'],
    ['.self', 'globalThis.window', 'const [{ resolve }] = [C3000.Promise];'],
  ]) {
    const aliases = Array.from({ length: 3000 }, (_, i) => `const C${ i + 1 } = C${ i }${ hop };`).join(' ');
    const deep = census(parser, `const C0 = ${ source }; ${ aliases } ${ read }`);
    check(`${ parser.name }/a deep retained-binding query completes/${ hop }`, typeof deep.has, 'function');
  }

  for (const [name, members] of [
    ['late block', 'static P = Promise; static {}'],
    ['late unknown field', 'static P = Promise; static [key] = 1;'],
    ['getter and block', 'static get P() { return Promise; } static {}'],
  ]) {
    const facts = census(parser, `class C { ${ members } } C.P.try;`);
    check(`${ parser.name }/class/${ name }`, facts.has('Promise', true), true);
    check(`${ parser.name }/class global/${ name }`, facts.readsUnnamedStatic('Promise'), true);
  }
  for (const members of [
    'static get P() { return Promise; } static set P(value) {}',
    'static set P(value) {} static get P() { return Promise; }',
  ]) {
    const program = parser.parseAndScope(`class C { ${ members } }`);
    check(`${ parser.name }/accessor pair/${ members }`, classStaticSlotMember(program.node.body[0], 'P').kind, 'get');
  }
  for (const fields of [
    'static ["#owner"] = Map; static #owner = Object;',
    'static #owner = Object; static ["#owner"] = Map;',
    'static ["#owner"] = Object; static #owner = Map;',
    'static #owner = Map; static ["#owner"] = Object;',
  ]) for (const read of ['C["#owner"]', 'C.#owner']) {
    const source = `class C { ${ fields } static read() { return ${ read }.groupBy; } } C.read();`;
    check(`${ parser.name }/distinct private and public slots/${ fields }/${ read }`, census(parser, source).has('Map', true), false);
  }
  // The same path spelling may ask about two different values in one memo lifetime.
  // Escaping either value must not widen or narrow the other slot's constructor.
  for (const privateMap of [false, true]) for (const privateEscape of [false, true]) for (const reverse of [false, true]) {
    const escaped = privateEscape ? 'C.#owner' : 'C["#owner"]';
    const retained = privateEscape ? 'C["#owner"]' : 'C.#owner';
    const reads = [`hand(${ escaped });`, `${ retained }.groupBy;`];
    if (reverse) reads.reverse();
    const source = `class C { static #owner = ${ privateMap ? 'Map' : 'Object' };
      static ["#owner"] = ${ privateMap ? 'Object' : 'Map' };
      static read() { ${ reads.join(' ') } } } C.read();`;
    check(`${ parser.name }/distinct slot escapes/${ privateMap }/${ privateEscape }/${ reverse }`,
      census(parser, source).has('Map', true), privateMap === privateEscape);
  }
  for (const reverse of [false, true]) {
    const reads = ['hand(C.#owner);', 'hand(C["#owner"]);'];
    if (reverse) reads.reverse();
    const source = `class C { static #owner = Map; static ["#owner"] = Promise;
      static read() { ${ reads.join(' ') } } } C.read();`;
    const facts = census(parser, source);
    check(`${ parser.name }/both slot values escape/${ reverse }/Map`, facts.has('Map', true), true);
    check(`${ parser.name }/both slot values escape/${ reverse }/Promise`, facts.has('Promise', true), true);
  }
  for (const fields of [
    'static ["#owner"] = Map; static #owner = Object;',
    'static #owner = Object; static ["#owner"] = Map;',
  ]) for (const privateKey of [false, true]) {
    const program = parser.parseAndScope(`class C { ${ fields } }`);
    const value = findNamespaceMemberValue(program.node.body[0], '#owner', null, {},
      ({ node, computed }) => propertyKeyName({ key: node, computed }), { privateKey });
    check(`${ parser.name }/private key kind/${ fields }/${ privateKey }`, value?.name, privateKey ? 'Object' : 'Map');
  }
  for (const [name, field, tail, escaped] of [
    ['private', 'static #value = Inner;', '', false],
    ['private holder handed out', 'static #value = Inner;', 'hand(Outer);', false],
    ['public', 'static value = Inner;', '', true],
    ['public private spelling', 'static ["#value"] = Inner;', '', true],
    ['private then returned', 'static #value = Inner; static read() { return Outer.#value; }', '', true],
    ['private this returned', 'static #value = Inner; static read() { return this.#value; }', '', true],
    ['private shadowed this returned', 'static #value = Inner; static read(Outer) { return this.#value; }', '', true],
    ['private then handed out', 'static #value = Inner;', 'hand(Inner);', true],
  ]) {
    const program = parser.parseAndScope(`class Inner { static C = Map; } class Outer { ${ field } } ${ tail }`).node;
    const { writtenContainerSlots } = collectFileCensus(program, [mutationShapesReducer()]);
    const keys = writtenContainerSlots.keys().map(key => key.replace(/#\d+/u, '')).toArray();
    check(`${ parser.name }/private field publication/${ name }`, keys.includes('Inner.*'), escaped);
  }
  for (const [members, expected] of [
    ['static set P(value) {}', 'set'],
    ['static P() {} static set P(value) {}', 'set'],
    ['static get P() { return Map; } static P() {} static set P(value) {}', 'set'],
    ['static get P() { return Map; } static set P(value) {} static P() {}', 'method'],
    ['static P = Map; static P() {}', 'field'],
    ['static P() {} static P = Map;', 'field'],
    ['static {} static P = Map;', 'field'],
    ['static P = Map; static {}', 'unknown'],
    ['static P() {} static {}', 'unknown'],
    ['static P() {} static [key] = 1;', 'unknown'],
    ['static #P = Map;', 'absent'],
  ]) {
    const program = parser.parseAndScope(`class C { ${ members } }`);
    const slot = classStaticSlotMember(program.node.body[0], 'P');
    check(`${ parser.name }/slot/${ members }`, slot === undefined ? 'unknown' : slot === null ? 'absent' : slot.kind ?? 'field', expected);
    if (expected !== 'method') check(`${ parser.name }/callee/${ members }`, classStaticCallSlot(program.node.body[0], 'P')?.kind ?? null, null);
  }

  for (const [name, setup, read] of [
    ['loop', '', "for (const k of ['groupBy']) Map[k];"],
    ['object slot', "const { k } = { k: 'groupBy' };", 'Map[k];'],
    ['catch', '', "try { throw 'groupBy'; } catch (k) { Map[k]; }"],
    ['parameter', '', "function f(k, C) { return Map[k]; } f('groupBy', Set);"],
    ['conditional writes', "let k = 'groupBy'; if (flag) k = 'groupBy';", 'Map[k];'],
    ['conditional assignment', "let k; if (flag) k = 'groupBy';", 'Map[k];'],
    ['conditional initializer', "if (flag) var k = 'groupBy';", 'Map[k];'],
    ['deferred writer', "let k; function init() { k = 'groupBy'; } init();", 'Map[k];'],
    ['deep aliases', `const k0 = 'groupBy'; ${ Array.from({ length: 66 }, (_, i) => `const k${ i + 1 } = k${ i };`).join(' ') }`, 'Map[k66];'],
    ['deep array alias', `const k0 = 'groupBy'; ${ Array.from({ length: 66 }, (_, i) => `const k${ i + 1 } = k${ i };`).join(' ') } const [key] = [k66];`, 'Map[key];'],
  ]) {
    check(`${ parser.name }/key/${ name }`, census(parser, setup + read).has('Map', true), true);
  }

  for (const source of [
    "const k = String('trunc'); k in Math;",
    "const names = ['trunc']; names.every(k => k in Math);",
  ]) check(`${ parser.name }/unnamed/${ source }`, census(parser, source).readsUnnamedStatic('Math'), true);

  for (const source of [
    "for (const k of ['trunc']) Math[k](2.5);",
    "Math[['trunc'][0]](2.5);",
  ]) check(`${ parser.name }/finite native key/${ source }`, census(parser, source).readsUnnamedStatic('Math'), false);

  for (const source of [
    "for (const k of ['groupBy']) Map[k];",
    "let k; if (flag) k = 'groupBy'; Map[k];",
    "for (const k of ['groupBy']) k in Map;",
    "const { k } = { k: 'groupBy' }; k in Map;",
  ]) {
    const facts = census(parser, source);
    check(`${ parser.name }/finite global key/${ source }`, facts.has('Map'), false);
    check(`${ parser.name }/finite pure key/${ source }`, facts.has('Map', true), true);
    check(`${ parser.name }/finite named key/${ source }`, facts.readsUnnamedStatic('Map'), false);
  }

  for (const source of [
    "const k = 'Promise'; class Box { static Promise = Promise; static [k] = Object; } class C extends Box.Promise { static run() { return super.try(() => 1); } }",
    'class C { static P = Array; static [key] = Promise; } const { P: { resolve } } = C;',
  ]) check(`${ parser.name }/served class candidates/${ source }`, census(parser, source).has('Promise', true), false);

  for (const source of [
    'class C { static P = Array; static [key] = Promise; } C.P.resolve;',
    'class C { static P = Array; static [key] = Promise; static {} } const { P: { resolve } } = C;',
    'class C { static P = Array; static [key] = Promise; } const { P: { resolve = other } } = C;',
    'class C { static P = Array; static [key] = Promise; } const { P: { resolve, ...rest } } = C;',
    'class C { static P = Array; static [key] = Promise; } C.P = Promise; const { P: { resolve } } = C;',
  ]) check(`${ parser.name }/raw class candidates/${ source }`, census(parser, source).has('Promise', true), true);

  for (const reverse of [false, true]) {
    const reads = ["for (const key of ['groupBy']) key in C;", 'opaque in C;'];
    if (reverse) reads.reverse();
    const facts = census(parser, `const C = Map; ${ reads.join(' ') }`);
    check(`${ parser.name }/presence obligations/${ reverse }/global`, facts.has('Map'), true);
    check(`${ parser.name }/presence obligations/${ reverse }/pure`, facts.has('Map', true), true);
    check(`${ parser.name }/presence obligations/${ reverse }/unnamed`, facts.readsUnnamedStatic('Map'), true);
  }

  for (const store of [
    "Object.defineProperty(exports, 'P', { get() { return Promise; } });",
    "Reflect.defineProperty(exports, 'P', { get: () => Promise });",
    "const P = Promise; Object.defineProperty(exports, 'P', { enumerable: true, get: function () { return P; } });",
    'Object.defineProperties(exports, { P: { get() { return Promise; } } });',
    "Object.defineProperty(exports, 'P', { get() { if (flag) return Promise; return Map; } });",
  ]) check(`${ parser.name }/accessor/${ store }`, census(parser, store, 'script').has('Promise'), true);

  const head = 'function make() { return Map; } const m = make();';
  const member = 'm.groupBy([1], x => x);';
  const pattern = 'function f({ groupBy } = m) { return groupBy; }';
  for (const [name, source] of [['member first', member + pattern], ['pattern first', pattern + member]]) {
    check(`${ parser.name }/cache/${ name }`, census(parser, head + source).has('Map', true), true);
  }

  for (const source of [
    'class C { static {} static P = Promise; } C.P.try;',
    'class C { static P = Promise; static other() {} } C.P.try;',
    "const k = 'groupBy'; Map[k];",
    "let k; k = 'groupBy'; Map[k];",
  ]) check(`${ parser.name }/served/${ source }`, census(parser, source).has(source.includes('Promise') ? 'Promise' : 'Map', true), false);
}

for (const parser of adapters) for (const [name, source, held = true] of [
  ['computed pattern', "const k = 'w'; const { [k]: { groupBy } } = { w: Map };"],
  ['mutable key', "let k = 'w'; const { [k]: { groupBy } } = { w: Map };"],
  ['computed array index', 'const { [0]: { groupBy } } = [Map];'],
  ['numeric property', 'const { 1: { groupBy } } = { 1: Map };'],
  ['computed property', "const k = 'w'; const { w: { groupBy } } = { [k]: Map };"],
  ['computed numeric property', 'const { 1: { groupBy } } = { [1]: Map };'],
  ['unknown pattern key', 'function read(k) { const { [k]: { groupBy } } = { w: Map }; }'],
  ['unknown property key', 'function read(k) { const { w: { groupBy } } = { [k]: Map }; }'],
  ['unknown override', 'function read(k) { const { w: { groupBy } } = { w: {}, [k]: Map }; }'],
  ['getter', 'const { w: { groupBy } } = { get w() { return Map; } };'],
  ['getter and setter', 'const { w: { groupBy } } = { get w() { return Map; }, set w(value) {} };'],
  ['nested getter', 'const { w: { inner: { groupBy } } } = { get w() { return { inner: Map }; } };'],
  ['intrinsic property', 'const { 1: { name } } = { 1: Map };', false],
  ['different key', 'const { 2: { groupBy } } = { 1: Map, 2: {} };', false],
  ['setter alone', 'const { w: { groupBy } } = { set w(value) {} };', false],
  ['known data after getter', 'const { w: { groupBy } } = { get w() { return Map; }, w: {} };', false],
  ['getter after setter', 'const { w: { groupBy } } = { set w(value) {}, get w() { return Map; } };'],
  ['nested source aliases', 'const left = { w: Map }; const right = { w: Promise }; const { w: { groupBy } } = unknown ? left : right;'],
]) check(`${ parser.name }/literal read-back/${ name }`, census(parser, source).has('Map', true), held);

// Shared container branches must not repeat the same retained read-back along every path.
for (const parser of adapters) for (const host of ['declaration', 'assignment', 'parameter', 'array']) {
  const counts = [];
  for (const levels of [6, 12]) {
    const array = host === 'array';
    const lines = [array ? 'const W0 = [[1]], W1 = [[2]];' : 'const W0 = { a: [1] }, W1 = { a: [2] };'];
    for (let i = 0; i < levels; i++) {
      const branch = `flag${ i } ? W${ i + 1 } : W${ i }`;
      lines.push(`const W${ i + 2 } = ${ array ? `[${ branch }]` : `{ a: ${ branch } }` };`);
    }
    let pattern = '{ at }';
    for (let i = 0; i < levels; i++) pattern = array ? `[${ pattern }]` : `{ a: ${ pattern } }`;
    const source = `W${ levels + 1 }`;
    lines.push(host === 'parameter' ? `function read(${ pattern } = ${ source }) { return at; }`
      : host === 'assignment' ? `let at; (${ pattern } = ${ source });` : `const ${ pattern } = ${ source };`);
    const tree = parser.parseAndScope(lines.join('\n'));
    let reads = 0;
    for (const { node } of parser.collectPaths(tree, 'ConditionalExpression')) {
      const { consequent } = node;
      Object.defineProperty(node, 'consequent', {
        configurable: true,
        get() { reads++; return consequent; },
      });
    }
    collectFileCensus(tree.node, [escapedCtorReferencesReducer()]);
    check(`${ parser.name }/retained DAG/${ host }/${ levels }/counter live`, reads > 0, true);
    counts.push(reads);
  }
  check(`${ parser.name }/retained DAG/${ host }/bounded visits (${ counts })`, counts[1] <= counts[0] * 4, true);
}

finish();
