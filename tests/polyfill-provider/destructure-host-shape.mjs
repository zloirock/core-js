// Cross-parser tests for `destructure-host-shape`. The classifier operates on raw
// AST nodes - parent + host pair for `isBodylessStatementSlot`, declaration +
// declarationParent for `classifyVariableDeclarationHost`. Both parsers must produce
// the same booleans because the strategy planner is shared between babel-plugin and
// unplugin (decision tree is plugin-specific, the underlying facts are not).
import {
  classifyVariableDeclarationHost,
  isBodylessStatementSlot,
  isForInitDeclaration,
  isLoopStatement,
  peelLabeledStatements,
  planMinifierSequenceSplit,
} from '../../packages/core-js-polyfill-provider/destructure-host-shape.js';
import { createChecker } from './harness.mjs';

const { check, checkDeep, finish, runBoth } = createChecker('destructure-host-shape');

// --- isBodylessStatementSlot ---

// IfStatement consequent slot (unbraced single-statement body)
runBoth('isBodylessStatementSlot/IfStatement consequent', 'if (cond) call();', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.consequent), true);
});

// IfStatement alternate slot (unbraced else body)
runBoth('isBodylessStatementSlot/IfStatement alternate', 'if (cond) a(); else b();', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.alternate), true);
});

// IfStatement with braced consequent: BlockStatement is in the slot but classifier
// returns TRUE because slot membership is by identity, not by node type
runBoth('isBodylessStatementSlot/IfStatement braced consequent (still slot)', 'if (cond) { call(); }', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.consequent), true);
});

// WhileStatement body slot
runBoth('isBodylessStatementSlot/WhileStatement body', 'while (cond) call();', (adapter, prog, lbl) => {
  const whilePath = adapter.pickPath(prog, 'WhileStatement');
  check(lbl, isBodylessStatementSlot(whilePath.node, whilePath.node.body), true);
});

// DoWhileStatement body slot
runBoth('isBodylessStatementSlot/DoWhileStatement body', 'do call(); while (cond);', (adapter, prog, lbl) => {
  const doPath = adapter.pickPath(prog, 'DoWhileStatement');
  check(lbl, isBodylessStatementSlot(doPath.node, doPath.node.body), true);
});

// ForStatement body slot
runBoth('isBodylessStatementSlot/ForStatement body', 'for (;;) call();', (adapter, prog, lbl) => {
  const forPath = adapter.pickPath(prog, 'ForStatement');
  check(lbl, isBodylessStatementSlot(forPath.node, forPath.node.body), true);
});

// ForInStatement body slot
runBoth('isBodylessStatementSlot/ForInStatement body', 'for (const k in obj) call();', (adapter, prog, lbl) => {
  const forIn = adapter.pickPath(prog, 'ForInStatement');
  check(lbl, isBodylessStatementSlot(forIn.node, forIn.node.body), true);
});

// ForOfStatement body slot
runBoth('isBodylessStatementSlot/ForOfStatement body', 'for (const x of arr) call();', (adapter, prog, lbl) => {
  const forOf = adapter.pickPath(prog, 'ForOfStatement');
  check(lbl, isBodylessStatementSlot(forOf.node, forOf.node.body), true);
});

// LabeledStatement body slot
runBoth('isBodylessStatementSlot/LabeledStatement body', 'lbl: call();', (adapter, prog, lbl) => {
  const labeled = adapter.pickPath(prog, 'LabeledStatement');
  check(lbl, isBodylessStatementSlot(labeled.node, labeled.node.body), true);
});

// ArrowFunctionExpression body slot (single-expression body)
runBoth('isBodylessStatementSlot/ArrowFunctionExpression body', 'const f = () => call();', (adapter, prog, lbl) => {
  const arrow = adapter.pickPath(prog, 'ArrowFunctionExpression');
  check(lbl, isBodylessStatementSlot(arrow.node, arrow.node.body), true);
});

// non-host parent: BlockStatement is NOT a body-slot host type, returns false
runBoth('isBodylessStatementSlot/BlockStatement parent returns false', 'if (cond) { foo(); }', (adapter, prog, lbl) => {
  const block = adapter.pickPath(prog, 'BlockStatement');
  check(lbl, isBodylessStatementSlot(block.node, block.node.body[0]), false);
});

// non-matching position: IfStatement test slot (not consequent/alternate)
runBoth('isBodylessStatementSlot/IfStatement test (not slot)', 'if (cond) call();', (adapter, prog, lbl) => {
  const ifPath = adapter.pickPath(prog, 'IfStatement');
  check(lbl, isBodylessStatementSlot(ifPath.node, ifPath.node.test), false);
});

