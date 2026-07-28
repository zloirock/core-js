// Unit tests for the CHANNELS through which a body runs with the tracked receiver as `this`. the
// field narrow assumes the only writes to a slot are the ones this module can read; every channel
// below breaks that assumption by putting OUR receiver into a body the scan does not own, and each
// was found separately, one per review pass, because nobody had written the list down. so the list is
// here, derived from the semantics rather than from bugs: a body runs with our object as `this`
// exactly when the object is (1) the receiver of a member call - own member, member copied in by a
// spread, member inherited from an installed or extended prototype, member written onto that
// prototype after the fact; (2) an explicit `thisArg` -
// `call` / `apply` / `bind` or a callback slot that takes one; (3) the receiver of an accessor;
// (4) coerced, which invokes its own `toString` / `valueOf` / `Symbol.toPrimitive`; (5) iterated,
// which invokes its own `Symbol.iterator`. a row that stays `local` states the boundary: nothing in
// that shape can reach a foreign body. adding a channel means adding a row here
import { createRequire } from 'node:module';
import { createChecker } from './harness.mjs';
import plugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';

// provider semantics, read through the emitters: no babel-version leg here, so the host's own
// resolution is the only one
const { transformAsync } = createRequire(import.meta.url)('@babel/core');

const { check, finish } = createChecker('holder-receiver-body-channels');

// `at` carries both an array and a string pure variant, so the helper name reports whether the
// field narrow survived the channel under test
const READ = 'read() { return this.rows.at(0); }';

