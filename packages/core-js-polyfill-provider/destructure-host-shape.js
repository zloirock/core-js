import {
  SINGLE_STATEMENT_SLOTS,
  forEachStatementPosition,
  getMinifierSequenceDestructureExpressions,
  sequenceHeadDirectiveHazard,
} from './helpers/ast-patterns.js';
import { expressionStatement, literal, sequenceExpression } from './render.js';

// shape classification for destructure hosts (VariableDeclaration / AssignmentExpression
// inside ExpressionStatement): the parser-agnostic booleans both plugins consume -
// `isExport` / `isForInit` / `isBodyless` / `isMultiDecl` - and the plan of the one host
// rewrite both plugins owe ahead of detection, the minifier-sequence split. everything here
// operates on raw AST nodes, so callers pass nodes from either babel paths or estree-toolkit
// paths; the surgery that lands a plan in the host tree is each binding's own

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

// --- the minifier-sequence split ---
// `(prefixExpr, ..., ({pat} = R), ...);` collapses a destructure assignment into ANY slot of a
// statement-position SequenceExpression (a minified tail, comma-joined statements, nested
// sequences), a shape the destructure gates peel past only Paren+TS and so silently bail on. the
// plan lists every such statement with the products that replace it: one ExpressionStatement per
// operand, in source order (statement context discards every operand's value, so the split is
// sound at any position). an operand that is itself a minifier sequence splits in the same plan,
// so the tree is walked once and no fixpoint over it is needed. each product carries its operand's
// own span - `start` / `end`, and the `loc` a parser gave it - so the products read as the
// author's own statements to everything that asks a STATEMENT where it stands: the entry
// detection, which takes a span-less statement for a sibling's synthesis and skips it (babel), and
// asks the opt-out gate of the entry statement whole (unplugin); the print's own margins. a claim
// inside a product is asked by its own node, spans or not. a statement-list member is
// planned with its list; an un-braced control-flow slot (`if (c) (eff(), ({ at } = src));`) holds
// ONE statement and is planned with its host and key, the binding bracing the slot around the
// products (a block around a sequence's operands declares nothing, so the added scope is
// unobservable). `embed` wraps each operand for the binding's dialect - `hostSlot` on babel,
// identity where the tree already is canonical ESTree. the surgery is the binding's: babel
// converts the products and inherits the replaced statement's attached comments, unplugin
// splices as is. the entries hold nodes, so a binding applies them by identity and reads a
// statement's index at apply time
export function planMinifierSequenceSplit(root, { embed = node => node } = {}) {
  const plan = [];
  // one operand's products. a leading STRING operand promoted to its own statement at a prologue
  // position re-parses as a Directive Prologue entry - `"use strict"` flipping a sloppy script
  // strict, `"use asm"` - a semantic shift the operand never carried, so `(0, str)` keeps it a
  // plain expression statement; only the first operand can land there (a later string operand is
  // already post-prologue)
  function operandProducts(operand, index) {
    const nested = getMinifierSequenceDestructureExpressions(expressionStatement(operand));
    if (nested) return nested.flatMap(operandProducts);
    const node = index === 0 && sequenceHeadDirectiveHazard(operand)
      ? sequenceExpression([literal(0), embed(operand)]) : embed(operand);
    const product = expressionStatement(node);
    product.start = operand.start;
    product.end = operand.end;
    product.loc = operand.loc;
    return [product];
  }
  function statementProducts(statement) {
    const expressions = getMinifierSequenceDestructureExpressions(statement);
    return expressions ? expressions.flatMap(operandProducts) : null;
  }
  forEachStatementPosition(root, {
    onList(statements) {
      for (const statement of statements) {
        const products = statementProducts(statement);
        if (products) plan.push({ statements, statement, products });
      }
    },
    onUnbracedSlot(host, key) {
      const products = statementProducts(host[key]);
      if (products) plan.push({ host, key, statement: host[key], products });
    },
  });
  return plan;
}
