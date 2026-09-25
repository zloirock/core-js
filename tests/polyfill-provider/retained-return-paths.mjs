import {
  CENSUS_STATIC_RECEIVERS,
  collectFileCensus,
  singleReturnBodyExpression,
  staticFallbackSwapRedundant,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import { adapters, createChecker } from './harness.mjs';

const { check, finish } = createChecker('retained-return-paths');
const rows = [
  ['local prefix', 'const local = observe(); return Map;', 'Map'],
  ['early return', 'const local = flag; if (local) return Map; return Map;', 'Map'],
  ['both arms', 'if (flag) { return Map; } else { return Map; }', 'Map'],
  ['nested arms', 'if (flag) { if (other) return Map; else return Map; } return Map;', 'Map'],
  ['fallthrough prefix', 'if (flag) observe(); return Map;', 'Map'],
  ['wrapped return', 'if (flag) return (Map); return Map;', 'Map'],
  ['local shadow', 'const Map = other; return Map;', null],
  ['branch shadow', 'if (flag) { const Map = other; return Map; } return Map;', null],
  ['hoisted shadow', 'if (flag) return Map; return Map; var Map;', null],
  ['nested hoisted shadow', 'if (flag) { var Map; } return Map;', null],
  ['destructured shadow', 'const { value: Map } = other; return Map;', null],
  ['different returns', 'if (flag) return Map; return Set;', null],
  ['implicit undefined', 'if (flag) return Map;', null],
  ['explicit undefined', 'if (flag) return; return Map;', null],
  ['finally override', 'try { return Map; } finally { return Set; }', null],
  ['loop boundary', 'while (flag) { return Map; } return Map;', null],
];
let checked = 0;
for (const adapter of adapters) {
  for (const [name, source, expected] of rows) {
    const program = adapter.parseAndScope(`const f = () => { ${ source } };`);
    const body = adapter.pickPath(program, 'BlockStatement').node;
    check(`${ adapter.name }: ${ name }`, singleReturnBodyExpression(body, { preservesBody: true })?.name ?? null, expected);
    check(`${ adapter.name }: ${ name }: consumed`, singleReturnBodyExpression(body), null);
    const callProgram = adapter.parseAndScope(`const value = (() => { ${ source } })();`);
    const call = adapter.pickPath(callProgram, 'CallExpression').node;
    check(`${ adapter.name }: ${ name }: retained static fallback`, staticFallbackSwapRedundant(call, [call]), expected !== null);
    checked += 3;
  }
}
check('all return paths were checked', checked, adapters.length * rows.length * 3);
for (const adapter of adapters) {
  for (const [source, expected] of [
    ['if (flag) return Map;', 'Map'],
    ['if (flag) return Map; return Set;', 'Map,Set'],
    ['if (flag) return; return Array;', 'Array'],
    ['if (flag) { const Map = other; return Map; } return Set;', 'Set'],
    // control flow the single-return proof leaves unproven still hands over every free return - a
    // candidate promises no path, so the overridden `Map` of a finally rides along - and the bindings
    // it declares shadow a return like any other local
    ['try { return Map; } finally { return Set; }', 'Map,Set'],
    ['switch (key) { case 0: return Map; default: return Set; }', 'Map,Set'],
    ['switch (key) { case 0: let Map = other; return Map; } return Set;', 'Set'],
    ['for (const item of list) { if (item) return Map; } return Set;', 'Map,Set'],
    ['for (let Map = 0; ; ) return Map; return Set;', 'Set'],
    ['for (const Map of list) return Map; return Set;', 'Set'],
    ['while (flag) { return Map; } return Set;', 'Map,Set'],
    ['do { return Map; } while (flag); return Set;', 'Map,Set'],
    ['label: { if (flag) break label; return Map; } return Set;', 'Map,Set'],
    ['try { return Map; } catch (Set) { return Set; }', 'Map'],
    ['try { work(); } catch { return Map; } if (flag) throw error; return Set;', 'Map,Set'],
    ['if (flag) return Map; return Set; function Map() {}', 'Set'],
    ['if (flag) return Map; return Set; class Set {}', 'Map'],
  ]) {
    const program = adapter.parseAndScope(`const f = () => { ${ source } };`);
    const body = adapter.pickPath(program, 'BlockStatement').node;
    const candidates = [];
    check(`${ adapter.name }: uncertain primary: ${ source }`,
      singleReturnBodyExpression(body, { preservesBody: true, returnSink: candidates }), null);
    check(`${ adapter.name }: guarded candidates: ${ source }`, candidates.map(node => node.name).sort().join(','), expected);
    checked += 2;
  }
}
check('candidate rows were checked', checked, adapters.length * (rows.length * 3 + 34));
// A return-path analysis must scale with the body, not with declarations times returns.
// Access counts separate that complexity class without relying on machine timing.
let reads = 0;
const many = { type: 'BlockStatement', body: [] };
for (let index = 0; index < 512; index++) {
  many.body.push({ type: 'VariableDeclaration', declarations: [{ id: {
    type: 'Identifier', get name() { reads++; return `local${ index }`; },
  } }] }, { type: 'IfStatement', consequent: { type: 'ReturnStatement', argument: {
    type: 'Identifier', get name() { reads++; return 'Map'; },
  } }, alternate: null });
}
many.body.push({ type: 'ReturnStatement', argument: { type: 'Identifier', name: 'Map' } });
check('large agreeing body resolves', singleReturnBodyExpression(many, { preservesBody: true })?.name, 'Map');
check('declarations and returns are each scanned linearly', reads < 512 * 8, true);
// Repeated reads of an inert alias cannot open a local caller set. Count its source reads:
// resolving every ordinary identifier as a possible function revisits this source per use.
for (const adapter of adapters) {
  const size = 256;
  const program = adapter.parseAndScope(`const source = 0; const value = source;
    function read() { ${ 'value.field;'.repeat(size) } }
    read(); function accept(ns) { ns.from([]); } accept(Array);`);
  const { init } = adapter.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'value').node;
  let sourceReads = 0;
  Object.defineProperty(init, 'type', { configurable: true, get() {
    sourceReads++;
    return 'Identifier';
  } });
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  check(`${ adapter.name }: inert alias source was visited`, sourceReads > 0, true);
  check(`${ adapter.name }: ordinary reads reuse the callable classification`, sourceReads < size, true);
  check(`${ adapter.name }: closed constructor caller stays covered`, escapedCtorNames.has('Array'), false);
}
// Pairing many parameters reuses the census's arguments verdict. An independent arguments
// scan per parameter revisits the entire padding body without changing either escape answer.
for (const adapter of adapters) {
  const size = 128;
  const params = Array.from({ length: 8 }, (unused, index) => `p${ index }`);
  const padding = Array.from({ length: size }, (unused, index) => `const pad${ index } = 0;`).join('');
  const program = adapter.parseAndScope(`function read(${ params }) { ${ padding } return Map; } hand(read(Array));`);
  let bodyReads = 0;
  for (const path of adapter.collectPaths(program, 'VariableDeclarator', candidate => candidate.node.id.name.startsWith('pad'))) {
    const { init } = path.node;
    const { type } = init;
    Object.defineProperty(init, 'type', { configurable: true, get() {
      bodyReads++;
      return type;
    } });
  }
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  check(`${ adapter.name }: parameter body was inspected`, bodyReads > size, true);
  check(`${ adapter.name }: parameter pairing reuses the arguments verdict`, bodyReads < size * 150, true);
  check(`${ adapter.name }: returned constructor still escapes`, escapedCtorNames.has('Map'), true);
  check(`${ adapter.name }: unused supplied constructor stays local`, escapedCtorNames.has('Array'), false);
}
// Repeated local calls share the same source return graph, including aliases and fixed methods.
// Count source reads: a cache keyed by call sites revisits every return for every static use.
// pure guards a static read on the call it reads off with the returned candidates, and holds the
// namespace only where it cannot: an optional call keeps its read raw
for (const adapter of adapters) for (const [name, declaration, callee, held] of [
  ['named', 'function read() { BODY }', 'read', false],
  ['alias', 'function read() { BODY } const alias = read;', 'alias', false],
  ['method', 'const box = { read() { BODY } };', 'box.read', false],
  ['forwarded', 'function source() { BODY } function read() { return source(); }', 'read', false],
  ['optional', 'function read() { BODY }', 'read?.', true],
]) {
  const size = 128;
  const body = `while (true) { ${ 'if (flag) return Map;'.repeat(size) } return Map; }`;
  const program = adapter.parseAndScope(declaration.replace('BODY', body) + `${ callee }().groupBy([]);`.repeat(size));
  let nameReads = 0;
  for (const path of adapter.collectPaths(program, 'Identifier', candidate => candidate.node.name === 'Map')) {
    Object.defineProperty(path.node, 'name', { configurable: true, get() {
      nameReads++;
      return 'Map';
    } });
  }
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  check(`${ adapter.name }: ${ name }: retained static holds the namespace where no guard serves it`, escapedCtorNames.has('Map', true), held);
  check(`${ adapter.name }: ${ name }: return query is live`, nameReads > size, true);
  check(`${ adapter.name }: ${ name }: return graph is scanned once per callee`, nameReads < size * 40, true);
}
// A parameter's caller fan and its static reads are independent dimensions. Revisiting every
// source for every read is quadratic even when no source is a retained local call.
for (const adapter of adapters) {
  const size = 256;
  const program = adapter.parseAndScope(`function read(ns) {
    ${ 'ns.ownKeys({});'.repeat(size) }
  } ${ 'read(Reflect);'.repeat(size) }`);
  let sourceReads = 0;
  for (const path of adapter.collectPaths(program, 'Identifier', candidate => candidate.node.name === 'Reflect')) {
    Object.defineProperty(path.node, 'type', { configurable: true, get() {
      sourceReads++;
      return 'Identifier';
    } });
  }
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  const censusReads = sourceReads;
  for (const path of adapter.collectPaths(program, 'MemberExpression', candidate => candidate.node.object?.name === 'ns')) {
    CENSUS_STATIC_RECEIVERS.get(program.node)(path.node.object, true);
  }
  check(`${ adapter.name }: static reads do not expose the namespace`, escapedCtorNames.has('Reflect'), false);
  check(`${ adapter.name }: static reads do not retain the pure namespace`, escapedCtorNames.has('Reflect', true), false);
  check(`${ adapter.name }: caller-source query is live`, censusReads > size, true);
  check(`${ adapter.name }: caller sources are scanned linearly`, censusReads < size * 40, true);
  check(`${ adapter.name }: repeated candidate queries share their source walk`, sourceReads - censusReads < size * 24, true);
}
// Reusing one root answer must preserve each key's obligation, including an unknown key after
// a named read. Two bindings spelling the same name must never share that answer. a read through
// an ALIAS of the call is one pure cannot guard, whichever control flow the returns sit in
for (const adapter of adapters) for (const returns of [
  'while (flag) { return Map; } return Promise;',
  'if (flag) return Map; return Promise;',
]) for (const [name, body, expected] of [
  ['one key', 'const ns = choose(); ns.groupBy([]); ns.groupBy([]);', ['Map']],
  ['two keys', 'const ns = choose(); ns.groupBy([]); ns.race([]);', ['Map', 'Promise']],
  ['reversed keys', 'const ns = choose(); ns.race([]); ns.groupBy([]);', ['Map', 'Promise']],
  ['unknown key', 'const ns = choose(); ns.groupBy([]); ns[key]([]);', ['Map', 'Promise']],
  ['unknown key first', 'const ns = choose(); ns[key]([]); ns.groupBy([]);', ['Map', 'Promise']],
  ['separate bindings', `
    { const ns = choose(); ns.groupBy([]); }
    function object() { while (flag) { return Object; } return Object; }
    { const ns = object(); ns.groupBy([]); }
  `, ['Map', 'Object']],
]) {
  const program = adapter.parseAndScope(`function choose() { ${ returns } } ${ body }`);
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  const receivers = adapter.collectPaths(program, 'MemberExpression', path => path.node.object?.name === 'ns');
  const candidates = receivers.map(path => [...CENSUS_STATIC_RECEIVERS.get(program.node)(path.node.object, true)].sort().join(','));
  check(`${ adapter.name }: ${ returns }: ${ name }: receiver candidates stay local`, [...new Set(candidates)].sort().join(';'),
    name === 'separate bindings' ? 'Map,Promise;Object' : 'Map,Promise');
  for (const ctor of ['Map', 'Promise', 'Object', 'Array']) for (const pure of [false, true]) {
    check(`${ adapter.name }: ${ returns }: ${ name }: ${ ctor }: pure=${ pure }`, escapedCtorNames.has(ctor, pure),
      (pure || name.startsWith('unknown key')) && expected.includes(ctor));
  }
}
// Unknown selections of constructor slots contribute candidates, without releasing their namespaces.
for (const adapter of adapters) for (const [name, code, expected] of [
  ['literal', '[Object][key].groupBy([]);', 'Object'],
  ['nested', 'const source = { list: [Promise] }; source.list[key].withResolvers();', 'Promise'],
  ['returned', 'function box(v) { return [v]; } box(Array)[key].from([]);', 'Array'],
  ['stored return', 'function box(v) { return [v]; } const source = box(Array); source[key].of(1);', 'Array'],
  ['proxy slot', '[globalThis.Array][key].from([]);', 'Array'],
  ['wrapped', '(([Object][key])).groupBy([]);', 'Object'],
  ['optional', '[Promise][key]?.withResolvers();', 'Promise'],
  ['mixed slots', '[Array, Object][key].from([]);', 'Array,Object'],
]) {
  const program = adapter.parseAndScope(code);
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  const path = adapter.collectPaths(program, 'MemberExpression', candidate => {
    return ['from', 'of', 'groupBy', 'withResolvers'].includes(candidate.node.property?.name);
  }).at(-1)
    ?? adapter.collectPaths(program, 'OptionalMemberExpression').at(-1);
  const candidates = [...CENSUS_STATIC_RECEIVERS.get(program.node)(path.node.object, true)].sort();
  check(`${ adapter.name }: opaque ${ name }: candidates`, candidates.join(','), expected);
  for (const ctor of expected.split(',')) {
    check(`${ adapter.name }: opaque ${ name }: global namespace`, escapedCtorNames.has(ctor), false);
    check(`${ adapter.name }: opaque ${ name }: pure namespace`, escapedCtorNames.has(ctor, true), true);
  }
}
// Repeated selections share the source proof; a wide container is not rescanned per read.
for (const adapter of adapters) for (const writes of [false, true]) {
  const size = 128;
  const program = adapter.parseAndScope(`${ writes ? 'const unrelated = {}; unrelated.value = 1;' : '' } const source = [${ 'Array,'.repeat(size) }];
    ${ 'source[key].from([]);'.repeat(size) }`);
  let sourceReads = 0;
  for (const path of adapter.collectPaths(program, 'Identifier', candidate => candidate.node.name === 'Array')) {
    Object.defineProperty(path.node, 'type', { configurable: true, get() {
      sourceReads++;
      return 'Identifier';
    } });
  }
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  check(`${ adapter.name }: opaque selections keep global narrow`, escapedCtorNames.has('Array'), writes);
  check(`${ adapter.name }: opaque source counter is live`, sourceReads > size, true);
  check(`${ adapter.name }: opaque source reads stay linear`, sourceReads < size * 100, true);
}
// Validating a wide returned object visits its slots once, rather than scanning all properties
// for each store. The key counter observes the source itself and must fire before its bound matters.
for (const adapter of adapters) for (const reversed of [false, true]) {
  const size = 128;
  const keys = Array.from({ length: size }, (_, index) => `k${ index }`);
  const program = adapter.parseAndScope(`function swap(box) {
    ${ keys.map(key => `box.${ key } = Map;`).join('') } return box;
  } swap({ ${ keys.map(key => `${ key }: Object`).join(',') } }).k0.groupBy([]);`);
  let keyReads = 0;
  for (const path of adapter.collectPaths(program, 'Identifier', candidate => /^k\d+$/.test(candidate.node.name)
    && ['Property', 'ObjectProperty'].includes(candidate.parentPath?.node.type))) {
    const { name } = path.node;
    Object.defineProperty(path.node, 'name', { configurable: true, get() {
      keyReads++;
      return name;
    } });
  }
  const reducers = [escapedCtorReferencesReducer(), mutationShapesReducer()];
  collectFileCensus(program.node, reversed ? reducers.reverse() : reducers);
  const member = adapter.collectPaths(program, 'MemberExpression', path => path.node.property?.name === 'groupBy').at(-1);
  const before = keyReads;
  const query = CENSUS_STATIC_RECEIVERS.get(program.node);
  check(`${ adapter.name }: wide stores reversed=${ reversed }: replacement`,
    [...query(member.node.object, true)].join(','), 'Map');
  check(`${ adapter.name }: wide stores reversed=${ reversed }: counter is live`, keyReads - before >= size, true);
  check(`${ adapter.name }: wide stores reversed=${ reversed }: linear property work`, keyReads - before < size * 8, true);
  const firstReads = keyReads;
  check(`${ adapter.name }: wide stores reversed=${ reversed }: repeated replacement`,
    [...query(member.node.object, true)].join(','), 'Map');
  check(`${ adapter.name }: wide stores reversed=${ reversed }: reused property proof`, keyReads, firstReads);
}
// Repeated definitions of one key must not leave a property-length scan per store either.
for (const adapter of adapters) for (const reversed of [false, true]) {
  const size = 128;
  const program = adapter.parseAndScope(`function swap(box) { ${ 'box.M = Map;'.repeat(size) } return box; }
    swap({ set M(value) {}, ${ 'get M() { return Object; },'.repeat(size) } }).M.groupBy([]);`);
  let kindReads = 0;
  for (const prop of adapter.pickPath(program, 'ObjectExpression').node.properties) {
    const { kind } = prop;
    Object.defineProperty(prop, 'kind', { configurable: true, get() {
      kindReads++;
      return kind;
    } });
  }
  const reducers = [escapedCtorReferencesReducer(), mutationShapesReducer()];
  const { escapedCtorNames } = collectFileCensus(program.node, reversed ? reducers.reverse() : reducers);
  const label = `${ adapter.name }: repeated accessor reversed=${ reversed }`;
  check(`${ label }: ignored value stays local`, escapedCtorNames.has('Map', true), false);
  check(`${ label }: descriptor counter is live`, kindReads > size, true);
  check(`${ label }: linear descriptor work`, kindReads < size * 20, true);
}
// A returned slot's old constructor is dead after a definite store on this call's fresh object.
const stores = [
  ['assignment', 'box.M = Map;'],
  ['defineProperty', "Object.defineProperty(box, 'M', { value: Map });"],
  ['defineProperties', 'Object.defineProperties(box, { M: { value: Map } });'],
  ['assign', 'Object.assign(box, { M: Map });'],
  ['reflect define', "Reflect.defineProperty(box, 'M', { value: Map });"],
  ['reflect set', "Reflect.set(box, 'M', Map);"],
  ['reflect receiver', "Reflect.set({}, 'M', Map, box);"],
  ['mutator alias', "const install = Object.defineProperty; install(box, 'M', { value: Map });"],
  ['mutator invoker', 'Reflect.apply(Object.assign, null, [box, { M: Map }]);'],
  ['mutator call', "Object.defineProperty.call(null, box, 'M', { value: Map });"],
  ['mutator apply', "Object.defineProperty.apply(null, [box, 'M', { value: Map }]);"],
  ['last store wins', 'box.M = Object; box.M = Map;'],
];
for (const adapter of adapters) for (const reversed of [false, true]) for (const [name, store] of stores) {
  for (const call of ['swap({ M: Object })', 'swap.call(null, { M: Object })',
    'Reflect.apply(swap, null, [{ M: Object }])', 'swap((effect(), { M: Object }))']) {
    const program = adapter.parseAndScope(`function swap(box) { ${ store } return box; } ${ call }.M.groupBy([]);`);
    const reducers = [escapedCtorReferencesReducer(), mutationShapesReducer()];
    collectFileCensus(program.node, reversed ? reducers.reverse() : reducers);
    const member = adapter.collectPaths(program, 'MemberExpression', path => path.node.property?.name === 'groupBy').at(-1);
    check(`${ adapter.name }: definite returned store: ${ name }: ${ call }: reversed ${ reversed }`,
      [...CENSUS_STATIC_RECEIVERS.get(program.node)(member.node.object, true)].sort().join(','), 'Map');
  }
}
// Conditional execution, aliases, accessors and failed Reflect writes cannot kill the initial slot.
for (const adapter of adapters) for (const [name, body, argument = '{ M: Object }', prefix = ''] of [
  ['conditional', 'if (flag) box.M = Map; return box;'],
  ['patched mutator', "Reflect.set(box, 'M', Map); return box;", '{ M: Object }', 'Reflect.set = custom;'],
  ['realm-patched mutator', "Reflect.set(box, 'M', Map); return box;", '{ M: Object }', 'globalThis.Reflect.set = custom;'],
  ['alias-patched mutator', "Reflect.set(box, 'M', Map); return box;", '{ M: Object }', 'const R = Reflect; R.set = custom;'],
  ['early return', 'if (flag) return box; box.M = Map; return box;'],
  ['caught failure', 'try { box.M = Map; } catch {} return box;'],
  ['unknown call', 'freeze(box); box.M = Map; return box;'],
  ['nonwritable', "Object.defineProperty(box, 'M', { writable: false }); Reflect.set(box, 'M', Map); return box;"],
  ['nonconfigurable', "Object.defineProperty(box, 'M', { writable: false, configurable: false }); Reflect.defineProperty(box, 'M', { value: Map }); return box;"],
  ['setter source', "Reflect.set(box, 'M', Map); return box;", '{ get M() { return Object; }, set M(value) {} }'],
  ['separate readonly target', "Reflect.set(target, 'M', Map, box); return box;", '{ M: Object }',
    "const target = {}; Object.defineProperty(target, 'M', { value: Object });"],
  ['separate readonly target extra argument', "Reflect.set(target, 'M', Map, box, 0); return box;", '{ M: Object }',
    "const target = {}; Object.defineProperty(target, 'M', { value: Object });"],
  ['patched invoker', 'Reflect.apply(Object.assign, null, [box, { M: Map }]); return box;', '{ M: Object }',
    'const R = Reflect; R.apply = custom;'],
  ['held source', "Reflect.set(box, 'M', Map); return box;", 'source', 'const source = { M: Object }; Object.freeze(source);'],
  ['effectful invoker receiver', "Object.defineProperty.call(freeze(box), box, 'M', { value: Map }); return box;"],
  ['descriptor changes attributes', "Object.defineProperty(box, 'M', { value: Object, writable: false }); Reflect.set(box, 'M', Map); return box;"],
]) {
  const program = adapter.parseAndScope(`${ prefix } function swap(box) { ${ body } } swap(${ argument }).M.groupBy([]);`);
  collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  const member = adapter.collectPaths(program, 'MemberExpression', path => path.node.property?.name === 'groupBy').at(-1);
  check(`${ adapter.name }: uncertain returned store: ${ name }`,
    [...CENSUS_STATIC_RECEIVERS.get(program.node)(member.node.object, true)].includes('Object'), true);
}
for (const adapter of adapters) for (const [name, source, expected] of [
  ['array slot', 'function swap(box) { box[0] = Map; return box; } swap([Object])[0].groupBy([]);', 'Map'],
  ['array mutator slot', 'function swap(box) { Reflect.set(box, 0, Map); return box; } swap([Object])[0].groupBy([]);', 'Map'],
  ['inherited setter on separate target', `function swap(box) { Reflect.set({}, '__proto__', Map, box); return box; }
    swap({ ['__proto__']: Object }).__proto__.groupBy([]);`, 'Map,Object'],
  ['patched outer invoker', `const R = Reflect; R.apply = (fn, receiver, args) => args[0];
    function swap(box) { box.M = Map; return box; } Reflect.apply(swap, null, [{ M: Object }]).M.groupBy([]);`, 'Map,Object'],

]) {
  const program = adapter.parseAndScope(source);
  collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  const member = adapter.collectPaths(program, 'MemberExpression', path => path.node.property?.name === 'groupBy').at(-1);
  check(`${ adapter.name }: returned store: ${ name }`,
    [...CENSUS_STATIC_RECEIVERS.get(program.node)(member.node.object, true)].sort().join(','), expected);
}

