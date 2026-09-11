// Unit tests for the CALL-ARGUMENT axis of the holder-shape equivalence. handing an object to a call
// is the one position whose answer depends on the callee rather than the syntax, so the position
// suite next door can only cover it by example - this one walks the whole callee domain instead:
// every known static, at the slots a value can occupy, with the result discarded and held. the two
// walks must agree on each, and the set they call safe must be the set the slot table describes.
// probes share one file so the whole domain costs two transforms: the emitted helper NAME is
// file-global, but WHICH helper a given probe body uses is per-probe, and each probe owns its field
import { createRequire } from 'node:module';
import { createChecker } from './harness.mjs';
import plugin from '../../packages/core-js-babel-plugin/index.js';

// provider semantics, read through the emitters: no babel-version leg here, so the host's own
// resolution is the only one
const { transformAsync } = createRequire(import.meta.url)('@babel/core');
const knownReturnTypes = createRequire(import.meta.url)('@core-js/compat/known-built-in-return-types.json');

const { check, checkTruthy, finish } = createChecker('holder-call-slot-domain');

// a static that only INSPECTS the value at this slot: it reads keys, symbols, the prototype or a
// serialisation, none of which hands a method out to be re-bound. written from what the callees DO,
// so a slot table that grows an entry nobody can justify shows up here as a mismatch
const INSPECTS_SLOT_0 = new Set([
  'JSON.stringify',
  'Object.freeze',
  'Object.getOwnPropertyNames',
  'Object.getOwnPropertySymbols',
  'Object.getPrototypeOf',
  'Object.keys',
  'Object.preventExtensions',
  'Object.seal',
  'Reflect.getPrototypeOf',
  'Reflect.has',
  'Reflect.ownKeys',
]);
// the `setPrototypeOf` pair is deliberately absent. neither hands the value out, so the slot table
// keeps them - but they INSTALL a prototype, and the holder then owns inherited bodies nobody read.
// the shapes below hand them a dispatching second argument, so every row is an escape; installing a
// NON-dispatching value (`null`) is the case the fixtures next door lock
// the second slot is a value slot for only two of them - `JSON.stringify(v, replacer)` and
// `Reflect.has(target, key)` - everywhere else it means something the object cannot safely be
const INSPECTS_SLOT_1 = new Set(['JSON.stringify', 'Reflect.has']);
// callees that RETURN their argument alias it back out through the call's own value, so an inspected
// slot stops being enough once the result is held. `Reflect.setPrototypeOf` returns a boolean and
// `Reflect.getPrototypeOf` / `Object.getPrototypeOf` return the prototype, not the argument
const RETURNS_ITS_ARGUMENT = new Set([
  'Object.freeze',
  'Object.preventExtensions',
  'Object.seal',
  'Object.setPrototypeOf',
]);

const IDENTIFIER = /^[$a-z_][\w$]*$/i;
const STATICS = [];
for (const [constructor, methods] of Object.entries(knownReturnTypes.staticMethods)) {
  if (!IDENTIFIER.test(constructor)) continue;
  for (const method of Object.keys(methods)) {
    if (IDENTIFIER.test(method)) STATICS.push(`${ constructor }.${ method }`);
  }
}

// `at` is one of the two instance methods with both an array and a string pure variant, so the
// helper a probe body calls reports whether the field narrow survived that probe's call
function literalFor(index) {
  return `{ rows${ index }: [1, 2], read() { return this.rows${ index }.at(0); } }`;
}

const SHAPES = [
  ['slot 0, result discarded', (call, arg) => `${ call }(${ arg }, other);`, pair => INSPECTS_SLOT_0.has(pair)],
  ['slot 1, result discarded', (call, arg) => `${ call }(other, ${ arg });`, pair => INSPECTS_SLOT_1.has(pair)],
  // the second argument stays present so the shape differs from the first row in ONE thing - the
  // result being held. a callee whose verdict depends on that argument would otherwise answer a
  // different question here than it does above
  ['slot 0, result held', (call, arg) => `sink(${ call }(${ arg }, other));`,
    pair => INSPECTS_SLOT_0.has(pair) && !RETURNS_ITS_ARGUMENT.has(pair)],
];

function buildSource(shape, inline) {
  return STATICS.map((pair, index) => {
    const literal = literalFor(index);
    const declaration = inline ? '' : `const holder = ${ literal }; `;
    return `export function probe${ index }() { ${ declaration }${ shape(pair, inline ? literal : 'holder') } }`;
  }).join('\n');
}

