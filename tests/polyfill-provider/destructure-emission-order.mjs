// Live residuals and captured receivers retain their order after child rewrites.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import {
  assignmentNeedsReceiverMemo,
  buildNestedDestructurePlan,
  destructureResidualFirst,
  orderDestructureParts,
  partitionDestructureReads,
  releasedDestructureCaptureTail,
  symbolIteratorMemberTarget,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { peelTransparentExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('destructure-emission-order');

function context(parser, path) {
  const adapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method: 'usage-pure' });
  return { scope: path.scope, path, adapter };
}

runBoth('flat, nested, kept keys and guarded reads retain their obligations',
  'const { from: flat, other, Array: { of: nested }, [(key(), "Map")]: keyed, after } = globalThis;',
  (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    const sourceProps = [...host.node.id.properties];
    const [flat, other, hop, keyed, guarded] = sourceProps;
    const reads = [
      { prop: flat, name: 'flat' },
      { prop: hop.value.properties[0], chain: [{ hopProp: hop }], name: 'nested' },
      { prop: keyed, sentinel: true, name: 'keyed' },
      { prop: guarded, guardDetach: 'after', name: 'guarded' },
    ];
    const ctx = context(parser, host);
    const before = JSON.stringify(host.node);
    const partition = partitionDestructureReads(reads, () => ctx);
    checkDeep(`${ label } early reads`, partition.before.map(read => read.name), ['flat']);
    checkDeep(`${ label } late reads`, partition.after.map(read => read.name), ['nested', 'keyed', 'guarded']);
    check(`${ label } key needs its native evaluation`, partition.keyFirst, true);
    const residual = { source: other, name: 'residual' };
    function names(parts, residuals, facts = {}) {
      return orderDestructureParts(parts, residuals, { sourceProps, ...facts }).map(part => part.name);
    }
    checkDeep(`${ label } key before lookup`, names(partition, [residual]), ['residual', 'flat', 'nested', 'keyed', 'guarded']);
    const quiet = partitionDestructureReads(reads.filter(read => read.name !== 'keyed'), () => ctx);
    checkDeep(`${ label } quiet residual`, names(quiet, [residual]), ['flat', 'residual', 'nested', 'guarded']);
    checkDeep(`${ label } running initializer`, names(quiet, [residual], { initRuns: true }), ['residual', 'flat', 'nested', 'guarded']);
    checkDeep(`${ label } initializer already captured`, names(quiet, [residual], { initRuns: true, captured: true }),
      ['flat', 'residual', 'nested', 'guarded']);
    const anchors = [{ ...residual, anchored: true }, { source: hop, anchored: true, name: 'hop residual' }];
    checkDeep(`${ label } split anchored slots`, names(quiet, anchors), ['flat', 'residual', 'nested', 'hop residual', 'guarded']);
    checkDeep(`${ label } an anchored key still precedes its read`, names(partition, anchors),
      ['residual', 'hop residual', 'flat', 'nested', 'keyed', 'guarded']);
    checkDeep(`${ label } full consume ignores registration order`, names({ before: [reads[3], reads[0]], after: [reads[1]] }, []),
      ['flat', 'nested', 'guarded']);
    checkDeep(`${ label } earliest retained source slot`, names(quiet, [{ sourceProps: [other, guarded], anchored: true, name: 'residual' }]),
      ['flat', 'residual', 'nested', 'guarded']);
    checkDeep(`${ label } a synthetic slot follows known source slots`,
      names({ before: [{ name: 'synthetic' }, reads[0]], after: [] }, []), ['flat', 'synthetic']);
    checkDeep(`${ label } speculative query does not reorder records`, reads.map(read => read.name), ['flat', 'nested', 'keyed', 'guarded']);
    check(`${ label } source unchanged`, JSON.stringify(host.node), before);
    keyed.key = flat.key;
    check(`${ label } a later key rewrite is read live`, partitionDestructureReads(reads, () => ctx).keyFirst, false);
  });

