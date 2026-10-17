import {
  bindingLoopAnchor,
  peelTransparentWrapperPath,
  isDeoptedStaticRead,
  referencesArgumentsObject,
  walkAstNodes,
  subtreeContainsNode,
  withCanonQuestion,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { renderParameterInstanceCapture } from '../../packages/core-js-polyfill-provider/render.js';
import {
  buildDestructureLeafMeta,
  buildNestedParamSynthPlan,
  buildParameterArgumentSynthPlan,
  classifyDestructureLeafHost,
  planParameterInstanceExtraction,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('mirror-ctor-passthrough');

for (const meta of [null, undefined]) check('an absent claim does not ask the resolver', buildParameterArgumentSynthPlan({
  meta,
  resolvePure() { throw new Error('an absent claim has no pure resolution'); },
}), null);

// A valid subtree with no injectable leaves is different from a subtree the mirror cannot render.
for (const [nested, expected] of [
  ['Math: { floor }', true],
  ['Array: { at }', true],
  ['Math: { floor, ...rest }', false],
  ['Math: { [key()]: value }', false],
  ['self: { Math: { [key()]: value } }', false],
]) for (const first of [false, true]) {
  const fields = first ? `Set, ${ nested }` : `${ nested }, Set`;
  for (const pattern of [`{ ${ fields } } = globalThis`, `[[{ ${ fields } } = globalThis]]`]) {
    runBoth(`${ pattern }`, `export function read(${ pattern }) {}`, (parser, program, label) => {
      const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
      const adapter = {
        method: 'usage-pure',
        isStringLiteral: node => node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'),
        getStringValue: node => node.value,
        hasBinding: ({ scope, name }) => !!scope?.getBinding(name),
        getBinding: ({ scope, name }) => scope?.getBinding(name),
      };
      const plan = buildNestedParamSynthPlan({
        leafPatternPath, adapter, meta: { object: 'globalThis', key: 'Set', placement: 'static' },
        resolvePure: meta => meta.kind === 'global' && meta.name === 'Set'
          ? { kind: 'global', entry: 'set/constructor', hintName: 'Set' } : null,
      });
      check(`${ label } mirrors the default`, !!plan?.targets?.length, expected);
      if (expected) {
        check(`${ label } claims the constructor`, plan?.claimedProperties?.[0]?.key.name, 'Set');
        check(`${ label } retains the nested read proof`, plan?.readProperties?.length, 1);
      }
    });
  }
}

for (const calls of ['read([[]]);', 'read([[]]); read([[]]);', 'read([[]]); read([[custom]]);']) {
  runBoth(`caller mirror read proofs/${ calls }`,
    `function read([[{ WeakSet: Ctor, Array: { at } } = globalThis]]) {} ${ calls }`,
    (parser, program, label) => {
      const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
      const callPaths = parser.collectPaths(program, 'CallExpression');
      const adapter = {
        method: 'usage-pure',
        hasBinding: ({ scope, name }) => !!scope?.getBinding(name),
        getBinding: ({ scope, name }) => scope?.getBinding(name),
      };
      const plan = buildParameterArgumentSynthPlan({
        leafPatternPath, adapter, meta: { object: 'globalThis', key: 'WeakSet', placement: 'static' },
        resolvePure: meta => meta.kind === 'global' && meta.name === 'WeakSet'
          ? { kind: 'global', entry: 'weak-set/constructor', hintName: 'WeakSet' } : null,
        parameterCallSites: () => callPaths.map(callPath => ({
          callPath, argIndex: 0, pairing: { args: callPath.node.arguments, argsUnknown: false },
        })),
      });
      check(`${ label } mirrors the shared default once`, plan?.targets?.length, 1);
      check(`${ label } suppresses only fully covered native reads`, plan?.readProperties?.length,
        calls.includes('custom') ? 0 : 1);
    });
}

// An ordinary data literal cannot advance native reads across keys or merge repeated getters.
for (const [pattern, safe] of [
  ['Array: { of }, nativeSlot: value', true],
  ['Array: { of }, [(hit(), "with-dash")]: other, nativeSlot: value', false],
  ['nativeSlot: value, [(hit(), "Array")]: { of }', true],
  ['Array: { [(hit(), "of")]: of }, nativeSlot: value', false],
  ['Array: { of }, nativeSlot: value, nativeSlot: again', false],
]) runBoth(`native mirror read order/${ pattern }`,
  `const [{ ${ pattern } } = globalThis] = [];`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern', node => node.node.properties[0]?.value?.name === 'of');
    const adapter = {
      method: 'usage-pure',
      isStringLiteral: node => node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'),
      getStringValue: node => node.value,
      hasBinding: ({ scope, name }) => !!scope?.getBinding(name),
      getBinding: ({ scope, name }) => scope?.getBinding(name),
    };
    const options = {
      leafPatternPath,
      adapter,
      meta: { object: 'Array', key: 'of', placement: 'static' },
      resolvePure: meta => meta.object === 'Array' && meta.key === 'of'
        ? { kind: 'static', entry: 'array/of', hintName: 'Array$of' } : null,
    };
    const ordinary = buildNestedParamSynthPlan(options);
    check(`${ label } data literal admission`, !!ordinary?.targets?.length, safe);
    const retained = buildNestedParamSynthPlan({ ...options, retainNativeReads: true });
    check(`${ label } retained capture keeps the claim`, retained?.targets?.length, 1);
    check(`${ label } retained proof does not own the ordinary plan`, !!buildNestedParamSynthPlan(options)?.targets?.length, false);
  });

// Instance-only parameter mirrors use the same caller/default receiver proof as statics.
for (const [pattern, receiver, expected] of [
  ['{ prototype: { at } }', 'String', true],
  ['{ prototype: { at, 0: first } }', 'Array', true],
  ['{ Array: { prototype: { at, flat } } }', 'globalThis', true],
  ['{ w: { prototype: { at } } }', '{ w: Array }', true],
  ['[[{ prototype: { at } }]]', '[[Array]]', true],
  ['{ prototype: { at, at: again } }', 'Array', false],
  ['{ prototype: { [unknown]: at } }', 'Array', false],
  ['{ prototype: { at } }', 'custom', false],
]) runBoth(`instance default/${ pattern }/${ receiver }`,
  `export function read(${ pattern } = ${ receiver }) {}`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern', p => p.node.properties.some(prop => prop.value?.name === 'at'));
    const adapter = {
      method: 'usage-pure',
      hasBinding: ({ scope, name }) => !!scope?.getBinding(name),
      getBinding: ({ scope, name }) => scope?.getBinding(name),
      isStringLiteral: node => node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'),
      getStringValue: node => node.value,
    };
    const plan = buildNestedParamSynthPlan({
      leafPatternPath, adapter, meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' || meta.key === 'flat'
        ? { kind: 'instance', entry: `instance/${ meta.key }`, hintName: meta.key } : null,
    });
    check(`${ label } mirrors only proven receivers and keys`, !!plan?.targets?.length, expected);
    if (expected) check(`${ label } keeps the instance claim`, plan.claimedProperties.includes(leafPatternPath.node.properties[0]), true);
  });

for (const [argument, closed, expected] of [
  ['String', true, true],
  ['{ prototype: { at: custom } }', true, false],
  ['custom', true, false],
  ['String', false, false],
]) runBoth(`instance caller/${ argument }/${ closed }`,
  `function read({ prototype: { at } }) {} read(${ argument });`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern', p => p.node.properties[0]?.value?.name === 'at');
    const callPath = parser.pickPath(program, 'CallExpression');
    const adapter = {
      method: 'usage-pure',
      hasBinding: ({ scope, name }) => !!scope?.getBinding(name),
      getBinding: ({ scope, name }) => scope?.getBinding(name),
      isStringLiteral: node => node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'),
      getStringValue: node => node.value,
    };
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath, adapter, meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
      parameterCallSites: () => closed ? [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }] : null,
    });
    check(`${ label } mirrors only a closed known caller`, !!plan?.targets?.length, expected);
    if (expected) check(`${ label } uses the quiet data slot`,
      plan.targets[0].tree.entries[0].child.entries[0].deferred, false);
  });

runBoth('caller mirror verdicts belong to each descended pattern',
  'function read([{ at }, { flat }]) {} read([[1], [[2]]]); read([[3], [[4]]]);', (parser, program, label) => {
    const patterns = parser.collectPaths(program, 'ObjectPattern');
    const calls = parser.collectPaths(program, 'CallExpression');
    const adapter = {
      method: 'usage-pure',
      hasBinding: ({ scope, name }) => !!scope?.getBinding(name),
      getBinding: ({ scope, name }) => scope?.getBinding(name),
      isStringLiteral: node => node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'),
      getStringValue: node => node.value,
    };
    function planAt(index, callPath) {
      const leafPatternPath = patterns[index];
      return buildParameterArgumentSynthPlan({
        leafPatternPath,
        adapter,
        meta: { kind: 'property', object: null, key: leafPatternPath.node.properties[0].key.name, placement: null },
        resolvePure: meta => meta.key === 'at' || meta.key === 'flat'
          ? { kind: 'instance', entry: `instance/${ meta.key }`, hintName: meta.key } : null,
        parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
      });
    }
    for (const index of [0, 1]) {
      const plan = planAt(index, calls[0]);
      check(`${ label } sibling ${ index } owns its target`, plan?.targets?.length, 1);
      check(`${ label } sibling ${ index } waits only for an earlier reader`, plan?.targets?.[0].tree.entries[0].deferred, index === 1);
      check(`${ label } sibling ${ index } captures only a deferred receiver`, !!plan?.targets?.[0].localMemo, index === 1);
      check(`${ label } sibling ${ index } shares its completed verdict`, !!planAt(index, calls[0])?.targets?.length, false);
    }
    check(`${ label } another caller owns its target`, planAt(0, calls[1])?.targets?.length, 1);
  });

