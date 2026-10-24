// Unit tests for the CALL-ARGUMENT axis of the holder-shape equivalence. handing an object to a call
// is the one position whose answer depends on the callee rather than the syntax, so the position
// suite next door can only cover it by example - this one walks the whole callee domain instead:
// every known static, at the slots a value can occupy, with the result discarded and held. the two
// walks must agree on each, and the set they call safe must be the set the registry's argument
// qualifiers describe. probes share one file so each shape of the domain costs one transform: the
// emitted helper NAME is file-global, but WHICH helper a given probe body uses is per-probe, and each
// probe owns its field
import { createRequire } from 'node:module';
import { createChecker } from './harness.mjs';
import plugin from '../../packages/core-js-babel-plugin/index.js';

// provider semantics, read through the emitters: no babel-version leg here, so the host's own
// resolution is the only one
const { transformAsync } = createRequire(import.meta.url)('@babel/core');
const knownReturnTypes = createRequire(import.meta.url)('@core-js/compat/known-built-in-return-types.json');

const { check, checkTruthy, finish } = createChecker('holder-call-slot-domain');

// what each static does with the values it is handed, written from the callees' own behaviour rather
// than read off the registry, so a registry row that claims too little or too much shows up here as a
// mismatch. a static that writes an argument puts the members of its other arguments on the one it
// writes (`Object.assign` copies a source's methods onto its target), so none of its slots keeps a
// method; each of these writes its first argument
const WRITES_AN_ARGUMENT = new Set([
  'Object.assign',
  'Object.defineProperties',
  'Object.defineProperty',
  'Reflect.defineProperty',
  'Reflect.deleteProperty',
  'Reflect.set',
]);
const TYPED_ARRAYS = [
  'BigInt64Array',
  'BigUint64Array',
  'Float16Array',
  'Float32Array',
  'Float64Array',
  'Int8Array',
  'Int16Array',
  'Int32Array',
  'Uint8Array',
  'Uint8ClampedArray',
  'Uint16Array',
  'Uint32Array',
];
// per slot, the statics that hand the value there on whatever it carries: into another argument
// (`Reflect.set` stores its value), as an installed prototype (`setPrototypeOf`), as a callback's
// `this` (the thisArg of `Array.from` and the typed-array `from`s), as a callback's own argument
// (`Promise.try(fn, ...args)`), or in a result made of the value's members (a descriptor read, an
// object built from entries or groups). a callback that sees values only through the call's own work
// - a `JSON.stringify` replacer, a map function, a `groupBy` callback - is an accepted boundary, so
// those slots stay put
const HANDS_ON = [
  new Set([
    'Object.fromEntries',
    'Object.getOwnPropertyDescriptor',
    'Object.getOwnPropertyDescriptors',
    'Object.groupBy',
    'Reflect.getOwnPropertyDescriptor',
  ]),
  new Set(['Object.setPrototypeOf', 'Promise.try', 'Reflect.setPrototypeOf']),
  new Set(['Array.from', 'Array.fromAsync', 'Promise.try', 'Reflect.set', ...TYPED_ARRAYS.map(name => `${ name }.from`)]),
];
// the `setPrototypeOf` pair also INSTALLS a prototype on its first argument, and the holder then owns
// inherited bodies nobody read. the shapes below hand them a dispatching second argument, so every
// slot-0 row of theirs is an escape; installing a NON-dispatching value (`null`) is the case the
// fixtures next door lock
const INSTALLS_A_PROTOTYPE = new Set(['Object.setPrototypeOf', 'Reflect.setPrototypeOf']);
// callees whose RESULT carries the argument, so a held result re-exposes it: the result IS the
// argument (`Object.freeze(v)`), or it is a container the argument was put into (`Array.of(v)`)
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

// does a method of the holder leave through this slot?
function methodsLeave(pair, slot) {
  return WRITES_AN_ARGUMENT.has(pair) || HANDS_ON[slot].has(pair);
}

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

