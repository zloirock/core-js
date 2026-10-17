// A prototype install names the family its object dispatches. A selection the build leaves open
// installs through whichever arm runs: where every arm is a setter or a setter's owner it installs with
// the call, and where an arm is neither it may not run, so the object keeps its own family beside it - a
// literal, whose own family is no hint, keeps the full dispatch.
// A binding whose initializer is typed is read for installs only in a file that spells an install's
// member key - the gate the emitters feed from their census, open where no census is wired - and only
// by a read the install may run before, from an arm the build may take, while it stands in the tree
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, runBoth, finish } = createChecker('prototype-install-receivers');

function read(code) {
  return `${ code } target.at(0);`;
}

const closedGate = { spellsMemberKey: () => false };
const protoKeyOnly = { spellsMemberKey: key => key === '__proto__' };

// [name, source, constructor the receiver resolves to, families its hints name where it resolves to none,
// options]: hints are read only off an untyped receiver, so a typed row asserts its type alone
const cases = [
  ['open owner selection', 'const target = {}; (c ? Object : Reflect).setPrototypeOf(target, Array.prototype);', null, 'array'],
  ['open owner selection, other arm order', 'const target = {}; (c ? Reflect : Object).setPrototypeOf(target, Array.prototype);', null, 'array'],
  ['nested open owner selection', 'const target = {}; (c ? Object : d ? Reflect : Object).setPrototypeOf(target, Array.prototype);', null, 'array'],
  ['owner selection held by a name', 'const O = c ? Object : Reflect; const target = {}; O.setPrototypeOf(target, Array.prototype);', null, 'array'],
  ['owner arm held by a name', 'const O = c ? Object : Reflect; const target = {}; (d ? O : Object).setPrototypeOf(target, Array.prototype);', null, 'array'],
  ['owner arm through an alias', 'const R = Reflect; const target = {}; (c ? Object : R).setPrototypeOf(target, Array.prototype);', null, 'array'],
  ['owner arm through the realm', 'const target = {}; (c ? globalThis.Object : Reflect).setPrototypeOf(target, Array.prototype);', null, 'array'],
  ['open setter selection', 'const target = {}; (c ? Object.setPrototypeOf : Reflect.setPrototypeOf)(target, String.prototype);', null, 'string'],
  ['setter selection held by a name', 'const sp = c ? Object.setPrototypeOf : Reflect.setPrototypeOf; const target = {}; sp(target, String.prototype);', null, 'string'],
  [
    'nested open setter selection',
    'const target = {}; (c ? Object.setPrototypeOf : d ? Reflect.setPrototypeOf : Object.setPrototypeOf)(target, Array.prototype);',
    null,
    'array',
  ],
  ['an owner arm owns no setter', 'const target = {}; (c ? Object : Map).setPrototypeOf(target, Array.prototype);', null, null],
  ['an unknown owner arm', 'const target = {}; (c ? Object : shim).setPrototypeOf(target, Array.prototype);', null, null],
  ['a shadowed owner arm', 'function f(Reflect) { const target = {}; (c ? Object : Reflect).setPrototypeOf(target, Array.prototype); target.at(0); }', null, null],
  ['a setter arm installs nothing', 'const target = {}; (c ? Object.setPrototypeOf : Object.assign)(target, Array.prototype);', null, null],
  ['an arm installs nothing beside a typed initializer', 'const O = c ? Object : shim; const target = [1]; O.setPrototypeOf(target, String.prototype);', null, 'array,string'],
  ['no arm is a setter', 'const target = {}; (c ? shim : Map).setPrototypeOf(target, Array.prototype);', 'Object', null],
  ['constructed instance', 'const target = new Map(); Object.setPrototypeOf(target, Array.prototype);', null, 'array'],
  ['constructed instance, proto write', 'const target = new Map(); target.__proto__ = Array.prototype;', null, 'array'],
  ['array literal', 'const target = [1]; Reflect.setPrototypeOf(target, String.prototype);', null, 'string'],
  ['typed call result', 'const target = Array.from(source); Object.setPrototypeOf(target, String.prototype);', null, 'string'],
  ['class instance', 'class Box {} const target = new Box(); Object.setPrototypeOf(target, Array.prototype);', null, 'array'],
  ['an install on another binding', 'const target = new Map(); Object.setPrototypeOf(other, Array.prototype);', 'Map', null],
  ['a primitive initializer', "const target = 'ab'; Object.setPrototypeOf(target, Array.prototype);", 'string', null],
  ['a creation argument is no install on the binding', 'const target = Object.create(null);', 'Object', null],
  ['closed gate', 'const target = new Map(); Object.setPrototypeOf(target, Array.prototype);', 'Map', null, closedGate],
  ['gate open on the proto key', 'const target = new Map(); target.__proto__ = Array.prototype;', null, 'array', protoKeyOnly],
  ['a literal past a closed gate', 'const target = {}; Object.setPrototypeOf(target, Array.prototype);', null, 'array', closedGate],
  // the read's position: an install it runs ahead of in the same frame leaves the initializer's family,
  // and one it may come either side of - a closure, a loop, a condition - reaches it beside that family
  ['a read before the install', 'const target = [1]; target.at(0); Object.setPrototypeOf(target, String.prototype);', 'Array', null],
  [
    'a read in a closure before the install',
    'const target = [1]; const f = () => target.at(0); Object.setPrototypeOf(target, String.prototype);',
    null,
    'array,string',
  ],
  [
    'a read a loop runs past the install',
    'const target = [1]; for (const x of xs) { target.at(0); Object.setPrototypeOf(target, String.prototype); }',
    null,
    'array,string',
  ],
  ['a read past an install that may not run', 'const target = [1]; if (flag) Object.setPrototypeOf(target, String.prototype);', null, 'array,string'],
];

