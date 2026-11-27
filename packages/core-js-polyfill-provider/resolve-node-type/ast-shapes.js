// Pure AST-shape predicates and accessors for type / qualified-name / interface heritage
// nodes. all functions are closure-free: no factory state, no parser context. shared by
// `name-resolution`, `type-subst`, `type-members`, `user-type-resolve`, `member-resolve`,
// and the factory itself.
//
// the shape predicates here encode cross-parser compatibility (babel / oxc / flow), discovered
// empirically per parser - change them only with care
import {
  collectQualifiedSegments,
  getTypeArgs,
  isQualifiedNameNode,
  isDeferredContextStep,
  isTypeAnnotationWrapper,
  peelTSParenthesized,
  unwrapParens,
} from '../helpers/ast-patterns.js';
import {
  dropLeadingThisParam,
  literalNodeValue,
  MODIFIER_WRAPPER_DELTAS,
  PRIMITIVE_HINTS,
} from './base.js';

export { collectQualifiedSegments, isQualifiedNameNode };

// statement list directly inside a TSModuleDeclaration. for Babel's nested form
// (`namespace A.B {}` -> A.body = TSModuleDeclaration B) expose B as a single-element list
// so a recursive walk can match its name. for oxc's flat form (id = TSQualifiedName)
// the body is a TSModuleBlock and we return its statements directly. null when the body is
// neither (a bare `declare namespace X;` header). the nested case being a NON-array object
// (a TSModuleBlock reached through the inner declaration) is the trap a bare `body.body`
// access falls into - a for-of over it throws, aborting the whole file transform
export function moduleStatements(decl) {
  const body = decl?.body;
  if (body?.type === 'TSModuleDeclaration') return [body];
  return Array.isArray(body?.body) ? body.body : null;
}

// decompose a type reference into its dotted segments. `Foo` -> ['Foo'],
// `NS.Data` -> ['NS', 'Data'], `A.B.T` -> ['A', 'B', 'T']. Returns null when the
// reference uses a non-identifier head (e.g. an `import("...").Type` form)
export function typeRefSegments(node) {
  if (!node) return null;
  const head = node.type === 'TSTypeReference' ? node.typeName
    : node.type === 'GenericTypeAnnotation' ? node.id : null;
  return collectQualifiedSegments(head);
}

export function typeRefName(node) {
  const segments = typeRefSegments(node);
  return segments?.length === 1 ? segments[0] : null;
}

// These names are the standard collection views once their declaration has been resolved.
export function isReadonlyCollectionName(name) {
  return name === 'ReadonlyArray' || name === '$ReadOnlyArray' || name === 'ReadonlyMap' || name === 'ReadonlySet';
}

// --- Member modifier markers ---

// the descriptor-flag delta a modifier wrapper (`Partial<T>` / `Required<T>` / ...) applies to
// the members it passes through, or null for a node that is not one. the peel that unwraps such
// a wrapper answers only WHERE to continue; this answers WHAT it changed, off the same table, so
// the two cannot disagree about membership
export function modifierWrapperDelta(node) {
  const n = peelTSParenthesized(isTypeAnnotationWrapper(node) ? node.typeAnnotation : node);
  // a mapped type spells the same delta with its own `?` modifier, and the passthrough peel
  // (`{ [K in keyof T]?: T[K] }` -> T) discards it exactly like the utility wrapper does
  if (n?.type === 'TSMappedType') return mappedModifierDelta(n);
  return MODIFIER_WRAPPER_DELTAS.get(typeRefName(n)) ?? null;
}

// Only arrays gain or lose mutability when their properties are mapped readonly.
export function markMappedReadonly(resolved, node) {
  const { readonly } = mappedModifierDelta(node);
  if (resolved?.constructor !== 'Array' || readonly === undefined) return resolved;
  return readonly ? resolved.mark('readonly') : resolved.unmark('readonly');
}

