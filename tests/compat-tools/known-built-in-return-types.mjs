import { deepEqual, fail, ok, throws } from 'node:assert/strict';

import { buildReturnTypesArtifact, normalizeConstructors, normalizeHint } from '../../scripts/build-compat/normalize-return-types.mjs';
import { RESOLUTION_DIRECTIVES } from '../../packages/core-js-polyfill-provider/resolve-node-type/base.js';

const knownBuiltInReturnTypes = await fs.readJson('packages/core-js-compat/known-built-in-return-types.json');

const { hasOwn } = Object;

const VALID_TYPES = new Set([
  // primitives
  'bigint',
  'boolean',
  'number',
  'string',
  'symbol',
  'undefined',
  // object types
  'Arguments',
  'Array',
  'ArrayBuffer',
  'AsyncDisposableStack',
  'AsyncIterator',
  'BigInt',
  'Boolean',
  'DataView',
  'Date',
  'DisposableStack',
  'DOMException',
  'DOMTokenList',
  'Document',
  'DocumentFragment',
  'Element',
  'Error',
  'HTMLAllCollection',
  'HTMLCollection',
  'FinalizationRegistry',
  'Function',
  'Iterator',
  'Map',
  'Node',
  'NodeList',
  'Number',
  'Object',
  'Promise',
  'RegExp',
  'Set',
  'SharedArrayBuffer',
  'String',
  'Symbol',
  'TypedArray',
  'URL',
  'URLSearchParams',
  'WeakMap',
  'WeakRef',
  'WeakSet',
]);

// the resolution directives, ONE family: `inherit` names the receiver's own inner, the `argument`
// trio names the call's. a directive carries no inner of its own and may sit wherever a type name
// may - as the hint's `type` when it IS the answer, or as an inner when the answer contains it.
// the vocabulary is READ from the resolver that owns it, not restated: a gate carrying its own copy
// accepts a directive the resolver never heard of, the one drift direction nothing else catches
// FIRST, before a single assertion reads it: the file on disk is generated and gitignored, so it
// can be older than the source it came from - and every check below would then be describing a
// past version of the contract while reporting success. the writer only writes what this builder
// returns, so calling it here is the whole comparison
deepEqual(knownBuiltInReturnTypes, buildReturnTypesArtifact(),
  'the generated artifact is what the source builds - rebuild it with `npm run prepare`');

const directives = RESOLUTION_DIRECTIVES;
// the contract itself, locked: a directive added to the grammar with nothing here to place it, or
// dropped while the data still writes it, shows up as this row rather than as a silent answer
deepEqual({ ...directives }, {
  argument: 'call',
  'argument-element': 'call',
  'argument-return': 'call',
  inherit: 'receiver',
});

function isDirectiveName(name) {
  return typeof name === 'string' && hasOwn(directives, name);
}

function isValidHint(hint) {
  if (isDirectiveName(hint)) return true;
  // normalized hint: always { type, element?, resolved?, mutatesArgument?, mutatesElements?, nullable? }
  if (typeof hint !== 'object' || hint === null) return false;
  // a directive may be wrapped in object form to carry qualifiers (`{ type: 'inherit',
  // nullable: true }` - `find` / `at` / `pop` return element | undefined per spec);
  // a wrapped directive carries no inner hint of its own
  const isDirective = isDirectiveName(hint.type);
  if (isDirective && (hint.element !== undefined || hint.resolved !== undefined)) return false;
  if (!isDirective && !VALID_TYPES.has(hint.type)) return false;
  const validKeys = new Set(['type', 'element', 'resolved', 'mutatesArgument', 'mutatesElements', 'nullable']);
  for (const key of Object.keys(hint)) if (!validKeys.has(key)) return false;
  // nullable: the spec return admits undefined / null; only the `true` form is emitted
  if ('nullable' in hint && hint.nullable !== true) return false;
  // mutatesArgument: list of zero-based arg indices a method mutates in place
  // (e.g. Object.assign -> [0] target). only meaningful for staticMethods entries
  if ('mutatesArgument' in hint) {
    if (!Array.isArray(hint.mutatesArgument) || hint.mutatesArgument.length === 0) return false;
    for (const i of hint.mutatesArgument) {
      if (!Number.isInteger(i) || i < 0) return false;
    }
  }
  // mutatesElements: an instance method that writes the receiver's elements in place;
  // only the `true` form is emitted
  if ('mutatesElements' in hint && hint.mutatesElements !== true) return false;
  const innerHint = hint.element ?? hint.resolved ?? null;
  if (innerHint === null) return true;
  // an inner hint may be a union - a list of two or more member hints, each valid on its own
  // (`Reflect.ownKeys` -> string | symbol). unions are inner-only and do not nest: an entry's
  // own type is a single hint, and a member that is itself a list fails the member check
  const union = Array.isArray(innerHint);
  if (union && innerHint.length < 2) return false;
  return (union ? innerHint : [innerHint]).every(isValidHint);
}

