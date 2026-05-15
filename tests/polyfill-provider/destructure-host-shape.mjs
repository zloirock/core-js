// Cross-parser tests for `destructure-host-shape`. The classifier operates on raw
// AST nodes - parent + host pair for `isBodylessStatementSlot`, declaration +
// declarationParent for `classifyVariableDeclarationHost`. Both parsers must produce
// the same booleans because the strategy planner is shared between babel-plugin and
// unplugin (decision tree is plugin-specific, the underlying facts are not).
import {
  classifyVariableDeclarationHost,
  isBodylessStatementSlot,
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

finish();
