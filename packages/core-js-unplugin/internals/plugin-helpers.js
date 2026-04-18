import { isASTNode, walkPatternIdentifiers } from '@core-js/polyfill-provider/helpers';
import { ORPHAN_REF_PATTERN } from '@core-js/polyfill-provider/import-state';

// oxc: `directive` is a string for directives; null (TSX) or undefined (JS) otherwise
export const isDirectiveStatement = n => n?.type === 'ExpressionStatement' && typeof n.directive === 'string';

// end position of the leading directive prologue ('use strict', etc.) - 0 if none
export function directivePrologueEnd(ast) {
  let end = 0;
  for (const stmt of ast.body) {
    if (!isDirectiveStatement(stmt)) break;
    end = stmt.end;
  }
  return end;
}

// node types that are safe to double-evaluate (no side effects, no temp ref needed)
export const NO_REF_NEEDED = new Set(['Identifier', 'ThisExpression']);

// chars that, as the previous statement's last token, fuse with a leading `(` on the
// next line into a call expression (parser continues without ASI)
const FUSES_WITH_OPEN_PAREN = /[\w"$')\]`]/;

// ES spec LineTerminator. anchors `//`-comment scans, ASI boundary checks
export const LINE_TERMINATOR = /[\n\r\u2028\u2029]/;

export function canFuseWithOpenParen(src, pos) {
  let i = pos - 1;
  while (i >= 0 && (src[i] === ' ' || src[i] === '\t' || src[i] === '\n' || src[i] === '\r')) i--;
  return i >= 0 && FUSES_WITH_OPEN_PAREN.test(src[i]);
}

// does `pos` sit at the start of the transform's enclosing ExpressionStatement? only then
// does ASI at this boundary matter for the injected `(...)` wrapper
export function startsEnclosingStatement(path, pos) {
  let p = path;
  while (p && p.node?.type !== 'ExpressionStatement') p = p.parentPath;
  return p?.node?.start === pos;
}

// `names` covers declarations at every nesting level so UID generation can't collide with
// `var _at = 1` deep in a function. `orphanRefs` is filtered against `names` by the caller
// so user `let _ref` isn't adopted as leftover. heap stack avoids overflow
export function collectAllBindingNames(ast) {
  const names = new Set();
  const orphanRefs = new Set();
  const addPattern = pat => walkPatternIdentifiers(pat, id => names.add(id.name));
  const stack = [ast];
  while (stack.length) {
    const node = stack.pop();
    if (Array.isArray(node)) {
      for (let i = node.length - 1; i >= 0; i--) stack.push(node[i]);
      continue;
    }
    if (!isASTNode(node)) continue;
    switch (node.type) {
      case 'VariableDeclarator':
        addPattern(node.id);
        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        if (node.id) names.add(node.id.name);
        for (const p of node.params) addPattern(p);
        break;
      case 'ArrowFunctionExpression':
        for (const p of node.params) addPattern(p);
        break;
      case 'ClassDeclaration':
      case 'ClassExpression':
      case 'TSEnumDeclaration':
      case 'TSModuleDeclaration':
        if (node.id) names.add(node.id.name);
        break;
      case 'CatchClause': if (node.param) addPattern(node.param); break;
      case 'ImportSpecifier':
      case 'ImportDefaultSpecifier':
      case 'ImportNamespaceSpecifier':
        names.add(node.local.name);
        break;
      case 'AssignmentExpression':
        if (node.operator === '=' && node.left?.type === 'Identifier' && ORPHAN_REF_PATTERN.test(node.left.name)) {
          orphanRefs.add(node.left.name);
        }
        break;
    }
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const v = node[key];
      if (Array.isArray(v) || isASTNode(v)) stack.push(v);
    }
  }
  return { names, orphanRefs };
}

// pre-pass fingerprint - any top-level import from one of our configured packages marks the
// source as our own output, not user code that happens to contain `_ref = ...` assignments.
// `packages` is the resolver's already-normalised list (pkg + additionalPackages, lowercased);
// bare-specifier prefix only - a relative `./vendor/` copy wouldn't be emitted by us
export function hasCoreJSPureImport(ast, packages) {
  for (const node of ast.body) {
    if (node?.type !== 'ImportDeclaration') continue;
    const source = node.source?.value?.toLowerCase();
    if (!source) continue;
    for (const pkg of packages) if (source.startsWith(`${ pkg }/`)) return true;
  }
  return false;
}

// ternary guard needs () only when parent operator has higher precedence than ?: or parent
// grammar restricts the expression (extends clause expects LeftHandSideExpression)
export const NEEDS_GUARD_PARENS = new Set([
  'BinaryExpression',
  'LogicalExpression',
  'UnaryExpression',
  'AwaitExpression',
  'UpdateExpression',
  'TaggedTemplateExpression',
  'SpreadElement',
  'ClassDeclaration',
  'ClassExpression',
]);

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

// `UnpluginContextMeta.framework` union (upstream unplugin). validating here so typos
// like `webpaaack` fail loudly instead of silently falling to the non-webpack default
export const KNOWN_BUNDLERS = new Set([
  'bun',
  'esbuild',
  'farm',
  'rolldown',
  'rollup',
  'rspack',
  'unloader',
  'vite',
  'webpack',
]);

// is `path` the unbraced body slot of an if/loop/with/label/arrow?
export function isBodylessStatementBody(path) {
  const parent = path.parentPath?.node;
  if (!parent) return false;
  if (parent.type === 'IfStatement') return parent.consequent === path.node || parent.alternate === path.node;
  return BODY_SLOT_TYPES.has(parent.type) && parent.body === path.node;
}
