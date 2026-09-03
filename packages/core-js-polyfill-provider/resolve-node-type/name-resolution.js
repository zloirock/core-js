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
import { collectQualifiedSegments, isInterfaceDeclaration, isTypeAlias, moduleStatements } from './ast-shapes.js';
import {
  STATEMENT_LIST_HOST_TYPES,
  getDirectStatementBody,
  isAmbientTypeDeclaration,
  unwrapExportedDeclaration,
} from '../helpers/ast-patterns.js';

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
// module-level functions so `ambientDeclCache` keys by identity stay stable across calls.
// both are the shared ambient fact (`isAmbientTypeDeclaration`) narrowed to one declaration
// shape - these lanes look declarations up BY KIND, so they filter what that fact accepts
export function isAmbientFunctionNode(node) {
  // estree/oxc parses `declare function` as FunctionDeclaration { declare: true } - the
  // function twin of the ClassDeclaration shape below; babel uses TSDeclareFunction.
  // FunctionDeclaration IS load-bearing: dropping it degrades oxc ambient-overload widening
  // (the overload fixtures pin the widened generic emit)
  return isAmbientTypeDeclaration(node) && (node.type === 'TSDeclareFunction'
    || node.type === 'DeclareFunction' || node.type === 'FunctionDeclaration');
}
export function isAmbientClassNode(node) {
  return isAmbientTypeDeclaration(node) && (node.type === 'DeclareClass' || node.type === 'ClassDeclaration');
}
export function isAmbientFunctionOrClassNode(node) {
  return isAmbientFunctionNode(node) || isAmbientClassNode(node);
}

// the anchor's enclosing block-like containers (TSModuleBlock / Program / BlockStatement /
// StaticBlock), NEAREST FIRST. respects TS lexical scoping: only containers that ENCLOSE the
// lookup site are yielded, never siblings. both decl lanes below need exactly this walk where
// a parser opens no scope for a container, and they read different halves of one - the type
// lane its statement array, the ambient lane its path - so they share the walk, not the read
function * lookupPathContainers(path) {
  for (let cur = path; cur; cur = cur.parentPath) {
    if (!STATEMENT_LIST_HOST_TYPES.has(cur.node?.type)) continue;
    // stop at the first container the scope walk ALREADY READS - the owner node of the nearest
    // scope, or the block it drills into for one (a function's scope is the function, its
    // statements live in the BlockStatement below it: that block is covered, not skipped).
    // what this yields is exactly what the scope chain is blind to, and a hit here therefore
    // outranks one from the scope chain - but only because the caller anchors on the path of the
    // DECLARATION being resolved. anchored on the USE instead, this lane hands a value declared
    // outside a namespace whatever namesake the use happens to sit next to
    const owner = cur.scope?.block ?? cur.scope?.path?.node;
    if (cur.node === owner || (owner && getDirectStatementBody(owner) === cur.node.body)) return;
    yield cur;
  }
}

// the statement-list hosts sitting BETWEEN a scope level and the next one up - the lexical
// containers the scope chain itself skips. load-bearing where a parser opens no scope for a TS
// namespace body (estree-toolkit): without them the climb steps straight from a function to
// Program, so a namespace-local declaration loses to an outer one of the same name - the wrong
// family, not a missed narrowing. babel opens that scope itself, so there this yields nothing.
// the walk stops at the next scope's own node, so no container is ever visited twice
function * inBetweenContainerPaths(scope) {
  const block = scope.block ?? scope.path?.node;
  const boundary = scope.parent ? scope.parent.block ?? scope.parent.path?.node : null;
  for (let cur = scope.path?.parentPath; cur?.node && cur.node !== boundary; cur = cur.parentPath) {
    if (cur.node !== block && STATEMENT_LIST_HOST_TYPES.has(cur.node.type)) yield cur;
  }
}

// every lexical container of one scope level, NEAREST FIRST. the two lookup lanes below read
// different halves of a container - the decl walk its statement array, the ambient walk its
// PATHS - so they share the traversal, not the extraction
function * scopeContainerPaths(scope) {
  if (scope.path) yield scope.path;
  yield * inBetweenContainerPaths(scope);
}

