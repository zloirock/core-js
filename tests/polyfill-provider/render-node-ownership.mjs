// Each output position owns its node, even before either host prints or reparses it.
import { createChecker } from './harness.mjs';
import {
  assignmentExpression,
  cloneNode,
  hostSlot,
  identifier,
  memberExpression,
  memberFromKeyName,
  renderDeclinedNavigation,
  renderOuterCollapseValue,
  renderProxyReceiverPlan,
  renderResolvedStaticClaim,
} from '../../packages/core-js-polyfill-provider/render.js';
import { proxyCollapseBase } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { renderSynthTree } from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import {
  renderArrayDestructurePlan, renderNestedKeyedPatternCapture, renderRetainedObjectCapture,
} from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { unwrapRuntimeExpr } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';

const { check, checkDeep, finish, runBoth } = createChecker('render-node-ownership');

for (const [key, property] of [
  ['0', 0],
  ['01', '01'],
  ['9007199254740993', '9007199254740993'],
  ['', ''],
]) {
  const member = memberFromKeyName(identifier('holder'), key);
  check(`computed key/${ key }`, member.computed, true);
  check(`exact property/${ key }`, member.property.value, property);
}

function sharedNodes(root) {
  const seen = new Set();
  const shared = [];
  function visit(node) {
    if (Array.isArray(node)) {
      for (const child of node) visit(child);
    } else if (node && typeof node.type === 'string') {
      if (seen.has(node)) {
        shared.push(node.type);
        return;
      }
      seen.add(node);
      for (const [key, value] of Object.entries(node)) if (!key.endsWith('Comments')) visit(value);
    }
  }
  visit(root);
  return shared;
}

const control = identifier('shared');
checkDeep('the identity oracle detects two output slots', sharedNodes([control, control]), ['Identifier']);

for (const carrySource of [false, true]) for (const embedded of [false, true]) {
  runBoth(`kept store/${ carrySource }/${ embedded }`, 'let held; (held /* store */ = source).self.Map;',
    (parser, program, label) => {
      const store = parser.pickPath(program, 'AssignmentExpression').node;
      const hop = parser.pickPath(program, 'MemberExpression', path => path.node.property.name === 'self').node;
      const base = proxyCollapseBase({ keptStore: store, earlyReadReceiver: hop });
      const before = JSON.stringify(store);
      const context = { injectImport: () => '_pure', embed: embedded ? hostSlot : node => node,
        cloneHost: carrySource ? node => node : cloneNode };
      const renders = [
        renderProxyReceiverPlan({ kind: 'collapse', rootBinding: base, harvestedSE: [],
          property: identifier('Map'), computed: false }, { ...context, carrySource }),
        renderDeclinedNavigation({ base, effects: [] }, context),
        renderResolvedStaticClaim({ base, effects: [] }, context),
        renderOuterCollapseValue({ kind: 'store', base, prefix: [] }, context),
      ];
      for (const [index, rendered] of renders.entries()) checkDeep(`${ label }/route ${ index }/owned positions`, sharedNodes(rendered), []);
      check(`${ label }/source is unchanged`, JSON.stringify(store), before);
    });
}

// An alias can also occur inside a harvested write; moving the write must preserve its identity.
for (const carrySource of [false, true]) {
  const alias = identifier('realm');
  const store = assignmentExpression('=', identifier('held'), alias);
  const context = { carrySource, cloneHost: carrySource ? node => node : cloneNode, injectImport: () => '_pure' };
  const renders = [
    renderProxyReceiverPlan({ kind: 'collapse', rootBinding: { alias }, harvestedSE: [store],
      property: identifier('Array'), computed: false }, context),
    renderDeclinedNavigation({ base: { alias }, effects: [store] }, context),
    renderResolvedStaticClaim({ base: { alias }, effects: [store] }, context),
    renderOuterCollapseValue({ kind: 'store', base: { alias }, prefix: [store] }, context),
  ];
  for (const [index, rendered] of renders.entries()) checkDeep(`harvested alias/${ carrySource }/route ${ index }`, sharedNodes(rendered), []);
  if (carrySource) check('harvested write keeps its scope identity', renders[0].object.expressions[0], store);
}

