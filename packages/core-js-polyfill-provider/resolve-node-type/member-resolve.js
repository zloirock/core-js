// Member resolution end-to-end: walking typed receivers + dispatching runtime member-access.
// Consolidates two halves of the same pipeline:
//
//   Typed side (annotation-based):
//     resolveMemberCallChain        - walks `obj.a.b.c` to leaf member preserving raw signature
//     resolveBindingReturnInfo      - callee identifier -> { fnNode, returnType }
//     memberCallReturnAnnotation    - cross-dialect return-slot extractor
//     resolveTypedMember            - typeof binding / class type / generic alias subst dispatch
//     findClassPathForTypeReference - `Cls` ref -> ClassDeclaration NodePath
//     resolveIndexSignatureMember   - `obj[k]` -> `{[key:string]:V}` -> V
//
//   Runtime side (receiver-aware dispatch):
//     resolveFromMemberExpression   - main member access entry; tries this-in-ObjectMethod,
//                                     ObjectExpression, class context, ambient class, then
//                                     typed-member as final fallback
//     resolveArrayIndexAccess       - `arr[0]` on ArrayExpression literals
//     resolveEnumMemberAccess       - `E.A` / `N.E.A` / `E[E.A]` enum dispatch
//
// Cluster-private helpers (not in service-object return):
//   resolveMemberCallReturnFromAnnotation - per-annotation overload fold
//   resolveMemberCallReturn               - union / intersection / alias-chain aware dispatch
//   collectMemberSegments                 - runtime MemberExpression chain -> segment array
//
// runtime `member-dispatch` and typed `member-resolution` share one closure, so the dispatch
// consumes `resolveTypedMember` / `resolveIndexSignatureMember` directly without a thunk.
//
// `findExpressionAnnotation` / `substituteTypeParams` / `applySubst` / `applyAliasSubstDeep` /
// `functionTypeReturnAnnotation` thunk through forward-decl `let` bindings
import knownBuiltInReturnTypes from '@core-js/compat/known-built-in-return-types' with { type: 'json' };
import {
  MAX_DEPTH,
  $Object,
  $Primitive,
  canonicalArrayIndex,
  dropLeadingThisParam,
  hasLeadingThisParam,
  isNumericIndexName,
  isTypeObject,
  nodePathInScope,
  nodeRangeContains,
} from './base.js';
import {
  collectQualifiedSegments,
  isQualifiedNameNode,
  isUnionType,
  memberTypeQuery,
} from './ast-shapes.js';
import { isCallShape } from '../detect-usage/resolve.js';
import { isAmbientFunctionNode } from './name-resolution.js';
import {
  arrayLiteralSlotValue,
  bindingLoopAnchor,
  cachedContainerPaths,
  calleeYieldedContainer,
  callArgumentPathAt,
  objectLevelPairedProperty,
  resolveCallArgumentCoords,
  climbTransparentWrapperPath,
  findNearestVarScopeOwner,
  liveSourceIdentifierPaths,
  invocationCalleeOf,
  getTypeArgs,
  isDestructurePattern,
  isGeneratedMemoDeclarator,
  isMemberWriteHost,
  isTypeAnnotationNodeType,
  isTypeOnlyImportEquals,
  isReassignedBeyondDeclarator,
  isMemberAccessNode,
  memberKeyName,
  referencesArgumentsObject,
  nodeHoldsChild,
  noReassignmentReachesUsage,
  pathOfNode,
  peelSkippableWrapperPath,
  peelTransparentWrapperPath,
  unwrapRuntimeExpr,
  peelTSParenthesized,
  provablyPrecedes,
  reassignmentDominatesUsage,
  staticKeyNames,
  staticMemberKeyName,
  writeNeverRuns,
  writesPastCeiling,
  valueIsDroppedAt,
  ESCAPED_CONTAINER_NAMES,
  CENSUS_ENUM_RECEIVERS,
  CENSUS_KEY_NAMES,
  MUTATED_STATIC_PINNED,
  rootProgramOf,
} from '../helpers/ast-patterns.js';
import { numericEnumSlots } from './enum-types.js';
import { pushMultimap } from '../helpers/pattern-matching.js';
import { memberWriteReceiverPath, memberWriteTargetPath } from './class-member-shapes.js';

// Each source-reference list belongs to one name and one census epoch.
const reverseWritesByReferences = new WeakMap();
const CLASS_PATH_TYPES = ['ClassDeclaration'];
const ARRAY_METHODS = new Map(Object.entries(knownBuiltInReturnTypes.instanceMethods.Array));

// The last write must run before the read and after all competing writes in this activation.
function lastMemberWriteBefore(writes, path, adapter) {
  const write = writes.reduce((last, next) => next.node.end > last.node.end ? next : last);
  return provablyPrecedes(write.node, path.node)
    && reassignmentDominatesUsage({ reassignmentNodes: [write.node], usagePath: path, adapter })
    && writes.every(other => other === write || noReassignmentReachesUsage({
      reassignmentNodes: [write.node], usagePath: other,
    })) ? write : null;
}

// collect runtime member-expression segments: bare `E` -> ['E'], non-computed dotted chain
// `N.E` -> ['N', 'E'], deeper `N.M.E` -> ['N', 'M', 'E']. computed / non-Identifier links
// bail to null. parallel to type-level `collectQualifiedSegments` (which walks
// TSQualifiedName) - this one walks runtime MemberExpression chains.
// `unwrapRuntimeExpr` peels ChainExpression / ParenthesizedExpression / TS_EXPR_WRAPPERS
// so optional-chained (`N?.E.A`) and cast-wrapped (`(N as typeof N).E.A`) shapes resolve
// through the enum lookup. OptionalMemberExpression (babel-typed optional chain shape)
// handled alongside MemberExpression below. without the peels,
// `resolveEnumMemberAccess` for `N?.E.A` bails on the first hop because `path.node.object`
// is a ChainExpression / OptionalMember wrapping the chain
function collectMemberSegments(node) {
  node = unwrapRuntimeExpr(node);
  if (node?.type === 'Identifier') return [node.name];
  if (node?.type !== 'MemberExpression' && node?.type !== 'OptionalMemberExpression') return null;
  if (node.computed) return null;
  const left = collectMemberSegments(node.object);
  if (!left || node.property?.type !== 'Identifier') return null;
  left.push(node.property.name);
  return left;
}

// A qualified name can also initialize a runtime TS import alias.
function erasedEnumReference(ref) {
  let host = ref.parentPath;
  while (isQualifiedNameNode(host?.node)) host = host.parentPath;
  return isTypeAnnotationNodeType(host?.node.type) || isTypeOnlyImportEquals(host?.node);
}

function enumWriteReceiver(write) {
  const receiver = unwrapRuntimeExpr(memberWriteReceiverPath(write)?.node);
  return receiver && collectMemberSegments(receiver)?.at(-1);
}