for (const [receiver, expected] of [
  ['[1]', true],
  ['"az"', true],
  ['String.prototype', true],
  ['receiver', true],
  ['factory()', true],
  ['{ at: own }', false],
]) runBoth(`a direct IIFE retains its instance receiver/${ receiver }`,
  `const receiver = [1]; const result = (({ at }, other) => at)(${ receiver }, effect());`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.type === 'ArrowFunctionExpression'
      || path.node.callee.type === 'ParenthesizedExpression');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath,
      adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
      parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    });
    check(`${ label } follows the existing receiver admission`, !!plan?.targets?.length, expected);
    if (expected) {
      check(`${ label } defers its instance slot`, plan.targets[0].tree.entries[0].deferred, true);
      check(`${ label } captures its receiver per evaluation`, plan.targets[0].localMemo, true);
      check(`${ label } preserves a possibly nullish receiver`, !!plan.targets[0].preserveNullishReceiver, receiver === 'factory()');
    }
  });

for (const [receiver, expected] of [['receiver', true], ['external', false], ['{ at: own }', false]]) runBoth(`named callers retain their receiver boundary/${ receiver }`,
  `const receiver = [1]; function read({ at }) {} read(${ receiver });`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const callPath = parser.pickPath(program, 'CallExpression');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath,
      adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
      parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    });
    check(`${ label } admits a binding while retaining unbound and supplied-object boundaries`, !!plan?.targets?.length, expected);
  });

for (const [argument, targets] of [['[1]', 1], ['Array.prototype', 1], ['source()', 2], ['undefined', 1], ['', 1]]) {
  runBoth(`a caller closes only the default receiver it serves/${ argument }`,
    `function source() { return undefined; } const result = (({ at } = Array.prototype) => at)(${ argument });`,
    (parser, program, label) => {
      const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
      const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.type === 'ArrowFunctionExpression'
        || path.node.callee.type === 'ParenthesizedExpression');
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      const plan = buildParameterArgumentSynthPlan({
        leafPatternPath,
        adapter,
        meta: { kind: 'property', object: null, key: 'at', placement: null },
        resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
        parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
      });
      check(`${ label } keeps live default and caller targets`, plan?.targets?.length, targets);
      check(`${ label } settles without a second default synth`, plan?.settled, true);
      check(`${ label } serves the default when a caller may be undefined`,
        !!plan?.targets?.some(target => target.node === leafPatternPath.parentPath.node.right),
        argument === 'source()' || argument === 'undefined' || argument === '');
    });
}

runBoth('quiet root-default instance and symbol reads stay eager',
  'const key = Symbol.iterator; const result = (function ({ at, [key]: it } = [1, 2]) {})();', (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const callPath = parser.pickPath(program, 'CallExpression');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath,
      adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' }
        : meta.object === 'Symbol' && meta.key === 'iterator' ? { kind: 'static', entry: 'symbol/iterator' } : null,
      parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    });
    check(`${ label } has one captured default`, plan?.targets?.length, 1);
    check(`${ label } eagerly reads its ordinary instance key`, plan?.targets?.[0].tree.entries[0].deferred, false);
    check(`${ label } eagerly reads its symbol key`, plan?.targets?.[0].tree.entries[1].deferred, false);
    check(`${ label } retains the symbol's native read proof`, plan?.readProperties?.includes(leafPatternPath.node.properties[1]), true);
  });

for (const [argument, selecting] of [
  ['value', false],
  ['value || fallback', true],
  ['value ?? fallback', false],
  ['flag ? value : fallback', false],
  ['(flag ? value : []) || fallback', true],
  ["''", false],
  ["'' || fallback", true],
  ["'' ?? fallback", false],
  ["flag ? '' : fallback", false],
  ["(flag ? '' : []) || fallback", true],
  ["value || ''", false],
]) for (const host of ['argument', 'default']) runBoth(`a mirror preserves falsiness only where it selects a logical arm/${ host }/${ argument }`,
  `const value = ''; const fallback = [1]; const flag = Date.now() > 0;
  const result = ${ host === 'argument' ? `(({ at }) => at)(${ argument })` : `(({ at } = ${ argument }) => at)()` };`,
  (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.type === 'ArrowFunctionExpression'
      || path.node.callee.type === 'ParenthesizedExpression');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath,
      adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
      parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    });
    const target = plan?.targets?.find(item => argument.includes('flag ?')
      ? item.node.type === 'ConditionalExpression'
      : argument.includes("''") ? item.node.value === '' : item.node.name === 'value');
    check(`${ label } keeps the string's instance mirror`, !!target, true);
    check(`${ label } preserves only a truthiness-selecting operand`, !!target?.preserveFalsyReceiver, selecting);
    if (selecting) check(`${ label } keeps the guard activation`, target.localMemo, true);
  });

for (const [receiver, whole] of [
  ["'' && [1]", true],
  ["('' && [1]) ?? [2]", true],
  ["('' ?? [1]) && [2]", true],
  ["'' && globalThis", true],
  ['(effect(), "") && [1]', true],
  ['"text" && [1]', false],
  ['false && [1]', true],
  ['null && [1]', false],
]) for (const host of ['argument', 'default']) runBoth(`an instance mirror reads the selected AND receiver/${ host }/${ receiver }`,
  `function read(${ host === 'argument' ? '{ includes, length }' : `{ includes, length } = ${ receiver }` }) {}
  const result = read(${ host === 'argument' ? receiver : '' });`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const before = JSON.stringify(program.node);
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath,
      adapter,
      meta: { kind: 'property', object: null, key: 'includes', placement: null },
      resolvePure: meta => meta.key === 'includes' ? { kind: 'instance', entry: 'instance/includes', hintName: 'includes' } : null,
      parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    });
    const target = plan?.targets?.find(item => item.node.type === 'LogicalExpression' && item.node.operator === '&&');
    check(`${ label } captures after selection where its falsy value can be an instance`, !!target, whole);
    if (whole) {
      check(`${ label } the receiver belongs to this evaluation`, target.localMemo, true);
      check(`${ label } the method waits for the parameter pattern`, target.tree.entries[0].deferred, true);
      check(`${ label } the native sibling waits too`, target.tree.entries[1].deferred, true);
    }
    check(`${ label } read-only question`, JSON.stringify(program.node), before);
  });

for (const [receiver, key, expected, deferred] of [
  ['1', 'toFixed', true, false],
  ['0', 'toFixed', true, false],
  ['-0', 'toFixed', true, false],
  ['-1', 'toFixed', true, false],
  ['value', 'toFixed', true, false],
  ['Number.NaN', 'toFixed', true, false],
  ['NaN', 'toFixed', true, false],
  ['Infinity', 'toFixed', true, false],
  ['globalThis.NaN', 'toFixed', true, false],
  ['globalThis.Infinity', 'toFixed', true, false],
  ['Number.EPSILON', 'toFixed', true, false],
  ['new Number(1)', 'toFixed', true, false],
  ['new String("az")', 'includes', true, false],
  ['new Array(1)', 'at', true, false],
  ['/a/g', 'flags', true, false],
  ['`az`', 'includes', true, false],
  ['factory()', 'toFixed', false, false],
  ['external', 'toFixed', false, false],
  ['{ toFixed: own }', 'toFixed', false, false],
]) runBoth(`closed instance callers share the default receiver admission/${ receiver }`,
  `const value = 1; function read({ ${ key } }) {} read(${ receiver });`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const before = JSON.stringify(program.node);
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath,
      adapter,
      meta: { kind: 'property', object: null, key, placement: null },
      resolvePure: meta => meta.key === key ? { kind: 'instance', entry: `instance/${ key }`, hintName: key }
        : meta.object === 'Number' && meta.key === 'EPSILON'
          ? { kind: 'static', entry: `number/${ meta.key.toLowerCase() }` } : null,
      parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    });
    check(`${ label } admits exactly a proven receiver source`, !!plan?.targets?.length, expected);
    if (expected) {
      check(`${ label } captures only a receiver whose read waits`, !!plan.targets[0].localMemo, deferred);
      check(`${ label } defers only the non-quiet source`, plan.targets[0].tree.entries[0].deferred, deferred);
    }
    check(`${ label } read-only question`, JSON.stringify(program.node), before);
  });

for (const setup of ['const receiver = [1]', 'let receiver = [1]', 'var receiver = [1]',
  'let receiver; receiver = [1]', 'const [receiver] = [[1]]']) runBoth(`stored instance callers use the binding admission/${ setup }`,
  `${ setup }; function read({ at }) {} read(receiver);`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath, adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
      parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    });
    check(`${ label } supplies the stored receiver`, plan?.targets?.length, 1);
    check(`${ label } needs no capture for its quiet read`, !!plan?.targets?.[0].localMemo, false);
    check(`${ label } consumes the method as a data slot`, plan?.targets?.[0].tree.entries[0].deferred, false);
  });

for (const [receiver, expected] of [
  ['receiver = [1]', true],
  ['receiver = (effect(), other = [1])', true],
  ['holder[(effect(), "value")] = [effect()]', true],
  ['receiver = ("" && [1])', true],
  ['receiver = ([1] || "")', true],
  ['receiver = factory()', true],
  ['receiver = { at: own }', false],
  ['receiver ||= [1]', false],
]) runBoth(`closed instance callers classify the installed argument value/${ receiver }`,
  `let receiver, other; const holder = {}; function read({ at }) {} read(${ receiver });`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const before = JSON.stringify(program.node);
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath, adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
      parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    });
    check(`${ label } keeps the existing source boundary`, !!plan?.targets?.length, expected);
    if (expected) {
      check(`${ label } captures the complete assignment`, plan.targets[0].node, callPath.node.arguments[0]);
      check(`${ label } consumes the argument once`, plan.targets[0].receiverNode, callPath.node.arguments[0]);
      check(`${ label } needs no activation before its sole read`, !!plan.targets[0].localMemo, false);
      check(`${ label } uses a data slot before binding`, plan.targets[0].tree.entries[0].deferred, false);
      check(`${ label } preserves a possibly nullish installed value`,
        !!plan.targets[0].preserveNullishReceiver, true);
    }
    check(`${ label } read-only question`, JSON.stringify(program.node), before);
  });

