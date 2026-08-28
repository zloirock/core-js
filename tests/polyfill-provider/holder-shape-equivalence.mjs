// Unit tests for the escape analysis' HOLDER-SHAPE equivalence. the same object literal reaches the
// resolver through two independent walks: one that starts from the NAME it was bound to and
// classifies every reference, and one that starts from the literal itself and climbs the positions
// it flows through. both answer the same question - can anything outside reach this object and write
// its fields - so a literal written inline must be classified exactly like the one bound to a name
// first. the two walks drifted apart position by position, each drift a silent narrow the fixture
// corpus never covered, so the property is checked over an enumerated position domain rather than by
// outcome. the expected verdict is written down per position too: equality alone would still pass if
// both walks went wrong together
import { createRequire } from 'node:module';
import { createChecker } from './harness.mjs';
import plugin from '../../packages/core-js-babel-plugin/index.js';

// provider semantics, read through the emitters: no babel-version leg here, so the host's own
// resolution is the only one
const { transformAsync } = createRequire(import.meta.url)('@babel/core');

const { check, finish } = createChecker('holder-shape-equivalence');

// `at` and `includes` are the only instance methods carrying both an array and a string pure
// variant, so the emitted helper NAME is what reports the resolved family: the array-specific
// helper means the field narrow survived, the bare one means the receiver widened
export const LITERAL = '{ rows: [1, 2], read() { return this.rows.at(0); } }';

// `local` - nothing in this position can reach the object, so the field narrow stands.
// `escapes` - the position hands a reference (or a copy of the own properties) to code this scan
// cannot see, so the narrow has to go. `@` marks where the object goes.
// a row may instead give `{ named, inline }` - the two walks answering differently is normally the
// bug this suite exists to catch, so every such row has to say why the difference is REAL
export const POSITIONS = [
  // hand-out positions: the value leaves the module or reaches an unknown consumer
  ['return', 'function f() { return @; }', 'escapes'],
  ['arrow-body', 'const f = () => (@);', 'escapes'],
  ['yield', 'function * g() { yield @; }', 'escapes'],
  ['await', 'async function f() { await @; }', 'escapes'],
  ['throw', 'function f() { throw @; }', 'escapes'],
  ['export-default', 'export default @;', 'escapes'],
  ['array-element', 'const a = [@]; sink(a);', 'escapes'],
  ['array-nested', 'const a = [[@]]; sink(a);', 'escapes'],
  ['object-property', 'const w = { k: @ }; sink(w);', 'escapes'],
  ['object-computed-key-value', 'const w = { [key]: @ }; sink(w);', 'escapes'],
  ['class-field-init', 'class K { slot = @; }\nsink(K);', 'escapes'],
  ['class-private-field-init', 'class K { #slot = @; peek() { return this.#slot; } }\nsink(K);', 'escapes'],
  ['conditional', 'const held = cond ? @ : other; sink(held);', 'escapes'],
  ['conditional-alternate', 'const held = cond ? other : @; sink(held);', 'escapes'],
  ['logical', 'const held = other || @; sink(held);', 'escapes'],
  ['logical-left', 'const held = @ || other; sink(held);', 'escapes'],
  ['sequence', 'const held = (log(), @); sink(held);', 'escapes'],
  ['param-default', 'function f(p = @) { return p; }\nsink(f);', 'escapes'],
  ['destructure-default', 'const { miss = @ } = src; sink(miss);', 'escapes'],
  // the ONE position where the walks legitimately part. an object written INLINE here is reachable
  // only through the default's holder, which the anonymous walk follows; a NAMED object keeps its own
  // binding as well, so the holder is an extra channel over it and the named walk reports the
  // default-value reference as the escaping read it is
  ['param-default-consumed', 'function f(p = @) { return typeof p; }\nsink(f);', { named: 'escapes', inline: 'local' }],
  ['param-default-pattern-target', 'function f({ a } = @) { return typeof a; }\nsink(f);', 'escapes'],
  ['jsx-attribute', 'const el = <Tag prop={@} />;\nsink(el);', 'escapes'],
  ['jsx-child', 'const el = <Tag>{@}</Tag>;\nsink(el);', 'escapes'],
  ['jsx-spread-child', 'const el = <Tag>{...@}</Tag>;\nsink(el);', 'escapes'],
  ['spread-jsx', 'const el = <Tag {...@} />;\nsink(el);', 'escapes'],
  // an OBJECT spread copies the own properties - method shorthands included - into a container the
  // scan cannot follow; a CALL spread hands the iterated values to an unknown callee
  ['spread-object', 'const w = { ...@ }; sink(w);', 'escapes'],
  ['spread-call', 'sink(...@);', 'escapes'],
  // a member STORE puts the object on a holder whose own reachability is unknown
  ['assign-member', 'target.slot = @;', 'escapes'],
  // a held read of an own-this METHOD hands out a function whose `this` rebinds at its call
  ['member-read-method', 'sink((@).read);', 'escapes'],
  // call positions: only a known callee at a slot that merely inspects the value keeps it local
  ['call-arg-unknown', 'sink(@);', 'escapes'],
  ['optional-call-arg', 'sink?.(@);', 'escapes'],
  ['dynamic-import-options', 'import(spec, @);', 'escapes'],
  ['call-arg-copying', 'Object.assign(target, @);', 'escapes'],
  ['new-arg', 'new Wrapper(@);', 'escapes'],
  ['call-arg-safe-slot', 'Object.keys(@);', 'local'],
  // a TAGGED template hands the raw value to the tag; an untagged one only string-coerces it
  /* eslint-disable no-template-curly-in-string -- the substitution IS the position under test */
  ['tagged-template', 'const s = tag`${ @ }`; sink(s);', 'escapes'],
  ['template', 'const s = `${ @ }`; sink(s);', 'local'],
  /* eslint-enable no-template-curly-in-string -- back to normal for the rest of the table */
  // consuming positions: evaluated, then unreachable
  ['expression-statement', '(@);', 'local'],
  ['for-head', 'for (@;;) break;', 'local'],
  ['for-in-right', 'for (const k in @) sink(k);', 'local'],
  ['seq-discarded', '(@, 0);', 'local'],
  ['void', 'void (@);', 'local'],
  ['typeof', 'sink(typeof @);', 'local'],
  // operator positions read a fact ABOUT the value without handing it anywhere
  ['comparison', 'sink((@) === other);', 'local'],
  ['in-operator', 'sink("rows" in @);', 'local'],
  // `instanceof` is not a plain fact-read: it invokes `Wrapper[Symbol.hasInstance](holder)`, and an
  // unknown right-hand side receives the object as an argument
  ['instanceof-left', 'sink((@) instanceof Wrapper);', 'escapes'],
  ['switch-discriminant', 'switch (@) { default: break; }', 'local'],
  ['switch-case-test', 'switch (k) { case @: break; }', 'local'],
  ['update-expression', 'let h = @; h++;', 'local'],
  ['if-test', 'if (@) sink(1);', 'local'],
  ['while-test', 'while (@) break;', 'local'],
  // iterating positions call the object's OWN iterator, which a literal can only declare through a
  // computed key - with none declared the iteration throws before it can bind anything out
  ['spread-array', 'const a = [...@]; sink(a);', 'local'],
  ['for-of-right-direct', 'for (const el of @) sink(el);', 'local'],
  // the object as an ELEMENT of the iterated array is a different question: iteration hands the
  // element to the loop variable, and that binding is what carries it out
  ['for-of-element', 'for (const el of [@]) sink(el);', 'escapes'],
  ['for-await-right', 'async function f() { for await (const el of @) sink(el); }', 'local'],
  // reads of the object's own DATA members yield the field value, not the object
  ['member-read', 'sink((@).rows);', 'local'],
  // standing in the CALLEE slot is a read of the value, not a hand-out: calling a plain object
  // throws before anything receives it. a computed KEY slot coerces it to a string
  ['callee', '(@)();', 'local'],
  ['new-callee', 'new (@)();', 'local'],
  ['computed-key', 'sink(target[@]);', 'local'],
  // the object standing IN a computed key is coerced to a string ("[object Object]"), so the
  // container keeps nothing of it - unlike the value slot right next to it
  ['object-key-slot', 'const w = { [@]: 1 }; sink(w);', 'local'],
  ['optional-member', 'sink((@)?.rows);', 'local'],
  ['member-call-own', 'sink((@).read());', 'local'],
  ['delete-member', 'delete (@).rows;', 'local'],
  // binding the value to a name keeps it tracked: the name's own references are then classified
  // a TS cast is erased at runtime, so the value lands in the position that WRAPS the cast
  ['ts-as-cast', 'const held = (@) as Holder; held.read();', 'local'],
  ['ts-non-null', 'const held = (@)!; held.read();', 'local'],
  ['ts-satisfies', 'const held = (@) satisfies Holder; held.read();', 'local'],
  ['declarator', 'const held = @; held.read();', 'local'],
  ['assign-identifier', 'let held; held = @; held.read();', 'local'],
  ['assign-logical', 'let held; held ||= @; held.read();', 'local'],
  // the climb passes through a carrier NAME and then ends at a member read: the object is reachable
  // as that name from there on, so what the name does decides
  ['assign-then-member-read', 'let held; (held = @).rows; sink(held);', 'escapes'],
];

