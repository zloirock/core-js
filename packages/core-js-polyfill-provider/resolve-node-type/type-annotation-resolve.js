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
// `resolveExtractExclude`) are cluster-private. `resolveAnnotationInContext`
// and `resolveNonNullableAnnotation` live in the factory (they're consumed both inside this
// cluster and by awaited cluster) and route into `resolveTypeAnnotation` for the no-subst
// path - factory destructure binds the cluster output by the time those run.
import {
  $Object, $Primitive, INTRINSIC_STRING_TRANSFORMERS, literalNodeValue, firstTypeParamIsInner,
} from './base.js';
import {
  isMethodShapeMember,
  isOpenKeywordAnnotation,
  isUnionType,
  literalTypeValueNode,
  markMappedReadonly,
  markReadonlyCollection,
  peelTSParenthesized,
  typeRefSegments,
  withMemberModifiers,
} from './ast-shapes.js';
import { getTypeArgs, propertyKeyName, singleQuasiString, withTypeArgParams } from '../helpers/ast-patterns.js';

const { hasOwn } = Object;

// the intrinsic string transformers are COMPUTABLE on a literal argument, and TS keeps the result
// a literal type: `Uppercase<'a'>` is `'A'`, not `string`. dropping the stamp makes every
// conditional that discriminates on it (`Uppercase<'a'> extends 'A'`) read as wide-vs-narrow and
// take the FALSE branch - the wrong family, silently. the table is the one the mapped-rename lane
// evaluates its `as` clauses with. a folded literal UNION is opaque: its members are
// unrecoverable, so there is nothing to transform and the result stays a bare keyword
function intrinsicStringTransform(name, resolved) {
  const literal = resolved?.primitive && !resolved.literalUnion && typeof resolved.literal === 'string'
    ? INTRINSIC_STRING_TRANSFORMERS[name](resolved.literal) : undefined;
  return new $Primitive('string', literal);
}

