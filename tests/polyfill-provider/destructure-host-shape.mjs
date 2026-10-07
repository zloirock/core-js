// Cross-parser tests for shared destructure host classification and placement.
// Both bindings consume these decisions before inserting into their own ASTs.
import {
  bodylessSlotReplacement,
  capturedRealmCtorPure,
  classifyVariableDeclarationHost,
  isBodylessStatementSlot,
  isForInitDeclaration,
  isLoopStatement,
  keyedReadReceiverProven,
  minifierSequenceReducer,
  peelLabeledStatements,
  planArrayWrapperCapture,
  planMinifierSequenceSplit,
  planNestedKeyedPatternCapture,
  planNestedLeafHost,
  planRetainedObjectCapture,
  renderArrayWrapperCapture,
  renderArrayDestructurePlan,
  renderNestedKeyedPatternCapture,
  renderRetainedObjectCapture,
} from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { createChecker } from './harness.mjs';
import {
  collectFileCensus,
  hasObjectRestAncestor,
  isCapturedKeyedPattern,
  markCapturedKeyedPattern,
  SINGLE_STATEMENT_SLOTS,
  walkAstNodes,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import {
  buildDestructuringInitMeta,
  destructureKeyReadPlan,
  destructurePatternHostPath,
  resolveNestedReceiverChain,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { resolvePolyfillableStaticProp } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import {
  assignmentExpression,
  callExpression,
  hostSlot,
  identifier,
  renderInstanceDefaultGuard,
} from '../../packages/core-js-polyfill-provider/render.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { handleMemberExpressionNode, planGuardedStaticNarrow } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { hasConstructorEntry, resolve } from '../../packages/core-js-polyfill-provider/index.js';
import { escapedCtorReferencesReducer, mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, checkDeep, finish, runBoth } = createChecker('destructure-host-shape');

const orderedStaticParameter = "{ of: a, [(log.push('key'), 'from')]: b, length: c }";
for (const [name, parameter, argument, body, expected] of [
  ['nested literal default', `{ w: { v: { Array: ${ orderedStaticParameter } } } } = { w: { v: globalThis } }`, '', 'return [a, b, c];', true],
  ['array literal default', `[[${ orderedStaticParameter }]] = [[Array]]`, '', 'return [a, b, c];', true],
  ['nested default with repeated native siblings', '[{ Array: { of: a }, extra: b, extra: c } = globalThis]', '[]', 'return [a, b, c];', true],
  ['repeated native default overridden by caller', '[{ Array: { of: a }, extra: b, extra: c } = globalThis]', '[user]', 'return [a, b, c];', false],
  ['nested default with unknown sibling key', '[{ Array: { of: a }, [unknown]: b, extra: c } = globalThis]', '[]', 'return [a, b, c];', false],
  [
    'array default retains a deferred default body',
    `[${ orderedStaticParameter.replace('length: c', 'length: c, fallback: value = () => opaque()') }] = [Array]`,
    '',
    'return [a, b, c];',
    true,
  ],
  ['partial conditional default', `{ Array: ${ orderedStaticParameter } } = flag ? globalThis : { Array: {} }`, '', 'return [a, b, c];', false],
  ['claim-only array default', "[{ [(log.push('key'), 'of')]: a }] = [Array]", '', 'return a;', false],
  ['supplied builtin', orderedStaticParameter, 'Array', 'return [a, b, c];', true],
  ['supplied nested realm', `{ w: [{ Array: ${ orderedStaticParameter } }] }`, '{ w: [globalThis] }', 'return [a, b, c];', true],
  ['custom caller', orderedStaticParameter, 'Array); g(user', 'return [a, b, c];', false],
  ['mixed builtin callers', orderedStaticParameter, 'Array); g(Uint8Array', 'return [a, b, c];', false],
  ['mixed array wrapped custom callers', `[${ orderedStaticParameter }]`, '[Array]); g([user]', 'return [a, b, c];', false],
  ['mixed array wrapped builtin callers', `[${ orderedStaticParameter }]`, '[Array]); g([Uint8Array]', 'return [a, b, c];', false],
  ['unknown spread caller', orderedStaticParameter, '...args', 'return [a, b, c];', false],
  ['another parameter', `${ orderedStaticParameter }, other`, 'Array', 'return [a, b, c];', false],
  ['arguments read', orderedStaticParameter, 'Array', 'return arguments[0];', false],
  ['body lexical binding', orderedStaticParameter, 'Array', 'const local = 1; return [a, b, c, local];', false],
  ['key reads parameter binding', '{ of: a, [(log.push(a), "from")]: b, length: c }', 'Array', 'return [a, b, c];', false],
  ['array key reads parameter binding', '[{ of: a, [(log.push(a), "from")]: b, length: c }] = [Array]', '', 'return [a, b, c];', false],
  ['array default reads parameter binding', `[${ orderedStaticParameter.replace('length: c', 'length: c, fallback: value = a') }] = [Array]`, '', 'return [a, b, c];', false],
  ['supplied overrides default', `${ orderedStaticParameter } = Array`, 'user', 'return [a, b, c];', false],
]) for (const deferred of name === 'supplied builtin' ? ['', 'async ', '*'] : ['']) {
  runBoth(`ordered parameter capture/${ name }/${ deferred || 'direct' }`,
    `const log = []; ${ deferred === '*' ? 'function*' : `${ deferred }function` } g(${ parameter }) { ${ body } } g(${ argument });`,
    (parser, program, label) => {
      const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', p => p.node.value.name === 'a');
      check(`${ label }/claimed property selected`, !!prop, true);
      const resolver = parser.makeResolver();
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', collectBindingReferences: resolver.collectBindingReferences });
      function resolvePure(meta) {
        return ['Array', 'Uint8Array'].includes(meta.object) && ['of', 'from'].includes(meta.key)
          ? { kind: 'static', entry: `${ meta.object }/${ meta.key }`, hintName: meta.key } : null;
      }
      const plan = planRetainedObjectCapture({
        propPath: prop,
        adapter,
        meta: { kind: 'property', object: 'Array', key: 'of', placement: 'static' },
        parameterCallSites: resolver.parameterCallSites,
        resolvePure,
      });
      check(`${ label }/admission`, !!plan?.defaultCapture, expected && !deferred);
      if (!plan?.defaultCapture) return;
      check(`${ label }/caller host`, plan.defaultCapture.host.node, destructurePatternHostPath(prop).node);
      check(`${ label }/target pattern`, plan.defaultCapture.pattern.type, 'ObjectPattern');
    });
}

for (const [name, before, after, expected, mutation] of [
  ['quiet closed append', '', 'g(); export const effects = log;', true],
  ['immediate caller precedes observation', '', '(() => g())(); export const effects = log;', true],
  ['own push function', 'log.push = function () {};', 'g();', false],
  ['own push getter', "Object.defineProperty(log, 'push', { get() { return function () {}; } });", 'g();', false],
  ['own primitive push', 'log.push = 1;', 'g();', false],
  ['own length write', 'log.length = 0;', 'g();', false],
  ['alias handout', 'const alias = log;', 'g();', false],
  ['unknown handout', 'mutate(log);', 'g();', false],
  ['deferred handout after source call', '', 'observe(); g(); function observe() { mutate(log); }', false],
  ['hoisted write after source call', '', 'patch(); g(); function patch() { log.push = function () {}; }', false],
  ['loop handout feeds next call', '', 'for (let i = 0; i < 2; i++) { g(); mutate(log); }', false],
  ['linking export after source call', '', 'g(); export { log };', false],
  ['prototype numeric setter', '', 'g();', false, 'Array.prototype.0'],
  ['prototype push change', '', 'g();', false, 'Array.prototype.push'],
  ['prototype iterator replacement', '', 'g();', false, 'Array.prototype.Symbol.iterator'],
  ['visible iterator return accessor', "Object.defineProperty(Object.getPrototypeOf([][Symbol.iterator]()), 'return', { get() { return close; } });", 'g();', false],
  ['claimed leaf default', 'unknown(log);', 'g();', false],
  ['optional call', '', 'g();', false],
]) runBoth(`iterator-close capture closure/${ name }`, `const log = []; ${ before }
  function g([${ name === 'optional call' ? orderedStaticParameter.replace('log.push(', 'log.push?.(')
    : name === 'claimed leaf default' ? orderedStaticParameter.replace('of: a', 'of: a = fallback()') : orderedStaticParameter }] = [Array]) {
    return [a, b, c];
  } ${ after }`, (parser, program, label) => {
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.value.name === 'a'
    || path.node.value.left?.name === 'a');
  check(`${ label }/claimed property selected`, !!prop, true);
  const resolver = parser.makeResolver();
  const census = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer(null)]);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure',
    collectBindingReferences: resolver.collectBindingReferences,
    getMutatedStatics: () => new Set(mutation ? [mutation] : []),
    getWrittenContainerSlots: () => census.writtenContainerSlots,
    getContainerSlotIndex: () => census.containerSlotIndex,
  });
  const refs = resolver.collectBindingReferences(prop, 'log', { closed: true });
  check(`${ label }/reference hook available`, Array.isArray(refs), name !== 'linking export after source call');
  if (name === 'visible iterator return accessor') check(`${ label }/generic return veto`, adapter.isWrittenContainerSlot('', ['return']), true);
  const plan = planRetainedObjectCapture({
    propPath: prop,
    adapter,
    meta: { kind: 'property', object: 'Array', key: 'of', placement: 'static' },
    parameterCallSites: resolver.parameterCallSites,
    resolvePure: meta => meta.object === 'Array' && ['of', 'from'].includes(meta.key)
      ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ label }/iterator-moving admission`, !!plan?.defaultCapture && !plan.defaultCapture.retainedHead, expected);
  const retained = !expected && name !== 'prototype iterator replacement' && name !== 'claimed leaf default';
  check(`${ label }/post-close static handoff`, !!plan?.defaultCapture?.retainedHead, retained);
  if (retained) {
    const source = JSON.stringify(plan.defaultCapture.root);
    const spent = [];
    const rendered = renderRetainedObjectCapture(plan, { injectImport: entry => entry.replaceAll('/', '_'), claimProperties: props => spent.push(...props) });
    checkDeep(`${ label }/positional rebinds`, rendered.statements.map(statement => statement.expression.left.name), ['a', 'b']);
    checkDeep(`${ label }/pure static values`, rendered.statements.map(statement => statement.expression.right.name), ['array_of', 'array_from']);
    check(`${ label }/original parameter unchanged`, JSON.stringify(plan.defaultCapture.root), source);
    checkDeep(`${ label }/source claims spent once`, spent.map(item => item.value.name), ['a', 'b']);
    check(`${ label }/computed key remains live`, spent.includes(prop.parentPath.node.properties[1].key), false);
    check(`${ label }/native head is retained`, rendered.head, undefined);
  }
});

for (const [source, closed] of [
  ['export const log = []; use(log);', false],
  ['const log = []; use(log); export { log };', false],
  ['export const log = []; function f() { const log = []; use(log); }', true],
  ['export const log = []; { const log = []; use(log); }', true],
]) runBoth('closed reference census preserves declaration identity', source, (parser, program, label) => {
  const [ref] = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'use').get('arguments');
  const resolver = parser.makeResolver();
  check(`${ label }/ordinary references remain available`, Array.isArray(resolver.collectBindingReferences(ref)), true);
  check(`${ label }/closed exported owner`, Array.isArray(resolver.collectBindingReferences(ref, 'log', { closed: true })), closed);
  check(`${ label }/unknown binding is incomplete`, resolver.collectBindingReferences(ref, 'missing'), null);
});

for (const [prefix, callee, descriptor, expected] of [
  ['', 'Object.defineProperty(target(), "return",', '{ get() { return close; } }', true],
  ['', 'Reflect.defineProperty(target(), "return",', '{ value: close }', true],
  ['', 'Object.defineProperties(target(),', '{ return: { get() { return close; } }, quiet: { value: 1 } }', true],
  ['const Object = foreign;', 'Object.defineProperty(target(), "return",', '{ get() { return close; } }', false],
  ['const Reflect = foreign;', 'Reflect.defineProperty(target(), "return",', '{ value: close }', false],
]) runBoth('unnamed explicit stores retain generic written keys', `${ prefix } ${ callee } ${ descriptor });`, (parser, program, label) => {
  const census = collectFileCensus(program.node, [escapedCtorReferencesReducer(), mutationShapesReducer(null)]);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    getWrittenContainerSlots: () => census.writtenContainerSlots,
    getContainerSlotIndex: () => census.containerSlotIndex,
  });
  check(`${ label }/return is written`, adapter.isWrittenContainerSlot('', ['return']), expected);
  check(`${ label }/unrelated keys remain quiet`, adapter.isWrittenContainerSlot('', ['other']), false);
});

{
  const expression = { type: 'ExpressionStatement', expression: identifier('effect') };
  const declaration = { type: 'VariableDeclaration', kind: 'var', declarations: [{ type: 'VariableDeclarator', id: identifier('a') }] };
  const next = { type: 'VariableDeclaration', kind: 'const', declarations: [{ type: 'VariableDeclarator', id: identifier('b') }] };
  check('bodyless single statement retains identity', bodylessSlotReplacement(expression, [expression]), expression);
  checkDeep(
    'bodyless declarations join their original var',
    bodylessSlotReplacement(declaration, [declaration, next]),
    { type: 'VariableDeclaration', kind: 'var', declarations: [...declaration.declarations, ...next.declarations] },
  );
  checkDeep('bodyless assignment and its reads stay together', bodylessSlotReplacement(expression, [expression, next]), { type: 'BlockStatement', body: [expression, next] });
  checkDeep(
    'bodyless joined host declarators stay embedded',
    bodylessSlotReplacement(declaration, [declaration, next], hostSlot),
    { type: 'VariableDeclaration', kind: 'var', declarations: [...declaration.declarations, ...next.declarations].map(hostSlot) },
  );
  checkDeep(
    'bodyless mixed host statements stay embedded',
    bodylessSlotReplacement(declaration, [expression, next], hostSlot),
    { type: 'BlockStatement', body: [expression, next].map(hostSlot) },
  );
  checkDeep('bodyless sole host statement stays embedded', bodylessSlotReplacement(declaration, [expression], hostSlot), hostSlot(expression));
}

for (const [source, expected] of [
  ['const [{ y: { at, other } }] = [box];', ['lead', false, false, false]],
  ['const [{ y: { at, other } }, tail] = [box, effect()];', ['trail', false, false, false]],
  ['const [{ y: { at, other } }] = ([box]);', ['lead', false, false, false]],
  ['const before = 1, [{ y: { at, other } }] = [box];', ['lead', false, false, false]],
  ['const [{ y: { at, other } }] = [box], after = 2;', ['lead', false, false, false]],
  ['const before = 1, [{ y: { at, other } }] = [box], after = 2;', null],
  ['export const [{ y: { at, other } }] = [box];', null],
  ['for (const before = 1, [{ y: { at, other } }] = [box], after = 2;;) break;', ['lead', false, true, false]],
  ['if (flag) var [{ y: { at, other } }] = [box];', ['lead', false, false, true]],
  ['const { y: { at, other } } = box;', [null, false, false, false]],
  ['const before = 1, { y: { at, other } } = box, after = 2;', [null, false, false, false]],
  ['const { y: { at, other }, keep } = box;', [null, true, false, false]],
  ['const before = 1, { y: { at, other }, keep } = box;', [null, true, false, false]],
  ['const { y: { at, other }, keep } = box, after = 2;', null],
  ['for (const { y: { at, other }, keep } = box;;) break;', null],
  ['if (flag) var { y: { at, other }, keep } = box;', null],
]) runBoth('nested leaf placement', `const box = source; ${ source }`, (parser, program, label) => {
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key?.name === 'at');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)();
  const walk = resolveNestedReceiverChain(prop, { soleSlots: true, allowLeafSiblings: true, allowSlotDefault: true, siblingLevels: true, adapter, allowAssignmentHost: true });
  check(`${ label } source walk`, !!walk, true);
  if (!walk) return;
  const original = JSON.stringify(walk.declarator.node);
  const plan = planNestedLeafHost(walk, null, { pairing: true });
  checkDeep(`${ label } placement`, plan ? [plan.navPlacement, plan.siblingLevel, plan.forInit, plan.bodyless] : null, expected);
  // the flat twin never takes a pairing: that element is the array plan's, whatever it answered
  if (walk.wrapper) check(`${ label } twin declines the pairing`, planNestedLeafHost(walk), null);
  check(`${ label } source unchanged`, JSON.stringify(walk.declarator.node), original);
});

// a pairing under an ASSIGNMENT host is still a pairing: the twin must not take it for a plain
// object host, which would discard the literal's other elements and their effects
for (const source of [
  '({ w: [x, { y: { at, other } }] } = { w: [effect(), box] });',
  '({ w: [{ y: { at, other } }] } = { w: [box] });',
]) runBoth('nested leaf placement under an assignment', `let x, at, other; const box = source; ${ source }`, (parser, program, label) => {
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key?.name === 'at');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)();
  const walk = resolveNestedReceiverChain(prop, { soleSlots: true, allowLeafSiblings: true, allowSlotDefault: true, siblingLevels: true, adapter, allowAssignmentHost: true });
  check(`${ label } source walk pairs`, !!walk?.wrapper, true);
  if (!walk) return;
  let statement = walk.declarator.parentPath;
  while (statement.node.type === 'ParenthesizedExpression') statement = statement.parentPath;
  check(`${ label } statement host`, statement.node.type, 'ExpressionStatement');
  check(`${ label } twin declines`, planNestedLeafHost(walk, statement), null);
});

for (const [name, pure, global] of [
  ['Promise', true, true], ['Map', true, true], ['ArrayBuffer', false, true],
  ['Array', false, false], ['Object', false, false], ['Reflect', false, false],
]) {
  check(`${ name } pure constructor availability`, hasConstructorEntry(name), pure);
  check(`${ name } global constructor availability`, hasConstructorEntry(name, 'global'), global);
}

for (const method of ['usage-global', 'usage-pure']) for (const [source, claimed] of [
  ['import P from "@core-js/pure/actual/promise"; P.all;', false],
  ['const P = require("@core-js/pure/actual/promise"); P.all;', false],
  ['import P from "@core-js/pure/actual/promise"; Promise.all;', true],
  ['import P from "@core-js/pure/actual/promise"; let R = P; R = Promise; R.all;', true],
  ['import P from "@core-js/pure/actual/promise"; const R = (effect(), P); R.all;', false],
  ['import P from "@core-js/pure/actual/promise/constructor"; P.all;', method === 'usage-pure'],
  ['import P from "@core-js/pure/actual/promise"; function f(P) { P.all; }', false],
]) runBoth(`constructor index already supplies its statics/${ method }`, source, (parser, program, label) => {
  const usage = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'all');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
  const meta = handleMemberExpressionNode({ node: usage.node, scope: usage.scope, path: usage, adapter,
    handledObjects: new WeakSet(), suppressProxyGlobals: new WeakSet(), resolvePure: resolve });
  check(label, meta?.placement === 'static' && meta.object === 'Promise', claimed);
});

for (const method of ['usage-global', 'usage-pure']) for (const [source, claimed] of [
  ['import P from "@core-js/pure/actual/promise"; const { all } = P;', false],
  ['const P = require("@core-js/pure/actual/promise"); const { all } = P;', false],
  ['import P from "@core-js/pure/actual/promise"; const R = (effect(), P); const { all } = R;', false],
  ['import P from "@core-js/pure/actual/promise/constructor"; const { all } = P;', method === 'usage-pure'],
  ['import P from "@core-js/pure/actual/promise"; const { all } = Promise;', true],
]) runBoth(`constructor index supplies destructured statics/${ method }`, source, (parser, program, label) => {
  const usage = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ObjectPattern');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
  const meta = buildDestructuringInitMeta({ initNode: usage.node.init, key: 'all', scope: usage.scope, path: usage, adapter });
  check(label, meta?.placement === 'static' && meta.object === 'Promise', claimed);
});

for (const method of ['usage-global', 'usage-pure']) {
  for (const entry of ['promise', 'promise/constructor']) for (const receiver of ['P', 'R', 'f()', 'box.P', 'list[0]', 'g().P']) {
    runBoth(`pure import receiver provenance/${ method }/${ entry }/${ receiver }`,
      `import P from "@core-js/pure/actual/${ entry }";
       const R = P, box = { P }, list = [P]; function f() { return P; } function g() { return { P }; } ${ receiver }.all;`,
      (parser, program, label) => {
        const usage = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'all');
        const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
        const meta = handleMemberExpressionNode({ node: usage.node, scope: usage.scope, path: usage, adapter,
          handledObjects: new WeakSet(), suppressProxyGlobals: new WeakSet(), resolvePure: resolve });
        check(label, meta?.placement === 'static' && meta.object === 'Promise',
          method === 'usage-pure' && entry === 'promise/constructor');
      });
  }
}

for (const method of ['usage-global', 'usage-pure']) for (const key of ['at', 'name']) {
  runBoth(`pure constructor keeps function instance typing/${ method }/${ key }`,
    `import P from "@core-js/pure/actual/promise/constructor"; const box = { P }; box.P.${ key };`,
    (parser, program, label) => {
      const usage = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === key);
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
      const meta = handleMemberExpressionNode({ node: usage.node, scope: usage.scope, path: usage, adapter,
        handledObjects: new WeakSet(), suppressProxyGlobals: new WeakSet(), resolvePure: resolve });
      check(label, meta?.receiverHint, 'function');
    });
}

for (const [source, retained] of [['Promise', false], ['Source', true]]) {
  runBoth(`constructor rest keeps its local source/${ source }`, `const Source = Promise; const { all, ...rest } = ${ source };`,
    (parser, program, label) => {
      const host = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ObjectPattern');
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      const plan = planRetainedObjectCapture({
        pattern: host.node.id, init: host.node.init, prop: host.node.id.properties[0], hostPath: host, adapter,
        kind: 'static', meta: { object: 'Promise', key: 'all', placement: 'static' },
        resolvePure: () => ({ entry: 'promise', hintName: 'Promise' }),
      });
      check(`${ label } constructor index`, plan?.restPure?.entry, 'promise');
      check(`${ label } local source`, !!plan?.restSource, retained);
    });
}

for (const source of [
  'const { w: { entries } } = { w: flag ? Object : user };',
  'const [{ w: { entries } }] = [{ w: flag ? Object : user }];',
  'const { w: [{ entries }] } = { w: [flag ? Object : user] };',
]) runBoth('retained mixed-key capture crosses object and array levels', source, (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator');
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', p => p.node.key.name === 'entries').node;
  const plan = planRetainedObjectCapture({
    pattern: host.node.id, init: host.node.init, prop, meta: { key: 'entries', guardedAliasHint: 'Object' },
    resolvePure: () => ({}), planGuardedNarrow: () => ({ instanceFallback: { kind: 'instance' } }),
  });
  let leaf = plan;
  while (leaf?.innerPlan || leaf?.elementPlan) leaf = leaf.innerPlan ?? leaf.elementPlan;
  check(label, leaf?.narrow?.instanceFallback.kind, 'instance');
});

for (const claimed of [false, true]) runBoth('queued consumption retires a quiet sibling hop',
  'const { w: { values }, y: { at } } = receiver;', (adapter, program, label) => {
    const host = adapter.pickPath(program, 'VariableDeclarator');
    const [first, second] = host.node.id.properties;
    const [consumed] = first.value.properties;
    const plan = planRetainedObjectCapture({
      pattern: host.node.id, init: host.node.init, prop: second.value.properties[0],
      isConsumedProp: item => claimed && item === consumed,
    });
    check(label, !!plan, !claimed);
  });

for (const [name, entry, anchored] of [
  ['Promise', 'promise', true], ['Map', 'map', true],
  ['Array', 'array', false], ['Object', 'object', false],
  ['Reflect', 'reflect/namespace', false], ['ArrayBuffer', 'array-buffer/constructor', false],
]) for (const rest of ['', ', ...rest']) {
  runBoth('captured rest requires a pure constructor entry',
    `const { ${ name }: { method${ rest } } } = globalThis;`, (adapter, program, label) => {
      const host = adapter.pickPath(program, 'VariableDeclarator');
      const capture = planNestedKeyedPatternCapture({ pattern: host.node.id, init: host.node.init, force: !rest });
      const pure = { entry, hintName: name };
      const anchorPure = capturedRealmCtorPure({
        capture, scope: host.scope, path: host,
        adapter: { hasBinding: () => false, getBinding: () => null, isMutatedStatic: () => false },
        resolveGlobalPolyfill: () => pure,
      });
      check(`${ label }: ${ name }`, anchorPure, !rest || anchored ? pure : null);
      const rendered = renderNestedKeyedPatternCapture(capture, {
        mintRef: () => '_held', anchorPure, injectImport: () => '_Constructor',
      });
      checkDeep(`${ label }: ${ name } source`, rendered.capture.init,
        anchorPure ? identifier('_Constructor') : host.node.init);
    });
}

for (const [source, expected, mutated = false] of [
  ['const { from, of, ...rest } = Array;', true],
  ['const { "from": from, "of": of, ...rest } = Array;', true],
  ['const { [(effect(), "from")]: from, [(effect(), "isArray")]: check, ...rest } = Array;', true],
  ['const { from, unknown, ...rest } = Array;', false],
  ['const { from, isArray, ...rest } = Array;', false, true],
  ['const { from, ...rest } = custom;', false],
]) runBoth('static rest capture admission', source, (adapter, program, label) => {
  const host = adapter.pickPath(program, 'VariableDeclarator');
  const plan = planRetainedObjectCapture({
    pattern: host.node.id, init: host.node.init, prop: host.node.id.properties[0], hostPath: host,
    kind: 'static', adapter: {
      hasBinding: () => false, getBinding: () => null, isMutatedStatic: () => mutated,
      isStringLiteral: node => node.type === 'StringLiteral' || node.type === 'Literal' && typeof node.value === 'string',
      getStringValue: node => node.value,
    },
    resolvePure: meta => meta.object === 'Array' && ['from', 'of'].includes(meta.key)
      ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null,
    resolveStaticProp: resolvePolyfillableStaticProp,
  });
  check(label, !!plan, expected);
  if (!plan) return;
  const rendered = renderRetainedObjectCapture(plan, {
    mintRef: () => 'memo', injectImport: entry => entry.replace('/', '$'),
  });
  const exclusions = rendered.declarations.at(-1).id.properties.slice(0, -1);
  for (const [index, exclusion] of exclusions.entries()) {
    const sourceProp = host.node.id.properties[index];
    check(`${ label }/exclusion is not computed`, exclusion.computed, false);
    if (sourceProp.computed) {
      check(`${ label }/computed exclusion uses the folded key`, exclusion.key.type, 'Literal');
    } else {
      checkDeep(`${ label }/plain exclusion preserves key spelling`, exclusion.key, sourceProp.key);
      check(`${ label }/plain exclusion owns its key`, exclusion.key === sourceProp.key, false);
    }
  }
});

for (const [source, expected, kind = 'static'] of [
  ['const { [Symbol.iterator]: iter, Map: { custom }, ...rest } = globalThis;', false, 'instance'],
  ['const { Array: { from }, [Symbol.iterator]: iter, ...rest } = globalThis;', false],
  ['const { from, [Symbol.iterator]: iter, ...rest } = Array;', false],
  ['const { [Symbol.iterator]: iter, from, ...rest } = Array;', false],
  ['const { from, [Symbol.iterator]: iter } = Array;', false],
  ['const key = Symbol.iterator; const { Array: { from }, [key]: iter, ...rest } = globalThis;', false],
  ['const { Array: { from }, other, ...rest } = globalThis;', false],
  ['const { Array: { from }, [Symbol.iterator]: iter } = globalThis;', false],
  ['const Symbol = { iterator: "x" }; const { Array: { from }, [Symbol.iterator]: iter, ...rest } = globalThis;', false],
]) runBoth('retained static and iterator/rest bail', source, (adapter, program, label) => {
  const host = adapter.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ObjectPattern');
  const bindingAdapter = {
    isStringLiteral: node => node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'),
    getStringValue: node => node.value,
    hasBinding: (scope, name) => !!scope?.getBinding(name),
    getBinding: (scope, name) => scope?.getBinding(name),
    method: 'usage-pure',
  };
  const plan = planRetainedObjectCapture({
    pattern: host.node.id, init: host.node.init, hostPath: host, adapter: bindingAdapter,
    resolveNodeType: adapter.makeResolver().resolveNodeType, kind,
  });
  check(label, !!plan, expected);
});

runBoth('retained static capture through an array element path',
  'const [{ from, [Symbol.iterator]: iter, ...rest }] = [Array];', (adapter, program, label) => {
    const host = adapter.pickPath(program, 'VariableDeclarator');
    const [pattern] = host.get('id').get('elements');
    const bindingAdapter = {
      isStringLiteral: node => node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'),
      getStringValue: node => node.value,
      hasBinding: (scope, name) => !!scope?.getBinding(name),
      getBinding: (scope, name) => scope?.getBinding(name),
      method: 'usage-pure',
    };
    const plan = planRetainedObjectCapture({
      pattern: pattern.node,
      patternPath: pattern,
      init: host.node.init.elements[0],
      hostPath: host,
      adapter: bindingAdapter,
      resolveNodeType: adapter.makeResolver().resolveNodeType,
      kind: 'static',
    });
    check(label, !!plan, false);
  });

for (const [receiver, expected, changedIterator] of [['Array', true], ['(sourceEffect(), Array)', true], ['custom', false], ['Array', false, true]]) {
  runBoth('retained array static capture serves a computed sibling in its own slot',
    `const [{ of: a, [(effect(), "from")]: b, length: c }, tail] = [${ receiver }, 7];`, (parser, program, label) => {
      const host = parser.pickPath(program, 'VariableDeclarator');
      const [pattern] = host.node.id.elements;
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      if (changedIterator) adapter.isMutatedStatic = (object, key) => object === 'Array.prototype' && key === 'Symbol.iterator';
      const plan = planRetainedObjectCapture({
        pattern: host.node.id,
        init: host.node.init,
        prop: pattern.properties[0],
        hostPath: host,
        adapter,
        kind: 'static',
        entry: 'array/of',
        meta: { object: 'Array', key: 'of', placement: 'static' },
        resolvePure: meta => meta.object === 'Array' && ['of', 'from'].includes(meta.key)
          ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null,
        resolveStaticProp: resolvePolyfillableStaticProp,
      });
      check(`${ label }/canonical source proof`, !!plan, expected);
      if (!plan) return;
      check(`${ label }/computed sibling is served`, plan.elementPlan.siblingStatics.get(pattern.properties[1])?.entry, 'array/from');
      let refs = 0;
      const rendered = renderRetainedObjectCapture(plan, { mintRef: () => `memo${ ++refs }`, injectImport: entry => entry.replace('/', '$'), entry: 'array/of' });
      const fromIndex = rendered.declarations.findIndex(item => item.id.name === 'b');
      check(`${ label }/computed binding follows first binding`, fromIndex,
        rendered.declarations.findIndex(item => item.id.name === 'a') + 1);
      check(`${ label }/native sibling follows computed binding`, rendered.declarations[fromIndex + 1].id.properties[0], pattern.properties[2]);
      let sourceCalls = 0;
      walkAstNodes({
        root: { type: 'Program', body: rendered.declarations },
        visit(node) {
          sourceCalls += node.type === 'CallExpression' && node.callee.name === 'sourceEffect';
        },
      });
      check(`${ label }/source prefix runs once`, sourceCalls, receiver.startsWith('(') ? 1 : 0);
    });
}

for (const [name, before, receiver, after, reusable] of [
  ['constant sibling', 'const source = unknown;', 'source', '', true],
  ['constant sibling prefix', 'const source = unknown;', '(before(), source)', '', true],
  ['member sibling', '', 'holder.source', '', false],
  ['getter writer', 'let source = unknown; const holder = { get at() { source = other; } };', 'source', '', false],
  ['later RHS writer', 'let source = unknown;', 'source', ', source = other', false],
  ['imported sibling', 'import source from "other";', 'source', '', false],
]) runBoth(`retained array capture/stable sibling ${ name }`,
  `${ before } const [{ [(effect(), "of")]: of, from }, { at, length }] = [Array, ${ receiver }${ after }];`,
  (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ArrayPattern');
    const original = JSON.stringify(host.node);
    const [pattern, sibling] = host.node.id.elements;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = planRetainedObjectCapture({
      pattern: host.node.id, init: host.node.init, prop: pattern.properties[0], hostPath: host, adapter,
      kind: 'static', entry: 'array/of', meta: { object: 'Array', key: 'of', placement: 'static' },
      resolveStaticProp: resolvePolyfillableStaticProp,
      resolvePure: meta => ['of', 'from'].includes(meta.key)
        ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null,
    });
    check(`${ label }/retained wrapper selected`, !!plan?.arrayCapture, true);
    if (!plan?.arrayCapture) return;
    check(`${ label }/sibling reuse`, !!plan.arrayCapture.elements[1].receiver, reusable);
    let refs = 0;
    const rendered = renderRetainedObjectCapture(plan, {
      mintRef: () => `memo${ ++refs }`, injectImport: entry => entry.replace('/', '$'), entry: 'array/of',
    });
    check(`${ label }/required captures`, refs, Number(!reusable));
    check(`${ label }/full RHS evaluated first`, rendered.declarations[0].init, host.node.init);
    check(`${ label }/native sibling pattern retained`, rendered.declarations.at(-1).id, sibling);
    check(`${ label }/native sibling receiver`, rendered.declarations.at(-1).init.name, reusable ? 'source' : 'memo1');
    check(`${ label }/original host unchanged`, JSON.stringify(host.node), original);
  });

for (const [name, source, expected, mutation] of [
  ['paired object array', 'let a, b, c; ({ w: [{ of: a, [(effect(), "from")]: b, length: c }] } = { w: [Array] });', true],
  ['opaque object array', 'let a, b, c; ({ w: [{ of: a, [(effect(), "from")]: b, length: c }] } = { w: custom });', false],
  ['changed paired iterator', 'let a, b, c; ({ w: [{ of: a, [(effect(), "from")]: b, length: c }] } = { w: [Array] });', false, 'iterator'],
  ['pristine realm hop', 'const [{ Array: { of: a, [(effect(), "from")]: b, length: c } }] = [globalThis];', true],
  ['foreign realm hop', 'const [{ Array: { of: a, [(effect(), "from")]: b, length: c } }] = [custom];', false],
  ['changed realm hop', 'const [{ Array: { of: a, [(effect(), "from")]: b, length: c } }] = [globalThis];', false, 'realm'],
]) runBoth(`retained nested static source handoff/${ name }`, source, (parser, program, label) => {
  const assignment = source.startsWith('let');
  const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator');
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key.name === 'of');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  if (mutation) adapter.isMutatedStatic = (object, key) => mutation === 'iterator'
    ? object === 'Array.prototype' && key === 'Symbol.iterator' : object === 'globalThis' && key === 'Array';
  const plan = planRetainedObjectCapture({
    pattern: assignment ? host.node.left : host.node.id,
    init: assignment ? host.node.right : host.node.init,
    prop: prop.node,
    hostPath: host,
    assignment,
    adapter,
    kind: 'static',
    entry: 'array/of',
    meta: { object: 'Array', key: 'of', placement: 'static' },
    resolvePure: meta => meta.object === 'Array' && ['of', 'from'].includes(meta.key)
      ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null,
    resolveStaticProp: resolvePolyfillableStaticProp,
  });
  check(`${ label }/canonical paired or pristine source proof`, !!plan, expected);
  if (!plan) return;
  let refs = 0;
  const rendered = renderRetainedObjectCapture(plan, {
    mintRef: () => `memo${ ++refs }`,
    mintDeclaredRef: () => `memo${ ++refs }`,
    injectImport: entry => entry.replace('/', '$'),
    entry: 'array/of',
  });
  let keyCalls = 0;
  let realmReads = 0;
  let fromBindings = 0;
  walkAstNodes({
    root: rendered.expression ?? { type: 'Program', body: rendered.declarations },
    visit(node) {
      keyCalls += node.type === 'CallExpression' && node.callee.name === 'effect';
      realmReads += ['Property', 'ObjectProperty'].includes(node.type) && node.key.name === 'Array';
      fromBindings += node.type === 'Identifier' && node.name === 'array$from';
    },
  });
  check(`${ label }/computed key runs once`, keyCalls, 1);
  check(`${ label }/native realm hop runs once`, realmReads, name === 'pristine realm hop' ? 1 : 0);
  check(`${ label }/computed sibling claim survives`, fromBindings, 1);
});

for (const [key, kind] of [['of', 'static'], ['Set', 'global']]) {
  runBoth(`static beside iterator pattern/${ kind }`, `const { ${ key }, [Symbol.iterator]: { name } } = source;`,
    (parser, program, label) => {
      const host = parser.pickPath(program, 'VariableDeclarator');
      const plan = planRetainedObjectCapture({
        pattern: host.node.id, init: host.node.init, prop: host.node.id.properties[0], hostPath: host, kind,
        adapter: {
          isStringLiteral: node => node.type === 'StringLiteral' || node.type === 'Literal' && typeof node.value === 'string',
          getStringValue: node => node.value,
          hasBinding: (scope, name) => !!scope?.getBinding(name),
          getBinding: (scope, name) => scope?.getBinding(name),
          method: 'usage-pure',
        },
        resolveNodeType: parser.makeResolver().resolveNodeType,
      });
      check(`${ label }: import is a value, not an instance dispatcher`, plan?.retainedStatic, true);
    });
}

for (const [pattern, expected] of [
  ['{ w: { at }, ...rest }', false],
  ['{ w: { at, other }, ...rest }', false],
  ['{ w: { at = fallback }, ...rest }', false],
]) runBoth('nested instance assignment/rest capture', `(${ pattern } = source);`, (adapter, program, label) => {
  const host = adapter.pickPath(program, 'AssignmentExpression').node;
  const prop = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property', path => path.node.key.name === 'at').node;
  const plan = planRetainedObjectCapture({ pattern: host.left, init: host.right, assignment: true, prop });
  check(label, !!plan?.nested, expected);
});

for (const [label, source, expected] of [
  ['direct declaration', 'const { at: method, ...rest } = source;', true],
  ['assignment', '({ at: method, ...rest } = source);', true],
  ['nested leaf', 'const { w: { at: method, ...rest }, after } = source;', true],
  ['outer rest', 'const { w: { at: method }, ...rest } = source;', true],
  ['array wrapper', 'const [{ at: method, ...rest }, other] = source;', true],
  ['defaulted wrapper', 'const { w: { at: method } = fallback, ...rest } = source;', true],
  ['parameter', 'function read({ at: method, ...rest } = source) {}', true],
  ['catch', 'try {} catch ({ at: method, ...rest }) {}', true],
  ['loop', 'for (const { at: method, ...rest } of source) {}', true],
  ['nested rest sibling', 'const { at: method, w: { ...rest } } = source;', false],
  ['array rest', 'const [{ at: method }, ...rest] = source;', false],
  ['rest parameter', 'function read(...args) { const { at: method } = args; }', false],
  ['computed-key expression', 'const { [(() => { const { at: method } = xs; return method; })()]: value, ...rest } = source;', false],
  ['default expression', 'const { value = (() => { const { at: method } = xs; return method; })(), ...rest } = source;', false],
]) runBoth(`object-rest extraction boundary/${ label }`, source, (adapter, program, parser) => {
  const prop = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property',
    path => path.node.value?.name === 'method');
  check(parser, hasObjectRestAncestor(prop), expected);
});

for (const [key, entry, expected] of [
  ['"at"', 'actual/instance/at', true],
  ['Symbol.iterator', 'get-iterator-method', false],
]) runBoth(`nested assignment capture/${ entry }`, `({ w: { [(effect(), ${ key })]: method } } = source);`,
  (adapter, program, label) => {
    const host = adapter.pickPath(program, 'AssignmentExpression').node;
    const prop = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.node.value?.name === 'method').node;
    const plan = planRetainedObjectCapture({ pattern: host.left, init: host.right, assignment: true, prop, entry });
    check(`${ label }: ordinary instance capture`, !!plan?.capture, expected);
  });

for (const [source, expected] of [
  ['const { [(key(), "at")]: method = fallback, after } = input;', true],
  ['const { [(key(), "at")]: method = fallback, ...rest } = input;', false],
  ['const { [(key(), "at")]: method, after } = input;', false],
  ['const { w: { [(key(), "at")]: method = fallback }, after } = input;', false],
]) runBoth('keyed default/single read boundary', source, (adapter, program, label) => {
  const path = adapter.pickPath(program, adapter.name === 'babel' ? 'ObjectProperty' : 'Property', node => node.node.computed);
  check(label, destructureKeyReadPlan(path)?.consumeKey, expected);
});

for (const [source, named] of [
  ['function () {}', true], ['() => 1', true], ['function* () {}', true], ['class {}', true],
  ['function own() {}', false], ['eval("local")', false],
]) runBoth('default guard/inferred binding name', `const method = ${ source };`, (adapter, program, label) => {
  const { init } = adapter.pickPath(program, 'VariableDeclarator').node;
  const guard = renderInstanceDefaultGuard({
    assignedRef: identifier('memo'), call: identifier('read'), reread: identifier('memo'),
    defaultValue: hostSlot(init), defaultName: 'method',
  });
  check(`${ label }/name preservation`, guard.consequent.type === 'MemberExpression', named);
  if (named) check(`${ label }/source binding name`, guard.consequent.property.value, 'method');
});

// --- isBodylessStatementSlot ---

// IfStatement consequent slot (unbraced single-statement body)
runBoth('isBodylessStatementSlot/IfStatement consequent', 'if (cond) call();', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.consequent), true);
});

// IfStatement alternate slot (unbraced else body)
runBoth('isBodylessStatementSlot/IfStatement alternate', 'if (cond) a(); else b();', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.alternate), true);
});

// IfStatement with braced consequent: BlockStatement is in the slot but classifier
// returns TRUE because slot membership is by identity, not by node type
runBoth('isBodylessStatementSlot/IfStatement braced consequent (still slot)', 'if (cond) { call(); }', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.consequent), true);
});

// WhileStatement body slot
runBoth('isBodylessStatementSlot/WhileStatement body', 'while (cond) call();', (adapter, prog, lbl) => {
  const whilePath = adapter.pickPath(prog, 'WhileStatement');
  check(lbl, isBodylessStatementSlot(whilePath.node, whilePath.node.body), true);
});

// DoWhileStatement body slot
runBoth('isBodylessStatementSlot/DoWhileStatement body', 'do call(); while (cond);', (adapter, prog, lbl) => {
  const doPath = adapter.pickPath(prog, 'DoWhileStatement');
  check(lbl, isBodylessStatementSlot(doPath.node, doPath.node.body), true);
});

// ForStatement body slot
runBoth('isBodylessStatementSlot/ForStatement body', 'for (;;) call();', (adapter, prog, lbl) => {
  const forPath = adapter.pickPath(prog, 'ForStatement');
  check(lbl, isBodylessStatementSlot(forPath.node, forPath.node.body), true);
});

// ForInStatement body slot
runBoth('isBodylessStatementSlot/ForInStatement body', 'for (const k in obj) call();', (adapter, prog, lbl) => {
  const forIn = adapter.pickPath(prog, 'ForInStatement');
  check(lbl, isBodylessStatementSlot(forIn.node, forIn.node.body), true);
});

// ForOfStatement body slot
runBoth('isBodylessStatementSlot/ForOfStatement body', 'for (const x of arr) call();', (adapter, prog, lbl) => {
  const forOf = adapter.pickPath(prog, 'ForOfStatement');
  check(lbl, isBodylessStatementSlot(forOf.node, forOf.node.body), true);
});

// LabeledStatement body slot
runBoth('isBodylessStatementSlot/LabeledStatement body', 'lbl: call();', (adapter, prog, lbl) => {
  const labeled = adapter.pickPath(prog, 'LabeledStatement');
  check(lbl, isBodylessStatementSlot(labeled.node, labeled.node.body), true);
});

// ArrowFunctionExpression body slot (single-expression body)
runBoth('isBodylessStatementSlot/ArrowFunctionExpression body', 'const f = () => call();', (adapter, prog, lbl) => {
  const arrow = adapter.pickPath(prog, 'ArrowFunctionExpression');
  check(lbl, isBodylessStatementSlot(arrow.node, arrow.node.body), true);
});

// non-host parent: BlockStatement is NOT a body-slot host type, returns false
runBoth('isBodylessStatementSlot/BlockStatement parent returns false', 'if (cond) { foo(); }', (adapter, prog, lbl) => {
  const block = adapter.pickPath(prog, 'BlockStatement');
  check(lbl, isBodylessStatementSlot(block.node, block.node.body[0]), false);
});

// non-matching position: IfStatement test slot (not consequent/alternate)
runBoth('isBodylessStatementSlot/IfStatement test (not slot)', 'if (cond) call();', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.test), false);
});

// no parent: null returns false (defensive)
check('isBodylessStatementSlot/null parent', isBodylessStatementSlot(null, { type: 'CallExpression' }), false);

// --- classifyVariableDeclarationHost ---

// plain top-level declaration: no special flags
runBoth('classifyVariableDeclarationHost/top-level single decl', 'const x = 1;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: false });
});

// multi-declarator: isMultiDecl=true
runBoth('classifyVariableDeclarationHost/multi-decl', 'let a, b, c;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: true });
});

// export wrapper: isExport=true, isBodyless suppressed even though export hosts decl
runBoth('classifyVariableDeclarationHost/export named', 'export const x = 1;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: true, isForInit: false, isBodyless: false, isMultiDecl: false });
});

// for-init slot: isForInit=true, isBodyless suppressed (different shape concern)
runBoth('classifyVariableDeclarationHost/for-init', 'for (let i = 0; i < n; i++) {}', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: true, isBodyless: false, isMultiDecl: false });
});

// bodyless host: declaration in unbraced if body
runBoth('classifyVariableDeclarationHost/bodyless if', 'if (cond) var x = 1;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: true, isMultiDecl: false });
});

// bodyless + multi-decl
runBoth('classifyVariableDeclarationHost/bodyless multi-decl', 'while (cond) var a = 1, b = 2;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: true, isMultiDecl: true });
});

// for-init multi-decl: isMultiDecl + isForInit
runBoth('classifyVariableDeclarationHost/for-init multi-decl', 'for (let i = 0, j = 1; i < n; i++) {}', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: true, isBodyless: false, isMultiDecl: true });
});

// `for-in` init: classifier returns isForInit=false because parent.type is ForInStatement,
// not ForStatement - the helper specifically checks ForStatement.init slot
runBoth('classifyVariableDeclarationHost/for-in init not isForInit', 'for (var k in obj) {}', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: false });
});

// --- isLoopStatement (element-wise over the closed loop-type domain, both parsers) ---

const LOOP_SOURCES = [
  ['ForStatement', 'for (;;) call();'],
  ['ForInStatement', 'for (const k in obj) call();'],
  ['ForOfStatement', 'for (const x of arr) call();'],
  ['WhileStatement', 'while (cond) call();'],
  ['DoWhileStatement', 'do call(); while (cond);'],
];
for (const [type, src] of LOOP_SOURCES) {
  runBoth(`isLoopStatement/${ type }`, src, (adapter, prog, lbl) => {
    check(lbl, isLoopStatement(adapter.pickPath(prog, type).node), true);
  });
}

// negatives: non-loop statements, a label WRAPPING a loop (the wrapper is not the loop),
// and null-safety
runBoth('isLoopStatement/IfStatement negative', 'if (cond) call();', (adapter, prog, lbl) => {
  check(lbl, isLoopStatement(adapter.pickPath(prog, 'IfStatement').node), false);
});
runBoth('isLoopStatement/LabeledStatement wrapper negative', 'outer: for (;;) call();', (adapter, prog, lbl) => {
  const label = adapter.pickPath(prog, 'LabeledStatement');
  check(lbl, isLoopStatement(label.node), false);
  check(lbl, isLoopStatement(label.node.body), true);
  check(lbl, isLoopStatement(null), false);
});

// --- peelLabeledStatements ---

// a stacked label chain peels to the innermost hosted statement - the loop three labels down
runBoth('peelLabeledStatements/stacked labels reach the loop', 'a: b: c: for (;;) call();', (adapter, prog, lbl) => {
  const outer = adapter.pickPath(prog, 'LabeledStatement');
  const peeled = peelLabeledStatements(outer.node);
  check(lbl, isLoopStatement(peeled), true);
  check(lbl, peeled.type === 'ForStatement', true);
});

// a non-labeled node is identity; a single label peels one level
runBoth('peelLabeledStatements/identity and single level', 'x: call();', (adapter, prog, lbl) => {
  const label = adapter.pickPath(prog, 'LabeledStatement');
  check(lbl, peelLabeledStatements(label.node).type === 'ExpressionStatement', true);
  check(lbl, peelLabeledStatements(label.node.body) === label.node.body, true);
});

// --- classifyVariableDeclarationHost: the three shapes are mutually exclusive ---

// the classifier used to gate `isBodyless` on `!isExport && !isForInit`. that gate is subsumed by
// the slot test itself: an export wrapper hosts no statement slot, and a for-INIT declaration sits
// in `init`, never in `body`. enumerate the three hosts plus a plain block so a future slot-table
// widening cannot silently make two of them true at once
for (const [label, code, pick, expected] of [
  ['export wrapper', 'export const { from } = Array;',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: true, isForInit: false, isBodyless: false }],
  ['for-init slot', 'for (const { from } = Array; ; ) call();',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: true, isBodyless: false }],
  ['unbraced if consequent', 'if (cond) var { from } = Array;',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: false, isBodyless: true }],
  ['plain block statement', '{ var { from } = Array; }',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: false, isBodyless: false }],
  ['unbraced for body', 'for (;;) var { from } = Array;',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: false, isBodyless: true }],
]) {
  runBoth(`classifyVariableDeclarationHost/${ label }`, code, (adapter, prog, lbl) => {
    const declPath = pick(adapter, prog);
    const shape = classifyVariableDeclarationHost({
      declaration: declPath.node, declarationParent: declPath.parentPath.node,
    });
    check(`${ lbl }/isExport`, shape.isExport, expected.isExport);
    check(`${ lbl }/isForInit`, shape.isForInit, expected.isForInit);
    check(`${ lbl }/isBodyless`, shape.isBodyless, expected.isBodyless);
    check(`${ lbl }/at most one shape`,
      [shape.isExport, shape.isForInit, shape.isBodyless].filter(Boolean).length <= 1, true);
  });
}

// the standalone for-init canon answers the same question the classifier reports, so the emitters
// can consult either without drifting - and the for-BODY slot is NOT the init slot
runBoth('isForInitDeclaration/init vs body slot', 'for (var { from } = Array; ;) var { of } = Array;',
  (adapter, prog, lbl) => {
    const [head, body] = adapter.collectPaths(prog, 'VariableDeclaration', () => true);
    check(`${ lbl }/init`, isForInitDeclaration(head.parentPath.node, head.node), true);
    check(`${ lbl }/body`, isForInitDeclaration(body.parentPath.node, body.node), false);
  });

for (const source of ['const [{ inner: { [(key(), "flat")]: method } }] = [box];', 'const [{ y: { at, ...rest } }] = source;']) {
  runBoth('array wrapper capture/retained key or rest keeps native iteration', source, (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const restPattern = pattern.elements[0].properties[0].value;
    const plan = planArrayWrapperCapture({ pattern, init, force: true, restPattern });
    check(`${ lbl }/capture selected`, !!plan, true);
    if (!plan) return;
    const rendered = renderArrayWrapperCapture(plan, { mintRef: () => 'memo' });
    check(`${ lbl }/initializer is evaluated once`, rendered.capture.init === init, true);
    check(`${ lbl }/iteration remains native`, rendered.capture.id.type, 'ArrayPattern');
    check(`${ lbl }/nested pattern retains its keys and rest`, rendered.elements[0].declarator.id === pattern.elements[0], true);
  });
}

runBoth('retained assignment capture/one computed slot keeps its read in order',
  '({ [(key(), "at")]: method } = source);', (adapter, prog, lbl) => {
    const { left: pattern, right: init } = adapter.pickPath(prog, 'AssignmentExpression').node;
    const plan = planRetainedObjectCapture({ pattern, init, assignment: true, prop: pattern.properties[0] });
    check(`${ lbl }/a sole computed slot needs capture`, !!plan, true);
  });

for (const source of [
  'const held = ({ of } = Array);',
  'const held = (before(), ({ of } = Array));',
  'if (yes) ({ of } = Array);',
  'label: ({ of } = Array);',
]) runBoth('ordered assignment capture/preserves the RHS identity', source, (adapter, prog, lbl) => {
  const host = adapter.pickPath(prog, 'AssignmentExpression');
  const { left: pattern, right: init } = host.node;
  const plan = planRetainedObjectCapture({ pattern, init, assignment: true, prop: pattern.properties[0],
    hostPath: host, kind: 'static', adapter: { hasBinding: () => false },
    resolveStaticProp: () => ({ pure: { kind: 'static', entry: 'actual/array/of', hintName: 'Array$of' } }) });
  check(`${ lbl }/plans`, !!plan, true);
  const rendered = renderRetainedObjectCapture(plan, {
    mintDeclaredRef: () => 'memo', injectImport: () => 'ofImport',
  });
  const { expressions } = rendered.expression;
  const consumed = source.startsWith('const held');
  check(`${ lbl }/RHS evaluates first`, (consumed ? expressions[0].right : expressions[0]) === init, true);
  check(`${ lbl }/the claim follows`, expressions[1].right.name, 'ofImport');
  check(`${ lbl }/only a consumed result is retained`, expressions.length, consumed ? 3 : 2);
  if (consumed) check(`${ lbl }/the result is the captured receiver`, expressions.at(-1).name, 'memo');
});

runBoth('array wrapper capture/effects before a nested pattern and its sibling',
  'for (let [, [{ w: { values }, y: { at } }], { z }] = [eff(), [r], other]; ;) {}',
  (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planArrayWrapperCapture({ pattern, init });
    checkDeep(`${ lbl }/source positions`, plan.elements.map(element => element.path), [[1, 0], [2]]);
    let refs = 0;
    const rendered = renderArrayWrapperCapture(plan, { mintRef: () => `memo${ ++refs }` });
    check(`${ lbl }/initializer evaluates once in the capture`, rendered.capture.init === init, true);
    check(`${ lbl }/leading elision survives`, rendered.capture.id.elements[0], null);
    check(`${ lbl }/nested iteration survives`, rendered.capture.id.elements[1].elements[0].name, 'memo1');
    check(`${ lbl }/sibling position survives`, rendered.capture.id.elements[2].name, 'memo2');
    checkDeep(`${ lbl }/source order`, rendered.elements.map(element => element.declarator.init.name), ['memo1', 'memo2']);
    check(`${ lbl }/first pattern keeps its source identity`, rendered.elements[0].declarator.id === pattern.elements[1].elements[0], true);
    check(`${ lbl }/sibling pattern keeps its source identity`, rendered.elements[1].declarator.id === pattern.elements[2], true);
    check(`${ lbl }/source pattern is untouched`, pattern.elements[1].elements[0].type, 'ObjectPattern');
  });

for (const [label, source] of [
  ['opaque nested element', 'const [{ data: { at: method } }] = [make()];'],
  ['quiet sibling patterns', 'const [{ values }, { at }] = [left, right];'],
  ['trailing effect', 'const [{ values }] = [left, eff()];'],
  ['parenthesized literal', 'const [{ values }] = ([left, eff()]);'],
]) {
  runBoth(`array wrapper capture/${ label }`, source, (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planArrayWrapperCapture({ pattern, init });
    check(`${ lbl }/capture is required`, !!plan, true);
    let refs = 0;
    const rendered = renderArrayWrapperCapture(plan, {
      mintRef: () => `memo${ ++refs }`,
      embed: node => ({ type: 'Wrapped', node }),
    });
    check(`${ lbl }/initializer crosses the host boundary`, rendered.capture.init.node === init, true);
    check(`${ lbl }/pattern crosses the host boundary`, rendered.elements[0].declarator.id.node === pattern.elements[0], true);
  });
}

for (const [source, expected] of [
  ['const [{ data: { at: method } }] = [make()];', true],
  ['const [{ data: { at: method }, Object: { is } }] = [make()];', false],
  ['const [{ data: { at: method } }] = [{ data: make() }];', false],
  ['const [{ data: { at: method } }] = [{ data: make() } as any];', false],
  ['const [{ data: { at: method } }] = [make(), effect()];', false],
  ['const [{ at: method }] = [make()];', false],
]) runBoth('array wrapper capture/one nested declaration claim', source, (adapter, program, label) => {
  const { id: pattern, init } = adapter.pickPath(program, 'VariableDeclarator').node;
  check(label, !!planArrayWrapperCapture({ pattern, init, nestedOnly: true }), expected);
});

for (const [label, source] of [
  ['quiet sole element', 'const [{ values }] = [left];'],
  ['nonliteral initializer', 'const [{ values }, { at }] = source;'],
  ['rest position', 'const [{ values }, ...rest] = [left, eff()];'],
  ['spread position', 'const [{ values }, { at }] = [left, ...source];'],
  ['nested rest position', 'const [[{ values }, ...rest]] = [[left, right], eff()];'],
  ['nested spread position', 'const [[{ values }]] = [[...source], eff()];'],
  ['defaulted element', 'const [{ values } = fallback] = [left, eff()];'],
]) {
  runBoth(`array wrapper capture/${ label }`, source, (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    check(lbl, planArrayWrapperCapture({ pattern, init }), null);
  });
}

runBoth('array wrapper capture/leaves realm rest to the receiver mirror',
  'const [{ [Symbol.iterator]: iterator, Array: { from }, ...rest }] = [globalThis];',
  (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    check(lbl, planArrayWrapperCapture({ pattern, init, force: true, restPattern: pattern.elements[0], adapter: {} }), null);
  });

for (const [source, captured] of [
  ['const [{ at }] = [source, ...tail];', true],
  ['const [{ at }, other] = [source, ...tail];', false],
]) runBoth('array wrapper capture/opaque trailing spread', source, (adapter, program, label) => {
  const { id: pattern, init } = adapter.pickPath(program, 'VariableDeclarator').node;
  const plan = planArrayWrapperCapture({ pattern, init, force: true, trailingSpread: true });
  check(`${ label } preserves fixed positions`, !!plan, captured);
  if (plan) check(`${ label } keeps source iteration`, plan.init, init);
});

runBoth('nested keyed capture/outer keys and source leaf survive',
  'const { [(outer(), "w")]: { middle: { [(inner(), "at")]: method } } } = make();',
  (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planNestedKeyedPatternCapture({ pattern, init });
    check(`${ lbl }/every outer hop is retained`, plan.ancestors.length, 2);
    check(`${ lbl }/source leaf has not moved`, isCapturedKeyedPattern(plan.leafPattern), false);
    let refs = 0;
    const rendered = renderNestedKeyedPatternCapture(plan, { mintRef: () => `memo${ ++refs }` });
    check(`${ lbl }/moved leaf retains its coercion obligation`, isCapturedKeyedPattern(plan.leafPattern), true);
    check(`${ lbl }/initializer evaluates once in the capture`, rendered.capture.init === init, true);
    check(`${ lbl }/outer key is retained`, rendered.elements[0].declarator.id.properties[0].key === pattern.properties[0].key, true);
    const guardedInit = rendered.elements[0].declarator.init;
    check(`${ lbl }/null rejection precedes the key`, guardedInit.type, 'ConditionalExpression');
    check(`${ lbl }/guard checks the captured source`, guardedInit.test.right.name, rendered.capture.id.name);
    check(`${ lbl }/inner hop binds the capture`, rendered.elements[1].declarator.id.properties[0].value.name, 'memo1');
    check(`${ lbl }/leaf preserves its source identity`, rendered.elements.at(-1).declarator.id === plan.leafPattern, true);
    check(`${ lbl }/leaf reads the captured receiver`, rendered.elements.at(-1).declarator.init.name, 'memo1');
    check(`${ lbl }/source chain is untouched`, pattern.properties[0].value.properties[0].value.type, 'ObjectPattern');
  });

for (const [label, source] of [
  ['leaf default', 'const { [(outer(), "w")]: { at: method = fallback } } = input;'],
  ['outer key only', 'const { [(outer(), "w")]: { at: method } } = input;'],
  ['leaf key only', 'const { w: { [(inner(), "at")]: method } } = input;'],
  ['outer default', 'const { [(outer(), "w")]: { at: method } = fallback } = input;'],
  ['default under computed key', 'const { before, w: { [(key(), "at")]: method = fallback(), ...rest }, after } = source;'],
  ['leaf rest', 'const { [(outer(), "w")]: { at: method, ...rest } } = input;'],
  ['outer sibling', 'const { [(outer(), "w")]: { at: method }, other } = input;'],
  ['leaf sibling', 'const { [(outer(), "w")]: { at: method, other } } = input;'],
  ['leaf key with inner siblings', 'const { q, p: { [(key(), "flat")]: method, other } } = source;'],
  ['leaf key with outer siblings', 'const { before, w: { [(inner(), "at")]: method }, after } = input;'],
]) {
  runBoth(`nested keyed capture/${ label }`, source, (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planNestedKeyedPatternCapture({ pattern, init });
    check(`${ lbl }/capture is required`, !!plan, true);
    const rendered = renderNestedKeyedPatternCapture(plan, {
      mintRef: () => 'memo',
      embed: node => ({ type: 'Wrapped', node }),
    });
    check(`${ lbl }/initializer crosses the host boundary`, rendered.capture.init.node === init, true);
    check(`${ lbl }/leaf crosses the host boundary once`,
      rendered.elements.filter(element => element.declarator.id.node === plan.leafPattern).length, 1);
  });
}

runBoth('nested keyed capture/outer siblings surround the leaf',
  'const { before, w: { [(inner(), "at")]: method }, after } = input;', (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planNestedKeyedPatternCapture({ pattern, init });
    let refs = 0;
    const rendered = renderNestedKeyedPatternCapture(plan, { mintRef: () => `memo${ ++refs }` });
    const order = rendered.elements.map(({ declarator }) => declarator.id === plan.leafPattern
      ? 'method' : declarator.id.properties[0].key.name);
    checkDeep(`${ lbl }/binding order`, order, ['before', 'w', 'method', 'after']);
  });

for (const assignment of [false, true]) for (const first of [false, true]) {
  const pattern = first ? '[key()]: picked, row: { at }' : 'row: { at }, [key()]: picked';
  runBoth('nested native siblings guard only an uncoerced receiver',
    assignment ? `({ ${ pattern } } = source);` : `const { ${ pattern } } = source;`, (parser, program, label) => {
      const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator');
      const plan = planNestedKeyedPatternCapture({ pattern: assignment ? host.node.left : host.node.id, init: assignment ? host.node.right : host.node.init });
      const rendered = renderNestedKeyedPatternCapture(plan, { mintRef: () => 'memo', assignment });
      const read = rendered.elements.find(({ declarator }) => declarator.id.properties?.[0].computed).declarator.init;
      check(`${ label }: preceding native read/${ assignment }/${ first }`, read.type, first ? 'ConditionalExpression' : 'Identifier');
    });
}

for (const [label, source] of [
  ['direct leaf', 'const { [(inner(), "at")]: method } = input;'],
  ['effect-free keys', 'const { w: { ["at"]: method } } = input;'],
  ['two nested branches', 'const { w: { [(inner(), "at")]: method }, x: { other } } = input;'],
  ['outer rest', 'const { [(outer(), "w")]: { at: method }, ...rest } = input;'],
]) {
  runBoth(`nested keyed capture/${ label }`, source, (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    check(lbl, planNestedKeyedPatternCapture({ pattern, init }), null);
  });
}

runBoth('nested guarded capture/one receiver supplies the identity test and fallback',
  'const { Q: { of: method } } = source;', (adapter, prog, lbl) => {
    const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const plan = planNestedKeyedPatternCapture({ pattern, init, force: true });
    const rendered = renderNestedKeyedPatternCapture(plan, {
      mintRef: () => 'memo',
      narrow: { branches: [{ ctorName: 'Array', staticPure: { kind: 'static', entry: 'array/of', hintName: 'of' } }] },
      injectImport: () => 'pureOf',
    });
    const leaf = rendered.elements[0].declarator;
    check(`${ lbl }/native outer read`, rendered.capture.id.properties[0].value.name, 'memo');
    check(`${ lbl }/source binding`, leaf.id.name, 'method');
    check(`${ lbl }/same receiver in test`, leaf.init.test.left.name, 'memo');
    check(`${ lbl }/same receiver in fallback`, leaf.init.alternate.object.name, 'memo');
    check(`${ lbl }/static import`, leaf.init.consequent.name, 'pureOf');
  });

for (const source of [
  'const { Q: { of: method }, other } = source;',
  'const { Q: { of: method = fallback } } = source;',
  'const { Q: { of: method }, ...rest } = source;',
]) runBoth('nested guarded capture/force keeps the structural exclusions', source, (adapter, prog, lbl) => {
  const { id: pattern, init } = adapter.pickPath(prog, 'VariableDeclarator').node;
  check(lbl, planNestedKeyedPatternCapture({ pattern, init, force: true }), null);
});

// --- planMinifierSequenceSplit ---
// the plan both bindings apply: one entry per minifier-sequence statement, one product per
// operand, each product carrying its operand's span. the two parsers differ in what reaches the
// tree (oxc keeps the parens, babel drops them), so the plan is held to the same shape on both

// a statement list: one entry with the list, the statement and its products in operand order,
// every product an ExpressionStatement over the very operand node, spanned like it
runBoth('planMinifierSequenceSplit/list entry', 'const src = [1];\n(eff(), ({ at } = src), use(at));\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry`, plan.length, 1);
  const [entry] = plan;
  check(`${ lbl }: the entry names the list`, entry.statements, prog.node.body);
  check(`${ lbl }: the entry names the statement`, entry.statement, prog.node.body[1]);
  check(`${ lbl }: one product per operand`, entry.products.length, 3);
  // oxc keeps the statement's parens as a node, babel drops them - the sequence sits under either
  const sequence = entry.statement.expression.type === 'ParenthesizedExpression' ? entry.statement.expression.expression : entry.statement.expression;
  check(`${ lbl }: products are expression statements`, entry.products.every(product => product.type === 'ExpressionStatement'), true);
  check(`${ lbl }: products embed the operands themselves`,
    entry.products.every((product, index) => product.expression === sequence.expressions[index]), true);
  check(`${ lbl }: products carry their operands' spans`,
    entry.products.every(product => product.start === product.expression.start && product.end === product.expression.end), true);
  check(`${ lbl }: no host in a list entry`, entry.host, undefined);
});