// both flavors report the same verdict through different evidence. pure picks the helper by family,
// so the helper NAME says it. global injects whatever the receiver might need, so a receiver still
// known to be an array pulls only the array module while a widened one pulls the string one too
const FLAVORS = [
  ['usage-pure', out => /array\/instance\/at/.test(out) ? 'local' : /instance\/at/.test(out) ? 'escapes' : 'no-polyfill'],
  ['usage-global', out => /es\.array\.at/.test(out) ? (/es\.string\.at/.test(out) ? 'escapes' : 'local') : 'no-polyfill'],
];

async function verdict(method, read, code) {
  const { code: out } = await transformAsync(code, {
    configFile: false,
    babelrc: false,
    filename: 'holder.jsx',
    sourceType: 'module',
    parserOpts: { plugins: ['jsx', 'typescript'] },
    plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }]],
  });
  return read(out);
}

for (const [method, read] of FLAVORS) {
  for (const [id, shape, expected] of POSITIONS) {
    // the literal reaches the resolver through the named-binding walk once and through the
    // anonymous-object walk once; the two must agree, and agree on the written-down verdict
    const named = await verdict(method, read, `const holder = ${ LITERAL };\n${ shape.replace('@', 'holder') }`);
    const inline = await verdict(method, read, shape.replace('@', LITERAL));
    check(`${ id } (${ method }, bound to a name)`, named, expected.named ?? expected);
    check(`${ id } (${ method }, written inline)`, inline, expected.inline ?? expected);
  }
}

finish();
