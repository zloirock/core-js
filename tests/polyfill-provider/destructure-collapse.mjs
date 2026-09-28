// Decision tests for the destructure pieces the bindings stopped owning: the collapsed
// spelling of a proxy-receiver plan, the memo re-read target, the catch-clause relocation
// gate and the own-output sentinel census. All four were written twice - once per binding -
// and a fixture only proves the two agreed on the shapes the corpus happens to carry
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { planMemoReadTarget } from '../../packages/core-js-polyfill-provider/detect-usage/members.js';
import { buildNestedDestructurePlan, planCatchClauseExtraction } from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { destructurePropLeafMeta, residualInitRunsEffects, resolvePositionalElementSlot } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { sentinelAlreadyProcessed } from '../../packages/core-js-polyfill-provider/detect-usage/own-output.js';
import { HOST_SLOT, hostSlot, renderProxyReceiverPlan } from '../../packages/core-js-polyfill-provider/render.js';
import { planArrayWrapperCapture } from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { buildOffsetToLine } from '../../packages/core-js-polyfill-provider/helpers/source-scan.js';
import { isPropertyNode, patternFullyConsumed, walkAstNodes } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, checkTruthy, finish, runBoth } = createChecker('destructure-collapse');

for (const [source, captured] of [
  ['const [{ a, y: { at } }] = [{ a: effect(), y: [1, 2] }, effect()];', true],
  ['const [{ y: { at } }] = [globalThis];', false],
]) runBoth('array plan/nested literal and native global boundary', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const arrayProp = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.key.name === 'at');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    arrayProp,
    adapter,
    resolvePure: meta => meta.kind === 'property' && meta.key === 'at'
      ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
  });
  check(`${ label }/admission`, !!plan?.array.capture, captured);
  if (captured) check(`${ label }/statement placement`, plan.array.splitDeclaration, true);
});

for (const [pattern, key] of [
  ['{ y: { at } = [] }', 'at'],
  ['{ y: { ["at"]: at } }', 'at'],
  ['{ a, y: { at } }', 'at'],
  ['{ flat: { at } = [] }', 'flat'],
]) for (const declaration of [
  `const [${ pattern }] = [receiver, effect()];`,
  `export const [${ pattern }] = [receiver, effect()];`,
  `const before = effect(), [${ pattern }] = [receiver, effect()], after = effect();`,
  `for (const [${ pattern }] = [receiver, effect()]; test;) {}`,
]) runBoth('array plan/declined nested read keeps the object route', declaration, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const arrayProp = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => (item.node.key.name ?? item.node.key.value) === key);
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    arrayProp,
    adapter,
    resolvePure: meta => meta.kind === 'property' && meta.key === key
      ? { kind: 'instance', entry: `actual/instance/${ key }`, hintName: key } : null,
  });
  checkTruthy(`${ label }/captured`, !!plan?.array.capture);
  check(`${ label }/original pattern`, plan?.pattern, arrayPath.node.id);
  check(`${ label }/one RHS evaluation`, plan?.array.capture?.init, arrayPath.node.init);
  check(`${ label }/source unchanged`, JSON.stringify(arrayPath.node), original);
});

for (const [source, kind, captured] of [
  ['const [{ at, ...rest }] = [source];', 'instance', true],
  ['const [{ [(effect(), "at")]: at }] = [source];', 'instance', true],
  ['const [{ [(effect(), "from")]: from }] = [Array];', 'static', true],
  ['const [{ from, ...rest }] = [Array];', 'static', false],
  ['const [{ at }] = [source];', 'instance', false],
  ['const [{ y: { at } }, other] = [make(), effect()];', 'instance', true],
  ['const [{ y: { at } }] = [{ y: make() }];', 'instance', false],
  ['const [{ at }, ...rest] = [source];', 'instance', false],
  ['const [{ at, ...rest }] = [source, ...others];', 'instance', false],
  ['for (const [{ at }] = [make()]; test;) {}', 'instance', true],
  ['for (const [{ at, values }] = [source, effect()]; test;) {}', 'instance', true],
  ['for (const [, { y: { at } }] = [effect(), source]; test;) {}', 'instance', true],
  ['for (const [[{ w: { values }, y: { at } }]] = [[source], effect()]; test;) {}', 'instance', true],
  ['for (const [{ y: { at } }, { other }] = [source, effect()]; test;) {}', 'instance', true],
  ['for (const [{ y: { at } }] = [source, source = other]; test;) {}', 'instance', true],
  ['export const [{ at, ...rest }] = [source];', 'instance', true],
]) runBoth('array plan/native capture phase', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const propPath = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({ arrayPath, adapter, captureFor: { prop: propPath.node, pattern: propPath.parentPath.node, kind } });
  check(`${ label } admission`, !!plan, captured);
  if (plan) {
    check(`${ label } original array pattern`, plan.array.capture.pattern, arrayPath.node.id);
    check(`${ label } original source`, plan.array.capture.init, arrayPath.node.init);
    checkDeep(`${ label } native children retain claims`, plan.extractions, []);
  }
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

for (const [pattern, init, names, sentinels] of [
  ['[{ from, ...rest }]', '[Array]', ['from'], 1],
  ['[{ "from": from, ...rest }, other]', '[Array, {}]', ['from'], 1],
  ['[{ [Symbol.iterator]: iterator, of, ...rest }]', '[Array]', ['of'], 1],
  ['[{ from = fallback(), ...rest }]', '[Array]', ['from'], 1],
  ['[{ from, other }, tail]', '[Array, 1]', ['from'], 0],
  // The singleton without rest belongs to the ordinary object flatten plan.
  ['[{ from, other }]', '[Array]', [], 0],
  ['[{ at, ...rest }]', '[source]', [], 0],
]) runBoth(`array plan/static exclusions ${ pattern }`, `const ${ pattern } = ${ init };`, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['from', 'of', 'at'].includes(meta.key) ? {
      kind: meta.object === 'Array' ? 'static' : 'instance',
      entry: `actual/array/${ meta.key }`,
      hintName: meta.key,
    } : null,
  });
  checkDeep(`${ label } static claims`, plan?.extractions.map(extraction => extraction.localName) ?? [], names);
  check(`${ label } rest exclusions`, plan?.array.elements.flatMap(element => element.children ?? [])
    .filter(child => child.sentinel).length ?? 0, sentinels);
  if (plan) {
    check(`${ label } original iteration retained`, !!plan.array.capture, false);
    check(`${ label } statics need no receiver memo`, plan.array.memos.length, 0);
    check(`${ label } import owns dead default`, plan.extractions.some(extraction => extraction.defaultNode), false);
  }
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

for (const [source, lifted] of [
  ['const [{ Object: { keys, ...rest } }] = [globalThis];', 0],
  ['const [{ Object: { keys, ...rest } }] = [(effect(), globalThis)];', 1],
  ['const [{ Object: { keys = fallback(), ...rest } }] = [(effect(), globalThis)];', 1],
  ['export const [{ Object: { keys, ...rest } }] = [globalThis];', 0],
  ['const before = effect(), [{ Object: { keys, ...rest } }] = [globalThis], after = effect();', 0],
]) runBoth('array plan/nested static exclusions', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.object === 'Object' && meta.key === 'keys'
      ? { kind: 'static', entry: 'actual/object/keys', hintName: 'keys' } : null,
  });
  checkDeep(`${ label } static leaf`, plan?.extractions.map(extraction => extraction.localName), ['keys']);
  check(`${ label } prefix owns effects`, plan?.array.leading.length, lifted);
  check(`${ label } source hop remains`, plan?.array.residualPattern.elements[0].properties[0].key.name, 'Object');
  check(`${ label } rest keeps its exclusion`, plan?.array.elements[0].children.at(0).sentinel, true);
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

