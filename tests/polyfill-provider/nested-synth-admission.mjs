// A whole mirror owns disabled leaves, relocated source slots and nested dispatch together.
import { buildNestedParamSynthPlan, renderSynthTree } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { noteRelocatedHeadName } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('nested-synth-admission');

function resolvePure(meta) {
  if (meta.kind === 'global' && meta.name === 'globalThis') return { kind: 'global', entry: 'global-this' };
  if (meta.object === 'Array' && meta.placement === 'static' && ['from', 'of'].includes(meta.key)) {
    return { kind: 'static', entry: `array/${ meta.key }` };
  }
  return meta.key === 'at' ? { kind: 'instance', entry: 'array/instance/at' } : null;
}

for (const selected of [false, true]) for (const disabledFirst of [false, true]) for (const fallback of [false, true]) {
  const keys = disabledFirst ? 'of, from' : 'from, of';
  runBoth(`disabled static/${ selected }/${ disabledFirst }/${ fallback }`,
    `export function read({ Array: { ${ keys } } } = ${ selected ? 'flag ? globalThis : own' : 'globalThis' }) {}`,
    (parser, program, label) => {
      const pattern = parser.pickPath(program, 'ObjectPattern');
      const disabled = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property',
        item => item.node.key.name === 'of').node;
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
      const before = JSON.stringify(program.node);
      const plan = buildNestedParamSynthPlan({
        leafPatternPath: pattern, adapter, resolvePure,
        meta: { object: 'globalThis', key: 'Array', placement: 'static', fromFallback: fallback },
        isDisabledProp: prop => prop === disabled,
      });
      check(`${ label } keeps the ordinary extraction or mirrors the selection`, !!plan?.targets?.length, selected);
      check(`${ label } keeps the source tree`, JSON.stringify(program.node), before);
      if (!selected) return;
      const { entries } = plan.targets[0].tree.entries[0].child;
      checkDeep(`${ label } keeps source order`, entries.map(entry => entry.key), keys.split(', '));
      check(`${ label } active slot earns the mirror`, entries.find(entry => entry.key === 'from').child.kind, 'polyfill');
      check(`${ label } disabled slot stays raw`, entries.find(entry => entry.key === 'of').child.bailed, true);
      check(`${ label } disabled slot is never claimed`, plan.targets[0].claimedProperties.includes(disabled), false);
      const imports = [];
      const rendered = renderSynthTree(plan.targets[0].tree, {
        receiverName: 'globalThis', receiverIsProxy: true, adapter,
        injectImport: entry => { imports.push(entry); return 'imported'; },
        resolveGlobalPolyfill: name => resolvePure({ kind: 'global', name }),
      });
      checkDeep(`${ label } imports only the active slot and receiver`, imports.sort(), ['array/from', 'global-this']);
      check(`${ label } keeps both properties`, rendered.properties[0].value.properties.length, 2);
    });
}

for (const marked of [false, true]) for (const fallback of [false, true]) {
  runBoth(`relocated loop/${ marked }/${ fallback }`,
    'for (const held of [flag ? globalThis : own]) { const { Array: { prototype: { at }, of } } = held; use(at, of); }',
    (parser, program, label) => {
      const loop = parser.pickPath(program, 'ForOfStatement');
      if (marked) noteRelocatedHeadName(loop.node, 'held');
      const pattern = parser.pickPath(program, 'ObjectPattern');
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure', resolvePure });
      const before = JSON.stringify(program.node);
      const plan = buildNestedParamSynthPlan({
        leafPatternPath: pattern, adapter, resolvePure,
        meta: { object: 'globalThis', key: 'Array', placement: 'static', fromFallback: fallback },
      });
      const accepted = marked && fallback;
      check(`${ label } only this pass's fallback head owns the element`, !!plan?.targets?.length, accepted);
      check(`${ label } query leaves source intact`, JSON.stringify(program.node), before);
      if (!accepted) return;
      check(`${ label } keeps the loop as native host`, plan.host.node, loop.node);
      check(`${ label } targets the live selected arm`, plan.targets[0].node, loop.node.right.elements[0].consequent);
      const { entries } = plan.targets[0].tree.entries[0].child;
      check(`${ label } nested instance keeps its resolved dispatch`,
        entries[0].child.entries[0].child.entry, 'array/instance/at');
      check(`${ label } static sibling keeps its own entry`, entries[1].child.entry, 'array/of');
      const imports = [];
      renderSynthTree(plan.targets[0].tree, {
        receiverName: 'globalThis', receiverIsProxy: true, adapter,
        injectImport: entry => { imports.push(entry); return 'imported'; },
        resolveGlobalPolyfill: name => resolvePure({ kind: 'global', name }),
      });
      checkDeep(`${ label } dispatch renders without another claim visit`, imports.sort(),
        ['array/instance/at', 'array/of', 'global-this']);
    });
}

finish();