runBoth('declaration groups retain initializer, capture and source-slot prerequisites',
  'const { keep, Array: { of: nested }, from: flat, [(key(), "Map")]: keyed, last } = getRealm();',
  (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator');
    const sourceProps = [...host.node.id.properties];
    const [keep, hop, flat, keyed, last] = sourceProps;
    const ctx = context(parser, host);
    const reads = [
      { prop: flat, name: 'flat' },
      { prop: hop.value.properties[0], chain: [{ hopProp: hop }], readsReceiver: true, name: 'nested' },
      { prop: last, guardDetach: 'after', name: 'guard' },
    ];
    const before = JSON.stringify(host.node);
    const partition = partitionDestructureReads(reads, () => ctx, { grouped: true });
    const residual = { name: 'residual' };
    checkDeep(`${ label } nested receiver orders its whole group`,
      orderDestructureParts(partition, [residual]).map(part => part.name), ['residual', 'flat', 'nested', 'guard']);
    reads[1].readsReceiver = false;
    const quiet = partitionDestructureReads(reads, () => ctx, { grouped: true });
    checkDeep(`${ label } receiverless nested read does not move the group`,
      orderDestructureParts(quiet, [residual]).map(part => part.name), ['flat', 'nested', 'residual', 'guard']);
    const keyedReads = [{ prop: keyed, sentinel: true, name: 'keyed' }, ...reads];
    checkDeep(`${ label } effectful key keeps registration order within its group`,
      orderDestructureParts(partitionDestructureReads(keyedReads, () => ctx, { grouped: true }), [residual])
        .map(part => part.name), ['residual', 'keyed', 'flat', 'nested', 'guard']);
    check(`${ label } running live initializer`, destructureResidualFirst(reads, { ...ctx, init: host.node.init }), true);
    check(`${ label } whole initializer already captured`,
      destructureResidualFirst(reads, { ...ctx, init: host.node.init, captured: true }), false);
    check(`${ label } quiet initializer`, destructureResidualFirst(reads, { ...ctx, init: flat.key }), false);
    reads[0].captureInResidual = true;
    check(`${ label } a slot capture still runs in its residual`,
      destructureResidualFirst(reads, { ...ctx, init: host.node.init, captured: true }), true);
    delete reads[0].captureInResidual;
    const anchor = { anchored: true, pattern: { type: 'ObjectPattern', properties: [keep] }, sourceProps, initRuns: false };
    check(`${ label } earlier anchored source slot`, destructureResidualFirst(reads, anchor), true);
    anchor.pattern.properties = [last];
    check(`${ label } later anchored source slot`, destructureResidualFirst(reads, anchor), false);
    anchor.pattern.properties = [keep];
    check(`${ label } unanchored residual keeps its native position`,
      destructureResidualFirst(reads, { ...anchor, anchored: false }), false);
    check(`${ label } source untouched by all order questions`, JSON.stringify(host.node), before);
    keyedReads[0].seKey = true;
    keyed.key = flat.key;
    check(`${ label } a deferred group retains its source key proof`,
      partitionDestructureReads(keyedReads, () => ctx, { grouped: true }).keyFirst, true);
    check(`${ label } a live assignment asks its current key`,
      partitionDestructureReads(keyedReads, () => ctx).keyFirst, false);
  });

for (const size of [64, 128]) runBoth(`source-order lookup cost/${ size }`,
  `const { ${ Array.from({ length: size }, (_, index) => `p${ index }`).join(', ') } } = source;`,
  (parser, program, label) => {
    const { properties } = parser.pickPath(program, 'VariableDeclarator').node.id;
    let reads = 0;
    const sourceProps = new Proxy(properties, {
      get(target, key, receiver) {
        if (typeof key === 'string' && /^\d+$/.test(key)) reads++;
        return Reflect.get(target, key, receiver);
      },
    });
    const parts = properties.map(source => ({ source })).reverse();
    checkDeep(`${ label } original order`, orderDestructureParts({ before: parts, after: [] }, [], { sourceProps })
      .map(part => part.source), properties);
    check(`${ label } no repeated scans of source slots`, reads <= size, true);
  });

for (const [receiver, setup, reusable] of [
  ['rows', 'const rows = [];', true],
  ['this', '', true],
  ['rows', 'let rows = []; function rebind() { rows = other; }', false],
  ['holder.rows', '', false],
  ['getRows()', '', false],
  ['[1, 2]', '', false],
  ['flag ? globalThis : globalThis', '', true],
]) runBoth(`assignment capture/${ receiver }/${ setup }`,
  `function read(flag) { ${ setup } let first, second, other; ({ at: first, includes: second, other } = ${ receiver }); }`,
  (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression', path => path.node.left.type === 'ObjectPattern');
    const paths = host.get('left').get('properties');
    const reads = paths.slice(0, 2).map(path => ({ prop: path.node, metaPath: path, readsReceiver: true }));
    const ctx = context(parser, host);
    host.node.left.properties.splice(0, 2);
    const before = JSON.stringify(host.node);
    check(`${ label } residual shares the capture`, assignmentNeedsReceiverMemo(host.node, reads.slice(0, 1), ctx), !reusable);
    check(`${ label } multiple extractions share the capture`, assignmentNeedsReceiverMemo(host.node, reads, ctx), !reusable);
    check(`${ label } receiverless extraction`, assignmentNeedsReceiverMemo(host.node, reads.map(read => ({ ...read, readsReceiver: false })), ctx), false);
    check(`${ label } speculative capture query`, JSON.stringify(host.node), before);
    host.node.left.properties = [];
    check(`${ label } sole remaining reader`, assignmentNeedsReceiverMemo(host.node, reads.slice(0, 1), ctx), false);
    check(`${ label } two remaining readers`, assignmentNeedsReceiverMemo(host.node, reads, ctx), !reusable);
    if (receiver === '[1, 2]') {
      check(`${ label } native literal overwrites keep their receiver`,
        assignmentNeedsReceiverMemo(host.node, reads.map(read => ({ ...read, keepSentinelBinding: true })), ctx), false);
    }
  });