for (const embedded of [false, true]) runBoth(`synth reads/${ embedded }`, 'const value = realm.Array.prototype;',
  (parser, program, label) => {
    const receiver = parser.pickPath(program, 'VariableDeclarator').node.init;
    const source = embedded ? hostSlot(receiver) : receiver;
    const tree = { kind: 'object', entries: [
      { key: 'at', child: { kind: 'instance', entry: 'array/instance/at', hintName: 'at' } },
      { key: 'flat', child: { kind: 'instance', entry: 'array/instance/flat', hintName: 'flat' } },
      { key: 'other', deferred: true, child: { kind: 'array', elements: [null, { kind: 'passthrough' }] } },
      { key: 'lazy', deferred: true, child: { kind: 'receiver', child: { kind: 'object', entries: [
        { key: 'at', deferred: true, child: { kind: 'instance', entry: 'instance/at', hintName: 'at' } },
      ] } } },
    ] };
    const ctx = {
      receiverNode: source, injectImport: (entry, hint) => `_${ hint }`,
      mintLocalRef: () => 'captured', resolveGlobalPolyfill: () => null,
    };
    const before = JSON.stringify(ctx);
    const result = renderSynthTree(tree, ctx);
    checkDeep(`${ label }/owned positions`, sharedNodes(result), []);
    check(`${ label }/context is unchanged`, JSON.stringify(ctx), before);
    const [first] = result.properties[0].value.arguments;
    const [second] = result.properties[1].value.arguments;
    check(`${ label }/separate receiver reads`, first !== second, true);
    const secondNode = embedded ? second.node : second;
    const firstNode = embedded ? first.node : first;
    firstNode.property.name = 'changed';
    check(`${ label }/a later receiver is isolated from edits`, secondNode.property.name, 'prototype');
  });

// A lone read consumes the supplied slot without copying. Recursive arrays and symbol
// entries share that one allowance, including through a root prefix.
for (const count of [0, 1, 3]) {
  const receiver = identifier('receiver');
  let copies = 0;
  const tree = { kind: 'array', elements: Array.from({ length: count }, () => ({ kind: 'object', entries: [
    { key: 'iterator', symbolKey: { entry: 'symbol/iterator', hintName: 'iterator' }, child: { kind: 'passthrough' } },
  ] })) };
  const result = renderSynthTree(tree, { receiverNode: receiver, receiverPrefix: identifier('prefix'),
    repeatReceiver(node) { copies++; return cloneNode(node); }, injectImport: () => '_iterator' });
  check(`recursive reads/${ count }/only repeated slots copy`, copies, Math.max(0, count - 1));
  checkDeep(`recursive reads/${ count }/owned positions`, sharedNodes(result), []);
}

for (const assignment of [false, true]) runBoth(`retained default/${ assignment }`,
  assignment ? 'let at; ({ at = fallback(), extra } = rows);' : 'const { at = fallback(), extra } = rows;',
  (parser, program, label) => {
    const host = parser.pickPath(program, assignment ? 'AssignmentExpression' : 'VariableDeclarator').node;
    const pattern = assignment ? host.left : host.id;
    let minted = 0;
    const result = renderRetainedObjectCapture({ pattern, prop: pattern.properties[0], assignment,
      init: assignment ? host.right : host.init }, {
      mintRef: () => `ref${ ++minted }`, mintDeclaredRef: () => `ref${ ++minted }`,
      injectImport: () => '_at', entry: 'array/instance/at',
    });
    checkDeep(`${ label }/owned positions`, sharedNodes(result.expression ?? result.declarations), []);
    check(`${ label }/receiver and default each mint once`, minted, 2);
  });

runBoth('rest exclusions', 'let from, of, rest; ({ from, of, ...rest } = Array);', (parser, program, label) => {
  const host = parser.pickPath(program, 'AssignmentExpression').node;
  const [from, of, rest] = host.left.properties;
  let minted = 0;
  const result = renderRetainedObjectCapture({ pattern: host.left, prop: from, rest, assignment: true,
    retainedStatic: true, init: host.right, siblingStatics: new Map([[of, { key: 'of', entry: 'array/of' }]]) }, {
    mintRef: () => `ref${ ++minted }`, mintDeclaredRef: () => `ref${ ++minted }`,
    mintUnused: () => `unused${ ++minted }`, injectImport: () => '_from', entry: 'array/from',
  });
  checkDeep(`${ label }/owned positions`, sharedNodes(result.expression), []);
  check(`${ label }/one receiver and one exclusion binding`, minted, 2);
});