// structural validation — every entry in every table has a valid shape
// a directive names the SIDE it reads, and the artifact ships that; the only thing the gate has to
// know is which lanes supply which side. In a lane that cannot supply it the directive resolves to
// nothing and leaves the bare container, and no one is told - so the tables below are the schema
// half that keeps the data from expressing what the decoder cannot act on.
// `call` is supplied where the resolver decodes with a call in hand - the two METHOD lanes.
// `receiver` is supplied where it decodes off an object: both instance lanes go through the one
// `resolveKnownInstanceMember`, which resolves the receiver before it picks the table
const LANES_SUPPLYING = {
  call: new Set(['staticMethods', 'instanceMethods']),
  receiver: new Set(['instanceMethods', 'instanceProperties']),
};

function directivesOf(hint, found = []) {
  if (typeof hint === 'string') {
    // a directive is what the VOCABULARY carries, and its side is data too: neither is a spelling
    // of the name, so a call-side directive named otherwise cannot slip past
    if (isDirectiveName(hint)) found.push(hint);
    return found;
  }
  if (!hint || typeof hint !== 'object') return found;
  if (Array.isArray(hint)) {
    for (const member of hint) directivesOf(member, found);
    return found;
  }
  directivesOf(hint.type, found);
  if (hint.element !== undefined) directivesOf(hint.element, found);
  if (hint.resolved !== undefined) directivesOf(hint.resolved, found);
  return found;
}

function checkLane(label, kind, hint) {
  for (const name of directivesOf(hint)) {
    const side = directives[name];
    if (!LANES_SUPPLYING[side].has(kind)) {
      fail(`${ label }: ${ side } directive '${ name }' sits in a lane decoded without a ${ side }`);
    }
  }
}

// each half of the rule, proven on the shape it forbids and on its control. without this the rule
// is only ever exercised by data that satisfies it, which cannot tell a live rule from a dead one
throws(() => checkLane('probe', 'staticMethods', { type: 'Array', element: 'inherit' }), /receiver directive 'inherit'/);
throws(() => checkLane('probe', 'globalMethods', { type: 'inherit' }), /receiver directive 'inherit'/);
throws(() => checkLane('probe', 'instanceProperties', { type: 'Promise', resolved: 'argument' }), /call directive 'argument'/);
throws(() => checkLane('probe', 'constructors', { type: 'Array', element: 'argument-element' }), /call directive 'argument-element'/);
checkLane('control', 'instanceMethods', { type: 'Array', element: 'inherit' });
checkLane('control', 'instanceProperties', { type: 'inherit', nullable: true });
checkLane('control', 'staticMethods', { type: 'Promise', resolved: 'argument' });
checkLane('control', 'constructors', { type: 'Array', element: { type: 'number' } });

function checkHint(label, kind, hint) {
  ok(isValidHint(hint), `${ label }: hint '${ JSON.stringify(hint) }' is valid`);
  checkLane(label, kind, hint);
}

for (const kind of ['globalMethods', 'globalProperties']) {
  ok(knownBuiltInReturnTypes[kind], `has ${ kind }`);
  for (const [name, hint] of Object.entries(knownBuiltInReturnTypes[kind])) {
    checkHint(`${ kind }.${ name }`, kind, hint);
  }
}

