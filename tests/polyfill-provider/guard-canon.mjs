// Decision tests for the guard render canon: the two null-test spellings and the shapes built on
// them. Both were written twice - once per binding - and the corpus only proves the two agreed on
// the shapes it happens to carry; these lock the rule itself, element-wise over its domain
import {
  composeNullGuardTest,
  HOST_SLOT,
  hostSlot,
  nullFirstGuardTest,
  nullGuardTest,
  renderAliasHeldProbeRead,
  renderBoundRawBranch,
  renderCtorIdentityNarrow,
  renderInExpressionPlan,
  renderNavCollapseLeaf,
  renderNavCollapseTail,
  renderNavGuardTestBase,
  renderShortCircuitGuard,
} from '../../packages/core-js-polyfill-provider/render.js';
import { createChecker } from './harness.mjs';

const { check, checkTruthy, finish } = createChecker('guard-canon');

function identifier(name) {
  return { type: 'Identifier', name };
}
function assign(name, value) {
  return { type: 'AssignmentExpression', operator: '=', left: identifier(name), right: value };
}
function injectImport(entry, hintName) {
  return `_${ hintName ?? entry }`;
}
// `null == x` reads as the pair (left type, right type) - which side the literal sits on IS the rule
function sides(test) {
  return `${ test.left.type === 'Literal' ? 'null' : test.left.type }/${ test.right.type === 'Literal' ? 'null' : test.right.type }`;
}

// --- the shape rule: which side the literal takes ---

// only an identifier-like check heads a test bare; everything else takes the literal first, which
// is what keeps a replacement safe as a statement-leading token
check('shape/identifier reads ident-first', sides(nullGuardTest(identifier('x'))), 'Identifier/null');
check('shape/this reads ident-first', sides(nullGuardTest({ type: 'ThisExpression' })), 'ThisExpression/null');
check('shape/assignment takes the literal first',
  sides(nullGuardTest(assign('_ref', identifier('x')))), 'null/AssignmentExpression');
check('shape/member takes the literal first',
  sides(nullGuardTest({ type: 'MemberExpression', object: identifier('a'), property: identifier('b'), computed: false })),
  'null/MemberExpression');
check('shape/sequence takes the literal first',
  sides(nullGuardTest({ type: 'SequenceExpression', expressions: [identifier('a'), identifier('b')] })),
  'null/SequenceExpression');
check('shape/call takes the literal first',
  sides(nullGuardTest({ type: 'CallExpression', callee: identifier('f'), arguments: [] })), 'null/CallExpression');

// ... and the operator is `==` on both sides of the rule - `===` would miss `undefined`
check('shape/loose equality, ident-first', nullGuardTest(identifier('x')).operator, '==');
check('shape/loose equality, literal-first', nullGuardTest(assign('r', identifier('x'))).operator, '==');

// --- the literal-first rule as its own form ---

// the nav-guard channels take it even for a bare identifier: their test is built to be JOINABLE,
// and a chain that mixed the two forms printed two spellings for one rule
check('literal-first/identifier still takes the literal first',
  sides(nullFirstGuardTest(identifier('x'))), 'null/Identifier');
check('literal-first/assignment', sides(nullFirstGuardTest(assign('r', identifier('x')))), 'null/AssignmentExpression');

// --- the disjunct chain ---

check('chain/no checks yields no test', composeNullGuardTest([]), null);
check('chain/undefined list yields no test', composeNullGuardTest(undefined), null);
// ONE check keeps the shape rule - it is not part of a chain
check('chain/single identifier keeps the shape rule',
  sides(composeNullGuardTest([identifier('x')])), 'Identifier/null');
check('chain/two checks fold with ||', composeNullGuardTest([identifier('a'), identifier('b')]).operator, '||');
check('chain/every member spells the literal first',
  (() => {
    const chain = composeNullGuardTest([identifier('a'), identifier('b'), identifier('c')]);
    // `((a || b) || c)` - the fold is left-associative, so the deepest left is the first check
    return [sides(chain.left.left), sides(chain.left.right), sides(chain.right)].join(',');
  })(), 'null/Identifier,null/Identifier,null/Identifier');
check('chain/order is the caller order',
  (() => {
    const chain = composeNullGuardTest([identifier('a'), identifier('b')]);
    return `${ chain.left.right.name }${ chain.right.right.name }`;
  })(), 'ab');

// --- the short circuit itself ---

check('guard/nullish answers void 0',
  (() => {
    const guard = renderShortCircuitGuard(nullGuardTest(identifier('x')), identifier('live'));
    return `${ guard.type }:${ guard.consequent.type }:${ guard.consequent.operator }:${ guard.alternate.name }`;
  })(), 'ConditionalExpression:UnaryExpression:void:live');

// --- the ctor-identity narrow ---

