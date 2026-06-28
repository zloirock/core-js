// entry / package detection for entry-global mode. extracts the source string from
// `import 'core-js/...'` / `require('core-js/...')` / `await import('core-js/...')` and
// scans existing core-js imports in the file body so the resolver can dedup them against
// plugin-injected ones
import { declaresRequireBinding, mayHaveSideEffects, peelSkippableWrappers, singleQuasiString } from '../helpers/ast-patterns.js';
import { normalizeImportSource } from '../helpers/path-normalize.js';
import { bindsModuleDefault, unwrapTransparentSeq } from './resolve.js';

// extract a static string from a node that's either a StringLiteral or a no-interpolation
// TemplateLiteral. without TemplateLiteral support, `require(\`core-js/actual/promise\`)`
// (any tagless single-quasi template) silently bypasses entry detection
function extractStaticString(node, adapter) {
  if (!node) return null;
  // peel paren / TS wrappers so `require((`core-js/...`))` (oxc keeps the ParenthesizedExpression
  // that babel strips) and `require('core-js/...' as const)` reach the literal check on both
  // parsers. SequenceExpression is deliberately NOT peeled here: `adapter.getStringValue` already
  // resolves a side-effect-free SE tail (`require((0, 'core-js/...'))`) to its literal on BOTH
  // parsers via the shared paren-unwrap, and a side-effecting prefix bails on both - detection
  // stays parser-symmetric without peeling SE at this layer
  const inner = peelSkippableWrappers(node);
  if (inner?.type === 'TemplateLiteral') return singleQuasiString(inner);
  return adapter.getStringValue(inner);
}

// pull the source argument out of a dynamic import call (`import('core-js/...')`).
// covers both shapes: ImportExpression (`{type: 'ImportExpression', source}`) and the CallExpression
// form some parsers emit (`{type: 'CallExpression', callee: {type: 'Import'}, arguments: [...]}`)
function importExpressionSource(node, adapter) {
  const inner = unwrapTransparentSeq(node);
  if (!inner) return null;
  if (inner.type === 'ImportExpression') return extractStaticString(inner.source, adapter);
  if (inner.type === 'CallExpression' && inner.callee?.type === 'Import') {
    return extractStaticString(inner.arguments?.[0], adapter);
  }
  return null;
}

// `require('core-js/...')` value-call -> source string, or null. peels webpack `(0, require)(...)`
// (SequenceExpression callee tail) and paren / TS / chain wrappers (`(require as any)('...')`,
// `require!('...')`); accepts optional `require?.(...)` on both parsers. a locally-shadowed
// `require` (looked up via `scope` / `adapter`) is ignored. shared by `getEntrySource` (statement
// form) and `scanExistingCoreJSImports` (the `var X = require(...)` pure-import shape)
function requireCallSource(node, adapter, scope) {
  if ((node?.type !== 'CallExpression' && node?.type !== 'OptionalCallExpression')
    || node.arguments?.length !== 1) return null;
  let callee = unwrapTransparentSeq(node.callee);
  if (callee?.type === 'SequenceExpression') {
    const tail = callee.expressions?.at(-1);
    if (tail) callee = unwrapTransparentSeq(tail);
  }
  if (callee?.type !== 'Identifier' || callee.name !== 'require') return null;
  if (scope && adapter?.hasBinding?.(scope, 'require')) return null;
  return extractStaticString(node.arguments[0], adapter);
}

// extract entry source from an AST node (ImportDeclaration / require() / await import())
// returns source string or null if not an entry pattern. when `scope` is provided, calls to a
// shadowed `require` (locally bound) are ignored
export function getEntrySource(node, adapter, scope) {
  // import 'core-js/...' - but `import type {} from 'core-js/...'` (and Flow's `import typeof`)
  // erases before runtime, so it is NOT a runtime side-effect entry and must not expand
  if (node.type === 'ImportDeclaration' && node.specifiers?.length === 0
    && !isTypeOnlyImportKind(node.importKind)) {
    return extractStaticString(node.source, adapter);
  }
  // TS `import X = require('core-js/...')` - tsc/esbuild emit this as CJS-style entry.
  // moduleReference is TSExternalModuleReference wrapping the string literal; value-mode
  // (no `type` modifier) is a runtime side-effect import. accept identically to bare
  // `import 'core-js/...'` so config that targets TS-source projects registers the entry
  if (node.type === 'TSImportEqualsDeclaration' && !node.isExport && node.importKind !== 'type'
    && node.moduleReference?.type === 'TSExternalModuleReference') {
    return extractStaticString(node.moduleReference.expression, adapter);
  }
  if (node.type !== 'ExpressionStatement') return null;
  // unwrap outer parens/TS wrappers: `(await import(...))` / `(require(...))` - parsers
  // that preserve `ParenthesizedExpression` would otherwise miss these entry patterns
  const expr = unwrapTransparentSeq(node.expression);
  // require('core-js/...') (incl. webpack `(0, require)(...)`, TS-wrapped, optional `require?.()`)
  const required = requireCallSource(expr, adapter, scope);
  if (required !== null) return required;
  // await import('core-js/...') as a top-level statement (ESM top-level await).
  // bare `import('...')` without await is intentionally ignored: it discards the returned
  // promise (unhandled rejection risk). `import(...).then(cb)` is also ignored - the user
  // explicitly opted into async runtime loading, so replacing the dynamic import with static
  // side-effect imports would erase that async shape; see fixture `audit-dynamic-import-then-skip`
  if (expr?.type === 'AwaitExpression') return importExpressionSource(expr.argument, adapter);
  return null;
}

