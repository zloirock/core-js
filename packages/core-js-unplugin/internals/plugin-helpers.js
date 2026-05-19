import { isBodylessStatementSlot } from '@core-js/polyfill-provider/destructure-host-shape';
import { isASTNode, isDirectiveStatement, walkPatternIdentifiers } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { ORPHAN_REF_PATTERN } from '@core-js/polyfill-provider/injector-base';

// re-export the shared `isDirectiveStatement` so existing unplugin consumers
// (`directivePrologueEnd`, `lastUserImportEnd`, `plugin.js`) keep working without
// refactor; single source of truth for the predicate lives in provider helpers
export { isDirectiveStatement };

// recursive AST walker - seeds skippedNodes before batch overwrite so queued visits
// on descendants short-circuit (no duplicate polyfill inject from sibling handlers).
// O(N) per call where N is subtree size; callers feed it small subtrees (declarator,
// RHS of `in`, inner-callee chain) so total amortized cost across the file is bounded.
// `visit(node, parent)` - parent is the directly-enclosing AST node, null at root,
// used by callers (`polyfillSiblingReceiverRefs`) for context-aware filtering.
// depth cap protects against pathological deeply-nested AST (template-literal bombs,
// oxc bug-emitted cycles). 1024 covers realistic depth bounds with margin
export function walkAstNodes({ root, visit, parent = null, depth = 0 }) {
  if (!root || typeof root !== 'object' || typeof root.type !== 'string' || depth >= 1024) return;
  visit(root, parent);
  for (const key of Object.keys(root)) {
    const value = root[key];
    if (Array.isArray(value)) for (const v of value) walkAstNodes({ root: v, visit, parent: root, depth: depth + 1 });
    else walkAstNodes({ root: value, visit, parent: root, depth: depth + 1 });
  }
}

// end position of the leading directive prologue ('use strict', etc.) - 0 if none
export function directivePrologueEnd(ast) {
  return skipDirectivePrologue(ast.body, 0);
}

// generic walker: advance past directive prologue in `statements`, starting from `fallback`.
// returns end-of-last-directive when present, else `fallback`. used by Program-level emit
// (fallback=0), ScopeTracker scope walker (fallback=scope's open-brace+1), and
// body-extract param insert (fallback=fn body open-brace+1) so an inserted statement
// doesn't split the directive off the prologue and silently flip to sloppy mode
export function skipDirectivePrologue(statements, fallback) {
  let end = fallback;
  for (const stmt of statements ?? []) {
    if (!isDirectiveStatement(stmt)) break;
    end = stmt.end;
  }
  return end;
}

// matches the leading import region (top-of-body contiguous run): ImportDeclaration,
// `export ... from 'mod'` re-export, `require(...)` ExpressionStatement, or
// VariableDeclaration with at least one `require()` initializer. mirrors babel-plugin's
// `reorderRefsAfterImports.isImport` so the `var _ref;` placement decision uses the same
// boundary on both pipelines. re-exports counted as imports because TC39 module records
// fetch the re-exported module before evaluating user body - placing `var _ref;` before
// them would interleave with the fetch order lint (`import/first`) flags
function isTopLevelImportLike(stmt) {
  if (stmt?.type === 'ImportDeclaration') return true;
  // `export { x } from 'mod'` / `export * from 'mod'` / `export * as ns from 'mod'`.
  // `ExportNamedDeclaration` without `.source` is a local re-export of an already-bound
  // identifier and is NOT an import - exclude via the `.source` check
  if (stmt?.type === 'ExportNamedDeclaration' && stmt.source) return true;
  if (stmt?.type === 'ExportAllDeclaration') return true;
  if (stmt?.type === 'ExpressionStatement'
    && stmt.expression?.type === 'CallExpression'
    && stmt.expression.callee?.type === 'Identifier'
    && stmt.expression.callee.name === 'require') return true;
  if (stmt?.type === 'VariableDeclaration') {
    return stmt.declarations.some(d => d.init?.type === 'CallExpression'
      && d.init.callee?.type === 'Identifier' && d.init.callee.name === 'require');
  }
  return false;
}

