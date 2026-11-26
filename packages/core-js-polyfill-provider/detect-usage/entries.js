// entry / package detection for entry-global mode. extracts the source string from
// `import 'core-js/...'` / `require('core-js/...')` / `await import('core-js/...')` and
// scans existing core-js imports in the file body so the resolver can dedup them against
// plugin-injected ones
import {
  extractIndirectRequireSEPrefix,
  peelSequenceTail,
  declaresRequireBinding,
  hostRequireCallLimit,
  tsImportEqualsRequireSource,
  isTSRuntimeBindingDeclaration,
  unwrapExportedDeclaration,
  bindsModuleDefault,
  extractStaticString,
  isAmbientTypeDeclaration,
  isInitlessVarDecl,
  isPlainModuleLoad,
  isPrologueDirectiveStatement,
  isTypeOnlyImportKind,
  performsNothing,
  programPrologueEndIndex,
  pureImportSourceEntry,
  requireCallSource,
  unwrapRuntimeExpr,
  userRequireAt,
  unwrapTransparentSeq,
  walkAstNodes,
  walkPatternIdentifiers,
} from '../helpers/ast-patterns.js';
import { observablePrefixOperand } from './resolve.js';
import { awaitedImport, bareRequire, expressionStatement, identifier, logicalExpression, voidZero } from '../render.js';
import { sortByPolyfillOrder } from '../plugin-options/inject.js';
import { matchEntrySubpath, resolveImportPath } from '../helpers/path-normalize.js';

export { matchEntrySubpath } from '../helpers/path-normalize.js';