// the node-side read of the same containers: the decl walk wants statement ARRAYS, not paths
function * scopeStatementLists(scope) {
  const own = getDirectStatementBody(scope.block ?? scope.path?.node);
  if (own) yield own;
  for (const path of inBetweenContainerPaths(scope)) yield path.node.body;
}

// the NAMED leaves one statement contributes. a declaration names itself through `id`, but a
// `const a = 1, b = 2` names one per DECLARATOR and the name lives THERE, not on the statement -
// which is why a value export of a namespace was invisible to every lookup here. both readers
// below keyed on `decl.id?.name` independently; they share this walk instead so they cannot drift.
// every leaf still passes the caller's `leafMatch`, so a lookup whose predicate rejects a
// declarator - which every type-side predicate does - sees exactly the leaves it saw before
// a QUALIFIED lookup can only CONTINUE through a namespace or an import-equals alias; every other
// statement is visited and rejected. index those per statement list, or a module with N declarations
// and N qualified reads pays N^2 - the leaf half still needs every statement, but it runs for
// `collect` alone (first-match goes through the decl index). module-level like the walkers around
// it: the key is the parse's own statement array, so entries die with the AST rather than per file
const stmtDescentCache = new WeakMap();
function statementDescentDecls(statements) {
  let cached = stmtDescentCache.get(statements);
  if (cached) return cached;
  cached = [];
  for (const statement of statements) {
    const decl = unwrapExportedDeclaration(statement);
    if (decl && (decl.type === 'TSImportEqualsDeclaration' || decl.type === 'TSModuleDeclaration')) cached.push(decl);
  }
  stmtDescentCache.set(statements, cached);
  return cached;
}

function * declLeaves(decl) {
  if (decl.type === 'VariableDeclaration') {
    for (const declarator of decl.declarations ?? []) {
      if (declarator?.id?.type === 'Identifier') yield [declarator.id.name, declarator];
    }
    return;
  }
  if (decl.id?.name) yield [decl.id.name, decl];
}

// the leaf predicate for a namespace's exported VALUE: only a declarator carries one, and the
// name lives on IT rather than on the statement, which is why a decl-level match never saw it
function isValueDeclarator(node) {
  return node?.type === 'VariableDeclarator';
}