// A sole quiet read can move to its argument; real work in between retains the lazy slot.
for (const [source, index, deferred] of [
  ['function read({ at }) {} read([1]);', 0, false],
  ['function read({ at }) {} read?.([1]);', 0, false],
  ['function read({ at }, other) {} read?.([1], effect());', 0, true],
  ['function read({ at = effect() }) {} read([1]);', 0, false],
  ['function read({ at = effect() }, other) {} read([1], effect());', 0, true],
  ['function read({ at }) {} read(new Array(1));', 0, false],
  ['function read({ at }, other) {} read(new Array(1), effect());', 0, true],
  ['const value = [1]; function read({ at }) {} read(value);', 0, false],
  ['function read([{ at }]) {} read([[1]]);', 0, false],
  ['function read({ row: [{ at }] }) {} read({ row: [[1]] });', 0, false],
  ['function read({ at }) {} read(...[[1]]);', 0, false],
  ['function read({ at } = [1]) {} read();', 0, false],
  ['function read(first, { at }) {} read(effect(), [1]);', 1, false],
  ['function outer() { function read({ at }, other) {} read([1], this); }', 0, false],
  ['function outer() { function read({ at }, other) {} read([1], (effect(), this)); }', 0, true],
  ['function read({ at }, other) {} read([1], effect());', 0, true],
  // eslint-disable-next-line no-template-curly-in-string -- the source under test contains an implicit conversion
  ['function read(first = `${value}`, { at }) {} read(undefined, [1]);', 1, true],
  ['function read({ at }, other) {} read([1], +value);', 0, true],
  ['function read({ at }, other) {} read([1], "" + value);', 0, true],
  ['function read({ row: { at } }) {} read({ row: [1], other: +value });', 0, true],
  ['function read({ at }, other) {} read([1], { row: value });', 0, false],
  ['function read({ at }, other) {} read([1], -1);', 0, false],
  ['function read(first = effect(), { at }) {} read(undefined, [1]);', 1, true],
  ['function read({ row: { at }, other }) {} read({ row: [1], other: effect() });', 0, true],
  ['function read({ [(effect(), "at")]: at }) {} read([1]);', 0, true],
  ['function read({ before = effect(), row: { at } }) {} read({ row: [1] });', 0, true],
]) runBoth(
  `instance data slots respect their source evaluation window/${ source }`, source, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties
      .some(prop => (prop.value?.left ?? prop.value)?.name === 'at'));
    const callPath = parser.pickPath(program, parser.name === 'babel' && source.includes('read?.(')
      ? 'OptionalCallExpression' : 'CallExpression', path => path.node.callee.name === 'read');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const before = JSON.stringify(program.node);
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath, adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
      parameterCallSites: () => [{ callPath, argIndex: index, pairing: { args: callPath.node.arguments } }],
    });
    check(`${ label } keeps the receiver mirror`, plan?.targets?.length, 1);
    check(`${ label } only real intervening work needs a getter`, plan?.targets?.[0].tree.entries[0].deferred, deferred);
    check(`${ label } only a lazy read needs an activation`, !!plan?.targets?.[0].localMemo, deferred);
    check(`${ label } read-only question`, JSON.stringify(program.node), before);
  },
);

// Prefix work in a decided argument runs before its sole method read. Later arguments
// and sibling initializers still run before parameter binding and keep the read deferred.
for (const [source, deferred] of [
  ['function read({ at }) {} read(typeof Symbol !== "undefined" ? (effect(), []) : other);', false],
  ['function read({ at }) {} read(typeof Symbol !== "undefined" && (effect(), []));', false],
  ['function read({ at }, later) {} read(typeof Symbol !== "undefined" ? (effect(), []) : other, effect());', true],
  ['function read({ row: { at } }) {} read(typeof Symbol !== "undefined" ? (effect(), { row: [] }) : other);', false],
  ['function read({ row: { at } }) {} read(typeof Symbol !== "undefined" ? (effect(), { row: [], other: effect() }) : other);', true],
]) runBoth(`a decided caller argument retains its prefix before the method/${ source }`, source, (parser, program, label) => {
  const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties
    .some(prop => prop.value?.name === 'at'));
  const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', isEntryAvailable: () => true,
  });
  const before = JSON.stringify(program.node);
  const plan = buildParameterArgumentSynthPlan({
    leafPatternPath, adapter,
    meta: { kind: 'property', object: null, key: 'at', placement: null },
    resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at', hintName: 'at' } : null,
    parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
  });
  check(`${ label } keeps the receiver mirror`, plan?.targets?.length, 1);
  check(`${ label } defers only intervening work`, !!plan?.targets?.[0].localMemo, deferred);
  check(`${ label } keeps the source`, JSON.stringify(program.node), before);
});

for (const [nested, deferred] of [
  ['{ at = effect() }', false],
  ['{ 0: missing = effect(), at }', true],
  ['{ at, flat }', false],
]) runBoth(`a nested default keeps the method read in its own pattern/${ nested }`,
  `export function read({ prototype: ${ nested } } = Array) {}`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties
      .some(prop => (prop.value?.left ?? prop.value)?.name === 'at'));
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = buildNestedParamSynthPlan({
      leafPatternPath, adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' || meta.key === 'flat'
        ? { kind: 'instance', entry: `instance/${ meta.key }`, hintName: meta.key } : null,
    });
    check(`${ label } keeps the mirror`, plan?.targets?.length, 1);
    check(`${ label } orders the nested read`, plan?.targets?.[0].tree.entries[0].child.entries
      .find(entry => entry.key === 'at').deferred, deferred);
  });

runBoth('a served prototype leaf default does not defer the next method',
  'export function read({ prototype: { at = effect(), flat } } = Array) {}', (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties
      .some(prop => (prop.value?.left ?? prop.value)?.name === 'at'));
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = buildNestedParamSynthPlan({
      leafPatternPath, adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at' || meta.key === 'flat'
        ? { kind: 'instance', entry: `instance/${ meta.key }`, hintName: meta.key } : null,
    });
    const entries = plan?.targets?.[0].tree.entries[0].child.entries;
    check(`${ label } reads the first method before its own default`, entries?.find(entry => entry.key === 'at').deferred, false);
    check(`${ label } reads the next method after the defined helper value`, entries?.find(entry => entry.key === 'flat').deferred, false);
  });

for (const [source, family] of [
  ['const left = [1]; const right = [2];', 'Array'],
  ["const left = [1]; const right = '';", 'generic'],
]) runBoth(`a selected instance argument is consumed whole/${ family }`,
  `${ source } const flag = Date.now() > 0; (({ at }) => at)(flag ? left : right);`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.type === 'ArrowFunctionExpression'
      || path.node.callee.type === 'ParenthesizedExpression');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = buildParameterArgumentSynthPlan({
      leafPatternPath,
      adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at'
        ? { kind: 'instance', entry: `${ meta.object ?? 'generic' }/instance/at`, hintName: 'at' } : null,
      parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    });
    check(`${ label } has one conditional target`, plan?.targets?.length, 1);
    check(`${ label } keeps the conditional whole`, plan?.targets?.[0].node.type, 'ConditionalExpression');
    check(`${ label } selects the shared family`, plan?.targets?.[0].tree.entries[0].child.entry, `${ family }/instance/at`);
  });

// A nested parameter default dispatches on its receiver value, including a bound array literal.
// The supplied arm stays in the native pattern; knowing the default does not close its callers.
for (const [declarations, parameter, family, patchedConstructor] of [
  ['const arr = [1, 2];', '[{ at }] = [arr]', 'Array'],
  ['const source = [1, 2]; const arr = source;', '[{ at }] = [arr]', 'Array'],
  ['const arr = [1, 2];', 'Array, [{ at }] = [arr]', 'Array'],
  ["const arr = 'ab';", '[{ at }] = [arr]', 'String'],
  ["const arr = [1, 2]; const alias = arr; alias[0] = 'ab';", '[{ at }] = [arr]', 'Array'],
  ["let arr = [1, 2]; arr = 'ab';", '[{ at }] = [arr]', 'generic'],
  ['const arr = new Array(1, 2);', '[{ at }] = [arr]', 'Array'],
  ["const arr = new String('ab');", '[{ at }] = [arr]', 'String'],
  ['const Ctor = Array; const arr = new Ctor(1, 2);', '[{ at }] = [arr]', 'Array'],
  ["const arr = new String('ab');", 'String, [{ at }] = [arr]', 'String'],
  ['const String = function () { return [1, 2]; }; const arr = new String();', '[{ at }] = [arr]', 'generic'],
  ['const arr = new Object([1, 2]);', '[{ at }] = [arr]', 'generic'],
  ['const arr = new Array(1, 2);', '[{ at }] = [arr]', 'generic', 'Array'],
]) runBoth(`a bound nested default keeps its instance family/${ declarations }/${ parameter }`,
  `${ declarations } export function read(${ parameter }) { return at; }`, (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = buildNestedParamSynthPlan({
      leafPatternPath,
      adapter: patchedConstructor ? {
        ...adapter,
        isMutatedStatic: (object, key) => object === 'globalThis' && key === patchedConstructor,
      } : adapter,
      meta: { kind: 'property', object: null, key: 'at', placement: null },
      resolvePure: meta => meta.key === 'at'
        ? { kind: 'instance', entry: `${ meta.object ?? 'generic' }/instance/at`, hintName: 'at' } : null,
    });
    check(`${ label } mirrors the known default alone`, plan?.targets?.length, 1);
    check(`${ label } keeps the receiver family`, plan?.targets?.[0].tree.entries[0].child.entry,
      `${ family }/instance/at`);
    check(`${ label } replaces only the default receiver`, plan?.targets?.[0].node?.name, 'arr');
  });