// an un-braced control-flow slot: the entry names the host and the key, never a list
runBoth('planMinifierSequenceSplit/slot entry', 'const src = [1];\nif (c) (eff(), ({ at } = src));\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry`, plan.length, 1);
  const [entry] = plan;
  check(`${ lbl }: the entry names the host`, entry.host, prog.node.body[1]);
  check(`${ lbl }: the entry names the key`, entry.key, 'consequent');
  check(`${ lbl }: the entry names the slot statement`, entry.statement, prog.node.body[1].consequent);
  check(`${ lbl }: no list in a slot entry`, entry.statements, undefined);
  check(`${ lbl }: two products`, entry.products.length, 2);
});

// a nested minifier sequence flattens in the same plan - no second pass over the tree
runBoth('planMinifierSequenceSplit/nested operand flattens', 'const src = [1];\n(a(), (b(), ({ at } = src)), ({ flat } = src));\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry`, plan.length, 1);
  const spelled = plan[0].products.map(product => {
    const expression = product.expression.type === 'ParenthesizedExpression' ? product.expression.expression : product.expression;
    return expression.type === 'CallExpression' ? expression.callee.name : expression.left.properties[0].key.name;
  });
  check(`${ lbl }: four products in source order`, spelled.join(','), 'a,b,at,flat');
});

