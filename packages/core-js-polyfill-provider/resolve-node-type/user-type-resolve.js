// User-defined type resolution: walks `type` / `interface` / `class` / `enum` declarations
// to produce a Type object, honoring generic substitution, default type params, namespace-
// qualified extends, alias cycle detection.
//
// Public surface:
//   resolveUserDefinedType({ name, node, scope, depth, typeParamMap, seen })
//     - main entry for `TSTypeReference` / `GenericTypeAnnotation` to user decl resolution
//   buildSubstMap(declParams, usageArgs, scope)
//     - declParam name -> AST node Map (for `applyAliasSubstDeep`); pass `scope` for capture-avoidance
//
// Cluster-private:
//   resolveTypeArgs                  - phase-1 / phase-2 type-arg resolution with alpha-
//                                      rename to drop colliding outer entries
//   resolveInterfaceExtendsParent    - single `extends` clause walker (Identifier OR
//                                      namespace-qualified TSQualifiedName / MemberExpression)
import { $Object, MAX_DEPTH } from './base.js';
import {
  collectQualifiedSegments,
  extendsId,
  interfaceBodyMembers,
  isInterfaceDeclaration,
  isTypeAlias,
  typeAliasBody,
  typeRefName,
} from './ast-shapes.js';
import { getSuperTypeArgs, getTypeArgs } from '../helpers/ast-patterns.js';

// side-channel cycle flag: Set instances that hit a declaration-cycle during a walk.
// per-walk, keyed on the decl-set's identity so parent frames can detect cycles without
// a monkey-patched `.hadCycle` property (which would be lost on any defensive clone)
const cycleSeenSets = new WeakSet();

// snapshot the pre-call cycle state; returned predicate reports whether the flag flipped
// during the caller's work. used by interface/class `extends` walks to distinguish "no
// parent matched" (safe fallback to $Object) from "cyclic extends poisoned the result"
// (must NOT fall back - returns null so the generic polyfill plugin stays emitted). each
// parent sub-walk runs under `runParentWalkWithCycleIsolation` so this snapshot is clean
function cycleFlipDetector(visited) {
  const preCycle = cycleSeenSets.has(visited);
  return () => !preCycle && cycleSeenSets.has(visited);
}

// run one `extends` parent/super sub-walk with the shared cycle flag isolated: clear it
// first so a sibling that already cycled cannot mask THIS branch's own cycle detection,
// then re-assert it afterward so the caller's frame still sees that some sibling cycled.
// without the clear, a multi-parent type with one cyclic parent leaves the flag set across
// the loop and a later healthy sibling's resolution is discarded as poisoned -> masquerades
// as Object and drops the instance polyfill. a cycle hit inside the sub-walk persists
// naturally (we only clear before, never after)
function runParentWalkWithCycleIsolation(visited, walk) {
  const siblingHadCycle = cycleSeenSets.has(visited);
  cycleSeenSets.delete(visited);
  const result = walk();
  if (siblingHadCycle) cycleSeenSets.add(visited);
  return result;
}