for (const [name, source, deferred] of [
  ['quiet surface', 'export function read({ at, flat } = Array.prototype) {}', false],
  ['async quiet surface', 'export async function read({ at, flat } = Array.prototype) {}', false],
  ['default prefix', 'let probe; const arr = []; export function read({ at, flat } = (probe = () => at, arr)) {}', true],
  ['earlier parameter', 'let probe; const arr = []; export function read(first = (probe = () => at), { at, flat } = arr) {}', true],
]) runBoth(`an open instance default keeps its read window/${ name }`, source, (parser, program, label) => {
  const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const plan = buildNestedParamSynthPlan({
    leafPatternPath,
    adapter,
    allowFlatInstanceDefault: true,
    meta: { kind: 'property', object: null, key: 'at', placement: null },
    resolvePure: meta => meta.key === 'at' || meta.key === 'flat'
      ? { kind: 'instance', entry: `instance/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ label } mirrors the open default`, plan?.targets?.length, 1);
  check(`${ label } defers both reads together`, plan?.targets?.[0].tree.entries
    .every(entry => !!entry.deferred), deferred);
  check(`${ label } allocates an activation only for deferred reads`, !!plan?.targets?.[0].localMemo, deferred);
});

for (const [name, source] of [
  ['default prefix', 'let probe; export function read({ Array: { prototype: { at, flat } } } = (probe = () => at, globalThis)) {}'],
  ['earlier parameter', 'let probe; export function read(first = (probe = () => at), { Array: { prototype: { at, flat } } } = globalThis) {}'],
]) runBoth(`a nested open instance default keeps its read window/${ name }`, source, (parser, program, label) => {
  const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties
    .some(prop => (prop.value?.left ?? prop.value)?.name === 'at'));
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const plan = buildNestedParamSynthPlan({
    leafPatternPath,
    adapter,
    allowFlatInstanceDefault: true,
    meta: { kind: 'property', object: null, key: 'at', placement: null },
    resolvePure: meta => meta.kind === 'global' && meta.name === 'globalThis'
      ? { kind: 'global', entry: 'global-this', hintName: 'globalThis' }
      : meta.key === 'at' || meta.key === 'flat'
        ? { kind: 'instance', entry: `instance/${ meta.key }`, hintName: meta.key }
        : null,
  });
  const prototype = plan?.targets?.[0].tree.entries.find(entry => entry.key === 'Array')
    ?.child.entries.find(entry => entry.key === 'prototype')?.child;
  check(`${ label } keeps the nested default mirror`, !!prototype, true);
  check(`${ label } defers both nested reads`, prototype?.entries.every(entry => !!entry.deferred), true);
  check(`${ label } allocates an activation for nested reads`, !!plan?.targets?.[0].localMemo, true);
});

for (const [method, ownDefault] of [['at', true], ['flat', false]]) runBoth(
  `a quiet realm-selected prototype read uses a data slot/${ method }`,
  `const user = {}; export function read({ Array: { prototype: { ${ method }: value${ ownDefault ? ' = 1' : '' } }, from } } = c ? globalThis : user) {}`,
  (parser, program, label) => {
    const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties
      .some(prop => (prop.value?.left ?? prop.value)?.name === 'value'));
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = buildNestedParamSynthPlan({
      leafPatternPath,
      adapter,
      allowFlatInstanceDefault: true,
      meta: { kind: 'property', object: null, key: method, placement: null },
      resolvePure: meta => meta.kind === 'global' && meta.name === 'globalThis'
        ? { kind: 'global', entry: 'global-this', hintName: 'globalThis' }
        : meta.kind === 'property' && meta.object === 'Array' && meta.key === 'from'
          ? { kind: 'static', entry: 'array/from', hintName: 'Array$from' }
          : meta.key === method ? { kind: 'instance', entry: `instance/${ method }`, hintName: method } : null,
    });
    const target = plan?.targets?.find(item => item.node.name === 'globalThis');
    const prototype = target?.tree.entries.find(entry => entry.key === 'Array')
      ?.child.entries.find(entry => entry.key === 'prototype')?.child;
    check(`${ label } mirrors the realm arm`, !!prototype, true);
    check(`${ label } reads the prototype method eagerly`, prototype?.entries[0].deferred, false);
    check(`${ label } needs no activation`, !!target?.localMemo, false);
  });

// Whole receiver capture keeps open callers and quiet closed callers on the ordinary body renderer.
// Parameter reads and later binding work retain their original parameter environment.
for (const [name, source, accepted, padding] of [
  ['open declaration', 'export function read({ at }) { return at; }', true, true],
  ['escaped declaration', 'function read({ at }) { return at; } hand(read);', true, true],
  ['callback expression', 'subscribe(({ at }) => at);', true, true],
  ['closed caller', 'function read({ at, flat }) { return [at, flat]; } read([1, [2]]);', true, true],
  ['later identifier', 'function read({ at }, value) { return [at, value]; } read([1], effect());', true, true],
  ['earlier default', 'export function read(value = effect(), { at }) { return [at, value]; }', true, false],
  ['whole default', 'export function read({ at } = [1]) { return at; }', true, false],
  ['mutable binding', 'export function read({ at }) { at = 7; return at; }', true, true],
  ['arguments object', 'export function read({ at }, value) { return [at, arguments[1]]; }', true, true],
  ['native sibling', 'export function read({ before, at, after }) { return [before, at, after]; }', true, true],
  ['typed receiver', 'export function read({ at, length }: string) { return [at, length]; }', true, true],
  ['typed receiver default', 'export function read({ at }: string = "ab") { return at; }', true, false],
  ['later default', 'export function read({ at }, value = effect()) { return at; }', false],
  ['later pattern', 'export function read({ at }, { value }) { return at; }', false],
  ['later rest', 'export function read({ at }, ...values) { return at; }', false],
  ['leaf default', 'export function read({ at = custom }) { return at; }', false],
  ['computed key', 'export function read({ [key]: at }) { return at; }', false],
  ['repeated key', 'export function read({ at, at: again }) { return at; }', false],
  ['rest property', 'export function read({ at, ...rest }) { return at; }', false],
  ['nested pattern', 'export function read({ row: { at } }) { return at; }', true, true],
  ['nested literal default', 'export function read({ row: { at } = "ab" }) { return at; }', true, true],
  ['nested siblings', 'export function read({ first: { at }, last: { flat }, marker }) { return [at, flat, marker]; }', true, true],
  ['nested native hop sibling', 'export function read({ row: { inner: { at }, marker } }) { return [at, marker]; }', true, true],
  ['nested claimed hop sibling', 'export function read({ row: { inner: { at }, flat } }) { return [at, flat]; }', true, true],
  ['nested computed literal', 'export function read({ row: { ["at"]: at } }) { return at; }', false],
  ['empty nested level', 'export function read({ row: {}, at }) { return at; }', false],
  ['nested native leaf sibling', 'export function read({ row: { at, marker } }) { return [at, marker]; }', true, true],
  ['nested receiver annotation', 'export function read({ row: { at } }: { row: string }) { return at; }', true, true],
  ['nested whole default', 'export function read({ row: { at } } = getReceiver()) { return at; }', true, false],
  ['nested leaf default', 'export function read({ row: { at = custom } }) { return at; }', false],
  ['nested expression default', 'export function read({ row: { at } = bodyValue }) { var bodyValue = "ab"; return at; }', false],
  ['nested call default', 'export function read({ row: { at } = fallback() }) { return at; }', false],
  ['nested computed key', 'export function read({ row: { [key]: at } }) { return at; }', false],
  ['nested repeated key', 'export function read({ row: { at, at: again } }) { return at; }', false],
  ['nested rest', 'export function read({ row: { at, ...rest } }) { return at; }', false],
  ['nested parameter read', 'export function read(probe = () => at, { row: { at } }) { return at; }', false],
  ['nested later binding read', 'export function read(probe = () => tail, { row: { at } = { get at() { return probe(); } } }, tail) { return at; }', false],
  ['nested body redeclaration', 'export function read({ row: { at } }) { var at; return at; }', false],
  ['nested array pattern', 'export function read({ row: [{ at }] }) { return at; }', false],
  ['concise arrow returning arrow', 'export const read = ({ at }) => () => at;', true, true],
  ['concise arrow returning function', 'export const read = ({ at }) => function () { return at; };', true, true],
  ['concise arrow returning class', 'export const read = ({ at }) => class { read() { return at; } };', true, true],
  ['generator', 'export function* read({ at }) { yield at; }', false],
  ['async', 'export async function read({ at }) { return at; }', false],
  ['body var', 'export function read({ at }) { var at; return at; }', false],
  ['body function', 'export function read({ at }) { function at() {} return at; }', false],
  ['later binding through earlier closure', 'export function read(probe = () => tail, { at } = { get at() { return probe(); } }, tail) { return at; }', false],
  ['later binding write through earlier closure', 'export function read(probe = () => tail = 7, { at } = { get at() { return probe(); } }, tail) { return at; }', false],
  ['later binding update through earlier closure', 'export function read(probe = () => ++tail, { at } = { get at() { return probe(); } }, tail) { return at; }', false],
  ['later binding pattern write through earlier closure',
    'export function read(probe = () => ({ x: tail } = { x: 7 }), { at } = { get at() { return probe(); } }, tail) { return at; }', false],
  ['later binding through receiver getter', 'export function read({ at } = { get at() { return tail; } }, tail) { return at; }', false],
  ['initialized earlier binding', 'export function read(earlier = 7, { at } = { get at() { return earlier; } }, tail) { return at; }', true, false],
  ['later binding as a property name', 'export function read({ at } = { tail: 7, at: 9 }, tail) { return at; }', true, false],
  ['nested binding declaration is no read', 'export function read(probe = (tail => () => 7)(1), { at } = { get at() { return probe(); } }, tail) { return at; }', true, false],
  ['moved binding shadow remains local', 'export function read(probe = (at => () => at)(7), { at }) { return at; }', true, false],
  ['later binding shadow remains local', 'export function read(probe = (tail => () => tail)(7), { at }, tail) { return at; }', true, false],
  ['earlier direct read', 'export function read(value = at, { at }) { return at; }', false],
  ['earlier closure', 'export function read(value = () => at, { at }) { return value(); }', false],
  ['receiver default closure', 'export function read({ at } = install(() => at)) { return at; }', false],
  ['earlier eval', 'export function read(value = eval("typeof at"), { at }) { return at; }', false],
  ['body eval', 'export function read({ at }) { return eval("at"); }', false],
]) runBoth(`parameter body receiver/${ name }`, source, (parser, program, label) => {
  const pattern = parser.pickPath(program, 'ObjectPattern', path => path.node.properties.some(prop => prop.value?.name === 'at'
    || prop.value?.left?.name === 'at'));
  const property = pattern.get('properties').find(path => path.node.value?.name === 'at' || path.node.value?.left?.name === 'at');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', collectBindingReferences: parser.makeResolver().collectBindingReferences,
  });
  const options = {
    propPath: property, adapter,
    resolvePure: meta => ['at', 'flat'].includes(meta.key) ? { kind: 'instance', entry: `instance/${ meta.key }` } : null,
  };
  const before = JSON.stringify(program.node);
  const plan = planParameterInstanceExtraction(options);
  check(`${ label } admission`, !!plan, accepted);
  check(`${ label } is speculative`, JSON.stringify(program.node), before);
  check(`${ label } global keeps the source parameter`, planParameterInstanceExtraction({
    ...options, adapter: { ...adapter, method: 'usage-global' },
  }), null);
  if (!accepted || !plan) return;
  check(`${ label } pads only an otherwise simple list`, plan.paddingRequired, padding);
  check(`${ label } keeps the source property identities`, subtreeContainsNode(plan.pattern, property.node), true);
  const rendered = renderParameterInstanceCapture(plan, { receiverName: '_ref', unusedName: '_unused' });
  check(`${ label } body declaration remains mutable`, rendered.declaration.kind, 'let');
  check(`${ label } keeps the property node for its source receiver fact`, subtreeContainsNode(rendered.declaration, property.node), true);
  check(`${ label } keeps the source receiver default`, rendered.head.right, plan.root.right);
  check(`${ label } preserves the receiver annotation in its moved pattern`,
    rendered.declaration.declarations[0].id.typeAnnotation, plan.pattern.typeAnnotation);
  check(`${ label } pads without allocating rest`, rendered.padding?.type, padding ? 'AssignmentPattern' : undefined);
  check(`${ label } disabled properties keep the source parameter`, planParameterInstanceExtraction({
    ...options, isDisabledProp: () => true,
  }), null);
  check(`${ label } a disabled leaf keeps the whole parameter`, planParameterInstanceExtraction({
    ...options, isDisabledProp: node => node === property.node,
  }), null);
});