const NARROW_PLAN = {
  recvIdent: identifier('M'),
  branches: [
    { ctorPure: { entry: 'actual/map/constructor', hintName: 'Map' }, staticPure: { entry: 'actual/map/group-by', hintName: 'Map$groupBy' } },
    { ctorName: 'Weak', staticPure: { entry: 'actual/weak-map/constructor', hintName: 'WeakMap' } },
  ],
};
function narrow() {
  return renderCtorIdentityNarrow(NARROW_PLAN, identifier('raw'), {
    injectImport, spellRecv: () => identifier('M'),
  });
}

// innermost-LAST: the first branch tests first, and a receiver matching none keeps the raw read
check('narrow/first branch tests first', narrow().test.right.name, '_Map');
check('narrow/first branch yields its static', narrow().consequent.name, '_Map$groupBy');
check('narrow/second branch nests in the alternate', narrow().alternate.test.right.name, 'Weak');
check('narrow/raw read is the innermost alternate', narrow().alternate.alternate.name, 'raw');
// identity, not truthiness: a subclass or a foreign realm's ctor must NOT take the pure branch
check('narrow/tests by identity', narrow().test.operator, '===');
// a ctor with no pure entry is spelled by NAME - there is nothing to import for it
check('narrow/nameless ctor reads its own binding', narrow().alternate.test.right.type, 'Identifier');
check('narrow/no branches keeps the raw read',
  renderCtorIdentityNarrow({ branches: [] }, identifier('raw'), { injectImport, spellRecv: () => identifier('M') }).name,
  'raw');

// --- the nav-guard test a resolvable base supplies ---

const BASE = { basePure: { entry: 'actual/self', hintName: 'self' }, probeName: 'window' };

check('nav-test/probe reads off the ponyfilled base',
  (() => {
    const test = renderNavGuardTestBase(BASE, { injectImport });
    return `${ test.object.name }.${ test.property.name }`;
  })(), '_self.window');

// the kept root WRITE is the source's own first act - it rides ahead of the base, inside the value
check('nav-test/a kept write rides ahead of the base',
  (() => {
    const test = renderNavGuardTestBase(BASE, { rootAssign: assign('w', identifier('g')), injectImport });
    return `${ test.object.type }:${ test.object.expressions[0].type }:${ test.object.expressions[1].name }`;
  })(), 'SequenceExpression:AssignmentExpression:_self');

check('nav-test/embed wraps the carried write',
  renderNavGuardTestBase(BASE, { rootAssign: assign('w', identifier('g')), injectImport, embed: hostSlot })
    .object.expressions[0].type, HOST_SLOT);

// --- the alias-held probe read ---

check('probe-read/plain key reads after a dot',
  (() => {
    const read = renderAliasHeldProbeRead({ computed: false, key: 'of' }, identifier('a'));
    return `${ read.computed }:${ read.property.type }:${ read.property.name }`;
  })(), 'false:Identifier:of');

// the SOURCE's own computed flag decides, not the key's validity: the probe reproduces a read the
// source performs, so `a['of']` stays computed where `a.of` stays plain
check('probe-read/computed key keeps its string spelling',
  (() => {
    const read = renderAliasHeldProbeRead({ computed: true, key: 'of' }, identifier('a'));
    return `${ read.computed }:${ read.property.type }:${ read.property.value }`;
  })(), 'true:Literal:of');

// --- the `in`-expression plan render ---

check('in/always-true fold answers a literal',
  renderInExpressionPlan({ kind: 'fold', leadingSe: [] }, { injectImport }).replace.value, true);

check('in/leading effects ride ahead of the answer',
  (() => {
    const rendered = renderInExpressionPlan({ kind: 'fold', leadingSe: [identifier('e')] }, { injectImport });
    return `${ rendered.replace.type }:${ rendered.replace.expressions[0].name }:${ rendered.replace.expressions[1].value }`;
  })(), 'SequenceExpression:e:true');

// the kept membership test carries the throw, so it stays live and the answer follows it
check('in/fold-after-test keeps the test live',
  (() => {
    const rendered = renderInExpressionPlan({ kind: 'fold-after-test', leadingSe: [] },
      { injectImport, cloneSource: () => identifier('sourceTest') });
    return `${ rendered.replace.expressions[0].name }:${ rendered.replace.expressions[1].value }`;
  })(), 'sourceTest:true');

// a symbol WITHOUT a call swaps only the LHS - the RHS keeps the visited state its own traversal
// gave it, so the caller gets a swap instruction rather than a whole replacement
check('in/symbol read swaps only the left',
  (() => {
    const rendered = renderInExpressionPlan({ kind: 'symbol', call: false, entry: 'e', hint: 'S', leadingSe: [] },
      { injectImport });
    return `${ rendered.replace === undefined }:${ rendered.swapLeft.name }`;
  })(), 'true:_S');

// ... and WITH a call the helper consumes the operand the way `in` did - it throws on a nullish
// one, which the caller has to know to keep any guard INSIDE the argument
check('in/symbol call consumes the operand',
  (() => {
    const rendered = renderInExpressionPlan({
      kind: 'symbol', call: true, entry: 'e', hint: 'S', leadingSe: [], right: identifier('o'),
    }, { injectImport });
    return `${ rendered.replace.callee.name }:${ rendered.replace.arguments[0].name }:${ rendered.throwsAtTail }`;
  })(), '_S:o:true');