for (const kind of ['staticMethods', 'staticProperties', 'instanceMethods', 'instanceProperties', 'staticTypeGuards']) {
  ok(knownBuiltInReturnTypes[kind], `has ${ kind }`);
  for (const [className, members] of Object.entries(knownBuiltInReturnTypes[kind])) {
    for (const [member, hint] of Object.entries(members)) {
      checkHint(`${ kind }.${ className }.${ member }`, kind, hint);
    }
  }
}

// the loops above name the lanes they walk, so a lane ADDED to the data is simply not validated
// by anything - the quietest way for the contract to grow a hole. every top-level key of the
// artifact has to be claimed by a walk above or named here as a non-lane
deepEqual(Object.keys(knownBuiltInReturnTypes).sort(), [
  'constructors',
  'globalMethods',
  'globalProperties',
  'globalProxies',
  'instanceMethods',
  'instanceProperties',
  'namespaces',
  'staticMethods',
  'staticProperties',
  'staticTypeGuards',
], 'every lane of the artifact is walked, and every non-lane key is accounted for');

// spot-checks — one per distinct hint shape
// simple primitive / object
deepEqual(knownBuiltInReturnTypes.globalMethods.parseInt, { type: 'number' });
deepEqual(knownBuiltInReturnTypes.globalMethods.fetch, { type: 'Promise' });
deepEqual(knownBuiltInReturnTypes.globalProperties.undefined, { type: 'undefined' });
deepEqual(knownBuiltInReturnTypes.staticProperties.Symbol.iterator, { type: 'symbol' });
// element hint
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.keys, { type: 'Array', element: { type: 'string' } });
// union element hint - the members are normalized individually
deepEqual(knownBuiltInReturnTypes.staticMethods.Reflect.ownKeys, {
  type: 'Array',
  element: [{ type: 'string' }, { type: 'symbol' }],
});
// resolved hint carrying an ARGUMENT directive: what the call settles to lives in the call, not in
// the method, and `Promise.all` / `Array.fromAsync` say it with the SAME hint - which is the truth
// a name-keyed registry in the resolver used to hide
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.all,
  { type: 'Promise', resolved: { type: 'Array', element: 'argument-element' } });
deepEqual(knownBuiltInReturnTypes.staticMethods.Array.fromAsync,
  { type: 'Promise', resolved: { type: 'Array', element: 'argument-element' } });
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.resolve, { type: 'Promise', resolved: 'argument' });
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.race, { type: 'Promise', resolved: 'argument-element' });
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.try, { type: 'Promise', resolved: 'argument-return' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Promise.then, { type: 'Promise', resolved: 'argument-return' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.reduce, { type: 'Promise', resolved: 'argument-return' });
// the deliberate NON-directives: a rejection value is not a resolution, `catch` settles two
// different ways, and the settled wrappers are not the awaited elements
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.reject, { type: 'Promise' });
// the SOURCE side of the same contract. the gate above reads what the normalizer wrote, so it is
// blind by construction to anything the normalizer drops: a wrong qualifier used to vanish between
// the two and take its annotation with it. these lock the refusal at the writer
for (const [label, hint] of [
  ['a misspelled qualifier', { type: 'Object', mutatesArguments: [0] }],
  ['the retired returnsArgument', { type: 'Object', returnsArgument: 0 }],
]) {
  throws(() => normalizeHint(hint), /unknown hint key/, `${ label } is refused by the normalizer`);
}
deepEqual(normalizeHint({ type: 'Object', mutatesArgument: [0] }), { type: 'Object', mutatesArgument: [0] });
deepEqual(normalizeHint('argument'), 'argument');
deepEqual(normalizeHint({ type: 'Array', element: 'inherit' }), { type: 'Array', element: 'inherit' });
// the constructor table carries its own keys, and a wrong one there FLIPS rather than drops: with
// `call` missing the callee type falls back to `new`, so `Boolean` would answer the object, not the
// primitive
for (const [label, table] of [
  ['a wrong element slot', { Int8Array: { new: 'TypedArray', elements: 'number' } }],
  ['a wrong call slot', { Boolean: { new: 'Boolean', callType: 'boolean' } }],
]) {
  throws(() => normalizeConstructors(table), /unknown constructor key/, `${ label } is refused`);
}
deepEqual(normalizeConstructors({ Map: 'Map' }), { Map: { new: { type: 'Map' }, call: { type: 'Map' } } });
deepEqual(normalizeConstructors({ Object: { new: null, call: null } }),
  { Object: { new: { type: null }, call: { type: null } } });