export function createTypeAnnotationResolve({
  t,
  babelNodeType,
  evaluateConditionalType,
  isNullableOrNever,
  isLiteralOf,
  KNOWN_CONSTRUCTORS,
  CONSTRUCTOR_ALIASES,
  PROMISE_SYNONYMS,
  DISTRIBUTIVE_UTILITIES,
  STRUCTURE_PRESERVING_WRAPPERS,
  MAX_DEPTH,
  isAmbientClassNode,
  typeRefSegmentsEqual,
  typeRefName,
  findTypeParameter,
  findTypeDeclaration,
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
  resolveThisParamAnnotation,
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
  commonType,
  findTypeMember,
  findTupleElement,
  unwrapMappedTypePassthrough,
  tupleAsArrayType,
  flattenUnionBranches,
  getTypeMembers,
  pickConditionalBranchVia,
  isUnconstrainedTypeShape,
}) {
  function resolveExtractExclude({ first, second, scope, depth, keep, typeParamMap, seen }) {
    function resolve(node) {
      return resolveAnnotationInContext({ node, scope, depth, typeParamMap, seen });
    }
    // the target is never resolved as a WHOLE: this layer has no union representation, so folding
    // `string | symbol` answers null and a guard on that fold sinks every union target before the
    // arms are consulted. an unresolvable arm still sinks the result, through the picker's
    // undecided verdict below - which is the same protection, arm by arm
    //
    // a union target DISTRIBUTES: `T extends A | B` holds when the check extends either arm. asking
    // the picker about the union's folded shape instead loses exactly what it needs - the fold of
    // `string[] | number[]` is an inner-less `Array`, undecidable against `number[]`, while the arm
    // itself decides it
    const targetAlias = followTypeAliasChain(peelTSParenthesized(unwrapTypeAnnotation(second)), scope);
    const targetNode = targetAlias.node ? peelTSParenthesized(targetAlias.node) : peelTSParenthesized(unwrapTypeAnnotation(second));
    const targetArms = targetNode && isUnionType(targetNode)
      ? targetNode.types.map(arm => applySubst(arm, targetAlias.subst))
      : [second];
    function decideAgainst(checkAST) {
      let undecided = false;
      for (const arm of targetArms) {
        const verdict = pickConditionalBranchVia({
          checkAST,
          extendsAST: arm,
          resolveOne: resolve,
          isUnconstrained: isUnconstrainedTypeShape(arm, typeParamMap),
        });
        if (verdict === true) return true;
        if (verdict === null) undecided = true;
      }
      return undecided ? null : false;
    }
    let unwrapped = peelTSParenthesized(unwrapTypeAnnotation(first));
    if (!unwrapped) return null;
    // capture subst so generic union members (`type Foo<T> = T | string`) keep their bindings.
    // alias targets may themselves be paren-wrapped (`type Mixed = (A | B)`); peel again
    const { node: aliasTarget, subst } = followTypeAliasChain(unwrapped, scope);
    if (aliasTarget) unwrapped = peelTSParenthesized(aliasTarget);
    if (!unwrapped) return null;
    // a source member may itself be an alias for a union (`type Outer = boolean[] | Inner`). its
    // FOLDED shape strips the inner type every arm still carries, so the ARMS are what the loop
    // iterates - through the canon that already does this walk with cycle-cutting and dedup, not a
    // second flattener. the outer hop's binding is applied BEFORE handing the branches over, since
    // the canon starts each branch's alias chain fresh
    const bound = isUnionType(unwrapped)
      ? unwrapped.types.map(arm => applySubst(arm, subst))
      : [applySubst(unwrapped, subst)];
    const types = isUnionType(unwrapped) ? flattenUnionBranches(bound, scope) : bound;
    let result = null;
    let anyKept = false;
    let droppedNullish = false;
    for (const substituted of types) {
      const resolved = resolve(substituted);
      if (!resolved) return null;
      // `never` is the union identity (`T | never == T`): it contributes no real receiver and
      // mismatches in `commonType`, bailing the whole Extract/Exclude result. skip it before
      // the assignability fold (mirrors union folding), so the surviving members still resolve
      if (resolved.primitive && resolved.type === 'never') continue;
      // `Extract<T, U>` IS `T extends U ? T : never` and `Exclude` its complement, so the question
      // is the conditional picker's, not a second reading of assignability. it is tri-state: an
      // undecidable member (`number[]` against a structural `Record<string, unknown>`, whose
      // members this layer never modelled) must sink the WHOLE result rather than be guessed -
      // guessing it assignable dropped the arm and left a wrong-family Maybe on the survivor
      const decided = decideAgainst(substituted);
      if (decided === null) return null;
      if (decided !== keep) continue;
      anyKept = true;
      // a SURVIVING nullish arm carries no shape of its own and must not sink the fold - it marks
      // the survivors instead, exactly as the union fold does. folding it in through `commonType`
      // disagreed with every real member, so `Exclude<T[] | null, string>` answered nothing where
      // its own value union answers `T[]` marked nullable
      if (isNullableOrNever(resolved)) {
        droppedNullish = true;
        continue;
      }
      result = commonType(result, resolved);
      if (!result) return null;
    }
    if (droppedNullish && result && !isNullableOrNever(result)) result = result.mark('mayBeNullish');
    // all members excluded -> never (not null/unknown)
    if (!anyKept) return new $Primitive('never');
    return result;
  }

  function resolveKnownContainerType({ name, base, node, innerResolver }) {
    if (!base) return null;
    if (!firstTypeParamIsInner(name)) return base;
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
    // a type-PARAMETER in scope outranks a same-named global: in `function f<Set>(x: Set)` the
    // annotation names the parameter, and resolving it as the container would hand a Set-specific
    // helper to whatever the caller actually passed - an over-resolve that throws on a foreign
    // runtime value. read on the SOURCE spelling, before the alias folding below rewrites it. a
    // name that is no container makes this a no-op, and a qualified name arrives dotted, which
    // never matches a parameter. only the CONTAINER lookup is suppressed: the parameter still
    // resolves through its own constraint / default further down, as TS reads it
    const shadowedByTypeParam = Boolean(findTypeParameter(name, scope));
    // ONE shadow gate for every UTILITY-name recognition below - the structure-preserving branch
    // spelled half of it inline and the utility switch had none at all, so `type Awaited<T> = T[]`
    // and `f<Record>` were answered by the built-in reading of the name instead of by what the
    // source declared. asked on the SOURCE spelling (the alias folding below rewrites `name`) and
    // computed at most once. it is asked for EVERY unqualified name, not only for one the tables
    // claim - and that is deliberate: a file's names are mostly DISTINCT, so a lazy spelling behind
    // the two readers below buys lookups no memo can serve and pays for the extra closure.
    // containers stay on the type-PARAMETER half alone, matching the member-side twin - an
    // `interface Array<T>` augmentation must not stop `Array` being an Array
    // read on the SOURCE spelling too, before the alias folding below rewrites `name`. only an
    // UNQUALIFIED name can be shadowed: `NS.Partial` names a namespace member that no bare
    // parameter or top-level declaration competes with - and asking the declaration lookup with a
    // dotted string as ONE segment collides in its cache with the real `['NS', 'Partial']` walk,
    // answering the later lookup with this one's miss. the lookup is memoized per (scope, name)
    const shadowedUtilityName = !name.includes('.')
      && (shadowedByTypeParam || Boolean(findTypeDeclaration([name], scope)));
    // PromiseLike / Thenable are structural Promise supertypes for await / Awaited<>;
    // aliasing upfront lets the Promise branch of resolveKnownContainerType handle both
    if (PROMISE_SYNONYMS.has(name)) name = 'Promise';
    if (hasOwn(CONSTRUCTOR_ALIASES, name)) name = CONSTRUCTOR_ALIASES[name];
    function resolveArgInner(arg) {
      return resolveAnnotationInContext({ node: arg, scope, depth, typeParamMap, seen });
    }
    const known = shadowedByTypeParam ? null
      : resolveKnownContainerType({ name, base: resolveKnownConstructor(name), node, innerResolver: resolveArgInner });
    // capital `Object` accepts primitives in assignability (unlike lowercase `object`);
    // its resolution stays constructor-null so member dispatch keeps the generic helpers
    if (known) return name === 'Object' ? known.mark('topObject') : known;
    function firstArg() {
      // peeled: oxc keeps a parenthesized utility-type arg (`ReturnType<(typeof f)>`)
      // as TSParenthesizedType where babel strips it - the `.type` dispatches on the
      // consumers below must see the inner shape on both parsers
      return peelTSParenthesized(getTypeArgs(node)?.params?.[0]);
    }
    function resolveArg(arg, fallback) {
      return arg
        ? resolveArgInner(arg) ?? fallback
        : null;
    }
    // structure-preserving wrappers (T[] stays array, {..} stays object). null fallback
    // to $Object('Object') keeps arg-type=object filters firing for TSTypeLiteral inners.
    // a wide-open keyword arg (`NoInfer<unknown>`, `Partial<any>`) stays NULL like the bare
    // keyword: the value can be anything (array / primitive / function), so the Object
    // fallback would suppress generic-instance emission instead of routing through it
    // a USER declaration of the same name outranks the built-in wrapper, exactly as a type PARAMETER
    // does above: `interface Pick<T> { picked: number[] }` is not the global `Pick`, and resolving it
    // as one hands back the type ARGUMENT (`string`) in place of the declared shape
    if (STRUCTURE_PRESERVING_WRAPPERS.has(name) && !shadowedUtilityName) {
      const arg = firstArg();
      const resolved = resolveArg(arg, isOpenKeywordAnnotation(arg) ? null : new $Object('Object'));
      // `Readonly<collection>` is a readonly collection - tag it like `ReadonlyArray` so a conditional-
      // infer check picks the FALSE branch. `readonlyCollectionBase` can't see this at the AST level when
      // the collection is behind a type-param (`Readonly<T>`), so key off the resolved constructor here.
      // only `Readonly` implies readonly (Partial / Pick / ... do not). marker-set, not a rebuild:
      // `Readonly<T[] | null>` resolves through the union fold, so the result may already carry
      // mayBeNullish - reconstructing from the identity fields would drop it
      return name === 'Readonly' && resolved && !resolved.primitive
        && (resolved.constructor === 'Array' || resolved.constructor === 'Set' || resolved.constructor === 'Map')
        ? resolved.mark('readonly') : resolved;
    }
    // lib.d.ts writes these as a NAKED conditional over their first parameter, which makes them
    // distributive: `U<A | B>` is `U<A> | U<B>`. the resolvers below each expect one concrete shape
    // (a class binding, a signature) and answer null on a union, so the argument is distributed here
    // once - rebuilt per arm and folded, the way the indexed access distributes its object. the
    // structure-preserving wrappers above are deliberately NOT in the set: `Pick<A | B, K>` is a
    // mapped type over the whole union, not the union of per-arm picks
    if (!shadowedUtilityName) switch (name) {
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
        // tuple approximated as an Array whose element type is the commonType fold over ALL params, so a
        // runtime element read (`xs.pop()`, `xs[i]` with a variable index) stays precise when the params
        // share a type and DEGRADES to a generic element (null inner) when they differ - never mis-resolving
        // to the first param's type on a later element (`Parameters<(a:string,b:number[])=>void>[1]` read as
        // string). literal indexing `T[N]` still picks the exact N-th upstream via `findTupleElement`
        const params = resolveParametersParams(node, scope);
        let inner;
        for (const p of params ?? []) {
          const { param, isRest } = effectiveParam(p);
          const resolved = param?.typeAnnotation ? resolveArgInner(param.typeAnnotation) : null;
          // `...xs: T[]` - annotation is `T[]`, the tuple element is T
          const elem = safeInnerType(isRest ? resolveInnerType(resolved) : resolved);
          if (!elem) {
            inner = null;
            break;
          }
          inner = inner === undefined ? elem : commonType(inner, elem);
          if (!inner) break;
        }
        return new $Object('Array', inner ?? null);
      }
      case 'Uppercase':
      case 'Lowercase':
      case 'Capitalize':
      case 'Uncapitalize':
        return intrinsicStringTransform(name, resolveArg(firstArg(), null));
      // Flow: $Keys
      case '$Keys':
        return new $Primitive('string');
      // ThisParameterType<typeof fn> peels fn's `this` pseudo-param type, so a method on the
      // receiver resolves precisely (`function f(this: number[])` -> `number[]` -> array `.at`).
      // NO explicit `this` -> Object: TS yields `unknown` / the ambient global-this there, neither a
      // polyfillable receiver. an explicit `this` that does NOT resolve is a different answer - null,
      // the generic dispatch - because an Object masquerade over an unknown receiver SUPPRESSES the
      // generic polyfill instead of routing through it. OmitThisParameter<F> -> callable Function
      // (Function.prototype methods are stable across supported targets, so precision adds no path)
      case 'ThisParameterType': {
        const thisAnn = resolveThisParamAnnotation(node, scope);
        return thisAnn ? resolveArgInner(thisAnn) : new $Object('Object');
      }
      case 'OmitThisParameter':
        return new $Object('Function');
      // TS lib alias for `string | number | symbol`; no shared polyfill API, null lets
      // downstream fall back to generic-instance emission
      case 'PropertyKey':
        return null;
      // transparent wrapper resolving its type parameter (Flow's exact-object marker).
      // the TS transparent wrappers (`NoInfer` et al.) never reach this switch - the
      // structure-preserving branch above owns them
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
          const queried = resolveTypeQuery(arg, scope, depth);
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
        // local `<T>` + fold the alias subst, then resolve (shared with the getTypeMembers mirror branch).
        // the extracted return is a BARE ref, so it resolves in the caller's context like every sibling
        // arm - resolved raw it would re-bind by NAME to whatever same-named param encloses the use site
        const target = shadowedAliasReturnAnnotation(arg, scope);
        return target ? resolveAnnotationInContext({ node: target, scope, depth, typeParamMap, seen }) : null;
      }
      case 'InstanceType': {
        const arg = firstArg();
        const resolved = arg ? resolveTypeQueryBinding(arg, scope) : null;
        if (!(t.isClass(resolved?.node) || isAmbientClassNode(resolved?.node))) return null;
        // base-less -> Object; unknowable super -> null (generic). no `|| $Object('Object')` re-suppression
        return resolveClassInheritance(resolved);
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
    // a cached result may be a depth-cutoff artifact - the deepest branch-path hits MAX_DEPTH
    // first - so it is reused only when the current call has no more budget than the cached one
    // (depth >= cached.depth); a shallower reach has more budget and recomputes
    if (cached && depth >= cached.depth) return cached.result;
    // route through the canonical conditional evaluator: it runs the structural branch pick
    // (pickConditionalBranchVia) before the both-branch fold - the local re-implementation
    // folded BOTH branches even when the conditional decidably fires to a single one (wrong
    // branch leaked when the other resolved to never / null)
    const result = evaluateConditionalType(node, null, scope, depth, null);
    // the evaluation above can re-enter on the SAME node in another scope and install the
    // per-scope map itself - re-read it rather than overwrite the slot, which would throw the
    // nested call's entries away and leave the tree it collapsed to re-expand
    byScope = conditionalResultCache.get(node);
    if (!byScope) conditionalResultCache.set(node, byScope = new Map());
    byScope.set(scope, { result, depth });
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

  // `InstanceType<A | B>` IS `InstanceType<A> | InstanceType<B>`, but the union hides INSIDE the
  // utility, so the object-side distribution below never sees it and the whole access falls into
  // `getTypeMembers`, which has no union branch. surfacing it as a real union node lets the one
  // distribution serve both spellings. anything else is handed back untouched
  function distributiveUtilityAsUnion(node, scope) {
    const peeled = peelTSParenthesized(node);
    // argument presence is two property reads and rejects nearly every reference in a file, so it
    // is asked BEFORE the name walk and the two shadow lookups behind it
    const params = getTypeArgs(peeled)?.params;
    if (!params?.length) return node;
    const name = typeRefName(peeled);
    // a USER declaration or a type PARAMETER of the same name outranks the built-in reading, the
    // same gate the name resolver applies before it trusts any utility spelling
    if (!DISTRIBUTIVE_UTILITIES.has(name) || findTypeParameter(name, scope)
      || findTypeDeclaration([name], scope)) return node;
    const argAlias = followTypeAliasChain(peelTSParenthesized(unwrapTypeAnnotation(params[0])), scope);
    const arg = argAlias.node ? peelTSParenthesized(argAlias.node) : peelTSParenthesized(unwrapTypeAnnotation(params[0]));
    if (!isUnionType(arg)) return node;
    return {
      type: 'TSUnionType',
      types: arg.types.map(arm => withTypeArgParams(peeled, [applySubst(arm, argAlias.subst), ...params.slice(1)])),
    };
  }

  // TS indexed access type: Config["items"], [string, number[]][1], Items[number], Dict[string]
  // `T[keyof T]` shape: fold each property's value annotation into a union (mirrors TS
  // evaluation). returns resolved Type / null on hit, undefined when shape doesn't match.
  // `objectType` is the caller's already-paren-peeled operand: the `isKeyofTargeting` self-match
  // compares the keyof operand against it, so an unpeeled `(T)` wrapper would fail the match.
  // takes the peeled INDEX rather than the access node it came off: the node's own `objectType`
  // is the unpeeled twin of the operand passed alongside, and nothing here ever read it
  function resolveKeyofSelfValueUnion(indexType, objectType, scope, depth) {
    if (!isKeyofTargeting(indexType, objectType, scope)) return undefined;
    const members = getTypeMembers({ objectType, scope });
    if (!members) return null;
    const valueAnnotations = [];
    for (const m of members) {
      // a setter arm skips only when a PAIRED reader (getter / data member on the same key)
      // supplies the slot's read type; a SET-ONLY accessor still reads as its param type in
      // TS, so `S[keyof S]` includes it - dropping the arm narrowed the union to the
      // surviving members (wrong-family Maybe on the setter-typed runtime value). the
      // param type isn't extracted here (rare shape) - the whole union bails to generic
      if (isMethodShapeMember(m.type) && m.kind === 'set') {
        const key = propertyKeyName(m);
        const paired = key !== null && key !== undefined && members.some(other => other !== m
          && !(isMethodShapeMember(other.type) && other.kind === 'set')
          && propertyKeyName(other) === key);
        if (paired) continue;
        return null;
      }
      // a (non-getter) method's VALUE is the function itself, not its return type: fold the
      // member NODE - it resolves to Function exactly like the single-key `T['method']` mirror,
      // so a mixed union (method + concrete container) BAILS through the fold instead of
      // over-narrowing to the surviving container member
      if (isMethodShapeMember(m.type) && m.kind !== 'get') {
        valueAnnotations.push(m);
        continue;
      }
      // canonical member-value read: an oxc class-getter nests its return type under `value`
      // (`m.value.returnType`), mirroring call-resolution.js - without the third slot the getter
      // resolves null and the value-union bails
      const annotation = m.typeAnnotation ?? m.returnType ?? m.value?.returnType;
      // an untyped (implicit-any) member makes `T[keyof T]` include `any`, which absorbs the
      // whole union - a narrow to the surviving typed members would be unsound
      if (!annotation) return null;
      // an optional member contributes `undefined` to the value union exactly as a `| undefined`
      // arm would; folding the bare annotation loses it and the union reads always-present
      valueAnnotations.push(withMemberModifiers(annotation, { optional: Boolean(m.optional) }));
    }
    if (!valueAnnotations.length) return null;
    return foldUnionTypes(valueAnnotations, p => resolveTypeAnnotation(p, scope, depth + 1));
  }

  function resolveIndexedAccessType(node, scope, depth) {
    // peel a parenthesized object operand once (`(T)['a']`, `([A,B])[0]`, `({[k:string]:V})[string]`):
    // both parsers keep `(T)` as TSParenthesizedType in type position, and the member / tuple /
    // index-sig helpers below would otherwise see the wrapper and bail to null
    const objectType = peelTSParenthesized(node.objectType);
    // the index operand needs the same peel: oxc keeps a `T[('a')]` index as TSParenthesizedType,
    // so every `.type ===` dispatch below would miss the inner literal and bail on that parser only
    const indexType = peelTSParenthesized(node.indexType);
    // the mirror of the union INDEX below: a union OBJECT distributes too, `(A | B)[K]` being
    // `A[K] | B[K]`, and the same fold aggregates the arms. without it the object slips whole into
    // `getTypeMembers`, which has no union branch and answers null, so every union-typed source
    // lost the access entirely. the alias hop is where the union usually hides (`type S = A | B`)
    const objectAlias = followTypeAliasChain(objectType, scope);
    const objectUnion = distributiveUtilityAsUnion(objectAlias.node
      ? peelTSParenthesized(objectAlias.node) : objectType, scope);
    if (isUnionType(objectUnion)) {
      // a SELF `keyof` index has to travel with the arm: `keyof S` still names the whole union
      // after distribution and the self-fold below would no longer recognise it. an arm's own key
      // set is a SUPERSET of the union's shared keys, so the fold either converges - and then the
      // shared subset carries that same type - or degrades. it cannot over-resolve
      const selfKeyof = isKeyofTargeting(node.indexType, objectType, scope);
      return foldUnionTypes(objectUnion.types, arm => {
        const armNode = applySubst(arm, objectAlias.subst);
        return resolveTypeAnnotation({
          type: 'TSIndexedAccessType',
          objectType: armNode,
          indexType: selfKeyof ? { type: 'TSTypeOperator', operator: 'keyof', typeAnnotation: armNode } : node.indexType,
        }, scope, depth + 1);
      });
    }
    // T[number] - element type of array/tuple. both dialect spellings of the keyword: a name-only
    // test here left every Flow file taking the generic path on a shape TS resolves precisely
    if (indexType?.type === 'TSNumberKeyword' || indexType?.type === 'NumberTypeAnnotation') {
      return resolveElementType(objectType, scope, depth + 1);
    }
    // T[string] - string index signature type
    if (indexType?.type === 'TSStringKeyword' || indexType?.type === 'StringTypeAnnotation') {
      const members = getTypeMembers({ objectType, scope });
      if (members) for (const member of members) {
        const keyType = member.parameters?.[0]?.typeAnnotation?.typeAnnotation?.type;
        if (member.type === 'TSIndexSignature' && member.typeAnnotation
          && (keyType === 'TSStringKeyword' || keyType === 'StringTypeAnnotation')) {
          return resolveTypeAnnotation(member.typeAnnotation, scope, depth + 1);
        }
      }
      return null;
    }
    // `T[keyof T]` self-indexed access folds to value-union of T's properties.
    // delegated to helper to keep dispatcher under max-statements lint
    // pass the PEELED index so `T[(keyof T)]` reaches the keyof-self fold on oxc too
    const keyofSelf = resolveKeyofSelfValueUnion(indexType, objectType, scope, depth);
    if (keyofSelf !== undefined) return keyofSelf;
    // `T['a' | 'b']` - union of literal indices. fold each branch back through this same
    // resolver (each with one TSLiteralType indexType); `foldUnionTypes` aggregates to the
    // widest common type, handing us precise inference when all branches agree
    if (indexType?.type === 'TSUnionType') {
      return foldUnionTypes(indexType.types, branch => resolveTypeAnnotation(
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
    const literalIndex = literalTypeValueNode(indexType) ?? indexType;
    const quasi = singleQuasiString(literalIndex);
    if (quasi !== null) {
      const member = findTypeMember({ objectType, key: quasi, scope });
      return member ? resolveTypeAnnotation(member, scope, depth + 1) : null;
    }
    const literal = literalTypeValueNode(indexType);
    if (!literal) return null;
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

  // tag readonly-collection forms with `.readonly` so a conditional-infer check can distinguish a
  // readonly collection from its mutable form after resolution drops the syntactic readonly-ness -
  // recovers the FALSE branch for readonly checks behind an alias / type-param / `Readonly<X>`
  // indirection, where the AST-level check no longer sees the readonly keyword. idempotent (mark
  // no-ops on an already-tagged result); readonlyCollectionBase is null for every non-readonly form
  // so mutable collections are never tagged (over-fire-safe). marker-set, not a rebuild: the inner
  // resolution may have union-folded (`Readonly<T[] | null>`) and already carry mayBeNullish
  function resolveTypeAnnotation(node, scope, depth = 0, seen = null) {
    const result = resolveTypeAnnotationInner(node, scope, depth, seen);
    return markReadonlyCollection(result, node);
  }

  function resolveTypeAnnotationInner(node, scope, depth = 0, seen = null) {
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
      // boolean keywords
      case 'TSBooleanKeyword':
      case 'BooleanTypeAnnotation':
      case 'BooleanLiteralTypeAnnotation':
        return new $Primitive('boolean');
      // a type predicate is boolean-valued ONLY in the `x is T` form. the ASSERTION forms
      // (`asserts x` / `asserts x is T`) return undefined - resolving them to boolean is an
      // over-resolve into the wrong family, which hands a String/Boolean-specific helper to a
      // call whose value is undefined. `node.asserts` is the discriminator the guard cluster
      // already reads
      case 'TSTypePredicate':
        return new $Primitive(node.asserts ? 'undefined' : 'boolean');
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
        if (!passthrough) return null;
        return markMappedReadonly(resolveTypeAnnotation(passthrough, scope, depth + 1, seen), node);
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
        // a naked-conditional utility over a union argument is the union of its per-arm results.
        // surfaced as a real union node, so the union fold serves it and the name-keyed resolvers
        // below keep seeing exactly one concrete shape - the same unwrap the indexed access uses.
        // gated on the segments ALREADY parsed above: this runs on every type reference in the
        // file, and re-deriving the name here cost 15% on a reference-dense source
        const asUnion = segments.length === 1 && DISTRIBUTIVE_UTILITIES.has(segments[0])
          ? distributiveUtilityAsUnion(node, scope) : node;
        if (asUnion !== node) return resolveTypeAnnotation(asUnion, scope, depth + 1);
        return resolveNamedType({ name: segments.join('.'), node, scope, depth, seen });
      }
      // transparent wrapper - unwrap and resolve the inner type
      case 'TSParenthesizedType':
        return resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1, seen);
      // nullish-admitting wrappers: Flow `?T` admits null | undefined, a tuple optional
      // slot (`[T?]`) admits undefined. the inner value shape resolves for receiver
      // narrowing, but the runtime value may still be nullish, so the result is marked
      // like a stripped union arm (the logical truthy-fold must not collapse on it)
      case 'TSOptionalType':
      case 'NullableTypeAnnotation': {
        const inner = resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1, seen);
        return inner && !isNullableOrNever(inner) ? inner.mark('mayBeNullish') : inner;
      }
      // TS type operator: `readonly T[]`, `unique symbol` - but NOT `keyof T`
      case 'TSTypeOperator':
        return node.operator === 'keyof' ? null : resolveTypeAnnotation(node.typeAnnotation, scope, depth + 1, seen);
      // TS typeof in type position: `typeof variable`. the budget crosses the cluster boundary
      // with it - a `typeof` naming its own binding resolves right back here, and the annotation
      // lane's budget is the only thing that ends that loop
      case 'TSTypeQuery':
        return resolveTypeQuery(node, scope, depth);
      // Flow typeof in type position: `typeof variable`
      case 'TypeofTypeAnnotation': {
        const arg = node.argument;
        return arg?.type === 'GenericTypeAnnotation'
          ? resolveTypeofFromSegments(collectQualifiedSegments(arg.id), scope, depth) : null;
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
      case 'IndexedAccessType':
        return resolveIndexedAccessType(node, scope, depth);
      // Flow's optional indexed access (`Obj?.['key']`) yields the member type OR undefined,
      // so it carries the same nullish marker as `?T` above
      case 'OptionalIndexedAccessType': {
        const inner = resolveIndexedAccessType(node, scope, depth);
        return inner && !isNullableOrNever(inner) ? inner.mark('mayBeNullish') : inner;
      }
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
