// Cross-parser tests for the destructure write-order decision, the slot a declined mirror leaves to a
// static's own default, and the plan cache a binding retires when it rewrites a host in place.
import { orderBoundPatternProps } from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import {
  claimWriteOrderBound,
  leafTakesSlotDefault,
  mirrorAcceptedKey,
  orderedClaimCapture,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure.js';
import {
  buildNestedDestructurePlan,
  forgetDestructurePlan,
} from '../../packages/core-js-polyfill-provider/detect-usage/destructure-plan.js';
import { staticSlotTakesDefault } from '../../packages/core-js-polyfill-provider/detect-usage/resolve.js';
import { createBabelAdapter } from '../../packages/core-js-babel-plugin/internals/detect-usage.js';
import { createEstreeAdapter } from '../../packages/core-js-unplugin/internals/detect-usage.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('destructure-write-order');
function propType(parser) {
  return parser.name === 'babel' ? 'ObjectProperty' : 'Property';
}
function keyName(prop) {
  return prop.key?.name ?? prop.key?.value;
}
function adapterFor(parser) {
  return (parser.name === 'babel' ? createBabelAdapter : createEstreeAdapter)();
}
function topOf(host) {
  return host.node.id ?? host.node.left;
}

// the decision itself: which claims keep their native read, per host facts
for (const [source, expected, facts = {}] of [
  // a flat claim is written ahead of the residual: an EARLIER write of its target is overtaken
  ['({ length: a, from: a } = Array);', ['from'], { assignmentTarget: true, claims: ['from'] }],
  ['({ from: a, length: a } = Array);', [], { assignmentTarget: true, claims: ['from'] }],
  // ... a sibling claim is written in turn, so it is no hazard
  ['({ flat: a, flatMap: a } = []);', [], { assignmentTarget: true, claims: ['flat', 'flatMap'] }],
  // a nested claim on an assignment may be overwritten behind the statement: a LATER write counts
  ['({ w: { from: a, length: a } } = { w: Array });', ['from', 'length'], { assignmentTarget: true }],
  // a consumed or bodyless assignment writes slot by slot
  ['({ length: a, from: a } = Array);', [], { assignmentTarget: true, segmented: true }],
  // positional levels capture and write in source order
  ['[{ length: a }, { from: a }] = [Array, Array];', [], { assignmentTarget: true }],
  // an earlier read of the claim's target: a default or a key - and the reader itself, whose default
  // or key reads a LATER slot's target: extracted, it would run after that write
  ['const { nope: z = at, at } = [];', ['at', 'nope']],
  ['const { [at]: z, at } = [];', ['at', 'at']],
  // a later read sees the written binding on a declaration; a closure runs after the pattern there
  ['const { at, foo = at } = [];', []],
  ['const { make = () => from, from } = Array;', []],
  ['({ make = () => from, from } = Array);', ['from', 'make'], { assignmentTarget: true }],
  // a nested claim's default reading a later sibling's target: the TDZ read the source performs
  ['const { w: { at: x = y, flat: y } } = { w: [] };', ['at', 'flat']],
  ['const { w: { [y]: x, flat: y } } = { w: [] };', ['flat', 'y']],
  // a closure parameter of the same name reads nothing of the pattern's
  ['const { mapper = at => at, at } = [];', []],
  // member targets meet by root binding and key path, not by property name alone
  ['({ from: o1.x, of: o2.x } = Array);', [], { assignmentTarget: true }],
  ['({ w: { from: o.x, of: o.x } } = { w: Array });', ['from', 'of'], { assignmentTarget: true }],
  // an earlier slot rebinding a member target's root
  ['({ w: { o, from: o.x } } = { w: Array });', ['from', 'o'], { assignmentTarget: true }],
  // an ordered capture writes the claim's level in source order after the levels above it: only a
  // later slot outside that level counts there
  ['({ w: { nope: a = 1, from: a } } = { w: Array });', [], { assignmentTarget: true, captured: ['from', 'nope'] }],
  ['({ w: { from: a }, v: a } = { w: Array, v: 1 });', ['from', 'v'], { assignmentTarget: true, captured: ['from'] }],
]) runBoth(`order-bound claims: ${ source }`, `let a, o, o1, o2; ${ source }`, (parser, program, label) => {
  const host = parser.pickPath(program, source.startsWith('const') ? 'VariableDeclarator' : 'AssignmentExpression',
    item => !!topOf(item) && topOf(item).type !== 'Identifier');
  const bound = orderBoundPatternProps({
    top: topOf(host),
    assignmentTarget: !!facts.assignmentTarget,
    segmented: !!facts.segmented,
    isClaim: prop => (facts.claims ?? []).includes(keyName(prop)),
    isCaptured: prop => (facts.captured ?? []).includes(keyName(prop)),
  });
  checkDeep(label, [...bound].map(keyName).sort(), expected);
});

// the verdict is taken once off the source tree: bracing the statement afterwards, as a binding does
// when an extraction lands beside a bodyless host, does not flip it, and the plan reads it back
runBoth('order verdict survives a braced bodyless host', 'let a, c; if (c) ({ w: { length: a, from: a } } = { w: Array });',
  (parser, program, label) => {
    const adapter = adapterFor(parser);
    function pick() {
      return parser.pickPath(program, propType(parser), item => keyName(item.node) === 'from');
    }
    // the order binds claims only, so `from` resolves as one
    function claimFrom(meta) {
      return meta?.key === 'from' ? { kind: 'static', entry: 'array/from' } : null;
    }
    function ask(on, prop = pick()) {
      return claimWriteOrderBound({ prop: prop.node, objectPattern: prop.parentPath, adapter: on, resolvePure: claimFrom });
    }
    check(`${ label } bodyless source`, ask(adapter), false);
    const branch = parser.pickPath(program, 'IfStatement').node;
    branch.consequent = { type: 'BlockStatement', body: [branch.consequent], directives: [] };
    check(`${ label } after bracing`, ask(adapter), false);
    const assignment = parser.pickPath(program, 'AssignmentExpression', item => item.node.left?.type === 'ObjectPattern');
    check(`${ label } plan asks the same`, claimWriteOrderBound({
      prop: pick().node, top: assignment.node.left, path: assignment, adapter, resolvePure: claimFrom,
    }), false);
    // a fresh instance reading the braced tree gets the other answer: the cache is what holds it
    check(`${ label } braced tree alone`, ask(adapterFor(parser)), true);
  });

// only a host the extraction splits can reorder: a parameter and a level under an inner default keep
// their pattern whole, so a read ahead of the claim stays where the source wrote it
for (const [source, key] of [
  ['function f({ nope: z = at, at } = []) {}', 'at'],
  ['const { y: { nope: z = at, at } = [] } = {};', 'at'],
]) runBoth(`order verdict of a pattern kept whole: ${ source }`, source, (parser, program, label) => {
  const prop = parser.pickPath(program, propType(parser), item => keyName(item.node) === key);
  check(label, claimWriteOrderBound({ prop: prop.node, objectPattern: prop.parentPath, adapter: adapterFor(parser), resolvePure: () => null }), false);
});

// A split capture writes its own hop before the next native hop. Its own key/default must still
// read a later target before that target is written, so that independent veto remains active.
for (const [field, sibling, expected] of [
  ['[(effect(), "from")]: method', 'keys: box[method]', false],
  ['[(effect(method), "from")]: first', 'keys: method', true],
  ['[(effect(), "from")]: first = method', 'keys: method', true],
]) runBoth(`split capture keeps outer writes/${ field }/${ sibling }`,
  `let method, first; const box = {};
   ({ Array: { ${ field } }, Object: { ${ sibling } } } = globalThis);`, (parser, program, label) => {
    const prop = parser.pickPath(program, propType(parser), item => item.node.computed);
    const adapter = adapterFor(parser);
    adapter.method = 'usage-pure';
    const host = parser.pickPath(program, 'AssignmentExpression', item => item.node.left.type === 'ObjectPattern');
    const capture = orderedClaimCapture({
      pattern: host.node.left,
      init: host.node.right,
      prop: prop.node,
      kind: 'static',
      assignment: true,
      meta: { object: 'Array' },
      hostPath: host,
      adapter,
    });
    check(`${ label } capture keeps sibling order`, capture?.splitCapture, true);
    function claim(meta) {
      return meta?.key === 'from' && meta?.object === 'Array' ? { kind: 'static', entry: 'array/from' } : null;
    }
    check(label, claimWriteOrderBound({ prop: prop.node, objectPattern: prop.parentPath, adapter, resolvePure: claim }), expected);
  });

// Target admissibility alone does not authorize a polyfill fallback after a declined mirror.
for (const [source, key, expected] of [
  ['({ from: a } = Array);', 'from', true],
  ['({ from: a = 1 } = Array);', 'from', true],
  ['const o = {}; ({ from: o.x } = Array);', 'from', true],
  ['({ from: globalThis.x } = Array);', 'from', false],
  ['const o = {}; ({ [(effect(), \'from\')]: o.x } = Array);', null, false],
  ['({ from: { length } } = Array);', 'from', false],
]) runBoth(`static slot default: ${ source }`, `let a, length; ${ source }`, (parser, program, label) => {
  const prop = parser.pickPath(program, propType(parser), item => (key === null ? item.node.computed : keyName(item.node) === key)
    && item.parentPath.parentPath?.node?.type === 'AssignmentExpression');
  check(label, staticSlotTakesDefault(prop.node, { scope: prop.scope, adapter: adapterFor(parser), path: prop }), expected);
});

// A level default supplies its receiver, not proof that the receiver's own properties are absent.
for (const source of [
  "let S, d, of; [{ Set: S, 'with-dash': d, Array: { of } } = globalThis] = [];",
  'let S, of, rest; [{ Set: S, Array: { of }, ...rest } = globalThis] = [];',
  "let d, of, race; [{ Array: { of }, 'with-dash': d, Promise: { race } } = globalThis] = [];",
  "const [{ Set: S, 'with-dash': d, Array: { of } } = globalThis] = [];",
  "const { w: { of, 'with-dash': d } = Array } = {};",
  "function read({ w: { of, 'with-dash': d } = Array }) {}",
]) runBoth(`declined inner default keeps native leaves: ${ source }`, source, (parser, program, label) => {
  const prop = parser.pickPath(program, propType(parser), item => keyName(item.node) === 'of');
  check(label, leafTakesSlotDefault(prop, adapterFor(parser)), false);
});

// A resolved string is an object key even when it needs quotes; rest and unknown keys are different.
for (const [field, expected] of [
  ["'with-dash': value", 'with-dash'],
  ["'[key]': value", '[key]'],
  ["'': value", ''],
  ["['with-dash']: value", 'with-dash'],
  ['__proto__: value', '__proto__'],
  ['[unknown]: value', null],
  ['...rest', null],
]) runBoth(`mirror key/${ field }`, `const { ${ field } } = source;`, (parser, program, label) => {
  const pattern = parser.pickPath(program, 'ObjectPattern');
  check(label, mirrorAcceptedKey({
    prop: pattern.node.properties[0], scope: pattern.scope, adapter: adapterFor(parser), path: pattern, seenKeys: new Map(),
  }), expected);
});

// a host rewritten in place plans afresh once the binding retires the plan made for its old pattern
runBoth('rewritten host retires its plan', 'const { w: { from, of } } = { w: Array };', (parser, program, label) => {
  const adapter = adapterFor(parser);
  const host = parser.pickPath(program, 'VariableDeclarator');
  function resolvePure(meta) {
    return meta.kind === 'property' && (meta.key === 'from' || meta.key === 'of') && meta.object === 'Array'
      ? { kind: 'static', entry: `actual/array/${ meta.key }`, hintName: `Array$${ meta.key }` } : null;
  }
  function plan() {
    return buildNestedDestructurePlan({
      declarator: host.node, scope: host.scope, adapter, path: host, resolvePure, resolveGlobalPolyfill: () => null,
    });
  }
  const nested = plan();
  host.node.id = host.node.id.properties[0].value;
  host.node.init = host.node.init.properties[0].value;
  check(`${ label } cached until retired`, plan(), nested);
  forgetDestructurePlan(adapter, host.node);
  const flat = plan();
  check(`${ label } planned afresh`, flat !== nested, true);
  checkDeep(`${ label } plans the host as it stands`, flat?.outerProps?.map(row => row.keyName), ['from', 'of']);
});

finish();
