// `typeof X` / `typeof X.Y.Z` resolution. shared by TS `TSTypeQuery` and Flow
// `TypeofTypeAnnotation` annotation positions, plus expression-position typeof through
// `resolveTypeQuery`. handles:
//   - bare-name typeof: enum value -> $Object('Object'), const-bound init -> resolved
//     type, function/class decl -> $Object('Function')
//   - qualified typeof: class static -> resolveClassMember, ObjectExpression/Array chain
//     -> resolveObjectMemberPath, annotation chain -> resolveAnnotatedMemberPath
//   - TSTypeQuery binding (`typeof X` as type) -> runtime path | ambient decl path
//   - `ReturnType<typeof fn>` -> function's return annotation (ambient last-overload picked)
//
// Public surface:
//   resolveTypeQuery(node, scope)              - TSTypeQuery -> resolved Type
//   resolveTypeofFromSegments(segs, scope)     - shared dispatch for bare/qualified forms
//   resolveTypeQueryBinding(param, scope)      - TSTypeQuery -> runtime/ambient path
//   resolveReturnTypeFromTypeQuery(param, scope) - `ReturnType<typeof fn>` resolution
//
// Service object is heavy (~20 entries) but the deps are pure factory function decls
// (hoisted) and upstream cluster outputs; no late binding needed
import { $Object } from './base.js';
import { collectQualifiedSegments } from './ast-shapes.js';
import { isAmbientFunctionNode, isAmbientFunctionOrClassNode } from './name-resolution.js';

