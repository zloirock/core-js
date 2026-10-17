import { withCanonQuestion } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { ownEmittedPatternClaim } from '../../packages/core-js-polyfill-provider/detect-usage/own-output.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  applyNestedParamSynthPlan,
  buildNestedParamSynthPlan,
  buildParameterArgumentSynthPlan,
  planParameterInstanceExtraction,
  renderSynthTree,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
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
        hasBinding: ({ scope, name }) => !!scope?.getBinding(name),
        getBinding: ({ scope, name }) => scope?.getBinding(name),
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

// Rejected parameter shapes do not inspect a function body once per property. Accepted flat
// captures ask the parameter-reference canon once for the set of all moved bindings.
function countTypeReads(root, include = () => true) {
  let reads = 0;
  const seen = new WeakSet();
  function instrument(node) {
    if (!node || typeof node !== 'object' || seen.has(node)) return;
    seen.add(node);
    if (typeof node.type === 'string' && include(node)) {
      const { type } = node;
      Object.defineProperty(node, 'type', {
        configurable: true, enumerable: true,
        get() { reads++; return type; },
      });
    }
    for (const [key, child] of Object.entries(node)) if (!['type', 'loc', 'comments'].includes(key)) {
      if (Array.isArray(child)) child.forEach(instrument);
      else instrument(child);
    }
  }
  instrument(root);
  const baseline = reads;
  return () => reads - baseline;
}

const acceptedReads = new Map();
for (const size of [16, 32]) for (const shape of ['computed', 'default', 'repeated', 'accepted']) {
  const fields = Array.from({ length: size }, (unused, i) => `k${ i }: v${ i }`);
  const extra = { computed: '[key()]: last', default: 'tail: last = fallback', repeated: 'k0: last' }[shape];
  if (extra) fields.push(extra);
  runBoth(`parameter capture complexity/${ shape }/${ size }`,
    `export function read({ ${ fields.join(', ') } }) { return [${ fields.slice(0, size).map((unused, i) => `v${ i }`).join(', ') }]; }`,
    (parser, program, label) => {
      const fn = parser.pickPath(program, 'FunctionDeclaration');
      const pattern = parser.pickPath(program, 'ObjectPattern');
      const props = pattern.get('properties');
      const reads = countTypeReads(shape === 'accepted' ? fn.node : fn.node.body);
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
      let resolutions = 0;
      let sourceQuestions = 0;
      for (const prop of shape === 'accepted' ? [props[0]] : props) {
        const plan = planParameterInstanceExtraction({
          propPath: prop, adapter,
          parameterCallSites() { sourceQuestions++; return null; },
          resolvePure() { resolutions++; return { kind: 'instance', entry: 'instance/at' }; },
        });
        check(`${ label } admission`, !!plan, shape === 'accepted');
      }
      if (shape !== 'accepted') {
        check(`${ label } body is not revisited`, reads(), 0);
        check(`${ label } does not resolve refused leaves`, resolutions, 0);
        check(`${ label } does not ask refused caller sources`, sourceQuestions, 0);
      } else {
        checkTruthy(`${ label } performs a non-vacuous scan`, reads() >= size);
        checkTruthy(`${ label } resolves source facts with a linear, non-vacuous bound`, resolutions >= 1 && resolutions <= size * 2 + 1);
        check(`${ label } asks the source census once per property`, sourceQuestions, size);
        if (size === 16) acceptedReads.set(parser.name, reads());
        else checkTruthy(`${ label } doubling stays linear`, reads() <= acceptedReads.get(parser.name) * 2.6);
      }
    });
}

// Model the emitter's visit order: each successful plan is materialized before the next
// pattern leaf is planned. The outer argument identity stays stable, while its completed
// prefix becomes data and the untouched suffix remains the original source window.
function materializeArgumentTarget({ plan, argument, adapter, index, label }) {
  const target = plan?.targets?.[0];
  check(`${ label }/target ${ index } is its source slot`, target?.node, argument.elements[index]);
  const applied = applyNestedParamSynthPlan({
    plan,
    renderTree: (tree, context) => renderSynthTree(tree, {
      ...context,
      adapter,
      injectImport: (entry, hintName) => hintName ?? entry,
    }),
    replaceTarget(node, rendered) {
      if (argument.elements[index] !== node) return false;
      argument.elements[index] = rendered;
      return true;
    },
    skipSubtree() { /* empty */ },
  });
  check(`${ label }/target ${ index } materialized`, applied, true);
  check(`${ label }/target ${ index } is data`, argument.elements[index]?.type, 'ObjectExpression');
  return target?.tree?.entries?.[0]?.deferred === false;
}

