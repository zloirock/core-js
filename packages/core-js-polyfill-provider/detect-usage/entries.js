// entry / package detection for entry-global mode. extracts the source string from
// `import 'core-js/...'` / `require('core-js/...')` / `await import('core-js/...')` and
// scans existing core-js imports in the file body so the resolver can dedup them against
// plugin-injected ones
import { declaresRequireBinding, tsImportEqualsRequireSource, unwrapExportedDeclaration } from '../helpers/ast-patterns.js';
import { normalizeImportSource, packageRootPrefix } from '../helpers/path-normalize.js';
import {
  bindsModuleDefault,
  extractStaticString,
  isTypeOnlyImportKind,
  requireCallSource,
  unwrapTransparentSeq,
} from './resolve.js';

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

// the statement types `getEntrySource` can possibly accept - the ONE definition of that set.
// a caller pre-filtering a body walk asks THIS, never a local copy: the copy is what silently
// drops a newly accepted arm on one emitter only, and the two entry detectors then disagree
const ENTRY_STATEMENT_TYPES = new Set(['ImportDeclaration', 'ExpressionStatement']);

// can this statement be an entry at all? `getEntrySource`'s own first-line bail, exported so a
// caller that pre-filters a body walk skips the adapter / scope work on the same domain the
// resolver rejects - one membership test instead of a re-listed type set
export function mayBeEntryStatement(node) {
  return ENTRY_STATEMENT_TYPES.has(node?.type);
}