// no parent: null returns false (defensive)
check('isBodylessStatementSlot/null parent', isBodylessStatementSlot(null, { type: 'CallExpression' }), false);

// --- classifyVariableDeclarationHost ---

// plain top-level declaration: no special flags
runBoth('classifyVariableDeclarationHost/top-level single decl', 'const x = 1;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: false });
});

// multi-declarator: isMultiDecl=true
runBoth('classifyVariableDeclarationHost/multi-decl', 'let a, b, c;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: true });
});

// export wrapper: isExport=true, isBodyless suppressed even though export hosts decl
runBoth('classifyVariableDeclarationHost/export named', 'export const x = 1;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: true, isForInit: false, isBodyless: false, isMultiDecl: false });
});

// for-init slot: isForInit=true, isBodyless suppressed (different shape concern)
runBoth('classifyVariableDeclarationHost/for-init', 'for (let i = 0; i < n; i++) {}', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: true, isBodyless: false, isMultiDecl: false });
});

// bodyless host: declaration in unbraced if body
runBoth('classifyVariableDeclarationHost/bodyless if', 'if (cond) var x = 1;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: true, isMultiDecl: false });
});

// bodyless + multi-decl
runBoth('classifyVariableDeclarationHost/bodyless multi-decl', 'while (cond) var a = 1, b = 2;', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: true, isMultiDecl: true });
});

// for-init multi-decl: isMultiDecl + isForInit
runBoth('classifyVariableDeclarationHost/for-init multi-decl', 'for (let i = 0, j = 1; i < n; i++) {}', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: true, isBodyless: false, isMultiDecl: true });
});

// `for-in` init: classifier returns isForInit=false because parent.type is ForInStatement,
// not ForStatement - the helper specifically checks ForStatement.init slot
runBoth('classifyVariableDeclarationHost/for-in init not isForInit', 'for (var k in obj) {}', (adapter, prog, lbl) => {
  const decl = adapter.pickPath(prog, 'VariableDeclaration');
  checkDeep(lbl, classifyVariableDeclarationHost({
    declaration: decl.node,
    declarationParent: decl.parent,
  }), { isExport: false, isForInit: false, isBodyless: false, isMultiDecl: false });
});

// --- isLoopStatement (element-wise over the closed loop-type domain, both parsers) ---

const LOOP_SOURCES = [
  ['ForStatement', 'for (;;) call();'],
  ['ForInStatement', 'for (const k in obj) call();'],
  ['ForOfStatement', 'for (const x of arr) call();'],
  ['WhileStatement', 'while (cond) call();'],
  ['DoWhileStatement', 'do call(); while (cond);'],
];
for (const [type, src] of LOOP_SOURCES) {
  runBoth(`isLoopStatement/${ type }`, src, (adapter, prog, lbl) => {
    check(lbl, isLoopStatement(adapter.pickPath(prog, type).node), true);
  });
}

// negatives: non-loop statements, a label WRAPPING a loop (the wrapper is not the loop),
// and null-safety
runBoth('isLoopStatement/IfStatement negative', 'if (cond) call();', (adapter, prog, lbl) => {
  check(lbl, isLoopStatement(adapter.pickPath(prog, 'IfStatement').node), false);
});
runBoth('isLoopStatement/LabeledStatement wrapper negative', 'outer: for (;;) call();', (adapter, prog, lbl) => {
  const label = adapter.pickPath(prog, 'LabeledStatement');
  check(lbl, isLoopStatement(label.node), false);
  check(lbl, isLoopStatement(label.node.body), true);
  check(lbl, isLoopStatement(null), false);
});

// --- peelLabeledStatements ---

// a stacked label chain peels to the innermost hosted statement - the loop three labels down
runBoth('peelLabeledStatements/stacked labels reach the loop', 'a: b: c: for (;;) call();', (adapter, prog, lbl) => {
  const outer = adapter.pickPath(prog, 'LabeledStatement');
  const peeled = peelLabeledStatements(outer.node);
  check(lbl, isLoopStatement(peeled), true);
  check(lbl, peeled.type === 'ForStatement', true);
});

// a non-labeled node is identity; a single label peels one level
runBoth('peelLabeledStatements/identity and single level', 'x: call();', (adapter, prog, lbl) => {
  const label = adapter.pickPath(prog, 'LabeledStatement');
  check(lbl, peelLabeledStatements(label.node).type === 'ExpressionStatement', true);
  check(lbl, peelLabeledStatements(label.node.body) === label.node.body, true);
});