// the slot-0 rows keep the second argument, so the two differ in ONE thing - the result being held.
// a callee whose verdict depends on that argument would otherwise answer a different question in each
const SHAPES = [
  [
    'slot 0, result discarded',
    (call, arg) => `${ call }(${ arg }, other);`,
    pair => !methodsLeave(pair, 0) && !INSTALLS_A_PROTOTYPE.has(pair),
  ],
  ['slot 1, result discarded', (call, arg) => `${ call }(other, ${ arg });`, pair => !methodsLeave(pair, 1)],
  ['slot 2, result discarded', (call, arg) => `${ call }(other, other, ${ arg });`, pair => !methodsLeave(pair, 2)],
  [
    'slot 0, result held',
    (call, arg) => `sink(${ call }(${ arg }, other));`,
    pair => !methodsLeave(pair, 0) && !INSTALLS_A_PROTOTYPE.has(pair) && !RESULT_CARRIES_ARGUMENT.has(pair),
  ],
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

for (const [label, shape, staysLocal] of SHAPES) {
  const named = await verdicts(buildSource(shape, false));
  const inline = await verdicts(buildSource(shape, true));
  // a probe whose body the matcher never found would silently pass every comparison below
  checkTruthy(`${ label }: every probe reports a verdict`,
    named.size === STATICS.length && inline.size === STATICS.length,
    `matched ${ named.size } named and ${ inline.size } inline probes of ${ STATICS.length }`);
  for (const [index, pair] of STATICS.entries()) {
    const expected = staysLocal(pair) ? 'local' : 'escapes';
    check(`${ pair } (${ label }, bound to a name)`, named.get(index), expected);
    check(`${ pair } (${ label }, written inline)`, inline.get(index), expected);
  }
}

// second walk over the same domain, with a holder that carries NO own-`this` methods. the rows above
// can never reach the layer below the method-safety check - a value carrying methods escapes there
// first - so what only this layer decides is visible here alone: a write nobody sees is all that can
// retype the holder's field, so the slots a static writes or hands on, and a held result carrying the
// argument, let it go. the other arguments of a writing static receive copies of its values, never
// the holder itself
const PLAIN_SHAPES = [
  [
    'slot 0, result discarded',
    pair => `${ pair }(holder, other);`,
    pair => WRITES_AN_ARGUMENT.has(pair) || HANDS_ON[0].has(pair),
  ],
  [
    'slot 0, result held',
    pair => `sink(${ pair }(holder, other));`,
    pair => WRITES_AN_ARGUMENT.has(pair) || HANDS_ON[0].has(pair) || RESULT_CARRIES_ARGUMENT.has(pair),
  ],
  ['slot 1, result discarded', pair => `${ pair }(other, holder);`, pair => HANDS_ON[1].has(pair)],
  ['slot 2, result discarded', pair => `${ pair }(other, other, holder);`, pair => HANDS_ON[2].has(pair)],
];

function buildPlainSource(shape) {
  return STATICS.map((pair, index) => `export function probe${ index }() { `
    + `const holder = { rows${ index }: [1, 2] }; `
    + `${ shape(pair) } `
    + `return holder.rows${ index }.at(0); }`).join('\n');
}

for (const [label, shape, escapes] of PLAIN_SHAPES) {
  const observed = await verdicts(buildPlainSource(shape));
  checkTruthy(`no own-\`this\` holder, ${ label }: every probe reports a verdict`, observed.size === STATICS.length,
    `matched ${ observed.size } probes of ${ STATICS.length }`);
  for (const [index, pair] of STATICS.entries()) {
    check(`${ pair } (no own-\`this\` holder, ${ label })`, observed.get(index), escapes(pair) ? 'escapes' : 'local');
  }
}

// A local parameter reader has the same boundary for named and inline holders. Reading a
// data field preserves the holder; returning a method or introducing another body channel does not.
for (const [label, declaration, call, expected] of [
  ['declaration', 'function pick(o) { return o.rows0; }', 'pick(ARG)', 'local'],
  ['directive', 'function pick(o) { "use strict"; return o.rows0; }', 'pick(ARG)', 'local'],
  ['arrow', 'const pick = o => o.rows0;', 'pick(ARG)', 'local'],
  ['alias', 'const read = o => o.rows0; const pick = read;', 'pick(ARG)', 'local'],
  ['slot one', 'function pick(unused, o) { return o.rows0; }', 'pick(other, ARG)', 'local'],
  ['optional', 'const pick = o => o?.rows0;', 'pick?.((ARG))', 'local'],
  ['invoker', 'function pick(o) { return o.rows0; }', 'pick.call(null, ARG)', 'local'],
  ['write', 'function pick(o) { o.rows0 = "ab"; return o.rows0; }', 'pick(ARG)', 'escapes'],
  ['delete', 'function pick(o) { delete o.rows0; return o.rows0; }', 'pick(ARG)', 'escapes'],
  ['alias write', 'function pick(o) { const alias = o; alias.rows0 = "ab"; return o.rows0; }', 'pick(ARG)', 'escapes'],
  ['handout', 'function pick(o) { mutate(o); return o.rows0; }', 'pick(ARG)', 'escapes'],
  ['arguments', 'function pick(o) { arguments[0].rows0 = "ab"; return o.rows0; }', 'pick(ARG)', 'escapes'],
  ['parameter default', 'function pick(o, second = mutate(o)) { return o.rows0; }', 'pick(ARG)', 'escapes'],
  ['held method', 'function pick(o) { return o.read; }', 'sink(pick(ARG))', 'escapes'],
  ['returned argument', 'function pick(o) { return o; }', 'sink(pick(ARG))', 'escapes'],
  ['callback', 'function pick(o) { return () => o.rows0; }', 'sink(pick(ARG))', 'escapes'],
  ['unknown key', 'function pick(o) { return o[key]; }', 'sink(pick(ARG))', 'escapes'],
  ['replaced callee', 'function pick(o) { return o.rows0; } pick = external;', 'pick(ARG)', 'escapes'],
  ['async', 'async function pick(o) { return o.rows0; }', 'pick(ARG)', 'escapes'],
  ['generator', 'function* pick(o) { return o.rows0; }', 'pick(ARG)', 'escapes'],
  ['construction', 'function pick(o) { return o.rows0; }', 'new pick(ARG)', 'escapes'],
]) for (const inline of [false, true]) {
  const literal = literalFor(0);
  const declarationOfHolder = inline ? '' : `const holder = ${ literal };`;
  const source = `${ declaration }\nexport function probe0() {
    ${ declarationOfHolder } ${ call.replace('ARG', inline ? literal : 'holder') };
  }`;
  const observed = await verdicts(source);
  check(`${ label }/${ inline ? 'inline' : 'named' }`, observed.get(0), expected);
}

// A class prototype exposes its constructor even without methods; a superclass exposes statics.
// Method summaries and aliases must not bypass the class binding's separate escape boundary.
for (const key of ['prototype', '__proto__']) for (const [label, methods] of [
  ['no methods', ''],
  ['instance method', 'data = 0; read() { return this.data; }'],
  ['static method', 'static data = 0; static read() { return this.data; }'],
]) for (const alias of [false, true]) {
  const source = `function pick(o) { return o.${ key }; }
    export function probe0() {
      ${ key === '__proto__' ? 'class Base { static rows0 = [1, 2]; }' : '' }
      class Holder ${ key === '__proto__' ? 'extends Base' : '' } {
        ${ key === 'prototype' ? 'static rows0 = [1, 2];' : '' } ${ methods }
      }
      ${ alias ? 'const Alias = Holder;' : '' }
      const held = pick(${ alias ? 'Alias' : 'Holder' });
      held.${ key === 'prototype' ? 'constructor.' : '' }rows0 = "ab";
      return Holder.rows0.at(0);
    }`;
  const observed = await verdicts(source);
  check(`class ${ key }/${ label }/${ alias ? 'alias' : 'direct' }`, observed.get(0), 'escapes');
}

finish();