for (const [pattern, init, admitted] of [
  ['[{ w: { values }, y: { at } }]', '[source]', true],
  ['[{ w: { values }, y: { at } }]', '[source, effect()]', true],
  ['[, { w: { values }, y: { at } }]', '[effect(), source]', true],
  ['[{ w: { values }, y: { at } }, tail]', '[source, 1]', 'captured-read'],
  ['[head, { w: { values }, y: { at } }]', '[1, source]', 'captured-read'],
  ['[{ w: { values }, y: { at } }]', '[(source)]', true],
  ['[{ w: { values }, y: { at } }]', '[holder.source]', 'captured-read'],
  ['[{ w: { values }, y: { at } }]', '[source, ...others]', 'capture'],
  ['[{ Array: { prototype: { at } } }]', '[globalThis, ...others]', 'captured-read'],
  ['[{ w: { values, includes }, y: { at } }]', '[source]', 'captured-read'],
  ['[{ w: { values }, y: { at }, other }]', '[source]', 'captured-read'],
]) runBoth('array plan/independent nested reads', `const ${ pattern } = ${ init };`, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['values', 'at', 'includes'].includes(meta.key)
      ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ label } admission`, !!plan, !!admitted);
  if (admitted === 'captured-read' && plan) {
    check(`${ label } capture owns the source`, plan.array.capture.init, arrayPath.node.init);
    check(`${ label } reads stay in the captured element`, plan.array.elements.some(element => element.kind === 'rebuilt'), true);
    check(`${ label } no native re-detection`, !!plan.array.normalize, false);
  } else if (admitted === 'capture' && plan) {
    check(`${ label } spread keeps the native iterator`, plan.array.capture.init, arrayPath.node.init);
    check(`${ label } captured pattern is revisited`, plan.array.normalize, true);
  } else if (admitted && plan) {
    checkDeep(`${ label } source order`, plan.extractions.map(extraction => extraction.localName), ['values', 'at']);
    checkDeep(`${ label } separate hop receivers`, plan.extractions.map(extraction => extraction.receiver.property.name), ['w', 'y']);
    check(`${ label } compact host`, plan.array.dropsResidual, true);
    check(`${ label } no receiver capture`, !!plan.array.capture, false);
  }
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

runBoth(
  'array plan/nested same-frame receiver write',
  'let source = first; const [{ w: { values }, y: { at } }] = [source, source = second];',
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({ arrayPath, adapter, resolvePure: meta => ({ kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key }) });
    check(`${ label } original receiver needs capture`, plan?.array.capture?.init, arrayPath.node.init);
    checkDeep(`${ label } captured element owns both reads`, plan?.extractions.map(extraction => extraction.localName), ['values', 'at']);
  },
);

for (const [init, capture] of [['[source, effect()]', true], ['[source]', false]]) runBoth(
  'array plan/nested reads beside sibling declarators',
  `const before = first(), [{ w: { values }, y: { at } }] = ${ init }, after = last();`,
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => ['values', 'at'].includes(meta.key)
        ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
    });
    checkTruthy(`${ label } owns the original host`, plan);
    if (!plan) return;
    check(`${ label } keeps sibling declarators in order`, plan.array.inDeclaration, true);
    check(`${ label } captures effectful neighbouring element`, !!plan.array.capture, capture);
    checkDeep(`${ label } independent claims`, plan.extractions.map(extraction => extraction.localName), ['values', 'at']);
  },
);

runBoth(
  'array plan/captured surface after a discarded effect',
  'const [, { Array: { prototype: { at } } }] = [effect(), (effect(), globalThis)];',
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
    });
    check(`${ label } captures the whole source`, plan?.array.capture?.init, arrayPath.node.init);
    checkDeep(`${ label } reads from the second element`, plan?.array.elements.filter(item => item.kind === 'rebuilt')
      .map(item => item.index), [1]);
    checkDeep(`${ label } claims the instance read`, plan?.extractions.map(read => read.localName), ['at']);
  },
);

for (const [source, positions, reads] of [
  ['const [[{ y: { at } }]] = [[receiver]];', [[0, 0]], ['at']],
  ['const [[{ w: { values }, y: { at } }, tail]] = [[receiver, effect()]];', [[0, 0], [0, 1]], ['values', 'at']],
  ['const [[{ y: { toSpliced } }]] = [...[[...[receiver]]]];', [[0, 0]], ['toSpliced']],
]) runBoth('array plan/nested literal capture', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => reads.includes(meta.key)
      ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ label } captures the original nested source`, plan?.array.capture?.init, arrayPath.node.init);
  checkDeep(`${ label } captured positions`, plan?.array.capture?.elements.map(item => item.path), positions);
  checkDeep(`${ label } ordered reads`, plan?.extractions.map(read => read.localName), reads);
});

for (const source of [
  'const [{ trunc }] = [Math];',
  'export const [{ from }] = [globalThis.Array];',
  'const outer = [Array]; const alias = outer; const [{ from }] = alias;',
  'export const source = [Array]; export const [{ from }] = source;',
  'const make = value => [value]; const [{ raw }] = make(String);',
  'const wrapper = [[Array]]; const [[{ from }]] = wrapper;',
]) runBoth('array plan/captured singleton static', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['trunc', 'from', 'raw'].includes(meta.key)
      ? { kind: 'static', entry: `actual/${ meta.object.toLowerCase() }/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ label } captures the source`, plan?.array.capture?.init, arrayPath.node.init);
  check(`${ label } preserves the native read`, plan?.array.elements.at(0).children.at(0).sentinel, true);
  check(`${ label } exported placement`, !!plan?.array.inDeclaration, source.startsWith('export'));
});

runBoth(
  'array plan/optional call retains its native selection',
  'const make = () => [Array]; const [{ of }] = make?.();',
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.key === 'of'
        ? { kind: 'static', entry: 'actual/array/of', hintName: 'of' } : null,
    });
    check(`${ label } optional call runs before the binding`, plan?.array.capture?.init, arrayPath.node.init);
    check(`${ label } native property read retained`, plan?.array.elements[0].children.at(0).nativeStatic, true);
  },
);

for (const source of [
  'const rows = [Object, source]; let keys, at; ([{ keys }, { at }] = rows);',
  'const source = { get native() { return 1; } }; const rows = [Object, source]; let keys, native; ([{ keys }, { native }] = rows);',
  'const make = () => [Object, 1]; let keys, tail; ([{ keys }, tail] = make());',
]) runBoth('array plan/positional static retains its native selection', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'AssignmentExpression', item => item.node.left.type === 'ArrayPattern');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'keys' ? { kind: 'static', entry: 'actual/object/keys', hintName: 'keys' }
      : meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
  });
  checkTruthy(`${ label } owns native positions`, plan?.array.positional);
  check(`${ label } first write is static`, plan?.extractions[0].kind, 'static');
  checkTruthy(`${ label } retains static native read`, plan?.array.elements[0].children.at(0).nativeStatic);
  check(`${ label } keeps original receiver`, plan?.array.capture.init, arrayPath.node.right);
});

for (const source of [
  'const held = { k: [Math] }; const { k: [{ sign }, tail] } = held;',
  'const held = { k: [Math] }; export const { k: [{ sign }, tail] } = held;',
]) runBoth('array plan/static under a captured object key', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'sign' ? { kind: 'static', entry: 'actual/math/sign', hintName: 'sign' } : null,
  });
  checkTruthy(`${ label } retains the key selection`, plan?.array.objectCapture);
  checkTruthy(`${ label } native static getter`, plan?.array.elements[0].children.at(0).nativeStatic);
  check(`${ label } keeps the neighbouring binding`, plan?.array.elements[1].node.name, 'tail');
});

runBoth(
  'array plan/conditional neighbour retains its original mirror',
  'const [{ at }, { from }] = [source, pick ? Array : other];',
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator');
    const original = JSON.stringify(arrayPath.node);
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.key === 'from' ? { kind: 'static', entry: 'actual/array/from', hintName: 'from' }
        : meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
    });
    checkTruthy(`${ label } capture owns both positions`, plan?.array.capture);
    check(`${ label } mirror still names the original property`, plan?.array.mirrors[0].propPath.node.key.name, 'from');
    checkDeep(`${ label } instance decision retained`, plan?.extractions.map(item => item.localName), ['at']);
    check(`${ label } planning does not apply the mirror`, JSON.stringify(arrayPath.node), original);
  },
);

for (const source of [
  'const [{ native }, { from }] = [source, pick ? Array : other];',
  'let native, from; ([{ native }, { from }] = [source, pick ? Array : other]);',
]) runBoth('array plan/mirror alone preserves native neighbour order', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(
    program,
    source.startsWith('const') ? 'VariableDeclarator' : 'AssignmentExpression',
    item => (item.node.id ?? item.node.left)?.type === 'ArrayPattern',
  );
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'from' ? { kind: 'static', entry: 'actual/array/from', hintName: 'from' } : null,
  });
  checkTruthy(`${ label } capture remains despite no independent extraction`, plan?.array.capture);
  checkDeep(`${ label } native reads remain native`, plan?.extractions, []);
  check(`${ label } original mirror retained`, plan?.array.mirrors.length, 1);
});

for (const source of [
  'const [{ from, at }] = [pick ? Array : user];',
  'let from, at; ([{ from, at }] = [pick ? Array : user]);',
]) runBoth('array plan/mirror and instance share the original receiver decision', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(
    program,
    source.startsWith('const') ? 'VariableDeclarator' : 'AssignmentExpression',
    item => (item.node.id ?? item.node.left)?.type === 'ArrayPattern',
  );
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'from' ? { kind: 'static', entry: 'actual/array/from', hintName: 'from' }
      : meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
  });
  checkTruthy(`${ label } capture owns original array`, plan?.array.capture);
  check(`${ label } original branch mirror`, plan?.array.mirrors.length, 1);
  checkDeep(`${ label } original instance decision`, plan?.extractions.map(item => item.localName), ['at']);
});

runBoth(
  'array plan/sole static mirror needs no capture',
  'const [{ from }] = [pick ? Array : user];',
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.key === 'from'
        ? { kind: 'static', entry: 'actual/array/from', hintName: 'from' } : null,
    });
    check(`${ label } mirror preserves the sole read without moving it`, plan, null);
  },
);

for (const receiver of ['pick ? globalThis : user', 'user || globalThis', 'pick && globalThis']) {
  runBoth(
    'array plan/selected nested static stays with its branch mirror',
    `const [, { Array: { from } }] = [0, ${ receiver }];`,
    (parser, program, label) => {
      const arrayPath = parser.pickPath(program, 'VariableDeclarator');
      const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
      const plan = buildNestedDestructurePlan({
        arrayPath,
        adapter,
        resolvePure: meta => meta.key === 'from'
          ? { kind: 'static', entry: 'actual/array/from', hintName: 'from' } : null,
      });
      check(`${ label } no unconditional extraction from one branch`, plan, null);
    },
  );
}

runBoth(
  'array plan/positional namespace uses a proven pure anchor',
  'const held = [globalThis]; const [{ Reflect: { ownKeys } }] = held;',
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.kind === 'global' && meta.name === 'Reflect'
        ? { kind: 'global', entry: 'actual/reflect/namespace', hintName: 'Reflect' }
        : meta.key === 'ownKeys' ? { kind: 'static', entry: 'actual/reflect/own-keys', hintName: 'ownKeys' } : null,
    });
    check(`${ label } common anchor`, plan?.array.elements[0].anchorPure.entry, 'actual/reflect/namespace');
    check(`${ label } capture still evaluates original alias`, plan?.array.capture.init, arrayPath.node.init);
  },
);

