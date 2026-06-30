// AST type annotation -> Type object resolution. dispatches on every TS / Flow type-node
// discriminator and folds container shapes (union / intersection / tuple / mapped /
// indexed-access / conditional / TSTypeQuery / utility-type names) into the resolved Type
// object representation `$Object` / `$Primitive`.
//
// Public surface:
//   resolveTypeAnnotation(node, scope, depth=0)   - main entry
//   resolveConstructorType(name, path)            - `new Container<T>()` typed call expression
//   resolveConstructorCallType(name, path)        - `Container<T>(x)` typed call (no `new`)
//
// All other handlers (`resolveNamedType` / `resolveLiteralType` / `resolveConditionalType` /
// `resolveKeyofSelfValueUnion` / `resolveIndexedAccessType` / `resolveKnownContainerType` /
// `resolveExtractExclude` / `isAssignableTo`) are cluster-private. `resolveAnnotationInContext`
// and `resolveNonNullableAnnotation` live in the factory (they're consumed both inside this
// cluster and by awaited cluster) and route into `resolveTypeAnnotation` for the no-subst
// path - factory destructure binds the cluster output by the time those run.
import { $Object, $Primitive, literalNodeValue } from './base.js';
import { isMethodShapeMember, isUnionType, typeRefSegments } from './ast-shapes.js';
import { getTypeArgs, singleQuasiString } from '../helpers/ast-patterns.js';

const { hasOwn } = Object;

