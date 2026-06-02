// Scope-walking + name-based resolution: type declarations, type parameters, namespaced
// references, and ambient `declare ...` walks. centralises three resolution strategies that
// all need scope-chain traversal but differ in their match criteria:
//   - `findTypeDeclaration` / `findEnumDeclaration` / `findAllTypeDeclarations` - type-
//     bearing declarations (alias / interface / class / enum) inside (possibly nested)
//     namespaces via `walkStatementsForDecl` + `walkScopesForDecl`. memoized via
//     `typeDeclCache` because the chain through TSModuleBlock is recursive
//   - `findTypeParameter` - inline `<T>` declarations on enclosing functions / classes
//   - `findAmbientDeclarationPath` / `findAmbientFunctionPaths` - `declare function/class`
//     headers that Babel doesn't register in `scope.bindings`. memoized via `ambientDeclCache`
//
// Module-level `isAmbientFunctionNode` / `isAmbientClassNode` consts are stable identities
// used as cache keys for `ambientDeclCache`'s `matchType` slot, so the predicates must
// import the same way both inside and outside the cluster - they ship as named exports.
//
// Service object passes `t` (babel-types adapter). Closure-free predicates come from
// `ast-shapes` (`isTypeAlias` / `isInterfaceDeclaration`) and `helpers/ast-patterns`
// (`unwrapExportedDeclaration`) - imported directly. Public `reset()` is wired into
// the factory's per-file cache reset.
import {
  AMBIENT_FN_OR_CLASS_DECLARATION_TYPES,
  AMBIENT_FUNCTION_TYPES,
  getOrInitMap,
  nodePathInScope,
} from './base.js';
import { collectQualifiedSegments, isInterfaceDeclaration, isTypeAlias } from './ast-shapes.js';
import { unwrapExportedDeclaration } from '../helpers/ast-patterns.js';

// visitor-key list for recovering a real NodePath of a namespaced declaration via
// `nodePathInScope` - the union of every node type `isFunctionOrClassDeclaration` /
// `isAmbientFunctionNode` can leaf-match, so the program-root traversal finds any of them
const NAMESPACED_DECL_PATH_TYPES = ['FunctionDeclaration', 'ClassDeclaration', ...AMBIENT_FN_OR_CLASS_DECLARATION_TYPES];

// `declare global { ... }` opens a program-scope augmentation block. @babel/parser@7 flags it
// with a boolean `decl.global`; @babel/parser@8 dropped that field and only sets `kind: 'global'`
function isGlobalAugmentation(decl) {
  return decl.global || decl.kind === 'global';
}

// TS `declare class X` is parsed as ClassDeclaration { declare: true }, not DeclareClass.
// module-level functions so `ambientDeclCache` keys by identity stay stable across calls
export function isAmbientFunctionNode(node) {
  return node?.type === 'TSDeclareFunction' || node?.type === 'DeclareFunction';
}
export function isAmbientClassNode(node) {
  return node?.type === 'DeclareClass'
    || (node?.type === 'ClassDeclaration' && node.declare === true);
}
export function isAmbientFunctionOrClassNode(node) {
  return isAmbientFunctionNode(node) || isAmbientClassNode(node);
}