// A cached refusal follows the actual parameter-expression read/write, not the old pattern identity.
// Both emitters revisit the same source pattern after replacing or removing earlier expressions.
for (const expression of ['tail', 'tail = 7', '++tail', '({ x: tail } = { x: 7 })']) {
  for (const edit of ['replace body', 'remove default', 'rename target', 'move expression to body', 'reparent pattern']) {
    runBoth(`parameter body receiver warm edit/${ expression }/${ edit }`,
      `export function read(probe = () => (${ expression }), shadow = (tail => tail)(1), { at }, tail) { return at; } function other(a, b, replacement, tail) {}`,
      (parser, program, label) => {
        const pattern = parser.pickPath(program, 'ObjectPattern', path => path.node.properties.some(prop => prop.value?.name === 'at'));
        const arrow = parser.pickPath(program, 'ArrowFunctionExpression');
        const [property] = pattern.get('properties');
        const resolver = parser.makeResolver();
        let references = 0;
        const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
          method: 'usage-pure',
          collectBindingReferences(...args) { references++; return resolver.collectBindingReferences(...args); },
        });
        const options = { propPath: property, adapter, resolvePure: () => ({ kind: 'instance', entry: 'instance/at' }) };
        check(`${ label } refuses the live parameter dependency`, withCanonQuestion(() => planParameterInstanceExtraction(options)), null);
        const coldReferences = references;
        check(`${ label } refuses the same dependency in a fresh question`, withCanonQuestion(() => planParameterInstanceExtraction(options)), null);
        check(`${ label } keeps a live refusal without repeating the reference census`, references, coldReferences);
        switch (edit) {
          case 'replace body':
            arrow.get('body').replaceWith({ type: parser.name === 'babel' ? 'NumericLiteral' : 'Literal', value: 7 });
            break;
          case 'remove default': arrow.parentPath.replaceWith(arrow.parentPath.node.left); break;
          case 'rename target':
            walkAstNodes({ root: arrow.node.body, visit: node => { if (node.type === 'Identifier' && node.name === 'tail') node.name = 'outer'; } });
            break;
          case 'move expression to body': {
            const fn = parser.pickPath(program, 'FunctionDeclaration', path => path.node.id.name === 'read');
            fn.node.params[0].right = { type: parser.name === 'babel' ? 'NumericLiteral' : 'Literal', value: 7 };
            fn.node.body.body.unshift({ type: 'ExpressionStatement', expression: arrow.node });
            program.scope.crawl();
            break;
          }
          default: {
            const fn = parser.pickPath(program, 'FunctionDeclaration', path => path.node.id.name === 'read');
            const other = parser.pickPath(program, 'FunctionDeclaration', path => path.node.id.name === 'other');
            fn.node.params[2] = { type: 'Identifier', name: 'original' };
            other.node.params[2] = pattern.node;
            program.scope.crawl();
            options.propPath = parser.pickPath(program, 'ObjectPattern', path => path.node === pattern.node).get('properties').at(0);
          }
        }
        check(`${ label } serves the unchanged pattern after the dependency is retired`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), true);
      });
  }
}

// A live dependency can stop reading the binding without changing its node or parent path.
// A name-literal key is no barrier, while surviving values and write targets still are.
for (const [kind, expression, expected] of [
  ['object key', '({ [tail]: 1 })', true],
  ['member key', 'holder[tail]', true],
  ['object value', '({ [1]: tail })', false],
  ['assignment value', '({ [tail]: (tail = 7) })', false],
  ['update value', '({ [tail]: ++tail })', false],
  ['destructuring value', '({ [tail]: ({ x: tail } = { x: 7 }) })', false],
]) runBoth(`parameter body receiver warm key role/${ kind }`,
  `export function read(probe = () => (${ expression }), { at }, tail) { return at; }`, (parser, program, label) => {
    const pattern = parser.pickPath(program, 'ObjectPattern', path => path.node.properties.some(prop => prop.value?.name === 'at'));
    const computed = parser.pickPath(program, kind === 'member key' ? 'MemberExpression' : parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.node.computed);
    function makeAdapter() {
      return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
        method: 'usage-pure', collectBindingReferences: parser.makeResolver().collectBindingReferences,
      });
    }
    const adapter = makeAdapter();
    const options = { propPath: pattern.get('properties')[0], adapter, resolvePure: () => ({ kind: 'instance', entry: 'instance/at' }) };
    check(`${ label } refuses the live dependency`, withCanonQuestion(() => planParameterInstanceExtraction(options)), null);
    check(`${ label } reuses the live refusal`, withCanonQuestion(() => planParameterInstanceExtraction(options)), null);
    const key = computed.node.key ?? computed.node.property;
    computed.node.computed = false;
    program.scope.crawl();
    check(`${ label } keeps the exact source key node`, computed.node.key ?? computed.node.property, key);
    check(`${ label } fresh query follows the current role`, !!withCanonQuestion(() => planParameterInstanceExtraction({ ...options, adapter: makeAdapter() })), expected);
    check(`${ label } warm query follows the current role`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), expected);
  });

// Rebuilding scope can shadow a live parameter dependency without replacing its source node.
// Refusals follow the current program context; selective crawls keep the same binding answers.
for (const edit of ['add parameter', 'rename parameter']) {
  for (const crawl of ['program and current path', 'function and current path', 'arrow scope', 'arrow and current path']) {
    runBoth(`parameter dependency scope refresh/${ edit }/${ crawl }`,
      `export function read(probe = (${ edit === 'rename parameter' ? 'local' : '' }) => tail, shadow = (tail => tail)(1), { at }, tail, pad) { return at; }`,
      (parser, program, label) => {
        const pattern = parser.pickPath(program, 'ObjectPattern');
        const fn = pattern.parentPath;
        const arrow = fn.get('params')[0].get('right');
        const witness = arrow.node.body;
        function makeAdapter() {
          return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
            method: 'usage-pure', collectBindingReferences: parser.makeResolver().collectBindingReferences,
          });
        }
        const adapter = makeAdapter();
        const options = { propPath: pattern.get('properties')[0], adapter, resolvePure: () => ({ kind: 'instance', entry: 'instance/at' }) };
        check(`${ label } refuses the actual dependency`, withCanonQuestion(() => planParameterInstanceExtraction(options)), null);
        check(`${ label } keeps the warm refusal`, withCanonQuestion(() => planParameterInstanceExtraction(options)), null);
        if (edit === 'add parameter') arrow.node.params.push({ type: 'Identifier', name: 'tail' });
        else arrow.node.params[0].name = 'tail';
        if (crawl === 'program and current path') program.scope.crawl();
        else if (crawl === 'function and current path') fn.scope.crawl();
        else arrow.scope.crawl();
        if (crawl.includes('current path')) {
          options.propPath = parser.pickPath(program, 'ObjectPattern', path => path.node === pattern.node).get('properties').at(0);
        }
        const currentFn = options.propPath.parentPath.parentPath;
        const currentRead = currentFn.get('params')[0].get('right').get('body');
        check(`${ label } retains the exact reference node`, currentRead.node, witness);
        check(`${ label } current binding is the inner parameter`, bindingLoopAnchor(currentRead.scope.getBinding('tail')).decl, arrow.node.params[0]);
        check(`${ label } warm adapter follows the current binding`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), true);
        check(`${ label } fresh adapter follows the current binding`, !!withCanonQuestion(() => planParameterInstanceExtraction({ ...options, adapter: makeAdapter() })), true);
      });
  }
}