// a quiet LITERAL operand leaves no product: the minifier's `0`, a string in any slot (so a
// leading one never reaches the Directive Prologue - cast-wrapped or not, the cast vanishes at
// type-strip). a name may throw and a function carries the author's code: both stay, in order
runBoth('planMinifierSequenceSplit/quiet operands', [
  'const src = [1];',
  '("use strict" as any, 0, null, true, 1n, /re/, ({ at } = src), "later", name, function () {}, use(at));',
].join('\n'), (adapter, prog, lbl) => {
  const [entry] = planMinifierSequenceSplit(prog.node);
  const spelled = entry.products.map(product => {
    const expression = product.expression.type === 'ParenthesizedExpression' ? product.expression.expression : product.expression;
    if (expression.type === 'CallExpression') return expression.callee.name;
    if (expression.type === 'AssignmentExpression') return expression.left.properties[0].key.name;
    return expression.type === 'Identifier' ? expression.name : expression.type;
  });
  check(`${ lbl }: every operand but the literals, in order`, spelled.join(','), 'at,name,FunctionExpression,use');
});

// `embed` wraps every operand for the binding's dialect
runBoth('planMinifierSequenceSplit/embed wraps the operands', 'const src = [1];\n(eff(), ({ at } = src));\n', (adapter, prog, lbl) => {
  const [entry] = planMinifierSequenceSplit(prog.node, { embed: node => ({ type: 'Wrapped', node }) });
  check(`${ lbl }: every operand is wrapped`, entry.products.every(product => product.expression.type === 'Wrapped'), true);
});