// a mapped type's modifier slots: `?` / `+?` add, `-?` remove, absent leaves the source member's
// own flag - and the same three spellings for `readonly`. parsers spell the presence form as
// `true` or `'+'`, and they disagree on ABSENCE: babel leaves the slot undefined where oxc writes
// `false`. both mean "no modifier", so neither may be read as a REMOVAL - only the literal `'-'`
// is one. a `Boolean(modifier)` shortcut here inverts three cases on one parser and none on the
// other. the two flags answer different questions and are read by different consumers:
// `optional` is member-scoped (the descriptor), `readonly` is the collection-view marker a
// homomorphic mapped type shares with `Readonly<T>`
export function mappedModifierDelta(node) {
  function flag(modifier) {
    if (modifier === '-') return false;
    return modifier === true || modifier === '+' ? true : undefined;
  }
  return { optional: flag(node?.optional), readonly: flag(node?.readonly) };
}

// compose two deltas walked outside-in: `Partial<Required<T>>` reads Partial LAST, so the
// OUTER wrapper wins on any flag both name. an absent flag defers to the inner one
export function composeModifierDeltas(outer, inner) {
  if (!outer) return inner;
  if (!inner) return outer;
  return { optional: outer.optional ?? inner.optional, readonly: outer.readonly ?? inner.readonly };
}

// the ONE marker writer of the ANNOTATION channel: a member's `optional` descriptor flag lives
// on the member NODE, but every consumer downstream reads a resolved Type - so the flag travels
// as a synthetic `TSOptionalType` that `resolveTypeAnnotation` already stamps into `mayBeNullish`.
// two RESOLVED-side twins reach the same marker from the other end (`markFieldOptional` and the
// merged-interface arm in `class-object-member`, both `.mark('mayBeNullish')` on a finished Type);
// they cannot route through here because they hold a Type, not an annotation.
// producing a member / parameter / element annotation without routing it through here is how a
// peel silently drops the flag: `(x ?? 'fallback').at(0)` then folds to the left operand and
// emits a type-specific helper for a value that may be the right one at runtime
export function withMemberModifiers(annotation, { optional = false } = {}) {
  if (!annotation) return annotation;
  // `optional: false` is a REMOVAL, not merely "nothing to add": a tuple slot spells its own `?`
  // as a source-level TSOptionalType, and `Required<[A, B?]>` has to take that node back off.
  // on the member lanes the flag lives on the member rather than the annotation, so the strip is
  // a no-op there and the one contract serves both
  if (!optional) return annotation.type === 'TSOptionalType' ? annotation.typeAnnotation : annotation;
  return annotation.type === 'TSOptionalType' ? annotation : { type: 'TSOptionalType', typeAnnotation: annotation };
}

// the same delta applied to a member LIST instead of one annotation - the shape `getTypeMembers`
// hands back, where the flag still sits on the descriptor. members are shared AST nodes, so the
// re-flagged ones are shallow copies; a delta that changes nothing returns the very same list,
// and a delta that changes something keeps every UNAFFECTED member's node identity (the array
// itself is rebuilt either way, which no consumer keys on)
export function applyMemberModifierDelta(members, delta) {
  if (!members || delta?.optional === undefined) return members;
  return members.map(m => m.optional === delta.optional ? m : { ...m, optional: delta.optional });
}

// Mutable collection spelled by this annotation, used when comparing guarded receiver types.
export function mutableCollectionName(node) {
  const n = peelTSParenthesized(isTypeAnnotationWrapper(node) ? node.typeAnnotation : node);
  if (n?.type === 'TSArrayType') return 'Array';
  if (n?.type !== 'TSTypeReference') return null;
  const name = typeRefName(n);
  return name === 'Array' || name === 'Set' || name === 'Map' ? name : null;
}

// Flow spells every type declaration twice - a plain form and an ambient `declare` form with
// its own node type. the ambient forms describe exactly the same shapes, so a predicate that
// lists only the plain spellings makes `declare type` / `declare interface` / `declare opaque
// type` invisible to every type lookup while `declare class` (listed elsewhere) resolves
export function isTypeAlias(decl) {
  return decl?.type === 'TSTypeAliasDeclaration' || decl?.type === 'TypeAlias'
    || decl?.type === 'DeclareTypeAlias' || decl?.type === 'OpaqueType' || decl?.type === 'DeclareOpaqueType';
}