// extract entry source from an AST node (ImportDeclaration / require() / await import())
// returns source string or null if not an entry pattern. when `scope` is provided, calls to a
// shadowed `require` (locally bound) are ignored. `export * from 'core-js/...'` is deliberately
// NOT an entry: a re-export is a bundle pattern, not an entry point
export function getEntrySource(node, adapter, scope) {
  if (!mayBeEntryStatement(node)) return null;
  // import 'core-js/...' - but `import type {} from 'core-js/...'` (and Flow's `import typeof`)
  // erases before runtime, so it is NOT a runtime side-effect entry and must not expand
  if (node.type === 'ImportDeclaration' && node.specifiers?.length === 0
    && !isTypeOnlyImportKind(node.importKind)) {
    return extractStaticString(node.source, adapter);
  }
  // TS `import X = require('core-js/...')` binds a value like `import X from` and `const X =
  // require()` do - a binding import, never a side-effect entry, used or not: the minifier-joined
  // `require('core-js/x'), b()` is not read here either - the minifier-sequence split lands ahead
  // of every entry read and promotes the call to the statement this reads
  if (node.type !== 'ExpressionStatement') return null;
  // unwrap outer parens/TS wrappers: `(await import(...))` / `(require(...))` - parsers
  // that preserve `ParenthesizedExpression` would otherwise miss these entry patterns
  const expr = unwrapTransparentSeq(node.expression);
  // require('core-js/...') (incl. webpack `(0, require)(...)`, TS-wrapped, optional `require?.()`)
  const required = requireCallSource(expr, { adapter, scope });
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
// `{ entry, pkg }` for the FIRST package this specifier belongs to, or null. the package travels
// with the entry because a recognised import is re-emitted, and re-emitting it under the plugin's
// own package would silently retarget a user's polyfill at another one
function matchEntrySubpath(source, pkgs, subPrefix) {
  const clean = normalizeImportSource(source);
  for (const pkg of pkgs) {
    const afterPkg = subpathAfterPackage(clean, pkg);
    // `continue`, not `return null`: when an earlier package is a path-prefix of `source` but
    // the sub-prefix doesn't match (`a/` matches but `a/stable/x` isn't under `modules/`), a
    // LATER package that IS a full match (`a/b/` over `a/b/modules/x`) must still be tried -
    // bailing here would make matching order-dependent
    if (afterPkg === null || !afterPkg.startsWith(subPrefix)) continue;
    const entry = canonicalizeEntrySubpath(afterPkg.slice(subPrefix.length)) || null;
    if (entry) return { entry, pkg };
  }
  return null;
}

// what follows the package in an already-normalized specifier, or null. three spellings answer for
// one package: the bare name the source writes, the RESOLVED ROOT the injector writes under
// `absoluteImports` (whose directory need not be named after the package), and - for a layout
// neither of those covers - the name as a path SEGMENT
function subpathAfterPackage(clean, pkg) {
  const pkgPrefix = `${ pkg }/`;
  if (clean.startsWith(pkgPrefix)) return clean.slice(pkgPrefix.length);
  const root = packageRootPrefix(pkg);
  if (root && clean.startsWith(root)) return clean.slice(root.length);
  const segment = clean.lastIndexOf(`/${ pkgPrefix }`);
  return segment === -1 ? null : clean.slice(segment + 1 + pkgPrefix.length);
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

// callback receives the AST node so callers can remove+re-emit in canonical order -
// the only load-order-correct option when user polyfill A and plugin-injected B depend
// on each other in either direction.
// pure-import dedup / super-method mapping is scoped to the main package only:
// `additionalPackages` are monorepo aliases / vendor forks the user picked deliberately,
// so their bindings stay inert and their `super.X` stays with the fork's own semantics
export function scanExistingCoreJSImports(ast, {
  packages,
  pkg,
  mode,
  adapter,
  onGlobalImport,
  onPureImport,
  isDisabled = null,
}) {
  // `packages` is lowercased in the resolver; mirror that so config `package: '@My/Fork'`
  // still matches the user's source literal when they typed the lowercase canonical form
  const mainPkgs = pkg ? [pkg.toLowerCase()] : null;
  const modePrefix = mode ? `${ mode }/` : null;
  const shadowScope = declaresRequireBinding(ast.body) ? REQUIRE_SHADOWED_SCOPE : null;
  for (const node of ast.body ?? []) {
    // an opt-out directive means "do not touch this line": the statement is neither adopted as a
    // dedup target nor removed and re-emitted, so it stays exactly where the author wrote it. the
    // cost is deliberate - unknown to the injector, the module may be imported a second time beside
    // it, and that is the reading the file-level `core-js-disable-file` has always had
    if (isDisabled?.(node)) continue;
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
      const match = matchEntrySubpath(source, mainPkgs, modePrefix);
      if (match) for (const name of names) onPureImport(match.entry, name);
      continue;
    }
    // TS `import X = require('<pkg>/<mode>/...')` - the same pure require-import shape tsc/esbuild
    // emit; without recognising it the `phase: 'pre+post'` post re-scan misses it and re-emits a
    // duplicate import. a binding import like `import X from` - exported or not, since neither the
    // wrapper nor the modifier changes the binding - and so never a global side-effect entry: a
    // non-pure one is left where the author wrote it, its binding intact
    const declaration = unwrapExportedDeclaration(node);
    if (declaration?.type === 'TSImportEqualsDeclaration') {
      const required = onPureImport && mainPkgs && modePrefix ? tsImportEqualsRequireSource(declaration, adapter) : null;
      const match = typeof required === 'string' ? matchEntrySubpath(required, mainPkgs, modePrefix) : null;
      if (match) onPureImport(match.entry, declaration.id.name);
      continue;
    }
    // `var X = require('<pkg>/<mode>/...')` - the require import style emits this for pure
    // substitution, so the post re-scan must recognise it as an existing pure import or
    // `phase: 'pre+post'` re-emits a duplicate `require` (double module-eval). a require-bound
    // var is never a global side-effect entry (those are bare ExpressionStatements), so this
    // branch always `continue`s
    if (declaration?.type === 'VariableDeclaration') {
      if (onPureImport && mainPkgs && modePrefix) {
        for (const decl of declaration.declarations ?? []) {
          if (decl.id?.type !== 'Identifier') continue;
          const required = requireCallSource(decl.init, { adapter, scope: shadowScope });
          if (required === null) continue;
          const match = matchEntrySubpath(required, mainPkgs, modePrefix);
          if (match) onPureImport(match.entry, decl.id.name);
        }
      }
      continue;
    }
    const source = getEntrySource(node, adapter, shadowScope);
    if (typeof source !== 'string') continue;
    const mod = matchEntrySubpath(source, packages, 'modules/');
    // the PACKAGE travels with the module: this import is removed and re-emitted, and a user's
    // global polyfill re-emitted under the plugin's own (pure) package stops polyfilling anything
    if (mod) onGlobalImport?.(mod.entry, node, mod.pkg);
  }
}
