import { isBodylessStatementSlot } from '@core-js/polyfill-provider/destructure-host-shape';
import { isASTNode, isDirectiveStatement, walkPatternIdentifiers } from '@core-js/polyfill-provider/helpers/ast-patterns';
import { ORPHAN_REF_PATTERN } from '@core-js/polyfill-provider/injector-base';
import { liftSfcLangSuffix } from './sfc-shapes.js';

// re-export the shared `isDirectiveStatement` so existing unplugin consumers
// (`directivePrologueEnd`, `lastUserImportEnd`, `plugin.js`) keep working without
// refactor; single source of truth for the predicate lives in provider helpers
export { isDirectiveStatement };

// re-export `liftSfcLangSuffix` so `plugin.js` and the test runner keep their import path
// stable; canonical impl lives in `sfc-shapes.js` alongside the regexes it consumes
export { liftSfcLangSuffix };

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

// chars that, as the previous statement's last token, fuse with a leading `(` on the
// next line into a call expression (parser continues without ASI). this is the
// inverse-direction predicate to `ASI_HAZARD_STARTS` in `detect-entry.js`: that one
// lists STARTING chars (`(`, `[`, `/`, `+`, `-`, ``, `<`) that fuse with any
// fusion-capable prev; this one lists ENDING chars that fuse with `(` specifically
// (the broadest single hazard - covers all the IIFE-wrapped emission shapes the
// usage-* pipelines emit). the two sets are deliberately asymmetric: usage-* paths
// emit `(...)` wrappers around polyfilled receivers and only need to guard against
// the prev-char direction; entry-* paths remove arbitrary statements and need to
// guard against the next-char direction (broader, since the next statement's first
// char is unconstrained by emission shape).
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

// consume ONE logical line ending starting at `pos`: a CRLF or LFCR pair (2 chars), or
// a single LF / CR / LS (U+2028) / PS (U+2029) (1 char). returns the position AFTER the
// terminator, or `pos` unchanged if `src[pos]` is not a LineTerminator. callers use this
// to drop the trailing newline of a removed top-level statement without erasing the
// user's intentional vertical gaps - multi-LT runs beyond the first pair survive by
// design so blank-line layout between import block and code body is preserved.
// LFCR mirrors CRLF: a mis-configured tool may emit LF before CR; without pair handling
// only LF would be consumed and the stray CR would print as an extra blank line
export function consumeOneLineEnding(src, pos) {
  if ((src[pos] === '\r' && src[pos + 1] === '\n')
    || (src[pos] === '\n' && src[pos + 1] === '\r')) return pos + 2;
  if (isLineTerminator(src[pos])) return pos + 1;
  return pos;
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

// one-pass lexer-like scan: classify every char of `src` into literal regions (strings,
// templates, comments) so backward walks (`prevSignificantPos`) can skip past them with
// a single binary-search lookup instead of re-scanning per char. each region is a half-
// open `[start, end)` range carrying `kind`:
//   - 'string'        - `'...'` / `"..."` (with `\` escapes + `\<LineTerminator>` continuation)
//   - 'template'      - `` `...` `` text-content portions (split around `${...}` expressions
//     so expression bodies remain JS context where `//` IS a real line comment)
//   - 'block-comment' - `/* ... */`
//   - 'line-comment'  - `// ...` up to (not including) line terminator
// regex literals `/.../` are NOT tracked - regex vs division disambiguation requires
// prior-token analysis that this raw-text scanner doesn't perform. covered by the
// `prevSignificantPos` regex-closer escape hatch (the `/` is significant whether regex
// closer or unknown)
function scanLiteralRegions(src) {
  const regions = [];
  let i = 0;
  while (i < src.length) {
    const after = tryScanLiteralAt(src, i, regions);
    i = after !== null ? after : i + 1;
  }
  return regions;
}

// scan ONE literal starting at `p` - string, template, block comment, line comment - and
// push its region(s) to `regions`. returns the position past the literal, or null when `p`
// isn't a literal opener (caller advances by 1). shared by the top-level scan and the
// template `${...}` expression body so both apply identical literal classification
function tryScanLiteralAt(src, p, regions) {
  const ch = src[p];
  if (ch === '"' || ch === "'") return scanStringRegion(src, p, ch, regions);
  if (ch === '`') return scanTemplateRegion(src, p, regions);
  if (ch === '/' && src[p + 1] === '*') {
    const end = skipBlockComment(src, p);
    regions.push({ start: p, end, kind: 'block-comment' });
    return end;
  }
  if (ch === '/' && src[p + 1] === '/') {
    let q = p;
    while (q < src.length && !isLineTerminator(src[q])) q++;
    regions.push({ start: p, end: q, kind: 'line-comment' });
    return q;
  }
  return null;
}

function scanStringRegion(src, start, quote, regions) {
  let p = start + 1;
  while (p < src.length) {
    const c = src[p];
    if (c === '\\') {
      // line continuation `\<LineTerminator>` extends the string. `\r\n` consumes both
      // chars. any other `\X` escape consumes 2 chars
      if (p + 1 < src.length && src[p + 1] === '\r' && src[p + 2] === '\n') {
        p += 3;
        continue;
      }
      p += 2;
      continue;
    }
    if (c === quote) {
      p++;
      break;
    }
    // unescaped line terminator ends the string (spec: SyntaxError, but we bail at the
    // line break to keep the scanner robust against malformed input)
    if (isLineTerminator(c)) break;
    p++;
  }
  regions.push({ start, end: p, kind: 'string' });
  return p;
}

function scanTemplateRegion(src, start, regions) {
  let chunkStart = start;
  let p = start + 1;
  while (p < src.length) {
    const c = src[p];
    if (c === '\\') {
      p += 2;
      continue;
    }
    if (c === '`') {
      p++;
      regions.push({ start: chunkStart, end: p, kind: 'template' });
      return p;
    }
    if (c === '$' && src[p + 1] === '{') {
      // close current text-content chunk; `${...}` body is JS context (not a region here),
      // so a `//` or `/*` inside it gets recorded as a real comment via `tryScanLiteralAt`.
      // brace-depth tracking with recursive literal scan inside the expression
      regions.push({ start: chunkStart, end: p, kind: 'template' });
      p += 2;
      let depth = 1;
      while (p < src.length && depth > 0) {
        const ec = src[p];
        if (ec === '{') depth++;
        else if (ec === '}') depth--;
        if (ec === '{' || ec === '}') {
          p++;
          continue;
        }
        const after = tryScanLiteralAt(src, p, regions);
        p = after !== null ? after : p + 1;
      }
      chunkStart = p;
      continue;
    }
    p++;
  }
  // unterminated template - record final chunk extending to end of source
  regions.push({ start: chunkStart, end: p, kind: 'template' });
  return p;
}

// single-entry memoization keyed on source-string identity. each transform processes one
// source; helper functions on that source share the same `src` reference, so reads after
// the first hit the cache. between transforms `src` changes - cache miss invalidates the
// stale region map. string keys can't go in WeakMap; identity-equality + 1-slot bound
// avoids unbounded growth without LRU bookkeeping
let cachedRegionsSrc = null;
let cachedRegions = null;
function literalRegionsOf(src) {
  if (src === cachedRegionsSrc) return cachedRegions;
  cachedRegions = scanLiteralRegions(src);
  cachedRegionsSrc = src;
  return cachedRegions;
}

// binary search for the region containing `pos` (start <= pos < end). null when no region
// matches - pos is in JS context
function findRegionContaining(regions, pos) {
  let lo = 0;
  let hi = regions.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (regions[mid].start <= pos) lo = mid + 1;
    else hi = mid;
  }
  if (lo === 0) return null;
  const cand = regions[lo - 1];
  return pos >= cand.start && pos < cand.end ? cand : null;
}

