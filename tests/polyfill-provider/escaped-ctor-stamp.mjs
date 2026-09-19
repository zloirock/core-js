// Unit tests for the NODE IDENTITY of the escaped-constructor stamp - the single thing the census
// that WRITES a stamp and the pure claim that READS one have to agree on. A bare reference carries
// its escape on its own Identifier. A constructor spelled off the proxy-global surface has no
// identifier of its own, so the stamp names the MEMBER, which is the node the claim stands on; when
// only one of the two halves knew that spelling, every proxy-global escape kept the bare
// `*/constructor` entry, which installs none of the constructor's statics.
// The stamps are positions, so a node that BORROWED its span (the read a destructure slot is paired
// with is synthesized from its receiver) must never be stamped - its key names the receiver. The
// escape such a slot carries is named by the SLOT instead, which is where the claim stands.
// The other half of that census is the NAMES, and it answers a different question: WHICH runtime
// value a constructor name stands for. A name is answered once per file - two answers mint two
// bindings for one object and the identity guard then compares across module boundaries - so the
// question is "did the REALM's constructor escape under this name", and a leaf resolving to a
// binding the file wrote is not it. Two things keep that narrow honest, and both are here: the
// slots of a scope that evaluate OUTSIDE it (a parameter list, a definition-time slot) reach past
// the declarations that scope holds, and a binding whose VALUES the census cannot enumerate (a
// parameter, a catch, an import local, a for-x head) may hold the realm's constructor after all.
/* eslint-disable no-template-curly-in-string -- source snippets deliberately contain tagged interpolations */
import { adapters, createChecker, findNode } from './harness.mjs';
import {
  collectFileCensus,
  ESCAPE_STAMPED_NODE_TYPES,
  ESCAPED_CONTAINER_NAMES,
  ESCAPED_CTOR_REFS,
  isEscapedCtorNode,
  nodePositionKey,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import {
  escapedCtorReferencesReducer,
  mutationShapesReducer,
} from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, checkTruthy, finish } = createChecker('escaped-ctor-stamp');

// each row: the source, the spellings whose OWN span must carry a stamp, and the spellings that
// must not. `stamped` is what an escaping reference resolves to; `bare` are the reads that stay
// home (a `new` callee, a static read, a receiver hop) plus the receivers a synthesized read
// would borrow its span from
const ROWS = [
  {
    name: 'literal loop element through a plain binding',
    code: 'for (const value of [globalThis.Map]) hand(value);',
    stamped: ['globalThis.Map'],
    bare: ['globalThis'],
  },
  {
    name: 'loop assignment reaches its outer binding',
    code: 'let value; { for ([value] of [[globalThis.Map]]) {} } hand(value);',
    stamped: ['globalThis.Map'],
    bare: ['globalThis'],
  },
  {
    name: 'lexical loop binding does not reach an outer namesake',
    code: 'let value = globalThis.Set; for (const [value] of [[globalThis.Map]]) {} hand(value);',
    stamped: ['globalThis.Set'],
    bare: ['globalThis.Map', ['globalThis', 1], ['globalThis', 2]],
  },
  {
    name: 'bare reference in a call argument',
    code: 'hand(Map);',
    stamped: ['Map'],
    bare: [],
  },
  {
    name: 'proxy-global member handed out',
    code: 'hand(globalThis.Map);',
    stamped: ['globalThis.Map'],
    bare: ['globalThis'],
  },
  {
    name: 'proxy-global member as a new callee stays home',
    code: 'use(new globalThis.Map());',
    stamped: [],
    bare: ['globalThis.Map', 'globalThis'],
  },
  {
    name: 'proxy-global member through an alias of the surface',
    code: 'const g = globalThis;\nhand(g.Map);',
    stamped: ['g.Map'],
    bare: ['globalThis'],
  },
  {
    name: 'proxy-global member past a redundant proxy hop',
    code: 'hand(globalThis.self.Map);',
    stamped: ['globalThis.self.Map'],
    bare: ['globalThis.self'],
  },
  {
    name: 'proxy-global member through a container slot holding the surface',
    code: 'const ns = { g: globalThis };\nhand(ns.g.Map);',
    stamped: ['ns.g.Map'],
    bare: ['ns.g'],
  },
  {
    name: 'proxy-global member off a zero-arg IIFE returning the surface',
    code: 'hand((() => globalThis)().Map);',
    stamped: ['(() => globalThis)().Map'],
    bare: [],
  },
  {
    name: 'container slot holding a bare constructor stamps the slot VALUE',
    code: 'const box = { Base: Map };\nhand(box.Base);',
    stamped: ['Map'],
    bare: ['box.Base'],
  },
  {
    name: 'destructured slot carries the escape and never stamps its receiver',
    code: 'const { Map: Held } = globalThis;\nhand(Held);',
    stamped: ['Map: Held', ['Held', 2]],
    bare: ['globalThis', ['Held', 1]],
  },
  {
    name: 'shorthand destructured slot off the proxy-global surface',
    code: 'const { Map } = globalThis;\nhand(Map);',
    stamped: [['Map', 1], ['Map', 2]],
    bare: ['globalThis'],
  },
  {
    name: 'nested destructured slot, every level read off the receiver',
    code: 'const { self: { Map } } = globalThis;\nhand(Map);',
    stamped: [['Map', 1], ['Map', 2]],
    bare: ['globalThis', 'self: { Map }'],
  },
  {
    name: 'for-of head binds its pattern against the iterated element',
    code: 'for (const { Map } of [globalThis]) hand(Map);',
    stamped: [['Map', 1], ['Map', 2]],
    bare: ['globalThis'],
  },
  {
    name: 'slot paired with a real container value stamps that value, not the slot',
    code: 'const ns = { Map: globalThis.Map };\nconst { Map: Held } = ns;\nhand(Held);',
    stamped: ['globalThis.Map', ['Held', 2]],
    bare: ['Map: Held', 'globalThis'],
  },
  // babel spells a method as a function node of its own where ESTree nests a `FunctionExpression`
  // under `value`: a slot read reaching only `value` answered a HOLE for the babel spelling, and a
  // chain landing on a hole reads as an escape - so these three stamped the READ on one parser only.
  // the level is MIXED on purpose (the binding also holds a proxy-global member): a level of
  // containers alone is indexable, where the hole and the value answer the same
  {
    name: 'method slot off a mixed level holds the method',
    code: 'let M;\nM = globalThis.Map;\nM = { groupBy() { return 1; } };\nhand(M.groupBy);',
    stamped: [],
    bare: ['M.groupBy'],
  },
  {
    name: 'accessor slot off a mixed level holds the accessor',
    code: 'let M;\nM = globalThis.Map;\nM = { get groupBy() { return 1; } };\nhand(M.groupBy);',
    stamped: [],
    bare: ['M.groupBy'],
  },
  {
    name: 'class static method slot off a mixed level holds the method',
    code: 'class NS { static m() { return 1; } }\nlet M;\nM = globalThis.Map;\nM = NS;\nhand(M.m);',
    stamped: [],
    bare: ['M.m'],
  },
  // A method's returns belong to that method. A local host returning another value must not
  // expose a constructor merely mentioned in its nested methods.
  {
    name: "a method's returns are not its host function's",
    code: 'const held = (() => { const box = { g() { return 1; } };\n  return Map; })();\nuse(new held());',
    stamped: [],
    bare: ['Map'],
  },
  {
    name: "... and a method's OWN return still escapes",
    code: 'hand({ g() { return Map; } });',
    stamped: ['Map'],
    bare: [],
  },
  {
    name: 'destructured slot whose binding never escapes stays home',
    code: 'const { Map } = globalThis;\nuse(new Map());',
    stamped: [],
    bare: [['Map', 1], ['Map', 2], 'globalThis'],
  },
  // a CLASS is a container to every other walk here - the keyed read, the container index, the
  // holder position domain - and this one read the two literals alone, so a constructor parked in
  // any of its slots left the file unstamped. each slot kind is a carrier of its own: a static
  // field, an instance field whatever the class constructs exposes, and a private static
  {
    name: 'class static slot hands its constructor out',
    code: 'class NS { static B = Map; }\nhand(NS);',
    stamped: ['Map', ['NS', 2]],
    bare: [['NS', 1]],
  },
  {
    name: 'class expression handed straight to a call',
    code: 'hand(class { static B = Map; });',
    stamped: ['Map'],
    bare: [],
  },
  {
    name: 'instance slot of a handed-out class',
    code: 'class NS { B = Map; }\nhand(NS);',
    stamped: ['Map', ['NS', 2]],
    bare: [['NS', 1]],
  },
  // ... except the PRIVATE one: `NS.#B` is a syntax error anywhere but the class body, and no
  // reflection reaches it, so whoever holds the constructor cannot read that slot back
  {
    name: 'a private static slot of a handed-out class is not one its holder can read',
    code: 'class NS { static #B = Map; }\nhand(NS);',
    stamped: [],
    bare: ['Map', ['NS', 1]],
  },
  {
    name: 'class read through a key this walk cannot fold',
    code: 'class NS { static B = Map; }\nuse(NS[key]);',
    stamped: ['Map'],
    bare: ['NS[key]'],
  },
  {
    name: 'a destructure off a class pairs with no slot, so the class hands out whole',
    code: 'class NS { static B = Map; }\nconst { B: Held } = NS;\nhand(Held);',
    stamped: ['Map', ['Held', 2]],
    bare: [['NS', 1], ['NS', 2]],
  },
  {
    name: 'a class nothing hands out keeps its slot home',
    code: 'class NS { static B = Map; }\nuse(new NS.B());',
    stamped: [],
    bare: ['Map', 'NS.B'],
  },
];