export function createNameResolution({ t, getScopeBinding = () => null }) {
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

  // per-scope ambient-decl index: name -> matching declPaths (in source order), built once per
  // (scope-owner, matchType) and reused for every name query at that scope. the previous design
  // re-scanned the enclosing statement lists on every call, and the (scope, name) cache on
  // `findAmbientDeclarationPath` does NOT dedupe because resolution passes a DISTINCT call-site scope
  // per reference - so N type references each re-walked + re-`path.get('body')`'d the O(N) program
  // body => O(N^2). indexing the program scope once collapses that to O(N). descends into
  // `declare global { ... }` (its `class`/`function` are ambient even without a `declare` flag, a
  // no-op for the function matcher). keys are per-parse owner nodes (GC'd with the AST; reset per file)
  let ambientScanCache = new WeakMap();
  function scopeAmbientIndex(scopePath, matchType) {
    const owner = scopePath?.node;
    if (!owner) return null;
    let byMatch = ambientScanCache.get(owner);
    if (!byMatch) ambientScanCache.set(owner, byMatch = new Map());
    const cached = byMatch.get(matchType);
    if (cached) return cached;
    // Program / BlockStatement / TSModuleBlock expose the statement array at `.get('body')`;
    // function / method scopes wrap it in a BlockStatement, so drill once more. estree-toolkit may
    // emit a bodyless scope owner whose drill lands on a null path - then there are no statements
    let bodyPaths = scopePath.get('body');
    if (bodyPaths && !Array.isArray(bodyPaths)) bodyPaths = bodyPaths.node ? bodyPaths.get('body') : null;
    const index = new Map();
    function add(stmtPaths, match) {
      for (const stmtPath of stmtPaths) {
        const { type } = stmtPath.node ?? {};
        const declPath = type === 'ExportNamedDeclaration' || type === 'ExportDefaultDeclaration'
          ? stmtPath.get('declaration') : stmtPath;
        const { node } = declPath;
        if (node?.type === 'TSModuleDeclaration' && isGlobalAugmentation(node)) {
          // a `declare global` body is ALWAYS a TSModuleBlock: the nested-TSModuleDeclaration body
          // shape exists only for a qualified namespace head (`namespace A.B {}`), which a global
          // augmentation cannot have
          const innerPaths = declPath.get('body')?.get?.('body');
          // relax the matcher for global-augmentation contents: an in-global `class` is ambient even
          // without a `declare` flag (no-op for the function matcher - a ClassDeclaration never satisfies it)
          if (Array.isArray(innerPaths)) {
            add(innerPaths, n => match(n) || (n?.type === 'ClassDeclaration' && match({ ...n, declare: true })));
          }
          continue;
        }
        if (node?.id?.name && match(node)) {
          let arr = index.get(node.id.name);
          if (!arr) index.set(node.id.name, arr = []);
          arr.push(declPath);
        }
      }
    }
    if (Array.isArray(bodyPaths)) add(bodyPaths, matchType);
    byMatch.set(matchType, index);
    return index;
  }

  // resolve ambient declaration paths matching `name` up the scope chain. `firstMatch=true` returns
  // the first hit; `firstMatch=false` returns ALL matches at the FIRST container that has any and
  // stops, respecting TS lexical shadowing (an inner `declare function fn` is used exclusively;
  // outer siblings don't bleed in). each scope level contributes its own containers plus the ones
  // the chain skips, so a parser that opens no scope for a namespace body still reaches what is
  // written inside it. per-container matches come from the cached index, so this stays O(depth)
  function walkAmbientDeclarationPath({ name, scope, matchType, firstMatch = true }) {
    for (let cur = scope; cur; cur = cur.parent) {
      for (const path of scopeContainerPaths(cur)) {
        const matches = scopeAmbientIndex(path, matchType)?.get(name);
        if (matches?.length) return firstMatch ? matches[0] : matches.slice();
      }
    }
    return firstMatch ? null : [];
  }

  // the ambient twin of `findTypeDeclInLookupPath`, over the same container walk: where the
  // parser opens no scope for a namespace body, the scope lane above never reaches the ambient
  // declarations written inside it and the call resolves to nothing at all
  let lookupPathAmbientCache = new WeakMap();
  function ambientInLookupPath({ name, matchType, firstMatch = true }) {
    const path = lookupPathStack.at(-1);
    if (!path) return firstMatch ? null : [];
    const byName = getOrInitMap(getOrInitMap(lookupPathAmbientCache, path), matchType);
    const cacheKey = `${ firstMatch ? '1' : '*' }${ name }`;
    if (!byName.has(cacheKey)) {
      let found = null;
      for (const container of lookupPathContainers(path)) {
        const matches = scopeAmbientIndex(container, matchType)?.get(name);
        if (matches?.length) {
          found = matches;
          break;
        }
      }
      byName.set(cacheKey, found);
    }
    const matches = byName.get(cacheKey);
    if (!matches) return firstMatch ? null : [];
    return firstMatch ? matches[0] : matches.slice();
  }

  // Babel doesn't register ambient `declare function/class` in `scope.bindings`; scan
  // enclosing statement lists instead. `matchType` picks the ambient kind we want.
  // keyed by (scope, matchType, name) - matchType references are module-level constants,
  // safe Map keys; inner Map uses string name. only the SCOPE lane is cached there: the
  // anchor lane answers per lookup-path and carries its own cache, the same split the
  // type-decl twin makes between `lookupTypeDeclInScope` and its fallback
  let ambientDeclCache = new WeakMap();
  function findAmbientDeclarationPath(name, scope, matchType) {
    if (!scope) return null;
    const anchored = ambientInLookupPath({ name, matchType });
    if (anchored) return ambientShadowedByValue(name, scope, anchored);
    const byName = getOrInitMap(getOrInitMap(ambientDeclCache, scope), matchType);
    if (!byName.has(name)) byName.set(name, walkAmbientDeclarationPath({ name, scope, matchType }));
    return ambientShadowedByValue(name, scope, byName.get(name));
  }

  // ONE value-vs-ambient gate for every ambient lookup: a nearer VALUE binding of the name is what
  // the reference really reaches, so an ambient declaration is in play only when something NARROWER
  // does not stand in front of it. two things the naive "is there a binding" test gets wrong, and
  // both are load-bearing:
  //   - the estree adapter BINDS ambient names where babel leaves them out of `scope.bindings`, so
  //     a binding whose own node IS one of the found declarations is that declaration, not a shadow;
  //   - an overload HEAD and its IMPLEMENTATION are one declaration entity sharing one name, and
  //     babel registers only the impl, so a same-SCOPE binding must not read as a shadow. only a
  //     binding from a NARROWER scope - a parameter, a local `const`, a local class - stands in
  //     front of the ambient one here. a same-scope binding that is NOT an overload head (`declare
  //     function f` beside `var f = ...`, which TS rejects but this plugin never typechecks) is
  //     answered correctly anyway, and not by this gate: the runtime-expression lane resolves the
  //     binding before the ambient probe is reached - measured, not assumed
  function ambientShadowedByValue(name, scope, found) {
    const paths = Array.isArray(found) ? found : found ? [found] : [];
    if (!paths.length) return found;
    const binding = getScopeBinding(scope, name);
    const shadowed = binding
      && paths.every(p => p.node !== binding.path?.node && p.scope !== binding.scope);
    return shadowed ? (Array.isArray(found) ? [] : null) : found;
  }

  // collect all ambient function decls by name. used for multi-overload predicate resolution where
  // the FIRST ambient match may carry a non-predicate signature, but a later sibling carries the
  // asserts/predicate of interest. fires once per IDENTIFIER-form type-guard call site (`if (fn(x))`).
  // intentionally UNCACHED: a (scope, name) cache like the sibling `findAmbientDeclarationPath` never
  // hits here because guard resolution passes a DISTINCT call-site scope object per guard (measured:
  // walk count == call count even for repeats), so it would be pure overhead. the underlying
  // scope-chain walk is already O(scope-depth): it reads the per-scope ambient index built once by
  // the shared `walkAmbientDeclarationPath`, so an extra (scope, name) layer would buy nothing
  function findAmbientFunctionPaths(name, scope) {
    const matchType = isAmbientFunctionNode;
    const anchored = ambientInLookupPath({ name, matchType, firstMatch: false });
    return ambientShadowedByValue(name, scope, anchored.length
      ? anchored : walkAmbientDeclarationPath({ name, scope, matchType, firstMatch: false }));
  }

  // `declare class X { ... }` - babel doesn't bind the name as a value (unlike runtime
  // `class X`), so `resolveRuntimeExpression(X)` returns the bare Identifier. without an
  // ambient lookup, `X.staticMethod()` skips the class-member resolution path entirely
  // and falls through to `findTypeMember`'s synthetic TSFunctionType stub (return-type-less).
  // estree-toolkit registers the binding regardless of `declare`, hence a cross-pipeline
  // asymmetry on `declare`d static-generic calls and renamed-typeparam static lookups
  function findAmbientClassPath(name, scope) {
    return findAmbientDeclarationPath(name, scope, isAmbientClassNode);
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
  // per-statement-list name -> first-matching-decl index for the HOT single-segment bare-name
  // first-match lookup (the type-resolution path). building it once per (statements, leafMatch)
  // turns N distinct-name lookups against an N-statement list from O(N^2) repeated walks into an
  // O(N) build + O(1) lookups. folds `declare global { ... }` bodies in (their decls are visible at
  // every depth) in statement order, so first-match semantics match the walk. multi-segment /
  // collect / import-alias lookups fall through to the full walk below.
  // INVARIANT: leafMatch is the inner cache key, so callers MUST pass a stable reference (all do:
  // the factory-scoped isTypeBearingDeclaration / isFunctionOrClassDeclaration plus the module-level
  // isAmbientFunctionNode). a fresh per-call closure would never hit the cache and regress this
  // back to an O(N^2) rebuild-per-lookup
  let stmtDeclIndexCache = new WeakMap();
  function statementDeclIndex(statements, leafMatch) {
    let byMatch = stmtDeclIndexCache.get(statements);
    if (!byMatch) stmtDeclIndexCache.set(statements, byMatch = new Map());
    const cached = byMatch.get(leafMatch);
    if (cached) return cached;
    const index = new Map();
    (function add(stmts) {
      for (const statement of stmts) {
        const decl = unwrapExportedDeclaration(statement);
        if (!decl) continue;
        for (const [leafName, leaf] of declLeaves(decl)) {
          if (!leafMatch(leaf)) continue;
          // EVERY matching leaf, in statement order: the first-match reader takes `[0]` and the
          // collect reader takes the whole list, so both halves of the lookup share one pass.
          // indexing only the first left collect walking every statement per call - N declarations
          // and N collect reads is the same N^2 the qualified half was indexed out of
          const leaves = index.get(leafName);
          if (leaves) leaves.push(leaf);
          else index.set(leafName, [leaf]);
        }
        if (decl.type === 'TSModuleDeclaration' && isGlobalAugmentation(decl)) {
          const inner = moduleStatements(decl);
          if (inner) add(inner);
        }
      }
    })(statements);
    byMatch.set(leafMatch, index);
    return index;
  }

  function walkStatementsForDecl({ segments, statements, collect, leafMatch = isTypeBearingDeclaration, visited = new Set() }) {
    if (!Array.isArray(statements) || !Array.isArray(segments) || !segments.length) return null;
    // hot path: a single segment - first-match OR collect - resolves through the O(1) per-statement
    // -list index. its construction already mirrors this walk for that case: leaves of the level's
    // own statements, descending only into `declare global` (a bare name must not reach into a
    // named namespace body, and a qualified one never gets here)
    if (segments.length === 1) {
      const leaves = statementDeclIndex(statements, leafMatch).get(segments[0]);
      if (!collect) return leaves?.[0] ?? null;
      if (leaves) collect.push(...leaves);
      return null;
    }
    const [head, ...rest] = segments;
    // past the single-segment return above, `rest` is never empty: this loop only ever CONTINUES a
    // qualified lookup, so it visits the two statement kinds a continuation can pass through and
    // nothing else. the leaf half lives in the index
    for (const decl of statementDescentDecls(statements)) {
      // TS `import IE = NS;` / `import IE = NS.Inner;` namespace alias - redirect head
      // segment through the moduleReference's segments and re-walk. external-module form
      // (`import X = require('m')`) has TSExternalModuleReference which `collectQualified
      // Segments` rejects (non-Identifier slot), so it correctly bails without misrouting
      if (decl.type === 'TSImportEqualsDeclaration' && decl.id?.name === head) {
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
      // a bare name must NOT reach into a nested TSModuleDeclaration body - `namespace N { interface
      // Box {} }; declare const x: Box;` leaves top-level `Box` undefined - and it no longer can:
      // the index this walk defers bare names to descends into `declare global` alone
      if (!startsWithSegments(segments, moduleSegs)) continue;
      const inner = walkStatementsForDecl({
        segments: segments.slice(moduleSegs.length), statements: moduleStatements(decl), collect, leafMatch, visited,
      });
      if (inner && !collect) return inner;
    }
    return null;
  }

  // walk scope chain; `collect=null` returns first hit, `collect=[]` collects siblings at the first
  // containing statement list (interface merging only - others don't merge). "containing" is per
  // LIST, not per scope level: a level contributes its own body and the lists the chain skips over.
  // `leafMatch` threads through to `walkStatementsForDecl`; see there for the contract
  function walkScopesForDecl({ name, scope, collect, leafMatch = isTypeBearingDeclaration }) {
    if (!scope) return null;
    const segments = typeof name === 'string' ? name.split('.') : name;
    for (let cur = scope; cur; cur = cur.parent) {
      for (const statements of scopeStatementLists(cur)) {
        const before = collect?.length;
        const result = walkStatementsForDecl({ segments, statements, collect, leafMatch });
        if (!collect && result) return result;
        if (collect && collect.length > before) return null;
      }
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
  // a namespace's exported VALUE (`namespace NS { export const v: T }` and its `declare` twin).
  // the declaration walk surfaces declarators now, so this is the SAME finder with the leaf
  // predicate that accepts one. it hands back the ANNOTATION rather than a path: a namespace
  // member's declared type is the sound answer here, while reading an initializer would need a
  // live path the walk does not carry - and declining there only degrades to generic
  function findNamespacedValueAnnotation(segments, scope) {
    return findFirstDecl({ name: segments, scope, leafMatch: isValueDeclarator })?.id?.typeAnnotation ?? null;
  }

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

  // per-scope cache key: serialize multi-segment / array inputs to a dotted string so qualified
  // references (`NS.Type`) and array-form callsites share the cache slot with their string form.
  // ONE serializer for every cache in this cluster - the three hand-written ternaries fell back
  // differently (`null` / `''` / an optional-chained join), so the same non-array, non-string name
  // was cached under three different keys depending on which lookup asked.
  // the collapse is lossy on purpose and safe only under one invariant: `['NS','Array']` and the
  // string `'NS.Array'` land on the SAME slot, so asking a dotted name as ONE segment would poison
  // that slot with its miss for the genuine segmented walk. only a single-segment reference can be
  // shadowed, so the shadow gate never asks a composite name - locked by the qualified-reference
  // negative in `TYPE_PARAM_SHADOW_CASES`. a caller that starts asking composite names here has to
  // key them apart instead
  function nameCacheKey(name) {
    if (typeof name === 'string') return name;
    return Array.isArray(name) ? name.join('.') : null;
  }

  // a sibling plugin mutating the AST mid-file could in principle strand a stale null here;
  // never observed, accepted as theoretical - the caches reset per file
  let typeDeclCache = new WeakMap();

  function lookupTypeDeclInScope(name, scope) {
    const key = nameCacheKey(name);
    if (key === null) return findFirstDecl({ name, scope, leafMatch: isTypeBearingDeclaration });
    const byName = getOrInitMap(typeDeclCache, scope);
    if (byName.has(key)) return byName.get(key);
    const decl = findFirstDecl({ name, scope, leafMatch: isTypeBearingDeclaration });
    byName.set(key, decl);
    return decl;
  }

  // the anchor lane goes FIRST, and only because the anchor is the path of the DECLARATION being
  // resolved: it answers exclusively for containers the scope chain cannot see (a namespace body on
  // a parser that opens no scope for one), so where it answers at all it answers about a strictly
  // narrower context and a namespace-local declaration beats an outer namesake. on babel every such
  // container owns a scope, so the lane yields nothing and the scope walk decides as it always did.
  // anchored on the USE instead, this order picks up whatever namesake the use happens to sit next
  // to - measured, both emitters, wrong family
  function findTypeDeclaration(name, scope) {
    if (!scope) return null;
    return findTypeDeclInLookupPath(name)
      ?? lookupTypeDeclInScope(name, scope);
  }

  // execute `fn` with `path` registered as the current lookup-path anchor. used by
  // binding-driven resolution sites (e.g. `pattern-bindings`) that have access to the
  // binding's NodePath - threading the path through the resolver chain explicitly would
  // touch dozens of call sites, but resolution is strictly synchronous and reentrant
  // calls compose naturally on the stack, so an instance-level stack avoids the churn
  const lookupPathStack = [];
  // the anchor a namespace-fallback lookup currently resolves against. exposed so a caller that
  // MEMOIZES a result computed under it can key on the anchor too - the same declaration resolves
  // differently under two anchors, and `parentPath.scope` alone does not distinguish them (a
  // recovered namespace decl path chains to the OUTER scope, so the scope can be identical)
  function currentLookupPath() {
    return lookupPathStack.at(-1) ?? null;
  }

  function withLookupPath(path, fn) {
    if (!path) return fn();
    lookupPathStack.push(path);
    try {
      return fn();
    } finally {
      lookupPathStack.pop();
    }
  }

  // check each enclosing container's direct statements for the type decl. mirrors `findTSRuntimeBindingInPath`.
  // cache keyed on (path-anchor, name): each missed scope-chain lookup re-walks the same
  // O(pathDepth) ancestors per call site - WeakMap per anchor amortises to O(unique-names).
  // negative results cached too so repeat misses don't keep re-walking
  let lookupPathDeclCache = new WeakMap();
  function findTypeDeclInLookupPath(name, all = false) {
    const path = lookupPathStack.at(-1);
    if (!path) return all ? [] : null;
    // the two modes answer differently on the same (anchor, name) - one declaration versus every
    // merged sibling - so they cannot share a cache slot
    const cacheKey = `${ all ? '*' : '1' }${ nameCacheKey(name) ?? '' }`;
    let perPath = lookupPathDeclCache.get(path);
    if (perPath?.has(cacheKey)) return perPath.get(cacheKey);
    const segments = typeof name === 'string' ? name.split('.') : name;
    let result = all ? [] : null;
    for (const container of lookupPathContainers(path)) {
      const collect = all ? [] : null;
      const found = walkStatementsForDecl({
        segments, statements: container.node.body, collect, leafMatch: isTypeBearingDeclaration,
      });
      // collect mode stops at the first container that HAS the name, mirroring the scope walk:
      // merged siblings live together, and an outer container's must not join them
      if (all ? collect.length : found) {
        result = all ? collect : found;
        break;
      }
    }
    if (!perPath) lookupPathDeclCache.set(path, perPath = new Map());
    perPath.set(cacheKey, result);
    return all ? result.slice() : result;
  }

  // narrow `findTypeDeclaration` to TSEnumDeclaration. callers care about the enum-decl
  // shape specifically (member-type lookup, value-kind probe, reverse-mapping check), so
  // collapse the find + type-check pattern into one call to keep predicate and lookup at
  // the same level of abstraction
  function findEnumDeclaration(name, scope) {
    const decl = findTypeDeclaration(name, scope);
    return decl?.type === 'TSEnumDeclaration' ? decl : null;
  }

  // all merged `enum E {}` blocks for a name (TS declaration merging unions their members).
  // reuses the canonical decl-merge walk so a member declared in a later block still resolves
  function findAllEnumDeclarations(name, scope) {
    return findAllTypeDeclarations(name, scope).filter(decl => decl?.type === 'TSEnumDeclaration');
  }

  // the enum is the NEAREST value declaration for `name` - i.e. its members can be read off `name`
  // at runtime - only when a lexically-nearer const/let/var/param of the same name does not shadow
  // it. an enum exists for the name AND either there is no value binding, or the enum is no longer
  // reachable walking up from that binding's scope (the binding sits below the enum). `bindingPath`
  // MUST be the CONST-AGNOSTIC value binding (`bindingDeclaratorPath`): a reassigned `let Enum`
  // shadows just as a `const` does, and `constantBindingPath` would return null for it -> false
  // negative (reads the enum value under the shadow). only the binding SCOPE is read here
  function enumIsNearestValue(name, scope, bindingPath) {
    if (!findEnumDeclaration(name, scope)) return false;
    return !bindingPath || !findEnumDeclaration(name, bindingPath.scope);
  }

  // all `interface X {}` siblings at the first container that has any, in the same lane order as
  // the single-hit twin above (anchor first, for the reason stated there) - the merged-member
  // collector reads THIS lane, so a namespace-local interface would otherwise come back with no
  // members at all, or with an outer namesake's. only the SCOPE lane is cached per (scope, name):
  // without it a class with N inherited interfaces re-walks the chain per ancestor. the anchor lane
  // answers per ANCHOR and keeps its own cache. WeakMap keyed on scope so the Map collects with the AST
  let allTypeDeclCache = new WeakMap();
  function findAllTypeDeclarations(name, scope) {
    if (!scope) return [];
    const anchored = findTypeDeclInLookupPath(name, true);
    if (anchored.length) return anchored;
    const cacheKey = nameCacheKey(name) ?? '';
    let perScope = allTypeDeclCache.get(scope);
    // hand out a COPY: the cache exists to skip the scope WALK, not the (1-3 element) allocation,
    // and a caller that sorted or pushed onto the shared instance would poison every later lookup
    // of the same (scope, name). copying removes that invariant instead of documenting it
    if (perScope?.has(cacheKey)) return perScope.get(cacheKey).slice();
    const collected = findAllDecls({ name, scope, leafMatch: isTypeBearingDeclaration });
    if (!perScope) allTypeDeclCache.set(scope, perScope = new Map());
    perScope.set(cacheKey, collected);
    return collected.slice();
  }

  // TSTypeParameter.name: Identifier node on babel@8 and oxc-parser, a bare string on babel@7
  function typeParamName(param) {
    if (!param) return undefined;
    return typeof param.name === 'string' ? param.name : param.name?.name;
  }

  // the one uncached scope-chain lookup left in a cluster that caches every other one, and the
  // most-asked of them all: a type-reference that binds to no map and names no known container is
  // re-asked on the flat lane and again on each substitution lane, so the same (scope, name) walks
  // to the program root several times per reference. same key shape and same lifetime as
  // `typeDeclCache` next door - no parser adds a type parameter mid-file
  let typeParamCache = new WeakMap();

  function findTypeParameter(name, scope) {
    if (typeof name !== 'string' || !scope) return findTypeParameterUncached(name, scope);
    const byName = getOrInitMap(typeParamCache, scope);
    if (byName.has(name)) return byName.get(name);
    const found = findTypeParameterUncached(name, scope);
    byName.set(name, found);
    return found;
  }

  function findTypeParameterUncached(name, scope) {
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
    ambientScanCache = new WeakMap();
    typeDeclCache = new WeakMap();
    typeParamCache = new WeakMap();
    allTypeDeclCache = new WeakMap();
    lookupPathDeclCache = new WeakMap();
    lookupPathAmbientCache = new WeakMap();
    stmtDeclIndexCache = new WeakMap();
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
      // TSImportEqualsDeclaration branch; visited-guard bails on cyclic aliases
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
      if (decl.type !== 'TSModuleDeclaration') continue;
      // `declare global { ... }` body bindings are visible at every depth - descend regardless of
      // segment count (matching the node variant, which runs its global-augmentation branch ahead
      // of the bare-name guard) so both bare and qualified names resolve through it
      if (isGlobalAugmentation(decl)) {
        const bodyPath = declPath.get('body');
        const innerPaths = bodyPath?.node?.type === 'TSModuleDeclaration'
          ? [bodyPath]
          : bodyPath?.get?.('body');
        if (!Array.isArray(innerPaths)) continue;
        const found = walkDeclPathsBySegments(segments, innerPaths, matchType, visited);
        if (found) return found;
        continue;
      }
      // bare-name segments only resolve via top-level decls in this iteration. without the guard
      // nested namespaces would re-enter their own body on every bare segment query, doubling
      // work on deep TSModuleDeclaration trees
      if (rest.length === 0) continue;
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
      const found = walkDeclPathsBySegments(segments.slice(moduleSegs.length), innerPaths, matchType, visited);
      if (found) return found;
    }
    return null;
  }

  // `isTypeBearingDeclaration` stays cluster-private (default `leafMatch` for
  // `walkStatementsForDecl` / `walkScopesForDecl`)
  return {
    withLookupPath,
    currentLookupPath,
    isFunctionLike,
    isFunctionOrClassDeclaration,
    isClassLikeDeclaration,
    findAmbientDeclarationPath,
    findAmbientFunctionPaths,
    findAmbientClassPath,
    findNamespacedFunctionPath,
    findNamespacedValueAnnotation,
    findOverloadsForName,
    findDeclPathBySegments,
    findTypeDeclaration,
    findEnumDeclaration,
    findAllEnumDeclarations,
    enumIsNearestValue,
    findAllTypeDeclarations,
    typeParamName,
    findTypeParameter,
    reset,
  };
}
