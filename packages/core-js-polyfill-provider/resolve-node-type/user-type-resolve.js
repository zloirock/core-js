// User-defined type resolution: walks `type` / `interface` / `class` / `enum` declarations
// to produce a Type object, honoring generic substitution, default type params, namespace-
// qualified extends, alias cycle detection.
//
// Public surface:
//   resolveUserDefinedType({ name, node, scope, depth, typeParamMap, seen })
//     - main entry for `TSTypeReference` / `GenericTypeAnnotation` to user decl resolution
//   buildSubstMap(declParams, usageArgs)
//     - declParam name -> AST node Map (for `applyAliasSubstDeep`)
//   buildParentSubst(parentRef, scope)
//     - parent interface ref -> subst Map
//   buildDefaultTypeParamMap(annotation, scope)
//     - utility-type alias receiver -> Map (Type objects) for `substituteTypeParams`
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
  isInterfaceDeclaration,
  isTypeAlias,
  typeAliasBody,
  typeRefSegments,
} from './ast-shapes.js';
import { getSuperTypeArgs, getTypeArgs } from '../helpers/ast-patterns.js';

// side-channel cycle flag: Set instances that hit a declaration-cycle during a walk.
// per-walk, keyed on the decl-set's identity so parent frames can detect cycles without
// a monkey-patched `.hadCycle` property (which would be lost on any defensive clone)
const cycleSeenSets = new WeakSet();

// snapshot the pre-call cycle state; returned predicate reports whether the flag flipped
// during the caller's work. used by interface/class `extends` walks to distinguish "no
// parent matched" (safe fallback to $Object) from "cyclic extends poisoned the result"
// (must NOT fall back - returns null so the generic polyfill plugin stays emitted)
function cycleFlipDetector(visited) {
  const preCycle = cycleSeenSets.has(visited);
  return () => !preCycle && cycleSeenSets.has(visited);
}

