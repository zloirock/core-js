// Field families remain enumerable when their common Type cannot represent the union.
// Opaque writers still invalidate the entire set, including otherwise known alternatives.
import { adapters, createChecker } from './harness.mjs';

const { check, checkTruthy, runBoth, finish } = createChecker('field-union-hints');
const cases = [
  ['assigned field extraction', 'const box = { data: Math }; box.data = "x"; let data = Math; ({ data } = box); data.includes("x");', 'object,string'],
  ['assigned field default', 'const box = { data: Math }; box.data = "x"; let data; ({ data = foreign } = box); data.includes("x");', null],
  ['assigned initialized default', 'const box = { data: Math }; box.data = "x"; let data = Math; ({ data = foreign } = box); data.includes("x");', null],
  ['object function value', 'const box = { data: function () {} }; box.data = [1]; box.data.includes(1);', 'array,function'],
  ['instance function value', 'class Box { data = function () {}; } const box = new Box(); box.data = [1]; box.data.includes(1);', 'array,function'],
  ['static function value', 'class Box { static data = function () {}; } Box.data = [1]; Box.data.includes(1);', 'array,function'],
  [
    'constructor invokes static replacement',
    'class Box { static data = [1]; constructor() { new.target.change(); } } Box.change = foreign; new Box(); Box.data.includes(1);',
    null,
  ],
  ['installed string writer', 'class Box { static data() {} } Box.change = function () { this.data = "x"; }; Box.change(); Box.data.includes("x");', 'function,string'],
  ['installed escaping writer', 'class Box { static data() {} } Box.change = function () { sink(this); }; Box.change(); Box.data.includes("x");', null],
  ['installed unknown writer', 'class Box { static data() {} } Box.change = function () { this.data = foreign; }; Box.change(); Box.data.includes("x");', null],
  ['installed wildcard writer', 'class Box { static data() {} } Box.change = function () { this[key] = "x"; }; Box.change(); Box.data.includes("x");', null],
  ['known key other field', 'const box = { data: [1] }; const key = "other"; box[key] = foreign; box.data = "x"; box.data.includes("x");', 'array,string'],
  ['mutable key', 'const box = { data: [1] }; let key = "other"; key = foreign; box[key] = "x"; box.data.includes("x");', null],
  ['unknown selected alias', 'const box = { data: [1] }; const alias = flag ? box : {}; sink(alias); box.data.includes("x");', null],
  ['wrapped binding alias', 'const box = { data: [1] }; const alias = (0, (box as any)); alias.data = "x"; box.data.includes("x");', 'array,string'],
  ['binding writes', 'let data = [1]; if (flag) data = "x"; data.includes("x");', 'array,string'],
  ['object write', 'const box = { data: [1] }; box.data = "x"; box.data.includes("x");', 'array,string'],
  ['object init union', 'const box = { data: flag ? [1] : "x" }; box.data.includes("x");', 'array,string'],
  ['object RHS union', 'const box = { data: [1] }; box.data = flag ? [2] : "x"; box.data.includes("x");', 'array,string'],
  ['object logical RHS', 'const box = { data: [1] }; box.data = flag && "x"; box.data.includes("x");', null],
  ['object alias', 'const box = { data: [1] }; const alias = box; alias.data = "x"; box.data.includes("x");', 'array,string'],
  ['object pattern alias', 'const box = { data: [1] }; const [alias] = [box]; alias.data = "x"; box.data.includes("x");', 'array,string'],
  ['field value alias', 'const box = { data: [1] }; box.data = "x"; const value = box.data; value.includes("x");', 'array,string'],
  ['field value extraction', 'const box = { data: [1] }; box.data = "x"; const { data } = box; data.includes("x");', 'array,string'],
  ['nested value extraction', 'const box = { data: [1] }; box.data = "x"; const [{ data }] = [box]; data.includes("x");', 'array,string'],
  ['reassigned extraction', 'const box = { data: [1] }; box.data = "x"; let { data } = box; if (flag) data = foreign; data.includes("x");', null],
  ['defaulted extraction', 'const box = { data: flag ? [1] : "x" }; const { data = foreign } = box; data.includes("x");', null],
  ['field value write', 'const box = { data: [1] }; box.data = "x"; const other = { data: box.data }; other.data.includes("x");', 'array,string'],
  ['computed field', 'const box = { data: [1] }; box["data"] = "x"; box["data"].includes("x");', 'array,string'],
  ['numeric field', 'const box = { 0: [1] }; box[0] = "x"; box[0].includes("x");', 'array,string'],
  ['object this', 'const box = { data: [1], change() { this.data = "x"; }, read() { this.data.includes("x"); } }; box.read();', 'array,string'],
  ['nested literal', 'const wrap = { box: { data: flag ? [1] : "x" } }; wrap.box.data.includes("x");', 'array,string'],
  ['missing field', 'const box = {}; box.data = [1]; box.data = "x"; box.data.includes("x");', 'array,string'],
  ['nullable init', 'const box = { data: null }; box.data = flag ? [1] : "x"; box.data.includes("x");', 'array,string'],
  ['outside dispatch family', 'const box = { data: [1] }; box.data = new Map(); box.data.includes("x");', 'array'],
  ['iterator alternative', 'const box = { data: [1] }; box.data = Iterator.from([1]); box.data.includes(1);', 'array,iterator'],
  ['three families', 'const box = { data: [1] }; box.data = flag ? Iterator.from([1]) : "x"; box.data.includes(1);', 'array,iterator,string'],
  ['class instance', 'class Box { data = [1]; } const box = new Box(); box.data = "x"; box.data.includes("x");', 'array,string'],
  ['class this', 'class Box { data = [1]; change() { this.data = "x"; } read() { this.data.includes("x"); } } new Box().read();', 'array,string'],
  ['class static', 'class Box { static data = [1]; } Box.data = "x"; Box.data.includes("x");', 'array,string'],
  ['class static this', 'class Box { static data = [1]; static { this.data = "x"; } static read() { this.data.includes("x"); } } Box.read();', 'array,string'],
  ['class private', 'class Box { #data = [1]; change() { this.#data = "x"; } read() { this.#data.includes("x"); } } new Box().read();', 'array,string'],
  ['class private static', 'class Box { static #data = [1]; static { this.#data = "x"; } static read() { this.#data.includes("x"); } } Box.read();', 'array,string'],
  ['class initializer union', 'class Box { data = flag ? [1] : "x"; } const box = new Box(); box.data.includes("x");', 'array,string'],
  ['class write union', 'class Box { data = [1]; change() { this.data = flag ? [2] : "x"; } read() { this.data.includes("x"); } } new Box().read();', 'array,string'],
  ['subclass write', 'class Base { data = [1]; } class Box extends Base { change() { this.data = "x"; } } new Box().data.includes("x");', 'array,string'],
  ['function-valued data field', 'const box = { data: () => 1 }; box.data = "x"; box.data.includes("x");', 'function,string'],
  ['object method value', 'const box = { data() {} }; box.data = [1]; box.data.includes(1);', 'array,function'],
  ['object method alias write', 'const box = { data() {} }; const alias = box; alias.data = [1]; box.data.includes(1);', 'array,function'],
  ['object method this write', 'const box = { data() {}, change() { this.data = "x"; } }; box.change(); box.data.includes("x");', 'function,string'],
  ['class method value', 'class Box { data() {} } const box = new Box(); box.data = [1]; box.data.includes(1);', 'array,function'],
  ['class method prototype write', 'class Box { data() {} } Box.prototype.data = "x"; new Box().data.includes("x");', null],
  ['static method value', 'class Box { static data() {} } Box.data = [1]; Box.data.includes(1);', 'array,function'],
  ['inherited method value', 'class Base { data() {} } class Box extends Base {} const box = new Box(); box.data = [1]; box.data.includes(1);', 'array,function'],
  ['method value object/conditional', 'const flag = true; const box = { data() {} };const alias = flag ? box : {}; alias.data = [1]; box.data.includes(1);', 'array,function'],
  ['method value object/assign', 'const flag = true; const box = { data() {} };Object.assign(box, { data: [1] }); box.data.includes(1);', null],
  ['method value object/pattern', 'const flag = true; const box = { data() {} };({value:box.data}={value:[1]}); box.data.includes(1);', null],
  ['method value object/loop', 'const flag = true; const box = { data() {} };for(box.data of [[1]]){} box.data.includes(1);', null],
  ['method value object/dynamic', 'const flag = true; const box = { data() {} };const key = "data"; box[key] = [1]; box.data.includes(1);', 'array,function'],
  ['method value object/this', 'const flag = true; const box = { data() {} };box.change = function(){this.data=[1];}; box.change(); box.data.includes(1);', 'array,function'],
  [
    'method value class/conditional',
    'const flag = true; class Box { data() {} } const box = new Box();const alias = flag ? box : {}; alias.data = [1]; box.data.includes(1);',
    null,
  ],
  ['method value class/assign', 'const flag = true; class Box { data() {} } const box = new Box();Object.assign(box, { data: [1] }); box.data.includes(1);', null],
  ['method value class/pattern', 'const flag = true; class Box { data() {} } const box = new Box();({value:box.data}={value:[1]}); box.data.includes(1);', null],
  ['method value class/loop', 'const flag = true; class Box { data() {} } const box = new Box();for(box.data of [[1]]){} box.data.includes(1);', null],
  ['method value class/dynamic', 'const flag = true; class Box { data() {} } const box = new Box();const key = "data"; box[key] = [1]; box.data.includes(1);', 'array,function'],
  [
    'method value class/this',
    'const flag = true; class Box { data() {} } const box = new Box();box.change = function(){this.data=[1];}; box.change(); box.data.includes(1);',
    'array,function',
  ],
  [
    'method value static/conditional',
    'const flag = true; class Box { static data() {} } const box = Box;const alias = flag ? box : {}; alias.data = [1]; box.data.includes(1);',
    null,
  ],
  ['method value static/assign', 'const flag = true; class Box { static data() {} } const box = Box;Object.assign(box, { data: [1] }); box.data.includes(1);', null],
  ['method value static/pattern', 'const flag = true; class Box { static data() {} } const box = Box;({value:box.data}={value:[1]}); box.data.includes(1);', null],
  ['method value static/loop', 'const flag = true; class Box { static data() {} } const box = Box;for(box.data of [[1]]){} box.data.includes(1);', null],
  ['method value static/dynamic', 'const flag = true; class Box { static data() {} } const box = Box;const key = "data"; box[key] = [1]; box.data.includes(1);', 'array,function'],
  [
    'method value static/this',
    'const flag = true; class Box { static data() {} } const box = Box;box.change = function(){this.data=[1];}; box.change(); box.data.includes(1);',
    'array,function',
  ],
  ['open any field', 'class Box { data: any = [1]; } const box = new Box(); box.data = "x"; box.data.includes("x");', 'array,string'],
  ['open unknown field', 'class Box { data: unknown = [1]; } const box = new Box(); box.data = "x"; box.data.includes("x");', 'array,string'],
  ['unknown RHS', 'const box = { data: [1] }; box.data = foreign; box.data.includes("x");', null],
  ['unknown union arm', 'const box = { data: [1] }; box.data = flag ? "x" : foreign; box.data.includes("x");', null],
  ['unknown initializer', 'const box = { data: foreign }; box.data = "x"; box.data.includes("x");', null],
  ['dynamic write', 'const box = { data: [1] }; box[key] = "x"; box.data.includes("x");', null],
  ['escaped object', 'const box = { data: [1] }; sink(box); box.data = "x"; box.data.includes("x");', null],
  ['exported object', 'export const box = { data: [1] }; box.data = "x"; box.data.includes("x");', null],
  ['compound write', 'const box = { data: [1] }; box.data += "x"; box.data.includes("x");', null],
  ['pattern write', 'const box = { data: [1] }; ({ value: box.data } = source); box.data.includes("x");', null],
  ['cyclic fields', 'const box = { data: [1], other: "x" }; box.data = box.other; box.other = box.data; box.data.includes("x");', null],
  ['escaped class', 'export class Box { data = flag ? [1] : "x"; read() { this.data.includes("x"); } }', null],
  ['class wildcard', 'class Box { data = [1]; change() { this[key] = "x"; } read() { this.data.includes("x"); } } new Box().read();', null],
  ['callback carrier', 'const box = { data: [1] }; const [alias] = [box].map(value => value); alias.data = "x"; box.data.includes("x");', null],
];

