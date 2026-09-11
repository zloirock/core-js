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
import { createChecker } from './harness.mjs';
import { TS_NUMBER_TYPE, TS_UNKNOWN_TYPE } from '../../packages/core-js-polyfill-provider/resolve-node-type/ast-shapes.js';
import { createStraightLineFlow } from '../../packages/core-js-polyfill-provider/resolve-node-type/straight-line-flow.js';
import {
  reassignBailApplies,
  siblingHostingIndex,
  useOutrunsWrite,
  writeOutrunsUse,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import babelPlugin from '../../packages/core-js-babel-plugin/index.js';
import createUnplugin from '../../packages/core-js-unplugin/internals/plugin.js';

const { transformAsync } = createRequire(import.meta.url)('@babel/core');
const t = createRequire(import.meta.url)('@babel/types');

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
    imports(first).length === 2 && imports(first).every(specifier => path.isAbsolute(specifier)), true);
  const firstUnplugin = unplugin(source, { absoluteImports: true }, 'input.mjs');
  check('absolute imports: stable across transforms in one process [unplugin]',
    unplugin(source, { absoluteImports: true }, 'input.mjs'), firstUnplugin);
  checkDeep('absolute imports: the relative form is not served from the absolute memo [babel]',
    imports(await babel(source, { absoluteImports: false }, 'input.mjs')), BOTH);
}

// --- the guard-lane and positional caches: keyed on (node, polarity) / (node, name) / binding ---

// ONE test node read in both directions. a key without the polarity hands the alternate the
// consequent's entries, and both arms collapse onto one family
await checkBoth('condition entries: the two polarities of one test resolve apart', `
  function f(x: string | string[]) {
    if (typeof x === 'string') { return x.at(0); } else { return x.at(0); }
  }
`);

// two names guarded in one statement list. a key without the name serves the second read the
// first name's guards
await checkBoth('early-exit guards: two names in one list resolve apart', `
  function f(a: string | string[], b: string | string[]) {
    if (typeof a !== 'string') return null;
    if (!Array.isArray(b)) return null;
    return [a.at(0), b.at(0)];
  }
`);

// one suspension point, two reads across it: the guard holds for the read ABOVE and is stale for
// the one below, since a write outside the body lands while the caller is resumed. a cache keyed on
// the function alone, with the position baked into the VALUE, would answer both the same
await checkBoth('suspension positions: reads above and below one await resolve apart', `
  let s: string | string[] = 'ab';
  export async function f() {
    if (typeof s !== 'string') return null;
    const above = s.at(0);
    await 0;
    const below = s.at(0);
    return [above, below];
  }
  s = ['a', 'b'];
`, ['@core-js/pure/actual/instance/at', '@core-js/pure/actual/string/instance/at']);

// the straight-line assignment list: a binding's writes, pre-filtered and sorted, binary-searched
// per read. TWO bindings in one scope, each written in a plain block the use sits after - a key that
// kept only the scope hands the second read the first binding's list, and its read takes the first
// binding's family
await checkBoth('straight-line assignments: two bindings in one scope keep their own writes', `
  let a;
  let b;
  { b = 'x'; }
  { a = ['x']; }
  export const r = [a.at(0), b.at(0)];
`);

// the list is built on the first ask, so a lost binding dimension leaks in READ order: the same two
// bindings, read the other way round, collapse onto the other family
await checkBoth('straight-line assignments: two bindings, reverse read order', `
  let a;
  { a = ['x']; }
  let b;
  { b = 'x'; }
  export const r = [b.at(0), a.at(0)];
`);

// the entry's own dimension: it holds the sorted LIST, which each read searches at its OWN position -
// not the answer the first read got. one binding written twice, read on both sides of the second
// write, so an entry holding a baked answer serves the lower read the upper one's write
await checkBoth('straight-line assignments: two reads of one binding across a second write', `
  let a;
  { a = 'x'; }
  const first = a.at(0);
  { a = ['y']; }
  const second = a.at(0);
  export const r = [first, second];
`);

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