export function createTypeAnnotationResolve({
  t,
  babelNodeType,
  evaluateConditionalType,
  isLiteralOf,
  KNOWN_CONSTRUCTORS,
  CONSTRUCTOR_ALIASES,
  PROMISE_SYNONYMS,
  STRUCTURE_PRESERVING_WRAPPERS,
  SINGLE_ELEMENT_COLLECTIONS,
  MAX_DEPTH,
  isAmbientClassNode,
  typeRefSegmentsEqual,
  typeRefName,
  findTypeParameter,
  collectQualifiedSegments,
  unwrapTypeAnnotation,
  safeInnerType,
  followTypeAliasChain,
  applySubst,
  shadowedAliasReturnAnnotation,
  resolveKnownConstructor,
  typeFromHint,
  resolveInnerType,
  effectiveParam,
  resolveParametersParams,
  resolveAnnotationInContext,
  resolveNonNullableAnnotation,
  resolveAwaitedAnnotation,
  resolveReturnTypeFromTypeQuery,
  resolveTypeQueryBinding,
  resolveTypeQuery,
  unwrapPromise,
  resolveTypeofFromSegments,
  resolveClassInheritance,
  resolveUserDefinedType,
  resolveElementType,
  foldUnionTypes,
  foldIntersectionTypes,
  findTypeMember,
  findTupleElement,
  unwrapMappedTypePassthrough,
  tupleAsArrayType,
  getTypeMembers,
}) {
  function isAssignableTo(candidate, target) {
    if (typesEqualLocal(candidate, target)) {
      // matching outer type (e.g. both Array) - require inner distinction for container types
      // so `Extract<Array<number>|Array<string>, Array<string>>` narrows correctly. target with
      // no inner (bare `Array`) accepts any inner (covariant); mismatched inners reject
      if (!target.inner) return true;
      return innersEqualLocal(candidate.inner, target.inner);
    }
    // any non-primitive is assignable to object / Object
    return !candidate.primitive && !target.primitive && (!target.constructor || target.constructor === 'Object');
  }

  // local equality helpers to keep the cluster self-contained. mirrors factory's
  // `typesEqual` / `innersEqual` semantics (referential outer + recursive inner-by-string
  // or inner-by-type)
  function typesEqualLocal(a, b) {
    return a.type === b.type && a.constructor === b.constructor;
  }

  function innersEqualLocal(a, b) {
    if (a === b) return true;
    if (!a || !b) return false;
    if (typeof a === 'string' || typeof b === 'string') return a === b;
    return typesEqualLocal(a, b) && innersEqualLocal(a.inner, b.inner);
  }

  // oxc preserves `(A | B)` as TSParenthesizedType around the union (babel strips during
  // parsing). peel before pattern-matching on TSUnionType, otherwise paren-wrapped unions
  // land in single-member fallback and lose distribution. inline loop (not the factory
  // helper) keeps this cluster's service-object surface stable
  function peelParens(node) {
    while (node?.type === 'TSParenthesizedType') node = node.typeAnnotation;
    return node;
  }

  function resolveExtractExclude({ first, second, scope, depth, keep, typeParamMap, seen }) {
    function resolve(node) {
      return resolveAnnotationInContext({ node, scope, depth, typeParamMap, seen });
    }
    const target = resolve(second);
    if (!target) return null;
    let unwrapped = peelParens(unwrapTypeAnnotation(first));
    if (!unwrapped) return null;
    // capture subst so generic union members (`type Foo<T> = T | string`) keep their bindings.
    // alias targets may themselves be paren-wrapped (`type Mixed = (A | B)`); peel again
    const { node: aliasTarget, subst } = followTypeAliasChain(unwrapped, scope);
    if (aliasTarget) unwrapped = peelParens(aliasTarget);
    if (!unwrapped) return null;
    const types = isUnionType(unwrapped) ? unwrapped.types : [unwrapped];
    let result = null;
    let anyKept = false;
    for (const member of types) {
      const substituted = applySubst(member, subst);
      const resolved = resolve(substituted);
      if (!resolved) return null;
      // `never` is the union identity (`T | never == T`): it contributes no real receiver and
      // mismatches in `commonTypeLocal`, bailing the whole Extract/Exclude result. skip it before
      // the assignability fold (mirrors union folding), so the surviving members still resolve
      if (resolved.primitive && resolved.type === 'never') continue;
      if (isAssignableTo(resolved, target) !== keep) continue;
      anyKept = true;
      result = commonTypeLocal(result, resolved);
      if (!result) return null;
    }
    // all members excluded -> never (not null/unknown)
    if (!anyKept) return new $Primitive('never');
    return result;
  }

  // local commonType to avoid pulling another factory dep; mirrors factory's `commonType`
  function commonTypeLocal(existing, incoming) {
    if (!existing) return incoming;
    if (!typesEqualLocal(existing, incoming)) return null;
    if (existing.primitive || innersEqualLocal(existing.inner, incoming.inner)) return existing;
    return new $Object(existing.constructor);
  }

  function resolveKnownContainerType({ name, base, node, innerResolver }) {
    if (!base) return null;
    if (!SINGLE_ELEMENT_COLLECTIONS.has(name) && name !== 'Promise') return base;
    const firstArg = getTypeArgs(node)?.params?.[0];
    if (firstArg) {
      const inner = safeInnerType(innerResolver(firstArg));
      if (inner) return new $Object(base.constructor, inner);
    }
    return base;
  }

  function resolveConstructorType(name, path) {
    return resolveKnownContainerType({
      name, base: resolveKnownConstructor(name), node: path.node, innerResolver: p => resolveTypeAnnotation(p, path.scope),
    });
  }

  function resolveConstructorCallType(name, path) {
    if (!hasOwn(KNOWN_CONSTRUCTORS, name)) return null;
    const callResult = typeFromHint(KNOWN_CONSTRUCTORS[name].call);
    if (callResult.primitive) return callResult;
    return resolveKnownContainerType({ name, base: callResult, node: path.node, innerResolver: p => resolveTypeAnnotation(p, path.scope) });
  }

  function resolveNamedType({ name, node, scope, depth, typeParamMap, seen }) {
    // PromiseLike / Thenable are structural Promise supertypes for await / Awaited<>;
    // aliasing upfront lets the Promise branch of resolveKnownContainerType handle both
    if (PROMISE_SYNONYMS.has(name)) name = 'Promise';
    if (hasOwn(CONSTRUCTOR_ALIASES, name)) name = CONSTRUCTOR_ALIASES[name];
    function resolveArgInner(arg) {
      return resolveAnnotationInContext({ node: arg, scope, depth, typeParamMap, seen });
    }
    const known = resolveKnownContainerType({ name, base: resolveKnownConstructor(name), node, innerResolver: resolveArgInner });
    if (known) return known;
    function firstArg() {
      return getTypeArgs(node)?.params[0];
    }
    function resolveArg(arg, fallback) {
      return arg
        ? resolveArgInner(arg) ?? fallback
        : null;
    }
    // structure-preserving wrappers (T[] stays array, {..} stays object). null fallback
    // to $Object('Object') keeps arg-type=object filters firing for TSTypeLiteral inners
    if (STRUCTURE_PRESERVING_WRAPPERS.has(name)) return resolveArg(firstArg(), new $Object('Object'));
    switch (name) {
      // structurally new shape from their type parameter - collapse to Object
      case 'Record':
      case '$Shape':
      case '$Diff':
      case '$Rest':
      case '$ObjMap':
      case '$ObjMapi':
      case '$ObjMapConst':
        return new $Object('Object');
      case 'Parameters':
      case 'ConstructorParameters': {
        // tuple approximated as Array<first-param-type> so chained `.at(0)` / `.forEach`
        // resolve; indexed access `T[N]` picks the N-th via `findTupleElement`
        const { param, isRest } = effectiveParam(resolveParametersParams(node, scope)?.[0]);
        const resolved = param?.typeAnnotation ? resolveArgInner(param.typeAnnotation) : null;
        // `...xs: T[]` - annotation is `T[]`, the tuple element is T
        const inner = safeInnerType(isRest ? resolveInnerType(resolved) : resolved);
        return new $Object('Array', inner);
      }
      // Flow: $Keys
      case 'Uppercase':
      case 'Lowercase':
      case 'Capitalize':
      case 'Uncapitalize':
      case '$Keys':
        return new $Primitive('string');
      // intent collapse for the TS-built-in `this`-utility names: ThisParameterType<F>
      // -> arbitrary object, OmitThisParameter<F> -> callable. precision-only - all
      // Object/Function instance methods are stable in our supported targets so no
      // polyfill path currently distinguishes these from a null fall-through to
      // resolveUserDefinedType. case retained so future polyfills on Object.prototype /
      // Function.prototype don't silently route through resolveUserDefinedType (which
      // returns null for built-in names with no in-scope decl)
      case 'ThisParameterType':
        return new $Object('Object');
      case 'OmitThisParameter':
        return new $Object('Function');
      // TS lib alias for `string | number | symbol`; no shared polyfill API, null lets
      // downstream fall back to generic-instance emission
      case 'PropertyKey':
        return null;
      // transparent wrappers resolving type parameter. Flow: $Exact
      case 'NoInfer':
      case '$Exact':
        return resolveArg(firstArg(), null);
      // resolve type parameter, strip nullable/never. Flow: $NonMaybeType
      case 'NonNullable':
      case '$NonMaybeType': {
        const arg = firstArg();
        return arg ? resolveNonNullableAnnotation({ node: arg, scope, depth, typeParamMap, seen }) : null;
      }
      case 'Awaited': {
        const arg = firstArg();
        if (!arg) return null;
        // `Awaited<typeof X>`: resolve X's type, then await it (Promise<T> -> T, non-Promise ->
        // itself). resolveAwaitedAnnotation peels annotation shapes but has no TSTypeQuery step,
        // so route the typeof through resolveTypeQuery here, mirroring the ReturnType case
        if (arg.type === 'TSTypeQuery') {
          const queried = resolveTypeQuery(arg, scope);
          return queried ? unwrapPromise(queried) : null;
        }
        return resolveAwaitedAnnotation({ node: arg, scope, depth, typeParamMap, seen });
      }
      case 'ReturnType': {
        const arg = firstArg();
        if (!arg) return null;
        // TSTypeQuery (`ReturnType<typeof fn>`) routes through runtime-binding lookup.
        // direct function type alias (`type Fn = () => T; ReturnType<Fn>`) has no typeof -
        // follow the alias chain, extract return annotation, fold accumulated subst into it
        // (mirrors Awaited / Extract / findTupleElement)
        if (arg.type === 'TSTypeQuery') return resolveReturnTypeFromTypeQuery(arg, scope, depth);
        // direct function type alias (`type Fn = () => T; ReturnType<Fn>`): extract + shadow the signature-
        // local `<T>` + fold the alias subst, then resolve (shared with the getTypeMembers mirror branch)
        const target = shadowedAliasReturnAnnotation(arg, scope);
        return target ? resolveTypeAnnotation(target, scope, depth + 1) : null;
      }
      case 'InstanceType': {
        const arg = firstArg();
        const resolved = arg ? resolveTypeQueryBinding(arg, scope) : null;
        if (!(t.isClass(resolved?.node) || isAmbientClassNode(resolved?.node))) return null;
        return resolveClassInheritance(resolved) || new $Object('Object');
      }
      case 'Extract':
      case 'Exclude': {
        const params = getTypeArgs(node)?.params;
        return params?.length >= 2
          ? resolveExtractExclude({
            first: params[0], second: params[1], scope, depth, keep: name === 'Extract', typeParamMap, seen,
          }) : null;
      }
      // Flow $ReadOnlyArray<T> -> Array with inner type (equivalent to ReadonlyArray<T>)
      case '$ReadOnlyArray': {
        const arg = firstArg();
        return new $Object('Array', arg ? resolveNonNullableAnnotation({ node: arg, scope, depth, typeParamMap, seen }) : null);
      }
      // conservative: unknown for Flow variants we don't model structurally
      case '$Values':
      case '$ElementType':
      case '$PropertyType':
      case '$Call':
        return null;
    }
    return resolveUserDefinedType({ name, node, scope, depth, seen });
  }

  // TS literal types: 'hello', 42, true, etc.
  function resolveLiteralType(node) {
    if (!node.literal) return null;
    const { literal } = node;
    switch (babelNodeType(literal)) {
      // TemplateLiteral has no single static value - widen to `string` with no literal stamp
      case 'TemplateLiteral':
        return new $Primitive('string');
      case 'StringLiteral':
        return new $Primitive('string', literal.value);
      case 'NumericLiteral':
        return new $Primitive('number', literal.value);
      case 'BooleanLiteral':
        return new $Primitive('boolean', literal.value);
      case 'BigIntLiteral':
        // canonical real-BigInt stamp (babel `.value` is a digit string); the stamp is compared by
        // strict equality in the conditional-branch picker, so distinct magnitudes stay disjoint
        return new $Primitive('bigint', literalNodeValue(literal));
      // signed-numeric literal types: `-1` / `-1n` wrap UnaryExpression around the magnitude. the
      // shared extractor returns a real BigInt for a bigint argument and a number otherwise, so each
      // family carries a value-distinct stamp (a dropped bigint stamp collapsed `-2n`/`-1n` to one wide
      // bigint and mis-picked `N extends -1n`)
      case 'UnaryExpression':
        return new $Primitive(isLiteralOf(literal.argument, 'BigInt') ? 'bigint' : 'number', literalNodeValue(literal));
    }
    return null;
  }

  // TS conditional type: T extends U ? X : Y - resolve if both branches have the same
  // type, or one is `never`. `T extends (infer U)[] ? U : never` with T already substituted
  // (via alias-chain) is the canonical element-extraction shape: trueType references the
  // inferred name, falseType is never-like. match first so `First<string[]>` resolves to
  // `string` instead of collapsing through the generic branches (which can't resolve the
  // naked `U` reference)
  // a non-reducing conditional folds BOTH branches; N nested aliased conditionals expand a binary
  // tree of 2^N branch resolutions, because each sibling branch re-hops to the same downstream
  // conditional and `resolveCache` (keyed at the resolveNodeType entry) is bypassed by the
  // resolveTypeAnnotation branch recursion. memoize each conditional's result per (node, scope) -
  // collapsing the tree to O(distinct subterms) - so a single polyfillable call on a receiver
  // typed by deep distributive conditionals can't wedge the transform. depth is a recursion-safety
  // cutoff only; the resolved result is a pure function of (node, scope) below MAX_DEPTH. WeakMap on
  // the AST node auto-evicts across files (fresh AST per file); also cleared in reset()
  let conditionalResultCache = new WeakMap();

  function resolveConditionalType(node, scope, depth) {
    let byScope = conditionalResultCache.get(node);
    const cached = byScope?.get(scope);
    // a `stable` result is depth-independent - it came from the infer pattern or from BOTH branches
    // resolving, so it is reused regardless of remaining budget. an unstable result (a lenient
    // single-branch fold or a null) may be a depth-cutoff artifact - the deepest branch-path hits
    // MAX_DEPTH first - so it is reused only when the current call has no more budget than the
    // cached one (depth >= cached.depth); a shallower reach has more budget and recomputes
    if (cached && (cached.stable || depth >= cached.depth)) return cached.result;
    // route through the canonical conditional evaluator: it runs the structural branch pick
    // (pickConditionalBranchVia) before the both-branch fold - the local re-implementation
    // folded BOTH branches even when the conditional decidably fires to a single one (wrong
    // branch leaked when the other resolved to never / null)
    const result = evaluateConditionalType(node, null, scope, depth, null);
    // the canonical evaluator does not report which path produced the result, so entries stay
    // depth-guarded: reused only by calls with no more budget than they were computed with
    if (!byScope) conditionalResultCache.set(node, byScope = new Map());
    byScope.set(scope, { result, depth, stable: false });
    return result;
  }

  // does `idx` (the indexType of `T[idx]`) collapse to `keyof T` against `target`?
  //   - direct `keyof T` operator
  //   - generic-constrained ref `K` where K's TypeParameter declaration constrains to
  //     `keyof T` on the same target. `function f<T, K extends keyof T>(o: T, k: K)
  //     { return o[k]; }` routes through this second branch
  function isKeyofTargeting(idx, target, scope) {
    if (idx?.type === 'TSTypeOperator' && idx.operator === 'keyof'
      && typeRefSegmentsEqual(idx.typeAnnotation, target)) return true;
    if (idx?.type !== 'TSTypeReference') return false;
    const name = typeRefName(idx);
    if (!name) return false;
    const param = findTypeParameter(name, scope);
    return param?.constraint?.type === 'TSTypeOperator'
      && param.constraint.operator === 'keyof'
      && typeRefSegmentsEqual(param.constraint.typeAnnotation, target);
  }

  // TS indexed access type: Config["items"], [string, number[]][1], Items[number], Dict[string]
  // `T[keyof T]` shape: fold each property's value annotation into a union (mirrors TS
  // evaluation). returns resolved Type / null on hit, undefined when shape doesn't match.
  // `objectType` is the caller's already-paren-peeled operand: the `isKeyofTargeting` self-match
  // compares the keyof operand against it, so an unpeeled `(T)` wrapper would fail the match
  function resolveKeyofSelfValueUnion(node, objectType, scope, depth) {
    if (!isKeyofTargeting(node.indexType, objectType, scope)) return undefined;
    const members = getTypeMembers({ objectType, scope });
    if (!members) return null;
    const valueAnnotations = members
      // a (non-getter) method's value is a Function with no instance-method narrow, not its return
      // type - mirrors the single-key `T['method']` path. getters / property signatures contribute
      // their value / return type as usual
      .filter(m => !(isMethodShapeMember(m.type) && m.kind !== 'get'))
      .map(m => m.typeAnnotation ?? m.returnType)
      .filter(Boolean);
    if (!valueAnnotations.length) return null;
    return foldUnionTypes(valueAnnotations, p => resolveTypeAnnotation(p, scope, depth + 1));
  }

  function resolveIndexedAccessType(node, scope, depth) {
    // peel a parenthesized object operand once (`(T)['a']`, `([A,B])[0]`, `({[k:string]:V})[string]`):
    // both parsers keep `(T)` as TSParenthesizedType in type position, and the member / tuple /
    // index-sig helpers below would otherwise see the wrapper and bail to null
    const objectType = peelParens(node.objectType);
    // T[number] - element type of array/tuple
    if (node.indexType?.type === 'TSNumberKeyword') return resolveElementType(objectType, scope, depth + 1);
    // T[string] - string index signature type
    if (node.indexType?.type === 'TSStringKeyword') {
      const members = getTypeMembers({ objectType, scope });
      if (members) for (const member of members) {
        if (member.type === 'TSIndexSignature' && member.typeAnnotation
          && member.parameters?.[0]?.typeAnnotation?.typeAnnotation?.type === 'TSStringKeyword') {
          return resolveTypeAnnotation(member.typeAnnotation, scope, depth + 1);
        }
      }
      return null;
    }
    // `T[keyof T]` self-indexed access folds to value-union of T's properties.
    // delegated to helper to keep dispatcher under max-statements lint
    const keyofSelf = resolveKeyofSelfValueUnion(node, objectType, scope, depth);
    if (keyofSelf !== undefined) return keyofSelf;
    // `T['a' | 'b']` - union of literal indices. fold each branch back through this same
    // resolver (each with one TSLiteralType indexType); `foldUnionTypes` aggregates to the
    // widest common type, handing us precise inference when all branches agree
    if (node.indexType?.type === 'TSUnionType') {
      return foldUnionTypes(node.indexType.types, branch => resolveTypeAnnotation(
        { type: 'TSIndexedAccessType', objectType, indexType: branch },
        scope,
        depth + 1,
      ));
    }
    // template-literal type index `T[\`foo\`]` without interpolations is equivalent to
    // `T['foo']` - TS-level evaluation of the template yields a plain string literal.
    // interpolations (`T[\`_${K}\`]`) would require compile-time type-string computation
    // (mapped-type renamers like `as \`_${K & string}\``); conservative bail for now.
    // TS wraps template literals in TSLiteralType { literal: TemplateLiteral }; unwrap first
    const literalIndex = node.indexType?.type === 'TSLiteralType' ? node.indexType.literal : node.indexType;
    const quasi = singleQuasiString(literalIndex);
    if (quasi !== null) {
      const member = findTypeMember({ objectType, key: quasi, scope });
      return member ? resolveTypeAnnotation(member, scope, depth + 1) : null;
    }
    if (node.indexType?.type !== 'TSLiteralType') return null;
    const { literal } = node.indexType;
    let member;
    if (isLiteralOf(literal, 'String')) member = findTypeMember({ objectType, key: literal.value, scope });
    else if (isLiteralOf(literal, 'Numeric')) {
      // tuple positional lookup first - findTupleElement is the only path that handles
      // rest-element extension and Parameters / ConstructorParameters dispatch. fall back
      // to findTypeMember for object literals with numeric-literal keys (`{0: T; 1: U}[0]`),
      // which findTupleElement rejects since they're TSTypeLiteral not TSTupleType.
      // findTypeMember matches via `getKeyName` which stringifies numeric literal keys
      // (`{0: T}.key` -> `'0'`); coerce here so the comparison hits the string side
      member = findTupleElement(objectType, literal.value, scope)
        ?? findTypeMember({ objectType, key: String(literal.value), scope });
    }
    return member ? resolveTypeAnnotation(member, scope, depth + 1) : null;
  }

  function resolveTypeAnnotation(node, scope, depth = 0, seen = null) {
    if (depth > MAX_DEPTH) return null;
    node = unwrapTypeAnnotation(node);
    if (!node) return null;
    switch (babelNodeType(node)) {
      // TS / Flow primitive keywords + literal-typeof + TSTemplateLiteralType (`prefix_${string}`)
      case 'TSStringKeyword':
      case 'StringTypeAnnotation':
      case 'StringLiteralTypeAnnotation':
      case 'TSTemplateLiteralType':
        return new $Primitive('string');
      case 'TSNumberKeyword':
      case 'NumberTypeAnnotation':
      case 'NumberLiteralTypeAnnotation':
        return new $Primitive('number');
      // boolean keywords + TSTypePredicate (`x is string` -> boolean)
      case 'TSBooleanKeyword':
      case 'BooleanTypeAnnotation':
      case 'BooleanLiteralTypeAnnotation':
      case 'TSTypePredicate':
        return new $Primitive('boolean');
      case 'TSBigIntKeyword':
      case 'BigIntTypeAnnotation':
        return new $Primitive('bigint');
      case 'TSSymbolKeyword':
      case 'SymbolTypeAnnotation':
        return new $Primitive('symbol');
      case 'TSVoidKeyword':
      case 'TSUndefinedKeyword':
      case 'VoidTypeAnnotation':
        return new $Primitive('undefined');
      case 'TSNullKeyword':
      case 'NullLiteralTypeAnnotation':
        return new $Primitive('null');
      case 'TSNeverKeyword':
      case 'EmptyTypeAnnotation':
        return new $Primitive('never');
      // TS `object` keyword = any non-primitive, too broad to narrow polyfills
      case 'TSObjectKeyword':
        return new $Object(null);
      // member-method shapes reach here when `findTypeMember` returns the full method node
      // instead of a synthetic stub - property-access on a method-typed slot semantically
      // yields a Function value (same as a TSFunctionType-typed property)
      case 'TSFunctionType':
      case 'TSConstructorType':
      case 'TSMethodSignature':
      case 'TSDeclareMethod':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'MethodDefinition':
      case 'FunctionTypeAnnotation':
        return new $Object('Function');
      // TS `{}` without members matches ANY non-nullish runtime value - primitives (string,
      // number, bigint, boolean, symbol), functions, all constructor objects (Array, Map,
      // Promise, Date, ...), user classes. returning `$Object('Object')` would narrow to
      // Object-methods only and misroute `.at()` / `.includes()` etc; null routes through
      // `resolveHint` common/rest fallback which is the correct conservative choice.
      // `TSImportType` (`typeof import('x')`) explicit so future extension doesn't need to
      // untangle a silent fall-through through `TSTypeReference`.
      // `TSAnyKeyword` / `TSUnknownKeyword` / `AnyTypeAnnotation` / `MixedTypeAnnotation`
      // are wide-open: type-guard narrowing (`classifyGuardAnnotation:'open'`) refines them
      // contextually; bare resolution stays null so the hint dispatcher takes the same
      // conservative path as for `{}`
      case 'TSTypeLiteral':
      case 'ObjectTypeAnnotation':
      case 'TSImportType':
      case 'TSAnyKeyword':
      case 'TSUnknownKeyword':
      case 'AnyTypeAnnotation':
      case 'MixedTypeAnnotation':
        return null;
      // TS mapped type: detect the trivial passthrough `{ [K in keyof T]: T[K] }` and resolve
      // through to T directly; everything else is structurally opaque
      case 'TSMappedType': {
        const passthrough = unwrapMappedTypePassthrough(node);
        return passthrough ? resolveTypeAnnotation(passthrough, scope, depth + 1, seen) : null;
      }
      case 'TSArrayType':
      case 'ArrayTypeAnnotation':
        return new $Object('Array', resolveNonNullableAnnotation({ node: node.elementType, scope, depth, seen }));
      case 'TSTupleType':
      case 'TupleTypeAnnotation':
        return tupleAsArrayType(node, e => resolveTypeAnnotation(e, scope, depth + 1, seen));
      // TS / Flow named types - only well-known built-ins and utility types.
      // handle dotted refs (`NS.Data`) by joining segments so resolveNamedType /
      // findTypeDeclaration can split them back into a path-walk. `seen` propagates so
      // `resolveUserDefinedType`'s decl-cycle short-circuit observes ancestor visits
      // when re-entering through an alias body (`type Rec = { next: Rec }`)
      case 'TSTypeReference':
      case 'GenericTypeAnnotation': {
        const segments = typeRefSegments(node);
        if (!segments) return null;
        return resolveNamedType({ name: segments.join('.'), node, scope, depth, seen });
      }
      // transparent wrappers - unwrap and resolve the inner type
      case 'TSOptionalType':
      case 'TSParenthesizedType':
      case 'NullableTypeAnnotation':
        return resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1, seen);
      // TS type operator: `readonly T[]`, `unique symbol` - but NOT `keyof T`
      case 'TSTypeOperator':
        return node.operator === 'keyof' ? null : resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1, seen);
      // TS typeof in type position: `typeof variable`
      case 'TSTypeQuery':
        return resolveTypeQuery(node, scope);
      // Flow typeof in type position: `typeof variable`
      case 'TypeofTypeAnnotation': {
        const arg = node.argument;
        return arg?.type === 'GenericTypeAnnotation'
          ? resolveTypeofFromSegments(collectQualifiedSegments(arg.id), scope) : null;
      }
      case 'TSConditionalType':
        return resolveConditionalType(node, scope, depth);
      // TS / Flow union and intersection - resolve if all (non-nullable for unions) members have the same type
      case 'TSUnionType':
      case 'UnionTypeAnnotation': {
        const { types } = node;
        if (!types || !types.length) return null;
        return foldUnionTypes(types, member => resolveTypeAnnotation(member, scope, depth + 1, seen));
      }
      case 'TSIntersectionType':
      case 'IntersectionTypeAnnotation': {
        const { types } = node;
        if (!types || !types.length) return null;
        return foldIntersectionTypes(types, member => resolveTypeAnnotation(member, scope, depth + 1, seen));
      }
      case 'TSLiteralType':
        return resolveLiteralType(node);
      case 'TSIndexedAccessType':
        return resolveIndexedAccessType(node, scope, depth);
    }
    return null;
  }

  function reset() {
    conditionalResultCache = new WeakMap();
  }

  return {
    resolveTypeAnnotation,
    resolveConstructorType,
    resolveConstructorCallType,
    resolveKnownContainerType,
    resolveNamedType,
    isKeyofTargeting,
    reset,
  };
}
