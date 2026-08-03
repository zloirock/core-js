import { SINGLE_STATEMENT_SLOTS } from './helpers/ast-patterns.js';

// shape classification for destructure hosts (VariableDeclaration / AssignmentExpression
// inside ExpressionStatement). produces parser-agnostic booleans both plugins consume:
// `isExport` / `isForInit` / `isBodyless` / `isMultiDecl`. classification operates on raw
// AST nodes so callers can pass nodes from either babel paths or estree-toolkit paths.
//
// the strategy decision tree IS plugin-specific by design (babel uses per-prop AST mutation,
// unplugin uses batched text-rewrite emitting one transform per declaration) so the planners
// stay plugin-local. the underlying facts are the same, hence this shared classifier

// is `host` the single-statement slot of `parent`? composed on the canonical slot table, which
// already carries the two-slot IfStatement (`consequent` / `alternate`); the concise-body arrow is
// the one host outside it (its slot holds an EXPRESSION, so the statement table has no entry).
// NOTE the answer is "this IS the slot", NOT "this slot needs braces": a BRACED body occupies the
// same slot and answers true - callers that emit multiple statements must test the host's own type.
// callers pass raw nodes - works uniformly across babel paths and estree-toolkit paths
export function isBodylessStatementSlot(parent, host) {
  if (!parent) return false;
  if (parent.type === 'ArrowFunctionExpression') return parent.body === host;
  return (SINGLE_STATEMENT_SLOTS.get(parent.type) ?? []).some(slot => parent[slot] === host);
}

// iteration statements: `continue <label>` can target a label on one of these, and value flow has
// a back-edge here. `t.isLoop` is a babel-types alias the hand-written estree adapter doesn't
// expose, so this shared classifier owns the predicate - imported by the resolver's flow analysis
// (class-fields / narrow-by-guards / discriminant-narrow) and the unplugin scope tracker
const LOOP_STATEMENT_TYPES = new Set([
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
]);

export function isLoopStatement(node) {
  return LOOP_STATEMENT_TYPES.has(node?.type);
}

// peel a chain of stacked LabeledStatements (`a: b: c: <stmt>`) down to the innermost labeled
// body. both parsers nest LabeledStatement.body, so this is parser-agnostic. used to decide
// whether a labeled body slot ultimately hosts a loop: a single-level `isLoopStatement(prev)`
// check misses `a: b: for(...)` because `prev` is the inner LabeledStatement, not the loop
export function peelLabeledStatements(node) {
  let cur = node;
  while (cur?.type === 'LabeledStatement') cur = cur.body;
  return cur;
}

// is `declaration` the init slot of a `for` head? single-sourced so the emitters cannot grow a
// weaker spelling: testing only the parent TYPE would take a for-BODY declaration for a for-init one
export function isForInitDeclaration(declarationParent, declaration) {
  return declarationParent?.type === 'ForStatement' && declarationParent.init === declaration;
}

// classify a VariableDeclaration host's enclosing context. returns the parser-agnostic
// booleans the plugin's strategy planner consumes:
//   isExport     - declaration is wrapped in `export` (`ExportNamedDeclaration`)
//   isForInit    - declaration is the init slot of a `for` loop
//   isBodyless   - declaration sits in an unbraced body slot (if/while/...) -
//                  block-wrapping needed when emitting multiple statements
//   isMultiDecl  - declaration has multiple declarators (`let a, b, c`)
// the three shapes are mutually exclusive by construction: an `ExportNamedDeclaration` parent is not
// a statement-slot host at all, and a for-INIT slot is not the for's `body` slot - so `isBodyless`
// needs no gate on the other two
export function classifyVariableDeclarationHost({ declaration, declarationParent }) {
  return {
    isExport: declarationParent?.type === 'ExportNamedDeclaration',
    isForInit: isForInitDeclaration(declarationParent, declaration),
    isBodyless: isBodylessStatementSlot(declarationParent, declaration),
    isMultiDecl: declaration.declarations.length > 1,
  };
}