// Moving the receiver after a dependency keeps that binding initialized before its getter.
runBoth('parameter dependency moves before the receiver',
  'export function read(probe = () => tail, shadow = (tail => tail)(1), { at }, tail, pad) { return at; }',
  (parser, program, label) => {
    const pattern = parser.pickPath(program, 'ObjectPattern');
    const fn = pattern.parentPath;
    const resolver = parser.makeResolver();
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method: 'usage-pure', collectBindingReferences: resolver.collectBindingReferences,
    });
    const options = { propPath: pattern.get('properties')[0], adapter, resolvePure: () => ({ kind: 'instance', entry: 'instance/at' }) };
    check(`${ label } refuses the future binding dependency`, withCanonQuestion(() => planParameterInstanceExtraction(options)), null);
    fn.node.params.copyWithin(2, 4);
    fn.node.params[4] = pattern.node;
    program.scope.crawl();
    check(`${ label } keeps the same pattern node`, options.propPath.parentPath.node, pattern.node);
    check(`${ label } admits the already initialized binding`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), true);
  });

// A selective crawl can introduce a later-parameter dependency without a new Program path.
for (const expression of ['tail', 'tail = 7', '++tail', '({ x: tail } = { x: 7 })']) {
  for (const edit of ['rename inner parameter', 'rename body target']) {
    for (const crawl of expression === 'tail' ? ['arrow scope', 'program and current path'] : ['arrow scope']) {
      const body = edit === 'rename inner parameter' ? expression : expression.replaceAll('tail', 'outer');
      runBoth(`parameter dependency introduced after admission/${ expression }/${ edit }/${ crawl }`,
        `export function read(probe = (${ edit === 'rename inner parameter' ? 'tail' : '' }) => ${ body }, shadow = (tail => tail)(1), { at }, tail, pad) { return at; }`,
        (parser, program, label) => {
          const pattern = parser.pickPath(program, 'ObjectPattern', path => path.node.properties.some(prop => prop.value?.name === 'at'));
          const fn = pattern.parentPath;
          const arrow = fn.get('params')[0].get('right');
          function makeAdapter() {
            return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
              method: 'usage-pure', collectBindingReferences: parser.makeResolver().collectBindingReferences,
            });
          }
          const adapter = makeAdapter();
          const options = { propPath: pattern.get('properties')[0], adapter, resolvePure: () => ({ kind: 'instance', entry: 'instance/at' }) };
          check(`${ label } initially has no dependency`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), true);
          check(`${ label } initial warm admission remains valid`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), true);
          if (edit === 'rename inner parameter') arrow.node.params[0].name = 'local';
          else walkAstNodes({ root: arrow.node.body, visit: node => { if (node.type === 'Identifier' && node.name === 'outer') node.name = 'tail'; } });
          if (crawl === 'arrow scope') arrow.scope.crawl();
          else {
            program.scope.crawl();
            options.propPath = parser.pickPath(program, 'ObjectPattern', path => path.node === pattern.node).get('properties').at(0);
          }
          const currentArrow = options.propPath.parentPath.parentPath.get('params')[0].get('right');
          check(`${ label } native binding now reaches the later parameter`, bindingLoopAnchor(currentArrow.scope.getBinding('tail')).decl, fn.node.params[3]);
          check(`${ label } warm adapter refuses the new dependency`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), false);
          check(`${ label } fresh adapter refuses the new dependency`, !!withCanonQuestion(() => planParameterInstanceExtraction({ ...options, adapter: makeAdapter() })), false);
        });
    }
  }
}

// Current native references join the source census once per binding and read-only question.
for (const width of [16, 32]) runBoth(`current reference merge width/${ width }`,
  `export function read(tail) { return [${ Array.from({ length: width }, () => 'tail').join(', ') }]; }`,
  (parser, program, label) => {
    const fn = parser.pickPath(program, 'FunctionDeclaration');
    const resolver = parser.makeResolver();
    const [anchor] = fn.get('params');
    const raw = anchor.scope.getBinding('tail');
    const before = resolver.collectBindingReferences(anchor, 'tail');
    check(`${ label } initial census is complete`, before.length, width);
    let iterations = 0;
    if (Array.isArray(raw.references)) raw.references = new Proxy(raw.references, {
      get(target, key, receiver) {
        if (key === Symbol.iterator) iterations++;
        return Reflect.get(target, key, receiver);
      },
    });
    withCanonQuestion(() => {
      for (let repeat = 0; repeat < 32; repeat++) {
        const references = resolver.collectBindingReferences(anchor, 'tail');
        check(`${ label } warm answer stays complete/${ repeat }`, references.length, width);
      }
    });
    check(`${ label } merges the current native set at most once`, iterations <= 1, true);
    withCanonQuestion(() => resolver.collectBindingReferences(anchor, 'tail'));
    check(`${ label } later questions can observe a new native set`, iterations, Array.isArray(raw.references) ? 2 : 0);
  });

// Census source extras can retain a former key read; its current literal role owns no binding use.
runBoth('parameter dependency cold census follows a changed key role',
  'export function read(probe = () => ({ [tail]: 1 }), shadow = (tail => tail)(1), { at }, tail) { return at; }',
  (parser, program, label) => {
    const pattern = parser.pickPath(program, 'ObjectPattern');
    const arrow = pattern.parentPath.get('params')[0].get('right');
    const [property] = peelTransparentWrapperPath(arrow.get('body')).get('properties');
    function makeAdapter() {
      return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
        method: 'usage-pure', collectBindingReferences: parser.makeResolver().collectBindingReferences,
      });
    }
    const options = { propPath: pattern.get('properties')[0], adapter: makeAdapter(), resolvePure: () => ({ kind: 'instance', entry: 'instance/at' }) };
    check(`${ label } initially reads the later binding`, withCanonQuestion(() => planParameterInstanceExtraction(options)), null);
    property.node.computed = false;
    arrow.scope.crawl();
    check(`${ label } warm adapter ignores the retired value-position read`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), true);
    check(`${ label } fresh adapter ignores the same name-literal key`, !!withCanonQuestion(() => planParameterInstanceExtraction({ ...options, adapter: makeAdapter() })), true);
  });

// A served method on a pristine constructor prototype cannot run its leaf default.
// Other defaults remain an ordering barrier, including for well-known symbol reads.
for (const [name, source, mode, expected] of [
  ['served renamed default', 'export function read({ prototype: { at: first = effect(), flat } } = Array) {}', 'served', [false, false]],
  ['served repeated defaults', 'export function read({ prototype: { at = effect(), flat = other(), includes } } = Array) {}', 'served', [false, false, false]],
  ['nonmatching Set method', 'export function read({ prototype: { at = effect(), flat } } = Set) {}', 'served', [false, true]],
  ['nonmatching Object method', 'export function read({ prototype: { at = effect(), flat } } = Object) {}', 'served', [false, true]],
  ['non-method Function property', 'export function read({ prototype: { name = effect(), flat } } = Function) {}', 'name', [false, true]],
  ['served realm default', 'export function read({ Array: { prototype: { at = effect(), flat } } } = globalThis) {}', 'served', [false, false]],
  ['earlier native default', 'export function read({ prototype: { missing = effect(), at = other(), flat } } = Array) {}', 'served', [false, true, true]],
  ['excluded default', 'export function read({ prototype: { at = effect(), flat } } = Array) {}', 'excluded', [false, true]],
  ['mutated default', 'export function read({ prototype: { at = effect(), flat } } = Array) {}', 'mutated', [false, true]],
  ['non-instance resolution', 'export function read({ prototype: { at = effect(), flat } } = Array) {}', 'static', [false, true]],
  ['instance receiver default', 'export function read({ at = effect(), flat } = Array.prototype) {}', 'served', [true, true]],
  ['literal receiver default', 'export function read({ at = effect(), flat } = []) {}', 'served', [true, true]],
  ['receiver closure prefix', 'let probe; export function read({ prototype: { at = effect(), flat } } = (probe = () => at, Array)) {}', 'served', [true, true]],
  ['earlier parameter closure',
    'export function read(probe = () => at, { prototype: { at = effect(), flat } } = Array) {}', 'served', [true, true]],
  ['native default before symbol', 'export function read({ prototype: { missing = effect(), at, [Symbol.iterator]: iterator } } = Array) {}', 'served', [false, true, true]],
  ['served default before symbol', 'export function read({ prototype: { at = effect(), [Symbol.iterator]: iterator, flat } } = Array) {}', 'served', [false, false, false]],
  ['native default after served',
    'export function read({ prototype: { at = effect(), missing = other(), [Symbol.iterator]: iterator, flat } } = Array) {}',
    'served', [false, false, true, true]],
  ['excluded default before symbol', 'export function read({ prototype: { at = effect(), [Symbol.iterator]: iterator, flat } } = Array) {}', 'excluded', [false, true, true]],
]) runBoth(`prototype default settlement/${ name }`, source, (parser, program, label) => {
  const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties
    .some(prop => ['at', 'name'].includes(prop.key?.name ?? prop.key?.value)));
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  if (mode === 'mutated') adapter.isMutatedStatic = (object, key) => object === 'Array.prototype' && key === 'at';
  const before = JSON.stringify(program.node);
  const plan = buildNestedParamSynthPlan({
    leafPatternPath, adapter, allowFlatInstanceDefault: true,
    meta: { kind: 'property', object: null, key: 'flat', placement: null },
    resolvePure: meta => meta.kind === 'global' && meta.name === 'globalThis'
      ? { kind: 'global', entry: 'global-this', hintName: 'globalThis' }
      : meta.object === 'Symbol' && meta.key === 'iterator'
        ? { kind: 'static', entry: 'symbol/iterator', hintName: 'Symbol$iterator' }
        : ['at', 'flat', 'includes', 'name'].includes(meta.key) && !(mode === 'excluded' && meta.key === 'at')
          ? { kind: mode === 'static' && meta.key === 'at' ? 'static' : 'instance', entry: `instance/${ meta.key }`, hintName: meta.key }
          : null,
  });
  let tree = plan?.targets?.[0].tree;
  while (tree?.entries?.some(entry => entry.key === 'prototype' || entry.key === 'Array')) {
    tree = tree.entries.find(entry => entry.key === 'prototype' || entry.key === 'Array').child;
  }
  check(`${ label } retains the mirror`, !!tree?.entries?.length, true);
  check(`${ label } ordered reads`, JSON.stringify(tree?.entries?.map(entry => !!entry.deferred)), JSON.stringify(expected));
  check(`${ label } preserves the source defaults`, JSON.stringify(program.node), before);
  check(`${ label } activates only for deferred reads`, !!plan?.targets?.[0].localMemo, expected.includes(true));
  if (['excluded', 'mutated', 'static'].includes(mode)) check(`${ label } does not call the preceding slot served`, tree?.entries?.[0].child.kind, 'passthrough');
});