// core-js ships only `.js` files; the trailing `/index` collapses when users reference a
// directory-style entry path (`core-js/stable/array/index` === `core-js/stable/array`)
function canonicalizeEntrySubpath(s) {
  return s.replace(/\.js$/, '').replace(/\/index$/, '');
}

// `?v=123` / `#hash` suffixes are Vite/webpack cache-bust markers, not part of the entry path.
// match `source` against `<pkg>/<subPrefix><rest>` where `pkg` is one of `pkgs`;
// returns canonicalized `<rest>` or null when no prefix matches or `<rest>` is empty.
// `normalizeImportSource` (shared with `getCoreJSEntry`) handles case / backslash / slash-
// collapse uniformly so pre-pass dedup catches Vite-rewritten Windows imports and Farm's
// doubled-slash artifact equally
function matchEntrySubpath(source, pkgs, subPrefix) {
  const clean = normalizeImportSource(source);
  for (const pkg of pkgs) {
    const pkgPrefix = `${ pkg }/`;
    if (!clean.startsWith(pkgPrefix)) continue;
    const afterPkg = clean.slice(pkgPrefix.length);
    // `continue`, not `return null`: when an earlier package is a path-prefix of `source` but
    // the sub-prefix doesn't match (`a/` matches but `a/stable/x` isn't under `modules/`), a
    // LATER package that IS a full match (`a/b/` over `a/b/modules/x`) must still be tried -
    // bailing here would make matching order-dependent
    if (!afterPkg.startsWith(subPrefix)) continue;
    return canonicalizeEntrySubpath(afterPkg.slice(subPrefix.length)) || null;
  }
  return null;
}

// both `import type X` / `import { type X }` and Flow's `import typeof X` / `import { typeof X }`
// erase before runtime, so a name they bind must never register as a dedup target - a later real
// use rewritten onto the erased binding throws ReferenceError. only babel parses Flow (`typeof`),
// but the predicate is shared so both import-kind sites stay in lockstep
function isTypeOnlyImportKind(kind) {
  return kind === 'type' || kind === 'typeof';
}

function defaultSpecifierNames(node) {
  // `import X from` and `import { default as X } from` bind the same module export;
  // a user can legitimately stack both forms on one declaration (`import Def, { default as Alt }
  // from 'x'`) - surface every name so downstream registers both hints, not just the first.
  // per-specifier type-only kind (`import { type default as T }` / `import { typeof default as T }`)
  // never reaches runtime, so skip to avoid registering a phantom hint
  const out = [];
  for (const s of node.specifiers ?? []) {
    if (isTypeOnlyImportKind(s?.importKind)) continue;
    if (bindsModuleDefault(s) && s.local?.name) out.push(s.local.name);
  }
  return out;
}

// dual-API stub: Babel (`getBindingIdentifier`) + ESTree (`hasBinding`) adapters
const REQUIRE_SHADOWED_SCOPE = {
  hasBinding() { return true; },
  getBindingIdentifier() { return true; },
};

// removing an existing core-js import that is an INDIRECT require (`(spy(), require)('core-js/modules/
// X')`) drops the require invocation - the module is re-injected by the plugin - but must KEEP the
// callee's side-effect prefix. the matched import argument is always a literal module path (that is how
// the scan recognizes it), so the callee carries every harvestable effect. returns the callee node to
// emit in place of the call (`(spy(), require)` -> `(spy(), require);`), or null for a plain removal.
// `peelSkippableWrappers` unwraps the estree `ChainExpression` an optional require (`...?.('core-js/X')`)
// nests under, so both parsers see the inner call (babel keeps it a bare OptionalCallExpression)
export function coreJSImportRemovalKeptCallee(node) {
  if (node?.type !== 'ExpressionStatement') return null;
  const call = peelSkippableWrappers(node.expression);
  if (call?.type !== 'CallExpression' && call?.type !== 'OptionalCallExpression') return null;
  return mayHaveSideEffects(call.callee) ? call.callee : null;
}

