// The resolver's per-parse caches, checked by KEY COMPLETENESS rather than by outcome. Each one
// answers a question about a host (a class body, a superclass, a namespace, a synthesized type
// reference) and is keyed on that host; a key that lost a dimension answers the second host with the
// first one's result, and the corpus never notices because both answers are individually plausible.
// So every case here puts TWO hosts in one file whose correct answers DIFFER, and reads the verdict
// off the emitted helper name: `at` is one of the two instance methods carrying both an array and a
// string pure variant, so `_atMaybeArray` vs `_atMaybeString` reports which host answered. A cache
// serving the wrong host collapses both reads onto one helper, which no arrangement of correct
// answers can produce.
//
// Read through the emitters (both of them, since the caches live in the shared resolver and a
// single emitter's fixtures cannot see a provider-level regression) rather than at resolver level:
// the helper name is the only place the resolved family becomes observable.
import { createRequire } from 'node:module';
import { isAbsolute } from 'node:path';
import { createChecker } from './harness.mjs';
import { TS_NUMBER_TYPE, TS_UNKNOWN_TYPE } from '../../packages/core-js-polyfill-provider/resolve-node-type/ast-shapes.js';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';

const { transformAsync } = createRequire(import.meta.url)('@babel/core');

const { check, checkDeep, finish } = createChecker('resolver-cache-keys');

const OPTIONS = { method: 'usage-pure', version: '4.0', targets: { ie: 11 } };

async function babel(source, extra = {}, filename = 'input.ts') {
  const out = await transformAsync(source, {
    plugins: [[babelPlugin, { ...OPTIONS, ...extra }]],
    filename,
    sourceType: 'module',
    configFile: false,
    babelrc: false,
    parserOpts: filename.endsWith('.ts') ? { plugins: ['typescript'] } : undefined,
  });
  return out.code;
}

function unplugin(source, extra = {}, filename = 'input.ts') {
  return createUnplugin({ ...OPTIONS, ...extra }).transform(source, filename)?.code ?? source;
}

function imports(code) {
  return code.matchAll(/from "(?<source>[^"]+)"/gu).map(match => match.groups.source).toArray().sort();
}

// the two hosts resolved SEPARATELY. one of the two names twice means a cache answered the second
// host with the first one's result
const BOTH = ['@core-js/pure/actual/array/instance/at', '@core-js/pure/actual/string/instance/at'];

// run a case through both emitters against the same expectation
async function checkBoth(label, source, expected = BOTH) {
  checkDeep(`${ label } [babel]`, imports(await babel(source)), expected);
  checkDeep(`${ label } [unplugin]`, imports(unplugin(source)), expected);
}

// --- class-body member index: keyed on (body, name) ---

// two names in one body. a name-less key hands the second read the first name's members
await checkBoth('class body: two member names resolve apart', `
  class C {
    m(): string[] { return ['a']; }
    n(): string { return 'a'; }
  }
  const c = new C();
  export const r = [c.m().at(0), c.n().at(0)];
`);

// the index is filled per name on first ask, so a positional leak shows on one order only
await checkBoth('class body: two member names, reverse read order', `
  class C {
    m(): string[] { return ['a']; }
    n(): string { return 'a'; }
  }
  const c = new C();
  export const r = [c.n().at(0), c.m().at(0)];
`);

// a static and an instance member of ONE name stay apart, and among duplicate instance keys the
// source-LAST definition is the one installed on the prototype
await checkBoth('class body: static and instance of one name stay apart', `
  class C {
    static m(): string { return 'a'; }
    m(): number[] { return [1]; }
    m(): string[] { return ['a']; }
  }
  export const r = [new C().m().at(0), C.m().at(0)];
`);

// --- superclass resolution: keyed on the class node ---

// two classes extending DIFFERENT polyfilled globals. a key that lost the class hands the second
// class the first one's superclass and its inherited static stops resolving
await checkBoth('superclass: two classes keep their own', `
  class A extends Promise<number> { static a() { return super.try(() => 1); } }
  class B extends Array<number> { static b() { return super.from([1]); } }
  export const r = [A.a(), B.b()];
`, ['@core-js/pure/actual/array/from', '@core-js/pure/actual/promise/constructor',
  '@core-js/pure/actual/promise/try']);

// the positive direction of the same cache: two DIFFERENT statics off ONE superclass share the
// resolution and both still resolve
await checkBoth('superclass: two statics off one superclass', `
  class C extends Promise<number> {
    static a() { return super.withResolvers(); }
    static b() { return super.try(() => 1); }
  }
  export const r = [C.a(), C.b()];
`, ['@core-js/pure/actual/promise/constructor', '@core-js/pure/actual/promise/try',
  '@core-js/pure/actual/promise/with-resolvers']);