// --- the evaluation-order predicate: the one memo whose key cannot carry its whole dependency ---
// `writeOutrunsUse` reads the chain ABOVE the use - the classes on it and the members they hold - so
// the use NODE alone does not determine the answer. its memo keys on that node and VALIDATES the
// parent it was built under; without the validation a second query on the same node is served from
// the first one's ancestry. asked directly rather than through an emitter: the collapse this catches
// needs one node under two parents, which a single parse never produces
{
  const write = { type: 'AssignmentExpression', start: 58, end: 68 };
  const keySeq = { type: 'SequenceExpression', expressions: [write], start: 55, end: 74 };
  const keyMember = { type: 'ClassProperty', computed: true, static: true, key: keySeq, start: 50, end: 78 };
  const useNode = { type: 'Identifier', name: 'x', start: 20, end: 21 };
  const field = {
    type: 'ClassProperty',
    computed: false,
    static: true,
    key: { type: 'Identifier', name: 'f' },
    value: useNode,
    start: 10,
    end: 25,
  };
  const classBody = { type: 'ClassBody', body: [field, keyMember] };
  const classNode = { type: 'ClassDeclaration', body: classBody, start: 0, end: 80 };
  const classPath = { node: classNode, parentPath: null };
  const bodyPath = { node: classBody, key: 'body', parentPath: classPath };
  const fieldPath = { node: field, listKey: 'body', key: 0, parentPath: bodyPath };
  const insidePath = { node: useNode, key: 'value', parentPath: fieldPath };
  const outsidePath = {
    node: useNode,
    key: 'expression',
    parentPath: { node: { type: 'ExpressionStatement', start: 90, end: 99 }, parentPath: null },
  };
  check('evaluation order: a class key outruns a static field the source puts above it',
    writeOutrunsUse(write, insidePath), true);
  check('evaluation order: the same node re-parented outside the class is recomputed',
    writeOutrunsUse(write, outsidePath), false);
  check('evaluation order: and recomputed again on the way back, so the check is not one-shot',
    writeOutrunsUse(write, insidePath), true);
}

// the MIRROR relation reads its own span index, memoized the same way and validated the same way -
// and a twin left unvalidated collapses exactly as its sibling would. roles swapped against the
// case above: the USE sits in the key the class evaluates early, the WRITE in a static field value
{
  const useNode = { type: 'Identifier', name: 'x', start: 58, end: 59 };
  const keySeq = { type: 'SequenceExpression', expressions: [useNode], start: 55, end: 74 };
  const keyMember = { type: 'ClassProperty', computed: true, static: true, key: keySeq, start: 50, end: 78 };
  const write = { type: 'AssignmentExpression', start: 12, end: 22 };
  const field = {
    type: 'ClassProperty',
    computed: false,
    static: true,
    key: { type: 'Identifier', name: 'f' },
    value: write,
    start: 10,
    end: 25,
  };
  const classBody = { type: 'ClassBody', body: [field, keyMember] };
  const classNode = { type: 'ClassDeclaration', body: classBody, start: 0, end: 80 };
  const classPath = { node: classNode, parentPath: null };
  const bodyPath = { node: classBody, key: 'body', parentPath: classPath };
  const keyPath = { node: keyMember, listKey: 'body', key: 1, parentPath: bodyPath };
  const seqPath = { node: keySeq, key: 'key', parentPath: keyPath };
  const insidePath = { node: useNode, listKey: 'expressions', key: 0, parentPath: seqPath };
  const outsidePath = {
    node: useNode,
    key: 'expression',
    parentPath: { node: { type: 'ExpressionStatement', start: 90, end: 99 }, parentPath: null },
  };
  check('evaluation order, mirror: a use in a class key outruns a write in a static field value',
    useOutrunsWrite(write, insidePath), true);
  check('evaluation order, mirror: the same node re-parented outside the class is recomputed',
    useOutrunsWrite(write, outsidePath), false);
  check('evaluation order, mirror: and recomputed again on the way back, so the check is not one-shot',
    useOutrunsWrite(write, insidePath), true);
}