export function isInterfaceDeclaration(decl) {
  return decl?.type === 'TSInterfaceDeclaration' || decl?.type === 'InterfaceDeclaration'
    || decl?.type === 'DeclareInterface';
}

// shared accessor for TS/Flow interface body shape: `TSInterfaceBody.body` (TS) vs
// `ObjectTypeAnnotation.properties` (Flow's InterfaceDeclaration). always returns an
// array - falsy bodies (parse error / empty decl) collapse to empty
export function interfaceBodyMembers(iface) {
  return iface.body?.body ?? iface.body?.properties ?? [];
}

// TS + Flow union-type predicate. the discriminant narrower, the alias-walk flattener, and
// several member / call / annotation resolvers all gate on this exact pair - shape parity
// must stay in sync, so it lives here as the single source
export function isUnionType(node) {
  return node?.type === 'TSUnionType' || node?.type === 'UnionTypeAnnotation';
}

// collapse a list of annotation nodes into ONE annotation: a lone member stays itself, several
// become a union. the resolvers that synthesise a union - conditional branches, colliding mapped
// keys, index signatures under an unknown key - all want that same shape, and a hand-built literal
// per site is what let one of them keep a `length === 1` arm the others lacked
export function unionAnnotationOf(types) {
  return compositeAnnotationOf(types, 'TSUnionType');
}

// Flatten only the same connective and remove repeated nodes, not merely similar shapes.
// A shared alias DAG must not become an exponentially large annotation tree on its way out.
export function compositeAnnotationOf(types, kind) {
  // a member that is ITSELF a union is SPLICED, not nested: downstream resolves a nested arm as a
  // whole, and an arm that diverges resolves to nothing, which sinks the entire set instead of
  // contributing its members. the dialect predicate carries the Flow spelling too, which a
  // hand-written `type === 'TSUnionType'` test at one of these sites had been missing
  const flat = [];
  for (const type of types) {
    if (type?.type === kind || kind === 'TSUnionType' && isUnionType(type)) flat.push(...type.types);
    else flat.push(type);
  }
  const unique = [...new Set(flat)];
  return unique.length === 1 ? unique[0] : { type: kind, types: unique };
}

// TS + Flow function-TYPE predicate (the annotation form `(a: A) => B`, not a function node).
// every callback-parameter peeler gates on this pair; restating it per site is how the Flow
// arm went missing on one of them, so the list lives here
export function isFunctionTypeNode(node) {
  return node?.type === 'TSFunctionType' || node?.type === 'FunctionTypeAnnotation';
}

// TS + Flow named type reference (`Foo<T>` / `NS.Foo`). `typeRefSegments` already decomposes
// both spellings, so a gate that admits only the TS one silently drops every Flow file
export function isTypeReferenceNode(node) {
  return node?.type === 'TSTypeReference' || node?.type === 'GenericTypeAnnotation';
}

// TS + Flow inline object type (`{ a: T }`). the members live on different slots
// (`members` / `properties`) - `getTypeMembers` owns that split; this is only the shape gate
export function isObjectTypeLiteral(node) {
  return node?.type === 'TSTypeLiteral' || node?.type === 'ObjectTypeAnnotation';
}

// value-space literal node of a literal TYPE. TS wraps the ordinary literal in TSLiteralType;
// Flow has no wrapper - its literal type IS a dedicated node carrying the value. rebuilding the
// value-space shape for the Flow spelling lets every downstream literal reader stay one dialect
const FLOW_LITERAL_TYPE_KINDS = new Map([
  ['StringLiteralTypeAnnotation', 'StringLiteral'],
  ['NumberLiteralTypeAnnotation', 'NumericLiteral'],
  ['BooleanLiteralTypeAnnotation', 'BooleanLiteral'],
  ['BigIntLiteralTypeAnnotation', 'BigIntLiteral'],
]);
export function literalTypeValueNode(node) {
  if (node?.type === 'TSLiteralType') return node.literal;
  const kind = FLOW_LITERAL_TYPE_KINDS.get(node?.type);
  return kind ? { type: kind, value: node.value } : null;
}