// Dynamic JS writes intentionally cross initializer types; TS wrappers only exercise runtime erasure.
for (const [owner, setup] of [
  ['object', 'const box = { data: [1], change() {} };'],
  ['data only', 'const box = { data: [1] };'],
  ['instance', 'class Box { data = [1]; change() {} } const box = new Box();'],
  ['static', 'class Box { static data = [1]; static change() {} } const box = Box;'],
]) for (const slot of ['change', 'added']) for (const target of [`box.${ slot }`, `(box.${ slot })`, `box.${ slot }!`, `(box.${ slot } as any)`]) {
  for (const [writer, value, expected] of [
    ['known', 'function () { this.data = "x"; }', 'array,string'],
    ['escaping', 'function () { sink(this); }', null],
    ['nested', 'function () { this.other = function () { sink(this); }; this.other(); }', null],
    ['alias', 'fn', null],
    ['conditional', 'flag ? fn : fn', null],
    ['sequence', '(0, fn)', null],
    ['returned', 'make()', null],
  ]) cases.push([
    `installed ${ owner }/${ target }/${ writer }`,
    `function fn() { sink(this); } function make() { return fn; } ${ setup } ${ target } = ${ value }; box.${ slot }(); box.data.includes("x");`,
    expected,
  ]);
}

for (const [name, code, expected] of [
  ['uncalled opaque body', 'box.change = foreign;', 'array,string'],
  ['discarded holder', 'box.change = foreign; box;', 'array,string'],
  ['void holder', 'box.change = foreign; void box;', 'array,string'],
  ['truthiness of holder', 'box.change = foreign; if (box) {}', 'array,string'],
  ['identity of holder', 'box.change = foreign; box === box;', 'array,string'],
  ['type-only holder', 'box.change = foreign; type Held = typeof box;', 'array,string'],
  ['key observation', 'box.change = foreign; Object.keys(box);', 'array,string'],
  ['numeric coercion', 'box.valueOf = foreign; +box;', null],
  // eslint-disable-next-line no-template-curly-in-string -- scenario source, not interpolation here
  ['string coercion', 'box.toString = foreign; `${box}`;', null],
  ['property key coercion', 'box.toString = foreign; ({}[box]);', null],
  ['uncalled body with object pattern', 'box.change = foreign; const { data } = box;', 'array,string'],
  ['uncalled body with wrapped object pattern', 'box.change = foreign; const [{ data }] = [box];', 'array,string'],
  ['opaque body invoked through alias', 'const alias = box; box.change = foreign; alias.change();', null],
  ['opaque body installed through alias', 'const alias = box; alias.change = foreign; box.change();', null],
  ['deferred invocation before installation', 'function run() { box.change(); } box.change = foreign; run();', null],
  ['unknown key installation', 'box[key] = foreign;', null],
  ['opaque coercion body', 'box.toJSON = foreign; JSON.stringify(box);', null],
  ['non-callable alternatives', 'box.change = flag ? [] : {};', 'array,string'],
  ['non-callable sequence', 'box.change = (effect(), /x/);', 'array,string'],
]) cases.push([name, `const box = { data: [1] }; box.data = "x"; ${ code } box.data.includes("x");`, expected]);