// end position of the trailing user import / require statement in the leading import
// region; null if no imports. used to position `var _ref;` after the user's import block
// instead of between injected and user imports (lint `import/first` would warn). the
// scan stops at the first non-import-or-directive statement - imports interspersed with
// code are NOT picked up (consistent with babel-plugin's reorderRefsAfterImports)
export function lastUserImportEnd(ast) {
  if (!ast?.body?.length) return null;
  let end = null;
  for (const stmt of ast.body) {
    if (isDirectiveStatement(stmt)) continue;
    if (!isTopLevelImportLike(stmt)) break;
    end = stmt.end;
  }
  return end;
}

// node types that are safe to double-evaluate (no side effects, no temp ref needed)
export const NO_REF_NEEDED = new Set(['Identifier', 'ThisExpression']);

// SFC frameworks (Vue / Svelte / Astro) emit virtual module ids carrying the parser-language
// hint inside the query string: `Component.vue?vue&type=script&lang=ts` /
// `App.svelte?svelte&type=script&lang=tsx`. after `stripQueryHash` the bare id loses the
// hint - oxc-parser would default to plain JS on the unknown `.vue` / `.svelte` extension
// and silently reject TS / JSX syntax in the script block. lift the lang suffix and
// synthesize a matching extension so oxc enables the right parser. lives in unplugin
// (not provider) because the bundler-virtual-id convention is bundler-specific - babel-plugin
// only sees real file paths. shared between transform pipeline and test runner's output
// validator so they agree on the parser-language hint.
// pattern MUST stay in sync with `index.js`'s `SFC_LANG_RE` (shouldTransform gate): the
// `[cm]?` prefix accepts `mts` / `cts` / `mjs` / `cjs` (Vue 3 + Astro support these natively),
// and `(?:[#&]|$)` accepts `#hash` terminators (sourcemap pipelines append `#L<line>`).
// without the sync, shouldTransform admits `App.vue?lang=mts` but liftSfcLangSuffix returns
// the bare baseId - oxc-parser then rejects the TS body on `.vue` extension
const SFC_LANG_RE = /[&?]lang=(?<ext>[cm]?[jt]sx?)(?:[#&]|$)/;
export function liftSfcLangSuffix(id, baseId) {
  const m = SFC_LANG_RE.exec(id);
  return m?.groups ? `${ baseId }.${ m.groups.ext }` : baseId;
}

// chars that, as the previous statement's last token, fuse with a leading `(` on the
// next line into a call expression (parser continues without ASI).
// `}` included conservatively: FunctionDeclaration / BlockStatement terminate without ASI
// concern, but FunctionExpression in an incomplete statement (`let x = function(){}\n(1,2)`
// - parser treats as `x = (function(){})(1,2)`) fuses. we can't distinguish the two from
// a single char; over-fusing adds a spurious `;` guard but doesn't break output.
// `/` covers both regex-literal closer (`let r = /foo/\n(...)` -> `(/foo/)(...)` - regex
// invoked as fn, TypeError) and division operator (`a / b\n(c)` -> `a / (b(c))` - silent
// arithmetic shift). postfix `++` / `--` deliberately omitted: spec disallows
// `UpdateExpression Arguments`, so the parser ASIs the boundary unconditionally
// Unicode-aware: `\w` matches only ASCII `[A-Za-z0-9_]`, missing ID_Continue chars in
// identifiers ending the previous statement (`Mapα\n(x)` would skip the ASI guard).
// `$` already listed explicitly because it's not in ID_Continue but IS a valid ident char
const FUSES_WITH_OPEN_PAREN = /[\p{ID_Continue}"$')/\]`}]/u;

// ES spec LineTerminator: LF / CR / LS (U+2028) / PS (U+2029). per-char check for
// hot loops where a regex-per-test would allocate the match array
export function isLineTerminator(ch) {
  return ch === '\n' || ch === '\r' || ch === '\u2028' || ch === '\u2029';
}

// forward-scan past a block comment whose opener is at `p` (caller has verified
// `src[p]==='/' && src[p+1]==='*'`). returns position after `*/`, or `src.length`
// when the comment is unterminated (defensive; parser would have rejected the source,
// but raw-text scanners upstream of parse must not loop forever)
export function skipBlockComment(src, p) {
  const end = src.indexOf('*/', p + 2);
  return end === -1 ? src.length : end + 2;
}

// JS WhiteSpace + LineTerminator per spec - `\s` covers space / tab / NBSP / FF / VT / BOM /
// ogham / Mongolian / EM / punctuation / ideographic separators / LF / CR / LS (U+2028) /
// PS (U+2029). shared by `skipGap` (forward) and `prevSignificantPos` (backward) - a 6-char
// explicit allowlist previously missed NBSP / BOM / FF / VT etc, treating them as significant
const WS_OR_LT_RE = /\s/;

// scan forward from `pos` in `src`, skipping whitespace and comments, until a non-gap char
export function skipGap(src, pos) {
  let p = pos;
  while (p < src.length) {
    const ch = src[p];
    if (WS_OR_LT_RE.test(ch)) {
      p++;
      continue;
    }
    if (ch === '/' && src[p + 1] === '/') {
      while (p < src.length && !isLineTerminator(src[p])) p++;
      continue;
    }
    if (ch === '/' && src[p + 1] === '*') {
      p = skipBlockComment(src, p);
      continue;
    }
    break;
  }
  return p;
}

// anchor for `var _ref;` as { statements, insertPos }, or null. `var` hoists to the
// enclosing function regardless of placement, so we pick the innermost braced block
// (any BlockStatement, including function bodies) to match Babel's codegen cosmetics
export function varScopeAnchor(node, code) {
  const { type, body } = node;
  if (type === 'StaticBlock') {
    // `static /*{*/ {` -> skip past `static` + any gap before `{`. skipGap handles
    // whitespace and block/line comments (including ones containing `{` like `/*{*/`),
    // so a naive `indexOf('{')` would pick the wrong brace
    return { statements: body, insertPos: skipGap(code, node.start + 'static'.length) + 1 };
  }
  if (type === 'BlockStatement') return { statements: node.body, insertPos: node.start + 1 };
  // wrappers whose `body` is itself the brace-delimited block:
  // - TSModuleDeclaration: `namespace N { ... }` body is TSModuleBlock
  // - CatchClause: catch-param subtree refs (`catch ({a = arr.at(-1)}) {}`) don't have
  //   body as ancestor, so the walk would skip past CatchClause to the enclosing
  //   function without this branch. var-hoisting still allocates at the function;
  //   anchoring to body keeps the syntactic association with the catch
  if ((type === 'TSModuleDeclaration' && body?.type === 'TSModuleBlock')
    || (type === 'CatchClause' && body?.type === 'BlockStatement')) {
    return { statements: body.body, insertPos: body.start + 1 };
  }
  return null;
}

// find the position of a real line-comment `//` on the line starting at `lineStart`,
// occurring at or before `until`. raw `src.indexOf('//', lineStart)` mis-detects `//`
// inside string / template literals (`var x = 'https://...'`); scan forward tracking
// the active quote (null in JS context, the quote-char while inside a literal) and only
// return a `//` that sits in JS context. block comments `/* ... */` are also skipped so
// an apostrophe inside `/* don't */` doesn't flip quote-state and `//` inside a block
// comment (`/* http:// */`) isn't mistaken for a line-comment start. regex literals
// (`/.../`) are NOT tracked - their lexical context is ambiguous without a full tokenizer,
// and the entry-global / pre-import shapes this serves rarely place regex on the same
// line as a comment
function realLineCommentStart(src, lineStart, until) {
  let quote = null;
  for (let p = lineStart; p <= until; p++) {
    const ch = src[p];
    if (quote !== null) {
      if (ch === '\\') p++;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && src[p + 1] === '*') {
      // unterminated block comment or one that extends past `until` swallows the rest
      // of the line - no line comment possible within `[lineStart, until]`. for the
      // in-range case, `skipBlockComment` returns position after `*/`; back off by 1
      // so the for-loop's `p++` resumes there
      const after = skipBlockComment(src, p);
      if (after > until + 1) return -1;
      p = after - 1;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch;
    else if (ch === '/' && src[p + 1] === '/' && p + 1 <= until) return p;
  }
  return -1;
}

// scan backwards past whitespace and comments; -1 if we walked off the start
export function prevSignificantPos(src, pos) {
  let i = pos - 1;
  while (i >= 0) {
    const ch = src[i];
    if (WS_OR_LT_RE.test(ch)) {
      i--;
      continue;
    }
    if (ch === '/' && src[i - 1] === '*') {
      // `*/` could be a block-comment closer OR the tail of a regex literal like
      // `/a*/`. block-comment requires a matching `/*` opener earlier; without one,
      // the `/` is a regex closer (or other significant char) and IS significant.
      // returning -1 here would silently drop ASI-fuse detection and emit
      // `var rx = /a*/(arr)()` - regex called as function, TypeError at runtime
      const start = src.lastIndexOf('/*', i - 2);
      if (start === -1) return i;
      i = start - 1;
      continue;
    }
    // line comment: if a real `//` lives earlier on the same line, current char is inside
    // it. `isLineTerminator` covers LF/CR/LS/PS so the current-line scan stops at the right
    // boundary. `realLineCommentStart` filters out `//` inside string / template literals
    // AND inside block comments so the backward walk doesn't mistake `'https://...'`
    // content or `/* http:// */` for a comment-prefixed line
    let lineStart = i;
    while (lineStart > 0 && !isLineTerminator(src[lineStart - 1])) lineStart--;
    const slash = realLineCommentStart(src, lineStart, i);
    if (slash !== -1) {
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

// RHS node types the plugin emits for `_ref = ...` memoization - used to classify a bare
// `_ref = X` assignment as plugin leftover vs user sloppy-mode code.
// plugin can also emit array/object literal shapes (destructure-init extraction for proxy-
// global destructure) and SequenceExpression tails (deferSideEffect trims into `(se(), X)`
// form), so those are plugin-valid too
const PLUGIN_EMIT_RHS_TYPES = new Set([
  'CallExpression',
  'ChainExpression',
  'MemberExpression',
  'NewExpression',
  'OptionalCallExpression',
  'OptionalMemberExpression',
  'ArrayExpression',
  'ObjectExpression',
  'SequenceExpression',
]);

// node types that introduce a new `var`-scope boundary. plugin rehydrates orphans as
// `var _ref;` at module top, which hoists through any nested BlockStatement / CatchClause /
// ForStatement (they bind `let`/`const` only, `var` hoists past them). functions / classes /
// static-blocks are real boundaries: `var` hoists at most to their body, not past them.
// descending into these drops `atTopLevel` so orphan-candidate gating matches the emission
// invariant (plugin never emits orphan `_ref = X` across a var-scope boundary)
const SCOPE_REBINDING_TYPES = new Set([
  'FunctionDeclaration',
  'FunctionExpression',
  'ArrowFunctionExpression',
  'ObjectMethod',
  'ClassDeclaration',
  'ClassExpression',
  'ClassMethod',
  'ClassPrivateMethod',
  'MethodDefinition',
  // ES2022 class `static { ... }` has its own var-scope; `var` inside doesn't leak to the class
  'StaticBlock',
]);

function isScopeRebinding(node) {
  return SCOPE_REBINDING_TYPES.has(node.type);
}

// plugin never emits `_ref = X` assignments into these parent positions - they surface only
// from user sloppy-mode code. listed alongside ExpressionStatement (bare statement form) so
// the orphan classifier rejects all user-written top-level shapes uniformly
const USER_ASSIGN_PARENT_TYPES = new Set([
  'ExpressionStatement',
  'SwitchCase',
  'ThrowStatement',
  'ForStatement',
  // `for (const x of (_ref = arr())) {}` / `for (const x in (_ref = obj)) {}` - RHS is
  // a user-authored assignment-then-iterate idiom. plugin never emits its memo refs as
  // the iterable; without these entries the assignment would get misclassified as orphan
  'ForOfStatement',
  'ForInStatement',
  'IfStatement',
  'WhileStatement',
  'DoWhileStatement',
  'ReturnStatement',
  // `(_ref = foo(), _ref.x)` in a declaration init is user-authored - plugin never
  // emits its memo refs inside SequenceExpression tails. without this, user code like
  // `let r = (_ref = helper(), _ref.x)` gets misclassified as orphan and adopted
  'SequenceExpression',
]);

// orphan-ref heuristic: plugin emits `_ref = foo()` / `_ref = obj.x` as a sub-expression inside
// a ConditionalExpression guard or a call argument. user-shape assignments - in statement
// positions, switch/throw/loop/if/return heads - aren't plugin output regardless of RHS shape.
// scope-depth gate: plugin emits orphan assignments only at module top-level (the post-pass
// rehydrate declares `var _ref;` there). a `_ref = foo()` nested inside a user function is
// user's sloppy-mode code - adopting it would share state with our module-level `_ref`
function isPluginShapedOrphanAssign(node, parentType, atTopLevel) {
  if (!node.right || !atTopLevel || USER_ASSIGN_PARENT_TYPES.has(parentType)) return false;
  return PLUGIN_EMIT_RHS_TYPES.has(node.right.type);
}

// `names` covers declarations at every nesting level so UID generation can't collide with
// `var _at = 1` deep in a function. `orphanRefs` is filtered against `names` by the caller
// so user `let _ref` isn't adopted as leftover. heap stack avoids overflow.
// parentType carries the containing AST node's type across array-slot hops so the orphan
// classifier can distinguish `_ref = X;` (ExpressionStatement parent) from nested uses.
// `declaredNames` is the strict subset of `names` populated only by VariableDeclarator /
// function param / Catch / TS module / class id / Import specifier - things that bind a
// real binding. case Identifier dumps every reference into `names` for UID safety, so the
// adopt-filter needs a stricter signal to distinguish "user declared `var _ref;`" from
// "Identifier traversal saw plugin-emitted `_ref = ...` and reserved the read site"
export function collectAllBindingNames(ast) {
  const names = new Set();
  const declaredNames = new Set();
  const orphanRefs = new Set();

  // declaredNames is the strict subset; pair the writes so the invariant holds at the source
  function addDecl(name) {
    names.add(name);
    declaredNames.add(name);
  }

  function addPattern(pat) {
    walkPatternIdentifiers(pat, id => addDecl(id.name));
  }

  // scope-depth tracks whether we're still at module top-level (outside any function / class
  // that rebinds `this` / scope). plugin emits its `_ref = X` orphans only at top-level, so
  // nested-scope assignments are user code regardless of RHS shape
  const stack = [{ node: ast, parentType: null, atTopLevel: true }];
  while (stack.length) {
    const { node, parentType, atTopLevel } = stack.pop();
    if (Array.isArray(node)) {
      for (let i = node.length - 1; i >= 0; i--) stack.push({ node: node[i], parentType, atTopLevel });
      continue;
    }
    if (!isASTNode(node)) continue;
    switch (node.type) {
      case 'VariableDeclarator':
        addPattern(node.id);
        break;
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        if (node.id) addDecl(node.id.name);
        for (const p of node.params) addPattern(p);
        break;
      case 'ArrowFunctionExpression':
        for (const p of node.params) addPattern(p);
        break;
      case 'ClassDeclaration':
      case 'ClassExpression':
      case 'TSEnumDeclaration':
      case 'TSModuleDeclaration':
        // `declare module "foo"` - id is a Literal, not Identifier (no `.name`). guard to
        // avoid polluting the Set with `undefined`
        if (node.id?.name) addDecl(node.id.name);
        break;
      case 'CatchClause': if (node.param) addPattern(node.param); break;
      case 'ImportSpecifier':
      case 'ImportDefaultSpecifier':
      case 'ImportNamespaceSpecifier':
        addDecl(node.local.name);
        break;
      // `export { _ref as foo }` - `local` is the in-module binding our UID generator must
      // not collide with. Identifier visitor catches the `_ref` reference too, but adding
      // it here as a binding (not just name) keeps the declaredNames invariant honest
      case 'ExportSpecifier':
        if (node.local?.name) addDecl(node.local.name);
        break;
      case 'AssignmentExpression':
        // plugin-shaped nested `_ref = foo()` - candidate for orphan adoption, NOT reserved
        // (adoption gate requires name NOT in `declaredNames`). anything else - reserve so our
        // UID generator can't reuse a name the user writes to.
        // compound ops (`+=`, `||=`, etc.) are always user-authored: the plugin never emits
        // them, and they imply a pre-existing binding the user writes through - reserve
        // unconditionally so allocation can't collide with them
        if (node.left?.type === 'Identifier') {
          if (node.operator === '=' && ORPHAN_REF_PATTERN.test(node.left.name)
              && isPluginShapedOrphanAssign(node, parentType, atTopLevel)) {
            orphanRefs.add(node.left.name);
          } else addDecl(node.left.name);
        }
        break;
      // every Identifier surfaces here - bindings already reserved via their structural case,
      // but bare references (`console.log(_ref)` where `_ref` is undeclared) land only here.
      // over-reserving property names from member access / object literal keys is harmless:
      // plugin never allocates shape like `push` / `at` / etc., only `_ref*` / `_Xxx` UIDs.
      // undeclared reads in user code would otherwise let plugin claim `_ref` and shadow
      // `ReferenceError`-throwing references with silent `undefined`
      case 'Identifier':
        names.add(node.name);
        break;
    }
    // descending into a function / class body: children see `atTopLevel = false` so nested
    // `_ref = foo()` reserves the name instead of counting as plugin-emitted orphan
    const childAtTopLevel = atTopLevel && !isScopeRebinding(node);
    // parens are transparent to the orphan classifier's parent check - `case (x)` /
    // `throw (x)` put ParenthesizedExpression between the structural parent and the
    // assignment; forwarding the outer parentType lets the user-shape blacklist fire
    const childParentType = node.type === 'ParenthesizedExpression' ? parentType : node.type;
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const v = node[key];
      if (Array.isArray(v) || isASTNode(v)) stack.push({ node: v, parentType: childParentType, atTopLevel: childAtTopLevel });
    }
  }
  return { names, declaredNames, orphanRefs };
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

// `UnpluginContextMeta.framework` union (upstream unplugin). validating here so typos
// like `webpaaack` fail loudly instead of silently falling to the non-webpack default.
// `unloader` is the farm-family unloader bundler (upstream groups it alongside
// rollup/vite/rolldown/farm in one overloaded framework union) - keep in sync with
// `node_modules/unplugin/dist/*.d.ts` `framework:` string-literal declarations
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
// thin path-aware wrapper around the parser-agnostic `isBodylessStatementSlot` so callers
// pass an estree-toolkit path while the underlying check stays shared with babel-plugin
export function isBodylessStatementBody(path) {
  return isBodylessStatementSlot(path.parentPath?.node, path.node);
}
