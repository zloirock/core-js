// Decision tests for the wrapper-peel canon. Both plugins used to carry their own climb through
// the transparent wrappers an expression wears, and the two parsers spell those wrappers
// differently - babel strips source parens and folds `?.` into Optional* nodes, oxc keeps a
// ParenthesizedExpression and a ChainExpression. That is exactly the dialect gap a peel has to
// close, so the rule belongs to the core and is locked here for both parsers at once rather than
// in one leg's unit suite
import {
  aliasDeclScope,
  CHAIN_HOP_WRAPPER_TYPES,
  isDestructurePattern,
  peelParenAndTSParentPath,
  peelParenAndTSSlotChild,
  peelParenAndTSSlotPath,
  peelSkippableWrapperPath,
  peelTransparentExpr,
  precedesOrUnordered,
  provablyPrecedes,
  SKIPPABLE_WRAPPER_TYPES,
  unwrapRuntimeExpr,
} from '../../packages/core-js-polyfill-provider/helpers/ast-patterns.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, finish, runBoth } = createChecker('wrapper-peels');

function identPath(adapter, prog, name) {
  return adapter.pickPath(prog, 'Identifier', p => p.node.name === name);
}

// --- the PARENT answer is dialect-independent ---

// each wrapper spelling puts a different node above `arr`, and on the two parsers a different
// NUMBER of them; the climb has to end at the node that consumes the value either way
const RECEIVER_FORMS = [
  ['paren', '(arr).at(0);'],
  ['ts-as', '(arr as any).at(0);'],
  ['non-null', 'arr!.at(0);'],
  ['satisfies', '(arr satisfies any[]).at(0);'],
  ['nested paren over cast', '((arr as any)).at(0);'],
  ['cast over paren', '((arr) as any).at(0);'],
];

for (const [name, code] of RECEIVER_FORMS) {
  runBoth(`parent/${ name } climbs to the consuming member`, code, (adapter, prog, lbl) => {
    check(lbl, peelParenAndTSParentPath(identPath(adapter, prog, 'arr'))?.node?.type, 'MemberExpression');
  }, ['typescript']);

  // ... and the PAIR agrees: what the climb answers is the parent OF the node it hands back,
  // which is the identity every position question compares against
  runBoth(`pair/${ name } slot child fills the parent's slot`, code, (adapter, prog, lbl) => {
    const path = identPath(adapter, prog, 'arr');
    checkTruthy(lbl, peelParenAndTSParentPath(path).node.object === peelParenAndTSSlotChild(path));
  }, ['typescript']);
}

// the callee slot is the same question against a different slot name
runBoth('pair/callee slot child fills the callee', '(fn as any)(0);', (adapter, prog, lbl) => {
  const path = identPath(adapter, prog, 'fn');
  const parent = peelParenAndTSParentPath(path);
  check(`${ lbl } type`, parent?.node?.type, 'CallExpression');
  checkTruthy(`${ lbl } identity`, parent.node.callee === peelParenAndTSSlotChild(path));
}, ['typescript']);

// a bare node wears nothing: both peels answer with the node itself, and the climb with its parent
runBoth('pair/unwrapped node is its own slot child', 'arr.at(0);', (adapter, prog, lbl) => {
  const path = identPath(adapter, prog, 'arr');
  check(`${ lbl } slot path`, peelParenAndTSSlotPath(path), path);
  check(`${ lbl } slot child`, peelParenAndTSSlotChild(path), path.node);
  check(`${ lbl } parent`, peelParenAndTSParentPath(path)?.node?.type, 'MemberExpression');
}, ['typescript']);

// the pair's contract is about EVERY slot a parent can hold a child in, not only a receiver: each
// of these hosts matches its child by identity, and a wrapper the source wrote is what it holds
const SLOTS = [
  ['assignment left', '(arr as any) = 1;', 'AssignmentExpression', 'left'],
  ['assignment right', 'x = (arr as any);', 'AssignmentExpression', 'right'],
  ['tagged template tag', '(arr as any)`t`;', 'TaggedTemplateExpression', 'tag'],
  ['for-of right', 'for (const v of (arr as any)) void v;', 'ForOfStatement', 'right'],
  ['unary argument', 'void (arr as any);', 'UnaryExpression', 'argument'],
  ['spread argument', 'f(...(arr as any));', 'SpreadElement', 'argument'],
  ['await argument', 'async () => await (arr as any);', 'AwaitExpression', 'argument'],
  ['binary left', '(arr as any) + 1;', 'BinaryExpression', 'left'],
  // the STATEMENT is a host too: a wrapper in expression-statement position is what the statement
  // holds, and a discard question asked with the inner node finds it in no slot at all
  ['expression statement', '(arr as any);', 'ExpressionStatement', 'expression'],
  ['declarator init', 'const v = (arr as any);', 'VariableDeclarator', 'init'],
];