const CHANNELS = [
  // (1) receiver of a member call - the body may be written here, copied in, or inherited
  ['own method hands `this` out',
    `const h = { rows: [1, 2], leak() { sink(this); }, ${ READ } };\nh.leak();\nexport const r = h.read();`, 'escapes'],
  ['own method only reads `this`',
    `const h = { rows: [1, 2], size() { return this.rows.length; }, ${ READ } };\nh.size();\nexport const r = h.read();`, 'local'],
  ['method copied in by a spread',
    `const h = { ...src, rows: [1, 2], ${ READ } };\nh.borrowed();\nexport const r = h.read();`, 'escapes'],
  ['prototype installed by `__proto__`',
    `const h = { __proto__: base, rows: [1, 2], ${ READ } };\nh.inherited();\nexport const r = h.read();`, 'escapes'],
  ['`__proto__` under a computed key installs nothing',
    `const h = { ["__proto__"]: base, rows: [1, 2], ${ READ } };\nexport const r = h.read();`, 'local'],
  ['base class writes the subclass slot',
    `class Base { touch() { this.rows = "text"; } }\nclass C extends Base { rows = [1, 2]; ${ READ } }\n`
    + 'const c = new C();\nc.touch();\nexport const r = c.read();', 'escapes'],
  ['base this module cannot read as a class',
    `import Foreign from "foreign";\nclass C extends Foreign { rows = [1, 2]; ${ READ } }\n`
    + 'const c = new C();\nc.inherited();\nexport const r = c.read();', 'escapes'],
  ['member written onto the object itself',
    `const h = { rows: [1, 2], ${ READ } };\nh.added = fn;\nh.added();\nexport const r = h.read();`, 'escapes'],
  ['a primitive stored under a new key installs no body',
    `const h = { rows: [1, 2], ${ READ } };\nh.count = 5;\nexport const r = h.read();`, 'local'],
  ['decorated class - the decorator may replace or add members',
    `@dec\nclass C { rows = [1, 2]; ${ READ } }\nconst c = new C();\nc.injected();\nexport const r = c.read();`, 'escapes'],
  ['member written onto the shared prototype',
    `class C { rows = [1, 2]; ${ READ } }\nC.prototype.added = fn;\n`
    + 'const c = new C();\nc.added();\nexport const r = c.read();', 'escapes'],
  ['prototype installed at runtime by `setPrototypeOf`',
    `const h = { rows: [1, 2], ${ READ } };\nObject.setPrototypeOf(h, base);\n`
    + 'h.inherited();\nexport const r = h.read();', 'escapes'],
  ['installing a NULL prototype brings no body',
    `const h = { rows: [1, 2], ${ READ } };\nObject.setPrototypeOf(h, null);\nexport const r = h.read();`, 'local'],
  // the acquisition fact belongs to the HOLDER, not to one of its surfaces: the static side owns it
  // exactly as the instance side does, and used to be told separately - which meant not at all
  ['decorated class - STATIC surface',
    '@dec\nclass C { static rows = [1, 2]; }\nexport const r = C.rows.at(0);', 'escapes'],
  ['unread base - STATIC surface',
    'import Foreign from "foreign";\nclass C extends Foreign { static rows = [1, 2]; }\n'
    + 'C.inheritedStatic();\nexport const r = C.rows.at(0);', 'escapes'],
  // an ANCESTOR's body runs with OUR receiver: the hierarchy the instance answers to is not only its
  // descendants. both surfaces, since a static of the base runs with the subclass constructor
  ['ancestor instance method hands `this` out',
    `class B { leak() { sink(this); } }\nclass C extends B { rows = [1, 2]; ${ READ } }\n`
    + 'new C().leak();\nexport const r = new C().read();', 'escapes'],
  ['ancestor static hands the constructor out',
    'class B { static leak() { sink(this); } }\nclass C extends B { static rows = [1, 2]; }\n'
    + 'C.leak();\nexport const r = C.rows.at(0);', 'escapes'],
  ['ancestor that only reads keeps the narrow',
    'class B { static peek() { return 1; } }\nclass C extends B { static rows = [1, 2]; }\n'
    + 'C.peek();\nexport const r = C.rows.at(0);', 'local'],
  ['built-in base owns engine bodies only',
    `class C extends Array { rows = [1, 2]; ${ READ } }\nconst c = new C();\nexport const r = c.read();`, 'local'],
  // (2) explicit thisArg
  ['handed to `call` as the receiver',
    `const h = { rows: [1, 2], ${ READ } };\nfn.call(h);\nexport const r = h.read();`, 'escapes'],
  ['handed to a callback slot as `thisArg`',
    `const h = { rows: [1, 2], ${ READ } };\n[1].forEach(cb, h);\nexport const r = h.read();`, 'escapes'],
  // (3) accessor receiver - the getter body runs with the object
  ['own getter hands `this` out',
    `const h = { rows: [1, 2], get peek() { sink(this); return 1; }, ${ READ } };\n`
    + 'sink(h.peek);\nexport const r = h.read();', 'escapes'],
  // (4) coercion invokes the object's own conversion members
  ['own `toString` hands `this` out, invoked by coercion',
    `const h = { rows: [1, 2], toString() { sink(this); return "x"; }, ${ READ } };\n`
    + 'sink(String(h));\nexport const r = h.read();', 'escapes'],
  // (5) iteration invokes the object's own iterator
  ['iterator declared under a computed key',
    `const h = { [Symbol.iterator]: it, rows: [1, 2], ${ READ } };\n`
    + 'for (const el of h) sink(el);\nexport const r = h.read();', 'escapes'],
  ['iterator reached along an installed prototype',
    `const h = { __proto__: base, rows: [1, 2], ${ READ } };\n`
    + 'for (const el of h) sink(el);\nexport const r = h.read();', 'escapes'],
  // the same iterator question asked of an INLINE literal: the anonymous walk answers it from the
  // literal's node while the named one reads the summary, and both had to be asked - disabling the
  // node-side reader left every row in this file green, because the named side still caught them
  ['inline literal with a computed key iterated in place',
    'for (const el of { [Symbol.iterator]: it, rows: [1, 2], read() { return this.rows.at(0); } }) sink(el);\n'
    + 'export const r = 1;', 'escapes'],
  ['inline literal spread into an array keeps its narrow',
    'const a = [...{ rows: [1, 2], read() { return this.rows.at(0); } }];\nsink(a);\nexport const r = 1;', 'local'],
  ['inline literal with a computed key spread into an array',
    'const a = [...{ [Symbol.iterator]: it, rows: [1, 2], read() { return this.rows.at(0); } }];\n'
    + 'sink(a);\nexport const r = 1;', 'escapes'],
  ['nothing to iterate with, so the head throws first',
    `const h = { rows: [1, 2], ${ READ } };\nfor (const el of h) sink(el);\nexport const r = h.read();`, 'local'],
  // an async / generator method is a body like any other - the receiver reaches it the same way
  ['async method hands `this` out',
    `const h = { rows: [1, 2], async m() { sink(this); }, ${ READ } };\nh.m();\nexport const r = h.read();`, 'escapes'],
  ['generator yields `this`',
    `const h = { rows: [1, 2], * g() { yield this; }, ${ READ } };\nsink([...h.g()]);\nexport const r = h.read();`, 'escapes'],
  ['async method only reads `this`',
    `const h = { rows: [1, 2], async m() { return this.rows.length; }, ${ READ } };\nh.m();\nexport const r = h.read();`, 'local'],
  // only the keys spelled out after the LAST spread survive it
  ['key after the last of several spreads',
    'const h = { a: 1, ...s1, b: 2, ...s2, rows: [1, 2] };\nexport const r = h.rows.at(0);', 'local'],
  ['key before the last of several spreads',
    'const h = { a: 1, ...s1, rows: [1, 2], ...s2, c: 3 };\nexport const r = h.rows.at(0);', 'escapes'],
  // the same provability question asked of the RECEIVER ITSELF rather than of a field it holds: a
  // provable anchor types `this`, so a member the receiver cannot have needs no polyfill at all,
  // while an unprovable one has to cover every family. these rows exist because disabling the anchor
  // gate left every field-narrow row in this file green - the field question and the receiver
  // question are not the same one
  ['receiver typed as a plain object needs no polyfill',
    'const h = { m() { return this.at(0); } };\nh.m();\nexport const r = 1;', 'no-polyfill'],
  ['receiver of a literal whose method is handed out is unknown',
    'const h = { m() { return this.at(0); } };\nsink(h.m);\nh.m();\nexport const r = 1;', 'escapes'],
  ['receiver of a plain class needs no polyfill',
    'class C { m() { return this.at(0); } }\nnew C().m();\nexport const r = 1;', 'no-polyfill'],
  ['receiver of a class whose prototype method is extracted is unknown',
    'class C { m() { return this.at(0); } }\nC.prototype.m.call([1, 2]);\nexport const r = 1;', 'escapes'],
  ['receiver of `extends Array` types to that family',
    'class C extends Array { m() { return this.at(0); } }\nnew C().m();\nexport const r = 1;', 'local'],
  ['extends Array loses the family once the anchor is unprovable',
    'class C extends Array { m() { return this.at(0); } }\nC.prototype.m.call("ab");\nexport const r = 1;', 'escapes'],
  // a PRIVATE member is as much the receiver's own body as a public one
  ['private method hands `this` out',
    `class C { rows = [1, 2]; #leak() { sink(this); } m() { this.#leak(); } ${ READ } }\n`
    + 'const c = new C();\nc.m();\nexport const r = c.read();', 'escapes'],
  ['private accessor hands `this` out',
    `class C { rows = [1, 2]; get #p() { sink(this); return 1; } m() { return this.#p; } ${ READ } }\n`
    + 'const c = new C();\nc.m();\nexport const r = c.read();', 'escapes'],
  ['static block hands the constructor out',
    'class C { static rows = [1, 2]; static { sink(this); } }\nexport const r = C.rows.at(0);', 'escapes'],
  // a nested literal or class declares its OWN receiver, so what its members do with `this` is not
  // about ours - the scan has to stop at them the same way it stops at a plain function
  ['nested object literal owns its own receiver',
    `const h = { rows: [1, 2], m() { const inner = { own() { sink(this); } }; inner.own(); }, ${ READ } };\n`
    + 'h.m();\nexport const r = h.read();', 'local'],
  ['nested class owns its own receiver',
    `const h = { rows: [1, 2], m() { class K { own() { sink(this); } } new K().own(); }, ${ READ } };\n`
    + 'h.m();\nexport const r = h.read();', 'local'],
  ['nested arrow keeps OUR receiver',
    `const h = { rows: [1, 2], m() { const f = () => sink(this); f(); }, ${ READ } };\n`
    + 'h.m();\nexport const r = h.read();', 'escapes'],
  // the receiver a nested plain function sees is its own call's, not ours
  ['nested plain function re-binds `this`',
    `const h = { rows: [1, 2], m() { function inner() { sink(this); } inner(); }, ${ READ } };\n`
    + 'h.m();\nexport const r = h.read();', 'local'],
  // a param default and a field initializer run with the same receiver as the body they belong to
  ['param default hands `this` out',
    `const h = { rows: [1, 2], m(a = sink(this)) { return a; }, ${ READ } };\nh.m();\nexport const r = h.read();`, 'escapes'],
  ['field initializer hands `this` out',
    `class C { rows = [1, 2]; hook = sink(this); ${ READ } }\nconst c = new C();\nexport const r = c.read();`, 'escapes'],
  ['static member hands the constructor out',
    'class C { static rows = [1, 2]; static leak() { sink(this); } }\nC.leak();\n'
    + 'export const r = C.rows.at(0);', 'escapes'],
];