// a `require(...)` slot is the destructure's twin: the minifier joins an entry statement with its
// neighbours the same way, in any slot, and the split is what lets entry detection read the call
// on its own line and keep the neighbours as statements. the entry canon reads the slot, so the
// indirect and optional spellings split too; a sequence with neither shape is not a plan entry
runBoth('planMinifierSequenceSplit/require slot', [
  "(a(), require('core-js/x'), b());",
  "(require('core-js/y'), c());",
  "((0, require)('core-js/z'), d());",
  "(require?.('core-js/w'), e());",
  '(f(), g());',
].join('\n'), (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry per statement with a require slot`, plan.length, 4);
  check(`${ lbl }: middle slot splits into three`, plan[0].products.length, 3);
  check(`${ lbl }: head slot splits into two`, plan[1].products.length, 2);
  check(`${ lbl }: a plain call sequence is not planned`, plan.some(entry => entry.statement === prog.node.body[4]), false);
});

// a statement list nested inside an operand is planned too, with its own list
runBoth('planMinifierSequenceSplit/list inside an operand', 'const src = [1];\n(a(), ({ at } = src), () => { (b(), ({ flat } = src)); });\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: two entries`, plan.length, 2);
  check(`${ lbl }: the inner entry names the arrow body`, plan[1].statements !== prog.node.body && Array.isArray(plan[1].statements), true);
});