for (const [name, code, hostType, slot] of SLOTS) {
  runBoth(`slots/${ name } holds the wrapper, not the inner node`, code, (adapter, prog, lbl) => {
    const path = identPath(adapter, prog, 'arr');
    const parent = peelParenAndTSParentPath(path);
    check(`${ lbl } host`, parent?.node?.type, hostType);
    checkTruthy(`${ lbl } identity`, parent.node[slot] === peelParenAndTSSlotChild(path));
  }, ['typescript']);
}

// --- the optional-chain marker is where the two wrapper sets part ---

// a SEAL over an optional chain: asking for the POSITION must stop at the marker (the
// short-circuit is part of the value being judged), while asking what the outer member reads
// through has to pass it - and only one parser HAS the marker, which is why the answer is
// pinned through the wrapper SET rather than through a node type
runBoth('sets/skippable climb passes the chain marker', '(a?.b).at(0);', (adapter, prog, lbl) => {
  const inner = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'b')
    ?? adapter.pickPath(prog, 'OptionalMemberExpression', p => p.node.property?.name === 'b');
  check(lbl, peelParenAndTSParentPath(inner, SKIPPABLE_WRAPPER_TYPES)?.node?.type, 'MemberExpression');
}, ['typescript']);

// ... and the DEFAULT set is the transparent one: a caller that names no set is asking a POSITION
// question, and the marker is the short-circuit that position belongs to. widening the default
// silently turns every such caller into a value question, which is the one thing the pair may not
// do on its own - so each of the three forms is asked with a marker in its way
runBoth('sets/default parent climb stops at the chain marker', '((a?.b)).at(0);', (adapter, prog, lbl) => {
  const inner = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'b')
    ?? adapter.pickPath(prog, 'OptionalMemberExpression', p => p.node.property?.name === 'b');
  const parent = peelParenAndTSParentPath(inner);
  // babel spells the same source without a marker node at all, so the climb reaches the member
  check(lbl, parent?.node?.type, adapter.name === 'babel' ? 'MemberExpression' : 'ChainExpression');
}, ['typescript']);

runBoth('sets/default slot peel stops at the chain marker', '((a?.b)).at(0);', (adapter, prog, lbl) => {
  const inner = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'b')
    ?? adapter.pickPath(prog, 'OptionalMemberExpression', p => p.node.property?.name === 'b');
  // asked through BOTH halves: the node form forwards its own default, so only the path form
  // answers for a caller that reaches the slot peel directly
  const bare = adapter.name === 'babel' ? 'OptionalMemberExpression' : 'MemberExpression';
  check(`${ lbl } slot path`, peelParenAndTSSlotPath(inner)?.node?.type, bare);
  check(`${ lbl } slot child`, peelParenAndTSSlotChild(inner)?.type, bare);
  // ... and the pair still agrees: the parent holds exactly what the slot peel hands back
  const parent = peelParenAndTSParentPath(inner);
  checkTruthy(`${ lbl } pair`, parent.node.expression === peelParenAndTSSlotChild(inner)
    || parent.node.object === peelParenAndTSSlotChild(inner));
}, ['typescript']);

// --- the descent: the node a wrapper stack holds ---

for (const [name, code] of RECEIVER_FORMS) {
  // the path descent and the node peel answer the SAME node - the pair of spellings the two
  // bindings used to keep by hand, one walking paths and one walking nodes
  runBoth(`descent/${ name } reaches the bare receiver`, code, (adapter, prog, lbl) => {
    const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
    const objectPath = member.get('object');
    check(`${ lbl } path descent`, peelSkippableWrapperPath(objectPath)?.node?.name, 'arr');
    check(`${ lbl } node peel`, unwrapRuntimeExpr(member.node.object)?.name, 'arr');
  }, ['typescript']);
}

// the descent through a chain marker: only the node under it bears the read
runBoth('descent/chain marker is peeled by the runtime peel', '(a?.b).at(0);', (adapter, prog, lbl) => {
  const member = adapter.pickPath(prog, 'MemberExpression', p => p.node.property?.name === 'at');
  const inner = unwrapRuntimeExpr(member.node.object);
  check(lbl, inner?.property?.name, 'b');
}, ['typescript']);

// --- the two wrapper sets, element-wise on their own domain ---

// the whole reason both forms exist: one peels the optional-chain marker, the other must not -
// a caller judging a VALUE reads through it, a caller judging a SHORT-CIRCUIT judges it
const CHAIN = { type: 'ChainExpression', expression: { type: 'Identifier', name: 'x' } };
check('sets/the transparent peel keeps the chain marker', peelTransparentExpr(CHAIN).type, 'ChainExpression');
check('sets/the runtime peel takes it', unwrapRuntimeExpr(CHAIN).type, 'Identifier');
check('sets/the transparent peel is null-safe', peelTransparentExpr(null), null);
check('sets/the transparent peel walks a stack',
  peelTransparentExpr({ type: 'ParenthesizedExpression', expression: { type: 'TSAsExpression', expression: CHAIN } }).type,
  'ChainExpression');

// --- the destructure-pattern predicate over its closed domain ---