for (const [name, code, expected] of cases) runBoth(
  name,
  code,
  (adapter, program, label) => {
    const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'includes');
    const resolver = adapter.makeResolver();
    const type = resolver.resolvePropertyObjectType(member);
    check(`${ label } common type`, type, null);
    const hints = resolver.resolvePropertyUnionHints(member);
    check(`${ label } families`, hints ? [...hints].sort().join(',') : null, expected);
    const repeated = resolver.resolvePropertyUnionHints(member);
    check(`${ label } repeated families`, repeated ? [...repeated].sort().join(',') : null, expected);
    const hintsFirst = adapter.makeResolver();
    const first = hintsFirst.resolvePropertyUnionHints(member);
    check(`${ label } hints first`, first ? [...first].sort().join(',') : null, expected);
    check(`${ label } type after hints`, hintsFirst.resolvePropertyObjectType(member), null);
  },
);

for (const [name, source, declaration] of [
  ['flat', 'const box = { data: [1] }; box.data = "x";', 'const { includes } = box.data;'],
  ['nested', 'const box = { data: [1] }; box.data = "x";', 'const { data: { includes } } = box;'],
  ['nested assignment', 'const box = { data: [1] }; box.data = "x";', 'let includes; ({ data: { includes } } = box);'],
  ['nested class', 'class Box { data = flag ? [1] : "x"; } const box = new Box();', 'const { data: { includes } } = box;'],
]) runBoth(
  `destructure ${ name }`,
  `${ source } ${ declaration }`,
  (adapter, program, label) => {
    const prop = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key?.name === 'includes');
    const resolver = adapter.makeResolver();
    check(`${ label } common type`, resolver.resolvePropertyObjectType(prop), null);
    const hints = resolver.resolvePropertyUnionHints(prop);
    check(`${ label } families`, hints ? [...hints].sort().join(',') : null, 'array,string');
  },
);

