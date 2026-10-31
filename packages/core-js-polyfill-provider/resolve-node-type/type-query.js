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
//   typeofSource(param, scope)                 - TSTypeQuery -> { annotation, scope } | { literal } | null
//   declaredTypeofTarget(node, scope)          - a query spelling a type -> { node: that type, scope }
//   resolveReturnTypeFromTypeQuery(param, scope) - `ReturnType<typeof fn>` resolution
//
// Service object is heavy (~20 entries) but the deps are pure factory function decls
// (hoisted) and upstream cluster outputs; no late binding needed
import { STATEMENT_LIST_HOST_TYPES, TRANSPARENT_EXPR_WRAPPER_TYPES } from '../helpers/ast-patterns.js';
import { $Object, MAX_DEPTH } from './base.js';
import { TS_UNKNOWN_TYPE, collectQualifiedSegments, isConstAssertionType } from './ast-shapes.js';
import { isAmbientClassNode, isAmbientFunctionNode, isAmbientFunctionOrClassNode } from './name-resolution.js';

// nearest ancestor holding `path` in a statement LIST - the unit an overload set lives in.
// climbs past `export declare function` wrappers, which sit between the declaration and its list
function statementContainer(path) {
  let p = path?.parentPath;
  while (p?.node && !STATEMENT_LIST_HOST_TYPES.has(p.node.type)) p = p.parentPath;
  return p?.node ?? null;
}

// getter/setter members carry `kind` 'get'/'set' (a plain method is 'method'): a `typeof obj.accessor`
// reads the accessor's RETURN value, not the function, so callers must not resolve it as a method
function isAccessorKind(node) {
  return node?.kind === 'get' || node?.kind === 'set';
}