export function createMemberResolve({
  findRuntimeTypeMember,
  withTypeReferenceScope,
  t,
  typeofSource,
  getScopeBinding,
  isLiteralOf,
  unwrapTypeAnnotation,
  getTypeMembers,
  keyMatchesName,
  findNameAnnotation,
  bindingAnnotationPath,
  findExpressionAnnotation,
  resolveOverloadMember,
  withLookupPath,
  functionTypeReturnAnnotation,
  applyAliasSubstDeep,
  shadowMethodTypeParams,
  applyCallSiteSubst,
  dropTypeParamSubst,
  foldUnionTypes,
  foldOverloadReturns,
  followTypeAliasChain,
  applySubst,
  isNullableOrNever,
  isNullableOrNeverAnnotation,
  commonType,
  narrowDiscriminatedUnion,
  swapAliasToTSTypeQueryWithSubst,
  resolveTypeQueryBinding,
  resolveObjectMember,
  resolveClassContext,
  resolveClassMember,
  resolveAnnotatedMember,
  substituteTypeParams,
  resolveTypeAnnotation,
  findTypeMember,
  findAnnotationGuard,
  findTypeDeclaration,
  findTypeParameter,
  isKeyofTargeting,
  resolveIndexSignatureValue,
  indexAccessKeyKind,
  resolveMemberPropertyName,
  resolveRuntimeExpression,
  resolveInnerType,
  collectBindingReferences,
  computeObjectAliasClosure,
  objectBindingName,
  resolveThisObject,
  resolveObjectFieldFlow,
  walkObjectLiteralPropertyPath,
  isGetterFreshLiteral,
  pathSlotWritten,
  instanceDispatcherKey,
  pairedInstanceDispatcher,
  isWrittenContainerSlot,
  isMutatedStatic,
  spellsMemberKey,
  isMemberLike,
  findAmbientClassPath,
  resolveArrayLiteralElement,
  findAllEnumDeclarations,
  enumIsNearestValue,
  bindingDeclaratorPath,
  programCensus,
  findProgramPath,
  isBindingExportedByName,
  resolveStaticCalleePair,
  namespaceExportReturn,
  findNamespacedValuePath,
  resolveEnumMemberType,
  resolveEnumType,
  resolveNodeType,
  functionTypeParams,
  getDecisionAdapter = () => null,
}) {
  // --- Member-chain walker (predicate-guards integration) ---

  // walk a (possibly nested) `obj.a.b.c` member-chain to its leaf MEMBERS - every same-named
  // callable one, an overload set being a set. for each intermediate hop we step into the carried
  // annotation via `getTypeMembers` + match; the leaf members are returned raw (not their
  // typeAnnotation) so the caller can inspect a method's full TSMethodSignature - `findTypeMember`
  // would synth a stub there and lose return-type info (e.g. TSTypePredicate). returns null on any
  // non-Identifier link, missing root binding, or unresolvable intermediate hop
  function resolveMemberCallChain(callee, scope) {
    const props = [];
    // peel ESTree `ChainExpression` / TS wrappers / parens at entry; intermediate hops
    // need explicit handling - both `MemberExpression` and babel's `OptionalMemberExpression`
    // share `object`/`property`/`computed` slots and resolve to the same member chain
    let node = unwrapRuntimeExpr(callee);
    while ((node?.type === 'MemberExpression' || node?.type === 'OptionalMemberExpression')
      && !node.computed && node.property?.type === 'Identifier') {
      props.push(node.property.name);
      // peel after each step so intermediate ChainExpression / paren / TS wrappers
      // (`(a?.b).at(0)` - ESTree wraps optional-tail in ChainExpression on `.object`) don't
      // bail the walk. babel's OptionalMemberExpression keeps the chain flat at this slot,
      // oxc embeds the ChainExpression; peel symmetrically across parsers
      node = unwrapRuntimeExpr(node.object);
    }
    if (node?.type !== 'Identifier' || !props.length) return null;
    const binding = getScopeBinding({ scope, name: node.name });
    if (!binding) return null;
    // anchor on the DECLARATION for the whole member walk below, not just for reading the
    // annotation: every hop re-resolves type NAMES, and under the use-site anchor those names
    // answer in whatever container the USE happens to sit in - a namespace-local namesake of a
    // type declared outside it is the wrong family, not a missed narrowing. the scope beside it
    // already comes from the declaration for the same reason
    return withLookupPath(binding.path, () => resolveMemberChainFrom(binding, props));
  }

  // the walk itself, split out so the caller can anchor the WHOLE of it on the declaration rather
  // than only the annotation read - see the anchor note at the call site
  function resolveMemberChainFrom(binding, props) {
    let annotation = unwrapTypeAnnotation(findNameAnnotation(binding.path));
    const scopeRef = bindingAnnotationPath(binding.path).scope;
    // props collected leaf-first; consume from the end to walk root-down. last entry stays
    // for the leaf-member lookup below (its raw signature is what callers need).
    // intermediate hops delegate to `findTypeMember` which handles alias-chain follow,
    // union/intersection per-branch fold, mapped-type passthrough, and method-vs-property
    // unwrap in one dispatch. methods surface as a synthetic Function-stub annotation -
    // next iteration's lookup on Function returns null, matching the prior bail behavior
    // (`obj.fn.x` reads `.x` on the function value, not on the method's return type)
    for (let i = props.length - 1; i > 0; i--) {
      if (!annotation) return null;
      annotation = unwrapTypeAnnotation(findTypeMember({ objectType: annotation, key: props[i], scope: scopeRef }));
    }
    if (!annotation) return null;
    // leaf: need the RAW member nodes (caller inspects signature shape - method vs property
    // vs getter - to decide call-vs-read dispatch). `findTypeMember` returns the resolved
    // annotation only, which loses the signature shape, so leaf stays at members+filter
    const members = getTypeMembers({ objectType: annotation, scope: scopeRef })
      ?.filter(m => keyMatchesName(m.key, props[0], scopeRef, m.computed));
    return members?.length ? { members, scope: scopeRef } : null;
  }

  // resolve a callee identifier to its function-like decl: returns {fnNode, returnType}
  // where fnNode carries the param list (`params` for FunctionDeclaration / arrow / TSDeclare,
  // `parameters` on a TSFunctionType binding-annotation) and returnType is the unwrapped
  // declared return annotation. unifies the four shapes a function-like binding can take so
  // callers can map a `TSTypePredicate.parameterName` to a positional call-arg uniformly:
  //   function isStr(x): x is T { ... }      -> FunctionDeclaration / TSDeclareFunction
  //   const isStr = (x): x is T => ...       -> VariableDeclarator + init ArrowFunctionExpression
  //   const isStr: (x) => x is T = impl      -> VariableDeclarator + TSFunctionType annotation
  // babel quirk: TSFunctionType stores the return type under `.typeAnnotation`, not `.returnType`
  function resolveBindingReturnInfo(declNode) {
    if (t.isFunction(declNode) || isAmbientFunctionNode(declNode)) {
      return { fnNode: declNode, returnType: unwrapTypeAnnotation(declNode.returnType) };
    }
    if (!t.isVariableDeclarator(declNode)) return null;
    // inline annotation on init wins (`const f = (x): x is T => ...`); fall through to the
    // binding-annotation form (`const f: (x) => x is T = impl`) when init is annotation-less,
    // including the common `const f: T = otherFn` shape where the predicate lives on the
    // binding annotation
    if (declNode.init && t.isFunction(declNode.init)) {
      const inlineReturn = unwrapTypeAnnotation(declNode.init.returnType);
      if (inlineReturn) return { fnNode: declNode.init, returnType: inlineReturn };
    }
    const bindingAnnotation = unwrapTypeAnnotation(declNode.id?.typeAnnotation);
    if (bindingAnnotation?.type !== 'TSFunctionType') return null;
    return {
      fnNode: bindingAnnotation,
      returnType: unwrapTypeAnnotation(bindingAnnotation.typeAnnotation ?? bindingAnnotation.returnType),
    };
  }

  // --- Method-call return resolver ---

  // callable member SHAPE, annotation presence NOT required: an implicit-any overload
  // (`parse(x: number);`) must stay in the overload set so the fold's widen sees it -
  // gating membership on the return annotation drops it before arg-discrimination and
  // lets a surviving annotated arm narrow a call TS types as `any`. function-typed
  // properties always carry a return in the grammar, so their shape check IS the
  // annotation check
  function isCallableMemberShape(member) {
    if (member.kind === 'get' || member.kind === 'set') return false;
    switch (member.type) {
      case 'TSMethodSignature':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'TSDeclareMethod':
        return true;
      // oxc models `abstract m(): T` as TSAbstractMethodDefinition with the SAME `.value` wrap as a
      // concrete MethodDefinition (babel uses TSDeclareMethod); group it here so an abstract method
      // reached via the annotation-fold path (alias / intersection / union) is not filtered out
      case 'TSAbstractMethodDefinition':
      case 'MethodDefinition':
        return !!member.value;
      case 'TSPropertySignature':
        return !!functionTypeReturnAnnotation(unwrapTypeAnnotation(member.typeAnnotation));
      case 'ObjectTypeProperty':
        return !!functionTypeReturnAnnotation(unwrapTypeAnnotation(member.value));
    }
    return false;
  }

  // extract the return type annotation from a method/property call signature
  function memberCallReturnAnnotation(member) {
    // a getter (or setter) signature is not callable as a method - narrowing the CALL to the
    // getter's value type produced an un-callable narrow
    if (member.kind === 'get' || member.kind === 'set') return null;
    switch (member.type) {
      // Babel: TSMethodSignature.typeAnnotation; ESTree: TSMethodSignature.returnType
      case 'TSMethodSignature':
        return member.typeAnnotation ?? member.returnType;
      // class methods and declared methods carry returnType directly
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'TSDeclareMethod':
        return member.returnType;
      // ESTree class method (concrete or oxc `abstract`): function lives on `.value` (FunctionExpression)
      case 'TSAbstractMethodDefinition':
      case 'MethodDefinition':
        return member.value?.returnType;
      // property with a function-type annotation: extract its return type
      case 'TSPropertySignature':
        return functionTypeReturnAnnotation(unwrapTypeAnnotation(member.typeAnnotation));
      // Flow: ObjectTypeProperty with FunctionTypeAnnotation value
      case 'ObjectTypeProperty':
        return functionTypeReturnAnnotation(unwrapTypeAnnotation(member.value));
    }
    return null;
  }

  // ESTree methods own their signature under .value. A callable property owns it on
  // its function type, including that function's type parameters.
  function memberCallSignature(member) {
    switch (member.type) {
      case 'TSMethodSignature':
      case 'ClassMethod':
      case 'ClassPrivateMethod':
      case 'TSDeclareMethod': return member;
      case 'TSAbstractMethodDefinition':
      case 'MethodDefinition': return member.value;
      case 'TSPropertySignature': return unwrapTypeAnnotation(member.typeAnnotation);
      case 'ObjectTypeProperty': return unwrapTypeAnnotation(member.value);
    }
    return null;
  }

  function memberCallParams(member) {
    return functionTypeParams(memberCallSignature(member)) ?? null;
  }

  // resolve a method call's return type from a single (non-union) annotation by walking its members
  //   1. ARGUMENT-MATCH first: TS picks the FIRST overload whose params accept the call args, so
  //      `p.parse(123)` (number) selects `parse(x: number): string`, NOT the declaration-first
  //      `parse(x: string): string[]`. matching by args keeps the precise type-specific helper
  //      (`_atMaybeString`) on a string value instead of the wrong `_atMaybeArray` (ie:11 throw)
  //   2. no arg-match (unresolvable args / no param accepts them) -> fold the resolved returns of all
  //      matching overloads; convergent -> one type, divergent -> null (generic) - a type-specific
  //      Maybe picked off one arm would throw on a foreign return
  function resolveMemberCallReturnFromAnnotation({ annotation, name, scope, resolve, depth, subst, callPath }) {
    function matches(member) {
      return keyMatchesName(member.key, name, scope, member.computed) && isCallableMemberShape(member);
    }
    const intersection = annotation.type === 'TSIntersectionType' || annotation.type === 'IntersectionTypeAnnotation';
    const sources = intersection ? new Set() : null;
    const members = getTypeMembers({
      objectType: intersection ? applySubst(annotation, subst) : annotation, scope, depth,
      onPart: intersection ? (part, source) => { if (part.some(matches)) sources.add(source); } : undefined,
    });
    if (!members) return null;
    // If only a union contributes this method, preserve each arm's own overload ordering.
    // Unrelated union members cannot widen an otherwise ordered intersection.
    if (sources?.size === 1 && !sources.has(null)) {
      return resolveMemberCallReturn({ annotation: sources.values().next().value, name, scope, resolve, depth: depth + 1, callPath });
    }
    const matchingMembers = members.filter(matches);
    const ordered = !sources || sources.size <= 1;
    // apply subst so generic alias method returns (`type Box<T> = { get(): T[] }`) bind T
    // through every nested shape (arrays/tuples/unions), not just top-level references. but a method
    // that declares its OWN `<T>` shadows the outer alias's `T`: remap those signature-local params
    // to `unknown` first (shadowMethodTypeParams) so the outer subst can't capture them
    // (`Box<number[]>.get<T>(): T` must stay generic, not resolve the method's T to number[] ->
    // `_atMaybeArray` on the real foreign return, ie:11 throw). dropping instead of shadowing would
    // re-bind the bare `T` to the receiver arg via scope lookup - the same capture.
    // the canon's nullable check runs on the SUBSTITUTED annotation, so it sees the same
    // shape `resolve` failed on; an annotation-less (implicit-any) arm yields null here and
    // the canon widens the whole set to generic
    function substitutedReturn(member) {
      const returnAnnotation = memberCallReturnAnnotation(member);
      if (!returnAnnotation) return null;
      const memberSubst = subst ? shadowMethodTypeParams(memberCallSignature(member)?.typeParameters, subst) : null;
      return memberSubst ? applyAliasSubstDeep(unwrapTypeAnnotation(returnAnnotation), memberSubst) : returnAnnotation;
    }
    return foldOverloadReturns(matchingMembers, memberCallParams, member => {
      const signature = memberCallSignature(member);
      if (callPath && signature?.typeParameters?.params?.length) {
        const raw = unwrapTypeAnnotation(memberCallReturnAnnotation(member));
        const result = applySubst(raw, dropTypeParamSubst(signature.typeParameters, subst));
        if (result) {
          const inferred = applyCallSiteSubst(result, { node: signature, scope }, callPath);
          if (inferred) return inferred;
        }
      }
      const substituted = substitutedReturn(member);
      return substituted ? resolve(substituted) : null;
    }, substitutedReturn, callPath, ordered);
  }

  // Each union alternative must support the call. Its own overloads are selected together.
  // `chain` is the caller's already-walked result for the TOP annotation, when it has one - the
  // walk is pure in (annotation, scope) and unmemoized, so re-running it here can only reproduce
  // it. only depth 0 can be handed one; every recursion peels a different branch and walks its own
  function resolveMemberCallReturn({ annotation, name, scope, resolve, depth = 0, callPath, chain = null }) {
    if (depth > MAX_DEPTH) return null;
    // peel a leading TSParenthesizedType (`(A | B).m()`) so followTypeAliasChain sees the raw
    // union / intersection instead of bailing on the wrapper (branch-level peel is peelBranch)
    annotation = peelTSParenthesized(annotation);
    const { node: aliased, subst } = chain?.() ?? followTypeAliasChain(annotation, scope);
    // peel TSParenthesizedType so a method call on a parenthesized union / intersection branch
    // (`(A | B).m()`, `A & (B)`) resolves through the branch instead of bailing on the wrapper
    function peelBranch(branch) {
      return applySubst(peelTSParenthesized(unwrapTypeAnnotation(branch)), subst);
    }
    function recurse(peeled) {
      return resolveMemberCallReturn({ annotation: peeled, name, scope, resolve, depth: depth + 1, callPath });
    }
    if (isUnionType(aliased)) {
      let result = null;
      for (const branch of aliased.types) {
        const peeled = peelBranch(branch);
        // skip nullable / never branches - they contribute nothing to method-call
        // dispatch (null/undefined have no methods; never is unreachable). without
        // skip, every `Foo | null` shape bails the whole union when the null branch
        // lookup returns null. mirrors `findTypeMember`'s union filter
        if (isNullableOrNeverAnnotation(peeled)) continue;
        const branchResult = recurse(peeled);
        if (!branchResult) return null;
        result = commonType(result, branchResult);
        if (!result) return null;
      }
      return result;
    }
    // An intersection contributes one ordered overload set. getTypeMembers substitutes each
    // constituent's own type arguments before the shared selector sees its parameter and result.
    return resolveMemberCallReturnFromAnnotation({
      annotation: aliased ?? annotation, name, scope, resolve, depth, subst, callPath,
    });
  }

  // --- Typed-member dispatcher ---

  function resolveTypedMember(objectPath, name, callPath, readPath = objectPath) {
    let annotation, scope;
    let anchorPath = null;
    if (t.isIdentifier(objectPath.node)) {
      const binding = getScopeBinding({ scope: objectPath.scope, name: objectPath.node.name, path: objectPath });
      if (!binding) return null;
      // an annotation written ON a destructuring pattern describes the CONTAINER, not the name
      // bound out of it - the rule `resolveBindingType` states before its own direct-annotation
      // lane. reading a member off it answers for the container wherever the container happens to
      // carry that key (a numeric index on a tuple: `const [, ...rest]: [string, number[]]` made
      // `rest[0]` the source's element 0). `findNameAnnotation` reads none there, and the
      // `findExpressionAnnotation` fallback below walks the destructure key path to the binding's own slot
      annotation = unwrapTypeAnnotation(findNameAnnotation(binding.path));
      anchorPath = binding.path;
      scope = bindingAnnotationPath(anchorPath).scope;
      // identifier without explicit annotation: route through findExpressionAnnotation so
      // binding init chains get traversed (`const obj = wrap('a')` -> wrap's substituted
      // return -> TSTypeLiteral). without this, `obj.foo()` where obj has no `: T` annotation
      // bails even though the init resolves to a member-bearing type
      if (!annotation) {
        const info = findExpressionAnnotation(objectPath);
        if (info) {
          annotation = unwrapTypeAnnotation(info.annotation);
          scope = info.scope;
          anchorPath = info.path ?? anchorPath;
        }
      }
    } else {
      // delegate to findExpressionAnnotation for non-identifier shapes so that
      // TS wrappers, call expressions with return annotations, and chain expressions
      // all route through the same annotation lookup (incl. call-site generic subst)
      const info = findExpressionAnnotation(objectPath);
      if (info) {
        annotation = unwrapTypeAnnotation(info.annotation);
        scope = info.scope;
        anchorPath = info.path ?? null;
      }
    }
    const called = isCallShape(objectPath.node);
    if (!annotation && !called) return null;
    // Resolve type names where their declaration was written.
    function project(value, owner) {
      return resolveMemberOnAnnotation({ annotation: value, scope: owner, objectPath, name, callPath });
    }
    const member = annotation && (anchorPath
      ? withLookupPath(anchorPath, () => project(annotation, scope)) : project(annotation, scope));
    if (member || !called) return member || null;
    const overloaded = resolveOverloadMember(objectPath, name, project);
    if (overloaded || callPath || unwrapRuntimeExpr(readPath.node) !== objectPath.node) return overloaded;
    // A structural annotation can describe both an object literal and an array. On a
    // fresh call result, the stored argument keeps its family across simple observations.
    // Passing it to another consumer can change its prototype.
    const callee = resolveRuntimeExpression(objectPath.get('callee')).node;
    const yielded = callee?.returnType && calleeYieldedContainer(callee, {
      confined: true, typeRead: true, unwrap: unwrapRuntimeExpr,
    });
    if (!yielded?.slots.length) return null;
    const value = objectLevelPairedProperty(yielded.literal, name)?.match.value;
    const argument = forwardedArgument(objectPath, yielded.slots, value);
    return argument?.node ? resolveNodeType(argument) : null;
  }

  // the annotation-rooted half of `resolveTypedMember`, split out so a predicate-guard
  // annotation (structural interface target) routes through the SAME machinery as a
  // declared annotation - generics, class refs, method call returns and all
  function resolveMemberOnAnnotation({ annotation, scope, objectPath, name, callPath }) {
    // a bare type-parameter that SHADOWS a same-named class/interface (`function f<Box extends Strs>`
    // over an outer `class Box`) is NOT that declaration: its apparent type is the CONSTRAINT. resolve
    // through the constraint so members come from `Strs`, not the unrelated shadowed `Box`. gated on an
    // actual shadowing decl so non-colliding type-params keep their existing constraint-fallback path
    if (annotation.type === 'TSTypeReference' && annotation.typeName?.type === 'Identifier') {
      const typeParam = findTypeParameter(annotation.typeName.name, scope);
      if (typeParam && findTypeDeclaration([annotation.typeName.name], scope)) {
        if (!typeParam.constraint) return null;
        annotation = typeParam.constraint;
      }
    }
    // discriminated union narrowing: `if (x.kind === 'a') { x.data }` - restrict Foo
    // to the `{ kind:'a'; data: T }` branch. works for any serialisable LHS path
    // (Identifier / `this.x` / `obj.a.b`); computed / call-expression paths bail
    const narrowed = narrowDiscriminatedUnion(objectPath, annotation, scope, name);
    if (narrowed) {
      annotation = narrowed.annotation;
      if (narrowed.values) {
        if (callPath) return null;
        return foldUnionTypes([annotation, ...narrowed.values], value => value === annotation
          ? resolveAnnotatedMember(annotation, name, scope) : resolveNodeType(value));
      }
    }
    // peel type-alias chain ONLY when it ends in TSTypeQuery (`type Q = typeof X;
    // declare const m: Q`) so the typeof branch below dispatches. peeling unconditionally
    // would break generic alias resolution (`Box<string[]>` -> `{val: T}` loses subst)
    annotation = swapAliasToTSTypeQueryWithSubst(annotation, scope);
    // `x: typeof obj` of a binding declared or asserted with a type reads that type, not the value it holds
    const declared = annotation.type === 'TSTypeQuery' ? typeofSource(annotation, scope) : null;
    if (declared?.annotation) {
      annotation = declared.annotation;
      scope = declared.scope;
    }
    // `x: typeof obj` / `x: typeof fn` - follow TSTypeQuery to runtime binding, delegate there. a member
    // whose own path spells a type (`{ v: '' as string | string[] }`) is read through it by the lanes below
    if (annotation.type === 'TSTypeQuery' && !typeofSource(memberTypeQuery(annotation.exprName, name), scope)?.annotation) {
      const resolved = resolveTypeQueryBinding(annotation, scope);
      if (resolved?.node) {
        if (t.isObjectExpression(resolved.node)) {
          const result = resolveObjectMember(resolved, name, callPath);
          if (result) return result;
        }
        const ctx = resolveClassContext(resolved);
        if (ctx) {
          return resolveClassMember({
            classPath: ctx.classPath,
            name,
            isStatic: ctx.isStatic,
            callPath,
            receiverArgs: ctx.receiverArgs,
            viaPrototype: ctx.viaPrototype,
          });
        }
        return null;
      }
      // TSEnumDeclaration has no runtime binding path in `resolveTypeQueryBinding`; route
      // through `resolveAnnotatedMember` so `typeof Enum` member access hits the enum branch
      return resolveAnnotatedMember(annotation, name, scope);
    }
    // `x: Cls` where `Cls` is a real `class` declaration in scope - route method calls through
    // `resolveClassMember` (path-based, body-inference-capable) instead of annotation-only lookup,
    // so unannotated methods like `test() { return this.getStr(); }` still resolve their return type.
    // class type-args from the annotation (`Cls<string>`) propagate as classSubst so method
    // return types referring to class type-params resolve concretely
    if (callPath) {
      const classPath = findClassPathForTypeReference(annotation, scope);
      if (classPath) {
        const result = resolveClassMember({
          classPath, name, isStatic: false, callPath, receiverArgs: getTypeArgs(annotation)?.params, declaredReceiver: true,
        });
        if (result) return result;
      }
    }
    // lazily resolve the type-param subst for a generic receiver used without explicit args. follow
    // the alias CHAIN (not just the top alias): a member of `Outer<string>` where `type Outer<A> =
    // Inner<A>` belongs to Inner, so the map must key Inner's params (`{X:string}`), not Outer's
    // (`{A:string}`). keying the top alias lets Outer's `A` binding capture an inner default that
    // lexically references an unrelated outer `type A` - the chain builder is capture-avoiding and
    // gates defaults, so the member type's own default resolves in its decl scope instead
    // ONE walk for both readers: the call lane's first act is this same walk on this same
    // (annotation, scope). still a thunk, because the property lane below resolves nothing when
    // the member lookup misses, and the walk rebuilds a subst map per generic hop
    let chain;
    function aliasChain() {
      return chain ??= followTypeAliasChain(peelTSParenthesized(annotation), scope);
    }
    function resolve(p) {
      const { subst } = aliasChain();
      return withTypeReferenceScope(p, scope, at => subst ? substituteTypeParams(p, subst, at, 0) : resolveTypeAnnotation(p, at));
    }
    // A value read also accounts for a missing runtime index.
    if (!callPath) {
      const memberType = findRuntimeTypeMember({ objectType: annotation, key: name, scope });
      return memberType && resolve(memberType);
    }
    // method call: merge return types across overloads, recursing into union branches
    return resolveMemberCallReturn({ annotation, name, scope, resolve, callPath, chain: aliasChain });
  }

  // recover a class NodePath from a type-declaration scan: locates the decl by name (bare) or
  // segments (qualified), then lifts the raw node to a real path. covers an ambient `declare class`
  // and namespace-nested classes that babel doesn't bind as scope values; null when not a class
  function classPathFromTypeDeclaration(nameOrSegments, scope) {
    const decl = nameOrSegments && findTypeDeclaration(nameOrSegments, scope);
    return t.isClassDeclaration(decl) ? nodePathInScope(decl, scope, CLASS_PATH_TYPES) : null;
  }

  // resolve `TSTypeReference { typeName: X }` to a NodePath of `class X { ... }` in scope, or null
  // if it points at an interface / non-class. a bare Identifier tries the O(1) value binding first,
  // then falls back to the type-declaration scan for an ambient `declare class` (which babel doesn't
  // bind as a value); a qualified `NS.Cls` / `A.B.Cls` goes straight to that scan
  function findClassPathForTypeReference(annotation, scope) {
    if (annotation?.type !== 'TSTypeReference') return null;
    const { typeName } = annotation;
    if (typeName?.type === 'Identifier') {
      // a type parameter shadowing an outer `class` of the same name (`function f<Box extends ...>`)
      // is NOT that class: babel registers no value binding for the type-param, so getBinding would
      // wrongly return the outer class. bail so the caller resolves the type-param via its constraint
      if (findTypeParameter(typeName.name, scope)) return null;
      const binding = getScopeBinding({ scope, name: typeName.name });
      if (binding) return t.isClassDeclaration(binding.path.node) ? binding.path : null;
      // no value binding -> an ambient `declare class` (oxc binds it, babel doesn't); recover it
      // through the same scan the qualified branch uses so the element type stays parser-consistent
      return classPathFromTypeDeclaration(typeName.name, scope);
    }
    const segments = isQualifiedNameNode(typeName) ? collectQualifiedSegments(typeName) : null;
    return classPathFromTypeDeclaration(segments, scope);
  }

  // `obj[k]` where `k: keyof X` (or a parameter constrained to it) and X is the object's type: the key
  // ranges over X's keys, so the read is whatever a static read of each key reads, folded - a write or a
  // hand-out the static read honours is honoured here too. keys X does not name one by one (an index
  // signature, an open type parameter) leave the fold to the type `X[keyof X]`. a call through the key
  // reads each value's return, which neither answers: generic there
  function resolveKeyofSelfMember(path, callPath, objectType, objectScope) {
    if (callPath) return null;
    const propInfo = findExpressionAnnotation(path.get('property'));
    const index = propInfo && unwrapTypeAnnotation(propInfo.annotation);
    if (!index || !isKeyofTargeting(index, objectType, propInfo.scope)) return null;
    const members = getTypeMembers({ objectType, scope: objectScope });
    const keys = members && staticKeyNames(members);
    if (!keys) return resolveTypeAnnotation({ type: 'TSIndexedAccessType', objectType, indexType: index }, objectScope);
    const objectPath = path.get('object');
    return keys.length ? foldUnionTypes(keys, key => resolveMemberOfObjectPath(objectPath, key, null)) : null;
  }

  // ... and an object read through its own binding (`obj[k]`, `k: keyof typeof obj`) has no annotation
  // to hand over: its type is `typeof obj`
  function resolveKeyofTypeofMember(path, callPath) {
    const { object } = path.node;
    if (object?.type !== 'Identifier') return null;
    return resolveKeyofSelfMember(path, callPath, { type: 'TSTypeQuery', exprName: { type: 'Identifier', name: object.name } }, path.scope);
  }

  // computed dynamic-key member access via TSIndexSignature: `obj[k]` where
  // `obj: { [key: string]: V }` resolves to V. unions are peeled (skip null/undefined),
  // first remaining branch's index signature wins. returns Type Object or null
  function resolveIndexSignatureMember(path, callPath) {
    const objInfo = findExpressionAnnotation(path.get('object'));
    if (!objInfo) return null;
    const unwrapped = unwrapTypeAnnotation(objInfo.annotation);
    if (!unwrapped) return null;
    const { node: aliased, subst } = followTypeAliasChain(unwrapped, objInfo.scope);
    const target = aliased ?? unwrapped;
    const keyKind = indexAccessKeyKind(path);
    function lookup(typeNode) {
      return resolveIndexSignatureValue(typeNode, objInfo.scope, subst, keyKind);
    }
    // resolve one index-signature value (`{ annotation, scope }`) to a type. a CALL through the index
    // (`d[k]()`) yields the value's RETURN, not the value itself; a non-function value isn't statically
    // callable (`number[]()` throws at runtime) -> null (generic helper), not the non-callable value type
    function resolveIndexValue(found) {
      if (!found) return null;
      if (callPath) {
        const ret = functionTypeReturnAnnotation(unwrapTypeAnnotation(found.annotation));
        return ret ? resolveTypeAnnotation(ret, found.scope) : null;
      }
      return resolveTypeAnnotation(found.annotation, found.scope);
    }
    if (isUnionType(target)) {
      // WIDEN across the union's per-branch index values (`{ [k]: number[] } | { [k]: string }`): fold them
      // - convergent / compatible containers -> the widened type, DIVERGENT -> null (generic), NOT the first
      // arm (a value matching a later branch would hit a type-specific Maybe and throw at ie:11)
      const infos = target.types
        .map(b => applySubst(unwrapTypeAnnotation(b), subst))
        .filter(b => !isNullableOrNeverAnnotation(b))
        .map(lookup);
      if (!infos.length || infos.some(info => !info)) return resolveKeyofSelfMember(path, callPath, unwrapped, objInfo.scope);
      const vals = [];
      for (const info of infos) {
        const v = resolveIndexValue(info);
        if (v) {
          vals.push(v);
          continue;
        }
        // an index whose value is a non-nullable type we couldn't resolve makes the union uncertain ->
        // widen rather than collapse to the branches that resolved (a nullable value stays skippable).
        // the CALL case widens identically: a callable arm whose RETURN fails to resolve (or is void)
        // yields null here too, and dropping it would over-narrow the surviving arms into a wrong
        // Maybe - matching the sibling call-return union widens
        if (!isNullableOrNeverAnnotation(unwrapTypeAnnotation(info.annotation))) return null;
      }
      return vals.length ? foldUnionTypes(vals, r => r) : null;
    }
    const info = lookup(target);
    if (info) return resolveIndexValue(info);
    return resolveKeyofSelfMember(path, callPath, unwrapped, objInfo.scope);
  }

  // --- Runtime dispatch (receiver-aware MemberExpression) ---

  // can any `?.` hop in this member spine short-circuit? walks DOWN the object / callee
  // links: a `?.` hop whose receiver may be nullish (marked / nullable / unresolvable)
  // makes the WHOLE enclosing chain result possibly-undefined. babel encodes hops as
  // dedicated Optional* node types, ESTree as plain member / call hops with `optional`
  // flags - both carry `optional: true` on the `?.` hop itself, so the same walk serves
  // both. ChainExpression (an ESTree wrapper an inner spine link may carry) passes
  // through - babel cannot represent the paren boundary distinctly, so both parsers
  // over-mark the parenthesized `(o?.a).b` form identically (degrade-safe)
  function chainMayShortCircuit(path) {
    // the canonical peel, not a hand-rolled `ChainExpression` arm: a TS wrapper BETWEEN hops
    // (`a?.b!.c`, `(a?.b as T).c`) is transparent at runtime and the optional chain short-circuits
    // straight through it. stopping at the wrapper reported the whole chain as never-nullish, and
    // the truthy-fold then collapsed `a?.b!.c || "x"` to the left arm's family
    for (let cur = peelSkippableWrapperPath(path); cur?.node;) {
      const { type } = cur.node;
      if (type !== 'MemberExpression' && type !== 'OptionalMemberExpression'
        && type !== 'CallExpression' && type !== 'OptionalCallExpression') return false;
      const next = peelSkippableWrapperPath(type === 'CallExpression' || type === 'OptionalCallExpression'
        ? cur.get('callee') : cur.get('object'));
      if (cur.node.optional === true) {
        const receiver = resolveNodeType(next);
        if (!receiver || receiver.mayBeNullish || isNullableOrNever(receiver)) return true;
      }
      cur = next;
    }
    return false;
  }

  // an optional chain short-circuits to undefined instead of throwing, so a member / call
  // result inside one may be undefined at runtime whenever some `?.` hop's receiver may
  // be nullish. plain (non-chain) access on a nullish receiver throws transformed or not,
  // so it stays unmarked (throw parity keeps the receiver narrow sound)
  function resolveFromMemberExpression(path, callPath) {
    const result = resolveFromMemberExpressionInner(path, callPath);
    if (!result || result.mayBeNullish) return result;
    // an optional CALL (`o.m?.()`) short-circuits on a nullish member VALUE (an optional
    // method) - a possibility the receiver spine below the member cannot see, so the
    // `?.()` flag marks the return directly (a required member under `?.()` over-marks,
    // which only degrades a logical fold to generic - safe)
    if (callPath?.node.optional === true) return result.mark('mayBeNullish');
    return chainMayShortCircuit(path) ? result.mark('mayBeNullish') : result;
  }

  // the literal PATH a member spine names (`o.k0.k1` over `const o = { k0: { k1: X } } ` -> X's
  // path), so a hop past the first resolves off the shape the source wrote. each hop asks the
  // FLOW-aware slot read first: a null there is an observed or unknown writer, and walking the
  // init past one would narrow to a value the runtime may not hold
  function resolveMemberLiteralPath(memberPath, depth = 0) {
    if (depth > MAX_DEPTH || !memberPath?.node || !isMemberLike(memberPath)) return null;
    const key = resolveMemberPropertyName(memberPath);
    if (key === null || key === undefined) return null;
    const objectPath = resolveRuntimeExpression(memberPath.get('object'));
    const base = literalPathOf(objectPath, depth + 1);
    // ... and a hop the file WROTE holds the written value, not the init this walk would descend: the
    // fold above still answers for the slot itself, whatever it holds
    if (!base || !resolveObjectFieldFlow(base, key) || memberHopWritten(memberPath)) return null;
    const valuePath = walkObjectLiteralPropertyPath(base, key);
    const value = valuePath?.node ? resolveRuntimeExpression(valuePath) : null;
    // ... a literal nested in a call-fresh one belongs to the same call: its parameter slots read
    // that call's arguments too
    if (value?.node?.type === 'ObjectExpression' && callFreshLiterals.has(base.node)) {
      callFreshLiterals.set(value.node, callFreshLiterals.get(base.node));
    }
    return value;
  }

  // does a write the file recorded reach the slot a member chain names, off the binding it is rooted
  // at (`pathSlotWritten`)? a chain the key canon cannot read names no slot to ask about
  function memberHopWritten(memberPath) {
    const keys = [];
    let cur = memberPath;
    while (isMemberLike(cur)) {
      const key = resolveMemberPropertyName(cur);
      if (key === null || key === undefined) return false;
      keys.unshift(key);
      cur = cur.get('object');
    }
    return pathSlotWritten(cur, keys);
  }

  // the literals CALLS yield: fresh per call like a getter's, so a member reads off the literal
  // itself - the writer fold has no earlier holder to account for. each records the call that
  // yielded it last - the literal node is the callee's, shared by every call of it, and the typing
  // read that asks follows the call it names right away - with the parameters the detect canon
  // proves hold their arguments in its slots (`calleeYieldedContainer`), so a slot naming one of
  // them reads that call's argument
  const callFreshLiterals = new WeakMap();
  // Match the returned reference itself: a same-named binding inside a getter can be different.
  function forwardedArgument(callPath, slots, value) {
    const source = unwrapRuntimeExpr(value);
    if (source?.type !== 'Identifier') return null;
    const slot = slots?.find(entry => entry[2] === source);
    const coords = slot && resolveCallArgumentCoords(callPath.node.arguments, slot[1], isMutatedStatic);
    return coords && callArgumentPathAt(cachedContainerPaths(callPath, 'arguments'), coords);
  }
  // the object literal PATH a resolved value stands for: the literal itself, the one a member
  // spine names, or the one a CALL yields - so every hop reads off the shape the source wrote
  function literalPathOf(objectPath, depth = 0) {
    if (t.isObjectExpression(objectPath?.node)) return objectPath;
    const spine = resolveMemberLiteralPath(objectPath, depth) ?? callYieldedLiteralPath(objectPath);
    return t.isObjectExpression(spine?.node) ? spine : null;
  }

  // node types are compared by NAME: the statement and function shapes spell the same on both
  // parsers, and the estree bridge exposes no predicate for them
  const CALLEE_TYPES = new Set(['ArrowFunctionExpression', 'FunctionExpression', 'FunctionDeclaration']);
  const PLAIN_STATEMENT_TYPES = new Set(['VariableDeclaration', 'ExpressionStatement']);
  // the literal PATH a call to a local function yields (`f()` over `const f = () => ({ k: X })`):
  // its sole return expression - an expression body, or a block of plain statements ending in a
  // `return` - resolved to an object literal, off a callee with no return annotation (a declared
  // type stays the answer) and no wrapper (an async / generator body yields a promise / iterator).
  // a slot the callee fills from a PARAMETER reads this call's argument where the detect canon proves
  // the parameter holds it, and stays the parameter's own read - typed by the caller census from
  // every argument this file passes - otherwise. the shape is what typing reads; which VALUE the
  // call hands back is the detect canon's question, asked there with its own proofs
  function callYieldedLiteralPath(callPath) {
    if (callPath?.node?.type !== 'CallExpression') return null;
    const callee = resolveRuntimeExpression(callPath.get('callee'));
    const fn = callee?.node;
    if (!fn || !CALLEE_TYPES.has(fn.type) || fn.async || fn.generator || fn.returnType || fn.declare) return null;
    const body = callee.get('body');
    if (!body?.node) return null;
    const statements = body.node.type === 'BlockStatement' ? body.get('body') : null;
    const last = statements?.at(-1);
    if (statements && (last?.node?.type !== 'ReturnStatement' || !last.node.argument
      || statements.slice(0, -1).some(item => !PLAIN_STATEMENT_TYPES.has(item.node?.type)))) return null;
    const returned = statements ? last.get('argument') : body;
    const literal = resolveRuntimeExpression(returned);
    if (literal?.node?.type !== 'ObjectExpression') return null;
    const yielded = calleeYieldedContainer(fn, { typeRead: true, unwrap: unwrapRuntimeExpr });
    callFreshLiterals.set(literal.node, {
      returned, callPath, slots: yielded?.literal === literal.node ? yielded.slots : null,
      confined: yielded?.confined.size === dropLeadingThisParam(fn.params).length,
    });
    return literal;
  }

  function resolveFromMemberExpressionInner(path, callPath) {
    const name = resolveMemberPropertyName(path);
    // empty-string keys (`obj[""]`) are valid static names - only a NULL result means the
    // key is dynamic (a truthiness guard dropped them into the index-signature branch)
    if (name === null || name === undefined) {
      // computed access without a statically-resolvable key (`obj[k]` where k is a
      // dynamic Identifier): if obj has a TSIndexSignature, resolve to its value type.
      // routed via the same annotation-based path as named member access for symmetry
      if (path.node.computed) return resolveIndexSignatureMember(path, callPath) ?? resolveKeyofTypeofMember(path, callPath);
      return null;
    }
    return resolveMemberOfObjectPath(path.get('object'), name, callPath);
  }

  // the member `name` read off the OBJECT a path names - the one ladder every spelling of that
  // read walks: a literal spine, a class instance or constructor, an ambient class, a merged
  // namespace, a typed member, a structural predicate narrow. the member expression asks it for
  // its object; the nested destructure walk asks it for the container a pattern hop reads off, so
  // `const { data: { at } } = c` answers what `const { at } = c.data` and `c.data.at` answer
  function resolveMemberOfObjectPath(originalObjectPath, name, callPath, unionHints = false) {
    const objectPath = resolveRuntimeExpression(originalObjectPath);
    // `this.X` inside an object-method (possibly through arrow nesting): resolve `this`
    // to the parent ObjectExpression and route through the flow-aware field resolver.
    // mutually exclusive with the class-`this` path - `resolveThisObject` returns null when
    // a closer ClassBody wraps. without this branch, `(() => this.arr)().at(0)` inside an
    // ObjectMethod degrades to generic `_at` even when the literal owns `arr: [...]`
    if (t.isThisExpression(objectPath.node)) {
      const objAnchor = resolveThisObject(originalObjectPath);
      if (objAnchor) {
        const result = resolveObjectFieldFlow(objAnchor, name, callPath, unionHints);
        if (result) return result;
      }
    }
    // ... and an object that is itself a MEMBER (`o.k0.k1.at`) names the literal one hop further
    // down: the spine folds to the value that hop reads, so the SECOND property hop resolves like
    // the first. without it the receiver's type is lost past hop one, which costs both ways - an
    // unknown type injects a single-family method's family even where the literal provably is not
    // of it, and degrades a multi-family one to the generic dispatcher
    const spine = literalPathOf(objectPath);
    // ... a fresh literal - a call's, a getter's - a BINDING holds (`const w = make()`) is that
    // binding's container, and a slot the file wrote through it holds no value the literal spells: the
    // census knows a call's (`pathSlotWritten`), a getter's is asked of the binding's own uses
    const heldFresh = spine && t.isIdentifier(originalObjectPath.node)
      && (callFreshLiterals.has(spine.node) ? pathSlotWritten(originalObjectPath, [name])
        : isGetterFreshLiteral(spine.node) && arrayElementsMayBeRetyped(originalObjectPath, originalObjectPath));
    if (spine && !heldFresh) {
      // resolveObjectFieldFlow is the flow-aware superset of resolveObjectMember: it delegates
      // calls and getters to resolveObjectMember. Value reads, including method slots,
      // fold the initializer with every reachable reassignment (`o.data = "s"`) and
      // inside-method `this.data = ...` write, and also covers the missing-property external-write
      // case. routing it FIRST (instead of resolveObjectMember, which returns the init type and
      // is blind to later reassignments) keeps the narrow sound; a null result means an unknown /
      // ambiguous writer set, so we do NOT fall back to the init-type-only path
      // ... and a literal a GETTER builds fresh per read is read off itself: the writer fold has no
      // earlier caller to account for, and refusing there lost the type of every slot below a getter
      // a slot of a call-fresh literal naming a callee PARAMETER holds the argument the call passed
      const fresh = callFreshLiterals.get(spine.node);
      if (fresh && pathSlotWritten(fresh.returned, [name])) return null;
      const argument = fresh
        ? forwardedArgument(fresh.callPath, fresh.slots, walkObjectLiteralPropertyPath(spine, name)?.node) : null;
      if (argument?.node) {
        if (unionHints || callPath) return null;
        const value = resolveNodeType(argument);
        return fresh.confined || value?.primitive ? value : null;
      }
      const flowResult = resolveObjectFieldFlow(spine, name, callPath, unionHints, !callPath)
        ?? (!unionHints && (isGetterFreshLiteral(spine.node) || callFreshLiterals.has(spine.node))
          ? resolveObjectMember(spine, name, callPath) : null);
      if (flowResult) return flowResult;
    }
    const ctx = resolveClassContext(objectPath);
    if (ctx) {
      // `viaThis` marks a `this`-rooted static read: the runtime receiver can be a subclass,
      // so a static-field narrow must verify no subclass shadow is reachable
      const result = resolveClassMember({
        classPath: ctx.classPath,
        name,
        isStatic: ctx.isStatic,
        callPath,
        receiverArgs: ctx.receiverArgs,
        viaPrototype: ctx.viaPrototype,
        viaThis: t.isThisExpression(objectPath.node),
        read: ctx.isStatic || t.isThisExpression(objectPath.node) ? originalObjectPath : null,
        unionHints,
      });
      if (result) return result;
    }
    // Hint queries project the same runtime field flow, including its escape/shadow gates.
    // Annotation unions are handled by the caller; the remaining routes return single Types.
    if (unionHints) return null;
    // ambient `declare class X { static make() }` - X reference has no scope binding in babel
    // so `resolveClassContext(objectPath)` misses. fall back to ambient-decl lookup keyed by
    // identifier name; reuses the same class-member resolution path so method-level type-arg
    // substitution (`X.make<string>()`) works the same as for runtime `class X`
    if (objectPath.node?.type === 'Identifier') {
      const ambientClass = findAmbientClassPath(objectPath.node.name, objectPath.scope);
      if (ambientClass) {
        const result = resolveClassMember({ classPath: ambientClass, name, isStatic: true, callPath });
        if (result) return result;
      }
      // a STANDALONE namespace reaches no class body, so the merged-namespace lane above never ran
      // for it and `NS.f()` stayed unresolved while the very same export merged onto a class
      // resolved. the lookup is keyed by SEGMENTS and never needed a class - it is asked here for
      // the namespace's own name, once, since a namespace has no super chain to walk
      const namespaceExport = namespaceExportReturn({
        hostName: objectPath.node.name, scope: objectPath.scope, name, callPath,
      });
      if (namespaceExport !== undefined && namespaceExport !== null) return namespaceExport;
      // the VALUE half of the same question: `NS.v` where the namespace exports a const. its name
      // lives on the DECLARATOR, which is why no lookup here used to see it at all
      const valuePath = findNamespacedValuePath([objectPath.node.name, name], objectPath.scope);
      if (valuePath?.node.id?.typeAnnotation) {
        const valueType = withLookupPath(valuePath, () => resolveTypeAnnotation(valuePath.node.id.typeAnnotation, valuePath.scope));
        if (valueType) return valueType;
      }
    }
    // Both the implementation and its overloads describe the result before any writes through a saved holder.
    if (isCallShape(objectPath.node) && objectPath.node !== originalObjectPath.node
      && pathSlotWritten(originalObjectPath, [name])) return null;
    // try typed member on resolved path first, then on original path (in case resolvePath lost annotation)
    const typed = resolveTypedMember(objectPath, name, callPath, originalObjectPath)
      || (objectPath !== originalObjectPath ? resolveTypedMember(originalObjectPath, name, callPath) : null);
    if (typed) return typed;
    // structural predicate narrow: `isF(v)` proves `v` matches interface F inside the
    // guarded branch, but F is structural - no $-Type carries its members, so the typed
    // walks above can't see them. route the predicate's annotation through the same
    // machinery a declared annotation takes (generics / class refs / method call returns)
    const guardedPath = peelTransparentWrapperPath(originalObjectPath);
    if (guardedPath.node.type === 'Identifier') {
      const guard = findAnnotationGuard(guardedPath);
      if (guard) {
        return resolveMemberOnAnnotation({
          annotation: unwrapTypeAnnotation(guard.annotation),
          scope: guard.scope,
          objectPath: originalObjectPath,
          name,
          callPath,
        });
      }
    }
    return null;
  }

  // Built-in effects only apply while the receiver still dispatches to that method.
  function arrayMethodIsOverridden(key, path, node = path?.node) {
    const member = key ?? MUTATED_STATIC_PINNED;
    const read = path && { node, path, inheritedGetter: true };
    return isMutatedStatic('Array.prototype', member, read) || isMutatedStatic('Object.prototype', member, read)
      || !read && isWrittenContainerSlot(null, [key]);
  }

  // A Babel rewrite can detach the original callee or clone an argument. Only the callee
  // invokes the method on the array. Both parsers also keep the reference through TS wrappers.
  function callsArrayMember(value, node) {
    const host = value.parentPath?.node;
    if (!host || host.type === 'NewExpression') return false;
    if (invocationCalleeOf(host) === node) return true;
    return value.listKey !== 'arguments' && (!Number.isInteger(host.start) || !Number.isInteger(node.start) || host.start === node.start)
      && !nodeHoldsChild(host, node);
  }

  // arr[0], arr[1] - numeric index access on array literals
  // element-type precision follows the initializer or the final dominating element assignment.
  // Other writers between creation and the read - a mutating method
  // (`a.unshift(v)` / `a.fill(v)`) or an escape of the binding (call argument, untracked alias,
  // spread - the holder may write elements) invalidate it. whitelist: a reference is safe
  // only as a member-access READ off the binding with a non-mutating key. the object-field
  // twin consults its external-write fold the same way; destructure-time element reads
  // (`const [x] = a`) copy the value at execution and stay exempt.
  // An unknown or patched method can change the elements. Even a property read may run a getter.
  function arrayMethodMayRetype(key, hint = ARRAY_METHODS.get(key)) {
    // A bare resolution directive describes a return value only.
    return typeof hint !== 'object' || !!hint.mutatesElements || arrayMethodIsOverridden(key);
  }

  // Array iteration methods pass the source array to the callback. An unused parameter
  // or a read of one element cannot replace it; passing the array on can.
  function callbackMayRetype(call, hint) {
    const runtimeIndex = hint?.callbackReceiverArgument;
    if (runtimeIndex === undefined || !call?.node.arguments?.length) return false;
    const callee = call.get('callee');
    const offset = memberKeyName(callee.node) === 'call' ? 1 : 0;
    const arg = cachedContainerPaths(call, 'arguments')[offset];
    if (!arg) return false;
    const fn = resolveRuntimeExpression(arg);
    if (!fn?.node.params) return true;
    if (fn.node.type !== 'ArrowFunctionExpression' && referencesArgumentsObject(fn.node)) return true;
    const index = runtimeIndex + (hasLeadingThisParam(fn.node.params) ? 1 : 0);
    if (fn.node.params.slice(0, index + 1).some(param => param.type === 'RestElement')) return true;
    const param = fn.node.params[index];
    if (!param) return false;
    if (param.type !== 'Identifier') return true;
    const params = liveSourceIdentifierPaths(cachedContainerPaths(fn, 'params')[index]);
    return !params.length || params.some(path => {
      const binding = getScopeBinding({ scope: path.scope, name: param.name, path });
      const refs = binding && collectBindingReferences(binding, path);
      return !refs || refs.some(callbackArrayReferenceMayRetype);
    });
  }

  function callbackArrayReferenceMayRetype(ref) {
    const use = climbTransparentWrapperPath(ref);
    const member = use.parentPath;
    if (!isMemberLike(member) || member.node.object !== use.node || isMemberWriteHost(member)) return true;
    const name = memberKeyName(member.node);
    const value = climbTransparentWrapperPath(member, true);
    if (!callsArrayMember(value, value.node)) return arrayMethodIsOverridden(name, member);
    const hint = ARRAY_METHODS.get(name);
    return arrayMethodMayRetype(name, hint) || hint?.callbackReceiverArgument !== undefined;
  }

  // A cached reference keeps its source call role when a rewrite clones its receiver into a helper.
  const arrayMemberCallRoles = new WeakMap();
  // References in the binding's own scope can share a read-only proof across receiver rewrites.
  // Recrawls of that scope, changed reference bags and resets invalidate it; captured uses and
  // positional writes never enter it, since a child crawl can preserve the outer bag's identity.
  let arrayElementReadProofs = new WeakMap();

  // The operand of ordinary iteration is consumed by the protocol. Object spread enumerates keys.
  function iteratesValues(use) {
    const host = use.parentPath;
    return host?.node.type === 'ForOfStatement' && !host.node.await && host.node.right === use.node
      || host?.node.type === 'SpreadElement' && host.node.argument === use.node && host.parentPath.node.type !== 'ObjectExpression';
  }

  // `permutes`, where the caller passes a list, asks the UNION question instead: which values may an
  // element hold at all. a permuting mutator is admitted there and records its key, and a destructure
  // of the binding - which copies elements out and puts none back - reads like any other read.
  // `followed` is the reference an alias read reached this binding through (`aliasedElementsMayBeRetyped`)
  // eslint-disable-next-line max-statements -- keep the shared read-only proof and per-read writer fold in one pass
  function arrayElementsMayBeRetyped(objectPath, anchorPath, {
    elementWrites = null, permutes = null, followed = null, literalPath = null, dispatchOnly = false,
  } = {}) {
    // Follow the holder's references only along the path to this array.
    let heldKeys;
    objectPath = peelSkippableWrapperPath(objectPath);
    while (isMemberAccessNode(objectPath?.node)) {
      (heldKeys ??= []).push(memberKeyName(objectPath.node));
      objectPath = peelSkippableWrapperPath(objectPath.get('object'));
    }
    if (!t.isIdentifier(objectPath?.node)) return false;
    const binding = getScopeBinding({ scope: objectPath.scope, name: objectPath.node.name, path: objectPath });
    if (!binding) return true;
    if (heldKeys && !heldKeys.includes(null)) {
      // A slot initialized from a named array sees writes through that original binding as well.
      let slot = objectPath;
      for (let i = heldKeys.length - 1; slot && i >= 0; i--) slot = walkObjectLiteralPropertyPath(slot, heldKeys[i]);
      if (t.isIdentifier(slot?.node) && arrayElementsMayBeRetyped(slot, anchorPath, { followed: slot.node })) return true;
    }
    const sourceName = elementWrites && objectBindingName(literalPath);
    const sourceBinding = sourceName && getScopeBinding({ scope: literalPath.scope, name: sourceName, path: literalPath });
    if (sourceName && !sourceBinding) return true;
    const nativeReferences = binding.referencePaths ?? binding.references;
    const cacheable = elementWrites && !permutes && !followed && sourceBinding === binding
      && !binding.constantViolations?.length && Array.isArray(nativeReferences);
    const proof = (cacheable || permutes && literalPath && !followed && !binding.constantViolations?.length)
      && arrayElementReadProofs.get(literalPath.node);
    if (proof && proof.binding === binding && proof.references === nativeReferences
      && proof.size === nativeReferences.length && (!proof.iterations || proof.iterations.every(iteratesValues))) {
      return !!proof.iterations && !dispatchOnly;
    }
    let references = collectBindingReferences(binding, anchorPath);
    const lifetimeBinding = sourceBinding || binding;
    const hasAlias = elementWrites && (sourceBinding && sourceBinding !== binding || references?.some(ref => ref.parentPath?.node?.type
      === 'VariableDeclarator' && ref.parentPath.node.init === ref.node && t.isIdentifier(ref.parentPath.node.id)));
    // Ordinary element reads keep the original reference fast path; named aliases share the cached closure.
    const closure = hasAlias && sourceBinding ? computeObjectAliasClosure(literalPath) : null;
    if (hasAlias && (!closure || closure.keys().some(alias => alias !== binding && isReassignedBeyondDeclarator(alias)))) return true;
    if (closure) references = closure.keys().flatMap(alias => collectBindingReferences(alias, anchorPath) ?? [null]).toArray();
    // a null reference set is "could not be enumerated", the opposite verdict from an empty one:
    // a retyping write may exist and simply be out of reach. reading it as "no references" kept
    // the element narrow alive over writes nobody looked at
    if (!references || references.includes(null)) return true;
    let iterations = null;
    let readOnly = !hasAlias && !!binding.scope;
    for (const ref of references) {
      // A for-of RHS belongs to the loop scope even when it reads the immediately enclosing binding.
      if (ref.scope !== binding.scope && !(ref.scope?.parent === binding.scope && ref.parentPath?.node?.type === 'ForOfStatement'
        && ref.parentPath.node.right === ref.node)) readOnly = false;
      if (ref.node === followed) continue;
      const receiver = climbTransparentWrapperPath(ref);
      let member = receiver.parentPath;
      // Babel keeps the source parent on the binding reference after replacing a method read with its helper.
      let memberNode = receiver.parent ?? member?.node;
      // a WHOLE-binding write (plain reassign / update / for-x head) is the FLOW layer's
      // domain: it replaces the value the element read resolves from, so it is not an
      // element retype - a conditional / undominated form already bails upstream, and a
      // dominating one IS the value source (treating it as unsafe over-bailed
      // `x = [[9]]; x[0].at(0)`)
      if (memberNode?.type === 'AssignmentExpression' && memberNode.left === ref.node) continue;
      if (memberNode?.type === 'UpdateExpression' && memberNode.argument === ref.node) continue;
      if ((memberNode?.type === 'ForOfStatement' || memberNode?.type === 'ForInStatement')
        && memberNode.left === ref.node) continue;
      // NON-RETENTIVE reads never leak the reference to a potential writer: a typeof /
      // void / logical-not (any unary but `delete`), a binary comparison / arithmetic
      // (boolean / primitive result), and a bare condition slot (`if (x)`, `c ? ... :`,
      // `switch (x)`). a logical / conditional BRANCH position forwards the reference
      // and stays an escape
      if (memberNode?.type === 'UnaryExpression' && memberNode.operator !== 'delete') continue;
      if (memberNode?.type === 'BinaryExpression') continue;
      if ((memberNode?.type === 'IfStatement' || memberNode?.type === 'WhileStatement'
        || memberNode?.type === 'DoWhileStatement' || memberNode?.type === 'ConditionalExpression')
        && memberNode.test === ref.node) continue;
      if (memberNode?.type === 'SwitchStatement' && memberNode.discriminant === ref.node) continue;
      if (permutes && ((memberNode?.type === 'VariableDeclarator' && memberNode.init === ref.node
        && isDestructurePattern(memberNode.id)) || (memberNode?.type === 'AssignmentExpression'
        && memberNode.right === ref.node && isDestructurePattern(memberNode.left)))) continue;
      const isMemberRead = (memberNode?.type === 'MemberExpression' || memberNode?.type === 'OptionalMemberExpression')
        && memberNode.object === receiver.node;
      if (closure && memberNode?.type === 'VariableDeclarator' && memberNode.init === ref.node
        && t.isIdentifier(memberNode.id)) continue;
      if (!isMemberRead) {
        if (memberNode?.type === 'CallExpression' && memberNode.arguments[0] === receiver.node && member.node === memberNode) {
          const callee = member.get('callee');
          const method = callee.node.type === 'Identifier' && memberNode.arguments.length === 1
            ? instanceDispatcherKey(callee) : pairedInstanceDispatcher(callee)?.method;
          if (!arrayMethodMayRetype(method)) continue;
        }
        if (!dispatchOnly || !elementWrites) return true;
        if (!iteratesValues(receiver)) return true;
        (iterations ??= []).push(receiver);
        continue;
      }
      // Only a use of this particular stored array can replace its elements. Follow an
      // alias from the matching slot, and keep independent sibling slots out of its flow.
      if (heldKeys) {
        let matches = true;
        for (let i = heldKeys.length - 1; i >= 0; i--) {
          const expected = heldKeys[i];
          if (!isMemberAccessNode(memberNode)) return true;
          const key = memberKeyName(memberNode);
          if (key !== null && expected !== null && key !== expected) {
            matches = false;
            break;
          }
          if (isMemberWriteHost(member)) return true;
          const use = climbTransparentWrapperPath(member);
          const parent = use.parentPath;
          if (parent?.node.type === 'VariableDeclarator' && parent.node.init === use.node && t.isIdentifier(parent.node.id)) {
            if (i || arrayElementsMayBeRetyped(parent.get('id'), anchorPath, { followed: use.node })) return true;
            matches = false;
            break;
          }
          if (!i && parent?.node.type === 'AssignmentExpression' && parent.node.right === use.node
            && isGeneratedMemoDeclarator(bindingDeclaratorPath(parent.node.left.name, parent.scope)?.node)) {
            const dispatch = parent.parentPath;
            const callee = dispatch?.parentPath;
            const pair = pairedInstanceDispatcher(callee, dispatch);
            if (pair?.capture === parent.node && !arrayMethodMayRetype(pair.method)
              && !callbackMayRetype(callee.parentPath, ARRAY_METHODS.get(pair.method))) {
              matches = false;
              break;
            }
          }
          if (!isMemberLike(parent) || parent.node.object !== use.node) {
            if (!valueIsDroppedAt(use)) return true;
            matches = false;
            break;
          }
          member = parent;
          memberNode = parent.node;
        }
        if (!matches) continue;
      }
      if (isMemberWriteHost(member)) {
        readOnly = false;
        const write = member.parentPath;
        // An exact direct assignment can supply this element's type. Other writers and
        // escapes still veto it; the caller proves that the collected write reaches the read.
        if (receiver !== ref || !elementWrites || binding.constantViolations?.length
          || write?.node.type !== 'AssignmentExpression' || write.node.operator !== '='
          || write.node.left !== memberNode) return true;
        const writtenIndex = canonicalArrayIndex(memberKeyName(memberNode));
        if (writtenIndex !== null && writtenIndex !== canonicalArrayIndex(memberKeyName(anchorPath.node))
          && arrayLiteralSlotValue(literalPath?.node, writtenIndex)
          && literalPath.node.elements.slice(0, writtenIndex + 1).every(element => element?.type !== 'SpreadElement')) continue;
        if (memberKeyName(memberNode) !== memberKeyName(anchorPath.node)) return true;
        if (!noReassignmentReachesUsage({
          reassignmentNodes: [write.node], usagePath: anchorPath,
          bindingScopeNode: lifetimeBinding.scope?.block ?? lifetimeBinding.scope?.path?.node,
          bindingAnchor: bindingLoopAnchor(lifetimeBinding),
        })) elementWrites.push(write);
        continue;
      }
      // the write may sit further UP the chain than this hop: from a reference to `o`, the element
      // write `o.xs[0] = "abc"` is two accesses out, and stopping at `o.xs` read it as a plain
      // property read. climb the accesses rooted at this one and ask the same question at each
      for (let up = member; up.parentPath?.node?.object === up.node
        && (up.parentPath.node.type === 'MemberExpression' || up.parentPath.node.type === 'OptionalMemberExpression');) {
        up = up.parentPath;
        if (isMemberWriteHost(up)) return true;
      }
      // A call can change elements through its method or callback. An ordinary read
      // can change them through an installed getter.
      const value = climbTransparentWrapperPath(member, true);
      const callsMember = arrayMemberCallRoles.get(memberNode) ?? callsArrayMember(value, value === member ? memberNode : value.node);
      arrayMemberCallRoles.set(memberNode, callsMember);
      const key = memberKeyName(memberNode);
      const hint = ARRAY_METHODS.get(key);
      if (callsMember && permutes && hint?.mutatesElements === 'existing' && !arrayMethodIsOverridden(key)) permutes.push(key);
      else if (callsMember ? arrayMethodMayRetype(key, hint) || callbackMayRetype(value.parentPath, hint)
        : hint?.mutatesElements && !valueIsDroppedAt(value)
        || arrayMethodIsOverridden(key, member, memberNode) && !arrayLiteralSlotValue(literalPath?.node, key)) {
        // A later call in the same activation cannot affect this read. Its proof is local to this site.
        if (!noReassignmentReachesUsage({
          reassignmentNodes: [memberNode],
          usagePath: anchorPath,
          bindingScopeNode: lifetimeBinding.scope?.block ?? lifetimeBinding.scope?.path?.node,
        })) return true;
        readOnly = false;
      }
    }
    if (cacheable && readOnly) arrayElementReadProofs.set(literalPath.node, {
      binding, references: nativeReferences, size: nativeReferences.length, iterations,
    });
    return false;
  }

  // may a binding an alias read reaches the array through retype its elements? `hops` are the references
  // the value walk followed (`resolveRuntimeExpression`): `const list = arr` is a retentive reference of
  // `arr`, so a read through `arr` sees writes through the alias - but a read through `list` sees
  // `arr.unshift(x)` only by asking `arr`, where the reference the read followed is no escape and every
  // other one is. `permutes` as `arrayElementsMayBeRetyped` takes it
  function aliasedElementsMayBeRetyped(hops, anchorPath, permutes = null) {
    return hops.slice(1).some(hop => arrayElementsMayBeRetyped(hop, anchorPath, { permutes, followed: hop.node }));
  }

  function resolveArrayIndexAccess(path, dispatchOnly = false) {
    if (!path.node.computed) return null;
    const resolvedProp = resolveRuntimeExpression(path.get('property'));
    if (!isLiteralOf(resolvedProp.node, 'Numeric')) return null;
    const index = resolvedProp.node.value;
    if (!Number.isInteger(index) || index < 0) return null;
    const rawObject = path.get('object');
    const hops = [];
    const objectPath = resolveRuntimeExpression(rawObject, hops);
    const elementWrites = t.isIdentifier(rawObject.node) && t.isArrayExpression(objectPath.node) ? [] : null;
    // A custom iterator can write the array. A changed prototype can supply a different family's method.
    if (dispatchOnly && (!elementWrites || isMutatedStatic('Array.prototype', 'Symbol.iterator')
      || spellsMemberKey('setPrototypeOf') || spellsMemberKey('__proto__') || spellsMemberKey('prototype'))) return null;
    if (arrayElementsMayBeRetyped(rawObject, path, { elementWrites, literalPath: objectPath, dispatchOnly })
      || (!elementWrites || !objectBindingName(objectPath)) && aliasedElementsMayBeRetyped(hops, path)) return null;
    // a write in an arm the build never takes is no write (`writeNeverRuns`), and one in an arm it
    // always takes is unconditional (the dominance ask's adapter)
    const adapter = getDecisionAdapter();
    const liveWrites = elementWrites?.filter(write => !writeNeverRuns({ write, usagePath: path, adapter }));
    if (liveWrites?.length) {
      const write = lastMemberWriteBefore(liveWrites, path, adapter);
      return write ? resolveNodeType(write.get('right')) : null;
    }
    if (t.isArrayExpression(objectPath.node)) return resolveArrayLiteralElement(objectPath, index);
    // a receiver whose RESOLVED type carries an element type (a rest-slice, an inner-typed
    // binding) yields it for a non-negative integer index: the value route above needs a
    // literal array node, but the element family is already proven by the receiver's type
    return arrayElementOfType(resolveNodeType(objectPath), index);
  }

  // the element an Array TYPE carries, or null for any other type - the one reading of an index
  // step off a value rather than a literal, shared by the index spelling above and the pattern walk
  function arrayElementOfType(type, index) {
    if (type?.constructor !== 'Array') return null;
    const { tuple } = type;
    if (tuple?.slots && (tuple.rest < 0 || index < tuple.rest)) {
      const slot = tuple.slots[index];
      if (isTypeObject(slot)) return slot.mark('mayBeNullish');
    }
    return resolveInnerType(type)?.mark('mayBeNullish') ?? null;
  }

  // the element type an index step reads off a container NO literal holds - a call result, an
  // inner-typed binding, a rest slice - unless a writer may have retyped the elements of the binding
  // it is rooted at: the two questions `resolveArrayIndexAccess` asks past its literal route, asked
  // for the positional pattern step (`[{ at }] = f()`) that reads the very slot `f()[0]` reads
  function typedIndexElement(objectPath, anchorPath, index) {
    if (arrayElementsMayBeRetyped(objectPath, anchorPath)) return null;
    return arrayElementOfType(resolveNodeType(resolveRuntimeExpression(objectPath)), index);
  }

  // The file index groups writes by field. For a numeric read with an unknown key,
  // group its numeric and wildcard writes by receiver once per immutable field index.
  const numericWritesByEnum = new WeakMap();
  function * enumSlotWrites(path, enumName, memberName) {
    let program = path;
    while (program && program.node?.type !== 'Program') program = program.parentPath;
    if (!program?.node) return;
    const fields = programCensus(program).writesByField;
    if (memberName === null) {
      let byEnum = numericWritesByEnum.get(fields);
      if (!byEnum) {
        byEnum = new Map();
        for (const [field, writes] of fields) {
          if (field === null || isNumericIndexName(field)) {
            for (const write of writes) pushMultimap(byEnum, enumWriteReceiver(write), write);
          }
        }
        numericWritesByEnum.set(fields, byEnum);
      }
      yield * byEnum.get(enumName) ?? [];
    } else {
      for (const group of [fields.get(memberName), isNumericIndexName(memberName) && fields.get(null)]) {
        if (group) for (const write of group) {
          if (enumWriteReceiver(write) === enumName) yield write;
        }
      }
    }
  }

  // A folded key can use the last plain assignment to the same closed enum. A merged block,
  // wildcard write or handout leaves the runtime member open. Anchor at the key's own read.
  function enumKeyAfterWrites(path, key, memberName, declaredKey, literalKeyValue) {
    const { name } = key.object;
    const own = CENSUS_ENUM_RECEIVERS.get(rootProgramOf(path))?.owns(key);
    if (!own && declaredKey === null) return null;
    const writes = [];
    for (const write of enumSlotWrites(path, name, memberName)) {
      writes.push(write);
      if (!own || writesPastCeiling(writes)) return null;
    }
    if (!writes.length) return declaredKey;
    const read = pathOfNode(path, key);
    if (!read) return null;
    const declarations = findAllEnumDeclarations(name, read.scope);
    if (declarations.length !== 1) return null;
    const bindingScopeNode = pathOfNode(read, declarations[0])?.parentPath?.node;
    // Another module can change a directly exported enum between the write and this read.
    if (!bindingScopeNode || bindingScopeNode.type === 'ExportNamedDeclaration') return null;
    const live = writes.filter(write => !noReassignmentReachesUsage({
      reassignmentNodes: [write.node], usagePath: read, bindingScopeNode,
    }));
    if (!live.length) return null;
    const write = lastMemberWriteBefore(live, read, getDecisionAdapter());
    if (write?.node.operator !== '=' || unwrapRuntimeExpr(memberWriteTargetPath(write)?.node?.object)?.name !== name
      || !provablyPrecedes(declarations[0], write.node)
      || findAllEnumDeclarations(name, write.scope)[0] !== declarations[0]
      || !enumIsNearestValue(name, write.scope, bindingDeclaratorPath(name, write.scope))) return null;
    return literalKeyValue(unwrapRuntimeExpr(write.node.right));
  }

  // Follow the closed uses of a runtime enum or its namespace. A const binding retains the
  // selected object; handing it to other code, calling its methods or changing its descriptors
  // can prevent even a later Reflect.set from installing its value.
  function reverseEnumWrites(program, refs, declaration, segments) {
    const [name, ...prefix] = segments;
    let cached = reverseWritesByReferences.get(refs);
    if (!cached) reverseWritesByReferences.set(refs, cached = new WeakMap());
    if (cached.has(declaration)) return cached.get(declaration);
    cached.set(declaration, null);
    const writes = new Map();
    const seen = new Set();
    function closedUse(ref, rest) {
      if (!ref.node) return false;
      if (erasedEnumReference(ref)) return true;
      let value = climbTransparentWrapperPath(ref);
      let at = 0;
      while (at < rest.length && isMemberAccessNode(value.parentPath?.node) && value.parentPath.node.object === value.node) {
        const field = staticMemberKeyName(value.parentPath.node);
        if (field === null) return false;
        value = climbTransparentWrapperPath(value.parentPath);
        if (field !== rest[at]) {
          return value.parentPath?.node.callee !== value.node && value.parentPath?.node.tag !== value.node;
        }
        at++;
      }
      const host = value.parentPath;
      if (host?.node.type === 'VariableDeclarator' && host.node.init === value.node) {
        if (host.parentPath.node.kind !== 'const' || host.parentPath.parentPath?.node.type === 'ExportNamedDeclaration') return false;
        let { id } = host.node;
        if (at < rest.length && id.type === 'ObjectPattern' && id.properties.length === 1) {
          const [prop] = id.properties;
          if (prop.computed || prop.key?.name !== rest[at]) return false;
          id = prop.value;
          at++;
        }
        if (id.type !== 'Identifier' || isBindingExportedByName(id.name, program)) return false;
        const binding = getScopeBinding({ scope: host.scope, name: id.name, path: host });
        if (!binding || isReassignedBeyondDeclarator(binding) || seen.has(binding) || seen.size >= MAX_DEPTH) return false;
        seen.add(binding);
        const uses = collectBindingReferences(binding, host);
        const remaining = rest.slice(at);
        return uses && uses.every(use => closedUse(use, remaining));
      }
      if (isMemberAccessNode(host?.node) && host.node.object === value.node && at === rest.length) {
        const member = climbTransparentWrapperPath(host);
        const parent = member.parentPath;
        if (parent?.node.callee === member.node || parent?.node.tag === member.node) return false;
        if (!isMemberWriteHost(member)) return true;
        const key = staticMemberKeyName(host.node);
        if (key === null || parent.node.operator !== '=') return false;
        pushMultimap(writes, key, { path: parent, value: parent.get('right') });
      } else if (at === rest.length && host?.node.type === 'CallExpression' && !host.node.optional
        && host.node.arguments.length === 3 && host.node.arguments[0] === value.node
        && host.node.arguments.every(arg => arg.type !== 'SpreadElement')
        && resolveStaticCalleePair({ node: host.node.callee, ctx: { scope: host.scope, path: host } }, {
          method: 'set',
        })?.constructor === 'Reflect'
        && !getDecisionAdapter()?.isMutatedStaticSlot?.('Reflect', 'set')) {
        const [, key, rhs] = host.get('arguments');
        if (!isLiteralOf(key.node, 'Numeric') && !isLiteralOf(key.node, 'String')) return false;
        pushMultimap(writes, String(key.node.value), { path: host, value: rhs });
      } else return valueIsDroppedAt(value);
      return true;
    }
    // Namespace bodies can also refer to the enum under its local name.
    const local = prefix.at(-1);
    const locals = local && programCensus(program).referenceIdentifiersByName.get(local);
    const localUses = locals?.some(ref => !erasedEnumReference(ref)
      && withLookupPath(ref, () => findAllEnumDeclarations(local, ref.scope).includes(declaration)));
    const closed = !localUses && !isBindingExportedByName(name, program) && refs.every(ref => withLookupPath(ref, () => {
      const root = bindingDeclaratorPath(name, ref.scope);
      return findAllEnumDeclarations(segments, ref.scope)[0] !== declaration
        || !enumIsNearestValue(segments, ref.scope, root) || closedUse(ref, prefix);
    }));
    const result = closed ? {
      writes,
      numericWrite: writes.keys().some(isNumericIndexName),
      keys: writes.size ? numericEnumSlots(declaration) : null,
    } : null;
    cached.set(declaration, result);
    return result;
  }

  // A fresh enum owns its declared numeric slots. A setter inherited by a missing slot
  // can accept a write without installing the RHS. A surviving slot also needs one
  // dominating write in the read's activation.
  function writtenReverseEnumType(path, declaration, segments, key, facts) {
    if (!facts) return null;
    const { writes, keys } = facts;
    if (key === null && keys) {
      const prop = unwrapRuntimeExpr(path.node.property);
      const member = isMemberAccessNode(prop) && staticMemberKeyName(prop);
      if (member && !writes.has(member) && collectMemberSegments(prop.object)?.join('.') === segments.join('.')) {
        key = keys.names.get(member) ?? null;
      }
    }
    if (key === null && facts.numericWrite || isMutatedStatic('Object.prototype', key ?? MUTATED_STATIC_PINNED)) return null;
    const entries = writes.get(key);
    if (entries) {
      const owner = findNearestVarScopeOwner(pathOfNode(path, declaration))?.node;
      if (!owner || !keys.slots.has(key) || writesPastCeiling(entries)) return null;
      const live = entries.filter(({ path: write, value }) => !noReassignmentReachesUsage({
        reassignmentNodes: [write.node], usagePath: path, bindingScopeNode: owner,
        deferredWriteFollows: () => nodeRangeContains(value.node, path.node)
          && findNearestVarScopeOwner(value)?.node === findNearestVarScopeOwner(path)?.node,
      }));
      if (live.length) {
        const last = lastMemberWriteBefore(live.map(entry => entry.path), path, getDecisionAdapter());
        if (!last || !provablyPrecedes(declaration, last.node)) return null;
        return resolveNodeType(live.find(entry => entry.path === last).value);
      }
    }
    return new $Primitive('string').mark('mayBeNullish');
  }

  // Resolve a numeric read through the same plain const aliases as the write proof.
  // Anchor each declaration lookup at its initializer, even when the read shadows that name.
  function reverseEnumAlias(path, segments, key) {
    if (CENSUS_ENUM_RECEIVERS.get(rootProgramOf(path))?.blocks.size === 0) return null;
    let anchor = path;
    for (let depth = 0; depth < MAX_DEPTH; depth++) {
      const [name, ...rest] = segments;
      const binding = bindingDeclaratorPath(name, anchor.scope);
      if (binding?.node.type !== 'VariableDeclarator' || binding.parentPath?.node.kind !== 'const') return null;
      const { id, init } = binding.node;
      const source = collectMemberSegments(init);
      if (!source) return null;
      if (id.type === 'ObjectPattern') {
        const [prop] = id.properties;
        if (id.properties.length !== 1 || prop.computed || prop.value?.name !== name || !prop.key?.name) return null;
        source.push(prop.key.name);
      } else if (id.name !== name) return null;
      segments = source.concat(rest);
      anchor = binding.get('init');
      const decls = withLookupPath(anchor, () => findAllEnumDeclarations(segments, anchor.scope));
      if (decls.length) {
        const bindingPath = bindingDeclaratorPath(segments[0], anchor.scope);
        const nearest = withLookupPath(anchor, () => enumIsNearestValue(segments, anchor.scope, bindingPath));
        if (decls.length !== 1 || resolveEnumType(decls)?.type !== 'number' || !nearest) return null;
        const program = findProgramPath(path);
        const refs = programCensus(program).referenceIdentifiersByName.get(segments[0]);
        return refs && writtenReverseEnumType(path, decls[0], segments, key, reverseEnumWrites(program, refs, decls[0], segments));
      }
    }
    return null;
  }

  // member access on a TSEnumDeclaration receiver. covers two shapes:
  //   - non-computed `E.A` / `N.E.A` -> enum value-kind primitive (the member's resolved
  //     kind via `resolveEnumMemberKind`, defaulting to number for implicit auto-numbered)
  //   - computed `E[<number-key>]` / `N.E[N.E.A]` -> string (numeric enum reverse mapping).
  //     TS auto-generates `E[E.A] === 'A'` at runtime for numeric enums; without this branch
  //     `v` in `const v = E[E.A]; v.includes('A')` falls back to a generic `_includes`
  //     instead of the string-narrowed variant. computed access with non-numeric key
  //     (forward `E['A']` / index by user expr) bails - those resolve through other paths.
  // namespace-qualified receiver: `findAllEnumDeclarations` accepts segment-array form to walk
  // through TSModuleDeclaration anchors so `namespace N { export enum E {...} }` resolves
  function resolveEnumMemberAccess(path, receiverOnly = false) {
    const receiverProof = receiverOnly ? CENSUS_ENUM_RECEIVERS.get(rootProgramOf(path))?.owns(path.node) : undefined;
    if (receiverProof !== undefined && receiverProof !== null) return receiverProof ? new $Object('Object') : null;
    const segments = collectMemberSegments(path.node.object);
    if (!segments) return null;
    // findAllEnumDeclarations accepts both string and segment array. TS merges multiple `enum E {}`
    // blocks, so a member may live in any block - search them all (a single-block enum yields one)
    const enumDecls = findAllEnumDeclarations(segments, path.scope);
    if (!enumDecls.length) {
      const key = !receiverOnly && path.node.computed && staticMemberKeyName(path.node);
      return key && isNumericIndexName(key) ? reverseEnumAlias(path, segments, key) : null;
    }
    if (!enumIsNearestValue(segments, path.scope, bindingDeclaratorPath(segments[0], path.scope))) return null;
    if (receiverOnly && ESCAPED_CONTAINER_NAMES.get(rootProgramOf(path))?.has(segments[0])) return null;
    // `E.A` (Identifier) / `E['A']` (computed StringLiteral / ESTree Literal) / `` E[`A`] `` / a
    // SE-bearing key `E[(c++, 'A')]` - all look up the same member (staticMemberKeyName folds the SE
    // tail); numeric / dynamic keys fall through to the reverse-map fallback below
    const memberName = staticMemberKeyName(path.node);
    // a declared enum member type is sound only while nothing REWRITES that slot: `enum S { Ready = "x" }`
    // then `(S as any).Ready = [1, 2]` leaves the read narrowed to string over an Array value - a wrong
    // family, which usage-pure turns into a throw. class statics already deopt here, through the
    // field-flow fold's module-wide write phase; an enum is the same kind of container but reaches no
    // class body, and `isMutatedStatic` cannot answer for it either - in usage-pure that registry holds
    // only KNOWN GLOBALS (measured, which is why a gate written in its image was dead). ask the same
    // per-program write index the fold asks, and DECLINE instead of folding: over-reporting a write
    // only degrades the read to generic, the safe direction in both methods
    if (memberName !== null && !isNumericIndexName(memberName)) {
      if (receiverOnly && receiverProof === null) {
        return resolveEnumMemberType(enumDecls, memberName) ? new $Object('Object') : null;
      }
      return pathSlotWritten(path.get('object'), [memberName]) || !enumSlotWrites(path, segments.at(-1), memberName).next().done
        ? null : resolveEnumMemberType(enumDecls, memberName);
    }
    // `E[E.A]` numeric reverse-map: numeric enum + numeric-typed computed key -> string
    if (!path.node.computed) return null;
    if (resolveEnumType(enumDecls)?.type !== 'number') return null;
    if (!isNumericIndexName(memberName) && resolveNodeType(path.get('property'))?.type !== 'number') return null;
    const program = rootProgramOf(path);
    const known = memberName === null && CENSUS_KEY_NAMES.get(program)?.(path.node.property);
    const key = known?.length === 1 ? known[0] : memberName;
    const owner = findProgramPath(path);
    const refs = programCensus(owner).referenceIdentifiersByName.get(segments[0]);
    if (enumDecls.length === 1 && refs) {
      const facts = reverseEnumWrites(owner, refs, enumDecls[0], segments);
      return writtenReverseEnumType(path, enumDecls[0], segments, key, facts);
    }
    const pristine = CENSUS_ENUM_RECEIVERS.get(program)?.owns(path.node, true);
    const open = pristine === false || segments.length > 1 && pathSlotWritten(path.get('object'), [key])
      || enumSlotWrites(path, segments.at(-1), key).some(write => enumIsNearestValue(
        segments, write.scope, bindingDeclaratorPath(segments[0], write.scope),
      ));
    return open || pristine !== true ? null : new $Primitive('string').mark('mayBeNullish');
  }

  return {
    // A later pass over the same tree must re-establish its source proof.
    reset() { arrayElementReadProofs = new WeakMap(); },
    resolveMemberCallChain,
    resolveBindingReturnInfo,
    memberCallReturnAnnotation,
    memberCallParams,
    resolveTypedMember,
    findClassPathForTypeReference,
    resolveIndexSignatureMember,
    resolveFromMemberExpression,
    enumKeyAfterWrites,
    resolveMemberOfObjectPath,
    resolveArrayIndexAccess,
    typedIndexElement,
    arrayElementOfType,
    arrayElementsMayBeRetyped,
    aliasedElementsMayBeRetyped,
    resolveEnumMemberAccess,
  };
}