export function createUserTypeResolve({
  typeParamName,
  findTypeDeclaration,
  findDeclPathBySegments,
  withLookupPath,
  findTypeParameter,
  isClassLikeDeclaration,
  extendsClauseName,
  resolveKnownConstructor,
  resolveKnownContainerType,
  resolveEnumType,
  substituteTypeParams,
  resolveTypeAnnotation,
  dropMapKeys,
  applyAliasSubstDeep,
}) {
  function resolveTypeArgs({ decl, node, typeParamMap, scope, depth, seen }) {
    const declParams = decl.typeParameters?.params;
    if (!declParams?.length) return typeParamMap;
    const callArgs = getTypeArgs(node)?.params;
    const base = typeParamMap || new Map();
    const declParamNames = new Set(declParams.map(typeParamName).filter(Boolean));

    // resolve params left-to-right so a later default that references an earlier param
    // (`<T, U = T>`) sees its already-resolved value. an explicit call-arg lives in caller
    // scope (resolve under the OUTER `base`; its refs may collide with this decl's param names
    // but bind via outer scope), while a default lives in THIS decl's scope: it may reference an
    // earlier type-param (the progressively-built `localMap`) or an outer lexical type, but NOT a
    // colliding instantiation binding from `base` whose name is not a param here (that name is a
    // sibling/prior-hop generic's param, lexically out of scope - it must resolve to the outer decl).
    // seeding the local map from `base` re-captured such a default to the foreign binding
    const trimmedBase = dropMapKeys(base, declParamNames);
    const localMap = new Map();
    let didSubst = false;
    declParams.forEach((p, i) => {
      const explicit = callArgs?.[i];
      const arg = explicit ?? p.default;
      if (!arg) return;
      const map = explicit ? base : localMap;
      const resolved = map.size > 0
        ? substituteTypeParams(arg, map, scope, depth + 1, seen)
        : resolveTypeAnnotation(arg, scope, depth + 1);
      if (resolved) {
        localMap.set(typeParamName(p), resolved);
        didSubst = true;
      }
    });
    // neither subst happened nor a collision exists: return typeParamMap as-is so the caller's
    // identity preserves for downstream memoize keys
    if (!didSubst && trimmedBase === base) return typeParamMap;
    return localMap;
  }

  // resolve a single interface extends clause:
  //   - bare `interface I extends Base` (Identifier) -> existing direct lookup
  //   - namespaced `interface I extends NS.Base` (TSQualifiedName in babel,
  //     MemberExpression in oxc) -> decompose to segments, walk findTypeDeclaration's
  //     array-form path to locate the parent interface, recurse with its declaration scope
  // without the qualified branch, namespace extends bails to Object hint and member
  // dispatch loses the parent's structural members
  // resolve a qualified parent (interface-`extends` / class-`extends`) with its module body anchored
  // as the type-name lookup path, so the parent's bare sibling-type heritage (`Base extends Inner`
  // inside `namespace NS`) resolves against NS rather than the caller scope. `parentPath` is null for
  // a bare / unfound name -> withLookupPath is a no-op and the caller scope is used unchanged
  function resolveParentAnchored(parentPath, { name, node, scope, depth, typeParamMap, seen }) {
    return withLookupPath(parentPath, () => resolveUserDefinedType({
      name, node, scope: parentPath?.scope ?? scope, depth: depth + 1, typeParamMap, seen,
    }));
  }

  function resolveInterfaceExtendsParent({ parent, scope, resolve, depth, typeParamMap, visited }) {
    const base = extendsId(parent);
    if (!base) return null;
    if (base.type === 'Identifier') {
      const constructor = resolveKnownConstructor(base.name);
      return resolveKnownContainerType({ name: base.name, base: constructor, node: parent, innerResolver: resolve })
        || resolveUserDefinedType({ name: base.name, node: parent, scope, depth: depth + 1, typeParamMap, seen: visited });
    }
    const segments = collectQualifiedSegments(base);
    if (!segments) return null;
    // pass full segments array (not last segment only) - findTypeDeclaration's namespace walk
    // honours nested module paths; the bare last segment could match an unrelated
    // sibling-scope declaration sharing the same short name
    const parentDecl = findTypeDeclaration(segments, scope);
    if (!parentDecl || !isInterfaceDeclaration(parentDecl)) return null;
    // a namespace-qualified parent (`extends NS.Base`) whose heritage references a sibling by its
    // bare name (`Base extends Inner`) needs NS's module body as the lookup anchor - findTypeDeclaration
    // returns a raw node with no `.scope`, so `parentDecl.scope` is always undefined and bare `Inner`
    // would resolve in the caller scope (missed). recover the parent's NodePath and anchor the lookup there
    const parentPath = findDeclPathBySegments(segments, scope, isInterfaceDeclaration);
    return resolveParentAnchored(parentPath, { name: segments, node: parent, scope, depth, typeParamMap, seen: visited });
  }

  function resolveUserDefinedType({ name, node, scope, depth, typeParamMap, seen }) {
    if (depth > MAX_DEPTH) return null;
    // type parameters shadow type declarations with the same name.
    // fall back to `default` FIRST (what TS binds without inference arguments), then
    // `constraint` (upper bound, typically over-broad - `object` / `unknown`)
    const typeParam = findTypeParameter(name, scope);
    if (typeParam) {
      const annotation = typeParam.default ?? typeParam.constraint;
      if (!annotation) return null;
      // pass `seen` through to substitution to inherit caller's decl-cycle guard. without
      // it, a cyclic default `type R<T = R<T>>` walks the substitution recursion fresh and
      // only MAX_DEPTH=64 catches the loop (O(64) overhead per resolution); with `seen`,
      // the second visit short-circuits via the side-channel WeakSet flag
      return typeParamMap
        ? substituteTypeParams(annotation, typeParamMap, typeParam.scope, depth + 1, seen)
        : resolveTypeAnnotation(annotation, typeParam.scope, depth + 1);
    }
    const declaration = findTypeDeclaration(name, scope);
    if (!declaration) return null;
    // `interface A extends B; interface B extends A` - MAX_DEPTH catches the loop, but a
    // per-walk decl-set short-circuits it at the second visit. cycle-detection uses a
    // side-channel WeakSet keyed on the decl-set identity instead of a monkey-patched
    // property - that way `new Set(visited)` (should a caller ever clone) doesn't silently
    // forget the cycle flag; the cloned Set is simply a different identity with no flag.
    // unknowable cyclic type must NOT masquerade as `Object` (it suppresses generic polyfill)
    if (seen?.has(declaration)) {
      cycleSeenSets.add(seen);
      return null;
    }
    const visited = seen ?? new Set();
    visited.add(declaration);
    typeParamMap = resolveTypeArgs({ decl: declaration, node, typeParamMap, scope, depth, seen: visited });
    // thread `visited` into the body-resolution closure so self-recursive aliases
    // (`type Rec<T> = Rec<T[]>`) hit the decl-set guard on re-entry instead of
    // growing `typeParamMap` unboundedly until MAX_DEPTH bottom-outs via CPU-burn.
    // no-typeParamMap branch passes `visited` to `resolveTypeAnnotation` so the
    // typeParamMap-free recursion (`type Rec = { next: Rec }`) hits the same guard
    // when the body re-references the alias through a bare TSTypeReference
    const resolve = typeParamMap
      ? p => substituteTypeParams(p, typeParamMap, scope, depth + 1, visited)
      : p => resolveTypeAnnotation(p, scope, depth + 1, visited);
    if (isTypeAlias(declaration)) return resolve(typeAliasBody(declaration));
    if (declaration.type === 'TSEnumDeclaration') return resolveEnumType(declaration);
    if (isInterfaceDeclaration(declaration)) {
      const parents = declaration.extends;
      if (parents?.length) {
        const cycleFlipped = cycleFlipDetector(visited);
        for (const parent of parents) {
          const result = runParentWalkWithCycleIsolation(visited,
            () => resolveInterfaceExtendsParent({ parent, scope, resolve, depth, typeParamMap, visited }));
          if (result) return result;
        }
        if (cycleFlipped()) return null;
        // extends parents that ALL resolved to nothing are unknowable (undeclared / unresolved
        // heritage) - masquerading as Object suppresses the polyfill, same as the class branch -> null
        return null;
      }
      return new $Object('Object');
    }
    // class as a type: walk `extends` for known container (`Array<T>`) or user parent.
    // cyclic class extends should NOT fall back to `$Object('Object')` - that masquerades
    // as a concrete type and suppresses the generic polyfill plugin emits for unknowable
    // receivers. mirrors the interface-branch cycle handling above
    if (isClassLikeDeclaration(declaration)) {
      const flowExtend = declaration.extends?.[0];
      const superClass = declaration.superClass ?? flowExtend?.id;
      let superName = extendsClauseName(superClass, scope);
      // `class Sub extends NS.Base` - `extendsClauseName` walks `walkStaticReceiverChain`
      // (runtime-binding lookup) which misses TS-only `namespace NS { class Base {} }`
      // (no runtime binding for the module). fall back to namespace-aware type lookup
      // via segments + `findTypeDeclaration`, mirroring the interface-branch behaviour.
      // `collectQualifiedSegments` accepts both type-position (TSQualifiedName) and
      // value-position (MemberExpression in heritage clause) qualified names
      if (!superName) {
        const segments = collectQualifiedSegments(superClass);
        if (segments?.length > 1 && findTypeDeclaration(segments, scope)) {
          superName = segments.join('.');
        }
      }
      // a class with NO heritage is a known plain object -> Object. but a PRESENT super whose name
      // can't be extracted (mixin `extends mixOf(Base)`, reassigned binding, any non-name heritage
      // expression) is UNKNOWABLE - it could be Array / a typed-array / any polyfillable base, where
      // masquerading as `$Object('Object')` would suppress the generic polyfill -> bail to null (same
      // rule as cyclic extends); keep Object only for the genuinely base-less class
      if (!superName) return superClass ? null : new $Object('Object');
      // Flow `DeclareClass extends Base<T>` carries typeArgs on the heritage clause
      // (`extends[0].typeParameters`), not on the declaration itself - `getSuperTypeArgs`
      // probes both class-side slots and would otherwise return undefined here, dropping
      // T from the parent ref and losing element-precision through Base<T>
      const parentRef = {
        type: 'TSTypeReference',
        typeName: typeNameFromName(superName),
        typeParameters: flowExtend?.typeParameters ?? getSuperTypeArgs(declaration),
      };
      const ctor = resolveKnownConstructor(superName);
      if (ctor) return resolveKnownContainerType({ name: superName, base: ctor, node: parentRef, innerResolver: resolve }) || ctor;
      const cycleFlipped = cycleFlipDetector(visited);
      // namespace-qualified super (`class Sub extends NS.Base`) whose own heritage references a
      // sibling by bare name (`Base extends Inner`): anchor the lookup at the parent's NodePath so
      // NS's module body supplies `Inner` (same gap as the interface branch). no-op for bare supers
      const parentSegments = superName.split('.');
      const parentPath = parentSegments.length > 1
        ? findDeclPathBySegments(parentSegments, scope, isClassLikeDeclaration) : null;
      const result = runParentWalkWithCycleIsolation(visited, () => resolveParentAnchored(parentPath,
        { name: superName, node: parentRef, scope, depth, typeParamMap, seen: visited }));
      if (result) return result;
      if (cycleFlipped()) return null;
      // superName was extracted but no parent class with that name resolved to a container type.
      // distinguish a KNOWN-but-plain base (a local class declaration with no polyfillable shape ->
      // Object is correct, the receiver is a known object) from an UNKNOWABLE base (no class decl -
      // opaque import / value-position name) which could be Array / a typed-array, where masquerading
      // as Object would suppress the polyfill -> bail to null (same as `!superName`)
      return findDeclPathBySegments(superName.split('.'), scope, isClassLikeDeclaration)
        ? new $Object('Object') : null;
    }
    return null;
  }

  // canonical typeName slot for a synthetic TSTypeReference: single names stay as
  // Identifier, dotted names fold into a left-recursive TSQualifiedName chain. downstream
  // `typeRefSegments` / `collectQualifiedSegments` walk both shapes identically
  function typeNameFromName(name) {
    if (!name.includes('.')) return { type: 'Identifier', name };
    const parts = name.split('.');
    let typeName = { type: 'Identifier', name: parts[0] };
    for (let i = 1; i < parts.length; i++) {
      typeName = { type: 'TSQualifiedName', left: typeName, right: { type: 'Identifier', name: parts[i] } };
    }
    return typeName;
  }

  // inline form of an EXTERNAL declaration named by a sibling-colliding ref, INDEPENDENT of
  // declaration kind: an alias inlines its body, a non-generic interface its structural members;
  // any other kind (class / enum / generic interface) has no self-ref-free inline form, so it
  // collapses to `unknown` - that still breaks the capture chain (the sibling's mapping can no
  // longer bind the wrong type), trading a wrong recapture for a safe under-resolve. returns null
  // when no external declaration exists - the colliding name IS the type-param itself (an
  // intentional sibling reference), to be left for the transitive pass to bind
  function externalColliderInline(name, scope) {
    const decl = findTypeDeclaration([name], scope);
    if (!decl) return null;
    if (isTypeAlias(decl)) return typeAliasBody(decl) ?? null;
    if (isInterfaceDeclaration(decl) && !decl.typeParameters) {
      const members = interfaceBodyMembers(decl);
      if (members.length) return { type: 'TSTypeLiteral', members };
    }
    return { type: 'TSUnknownKeyword' };
  }

  // capture-avoidance for an EXPLICIT usage-arg: a bare type-arg whose name collides with a sibling
  // type-param refers to an EXTERNAL declaration (the arg is written in the CALLER scope, where the
  // decl's own params are NOT in scope), yet the transitive substitution in `applyAliasSubstDeep`
  // would re-capture it through that param's own mapping (`Wrap<string, A>` over `Wrap<A, Q>` makes
  // Q -> A -> string). resolve the external declaration eagerly so the stored value is concrete and
  // recapture-free. a collider is not always the WHOLE arg: `Wrap<string, { x: A }>` / `Array<A>` /
  // tuple / union nest it, where the same recapture rewrites the inner free `A` (the external decl
  // in TS caller scope) to the sibling's value. resolve nested colliders by delegating to the
  // canonical `applyAliasSubstDeep` with a `{collider -> external inline}` map built only for names
  // that HAVE an external decl - a colliding name with none stays untouched (intentional sibling
  // ref). NB: only explicit args route here; a DEFAULT lives in the DECLARATION scope where sibling
  // params shadow outer decls, so its colliding refs (bare or nested) must bind to the param, never
  // the external decl - left untouched for the transitive pass
  function resolveColliderArg(arg, paramNames, scope) {
    if (!paramNames || !arg || typeof arg !== 'object') return arg;
    // whole-arg bare collider fast path: inline the external decl directly
    if (arg.type === 'TSTypeReference' && arg.typeName?.type === 'Identifier' && paramNames.has(arg.typeName.name)) {
      return externalColliderInline(arg.typeName.name, scope) ?? arg;
    }
    // nested collider: build a per-name subst of the external inline forms reachable in this arg,
    // then let the shared deep walk splice them in (names with no external decl stay as the param)
    let colliderSubst = null;
    for (const name of paramNames) {
      if (!name) continue;
      const inline = externalColliderInline(name, scope);
      if (inline) (colliderSubst ??= new Map()).set(name, inline);
    }
    return colliderSubst ? applyAliasSubstDeep(arg, colliderSubst) : arg;
  }

  // build {paramName -> argNode} from explicit usage args, falling back to decl param defaults
  // builds an AST-valued substitution map: `Map<string, ASTNode>` keyed by declParam
  // name. values are RAW AST nodes (TSTypeReference / TSArrayType / etc.) ready to be
  // spliced into a deep-cloned tree by `applyAliasSubstDeep`. distinct from
  // `resolveTypeArgs` which builds Type-object-valued binding maps for `substituteTypeParams`.
  // `incomingSubst` (when threaded by the alias-chain walker) seeds the map AND resolves each arg
  // through prior hops, so a chained generic alias (`type A<T> = B<T>; type B<U> = ...`) carries
  // T's binding into U - the single capture-avoiding builder both the single-list callers and the
  // chain walker share
  function buildSubstMap(declParams, usageArgs, scope, incomingSubst = null) {
    if (!declParams?.length) return incomingSubst;
    // the result maps ONLY this hop's params: prior-hop bindings RESOLVE this hop's args (via
    // `incomingSubst` below) but are not carried forward, mirroring the Type-object `resolveTypeArgs`
    // path - else a colliding free ref in this hop's body / default would resolve through the stale
    // prior binding instead of its own lexical scope
    const subst = new Map();
    const paramNames = scope ? new Set(declParams.map(typeParamName)) : null;
    for (let i = 0; i < declParams.length; i++) {
      const explicit = usageArgs?.[i];
      let arg = explicit ?? declParams[i].default;
      if (!arg) continue;
      // capture-avoidance is EXPLICIT-only, for BOTH capture branches: an explicit arg lives in the
      // CALLER scope (a colliding ref means a prior-hop binding via the chained-rewrite, OR the external
      // decl via the collider inline); a DEFAULT lives in THIS decl's scope (a colliding ref means the
      // shadowing sibling param or an outer decl, bound by the transitive pass) - so a default is left
      // untouched by both branches
      if (explicit) {
        const argName = incomingSubst && typeRefName(arg);
        arg = argName && incomingSubst.has(argName) ? incomingSubst.get(argName) : resolveColliderArg(arg, paramNames, scope);
      }
      subst.set(typeParamName(declParams[i]), arg);
    }
    return subst.size ? subst : null;
  }

  return {
    resolveUserDefinedType,
    buildSubstMap,
  };
}