// node-type set for "structurally a method signature on a member slot": interface methods
// (TSMethodSignature), ambient class methods (babel TSDeclareMethod), babel ClassMethod /
// ClassPrivateMethod, ESTree MethodDefinition wrap and its abstract sibling
// TSAbstractMethodDefinition (oxc models `abstract m(): T` as the latter, babel as TSDeclareMethod).
// broader than `isMethodMember` in class-member-shapes.js, which only covers babel class-body
// method nodes. used by indexed-access peel to detect `T['method']` shape - returning the member
// itself as a function-type instead of unwrapping to its return slot
export function isMethodShapeMember(memberType) {
  return memberType === 'TSMethodSignature'
    || memberType === 'TSDeclareMethod'
    || memberType === 'ClassMethod'
    || memberType === 'ClassPrivateMethod'
    || memberType === 'MethodDefinition'
    || memberType === 'TSAbstractMethodDefinition';
}

export function typeAliasBody(decl) {
  if (decl.type === 'TSTypeAliasDeclaration') return decl.typeAnnotation;
  // an ambient opaque type publishes only its SUPERTYPE bound - values of the opaque type are
  // assignable to it, so its members are present on every such value and the bound is the most
  // precise shape available outside the defining module
  if (decl.type === 'OpaqueType' || decl.type === 'DeclareOpaqueType') return decl.impltype ?? decl.supertype;
  return decl.right;
}

// TS extends: TSExpressionWithTypeArguments has .expression; Flow extends: InterfaceExtends has .id.
// null on neither slot - callers use `?.type` / `if (!base)` to bail rather than silently
// treating the heritage clause itself as the qualified head. a `?? parent` fallback would
// mask future parser regressions (new heritage shape) by handing back a non-Identifier
// wrapper that downstream filters silently reject
export function extendsId(parent) {
  return parent.expression ?? parent.id ?? null;
}

// synthesize a TSTypeReference wrapping the parent's id + its type-args. accepts both
// bare Identifier (`interface I extends Base`) and qualified-name shapes
// (`interface I extends NS.Base` - TSQualifiedName in babel, MemberExpression in oxc).
// returns null for unhandled shapes (TSTypeLiteral / call / etc) so callers can skip
export function synthInterfaceExtendsRef(parent) {
  const expr = extendsId(parent);
  if (!expr || (expr.type !== 'Identifier' && !isQualifiedNameNode(expr))) return null;
  return { type: 'TSTypeReference', typeName: expr, typeParameters: getTypeArgs(parent) };
}

// content-free type nodes: every instance is interchangeable, so they are shared frozen singletons
// rather than allocated per call. two reasons beyond the allocation - a fresh node is a fresh KEY for
// the identity-keyed member memo (the same instability `internedTypeRef` below exists for), and the
// substitution builder used to mint one per inner type-param name. frozen so a consumer that tried to
// mutate one fails loudly at the write instead of poisoning every other holder
export const TS_UNKNOWN_TYPE = Object.freeze({ type: 'TSUnknownKeyword' });
export const TS_NUMBER_TYPE = Object.freeze({ type: 'TSNumberKeyword' });

// a type parameter nothing binds, spelled as a type argument: its constraint (Flow: bound), all a use
// that binds nothing knows of it - `unknown` without one
export function openTypeArg(param) {
  return param.constraint ?? param.bound?.typeAnnotation ?? TS_UNKNOWN_TYPE;
}

// An inert literal annotation shared by call-site inference and type-level substitutions.
export function literalTypeAnnotation(value) {
  const kind = { string: 'StringLiteral', number: 'NumericLiteral', boolean: 'BooleanLiteral', bigint: 'BigIntLiteral' }[typeof value];
  return kind ? { type: 'TSLiteralType', literal: { type: kind, value } } : null;
}