// callback receives the AST node so callers can remove+re-emit in canonical order -
// the only load-order-correct option when user polyfill A and plugin-injected B depend
// on each other in either direction.
// pure-import dedup / super-method mapping is scoped to the main package only:
// `additionalPackages` are monorepo aliases / vendor forks the user picked deliberately,
// so their bindings stay inert and their `super.X` stays with the fork's own semantics
export function scanExistingCoreJSImports(ast, { packages, pkg, mode, adapter, onGlobalImport, onPureImport }) {
  // `packages` is lowercased in the resolver; mirror that so config `package: '@My/Fork'`
  // still matches the user's source literal when they typed the lowercase canonical form
  const mainPkgs = pkg ? [pkg.toLowerCase()] : null;
  const modePrefix = mode ? `${ mode }/` : null;
  const shadowScope = declaresRequireBinding(ast.body) ? REQUIRE_SHADOWED_SCOPE : null;
  for (const node of ast.body ?? []) {
    if (node.type === 'ImportDeclaration' && node.specifiers?.length) {
      if (!onPureImport || !mainPkgs || !modePrefix) continue;
      // two shapes of type-only imports: `import type X from '...'` (Flow `import typeof X`) sets
      // declaration-level `importKind`; `import { type X } from '...'` sets it per-specifier. both
      // parsers follow the same rule. defaultSpecifierNames already filters per-specifier, so here
      // we only need to skip the declaration-level case. type-only imports are erased at runtime
      // (TS / Flow stripping), so dedup'ing against their names would route runtime calls through an
      // undefined binding. exportKind never lives on ImportDeclaration (it's an Export*Declaration
      // field) - only importKind is relevant here
      if (isTypeOnlyImportKind(node.importKind)) continue;
      const source = adapter.getStringValue(node.source);
      if (typeof source !== 'string') continue;
      const names = defaultSpecifierNames(node);
      if (!names.length) continue;
      const entry = matchEntrySubpath(source, mainPkgs, modePrefix);
      if (entry) for (const name of names) onPureImport(entry, name, node);
      continue;
    }
    // TS `import X = require('<pkg>/<mode>/...')` - the same pure require-import shape tsc/esbuild
    // emit; without recognising it the `phase: 'pre+post'` post re-scan misses it and re-emits a
    // duplicate import. only the PURE-mode match short-circuits here - a non-pure (`modules/...`
    // side-effect) TSImportEquals must still fall through to the global `getEntrySource` path below,
    // which already handles this node shape. reads the source off the TSExternalModuleReference
    if (node.type === 'TSImportEqualsDeclaration'
      && onPureImport && mainPkgs && modePrefix && node.id?.type === 'Identifier'
      && !node.isExport && node.importKind !== 'type'
      && node.moduleReference?.type === 'TSExternalModuleReference') {
      const required = extractStaticString(node.moduleReference.expression, adapter);
      const entry = typeof required === 'string' ? matchEntrySubpath(required, mainPkgs, modePrefix) : null;
      if (entry) {
        onPureImport(entry, node.id.name, node);
        continue;
      }
    }
    // `var X = require('<pkg>/<mode>/...')` - the require import style emits this for pure
    // substitution, so the post re-scan must recognise it as an existing pure import or
    // `phase: 'pre+post'` re-emits a duplicate `require` (double module-eval). a require-bound
    // var is never a global side-effect entry (those are bare ExpressionStatements), so this
    // branch always `continue`s
    if (node.type === 'VariableDeclaration') {
      if (onPureImport && mainPkgs && modePrefix) {
        for (const decl of node.declarations ?? []) {
          if (decl.id?.type !== 'Identifier') continue;
          const required = requireCallSource(decl.init, adapter, shadowScope);
          if (required === null) continue;
          const entry = matchEntrySubpath(required, mainPkgs, modePrefix);
          if (entry) onPureImport(entry, decl.id.name, node);
        }
      }
      continue;
    }
    const source = getEntrySource(node, adapter, shadowScope);
    if (typeof source !== 'string') continue;
    const mod = matchEntrySubpath(source, packages, 'modules/');
    if (mod) onGlobalImport?.(mod, node);
  }
}