// the span a spelling occupies in its own source, given as the text alone where it is unique there
// or as `[text, nth]` where the shape spells the same name twice - an unqualified text matching more
// than once would silently assert about whichever node came first
function spanKey(code, spelling, label) {
  const [text, nth] = Array.isArray(spelling) ? spelling : [spelling, 0];
  let start = -1;
  for (let seen = 0; seen < (nth || 1); seen++) start = code.indexOf(text, start + 1);
  checkTruthy(`${ label }: '${ text }' occurs ${ nth || 'once' }`,
    start !== -1 && (nth !== 0 || code.indexOf(text, start + 1) === -1));
  return `${ start }:${ start + text.length }`;
}

for (const adapter of adapters) {
  for (const row of ROWS) {
    const label = `${ adapter.name }: ${ row.name }`;
    const program = adapter.parseAndScope(row.code).node;
    collectFileCensus(program, [escapedCtorReferencesReducer()]);
    const stamps = ESCAPED_CTOR_REFS.get(program);
    checkTruthy(`${ label }: census ran`, !!stamps);
    for (const spelling of row.stamped) {
      check(`${ label }: '${ spelling }' stamped`, stamps.has(spanKey(row.code, spelling, label)), true);
    }
    for (const spelling of row.bare) {
      check(`${ label }: '${ spelling }' not stamped`, stamps.has(spanKey(row.code, spelling, label)), false);
    }
    // the halves agree by construction only while every stamp names a node type the claim admits:
    // a stamp on any other type is unreadable, and one sharing a span with the node it wraps would
    // hand a reference the escape of its neighbour
    for (const key of stamps) {
      const owner = findNode(program, node => nodePositionKey(node) === key
        && ESCAPE_STAMPED_NODE_TYPES.has(node.type));
      checkTruthy(`${ label }: stamp ${ key } names a claimable node`, !!owner);
      // ... which is what the reader's own type gate enforces: a wrapper sharing the span (an estree
      // chain over the member it holds, a statement over its sole expression) reads nothing
      const [start, end] = key.split(':').map(Number);
      check(`${ label }: stamp ${ key } is unreadable off a wrapper type`,
        isEscapedCtorNode(program, { type: 'ChainExpression', start, end }), false);
      check(`${ label }: stamp ${ key } is readable off its own node`,
        isEscapedCtorNode(program, { type: owner.type, start, end }), true);
    }
  }
}

// --- the NAME half: which runtime value the escape answers for ---