// an un-braced slot nested inside an operand is planned too: the entries hold nodes, so the slot's
// host stays reachable whatever the outer list's splice does around it
runBoth('planMinifierSequenceSplit/slot inside an operand', 'const src = [1];\n(a(), ({ at } = src), () => { if (c) (b(), ({ flat } = src)); });\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: two entries`, plan.length, 2);
  check(`${ lbl }: the inner entry is a slot of the if inside the arrow`, plan[1].host?.type === 'IfStatement' && plan[1].key === 'consequent', true);
});

// a statement without the shape plans nothing: a bare destructure, a sequence without one
runBoth('planMinifierSequenceSplit/no shape, no entry', 'const src = [1];\n({ at } = src);\n(a(), b());\n', (adapter, prog, lbl) => {
  check(lbl, planMinifierSequenceSplit(prog.node).length, 0);
});

// A census-backed plan must read only indexed operands, even in a file with no match.
// Keeping inert patterns and unrelated require calls split is part of the existing output contract.
for (const [source, count] of [
  ['function unrelated() { return [1, 2, 3]; } (a(), b());', 0],
  ['(a(), ({ custom: value } = source));', 1],
  ['(a(), ({ Map: M } = globalThis));', 1],
  ['(a(), ({ from } = Array));', 1],
  ['(a(), ([{ at }] = source));', 1],
  ['(a(), ({ [key()]: value = fallback() } = source));', 1],
  ['(a(), ({ ...rest } = source));', 1],
  ['(a(), require("unrelated"));', 1],
  ['(a(), (0, \\u0072equire)("core-js"));', 1],
  ['(a(), ({ custom } = source), () => { if (c) (b(), ({ Map: M } = globalThis)); });', 2],
  ['const f = () => (a(), ({ at } = source));', 0],
  ['const value = (a(), require("core-js"));', 0],
]) runBoth('minifier census indexed operands', source, (adapter, prog, lbl) => {
  const before = JSON.stringify(prog.node);
  const census = collectFileCensus(prog.node, [minifierSequenceReducer()]);
  check(`${ lbl }: matching statements`, census.minifierSequences.length, count);
  check(`${ lbl }: collection leaves the source intact`, JSON.stringify(prog.node), before);
  const { body } = prog.node;
  let reads = 0;
  Object.defineProperty(prog.node, 'body', { configurable: true, get() {
    reads++;
    return body;
  } });
  const plan = planMinifierSequenceSplit(prog.node, { census });
  check(`${ lbl }: plan preserves the matches`, plan.length, count);
  check(`${ lbl }: no second root walk`, reads, 0);
  Object.defineProperty(prog.node, 'body', { configurable: true, writable: true, value: body });
  check(`${ lbl }: planning leaves the source intact`, JSON.stringify(prog.node), before);
});

for (const host of [
  'SPLIT',
  '{ SPLIT }',
  'if (c) SPLIT else SPLIT',
  'while (c) SPLIT',
  'do SPLIT while (c);',
  'for (;;) SPLIT',
  'for (const key in source) SPLIT',
  'for (const value of source) SPLIT',
  'label: SPLIT',
  'switch (c) { case 1: SPLIT break; default: SPLIT }',
  'try { SPLIT } catch (error) { SPLIT } finally { SPLIT }',
  'class C { static { SPLIT } method() { SPLIT } }',
  'namespace N { SPLIT }',
  'const f = () => { SPLIT };',
]) runBoth('minifier census statement positions', host.replaceAll('SPLIT', '(before(), ({ at } = source), after());'), (adapter, prog, lbl) => {
  const census = collectFileCensus(prog.node, [minifierSequenceReducer()]);
  const plan = planMinifierSequenceSplit(prog.node, { census });
  check(`${ lbl }: every position planned`, plan.length, host.split('SPLIT').length - 1);
  for (const entry of plan) {
    check(`${ lbl }: source position retained`, entry.statements?.includes(entry.statement) ?? entry.host[entry.key] === entry.statement, true);
    check(`${ lbl }: ordered products`, entry.products.length, 3);
  }
});

// --- minifier census: the un-braced slot half ---
// the un-braced half of the statement lattice: slots that hold ONE statement instead of a list.
// a pass rewriting a statement into several has to brace these first, so the enumeration has to
// name every such slot, skip the braced ones (they belong to the statement-list walk, and visiting
// both would double-handle the same statement), and reach slots nested inside other statements