// Only a naked type parameter distributes. AST substitution retains that source fact after
// replacing the reference; a literal `boolean extends true` and a tuple wrapper never acquire it.
export function isDistributiveConditional(node, subst) {
  if (node.distributive) return true;
  const check = peelTSParenthesized(node.checkType);
  return !!subst && isTypeReferenceNode(check) && !getTypeArgs(check)?.params?.length && subst.has(typeRefName(check));
}

// the type of `as const` / `<const>`: a reference named `const`, which keeps the expression's own
// literal type where any other asserted type replaces it
export function isConstAssertionType(node) {
  return node?.type === 'TSTypeReference' && node.typeName?.type === 'Identifier' && node.typeName.name === 'const';
}

// a synthesized TSTypeReference handed to an identity-keyed memo (`getTypeMembers`, whose cache is
// `WeakMap<objectType, WeakMap<scope, members>>`) must be ONE node per (typeName, type-args): the
// factory invariant keys those caches on node identity, which silently assumes the key node came
// from the PARSE. a literal rebuilt per call can never hit the memo, so every ask re-walks the super
// chain, re-merges every interface and re-clones every member. interned on the typeName node - which
// IS a parse node - so the table lives and dies with the AST
const internedTypeRefs = new WeakMap();

export function internedTypeRef(typeName, params = null) {
  if (!typeName) return null;
  let refs = internedTypeRefs.get(typeName);
  if (!refs) internedTypeRefs.set(typeName, refs = []);
  // type-args are matched by identity too: a caller that rebuilds the array simply misses the
  // intern table instead of answering for the wrong instantiation
  for (const entry of refs) if (entry.params === params) return entry.ref;
  const ref = {
    type: 'TSTypeReference',
    typeName,
    typeParameters: params ? { type: 'TSTypeParameterInstantiation', params } : undefined,
  };
  refs.push({ params, ref });
  return ref;
}

// `typeof import('x').Bar` parses as TSTypeQuery wrapping TSImportType. the outer
// TSTypeQuery hides the structurally-opaque inner from a flat type-discriminator check,
// so callers that want to treat `typeof import(...)` as opaque must look one level in
export function isTypeQueryOverImportType(node) {
  return node?.type === 'TSTypeQuery' && node.exprName?.type === 'TSImportType';
}

// `typeof <exprName>.<key>`: the query a member read off `typeof <exprName>` reads
export function memberTypeQuery(exprName, key) {
  return { type: 'TSTypeQuery', exprName: { type: 'TSQualifiedName', left: exprName, right: { type: 'Identifier', name: key } } };
}

// wide-open keyword annotations: `any` / `unknown` / `object` / Flow `any` / `mixed`.
// `resolveTypeAnnotation` collapses each to null (too broad to narrow polyfills); callers
// that have a secondary inference channel (guard-based narrowing, RHS-write flow) treat
// these as "user didn't pin a shape" instead of "give up". excludes `TSTypeLiteral` -
// `{ x: number }` is structurally closed even though `resolveTypeAnnotation` also returns
// null for it
export const OPEN_KEYWORD_ANNOTATION_TYPES = new Set([
  'TSAnyKeyword',
  'TSUnknownKeyword',
  'TSObjectKeyword',
  'AnyTypeAnnotation',
  'MixedTypeAnnotation',
]);

export function isOpenKeywordAnnotation(node) {
  return OPEN_KEYWORD_ANNOTATION_TYPES.has(node?.type);
}

// the TOP keywords - `any` / `unknown` and Flow's `any` / `mixed`: EVERY type is assignable to one,
// so written as a container's argument it constrains nothing. deliberately NOT the open-keyword set
// above, which also carries `object` - the top of the non-primitive types only, so `Array<object>`
// really does reject a `number` element.
// the Flow halves look unreachable and are not: both consumers are TS-only shapes (a conditional
// branch, a mapped `as` clause), but the utility NAMES they key on are resolved by name in any
// dialect, so `Extract<Array<number> | string, Array<mixed>>` in a Flow file reaches here and
// answers correctly. measured, not assumed - do not drop them as dead
// keyed by WHICH top the spelling is, because the two do not answer alike in every position:
// `any` is assignable in BOTH directions and `unknown` only from below, so a container's written
// argument list - the one place this layer weighs a top in the CHECK slot - reads the kind and not
// merely the membership. Flow's `mixed` is the `unknown`-shaped one, `any` its own twin
const TOP_KEYWORD_ANNOTATION_KINDS = new Map([
  ['TSAnyKeyword', 'any'],
  ['AnyTypeAnnotation', 'any'],
  ['TSUnknownKeyword', 'unknown'],
  ['MixedTypeAnnotation', 'unknown'],
]);