deepEqual(normalizeConstructors({ Boolean: { new: 'Boolean', call: 'boolean' } }),
  { Boolean: { new: { type: 'Boolean' }, call: { type: 'boolean' } } });

// a name the vocabulary does not carry is a TYPE name, and an unknown one is rejected - this is
// what a gate holding its own copy of the list cannot say
ok(!isValidHint('argument-key'), 'a directive absent from the shipped vocabulary is not a hint');
ok(!isValidHint({ type: 'argument-key' }), 'nor is it accepted as a wrapped hint');
ok(isValidHint('argument'), 'control - a directive the vocabulary carries is a hint');
// `returnsArgument` said the identity statics a second way and is gone from the grammar: the
// normalizer refuses the key outright, so the schema must not keep accepting it either
ok(!isValidHint({ type: 'Object', returnsArgument: 0 }), 'the retired returnsArgument key is refused');
ok(isValidHint({ type: 'Object', mutatesArgument: [0] }), 'control - the live qualifier is accepted');

// every remaining rule of the shape check, each on the shape it exists to reject. a rule only ever
// run against data that satisfies it cannot be told apart from a rule that does nothing
for (const [label, hint] of [
  ['a hint that is not an object', 42],
  ['a null hint', null],
  ['a directive carrying an element of its own', { type: 'inherit', element: { type: 'string' } }],
  ['a directive carrying a resolved of its own', { type: 'argument', resolved: { type: 'string' } }],
  ['an unknown type name', { type: 'NotAType' }],
  ['nullable spelled false', { type: 'Object', nullable: false }],
  ['nullable spelled as anything else', { type: 'Object', nullable: 'yes' }],
  ['mutatesArgument that is not a list', { type: 'Object', mutatesArgument: 0 }],
  ['mutatesArgument empty', { type: 'Object', mutatesArgument: [] }],
  ['mutatesArgument with a negative index', { type: 'Object', mutatesArgument: [-1] }],
  ['mutatesArgument with a fractional index', { type: 'Object', mutatesArgument: [1.5] }],
  ['mutatesElements spelled false', { type: 'Array', mutatesElements: false }],
  ['a one-member union', { type: 'Array', element: [{ type: 'string' }] }],
  ['a union member that is itself a union', { type: 'Array', element: [[{ type: 'string' }], { type: 'symbol' }] }],
  ['an invalid inner', { type: 'Array', element: { type: 'NotAType' } }],
  // the artifact is NORMALIZED: every type name is wrapped, so a bare string in it can only be a
  // directive. this is the rule that says so
  ['a bare type name, which the normalizer never emits', 'Array'],
]) {
  ok(!isValidHint(hint), `${ label } is rejected`);
}
for (const [label, hint] of [
  ['nullable spelled true', { type: 'Object', nullable: true }],
  ['mutatesElements spelled true', { type: 'Array', mutatesElements: true }],
  ['a two-member union', { type: 'Array', element: [{ type: 'string' }, { type: 'symbol' }] }],
  ['a directive with a qualifier but no inner', { type: 'inherit', nullable: true }],
]) {
  ok(isValidHint(hint), `control - ${ label } is accepted`);
}