export function createUserTypeResolve({
  typeParamName,
  findTypeDeclaration,
  findTypeParameter,
  isClassLikeDeclaration,
  extendsClauseName,
  resolveKnownConstructor,
  resolveKnownContainerType,
  resolveEnumType,
  substituteTypeParams,
  resolveTypeAnnotation,
  dropMapKeys,
}) {
  function resolveTypeArgs({ decl, node, typeParamMap, scope, depth, seen }) {
    const declParams = decl.typeParameters?.params;
    if (!declParams?.length) return typeParamMap;
    const callArgs = getTypeArgs(node)?.params;
    const base = typeParamMap || new Map();
    const declParamNames = new Set(declParams.map(typeParamName).filter(Boolean));

    // phase 1: resolve each arg under the OUTER map (args live in caller-scope; their
    // type-param refs may collide with this decl's param names but resolve correctly
    // via outer bindings before the inner scope strips them)
    const resolvedArgs = declParams.map((p, i) => {
      const arg = callArgs?.[i] ?? p.default;
      if (!arg) return null;
      return base.size > 0
        ? substituteTypeParams(arg, base, scope, depth + 1, seen)
        : resolveTypeAnnotation(arg, scope, depth + 1);
    });
    const didSubst = resolvedArgs.some(Boolean);

    // phase 2: drop colliding outer entries via shared alpha-rename helper. when neither
    // subst happened nor a collision exists, return typeParamMap as-is so caller's
    // identity preserves for downstream memoize keys
    const trimmedBase = dropMapKeys(base, declParamNames);
    if (!didSubst && trimmedBase === base) return typeParamMap;
    const localMap = new Map(trimmedBase);
    declParams.forEach((p, i) => {
      if (resolvedArgs[i]) localMap.set(typeParamName(p), resolvedArgs[i]);
    });
    return localMap;
  }

  // `Container<string>` -> { T: string }; `Container` with `<T = number[]>` -> { T: Array }
  function buildDefaultTypeParamMap(annotation, scope) {
    const segments = typeRefSegments(annotation);
    if (!segments) return null;
    const declaration = findTypeDeclaration(segments, scope);
    if (!declaration) return null;
    const declParams = declaration.typeParameters?.params;
    if (!declParams?.length) return null;
    const callArgs = getTypeArgs(annotation)?.params;
    // `<T, U = T[]>`: U sees already-resolved T from earlier iterations
    let map = null;
    for (let i = 0; i < declParams.length; i++) {
      const arg = callArgs?.[i] ?? declParams[i].default;
      if (!arg) continue;
      const resolved = map
        ? substituteTypeParams(arg, map, scope, 0)
        : resolveTypeAnnotation(arg, scope);
      if (resolved) {
        map ??= new Map();
        map.set(typeParamName(declParams[i]), resolved);
      }
    }
    return map;
  }

  // resolve a single interface extends clause:
  //   - bare `interface I extends Base` (Identifier) -> existing direct lookup
  //   - namespaced `interface I extends NS.Base` (TSQualifiedName in babel,
  //     MemberExpression in oxc) -> decompose to segments, walk findTypeDeclaration's
  //     array-form path to locate the parent interface, recurse with its declaration scope
  // without the qualified branch, namespace extends bails to Object hint and member
  // dispatch loses the parent's structural members
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
    // honours nested module paths. previously segments.at(-1) could match an unrelated
    // sibling-scope declaration sharing the same short name
    const parentDecl = findTypeDeclaration(segments, scope);
    if (!parentDecl || !isInterfaceDeclaration(parentDecl)) return null;
    return resolveUserDefinedType({
      name: segments, node: parent, scope: parentDecl.scope ?? scope, depth: depth + 1, typeParamMap, seen: visited,
    });
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
          const result = resolveInterfaceExtendsParent({ parent, scope, resolve, depth, typeParamMap, visited });
          if (result) return result;
        }
        if (cycleFlipped()) return null;
      }
      return new $Object('Object');
    }
    // class as a type: walk `extends` for known container (`Array<T>`) or user parent.
    // cyclic class extends should NOT fall back to `$Object('Object')` - that masquerades
    // as a concrete type and suppresses the generic polyfill plugin emits for unknowable
    // receivers. mirrors the interface-branch cycle handling above
    if (isClassLikeDeclaration(declaration)) {
      const superClass = declaration.superClass ?? declaration.extends?.[0]?.id;
      const superName = extendsClauseName(superClass, scope);
      if (!superName) return new $Object('Object');
      const parentRef = {
        type: 'TSTypeReference',
        typeName: { type: 'Identifier', name: superName },
        typeParameters: getSuperTypeArgs(declaration),
      };
      const ctor = resolveKnownConstructor(superName);
      if (ctor) return resolveKnownContainerType({ name: superName, base: ctor, node: parentRef, innerResolver: resolve }) || ctor;
      const cycleFlipped = cycleFlipDetector(visited);
      const result = resolveUserDefinedType({
        name: superName, node: parentRef, scope, depth: depth + 1, typeParamMap, seen: visited,
      });
      if (result) return result;
      if (cycleFlipped()) return null;
      return new $Object('Object');
    }
    return null;
  }

  // build {paramName -> argNode} from explicit usage args, falling back to decl param defaults
  // builds an AST-valued substitution map: `Map<string, ASTNode>` keyed by declParam
  // name. values are RAW AST nodes (TSTypeReference / TSArrayType / etc.) ready to be
  // spliced into a deep-cloned tree by `applyAliasSubstDeep`. distinct from
  // `resolveTypeArgs` which builds Type-object-valued binding maps for `substituteTypeParams`
  function buildSubstMap(declParams, usageArgs) {
    if (!declParams?.length) return null;
    const subst = new Map();
    for (let i = 0; i < declParams.length; i++) {
      const arg = usageArgs?.[i] ?? declParams[i].default;
      if (arg) subst.set(typeParamName(declParams[i]), arg);
    }
    return subst.size ? subst : null;
  }

  // parent interface ref (`Container<string>`) -> Map<declParam, argNode>
  function buildParentSubst(parentRef, scope) {
    const segments = typeRefSegments(parentRef);
    const decl = segments ? findTypeDeclaration(segments, scope) : null;
    if (!isInterfaceDeclaration(decl) && !isTypeAlias(decl)) return null;
    return buildSubstMap(decl.typeParameters?.params, getTypeArgs(parentRef)?.params);
  }

  return {
    resolveUserDefinedType,
    buildSubstMap,
    buildParentSubst,
    buildDefaultTypeParamMap,
  };
}