export function createNameResolution({ t }) {
  function isFunctionLike(node) {
    return !!node && (t.isFunction(node) || AMBIENT_FUNCTION_TYPES.has(node.type));
  }

  function isFunctionOrClassDeclaration(node) {
    return !!node && (t.isFunctionDeclaration(node) || t.isClassDeclaration(node)
      || AMBIENT_FN_OR_CLASS_DECLARATION_TYPES.has(node.type));
  }

  function isClassLikeDeclaration(decl) {
    return decl?.type === 'ClassDeclaration' || decl?.type === 'DeclareClass';
  }

  function isTypeBearingDeclaration(decl) {
    return isTypeAlias(decl) || isInterfaceDeclaration(decl) || isClassLikeDeclaration(decl)
      || decl?.type === 'TSEnumDeclaration';
  }

  // walk enclosing statement lists collecting ambient declaration paths matching `name`.
  // `firstMatch=true` short-circuits at the first hit (legacy single-result path);
  // `firstMatch=false` collects ALL matches AT THE FIRST scope that has matches and stops,
  // respecting TS lexical shadowing. without the early stop, an inner-scope `declare function
  // fn` would be polluted by outer-scope siblings - `pickLastAmbientOverload.at(-1)` would
  // return an outer overload while TS would have used the inner shadow exclusively
  function walkAmbientDeclarationPath({ name, scope, matchType, firstMatch = true }) {
    const out = firstMatch ? null : [];
    // scan a statement-array for the named decl. descends into `declare global { ... }` so a
    // `class` / `function` declared inside the global augmentation is visible (mirrors the
    // global-augmentation branch in `walkStatementsForDecl` - without it the babel pipeline
    // misses an in-global class used as a static-call receiver while oxc's binding fallback finds it)
    const scanStatements = (stmtPaths, match) => {
      for (const stmtPath of stmtPaths) {
        const { type } = stmtPath.node ?? {};
        const declPath = type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration'
          ? stmtPath.get('declaration') : stmtPath;
        const { node } = declPath;
        if (node?.type === 'TSModuleDeclaration' && isGlobalAugmentation(node)) {
          const innerBody = declPath.get('body');
          const innerPaths = innerBody?.node?.type === 'TSModuleDeclaration' ? [innerBody] : innerBody?.get?.('body');
          if (Array.isArray(innerPaths)) {
            // contents of `declare global { ... }` are ambient even without their own `declare`
            // flag (the class is a plain ClassDeclaration). relax the matcher so an in-global class
            // is recognized as ambient; a no-op for the function matcher (ClassDeclaration never
            // satisfies it). functions inside the augmentation already parse as TSDeclareFunction
            const ambientMatch = n => match(n) || (n?.type === 'ClassDeclaration' && match({ ...n, declare: true }));
            const found = scanStatements(innerPaths, ambientMatch);
            if (found) return found;
          }
          continue;
        }
        if (node?.id?.name !== name || !match(node)) continue;
        if (firstMatch) return declPath;
        out.push(declPath);
      }
      return null;
    };
    for (let cur = scope; cur; cur = cur.parent) {
      // Program / BlockStatement / TSModuleBlock - `path.get('body')` already returns the
      // statement array. Function / method scopes wrap statements in a BlockStatement, so
      // `path.get('body')` returns the BlockStatement path; drill once more to reach the
      // array. Without this, ambient declarations inside function bodies
      // (`function f() { declare function g(): T }`) aren't discovered, falling through to
      // generic resolution. Mirrors `walkScopesForDecl`'s `block.body.body` for non-Program.
      // estree-toolkit may emit a bodyless scope owner (e.g. SwitchCase `consequent` array,
      // for-statement init slots) whose drill-once `.get('body')` lands on a null NodePath -
      // skip such scopes rather than crash on `.get` over null
      let bodyPaths = cur.path?.get('body');
      if (bodyPaths && !Array.isArray(bodyPaths)) {
        bodyPaths = bodyPaths.node ? bodyPaths.get('body') : null;
      }
      if (!Array.isArray(bodyPaths)) continue;
      const before = out?.length;
      const found = scanStatements(bodyPaths, matchType);
      if (found) return found;
      // collect-mode: stop at the innermost scope that produced any matches so outer-scope
      // overloads don't bleed past a shadow. mirrors `walkScopesForDecl`'s collect-then-stop.
      // `out?.length` short-circuits to undefined for firstMatch (we never reach here when
      // firstMatch returns early inside the loop); comparison `undefined > undefined` is false
      if (out && out.length > before) return out;
    }
    return out;
  }

  // Babel doesn't register ambient `declare function/class` in `scope.bindings`; scan
  // enclosing statement lists instead. `matchType` picks the ambient kind we want.
  // keyed by (scope, matchType, name) - matchType references are module-level constants,
  // safe Map keys; inner Map uses string name
  let ambientDeclCache = new WeakMap();
  function findAmbientDeclarationPath(name, scope, matchType) {
    if (!scope) return null;
    const byName = getOrInitMap(getOrInitMap(ambientDeclCache, scope), matchType);
    if (byName.has(name)) return byName.get(name);
    const result = walkAmbientDeclarationPath({ name, scope, matchType });
    byName.set(name, result);
    return result;
  }

  // collect all ambient function decls by name. used for multi-overload predicate
  // resolution where the FIRST ambient match may carry a non-predicate signature, but a
  // later sibling carries the asserts/predicate of interest. shape mirrors
  // `findAmbientDeclarationPath` but returns an array (uncached - rare path)
  function findAmbientFunctionPaths(name, scope) {
    return walkAmbientDeclarationPath({ name, scope, matchType: isAmbientFunctionNode, firstMatch: false }) ?? [];
  }

  function findAmbientFunctionPath(name, scope) {
    return findAmbientDeclarationPath(name, scope, isAmbientFunctionNode);
  }
  // `declare class X { ... }` - babel doesn't bind the name as a value (unlike runtime
  // `class X`), so `resolveRuntimeExpression(X)` returns the bare Identifier. without an
  // ambient lookup, `X.staticMethod()` skips the class-member resolution path entirely
  // and falls through to `findTypeMember`'s synthetic TSFunctionType stub (return-type-less).
  // estree-toolkit registers the binding regardless of `declare`, hence the cross-pipeline
  // asymmetry seen in `audit-declare-static-generic-call` / `audit-extends-renamed-typeparam-static`
  function findAmbientClassPath(name, scope) {
    return findAmbientDeclarationPath(name, scope, isAmbientClassNode);
  }

  // statement list directly inside a TSModuleDeclaration. for Babel's nested form
  // (`namespace A.B {}` -> A.body = TSModuleDeclaration B) expose B as a single-element list
  // so the next recursion can match its name. for oxc's flat form (id = TSQualifiedName)
  // the body is a TSModuleBlock and we return its statements directly.
  function moduleStatements(decl) {
    const body = decl?.body;
    if (body?.type === 'TSModuleDeclaration') return [body];
    return Array.isArray(body?.body) ? body.body : null;
  }

  // segment names of a TSModuleDeclaration id: Babel uses Identifier (single segment),
  // oxc uses TSQualifiedName for `namespace A.B {}` (multi-segment)
  function moduleNameSegments(id) {
    if (!id) return null;
    if (id.type === 'Identifier') return [id.name];
    if (id.type === 'TSQualifiedName') {
      const left = moduleNameSegments(id.left);
      return left && [...left, id.right.name];
    }
    return null;
  }

  // does `segments` start with the same names as `prefix`?
  function startsWithSegments(segments, prefix) {
    if (prefix.length > segments.length) return false;
    for (let i = 0; i < prefix.length; i++) if (segments[i] !== prefix[i]) return false;
    return true;
  }

  // resolve `NS.Inner.Decl` segments inside a statement list. `collect=null` short-circuits
  // on the first hit; `collect=[]` keeps walking to enable TS interface merging.
  // `leafMatch` is the predicate the LEAF declaration must satisfy - defaults to type-bearing
  // (alias / interface / class / enum) for findTypeDeclaration; typeof-name resolution swaps
  // in `isFunctionOrClassDeclaration` to also surface `declare function fn` inside a namespace
  function walkStatementsForDecl({ segments, statements, collect, leafMatch = isTypeBearingDeclaration, visited = new Set() }) {
    if (!Array.isArray(statements) || !segments.length) return null;
    const [head, ...rest] = segments;
    for (const statement of statements) {
      const decl = unwrapExportedDeclaration(statement);
      if (!decl) continue;
      if (rest.length === 0 && decl.id?.name === head && leafMatch(decl)) {
        if (!collect) return decl;
        collect.push(decl);
        continue;
      }
      // TS `import IE = NS;` / `import IE = NS.Inner;` namespace alias - redirect head
      // segment through the moduleReference's segments and re-walk. external-module form
      // (`import X = require('m')`) has TSExternalModuleReference which `collectQualified
      // Segments` rejects (non-Identifier slot), so it correctly bails without misrouting
      if (decl.type === 'TSImportEqualsDeclaration' && decl.id?.name === head && rest.length) {
        // cyclic alias (`import A = A.B`, mutual `import A = B; import B = A`) re-walks the same
        // statement list with an ever-growing segment array - without a visited-set the recursion
        // never bottoms out and throws RangeError, aborting the whole transform. bail on re-entry
        // of the same alias decl so a cyclic alias degrades to null (generic narrow) instead
        if (visited.has(decl)) continue;
        visited.add(decl);
        const refSegments = collectQualifiedSegments(decl.moduleReference);
        if (refSegments?.length) {
          const inner = walkStatementsForDecl({
            segments: [...refSegments, ...rest], statements, collect, leafMatch, visited,
          });
          if (inner && !collect) return inner;
        }
        continue;
      }
      if (decl.type !== 'TSModuleDeclaration') continue;
      const moduleSegs = moduleNameSegments(decl.id);
      if (!moduleSegs) continue;
      // `declare global { ... }` body bindings are visible at every depth - descend regardless
      // of segment count so both `Box` (bare) and `NS.Foo` (qualified via `declare global {
      // namespace NS {} }`) resolve through it
      if (isGlobalAugmentation(decl)) {
        const inner = walkStatementsForDecl({ segments, statements: moduleStatements(decl), collect, leafMatch, visited });
        if (inner && !collect) return inner;
        continue;
      }
      // bare-name lookup (`rest.length === 0`) MUST NOT descend into nested
      // TSModuleDeclaration bodies - that would violate TS lexical scoping:
      // `namespace N { interface Box {} }; declare const x: Box;` - top-level `Box`
      // is undefined, the bare name must not promiscuously pick up `N.Box`. scope-
      // chain climbing is handled by `walkScopesForDecl`; each scope checks its OWN
      // direct statements only
      if (rest.length === 0) continue;
      if (!startsWithSegments(segments, moduleSegs)) continue;
      const inner = walkStatementsForDecl({
        segments: segments.slice(moduleSegs.length), statements: moduleStatements(decl), collect, leafMatch, visited,
      });
      if (inner && !collect) return inner;
    }
    return null;
  }

  // walk scope chain; `collect=null` returns first hit, `collect=[]` collects siblings
  // at the first containing scope (interface merging only - others don't merge).
  // `leafMatch` threads through to `walkStatementsForDecl`; see there for the contract
  function walkScopesForDecl({ name, scope, collect, leafMatch = isTypeBearingDeclaration }) {
    if (!scope) return null;
    const segments = typeof name === 'string' ? name.split('.') : name;
    for (let cur = scope; cur; cur = cur.parent) {
      const block = cur.block ?? cur.path?.node;
      if (!block) continue;
      // Program / BlockStatement / TSModuleBlock / StaticBlock host statements directly at
      // `.body`; Function / method scopes wrap in a BlockStatement, so drill once more.
      // pre-fix `block.type === 'Program' ? block.body : block.body?.body` missed block-scoped
      // type declarations because `block.body` was already the statement array
      const body = Array.isArray(block.body) ? block.body : block.body?.body;
      const before = collect?.length;
      const result = walkStatementsForDecl({ segments, statements: body, collect, leafMatch });
      if (!collect && result) return result;
      if (collect && collect.length > before) return null;
    }
    return null;
  }

  // single-hit wrapper: short-circuit on first leaf match, walk parent scopes for shadowing
  function findFirstDecl({ name, scope, leafMatch }) {
    return scope ? walkScopesForDecl({ name, scope, collect: null, leafMatch }) : null;
  }

  // collect-mode wrapper: gather every leaf match at the first containing scope, stopping
  // before parent scopes can bleed siblings past a shadow (mirrors `walkAmbientDeclarationPath`)
  function findAllDecls({ name, scope, leafMatch }) {
    if (!scope) return [];
    const collected = [];
    walkScopesForDecl({ name, scope, collect: collected, leafMatch });
    return collected;
  }

  // recover a raw leaf decl (from findFirstDecl/findAllDecls) to a real NodePath. babel doesn't
  // bind TS `namespace` members as scope values, so the leaf is a raw node, but downstream
  // consumers (resolveBodyReturnType / resolveParametersParams / findClassMember /
  // resolveClassInheritance) call `.get('body')` / `.get('superClass')` - a {node, scope} shape
  // would throw. recover by program-root identity match (same precedent as
  // `resolveMergedNamespaceStatic`); babel creates no separate scope for a TSModuleDeclaration, so
  // the recovered path chains to the outer scope and signature type-names still resolve. null when
  // recovery fails (degrade, never crash)
  function recoverDeclPath(node, scope) {
    return node ? nodePathInScope(node, scope, NAMESPACED_DECL_PATH_TYPES) : null;
  }

  // resolve `typeof NS.Inner.fn` namespaced lookups to the first function/class decl on the path
  function findNamespacedFunctionPath(segments, scope) {
    return recoverDeclPath(findFirstDecl({ name: segments, scope, leafMatch: isFunctionOrClassDeclaration }), scope);
  }

  // multi-result variant: collect ALL ambient function decls matching the qualified path.
  // limits to `isAmbientFunctionNode` so a runtime implementation body
  // (`namespace NS { export function fn(...) { ... } }`) doesn't displace the canonical
  // overload signature at the tail. `findAllDecls`'s collect-then-stop semantics keep
  // outer-scope overloads from bleeding past a namespace shadow
  function findNamespacedFunctionPaths(segments, scope) {
    return findAllDecls({ name: segments, scope, leafMatch: isAmbientFunctionNode })
      .map(node => recoverDeclPath(node, scope))
      .filter(Boolean);
  }

  // single shared overload collector for `typeof X` / `typeof NS.X.Y`: bare names route
  // through the cached flat-scope ambient walker, qualified names through the namespaced
  // walker. both return ambient-function paths in source order so overload-resolution
  // callers (e.g. `pickLastAmbientOverload`) can pick the trailing canonical signature
  // without branching on segment count at the call site
  function findOverloadsForName(segments, scope) {
    if (!segments?.length || !scope) return [];
    return segments.length === 1
      ? findAmbientFunctionPaths(segments[0], scope)
      : findNamespacedFunctionPaths(segments, scope);
  }

  // per-scope cache. serialize multi-segment / array inputs to a dotted string so qualified
  // references (`NS.Type`) and array-form callsites share the cache slot with their string form
  let typeDeclCache = new WeakMap();

  function lookupTypeDeclInScope(name, scope) {
    const key = typeof name === 'string' ? name : Array.isArray(name) ? name.join('.') : null;
    if (key === null) return findFirstDecl({ name, scope, leafMatch: isTypeBearingDeclaration });
    const byName = getOrInitMap(typeDeclCache, scope);
    if (byName.has(key)) return byName.get(key);
    const decl = findFirstDecl({ name, scope, leafMatch: isTypeBearingDeclaration });
    byName.set(key, decl);
    return decl;
  }

  // when scope-chain lookup misses AND a lookup-path anchor is on the stack, fall back to
  // walking that path's ancestors for enclosing namespace bodies. activates for parsers
  // (estree-toolkit) that don't expose TSModuleDeclaration / TSModuleBlock as scope levels.
  // babel parsers create scopes for namespaces so scope-chain hits first and the fallback
  // is a no-op there
  function findTypeDeclaration(name, scope) {
    if (!scope) return null;
    return lookupTypeDeclInScope(name, scope)
      ?? findTypeDeclInLookupPath(name);
  }

  // execute `fn` with `path` registered as the current lookup-path anchor. used by
  // binding-driven resolution sites (e.g. `pattern-bindings`) that have access to the
  // binding's NodePath - threading the path through the resolver chain explicitly would
  // touch dozens of call sites, but resolution is strictly synchronous and reentrant
  // calls compose naturally on the stack, so an instance-level stack avoids the churn
  const lookupPathStack = [];
  function withLookupPath(path, fn) {
    if (!path) return fn();
    lookupPathStack.push(path);
    try {
      return fn();
    } finally {
      lookupPathStack.pop();
    }
  }

  // walk the current lookup-path anchor's ancestors for enclosing block-like containers
  // (TSModuleBlock / Program / BlockStatement / StaticBlock) and check each one's direct
  // statements for the type decl. respects TS lexical scoping: only containers that
  // ENCLOSE the lookup site are checked, not siblings. mirrors `findTSRuntimeBindingInPath`.
  // cache keyed on (path-anchor, name): each missed scope-chain lookup re-walks the same
  // O(pathDepth) ancestors per call site - WeakMap per anchor amortises to O(unique-names).
  // negative results cached too so repeat misses don't keep re-walking
  let lookupPathDeclCache = new WeakMap();
  function findTypeDeclInLookupPath(name) {
    const path = lookupPathStack.at(-1);
    if (!path) return null;
    const cacheKey = typeof name === 'string' ? name : Array.isArray(name) ? name.join('.') : '';
    let perPath = lookupPathDeclCache.get(path);
    if (perPath?.has(cacheKey)) return perPath.get(cacheKey);
    const segments = typeof name === 'string' ? name.split('.') : name;
    let result = null;
    for (let cur = path; cur; cur = cur.parentPath) {
      const { node } = cur;
      const statements = node?.type === 'TSModuleBlock' || node?.type === 'Program'
        || node?.type === 'BlockStatement' || node?.type === 'StaticBlock'
        ? node.body : null;
      if (!statements) continue;
      const found = walkStatementsForDecl({
        segments, statements, collect: null, leafMatch: isTypeBearingDeclaration,
      });
      if (found) {
        result = found;
        break;
      }
    }
    if (!perPath) lookupPathDeclCache.set(path, perPath = new Map());
    perPath.set(cacheKey, result);
    return result;
  }

  // narrow `findTypeDeclaration` to TSEnumDeclaration. callers care about the enum-decl
  // shape specifically (member-type lookup, value-kind probe, reverse-mapping check), so
  // collapse the find + type-check pattern into one call to keep predicate and lookup at
  // the same level of abstraction
  function findEnumDeclaration(name, scope) {
    const decl = findTypeDeclaration(name, scope);
    return decl?.type === 'TSEnumDeclaration' ? decl : null;
  }

  // all `interface X {}` siblings at the first scope level that contains one. cached per-
  // (scope, name): a class with N inherited interfaces previously triggered N scope-chain
  // walks per ancestor; the cache amortises them to O(unique-names-per-scope). WeakMap
  // keyed on scope so the per-scope Map collects when its AST does
  let allTypeDeclCache = new WeakMap();
  function findAllTypeDeclarations(name, scope) {
    if (!scope) return [];
    const cacheKey = typeof name === 'string' ? name : name?.join('.') ?? '';
    let perScope = allTypeDeclCache.get(scope);
    if (perScope?.has(cacheKey)) return perScope.get(cacheKey);
    const collected = findAllDecls({ name, scope, leafMatch: isTypeBearingDeclaration });
    if (!perScope) allTypeDeclCache.set(scope, perScope = new Map());
    perScope.set(cacheKey, collected);
    return collected;
  }

  // ESTree (oxc-parser): TSTypeParameter.name is Identifier node; Babel: it's a string
  function typeParamName(param) {
    if (!param) return undefined;
    return typeof param.name === 'string' ? param.name : param.name?.name;
  }

  function findTypeParameter(name, scope) {
    let currentScope = scope;
    while (currentScope) {
      const params = (currentScope.block ?? currentScope.path?.node)?.typeParameters?.params;
      if (params) for (const param of params) {
        if (typeParamName(param) === name) return {
          constraint: param.constraint ?? param.bound,
          default: param.default,
          scope: currentScope,
        };
      }
      currentScope = currentScope.parent;
    }
    return null;
  }

  function reset() {
    ambientDeclCache = new WeakMap();
    typeDeclCache = new WeakMap();
    allTypeDeclCache = new WeakMap();
    lookupPathDeclCache = new WeakMap();
  }

  // path-aware variant of `walkScopesForDecl` for qualified names. mirrors the
  // segment-descent semantics of `walkStatementsForDecl` (recursing through
  // TSModuleDeclaration / TSModuleBlock) but tracks NodePath rather than bare nodes -
  // consumers like `resolveSuperClassPath` feed the result into `findClassMember`, which
  // walks the class body via `classPath.get('body').get('body')` (NodePath-only API)
  function findDeclPathBySegments(segments, scope, matchType) {
    if (!Array.isArray(segments) || !segments.length || !scope) return null;
    for (let cur = scope; cur; cur = cur.parent) {
      let bodyPaths = cur.path?.get('body');
      if (bodyPaths && !Array.isArray(bodyPaths)) {
        bodyPaths = bodyPaths.node ? bodyPaths.get('body') : null;
      }
      if (!Array.isArray(bodyPaths)) continue;
      const found = walkDeclPathsBySegments(segments, bodyPaths, matchType);
      if (found) return found;
    }
    return null;
  }

  function walkDeclPathsBySegments(segments, stmtPaths, matchType, visited = new Set()) {
    const [head, ...rest] = segments;
    for (const stmtPath of stmtPaths) {
      const { type } = stmtPath.node ?? {};
      const declPath = type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration'
        ? stmtPath.get('declaration') : stmtPath;
      const decl = declPath.node;
      if (!decl) continue;
      if (rest.length === 0 && decl.id?.name === head && matchType(decl)) return declPath;
      // qualified ref reached through a namespace alias (`import IM = M; class C extends IM.Base`):
      // re-walk with the alias target's segments prepended. mirrors `walkStatementsForDecl`'s
      // TSImportEqualsDeclaration branch; visited-guard bails on cyclic aliases (shared with PP11-2)
      if (decl.type === 'TSImportEqualsDeclaration' && decl.id?.name === head && rest.length) {
        if (visited.has(decl)) continue;
        visited.add(decl);
        const refSegments = collectQualifiedSegments(decl.moduleReference);
        if (refSegments?.length) {
          const found = walkDeclPathsBySegments([...refSegments, ...rest], stmtPaths, matchType, visited);
          if (found) return found;
        }
        continue;
      }
      // mirrors `walkStatementsForDecl`: bare-name segments only resolve via top-level
      // decls in this iteration. without the guard nested namespaces would re-enter their
      // own body on every bare segment query, doubling work on deep TSModuleDeclaration trees
      if (rest.length === 0) continue;
      if (decl.type !== 'TSModuleDeclaration') continue;
      // NodePath-walking mirror of `walkStatementsForDecl`'s global-augmentation branch -
      // without this the path variant misses globally-augmented decls that the node variant finds
      if (isGlobalAugmentation(decl)) {
        const bodyPath = declPath.get('body');
        const innerPaths = bodyPath?.node?.type === 'TSModuleDeclaration'
          ? [bodyPath]
          : bodyPath?.get?.('body');
        if (!Array.isArray(innerPaths)) continue;
        const found = walkDeclPathsBySegments(segments, innerPaths, matchType);
        if (found) return found;
        continue;
      }
      const moduleSegs = moduleNameSegments(decl.id);
      if (!moduleSegs || !startsWithSegments(segments, moduleSegs)) continue;
      // babel nested form (`namespace A.B {}` -> A.body is TSModuleDeclaration B):
      // recurse with single-element list so the next iter matches B's name. flat form
      // (oxc + babel non-nested): body is TSModuleBlock whose `.body` is the statement
      // array we descend into
      const bodyPath = declPath.get('body');
      const innerPaths = bodyPath?.node?.type === 'TSModuleDeclaration'
        ? [bodyPath]
        : bodyPath?.get?.('body');
      if (!Array.isArray(innerPaths)) continue;
      const found = walkDeclPathsBySegments(segments.slice(moduleSegs.length), innerPaths, matchType);
      if (found) return found;
    }
    return null;
  }

  // `isTypeBearingDeclaration` stays cluster-private (default `leafMatch` for
  // `walkStatementsForDecl` / `walkScopesForDecl`)
  return {
    withLookupPath,
    isFunctionLike,
    isFunctionOrClassDeclaration,
    isClassLikeDeclaration,
    findAmbientDeclarationPath,
    findAmbientFunctionPaths,
    findAmbientFunctionPath,
    findAmbientClassPath,
    findNamespacedFunctionPath,
    findOverloadsForName,
    findDeclPathBySegments,
    findTypeDeclaration,
    findEnumDeclaration,
    findAllTypeDeclarations,
    typeParamName,
    findTypeParameter,
    reset,
  };
}
