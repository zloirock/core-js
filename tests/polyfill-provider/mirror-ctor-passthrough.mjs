import { buildNestedParamSynthPlan, buildParameterArgumentSynthPlan } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createChecker } from './harness.mjs';

const { check, finish, runBoth } = createChecker('mirror-ctor-passthrough');

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
        hasBinding: (scope, name) => !!scope?.getBinding(name),
        getBinding: (scope, name) => scope?.getBinding(name),
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
        hasBinding: (scope, name) => !!scope?.getBinding(name),
        getBinding: (scope, name) => scope?.getBinding(name),
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

finish();