for (const source of [
  'for (const [{ Array: { of }, ...rest }] = [(effect(), globalThis)]; false;) {}',
  'if (ok) var [{ Array: { of }, ...rest }] = [(effect(), globalThis)];',
  'export const [{ Array: { of }, ...rest }] = [(effect(), globalThis)];',
  'const before = effect(), [{ Array: { of }, ...rest }] = [globalThis], after = of(1);',
  'let of, rest, tail; ([{ of, ...rest }, tail] = [Array, 1]);',
  'let keys, rest, saved; ([{ Object: { keys }, ...rest }] = [saved = (effect(), globalThis)]);',
  'let fromAsync, rest; ([{ Array: { fromAsync }, ...rest }] = [(effect(), globalThis)]);',
]) runBoth('array plan/static rest uses the retained object decision', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'AssignmentExpression', item => item.node.left.type === 'ArrayPattern')
    ?? parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.kind === 'global' && meta.name === 'Array'
      ? { kind: 'global', entry: 'actual/array', hintName: 'Array' }
      : ['of', 'keys', 'fromAsync'].includes(meta.key)
        ? { kind: 'static', entry: `actual/${ meta.object.toLowerCase() }/${ meta.key }`, hintName: meta.key } : null,
  });
  checkTruthy(`${ label } captures the original array`, plan?.array.capture);
  checkTruthy(`${ label } owns the rest source`, plan?.array.elements[0].retained);
  check(`${ label } initializer remains in place`, plan?.array.capture?.init, arrayPath.node.right ?? arrayPath.node.init);
});

for (const [source, captured] of [
  ['const [{ [(effect(), "at")]: at }] = [Array.prototype, ...tail];', true],
  ['const [{ [key]: at }] = [Array.prototype, ...tail];', false],
  ['const [{ [(effect(), "at")]: at }] = [...tail, Array.prototype];', false],
]) runBoth('array plan/effectful folded key', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'at'
      ? { kind: 'instance', entry: 'actual/array/instance/at', hintName: 'at' } : null,
  });
  check(`${ label } captures before key`, !!plan?.array.capturedKey, captured);
  if (captured) {
    check(`${ label } preserves native key and read`, plan.array.elements[0].children.at(0).sentinel, true);
    checkDeep(`${ label } pure binding`, plan.extractions.map(read => read.localName), ['at']);
  }
});

for (const source of [
  'const wrapper = [globalThis]; const [{ Object: { fromEntries } }] = wrapper;',
  'const make = value => [value]; export const [{ Object: { fromEntries } }] = make(globalThis);',
  'const list = [{ P: Promise }]; const [{ P: { race } }] = list;',
  'const wrapper = [(() => Array)()]; const [{ from }] = wrapper;',
  'const held = [Math]; const [{ sign } = {}] = held;',
  'const make = () => [Math]; const [{ sign } = {}] = make();',
  'const make = () => [Math]; const [{ sign } = {}] = make?.();',
]) runBoth('array plan/proven nested static alias', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['fromEntries', 'race', 'from', 'sign'].includes(meta.key)
      ? { kind: 'static', entry: `actual/${ meta.object.toLowerCase() }/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ label } preserves native iteration and reads`, plan?.array.nativeStatic, true);
  checkDeep(
    `${ label } static extraction`,
    plan?.extractions.map(read => read.localName),
    [source.includes('race') ? 'race' : source.includes('(() => Array)') ? 'from'
      : source.includes('sign') ? 'sign' : 'fromEntries'],
  );
});

runBoth(
  'array plan/native static cannot cross a missing constructor',
  'const wrapper = [globalThis]; const [{ Promise: { resolve } }] = wrapper;',
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
    const original = JSON.stringify(arrayPath.node);
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.kind === 'global' && meta.name === 'Promise'
        ? { kind: 'global', entry: 'actual/promise', hintName: 'Promise' }
        : meta.key === 'resolve' ? { kind: 'static', entry: 'actual/promise/resolve', hintName: 'resolve' } : null,
    });
    check(`${ label } no raw native hop`, !!plan?.array.nativeStatic, false);
    check(`${ label } original remains available to mirror`, JSON.stringify(arrayPath.node), original);
  },
);

for (const source of [
  'const wrapped = [{ k: [Object] }]; const [{ k: [{ is }] }] = wrapped;',
  'const wrapped = [{ k: [Object] }]; export const [{ k: [{ is }] }] = wrapped;',
]) runBoth('array plan/nested static retains native array iterations', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'is'
      ? { kind: 'static', entry: 'actual/object/is', hintName: 'is' } : null,
  });
  check(`${ label } keeps the whole native pattern`, plan?.array.nativeStatic, true);
  check(`${ label } native source pattern`, plan?.pattern, arrayPath.node.id);
  check(`${ label } export starts at pure binding`, plan?.array.exportFrom, 1);
  checkDeep(`${ label } pure static binding`, plan?.extractions.map(read => read.localName), ['is']);
});

for (const source of [
  'const { w: [{ at }] } = { w: [[1]] };',
  'const { w: [{ at: method }] } = { w: [[1, 2]] };',
  'const key = "w"; const { [key]: [{ at }] } = { w: [[1]] };',
  'const { [(effect(), "w")]: [{ at }] } = { w: [[1]] };',
  'let at; ({ w: [{ at }] } = { w: [[1]] });',
  'let at; ({ [(effect(), "w")]: [{ at }] } = { w: [[1]] });',
  'let at; if (test) ({ w: [{ at }] } = { w: [[1]] });',
]) runBoth('array plan/object key selects native array', source, (parser, program, label) => {
  const assignment = source.startsWith('let ');
  const arrayPath = parser.pickPath(
    program,
    assignment ? 'AssignmentExpression' : 'VariableDeclarator',
    item => (assignment ? item.node.left : item.node.id).type === 'ObjectPattern',
  );
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'at'
      ? { kind: 'instance', entry: 'actual/array/instance/at', hintName: 'at' } : null,
  });
  check(`${ label } captures the object key`, plan?.array.objectCapture?.leafPattern, (assignment ? arrayPath.node.left : arrayPath.node.id).properties[0].value);
  check(`${ label } captures the selected array`, plan?.array.capture?.init, (assignment ? arrayPath.node.right : arrayPath.node.init).properties[0].value);
  checkDeep(`${ label } claims one method read`, plan?.extractions.map(read => read.localName), [source.includes('method') ? 'method' : 'at']);
});

for (const source of [
  'const { [key]: [{ at }] } = { w: [[1]] };',
  'const { absent: [{ at }] } = { w: [[1]] };',
  'const { w: [{ at }], other } = { w: [[1]], other: 2 };',
  'const { w: [{ at } = {}] } = { w: [[1]] };',
  'const { w: [{ at }, ...rest] } = { w: [[1]] };',
  // a claim beside the hop belongs to its own route, whichever claim asks first
  'const { keys, w: [{ at }] } = source;',
]) runBoth('array plan/object key capture boundary', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({ arrayPath, adapter, resolvePure: () => ({ kind: 'instance', entry: 'actual/array/instance/at', hintName: 'at' }) });
  check(`${ label } no speculative capture`, plan, null);
  check(`${ label } original host untouched`, JSON.stringify(arrayPath.node), original);
});

// A key the literal cannot pair (an opaque source, a spread that may override it) keeps the keyed
// level native and renames only the element, as the flat twin's positional plan does.
for (const source of [
  'const { w: [{ at }] } = source;',
  'const { w: [{ at }] } = { w: [[1]], ...other };',
]) runBoth('array plan/object key positional rename', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ObjectPattern');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({ arrayPath, adapter, resolvePure: () => ({ kind: 'instance', entry: 'actual/array/instance/at', hintName: 'at' }) });
  check(`${ label } positional plan`, plan?.array.positional, true);
  check(`${ label } keeps the keyed level`, plan?.array.capture.keyed.has(arrayPath.node.id), true);
  checkDeep(`${ label } renames the element only`, plan?.array.capture.elements.map(item => item.pattern), [arrayPath.node.id.properties[0].value.elements[0]]);
  checkDeep(`${ label } claims one method read`, plan?.extractions.map(read => read.localName), ['at']);
  check(`${ label } original host untouched`, JSON.stringify(arrayPath.node), original);
});

for (const source of [
  'let at; const result = ({ w: [{ at }] } = { w: [[1]] });',
  '({ w: [{ at: target.method }] } = { w: [[1]] });',
  'let at; ({ [key]: [{ at }] } = { w: [[1]] });',
]) runBoth('array plan/object key assignment capture boundary', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'AssignmentExpression', item => item.node.left.type === 'ObjectPattern');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({ arrayPath, adapter, resolvePure: () => ({ kind: 'instance', entry: 'actual/array/instance/at', hintName: 'at' }) });
  check(`${ label } no new result or target lowering`, plan, null);
  check(`${ label } original assignment untouched`, JSON.stringify(arrayPath.node), original);
});

for (const source of [
  'const [{ from }] = [Array];',
  'const wrapper = [globalThis]; const [{ Object: { fromEntries } }] = wrapper;',
  'const wrapped = [{ k: [Object] }]; const [{ k: [{ is }] }] = wrapped;',
  'const { w: [{ at }] } = { w: [[1]] };',
  'const [{ at }, other] = [source, 1];',
]) runBoth('array plan/replaced prototype iterator stays native', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type.endsWith('Pattern'));
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  let checked = false;
  adapter.isMutatedStatic = (object, key) => {
    checked ||= object === 'Array.prototype' && key === 'Symbol.iterator';
    return object === 'Array.prototype' && key === 'Symbol.iterator';
  };
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ({ kind: meta.placement === 'static' ? 'static' : 'instance', entry: 'actual/array/from', hintName: meta.key }),
  });
  check(`${ label } no substituted claim`, plan?.extractions.length ?? 0, 0);
  check(`${ label } uses mutation census`, checked, true);
  check(`${ label } original host untouched`, JSON.stringify(arrayPath.node), original);
});

for (const source of [
  'const [{ [Symbol.iterator]: it, Array: { from }, ...rest }] = [globalThis];',
  'const { [key]: value, Array: { from }, ...rest } = globalThis;',
  'let it, from, rest; ([{ [Symbol.iterator]: it, Array: { from }, ...rest }] = [globalThis]);',
]) for (const method of ['usage-pure', 'usage-global']) {
  runBoth(`destructure/native computed rest boundary ${ method }`, source, (parser, program, label) => {
    const propPath = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.key.name === 'from');
    const adapter = parser.name === 'babel' ? createBabelAdapter({ method }) : createEstreeAdapter({ method });
    const { meta } = destructurePropLeafMeta({ prop: propPath.node, objectPattern: propPath.parentPath, scope: propPath.scope, path: propPath, adapter });
    check(`${ label } global still detects the static`, meta?.object ?? null, method === 'usage-global' ? 'Array' : null);
    const arrayPath = parser.pickPath(
      program,
      source.startsWith('const') ? 'VariableDeclarator' : 'AssignmentExpression',
      item => (item.node.id ?? item.node.left)?.type.endsWith('Pattern'),
    );
    if (method === 'usage-pure') check(`${ label } no competing capture`, buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: () => ({ kind: 'static', entry: 'actual/array/from', hintName: 'from' }),
    }), null);
  });
}