// the one pair inside a class that source position CANNOT rank and the implementations disagree on:
// the class's OWN decorator list against its heritage. the spec evaluates the decorator list first,
// every downlevel lowering hoists the `extends` expression ahead of the static block it applies the
// decorators in - so BOTH sides claim the outrun and every write in either slot reaches a use in the
// other. asked directly for the reason the cases above are: the shape needs a decorator, and the two
// parsers reach one through different keys, so the array membership is the only portable fact
{
  const useNode = { type: 'Identifier', name: 'x', start: 5, end: 6 };
  const decSeq = { type: 'SequenceExpression', expressions: [useNode], start: 4, end: 18 };
  const decorator = { type: 'Decorator', expression: decSeq, start: 2, end: 18 };
  const write = { type: 'AssignmentExpression', start: 38, end: 48 };
  const superSeq = { type: 'SequenceExpression', expressions: [write], start: 36, end: 58 };
  const classBody = { type: 'ClassBody', body: [] };
  const classNode = {
    type: 'ClassDeclaration',
    decorators: [decorator],
    superClass: superSeq,
    body: classBody,
    start: 0,
    end: 80,
  };
  const classPath = { node: classNode, parentPath: null };
  const decPath = { node: decorator, listKey: 'decorators', key: 0, parentPath: classPath };
  const decSeqPath = { node: decSeq, key: 'expression', parentPath: decPath };
  const decUsePath = { node: useNode, listKey: 'expressions', key: 0, parentPath: decSeqPath };
  const superPath = { node: superSeq, key: 'superClass', parentPath: classPath };
  const heritageUseNode = { type: 'Identifier', name: 'y', start: 40, end: 41 };
  const heritageUsePath = { node: heritageUseNode, listKey: 'expressions', key: 0, parentPath: superPath };
  const decoratorWrite = { type: 'AssignmentExpression', start: 6, end: 16 };
  check('evaluation order: a heritage write reaches a use in the class\'s own decorator below it',
    writeOutrunsUse(write, decUsePath), true);
  check('evaluation order: and the decorator write reaches a heritage use, the pair ranking neither way',
    writeOutrunsUse(decoratorWrite, heritageUsePath), true);
  check('evaluation order: a write outside both slots stays positional against the decorator use',
    writeOutrunsUse({ type: 'AssignmentExpression', start: 90, end: 99 }, decUsePath), false);
}

// --- statement-list placement: read LIVE, never snapshotted ---

// an emitter REPLACES a whole statement (`({ Map: M } = globalThis)` becomes `M = _Map`) by swapping
// the node under the member path the container cache handed out. the list is unchanged by that -
// same array, same length, same member paths - so every consumer keeps reading it, and a placement
// that had snapshotted the member NODES answers about a statement that is no longer there: the write
// the replacement carries climbs to a node the snapshot never saw and reads as hosted by NOTHING,
// which is the verdict "no preceding guard is stale" rather than a cheaper way to the same one.
// the second query uses a DIFFERENT write, so a per-target memo cannot answer it from the first
{
  const first = { type: 'VariableDeclaration', start: 0, end: 10 };
  const second = { type: 'ExpressionStatement', start: 11, end: 30 };
  const third = { type: 'ExpressionStatement', start: 31, end: 50 };
  const block = { type: 'BlockStatement', body: [first, second, third] };
  const blockPath = { node: block, parentPath: null };
  const siblings = block.body.map((node, key) => ({ node, listKey: 'body', key, parentPath: blockPath }));
  const writeA = { type: 'AssignmentExpression', start: 13, end: 20 };
  const writeB = { type: 'AssignmentExpression', start: 21, end: 28 };
  check('statement placement: a write is placed by the member statement hosting it',
    siblingHostingIndex(siblings, { node: writeA, key: 'expression', parentPath: siblings[1] }), 1);
  const replaced = { type: 'ExpressionStatement', start: 11, end: 30 };
  siblings[1].node = replaced;
  block.body[1] = replaced;
  check('statement placement: a write under a REPLACED statement is still placed by that statement',
    siblingHostingIndex(siblings, { node: writeB, key: 'expression', parentPath: siblings[1] }), 1);
  check('statement placement: a bare node carries no chain and is placed by its span',
    siblingHostingIndex(siblings, writeB), 1);
  check('statement placement: a path outside the list is hosted by no member of it',
    siblingHostingIndex(siblings, {
      node: { type: 'Identifier', start: 90, end: 91 },
      key: 'expression',
      parentPath: { node: { type: 'Program' }, parentPath: null },
    }), -1);
  check('statement placement: an empty list hosts nothing', siblingHostingIndex([], writeB), -1);
}

// --- early-exit guard index: keyed on the statement list ---

// two statement LISTS, each with its own preceding guard. a key that lost the list dimension answers
// the nested body with the outer body's guards
await checkBoth('early-exit guards: a nested body keeps its own preceding guards', `
export function outer(a) {
  if (!Array.isArray(a)) throw new Error('x');
  a.at(0);
  return function inner(c) {
    if (typeof c !== 'string') throw new Error('x');
    return c.at(0);
  };
}
`);

// the same key decides where a guard STOPS being live: a write in the list invalidates the guard
// above it, and a list serving another list's index carries the wrong write positions with it
await checkBoth('early-exit guards: a write invalidates the guard of its own list only', `
export function withWrite(p) {
  if (typeof p !== 'string') throw new Error('x');
  p = [1, 2];
  return p.at(0);
}
export function withoutWrite(q) {
  if (typeof q !== 'string') throw new Error('x');
  return q.at(0);
}
`);