// --- merged-namespace shadow census: keyed on (program, namespace name) ---

// the census answers "does a DESCENDANT's merged namespace export this static name", which decides
// whether a `this.<static>` read inside a static method may narrow. an index that lost the
// namespace name lets an unrelated class's namespace suppress the narrow
await checkBoth('namespace census: an unrelated namespace does not shadow', `
  class A {
    static f: string[] = ['a'];
    static read() { return this.f.at(0); }
  }
  class B {}
  namespace B { export function f(): string { return 'a'; } }
  export const r = A.read();
`, ['@core-js/pure/actual/array/instance/at']);

// the direction the census exists for: the class's OWN descendant namespace exporting that name
// overrides the slot at runtime, so the narrow must NOT fire
{
  const shadowed = `
    class A {
      static f: string[] = ['a'];
      static read() { return this.f.at(0); }
    }
    class Sub extends A {}
    namespace Sub { export function f(): string { return 'a'; } }
    export const r = A.read();
  `;
  // stated as the POSITIVE outcome, not as an absence: "the array variant is missing" would also
  // hold if the transform emitted nothing at all, which is a different (and broken) world. the
  // shadow WIDENS the dispatch, so the generic helper is what must be there
  const widened = ['@core-js/pure/actual/instance/at'];
  checkDeep('namespace census: a descendant namespace widens the dispatch [babel]',
    imports(await babel(shadowed)), widened);
  checkDeep('namespace census: a descendant namespace widens the dispatch [unplugin]',
    imports(unplugin(shadowed)), widened);
}

// --- synthesized class type reference: interned on the typeName node ---

// the annotation-only member fallback hands the member enumerator a SYNTHESIZED reference to the
// class. it is interned so the enumerator's identity-keyed memo can hit; an intern table that lost
// the name answers the second class's enumeration with the first class's members
await checkBoth('synth class ref: two classes keep their own members', `
  interface SA { m(): string[]; }
  interface SB { m(): string; }
  class A implements SA {}
  interface A extends SA {}
  class B implements SB {}
  interface B extends SB {}
  export const r = [new A().m().at(0), new B().m().at(0)];
`);

// the positive direction: two members of ONE class share the interned reference and both resolve
await checkBoth('synth class ref: two members of one class', `
  interface Shape { m(): string[]; n(): string; }
  class C implements Shape {}
  interface C extends Shape {}
  const c = new C();
  export const r = [c.m().at(0), c.n().at(0)];
`);

// --- absolute import resolution: memoized per specifier, process-lifetime ---

// the only cache here that the fixture corpus never reaches, since it needs `absoluteImports`.
// two emissions in one process must agree, and the relative form must not be served from it
{
  const source = 'export const a = [1].at(0);\nexport const b = "x".at(0);\n';
  const first = await babel(source, { absoluteImports: true }, 'input.mjs');
  check('absolute imports: stable across transforms in one process [babel]',
    await babel(source, { absoluteImports: true }, 'input.mjs'), first);
  // `isAbsolute` rather than a leading-slash test: the emitted form is forward-slash normalized
  // but keeps the Windows drive letter (`D:/core-js/...`), which no leading-`/` test recognizes.
  // still discriminating - a resolution failure falls back to the bare specifier, absolute nowhere
  check('absolute imports: both variants resolved absolute [babel]',
    imports(first).length === 2 && imports(first).every(specifier => isAbsolute(specifier)), true);
  const firstUnplugin = unplugin(source, { absoluteImports: true }, 'input.mjs');
  check('absolute imports: stable across transforms in one process [unplugin]',
    unplugin(source, { absoluteImports: true }, 'input.mjs'), firstUnplugin);
  checkDeep('absolute imports: the relative form is not served from the absolute memo [babel]',
    imports(await babel(source, { absoluteImports: false }, 'input.mjs')), BOTH);
}

// --- content-free type nodes: shared frozen singletons ---

// they are shared so an identity-keyed memo can hit on them, which only holds while nobody mutates
// one in place - a write would poison every other holder. the freeze is what turns that into a loud
// failure at the write, so it is a contract, not decoration
check('content-free nodes: the unknown singleton is frozen', Object.isFrozen(TS_UNKNOWN_TYPE), true);
check('content-free nodes: the number singleton is frozen', Object.isFrozen(TS_NUMBER_TYPE), true);
checkDeep('content-free nodes: the unknown singleton carries only its type',
  Object.keys(TS_UNKNOWN_TYPE), ['type']);
checkDeep('content-free nodes: the number singleton carries only its type',
  Object.keys(TS_NUMBER_TYPE), ['type']);

finish();