// --- classifyVariableDeclarationHost: the three shapes are mutually exclusive ---

// the classifier used to gate `isBodyless` on `!isExport && !isForInit`. that gate is subsumed by
// the slot test itself: an export wrapper hosts no statement slot, and a for-INIT declaration sits
// in `init`, never in `body`. enumerate the three hosts plus a plain block so a future slot-table
// widening cannot silently make two of them true at once
for (const [label, code, pick, expected] of [
  ['export wrapper', 'export const { from } = Array;',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: true, isForInit: false, isBodyless: false }],
  ['for-init slot', 'for (const { from } = Array; ; ) call();',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: true, isBodyless: false }],
  ['unbraced if consequent', 'if (cond) var { from } = Array;',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: false, isBodyless: true }],
  ['plain block statement', '{ var { from } = Array; }',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: false, isBodyless: false }],
  ['unbraced for body', 'for (;;) var { from } = Array;',
    (adapter, prog) => adapter.pickPath(prog, 'VariableDeclaration'),
    { isExport: false, isForInit: false, isBodyless: true }],
]) {
  runBoth(`classifyVariableDeclarationHost/${ label }`, code, (adapter, prog, lbl) => {
    const declPath = pick(adapter, prog);
    const shape = classifyVariableDeclarationHost({
      declaration: declPath.node, declarationParent: declPath.parentPath.node,
    });
    check(`${ lbl }/isExport`, shape.isExport, expected.isExport);
    check(`${ lbl }/isForInit`, shape.isForInit, expected.isForInit);
    check(`${ lbl }/isBodyless`, shape.isBodyless, expected.isBodyless);
    check(`${ lbl }/at most one shape`,
      [shape.isExport, shape.isForInit, shape.isBodyless].filter(Boolean).length <= 1, true);
  });
}

// the standalone for-init canon answers the same question the classifier reports, so the emitters
// can consult either without drifting - and the for-BODY slot is NOT the init slot
runBoth('isForInitDeclaration/init vs body slot', 'for (var { from } = Array; ;) var { of } = Array;',
  (adapter, prog, lbl) => {
    const [head, body] = adapter.collectPaths(prog, 'VariableDeclaration', () => true);
    check(`${ lbl }/init`, isForInitDeclaration(head.parentPath.node, head.node), true);
    check(`${ lbl }/body`, isForInitDeclaration(body.parentPath.node, body.node), false);
  });

// --- planMinifierSequenceSplit ---
// the plan both bindings apply: one entry per minifier-sequence statement, one product per
// operand, each product carrying its operand's span. the two parsers differ in what reaches the
// tree (oxc keeps the parens, babel drops them), so the plan is held to the same shape on both

// a statement list: one entry with the list, the statement and its products in operand order,
// every product an ExpressionStatement over the very operand node, spanned like it
runBoth('planMinifierSequenceSplit/list entry', 'const src = [1];\n(eff(), ({ at } = src), use(at));\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry`, plan.length, 1);
  const [entry] = plan;
  check(`${ lbl }: the entry names the list`, entry.statements, prog.node.body);
  check(`${ lbl }: the entry names the statement`, entry.statement, prog.node.body[1]);
  check(`${ lbl }: one product per operand`, entry.products.length, 3);
  // oxc keeps the statement's parens as a node, babel drops them - the sequence sits under either
  const sequence = entry.statement.expression.type === 'ParenthesizedExpression' ? entry.statement.expression.expression : entry.statement.expression;
  check(`${ lbl }: products are expression statements`, entry.products.every(product => product.type === 'ExpressionStatement'), true);
  check(`${ lbl }: products embed the operands themselves`,
    entry.products.every((product, index) => product.expression === sequence.expressions[index]), true);
  check(`${ lbl }: products carry their operands' spans`,
    entry.products.every(product => product.start === product.expression.start && product.end === product.expression.end), true);
  check(`${ lbl }: no host in a list entry`, entry.host, undefined);
});

// an un-braced control-flow slot: the entry names the host and the key, never a list
runBoth('planMinifierSequenceSplit/slot entry', 'const src = [1];\nif (c) (eff(), ({ at } = src));\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry`, plan.length, 1);
  const [entry] = plan;
  check(`${ lbl }: the entry names the host`, entry.host, prog.node.body[1]);
  check(`${ lbl }: the entry names the key`, entry.key, 'consequent');
  check(`${ lbl }: the entry names the slot statement`, entry.statement, prog.node.body[1].consequent);
  check(`${ lbl }: no list in a slot entry`, entry.statements, undefined);
  check(`${ lbl }: two products`, entry.products.length, 2);
});