export function createTypeQuery({
  t,
  constantBindingPath,
  bindingDeclaratorPath,
  findEnumDeclaration,
  enumIsNearestValue,
  findDeclPathBySegments,
  withLookupPath,
  resolveEnumMemberType,
  isFunctionOrClassDeclaration,
  isFunctionLike,
  findAmbientDeclarationPath,
  findNamespacedFunctionPath,
  findOverloadsForName,
  findTypeMember,
  findBindingAnnotation,
  findObjectMember,
  findClassMember,
  methodFnPath,
  resolveTypeAnnotation,
  resolveNodeType,
  resolveRuntimeExpression,
  resolveClassMember,
  resolveObjectMemberPath,
  resolveAnnotatedMemberPath,
  resolveReturnType,
  unwrapTypeAnnotation,
  applyAliasSubstDeep,
  buildCallSiteSubst,
  functionTypeReturnAnnotation,
}) {
  // resolve `typeof variable` to a type - shared by TS TSTypeQuery and Flow TypeofTypeAnnotation
  function resolveTypeofBinding(name, scope) {
    const bindingPath = constantBindingPath(name, scope);
    // `typeof Enum` (alone in annotation) - enum's runtime value is the enum object itself.
    // TSEnumDeclaration has no typeAnnotation slot, so treat it as $Object('Object') for
    // downstream member inference - but only when a nearer value binding doesn't shadow it. the
    // shadow test needs the binding SCOPE only, so use the const-agnostic lookup (a reassigned
    // `let Enum` shadows too); `bindingPath` below stays const-only for the DECLARED-type reads
    if (enumIsNearestValue(name, scope, bindingDeclaratorPath(name, scope))) return new $Object('Object');
    if (!bindingPath) {
      // a reassigned (non-const) annotated declarator still has a stable DECLARED type for `typeof`
      // (TS reads the annotation, not the narrowed value) - constantBindingPath bails on the
      // reassignment, so look the declarator up regardless of const-ness and resolve its EXPLICIT
      // annotation only (the init is not the type once the binding is reassigned)
      const declPath = bindingDeclaratorPath(name, scope);
      const reassignedAnnotation = t.isVariableDeclarator(declPath?.node) ? declPath.node.id?.typeAnnotation : null;
      return reassignedAnnotation ? resolveTypeAnnotation(reassignedAnnotation, scope) : null;
    }
    if (t.isVariableDeclarator(bindingPath.node)) {
      const annotation = bindingPath.node.id?.typeAnnotation;
      if (annotation) return resolveTypeAnnotation(annotation, scope);
      const init = bindingPath.get('init');
      if (init.node) return resolveNodeType(init);
    } else {
      const annotation = findBindingAnnotation(bindingPath);
      if (annotation) return resolveTypeAnnotation(annotation, scope);
    }
    if (isFunctionOrClassDeclaration(bindingPath.node)) return new $Object('Function');
    return null;
  }

  // `typeof obj.prop[.prop...]` - resolve a qualified member chain from a binding. walks
  // the chain through nested ObjectExpression / ArrayExpression init via the shared
  // `resolveObjectMemberPath` helper (also used for destructure-key walks); class
  // declarations dispatch to `resolveClassMember` for the (single-step) static member case;
  // other shapes fall through to the binding's type annotation
  function resolveTypeofQualifiedMember(objectName, memberPath, scope) {
    // `typeof Enum.Member` - map the member to the enum's value kind ($Primitive('string'|
    // 'number')), but only when a nearer value binding doesn't shadow the enum head. const-agnostic
    // lookup: the shadow needs only the binding scope, and a reassigned `let Enum` shadows too
    const bindingPath = bindingDeclaratorPath(objectName, scope);
    if (memberPath.length === 1 && enumIsNearestValue(objectName, scope, bindingPath)) {
      const type = resolveEnumMemberType(findEnumDeclaration(objectName, scope), memberPath[0]);
      if (type) return type;
    } else if (memberPath.length > 1) {
      // namespaced `typeof NS.E.Member` - traverse namespace segments to the enum decl
      // then map the trailing segment as enum member. `findDeclPathBySegments` returns
      // a NodePath; `.node` carries the TSEnumDeclaration shape
      const enumSegments = [objectName, ...memberPath.slice(0, -1)];
      const declPath = findDeclPathBySegments(enumSegments, scope, decl => decl.type === 'TSEnumDeclaration');
      if (declPath?.node) {
        const type = resolveEnumMemberType(declPath.node, memberPath.at(-1));
        if (type) return type;
      }
    }
    if (!memberPath.length) return null;
    // ambient `declare class K` has no runtime value binding on Babel (estree-toolkit binds it
    // regardless), so `typeof K.static` anchors through the ambient-declaration index - otherwise
    // static-member resolution diverges across parsers. mirrors the annotation-family path in
    // `findTypeQueryFunctionType`, which already resolves an ambient class static via `findClassMember`
    if (!bindingPath) {
      const ambientClass = findAmbientDeclarationPath(objectName, scope, isAmbientFunctionOrClassNode);
      return ambientClass && t.isClass(ambientClass.node) && memberPath.length === 1
        ? resolveClassMember({ classPath: ambientClass, name: memberPath[0], isStatic: true })
        : null;
    }
    const initPath = t.isVariableDeclarator(bindingPath.node) ? bindingPath.get('init')
      : t.isClassDeclaration(bindingPath.node) ? bindingPath : null;
    if (initPath?.node) {
      const resolved = t.isVariableDeclarator(bindingPath.node)
        ? resolveRuntimeExpression(initPath) : initPath;
      // class static: `class K {static x...}; typeof K.x` or aliased `const C = K; typeof C.x` -
      // class members aren't ObjectProperties, dispatch through the class-aware resolver.
      // single-level only (`typeof K.x.y` would need recursive class-member-init descent)
      if (t.isClass(resolved.node) && memberPath.length === 1) {
        const result = resolveClassMember({ classPath: resolved, name: memberPath[0], isStatic: true });
        if (result) return result;
      }
      // ObjectExpression / ArrayExpression chain - shared `resolveObjectMemberPath`
      // walks N-deep through nested literals (also used for destructure-key resolution)
      const result = resolveObjectMemberPath(resolved, memberPath);
      if (result) return result;
    }
    const annotation = findBindingAnnotation(bindingPath);
    return annotation ? resolveAnnotatedMemberPath(annotation, memberPath, scope) : null;
  }

  // shared dispatch for `typeof X` and `typeof X.Y[.Z...]` - segments is what
  // collectQualifiedSegments returns for TS `TSQualifiedName` or Flow `QualifiedTypeIdentifier`
  function resolveTypeofFromSegments(segments, scope) {
    if (!segments?.length) return null;
    const [rootName, ...chain] = segments;
    return chain.length ? resolveTypeofQualifiedMember(rootName, chain, scope) : resolveTypeofBinding(rootName, scope);
  }

  function resolveTypeQuery(node, scope) {
    return resolveTypeofFromSegments(collectQualifiedSegments(node.exprName), scope);
  }

  // resolve a member of an object/class binding to its runtime value path
  function resolveMemberValuePath(bindingPath, name) {
    let containerPath;
    if (t.isVariableDeclarator(bindingPath.node)) {
      containerPath = resolveRuntimeExpression(bindingPath.get('init'));
    } else if (t.isClassDeclaration(bindingPath.node)) {
      containerPath = bindingPath;
    }
    if (!containerPath?.node) return null;
    if (t.isObjectExpression(containerPath.node)) {
      const property = findObjectMember(containerPath, name);
      if (!property) return null;
      if (t.isObjectProperty(property.node)) return resolveRuntimeExpression(property.get('value'));
      if (t.isObjectMethod(property.node)) return methodFnPath(property);
    }
    if (t.isClass(containerPath.node)) {
      const found = findClassMember({ classPath: containerPath, name, isStatic: true });
      if (!found) return null;
      const { member } = found;
      if (t.isClassMethod(member.node)) return methodFnPath(member);
      if (t.isClassProperty(member.node) || t.isClassAccessorProperty(member.node)) {
        const value = member.get('value');
        return value.node ? resolveRuntimeExpression(value) : null;
      }
    }
    return null;
  }

  // root binding for `typeof X` chains: scope binding first, then ambient
  // `declare class/function` (not registered in `scope.bindings` by either parser).
  // shared by the annotation-walk path (`findTypeQueryFunctionType`) and the runtime-path
  // resolver (`resolveBareTypeQueryBinding`)
  function resolveTypeQueryRoot(name, scope) {
    return constantBindingPath(name, scope)
      ?? findAmbientDeclarationPath(name, scope, isAmbientFunctionOrClassNode);
  }

  // bare `typeof X` runtime path: function/class decl returns the binding directly,
  // var declarator drills into its init through `resolveRuntimeExpression` so wrappers
  // (`as` / `satisfies` / `!`) peel and chained references re-bind to their actual value
  function resolveBareTypeQueryBinding(name, scope) {
    const bindingPath = constantBindingPath(name, scope);
    if (!bindingPath) return findAmbientDeclarationPath(name, scope, isAmbientFunctionOrClassNode);
    if (t.isFunctionDeclaration(bindingPath.node) || t.isClassDeclaration(bindingPath.node)) return bindingPath;
    if (t.isVariableDeclarator(bindingPath.node)) {
      const init = bindingPath.get('init');
      return init.node ? resolveRuntimeExpression(init) : null;
    }
    return null;
  }

  function resolveTypeQueryBinding(param, scope) {
    if (param.type !== 'TSTypeQuery') return null;
    const segments = collectQualifiedSegments(param.exprName);
    if (!segments?.length) return null;
    const [rootName, ...path] = segments;
    if (path.length === 0) return resolveBareTypeQueryBinding(rootName, scope);
    // 2-segment runtime member access: `const obj = {fn:...}; typeof obj.fn`. deeper paths
    // through nested ObjectExpression initializers fall through to the namespace branch -
    // runtime-init descent isn't wired here. const+namespace declaration merging also
    // falls through when the value side has no matching member
    if (path.length === 1) {
      const bindingPath = constantBindingPath(rootName, scope);
      if (bindingPath) {
        const memberValue = resolveMemberValuePath(bindingPath, path[0]);
        if (memberValue) return memberValue;
      }
    }
    // namespace path: `namespace NS { declare function fn() }` - babel doesn't bind NS as
    // a value (or has a separate value binding via decl merging). arbitrary-depth qualified
    // names handled here via TSModuleDeclaration scope walk
    return findNamespacedFunctionPath(segments, scope);
  }

  // locate the function-like TYPE that a `typeof X` / `typeof X.Y[.Z...]` annotation points
  // at. `declare const` bindings have no runtime init to resolve - the type lives on the
  // binding's annotation instead. arbitrary-depth qualified names walk the root binding's
  // annotation segment-by-segment via `findTypeMember` (which already handles substitution,
  // union/intersection branches, and returns the member type unwrapped from TSTypeAnnotation).
  // returns {type, scope} or null
  function findTypeQueryFunctionType(exprName, scope) {
    const segments = collectQualifiedSegments(exprName);
    if (!segments?.length) return null;
    const [rootName, ...path] = segments;
    const binding = resolveTypeQueryRoot(rootName, scope);
    if (!binding) return null;
    // class binding direct lookup: `typeof X.method` where X is a class declaration walks
    // the class body for a static member instead of an annotation walk, so the full
    // TSDeclareMethod / ClassMethod node reaches `functionTypeReturnAnnotation` with its
    // return-type slot intact. without this, the annotation fallback below finds no binding
    // annotation on the class and returns null, costing return-type narrowing for
    // `ReturnType<typeof X.method>`
    if (t.isClassDeclaration(binding.node) && path.length === 1) {
      const found = findClassMember({ classPath: binding, name: path[0], isStatic: true });
      if (found?.member?.node) return { type: found.member.node, scope: binding.scope };
    }
    let annotation = unwrapTypeAnnotation(findBindingAnnotation(binding));
    if (!annotation) return null;
    for (const name of path) {
      const member = findTypeMember({ objectType: annotation, key: name, scope: binding.scope });
      if (!member) return null;
      annotation = unwrapTypeAnnotation(member);
      if (!annotation) return null;
    }
    return { type: annotation, scope: binding.scope };
  }

  // legal subjects for `typeof fn` last-head retargeting: an ambient overload head
  // (`TSDeclareFunction`) or a non-ambient `FunctionDeclaration` impl. ambient heads are
  // already overload signatures; the impl path covers the babel TS shape `function fn(x:A):B;
  // function fn(x:C):D; function fn(x:any):any {...}` where the impl is the runtime binding
  // but the preceding heads drive `typeof fn` per TS narrowing rule
  function isRetargetableOverloadSubject(node) {
    return isAmbientFunctionNode(node) || t.isFunctionDeclaration(node);
  }

  // TS resolves `ReturnType<typeof fn>` against the LAST overload signature when `fn` has
  // multiple `declare function` heads; earlier heads are specialized cases, the last is
  // canonical (mirrors `infer R` over an intersection-of-call-signatures, which picks the
  // rightmost). non-ambient `FunctionDeclaration` impl with preceding ambient sibling heads
  // ALSO qualifies (impl's `any`/`null` return is overridden by the last declared head).
  // covers bare and qualified (`typeof NS.fn`) shapes via `findOverloadsForName`
  function pickLastAmbientOverload(resolved, param, scope) {
    if (!resolved) return resolved;
    if (param.type !== 'TSTypeQuery') return resolved;
    if (!isRetargetableOverloadSubject(resolved.node)) return resolved;
    const overloads = findOverloadsForName(collectQualifiedSegments(param.exprName), scope);
    if (!overloads.length) return resolved;
    // ambient head: only retarget when there's a LATER head (count > 1, since `resolved`
    // is itself one of the entries). impl: ANY ambient heads supersede the impl body
    const minHeadsForRetarget = isAmbientFunctionNode(resolved.node) ? 2 : 1;
    return overloads.length >= minHeadsForRetarget ? overloads.at(-1) : resolved;
  }

  // `depth` accumulates across the re-entries below so a self-referential return type
  // (`declare function f(): ReturnType<typeof f>`, or a mutual `a`/`b` pair) hits MAX_DEPTH
  // and bails to generic instead of recursing forever - the return-type resolution chain
  // would otherwise reset depth to 0 on every hop
  function resolveReturnTypeFromTypeQuery(param, scope, depth = 0) {
    const resolved = pickLastAmbientOverload(resolveTypeQueryBinding(param, scope), param, scope);
    if (isFunctionLike(resolved?.node)) {
      // TS 4.7+ instantiation expression `typeof fn<Args>` carries explicit type-args on
      // the TSTypeQuery itself. when present, fold them into the function's return-type
      // substitution so `Q<number[]>` -> `(): number[]` instead of bare `U`. shared
      // `buildCallSiteSubst` zips fn.typeParameters with param.typeParameters - returns null
      // when either side is empty / missing, in which case we fall back to body inference
      const ret = resolved.node.returnType ?? resolved.node.typeAnnotation;
      const subst = ret && buildCallSiteSubst(resolved.node, param, scope);
      // anchor the return-type resolution at the resolved (possibly in-namespace) fn path: a
      // `typeof NS.fn` whose declared return references an IN-NAMESPACE type alias (`(): Local`
      // where `Local` is a sibling in NS) needs NS's module body as the lookup anchor - the
      // recovered path's scope chain doesn't reach it on estree, so `Local` would bail to generic
      if (subst) {
        const substituted = applyAliasSubstDeep(unwrapTypeAnnotation(ret), subst);
        return withLookupPath(resolved, () => resolveTypeAnnotation(substituted, scope, depth + 1));
      }
      return withLookupPath(resolved, () => resolveReturnType(resolved, undefined, undefined, depth));
    }
    if (param?.type !== 'TSTypeQuery') return null;
    // `resolveTypeQueryBinding` returns null for no-init `declare const` shapes; fall back to
    // the annotation-only path which also handles qualified names (`typeof NS.fn`)
    const fnType = findTypeQueryFunctionType(param.exprName, scope);
    const ret = fnType && functionTypeReturnAnnotation(fnType.type);
    return ret ? resolveTypeAnnotation(ret, fnType.scope, depth + 1) : null;
  }

  return {
    resolveTypeQuery,
    resolveTypeofFromSegments,
    resolveTypeQueryBinding,
    pickLastAmbientOverload,
    resolveReturnTypeFromTypeQuery,
  };
}
