import { isBodylessStatementSlot } from '@core-js/polyfill-provider/destructure-host-shape';
import {
  blocksUidSlot,
  collectFileCensus,
  forEachStatementPosition,
  isDirectiveStatement,
  isInitlessVarDecl,
  isTopLevelImportLike,
  tsRuntimeBindingName,
  walkPatternIdentifiers,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { restSentinelNamesReducer } from '@core-js/polyfill-provider/detect-usage/own-output';
import { ORPHAN_REF_PATTERN } from '@core-js/polyfill-provider/injector-base';
import { liftSfcLangSuffix } from './sfc-shapes.js';
import {
  codePointEndingAt, findRegionContaining, isLineTerminator, isOptionalChainAt, literalRegionsOf, prevSignificantPos, skipGap,
} from './text-scan.js';

// re-export the shared `isDirectiveStatement` so existing unplugin consumers
// (`directivePrologueEnd`, `lastUserImportEnd`, `plugin.js`) keep working without
// refactor; single source of truth for the predicate lives in provider helpers
export { isDirectiveStatement };

// re-export `liftSfcLangSuffix` so `plugin.js` and the test runner keep their import path
// stable; canonical impl lives in `sfc-shapes.js` alongside the regexes it consumes
export { liftSfcLangSuffix };

// what the parser makes of a (query-stripped, SFC-lifted) module id, and with it what the
// lexer must make of the file's text: `.jsx` / `.tsx` admit JSX (`.js` does NOT - oxc rejects
// an element there), `.cjs` / `.cts` parse as a Script. the ONE spelling of both rules - the
// parse options, the import-style default and the lexer dialect all read it
export function sourceDialectOf(cleanId) {
  return { jsx: /\.[jt]sx$/.test(cleanId), script: /\.c[jt]s$/.test(cleanId) };
}

// recursive AST walker - seeds skippedNodes before batch overwrite so queued visits
// on descendants short-circuit (no duplicate polyfill inject from sibling handlers).
// O(N) per call where N is subtree size; callers feed it small subtrees (declarator,
// RHS of `in`, inner-callee chain) so total amortized cost across the file is bounded.
// `visit(node, parent)` - parent is the directly-enclosing AST node, null at root,
// used by callers (`polyfillSiblingReceiverRefs`) for context-aware filtering.
// depth cap protects against pathological deeply-nested AST (template-literal bombs,
// oxc bug-emitted cycles). 1024 covers realistic depth bounds with margin
export function walkAstNodes({ root, visit, parent = null, depth = 0 }) {
  // positional inner recursion: the options object stays a call-site convenience, and the
  // per-node hot path allocates nothing
  (function step(node, parentNode, level) {
    if (!node || typeof node !== 'object' || typeof node.type !== 'string' || level >= 1024) return;
    // an explicit `false` from the visit PRUNES the subtree (a type-annotation wall, a span
    // the caller owns); any other return keeps descending - existing callers return undefined
    if (visit(node, parentNode) === false) return;
    // eslint-disable-next-line no-restricted-syntax -- perf: AST hot path, plain objects
    for (const key in node) {
      const value = node[key];
      if (Array.isArray(value)) for (const item of value) step(item, node, level + 1);
      else step(value, node, level + 1);
    }
  })(root, parent, depth);
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

// `isRequireCall` + `isTopLevelImportLike` are shared with babel-plugin (the `var _ref;`
// placement boundary), so they live in provider helpers; re-export the region predicate so
// unplugin consumers + the unit tests keep importing it from here
export { isTopLevelImportLike };

// end position of the trailing user import / require statement in the leading import
// region; null if no imports. used to position `var _ref;` after the user's import block
// instead of between injected and user imports (lint `import/first` would warn). the scan
// steps past leading directives AND initless `var`s (sibling-plugin `var x;` declarations are
// runtime-hoisted, so an interspersed one must NOT truncate the region) - the same boundary
// babel-plugin's `reorderRefsAfterImports` walks; a genuine init-bearing / non-import statement
// halts it. `import "x"; var s; import "y";` therefore anchors `var _ref;` after `import "y"`
export function lastUserImportEnd(ast) {
  if (!ast?.body?.length) return null;
  let end = null;
  for (const stmt of ast.body) {
    if (isTopLevelImportLike(stmt)) {
      end = stmt.end;
      continue;
    }
    if (isDirectiveStatement(stmt) || isInitlessVarDecl(stmt)) continue;
    break;
  }
  return end;
}

// --- ASI at a statement boundary ---
// ONE question, asked by every channel that puts text at the head of a statement slot - the queue's
// `(`-leading replacements, the entry remover, the SE-prefix rewrite, the minifier-sequence split,
// the destructure lifted-SE emit: "would the FIRST char of what now stands here fuse LEFTWARD into
// the previous surviving statement?". two closed alphabets answer it, both on the FINAL text (the
// previous surviving char, after every removal around it, and the emitted first char):
//
// statement-START chars that fuse LEFTWARD into a fusion-capable prev statement: `(` (call), `[`
// (index), `/` (regex or division), `+` / `-` (binary), `` ` `` (tagged template), `<` (TS
// TypeAssertion / JSX). `<` over-fires on a real `a < b`, but a statement can START with `<` only as
// a TS type-assertion (`<T>x`) or JSX element - never a less-than continuation (`a; <b` is a
// SyntaxError, not `a<b`) - so a spurious `;` only ever precedes those, harmless
export const ASI_HAZARD_STARTS = new Set(['(', '[', '/', '+', '-', '`', '<']);

// prev SURVIVING chars at a statement boundary that CANNOT fuse with a following hazard-start: `;`
// (terminator) and the statement-list openers `{` (block / static block) and `:` (switch-case /
// label) - after them the injection is the FIRST statement of a list, so there is no prev value to
// fuse into. every other boundary char may fuse and is guarded conservatively: a value end, the
// `}` of a function-or-class EXPRESSION (a block's `}` cannot be told apart by the char, and the
// AST-side `asiFusableStatementStarts` already drops the statements a block closes), a postfix
// `++` / `--` (the spec ASIs `x++ (y)` and `x++ [k]` itself - the `;` there is a harmless extra),
// a TS non-null `!`, a `>` closing an instantiation expression. a deny-list because the fusing
// set is the open one: every character class that can end a value fuses, and an allow-list of
// those was caught short three times (`!`, `>`, the `.` of `?.`)
const NON_FUSING_PREV = new Set([';', '{', ':']);

// would emitting `firstChar` at statement position fuse LEFTWARD into the prev surviving char
// `prevChar`? callers pass the prev SURVIVING char (they bail on start-of-file themselves)
export function injectionFusesLeft(firstChar, prevChar) {
  return !NON_FUSING_PREV.has(prevChar) && ASI_HAZARD_STARTS.has(firstChar);
}

// does text beginning `firstChar`, put at statement position `start` in `src`, fuse LEFTWARD into the
// prev surviving statement? pairs the lexer-aware prev-significant-char scan with
// `injectionFusesLeft`. start-of-file (no prev) is safe. this is the predicate for an in-place
// statement overwrite; a removal batch asks the same question over its own survivor map in
// `detect-entry`, because there the prev surviving char is not the one in `src`
export function statementOverwriteFusesLeft(src, start, firstChar) {
  const prevIdx = prevSignificantPos(src, start);
  return prevIdx >= 0 && injectionFusesLeft(firstChar, src[prevIdx]);
}

// the chars that END A VALUE: a `(` right after one continues it into a call, a `(` after anything
// else opens a grouping layer. this is NOT the ASI question above (which is about a statement
// boundary, where the deny-list decides): it is asked mid-expression, where a `=` or `,` before
// the paren is normal and means "grouping". `}` included conservatively: a block's `}` and an
// object / function expression's `}` are one char, and only the latter ends a value. Unicode-aware:
// `\w` matches only ASCII, missing ID_Continue chars in identifiers (`Mapα(x)` is a call)
const VALUE_END_RE = /[\p{ID_Continue}"$')/\]`}]/u;

// an expression emitted at STATEMENT position parses as a block / declaration (not an expression)
// when its first token is `{` (ObjectExpression -> block), `function` / `function*` (-> function
// declaration), `class` (-> class declaration), or `async function`. wrap such a verbatim slice in
// parens so it stays an ExpressionStatement. babel's `t.expressionStatement` does this implicitly;
// the unplugin emits raw source slices (entry SE-prefix removal + minifier-sequence split) and must
// guard explicitly, else the slice reparses as a block / nameless declaration (SyntaxError or
// silently dropped pass)
const EXPR_STMT_HAZARD_START = /^\s*(?:\{|class\b|(?:async\s+)?function\b)/;
export function isExprStmtHazardStart(text) {
  return EXPR_STMT_HAZARD_START.test(text);
}
export function parenthesizeExprStmtHazard(text) {
  return isExprStmtHazardStart(text) ? `(${ text })` : text;
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

// ONE paren pass over a slice, answering everything its consumers ask: how many
// closers it borrows from the surrounding source (`unmatched`), whether anything is left open at
// the end (`open`), and whether the FIRST group closes before the last character (`closesEarly`).
// LEXER-AWARE, like every other paren walk in the pipeline: a paren inside a string, a template or
// a comment is text, and counting it answers about a group the source never opened. the slices here
// carry source text - a call argument, a type assertion's own literal type - so they can hold one.
// `collectPairs` additionally returns the balanced pairs it closed, innermost first - the same walk
// a caller reconstructing a peeled spelling needs, rather than a second one of its own
export function scanParens(src, collectPairs = false) {
  const regions = literalRegionsOf(src);
  const open = [];
  const pairs = collectPairs ? [] : null;
  let depth = 0;
  let unmatched = 0;
  let closesEarly = false;
  for (let i = 0; i < src.length;) {
    const region = findRegionContaining(regions, i);
    if (region) {
      i = region.end;
      continue;
    }
    if (src[i] === '(') {
      depth += 1;
      if (collectPairs) open.push(i);
    } else if (src[i] === ')') {
      if (collectPairs && open.length) pairs.push([open.pop(), i]);
      if (depth === 0) unmatched += 1;
      else if ((depth -= 1) === 0 && i !== src.length - 1) closesEarly = true;
    }
    i += 1;
  }
  return { unmatched, open: depth, closesEarly, pairs };
}

// the TEST operand of a composed `null == <test> ? void 0 : ...` guard. the test is emitted text, and
// one carrying a top-level operator binds LOOSER than `==`: a nested guard's own ternary spliced bare
// re-associated into `null == null == x ? void 0 : y ? void 0 : z`, which is not the same expression
// at all. atomic spellings (an identifier, a member chain, one paren group) are left exactly as they
// were, so nothing already correct grows a token.
// WHICH renders hand a non-atomic test here is not stable: the guard-root ladder decides it, and a
// change one rung up both introduced and removed the shape inside one day. this is a spelling rule
// over emitted text, not a render decision - it stays whether or not a caller currently reaches it
export function groupedGuardTest(src) {
  const regions = literalRegionsOf(src);
  let depth = 0;
  for (let i = 0; i < src.length;) {
    const region = findRegionContaining(regions, i);
    if (region) {
      i = region.end;
      continue;
    }
    const ch = src[i];
    if (ch === '(' || ch === '[' || ch === '{') depth += 1;
    else if (ch === ')' || ch === ']' || ch === '}') depth -= 1;
    // `?.` binds tighter than `==`; a bare `?` opens a ternary
    else if (depth === 0 && !(/[\w$.]/.test(ch) || isOptionalChainAt(src, i))) return `(${ src })`;
    i += 1;
  }
  return src;
}

// does a `(` at `pos` continue the value before it into a CALL? (else it opens a grouping layer -
// see `VALUE_END_RE`). the previous significant position may land on the trailing low surrogate
// of an astral identifier char; `codePointEndingAt` pairs it with the leading high surrogate so
// the test sees the whole code point instead of a lone surrogate (which matches nothing)
export function canFuseWithOpenParen(src, pos) {
  const i = prevSignificantPos(src, pos);
  return i >= 0 && VALUE_END_RE.test(codePointEndingAt(src, i));
}

// offsets where a `(`-leading replacement would fuse with an unterminated previous statement:
// the starts of every ExpressionStatement in a statement LIST. an unbraced control body is
// deliberately absent - its slot holds exactly one statement, so a `;` ahead of the replacement
// would empty the body instead of separating anything. asked once per file, by offset, so every
// emitting channel is covered by the one rule rather than each remembering to spell it
export function asiFusableStatementStarts(ast) {
  const starts = new Set();
  forEachStatementPosition(ast, {
    onList(statements) {
      for (const [i, stmt] of statements.entries()) {
        // a statement whose own BODY closes the previous one ends unambiguously: nothing can fuse
        // into `if (c) { ... }` or a `try` / `switch` / declaration block, so a `;` ahead of the
        // replacement is noise the AST leg never prints. NOT decided on the closing `}` alone - an
        // expression can end in one too (`var f = function () {}`), and there a `(` DOES fuse
        if (stmt.type === 'ExpressionStatement' && !statementEndsInOwnBlock(statements[i - 1])) {
          starts.add(stmt.start);
        }
      }
    },
  });
  return starts;
}

// does this statement END with a brace of its OWN body - the shape a following `(` cannot fuse into?
// recurses where the tail is another statement (`if`'s branch, a loop body, a label)
function statementEndsInOwnBlock(stmt) {
  // walk the TAIL down: an `if` ends where its last branch does, a loop / label where its body does
  for (let cur = stmt; cur;) {
    switch (cur.type) {
      case 'BlockStatement': case 'ClassDeclaration': case 'FunctionDeclaration':
      case 'SwitchStatement': case 'TryStatement': return true;
      case 'IfStatement': cur = cur.alternate ?? cur.consequent; break;
      case 'ForStatement': case 'ForInStatement': case 'ForOfStatement':
      case 'WhileStatement': case 'WithStatement': case 'LabeledStatement': cur = cur.body; break;
      default: return false;
    }
  }
  return false;
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

// `var`-scope boundary predicate (drives the census `atTopLevel` frame flag) lives with
// the shared census driver in ast-patterns - the orphan classifier here reads the flag
// off the census frame

// the parent positions the plugin emits a `_ref = X` memo write in: a `null == (...)` /
// `(...) === void 0` test (a BinaryExpression - parens / TS wrappers between them are
// forwarded as transparent by the walker below), a call argument (`_f(_ref = X)`), and the
// object of a member read (`(_ref = X).method` - the combined chain's raw member get over a
// memoized receiver). the classifier admits exactly those emit positions; ANY other parent is
// user-authored sloppy-mode code, so the name is reserved (stays the user's) instead of being
// adopted into a rehydrated module-level `var _ref;` that would share state with the user's
// binding. enumerating the emit set instead of the user set keeps unknown / future positions
// failing SAFE: an unlisted parent reserves the name and the plugin allocates `_ref2` around
// it. sequence memo trims (`(se(), X)`) place a ref assignment under a SequenceExpression -
// those refs are declared by the pre-pass flush (snapshot path), never orphan-adopted, so
// SequenceExpression stays out of the emit set on purpose
const PLUGIN_ASSIGN_PARENT_TYPES = new Set([
  'BinaryExpression',
  'CallExpression',
  'MemberExpression',
]);

// orphan-ref heuristic: an assignment is adoptable only in a plugin emit position (above)
// AND with a plugin-shaped RHS. scope-depth gate: plugin emits orphan assignments only at
// module top-level (the post-pass rehydrate declares `var _ref;` there). a `_ref = foo()`
// nested inside a user function is user's sloppy-mode code - adopting it would share state
// with our module-level `_ref`
function isPluginShapedOrphanAssign(node, parentType, atTopLevel) {
  if (!node.right || !atTopLevel || !PLUGIN_ASSIGN_PARENT_TYPES.has(parentType)) return false;
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
// census-reducer form: the shared file-census walk supplies the frame context (structural
// parent type with transparent wrappers forwarded + the module-top-level flag the orphan
// classifier keys on); the per-node collection below is unchanged
export function bindingNamesReducer() {
  const names = new Set();
  const declaredNames = new Set();
  const orphanRefs = new Set();
  // the rest-destructure sentinel position: a non-shorthand property VALUE of an ObjectPattern
  // that carries a RestElement (`{ polyKey: _unusedN, ...rest }`) - the ONE place the emitter
  // prints a `_unusedN`. a name bound there AND read nowhere else is what post adopts as its own
  // sentinel when the pre snapshot is gone; a user binding in that position that IS read
  // somewhere keeps its rewrite (its polyfill would be dropped by a skip)
  // declaredNames is the strict subset; pair the writes so the invariant holds at the source
  function addDecl(name) {
    names.add(name);
    declaredNames.add(name);
  }

  function addPattern(pat) {
    walkPatternIdentifiers(pat, id => addDecl(id.name));
  }

  function visit(node, { parentType, atTopLevel, parentNode, underTypeAnnotation }) {
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
      case 'TSModuleDeclaration': {
        // canonical id->runtime-name: leftmost segment for a `namespace A.B {}` TSQualifiedName id,
        // `.name` for a plain Identifier id, undefined for `declare module "foo"` (StringLiteral) or
        // an anonymous class - so the StringLiteral / anonymous cases stay out of the Set
        const declName = tsRuntimeBindingName(node.id);
        if (declName) addDecl(declName);
        break;
      }
      case 'CatchClause': if (node.param) addPattern(node.param); break;
      case 'ImportSpecifier':
      case 'ImportDefaultSpecifier':
      case 'ImportNamespaceSpecifier':
        addDecl(node.local.name);
        break;
      // `export { _ref as foo }` - `local` is the in-module binding our UID generator must
      // not collide with. Identifier visitor catches the `_ref` reference too, but adding
      // it here as a binding (not just name) keeps the declaredNames invariant honest. a
      // RE-export (`export { _ref as foo } from './m'`) names a binding of the OTHER module:
      // nothing in this one to collide with, and the AST emitter's scope claims none either
      case 'ExportSpecifier':
        if (node.local?.name && !parentNode?.source) addDecl(node.local.name);
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
      // a NON-REFERENCE position (object-literal key, non-computed member property, statement
      // label, import/export name slot) is a source-text name, not a binding the allocator can
      // shadow: reserving it makes unplugin over-number a UID-shaped `{ _ref: 1 }` / `foo()._ref`
      // / `_ref:` one slot above babel (which reserves only real bindings + references + id-rooted
      // member keys - the latter kept via `memberKeyNamesReducer`). skip so the taken-set matches.
      // undeclared reads in user code still land here referentially and stay reserved (a plugin
      // `_ref` must not shadow a `ReferenceError`-throwing reference with a silent `undefined`)
      case 'Identifier':
        if (!underTypeAnnotation && blocksUidSlot(parentNode, node)) names.add(node.name);
        break;
    }
  }
  function result() {
    return { names, declaredNames, orphanRefs };
  }
  return { visit, result };
}

export function collectAllBindingNames(ast) {
  // the sentinel-position census rides the same walk - its canon lives with the own-output family
  const { names, declaredNames, orphanRefs, restSentinelNames } = collectFileCensus(ast, [
    bindingNamesReducer(), restSentinelNamesReducer(),
  ]);
  return { names, declaredNames, orphanRefs, restSentinelNames };
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
// matches a core-js import in either specifier shape - usage-pure default (`import _Map from
// "@core-js/pure/..."`) or usage-global side-effect (`import "core-js/modules/..."`) - reading
// `ImportDeclaration.source.value` regardless of shape. usage-pure emits its imports INLINE in
// `pre` (it rewrites source text, so the output must carry its own imports to stay valid if post
// bails or loses the snapshot), so this fingerprint DOES re-detect a usage-pure pre-output on a
// snapshot-lost post / cache-miss run - the inherited orphan-adoption gate fires correctly there.
// usage-global still DEFERS its side-effect imports to post, so a usage-global pre-output carries
// no core-js import and isn't re-detected here; that path strands at most a missing side-effect
// polyfill (not a dangling reference), so the gap is benign
export function hasCoreJSImport(ast, packages) {
  for (const node of ast.body) {
    const source = pureImportSource(node);
    if (!source) continue;
    for (const pkg of packages) if (source.startsWith(`${ pkg }/`)) return true;
  }
  return false;
}

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
  'rsbuild',
  'rspack',
  'unloader',
  'vite',
  'webpack',
]);

// dynamic `import()` chunk-loader contract: bundlers in this set implement `import(...)`
// as `Promise.all([...])` of chunk fetches, so the resolved value is itself a Promise.all
// result rather than a bare module promise. detect-syntax adds `es.promise.all` polyfill
// only for these bundlers. rspack mirrors webpack semantics by design, and rsbuild builds
// on rspack (same chunk runtime); farm + unloader share the same Promise.all chunk envelope
// (per their upstream loader runtime). rolldown / vite / rollup return a bare module Promise
// for dynamic import and do NOT need the extra polyfill. unknown bundler value already
// drops to `false` upstream
const CHUNK_LOADER_BUNDLERS = new Set([
  'farm',
  'rsbuild',
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

// a paren pair the source wrote around a navigation a collapse REPLACED is redundant text once only
// the substituted root stands there (`delete (_globalThis).Box`): the AST leg's printer re-derives
// parens from precedence and prints none. an effect-free LITERAL prefix inside them goes too
// (`(0, globalThis.window).Promise = f`) - it evaluates to nothing observable and a member OBJECT
// reads the same with or without it. only around a dotted path of plain names: every other content
// may need the grouping it was written with
export function dropRedundantRootParens(src) {
  if (typeof src !== 'string') return src;
  // layer by layer: the source may have written more than one around the navigation the collapse
  // replaced (`delete ((n++, globalThis).self.window?.self).Box`), and each is redundant in turn
  for (let prev = null, cur = src; ; prev = cur, cur = dropOneRootParenLayer(cur)) {
    if (cur === prev) return cur;
  }
}

// an outer pair whose CONTENT is itself one parenthesized group is doubled, and doubled parens are
// redundant whatever they hold - the AST leg's printer never emits them. found by the shared paren
// walk, which is lexer-aware: a `(` inside a string or a template is text, not a group
function dropOneRootParenLayer(src) {
  if (src[0] !== '(') return src;
  const { pairs } = scanParens(src, true);
  const outer = pairs?.find(([open]) => open === 0);
  const inner = outer && pairs.find(([open, close]) => open === 1 && close === outer[1] - 1);
  return inner ? `${ src.slice(1, outer[1]) }${ src.slice(outer[1] + 1) }` : dropRedundantRootParenText(src);
}

function dropRedundantRootParenText(src) {
  return src.replace(ROOT_PAREN_RE, '$<path>');
}

// `(<injected path>)` in an object position, with or without an effect-free LITERAL ahead of it
const ROOT_PAREN_RE = /^\((?:(?:-?\d+(?:\.\d+)?|"[^"\\]*"|'[^'\\]*'|false|null|true|void 0)\s*,\s*)?(?<path>_[\w$]+(?:\.[\w$]+)*)\)(?=[.[])/;

