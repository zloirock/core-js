import {
  blocksUidSlot,
  isDirectiveStatement,
  isTopLevelImportLike,
  prologueEndIndex,
  tsRuntimeBindingName,
  unwrapRuntimeExpr,
  walkPatternIdentifiers,
} from '@core-js/polyfill-provider/helpers/ast-patterns';
import { ORPHAN_REF_PATTERN } from '@core-js/polyfill-provider/injector-base';
import { liftSfcLangSuffix } from './sfc-shapes.js';

// re-export the shared `isDirectiveStatement` so unplugin consumers
// (`import-injector.js`, `destructure.js`) keep one import home;
// single source of truth for the predicate lives in provider helpers
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

// the positional AST walk lives in the provider (the injector census shares it);
// re-exported here for this package's many callers
export { walkAstNodes } from '@core-js/polyfill-provider/helpers/ast-patterns';

// generic walker: advance past directive prologue in `statements`, starting from `fallback`.
// returns end-of-last-directive when present, else `fallback`. used by Program-level emit
// (fallback=0), and
// body-extract param insert (fallback=fn body open-brace+1) so an inserted statement
// doesn't split the directive off the prologue and silently flip to sloppy mode
export function skipDirectivePrologue(statements, fallback) {
  const end = prologueEndIndex(statements);
  return end ? statements[end - 1].end : fallback;
}

// `isRequireCall` + `isTopLevelImportLike` are shared with babel-plugin (the `var _ref;`
// placement boundary), so they live in provider helpers; re-export the region predicate so
// unplugin consumers + the unit tests keep importing it from here
export { isTopLevelImportLike };

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
// `}` of a function-or-class EXPRESSION (a block's `}` cannot be told apart by the char,
// so it is guarded conservatively too), a postfix
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

// an expression emitted at STATEMENT position parses as a block / declaration (not an expression)
// when its first token is `{` (ObjectExpression -> block), `function` / `function*` (-> function
// declaration), `class` (-> class declaration), or `async function`. wrap such a verbatim slice in
// parens so it stays an ExpressionStatement. babel's `t.expressionStatement` does this implicitly;
// the unplugin emits raw source slices (entry SE-prefix removal + minifier-sequence split) and must
// guard explicitly, else the slice reparses as a block / nameless declaration (SyntaxError or
// silently dropped pass)
const EXPR_STMT_HAZARD_START = /^\s*(?:\{|class\b|(?:async\s+)?function\b)/;
function isExprStmtHazardStart(text) {
  return EXPR_STMT_HAZARD_START.test(text);
}
export function parenthesizeExprStmtHazard(text) {
  return isExprStmtHazardStart(text) ? `(${ text })` : text;
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
  // names the USER writes through (plain or compound assignment) - the injector's
  // dedup-target poison: a user pure-import binding that is reassigned no longer holds the
  // polyfill, so deduping onto it would substitute the wrong value at runtime
  const assignedNames = new Set();
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
          } else {
            addDecl(node.left.name);
            assignedNames.add(node.left.name);
          }
        // an assignment-form destructure (`({ myFrom } = other)`) writes through every name
        // its pattern binds - the same poison, babel-side constantViolations count it too
        } else if (node.left?.type === 'ObjectPattern' || node.left?.type === 'ArrayPattern') {
          walkPatternIdentifiers(node.left, id => assignedNames.add(id.name));
        }
        break;
      case 'UpdateExpression':
        // `myFrom++` is a write through the binding - reassignment for the dedup poison
        if (node.argument?.type === 'Identifier') assignedNames.add(node.argument.name);
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
    return { names, declaredNames, orphanRefs, assignedNames };
  }
  return { visit, result };
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
// residual BOM bytes mid-prefix when a sibling plugin's per-pass BOM prepend stacks
// on top of ours, or when source is malformed multi-BOM. returns the BOM-free string;
// callers track whether a BOM was present (via a separate `charCodeAt(0)` check before
// stripping) so `sourcesContent` can keep the user's original bytes - the OUTPUT never
// re-emits a BOM
export function stripLeadingBOMs(code) {
  let i = 0;
  while (code.charCodeAt(i) === 0xFEFF) i++;
  return i === 0 ? code : code.slice(i);
}

// classifies `node`'s role under `parent`: 'call' / 'new' when node is the (wrapper-peeled)
// callee of that invocation, null otherwise. the single source of the invocation-kind answer -
// deriving kind from `parent.type` alone misclassifies ARGUMENT positions (`new Tag(base.name)`:
// the member's parent is the NewExpression, but its callee is `Tag`)
function calleeKind(node, parent) {
  if (!parent || (parent.type !== 'CallExpression' && parent.type !== 'NewExpression')) return null;
  if (unwrapRuntimeExpr(parent.callee) !== node) return null;
  return parent.type === 'NewExpression' ? 'new' : 'call';
}

// check if parent is a call/new expression with node as callee
export function isCallee(node, parent) {
  return calleeKind(node, parent) !== null;
}

// `((X)<T>)?.(a)` hides the callee from any later optional-chaining lowering: babel's
// `isTransparentExprWrapper` does not list `TSInstantiationExpression` the way our own
// `TS_EXPR_WRAPPERS` does, so it memoizes no receiver and emits a bare `_ref(a)` - the call
// loses its `this`. the instantiation dissolves into the call's own type arguments and its
// operand becomes the callee (`(X)?.<T>(a)` - the same TS spelling with no instantiation node
// left between the call and its callee). returns the recognized instantiation node, or null
export function optionalCallInstantiationCallee(node) {
  if (node?.type !== 'CallExpression' || !node.optional) return null;
  let { callee } = node;
  while (callee?.type === 'ParenthesizedExpression') callee = callee.expression;
  if (callee?.type !== 'TSInstantiationExpression') return null;
  return (callee.typeArguments ?? callee.typeParameters) ? callee : null;
}
