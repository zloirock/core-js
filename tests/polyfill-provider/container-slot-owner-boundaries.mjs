// Written values belong to their declaring container. A navigation into an opaque value must
// leave that container before resolving its keys, including when the root has no visible binding.
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { staticContainerReceiverName } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import { resolveObjectName } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { mutationShapesReducer } from '../../packages/core-js-polyfill-provider/detect-usage/mutations.js';
import {
  bindingLoopAnchor, collectFileCensus, ownerSourceWritePath, reachingContainerValueNode, usageCrossesLoopBackEdgeReassign,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { adapters, createChecker } from './harness.mjs';

const { check, checkDeep, finish } = createChecker('container-slot-owner-boundaries');

const rows = [
  ['unindexed namesake', `export function make(Format) { const r = new Format(); return r.x.y; }
    export function collect(a) { const r = []; r.push(a.b, a.b); return r; }`, []],
  ['block-local argument', `export function f(g) { const C = [];
    { const a = g(); C.push(a.b, a.b); } return C.x.y; }`, []],
  ['unbound argument', 'const C = []; C.push(a.b, a.b); C.x.y;', []],
  ['computed navigation', 'const C = []; C.push(a["b"], a["b"]); C.x.y;', []],
  ['optional navigation', 'const C = []; C.push(a?.b, a?.b); C.x.y;', []],
  ['wrapped navigation', 'const C = []; C.push((a.b as any), (a.b as any)); C.x.y;', []],
  ['nested navigation', 'const C = []; C.push(a.b.c, a.b.c); C.x.y;', []],
  ['bound argument', 'function f(a) { const C = []; C.push(a.b, a.b); return C.x.y; }', []],
  ['known member value', 'const a = { b: Map }; const C = []; C.push(a.b, a.b); C[0].y;', ['Map']],
  ['separate known member values', 'const a = { b: Map, c: Set }; const C = []; C.push(a.b, a.c); C[0].y;', ['Map', 'Set']],
];
let checked = 0;
for (const parser of adapters) for (const method of ['usage-global', 'usage-pure']) {
  for (const [name, source, expected] of rows) {
    const program = parser.parseAndScope(source);
    const read = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'y');
    const census = collectFileCensus(program.node, [mutationShapesReducer()]);
    const options = {
      method,
      getWrittenContainerSlots: () => census.writtenContainerSlots,
      getContainerSlotIndex: () => census.containerSlotIndex,
    };
    const adapter = parser.name === 'babel' ? createBabelAdapter(options) : createEstreeAdapter(options);
    const writtenValues = adapter.writtenContainerSlotValues;
    let queries = 0;
    // Fail deterministically before an accidental wildcard cycle expands exponentially.
    adapter.writtenContainerSlotValues = (...args) => {
      if (++queries > 20) throw new Error(`${ name }: repeated container slot queries`);
      return writtenValues(...args);
    };
    const candidates = [];
    const primary = staticContainerReceiverName({
      node: read.node.object, scope: read.scope, adapter, path: read, unionSink: candidates,
    });
    const label = `${ parser.name }: ${ method }: ${ name }`;
    check(`${ label }: primary`, primary, null);
    checkDeep(`${ label }: candidates`, candidates, method === 'usage-global' ? expected : []);
    checked++;
  }

  const program = parser.parseAndScope(`function first(Format) { const r = new Format(); return r; }
    function second() { const r = []; r.push(Map); return r; }`);
  const census = collectFileCensus(program.node, [mutationShapesReducer()]);
  const options = {
    method,
    getWrittenContainerSlots: () => census.writtenContainerSlots,
    getContainerSlotIndex: () => census.containerSlotIndex,
  };
  const adapter = parser.name === 'babel' ? createBabelAdapter(options) : createEstreeAdapter(options);
  const [opaque, array] = parser.collectPaths(program, 'VariableDeclarator', path => path.node.id.name === 'r');
  const label = `${ parser.name }: ${ method }: declaration identity`;
  check(`${ label }: unindexed owner has no writes`, adapter.isWrittenContainerSlot('r', ['0'], opaque.node), false);
  checkDeep(`${ label }: unindexed owner has no values`, adapter.writtenContainerSlotValues('r', ['0'], opaque.node), []);
  check(`${ label }: indexed owner keeps writes`, adapter.isWrittenContainerSlot('r', ['0'], array.node), true);
  checkDeep(`${ label }: indexed owner keeps values`,
    adapter.writtenContainerSlotValues('r', ['0'], array.node).map(node => node.name), ['Map']);
  checkDeep(`${ label }: name-only lookup keeps its union`,
    adapter.writtenContainerSlotValues('r', ['0']).map(node => node.name), ['Map']);
  const legacy = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method,
    getWrittenContainerSlots: () => new Map([['r.0', [array.node.init]]]),
  });
  check(`${ label }: a name-keyed adapter without an index keeps its writes`, legacy.isWrittenContainerSlot('r', ['0']), true);
  checkDeep(`${ label }: a name-keyed adapter without an index keeps its values`,
    legacy.writtenContainerSlotValues('r', ['0']), [array.node.init]);
  // Source-preserving clones keep their own declaration, including Babel's loc-only form.
  for (const [kind, original, expected] of [['indexed', array.node, ['Map']], ['unindexed', opaque.node, []]]) {
    for (const clone of [{ ...original }, { ...original, start: undefined, end: undefined }]) {
      if (clone.start === undefined && !clone.loc?.start?.index) continue;
      checkDeep(`${ label }: ${ kind } clone keeps its values`,
        adapter.writtenContainerSlotValues('r', ['0'], clone).map(node => node.name), expected);
    }
  }
  const unknown = { ...array.node, start: -2, end: -1 };
  check(`${ label }: a different source position owns no writes`, adapter.isWrittenContainerSlot('r', ['0'], unknown), false);
  const writesProgram = parser.parseAndScope('const box = { value: Array }; box.value = {}; box.value.from;');
  const writesCensus = collectFileCensus(writesProgram.node, [mutationShapesReducer()]);
  const writesAdapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method,
    getWrittenContainerSlots: () => writesCensus.writtenContainerSlots,
    getContainerSlotIndex: () => writesCensus.containerSlotIndex,
  });
  const owner = parser.pickPath(writesProgram, 'VariableDeclarator').node;
  const usage = parser.pickPath(writesProgram, 'MemberExpression', path => path.node.property.name === 'from');
  for (const node of [owner, { ...owner }]) {
    check(`${ label }: a dominating write survives cloning`,
      writesAdapter.containerSlotWriteDominatesUsage(['value'], node, usage, usage.node), true);
  }
  // Synthesized declarations have no source span: only that exact node owns their records.
  const synthetic = parser.parseAndScope('const box = []; box.push(Map);');
  const syntheticOwner = parser.pickPath(synthetic, 'VariableDeclarator').node;
  delete syntheticOwner.start;
  delete syntheticOwner.end;
  delete syntheticOwner.loc;
  const syntheticCensus = collectFileCensus(synthetic.node, [mutationShapesReducer()]);
  const syntheticAdapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method,
    getWrittenContainerSlots: () => syntheticCensus.writtenContainerSlots,
    getContainerSlotIndex: () => syntheticCensus.containerSlotIndex,
  });
  check(`${ label }: synthesized owner keeps its writes`, syntheticAdapter.isWrittenContainerSlot('box', ['0'], syntheticOwner), true);
  check(`${ label }: unrelated synthesized node has no writes`, syntheticAdapter.isWrittenContainerSlot('box', ['0'], { ...syntheticOwner }), false);
  for (const [name, source, expected] of [
    ['pattern alias', 'const box = { item: Array }; const alias = box; box.item = {}; const { item } = alias; item.from;', null],
    ['alias chain', 'const box = { item: Array }; const a = box; const b = a; box.item = {}; const { item } = b; item.from;', null],
    ['array pattern alias', 'const box = [Array]; const alias = box; box[0] = {}; const [item] = alias; item.from;', null],
    ['clean alias slot', 'const box = { item: Array, other: 0 }; const alias = box; box.other = {}; const { item } = alias; item.from;', 'Array'],
    ['class slot', 'class Box { static item = Array; } Box.item = {}; Box.item.from;', null],
    ['clean class slot', 'class Box { static item = Array; } Box.other = {}; Box.item.from;', 'Array'],
  ]) {
    const tree = parser.parseAndScope(source);
    const data = collectFileCensus(tree.node, [mutationShapesReducer()]);
    const reader = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method,
      getWrittenContainerSlots: () => data.writtenContainerSlots,
      getContainerSlotIndex: () => data.containerSlotIndex,
    });
    const read = parser.pickPath(tree, 'MemberExpression', path => path.node.property.name === 'from');
    const context = { scope: read.scope, adapter: reader, path: read };
    const actual = read.node.object.type === 'Identifier'
      ? resolveObjectName({ objectNode: read.node.object, ...context })
      : staticContainerReceiverName({ node: read.node.object, ...context });
    check(`${ label }: ${ name }`, actual, method === 'usage-pure' ? expected : 'Array');
  }
  const classTree = parser.parseAndScope('class Box { static item = Array; } Box.item = Map; Box.item.groupBy;');
  const classData = collectFileCensus(classTree.node, [mutationShapesReducer()]);
  const classAdapter = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
    method,
    getWrittenContainerSlots: () => classData.writtenContainerSlots,
    getContainerSlotIndex: () => classData.containerSlotIndex,
  });
  const classRead = parser.pickPath(classTree, 'MemberExpression', path => path.node.property.name === 'groupBy');
  const classBinding = classAdapter.getBinding(classRead.scope, 'Box', classRead);
  check(`${ label }: class declarations retain their loop anchor`, bindingLoopAnchor(classBinding).decl?.name, 'Box');
  const classCandidates = [];
  staticContainerReceiverName({ node: classRead.node.object, scope: classRead.scope, adapter: classAdapter, path: classRead,
    unionSink: classCandidates });
  check(`${ label }: global follows values written to class fields`, classCandidates.includes('Map'), method === 'usage-global');
  for (const [name, source, expected] of [
    ['assignment capture', 'let item; const box = { item: Array }; item = box.item; box.item = {}; item.from;', 'Array'],
    ['var sibling capture', 'let item; { var box = { item: Array }; item = box.item; } { var box = { item: {} }; box.item = {}; } item.from;', 'Array'],
    ['conditional capture', 'let item; const box = { item: Array }; if (unknown) item = box.item; item.from;', null],
    ['pattern write belongs to the registry', 'let item; ({ Array: item } = globalThis); item.from;', null],
    ['repeated pattern writes belong to the registry', 'let item; ({ Map: item } = globalThis); ({ Array: item } = globalThis); item.from;', null],
    ['nested class capture', 'function test() { (() => { class Box { static item = Array; } const item = Box.item; Box.item = {}; item.from; })(); }', 'Array'],
    ['deferred class capture', 'class Box { static item = Array; } function test() { const item = Box.item; item.from; } Box.item = {};', null],
  ]) {
    const tree = parser.parseAndScope(source);
    const data = collectFileCensus(tree.node, [mutationShapesReducer()]);
    const reader = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({
      method,
      getWrittenContainerSlots: () => data.writtenContainerSlots,
      getContainerSlotIndex: () => data.containerSlotIndex,
    });
    const read = parser.pickPath(tree, 'MemberExpression', path => path.node.property.name === 'from');
    if (method === 'usage-pure' || expected) check(`${ label }: ${ name }`, staticContainerReceiverName({
      node: read.node.object, scope: read.scope, adapter: reader, path: read,
    }), expected);
  }
  for (const [name, source, expected] of [
    ['later loop-head write', 'let item; item = Array; for (item of [Map]) {} item.from;', null],
    ['earlier loop-head write', 'let item; for (item of [Map]) {} item = Array; item.from;', 'Array'],
  ]) {
    const tree = parser.parseAndScope(source);
    const reader = (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)({ method });
    const read = parser.pickPath(tree, 'MemberExpression', path => path.node.property.name === 'from');
    const binding = reader.getBinding(read.scope, 'item', read);
    const reached = reachingContainerValueNode(binding, {
      node: read.node.object, readNode: read.node.object, ctx: { scope: read.scope, adapter: reader, path: read },
    });
    check(`${ label }: ${ name }`, reached?.name ?? null, method === 'usage-pure' ? expected : 'Array');
  }
  for (const [name, source, expected] of [
    ['fresh invocation var', 'for (;;) (() => { var box = Array; box.from; box = {}; })();', false],
    ['outer invocation var', 'var box = Array; for (;;) (() => { box.from; box = {}; })();', true],
    ['inner loop var', '(() => { var box = Array; for (;;) { box.from; box = {}; } })();', true],
    ['fresh static block var', 'for (;;) { class Box { static { var box = Array; box.from; box = {}; } } }', false],
  ]) {
    const tree = parser.parseAndScope(source);
    const read = parser.pickPath(tree, 'MemberExpression', path => path.node.property.name === 'from');
    const declaration = parser.pickPath(tree, 'VariableDeclarator', path => path.node.id.name === 'box');
    const write = parser.pickPath(tree, 'AssignmentExpression');
    check(`${ label }: ${ name }`, usageCrossesLoopBackEdgeReassign(read, [write.node], {
      decl: declaration.node.id, kind: 'var',
    }), expected);
  }
  const writesTree = parser.parseAndScope('let box; box = 1; box = 2;');
  let indexWalks = 0;
  const unreadOwner = { traverse() { indexWalks++; } };
  for (const node of [
    { type: 'Identifier', name: 'box' },
    { type: 'MemberExpression', object: { type: 'Identifier', name: 'box' }, property: { type: 'Identifier', name: 'x' }, computed: false },
    { type: 'ArrayExpression', elements: [] },
  ]) check(`${ label }: ${ node.type } cannot be a source write`, ownerSourceWritePath(unreadOwner, node), null);
  check(`${ label }: read queries do not build an owner write index`, indexWalks, 0);
  const [firstWrite, secondWrite] = parser.collectPaths(writesTree, 'AssignmentExpression');
  check(`${ label }: live source write`, ownerSourceWritePath(writesTree, firstWrite.node)?.node, firstWrite.node);
  check(`${ label }: cloned source write`, ownerSourceWritePath(writesTree, { ...firstWrite.node })?.node, firstWrite.node);
  check(`${ label }: a different node type has no matching write`,
    ownerSourceWritePath(writesTree, { ...firstWrite.node, type: 'UpdateExpression' }), null);
  check(`${ label }: a positionless clone has no matching write`,
    ownerSourceWritePath(writesTree, { ...firstWrite.node, start: undefined, end: undefined, loc: undefined }), null);
  const ambiguous = parser.parseAndScope('let box; box = 1; box = 2;');
  const [one, two] = parser.collectPaths(ambiguous, 'AssignmentExpression');
  Object.assign(two.node, { start: one.node.start, end: one.node.end, loc: one.node.loc });
  check(`${ label }: duplicated positions cannot prove a unique write`, ownerSourceWritePath(ambiguous, { ...one.node }), null);
  check(`${ label }: distinct writes keep their own identity`, ownerSourceWritePath(writesTree, secondWrite.node)?.node, secondWrite.node);
  checked++;
}
check('all rows were checked', checked, adapters.length * 2 * (rows.length + 1));
finish();