runBoth('mixed caller reads only the safe prefix', `
  const events = [];
  function read({ at, [(events.push('key'), 'flat')]: flat, length }) {}
  read(Array.prototype);
`, (parser, program, label) => {
  const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
  const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', isEntryAvailable: () => true,
  });
  const plan = buildParameterArgumentSynthPlan({
    leafPatternPath, adapter,
    meta: { kind: 'property', object: null, key: 'at', placement: null },
    resolvePure: meta => meta.key === 'at' || meta.key === 'flat'
      ? { kind: 'instance', entry: `instance/${ meta.key }`, hintName: meta.key } : null,
    parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
  });
  const entries = plan?.targets?.[0].tree.entries;
  check(`${ label } reads the prefix eagerly`, entries?.find(x => x.key === 'at').deferred, false);
  check(`${ label } keeps the effectful key before its read`, entries?.find(x => x.key === 'flat').deferred, true);
  check(`${ label } keeps the key before the following native read`, entries?.find(x => x.key === 'length').deferred, true);
});

for (const [source, deferred] of [
  ['(([{ at }, { flat }]) => flat)([[1], [[2]]]);', true],
  ['(([{ at }, { flat }]) => flat)([{ at: own }, [[2]]]);', false],
  ['(([{ at }, { flat }]) => flat)([[1], (effect(), [[2]])]);', true],
  ['(([{ at = effect() }, { flat }]) => flat)([[1], [[2]]]);', true],
  ['(([{ [(effect(), \'at\')]: at }, { flat }]) => flat)([[1], [[2]]]);', true],
  ['function read([{ at }, { flat }, tail]) {} read([[1], [[2]], effect()]);', true],
]) runBoth(`paired earlier pattern reads preserve the next instance read/${ source }`, source, (parser, program, label) => {
  const patterns = parser.collectPaths(program, 'ObjectPattern');
  const leafPatternPath = patterns.find(path => path.node.properties.some(prop => prop.value?.name === 'flat'));
  const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read'
    || path.node.callee.type === 'ArrowFunctionExpression' || path.node.callee.type === 'ParenthesizedExpression');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', isEntryAvailable: () => true,
  });
  const plan = buildParameterArgumentSynthPlan({
    leafPatternPath, adapter,
    meta: { kind: 'property', object: null, key: 'flat', placement: null },
    resolvePure: meta => meta.key === 'at' || meta.key === 'flat'
      ? { kind: 'instance', entry: `instance/${ meta.key }`, hintName: meta.key } : null,
    parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
  });
  check(`${ label } orders the second receiver`, plan?.targets?.[0].tree.entries[0].deferred, deferred);
});

for (const [name, source, expected] of [
  ['quiet trailing element', 'function read([{ at }, { flat }]) {} read([{ at: served }, [[2]], 0]);', false],
  ['quiet missing tail', 'function read([{ at }, { flat }, tail]) {} read([{ at: served }, [[2]]]);', false],
  ['quiet empty rest tail', 'function read([{ at }, { flat }, ...tail]) {} read([{ at: served }, [[2]]]);', false],
  ['effectful trailing element', 'function read([{ at }, { flat }]) {} read([{ at: served }, [[2]], effect()]);', true],
  ['preceding property default', 'function read([{ at, missing = effect() }, { flat }, tail]) {} read([{ at: served }, [[2]]]);', true],
  ['following element default', 'function read([{ at }, { flat }, tail = effect()]) {} read([{ at: served }, [[2]]]);', true],
  ['visible iterator replacement', 'Array.prototype[Symbol.iterator] = custom; function read([{ at }, { flat }, tail]) {} read([{ at: served }, [[2]]]);', true],
]) runBoth(`array argument window uses per-slot proof/${ name }`, source, (parser, program, label) => {
  const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties
    .some(prop => prop.value?.name === 'flat'));
  const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read');
  const baseAdapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', isEntryAvailable: () => true,
  });
  const adapter = name === 'visible iterator replacement' ? {
    ...baseAdapter,
    isMutatedStatic: (owner, key) => owner === 'Array.prototype' && key === 'Symbol.iterator',
  } : baseAdapter;
  const plan = buildParameterArgumentSynthPlan({
    leafPatternPath, adapter,
    meta: { kind: 'property', object: null, key: 'flat', placement: null },
    resolvePure: meta => meta.key === 'at' || meta.key === 'flat'
      ? { kind: 'instance', entry: `instance/${ meta.key }`, hintName: meta.key } : null,
    parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
  });
  check(`${ label } keeps the second receiver at its required position`,
    plan?.targets?.[0]?.tree?.entries?.find(entry => entry.key === 'flat')?.deferred ?? null, expected);
});

runBoth('a missing receiver keeps its native throw', 'function read([{ at }, { flat }]) {} read([{ at: served }]);', (parser, program, label) => {
  const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties
    .some(prop => prop.value?.name === 'flat'));
  const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', isEntryAvailable: () => true,
  });
  const plan = buildParameterArgumentSynthPlan({
    leafPatternPath, adapter,
    meta: { kind: 'property', object: null, key: 'flat', placement: null },
    resolvePure: meta => meta.key === 'flat'
      ? { kind: 'instance', entry: 'instance/flat', hintName: 'flat' } : null,
    parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
  });
  check(`${ label } declines the absent receiver`, plan, null);
});

for (const [source, deferred] of [
  ['export function read({ C: { flat } } = { C: o.a }) {}', false],
  ['export function read({ C: { flat }, tail } = { C: o.a, tail: effect() }) {}', true],
  ['export function read({ before = effect(), C: { flat } } = { C: o.a }) {}', true],
]) runBoth(`a sole default receiver carries only its own read/${ source }`, source, (parser, program, label) => {
  const leafPatternPath = parser.pickPath(program, 'ObjectPattern', path => path.node.properties
    .some(prop => prop.value?.name === 'flat'));
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure', isEntryAvailable: () => true,
  });
  const plan = buildNestedParamSynthPlan({
    leafPatternPath, adapter,
    meta: { kind: 'property', object: null, key: 'flat', placement: null },
    resolvePure: meta => meta.key === 'flat'
      ? { kind: 'instance', entry: 'instance/flat', hintName: 'flat' } : null,
  });
  check(`${ label } orders the default receiver`, plan?.targets?.[0].tree.entries
    .find(entry => entry.key === 'flat').deferred, deferred);
});

// A whole-receiver body capture cannot erase a statically served arm of that receiver.
// The established source-meta and caller census retain those hosts for their mirrors and guards.
for (const [name, source, expected] of [
  ['static default', 'export function read({ entries } = Object) { return entries; }', false],
  ['selected default', '(({ entries } = flag ? Object : user) => entries)();', false],
  ['selected argument', '(({ entries }) => entries)(flag ? Object : user);', false],
  ['named static caller sibling', 'function read({ at, entries }) { return [at, entries]; } read(Object);', false],
  ['global default sibling', 'export function read({ at, Map } = globalThis) { return [at, Map]; }', false],
  ['instance selected default', '(({ at } = flag ? [1] : "ab") => at)();', true],
  ['instance selected argument', '(({ at }) => at)(flag ? [1] : "ab");', true],
  ['shadowed constructor', 'const Object = { entries: custom }; export function read({ entries } = Object) { return entries; }', true],
  ['native constructor property', 'export function read({ length, at } = Array) { return [length, at]; }', true],
  ['open instance receiver', 'subscribe(({ entries }) => entries);', true],
]) runBoth(`body capture retains served source arms/${ name }`, source, (parser, program, label) => {
  const pattern = parser.pickPath(program, 'ObjectPattern');
  const [property] = pattern.get('properties');
  const calls = parser.collectPaths(program, 'CallExpression', path => path.node.callee.name === 'read');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(program.node);
  const plan = planParameterInstanceExtraction({
    propPath: property, adapter,
    resolvePure: meta => meta.object === 'Object' && meta.key === 'entries'
      ? { kind: 'static', entry: 'object/entries' }
      : ['entries', 'at'].includes(meta.key) ? { kind: 'instance', entry: `instance/${ meta.key }` } : null,
    parameterCallSites: () => calls.length ? calls.map(callPath => ({ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } })) : null,
  });
  check(`${ label } admission`, !!plan, expected);
  check(`${ label } is speculative`, JSON.stringify(program.node), before);
  const options = {
    propPath: property, adapter,
    resolvePure: meta => meta.object === 'Object' && meta.key === 'entries'
      ? { kind: 'static', entry: 'object/entries' }
      : ['entries', 'at'].includes(meta.key) ? { kind: 'instance', entry: `instance/${ meta.key }` } : null,
    parameterCallSites: () => calls.length ? calls.map(callPath => ({ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } })) : null,
  };
  // Ignore a speculative answer, then ask the ordinary source-meta question. Its answer and
  // subsequent admission must match a fresh tree which never saw the speculative planner.
  planParameterInstanceExtraction(options);
  function describe(receiverPattern, receiverAdapter, callerSites) {
    return receiverPattern.get('properties').map(prop => {
      const meta = buildDestructureLeafMeta({
        descriptor: classifyDestructureLeafHost({ objectPattern: receiverPattern }),
        key: prop.node.key.name, adapter: receiverAdapter, resolvePure: options.resolvePure, parameterCallSites: callerSites,
      });
      return Object.fromEntries(['kind', 'object', 'key', 'placement', 'guardedAliasHint', 'guardOnly', 'fromFallback', 'parameterArgumentsOnly']
        .map(key => [key, meta?.[key] ?? null]));
    });
  }
  const fresh = parser.parseAndScope(source);
  const freshPattern = parser.pickPath(fresh, 'ObjectPattern');
  const freshCalls = parser.collectPaths(fresh, 'CallExpression', path => path.node.callee.name === 'read');
  const freshAdapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  function freshSites() {
    return freshCalls.length
      ? freshCalls.map(callPath => ({ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } })) : null;
  }
  checkDeep(`${ label } ignored planning preserves source metadata`, describe(pattern, adapter, options.parameterCallSites),
    describe(freshPattern, freshAdapter, freshSites));
  check(`${ label } ignored planning preserves admission`, !!planParameterInstanceExtraction(options),
    !!planParameterInstanceExtraction({ ...options, propPath: freshPattern.get('properties')[0], adapter: freshAdapter, parameterCallSites: freshSites }));
});

