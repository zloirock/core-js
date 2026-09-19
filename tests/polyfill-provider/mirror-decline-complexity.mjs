import { buildNestedParamSynthPlan } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, finish, runBoth } = createChecker('mirror-decline-complexity');

// Count resolver work instead of timing a tiny plan. Every leaf asks about the same wide
// pattern; an unreadable final key makes the expensive mirror decline after visiting its keys.
for (const size of [8, 32, 80]) for (const mixed of [false, true]) {
  const properties = Array.from({ length: size }, (unused, i) => `k${ i }: x${ i }`).join(', ');
  const receiver = mixed ? 'flag ? globalThis : own' : 'globalThis';
  runBoth(`declined mirror/${ size }/${ mixed }`,
    `function f({ Array: { ${ properties }, [key()]: last } } = ${ receiver }) {}`,
    (parser, program, label) => {
      const leafPatternPath = parser.pickPath(program, 'ObjectPattern', p => p.node.properties.some(prop => prop.computed));
      const adapter = {
        method: 'usage-pure',
        hasBinding: (scope, name) => !!scope?.getBinding(name),
        getBinding: (scope, name) => scope?.getBinding(name),
        isStringLiteral: node => node.type === 'StringLiteral' || (node.type === 'Literal' && typeof node.value === 'string'),
        getStringValue: node => node.value,
      };
      let calls = 0;
      let firstCalls;
      for (let i = 0; i < size; i++) {
        const plan = buildNestedParamSynthPlan({
          leafPatternPath, adapter, meta: { object: 'Array', key: `k${ i }`, placement: 'static' },
          resolvePure(meta) {
            calls++;
            return meta.kind === 'property' && meta.key.startsWith('k')
              ? { kind: 'static', entry: meta.key, hintName: meta.key } : null;
          },
        });
        check(`${ label }/declined ${ i }`, mixed ? plan?.bail : plan, mixed ? true : null);
        if (i === 0) firstCalls = calls;
        else check(`${ label }/memoized ${ i }`, calls, firstCalls);
      }
      checkTruthy(`${ label }/linear, non-vacuous work`, calls >= size && calls <= size + 2);
    });
}
finish();