export function topKeywordAnnotationKind(node) {
  return TOP_KEYWORD_ANNOTATION_KINDS.get(peelTSParenthesized(node)?.type) ?? null;
}

export function isTopKeywordAnnotation(node) {
  return topKeywordAnnotationKind(node) !== null;
}

// is this class member private? `#x` field / method / getter-setter / `accessor #x` / `static #x`.
// EVERY private form keys on a PrivateName (babel) or PrivateIdentifier (oxc), so the key type alone
// is the cross-parser-complete signal - no node-type list (ClassPrivateProperty / ClassPrivateMethod /
// ClassAccessorProperty ...) which would differ per parser and drift (babel `accessor #x` is a
// ClassAccessorProperty, not a ClassPrivateProperty, so a node-type check silently mis-routes it public)
export function isPrivateMemberNode(node) {
  return node?.key?.type === 'PrivateName' || node?.key?.type === 'PrivateIdentifier';
}

// soundness filter for source-position narrows: a reassignment of the binding that lives inside a
// DEFERRED evaluation context nested below the binding scope can run before the use regardless of
// source position, so a positional check can't see it - a captured function (`mutate(); use; function
// mutate(){ x = y }`) OR an instance class-field initializer (`class C { f = (x = y) }`, which runs at
// construction time). true when any violation sits inside such a context on the parent chain up to
// (but not including) `stopPath` (the binding scope path). uses the canonical `isDeferredContextStep`
// so the read-side gate stays in lockstep with the write-side fold and the value-flow walk
export function violationInCapturedFunction(violations, stopPath) {
  if (!violations?.length) return false;
  return violations.some(v => {
    // a canonically-recovered extra has no parent chain to prove it is NOT captured - assume it is
    if (v.canonicalRecovered) return true;
    // guard `p?.node` (not just `p`): the parent chain can overshoot `stopPath` and reach a
    // detached / tree-root path with a null node, so terminate there - matches the canonical
    // `hasDeferredContextAncestor` / `violationRunsDeferred` walkers that share this predicate
    for (let p = v.parentPath, child = v; p?.node && p !== stopPath; child = p, p = p.parentPath) {
      if (isDeferredContextStep(p.node, child)) return true;
    }
    return false;
  });
}

// primitive kind of a type keyword (`bigint` -> 'bigint'); covers the 5 typeof-primitive keywords
// (string / number / boolean / bigint / symbol - PRIMITIVE_HINTS), null for a literal / complex /
// generic / null / undefined annotation (indeterminate for arg-match). shared by the member-overload
// and ambient-function-overload arg-match below, and by the argument side reading a binding's annotation
export function keywordPrimitiveKind(typeNode) {
  switch (typeNode?.type) {
    case 'TSStringKeyword': return 'string';
    case 'TSNumberKeyword': return 'number';
    case 'TSBooleanKeyword': return 'boolean';
    case 'TSBigIntKeyword': return 'bigint';
    case 'TSSymbolKeyword': return 'symbol';
    default: return null;
  }
}

// the same kind read off a PARAM's annotation slot
function paramPrimitiveKind(param) {
  return keywordPrimitiveKind(peelTSParenthesized(param.typeAnnotation?.typeAnnotation));
}

// arg-side counterpart of paramPrimitiveKind: the primitive kind of an already-resolved node type, gated on
// the canonical PRIMITIVE_HINTS set (the same 5 typeof-primitives), else null. an arg whose resolved type
// isn't one of these (object / null / undefined / unresolvable) yields null, so the overload matcher
// bails to the fold instead of guessing
function primitiveTypeKind(type) {
  return PRIMITIVE_HINTS.has(type) ? type : null;
}

