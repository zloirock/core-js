// The registry's hand-out claims checked against behaviour. A static listed without `exposesArgument` at a
// slot is taken to hand the value there to nothing but itself, and the escape analysis narrows on that
// claim. Each static is called with a holder at slots 0-2 and fillers elsewhere - a fresh object, a
// recording callback, an iterable, a key, the holder's own method key - and a holder that becomes
// reachable from another argument, through the callback or through a result its type does not show must
// be a hand-out the model accounts for. Both the engine's implementations and core-js's are checked
import { deepEqual } from 'node:assert/strict';
import { createContext, polyfilledRealm, runInContext } from './core-js-realm.mjs';
import { directivesOf } from '../../packages/core-js-polyfill-provider/resolve-node-type/base.js';

const { staticMethods } = await fs.readJson('packages/core-js-compat/known-built-in-return-types.json');

// the rest of the model, restated from the analysis: a container result carries what it holds, a writing
// call puts its other arguments' members on the one it writes, a call running its argument-0 callback
// passes it the other arguments, and a value reaching a callback only through the call's own work is an
// accepted boundary. of those callbacks only a `JSON.stringify` replacer reaches the holder itself, as
// `this`: a map or `groupBy` callback receives its elements, and a rejection reason rides in the result
const HOLDING_RESULTS = new Set(['Array', 'AsyncIterator', 'Iterator', 'Map', 'Promise', 'Set', 'WeakMap', 'WeakSet']);
const PRIMITIVE_TYPES = new Set(['bigint', 'boolean', 'null', 'number', 'string', 'symbol', 'undefined']);
const IMPLICIT_CALLBACK_SLOTS = new Set(['JSON.stringify[0]']);
// flagged hand-outs the probe cannot run: they need the holder to be iterable, and a holder made iterable
// runs its own iterator body on the spread, which the analysis already counts
const NEEDS_ITERABLE_HOLDER = new Set(['Object.fromEntries[0]', 'Object.groupBy[0]']);

// does the result hold what the call was handed - a container whose element is not pinned to primitives?
function resultHoldsArgument(hint) {
  if (!HOLDING_RESULTS.has(hint?.type)) return false;
  const inner = hint.element ?? hint.resolved ?? null;
  return inner === null || (Array.isArray(inner) ? inner : [inner]).some(member => !PRIMITIVE_TYPES.has(member?.type ?? member));
}

// is a hand-out at this slot one the model accounts for?
function modelled(slotName, hint, slot) {
  return (hint.exposesArgument ?? []).includes(slot) || !!hint.mutatesArgument
    || (slot > 0 && directivesOf(hint).includes('argument-return')) || IMPLICIT_CALLBACK_SLOTS.has(slotName);
}

// is the holder, or its method, reachable from this value - itself, its prototype, a property value or an
// accessor of it, two levels deep?
function reaches(value, holder, depth = 0) {
  if (value === holder || value === holder.m) return true;
  if (depth > 2 || value === null || (typeof value != 'object' && typeof value != 'function')) return false;
  if (Object.getPrototypeOf(value) === holder) return true;
  return Reflect.ownKeys(value).some(key => {
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor.get === holder.m || descriptor.set === holder.m
      || ('value' in descriptor && reaches(descriptor.value, holder, depth + 1));
  });
}

const PROBE = `(function (owner, method, slot, first, second) {
  var seen = [];
  var holder = { v: 1, m: function () { return this.v; } };
  var fillers = [
    function () { return {}; },
    function () { return function recorder() { seen.push(this); seen.push.apply(seen, arguments); return 1; }; },
    function () { return [1]; },
    function () { return 'k'; },
    function () { return 'm'; },
  ];
  var picks = [first, second];
  var args = [];
  for (var i = 0, p = 0; i < 3; i++) args.push(i === slot ? holder : fillers[picks[p++]]());
  var result;
  // a hand-out made before the call throws is still made: the callback ran with the holder
  try { result = globalThis[owner][method].apply(globalThis[owner], args); } catch (error) { /* observed below */ }
  return { holder: holder, args: args, seen: seen, result: result };
})`;

// the slots at which one static was seen handing the holder on - the holder at each of the first three,
// every pair of fillers beside it
async function staticHandOuts({ probe, RealmPromise, owner, method, hint }) {
  const slots = new Set();
  for (let slot = 0; slot < 3; slot++) for (let first = 0; first < 5; first++) for (let second = 0; second < 5; second++) {
    const { args, holder, result, seen } = probe(owner, method, slot, first, second);
    if (result instanceof RealmPromise) {
      // an async static runs its callback later, and a rejection left unhandled would surface in the realm
      try {
        await result;
      } catch {
        // settled either way
      }
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (args.some((arg, index) => index !== slot && reaches(arg, holder)) || seen.some(value => reaches(value, holder))
      || (result !== holder && !resultHoldsArgument(hint) && reaches(result, holder))) slots.add(slot);
  }
  return slots;
}

// the slots, by name, at which the statics this realm has were seen handing the holder on
async function observedHandOuts(realm) {
  const probe = runInContext(PROBE, realm);
  const RealmPromise = runInContext('Promise', realm);
  const observed = new Set();
  const present = new Set();
  for (const [owner, methods] of Object.entries(staticMethods)) for (const [method, hint] of Object.entries(methods)) {
    if (runInContext(`typeof globalThis.${ owner }?.${ method }`, realm) !== 'function') continue;
    present.add(`${ owner }.${ method }`);
    for (const slot of await staticHandOuts({ probe, RealmPromise, owner, method, hint })) observed.add(`${ owner }.${ method }[${ slot }]`);
  }
  return { observed, present };
}

for (const [label, realm] of [['native', createContext()], ['core-js', polyfilledRealm()]]) {
  const { observed, present } = await observedHandOuts(realm);
  const unmodelled = [...observed].filter(slotName => {
    const { owner, method, slot } = slotName.match(/^(?<owner>\w+)\.(?<method>\w+)\[(?<slot>\d)\]$/).groups;
    return !modelled(slotName, staticMethods[owner][method], Number(slot));
  });
  deepEqual(unmodelled, [], `${ label }: every hand-out the statics perform is one the model accounts for`);
  // the control: the probe has to see the hand-outs the data flags itself, or an empty list above reads as nothing
  const flagged = Object.entries(staticMethods).flatMap(([owner, methods]) => Object.entries(methods)
    .flatMap(([method, hint]) => (hint.exposesArgument ?? []).map(slot => `${ owner }.${ method }[${ slot }]`)))
    .filter(slotName => present.has(slotName.replace(/\[\d\]$/, '')) && !NEEDS_ITERABLE_HOLDER.has(slotName));
  deepEqual(flagged.filter(slotName => !observed.has(slotName)), [], `${ label }: every flagged hand-out is observed`);
}

echo(chalk.green('exposed arguments tested'));
