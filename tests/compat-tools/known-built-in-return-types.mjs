import { deepEqual, fail, ok } from 'node:assert/strict';

const knownBuiltInReturnTypes = await fs.readJson('packages/core-js-compat/known-built-in-return-types.json');

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

// the resolution directives. `element` / `inherit` name the RECEIVER's own inner; the `argument`
// trio names the CALL's - arg 0 itself, the awaited common of its elements, the return of the
// callback it holds. both families are directives rather than types and carry no inner of their own
const RESOLUTION_DIRECTIVES = new Set(['element', 'inherit', 'argument', 'argument-element', 'argument-return']);

function isValidHint(hint) {
  if (RESOLUTION_DIRECTIVES.has(hint)) return true;
  // normalized hint: always { type, element?, resolved?, mutatesArgument?, returnsArgument?, nullable? }
  if (typeof hint !== 'object' || hint === null) return false;
  // a directive may be wrapped in object form to carry qualifiers (`{ type: 'element',
  // nullable: true }` - `find` / `at` / `pop` return element | undefined per spec);
  // a wrapped directive carries no inner hint of its own
  const isDirective = hint.type === 'element' || hint.type === 'inherit';
  if (isDirective && (hint.element !== undefined || hint.resolved !== undefined)) return false;
  if (!isDirective && !VALID_TYPES.has(hint.type)) return false;
  const validKeys = new Set(['type', 'element', 'resolved', 'mutatesArgument', 'returnsArgument', 'mutatesElements', 'nullable']);
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
  // returnsArgument: zero-based index of the single argument a method returns unchanged
  // (e.g. Object.freeze -> 0). a scalar index, not a list - a method returns one value
  if ('returnsArgument' in hint && (!Number.isInteger(hint.returnsArgument) || hint.returnsArgument < 0)) return false;
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
// an ARGUMENT directive answers off the CALL, so it is meaningful only where the resolver decodes
// the hint with a call in hand - the static- and instance-METHOD lanes. Everywhere else (properties,
// constructors, the global-method lane, which decodes without one) it would resolve to nothing and
// leave the bare container, and no one would be told. the tables say which lanes those are, so the
// check belongs here rather than in a comment: this is the schema half that keeps the data from
// expressing what the decoder cannot act on
const CALL_AWARE_KINDS = new Set(['staticMethods', 'instanceMethods']);

function argumentDirectivesOf(hint, found = []) {
  if (typeof hint === 'string') {
    if (hint.startsWith('argument')) found.push(hint);
    return found;
  }
  if (!hint || typeof hint !== 'object') return found;
  if (Array.isArray(hint)) {
    for (const member of hint) argumentDirectivesOf(member, found);
    return found;
  }
  argumentDirectivesOf(hint.type, found);
  if (hint.element !== undefined) argumentDirectivesOf(hint.element, found);
  if (hint.resolved !== undefined) argumentDirectivesOf(hint.resolved, found);
  return found;
}

function checkHint(label, kind, hint) {
  ok(isValidHint(hint), `${ label }: hint '${ JSON.stringify(hint) }' is valid`);
  const directives = argumentDirectivesOf(hint);
  if (directives.length && !CALL_AWARE_KINDS.has(kind)) {
    fail(`${ label }: argument directive '${ directives[0] }' sits in a lane decoded without a call`);
  }
  // `type` is the container the call produces; a directive names its INNER, never the container
  const outerType = typeof hint === 'string' ? hint : hint?.type;
  if (typeof outerType === 'string' && outerType.startsWith('argument')) {
    fail(`${ label }: argument directive '${ outerType }' used as the container type`);
  }
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
deepEqual(knownBuiltInReturnTypes.instanceMethods.Promise.catch, { type: 'Promise' });
deepEqual(knownBuiltInReturnTypes.staticMethods.Promise.allSettled, { type: 'Promise', resolved: { type: 'Array' } });
// nullable 'element' directive (spec return is element | undefined); bare top-level
// 'element' no longer occurs - every element-returning method admits undefined per spec
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.at, { type: 'element', nullable: true });
// nullable typed hint (spec return admits undefined / null)
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.getOwnPropertyDescriptor, { type: 'Object', nullable: true });
deepEqual(knownBuiltInReturnTypes.instanceProperties.Element.firstElementChild, { type: 'Element', nullable: true });
// 'inherit' directive
deepEqual(knownBuiltInReturnTypes.instanceMethods.Array.filter, { type: 'Array', element: 'inherit' });
// resolved 'inherit'
deepEqual(knownBuiltInReturnTypes.instanceMethods.Promise.finally, { type: 'Promise', resolved: 'inherit' });
// resolved nullable 'element' (AsyncIterator#find resolves to element | undefined)
deepEqual(knownBuiltInReturnTypes.instanceMethods.AsyncIterator.find, { type: 'Promise', resolved: { type: 'element', nullable: true } });
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
// mutatesArgument annotation (+ returnsArgument: assign returns its target, arg 0)
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.assign, { type: 'Object', mutatesArgument: [0], returnsArgument: 0 });
deepEqual(knownBuiltInReturnTypes.staticMethods.Reflect.set, { type: 'boolean', mutatesArgument: [0, 3] });
// returnsArgument-only annotation (identity-returning static)
deepEqual(knownBuiltInReturnTypes.staticMethods.Object.freeze, { type: 'Object', returnsArgument: 0 });
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
}

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