// pull the source argument out of a dynamic import call (`import('core-js/...')`).
// covers both shapes: ImportExpression (`{type: 'ImportExpression', source}`) and the CallExpression
// form some parsers emit (`{type: 'CallExpression', callee: {type: 'Import'}, arguments: [...]}`)
function importExpressionSource(node, adapter, isDisabled) {
  let inner = unwrapRuntimeExpr(node);
  while (inner?.type === 'SequenceExpression') {
    if (inner.expressions.slice(0, -1).some(prefix => !performsNothing(prefix))) return null;
    inner = unwrapRuntimeExpr(inner.expressions.at(-1));
  }
  if (!inner || !isPlainModuleLoad(inner) || isDisabled?.(inner)) return null;
  if (inner.type === 'ImportExpression') return isDisabled?.(inner.source, true) ? null : extractStaticString(inner.source, adapter);
  if (inner.type === 'CallExpression' && inner.callee?.type === 'Import' && inner.arguments.length === 1) {
    const source = inner.arguments?.[0];
    return source && isDisabled?.(source, true) ? null : extractStaticString(source, adapter);
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
// NOT an entry: a re-export is a bundle pattern, not an entry point. An opted-out
// host or source specifier keeps its original load, including its module-format marker.
export function getEntrySource(node, adapter, scope, isDisabled = null) {
  if (!mayBeEntryStatement(node) || isDisabled?.(node)) return null;
  // import 'core-js/...' - but `import type {} from 'core-js/...'` (and Flow's `import typeof`)
  // erases before runtime, so it is NOT a runtime side-effect entry and must not expand
  if (node.type === 'ImportDeclaration' && node.specifiers?.length === 0
    && isPlainModuleLoad(node) && !isTypeOnlyImportKind(node.importKind)) {
    return isDisabled?.(node.source) ? null : extractStaticString(node.source, adapter);
  }
  // TS `import X = require('core-js/...')` binds a value like `import X from` and `const X =
  // require()` do - a binding import, never a side-effect entry, used or not: the minifier-joined
  // `require('core-js/x'), b()` is not read here either - the minifier-sequence split lands ahead
  // of every entry read and promotes the call to the statement this reads
  if (node.type !== 'ExpressionStatement') return null;
  // unwrap outer parens/TS wrappers: `(await import(...))` / `(require(...))` - parsers
  // that preserve `ParenthesizedExpression` would otherwise miss these entry patterns
  const expr = unwrapTransparentSeq(node.expression);
  if (expr && isDisabled?.(expr)) return null;
  // require('core-js/...') (incl. webpack `(0, require)(...)`, TS-wrapped, optional `require?.()`)
  const required = requireCallSource(expr, { adapter, scope, isDisabled });
  if (required !== null) return required;
  // await import('core-js/...') as a top-level statement (ESM top-level await).
  // bare `import('...')` without await is intentionally ignored: it discards the returned
  // promise (unhandled rejection risk). `import(...).then(cb)` is also ignored - the user
  // explicitly opted into async runtime loading, so replacing the dynamic import with static
  // side-effect imports would erase that async shape; see fixture `audit-dynamic-import-then-skip`
  if (expr?.type === 'AwaitExpression' && !localEntryPrefix(node).length) return importExpressionSource(expr.argument, adapter, isDisabled);
  return null;
}

// A direct require can join the generated prologue only while all earlier statements
// are hoisted module declarations, directives or other loads in that same batch.
function leadingEntryEnd(program, adapter, owns, isDisabled) {
  const body = program.body ?? [];
  let end = programPrologueEndIndex(body);
  for (; end < body.length; end++) {
    const node = body[end];
    const declaration = unwrapExportedDeclaration(node);
    if (node.type === 'ImportDeclaration' || (node.source && node.type.startsWith('Export'))
      || declaration?.type === 'FunctionDeclaration' || isInitlessVarDecl(declaration) || isAmbientTypeDeclaration(declaration)
      || (declaration?.type === 'TSModuleDeclaration' && !isTSRuntimeBindingDeclaration(declaration))) continue;
    if (node.type !== 'ExpressionStatement' || isDisabled?.(node)) break;
    const source = requireCallSource(node.expression, { adapter, isDisabled });
    if (source === null || !owns(source) || entryCall(node).optional || localEntryPrefix(node).length) break;
  }
  return end;
}

// A leading await entry can join the prologue. After an executable statement it must still load and suspend in place.
export function scanEntryLoads(program, { adapter, getCoreJSEntry, isDisabled }, visit) {
  const end = leadingEntryEnd(program, adapter, source => getCoreJSEntry(source) !== null, isDisabled);
  const limit = declaresRequireBinding(program) ? hostRequireCallLimit(program) : Infinity;
  // A Babel visitor can insert additional module calls at the current statement.
  for (const [index, node] of program.body.slice().entries()) {
    if (!mayBeEntryStatement(node)) continue;
    const source = getEntrySource(node, adapter, index >= limit ? REQUIRE_SHADOWED_SCOPE : null, isDisabled);
    if (source === null) continue;
    const entry = getCoreJSEntry(source);
    if (entry === null) continue;
    const call = entryCall(node);
    const awaited = call?.type === 'AwaitExpression';
    const local = awaited ? index > end : !!call && index >= end;
    if (!local || awaited || !userRequireAt(node, program)) visit({
      source, entry, index, node, local, awaited, optional: local && !!call.optional,
    });
  }
}

// Keep the observable operands in execution order. The initial scan has no scope yet.
export function localEntryPrefix(node, ctx = null) {
  return extractIndirectRequireSEPrefix(node, ctx, ctx ? observablePrefixOperand : expression => !performsNothing(expression));
}

// The call evaluated by a standalone entry or binding initializer, after transparent wrappers and comma prefixes.
export function entryCall(node) {
  return peelSequenceTail(unwrapRuntimeExpr(node.expression ?? node.init), { step: unwrapRuntimeExpr });
}

// Replace a local entry at its execution point, preserving its loader and suspension.
export function renderLocalEntry(node, modules, pkg, absoluteImports) {
  const call = entryCall(node);
  const ordered = sortByPolyfillOrder(modules);
  if (call.type === 'AwaitExpression') {
    return ordered.length
      ? ordered.map(name => awaitedImport(resolveImportPath(pkg, `modules/${ name }`, absoluteImports, 'import')))
      : [awaitedImport()];
  }
  const optional = !!call.optional;
  // Even a filtered optional call reads its loader. A bare require would create a webpack context.
  if (optional && !ordered.length) return [expressionStatement(logicalExpression('&&', identifier('require'), voidZero()))];
  return ordered.map(name => bareRequire(resolveImportPath(pkg, `modules/${ name }`, absoluteImports, 'require'), optional));
}

// A reused spelling is emitted at other source positions. Reserve a fresh import if a
// parameter, catch binding or local declaration can hide that spelling in this program.
function repeatedBindingNames(program) {
  const seen = new Set();
  const repeated = new Set();
  function add(id) {
    if (seen.has(id.name)) repeated.add(id.name);
    else seen.add(id.name);
  }
  walkAstNodes({ root: program, visit(node) {
    if (node.id) walkPatternIdentifiers(node.id, add);
    if (node.local && node.type.startsWith('Import')) add(node.local);
    if (node.type === 'CatchClause') walkPatternIdentifiers(node.param, add);
    for (const param of node.params ?? []) walkPatternIdentifiers(param.parameter ?? param, add);
  } });
  return repeated;
}

// The prefix runs immediately before this call, including when it is an optional call.
export function entryRequireTail(node) {
  const call = entryCall(node);
  const callee = peelSequenceTail(unwrapRuntimeExpr(call.callee), { step: unwrapRuntimeExpr });
  const expression = { type: call.type, callee, arguments: call.arguments, optional: call.optional };
  return call.type === 'CallExpression' && call.optional ? { type: 'ChainExpression', expression } : expression;
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
  importStyle,
  absoluteImports,
  previousImports = null,
  adapter,
  onGlobalImport,
  onLocalRequire,
  onPureImport,
  isDisabled = null,
}) {
  // `packages` is lowercased in the resolver; mirror that so config `package: '@My/Fork'`
  // still matches the user's source literal when they typed the lowercase canonical form
  const mainPkgs = pkg ? [pkg.toLowerCase()] : null;
  // All flavors carry type facts; the source flavor remains part of the dedup key.
  let repeated;
  // An ESM dependency can call a hoisted export before any require initializer runs.
  let requireBindingsReady = importStyle !== 'import';
  let firstDependency;
  function registerPureSource(source, name, declaration) {
    const required = declaration.type !== 'ImportDeclaration';
    const previous = previousImports?.get(name);
    const subpath = previous?.resolved === source && importStyle === (required ? 'require' : 'import')
      ? previous.source : matchEntrySubpath(source, mainPkgs, '', !required, importStyle, absoluteImports)?.entry;
    const entry = pureImportSourceEntry(subpath);
    const flavor = subpath?.split('/', 1)[0];
    if (entry && subpath === `${ flavor }/${ entry }`) {
      if (required && userRequireAt(declaration, ast)) return false;
      // A skipped load cannot supply a polyfill for an independent use.
      if (required && declaration.init && entryCall(declaration)?.optional) return false;
      repeated ??= repeatedBindingNames(ast);
      const ready = required ? requireBindingsReady : declaration === firstDependency;
      onPureImport(entry, name, flavor, ready ? null : declaration, repeated.has(name) ? ast : null);
      return true;
    }
    return false;
  }
  const end = leadingEntryEnd(ast, adapter, source => !!matchEntrySubpath(source, packages, 'modules/', false, importStyle), isDisabled);
  const requireShadowed = declaresRequireBinding(ast);
  // ... and the shadow is POSITIONAL wherever the host's own loader is what the name starts out
  // holding: inside the leading region an injection writes into, a `require('core-js/...')` is a
  // real load - ours read back, or the author's, both reaching the host - while past the statement
  // that rebinds the name it is a call into whatever that statement left, which nothing may adopt,
  // remove and re-emit at the top. A file that binds the name nowhere carries no shadow at all
  const hostRequireLimit = requireShadowed ? hostRequireCallLimit(ast) : 0;
  for (const [position, node] of (ast.body ?? []).entries()) {
    // A dependency (including a re-export or an opted-out import) can call back before later imports initialize.
    if (!firstDependency && node.source && !isTypeOnlyImportKind(node.importKind ?? node.exportKind)) firstDependency = node;
    const shadowScope = requireShadowed && position >= hostRequireLimit ? REQUIRE_SHADOWED_SCOPE : null;
    // an opt-out directive means "do not touch this line": the statement is neither adopted as a
    // dedup target nor removed and re-emitted, so it stays exactly where the author wrote it. the
    // cost is deliberate - unknown to the injector, the module may be imported a second time beside
    // it, and that is the reading the file-level `core-js-disable-file` has always had
    const declaration = unwrapExportedDeclaration(node);
    if (declaration?.type !== 'VariableDeclaration' && declaration?.type !== 'TSImportEqualsDeclaration'
      && node.type !== 'ImportDeclaration' && !isPrologueDirectiveStatement(node)
      && !(node.type.startsWith('Export') && node.source)) requireBindingsReady = false;
    if (isDisabled?.(node)) {
      requireBindingsReady = false;
      continue;
    }
    if (node.type === 'ImportDeclaration' && node.specifiers?.length) {
      if (!onPureImport || !mainPkgs || !mode) continue;
      // two shapes of type-only imports: `import type X from '...'` (Flow `import typeof X`) sets
      // declaration-level `importKind`; `import { type X } from '...'` sets it per-specifier. both
      // parsers follow the same rule. defaultSpecifierNames already filters per-specifier, so here
      // we only need to skip the declaration-level case. type-only imports are erased at runtime
      // (TS / Flow stripping), so dedup'ing against their names would route runtime calls through an
      // undefined binding. exportKind never lives on ImportDeclaration (it's an Export*Declaration
      // field) - only importKind is relevant here
      if (!isPlainModuleLoad(node) || isTypeOnlyImportKind(node.importKind) || isDisabled?.(node.source)) continue;
      const source = adapter.getStringValue(node.source);
      if (typeof source !== 'string') continue;
      const names = defaultSpecifierNames(node);
      if (!names.length) continue;
      for (const name of names) registerPureSource(source, name, node);
      continue;
    }
    // TS `import X = require('<pkg>/<mode>/...')` - the same pure require-import shape tsc/esbuild
    // emit; without recognising it the `phase: 'pre+post'` post re-scan misses it and re-emits a
    // duplicate import. a binding import like `import X from` - exported or not, since neither the
    // wrapper nor the modifier changes the binding - and so never a global side-effect entry: a
    // non-pure one is left where the author wrote it, its binding intact
    if (declaration?.type === 'TSImportEqualsDeclaration') {
      if (declaration.importKind === 'type') continue;
      const required = onPureImport && mainPkgs && mode && !shadowScope
        && !isDisabled?.(declaration.moduleReference.expression ?? declaration.moduleReference)
        ? tsImportEqualsRequireSource(declaration, adapter) : null;
      if (required === null || !registerPureSource(required, declaration.id.name, declaration)) requireBindingsReady = false;
      continue;
    }
    // `var X = require('<pkg>/<mode>/...')` - the require import style emits this for pure
    // substitution, so the post re-scan must recognise it as an existing pure import or
    // `phase: 'pre+post'` re-emits a duplicate `require` (double module-eval). a require-bound
    // var is never a global side-effect entry (those are bare ExpressionStatements), so this
    // branch always `continue`s
    if (declaration?.type === 'VariableDeclaration') {
      if (!onPureImport || !mainPkgs || !mode) continue;
      for (const decl of declaration.declarations ?? []) {
        const required = requireCallSource(decl.init, { adapter, scope: shadowScope, isDisabled });
        if (required === null) {
          if (decl.init) requireBindingsReady = false;
        } else {
          // A prefix can call back into this module before the binding is initialized.
          if (requireBindingsReady && localEntryPrefix(decl).length) requireBindingsReady = false;
          if (decl.id?.type !== 'Identifier' || !registerPureSource(required, decl.id.name, decl)) requireBindingsReady = false;
        }
      }
      continue;
    }
    const source = getEntrySource(node, adapter, shadowScope, isDisabled);
    if (typeof source !== 'string') continue;
    const localRequire = requireCallSource(node.expression, { adapter }) !== null;
    const mod = matchEntrySubpath(source, packages, 'modules/', !localRequire, importStyle, absoluteImports);
    // the PACKAGE travels with the module: this import is removed and re-emitted, and a user's
    // global polyfill re-emitted under the plugin's own (pure) package stops polyfilling anything
    if (!mod) continue;
    if (position >= end && localRequire) {
      if (onLocalRequire && localEntryPrefix(node).length && !userRequireAt(node, ast)) onLocalRequire(node);
    } else onGlobalImport?.(mod.entry, node, mod.pkg);
  }
}