async function verdicts(source) {
  const { code } = await transformAsync(source, {
    configFile: false,
    babelrc: false,
    filename: 'holders.mjs',
    sourceType: 'module',
    plugins: [[plugin, { method: 'usage-pure', version: '4.0', targets: { ie: 11 } }]],
  });
  const byIndex = new Map();
  for (const probe of code.matchAll(/function probe(?<index>\d+)\(\)\s*\{(?<body>[\S\s]*?)\n\}/g)) {
    const { body, index } = probe.groups;
    byIndex.set(Number(index), /_atMaybeArray/.test(body) ? 'local' : /_at\b/.test(body) ? 'escapes' : 'no-polyfill');
  }
  return byIndex;
}

checkTruthy('the static registry yields a callee domain', STATICS.length >= 150,
  `expected at least 150 known statics, found ${ STATICS.length }`);

for (const [label, shape, inspects] of SHAPES) {
  const named = await verdicts(buildSource(shape, false));
  const inline = await verdicts(buildSource(shape, true));
  // a probe whose body the matcher never found would silently pass every comparison below
  checkTruthy(`${ label }: every probe reports a verdict`,
    named.size === STATICS.length && inline.size === STATICS.length,
    `matched ${ named.size } named and ${ inline.size } inline probes of ${ STATICS.length }`);
  for (const [index, pair] of STATICS.entries()) {
    const expected = inspects(pair) ? 'local' : 'escapes';
    check(`${ pair } (${ label }, bound to a name)`, named.get(index), expected);
    check(`${ pair } (${ label }, written inline)`, inline.get(index), expected);
  }
}

// second walk over the same domain, with a holder that carries NO own-`this` methods. the rows above
// can never reach the layer below the method-safety check - a value carrying methods escapes there
// first - so the callees that expose it through the call's RESULT are only visible here. two ways
// that happens, and both are read off the callee rather than the syntax: the result IS the argument
// (`Object.freeze(v)`), or it is a container the argument was put into (`Array.of(v)`)
const RESULT_CARRIES_ARGUMENT = new Set([
  'Array.from',
  'Array.fromAsync',
  'Array.of',
  'AsyncIterator.from',
  'Iterator.concat',
  'Iterator.from',
  'Iterator.zip',
  'Iterator.zipKeyed',
  'Map.groupBy',
  'Object.entries',
  'Object.freeze',
  'Object.preventExtensions',
  'Object.seal',
  'Object.setPrototypeOf',
  'Object.values',
  'Promise.all',
  'Promise.allKeyed',
  'Promise.allSettled',
  'Promise.allSettledKeyed',
  'Promise.any',
  'Promise.race',
  'Promise.reject',
  'Promise.resolve',
  'Promise.try',
]);
// the container half of that set is deliberately coarse. `Array.of(v)` hands `v` itself back at
// index 0, while `Array.from(v)` / `Object.values(v)` / `Promise.all(v)` expose only what `v`
// CONTAINED - no write through them can retype a field of `v` itself. the registry describes the
// result's element type, not whether the arguments went into it, so the two are indistinguishable
// here and the coarse answer is the safe one: it widens where it need not, and widening only costs
// the generic polyfill
// callees that write through the slot itself never reached the retention question - the mutation
// profile answers first
const MUTATES_SLOT_0 = new Set([
  'Object.assign',
  'Object.defineProperties',
  'Object.defineProperty',
  'Reflect.defineProperty',
  'Reflect.deleteProperty',
  'Reflect.set',
]);

function buildRetentionSource() {
  return STATICS.map((pair, index) => `export function probe${ index }() { `
    + `const holder = { rows${ index }: [1, 2] }; `
    + `sink(${ pair }(holder, other)); `
    + `return holder.rows${ index }.at(0); }`).join('\n');
}

const retention = await verdicts(buildRetentionSource());
checkTruthy('no own-`this` holder: every probe reports a verdict', retention.size === STATICS.length,
  `matched ${ retention.size } probes of ${ STATICS.length }`);
for (const [index, pair] of STATICS.entries()) {
  const expected = RESULT_CARRIES_ARGUMENT.has(pair) || MUTATES_SLOT_0.has(pair) ? 'escapes' : 'local';
  check(`${ pair } (no own-\`this\` holder, slot 0, result held)`, retention.get(index), expected);
}

finish();