export function createTypeQuery({
  t,
  constantBindingPath,
  bindingDeclaratorPath,
  findAllEnumDeclarations,
  enumIsNearestValue,
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
  annotationAtKeyPath,
  bindingDestructuringPattern,
  resolveReturnType,
  unwrapTypeAnnotation,
  applyAliasSubstDeep,
  buildCallSiteSubst,
  shadowedAliasReturnAnnotation,
  foldUnionArmTypes,
}) {
  // resolve `typeof variable` to a type - shared by TS TSTypeQuery and Flow TypeofTypeAnnotation.
  // `depth` is the caller's remaining budget: a `typeof` annotation can name the very binding it
  // annotates (`declare const a: typeof a`), and the only bound on that loop is the budget the
  // annotation lane carries - restarting it at 0 here made the recursion unbounded
  function resolveTypeofBinding(name, scope, depth = 0) {
    // `typeof Enum` (alone in annotation) - enum's runtime value is the enum object itself.
    // TSEnumDeclaration has no typeAnnotation slot, so treat it as $Object('Object') for
    // downstream member inference - but only when a nearer value binding doesn't shadow it. the
    // shadow test needs the binding SCOPE only, so use the const-agnostic lookup (a reassigned
    // `let Enum` shadows too)
    if (enumIsNearestValue(name, scope, bindingDeclaratorPath(name, scope))) return new $Object('Object');
    // a declared or asserted type is the one `typeof` names, a reassigned binding's included - the
    // value it holds is read only where nothing spells one
    const source = bindingTypeofSource(name, scope);
    if (source?.annotation) return resolveTypeAnnotation(source.annotation, source.scope, depth + 1);
    const bindingPath = constantBindingPath(name, scope);
    if (!bindingPath) return null;
    if (t.isVariableDeclarator(bindingPath.node)) {
      const init = bindingPath.get('init');
      if (init.node) return resolveNodeType(init);
    } else {
      const annotation = findBindingAnnotation(bindingPath);
      if (annotation) return resolveTypeAnnotation(annotation, scope, depth + 1);
    }
    if (isFunctionOrClassDeclaration(bindingPath.node)) return new $Object('Function');
    return null;
  }

  // `typeof obj.prop[.prop...]` - resolve a qualified member chain from a binding. walks
  // the chain through nested ObjectExpression / ArrayExpression init via the shared
  // `resolveObjectMemberPath` helper (also used for destructure-key walks); class
  // declarations dispatch to `resolveClassMember` for the (single-step) static member case;
  // other shapes fall through to the binding's type annotation
  function resolveTypeofQualifiedMember(objectName, memberPath, scope, depth = 0) {
    // `typeof Enum.Member` - map the member to the enum's value kind ($Primitive('string'|
    // 'number')), but only when a nearer value binding doesn't shadow the enum head. const-agnostic
    // lookup: the shadow needs only the binding scope, and a reassigned `let Enum` shadows too
    const bindingPath = bindingDeclaratorPath(objectName, scope);
    // TS merges enum blocks, so a member may live in any block - search them all
    if (memberPath.length === 1 && enumIsNearestValue(objectName, scope, bindingPath)) {
      const type = resolveEnumMemberType(findAllEnumDeclarations(objectName, scope), memberPath[0]);
      if (type) return type;
    } else if (memberPath.length > 1) {
      // namespaced `typeof NS.E.Member` - findAllEnumDeclarations walks the namespace segments to
      // the enum blocks; map the trailing segment as the enum member
      const enumSegments = [objectName, ...memberPath.slice(0, -1)];
      const type = resolveEnumMemberType(findAllEnumDeclarations(enumSegments, scope), memberPath.at(-1));
      if (type) return type;
    }
    if (!memberPath.length) return null;
    // TS `declare class K` has no runtime value binding on Babel (estree-toolkit binds it
    // regardless), so `typeof K.static` anchors through the ambient-declaration index - otherwise
    // static-member resolution diverges across parsers. mirrors the annotation-family path in
    // `findTypeQueryFunctionType`, which already resolves an ambient class static via `findClassMember`
    if (!bindingPath) {
      const ambientClass = findAmbientDeclarationPath(objectName, scope, isAmbientFunctionOrClassNode);
      return ambientClass && t.isClass(ambientClass.node) && memberPath.length === 1
        ? resolveClassMember({ classPath: ambientClass, name: memberPath[0], isStatic: true })
        : null;
    }
    // a step declared or asserted with a type is read through that type, not the value it holds
    const source = typeofPathSource([objectName, ...memberPath], scope);
    if (source?.annotation) {
      return source.keys.length ? resolveAnnotatedMemberPath(source.annotation, source.keys, source.scope, depth)
        : resolveTypeAnnotation(source.annotation, source.scope, depth + 1);
    }
    // the init is the binding's value only while nothing reassigns it - `let o = { x: [1] };
    // o = { x: 's' }` would otherwise read `typeof o.x` off the FIRST init and hand a runtime
    // string an array-specific helper. mirrors `resolveTypeofBinding`'s split: const-only for
    // VALUE reads, const-agnostic for the declared annotation below (TS reads the annotation,
    // not the narrowed value, and reassignment cannot change it)
    const constPath = constantBindingPath(objectName, scope);
    const initPath = t.isVariableDeclarator(constPath?.node) ? constPath.get('init')
      : (t.isClassDeclaration(constPath?.node) || isAmbientClassNode(constPath?.node)) ? constPath : null;
    if (initPath?.node) {
      const resolved = t.isVariableDeclarator(constPath.node)
        ? resolveRuntimeExpression(initPath) : initPath;
      // class static: `class K {static x...}; typeof K.x` or aliased `const C = K; typeof C.x` -
      // class members aren't ObjectProperties, dispatch through the class-aware resolver.
      // single-level only (`typeof K.x.y` would need recursive class-member-init descent). an
      // unannotated field is typed by the value it holds: one asserted to a wider union keeps its own
      // family (an accepted boundary, as an unannotated function's return)
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
    return annotation ? resolveAnnotatedMemberPath(annotation, memberPath, scope, depth) : null;
  }

  // shared dispatch for `typeof X` and `typeof X.Y[.Z...]` - segments is what
  // collectQualifiedSegments returns for TS `TSQualifiedName` or Flow `QualifiedTypeIdentifier`
  function resolveTypeofFromSegments(segments, scope, depth = 0) {
    if (!segments?.length) return null;
    const [rootName, ...chain] = segments;
    return chain.length
      ? resolveTypeofQualifiedMember(rootName, chain, scope, depth)
      : resolveTypeofBinding(rootName, scope, depth);
  }

  function resolveTypeQuery(node, scope, depth = 0) {
    return resolveTypeofFromSegments(collectQualifiedSegments(node.exprName), scope, depth);
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
      // a plain method's `typeof obj.m` IS the function; a getter/setter access resolves to the getter's
      // RETURN value (or undefined), NOT the function - returning the fn over-resolves to a wrong Function
      // type (throwing Maybe). bail to generic (bias-safe) rather than mistype the accessor
      if (t.isObjectMethod(property.node)) return isAccessorKind(property.node) ? null : methodFnPath(property);
    }
    if (t.isClass(containerPath.node)) {
      const found = findClassMember({ classPath: containerPath, name, isStatic: true });
      if (!found) return null;
      const { member } = found;
      if (t.isClassMethod(member.node)) return isAccessorKind(member.node) ? null : methodFnPath(member);
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

  // what a `typeof` query is read from: the source its path spells, `{ annotation, scope }` with the
  // annotation read at the full path - `unknown` where the declared type names no such member
  function typeofSource(param, scope) {
    const source = typeofPathSource(collectQualifiedSegments(param.exprName), scope);
    if (!source?.keys?.length) return source;
    const annotation = unwrapTypeAnnotation(annotationAtKeyPath(source.annotation, source.keys, source.scope));
    return { annotation: annotation ?? TS_UNKNOWN_TYPE, keys: [], scope: source.scope };
  }

  // the node a `typeof` query names once each query whose path spells a type gives way to that type -
  // through queries naming queries (`const K: typeof Base`, `X as typeof Y`) - with the scope to read
  // it in. a query naming a value comes back as it is, for the runtime lane
  function declaredTypeofTarget(node, scope) {
    let target = { node, scope };
    for (let hops = 0; target.node?.type === 'TSTypeQuery' && hops < MAX_DEPTH; hops++) {
      const source = typeofSource(target.node, target.scope);
      if (!source?.annotation) break;
      target = { node: source.annotation, scope: source.scope };
    }
    return target;
  }

  // `typeof X.k1...kn` walks what its source spells, in the precedence `resolveTypeofBinding` reads a
  // binding with: TS reads a declared type, not the value. the first step declared or asserted with a
  // type answers for the rest of the path - `{ annotation, keys, scope }`, `keys` the members still to
  // read off it. a path ending on an object literal is `{ literal }`; null where the path spells no type
  // (an enum, a function or class, a method or accessor step, any other value), whose own type is then
  // the one the query names - an accessor's the value it returns, as an unannotated function's is
  function typeofPathSource(segments, scope) {
    let source = segments?.length ? bindingTypeofSource(segments[0], scope) : null;
    let step = 1;
    while (source?.literal && step < segments.length) {
      const property = findObjectMember(source.literal, segments[step++]);
      source = t.isObjectProperty(property?.node) ? expressionTypeofSource(property.get('value')) : null;
    }
    return source?.annotation ? { ...source, keys: segments.slice(step) } : source;
  }

  // a binding's declared annotation, else its initializer's - either is the type whether or not the
  // binding is reassigned, as every write must conform to it. a destructured name is `unknown` here: its
  // declaration types and initializes the whole pattern, which must not answer for the name
  function bindingTypeofSource(name, scope, depth = 0) {
    const declPath = bindingDeclaratorPath(name, scope);
    if (!declPath || enumIsNearestValue(name, scope, declPath)) return null;
    if (bindingDestructuringPattern(declPath.node)) return { annotation: TS_UNKNOWN_TYPE, scope: declPath.scope };
    if (!t.isVariableDeclarator(declPath.node)) return null;
    const annotation = declPath.node.id?.typeAnnotation;
    if (annotation) return { annotation: unwrapTypeAnnotation(annotation), scope: declPath.scope };
    return expressionTypeofSource(declPath.get('init'), depth);
  }

  // an expression's: an assertion's type unless it is `as const`, an object literal's own properties, or
  // the source of the binding an identifier names - `const a = b; const b = a` names itself, which the
  // depth bound ends. parens, `!` and an instantiation keep the type of what they wrap, and `satisfies`
  // checks it against one without taking it
  function expressionTypeofSource(path, depth = 0) {
    let init = path;
    while (TRANSPARENT_EXPR_WRAPPER_TYPES.has(init.node?.type)) {
      const asserted = init.node.type === 'TSSatisfiesExpression' ? null : unwrapTypeAnnotation(init.node.typeAnnotation);
      if (asserted && !isConstAssertionType(asserted)) return { annotation: asserted, scope: init.scope };
      init = init.get('expression');
    }
    if (t.isObjectExpression(init.node)) return { literal: init };
    return t.isIdentifier(init.node) && depth < MAX_DEPTH
      ? bindingTypeofSource(init.node.name, init.scope, depth + 1) : null;
  }

  function resolveTypeQueryBinding(param, scope) {
    if (param.type !== 'TSTypeQuery') return null;
    const segments = collectQualifiedSegments(param.exprName);
    // a path spelling a type names THAT type, which no runtime value stands for
    if (!segments?.length || typeofPathSource(segments, scope)?.annotation) return null;
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
    // TSDeclareMethod / ClassMethod node reaches the return extraction with its
    // return-type slot intact. without this, the annotation fallback below finds no binding
    // annotation on the class and returns null, costing return-type narrowing for
    // `ReturnType<typeof X.method>`
    if ((t.isClassDeclaration(binding.node) || isAmbientClassNode(binding.node)) && path.length === 1) {
      const found = findClassMember({ classPath: binding, name: path[0], isStatic: true });
      // an accessor is a VALUE read, not a callable: handing the getter node to the
      // function-type extractor would return its value type V where TS says
      // `ReturnType<typeof X.getter>` = `ReturnType<V>` - bail like the other
      // typeof-family member sites do on accessor kinds
      if (found?.member?.node && !isAccessorKind(found.member.node)) {
        const member = found.member.node;
        return { type: member.type === 'ObjectTypeProperty' ? member.value : member, scope: binding.scope };
      }
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
    // an overload set is a run of same-name declarations in ONE statement list. the head walk stops
    // at the first ENCLOSING scope that declares the name, which may be outside the subject - and a
    // same-named declaration nested inside that scope SHADOWS those heads instead of overloading
    // them, so an escaped outer set must not displace the inner subject
    if (statementContainer(overloads[0]) !== statementContainer(resolved)) return resolved;
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
    // a query whose path spells a type returns what that type does
    const { node: query, scope: queryScope } = declaredTypeofTarget(param, scope);
    if (query !== param && query.type !== 'TSTypeQuery') return foldSignatureReturns(query, queryScope, depth);
    const resolved = pickLastAmbientOverload(resolveTypeQueryBinding(query, queryScope), query, queryScope);
    if (isFunctionLike(resolved?.node)) {
      // TS 4.7+ instantiation expression `typeof fn<Args>` carries explicit type-args on
      // the TSTypeQuery itself. when present, fold them into the function's return-type
      // substitution so `Q<number[]>` -> `(): number[]` instead of bare `U`. shared
      // `buildCallSiteSubst` zips fn.typeParameters with param.typeParameters - returns null
      // when either side is empty / missing, in which case we fall back to body inference
      const ret = resolved.node.returnType ?? resolved.node.typeAnnotation;
      const subst = ret && buildCallSiteSubst(resolved.node, query, queryScope);
      // anchor the return-type resolution at the resolved (possibly in-namespace) fn path: a
      // `typeof NS.fn` whose declared return references an IN-NAMESPACE type alias (`(): Local`
      // where `Local` is a sibling in NS) needs NS's module body as the lookup anchor - the
      // recovered path's scope chain doesn't reach it on estree, so `Local` would bail to generic
      if (subst) {
        const substituted = applyAliasSubstDeep(unwrapTypeAnnotation(ret), subst);
        return withLookupPath(resolved, () => resolveTypeAnnotation(substituted, queryScope, depth + 1));
      }
      // an unannotated function is typed by the values it returns: a concrete one asserted to a wider
      // union keeps its own family (an accepted boundary - such a return type is annotated instead)
      return withLookupPath(resolved, () => resolveReturnType(resolved, undefined, undefined, depth));
    }
    if (query?.type !== 'TSTypeQuery') return null;
    // no runtime value stands for the query: the annotation-only path reads what a parameter or an
    // ambient declaration is declared with, qualified names (`typeof NS.fn`) included
    const fnType = findTypeQueryFunctionType(query.exprName, queryScope);
    return fnType ? foldSignatureReturns(fnType.type, fnType.scope, depth) : null;
  }

  // a union of signatures is one value with several shapes - same alternatives fold the call
  // lane uses, so `ReturnType<typeof f>` and `f()` answer alike. each arm returns what
  // `ReturnType<arm>` does, an alias to a signature included
  function foldSignatureReturns(signature, scope, depth) {
    return foldUnionArmTypes(signature, arm => {
      const ret = shadowedAliasReturnAnnotation(arm, scope);
      return ret ? resolveTypeAnnotation(ret, scope, depth + 1) : null;
    });
  }

  return {
    resolveTypeQuery,
    resolveTypeofFromSegments,
    resolveTypeQueryBinding,
    typeofSource,
    declaredTypeofTarget,
    pickLastAmbientOverload,
    resolveReturnTypeFromTypeQuery,
  };
}
