// shape classification for destructure hosts (VariableDeclaration / AssignmentExpression
// inside ExpressionStatement). produces parser-agnostic booleans both plugins consume:
// `isExport` / `isForInit` / `isBodyless` / `isMultiDecl`. classification operates on raw
// AST nodes so callers can pass nodes from either babel paths or estree-toolkit paths.
//
// the strategy decision tree IS plugin-specific by design (babel uses per-prop AST mutation,
// unplugin uses batched text-rewrite emitting one transform per declaration) so the planners
// stay plugin-local. the underlying facts are the same, hence this shared classifier

// statement-body slots for unbraced control statements, `with`, and single-expression arrows
const BODY_SLOT_TYPES = new Set([
  'ArrowFunctionExpression',
  'DoWhileStatement',
  'ForInStatement',
  'ForOfStatement',
  'ForStatement',
  'LabeledStatement',
  'WhileStatement',
  'WithStatement',
]);

// is `host` in the unbraced body slot of `parent`?
// IfStatement has two slots (consequent/alternate); other body-hosts have a single `body`.
// callers pass raw nodes - works uniformly across babel paths and estree-toolkit paths
export function isBodylessStatementSlot(parent, host) {
  if (!parent) return false;
  if (parent.type === 'IfStatement') return parent.consequent === host || parent.alternate === host;
  return BODY_SLOT_TYPES.has(parent.type) && parent.body === host;
}

// classify a VariableDeclaration host's enclosing context. returns the parser-agnostic
// booleans the plugin's strategy planner consumes:
//   isExport     - declaration is wrapped in `export` (`ExportNamedDeclaration`)
//   isForInit    - declaration is the init slot of a `for` loop
//   isBodyless   - declaration sits in an unbraced body slot (if/while/...) -
//                  block-wrapping needed when emitting multiple statements
//   isMultiDecl  - declaration has multiple declarators (`let a, b, c`)
// gating: `isBodyless` requires `!isExport && !isForInit` because export wrappers
// and for-init slots have different shape concerns (export wraps a single decl;
// for-init's parent body slot doesn't apply to init position)
export function classifyVariableDeclarationHost({ declaration, declarationParent }) {
  const isExport = declarationParent?.type === 'ExportNamedDeclaration';
  const isForInit = declarationParent?.type === 'ForStatement' && declarationParent.init === declaration;
  const isBodyless = !isExport && !isForInit
    && isBodylessStatementSlot(declarationParent, declaration);
  return {
    isExport,
    isForInit,
    isBodyless,
    isMultiDecl: declaration.declarations.length > 1,
  };
}