// scan backwards past whitespace and comments; -1 if we walked off the start. queries the
// pre-computed literal-region map: positions inside string / template literals return the
// closing quote (significant - fuses with `(`); positions inside comments skip to before
// the opener and continue. regex literals fall through to the "non-region" branch where
// the `/` reads as significant (correct - regex closer fuses with `(`)
export function prevSignificantPos(src, pos) {
  const regions = literalRegionsOf(src);
  let i = pos - 1;
  while (i >= 0) {
    const region = findRegionContaining(regions, i);
    if (region) {
      if (region.kind === 'string' || region.kind === 'template') {
        // closing quote / backtick IS the significant boundary - fuses with `(`
        return region.end - 1;
      }
      // block/line comment - skip past the opener
      i = region.start - 1;
      continue;
    }
    if (WS_OR_LT_RE.test(src[i])) {
      i--;
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
// bare-specifier prefix only - a relative `./vendor/` copy wouldn't be emitted by us.
// covers BOTH modes: usage-pure (`import _Map from "@core-js/pure/..."`) AND usage-global
// (`import "core-js/modules/..."`). the extractor reads `ImportDeclaration.source.value`
// regardless of specifier shape, so side-effect-only imports match the same as default /
// named imports - webpack persistent-cache flow (pre cached + post fresh) re-detects pre's
// fingerprint in both modes when orphan adoption needs to fire without inherit
export function hasCoreJSImport(ast, packages) {
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

// dynamic `import()` chunk-loader contract: bundlers in this set implement `import(...)`
// as `Promise.all([...])` of chunk fetches, so the resolved value is itself a Promise.all
// result rather than a bare module promise. detect-syntax adds `es.promise.all` polyfill
// only for these bundlers. rspack mirrors webpack semantics by design; farm + unloader
// share the same Promise.all chunk envelope (per their upstream loader runtime).
// rolldown / vite / rollup return a bare module Promise for dynamic import and do NOT
// need the extra polyfill. unknown bundler value already drops to `false` upstream
const CHUNK_LOADER_BUNDLERS = new Set([
  'farm',
  'rspack',
  'unloader',
  'webpack',
]);

export function isChunkLoaderBundler(bundler) {
  return CHUNK_LOADER_BUNDLERS.has(bundler);
}

// strip ALL leading U+FEFF (Byte Order Mark) characters. a single-strip would leave
// residual BOM bytes mid-prefix when a sibling plugin's per-pass BOM re-prepend stacks
// on top of ours, or when source is malformed multi-BOM. returns the BOM-free string;
// callers track whether a BOM was present (via a separate `charCodeAt(0)` check before
// stripping) to decide whether to re-prepend a single BOM on output
export function stripLeadingBOMs(code) {
  let i = 0;
  while (code.charCodeAt(i) === 0xFEFF) i++;
  return i === 0 ? code : code.slice(i);
}

// is `path` the unbraced body slot of an if/loop/with/label/arrow?
// thin path-aware wrapper around the parser-agnostic `isBodylessStatementSlot` so callers
// pass an estree-toolkit path while the underlying check stays shared with babel-plugin
export function isBodylessStatementBody(path) {
  return isBodylessStatementSlot(path.parentPath?.node, path.node);
}
