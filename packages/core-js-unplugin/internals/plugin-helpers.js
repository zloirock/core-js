import { isASTNode, walkPatternIdentifiers } from '@core-js/polyfill-provider/helpers';
import { ORPHAN_REF_PATTERN } from '@core-js/polyfill-provider/import-state';

// unplugin parses exclusively via oxc, which represents directives as top-of-body
// ExpressionStatement nodes with `.directive: string` (babel uses a separate
// `Program.directives` array - out of scope here)
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
// next line into a call expression (parser continues without ASI).
// `}` included conservatively: FunctionDeclaration / BlockStatement terminate without ASI
// concern, but FunctionExpression in an incomplete statement (`let x = function(){}\n(1,2)`
// - parser treats as `x = (function(){})(1,2)`) fuses. we can't distinguish the two from
// a single char; over-fusing adds a spurious `;` guard but doesn't break output
const FUSES_WITH_OPEN_PAREN = /[\w"$')\]`}]/;

// ES spec LineTerminator. anchors `//`-comment scans, ASI boundary checks
export const LINE_TERMINATOR = /[\n\r\u2028\u2029]/;

// forward-scan past a block comment whose opener is at `p` (caller has verified
// `src[p]==='/' && src[p+1]==='*'`). returns position after `*/`, or `src.length`
// when the comment is unterminated (defensive; parser would have rejected the source,
// but raw-text scanners upstream of parse must not loop forever)
export function skipBlockComment(src, p) {
  const end = src.indexOf('*/', p + 2);
  return end === -1 ? src.length : end + 2;
}

// scan backwards past whitespace and comments; -1 if we walked off the start.
// ES line-terminators include U+2028 / U+2029 in addition to LF / CR
function prevSignificantPos(src, pos) {
  let i = pos - 1;
  while (i >= 0) {
    const ch = src[i];
    if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r'
      || ch === '\u2028' || ch === '\u2029') {
      i--;
      continue;
    }
    if (ch === '/' && src[i - 1] === '*') {
      const start = src.lastIndexOf('/*', i - 2);
      if (start === -1) return -1;
      i = start - 1;
      continue;
    }
    // line comment: if `//` lives earlier on the same line, current char is inside it
    let lineStart = i;
    while (lineStart > 0 && src[lineStart - 1] !== '\n' && src[lineStart - 1] !== '\r') lineStart--;
    const slash = src.indexOf('//', lineStart);
    if (slash !== -1 && slash <= i) {
      i = slash - 1;
      continue;
    }
    return i;
  }
  return -1;
}

export function canFuseWithOpenParen(src, pos) {
  const i = prevSignificantPos(src, pos);
  return i >= 0 && FUSES_WITH_OPEN_PAREN.test(src[i]);
}

// does `pos` sit at the start of the transform's enclosing ExpressionStatement? only then
// does ASI at this boundary matter for the injected `(...)` wrapper
export function startsEnclosingStatement(path, pos) {
  let p = path;
  while (p && p.node?.type !== 'ExpressionStatement') p = p.parentPath;
  return p?.node?.start === pos;
}

// orphan-ref heuristic: our plugin emits `_ref = foo()` / `_ref = obj.x` - RHS always complex.
// user sloppy-mode `_ref = 1` / `_ref = 'x'` with a literal RHS is user code
function isComplexOrphanRhs(rhs) {
  if (!rhs) return false;
  return rhs.type === 'CallExpression' || rhs.type === 'OptionalCallExpression'
    || rhs.type === 'MemberExpression' || rhs.type === 'OptionalMemberExpression'
    || rhs.type === 'ChainExpression' || rhs.type === 'NewExpression';
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
        // `_ref = foo()` / `_ref = obj.bar` with complex RHS fits our emit shape: candidate
        // for orphan adoption, NOT reserved (adoption gate requires name NOT in `names`).
        // everything else (non-orphan pattern, or orphan pattern with literal RHS) is user
        // code - reserve so our UID generator doesn't reuse a name the user writes to
        if (node.operator === '=' && node.left?.type === 'Identifier') {
          if (ORPHAN_REF_PATTERN.test(node.left.name) && isComplexOrphanRhs(node.right)) {
            orphanRefs.add(node.left.name);
          } else {
            names.add(node.left.name);
          }
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

// source string (lowercased) of `require('@pkg/...')`, or null. covers both bare
// side-effect form and `var X = require(...)` init form - the plugin emits either
// depending on `importStyle`, and the fingerprint must catch both
function requireCallSource(expr) {
  if (expr?.type !== 'CallExpression') return null;
  if (expr.callee?.type !== 'Identifier' || expr.callee.name !== 'require') return null;
  const arg = expr.arguments?.[0];
  return typeof arg?.value === 'string' ? arg.value.toLowerCase() : null;
}

// top-level statement mapped to the core-js source string it imports, else null.
// dispatches ESM `import` and CJS `require`/var-require shapes to their extractors
function pureImportSource(node) {
  switch (node?.type) {
    case 'ImportDeclaration': return node.source?.value?.toLowerCase() ?? null;
    case 'ExpressionStatement': return requireCallSource(node.expression);
    case 'VariableDeclaration':
      for (const d of node.declarations) {
        const src = requireCallSource(d.init);
        if (src) return src;
      }
      return null;
    default: return null;
  }
}

// pre-pass fingerprint - any top-level import from one of our configured packages marks the
// source as our own output, not user code that happens to contain `_ref = ...` assignments.
// `packages` is the resolver's already-normalised list (pkg + additionalPackages, lowercased);
// bare-specifier prefix only - a relative `./vendor/` copy wouldn't be emitted by us
export function hasCoreJSPureImport(ast, packages) {
  for (const node of ast.body) {
    const source = pureImportSource(node);
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