for (const [name, source, constructor, families, options] of cases) runBoth(name, source.includes('target.at(0)') ? source : read(source), (adapter, program, label) => {
  const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
  const resolver = adapter.makeResolver(options);
  const type = resolver.resolvePropertyObjectType(member);
  check(`${ label } type`, type ? type.constructor ?? type.type : null, constructor);
  if (constructor !== null) return;
  const hints = resolver.resolvePropertyUnionHints(member);
  check(`${ label } families`, hints ? [...hints].sort().join(',') : null, families);
});

// an install in an arm the build never takes never runs, under an `if` or an `&&` alike, while one in
// the arm it always takes does. the build guarantees every entry here, so the presence tests decide
for (const [name, source, constructor, families] of [
  ['an if arm the build never takes', "const target = [1]; if (typeof Symbol == 'undefined') Object.setPrototypeOf(target, String.prototype);", 'Array', null],
  ['an && arm the build never takes', "const target = [1]; typeof Symbol == 'undefined' && (target.__proto__ = String.prototype);", 'Array', null],
  ['an if arm the build always takes', "const target = [1]; if (typeof Symbol != 'undefined') Object.setPrototypeOf(target, String.prototype);", null, 'string'],
  [
    'a nested owner arm the build never takes',
    "const target = {}; (c ? shim : typeof Symbol == 'undefined' ? Reflect : other).setPrototypeOf(target, Array.prototype);",
    'Object',
    null,
  ],
]) runBoth(`decided ${ name }`, read(source), (adapter, program, label) => {
  const member = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
  const decision = (adapter.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', isEntryAvailable: () => true });
  const resolver = adapter.makeResolver({ getDecisionAdapter: () => decision });
  const type = resolver.resolvePropertyObjectType(member);
  check(`${ label } type`, type ? type.constructor ?? type.type : null, constructor);
  if (constructor !== null) return;
  const hints = resolver.resolvePropertyUnionHints(member);
  check(`${ label } families`, hints ? [...hints].sort().join(',') : null, families);
});

// an install a render takes out of the tree after one read typed the receiver is not read by a later
// one: the answer remembered for the binding is checked against the tree on every ask
runBoth('an install the tree lost after an earlier read', 'const target = {}; (c ? Object : Reflect).setPrototypeOf(target, Array.prototype); target.at(0); target.findLast(f);',
  (adapter, program, label) => {
    const resolver = adapter.makeResolver();
    const early = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
    const before = resolver.resolvePropertyUnionHints(early);
    check(`${ label } before`, before ? [...before].sort().join(',') : null, 'array');
    adapter.pickPath(program, 'ExpressionStatement', path => path.node.expression?.callee?.property?.name === 'setPrototypeOf').remove();
    const late = adapter.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'findLast');
    const type = resolver.resolvePropertyObjectType(late);
    check(`${ label } after`, type ? type.constructor ?? type.type : null, 'Object');
  });

// A local setter may write its first argument's prototype through an alias. Its live body
// supplies a possible install, but its second argument proves no installed family.
for (const method of ['usage-pure', 'usage-global']) for (const [name, setup, body] of [
  ['literal target', 'const target = { length: 2, 0: 4, 1: 3 };', 'object.__proto__ = proto;'],
  ['typed target', 'const target = new String("43");', 'object.__proto__ = proto;'],
  ['aliased target write', 'const target = {};', 'const held = object; held.__proto__ = proto;'],
  ['invoked nested writer', 'const target = {};', 'function writer() { object.__proto__ = proto; } writer();'],
]) runBoth(`selected prototype writer/${ method }/${ name }`,
  `(flag => { ${ setup }
    const setter = flag ? (object, proto) => { ${ body } } : Object.setPrototypeOf;
    setter(target, Array.prototype); target.at(0);
  })(true);`, (parser, program, label) => {
    const member = parser.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
    const decision = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method, isEntryAvailable: () => true, resolveConstantSelection: (...args) => resolver.resolveConstantSelection(...args),
    });
    const resolver = parser.makeResolver({ getDecisionAdapter: () => decision });
    const type = resolver.resolvePropertyObjectType(member);
    check(`${ label }/type`, type ? type.constructor ?? type.type : null, null);
    const hints = resolver.resolvePropertyUnionHints(member);
    check(`${ label }/no family from the discarded setter`, hints ? [...hints].sort().join(',') : null, null);
  });