// the set is enumerable, so the predicate is checked element-wise: both members, a lookalike that
// is NOT one, and the two empty spellings a walk hands it
check('pattern/an object pattern is one', isDestructurePattern({ type: 'ObjectPattern' }), true);
check('pattern/an array pattern is one', isDestructurePattern({ type: 'ArrayPattern' }), true);
check('pattern/an array EXPRESSION is not', isDestructurePattern({ type: 'ArrayExpression' }), false);
check('pattern/null is not', isDestructurePattern(null), false);
check('pattern/a typeless node is not', isDestructurePattern({}), false);

// --- the alias declaration scope, priority-first ---

// the priority IS the rule (the declaration's own path sees the shadows the declaration saw), and
// each arm is asked separately - spelled per site, sites used to drop one arm or the other
check('alias-scope/the declaration path wins',
  aliasDeclScope({ path: { scope: 'path-scope' }, scope: 'binding-scope' }, 'use-scope'), 'path-scope');
check('alias-scope/the binding scope answers when the path carries none',
  aliasDeclScope({ scope: 'binding-scope' }, 'use-scope'), 'binding-scope');
check('alias-scope/the use scope is the floor', aliasDeclScope({}, 'use-scope'), 'use-scope');
check('alias-scope/a missing binding falls to the use scope', aliasDeclScope(null, 'use-scope'), 'use-scope');

// --- textual order, and what an unordered pair means to each caller ---

const A = { start: 0, end: 5 };
const B = { start: 10, end: 20 };
check('order/ordered pair reads the same both ways',
  `${ precedesOrUnordered(A, B) }${ provablyPrecedes(A, B) }`, 'truetrue');
check('order/reversed pair reads false both ways',
  `${ precedesOrUnordered(B, A) }${ provablyPrecedes(B, A) }`, 'falsefalse');
// the whole point of two names: a parser without positions gets the answer SAFE for the question
check('order/unordered counts as preceding for the dominance walk',
  precedesOrUnordered({ end: undefined }, B), true);
check('order/... and is not proof for the gate that needs one',
  provablyPrecedes({ end: undefined }, B), false);
check('order/touching spans count as preceding', precedesOrUnordered({ start: 0, end: 10 }, B), true);

// --- the peels over their whole wrapper domain ---

// the vocabulary is CLOSED, so the peels are checked over it rather than over examples: every
// stack up to three wrappers, against the contract each peel states. the marker is always the
// LAST wrapper a parser can put on a spine (ESTree marks the chain at its root, and what it wraps
// is the chain - a member or a call), so a stack carrying one anywhere else is not built
const STACK_WRAPPERS = [
  'ParenthesizedExpression',
  'ChainExpression',
  'TSAsExpression',
  'TSSatisfiesExpression',
  'TSTypeAssertion',
  'TSNonNullExpression',
  'TSInstantiationExpression',
  'TypeCastExpression',
];

function * wrapperStacks(depth) {
  if (depth === 0) {
    yield [];
    return;
  }
  for (const rest of wrapperStacks(depth - 1)) {
    yield rest;
    for (const wrapper of STACK_WRAPPERS) yield [wrapper, ...rest];
  }
}

function buildStack(stack, core) {
  let node = core;
  for (const type of [...stack].reverse()) node = { type, expression: node };
  return node;
}

{
  const core = { type: 'MemberExpression', object: { type: 'Identifier', name: 'a' }, property: { type: 'Identifier', name: 'b' } };
  let checked = 0;
  const wrong = [];
  for (const stack of wrapperStacks(3)) {
    const marker = stack.indexOf('ChainExpression');
    if (marker !== -1 && (marker !== stack.length - 1 || stack.lastIndexOf('ChainExpression') !== marker)) continue;
    const node = buildStack(stack, core);
    checked++;
    // the runtime peel takes the whole stack; the transparent one stops where the marker starts
    if (unwrapRuntimeExpr(node) !== core) wrong.push(`runtime/${ stack.join('>') }`);
    let transparentEnd = node;
    while (transparentEnd.type !== 'ChainExpression' && transparentEnd !== core) transparentEnd = transparentEnd.expression;
    if (peelTransparentExpr(node) !== transparentEnd) wrong.push(`transparent/${ stack.join('>') }`);
    // the chain-hop set reads through TS assertions and the marker, and STOPS at a source paren
    const paren = stack.indexOf('ParenthesizedExpression');
    let chainHopEnd = node;
    while (CHAIN_HOP_WRAPPER_TYPES.has(chainHopEnd.type)) chainHopEnd = chainHopEnd.expression;
    if (paren === -1 ? chainHopEnd !== core : chainHopEnd.type !== 'ParenthesizedExpression') {
      wrong.push(`chain-hop/${ stack.join('>') }`);
    }
  }
  checkTruthy(`domain/every wrapper stack up to three deep (${ checked } stacks)`, checked > 100 && !wrong.length);
  if (wrong.length) check('domain/first disagreement', wrong[0], '(none)');
}

finish();