function splitStatement(tag) {
  return { type: 'ExpressionStatement', expression: {
    type: 'SequenceExpression', expressions: [
      { type: 'Identifier', name: tag },
      { type: 'AssignmentExpression', operator: '=', left: { type: 'ObjectPattern', properties: [] }, right: identifier('source') },
    ],
  } };
}
function splitSlotsOf(root) {
  const plan = planMinifierSequenceSplit(root);
  for (const entry of plan) {
    check('minifier census/excludes statement-shaped sidecars', entry.statements?.includes(entry.statement) ?? entry.host[entry.key] === entry.statement, true);
  }
  return plan.filter(entry => entry.host).map(({ host, key }) => `${ host.type }.${ key }`).sort().join(',');
}

// every declared host reports its slot when the slot holds a bare statement
for (const [type, keys] of SINGLE_STATEMENT_SLOTS) {
  const node = { type };
  for (const key of keys) node[key] = splitStatement(key);
  check(`minifier census/${ type } reports its slots`,
    splitSlotsOf(node), keys.map(key => `${ type }.${ key }`).sort().join(','));
}

// a braced body is a statement-list host, so it belongs to the other walk and must NOT be reported
check('minifier census/braced body skipped',
  splitSlotsOf({ type: 'ForStatement', body: { type: 'BlockStatement', body: [splitStatement('a')] } }), '');

// only one arm of an `if` braced - the bare arm still reports
check('minifier census/mixed if arms',
  splitSlotsOf({ type: 'IfStatement', consequent: { type: 'BlockStatement', body: [] }, alternate: splitStatement('b') }),
  'IfStatement.alternate');

// an absent slot (`if` with no else) reports nothing for it
check('minifier census/absent alternate',
  splitSlotsOf({ type: 'IfStatement', consequent: splitStatement('a'), alternate: null }), 'IfStatement.consequent');

// slots nested inside another statement are reached - the walk recurses structurally
check('minifier census/nested slot reached',
  splitSlotsOf({ type: 'WhileStatement', body: { type: 'ForStatement', body: splitStatement('a') } }),
  'ForStatement.body');

// a node type outside the table never reports, whatever it holds at `body`
check('minifier census/non-slot host ignored',
  splitSlotsOf({ type: 'SwitchCase', consequent: [splitStatement('a')], body: splitStatement('b') }), '');

for (const siblings of ['', ', tail']) runBoth('retained wrapper computed key shares one call result',
  `let method, tail; [{ [(key(), "at")]: method }${ siblings }] = [source(), 7];`, (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression');
    const [prop] = host.node.left.elements[0].properties;
    const plan = planRetainedObjectCapture({ pattern: host.node.left, init: host.node.right, assignment: true, prop });
    check(`${ label }/keeps native iteration`, !!plan?.arrayCapture, true);
    check(`${ label }/owns the keyed element`, plan?.elementPattern, host.node.left.elements[0]);
    check(`${ label }/keeps sibling positions`, plan?.arrayCapture.elements.length, siblings ? 2 : 1);
  });

for (const [capture, expected] of [
  ['const result = ({ from, of = fallback } = source || Array);', true],
  ['({ from, of = fallback } = source || Array);', false],
  ['function read() { return ({ from, of = fallback } = source || Array); }', true],
  ['consume(({ from, of = fallback } = source || Array));', true],
]) runBoth('selected assignment capture', `let from, of; ${ capture }`, (parser, program, label) => {
  const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ObjectPattern');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  function resolvePure(meta) {
    return meta.kind === 'property' && meta.object === 'Array'
      && (meta.key === 'from' || meta.key === 'of') ? { kind: 'static', entry: `array/${ meta.key }`, hintName: meta.key } : null;
  }
  const plan = planRetainedObjectCapture({
    pattern: host.node.left,
    init: host.node.right,
    assignment: true,
    prop: host.node.left.properties[0],
    hostPath: host,
    adapter,
    kind: 'static',
    entry: 'array/from',
    meta: { kind: 'property', object: 'Array', key: 'from', placement: 'static', fromFallback: true },
    resolvePure,
    resolveStaticProp: resolvePolyfillableStaticProp,
    planGuardedNarrow: planGuardedStaticNarrow,
  });
  check(`${ label } guards the captured receiver`, !!plan?.narrow, expected);
  if (expected) {
    check(`${ label } primary candidate`, plan.narrow.branches[0].ctorName, 'Array');
    check(`${ label } sibling candidate`, plan.siblingStatics.get(host.node.left.properties[1])?.narrow.branches[0].ctorName, 'Array');
  }
});

for (const [source, expected] of [
  ['const host = ({ Map: C } = globalThis);', true],
  ['flag && ({ Map: C } = globalThis);', true],
  ['flag ? ({ Map: C } = globalThis) : 0;', true],
  ['({ Map: C } = globalThis);', false],
  ['if (flag) ({ Map: C } = globalThis);', false],
]) runBoth('captured realm global extraction', `let C; ${ source }`, (parser, program, label) => {
  const host = parser.pickPath(program, 'AssignmentExpression');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const pure = { kind: 'global', entry: 'map', hintName: 'Map' };
  const plan = planRetainedObjectCapture({
    pattern: host.node.left,
    init: host.node.right,
    assignment: true,
    prop: host.node.left.properties[0],
    hostPath: host,
    adapter,
    kind: 'global',
    entry: 'map',
    resolvePure: meta => meta.object === 'globalThis' && meta.key === 'Map' ? pure : null,
    resolveStaticProp: resolvePolyfillableStaticProp,
  });
  check(`${ label } admits a consumed assignment`, !!plan, expected);
  if (expected) {
    check(`${ label } retains the realm source`, plan.init, host.node.right);
    check(`${ label } extracts the constructor value`, plan.primaryPure, pure);
    check(`${ label } uses a value import`, plan.retainedStatic, true);
  }
});

for (const [source, kind, expected] of [
  ['const { [(effect(), "data")]: { at } } = source;', 'instance', true],
  ['const { data: { [(effect(), "at")]: at } } = source;', 'instance', true],
  ['const { before, [(effect(), "data")]: { at, flat }, after } = source;', 'instance', true],
  ['const { data: { at, ...rest } } = source;', 'instance', true],
  ['const { data: { at } } = source;', 'instance', false],
  ['const { [(effect(), "data")]: { from } } = source;', 'static', false],
  ['const { data: { [(effect(), "from")]: from } } = source;', 'static', true],
  ['const { data: { [(effect(), "Map")]: Map } } = source;', 'global', false],
]) runBoth(`nested capture claim admission/${ source }`, source, (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator');
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
    path => ['at', 'from', 'Map'].includes(path.node.value?.name));
  const capture = planNestedKeyedPatternCapture({ pattern: host.node.id, init: host.node.init, prop: prop.node, kind });
  check(`${ label }/${ kind }`, !!capture, expected);
  if (capture) check(`${ label }/capture serves its own leaf`, capture.leafPattern.properties.includes(prop.node), true);
});

runBoth('nested capture declines an ancestor claim',
  'const { [(effect(), "data")]: { at } } = source;', (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    check(label, planNestedKeyedPatternCapture({
      pattern: host.node.id, init: host.node.init, prop: host.node.id.properties[0], kind: 'instance',
    }), null);
  });

for (const [key, options, mismatch, expected] of [
  ['[(effect(), "from")]', { kind: 'static', leafKeyRuns: true }, false, true],
  ['[(effect(), "from")]', { kind: 'static' }, false, false],
  ['from', { kind: 'static', leafKeyRuns: true }, false, false],
  ['[(effect(), "from")]', { kind: 'instance', leafKeyRuns: true }, false, false],
  ['[(effect(), "from")]', { kind: 'static', leafKeyRuns: true, force: true }, false, false],
  ['[(effect(), "from")]', { kind: 'static', leafKeyRuns: true }, true, false],
]) runBoth(`ordered capture selects its distinct hop/${ key }/${ JSON.stringify(options) }/${ mismatch }`,
  `let method; const box = {}; const { from: unrelated } = source;
   ({ Array: { ${ key }: method }, Object: { keys: box.value } } = source);`, (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ObjectPattern');
    const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.node.value?.name === (mismatch ? 'unrelated' : 'method'));
    const capture = planNestedKeyedPatternCapture({ pattern: host.node.left, init: host.node.right, prop: prop.node, ...options });
    check(`${ label } admission`, !!capture, expected);
    if (capture) {
      check(`${ label } own leaf`, capture.leafPattern.properties.includes(prop.node), true);
      check(`${ label } retained siblings split in order`, capture.splitCapture, true);
      check(`${ label } own outer hop`, capture.ancestors[0].prop.key.name, 'Array');
    }
  });

for (const anchored of [false, true]) runBoth(`nested symbol capture/${ anchored }`,
  'const { Set: { [(effect(), Symbol.iterator)]: iterator } } = globalThis;', (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.node.value?.name === 'iterator');
    check(label, !!planNestedKeyedPatternCapture({
      pattern: host.node.id,
      init: host.node.init,
      prop: prop.node,
      kind: 'instance',
      entry: 'get-iterator-method',
      anchored,
    }), !anchored);
  });

for (const [constructor, expected] of [[null, true], ['Function', true], ['Object', true], ['Array', false], ['String', false]]) {
  runBoth('instance capture keeps preceding keys on an open receiver', 'const src = source; const { other, name: value } = src;', (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ObjectPattern');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const pure = { kind: 'instance', entry: 'function/instance/name', hintName: 'name' };
    const plan = planRetainedObjectCapture({
      pattern: host.node.id,
      init: host.node.init,
      prop: host.node.id.properties[1],
      hostPath: host,
      adapter,
      kind: 'instance',
      entry: pure.entry,
      resolveNodeType: () => constructor ? { constructor } : null,
      resolvePure: meta => meta.key === 'name' ? pure : null,
    });
    check(`${ label }/${ constructor ?? 'unknown' }: preceding native key`, !!plan, expected);
    if (plan) check(`${ label }: source pattern retained`, plan.pattern, host.node.id);
  });
}

for (const [source, minted, expected, native] of [
  ['const { other, [(effect(), "at")]: method } = memo;', true, 'memo', false],
  ['const { other, [(effect(), "at")]: method } = memo;', false, undefined, false],
  ['const { other, [(effect(), "at")]: method } = (effect(), memo);', true, 'memo', false],
  ['const { other, [(effect(), "at")]: method } = getter.value;', true, undefined, false],
  ['const { other, [(effect(), "at")]: method } = get();', true, undefined, false],
  ['({ [(effect(), "at")]: method } = memo);', true, 'memo', false],
  ['function f(value = ({ [(effect(), "at")]: method } = memo)) {}', true, undefined, false],
  ['class C { value = ({ [(effect(), "at")]: method } = memo); }', true, undefined, false],
]) runBoth('retained receiver reuse preserves capture ownership', source, (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator') ?? parser.pickPath(program, 'AssignmentExpression');
  const assignment = host.node.type === 'AssignmentExpression';
  const pattern = assignment ? host.node.left : host.node.id;
  const plan = planRetainedObjectCapture({
    pattern,
    init: assignment ? host.node.right : host.node.init,
    assignment,
    prop: pattern.properties.at(-1),
    hostPath: host,
    injectorState: { isOwnPassGeneratedName: name => minted && name === 'memo' },
  });
  check(`${ label }: ${ source } capture receiver`, plan?.receiverRef, expected);
  check(`${ label }: activation boundary`, !!plan?.keepsNative, native);
  if (!plan || native) return;
  let mintedCount = 0;
  const rendered = renderRetainedObjectCapture(plan, {
    mintRef: () => { mintedCount++; return 'newMemo'; },
    mintDeclaredRef: () => { mintedCount++; return 'newMemo'; },
    injectImport: () => 'atImport',
    entry: 'instance/at',
  });
  check(`${ label }: capture count`, mintedCount, expected ? 0 : 1);
  check(`${ label }: dispatched receiver`, rendered.refName, expected ?? 'newMemo');
  if (source.includes('(effect(), memo)')) {
    check(`${ label }: the prefixed initializer remains first`, rendered.declarations[0].init, host.node.init);
  }
});

for (const order of ['other, at', 'at, other']) runBoth('retained dispatch itself rejects null without key effects',
  `const { ${ order } } = source;`, (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    const pattern = host.node.id;
    const rendered = renderRetainedObjectCapture(
      { pattern, init: host.node.init, prop: pattern.properties.find(prop => prop.key.name === 'at') },
      { mintRef: () => 'memo', injectImport: () => 'atImport', entry: 'instance/at' },
    );
    const read = rendered.declarations.find(decl => decl.id.name === 'at').init;
    check(`${ label }: no redundant null rejection`, read.type, 'CallExpression');
  });

for (const order of ['other, [(effect(), "at")]: at', '[(effect(), "at")]: at, other']) {
  runBoth('retained computed key rejects null before its effects unless a native read already did',
    `const { ${ order } } = source;`, (parser, program, label) => {
      const host = parser.pickPath(program, 'VariableDeclarator');
      const pattern = host.node.id;
      const rendered = renderRetainedObjectCapture(
        { pattern, init: host.node.init, prop: pattern.properties.find(prop => prop.value.name === 'at') },
        { mintRef: () => 'memo', injectImport: () => 'atImport', entry: 'instance/at' },
      );
      const read = rendered.declarations.find(decl => decl.id.name === 'at').init;
      check(`${ label }: null rejection stays before key effects`, read.type,
        order.startsWith('other') ? 'SequenceExpression' : 'ConditionalExpression');
    });
}

for (const assignment of [false, true]) runBoth('retained array elements reuse the iteration capture',
  assignment ? 'let of, rest, tail; ([{ of, ...rest }, tail] = [Array, 7]);'
    : 'const [{ of, ...rest }, tail] = [Array, 7];', (parser, program, label) => {
    const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator');
    const pattern = assignment ? host.node.left : host.node.id;
    const init = assignment ? host.node.right : host.node.init;
    const capture = planArrayWrapperCapture({ pattern, init, force: true });
    const [leaf] = pattern.elements;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const retained = planRetainedObjectCapture({
      pattern: leaf,
      init: init.elements[0],
      prop: leaf.properties[0],
      assignment,
      hostPath: host,
      adapter,
      kind: 'static',
      provenCtorName: 'Array',
      resolveStaticProp: () => ({ pure: { kind: 'static', entry: 'array/of' } }),
    });
    check(`${ label }: retained leaf`, !!retained, true);
    let refs = 0;
    let unused = 0;
    let declaredUnused = 0;
    const rendered = renderArrayDestructurePlan(
      {
        array: {
          capture,
          assignment,
          elements: capture.elements.map(element => element.pattern === leaf
            ? { node: leaf, retained, extraction: { entry: 'array/of' } }
            : { node: element.pattern, kind: 'verbatim' }),
        },
      },
      {
        kind: 'const', init, embed: node => node, injectImport: () => 'ofImport',
        mintRef: () => `memo${ ++refs }`, mintDeclaredRef: () => `memo${ ++refs }`,
        mintUnused: declared => {
          if (declared) declaredUnused++;
          return `unused${ ++unused }`;
        },
      },
    );
    check(`${ label }: rest exclusion uses the sentinel minter`, unused, 1);
    check(`${ label }: assignment sentinel needs a declaration`, declaredUnused, assignment ? 1 : 0);
    const copies = [];
    for (const root of rendered) walkAstNodes({
      root,
      visit(node) {
        const left = node.type === 'VariableDeclarator' ? node.id : node.type === 'AssignmentExpression' ? node.left : null;
        const right = node.type === 'VariableDeclarator' ? node.init : node.right;
        if (left?.type === 'Identifier' && right?.type === 'Identifier'
          && left.name.startsWith('memo') && right.name.startsWith('memo')) copies.push(node);
      },
    });
    check(`${ label }: no second receiver capture`, copies.length, 0);
  });