runBoth('interleaved iterator', 'const [{ at }, tail] = rows;', (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator').node;
  const [claimPattern, tail] = host.id.elements;
  const extraction = { prop: claimPattern.properties[0] };
  let minted = 0;
  const rendered = renderArrayDestructurePlan({ array: { interleavedIterator: {
    receiver: host.init, extraction, claimPattern, tailPattern: host.id, tail, claimIndex: 0,
  } } }, {
    kind: 'const', embed: node => node,
    mintRef: () => `ref${ ++minted }`, injectImport: (entry, hint) => `_${ hint }`,
    read: (plan, receiver) => memberExpression(receiver, identifier('at')),
  });
  checkDeep(`${ label }/owned positions`, sharedNodes(rendered), []);
  check(`${ label }/one name for each binding`, minted, 4);
});

for (const dropsResidual of [false, true]) runBoth(`array memo/${ dropsResidual }`,
  'const [{ at = fallback(), flat }] = [rows];', (parser, program, label) => {
    const host = parser.pickPath(program, 'VariableDeclarator').node;
    const [receiver] = host.init.elements;
    let minted = 0;
    const result = renderArrayDestructurePlan({
      array: { memos: [receiver], inDeclaration: true, leading: [], discarded: [], dropsResidual,
        initElements: [receiver], residualPattern: { ...host.id, elements: [] }, elements: [] },
      extractions: host.id.elements[0].properties.map(prop => ({ prop, receiver,
        targetNode: prop.value.left ?? prop.value, defaultNode: prop.value.right, localName: prop.key.name })),
    }, {
      kind: 'const', init: host.init, embed: node => node,
      mintRef: () => `ref${ ++minted }`, mintDeclaredRef: () => `ref${ ++minted }`,
      read: (plan, value) => memberExpression(value, identifier(plan.localName)),
    });
    checkDeep(`${ label }/owned positions`, sharedNodes(result), []);
    check(`${ label }/one receiver and one default binding`, minted, 2);
  });

runBoth('guarded static sibling default', 'const { at, groupBy = fallback() } = source;', (parser, program, label) => {
  const host = parser.pickPath(program, 'VariableDeclarator').node;
  const [at, groupBy] = host.id.properties;
  const narrow = { branches: [{ ctorName: 'Map', staticPure: { entry: 'map/group-by', hintName: 'groupBy' } }] };
  let minted = 0;
  const result = renderRetainedObjectCapture({ pattern: host.id, prop: at, init: host.init,
    siblingStatics: new Map([[groupBy, { key: 'groupBy', narrow }]]) }, {
    mintRef: () => `ref${ ++minted }`, mintDeclaredRef: () => `ref${ ++minted }`,
    injectImport: (entry, hint) => `_${ hint ?? 'at' }`, entry: 'instance/at',
  });
  checkDeep(`${ label }/owned positions`, sharedNodes(result.declarations), []);
  check(`${ label }/one receiver and one default binding`, minted, 2);
});

for (const splitCapture of [false, true]) for (const anchored of splitCapture ? [false] : [false, true]) {
  for (const preserveResult of [false, true]) runBoth(`keyed result/${ splitCapture }/${ anchored }/${ preserveResult }`,
    'let method; const result = ({ prototype: { at: method } } = source);', (parser, program, label) => {
      const host = unwrapRuntimeExpr(parser.pickPath(program, 'VariableDeclarator', path => path.node.id.name === 'result').node.init);
      const [prop] = host.left.properties;
      let minted = 0;
      const result = renderNestedKeyedPatternCapture({ init: host.right, leafPattern: prop.value,
        leaf: prop.value.properties[0], ancestors: [{ pattern: host.left, prop }], splitCapture }, {
        mintRef: () => `ref${ ++minted }`, assignment: true, preserveResult,
        anchorPure: anchored ? { entry: 'array', hintName: 'Array' } : null, injectImport: () => '_Array',
      });
      checkDeep(`${ label }/owned positions`, sharedNodes(result.expression), []);
      check(`${ label }/one name per captured value`, minted, splitCapture || preserveResult && !anchored ? 2 : 1);
    });
}

finish();