// the literal VALUE of a literal NODE (a call arg or a TSLiteralType's `.literal`) for overload
// discrimination, via the canonical cross-parser extractor (babel `BigIntLiteral` and an oxc bigint
// `Literal` canonicalize to one BigInt value; `-N` negations resolve). a non-primitive `.value`
// (estree regex `Literal`, `null`) cannot be spelled by a TSLiteralType param, so it does not
// discriminate - yields undefined like any other non-literal shape
function overloadLiteralValue(node) {
  const value = literalNodeValue(unwrapParens(node));
  return value !== null && typeof value !== 'object' ? value : undefined;
}

// the literal value of a literal-typed param (`k: 'a'` / `k: 1` / `k: true` / `k: 1n`), or undefined
function paramLiteralValue(param) {
  const lit = peelTSParenthesized(param.typeAnnotation?.typeAnnotation);
  return lit?.type === 'TSLiteralType' ? overloadLiteralValue(lit.literal) : undefined;
}

// verdict of ONE param slot against its call arg: 'match' / 'non-match' / 'ambiguous'.
// the literal is read off the arg NODE (the resolved type erases it), the kind from the
// already-resolved arg types
function paramSlotVerdict(param, argLiteral, argKind) {
  if (param.type === 'RestElement') return 'ambiguous';
  const paramTop = isTopKeywordAnnotation(peelTSParenthesized(param.typeAnnotation?.typeAnnotation));
  const paramLit = paramLiteralValue(param);
  if (paramLit !== undefined) {
    if (argLiteral !== undefined) return paramLit === argLiteral ? 'match' : 'non-match';
    // a WIDE arg of the literal's own family may still hold the literal value at
    // runtime through a const binding the kind extraction erased - undecidable
    return argKind !== null && typeof paramLit !== argKind ? 'non-match' : 'ambiguous';
  }
  // a top-typed param (`unknown` / `any`) accepts every argument, so TS picks its arm as soon as the
  // arms before it are refuted - a match, not an ambiguity
  if (paramTop) return 'match';
  const keywordKind = paramPrimitiveKind(param);
  if (keywordKind === null) return 'ambiguous';
  if (argKind === null) return 'ambiguous';
  return keywordKind === argKind ? 'match' : 'non-match';
}

// verdict of one overload against the whole arg list. every SUPPLIED slot is weighed even
// once one of them comes back undecidable, so an arm the prefix provably rejects stays
// rejected however its tail is declared - an optional / rest tail only costs the arm its
// exact-arity MATCH, never its refutation
function overloadArgVerdict(params, argLiterals, argKinds) {
  if (!params) return 'ambiguous';
  const extra = params.slice(argKinds.length);
  // a rest param, or extra params that are ALL optional, may still accept the call; extra
  // REQUIRED params, or more args than a rest-less list has slots, provably reject it
  const arityFits = params.length === argKinds.length
    || (params.length > argKinds.length && extra.every(p => p.optional || p.type === 'RestElement'))
    || params.some(p => p.type === 'RestElement');
  if (!arityFits) return 'non-match';
  // an OPTIONAL tail needs no argument, so an arm the call fills exactly up to it is as exactly
  // matched as one with no tail at all - TS picks it, and grading it ambiguous blocked every arm
  // behind it from being picked either
  const arityExact = params.length === argKinds.length
    || (params.length > argKinds.length && extra.every(p => p.optional));
  let verdict = arityExact ? 'match' : 'ambiguous';
  for (let i = 0; i < params.length && i < argKinds.length; i++) {
    const slot = paramSlotVerdict(params[i], argLiterals[i], argKinds[i]);
    if (slot === 'non-match') return 'non-match';
    if (slot === 'ambiguous') verdict = 'ambiguous';
  }
  return verdict;
}