// both flavors report the same verdict through different evidence: pure picks the helper by family,
// global injects whatever the receiver might need, so a receiver still known to be an array pulls
// only the array module while a widened one pulls the string one too. the channels live in the
// provider, ahead of either emitter, so a flavor answering differently is itself the finding
const FLAVORS = [
  ['usage-pure', out => /array\/instance\/at/.test(out) ? 'local' : /instance\/at/.test(out) ? 'escapes' : 'no-polyfill'],
  ['usage-global', out => /es\.array\.at/.test(out) ? (/es\.string\.at/.test(out) ? 'escapes' : 'local') : 'no-polyfill'],
];

// the channels are decided in the provider, ahead of BOTH emitters and BOTH parsers. two of them
// were found by a parser divergence rather than by reading the code - estree and babel disagree on
// where a method's function sits and on whether a traversal visits its root - so each channel is
// asked of both, and a disagreement is itself the finding
for (const [method, read] of FLAVORS) {
  for (const [label, code, expected] of CHANNELS) {
    const { code: out } = await transformAsync(code, {
      configFile: false,
      babelrc: false,
      filename: 'channel.mjs',
      sourceType: 'module',
      parserOpts: { plugins: ['decorators'] },
      plugins: [[plugin, { method, version: '4.0', targets: { ie: 11 } }]],
    });
    check(`${ label } (${ method }, babel)`, read(out), expected);
    // oxc rejects the decorator syntax the babel leg parses; the channel it guards is covered above
    if (code.includes('@dec')) continue;
    const viaOxc = createUnplugin({ method, version: '4.0', targets: { ie: 11 } }).transform(code, 'channel.mjs');
    check(`${ label } (${ method }, oxc)`, read(viaOxc?.code ?? code), expected);
  }
}

finish();