for (const [receiver, released] of [['rows', true], ['holder.rows', false], ['getRows()', false], ['Array.prototype', true], ['[1, 2]', false]]) {
  runBoth(`completed capture/${ receiver }`, `const rows = []; const held = (effect(), ${ receiver });`, (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'held');
    const init = peelTransparentExpr(host.node.init);
    const ctx = context(parser, host);
    const before = JSON.stringify(init);
    const tail = releasedDestructureCaptureTail(init, ctx);
    check(`${ label } shared reuse proof`, !!tail, released);
    if (released) check(`${ label } original tail identity`, tail, init.expressions.at(-1));
    check(`${ label } prefix remains owned by source`, JSON.stringify(init), before);
    check(`${ label } no completed sequence capture`, releasedDestructureCaptureTail(init.expressions.at(-1), ctx), null);
  });
}

for (const [target, sibling, accepted, key = 'Symbol.iterator'] of [
  ['sink.method', ', other', true], ['sink[key()]', ', other', false], ['sink[key()]', '', true],
  ['sink.method = fallback', ', other', false], ['getSink().method', '', false],
  ['sink.method', ', other', false, '(effect(), Symbol.iterator)'],
]) runBoth(`iterator write target/${ target }/${ sibling }`,
  `let other; ({ [${ key }]: ${ target }${ sibling } } = globalThis);`, (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression');
    const [prop] = host.node.left.properties;
    const before = JSON.stringify(host.node);
    const targetNode = symbolIteratorMemberTarget(prop, 'get-iterator-method', { hostPattern: host.node.left, ctx: context(parser, host) });
    check(`${ label } ordered target admission`, !!targetNode, accepted);
    if (accepted) check(`${ label } original target identity`, targetNode, prop.value);
    check(`${ label } unrelated instance leaf`, symbolIteratorMemberTarget(prop, 'instance/at', { hostPattern: host.node.left }), null);
    check(`${ label } read-only query`, JSON.stringify(host.node), before);
  });

runBoth('an iterator member write shares the ordered constructor plan',
  '({ Set: { customSet: sink.left }, [Symbol.iterator]: sink.middle, Map: { customMap: sink.right } } = globalThis);',
  (parser, program, label) => {
    const host = parser.pickPath(program, 'AssignmentExpression');
    const ctx = context(parser, host);
    const before = JSON.stringify(host.node);
    const plan = buildNestedDestructurePlan({
      declarator: { id: host.node.left, init: host.node.right }, ...ctx, resolvePure: () => null,
      resolveGlobalPolyfill: name => ['Set', 'Map'].includes(name) ? { entry: `${ name.toLowerCase() }/constructor` } : null,
    });
    checkDeep(`${ label } all three source slots`, plan.outerProps.map(part => part.kind), ['anchored', 'consumed', 'anchored']);
    check(`${ label } live member target`, plan.outerProps[1].extractions[0].targetNode, host.node.left.properties[1].value);
    check(`${ label } receiver helper remains selected`, plan.outerProps[1].extractions[0].synth, 'symbol-iterator');
    check(`${ label } source stays intact`, JSON.stringify(host.node), before);
  });

runBoth('fully consumed source groups', 'const { from, of } = Array, after = later();', (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator');
  const [first, second] = host.node.id.properties;
  const reads = [{ name: 'second', sourceAt: second.start }, { name: 'first', sourceAt: first.start }];
  const initializers = [{ name: 'initializer' }];
  const snapshot = JSON.stringify(program.node);
  const ordered = orderDestructureParts({ before: reads, after: [], initializers }, []);
  checkDeep(`${ label }/source position survives consumed properties`, ordered.map(part => part.name), ['initializer', 'first', 'second']);
  check(`${ label }/initializer identity`, ordered[0], initializers[0]);
  checkDeep(`${ label }/input not sorted in place`, reads.map(part => part.name), ['second', 'first']);
  check(`${ label }/native host untouched`, JSON.stringify(program.node), snapshot);
});

finish();