// ... and with leading effects the call sits at the TAIL of the sequence - that is where the
// throwing mark has to land, not on the wrapper
check('in/symbol call stays at the tail under leading effects',
  (() => {
    const rendered = renderInExpressionPlan({
      kind: 'symbol', call: true, entry: 'e', hint: 'S', leadingSe: [identifier('eff')], right: identifier('o'),
    }, { injectImport });
    return `${ rendered.replace.type }:${ rendered.replace.expressions.at(-1).callee.name }:${ rendered.throwsAtTail }`;
  })(), 'SequenceExpression:_S:true');

checkTruthy('in/symbol read hands its leading effects back',
  renderInExpressionPlan({ kind: 'symbol', call: false, entry: 'e', hint: 'S', leadingSe: [identifier('x')] },
    { injectImport }).leadingSe.length === 1);

// --- the narrow's bound raw branch ---

// a conditional standing in CALLEE position is invoked with `this === undefined`, so the raw arm
// rebinds the receiver the read came off
check('bound-raw/binds the receiver back',
  (() => {
    const bound = renderBoundRawBranch(identifier('read'), identifier('M'));
    return `${ bound.callee.object.name }.${ bound.callee.property.name }(${ bound.arguments[0].name })`;
  })(), 'read.bind(M)');

// --- the nav-collapse leaf and its tail ---

function navPlan(hops, collapseIdx, keySe = [], testKeySeCount = 0) {
  return { hops, collapseIdx, liveKeySeExprs: () => keySe, testKeySeCount };
}
function hop(name, { computed = false, key = null, optional = false } = {}) {
  return {
    name,
    liveOptional: optional,
    node: { type: 'MemberExpression', computed, property: computed ? key : identifier(name), object: null },
  };
}

check('leaf/no key effects answers the binding alone',
  renderNavCollapseLeaf(navPlan([hop('self')], 0), identifier('_self')).name, '_self');

check('leaf/live key effects ride ahead of the binding',
  (() => {
    const leaf = renderNavCollapseLeaf(navPlan([hop('self')], 0, [identifier('eff')]), identifier('_self'));
    return `${ leaf.type }:${ leaf.expressions[0].name }:${ leaf.expressions[1].name }`;
  })(), 'SequenceExpression:eff:_self');

// the share the guard TEST already spelled is skipped by count - the test evaluates the key once,
// and replaying it in the alternate would run the source's effect twice
check('leaf/the test share is skipped',
  (() => {
    const leaf = renderNavCollapseLeaf(navPlan([hop('self')], 0, [identifier('a'), identifier('b')], 1),
      identifier('_self'));
    return `${ leaf.expressions.length }:${ leaf.expressions[0].name }`;
  })(), '2:b');

check('leaf/cloneHost lifts every effect node',
  renderNavCollapseLeaf(navPlan([hop('self')], 0, [identifier('eff')]), identifier('_self'),
    { cloneHost: hostSlot }).expressions[0].type, HOST_SLOT);

check('tail/nothing above the collapse hangs nothing',
  renderNavCollapseTail(navPlan([hop('self')], 0), identifier('_self')).name, '_self');

check('tail/a named hop reads after a dot',
  (() => {
    const tail = renderNavCollapseTail(navPlan([hop('self'), hop('window')], 0), identifier('_self'));
    return `${ tail.object.name }.${ tail.property.name }:${ tail.computed }`;
  })(), '_self.window:false');

// the SOURCE's spelling survives: a computed hop stays computed, and its key node is the source's
// own - respelled by name it would read a different property on a non-identifier key
check('tail/a computed hop keeps its key node',
  (() => {
    const key = { type: 'Literal', value: 'window' };
    const tail = renderNavCollapseTail(navPlan([hop('self'), hop('window', { computed: true, key })], 0),
      identifier('_self'));
    return `${ tail.computed }:${ tail.property === key }`;
  })(), 'true:true');

check('tail/a computed hop clones through cloneHost',
  renderNavCollapseTail(navPlan([hop('self'), hop('window', { computed: true, key: identifier('k') })], 0),
    identifier('_self'), { cloneHost: hostSlot }).property.type, HOST_SLOT);

// a live `?.` rides where the source wrote it; a vestigial one (over the always-defined ponyfill)
// is the plan's own verdict and never reaches the render as live
check('tail/a live optional hop keeps its marker',
  renderNavCollapseTail(navPlan([hop('self'), hop('top', { optional: true })], 0), identifier('_self')).optional,
  true);

check('tail/hops hang in plan order',
  (() => {
    const tail = renderNavCollapseTail(navPlan([hop('self'), hop('window'), hop('top')], 0), identifier('_self'));
    return `${ tail.property.name }/${ tail.object.property.name }/${ tail.object.object.name }`;
  })(), 'top/window/_self');

finish();