runBoth(
  'array plan/iterator mutation does not claim flat object reads',
  'const { from } = Array;',
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    adapter.isMutatedStatic = (object, key) => object === 'Array.prototype' && key === 'Symbol.iterator';
    const [propPath] = arrayPath.get('id').get('properties');
    const { meta } = destructurePropLeafMeta({ prop: propPath.node, objectPattern: propPath.parentPath, scope: propPath.scope, path: propPath, adapter });
    check(`${ label } ordinary static still resolves`, meta?.object, 'Array');
  },
);

runBoth(
  'array plan/written nested static slot stays native',
  'const wrapped = [{ k: [Object] }]; wrapped[0].k[0] = {}; const [{ k: [{ is }] }] = wrapped;',
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const slotPaths = [];
    adapter.method = 'usage-pure';
    adapter.isWrittenContainerSlot = (_, keys) => {
      slotPaths.push(keys);
      return keys.join('.') === '0.k.0';
    };
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.key === 'is'
        ? { kind: 'static', entry: 'actual/object/is', hintName: 'is' } : null,
    });
    check(`${ label } exact slot write queried`, slotPaths.some(keys => keys.join('.') === '0.k.0'), true);
    check(`${ label } native written value`, !!plan?.array.dropsResidual, false);
    check(`${ label } no pure read of the written slot`, plan?.extractions.length ?? 0, 0);
  },
);

runBoth(
  'array plan/nested static after trailing effect',
  'const w3 = [globalThis]; const [[{ Object: { hasOwn } }]] = [w3, effect()];',
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.key === 'hasOwn'
        ? { kind: 'static', entry: 'actual/object/has-own', hintName: 'hasOwn' } : null,
    });
    check(`${ label } native iteration before pure binding`, plan?.array.nativeStatic, true);
    check(`${ label } effect stays in the native initializer`, arrayPath.node.init.elements[1].type, 'CallExpression');
    check(`${ label } no duplicated lifted prefix`, plan?.array.leading, undefined);
  },
);

for (const [source, assignment] of [
  ['const [{ [(effect(), "w")]: { at } }] = [{ w: [1] }];', false],
  ['export const [{ [(effect(), "w")]: { at } }] = [{ w: [1] }];', false],
  ['let at; ([{ [(effect(), "w")]: { at } }] = [{ w: [1] }]);', true],
]) runBoth('array plan/nested computed key retains its capture', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(
    program,
    assignment ? 'AssignmentExpression' : 'VariableDeclarator',
    item => (assignment ? item.node.left : item.node.id)?.type === 'ArrayPattern',
  );
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'at'
      ? { kind: 'instance', entry: 'actual/array/instance/at', hintName: 'at' } : null,
  });
  checkTruthy(`${ label } native key capture`, plan?.array.elements[0].children.at(0).keyedCapture);
  checkDeep(`${ label } one independent read`, plan?.extractions.map(read => read.localName), ['at']);
  check(`${ label } no re-detection`, !!plan?.array.normalize, false);
  check(`${ label } original source unchanged`, JSON.stringify(arrayPath.node), original);
  if (source.startsWith('export')) {
    check(`${ label } no exported native fragments`, plan?.array.exportFrom, null);
    checkDeep(`${ label } only source names exported`, plan?.array.exportedSiblings, ['at']);
  }
});

for (const pattern of ['[{ w: { is }, y: { at } }]', '[{ y: { at }, w: { is } }]']) {
  runBoth(
    'array plan/mixed static and instance reads retain their decisions',
    `const known = { w: Object, y: [4, 8] }; const ${ pattern } = [known, effect()];`,
    (parser, program, label) => {
      const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
      const original = JSON.stringify(arrayPath.node);
      const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
      const plan = buildNestedDestructurePlan({
        arrayPath,
        adapter,
        resolvePure: meta => meta.object === 'Object' && meta.key === 'is'
          ? { kind: 'static', entry: 'actual/object/is', hintName: 'is' }
          : meta.key === 'at' ? { kind: 'instance', entry: 'actual/array/instance/at', hintName: 'at' } : null,
      });
      check(`${ label } native positions`, plan?.array.capture?.init, arrayPath.node.init);
      check(`${ label } no re-detection`, !!plan?.array.normalize, false);
      checkDeep(`${ label } source property order`, plan?.extractions.map(read => read.localName), pattern.startsWith('[{ w') ? ['is', 'at'] : ['at', 'is']);
      check(`${ label } static native read survives`, plan?.array.elements[0].children.find(child => child.extractions?.[0].kind === 'static')?.nativeStatic, true);
      check(`${ label } original host unchanged`, JSON.stringify(arrayPath.node), original);
    },
  );
}

for (const source of [
  'const [{ w: { values, other }, y: { at } }] = [source, effect()];',
  'const [{ [(effect(), "w")]: { values, other }, y: { at } }] = [source];',
  'const [{ w: { values, other }, y: { at } }] = [{ w: [1], y: [2] }];',
]) runBoth('array plan/shared nested hop retains every property decision', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['values', 'at'].includes(meta.key)
      ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
  });
  checkTruthy(`${ label } keeps native iteration`, plan?.array.capture);
  checkDeep(`${ label } both reads planned`, plan?.extractions.map(read => read.localName), ['values', 'at']);
  const shared = plan?.array.elements[0].children.at(0);
  checkTruthy(`${ label } one native hop`, shared?.keyedCapture);
  checkDeep(`${ label } keeps the unclaimed sibling`, shared?.children.map(child => child.kind), ['consumed', 'verbatim']);
});

for (const [source, assignment] of [
  ['let source = first; const [[{ w: { values }, y: { at } }]] = [[source], source = second];', false],
  ['let source = first; const [{ w: { values = fallback() }, y: { at } }] = [source, source = second];', false],
  ['let source = first, values, at; ([{ w: { values }, y: { at } }] = [source, source = second]);', true],
  ['let source = first, values, at; if (test) ([{ w: { values }, y: { at } }] = [source, source = second]);', true],
  ['let source = first; const [{ w: { values, at } }] = [source, source = second];', false],
]) runBoth('array plan/reassigned nested source forms', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(
    program,
    assignment ? 'AssignmentExpression' : 'VariableDeclarator',
    item => (assignment ? item.node.left : item.node.id)?.type === 'ArrayPattern',
  );
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['values', 'at'].includes(meta.key)
      ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
  });
  checkTruthy(`${ label } source snapshot`, plan?.array.capture);
  if (plan) check(`${ label } original iteration`, plan.array.capture.init, assignment ? arrayPath.node.right : arrayPath.node.init);
  if (assignment) checkDeep(`${ label } assignment reads`, plan?.extractions.map(extraction => extraction.localName), ['values', 'at']);
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

