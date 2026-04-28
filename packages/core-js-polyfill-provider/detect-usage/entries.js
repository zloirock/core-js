// entry / package detection for entry-global mode. extracts the source string from
// `import 'core-js/...'` / `require('core-js/...')` / `await import('core-js/...')` and
// scans existing core-js imports in the file body so the resolver can dedup them against
// plugin-injected ones
import { declaresRequireBinding, mayHaveSideEffects, singleQuasiString } from '../helpers/ast-patterns.js';
import { stripQueryHash } from '../helpers/path-normalize.js';
import { bindsModuleDefault, unwrapParens } from './resolve.js';

// extract a static string from a node that's either a StringLiteral or a no-interpolation
// TemplateLiteral. without TemplateLiteral support, `require(\`core-js/actual/promise\`)`
// (any tagless single-quasi template) silently bypasses entry detection
function extractStaticString(node, adapter) {
  if (!node) return null;
  if (node.type === 'TemplateLiteral') return singleQuasiString(node);
  return adapter.getStringValue(node);
}

// pull the source argument out of a dynamic import call (`import('core-js/...')`).
// covers both shapes: ImportExpression (`{type: 'ImportExpression', source}`) and the CallExpression
// form some parsers emit (`{type: 'CallExpression', callee: {type: 'Import'}, arguments: [...]}`)
function importExpressionSource(node, adapter) {
  const inner = unwrapParens(node);
  if (!inner) return null;
  if (inner.type === 'ImportExpression') return extractStaticString(inner.source, adapter);
  if (inner.type === 'CallExpression' && inner.callee?.type === 'Import') {
    return extractStaticString(inner.arguments?.[0], adapter);
  }
  return null;
}

// extract entry source from an AST node (ImportDeclaration / require() / await import())
// returns source string or null if not an entry pattern. when `scope` is provided, calls to a
// shadowed `require` (locally bound) are ignored
export function getEntrySource(node, adapter, scope) {
  // import 'core-js/...'
  if (node.type === 'ImportDeclaration' && node.specifiers?.length === 0) {
    return extractStaticString(node.source, adapter);
  }
  if (node.type !== 'ExpressionStatement') return null;
  // unwrap outer parens/TS wrappers: `(await import(...))` / `(require(...))` - parsers
  // that preserve `ParenthesizedExpression` would otherwise miss these entry patterns
  const expr = unwrapParens(node.expression);
  // require('core-js/...'); also handles webpack-style `(0, require)('core-js/...')` by
  // peeling the SequenceExpression tail (side-effect-free preceding elements drop out) so
  // tool-generated indirect-require wrappers still register as entries
  if (expr?.type === 'CallExpression' && expr.arguments?.length === 1) {
    // peel parens / TS wrappers / chain so `(require as any)('core-js/...')` and
    // `require!('core-js/...')` reach the same Identifier check. SequenceExpression peeled
    // separately - safe-mode unwrapParens stops on SE-with-side-effects which we want
    let callee = unwrapParens(expr.callee);
    if (callee?.type === 'SequenceExpression') {
      const tail = callee.expressions?.at(-1);
      if (tail && !callee.expressions.slice(0, -1).some(mayHaveSideEffects)) callee = unwrapParens(tail);
    }
    if (callee?.type === 'Identifier' && callee.name === 'require') {
      if (scope && adapter?.hasBinding?.(scope, 'require')) return null;
      return extractStaticString(expr.arguments[0], adapter);
    }
  }
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
const canonicalizeEntrySubpath = s => s.replace(/\.js$/, '').replace(/\/index$/, '');

// `?v=123` / `#hash` suffixes are Vite/webpack cache-bust markers, not part of the entry path.
// match `source` against `<pkg>/<subPrefix><rest>` where `pkg` is one of `pkgs`;
// returns canonicalized `<rest>` or null when no prefix matches or `<rest>` is empty
function matchEntrySubpath(source, pkgs, subPrefix) {
  // `pkgs` are lowercased by the caller; apply the same normalisation to the source so user
  // imports with case-mismatched package segments (`'@CORE-JS/PURE/...'`) dedupe against the
  // config's `@core-js/pure/...` entry instead of emitting duplicate default-imports
  const clean = stripQueryHash(source).toLowerCase();
  for (const pkg of pkgs) {
    const pkgPrefix = `${ pkg }/`;
    if (!clean.startsWith(pkgPrefix)) continue;
    const afterPkg = clean.slice(pkgPrefix.length);
    if (!afterPkg.startsWith(subPrefix)) return null;
    return canonicalizeEntrySubpath(afterPkg.slice(subPrefix.length)) || null;
  }
  return null;
}

function defaultSpecifierNames(node) {
  // `import X from` and `import { default as X } from` bind the same module export;
  // a user can legitimately stack both forms on one declaration (`import Def, { default as Alt }
  // from 'x'`) - surface every name so downstream registers both hints, not just the first.
  // per-specifier `importKind: 'type'` (`import { type default as T } from ...`) is type-only;
  // it never reaches runtime, so skip to avoid registering a phantom hint
  const out = [];
  for (const s of node.specifiers ?? []) {
    if (s?.importKind === 'type') continue;
    if (bindsModuleDefault(s) && s.local?.name) out.push(s.local.name);
  }
  return out;
}

// dual-API stub: Babel (`getBindingIdentifier`) + ESTree (`hasBinding`) adapters
const REQUIRE_SHADOWED_SCOPE = { hasBinding: () => true, getBindingIdentifier: () => true };

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
      // two shapes of type-only imports: `import type X from '...'` sets declaration-level
      // `importKind: 'type'`; `import { type X } from '...'` sets it per-specifier. both parsers
      // follow the same rule. defaultSpecifierNames already filters per-specifier, so here we
      // only need to skip the declaration-level case. type-only imports are erased at runtime
      // (TS stripping), so dedup'ing against their names would route runtime calls through an
      // undefined binding. exportKind never lives on ImportDeclaration (it's an Export*Declaration
      // field) - only importKind is relevant here
      if (node.importKind === 'type') continue;
      const source = adapter.getStringValue(node.source);
      if (typeof source !== 'string') continue;
      const names = defaultSpecifierNames(node);
      if (!names.length) continue;
      const entry = matchEntrySubpath(source, mainPkgs, modePrefix);
      if (entry) for (const name of names) onPureImport(entry, name, node);
      continue;
    }
    const source = getEntrySource(node, adapter, shadowScope);
    if (typeof source !== 'string') continue;
    const mod = matchEntrySubpath(source, packages, 'modules/');
    if (mod) onGlobalImport?.(mod, node);
  }
}