// Each moved slot retains the original annotation and property identity. A split declaration
// still passes one mutable receiver through the ordinary per-declarator extraction channel.
for (const type of ['string', 'number[]']) runBoth(`body capture split annotation/${ type }`,
  `export function read({ length, at, constructor }: ${ type }) { return [length, at, constructor]; }`,
  (parser, program, label) => {
    const pattern = parser.pickPath(program, 'ObjectPattern');
    const properties = pattern.get('properties');
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
    const plan = planParameterInstanceExtraction({
      propPath: properties[1], adapter,
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at' } : null,
    });
    const rendered = renderParameterInstanceCapture(plan, { receiverName: '_ref', unusedName: '_unused' });
    check(`${ label } one declarator per original slot`, rendered.declaration.declarations.length, 3);
    for (const [index, declaration] of rendered.declaration.declarations.entries()) {
      check(`${ label }/${ index } preserves source property`, declaration.id.properties[0], properties[index].node);
      check(`${ label }/${ index } preserves pattern annotation`, declaration.id.typeAnnotation, pattern.node.typeAnnotation);
      check(`${ label }/${ index } reuses the captured receiver`, declaration.init.name, '_ref');
    }
  });

// Slot mutation deopts only actual statics. A named user object remains an instance receiver
// whose generic dispatcher preserves own custom, undefined and null values.
for (const placement of ['static', 'prototype', null]) {
  let questions = 0;
  check(`mutated read/${ placement }`, isDeoptedStaticRead({
    meta: { kind: 'property', object: 'box', key: 'at', placement },
    adapter: { isMutatedStatic() { questions++; return true; } },
  }), placement === 'static');
  check(`mutated read/${ placement } asks only the static slot`, questions, placement === 'static' ? 1 : 0);
}

for (const [name, source, expected] of [
  ['array arm', 'const user = [4]; function read({ entries }) {} read(flag ? Object : user);', 'array/instance/entries'],
  ['string arm', 'const user = "ab"; function read({ entries }) {} read(flag ? Object : user);', null],
  ['own method arm', 'const user = { entries: own }; function read({ entries }) {} read(flag ? Object : user);', 'instance/entries'],
  ['unknown arm', 'function read({ entries }) {} read(flag ? Object : user);', null],
]) runBoth(`mixed static caller instance/${ name }`, source, (parser, program, label) => {
  const leafPatternPath = parser.pickPath(program, 'ObjectPattern');
  const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const plan = buildParameterArgumentSynthPlan({
    leafPatternPath, adapter,
    meta: { kind: 'property', object: null, key: 'entries', placement: 'static', guardedAliasHint: 'Object', guardOnly: true },
    parameterCallSites: () => [{ callPath, argIndex: 0, pairing: { args: callPath.node.arguments } }],
    resolvePure: meta => meta.object === 'Object' && meta.placement === 'static'
      ? { kind: 'static', entry: 'object/entries' }
      : meta.object === 'String' ? null : { kind: 'instance', entry: meta.object === 'Array' ? 'array/instance/entries' : 'instance/entries' },
  });
  const instance = plan?.targets?.find(target => target.tree?.entries?.some(entry => entry.child.kind === 'instance'));
  check(`${ label } actual instance arm`, instance?.tree.entries[0].child.entry ?? null, expected);
  check(`${ label } retains the static arm`, !!plan?.targets?.some(target => target.tree.entries[0].child.entry === 'object/entries'), true);
});

// The boolean memo belongs to one read-only question. A later rewrite opens a fresh question,
// and the read-position sink always enumerates source nodes even after a cached boolean ask.
runBoth('body capture argument census lifetime', 'function read(value) { return value; }', (parser, program, label) => {
  const fn = parser.pickPath(program, 'FunctionDeclaration').node;
  withCanonQuestion(() => {
    check(`${ label } initial answer`, referencesArgumentsObject(fn), false);
    check(`${ label } repeated answer`, referencesArgumentsObject(fn), false);
    const reads = [];
    check(`${ label } empty positional answer`, referencesArgumentsObject(fn, reads), false);
    check(`${ label } empty positional census`, reads.length, 0);
  });
  const first = { type: 'Identifier', name: 'arguments' };
  const second = { type: 'Identifier', name: 'arguments' };
  fn.body.body.push({ type: 'ExpressionStatement', expression: first }, { type: 'ExpressionStatement', expression: second });
  withCanonQuestion(() => {
    check(`${ label } after a source rewrite`, referencesArgumentsObject(fn), true);
    const reads = [];
    check(`${ label } positional answer`, referencesArgumentsObject(fn, reads), true);
    check(`${ label } positional census is complete`, reads.length, 2);
    check(`${ label } retains source identities`, reads.includes(first) && reads.includes(second), true);
  });
});

// Claimed siblings stay native when a still-live instance read captures the whole receiver.
// The plan only reports their ownership; ignoring the answer must not mutate source state.
runBoth('body capture retains prior-owned siblings', 'export function read({ keys, at } = { keys: imported }) {}', (parser, program, label) => {
  const pattern = parser.pickPath(program, 'ObjectPattern');
  const [owned, instance] = pattern.get('properties');
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const before = JSON.stringify(program.node);
  const options = {
    propPath: owned, adapter,
    isClaimedProp: path => path.node === owned.node,
    resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at' } : null,
  };
  const ignored = planParameterInstanceExtraction(options);
  check(`${ label } keeps the capture for its unclaimed sibling`, !!ignored, true);
  check(`${ label } reports the original owned node`, ignored?.claimedProperties[0], owned.node);
  check(`${ label } does not retire the unclaimed node`, ignored?.claimedProperties.includes(instance.node), false);
  check(`${ label } speculative ownership is read-only`, JSON.stringify(program.node), before);
  check(`${ label } all owned needs no body capture`, planParameterInstanceExtraction({ ...options, isClaimedProp: () => true }), null);
});

// The same witness can stop being a future read when its binding moves earlier or its role changes.
for (const edit of ['earlier declaration', 'literal role']) runBoth(`parameter dependency cached declaration role/${ edit }`,
  'export function read(probe = () => tail, pad, { at }, tail, other) { return at; }',
  (parser, program, label) => {
    const pattern = parser.pickPath(program, 'ObjectPattern');
    const fn = pattern.parentPath;
    const read = fn.node.params[0].right.body;
    function makeAdapter() {
      return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
        method: 'usage-pure', collectBindingReferences: parser.makeResolver().collectBindingReferences,
      });
    }
    const options = { propPath: pattern.get('properties')[0], adapter: makeAdapter(), resolvePure: () => ({ kind: 'instance', entry: 'instance/at' }) };
    check(`${ label } first query sees the future dependency`, withCanonQuestion(() => planParameterInstanceExtraction(options)), null);
    check(`${ label } same live dependency stays refused`, withCanonQuestion(() => planParameterInstanceExtraction(options)), null);
    if (edit === 'earlier declaration') {
      const earlier = fn.node.params.at(1);
      fn.node.params.copyWithin(1, 3, 4);
      fn.node.params[3] = earlier;
    } else {
      // In-place AST replacements can retain non-semantic fields from the old node.
      Object.assign(read, { type: parser.name === 'babel' ? 'StringLiteral' : 'Literal', value: 'tail' });
      check(`${ label } retained spelling does not make a literal a read`, read.name, 'tail');
    }
    program.scope.crawl();
    const currentPattern = parser.pickPath(program, 'ObjectPattern', path => path.node === pattern.node);
    if (edit === 'earlier declaration') {
      const currentRead = parser.pickPath(program, 'Identifier', path => path.node === read);
      check(`${ label } actual binding now initializes first`, bindingLoopAnchor(currentRead.scope.getBinding('tail')).decl, fn.node.params[1]);
    }
    check(`${ label } warm query serves the harmless parameter`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), true);
    check(`${ label } fresh query agrees`, !!withCanonQuestion(() => planParameterInstanceExtraction({
      ...options, propPath: currentPattern.get('properties')[0], adapter: makeAdapter(),
    })), true);
  });

runBoth('nested body capture caches a live moved-binding refusal',
  'export function read(probe = () => at, { row: { at } }) { return at; }',
  (parser, program, label) => {
    const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
      path => path.node.value?.name === 'at');
    const resolver = parser.makeResolver();
    let referenceQuestions = 0;
    const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method: 'usage-pure',
      collectBindingReferences(...args) {
        referenceQuestions++;
        return resolver.collectBindingReferences(...args);
      },
    });
    const options = { propPath: prop, adapter, resolvePure: () => ({ kind: 'instance', entry: 'instance/at' }) };
    check(`${ label } refuses the actual earlier parameter read`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), false);
    check(`${ label } the reference census ran`, referenceQuestions > 0, true);
    const coldQuestions = referenceQuestions;
    check(`${ label } the warm witness keeps its refusal`, !!withCanonQuestion(() => planParameterInstanceExtraction(options)), false);
    check(`${ label } the moved leaf keeps its cached witness`, referenceQuestions, coldQuestions);
  });

finish();