// An inert setter consumes no constructor value. Retain the call but remove its fictitious
// store from both candidate and constructor-family graphs, independently of reducer order.
for (const adapter of adapters) for (const reversed of [false, true]) for (const [name, store] of [
  ['assignment', 'box.M = Map;'],
  ['assign', 'Object.assign(box, { M: Map });'],
  ['reflect', "Reflect.set(box, 'M', Map);"],
  ['receiver', "Reflect.set({}, 'M', Map, box);"],
  ['alias', "const set = Reflect.set; set(box, 'M', Map);"],
  ['invoker', "Reflect.set.call(null, box, 'M', Map);"],
]) for (const accessor of ['get M() { return Object; }, set M(value) {}', 'set M(value) {}, get M() { return Object; }']) {
  const program = adapter.parseAndScope(`function swap(box) { ${ store } return box; }
    swap({ ${ accessor } }).M.groupBy([]);`);
  const reducers = [escapedCtorReferencesReducer(), mutationShapesReducer()];
  const { escapedCtorNames } = collectFileCensus(program.node, reversed ? reducers.reverse() : reducers);
  const member = adapter.collectPaths(program, 'MemberExpression', path => path.node.property?.name === 'groupBy').at(-1);
  const label = `${ adapter.name }: ignored setter: ${ name }: reversed ${ reversed }: ${ accessor }`;
  check(`${ label }: Map has no global family`, escapedCtorNames.has('Map'), false);
  check(`${ label }: Map has no pure family`, escapedCtorNames.has('Map', true), false);
  check(`${ label }: getter still supplies Object`,
    [...CENSUS_STATIC_RECEIVERS.get(program.node)(member.node.object, true)].sort().join(','), 'Object');
}
for (const adapter of adapters) for (const [name, setup, setter, extra = ''] of [
  ['setter saves value', '', 'saved = value;'],
  ['setter hands value out', '', 'sink(value);'],
  ['setter changes descriptor', '', "Object.defineProperty(this, 'M', { value: Object, writable: true });"],
  ['exported forwarder', 'export ', ''],
  ['mixed data caller', '', '', 'swap({ M: Object });'],
]) {
  const program = adapter.parseAndScope(`${ setup }function swap(box) { Reflect.set(box, 'M', Map); return box; }
    swap({ get M() { return Object; }, set M(value) { ${ setter } } }).M.groupBy([]); ${ extra }`);
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  check(`${ adapter.name }: observable setter: ${ name }: Map family survives`, escapedCtorNames.has('Map', true), true);
}
// A proven own method supplies the real parameter positions, even when named like an invoker.
for (const adapter of adapters) for (const key of ['call', 'apply', 'bind', 'invoke']) {
  const program = adapter.parseAndScope(`swap.${ key } = (receiver, box) => box;
    function swap(box) { box.M = Map; return box; }
    swap.${ key }(null, { M: Object }).M.groupBy([]);`);
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  const member = adapter.collectPaths(program, 'MemberExpression', path => path.node.property?.name === 'groupBy').at(-1);
  check(`${ adapter.name }: own ${ key }: Object does not escape`, escapedCtorNames.has('Object'), false);
  check(`${ adapter.name }: own ${ key }: returned receiver`,
    [...CENSUS_STATIC_RECEIVERS.get(program.node)(member.node.object, true)].sort().join(','), 'Object');
}
for (const adapter of adapters) for (const [name, before, after = ''] of [
  ['conditional install', 'if (flag) swap.call = (receiver, box) => box;'],
  ['late install', '', 'swap.call = (receiver, box) => box;'],
  ['second install', 'swap.call = (receiver, box) => box; swap.call = custom;'],
  ['deleted method', 'swap.call = (receiver, box) => box; delete swap.call;'],
  ['handed out owner', 'swap.call = (receiver, box) => box; sink(swap);'],
  ['handed out method', 'swap.call = (receiver, box) => box; sink(swap.call);'],
  ['opaque method', 'swap.call = custom;'],
  ['repeated calls', 'swap.call = (receiver, box) => box;', 'swap.call(null, other);'],
]) {
  const program = adapter.parseAndScope(`${ before } function swap(box) { box.M = Map; return box; }
    swap.call(null, { M: Object }).M.groupBy([]); ${ after }`);
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer()]);
  check(`${ adapter.name }: uncertain own method: ${ name }: keep escaped Object`, escapedCtorNames.has('Object'), true);
}
finish();
