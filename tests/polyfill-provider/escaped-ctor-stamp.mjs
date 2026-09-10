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
  // ... and the same spelling on the other half of the census: a method's returns are the METHOD's,
  // never its host function's. counting them as the host's escaped them twice and flipped the host's
  // own "more than one return" gate, which escapes every return it has
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
  // a slot the pattern pairs through a GETTER reads what the getter returns, exactly as the read
  // canon answers elsewhere - the level is consumed, so a body with nothing to observe hands over
  // its single return, and a body with an effect hands over nothing at all
  {
    name: 'a hop paired through a pure-return getter reaches the realm behind it',
    code: 'const { w: { Map: Held } } = { get w() { return globalThis; } };\nhand(Held);',
    realm: ['Map'],
  },
  {
    name: '... and an effectful getter body pairs nothing, so the slot names no realm value',
    code: 'const { w: { Map: Held } } = { get w() { mark(); return globalThis; } };\nhand(Held);',
    realm: [],
    homeOnly: ['Map'],
  },
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
    realm: ['Map'],
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
    name: '... and a spread ahead of the slot leaves no position to pair by',
    code: 'use(((first, { groupBy }) => groupBy)(...list, Map));',
    realm: ['Map'],
  },
  // ... and the same pattern under a callee this file NAMES rather than spells inline: the value
  // still reaches no further than the slots, but no pass rewrites a slot read there, so the flavor
  // minting a binding reads its static off what it minted and is owed the family after all
  {
    name: '... a callee this file names instead of spelling inline holds the value',
    code: 'function f({ groupBy }) { return groupBy; }\nuse(f(Map));',
    realm: [],
    heldInSlot: ['Map'],
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
    realm: ['Map'],
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
      const program = adapter.parseAndScope(row.code, 'module', row.plugins ?? []).node;
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

finish();