// --- the memo dimensions a single parse cannot fan out: asked of the cluster directly ---

// `violationRunsDeferred` answers a PAIR - the write, and the binding scope its climb stops at - yet
// keys on the write alone and revalidates the stop it was computed for. one write asked under two
// stops is what a single parse never hands the resolver, so the pair is built here: the same write is
// deferred against a scope ABOVE the function hosting it (the call runs at an unknown time) and
// straight-line against that function itself, whose boundary the climb never crosses
{
  const flow = createStraightLineFlow({ t, babelNodeType: node => node?.type });
  const write = {
    type: 'AssignmentExpression',
    operator: '=',
    left: { type: 'Identifier', name: 'M', start: 40, end: 41 },
    right: { type: 'Identifier', name: 'g', start: 44, end: 45 },
    start: 40,
    end: 45,
  };
  const stmt = { type: 'ExpressionStatement', expression: write, start: 40, end: 46 };
  const fnBody = { type: 'BlockStatement', body: [stmt], start: 30, end: 50 };
  const fn = {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'w' },
    params: [],
    body: fnBody,
    start: 10,
    end: 50,
  };
  const program = { type: 'Program', body: [fn], start: 0, end: 60 };
  const programPath = { node: program, parentPath: null };
  const fnPath = { node: fn, listKey: 'body', key: 0, parentPath: programPath };
  const bodyPath = { node: fnBody, key: 'body', parentPath: fnPath };
  const stmtPath = { node: stmt, listKey: 'body', key: 0, parentPath: bodyPath };
  const violation = { node: write, key: 'expression', parentPath: stmtPath };
  check('deferral memo: a write inside a function is deferred against the scope above it',
    flow.violationRunsDeferred(violation, { block: program }), true);
  check('deferral memo: the same write is straight-line against the function that hosts it',
    flow.violationRunsDeferred(violation, { block: fn }), false);
  check('deferral memo: and the outer stop is answered again, so the check is not one-shot',
    flow.violationRunsDeferred(violation, { block: program }), true);
}

// the reassignment set is kept against the violations ARRAY - the adapters hand that array back
// unchanged while rebuilding the binding object around it - so the two facts its exclusions read, the
// binding's own DECLARATOR and its bound NAME, are key dimensions over one array. both shapes below
// are ones the accessors are written to serve: a path-less binding answers `undefined` for the
// declarator, a pattern-bound one `null` for the name, and each answer stops its exclusion applying.
// read through `reassignBailApplies`, the verdict a lost dimension flips
{
  const usagePath = { node: { type: 'Identifier', name: 'M', start: 90, end: 91 }, parentPath: null };
  const adapter = { method: 'usage-pure' };
  const identifier = { type: 'Identifier', name: 'M', start: 4, end: 5 };

  // the DECLARATOR dimension: a loop re-init records the declarator itself, which is not a write of
  // the binding it declares - but only a shape that can name that declarator gets to exclude it
  const declarator = { type: 'VariableDeclarator', id: identifier, start: 4, end: 20 };
  const reinit = [{ node: declarator }];
  check('reassignment memo: the declaring shape excludes its own declarator',
    reassignBailApplies({ binding: { path: { node: declarator }, identifier, constantViolations: reinit }, adapter, path: usagePath }), false);
  check('reassignment memo: the path-less shape of the same list keeps it',
    reassignBailApplies({ binding: { identifier, constantViolations: reinit }, adapter, path: usagePath }), true);

  // the NAME dimension, with the declarator held FIXED: an identity self-assign is a value no-op only
  // for the name it writes, and a pattern-bound shape has no name to compare it against
  const patternDeclarator = { type: 'VariableDeclarator', id: { type: 'ObjectPattern', properties: [] }, start: 4, end: 24 };
  const selfAssign = {
    type: 'AssignmentExpression',
    operator: '=',
    left: { type: 'Identifier', name: 'M', start: 30, end: 31 },
    right: { type: 'Identifier', name: 'M', start: 34, end: 35 },
    start: 30,
    end: 35,
  };
  const identity = [{ node: selfAssign }];
  const patternPath = { node: patternDeclarator };
  check('reassignment memo: a named shape reads its identity self-assign as no write',
    reassignBailApplies({ binding: { path: patternPath, identifier, constantViolations: identity }, adapter, path: usagePath }), false);
  check('reassignment memo: the nameless shape of the same list and declarator keeps it',
    reassignBailApplies({ binding: { path: patternPath, constantViolations: identity }, adapter, path: usagePath }), true);
}

finish();