for (const pattern of ['{ data: { includes } = foreign }', '{ box: { data: { includes } } = foreign }']) {
  const init = pattern.startsWith('{ box') ? '{ box: { data: flag ? [1] : "x" } }' : '{ data: flag ? [1] : "x" }';
  runBoth(
    `containing default ${ pattern }`,
    `const source = ${ init }; const ${ pattern } = source;`,
    (adapter, program, label) => {
      const prop = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key?.name === 'includes');
      check(`${ label } unknown receiver alternative`, adapter.makeResolver().resolvePropertyUnionHints(prop), null);
    },
  );
}

for (const [name, code] of [
  ['inline', '({ data() {} }).data.flat();'],
  ['object carrier', 'const wrap = { box: { data() {} } }; wrap.box.data.flat();'],
  ['pattern carrier', 'const [{ data }] = [{ data() {} }]; data.flat();'],
]) runBoth(
  `unchanged carried method ${ name }`,
  code,
  (adapter, program, label) => {
    const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'flat');
    check(`${ label } function value`, adapter.makeResolver().resolvePropertyObjectType(member)?.constructor, 'Function');
  },
);

// Value reads and calls have different escape premises. Share one traversal's paths so
// rebuilding an oxc scope between picks cannot change binding identity under the resolver.
for (const [owner, setup, callType] of [
  ['object', 'const box = { data() { return [1]; } };', null],
  ['instance', 'class Box { data() { return [1]; } } const box = new Box();', 'Array'],
  ['static', 'class Box { static data() { return [1]; } } const box = Box;', 'Array'],
]) for (const callFirst of [false, true]) runBoth(
  `method cache ${ owner }/${ callFirst }`,
  `${ setup } const held = box.data; box.data();`,
  (adapter, program, label) => {
    const paths = adapter.collectPaths(program, 'MemberExpression');
    const value = paths.find(path => path.parentPath.node.type === 'VariableDeclarator');
    const call = paths.find(path => path.parentPath.node.type === 'CallExpression').parentPath;
    const resolver = adapter.makeResolver();
    const queries = callFirst ? [[call, callType], [value, 'Function']] : [[value, 'Function'], [call, callType]];
    for (let pass = 0; pass < 3; pass++) {
      if (pass === 2) resolver.reset();
      for (const [path, expected] of queries) {
        check(`${ label } pass ${ pass }/${ path.node.type }`, resolver.resolveNodeType(path)?.constructor ?? null, expected);
      }
    }
  },
);