for (const method of ['usage-pure', 'usage-global']) for (const [name, callee] of [
  ['direct arrow', '(object, proto) => { object.__proto__ = proto; }'],
  ['direct function', 'function (object, proto) { object.__proto__ = proto; }'],
]) runBoth(`direct prototype writer/${ method }/${ name }`,
  `const target = {}; (${ callee })(target, Array.prototype); target.at(0);`, (parser, program, label) => {
    const member = parser.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
    const decision = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method, isEntryAvailable: () => true, resolveConstantSelection: (...args) => resolver.resolveConstantSelection(...args),
    });
    const resolver = parser.makeResolver({ getDecisionAdapter: () => decision });
    const type = resolver.resolvePropertyObjectType(member);
    check(`${ label }/type`, type ? type.constructor ?? type.type : null, null);
    const hints = resolver.resolvePropertyUnionHints(member);
    check(`${ label }/no argument-derived family`, hints ? [...hints].sort().join(',') : null, null);
  });

for (const method of ['usage-pure', 'usage-global']) for (const [name, callee] of [
  ['selected no-op', 'flag ? (object, proto) => {} : Object.setPrototypeOf'],
  ['direct no-op', '(object, proto) => {}'],
  ['literal-dead write', 'flag ? (object, proto) => { if (false) object.__proto__ = proto; } : Object.setPrototypeOf'],
  ['binding-dead write', 'flag ? (object, proto) => { const run = 0; if (run) object.__proto__ = proto; } : Object.setPrototypeOf'],
  ['presence-dead write', "flag ? (object, proto) => { if (typeof Symbol == 'undefined') object.__proto__ = proto; } : Object.setPrototypeOf"],
  ['unused nested writer', 'flag ? (object, proto) => { function unused() { object.__proto__ = proto; } } : Object.setPrototypeOf'],
  ['unused retained writer', 'flag ? (object, proto) => { const unused = () => { object.__proto__ = proto; }; } : Object.setPrototypeOf'],
  ['discarded nested writer', 'flag ? (object, proto) => { (() => { object.__proto__ = proto; }); } : Object.setPrototypeOf'],
  ['dead presence setter', "typeof Symbol == 'undefined' ? Object.setPrototypeOf : (object, proto) => {}"],
]) runBoth(`a non-installing selected body/${ method }/${ name }`,
  `(flag => { const target = {}; (${ callee })(target, Array.prototype); target.at(0); })(true);`, (parser, program, label) => {
    const member = parser.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
    const decision = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method, isEntryAvailable: () => true, resolveConstantSelection: (...args) => resolver.resolveConstantSelection(...args),
    });
    const resolver = parser.makeResolver({ getDecisionAdapter: () => decision });
    const type = resolver.resolvePropertyObjectType(member);
    check(`${ label }/keeps its own type`, type ? type.constructor ?? type.type : null, 'Object');
  });

// Opening the callee selection cannot supply a family its actual writer never promised.
// A native setter beside a proven no-op still contributes its ordinary conditional install.
for (const method of ['usage-pure', 'usage-global']) for (const [name, callee, prototype, families] of [
  ['open writer', 'flag ? Object.setPrototypeOf : (object, proto) => { object.__proto__ = String.prototype; }', 'Array.prototype', null],
  ['reverse open writer', 'flag ? (object, proto) => { object.__proto__ = String.prototype; } : Object.setPrototypeOf', 'Array.prototype', null],
  ['nested open writer', 'flag ? Object.setPrototypeOf : other ? (object, proto) => { object.__proto__ = String.prototype; } : Reflect.setPrototypeOf', 'Array.prototype', null],
  ['open no-op', 'flag ? Object.setPrototypeOf : (object, proto) => {}', 'String.prototype', 'array,string'],
]) runBoth(`open prototype writer/${ method }/${ name }`,
  `(flag => { const target = [4, 3]; (${ callee })(target, ${ prototype }); target.at(0); })(input);`, (parser, program, label) => {
    const member = parser.pickPath(program, 'MemberExpression', path => path.node.property?.name === 'at');
    const decision = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method, isEntryAvailable: () => true, resolveConstantSelection: (...args) => resolver.resolveConstantSelection(...args),
    });
    const resolver = parser.makeResolver({ getDecisionAdapter: () => decision });
    const type = resolver.resolvePropertyObjectType(member);
    check(`${ label }/type`, type ? type.constructor ?? type.type : null, null);
    const hints = resolver.resolvePropertyUnionHints(member);
    check(`${ label }/families`, hints ? [...hints].sort().join(',') : null, families);
  });

finish();