// a nested minifier sequence flattens in the same plan - no second pass over the tree
runBoth('planMinifierSequenceSplit/nested operand flattens', 'const src = [1];\n(a(), (b(), ({ at } = src)), ({ flat } = src));\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry`, plan.length, 1);
  const spelled = plan[0].products.map(product => {
    const expression = product.expression.type === 'ParenthesizedExpression' ? product.expression.expression : product.expression;
    return expression.type === 'CallExpression' ? expression.callee.name : expression.left.properties[0].key.name;
  });
  check(`${ lbl }: four products in source order`, spelled.join(','), 'a,b,at,flat');
});

// a quiet LITERAL operand leaves no product: the minifier's `0`, a string in any slot (so a
// leading one never reaches the Directive Prologue - cast-wrapped or not, the cast vanishes at
// type-strip). a name may throw and a function carries the author's code: both stay, in order
runBoth('planMinifierSequenceSplit/quiet operands', [
  'const src = [1];',
  '("use strict" as any, 0, null, true, 1n, /re/, ({ at } = src), "later", name, function () {}, use(at));',
].join('\n'), (adapter, prog, lbl) => {
  const [entry] = planMinifierSequenceSplit(prog.node);
  const spelled = entry.products.map(product => {
    const expression = product.expression.type === 'ParenthesizedExpression' ? product.expression.expression : product.expression;
    if (expression.type === 'CallExpression') return expression.callee.name;
    if (expression.type === 'AssignmentExpression') return expression.left.properties[0].key.name;
    return expression.type === 'Identifier' ? expression.name : expression.type;
  });
  check(`${ lbl }: every operand but the literals, in order`, spelled.join(','), 'at,name,FunctionExpression,use');
});

// `embed` wraps every operand for the binding's dialect
runBoth('planMinifierSequenceSplit/embed wraps the operands', 'const src = [1];\n(eff(), ({ at } = src));\n', (adapter, prog, lbl) => {
  const [entry] = planMinifierSequenceSplit(prog.node, { embed: node => ({ type: 'Wrapped', node }) });
  check(`${ lbl }: every operand is wrapped`, entry.products.every(product => product.expression.type === 'Wrapped'), true);
});

// a `require(...)` slot is the destructure's twin: the minifier joins an entry statement with its
// neighbours the same way, in any slot, and the split is what lets entry detection read the call
// on its own line and keep the neighbours as statements. the entry canon reads the slot, so the
// indirect and optional spellings split too; a sequence with neither shape is not a plan entry
runBoth('planMinifierSequenceSplit/require slot', [
  "(a(), require('core-js/x'), b());",
  "(require('core-js/y'), c());",
  "((0, require)('core-js/z'), d());",
  "(require?.('core-js/w'), e());",
  '(f(), g());',
].join('\n'), (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: one entry per statement with a require slot`, plan.length, 4);
  check(`${ lbl }: middle slot splits into three`, plan[0].products.length, 3);
  check(`${ lbl }: head slot splits into two`, plan[1].products.length, 2);
  check(`${ lbl }: a plain call sequence is not planned`, plan.some(entry => entry.statement === prog.node.body[4]), false);
});

// a statement list nested inside an operand is planned too, with its own list
runBoth('planMinifierSequenceSplit/list inside an operand', 'const src = [1];\n(a(), ({ at } = src), () => { (b(), ({ flat } = src)); });\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: two entries`, plan.length, 2);
  check(`${ lbl }: the inner entry names the arrow body`, plan[1].statements !== prog.node.body && Array.isArray(plan[1].statements), true);
});

// an un-braced slot nested inside an operand is planned too: the entries hold nodes, so the slot's
// host stays reachable whatever the outer list's splice does around it
runBoth('planMinifierSequenceSplit/slot inside an operand', 'const src = [1];\n(a(), ({ at } = src), () => { if (c) (b(), ({ flat } = src)); });\n', (adapter, prog, lbl) => {
  const plan = planMinifierSequenceSplit(prog.node);
  check(`${ lbl }: two entries`, plan.length, 2);
  check(`${ lbl }: the inner entry is a slot of the if inside the arrow`, plan[1].host?.type === 'IfStatement' && plan[1].key === 'consequent', true);
});

// a statement without the shape plans nothing: a bare destructure, a sequence without one
runBoth('planMinifierSequenceSplit/no shape, no entry', 'const src = [1];\n({ at } = src);\n(a(), b());\n', (adapter, prog, lbl) => {
  check(lbl, planMinifierSequenceSplit(prog.node).length, 0);
});

finish();
