import { collectFileCensus, singleReturnBodyExpression, staticFallbackSwapRedundant } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { escapedCtorReferencesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
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
    ['try { return Map; } finally { return Set; }', ''],
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
check('candidate rows were checked', checked, adapters.length * (rows.length * 3 + 10));
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
// Repeated local calls share the same source return graph, including aliases and fixed methods.
// Count source reads: a cache keyed by call sites revisits every return for every static use.
for (const adapter of adapters) for (const [name, declaration, callee] of [
  ['named', 'function read() { BODY }', 'read'],
  ['alias', 'function read() { BODY } const alias = read;', 'alias'],
  ['method', 'const box = { read() { BODY } };', 'box.read'],
  ['forwarded', 'function source() { BODY } function read() { return source(); }', 'read'],
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
  check(`${ adapter.name }: ${ name }: retained static is covered`, escapedCtorNames.has('Map', true), true);
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
  check(`${ adapter.name }: static reads do not expose the namespace`, escapedCtorNames.has('Reflect'), false);
  check(`${ adapter.name }: static reads do not retain the pure namespace`, escapedCtorNames.has('Reflect', true), false);
  check(`${ adapter.name }: caller-source query is live`, sourceReads > size, true);
  check(`${ adapter.name }: caller sources are scanned linearly`, sourceReads < size * 40, true);
}
// Reusing one root answer must preserve each key's obligation, including an unknown key after
// a named read. Two bindings spelling the same name must never share that answer.
for (const adapter of adapters) for (const [name, body, expected] of [
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
  const program = adapter.parseAndScope(`function choose() {
    while (flag) { return Map; } return Promise;
  } ${ body }`);
  const { escapedCtorNames } = collectFileCensus(program.node, [escapedCtorReferencesReducer()]);
  for (const ctor of ['Map', 'Promise', 'Object', 'Array']) for (const pure of [false, true]) {
    check(`${ adapter.name }: ${ name }: ${ ctor }: pure=${ pure }`, escapedCtorNames.has(ctor, pure), expected.includes(ctor));
  }
}
finish();