for (const [name, code] of [
  ['parameter', 'function pick({ data } = { data: [1] }) { return data; } pick().includes(1);'],
  ['method parameter', 'const box = { pick({ data } = { data: [1] }) { return data; } }; box.pick().includes(1);'],
]) runBoth(
  `default return ${ name }`,
  code,
  (adapter, program, label) => {
    const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'includes');
    check(`${ label } family`, adapter.makeResolver().resolvePropertyObjectType(member)?.constructor, 'Array');
  },
);

// Count reads of writer RHS slots after parsing. Repeated hint and Type queries must reuse
// the same field fact rather than rescan all writes or re-enumerate their alternatives.
for (const adapter of adapters) for (const size of [16, 64]) {
  const writes = Array.from({ length: size }, (_, i) => `box.data = flag ? [${ i }] : "x";`).join('\n');
  const code = `const box = { data: [0] }; ${ writes } box.data.includes("x");`;
  const program = adapter.parseAndScope(code);
  let reads = 0;
  program.traverse({
    AssignmentExpression(path) {
      const { right } = path.node;
      Object.defineProperty(
        path.node,
        'right',
        { configurable: true, enumerable: true, get() { reads++; return right; } },
      );
    },
  });
  const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'includes');
  const resolver = adapter.makeResolver();
  const label = `${ adapter.name }/${ size } writers`;
  check(`${ label } common type`, resolver.resolvePropertyObjectType(member), null);
  check(`${ label } families`, [...resolver.resolvePropertyUnionHints(member) ?? []].sort().join(','), 'array,string');
  checkTruthy(`${ label } linear RHS work`, reads > 0 && reads <= size * 24, `${ reads } RHS reads`);
  const coldReads = reads;
  for (let i = 0; i < size; i++) {
    resolver.resolvePropertyObjectType(member);
    resolver.resolvePropertyUnionHints(member);
  }
  check(`${ label } cached RHS work`, reads - coldReads, 0);
}

finish();