runBoth('retained instance capture keeps a guarded static sibling',
  'let M = Map; if (flag) M = source; let nm, method, other; ({ at: other, name: nm, groupBy: method } = M);', (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ObjectPattern');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const pattern = host.node.left;
    function resolvePure(meta) {
      if (meta.kind === 'global' && meta.name === 'Map') return { kind: 'global', entry: 'map/constructor', hintName: 'Map' };
      if (meta.object === 'Map' && meta.key === 'groupBy') return { kind: 'static', entry: 'map/group-by', hintName: 'groupBy' };
      return meta.key === 'name' ? { kind: 'instance', entry: 'function/instance/name', hintName: 'name' } : null;
    }
    const plan = planRetainedObjectCapture({
      pattern,
      init: host.node.right,
      assignment: true,
      prop: pattern.properties[1],
      hostPath: host,
      adapter,
      kind: 'instance',
      entry: 'function/instance/name',
      resolvePure,
      resolveStaticProp: resolvePolyfillableStaticProp,
      planGuardedNarrow: planGuardedStaticNarrow,
      meta: { kind: 'property', object: null, key: 'name', placement: 'static', guardedAliasHint: 'Map', guardedWriteObjects: ['Map'], guardOnly: true },
    });
    check(`${ label }: primary has no static identity branch`, plan.narrow, null);
    check(`${ label }: sibling preserves its own branch`, plan.siblingStatics?.get(pattern.properties[2])?.narrow.branches[0].ctorName, 'Map');
  });

for (const [key, computed, value] of [['groupBy', false, 'groupBy'], ['with-dash', true, 'with-dash'], ['01', true, '01'], ['0', true, 0]]) {
  runBoth('retained native fallback uses the canonical key spelling', 'const { at, own } = source;', (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    const pattern = host.node.id;
    const rendered = renderRetainedObjectCapture(
      { pattern, init: host.node.init, prop: pattern.properties[0], siblingStatics: new Map([[pattern.properties[1], { native: true, key }]]) },
      { mintRef: () => 'memo', injectImport: () => 'atImport', entry: 'instance/at' },
    );
    const read = rendered.declarations.at(-1).init;
    check(`${ label }: computed ${ key }`, read.computed, computed);
    check(`${ label }: key ${ key }`, read.property.name ?? read.property.value, value);
  });
}

for (const [pattern, captures] of [['other, at', true], ['at, other', true], ['at', false]]) for (const claimed of [false, true]) {
  runBoth('nested declaration retains its native leaf siblings', `const { row: { ${ pattern } } } = { row: source };`, (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    const leaf = host.node.id.properties[0].value;
    const prop = leaf.properties.find(item => item.key.name === 'at');
    const plan = planRetainedObjectCapture({
      pattern: host.node.id,
      init: host.node.init,
      prop,
      hostPath: host,
      kind: 'instance',
      entry: 'instance/at',
      isClaimedProp: item => claimed && item !== prop,
    });
    check(`${ label }: capture admission/${ claimed }`, !!plan?.capture, captures && !claimed);
    if (!plan) return;
    let minted = 0;
    const rendered = renderRetainedObjectCapture(plan, {
      mintRef: () => { minted++; return 'memo'; },
      mintDeclaredRef: () => { throw new Error('declaration needs no outer var'); },
      injectImport: () => 'atImport',
      entry: 'instance/at',
    });
    check(`${ label }: declaration receiver captures`, minted, 1);
    check(`${ label }: capture source`, rendered.declarations[0].init, host.node.init);
    check(`${ label }: leaf stays ordered for re-detection`, rendered.declarations.at(-1).id, leaf);
  });
}

for (const [prefix, hop, expected, mutation = null] of [
  ['', 'row', true],
  ['', '[slot]', true],
  ['', '[Symbol.iterator]', false],
  ['', '[Symbol["iterator"]]', false],
  ['', '[globalThis.Symbol.iterator]', false],
  ['', '[(Symbol.iterator as symbol)]', false],
  ['', '[(effect(), Symbol.iterator)]', false],
  ['const key = Symbol.iterator;', '[key]', false],
  ['const key = Symbol.iterator; const alias = key;', '[alias]', false],
  ['const key = Symbol.iterator;', '[key!]', false],
  ['const S = Symbol;', '[S.iterator]', false],
  ['const { iterator: key } = Symbol;', '[key]', false],
  ['const S = Symbol; const { iterator: key } = S;', '[key]', false],
  ['const { iterator: key } = globalThis.Symbol;', '[key]', false],
  ['import S from "@core-js/pure/actual/symbol"; const { iterator: key } = S;', '[key]', false],
  ['import key from "@core-js/pure/actual/symbol/iterator";', '[key]', false],
  ['const key = "[@@iterator]";', '[key]', true],
  ['let key = Symbol.iterator; key = "row";', '[key]', true],
  ['', '["[@@iterator]"]', true],
  ['', '[`[@@iterator]`]', true],
  ['', '[(effect(), "[@@iterator]")]', true],
  ['', '["[@@" + "iterator]"]', true],
  ['', '["@@iterator"]', true],
  ['', '["Symbol.iterator"]', true],
  ['const Symbol = { iterator: "row" };', '[Symbol.iterator]', true],
  ['const Symbol = { iterator: "row" }; const { iterator: key } = Symbol;', '[key]', true],
  ['import S from "@core-js/pure/actual/symbol/constructor"; const { iterator: key } = S;', '[key]', true],
  ['globalThis.Symbol = replacement;', '[Symbol.iterator]', true, 'globalThis.Symbol'],
  ['const { iterator: key } = Symbol;', '[key]', true, 'Symbol.iterator'],
]) {
  runBoth('ordered declarations leave multi-leaf iterator results to their symbol plan',
    `${ prefix } const { ${ hop }: { other, at } } = source;`, (parser, program, label) => {
      const host = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.properties?.some(item => item.value?.type === 'ObjectPattern'));
      const pattern = host.node.id;
      const mutatedStatics = new Set(mutation ? [mutation] : []);
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', getMutatedStatics: () => mutatedStatics });
      const plan = planRetainedObjectCapture({
        pattern,
        init: host.node.init,
        prop: pattern.properties[0].value.properties[1],
        hostPath: host,
        adapter,
        kind: 'instance',
        entry: 'instance/at',
      });
      check(`${ label }: native result ownership/${ prefix }/${ hop }/${ mutation ?? 'pristine' }`, !!plan?.capture, expected);
    });
}

for (const [sourcePattern, entry] of [['at', 'instance/at'], ['[Symbol.iterator]: iter', 'get-iterator-method']]) {
  for (const assignment of [false, true]) for (const minted of [false, true]) for (const moved of [false, true]) {
    runBoth('a moved instance leaf reuses only an owned local capture',
      assignment ? `({ ${ sourcePattern } } = memo);` : `const { ${ sourcePattern } } = memo;`,
      (parser, program, label) => {
        const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator');
        const pattern = assignment ? host.node.left : host.node.id;
        if (moved) markCapturedKeyedPattern(pattern);
        const plan = planRetainedObjectCapture({
          pattern,
          init: assignment ? host.node.right : host.node.init,
          assignment,
          prop: pattern.properties[0],
          hostPath: host,
          kind: 'instance',
          entry,
          injectorState: { isOwnPassGeneratedName: () => minted },
        });
        check(`${ label }: local capture admission/${ assignment }/${ minted }/${ moved }`, !!plan, minted && moved);
        if (!plan) return;
        const rendered = renderRetainedObjectCapture(plan, {
          mintRef: () => { throw new Error('the local capture already exists'); },
          mintDeclaredRef: () => { throw new Error('the local capture already exists'); },
          injectImport: () => 'atImport',
          entry,
        });
        check(`${ label }: sole leaf receiver`, rendered.refName, 'memo');
      });
  }
}

for (const assignment of [false, true]) for (const moved of [false, true]) {
  runBoth('retained native fragments preserve moved leaf ownership',
    assignment ? 'let at, includes; ({ at, includes } = memo);' : 'const { at, includes } = memo;', (parser, program, label) => {
      const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator');
      const pattern = assignment ? host.node.left : host.node.id;
      if (moved) markCapturedKeyedPattern(pattern);
      const rendered = renderRetainedObjectCapture(
        { pattern, init: assignment ? host.node.right : host.node.init, prop: pattern.properties[0], receiverRef: 'memo', assignment },
        { injectImport: () => 'atImport', entry: 'instance/at' },
      );
      const residual = assignment ? rendered.expression.expressions[1].left : rendered.declarations[1].id;
      check(`${ label }: fragment provenance/${ assignment }/${ moved }`, isCapturedKeyedPattern(residual), moved);
      const plan = planRetainedObjectCapture({
        pattern: residual,
        init: host.node.init ?? host.node.right,
        prop: residual.properties[0],
        hostPath: host,
        assignment,
        kind: 'instance',
        entry: 'instance/includes',
        injectorState: { isOwnPassGeneratedName: () => true },
      });
      check(`${ label }: sibling uses owned capture/${ assignment }/${ moved }`, !!plan, moved);
    });
}

for (const moved of [false, true]) {
  runBoth('a moved leaf does not reuse a constructor-name projection as a nullish proof',
    'const { [(effect(), "at")]: at, other } = Object;', (parser, program, label) => {
      const host = parser.pickPath(program, 'VariableDeclarator', path => !!path.node.id.properties[0].computed);
      const pattern = host.node.id;
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      check(`${ label }: ordinary alias projection is active`, keyedReadReceiverProven({ init: host.node.init, hostPath: host, adapter }), true);
      if (moved) markCapturedKeyedPattern(pattern);
      const plan = planRetainedObjectCapture({
        pattern,
        init: host.node.init,
        prop: pattern.properties[0],
        hostPath: host,
        adapter,
        kind: 'instance',
        entry: 'array/instance/at',
        injectorState: { isOwnPassGeneratedName: () => true },
      });
      check(`${ label }: source proof stays phase stable/${ moved }`, plan.receiverNeverNullish, !moved);
    });
}

// a keyed read drops its null rejection only over a receiver that can never be nullish: a literal, a
// never-written binding of one, a built-in constructor's prototype (a namespace has none; an engine
// lacking the constructor throws at the read itself), a `||` / `??` whose right is one, a conditional of
// two such arms; any arm or binding that may hold a nullish value keeps it
for (const [source, proven] of [
  ['const r = [1, 2];', true],
  ['const r = "text";', true],
  ['const r = `text`;', true],
  ['const r = null;', false],
  ['const r = (effect(), [1]);', true],
  ['const list = [1]; const r = list;', true],
  ['let list = [1]; list = make(); const r = list;', false],
  ['const [n] = [[1]]; const r = n;', true],
  ['const [n] = [null]; const r = n;', false],
  ['const r = Array.prototype;', true],
  ['function f(Array) { const r = Array.prototype; }', false],
  ['const r = Math.prototype;', false],
  ['const r = Reflect.prototype;', false],
  ['const r = WeakRef.prototype;', true],
  ['const r = maybe ?? [3];', true],
  ['const r = maybe || "";', true],
  ['const r = maybe && [3];', false],
  ['const r = make();', false],
  ['const r = c ? [1] : [2];', true],
  ['const list = [1]; const r = c ? list : Array.prototype;', true],
  ['const list = [1]; const r = c ? (d ? [1] : list) : maybe ?? [3];', true],
  ['const r = c ? [1] : null;', false],
  ['const r = c ? [1] : void 0;', false],
  ['const r = c ? [1] : maybe;', false],
  ['let list = [1]; list = make(); const r = c ? list : [1];', false],
]) runBoth('a keyed-read receiver is proven only when it is never nullish', source, (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'r');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  check(`${ label }: ${ source }`, keyedReadReceiverProven({ init: host.node.init, hostPath: host, adapter }), proven);
});

// a source that is never nullish (a literal binding) owes no coercion: its effectful initializer still
// runs first, ahead of the key
for (const [source, reusable, consumed, neverNullish = false] of [
  ['const source = [1]; let method; ({ [(key(), "at")]: method } = source);', true, false, true],
  ['const source = [1]; let method; const result = ({ [(key(), "at")]: method } = source);', true, true, true],
  ['const source = [1]; let method; ({ [(key(), "at")]: method } = (before(), source));', true, false, true],
  ['const source = [1]; let method; const result = ({ [(key(), "at")]: method } = (before(), source) as any);', true, true, true],
  ['let source = [1]; let method; ({ [(source = [2], "at")]: method } = (before(), source));', false, false],
  ['let method; ({ [(key(), "at")]: method } = (before(), holder.rows));', false, false],
  ['let source = [1]; let method; ({ [(source = [2], "at")]: method } = source);', false, false],
  ['let method; ({ [(key(), "at")]: method } = source);', true, false],
  ['import source from "foreign"; let method; ({ [(key(), "at")]: method } = source);', false, false],
]) runBoth('ordered source receiver reuse keeps its first coercion slot', source, (parser, program, label) => {
  const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ObjectPattern');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const plan = planRetainedObjectCapture({
    pattern: host.node.left,
    init: host.node.right,
    assignment: true,
    prop: host.node.left.properties[0],
    hostPath: host,
    adapter,
    kind: 'instance',
    entry: 'array/instance/at',
  });
  check(`${ label }: reuse`, !!plan.reuseReceiver, reusable);
  check(`${ label }: result consumption`, plan.preserveResult, consumed);
  let minted = 0;
  const rendered = renderRetainedObjectCapture(plan, {
    mintDeclaredRef: () => {
      minted++; return 'memo';
    },
    injectImport: () => 'atImport',
    entry: 'array/instance/at',
  });
  check(`${ label }: captures`, minted, reusable ? 0 : 1);
  const [first] = rendered.expression.expressions;
  if (neverNullish) {
    check(`${ label }: no coercion`, rendered.expression.expressions
      .some(item => item.type === 'AssignmentExpression' && item.left.type === 'ObjectPattern'), false);
    check(`${ label }: an effectful initializer stays first`,
      host.node.right.type === 'Identifier' || first === host.node.right, true);
    return;
  }
  check(`${ label }: initializer stays first`, first.right, host.node.right);
  if (reusable) {
    check(`${ label }: native coercion precedes the key`, first.left.type, 'ObjectPattern');
    check(`${ label }: no replacement binding`, first.left.properties.length, 0);
  }
});