const instanceWindowReads = new Map();
for (const size of [16, 32]) for (const inlineSpread of [false, true]) {
  const fields = Array.from({ length: size }, (unused, index) => `{ m${ index } }`);
  const receivers = Array.from({ length: size }, (unused, index) => `[[[${ index }]]]`);
  const supplied = inlineSpread ? `[...[${ receivers.join(', ') }]]` : `[${ receivers.join(', ') }]`;
  runBoth(`instance caller window complexity/${ inlineSpread ? 'inline spread' : 'plain' }/${ size }`,
    `function read([${ fields.join(', ') }]) {} read(${ supplied });`,
    (parser, program, label) => {
      const patterns = parser.collectPaths(program, 'ObjectPattern');
      const callPath = parser.pickPath(program, 'CallExpression', path => path.node.callee.name === 'read');
      const [callArgument] = callPath.node.arguments;
      const argument = inlineSpread ? callArgument.elements[0].argument : callArgument;
      const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
        method: 'usage-pure', isEntryAvailable: () => true,
      });
      // Numeric leaves are private to the original source suffix proof. The wider pattern
      // nodes also participate in older planner walks and would hide this analysis's class.
      // Sequential materialization below independently keeps the data-prefix route non-vacuous.
      const reads = countTypeReads(argument.elements, node => node.type === 'NumericLiteral'
        || node.type === 'Literal' && typeof node.value === 'number');
      let eager = 0;
      for (let index = 0; index < size; index++) {
        const key = `m${ index }`;
        const leafPatternPath = patterns.find(path => path.node.properties[0]?.key.name === key);
        const plan = buildParameterArgumentSynthPlan({
          leafPatternPath,
          adapter,
          meta: { kind: 'property', object: null, key, placement: null },
          resolvePure: meta => ({
            kind: 'instance', entry: `instance/${ meta.key }`, hintName: meta.key,
          }),
          parameterCallSites: () => [{
            callPath, argIndex: 0, pairing: { args: callPath.node.arguments },
          }],
        });
        eager += materializeArgumentTarget({ plan, argument, adapter, index, label });
      }
      check(`${ label }/every claim is eagerly materialized`, eager, size);
      const work = reads();
      checkTruthy(`${ label }/counter is non-vacuous`, work >= size * 2, `${ work } scoped type reads`);
      const key = `${ parser.name }/${ inlineSpread }`;
      if (size === 16) instanceWindowReads.set(key, work);
      else {
        const ratio = work / instanceWindowReads.get(key);
        checkTruthy(`${ label }/doubling stays linear`, ratio <= 2.6, `${ ratio.toFixed(2) }x scoped type reads`);
      }
    });
}

// A wide import-backed default is paired once in the planner's read-only question. Repeating
// a linear `.find` for each sibling would make the n16/32 ownership query quadratic.
const ownedReads = new Map();
for (const size of [16, 32]) runBoth(`body capture owned sibling complexity/${ size }`, `
  import Keys from '@core-js/pure/actual/object/keys';
  export function read({ ${ Array.from({ length: size }, (unused, i) => `k${ i }: v${ i }`).join(', ') }, at }
    = { ${ Array.from({ length: size }, (unused, i) => `k${ i }: Keys`).join(', ') } }) { return at; }
`, (parser, program, label) => {
  const fn = parser.pickPath(program, 'FunctionDeclaration');
  const pattern = parser.pickPath(program, 'ObjectPattern');
  const [prop] = pattern.get('properties');
  const reads = countTypeReads(fn.get('params')[0].get('right').node);
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  const tests = { isPureImportSource: source => source.startsWith('@core-js/pure/'), isOwnPassBinding: () => false };
  const plan = planParameterInstanceExtraction({
    propPath: prop, adapter,
    isClaimedProp: path => ownEmittedPatternClaim(path, tests),
    resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'instance/at' } : null,
  });
  check(`${ label } still serves the unknown incoming instance`, !!plan, true);
  check(`${ label } all import-backed siblings retain ownership`, plan?.claimedProperties.length, size);
  checkTruthy(`${ label } measures actual source work`, reads() > size * 2);
  if (size === 16) ownedReads.set(parser.name, reads());
  else checkTruthy(`${ label } doubling stays linear`, reads() <= ownedReads.get(parser.name) * 2.7);
});

