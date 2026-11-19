// Receiver ownership follows value slots; independent keys, prefixes and arguments stay live.
import { adapters, createChecker, resolvePure } from './harness.mjs';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  collectFileCensus,
  isConsumedEntryImport,
  mutatedStaticKey,
  parameterStaticSource,
  withOverlappingWriteScans,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { buildOffsetToLine, isDisabledByLines } from '../../packages/core-js-polyfill-provider/helpers/source-scan.js';
import { buildParameterArgumentSynthPlan } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { buildNestedDestructurePlan } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { realmSelectionLeafKind } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { getEntrySource } from '../../packages/core-js-polyfill-provider/detect-usage/entries.js';
import { beginMutationPrePass, mutationShapesReducer, mutationSiteVisitors } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';

const { check, finish } = createChecker('opt-out-receivers');

for (const parser of adapters) {
  for (const [name, expression, disabled, expected] of [
    ['root', 'Promise', 1, true],
    ['member', '(\nPromise\n).resolve', 2, true],
    ['parenthesized', '(\nPromise\n)', 2, true],
    ['asserted', '(\nPromise as any\n)', 2, true],
    ['non-null', '(\nPromise!\n)', 2, true],
    ['satisfies', '(\nPromise satisfies any\n)', 2, true],
    ['stored', '(held =\nPromise\n)', 2, true],
    ['tail', '(effect(),\nPromise\n)', 2, true],
    ['independent prefix', '(effect(),\nPromise\n)', 1, false],
    ['independent key', 'Promise[\nkey()\n]', 2, false],
    ['independent argument', 'read(\nPromise\n)', 2, false],
    ['live', '(\nPromise\n)', 4, false],
  ]) {
    const source = `${ expression };`;
    const root = parser.parseAndScope(source).node.body[0].expression;
    check(`${ parser.name }/${ name }`, isDisabledByLines(root, new Set([disabled]), buildOffsetToLine(source), true), expected);
  }
  for (const source of ['import\n"core-js";', 'require(\n"core-js"\n);', 'await import(\n"core-js"\n);']) {
    const [root] = parser.parseAndScope(source).node.body;
    function disabled(node) { return isDisabledByLines(node, new Set([2]), buildOffsetToLine(source)); }
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'entry-global', resolvePure });
    check(`${ parser.name }/${ source }/live source`, getEntrySource(root, adapter, null), 'core-js');
    check(`${ parser.name }/${ source }/disabled source`, getEntrySource(root, adapter, null, disabled), null);
    if (root.type === 'ImportDeclaration') {
      check(`${ parser.name }/live entry consumed`, isConsumedEntryImport(root, () => true), true);
      check(`${ parser.name }/disabled entry survives`, isConsumedEntryImport(root, () => true, disabled), false);
    }
  }
  for (const [name, setup, write, expected] of [
    ['direct', '', 'Promise.resolve = custom;', true],
    ['delete', '', 'delete Promise.resolve;', true],
    ['update', '', 'Promise.count++;', true],
    ['prototype', '', 'Promise.prototype.custom = custom;', true],
    ['alias', 'const P = Promise;', 'P.resolve = custom;', true],
    ['mutator', '', 'Object.defineProperty(Promise, "resolve", { value: custom });', true],
    ['shadow', 'const Promise = {};', 'Promise.resolve = custom;', false],
  ]) for (const optedOut of [false, true]) {
    const source = `${ setup }\n${ write }`;
    const program = parser.parseAndScope(source);
    const lines = new Set(optedOut ? [2] : []);
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure,
      isOptedOut: (node, receiver) => isDisabledByLines(node, lines, buildOffsetToLine(source), receiver) });
    const census = collectFileCensus(program.node, [mutationShapesReducer(null, true)]);
    const { mutated, handleSite, finalize } = beginMutationPrePass({ rootNode: program.node, adapter, census });
    if (handleSite) withOverlappingWriteScans(() => program.traverse(mutationSiteVisitors(handleSite, true, parser.name === 'babel')));
    finalize?.();
    check(`${ parser.name }/${ name }/${ optedOut }/native identity`, mutated.has(mutatedStaticKey('globalThis', 'Promise')), optedOut && expected);
    check(`${ parser.name }/${ name }/${ optedOut }/unrelated identity`, mutated.has(mutatedStaticKey('globalThis', 'Map')), false);
  }
}
for (const parser of adapters) {
  const source = 'function read({ resolve }) {}\nread(\nPromise);';
  for (const disabled of [0, 2, 3]) {
    const program = parser.parseAndScope(source);
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const callPath = parser.pickPath(program, 'CallExpression');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure,
      isOptedOut: (node, receiver) => isDisabledByLines(node, new Set([disabled]), buildOffsetToLine(source), receiver) });
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath, adapter, resolvePure,
      meta: { kind: 'property', object: 'Promise', key: 'resolve', placement: 'static' },
      parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    });
    check(`${ parser.name }/caller slot ${ disabled }`, !!plan?.targets.length, disabled === 0);
    const sites = [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }];
    check(`${ parser.name }/static caller slot ${ disabled }`,
      parameterStaticSource(sites, null, value => value.name, adapter.isOptedOut), disabled === 0 ? 'Promise' : null);
    check(`${ parser.name }/census observes caller slot ${ disabled }`,
      parameterStaticSource(sites, null, value => value.name), 'Promise');
  }
  const decl = parser.pickPath(parser.parseAndScope('const { Promise: { resolve } } = globalThis;'), 'VariableDeclarator');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', resolvePure,
    isOptedOut: node => node === decl.node.init,
  });
  check(`${ parser.name }/disabled realm leaf`, realmSelectionLeafKind(decl.node.init, { adapter, scope: decl.scope, path: decl }), null);
  check(`${ parser.name }/disabled nested plan`, buildNestedDestructurePlan({
    declarator: decl.node, path: decl, scope: decl.scope, adapter,
    resolvePure() { throw new Error('disabled source queried pure resolution'); },
    resolveGlobalPolyfill() { throw new Error('disabled source queried global resolution'); },
  }), null);
}

// A directive-free file must not query AST shape or locations at all.
const poison = new Proxy({}, { get() { throw new Error('unexpected receiver scan'); } });
check('absent directives', isDisabledByLines(poison, null, null, true), false);
check('empty directives', isDisabledByLines(poison, new Set(), null, true), false);
check('missing node', isDisabledByLines(null, new Set([1]), null, true), false);
const relocated = { type: 'Identifier', start: 0, loc: { start: { line: 2 } } };
check('offset host ignores a relocated loc', isDisabledByLines(relocated, new Set([2]), () => 1), false);
check('location host retains its source loc', isDisabledByLines(relocated, new Set([2])), true);
check('offset host ignores minted nodes', isDisabledByLines({ ...relocated, start: undefined }, new Set([2]), () => 2), false);
finish();