for (const [source, admitted, names] of [
  ['let at; ([{ at }] = [receiver]);', true, ['at']],
  ['let at, tail; ([{ at }, tail] = [receiver, effect()]);', true, ['at']],
  ['let at; if (test) ([{ at }] = [receiver]);', true, ['at']],
  ['let at; const result = ([{ at }] = [receiver]);', false, []],
  ['const target = {}; ([{ at: target.value }] = [receiver]);', false, []],
  ['let at, rest; ([{ at }, ...rest] = [receiver, effect()]);', false, []],
  ['let flatMap; ([{ Array: { prototype: { flatMap } } }] = [globalThis]);', true, ['flatMap']],
]) runBoth('array plan/paired statement assignment', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'AssignmentExpression', item => item.node.left.type === 'ArrayPattern');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['at', 'flatMap'].includes(meta.key)
      ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ label } admission`, !!plan, admitted);
  if (admitted && plan) {
    check(`${ label } native capture`, plan.array.capture.init, arrayPath.node.right);
    check(`${ label } assignment form`, plan.array.assignment, true);
    checkDeep(`${ label } reads`, plan.extractions.map(extraction => extraction.localName), names);
  }
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

runBoth('array plan/already claimed sibling', 'const [{ from: ignored, of, ...rest }] = [Array];', (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    isClaimedProp: (path, meta) => path.node.value.name === 'ignored' && meta.key === 'from',
    resolvePure: meta => ({ kind: 'static', entry: `actual/array/${ meta.key }`, hintName: meta.key }),
  });
  checkDeep(`${ label } only the new claim extracts`, plan?.extractions.map(extraction => extraction.localName), ['of']);
  check(`${ label } prior sentinel stays native`, plan?.array.elements[0].children.at(0).kind, 'verbatim');
});

for (const [pattern, names, positions] of [
  ['[{ at }]', ['at'], [[0]]],
  ['[{ at: first }, { includes: second }]', ['first', 'second'], [[0], [1]]],
  ['[[{ at: first }], , [{ includes: second }], ...tail]', ['first', 'second'], [[0, 0], [2, 0], [3]]],
  ['[{ y: { at } }, tail]', ['at'], [[0], [1]]],
  ['[before, { at }, tail]', ['at'], [[1], [2]]],
  ['[before, { native }, { at }, tail]', ['at'], [[2], [3]]],
  ['[{ other, at }]', ['at'], [[0]]],
  ['[{ at, other, includes }]', ['at', 'includes'], [[0]]],
  ['[{ y: { other, at } }]', ['at'], [[0]]],
  ['[{ before, y: { other, at }, after }]', ['at'], [[0]]],
  ['[{ before, y: { z: { at }, innerAfter }, after }]', ['at'], [[0]]],
  ['[{ at: first, at: second }]', ['first', 'second'], [[0]]],
  ['[{ other = fallback(), at }]', ['at'], [[0]]],
  ['[{ [key]: other, at }]', ['at'], [[0]]],
  ['[{ nested: { value }, at }]', ['at'], [[0]]],
  ['[{ includes = fallback(), at }]', ['includes', 'at'], [[0]]],
  ['[{ native }, { at }]', ['at'], [[1]]],
  ['[{ at }, { native }]', ['at'], [[0], [1]]],
  ['[{ at }, tail = effect()]', [], []],
  ['[{ at = fallback() }]', [], []],
]) runBoth('array plan/positional host', `const ${ pattern } = source;`, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['at', 'includes'].includes(meta.key)
      ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
  });
  checkDeep(`${ label } ordered reads`, plan?.extractions.map(item => item.localName) ?? [], names);
  checkDeep(`${ label } captured positions`, plan?.array.capture.elements.map(item => item.path) ?? [], positions);
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

runBoth('array plan/positional static sibling ownership', 'const [{ values }, { at }] = rows;', (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ({ kind: meta.key === 'values' ? 'static' : 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key }),
  });
  checkDeep(`${ label } consumes both reads in order`, plan?.extractions.map(item => item.localName), ['values', 'at']);
  checkDeep(`${ label } captures both original slots`, plan?.array.capture.elements.map(item => item.path), [[0], [1]]);
  check(`${ label } static read remains native`, plan?.array.elements[0].children.at(0).nativeStatic, true);
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

for (const [assignment, names] of [
  ['[{ at }, { includes }] = source;', ['at', 'includes']],
  ['[{ at }] = [...source];', []],
  ['[[{ at }], , [{ includes }], ...tail] = source;', ['at', 'includes']],
  ['([{ at }] = source);', ['at']],
  ['[{ at = fallback() }] = source;', []],
  ['[{ y: { at } }] = source;', []],
  ['[{ at }, { other }] = source;', ['at']],
  ['saved = ([{ at }] = source);', []],
]) runBoth('array plan/positional assignment', `let at, includes, tail, other, saved; ${ assignment }`, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'AssignmentExpression', item => item.node.left.type === 'ArrayPattern');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['at', 'includes'].includes(meta.key)
      ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
  });
  checkDeep(`${ label } ordered writes`, plan?.extractions.map(item => item.localName) ?? [], names);
  if (names.length) {
    check(`${ label } assignment capture`, plan.array.assignment, true);
    check(`${ label } statement placement`, plan.array.statement.type, 'ExpressionStatement');
  }
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

for (const [init, captured] of [['[...[, [1]]]', true], ['[, [1]]', false]]) runBoth(
  'array plan/unpaired hole',
  `const [{ at }] = ${ init };`,
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator');
    const original = JSON.stringify(arrayPath.node);
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
    });
    check(`${ label } existing positional admission`, !!plan, captured);
    if (captured) checkDeep(`${ label } capture position`, plan.array.capture.elements.map(item => item.path), [[0]]);
    check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
  },
);

for (const header of [false, true]) runBoth('array plan/positional surface header', header
  ? 'for (const [{ Array: { prototype: { at } } }] = [globalThis, ...tail]; test(););'
  : 'const [{ Array: { prototype: { at } } }] = [globalThis, ...tail];', (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/array/instance/at', hintName: 'at' } : null,
  });
  check(`${ label } admits the host`, !!plan, true);
  if (header) checkDeep(`${ label } retained navigation`, plan.array.elements[0].nestedKeys, ['Array', 'prototype']);
  else {
    check(`${ label } fixed prefix capture`, plan.array.capture.init, arrayPath.node.init);
    checkDeep(`${ label } captured instance read`, plan.extractions.map(read => read.localName), ['at']);
  }
});

for (const init of ['source', '[original]']) runBoth(
  'array plan/live host',
  `const [{ at }] = ${ init }, first = [left], second = [right];`,
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
    const first = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'first').node.init;
    const second = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.name === 'second').node.init;
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const options = { arrayPath, adapter, resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null };
    const originalPlan = buildNestedDestructurePlan(options);
    check(`${ label } original source admission`, !!originalPlan, true);
    arrayPath.node.init = first;
    const firstPlan = buildNestedDestructurePlan(options);
    checkTruthy(`${ label } replaced source admits`, firstPlan);
    check(`${ label } first receiver`, firstPlan?.extractions[0].receiver, first.elements[0]);
    arrayPath.node.init = second;
    const secondPlan = buildNestedDestructurePlan(options);
    check(`${ label } replacement receiver`, secondPlan?.extractions[0].receiver, second.elements[0]);
    arrayPath.node.id.elements[0].properties.length = 0;
    check(`${ label } consumed pattern declines`, buildNestedDestructurePlan(options), null);
  },
);

// The array branch plans the pristine host once. A discarded neighbour still runs,
// a source-written empty pattern still coerces, and repeated keys remain two claims.
for (const [pattern, init, count, drops, after, effects, capture = false] of [
  ['[{ at, keys }]', '[arr]', 2, true, false, 0],
  ['[{ at, keys }, other]', '[arr, effect()]', 2, undefined, undefined, 0, true],
  ['[{ at, keys }]', '[arr, effect()]', 2, undefined, undefined, 0, true],
  ['[{ at, keys }, {}]', '[arr, other]', 2, false, false, 0],
  ['[{ at: first, at: second }]', '[arr]', 2, true, false, 0],
  ['[{ other, at }]', '[arr]', 1, undefined, undefined, 0, true],
  ['[{ at = fallback(), other, keys }]', '[arr]', 2, undefined, undefined, 0, true],
]) runBoth('array plan/complete source host', `const ${ pattern } = ${ init };`, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['at', 'keys'].includes(meta.key)
      ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
  });
  checkTruthy(`${ label } reaches array plan`, plan);
  if (!plan) return;
  check(`${ label } independent reads`, plan.extractions.length, count);
  check(`${ label } captured source positions`, !!plan.array.capture, capture);
  if (capture) checkDeep(
    `${ label } existing capture descriptor`,
    plan.array.capture,
    planArrayWrapperCapture({ pattern: arrayPath.node.id, init: arrayPath.node.init, force: true }),
  );
  check(`${ label } drops residual`, plan.array.dropsResidual, drops);
  check(`${ label } after residual`, plan.array.after, after);
  check(`${ label } discarded effects`, plan.array.discarded?.length ?? 0, effects);
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
  check(`${ label } distinct property occurrences`, new Set(plan.extractions.map(item => item.prop)).size, count);
});

for (const [pattern, init, accepted, capture = false] of [
  ['[{ y: { at, other } }]', '[box]', true],
  ['[{ y: { at, keys } }]', '[box]', true],
  ['[{ y: { at, keys } }, other]', '[box, 1]', true],
  ['[{ y: { at, other } }]', '[box, effect()]', true, true],
  ['[{ y: { other, at } }]', '[box]', true, true],
  ['[{ y: { at = fallback() } }]', '[box]', true, true],
  ['[{ [(effect(), "y")]: { at, other } }]', '[box]', true, true],
  ['[{ y: { at, other }, beside }]', '[box]', true, true],
]) runBoth('array plan/nested receiver slot', `const ${ pattern } = ${ init };`, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['at', 'keys'].includes(meta.key)
      ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
  });
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
  check(`${ label } admission`, !!plan, accepted);
  if (!plan) return;
  check(`${ label } receiver member`, plan.extractions[0].receiver.type, 'MemberExpression');
  check(`${ label } capture placement`, !!plan.array.capture, capture);
  check(`${ label } shared memo`, plan.array.memos?.length ?? 0, capture ? 0 : 1);
});

for (const [code, memoCount, split] of [
  ['const [{ at, keys }] = [choose ? first : second];', 1, false],
  ['const [{ at }] = [read()];', 1, false],
  ['const [{ at }] = [choose ? first : second];', 0, false],
  ['const [{ at, keys }] = [...[receiver]];', 0, false],
  ['const before = read(), [{ at, keys }] = [read()], after = keys;', 1, true],
  ['if (test) var [{ at, keys }] = [read()];', 1, false],
  ['export const [{ at, keys }] = [read()];', 1, false],
  ['export const before = read(), [{ at, keys }] = [read()], after = keys;', 1, false],
]) runBoth('array plan/compact receiver ownership', code, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => ['at', 'keys'].includes(meta.key)
      ? { kind: 'instance', entry: `actual/instance/${ meta.key }`, hintName: meta.key } : null,
  });
  checkTruthy(`${ label } reaches compact plan`, plan?.array.dropsResidual);
  if (!plan) return;
  check(`${ label } shared memo count`, plan.array.memos.length, memoCount);
  check(`${ label } private prefix`, plan.array.exportFrom, memoCount);
  check(`${ label } split source declaration`, plan.array.splitDeclaration, split);
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

for (const [pattern, init, after, capture = false] of [
  ['[{ at }, other]', '[make(), 2]', false],
  ['[other, { at }]', '[2, make()]', true],
  ['[other, { at }, last]', '[2, make(), 3]', undefined, true],
  ['[{ at }, ...rest]', '[make(), 2, 3]', false],
  ['[other, { at }, ...rest]', '[2, make(), 3]', undefined, true],
  ['[{ at }, ...[first, ...tail]]', '[make(), 2, 3]', false],
]) runBoth(
  'array plan/residual binding order',
  `export const before = 1, ${ pattern } = ${ init }, following = 4;`,
  (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
    const original = JSON.stringify(arrayPath.parentPath.node);
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
    });
    checkTruthy(`${ label } plans source host`, plan);
    if (!plan) return;
    check(`${ label } interleaved binding capture`, !!plan.array.capture, capture);
    check(`${ label } reads follow earlier bindings only`, plan.array.after, after);
    if (!capture) {
      check(`${ label } preceding declarator retained`, plan.array.joinResidual.before[0], arrayPath.parentPath.node.declarations[0]);
      check(`${ label } following declarator retained`, plan.array.joinResidual.after[0], arrayPath.parentPath.node.declarations[2]);
      check(`${ label } public source names`, plan.array.joinResidual.exported, true);
    }
    check(`${ label } source unchanged`, JSON.stringify(arrayPath.parentPath.node), original);
  },
);

for (const source of [
  'const [, { at }, other] = [effect(), make(), 1];',
  'export const [, { at }, other] = [effect(), make(), 1];',
  'const before = first(), [, { at }, other] = [effect(), make(), 1], following = last();',
]) runBoth('array plan/leading discarded effects', source, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const original = JSON.stringify(arrayPath.parentPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
  });
  checkTruthy(`${ label } reaches compact plan`, plan && !plan.array.capture);
  if (!plan) return;
  checkDeep(`${ label } prefix effect identity`, plan.array.leading, [arrayPath.node.init.elements[0]]);
  check(`${ label } lifted slot leaves a hole`, plan.array.initElements[0], null);
  checkDeep(`${ label } receiver memo identity`, plan.array.memos, [arrayPath.node.init.elements[1]]);
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.parentPath.node), original);
});

for (const receiver of ['holder.value', 'choose ? first : second']) {
  runBoth('array plan/retained receiver memo', `const [{ at }, other] = [${ receiver }, 1];`, (parser, program, label) => {
    const arrayPath = parser.pickPath(program, 'VariableDeclarator');
    const original = JSON.stringify(arrayPath.node);
    const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
    const plan = buildNestedDestructurePlan({
      arrayPath,
      adapter,
      resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
    });
    checkTruthy(`${ label } retained plan`, plan && !plan.array.dropsResidual && !plan.array.capture);
    if (!plan) return;
    check(`${ label } shared source receiver`, plan.array.memos[0], arrayPath.node.init.elements[0]);
    check(`${ label } memo count`, plan.array.memos.length, 1);
    check(`${ label } residual positions`, plan.array.residualPattern.elements.length, 2);
    check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
  });
}

for (const [pattern, init, paired] of [
  ['[{ at }]', '[receiver, ...others]', true],
  ['[{ at }, ...rest]', '[receiver, ...others]', true],
  ['[before, { at }, ...rest]', '[2, receiver, ...others]', true],
  ['[{ at }]', '[...[receiver], ...others]', true],
  ['[, { at }]', '[...others, receiver]', false],
  ['[, [{ at }]]', '[...others, [receiver]]', false],
]) runBoth('array plan/proven prefix before opaque spread', `const ${ pattern } = ${ init };`, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
  });
  checkTruthy(`${ label } reading plan`, plan);
  if (!plan) return;
  check(`${ label } paired prefix only`, !plan.array.positional, paired);
  check(`${ label } source iteration retained`, plan.array.capture.init, arrayPath.node.init);
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

for (const [code, entries, capture = false] of [
  ['const [{ [Symbol.iterator]: iterator }] = [receiver];', ['get-iterator-method']],
  ['const [{ [Symbol.iterator]: first, [Symbol.iterator]: second }] = [receiver];', ['get-iterator-method', 'get-iterator-method']],
  ['const key = Symbol.iterator; const [{ [key]: iterator, other, at }] = [receiver];', ['get-iterator-method', 'actual/instance/at'], true],
  ['const [{ [Symbol.iterator]: iterator = fallback() }] = [receiver];', null],
  ['const [{ [(effect(), Symbol.iterator)]: iterator }] = [receiver];', null],
  ['const [{ ["Symbol.iterator"]: iterator }] = [receiver];', null],
  ['function read(Symbol) { const [{ [Symbol.iterator]: iterator }] = [receiver]; }', null],
  ['const [{ [Symbol.iterator]: iterator, ...rest }] = [receiver];', null],
]) runBoth('array plan/iterator reads', code, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const original = JSON.stringify(arrayPath.node);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
  });
  checkDeep(`${ label } entries`, plan ? plan.extractions.map(item => item.entry) : null, entries);
  check(`${ label } ordered capture`, !!plan?.array.capture, capture);
  check(`${ label } source unchanged`, JSON.stringify(arrayPath.node), original);
});

for (const [code, inDeclaration] of [
  ['const [{ other, at = fallback() }] = [arr];', false],
  ['const first = before(), [{ other, at = fallback() }] = [arr], last = after();', true],
  ['for (const [{ other, at = fallback() }] = [arr]; test(); ) use(at, other);', true],
  ['if (test) var [{ other, at = fallback() }] = [arr];', true],
  ['export const [{ other, at = fallback() }] = [arr];', false],
]) runBoth('array plan/ordered declaration hosts', code, (parser, program, label) => {
  const arrayPath = parser.pickPath(program, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const plan = buildNestedDestructurePlan({
    arrayPath,
    adapter,
    resolvePure: meta => meta.key === 'at' ? { kind: 'instance', entry: 'actual/instance/at', hintName: 'at' } : null,
  });
  checkTruthy(`${ label } captures positions`, plan?.array.capture);
  if (!plan) return;
  check(`${ label } insertion within declaration`, plan.array.inDeclaration, inDeclaration);
  check(`${ label } original default`, plan.extractions[0].defaultNode, arrayPath.node.id.elements[0].properties[1].value.right);
  check(`${ label } original residual`, plan.array.elements[0].children.at(0).prop, arrayPath.node.id.elements[0].properties[0]);
});

for (const [code, expected] of [
  ['const [{ at }] = rows;', { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: false, exportedSiblings: [] }],
  ['for (const [{ at }] = rows; test;) use(at);', { isExport: false, isForInit: true, isBodyless: false, isMultiDecl: false, exportedSiblings: [] }],
  ['if (test) var [{ at }] = rows;', { isExport: false, isForInit: false, isBodyless: true, isMultiDecl: false, exportedSiblings: [] }],
  [
    'export const before = 1, [{ at }, other] = rows, after = 2;',
    { isExport: true, isForInit: false, isBodyless: false, isMultiDecl: true, exportedSiblings: ['before', 'other', 'after'] },
  ],
  ['let at; [{ at }] = rows;', { assignment: true }],
  ['const [{ Array: { at } }] = [globalThis, ...rest];', undefined],
  ['const [{ Array: { prototype: { at } } }] = [globalThis, ...rest];', { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: false, exportedSiblings: [] }],
]) runBoth('positional plan/host placement', code, (parser, program, label) => {
  const propPath = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.key?.name === 'at');
  const original = JSON.stringify(program.node ?? program);
  const adapter = parser.name === 'babel' ? createBabelAdapter() : createEstreeAdapter();
  const positional = resolvePositionalElementSlot(propPath, adapter);
  checkTruthy(`${ label } slot`, positional);
  if (!positional) return;
  const plan = buildNestedDestructurePlan({
    positional: { prop: propPath.node, pattern: propPath.parentPath.node, slot: positional.slot.node, keys: positional.keys, levels: positional.levels, host: positional },
  });
  checkDeep(`${ label } placement`, plan?.positional.placement, expected);
  check(`${ label } source unchanged`, JSON.stringify(program.node ?? program), original);
});

// Positional plans retain the native iterator's slot and distinguish a rest exclusion
// from an ordinary sibling. Planning itself must leave every source occurrence intact.
for (const [pattern, keys, memoizeHop, keepsClaimKey, residualBinds] of [
  ['{ at: method }', 0, false, false, false],
  ['{ at: method, other }', 0, false, false, true],
  ['{ at: method, ...rest }', 0, false, true, true],
  ['{ y: { at: method } }', 1, false, false, false],
  ['{ y: { at: method, other } }', 1, true, false, true],
  ['{ before, y: { at: method }, after }', 1, true, false, false],
]) runBoth('positional plan/source ownership', `const [${ pattern }] = rows;`, (parser, program, label) => {
  const prop = parser.pickPath(program, parser.name === 'babel' ? 'ObjectProperty' : 'Property', item => item.node.key?.name === 'at');
  const slot = resolvePositionalElementSlot(prop);
  checkTruthy(`${ label } reaches positional plan`, slot);
  if (!slot) return;
  const original = JSON.stringify(slot.slot.node);
  const plan = buildNestedDestructurePlan({ positional: { prop: prop.node, pattern: prop.parentPath.node, slot: slot.slot.node, keys: slot.keys, levels: slot.levels } });
  check(`${ label } key depth`, plan.positional.keys.length, keys);
  check(`${ label } receiver memo`, plan.positional.memoizeHop, memoizeHop);
  check(`${ label } rest exclusion`, plan.positional.keepsClaimKey, keepsClaimKey);
  check(`${ label } residual binding`, plan.positional.residualBinds, residualBinds);
  check(`${ label } occurrence identity`, plan.outerProps[0].prop, prop.node);
  check(`${ label } source unchanged`, JSON.stringify(slot.slot.node), original);
});

function injectImport(entry, hintName) {
  return `_${ hintName ?? entry }`;
}

function identifier(name) {
  return { type: 'Identifier', name };
}
function collapsePlan(extra = {}) {
  return {
    kind: 'collapse',
    rootBinding: { pure: { entry: 'actual/global-this', hintName: 'globalThis' } },
    harvestedSE: [],
    keyPrefixSE: [],
    property: identifier('Array'),
    computed: false,
    optional: false,
    ...extra,
  };
}

// --- renderProxyReceiverPlan: one spelling for both bindings ---

check('render/pure root swaps to the injected binding',
  renderProxyReceiverPlan(collapsePlan(), { injectImport }).object.name, '_globalThis');
check('render/pure root keeps the leaf key plain',
  renderProxyReceiverPlan(collapsePlan(), { injectImport }).property.name, 'Array');
check('render/alias root is spelled verbatim',
  renderProxyReceiverPlan(collapsePlan({ rootBinding: { alias: identifier('g') } }), { injectImport }).object.name, 'g');

// a clone, never the plan's own node: the substrate mutates what it inserts, and the plan is
// re-read by the other routes off the same receiver
checkTruthy('render/alias root is CLONED',
  (() => {
    const alias = identifier('g');
    return renderProxyReceiverPlan(collapsePlan({ rootBinding: { alias } }), { injectImport }).object !== alias;
  })());

// harvested effects ride AHEAD of the root, in the order the plan collected them
check('render/harvested effects prefix the root',
  (() => {
    const rendered = renderProxyReceiverPlan(collapsePlan({
      harvestedSE: [identifier('a'), identifier('b')],
    }), { injectImport });
    return rendered.object.expressions.map(e => e.name).join(',');
  })(), 'a,b,_globalThis');

// dropped-hop key effects migrate INTO the surviving key instead, which forces it computed -
// its plain spelling becomes the string the source read
check('render/key prefix folds into the leaf key',
  (() => {
    const rendered = renderProxyReceiverPlan(collapsePlan({
      keyPrefixSE: [identifier('c')],
    }), { injectImport });
    return `${ rendered.computed }:${ rendered.property.expressions.map(e => e.name ?? e.value).join(',') }`;
  })(), 'true:c,Array');

check('render/a kept root re-hangs its guard on the leaf',
  renderProxyReceiverPlan(collapsePlan({
    rootBinding: { keep: identifier('q') }, optional: true,
  }), { injectImport }).optional, true);

check('render/member kind wraps the inner plan',
  (() => {
    const rendered = renderProxyReceiverPlan({
      kind: 'member', inner: collapsePlan(), property: identifier('from'), computed: false,
    }, { injectImport });
    return `${ rendered.property.name }.${ rendered.object.property.name }`;
  })(), 'from.Array');

// `embed` is the seam for a binding whose dialect is NOT canonical: every carried node passes
// through it, and the babel converter reads exactly that wrapper
check('render/embed wraps every carried node',
  (() => {
    const rendered = renderProxyReceiverPlan(collapsePlan({
      rootBinding: { alias: identifier('g') }, harvestedSE: [identifier('a')],
    }), { injectImport, embed: hostSlot });
    const root = rendered.object.expressions;
    return [root[0].type, root[1].type, rendered.property.type].join(',');
  })(), [HOST_SLOT, HOST_SLOT, HOST_SLOT].join(','));

// ... and the INJECTED binding is the canon's own node, never host-slotted - the binding name
// comes from the injector, so there is no source node to carry
check('render/an injected root is canonical, not embedded',
  renderProxyReceiverPlan(collapsePlan(), { injectImport, embed: hostSlot }).object.type, 'Identifier');

// --- planMemoReadTarget: what a memoized receiver re-reads ---

function resolvePureGlobals(meta) {
  return meta.kind === 'global' && meta.name === 'globalThis'
    ? { entry: 'actual/global-this', hintName: 'globalThis' } : null;
}

runBoth('memo/proxy chain collapses through the plan', 'var q = globalThis.self.Array;', (adapter, prog, lbl) => {
  const receiver = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'Array').node;
  const plan = planMemoReadTarget(receiver, {
    aliasCtx: { adapter: null, scope: null, path: null },
    resolvePure: resolvePureGlobals,
  });
  check(`${ lbl } collapses`, plan?.plan?.kind, 'collapse');
  check(`${ lbl } no ctor swap`, plan?.pure, null);
});

// a receiver nothing resolves for keeps its own spelling: null is what tells the caller to
// re-read it verbatim, and only that remainder does
runBoth('memo/unresolvable receiver declines', 'var q = user.thing.Array;', (adapter, prog, lbl) => {
  const receiver = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'Array').node;
  check(lbl, planMemoReadTarget(receiver, {
    aliasCtx: { adapter: null, scope: null, path: null },
    resolvePure: resolvePureGlobals,
  }), null);
});

// the sequence prefix around the receiver is peeled off and handed back separately - it has to
// run once, ahead of the binding, and the collapse target is the tail
runBoth('memo/sequence prefix is peeled off the tail', 'var q = (c++, globalThis.self.Array);', (adapter, prog, lbl) => {
  const receiver = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'Array').node;
  const seq = adapter.pickPath(prog, 'SequenceExpression');
  const plan = planMemoReadTarget(seq ? seq.node : receiver, {
    aliasCtx: { adapter: null, scope: null, path: null },
    resolvePure: resolvePureGlobals,
  });
  check(`${ lbl } prefix length`, plan?.prefix?.length, 1);
  check(`${ lbl } tail is the nav`, plan?.tail?.property?.name, 'Array');
});

// --- planCatchClauseExtraction: whether the catch param has to become a `_ref` ---

for (const [receiver, expected, flat = false, leaf = 'is'] of [
  ['(() => { log(); return Object; })()', true],
  ['((label, value) => { log(label); return value; })(1, Object)', true],
  ['((label, value) => { value = {}; return value; })(1, Object)', false],
  ['Object', false],
  ['Object', false, false, '[(effect(), "is")]: is'],
  ['unknown()', false],
  ['({ is: custom })', false],
  ['Object, { is: custom }', false, true],
  ['{ is: custom }, Object', false, true],
]) runBoth(`loop capture/a static-only nested claim from ${ receiver }`,
  flat ? `for (const { is } of [${ receiver }]) use(is);`
    : `for (const { w: { ${ leaf } } } of [{ w: ${ receiver } }, { w: ${ receiver } }]) use(is);`,
  (adapter, prog, lbl) => {
    const loop = adapter.pickPath(prog, 'ForOfStatement');
    const plan = planCatchClauseExtraction({
      paramNode: loop.node.left.declarations[0].id, bodyNode: loop.node.body,
      scope: loop.scope, path: loop, iterableNode: loop.node.right, mirrorHosts: true,
      adapter: {
        method: 'usage-pure',
        isStringLiteral: () => false, getStringValue: node => node.value,
        hasBinding: (scope, name) => !!scope.getBinding(name), getBinding: (scope, name) => scope.getBinding(name),
      },
      resolvePure: meta => meta?.object === 'Object' && meta.key === 'is'
        ? { entry: 'actual/object/is', hintName: 'Object$is', kind: 'static' } : null,
      walkNode: (root, visit) => walkAstNodes({ root, visit }),
    });
    check(lbl, !!plan, expected);
  });

for (const assignment of [false, true]) runBoth(`loop/outside read assignment=${ assignment }`,
  assignment ? 'let at; for ({ at } of [[1]]) {} use(at);' : 'for (const { at } of [[1]]) {}',
  (adapter, prog, lbl) => {
    const loop = adapter.pickPath(prog, 'ForOfStatement');
    const plan = planCatchClauseExtraction({
      paramNode: assignment ? loop.node.left : loop.node.left.declarations[0].id,
      bodyNode: loop.node.body, scope: loop.scope, path: loop, assignment,
      resolvePure: catchResolvePure,
      walkNode: (root, visit) => walkAstNodes({ root, visit }),
    });
    check(lbl, !!plan, assignment);
  });

// the moved head lands at the top of the body block: a lexical name that block declares and the
// pattern binds or reads keeps the head where it is; a nested block's names do not count
for (const [source, relocates] of [
  ['for (const { at } of list) { use(at); }', true],
  ['for (const { at, flat } of list) { const flat = 1; use(at, flat); }', false],
  ['for (const { at } of list) { class at {} use(at); }', false],
  ['for (const { at } of list) { function at() {} use(at); }', false],
  ['for (const { [key]: m, at } of list) { let key = 1; use(m, at); }', false],
  ['for (const { at = fallback } of list) { let fallback = 1; use(at); }', false],
  ['for (const { at } of list) { { let at = 1; use(at); } use(at); }', true],
]) runBoth(`loop/a body lexical beside the moved head ${ source }`, source, (adapter, prog, lbl) => {
  const loop = adapter.pickPath(prog, 'ForOfStatement');
  const plan = planCatchClauseExtraction({
    paramNode: loop.node.left.declarations[0].id,
    bodyNode: loop.node.body,
    scope: loop.scope,
    path: loop,
    adapter: {
      isStringLiteral: () => false,
      getStringValue: node => node.value,
      hasBinding: (scope, name) => !!scope.getBinding(name),
      getBinding: (scope, name) => scope.getBinding(name),
    },
    resolvePure: catchResolvePure,
    walkNode: (root, visit) => walkAstNodes({ root, visit }),
  });
  check(lbl, !!plan, relocates);
});

function catchResolvePure(meta) {
  return meta.kind === 'property' && meta.key === 'at'
    ? { entry: 'actual/instance/at', hintName: 'at', kind: 'instance' } : null;
}

function planCatch(adapter, prog) {
  const clause = adapter.pickPath(prog, 'CatchClause');
  return planCatchClauseExtraction({
    paramNode: clause.node.param,
    bodyNode: clause.node.body,
    scope: clause.scope,
    adapter: { isStringLiteral: () => false, getStringValue: n => n.value, hasBinding: () => false, getBinding: () => null },
    path: clause,
    resolvePure: catchResolvePure,
    walkNode: (root, visit) => {
      const stack = [[root, null]];
      while (stack.length) {
        const [node, parent] = stack.pop();
        if (!node || typeof node !== 'object' || !node.type) continue;
        visit(node, parent);
        for (const value of Object.values(node)) {
          if (Array.isArray(value)) for (const item of value) stack.push([item, node]);
          else stack.push([value, node]);
        }
      }
    },
  });
}

runBoth('catch/a default reading a body lexical stays', 'try { f(); } catch ({ at = fallback }) { let fallback = 1; use(at); }', (adapter, prog, lbl) => {
  check(lbl, planCatch(adapter, prog), null);
});

runBoth('catch/a read resolvable prop relocates', 'try { f(); } catch ({ at }) { use(at); }', (adapter, prog, lbl) => {
  const plan = planCatch(adapter, prog);
  checkTruthy(`${ lbl } plans`, plan);
  check(`${ lbl } nothing skipped`, plan?.unobservable.length, 0);
});

// an UNREAD binding buys an import plus a dead dispatcher call - the pattern stays native
runBoth('catch/an unread resolvable prop declines', 'try { f(); } catch ({ at }) { g(); }', (adapter, prog, lbl) => {
  check(lbl, planCatch(adapter, prog), null);
});

// a name nothing resolves for is not a candidate at all
runBoth('catch/an unresolvable prop declines', 'try { f(); } catch ({ message }) { use(message); }', (adapter, prog, lbl) => {
  check(lbl, planCatch(adapter, prog), null);
});

// positional bindings can't be rewritten by key, so an array pattern is left alone
runBoth('catch/an array pattern declines', 'try { f(); } catch ([at]) { use(at); }', (adapter, prog, lbl) => {
  check(lbl, planCatch(adapter, prog), null);
});

runBoth('catch/a bare param declines', 'try { f(); } catch (e) { use(e); }', (adapter, prog, lbl) => {
  check(lbl, planCatch(adapter, prog), null);
});

// a read prop beside an unread one relocates for the read one and hands the other back, so the
// binding can leave it a native read in the residual
runBoth('catch/an unread sibling comes back to be skipped',
  'try { f(); } catch ({ at, message }) { use(at); }', (adapter, prog, lbl) => {
    const plan = planCatch(adapter, prog);
    checkTruthy(`${ lbl } plans`, plan);
    check(`${ lbl } skips nothing readable`, plan?.unobservable.length, 0);
  });

// --- sentinelAlreadyProcessed: our own output, recognised ---

function injectorFor({ generated = [], adopted = [], pureImports = {} } = {}) {
  return {
    hasGeneratedUnusedName: name => generated.includes(name),
    isAdoptedUnusedName: name => adopted.includes(name),
    getPureImport: name => pureImports[name] ?? null,
  };
}

runBoth('sentinel/our own unused name is processed', 'const { from: _unused } = R;', (adapter, prog, lbl) => {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const propPath = adapter.pickPath(prog, type);
  check(lbl, sentinelAlreadyProcessed(propPath, {
    node: propPath.node, meta: null, injector: injectorFor({ generated: ['_unused'] }),
  }), true);
});

// an ADOPTED name (a prior pass's, or a user's own) only skips while OUR extraction of this key
// stands beside it - here nothing does, so the prop keeps its rewrite
runBoth('sentinel/an adopted name with no extraction sibling is not', 'const { from: _unused } = R;', (adapter, prog, lbl) => {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const propPath = adapter.pickPath(prog, type);
  check(lbl, sentinelAlreadyProcessed(propPath, {
    node: propPath.node, meta: null, injector: injectorFor({ generated: ['_unused'], adopted: ['_unused'] }),
  }), false);
});

runBoth('sentinel/a live binding is not a sentinel', 'const { from: f } = R;', (adapter, prog, lbl) => {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const propPath = adapter.pickPath(prog, type);
  check(lbl, sentinelAlreadyProcessed(propPath, {
    node: propPath.node, meta: null, injector: injectorFor({ generated: ['_unused'] }),
  }), false);
});

// a PATTERN-valued prop has no name to test at all
runBoth('sentinel/a pattern value is not a sentinel', 'const { Array: { from } } = R;', (adapter, prog, lbl) => {
  const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
  const propPath = adapter.pickPath(prog, type, p => p.node.key?.name === 'Array');
  check(lbl, sentinelAlreadyProcessed(propPath, {
    node: propPath.node, meta: null, injector: injectorFor({ generated: ['_unused'] }),
  }), false);
});

// an ADOPTED sentinel standing in a PARAM pattern is answered by the function's BODY, where
// our own extraction for that key went - reading the list the FUNCTION sits in finds nothing,
// and the next pass re-extracts the sentinel as a live binding
runBoth('sentinel/a param sentinel reads its extraction from the body',
  'function f({ from: _unused, ...rest } = R) { let from = _Array$from; return from([1]); }',
  (adapter, prog, lbl) => {
    const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
    const propPath = adapter.pickPath(prog, type, p => p.node.key?.name === 'from');
    check(lbl, sentinelAlreadyProcessed(propPath, {
      node: propPath.node,
      meta: { key: 'from' },
      injector: injectorFor({
        generated: ['_unused'],
        adopted: ['_unused'],
        pureImports: { _Array$from: { entry: 'actual/array/from' } },
      }),
    }), true);
  });

// ... and with no extraction beside it in that body the sentinel is a live binding again
runBoth('sentinel/a param sentinel with no body extraction is not processed',
  'function f({ from: _unused, ...rest } = R) { return 1; }',
  (adapter, prog, lbl) => {
    const type = adapter.name === 'babel' ? 'ObjectProperty' : 'Property';
    const propPath = adapter.pickPath(prog, type, p => p.node.key?.name === 'from');
    check(lbl, sentinelAlreadyProcessed(propPath, {
      node: propPath.node,
      meta: { key: 'from' },
      injector: injectorFor({
        generated: ['_unused'],
        adopted: ['_unused'],
        pureImports: { _Array$from: { entry: 'actual/array/from' } },
      }),
    }), false);
  });

// --- buildNestedDestructurePlan: the sole-constructor-hop anchor honours the opt-out ---
// a `{ K: { leaf } }` pattern over the proxy root anchors its residual on K's ponyfill constructor;
// with the directive on the hop line or on a leaf under it the plan has to decline the anchor -
// the static the opt-out kept from being imported is missing on the ponyfill, so the residual
// must stay the raw read off the realm object. the opt-out arrives as the per-prop predicate
{
  const code = 'const {\n  Map: {\n    groupBy,\n  },\n} = globalThis;\nuse(groupBy);';
  const pureStubs = {
    resolvePure: () => ({ entry: 'actual/map/group-by', hintName: 'Map$groupBy' }),
    resolveGlobalPolyfill: name => name === 'Map' ? { entry: 'actual/map/constructor', hintName: 'Map' }
      : name === 'globalThis' ? { entry: 'actual/global-this', hintName: 'globalThis' } : null,
  };
  // the plan asks the adapter the questions of a whole detection run (mutated slots, bindings,
  // shadows); the harness adapters carry none of them, and every one answers "nothing" here.
  // the undirected control below is what proves the shim reaches the anchor at all
  function planFor(adapter, prog, isDisabledProp) {
    const path = adapter.pickPath(prog, 'VariableDeclarator');
    const planAdapter = new Proxy(adapter, { get: (target, key) => key in target ? target[key] : () => null });
    return buildNestedDestructurePlan({ declarator: path.node, scope: path.scope, adapter: planAdapter, path, ...pureStubs, isDisabledProp });
  }
  // babel carries `loc`, oxc offsets only - the same two spellings the directive scan reads
  const offsetToLine = buildOffsetToLine(code);
  function lineOf(node) {
    return node.loc?.start?.line ?? offsetToLine(node.start);
  }
  runBoth('plan/sole ctor hop anchors without an opt-out', code, (adapter, prog, lbl) => {
    check(lbl, planFor(adapter, prog, null)?.anchor, 'Map');
  });
  runBoth('plan/an opt-out on the hop line declines the anchor', code, (adapter, prog, lbl) => {
    check(lbl, planFor(adapter, prog, prop => lineOf(prop) === 2)?.anchor, undefined);
  });
  runBoth('plan/an opt-out on the leaf line declines the anchor', code, (adapter, prog, lbl) => {
    check(lbl, planFor(adapter, prog, prop => lineOf(prop) === 3)?.anchor, undefined);
  });
}

// --- residualInitRunsEffects ---

// a surviving residual whose init is an INVOCATION running an effect keeps the extraction behind it:
// the destructure reads its receiver off that run, so no lift moves the run ahead of the bindings.
// the effects a literal init carries - an element's call, a sequence prefix - are the lifts' own, and
// a quiet callee or a plain alias runs nothing the binding could observe
for (const [name, source, expected] of [
  ['effectful call', 'const f = () => (log.push(1), [Array]); const [{ from } = {}, x] = f();', true],
  ['effectful iife', 'const [{ from } = {}, x] = (() => (log.push(1), [Array]))();', true],
  ['call behind a sequence prefix', 'const f = () => (log.push(1), [Array]); const [{ from } = {}, x] = (log.push(0), f());', true],
  ['store of an effectful call', 'let w; const f = () => (log.push(1), [Array]); const [{ from } = {}, x] = w = f();', true],
  ['quiet call', 'const f = () => [Array]; const [{ from } = {}, x] = f();', false],
  ['effect inside a literal element', 'const [{ from } = {}, x] = [Array, log.push(1)];', false],
  ['sequence prefix before a literal', 'const [{ from } = {}, x] = (log.push(0), [Array, 1]);', false],
  ['plain alias', 'const w = [Array, 1]; const [{ from } = {}, x] = w;', false],
]) {
  runBoth(`residual runs/${ name }`, source, (parser, prog, lbl) => {
    const path = parser.pickPath(prog, 'VariableDeclarator', item => item.node.id.type === 'ArrayPattern');
    // the plugins' own adapters: whether a callee is quiet is the inline-call canon's answer, which
    // resolves the callee through the binding surface a stub withholds
    const adapter = parser.name === 'babel' ? createBabelAdapter({ method: 'usage-pure' }) : createEstreeAdapter({ method: 'usage-pure' });
    check(lbl, residualInitRunsEffects({ init: path.node.init, scope: path.scope, adapter, path }), expected);
  });
}

// --- patternFullyConsumed ---

// a hop whose slot DEFAULT is quiet is consumed once the pattern in its left is; an effectful default
// runs where it stands, and an unclaimed sibling or a rest keeps the level
for (const [name, source, expected] of [
  ['quiet default under a hop', 'const { 0: { from } = {} } = w;', true],
  ['hop without a default', 'const { 0: { from } } = w;', true],
  ['effectful default under a hop', 'const { 0: { from } = make() } = w;', false],
  ['unclaimed sibling', 'const { 0: { from } = {}, 1: x } = w;', false],
  ['rest beside the claim', 'const { 0: { from } = {}, ...rest } = w;', false],
]) {
  runBoth(`fully consumed/${ name }`, source, (adapter, prog, lbl) => {
    const { id } = adapter.pickPath(prog, 'VariableDeclarator').node;
    const claimed = new Set();
    walkAstNodes({
      root: id,
      visit(node) {
        if (isPropertyNode(node) && node.key?.name === 'from') claimed.add(node);
      },
    });
    check(lbl, patternFullyConsumed(id, prop => claimed.has(prop)), expected);
  });
}

finish();