// the constructor shape has a validator of its own, and its three rules were never shown to reject
for (const [label, hint] of [
  ['a constructor hint that is not an object', 'Array'],
  ['a null constructor hint', null],
  ['an unknown constructor type name', { type: 'NotAType' }],
  ['a constructor key the shape does not take', { type: 'Array', resolved: { type: 'string' } }],
  ['an invalid element under a constructor', { type: 'Array', element: { type: 'NotAType' } }],
]) {
  ok(!isValidConstructorHint(hint), `${ label } is rejected`);
}
for (const [label, hint] of [
  ['a plain constructor hint', { type: 'Array' }],
  ['the null-typed constructor', { type: null }],
  ['a constructor with an element', { type: 'TypedArray', element: { type: 'number' } }],
]) {
  ok(isValidConstructorHint(hint), `control - ${ label } is accepted`);
}

// the identity statics say it with the SAME directive, in the slot that means "this IS the answer"
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.freeze, { type: 'argument' });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Promise.catch, { type: 'Promise' });
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.allSettled, { type: 'Promise', resolved: { type: 'Array' } });
// nullable 'inherit' directive (spec return is element | undefined); a bare top-level
// 'inherit' does not occur - every element-returning method admits undefined per spec
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.at, { type: 'inherit', nullable: true });
// nullable typed hint (spec return admits undefined / null)
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.getOwnPropertyDescriptor, { type: 'Object', nullable: true });
deepEqual(knownBuiltInReturnTypes.instanceProperties.Element.firstElementChild, { type: 'Element', nullable: true });
// 'inherit' directive
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.filter, { type: 'Array', element: 'inherit' });
// resolved 'inherit'
deepEqual(knownBuiltInReturnTypes.instanceMethods.Promise.finally, { type: 'Promise', resolved: 'inherit' });
// resolved nullable 'inherit' (AsyncIterator#find resolves to element | undefined)
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.find, { type: 'Promise', resolved: { type: 'inherit', nullable: true } });
// nested inherit
deepEqual(knownBuiltInReturnTypes.instanceMethods.Iterator.chunks, { type: 'Iterator', element: { type: 'Array', element: 'inherit' } });
// nested resolved
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.toArray, { type: 'Promise', resolved: { type: 'Array', element: 'inherit' } });
// deep nesting
deepEqual(knownBuiltInReturnTypes.instanceMethods.String.matchAll, { type: 'Iterator', element: { type: 'Array', element: { type: 'string' } } });
// instance property
deepEqual(knownBuiltInReturnTypes.instanceProperties.URL.searchParams, { type: 'URLSearchParams' });
// document.all is the ONE falsy object - the always-truthy logical fold keys on this exact type
deepEqual(knownBuiltInReturnTypes.instanceProperties.Document.all, { type: 'HTMLAllCollection' });
// type guard
deepEqual(knownBuiltInReturnTypes.staticTypeGuards.Array.isArray, { type: 'Array' });
deepEqual(knownBuiltInReturnTypes.staticTypeGuards.Number.isFinite, { type: 'number' });
// mutatesArgument annotation beside the `argument` directive: assign returns its target AND writes it
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.assign, { type: 'argument', mutatesArgument: [0] });
deepEqual(knownBuiltInReturnTypes.staticMethods.Reflect.set, { type: 'boolean', mutatesArgument: [0, 3] });
// mutatesElements annotation (in-place element mutators)
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.push, { type: 'number', mutatesElements: true });
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.sort, { type: 'Array', element: 'inherit', mutatesElements: true });
// splice mutates the receiver but returns the removed elements, so it inherits despite the flag
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.splice, { type: 'Array', element: 'inherit', mutatesElements: true });
deepEqual(knownBuiltInReturnTypes.instanceMethods.TypedArray.set, { type: 'undefined', mutatesElements: true });

// mutatesElements - the exact flagged sets. the element-retype bail derives its whitelist
// from these markers, so a silently dropped flag would turn a mutator into a "safe" method
function flaggedMutators(className) {
  return Object.entries(knownBuiltInReturnTypes.instanceMethods[className])
    .filter(([, hint]) => hint.mutatesElements).map(([name]) => name).sort();
}
deepEqual(flaggedMutators('Array'),
  ['copyWithin', 'fill', 'pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift']);