// TS overload discrimination by args - FIRST-MATCH faithful, LITERAL-aware. answers with both
// halves the callers need:
//   - `selected`: the arm TS provably picks (exact arity, every param a keyword matching the
//     arg's kind, a literal matching the arg node's literal value, or a top-typed `unknown` /
//     `any` that accepts anything), or null. an AMBIGUOUS earlier arm (a union / generic /
//     object-typed param, an unresolvable arg kind, a same-family literal param without an arg
//     literal to compare) might be the arm TS picks, so nothing after it can be single-selected;
//   - `candidates`: every arm the args do not provably reject, for the caller's fold. an arm
//     refuted by arity or by a param that rejects its arg is not a return this call can produce,
//     and folding it in widened the answer to generic for no reason.
// a set of fewer than two signatures is not discriminated at all - there is nothing to choose
// between, and the lone arm is the caller's answer whatever the args are
export function discriminateOverloads(overloads, getParams, argPaths, resolveNodeType) {
  return discriminateOverloadsByArgs(overloads, getParams, argPaths.map(a => a.node),
    argPaths.map(a => {
      const type = resolveNodeType(a);
      // A non-null assertion narrows the TS overload argument, but must not erase the
      // runtime marker used by optional-chain and fallback decisions elsewhere.
      let node = unwrapParens(a.node);
      while (node?.type === 'TSSatisfiesExpression') node = unwrapParens(node.expression);
      return type?.mayBeNullish && node?.type !== 'TSNonNullExpression' ? null : primitiveTypeKind(type?.type);
    }));
}

// the kind a literal argument NODE carries on its own (`'a'` is a string, `1n` a bigint) - what a
// caller without paths to resolve can still say about a slot; a non-literal node says nothing
export function literalArgKind(node) {
  const value = overloadLiteralValue(node);
  return value === undefined ? null : primitiveTypeKind(typeof value);
}

// an overloaded function's IMPLEMENTATION signature - the one with a body - is invisible to its
// callers: only the bodyless heads take part in resolution, and a lone implementation with no heads
// is the whole signature. an ESTree method keeps its function on `.value`; a bodyless one there is
// `TSEmptyBodyFunctionExpression`
export function isImplementationSignature(fnNode) {
  const body = fnNode.body ?? fnNode.value?.body;
  return !!body && body.type !== 'TSEmptyBodyFunctionExpression';
}

// TypeScript hoists a signature with any literal-typed parameter before testing its arguments,
// including an omitted optional parameter. Stable ordering preserves declaration order within a rank.
function specializedSignature(params) {
  const runtime = params && dropLeadingThisParam(params);
  if (!runtime) return false;
  return runtime.some(param => paramLiteralValue(param) !== undefined);
}

// the same discrimination over argument NODES - the spelling for a caller that holds no paths, the
// guard parser reading a test expression
export function discriminateOverloadsByArgs(overloads, getParams, argNodes, argKinds) {
  if (overloads.length < 2) return { selected: null, candidates: overloads };
  // a spread expands to a count only the runtime knows, so every slot from it on is unpaired and
  // the arity is unknown: no arm can be refuted or selected, and the caller is left to require the
  // surviving arms to agree
  if (argNodes.some(node => node.type === 'SpreadElement')) return { selected: null, candidates: overloads };
  const argLiterals = argNodes.map(overloadLiteralValue);
  function specializedRank(ov) {
    return Number(specializedSignature(getParams(ov)));
  }
  const ordered = overloads.toSorted((a, b) => specializedRank(b) - specializedRank(a));
  const candidates = [];
  let selected = null;
  let blocked = false;
  for (const ov of ordered) {
    // a leading `this` pseudo-param fills AST slot 0 but no runtime arg slot - drop it so
    // arity and per-slot pairing align with the call args (an undropped `this` skewed every
    // comparison by one: a this-annotated overload was skipped on arity or mismatched, and
    // a later arm won with the wrong type-specific helper)
    const verdict = overloadArgVerdict(dropLeadingThisParam(getParams(ov)), argLiterals, argKinds);
    if (verdict === 'non-match') continue;
    candidates.push(ov);
    if (verdict === 'ambiguous') blocked = true;
    else if (!blocked && !selected) selected = ov;
  }
  return { selected, candidates };
}