// A real parameter dependency declines a whole flat pattern once. Later leaf visits validate
// that live witness without recollecting every moved binding or rescanning the function body.
const parameterBarrierReads = new Map();
for (const size of [16, 32]) runBoth(`parameter dependency decline complexity/${ size }`, `
  export function read(probe = () => tail, { ${ Array.from({ length: size }, (unused, index) => `k${ index }: v${ index }`).join(', ') } }, tail) {
    return [${ Array.from({ length: size }, (unused, index) => `v${ index }`).join(', ') }];
  }
`, (parser, program, label) => {
  const fn = parser.pickPath(program, 'FunctionDeclaration');
  const pattern = parser.pickPath(program, 'ObjectPattern');
  const properties = pattern.get('properties');
  const resolver = parser.makeResolver();
  let references = 0;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure',
    collectBindingReferences(...args) { references++; return resolver.collectBindingReferences(...args); },
  });
  const reads = countTypeReads(fn.node);
  const bodyReads = countTypeReads(fn.node.body);
  let firstReferences;
  let firstBodyReads;
  for (const [index, propPath] of properties.entries()) {
    check(`${ label }/declined ${ index }`, withCanonQuestion(() => planParameterInstanceExtraction({
      propPath, adapter, resolvePure: () => ({ kind: 'instance', entry: 'instance/at' }),
    })), null);
    if (index === 0) {
      firstReferences = references;
      firstBodyReads = bodyReads();
    } else {
      check(`${ label }/warm references ${ index }`, references, firstReferences);
      check(`${ label }/warm body reads ${ index }`, bodyReads(), firstBodyReads);
    }
  }
  check(`${ label }/cold reference questions`, references, size + 1);
  checkTruthy(`${ label }/real body index work`, firstBodyReads > 0);
  if (size === 16) parameterBarrierReads.set(parser.name, reads());
  else checkTruthy(`${ label }/doubling stays linear`, reads() <= parameterBarrierReads.get(parser.name) * 2.6);
});

// A wide write also keeps one identifier witness. Rechecking its old whole assignment would
// scan every target again on every leaf; the live child index keeps each warm validation constant.
for (const size of [16, 32]) runBoth(`parameter wide write witness/${ size }`, `
  let ${ Array.from({ length: size - 1 }, (unused, index) => `x${ index }`).join(', ') };
  export function read(probe = () => ({ ${ Array.from({ length: size - 1 }, (unused, index) => `x${ index }`).join(', ') }, tail } = source),
    { ${ Array.from({ length: size }, (unused, index) => `k${ index }: v${ index }`).join(', ') } }, tail) {}
`, (parser, program, label) => {
  const pattern = parser.pickPath(program, 'ObjectPattern', path => path.node.properties.some(prop => prop.value?.name === 'v0'));
  const write = parser.pickPath(program, 'AssignmentExpression');
  const slots = write.node.left.properties;
  let slotReads = 0;
  for (let index = 0; index < slots.length; index++) {
    const value = slots[index];
    Object.defineProperty(slots, index, { configurable: true, get() {
      slotReads++;
      return value;
    } });
  }
  const resolver = parser.makeResolver();
  let references = 0;
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method: 'usage-pure',
    collectBindingReferences(...args) { references++; return resolver.collectBindingReferences(...args); },
  });
  let coldSlots;
  let coldReferences;
  for (const [index, propPath] of pattern.get('properties').entries()) {
    check(`${ label }/refuses ${ index }`, withCanonQuestion(() => planParameterInstanceExtraction({
      propPath, adapter, resolvePure: () => ({ kind: 'instance', entry: 'instance/at' }),
    })), null);
    if (index === 0) {
      coldSlots = slotReads;
      coldReferences = references;
    } else {
      check(`${ label }/warm target lookup ${ index }`, slotReads - coldSlots, index);
      check(`${ label }/warm reference questions ${ index }`, references, coldReferences);
    }
  }
});

finish();