deepEqual(flaggedMutators('TypedArray'), ['copyWithin', 'fill', 'reverse', 'set', 'sort']);
for (const [className, members] of Object.entries(knownBuiltInReturnTypes.instanceMethods)) {
  if (className === 'Array' || className === 'TypedArray') continue;
  for (const [member, hint] of Object.entries(members)) {
    ok(!hint.mutatesElements, `instanceMethods.${ className }.${ member }: mutatesElements only applies to indexed receivers`);
  }
}
// Object.create is intentionally absent - its result type is indeterminate (proto-from-arg)
ok(!('create' in knownBuiltInReturnTypes.staticMethods.Object), 'Object.create has no return-type hint (indeterminate)');

// globalProxies
ok(Array.isArray(knownBuiltInReturnTypes.globalProxies), 'globalProxies is array');
for (const proxy of knownBuiltInReturnTypes.globalProxies) {
  ok(typeof proxy === 'string' && proxy, `globalProxy '${ proxy }' is non-empty string`);
}

// namespaces
ok(Array.isArray(knownBuiltInReturnTypes.namespaces), 'namespaces is array');
for (const ns of knownBuiltInReturnTypes.namespaces) {
  ok(typeof ns === 'string' && ns, `namespace '${ ns }' is non-empty string`);
  ok(!(ns in knownBuiltInReturnTypes.constructors), `namespace '${ ns }' is not also listed as a constructor`);
}

// constructors — structural validation
function isValidConstructorHint(hint) {
  if (typeof hint !== 'object' || hint === null) return false;
  if (hint.type !== null && !VALID_TYPES.has(hint.type)) return false;
  const validKeys = new Set(['type', 'element']);
  for (const key of Object.keys(hint)) if (!validKeys.has(key)) return false;
  if (hint.element !== undefined) return isValidHint(hint.element);
  return true;
}

const { constructors } = knownBuiltInReturnTypes;
ok(constructors, 'has constructors');
for (const [name, entry] of Object.entries(constructors)) {
  ok(isValidConstructorHint(entry.new), `constructor '${ name }.new': hint '${ JSON.stringify(entry.new) }' is valid`);
  ok(isValidConstructorHint(entry.call), `constructor '${ name }.call': hint '${ JSON.stringify(entry.call) }' is valid`);
  // this lane supplies NEITHER side - but its shape needed a validator of its own, so it sat
  // outside the loop that carries the rule. a directive in an element slot here would pass the
  // gate and then resolve to nothing
  for (const slot of ['new', 'call']) checkLane(`constructors.${ name }.${ slot }`, 'constructors', entry[slot]);
}
// fail-before for the rule above: the shapes it forbids are ones the schema otherwise accepts, and
// it sees BOTH sides - the call-side half was all it used to look for
ok(isValidConstructorHint({ type: 'Array', element: 'argument' }), 'the forbidden shape is structurally valid, so only the lane rule rejects it');
deepEqual(directivesOf({ type: 'Array', element: 'argument' }), ['argument']);
deepEqual(directivesOf({ type: 'Array', element: 'inherit' }), ['inherit']);
deepEqual(directivesOf({ type: 'Array', element: { type: 'string' } }), []);

// constructors — spot-checks: one per distinct constructor shape
// simple (new === call)
deepEqual(constructors.Array, { new: { type: 'Array' }, call: { type: 'Array' } });
// primitive wrapper (new: boxed object, call: primitive)
deepEqual(constructors.String, { new: { type: 'String' }, call: { type: 'string' } });
// null type
deepEqual(constructors.Object, { new: { type: null }, call: { type: null } });
// error mapping
deepEqual(constructors.AggregateError, { new: { type: 'Error' }, call: { type: 'Error' } });
// TypedArray with element
deepEqual(constructors.BigInt64Array, { new: { type: 'TypedArray', element: { type: 'bigint' } }, call: { type: 'TypedArray', element: { type: 'bigint' } } });
deepEqual(constructors.Float32Array, { new: { type: 'TypedArray', element: { type: 'number' } }, call: { type: 'TypedArray', element: { type: 'number' } } });
// readonly variant
deepEqual(constructors.ReadonlyArray, { new: { type: 'Array' }, call: { type: 'Array' } });

echo(chalk.green('known-built-in-return-types tested'));