// each row: the source, the ctor names whose REALM value the file hands out, and the names an
// escape spells while handing out a binding of the file's own. `plugins` extends the babel parser
// where a spelling needs it; oxc keys the same grammar off the `.ts` name the harness parses under
const NAME_ROWS = [
  // Return count does not decide escape. The consumer of the function or its result does.
  ...[
    ['arrow IIFE static', 'export const value = (() => { if (flag) return Array; return custom; })().of(3);'],
    ['function IIFE static', 'export const value = (function () { if (flag) return Array; return custom; })().of(3);'],
    ['named local static', 'function pick() { if (flag) return Array; return custom; } export const value = pick().of(3);'],
    ['unused function', 'function pick() { if (flag) return Array; return custom; }'],
    ['unused object method', 'const box = { pick() { if (flag) return Array; return custom; } };'],
    ['unused class method', 'class Box { pick() { if (flag) return Array; return custom; } }'],
    ['unused loop return', 'function pick() { while (flag) return Array; return custom; }'],
    ['returned wrapper is not its content', 'const box = (arg => [arg])(Array); const { from } = box; from([]);'],
    ['loop-returned wrapper is not its content', 'function pick() { while (flag) return [Array]; return []; } pick().from([]);'],
    ['async returns are wrapped', '(async () => { if (flag) return Array; return custom; })().of(3);'],
    ['generator returns are deferred', '(function* () { if (flag) return Array; return custom; })().of(3);'],
    ['private method of exported class', 'export class Box { #pick() { if (flag) return Array; return custom; } }'],
  ].map(([name, code]) => ({ name: `multiple returns stay local: ${ name }`, code,
    homeOnly: ['Array'], withContainerCensus: true })),
  ...[
    ['call result argument', 'hand((() => { if (flag) return Array; return custom; })());'],
    ['named call result argument', 'function pick() { if (flag) return Array; return custom; } hand(pick());'],
    ['method call result argument', 'const box = { pick() { if (flag) return Array; return custom; } }; hand(box.pick());'],
    ['exported result', 'export const value = (() => { if (flag) return Array; return custom; })();'],
    ['exported function', 'export function pick() { if (flag) return Array; return custom; }'],
    ['function argument', 'hand(() => { if (flag) return Array; return custom; });'],
    ['object method', 'hand({ pick() { if (flag) return Array; return custom; } });'],
    ['nested object call', 'hand({ value: (() => { if (flag) return Array; return custom; })() });'],
    ['nested array call', 'hand([(() => { if (flag) return Array; return custom; })()]);'],
    ['nested selecting call', 'hand(flag ? (() => { if (other) return Array; return custom; })() : null);'],
    ['nested sequence call', 'hand((effect(), (() => { if (flag) return Array; return custom; })()));'],
    ['nested stored call', 'let held; hand(held = (() => { if (flag) return Array; return custom; })());'],
    ['returned call', 'hand(() => (() => { if (flag) return Array; return custom; })());'],
    ['class method', 'export class Box { pick() { if (flag) return Array; return custom; } }'],
    ['inherited namespace', 'export class Box extends (() => { if (flag) return Array; return custom; })() {}'],
    ['effect before local read', 'export const value = (() => { hand(Array); if (flag) return Array; return custom; })().of(3);'],
  ].map(([name, code]) => ({ name: `multiple returns escape through ${ name }`, code,
    realm: ['Array'], mintedToo: ['Array'], withContainerCensus: true })),
  ...[
    ['loop return', 'function pick() { while (flag) return Promise; return custom; } pick().all([]);'],
    ['try return', 'function pick() { try { return Promise; } catch { return custom; } } pick().any([]);'],
    ['forwarded loop return', 'function inner() { while (flag) return Promise; return custom; }'
      + ' function outer() { return inner(); } outer().all([]);'],
    ['stored loop return', 'function inner() { while (flag) return Promise; return custom; }'
      + ' const value = inner(); function outer() { return value; } outer().all([]);'],
    ['method loop return', 'const box = { pick() { while (flag) return Promise; return custom; } }; box.pick().all([]);'],
    ['unknown member', '(() => { if (flag) return Promise; return custom; })()[key];'],
  ].map(([name, code]) => ({ name: `unresolved local static still needs its namespace: ${ name }`, code,
    realm: ['Promise'], mintedToo: ['Promise'], withContainerCensus: true })),
  ...[
    ['static comparison', 'Object.is(Map, Map);'],
    ['static enumeration', 'Object.keys(Map);'],
    ['bare conversion', 'String(Map);'],
    ['constructor argument', 'new Set([Map]);'],
    ['native invoker', 'Reflect.apply(fn, null, [Map]);'],
    ['callback argument', 'JSON.stringify(Map, callback);'],
    ['spread arguments', 'Object.is(...args, Map);'],
    ['static alias', 'const compare = Object.is; compare(Map, Map);'],
    ['namespace alias', 'const O = Object; O.keys(Map);'],
    ['destructured static', 'const { is: compare } = Object; compare(Map, Map);'],
    ['realm static', 'globalThis.Object.keys(Map);'],
    ['realm alias', 'const realm = globalThis; realm.Object.keys(Map);'],
    ['computed static', 'Object[(effect(), "keys")](Map);'],
    ['array instance', '[].includes(Map);'],
    ['array alias instance', 'const list = []; list.includes(Map);'],
    ['constructed instance', 'new Set().has(Map);'],
    ['constructed alias instance', 'const values = new Set(); values.has(Map);'],
    ['repeated global beside a local namesake',
      'function hidden() { const Object = unknown; } Object.is(Map, Map); Object.is(Map, Map);'],
    ['repeated alias beside a local namesake',
      'function hidden() { const compare = unknown; } const compare = Object.is; compare(Map, Map); compare(Map, Map);'],
  ].map(([name, code]) => ({
    name: `builtin argument does not widen: ${ name }`, code,
    homeOnly: ['Map'], withContainerCensus: true,
  })),
  {
    name: 'builtin argument still exposes an enum to mutation analysis',
    code: 'enum Keys { METHOD = "map" } Object.assign(Keys, { METHOD: "filter" });',
    local: ['Keys'], withContainerCensus: true,
  },
  ...[
    ['unknown function', 'unknown(Map);'],
    ['unknown member', 'unknown.keys(Map);'],
    ['unknown realm member', 'globalThis.unknown(Map);'],
    ['shadowed namespace', 'function read(Object) { Object.keys(Map); } read(unknown);'],
    ['shadowed global', 'function read(String) { String(Map); } read(unknown);'],
    ['mixed callee alias', 'let read = Object.keys; read = unknown; read(Map);'],
    ['replaced static', 'Object.keys = unknown; Object.keys(Map);'],
    ['user method', 'const host = { keys(value) { hand(value); } }; host.keys(Map);'],
    ['direct export beside builtin call', 'Object.keys(Map); export const value = Map;'],
  ].map(([name, code]) => ({
    name: `builtin argument boundary: ${ name }`, code,
    realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true,
  })),
  // the alias graph holds every value these bindings take, so a leaf spelling one hands out that
  // value - and whatever the value NAMES the walk reaches on its own, stamping it where it stands
  {
    name: 'a block let shadowing the ctor',
    code: '{ let Map = 1; hand(Map); }\nuse(new Map());',
    realm: [],
    local: ['Map'],
  },
  {
    name: 'a block const shadowing the ctor',
    code: '{ const Map = 1; hand(Map); }\nuse(new Map());',
    realm: [],
    local: ['Map'],
  },
  {
    name: "a function's own var shadowing the ctor",
    code: 'function shell() { var Map = 1; hand(Map); }\nshell();\nuse(new Map());',
    realm: [],
    local: ['Map'],
  },
  {
    name: 'a nested class declaration named as the ctor',
    code: 'function shell() { class Map {} hand(Map); }\nshell();\nuse(new Map());',
    realm: [],
    local: ['Map'],
  },
  {
    name: "a named function expression's own name",
    code: 'const K = function Map() { hand(Map); };\nK();\nuse(new Map());',
    realm: [],
    local: ['Map'],
  },
  {
    name: "a class expression's own name",
    code: 'const K = class Map { m() { hand(Map); } };\nnew K().m();\nuse(new Map());',
    realm: [],
    local: ['Map'],
  },
  // ... and that name reaches its own body and nowhere else, so a reference OUTSIDE the expression
  // is the realm's. reading it as the enclosing scope's puts a binding where none ever stood
  {
    name: 'a function expression name binds nothing outside the expression',
    code: 'const K = function Map() { return 1; };\nhand(Map);\nuse(new K());',
    realm: ['Map'],
    local: [],
  },
  {
    name: 'a declarator destructuring the name out of a container',
    code: 'function shell(box) { const { x: Map } = box; hand(Map); }\nshell({});\nuse(new Map());',
    realm: [],
    local: ['Map'],
  },
  {
    name: 'a classic for head binding the name',
    code: 'for (let Map = 0; Map < 1; Map++) hand(Map);\nuse(new Map());',
    realm: [],
    local: ['Map'],
  },
  {
    name: 'a for-in head over the ctor beside a body declaration of it',
    code: 'for (const key in Promise) { let Promise = 1; use(Promise, key); }\nuse(new Promise(function (r) { r(); }));',
    realm: [],
    local: ['Promise'],
  },
  // ... and the same graph is why the narrow costs nothing: a binding that took the realm's
  // constructor answers for it through the value, not through the spelling
  {
    name: 'an accountable binding HOLDING the realm constructor still answers for it',
    code: '{ let Map = globalThis.Map; hand(Map); }\nuse(new Map());',
    realm: ['Map'],
    local: [],
  },
  {
    name: '... and one written from the realm after its declaration',
    code: '{ let Map; Map = globalThis.Map; hand(Map); }\nuse(new Map());',
    realm: ['Map'],
    local: [],
  },
  // the bindings fed from OUTSIDE the file: the census holds no value for them, so a leaf spelling
  // one is no proof the realm's constructor stayed home
  {
    name: 'a plain parameter takes whatever the caller passed',
    code: 'function shell(Map) { hand(Map); }\nshell(globalThis.Map);\nuse(new Map());',
    realm: ['Map'],
    local: [],
  },
  {
    name: 'an arrow parameter likewise',
    code: 'const shell = (Map) => { hand(Map); };\nshell(globalThis.Map);\nuse(new Map());',
    realm: ['Map'],
    local: [],
  },
  {
    name: 'a parameter destructured off the proxy global IS the realm constructor',
    // the call's RESULT has to go somewhere for the leaf to be observed at all - a discarded one
    // hands nothing out, and the row would pass on the escape it never made
    code: 'function shell({ Map } = globalThis) { return Map; }\nuse(shell());\nuse(new Map());',
    realm: ['Map'],
    local: [],
  },
  {
    name: 'a catch parameter takes whatever was thrown',
    code: 'try { seed(); } catch (Map) { hand(Map); }\nuse(new Map());',
    realm: ['Map'],
    local: [],
  },
  {
    name: 'a for-of head takes whatever the iteration yielded',
    code: 'for (const Map of list) hand(Map);\nuse(new Map());',
    realm: ['Map'],
    local: [],
  },
  {
    name: 'an import local takes whatever the other module exports',
    code: "import { Map } from './m.js';\nhand(Map);",
    realm: ['Map'],
    local: [],
  },
  // the slots a scope holds but does not COVER. a body `var` lands on the function node, which
  // stands in the chain of these slots exactly as it does in the body's, so a chain read whole
  // would call every one of them shadowed
  {
    name: 'a parameter default reads past the body it precedes',
    code: 'function shell(x = hand(Map)) { var Map = 1; return [x, Map]; }\nshell();\nuse(new Map());',
    realm: ['Map'],
    local: [],
  },
  {
    name: "a method's computed key runs where the class is defined",
    code: 'class B { [hand(Map)]() { var Map = 1; return Map; } }\nnew B();\nuse(new Map());',
    realm: ['Map'],
    local: [],
  },
  {
    name: "a method's own decorator runs there too",
    code: 'class B { @dec(hand(Map)) m() { var Map = 1; return Map; } }\nnew B().m();\nuse(new Map());',
    realm: ['Map'],
    local: [],
    plugins: ['decorators-legacy'],
  },
  {
    name: 'a parameter decorator runs outside the parameter list AND the body',
    code: 'class B { m(@dec(hand(Map)) p) { var Map = 1; return [p, Map]; } }\nnew B().m(1);\nuse(new Map());',
    realm: ['Map'],
    local: [],
    plugins: ['decorators-legacy'],
  },
  // ... and the trim is a scope, not a blanket: everything the slot IS covered by still shadows
  {
    name: 'an outer block still shadows a parameter default inside it',
    code: '{ let Map = 1; function shell(x = hand(Map)) { return x; } shell(); }\nuse(new Map());',
    realm: [],
    local: ['Map'],
  },
  {
    name: 'a computed key written in a default stands outside TWO scopes at once',
    code: 'function shell(x = class { [hand(Map)]() { var Map = 1; return Map; } }) { var Map = 2; return [x, Map]; }\nshell();\nuse(new Map());',
    realm: ['Map'],
    local: [],
  },
  {
    name: 'a closure written in a default keeps every binding of its own',
    code: 'function shell(cb = function () { var Map = 1; hand(Map); }) { return cb; }\nshell();\nuse(new Map());',
    realm: [],
    local: ['Map'],
  },
  // tsc erases an ambient declaration, so the reference reaches the realm at runtime and the file
  // hands the realm's constructor out
  {
    name: 'an ambient declaration is no binding at runtime',
    code: 'declare const Map: any;\nhand(Map);',
    realm: ['Map'],
    local: [],
  },
  // the OTHER two spellings the census names an escape by: neither is a binding read, so neither
  // narrows - a pattern slot and a proxy hop both spell a member KEY off the realm's own surface,
  // and the binding they bind is exactly what the leaf half stops answering for
  {
    name: 'a shorthand slot off the proxy global answers through the SLOT',
    code: 'const { Map } = globalThis;\nhand(Map);',
    realm: ['Map'],
    local: [],
  },
  {
    name: 'a renamed slot answers under the key it read, not the binding it bound',
    code: 'const { Map: Held } = globalThis;\nhand(Held);',
    realm: ['Map'],
    local: [],
  },
  {
    name: 'a proxy hop handed straight out answers through the CHAIN',
    code: 'hand(globalThis.Map);',
    realm: ['Map'],
    local: [],
  },
  // ... and the second stamper: the container census stamps an opaque container and an inherited
  // static from its OWN result, so the narrow has to reach a walk this reducer never starts
  {
    name: 'an inherited static off a realm base is the realm constructor',
    code: 'class C extends Map {}\nuse(C.groupBy);',
    realm: ['Map'],
    local: [],
    withContainerCensus: true,
  },
  {
    name: '... and off a base this file declared it is not',
    code: 'function shell() { class Map {} class C extends Map {} return C.groupBy; }\nshell();',
    realm: [],
    local: ['Map'],
    withContainerCensus: true,
  },
  // a binding this census cannot ENUMERATE splits the two flavors: it MIGHT hold the realm's
  // constructor, which usage-global owes a family for (it patches the one slot every read lands on),
  // while usage-pure substitutes its minted binding only where the realm is proven. a slot the file
  // itself fills - a parameter DEFAULT, an argument at a call the source spells where it stands - is
  // that binding after all, and both flavors owe it
  {
    name: 'a parameter with no value of its own is owed by the patched slot alone',
    code: 'export function shell(Map) { hand(Map); }\nuse(new Map());',
    globalOnly: ['Map'],
  },
  {
    name: '... and a for-x head over a list this file does not spell reads the same way',
    code: 'for (const Map of list) hand(Map);\nuse(new Map());',
    globalOnly: ['Map'],
  },
  {
    name: '... while a parameter DEFAULT is a value the file spells, so both flavors owe it',
    code: 'function shell({ Map } = globalThis) { hand(Map); }\nuse(new Map());',
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: '... and so is the argument of a call the source writes where the function stands',
    code: 'use((function ({ Map }) { return Map; })(globalThis));',
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: '... and a default one LEVEL DOWN is a value the file spells just as much',
    code: 'export function shell([{ Map } = globalThis]) { hand(Map); }\nuse(new Map());',
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  // a name is resolved the way the language resolves it: the INNERMOST binding the reference's own
  // scope chain reaches owns it. a leaf standing inside a shadow hands out the SHADOW's value, and
  // the outer binding of that name keeps whatever it holds - answering by spelling alone widened a
  // constructor a shadow's number was handed out under
  {
    name: 'a leaf inside a shadow hands out the shadow, not the outer alias',
    code: 'let W = Map;\n{ let W = 0; hand(W); }\nuse(W.groupBy([1], x => x));',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: '... and the same leaf OUTSIDE the shadow hands out the outer alias after all',
    code: 'let W = Map;\nhand(W);\nuse(W.groupBy([1], x => x));',
    realm: ['Map'],
  },
  {
    name: '... and the shadow may wear the constructor name itself, holding a value of its own',
    code: 'let Map = Promise;\n{ let Map = 0; hand(Map); }\nuse(new Map());',
    realm: [],
    homeOnly: ['Promise'],
    local: ['Map'],
  },
  {
    name: 'a member escape cannot reach a namesake in another function',
    code: 'function hidden() { const box = { value: Map }; return box.value.groupBy([1], x => x); }'
      + ' export function read() { const box = { value: Set }; return box.value; }',
    realm: ['Set'],
    homeOnly: ['Map'],
    withContainerCensus: true,
  },
  {
    name: 'cached member roots keep both bindings when both escape',
    code: 'export function first() { const box = { value: Map }; return box.value; }'
      + ' export function second() { const box = { value: Set }; return box.value; }',
    realm: ['Map', 'Set'],
    withContainerCensus: true,
  },
  {
    name: 'nested shadows select the nearest owner and restore the enclosing owner',
    code: 'const box = { value: Map }; { const box = { value: Set };'
      + ' { const box = { value: WeakMap }; hand(box.value); } hand(box.value); }'
      + ' use(box.value.groupBy([1], x => x));',
    realm: ['Set', 'WeakMap'],
    homeOnly: ['Map'],
    withContainerCensus: true,
  },
  {
    name: 'an alias path may cross two bindings with the same name',
    code: 'const x = { payload: Map }; const box = { x };'
      + ' export function read() { const { x } = box; return x.payload; }',
    realm: ['Map'],
    withContainerCensus: true,
  },
  {
    name: 'an unrelated later declaration cannot own an outer member escape',
    code: 'const box = { value: Map }; export function read() { return box.value; }'
      + ' function hidden() { const box = { value: Set }; return box.value; }',
    realm: ['Map'],
    homeOnly: ['Set'],
  },
  {
    name: 'a parameter default keeps the alias outside the body var scope',
    code: 'const box = { value: Map };'
      + ' export function read(arg = box) { var box = { value: Set }; return arg.value; }',
    realm: ['Map'],
    homeOnly: ['Set'],
    withContainerCensus: true,
  },
  {
    name: 'a closure in a parameter default cannot reach the body alias',
    code: 'const box = { value: Map };'
      + ' export function read(arg = () => box) { var box = { value: Set }; return arg().value; }',
    realm: ['Map'],
    // The coarse member-read census still retains the namesake slot for pure emission.
    heldInSlot: ['Set'],
    withContainerCensus: true,
  },
  {
    name: 'a later parameter default can read an earlier parameter',
    code: 'const box = { value: Map };'
      + ' export function read(box = { value: Set }, arg = box) { return arg.value; }',
    realm: ['Set'],
    withContainerCensus: true,
  },
  {
    name: 'a write without a recorded owner remains a conservative alias value',
    code: 'let box = { value: Map }; function replace() { box = { value: Set }; } hand(box.value);',
    realm: ['Map', 'Set'],
  },
  // The census preserves the property read: a getter's effects do not hide its returned realm.
  {
    name: 'a hop paired through a pure-return getter reaches the realm behind it',
    code: 'const { w: { Map: Held } } = { get w() { return globalThis; } };\nhand(Held);',
    realm: ['Map'],
  },
  {
    name: 'an effectful getter still hands its returned constructor out',
    code: 'const { w: { Map: Held } } = { get w() { mark(); return globalThis; } };\nhand(Held);',
    realm: ['Map'],
    mintedToo: ['Map'],
    withContainerCensus: true,
  },
  ...[
    ['exported declaration', 'const source = { get w() { mark(); return globalThis; } }; export const { w: { Map: Held } } = source;'],
    ['alias and preceding default', 'let source = { first: undefined, get w() { mark(); return globalThis; } };'
      + ' const { first = (source = {}, 1), w: { Map: Held } } = source; export { Held };'],
    ['assignment', 'let Held; ({ w: { Map: Held } } = { get w() { mark(); return globalThis; } }); hand(Held);'],
    ['array wrapper', 'const [{ w: { Map: Held } }] = [{ get w() { mark(); return globalThis; } }]; hand(Held);'],
    ['loop binding', 'for (const { w: { Map: Held } } of [{ get w() { mark(); return globalThis; } }]) hand(Held);'],
    ['parameter default', 'export function read({ w: { Map: Held } } = { get w() { mark(); return globalThis; } }) { return Held; }'],
    ['separate receiver binding', 'const { w } = { get w() { mark(); return globalThis; } }; const { Map: Held } = w; hand(Held);'],
  ].map(([name, code]) => ({ name: `getter escape through ${ name }`, code,
    realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true })),
  ...[
    ['local constructor', 'const { w: { Map: Held } } = { get w() { mark(); return globalThis; } }; new Held();'],
    ['local realm shadow', 'const { w: { Map: Held } } = { get w() { mark(); const globalThis = {}; return globalThis; } }; hand(Held);'],
    ['this-dependent return', 'const { w: { Map: Held } } = { get w() { mark(); return this; } }; hand(Held);'],
    ['overridden getter', 'const { w: { Map: Held } } = { get w() { mark(); return globalThis; }, w: {} }; hand(Held);'],
    ['static extraction', 'const { w: { Map: { groupBy } } } = { get w() { mark(); return globalThis; } }; hand(groupBy);'],
  ].map(([name, code]) => ({ name: `getter pairing keeps ${ name } narrow`, code,
    homeOnly: ['Map'], withContainerCensus: true })),
  // ... and the third answer: a constructor this file only STORED. a write puts its value inside the
  // receiver rather than handing it out, so where the container never leaves, the value is reachable
  // exactly where the container is - which usage-global can still see, and usage-pure cannot read
  // back at all. `heldInSlot` is that half: no escape, and the minted-binding flavor still owes it
  {
    name: 'a slot write into a container read only through a key hands nothing out',
    code: 'const c = { k: Object };\nc.k = Map;\nuse(c.k.groupBy);',
    realm: [],
    heldInSlot: ['Map'],
    withContainerCensus: true,
  },
  {
    name: '... and a BARE read of that container hands it out after all',
    code: 'const c = { k: Object };\nc.k = Map;\nhand(c);',
    realm: ['Map'],
    withContainerCensus: true,
  },
  {
    name: '... as does an export of it, which no walk here can follow to its readers',
    code: 'const c = { k: Object };\nc.k = Map;\nexport { c };',
    realm: ['Map'],
    withContainerCensus: true,
  },
  {
    name: '... and the declaration spelling of that export, which binds the name the same way',
    code: 'export const c = { k: Object };\nc.k = Map;\nuse(c.k.groupBy);',
    realm: ['Map'],
    withContainerCensus: true,
  },
  {
    name: '... and a receiver this census cannot name IS the outside',
    code: 'sink.slot = Map;',
    realm: ['Map'],
    withContainerCensus: true,
  },
  {
    name: 'a write nothing ever reads back is owed by neither flavor',
    code: 'const c = { k: Object };\nc.k = Map;\nuse(1);',
    realm: [],
    homeOnly: ['Map'],
    withContainerCensus: true,
  },
  // the call-argument twin: an argument landing in a DESTRUCTURING parameter of a callee spelled
  // inline is owned by the pattern pairer, exactly as a destructure DEFAULT is
  {
    name: 'an argument landing in an inline callee pattern parameter stays home',
    code: 'use((({ groupBy }) => groupBy)(Map));',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: '... and so does the shadowed spelling that raised it',
    code: 'use(function ({ groupBy }, Map) { return groupBy; }(globalThis.Map));',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: '... an IDENTIFIER parameter holds the value whole, and a MEMBER read off it names what it takes',
    code: 'use(((M) => M.groupBy)(Map));',
    realm: [],
    local: [],
  },
  {
    name: '... while a BARE read of that same parameter is the hand-out',
    code: 'use(((M) => hand(M))(Map));',
    realm: ['Map'],
    local: [],
  },
  {
    name: '... and a member WRITE through it belongs to the mutation census, not this one',
    code: 'use(((M) => { M.groupBy = patch; })(Map));',
    heldInSlot: ['Map'],
    local: [],
  },
  {
    name: '... a key the pattern cannot name reads a slot nothing here names',
    code: 'use((({ [pick()]: got }) => got)(Map));',
    realm: ['Map'],
    local: [],
  },
  {
    name: '... a REST element takes every own property in one binding',
    code: 'use((({ groupBy, ...rest }) => rest)(Map));',
    realm: ['Map'],
    local: [],
  },
  {
    name: '... and an `arguments` read reaches the whole argument past the pattern',
    code: 'use(function ({ groupBy }) { return arguments[0]; }(Map));',
    realm: ['Map'],
    local: [],
  },
  {
    name: 'arguments in a parameter default still exposes the supplied value',
    code: 'function f(unused, value = arguments[0]) { return value; } use(f(Map));',
    realm: ['Map'],
    mintedToo: ['Map'],
    withContainerCensus: true,
  },
  {
    name: 'arguments captured by a nested arrow still exposes the outer value',
    code: 'function f(unused) { return () => arguments[0]; } use(f(Map));',
    realm: ['Map'],
    mintedToo: ['Map'],
    withContainerCensus: true,
  },
  {
    name: 'arguments in an unrelated function does not expose a dropped parameter',
    code: 'function f(unused) { return 1; } function g() { return arguments[0]; } f(Map); use(g);',
    homeOnly: ['Map'],
    withContainerCensus: true,
  },
  {
    name: 'a constructor can expose arguments through its returned arrow',
    code: 'class C { constructor(unused) { return () => arguments[0]; } } use(new C(Map));',
    realm: ['Map'],
    mintedToo: ['Map'],
    withContainerCensus: true,
  },
  {
    name: '... and a spread ahead of the slot leaves no position to pair by',
    code: 'use(((first, { groupBy }) => groupBy)(...list, Map));',
    realm: ['Map'],
  },
  // A closed caller set supplies one known constructor. Both the named pattern and the member
  // read can attribute their exact static without handing the constructor itself out.
  {
    name: 'a named pattern attributes the supplied constructor static',
    code: 'function f({ groupBy }) { return groupBy; }\nuse(f(Map));',
    homeOnly: ['Map'],
  },
  {
    name: 'a selected static beside custom callers does not expose the constructor globally',
    code: 'function f({ from }) { return from; } f(Array); f({ from: x => x }); f({});',
    heldInSlot: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'custom callers before the static source keep its global obligation narrow',
    code: 'function f({ from }) { return from; } f({}); f({ from: x => x }); f(Array);',
    heldInSlot: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'nested selected statics keep the constructor inside the argument',
    code: 'function f({ slot: [{ from }] }) { return from; } f({ slot: [Array] }); f({ slot: [{}] });',
    heldInSlot: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'an IIFE returning the receiver is covered by the selected default static',
    code: 'let saved; function f([{ from } = Array]) { return typeof from; }'
      + ' f([(function source() { saved = source; return Array; })()]); saved() === Array;',
    heldInSlot: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'a selected static does not cover a different supplied constructor',
    code: 'function f({ from }) { return from; } f(Array); f(Set);',
    heldInSlot: ['Array'],
    realm: ['Set'],
    withContainerCensus: true,
  },
  {
    name: 'a later caller supplies its static even when an earlier receiver lacks it',
    code: 'function f({ from }) { return from; } f(Object); f(Array);',
    heldInSlot: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'an earlier constructor alias keeps a different receiver independently covered',
    code: 'const C = Set; function f({ from }) { return from; } f(C); f(Array);',
    heldInSlot: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'an earlier member receiver keeps a different constructor independently covered',
    code: 'function f({ from }) { return from; } f(globalThis.Set); f(Array);',
    heldInSlot: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'a shadowed earlier receiver does not hide a later caller static',
    code: 'function f({ from }) { return from; } { const Array = Set; f(Array); } f(Array);',
    heldInSlot: ['Array'],
    withContainerCensus: true,
  },
  ...[
    ['flat', '{ of } = Array', 'globalThis.Array'],
    ['array', '[{ of } = Array]', '[globalThis.Array]'],
    ['nested', '{ slot: [{ of } = Array] }', '{ slot: [globalThis.Array] }'],
  ].map(([name, parameter, argument]) => ({
    name: `an opaque default does not expose a known caller: ${ name }`,
    code: `export function outer(Array) { function f(${ parameter }) { return of(1); } return f(${ argument }); }`,
    heldInSlot: ['Array'], withContainerCensus: true,
  })),
  {
    name: 'a bare constructor selected from a wrapper still needs its namespace',
    code: 'function f({ value }) { return value; } use(f({ value: Array }));',
    realm: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'arguments exposes the whole source past a selected static',
    code: 'function f({ from }) { return arguments[0]; } use(f(Array)); f({});',
    realm: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'rest exposes properties beyond the selected static',
    code: 'function f({ from, ...rest }) { return rest; } use(f(Array)); f({});',
    realm: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'an unknown selected key still requires the constructor namespace',
    code: 'function f({ [key]: value }) { return value; } use(f(Array)); f({});',
    realm: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'an exported parameter host has no proof of its supplied static reads',
    code: 'export function f({ from }) { return from; } f(Array); f({});',
    realm: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'an IIFE keeps its internal constructor name in the supplied receiver proof',
    code: 'function f([{ from } = Array]) { return from; } f([(function Array() { return Array; })()]);',
    homeOnly: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'an IIFE returning a spread-shifted wrapper cannot prove the supplied receiver',
    code: 'function f([, { from }]) { return from; } f((() => [...values, Array])());',
    realm: ['Array'],
    withContainerCensus: true,
  },
  {
    name: 'a plain parameter member read keeps its known constructor local',
    code: 'function f(ns) { return ns.groupBy; } f(Map);',
    homeOnly: ['Map'],
    withContainerCensus: true,
  },
  {
    name: 'a computed parameter member read keeps its known constructor local',
    code: 'function f(ns) { return ns["groupBy"]; } f(Map);',
    homeOnly: ['Map'],
    withContainerCensus: true,
  },
  {
    name: 'an inline member read beside a yielded slot keeps both argument obligations',
    code: 'const box = ((M, S) => ({ first: M, from: S.from }))(Map, Set); use(box.first.groupBy);',
    realm: ['Map', 'Set'],
    mintedToo: ['Map', 'Set'],
    withContainerCensus: true,
  },
  {
    name: 'an inline literal holding only parameter values keeps its tracked slots narrow',
    code: 'const box = ((M, S) => ({ first: M, second: S }))(Map, Set); use(box.first.groupBy, box.second.from);',
    homeOnly: ['Map', 'Set'],
    withContainerCensus: true,
  },
  // the other way a call keeps the value: the callee hands it straight BACK, so the call is the
  // argument and only what happens to the CALL can hand it out
  {
    name: 'an argument a callee returns unchanged stays home',
    code: 'const id = x => x;\nuse(id(Map).groupBy);',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: '... and it leaves wherever the call itself does',
    code: 'function leak(x) { globalThis.taken = x; }\nconst id = x => x;\nleak(id(Map));',
    realm: ['Map'],
  },
  {
    name: '... a body that is anything BESIDE the parameter can pass it on',
    code: 'function leak(x) { globalThis.taken = x; }\nconst id = x => { leak(x); return x; };\nuse(id(Map).groupBy);',
    realm: ['Map'],
  },
  {
    name: '... and a name this file binds twice answers for no callee at all',
    code: 'function leak(x) { globalThis.taken = x; }\nlet id = x => x;\nid = y => { leak(y); return y; };\nuse(id(Map).groupBy);',
    realm: ['Map'],
  },
  // a PARAMETER is the one unaccountable shape with a second question behind it: the caller supplies
  // the value, so where this file spells every caller, what the parameter holds is what those calls
  // put there. a construct bound once and read only as a CALLEE reaches no caller the walk misses
  {
    name: 'a parameter of a construct only this file calls holds what the calls put there',
    code: 'function f(Map) { return [Map]; }\nuse(f(1));',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: '... and the same for a class, whose callers are its `new`s',
    code: 'class B { constructor(Map) { return [Map]; } }\nnew B(1);',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: '... and the value a call DOES put there answers for the realm, through the parameter',
    code: 'function f(Map) { return [Map]; }\nuse(f(globalThis.Map));',
    realm: ['Map'],
  },
  // ... and the ways a caller this file never spells reaches the construct anyway
  {
    name: '... an EXPORTED construct is called by importers this walk never sees',
    code: 'export function f(Map) { return [Map]; }\nuse(f(1));',
    realm: ['Map'],
  },
  {
    name: '... a name read anywhere but the callee slot can be called from where that read lands',
    code: 'function f(Map) { return [Map]; }\nconst g = f;\nuse(g(1));',
    realm: ['Map'],
  },
  {
    name: '... a DECORATOR is handed the class it hangs off, parameter decorators included',
    code: 'class B { constructor(@dec(1) Map) { return [Map]; } }\nnew B(1);',
    plugins: ['decorators-legacy'],
    realm: ['Map'],
  },
  {
    name: '... a base class is constructed by every `super()` its subclasses spell',
    code: 'class B { constructor(Map) { return [Map]; } }\nclass D extends B {}\nuse(new B(1));',
    realm: ['Map'],
  },
  // ... and the argument shapes that leave no value to pair the slot with
  {
    name: '... a spread ahead of the slot leaves no position to pair by',
    code: 'function f(Map) { return [Map]; }\nuse(f(...list));',
    realm: ['Map'],
  },
  {
    name: '... a REST parameter takes a list rather than a value',
    code: 'function f(...Map) { return [Map]; }\nuse(f(1));',
    realm: ['Map'],
  },
  {
    name: '... an `arguments` read reaches the slot past the parameter list',
    code: 'function f(Map) { void arguments; return [Map]; }\nuse(f(1));',
    realm: ['Map'],
  },
  {
    name: '... and a name this file binds twice names no one construct to ask about',
    code: 'function f(Map) { return [Map]; }\nfunction g(f) { f(globalThis.Map); }\nuse(f(1));',
    realm: ['Map'],
  },
  // an exported DESTRUCTURING declarator hands out the SLOTS its pattern names, never the value it
  // took them from - the same answer the specifier spelling of that export already gave
  {
    name: 'an exported destructure hands out its slots, not the value they came from',
    code: 'export const { k } = Map;',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: '... and the specifier spelling of the same export agrees',
    code: 'const { k } = Map;\nexport { k };',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: '... but the whole CONTAINER exported is handed out',
    code: 'export const box = Map;',
    realm: ['Map'],
  },
  {
    name: '... and a REST element reaches past the slots the pattern spells',
    code: 'export const { k, ...rest } = Map;',
    realm: ['Map'],
  },
  // a class hands out what it INHERITS along with what it declares: the base answers every static
  // read off the subclass name, and the reader need not be this file
  {
    name: 'a handed-out class hands out the base it extends',
    code: 'class C extends Map {}\nhand(C);',
    realm: ['Map'],
  },
  {
    name: '... and the base of a class that stays home does not leave with it',
    code: 'class C extends Map {}\nuse(new C());',
    realm: [],
    homeOnly: ['Map'],
  },
  // ... and the ways a value reaches a caller this file does not spell, or fails to
  {
    name: 'a JSX element hands its component to the renderer',
    code: 'use(<Map x={1} />);',
    plugins: ['jsx'],
    globalOnly: ['Map'],
  },
  {
    name: 'a JSX tag does not widen the constructor pure substitutes elsewhere',
    code: 'use(<Map />);\nuse(new Map());',
    plugins: ['jsx'],
    globalOnly: ['Map'],
  },
  {
    name: 'JSX name slots do not hand out same-named globals',
    code: 'use(<host Map="x" />, <ns.Map />, <Map.Provider />, <ns:Map />);\nuse(new Map());',
    plugins: ['jsx'],
    homeOnly: ['Map'],
  },
  {
    name: 'a JSX expression container does hand out its runtime value',
    code: 'use(<host value={Map} />);\nuse(new Map());',
    plugins: ['jsx'],
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: 'a local JSX component alias carries the constructor pure put into it',
    code: 'const Component = Map;\nuse(<Component />);',
    plugins: ['jsx'],
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: 'a later local JSX component still hands out its return value',
    code: 'use(<Map />);\nfunction Map() { return Promise; }',
    plugins: ['jsx'],
    realm: ['Promise'],
    mintedToo: ['Promise'],
  },
  {
    name: 'an unused tagged interpolation occupies its argument slot and stays home',
    code: 'function tag(strings, value) {}\ntag`${Map}`;\nuse(new Map());',
    homeOnly: ['Map'],
  },
  {
    name: 'a tag parameter before an unused interpolation does not consume it',
    code: 'function tag(strings, value) { return value; }\ntag`${0}${Map}`;\nuse(new Map());',
    homeOnly: ['Map'],
  },
  {
    name: 'a named tag member read keeps its known constructor local',
    code: 'function tag(strings, value) { return value.groupBy; }\ntag`${Map}`;',
    homeOnly: ['Map'],
  },
  {
    name: 'an inline tag member read keeps its known constructor local',
    code: '(function(strings, value) { return value.groupBy; })`${Map}`;',
    homeOnly: ['Map'],
  },
  {
    name: 'a named tag pattern attributes the supplied constructor static',
    code: 'function tag(strings, { groupBy }) { return groupBy; }\ntag`${Map}`;',
    homeOnly: ['Map'],
  },
  {
    name: 'an opaque tag still hands every interpolation out',
    code: 'tag`${Map}`;',
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: 'a tag accessing arguments can read the interpolation without a parameter',
    code: 'function tag(strings) { return arguments[1]; }\ntag`${Map}`;',
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: 'a shadowed tag cannot borrow an unrelated function body',
    code: 'function tag(strings, value) {}\nfunction invoke(tag) { tag`${Map}`; }',
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: 'a shadowed ordinary callee cannot borrow an unrelated function body',
    code: 'function drop(value) {}\nfunction invoke(drop) { drop(Map); }',
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: 'a tag outside the scope of a local function remains opaque',
    code: '{ function tag(strings, value) {} }\ntag`${Map}`;',
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: 'a later rest element retains an interpolation beyond the fixed parameters',
    code: 'function tag(strings, ...values) { hand(values); }\ntag`${0}${Map}`;',
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: 'a parameter default can hand out an interpolation the body never reads',
    code: 'function tag(strings, value, other = hand(value)) {}\ntag`${Map}`;',
    realm: ['Map'],
    mintedToo: ['Map'],
  },
  {
    name: 'a type-only this parameter does not shift tagged interpolation positions',
    code: 'function tag(this: void, strings, value) { return value.groupBy; }\ntag`${Map}`;',
    homeOnly: ['Map'],
  },
  {
    name: '... and `&&` hands its LEFT operand on only where that operand is falsy',
    code: 'export const v = Map && 1;',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: '... a callee whose body never reads the parameter puts the value nowhere',
    code: 'function drop(x) { return 1; }\ndrop(Map);\nuse(new Map());',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: '... and a parameter list too short to reach the position drops it too',
    code: 'const none = () => 1;\nnone(Map);\nuse(new Map());',
    realm: [],
    homeOnly: ['Map'],
  },
  {
    name: 'a write through a key this census cannot name lands in a slot, not outside',
    code: "const c = { d: 1 };\nconst dyn = 'd';\nc[dyn] = Map;\nuse(c.d);",
    realm: [],
    heldInSlot: ['Map'],
  },
  {
    name: 'a guarded realm result carries the constructor read by its outer member',
    code: 'function f(c) { if (c) { var g = globalThis; } g.Promise.allSettled([]); }',
    heldInSlot: ['Promise'],
    withContainerCensus: true,
  },
  {
    name: 'a replaced realm result carries its constructor through an identity guard',
    code: 'function f(src) { let g = globalThis; [g] = src; g.Map.groupBy([]); }',
    heldInSlot: ['Map'],
    withContainerCensus: true,
  },
  {
    name: 'the constructor obligation follows a later alias of a guarded realm',
    code: 'function f() { try { var g = globalThis; } finally {} const held = g; held.Promise.allSettled([]); }',
    heldInSlot: ['Promise'],
    withContainerCensus: true,
  },
  {
    name: 'an unchanged realm alias keeps its tracked constructor read narrow',
    code: 'const g = globalThis; g.Promise.allSettled([]);',
    homeOnly: ['Promise'],
    withContainerCensus: true,
  },
  {
    name: 'destructuring reads the static slots of a guarded constructor result',
    code: 'function f(src) { let g = globalThis; [g] = src; const { allSettled } = g.Promise; }',
    heldInSlot: ['Promise'],
    withContainerCensus: true,
  },
  {
    name: 'a custom receiver alternative does not erase the guarded realm constructor',
    code: 'function f(src) { let g = globalThis; [g] = src; const { allSettled } = g.Promise; return allSettled; } f([globalThis]); f([{ Promise: { allSettled: 0 } }]);',
    heldInSlot: ['Promise'],
    withContainerCensus: true,
  },
  {
    name: 'a nested constructor pattern reads statics from the guarded outer slot',
    code: 'function f(c) { if (c) { var g = globalThis; } const { Promise: { allSettled } } = g; }',
    heldInSlot: ['Promise'],
    withContainerCensus: true,
  },
  ...[
    ['direct reposition', 'const b = [Map]; b.reverse(); use(b[0].groupBy);'],
    ['named reposition', 'const b = [Map]; const method = "reverse"; b[method](); use(b[0].groupBy);'],
    ['computed write', 'const b = { k: Map }; b[key] = 1; use(b.k.groupBy);'],
    ['local wrapper after a slot write', 'const b = { k: Object }; const host = { b }; b.k = Map; use(host.b.k.groupBy);'],
  ].map(([name, code]) => ({ name, code, heldInSlot: ['Map'], withContainerCensus: true })),
  ...[
    ['exported wrapper after a slot write', 'const b = { k: Object }; export const host = { b }; b.k = Map;'],
    ['exported alias after a slot write', 'const b = { k: Object }; export const host = b; b.k = Map;'],
    ['transitive installed container escape', 'const a = {}; const b = {}; a.b = b; b.k = Map; hand(a);'],
    ['unknown container key', 'const b = [Map]; use(b[key].groupBy);'],
    ['reassigned container key', 'const b = [Map]; let key = "reverse"; key = pick(); b[key]();'],
  ].map(([name, code]) => ({ name, code, realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true })),
  ...[
    ['direct parameter overwrite', 'arg = 1;'],
    ['sequence parameter overwrite', '(effect(), arg = 1);'],
    ['immediate closure parameter overwrite', '(() => { arg = 1; })();'],
    ['member key parameter overwrite', 'sink[arg = 1] = 2;'],
    ['update key parameter overwrite', 'sink[arg = 1]++;'],
  ].map(([name, body]) => ({
    name, code: `use((arg => { ${ body } return arg; })(Map));`,
    homeOnly: ['Map'], withContainerCensus: true,
  })),
  ...[
    ['parameter read before overwrite', 'hand(arg); arg = 1;'],
    ['parameter read on overwrite right side', 'arg = hand(arg);'],
    ['conditional parameter overwrite', 'if (flag) arg = 1;'],
    ['default parameter overwrite', '({ x = (arg = 1) } = source);'],
    ['optional key parameter overwrite', 'source?.value[arg = 1];'],
    ['deferred parameter overwrite', 'const later = () => { arg = 1; };'],
    ['hoisted closure before overwrite', 'read(); arg = 1; function read() { hand(arg); }'],
    ['unreachable closure overwrite', '(() => { return; arg = 1; })();'],
  ].map(([name, body]) => ({
    name, code: `use((arg => { ${ body } return arg; })(Map));`,
    realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true,
  })),
  ...[
    ['named parameter write', 'function install(ctor) { ctor.groupBy = patch; } install(Map);'],
    ['default parameter write', 'function install(ctor = Map) { ctor.groupBy = patch; } install();'],
    ['local method parameter write', 'const host = { install(ctor) { ctor.groupBy = patch; } }; host.install(Map);'],
    ['class parameter write', 'class Installer { constructor(ctor) { ctor.groupBy = patch; } } new Installer(Map);'],
    ['super parameter write', 'class Base { constructor(ctor) { ctor.groupBy = patch; } } class Derived extends Base { constructor() { super(Map); } } new Derived();'],
    ['tag parameter write', 'function install(strings, ctor) { ctor.groupBy = patch; } install`${Map}`;'],
    ['truthy parameter write', 'function install(ctor) { if (ctor) ctor.groupBy = patch; } install(Map);'],
    ['truthy tagged parameter write', 'function install(strings, ctor) { if (ctor) ctor.groupBy = patch; } install`${Map}`;'],
    ['named computed parameter write', 'function install(ctor) { ctor[(effect(), "groupBy")] = patch; } install(Map);'],
  ].map(([name, code]) => ({ name, code, heldInSlot: ['Map'], withContainerCensus: true })),
  ...[
    ['member read before parameter write', 'void ctor.groupBy; ctor.groupBy = patch;'],
    ['unknown parameter write key', 'ctor[key] = patch;'],
    ['parameter in write key effect', 'ctor[(hand(ctor), "groupBy")] = patch;'],
    ['parameter on write right side', 'ctor.groupBy = hand(ctor);'],
    ['parameter compound write', 'ctor.groupBy ||= patch;'],
    ['parameter update', 'ctor.groupBy++;'],
    ['returned parameter after write', 'ctor.groupBy = patch; return ctor;'],
    ['truthy parameter handed out', 'if (ctor) hand(ctor);'],
    ['truthy parameter returned', 'if (ctor) return ctor;'],
    ['thrown parameter after write', 'ctor.groupBy = patch; throw ctor;'],
    ['stored parameter after write', 'ctor.groupBy = patch; sink.value = ctor;'],
    ['arguments after parameter write', 'ctor.groupBy = patch; hand(arguments);'],
    ['closure reads written parameter', 'ctor.groupBy = patch; hand(() => ctor);'],
  ].map(([name, body]) => ({
    name, code: `function install(ctor) { ${ body } } install(Map);`,
    realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true,
  })),
  ...[
    ['replaced method', 'host.install = unknown;'],
    ['deleted method', 'delete host.install;'],
    ['optional deleted method', 'delete host?.install;'],
    ['updated method', 'host.install++;'],
    ['wrapped replaced method', '(host.install) = unknown;'],
    ['pattern replaced method', '({ install: host.install } = source);'],
    ['array replaced method', '[host.install] = source;'],
    ['for replaced method', 'for (host.install of source) {}'],
    ['released method container', 'hand(host);'],
    ['aliased method container', 'const alias = host; alias.install = unknown;'],
  ].map(([name, edit]) => ({
    name, code: `const host = { install(ctor) { ctor.groupBy = patch; } }; ${ edit } host.install(Map);`,
    realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true,
  })),
  ...[
    ['method can replace itself through this', 'const host = { install(ctor) { ctor.groupBy = patch; this.install = unknown; } }; host.install(Map);'],
    ['other method can replace the callee', 'const host = { install(ctor) { ctor.groupBy = patch; },'
      + ' change() { this.install = unknown; } }; host.change(); host.install(Map);'],
    ['getter holds no fixed method', 'const host = { get install() { return ctor => { ctor.groupBy = patch; }; } }; host.install(Map);'],
    ['unknown method override key', 'const host = { install(ctor) { ctor.groupBy = patch; }, [key]: unknown }; host.install(Map);'],
    ['shadowed method owner', 'const host = { install(ctor) { ctor.groupBy = patch; } }; function call(host) { host.install(Map); } call(unknown);'],
    ['replaced super constructor', 'class Base { constructor(ctor) { ctor.groupBy = patch; } }'
      + ' class Derived extends Base { constructor() { super(Map); } } Object.setPrototypeOf(Derived, unknown); new Derived();'],
    ['later default reads written parameter', 'function install(ctor, other = hand(ctor)) { ctor.groupBy = patch; } install(Map);'],
    ['default arguments reads written parameter', 'function install(ctor = (hand(arguments), Map)) { ctor.groupBy = patch; } install();'],
  ].map(([name, code]) => ({ name, code, realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true })),
  {
    name: 'an identity return with unrelated effects keeps the argument local',
    code: 'const ctor = (arg => { effect(); return arg; })(Map); use(ctor.groupBy);',
    homeOnly: ['Map'], withContainerCensus: true,
  },
  {
    name: 'an identity return with unrelated effects can still hand the argument out',
    code: 'hand((arg => { effect(); return arg; })(Map));',
    realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true,
  },
  ...[
    ['first parameter', 'function pick(value, label) { effect(label); return value; }', 'pick(Map, 1)'],
    ['second parameter', 'function pick(label, value) { effect(label); return value; }', 'pick(1, Map)'],
    ['third parameter', 'function pick(a, b, value) { effect(a, b); return value; }', 'pick(1, 2, Map)'],
    ['expression arrow', 'const pick = (label, value) => value;', 'pick(1, Map)'],
    ['sequence return', 'const pick = (label, value) => (effect(label), value);', 'pick(1, Map)'],
    ['unrelated default', 'function pick(label, value, other = effect(label)) { return value; }', 'pick(1, Map)'],
    ['trailing rest', 'function pick(label, value, ...tail) { effect(label, tail); return value; }', 'pick(1, Map, 2)'],
    ['tag substitution', 'function pick(strings, value) { effect(strings); return value; }', 'pick`${Map}`'],
    ['erased this parameter', 'function pick(this: void, label, value) { effect(label); return value; }', 'pick(1, Map)', ['typescript']],
  ].flatMap(([name, declaration, call, plugins]) => [
    {
      name: `returned argument stays local: ${ name }`,
      code: `${ declaration } const ctor = ${ call }; use(ctor.groupBy);`,
      homeOnly: ['Map'], withContainerCensus: true, plugins,
    },
    {
      name: `returned argument escapes: ${ name }`,
      code: `${ declaration } hand(${ call });`,
      realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true, plugins,
    },
  ]),
  ...[
    ['prefix reads parameter', 'function pick(label, value) { hand(value); return value; }', 'pick(1, Map)'],
    ['sequence reads parameter', 'const pick = (label, value) => (hand(value), value);', 'pick(1, Map)'],
    ['default reads parameter', 'function pick(label, value, other = hand(value)) { return value; }', 'pick(1, Map)'],
    ['default captures parameter', 'function pick(label, value, other = hand(() => value)) { return value; }', 'pick(1, Map)'],
    ['pattern key reads parameter', 'function pick(label, value, { [hand(value)]: other }) { return value; }', 'pick(1, Map, {})'],
    ['arguments read', 'function pick(label, value) { hand(arguments); return value; }', 'pick(1, Map)'],
    ['parameter reassignment reads old value', 'function pick(label, value) { value = hand(value); return value; }', 'pick(1, Map)'],
    ['spread shifts argument', 'function pick(label, value) { return value; }', 'pick(...items, Map)'],
    ['async return wraps value', 'async function pick(label, value) { return value; }', 'pick(1, Map)'],
    ['generator return defers value', 'function* pick(label, value) { return value; }', 'pick(1, Map)'],
  ].map(([name, declaration, call]) => ({
    name: `returned argument cannot narrow: ${ name }`,
    code: `${ declaration } const ctor = ${ call }; use(ctor.groupBy);`,
    realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true,
  })),
  {
    name: 'overwriting a returned parameter discards its argument',
    code: 'function pick(label, value) { value = replacement; return value; } hand(pick(1, Map));',
    homeOnly: ['Map'], withContainerCensus: true,
  },
  {
    name: 'duplicate sloppy parameters do not prove which argument is returned',
    code: 'function pick(value, value) { return value; } const ctor = pick(Map, replacement); use(ctor.groupBy);',
    sourceType: 'script', realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true,
  },
  {
    name: 'finite inline static keys need the family only for the retained pure argument',
    code: 'use((({ [flag ? "try" : "withResolvers"]: method }) => method)(Promise));',
    heldInSlot: ['Promise'], withContainerCensus: true,
  },
  ...[
    ['one unresolved key arm', 'use((({ [flag ? "try" : pick()]: method }) => method)(Promise));'],
    ['rest beside finite keys', 'use((({ [flag ? "try" : "withResolvers"]: method, ...rest }) => rest)(Promise));'],
    ['named callee with finite keys', 'function f({ [flag ? "try" : "withResolvers"]: method }) { return method; } use(f(Promise));'],
  ].map(([name, code]) => ({ name, code, realm: ['Promise'], mintedToo: ['Promise'], withContainerCensus: true })),
  {
    name: 'an exported subclass exposes its container-held base statics',
    code: 'const box = { Base: Map }; export class Derived extends box.Base {}',
    realm: ['Map'], mintedToo: ['Map'], withContainerCensus: true,
  },
  {
    name: 'an exported namespace-local name does not expose the same-spelled global',
    code: 'namespace N { export const Map = 1; } new Map();',
    homeOnly: ['Map'], withContainerCensus: true,
  },
];

// the container census owns the second stamper, and the two bindings list it on OPPOSITE sides of
// this one - so every row runs under both orders and has to answer the same. an answer that moved
// with the order would leave one leg narrower than the other, a divergence no fixture set can hold
const REDUCER_ORDERS = {
  'mutation census first': () => [mutationShapesReducer(null), escapedCtorReferencesReducer()],
  'escape census first': () => [escapedCtorReferencesReducer(), mutationShapesReducer(null)],
};

for (const adapter of adapters) {
  for (const row of NAME_ROWS) {
    const orders = row.withContainerCensus
      ? Object.entries(REDUCER_ORDERS)
      : [['alone', () => [escapedCtorReferencesReducer()]]];
    for (const [order, build] of orders) {
      const label = `${ adapter.name }: names (${ order }) - ${ row.name }`;
      const program = adapter.parseAndScope(row.code, row.sourceType ?? 'module', row.plugins ?? []).node;
      const { escapedCtorNames } = collectFileCensus(program, build());
      checkTruthy(`${ label }: census ran`, !!escapedCtorNames);
      for (const name of row.realm ?? []) {
        check(`${ label }: '${ name }' answers for the realm`, escapedCtorNames.has(name), true);
      }
      // the flavor split: a constructor STORED in a container this file keeps is no hand-out, and
      // only the flavor minting a binding for it owes the family
      for (const name of row.heldInSlot ?? []) {
        check(`${ label }: '${ name }' hands nothing out`, escapedCtorNames.has(name), false);
        check(`${ label }: '${ name }' is still owed by a minted binding`, escapedCtorNames.has(name, true), true);
      }
      // ... and the counterpart assertion, for a row whose point is that the MINTED binding is what
      // leaves: `realm` alone cannot say it, since the global-only half answers that same ask
      for (const name of row.mintedToo ?? []) {
        check(`${ label }: '${ name }' is owed by a minted binding too`, escapedCtorNames.has(name, true), true);
      }
      // ... and the half only usage-GLOBAL owes: a binding this census cannot enumerate MIGHT hold
      // the realm's constructor, and the flavor patching the one slot every read lands on covers a
      // caller's value too. the minted-binding flavor does not - it substitutes only where the realm
      // is proven, and a value a caller supplies is never the binding this pass wrote
      for (const name of row.globalOnly ?? []) {
        check(`${ label }: '${ name }' is owed by the patched global slot`, escapedCtorNames.has(name), true);
        check(`${ label }: '${ name }' is not owed by a minted binding`, escapedCtorNames.has(name, true), false);
      }
      // ... and a reference NO walk here reaches: neither flavor owes it, and the container half is
      // silent about it too - the row asserts the absence, never a leaf the census merely reclassified
      for (const name of row.homeOnly ?? []) {
        check(`${ label }: '${ name }' hands nothing out`, escapedCtorNames.has(name), false);
        check(`${ label }: '${ name }' is owed by no flavor`, escapedCtorNames.has(name, true), false);
      }
      for (const name of row.local ?? []) {
        check(`${ label }: '${ name }' answers for the file's own binding`, escapedCtorNames.has(name), false);
        check(`${ label }: '${ name }' is owed by no flavor`, escapedCtorNames.has(name, true), false);
        // the CONTAINER half indexes what the FILE bound and takes every escaping leaf, so the narrow
        // above must not have pruned the walk that feeds it
        check(`${ label }: '${ name }' still counted as an escaped container`,
          ESCAPED_CONTAINER_NAMES.get(program).has(name), true);
      }
    }
  }
}

// Inert carrier slots need no escape bookkeeping. Count allocations, not elapsed time, with
// parsing outside the measurement. Direct leaves, queued local returns and nested forwarding
// calls must still expose the constructor without allocating a Set for every inert slot.
const NativeSet = globalThis.Set;
for (const adapter of adapters) {
  for (const terminal of ['Map', 'globalThis.Map', 'getMap()', 'identity(identity(Map))']) {
    const counts = [];
    for (const width of [0, 256]) {
      const source = `function getMap() { return Map; }
        function identity(value) { return value; }
        hand([${ '0,'.repeat(width) }${ terminal }]);`;
      const program = adapter.parseAndScope(source).node;
      let allocations = 0;
      globalThis.Set = class extends NativeSet {
        constructor(...args) {
          super(...args);
          allocations++;
        }
      };
      let answer;
      try {
        answer = collectFileCensus(program, [escapedCtorReferencesReducer()]);
      } finally {
        globalThis.Set = NativeSet;
      }
      const label = `${ adapter.name }: ${ terminal } with ${ width } inert slots`;
      check(`${ label }: global escape preserved`, answer.escapedCtorNames.has('Map'), true);
      check(`${ label }: pure escape preserved`, answer.escapedCtorNames.has('Map', true), true);
      counts.push(allocations);
    }
    check(`${ adapter.name }: ${ terminal } needs no additional Sets for inert slots`, counts[1], counts[0]);
  }
}

finish();