for (const key of ['from', '[(key(), "from")]']) {
  runBoth('a reusable pristine constructor needs no redundant coercion',
    `let method; const result = ({ ${ key }: method } = Array);`, (parser, program, label) => {
      const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ObjectPattern');
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      const plan = planRetainedObjectCapture({
        pattern: host.node.left, init: host.node.right, assignment: true, prop: host.node.left.properties[0],
        hostPath: host, adapter, kind: 'static', resolvePure: () => ({}), provenCtorName: 'Array',
        resolveStaticProp: () => ({ pure: { kind: 'static', entry: 'array/from' }, localName: 'method', key: 'from' }),
      });
      check(`${ label }/reuses constructor`, !!plan.reuseReceiver, true);
      check(`${ label }/nonnull constructor proof`, plan.provenReceiver, true);
      const rendered = renderRetainedObjectCapture(plan, {
        mintDeclaredRef: () => { throw new Error('pristine constructor needs no memo'); },
        injectImport: () => 'fromImport',
      });
      check(`${ label }/no empty coercion`, rendered.expression.expressions.some(item => item.left?.type === 'ObjectPattern'), false);
      check(`${ label }/result identity`, rendered.expression.expressions.at(-1).name, 'Array');
    });
}

runBoth('ordered source declaration reuses its leading native coercion',
  'const source = [1]; const { length, [(key(), "at")]: method } = source;', (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ObjectPattern');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = planRetainedObjectCapture({
      pattern: host.node.id, init: host.node.init, prop: host.node.id.properties[1], hostPath: host, adapter,
      kind: 'instance', entry: 'array/instance/at',
    });
    check(`${ label }/reuses source`, !!plan.reuseReceiver, true);
    const rendered = renderRetainedObjectCapture(plan, {
      mintRef: () => 'memo', injectImport: () => 'atImport', entry: 'array/instance/at',
    });
    const [first] = rendered.declarations;
    check(`${ label }/native pattern already coerces`, first.id.properties[0]?.key.name, 'length');
    check(`${ label }/source read remains first`, first.init.name, 'source');
  });

runBoth('ordered static-only assignment evaluates an effectful RHS without storing its discarded result',
  'let of, from; ({ of, [(key(), "from")]: from } = (effect(), Array));', (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ObjectPattern');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = planRetainedObjectCapture({
      pattern: host.node.left,
      init: host.node.right,
      assignment: true,
      prop: host.node.left.properties[1],
      hostPath: host,
      adapter,
      kind: 'static',
      resolvePure: () => ({}),
      provenCtorName: 'Array',
      resolveStaticProp: ({ prop }) => ({ pure: { kind: 'static', entry: `array/${ prop.value.name }` }, localName: prop.value.name, key: prop.value.name }),
    });
    let minted = 0;
    const rendered = renderRetainedObjectCapture(plan, {
      mintDeclaredRef: () => {
        minted++; return 'memo';
      },
      injectImport: entry => entry.replace('/', '_'),
      entry: 'array/from',
    });
    check(`${ label }: no unused receiver capture`, minted, 0);
    check(`${ label }: RHS remains first`, rendered.expression.expressions[0], host.node.right);
    check(`${ label }: no terminal receiver read`, rendered.expression.expressions.at(-1).type, 'SequenceExpression');
  });

for (const supplied of [false, true]) runBoth('retained default certainty needs a flag only for a live native arm',
  'const { at: method } = source;', (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    const [prop] = host.node.id.properties;
    let minted = 0;
    const rendered = renderRetainedObjectCapture({
      defaultCapture: {
        supplied,
        pattern: host.node.id,
        root: host.node.id,
        host,
        target: { claimedProperties: [] },
        entries: [{ prop, slot: 'at', instance: { entry: 'array/instance/at' } }],
        ctx: { scope: host.scope },
      },
    }, { mintRef: () => `memo${ ++minted }`, injectImport: () => 'atImport' });
    check(`${ label }: mutable flags/${ supplied }`, rendered.mutable.length, supplied ? 0 : 1);
    check(`${ label }: receiver is retained/${ supplied }`, minted, supplied ? 1 : 2);
    check(`${ label }: mirror selection/${ supplied }`, rendered.declarations.at(-1).init.type,
      supplied ? 'ObjectExpression' : 'ConditionalExpression');
  });

for (const [receiver, key, consumed, inline] of [
  ['[1]', '(key(), "at")', false, true],
  ['{ value: 1 }', '(key(), "at")', false, true],
  ['[effect()]', '(key(), "at")', false, false],
  ['[...values]', '(key(), "at")', false, false],
  ['[1]', '(key(), "at")', true, false],
  ['source.value', '"at"', false, true],
]) runBoth('a sole retained dispatch needs no forwarding capture',
  `let method; ${ consumed ? 'const result =' : '' } ({ [${ key }]: method } = ${ receiver });`,
  (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ObjectPattern');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = planRetainedObjectCapture({
      pattern: host.node.left,
      init: host.node.right,
      assignment: true,
      prop: host.node.left.properties[0],
      hostPath: host,
      adapter,
      kind: 'instance',
      entry: 'array/instance/at',
    });
    check(`${ label }: quiet leaf keeps the flat route`, !!plan, key !== '"at"');
    if (!plan) return; // A quiet sole leaf stays on the existing flat extraction route.
    check(`${ label }: single use/${ receiver }`, !!plan.inlineReceiver, inline);
    let minted = 0;
    renderRetainedObjectCapture(plan, {
      mintDeclaredRef: () => {
        minted++; return 'memo';
      },
      injectImport: () => 'atImport',
      entry: 'array/instance/at',
    });
    check(`${ label }: capture count/${ receiver }`, minted, inline ? 0 : 1);
  });

runBoth('a spent nested static receiver retains its native coercion without an alias',
  'let from; const box = {}; ({ Array: { [(key(), "from")]: from }, Object: { keys: box.value } } = source);',
  (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ObjectPattern');
    const [prop] = host.node.left.properties[0].value.properties;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = planRetainedObjectCapture({
      pattern: host.node.left,
      init: host.node.right,
      assignment: true,
      prop,
      hostPath: host,
      adapter,
      kind: 'static',
      meta: { kind: 'property', object: 'Array', key: 'from', placement: 'static' },
      resolveStaticProp: () => ({ pure: { kind: 'static', entry: 'array/from' } }),
    });
    check(`${ label }: ordered native capture`, !!plan.capture, true);
    let minted = 0;
    const rendered = renderRetainedObjectCapture(plan, { mintDeclaredRef: () => `memo${ ++minted }`, injectImport: () => 'fromImport', entry: 'array/from' });
    check(`${ label }: only the root is captured`, minted, 1);
    const coercion = rendered.expression.expressions[1].left.properties[0].value;
    check(`${ label }: native leaf coercion`, coercion.type, 'ObjectPattern');
    check(`${ label }: no bound alias in the coercion`, coercion.properties.length, 0);
  });

for (const callback of [false, true]) runBoth('a sole final instance read needs no forwarding slot before its ordered dispatch',
  'let first, method, last; ({ before: first, y: { flat: method }, after: last } = source);',
  (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ObjectPattern');
    const [, hop] = host.node.left.properties;
    const [prop] = hop.value.properties;
    const plan = planNestedKeyedPatternCapture({
      pattern: host.node.left,
      init: host.node.right,
      force: true,
      plansLeaf: true,
      prop,
      kind: 'instance',
      entry: 'array/instance/flat',
      ancestors: [{ pattern: host.node.left, prop: hop }],
    });
    check(`${ label }: sole ordinary dispatch admission`, plan.inlineLeaf, true);
    let minted = 0;
    const rendered = renderNestedKeyedPatternCapture(plan, { mintRef: () => `memo${ ++minted }`, assignment: true,
      ...callback ? {
        renderLeaf: receiver => assignmentExpression('=', identifier('method'),
          callExpression(identifier('flatImport'), [receiver])),
      } : {} });
    check(`${ label }: stored receiver count/${ callback }`, minted, callback ? 1 : 2);
    const [, before, leaf, after] = rendered.expression.expressions;
    check(`${ label }: first native binding stays before dispatch`, before.left.properties[0].value.name, 'first');
    if (callback) {
      check(`${ label }: direct claimed target`, leaf.left.name, 'method');
      check(`${ label }: receiver property is read once by dispatch`, leaf.right.arguments[0].property.name, 'y');
      check(`${ label }: receiver uses the original root capture`, leaf.right.arguments[0].object.name, 'memo1');
      check(`${ label }: final native binding stays after dispatch`, after.left.properties[0].value.name, 'last');
    }
  });

for (const observed of [false, true]) runBoth('a retained array assignment stores its result only when the host consumes it',
  `let at; ${ observed ? 'const result =' : '' } ([{ [(key(), "at")]: at }] = [source]);`,
  (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ArrayPattern');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const [prop] = host.node.left.elements[0].properties;
    const plan = planRetainedObjectCapture({
      pattern: host.node.left,
      init: host.node.right,
      assignment: true,
      prop,
      hostPath: host,
      adapter,
      kind: 'instance',
      entry: 'array/instance/at',
    });
    check(`${ label }: native array capture`, !!plan.arrayCapture, true);
    let minted = 0;
    const rendered = renderRetainedObjectCapture(plan, { mintDeclaredRef: () => `memo${ ++minted }`, injectImport: () => 'atImport', entry: 'array/instance/at' });
    const [capture] = rendered.expression.expressions;
    check(`${ label }: result storage/${ observed }`, capture.right.type, observed ? 'AssignmentExpression' : 'ArrayExpression');
    check(`${ label }: original RHS is evaluated once/${ observed }`, observed ? capture.right.right : capture.right, host.node.right);
    check(`${ label }: only the observed assignment result needs storage/${ observed }`, minted, Number(observed));
    check(`${ label }: result use/${ observed }`, rendered.expression.expressions.at(-1).type === 'Identifier', observed);
  });

for (const [source, assignment, observed, direct] of [
  ['const { [(key(), "w")]: { at } } = { w: source };', false, false, true],
  ['const { [(key(), "w")]: { at } } = { w: make() };', false, false, true],
  ['const { [(key(), "w")]: { at } } = { ...spread, w: make() };', false, false, true],
  ['let at; ({ [(key(), "w")]: { at } } = { w: source });', true, false, true],
  ['let at; const value = ({ [(key(), "w")]: { at } } = { w: source });', true, true, false],
  ['const { before, [(key(), "w")]: { at } } = { before: other(), w: make() };', false, false, false],
  ['const { [(key(), "w")]: { at } } = make();', false, false, false],
]) runBoth('a sole native wrapper capture keeps its RHS without storing the allocation', source,
  (parser, program, label) => {
    const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator',
      path => (assignment ? path.node.left : path.node.id).type === 'ObjectPattern');
    const pattern = assignment ? host.node.left : host.node.id;
    const init = assignment ? host.node.right : host.node.init;
    const plan = planNestedKeyedPatternCapture({ pattern, init });
    let minted = 0;
    const rendered = renderNestedKeyedPatternCapture(plan, { mintRef: () => `memo${ ++minted }`, assignment, preserveResult: observed });
    const capture = assignment ? rendered.expression.expressions[0] : rendered.capture;
    const target = assignment ? capture.left : capture.id;
    check(`${ label }: direct native capture/${ source }`, target.type === 'ObjectPattern', direct);
    check(`${ label }: leaf and required root storage/${ source }`, minted, direct ? 1 : 2);
    check(`${ label }: original RHS remains before key/${ source }`, assignment ? capture.right === init : capture.init === init, true);
    if (direct) {
      check(`${ label }: native key remains`, target.properties[0].key === pattern.properties[0].key, true);
      check(`${ label }: selected value still has its own capture`, target.properties[0].value.name, 'memo1');
      check(`${ label }: no separate root read`, rendered.elements.length, 1);
    }
  });

for (const assignment of [false, true]) for (const nested of [false, true]) {
  const keyedPattern = '{ [(effect(), "w")]: { at: method } }';
  const sourcePattern = nested ? `{ outer: ${ keyedPattern } }` : keyedPattern;
  const source = assignment ? `let method; ([${ sourcePattern }] = [src]);` : `const [${ sourcePattern }] = [src];`;
  runBoth('an ordered array element keeps its capture through the nested keyed render', source, (parser, program, label) => {
    const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator');
    const pattern = assignment ? host.node.left : host.node.id;
    const init = assignment ? host.node.right : host.node.init;
    const capture = planArrayWrapperCapture({ pattern, init, force: true });
    const [element] = pattern.elements;
    const keyedSource = nested ? element.properties[0].value : element;
    const keyedCapture = planNestedKeyedPatternCapture({ pattern: keyedSource, init: init.elements[0], force: true, plansLeaf: true });
    let minted = 0;
    const rendered = renderArrayDestructurePlan({ array: {
      capture, assignment,
      elements: [{ node: element, nestedKeys: nested ? ['outer'] : [], children: [{
        keyedCapture, children: [{ extractions: [{ targetNode: keyedCapture.leaf.value, kind: 'instance' }] }],
      }] }],
    } }, {
      kind: 'const', init, embed: node => node, mintRef: () => `capture${ ++minted }`,
      read: (extraction, receiver) => callExpression(identifier('atImport'), [receiver]),
    });
    check(`${ label }/element and property captures only`, minted, nested ? 3 : 2);
    const copies = [];
    for (const root of rendered) walkAstNodes({ root, visit(node) {
      const left = node.type === 'VariableDeclarator' ? node.id : node.left;
      const right = node.type === 'VariableDeclarator' ? node.init : node.right;
      if (left?.type === 'Identifier' && right?.type === 'Identifier') copies.push(node);
    } });
    check(`${ label }/no copy of an existing capture`, copies.length, 0);
  });
}

// ... and a root that is never nullish (a literal binding) needs no null rejection ahead of the key
for (const [source, owned, reusable, rejects = true] of [
  ['const { [(effect(), "w")]: { at: method } } = memo;', true, true],
  ['const memo = { w: [1] }; const { [(effect(), "w")]: { at: method } } = memo;', false, true, false],
  ['let memo = { w: [1] }; const { [(memo = other, "w")]: { at: method } } = memo;', false, false],
  ['const { [(effect(), "w")]: { at: method } } = memo;', false, true],
  ['import memo from "foreign"; const { [(effect(), "w")]: { at: method } } = memo;', false, false],
]) {
  runBoth('nested ordered declaration reuses a proven root without copying its binding', source, (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.type === 'ObjectPattern');
    const pattern = host.node.id;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = planRetainedObjectCapture({
      pattern, init: host.node.init,
      prop: pattern.properties[0].value.properties[0], hostPath: host, adapter,
      kind: 'instance', entry: 'instance/at', injectorState: { isOwnPassGeneratedName: name => owned && name === 'memo' },
    });
    check(`${ label }/root reuse proof`, plan.receiverRef, reusable ? 'memo' : undefined);
    let minted = 0;
    const rendered = renderRetainedObjectCapture(plan, {
      mintRef: () => `capture${ ++minted }`, mintDeclaredRef: () => `capture${ ++minted }`,
      injectImport: () => 'atImport', entry: 'instance/at',
    });
    check(`${ label }/only the property value needs a new capture`, minted, reusable ? 1 : 2);
    const nodes = rendered.declarations;
    const native = nodes.find(node => node.id.type === 'ObjectPattern');
    check(`${ label }/null rejection precedes the computed key where the root may be nullish`,
      native.init.type, rejects ? 'ConditionalExpression' : 'Identifier');
    check(`${ label }/source key stays in its native pattern`, native.id.properties[0].key, pattern.properties[0].key);
    if (reusable) check(`${ label }/native pattern is the first receiver read`, nodes[0], native);
  });
}

finish();
