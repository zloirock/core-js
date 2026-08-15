// Pure AST-shape predicates and accessors for type / qualified-name / interface heritage
// nodes. all functions are closure-free: no factory state, no parser context. shared by
// `name-resolution`, `type-subst`, `type-members`, `user-type-resolve`, `member-resolve`,
// and the factory itself.
//
// `getTypeArgs` is the only outside dep (imports from `helpers/ast-patterns.js`).
//
// the shape predicates here encode cross-parser compatibility (babel / oxc / flow), discovered
// empirically per parser - change them only with care
import { getTypeArgs, isDeferredContextStep, isTypeAnnotationWrapper } from '../helpers/ast-patterns.js';
import { isLoopStatement } from '../destructure-host-shape.js';
import { dropLeadingThisParam, literalNodeValue, MODIFIER_WRAPPER_DELTAS, PRIMITIVE_HINTS } from './base.js';

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

// is this node a qualified name link with non-identifier slots peeled? accepts:
//   - babel: TSQualifiedName (TS) / QualifiedTypeIdentifier (Flow)
//   - oxc:   non-computed MemberExpression in type position (interface heritage, etc)
export function isQualifiedNameNode(node) {
  return node?.type === 'TSQualifiedName' || node?.type === 'QualifiedTypeIdentifier'
    || (node?.type === 'MemberExpression' && !node.computed);
}

// qualified-name accessors: the "left" / "right" slots differ across parsers but the
// semantic role is identical (left=parent path, right=segment-name Identifier). module-private -
// `collectQualifiedSegments` below is the only consumer, and exporting them invited a test that
// asserted the slots instead of the walk they serve
function qualifiedNameLeft(node) { return node.left ?? node.qualification ?? node.object; }
function qualifiedNameRight(node) { return node.right ?? node.id ?? node.property; }

// walk a possibly-qualified name node into a [first, ..., last] segment list
// returns null on any non-identifier link in the chain
export function collectQualifiedSegments(node) {
  if (node?.type === 'Identifier') return [node.name];
  if (!isQualifiedNameNode(node)) return null;
  const left = collectQualifiedSegments(qualifiedNameLeft(node));
  const right = qualifiedNameRight(node);
  if (!left || right?.type !== 'Identifier') return null;
  left.push(right.name);
  return left;
}

export function typeRefName(node) {
  const segments = typeRefSegments(node);
  return segments?.length === 1 ? segments[0] : null;
}

// the MUTABLE collection a readonly-collection type is a read-only view of: `readonly T[]` /
// `readonly [T, U]` / `ReadonlyArray<T>` -> 'Array', `ReadonlySet<T>` -> 'Set', `ReadonlyMap<K, V>`
// -> 'Map', `Readonly<T[]>` / `Readonly<Set<T>>` (the utility applied to a collection) -> that
// collection's base. else null. a readonly collection is NOT assignable to its mutable form, so the
// conditional-infer matcher gates the true branch when the check is the readonly view of the pattern's
// container. peels a leading TSTypeAnnotation and TSParenthesized (oxc keeps `(readonly T[])` parens
// where babel strips them - without the peel the gate misfires on the oxc path)
export function readonlyCollectionBase(node) {
  const n = peelTSParenthesized(isTypeAnnotationWrapper(node) ? node.typeAnnotation : node);
  if (n?.type === 'TSTypeOperator' && n.operator === 'readonly') return 'Array';
  if (n?.type !== 'TSTypeReference') return null;
  const name = typeRefName(n);
  // `$ReadOnlyArray` is Flow's spelling of `ReadonlyArray`, and `$ReadOnly` of `Readonly` - the same
  // types, so the same answer: a name-keyed reader that knows only the TS half tags one dialect and
  // not the other, and a readonly-discriminating conditional then flips by which dialect wrote it
  if (name === 'ReadonlyArray' || name === '$ReadOnlyArray') return 'Array';
  if (name === 'ReadonlySet') return 'Set';
  if (name === 'ReadonlyMap') return 'Map';
  // `Readonly<X>` is the readonly view of X - on a collection it IS that collection's readonly form
  // (`Readonly<T[]>` === `readonly T[]`, `Readonly<[T, U]>` === `readonly [T, U]`), so its base is X's
  // collection base (a tuple is array-family, matching the `readonly` operator form above)
  if (name === 'Readonly' || name === '$ReadOnly') {
    const arg = peelTSParenthesized(getTypeArgs(n)?.params?.[0]);
    if (arg?.type === 'TSTupleType') return 'Array';
    return mutableCollectionName(arg) ?? readonlyCollectionBase(arg);
  }
  return null;
}

// is the type node a READONLY array shape (`readonly T[]` / `ReadonlyArray<T>`)?
export function isReadonlyArrayType(node) {
  return readonlyCollectionBase(node) === 'Array';
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

// the readonly half of a mapped type's modifiers, applied to an already-resolved Type. a
// HOMOMORPHIC readonly mapped type is the readonly VIEW of its source - `{ readonly [K in keyof
// T]: T[K] }` over a collection is that collection's readonly form, the same type `Readonly<T>`
// spells - so it carries the same marker, and `-readonly` takes it back off. both resolution
// lanes call this at their mapped-type arm, where the passthrough is already in hand; the
// name-keyed `readonlyCollectionBase` cannot answer it, since the source is behind a type param
export function markMappedReadonly(resolved, node) {
  const { readonly } = mappedModifierDelta(node);
  if (!resolved || resolved.primitive || readonly === undefined) return resolved;
  return readonly ? resolved.mark('readonly') : resolved.unmark('readonly');
}

// the readonly post-pass BOTH resolution lanes run on their own result: a readonly-collection
// SPELLING resolves to the mutable constructor, and only this marker keeps a readonly-discriminating
// conditional on the false branch. the plain and substitution lanes carried a byte-identical copy
// each; one name so a new readonly spelling reaches both by construction
export function markReadonlyCollection(resolved, node) {
  return resolved && !resolved.primitive && readonlyCollectionBase(node) ? resolved.mark('readonly') : resolved;
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
  return { ...inner, ...outer };
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

// the MUTABLE collection name a type node denotes: `T[]` / `Array<T>` -> 'Array', `Set<T>` -> 'Set',
// `Map<K, V>` -> 'Map'. else null (readonly forms return null - they are not the mutable collection).
// paired with `readonlyCollectionBase`: a readonly check is not assignable to the mutable form of the
// SAME base, so a conditional `<readonly X> extends <mutable X>` takes the FALSE branch. the pair is
// symmetric for the three collection REFERENCES and the `readonly` operator; a tuple has no mutable
// arm here because `readonly [A, B]` vs `[A, B]` is decided a layer down, where both sides carry a
// resolved Array Type-Object and only the readonly marker differs
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
  // a member that is ITSELF a union is SPLICED, not nested: downstream resolves a nested arm as a
  // whole, and an arm that diverges resolves to nothing, which sinks the entire set instead of
  // contributing its members. the dialect predicate carries the Flow spelling too, which a
  // hand-written `type === 'TSUnionType'` test at one of these sites had been missing
  const flat = [];
  for (const type of types) {
    if (isUnionType(type)) flat.push(...type.types);
    else flat.push(type);
  }
  return flat.length === 1 ? flat[0] : { type: 'TSUnionType', types: flat };
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

// peel transparent paren wrappers from a TYPE annotation. oxc preserves `(T)` shape as
// `TSParenthesizedType` AST node (babel parser drops it during parsing). callers that
// pattern-match on the inner type's discriminator (`TSUnionType`, `TSIntersectionType`,
// `TSTypeQuery`, etc.) MUST peel first or the wrapped shapes leak past the dispatch
// branch on the oxc parser path while behaving correctly on babel
export function peelTSParenthesized(node) {
  while (node?.type === 'TSParenthesizedType') node = node.typeAnnotation;
  return node;
}

// `typeof import('x').Bar` parses as TSTypeQuery wrapping TSImportType. the outer
// TSTypeQuery hides the structurally-opaque inner from a flat type-discriminator check,
// so callers that want to treat `typeof import(...)` as opaque must look one level in
export function isTypeQueryOverImportType(node) {
  return node?.type === 'TSTypeQuery' && node.exprName?.type === 'TSImportType';
}

// re-exported from the shared canon so the detect cluster (which must not import this one) and the
// type resolver read ONE definition of the shape; the runtime-`undefined` semantic still needs the
// caller's scope check on top
export { isBareUndefinedIdentifier } from '../helpers/ast-patterns.js';

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

// is this class member private? `#x` field / method / getter-setter / `accessor #x` / `static #x`.
// EVERY private form keys on a PrivateName (babel) or PrivateIdentifier (oxc), so the key type alone
// is the cross-parser-complete signal - no node-type list (ClassPrivateProperty / ClassPrivateMethod /
// ClassAccessorProperty ...) which would differ per parser and drift (babel `accessor #x` is a
// ClassAccessorProperty, not a ClassPrivateProperty, so a node-type check silently mis-routes it public)
export function isPrivateMemberNode(node) {
  return node?.key?.type === 'PrivateName' || node?.key?.type === 'PrivateIdentifier';
}

// byte-range containment: `inner`'s span sits within `outer`'s span (both need source positions)
function hasRange(node) {
  return node && node.start !== null && node.start !== undefined && node.end !== null && node.end !== undefined;
}
export function nodeRangeContains(outer, inner) {
  return hasRange(outer) && hasRange(inner) && inner.start >= outer.start && inner.end <= outer.end;
}

// does `loopNode`'s re-executing region (body / test / for-update slot, but NOT the once-only
// for-init slot) contain a reassignment that survives the back-edge? `bindingAnchor` ({ decl, kind })
// gates it by declaration POSITION + binding KIND, NOT scope: estree-toolkit attaches BOTH a for-body
// `let` and a for-body `var` to the ForStatement scope (babel uses the body block for `let`, the
// function for `var`), so a scope test cannot tell function-scoped `var` from block-scoped `let`.
// a binding is re-created / re-bound each iteration (no back-edge) when it is a for-of/in loop variable
// (declared in `left`, re-bound to the next element, any kind) OR a block-scoped (`let`/`const`)
// binding declared in the loop BODY (fresh per iteration). a `var` is function-scoped and carries even
// when written in the body; a C-style `for (let x = init; ;)` HEADER binding is declared in the
// once-only init slot and is COPIED per iteration (carries); an outer binding is declared outside the
// loop. shared soundness core for the value-flow walk and the discriminant walk
export function loopReExecRegionHasViolation(loopNode, violationNodes, bindingAnchor) {
  const { decl, kind } = bindingAnchor ?? {};
  const initNode = loopNode.type === 'ForStatement' ? loopNode.init : null;
  const reBoundInLeft = decl && loopNode.left && nodeRangeContains(loopNode.left, decl);
  const blockScopedInBody = decl && kind && kind !== 'var' && nodeRangeContains(loopNode.body, decl);
  if (reBoundInLeft || blockScopedInBody) return false;
  return violationNodes.some(v => nodeRangeContains(loopNode, v) && !(initNode && nodeRangeContains(initNode, v)));
}

// loop back-edge soundness for source-position-based narrows. a reassignment that re-executes on
// the back-edge before the next-iteration use makes a narrow chosen purely by source position
// ("last assignment before the use" / declarator-init fallback / preceding guard) stale from
// iteration 2 onward. true when `usagePath` sits inside a loop whose re-executing region contains
// one of `violationNodes` (a reassignment of the binding). walk stops at the function boundary -
// mirrors the crossedBackEdgeLoop guard in narrow-by-guards.js
export function usageCrossesLoopBackEdgeReassign(t, usagePath, violationNodes, bindingAnchor) {
  if (!violationNodes?.length) return false;
  for (let cur = usagePath, parent; (parent = cur.parentPath) && !t.isFunction(parent.node); cur = parent) {
    if (isLoopStatement(parent.node) && loopReExecRegionHasViolation(parent.node, violationNodes, bindingAnchor)) return true;
  }
  return false;
}

// soundness filter for source-position narrows: a reassignment of the binding that lives inside a
// DEFERRED evaluation context nested below the binding scope can run before the use regardless of
// source position, so a positional check can't see it - a captured function (`mutate(); use; function
// mutate(){ x = y }`) OR an instance class-field initializer (`class C { f = (x = y) }`, which runs at
// construction time). true when any violation sits inside such a context on the parent chain up to
// (but not including) `stopPath` (the binding scope path). uses the canonical `isDeferredContextStep`
// so the read-side gate stays in lockstep with the write-side fold and the value-flow walk
export function violationInCapturedFunction(t, violations, stopPath) {
  if (!violations?.length) return false;
  return violations.some(v => {
    // a canonically-recovered extra has no parent chain to prove it is NOT captured - assume it is
    if (v.canonicalRecovered) return true;
    // guard `p?.node` (not just `p`): the parent chain can overshoot `stopPath` and reach a
    // detached / tree-root path with a null node, so terminate there - matches the canonical
    // `hasDeferredContextAncestor` / `violationRunsDeferred` walkers that share this predicate
    for (let p = v.parentPath, child = v; p?.node && p !== stopPath; child = p, p = p.parentPath) {
      if (isDeferredContextStep(t, p.node, child)) return true;
    }
    return false;
  });
}

// primitive kind of a param's type keyword (`x: bigint` -> 'bigint'); covers the 5 typeof-primitive
// keywords (string / number / boolean / bigint / symbol - PRIMITIVE_HINTS), null for a literal / complex /
// generic / null / undefined param (indeterminate for arg-match). shared by the member-overload and
// ambient-function-overload arg-match below
function paramPrimitiveKind(param) {
  switch (param?.typeAnnotation?.typeAnnotation?.type) {
    case 'TSStringKeyword': return 'string';
    case 'TSNumberKeyword': return 'number';
    case 'TSBooleanKeyword': return 'boolean';
    case 'TSBigIntKeyword': return 'bigint';
    case 'TSSymbolKeyword': return 'symbol';
    default: return null;
  }
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
  const value = literalNodeValue(node);
  return value !== null && typeof value !== 'object' ? value : undefined;
}

// the literal value of a literal-typed param (`k: 'a'` / `k: 1` / `k: true` / `k: 1n`), or undefined
function paramLiteralValue(param) {
  const lit = param?.typeAnnotation?.typeAnnotation;
  return lit?.type === 'TSLiteralType' ? overloadLiteralValue(lit.literal) : undefined;
}

// verdict of ONE param slot against its call arg: 'match' / 'non-match' / 'ambiguous'.
// the literal is read off the arg NODE (the resolved type erases it), the kind from the
// already-resolved arg types
function paramSlotVerdict(param, argLiteral, argKind) {
  if (param.type === 'RestElement') return 'ambiguous';
  const paramLit = paramLiteralValue(param);
  if (paramLit !== undefined) {
    if (argLiteral !== undefined) return paramLit === argLiteral ? 'match' : 'non-match';
    // a WIDE arg of the literal's own family may still hold the literal value at
    // runtime through a const binding the kind extraction erased - undecidable
    return argKind !== null && typeof paramLit !== argKind ? 'non-match' : 'ambiguous';
  }
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
  let verdict = params.length === argKinds.length ? 'match' : 'ambiguous';
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
//     arg's kind or a literal matching the arg node's literal value), or null. an AMBIGUOUS
//     earlier arm (an `unknown` / `any` / union / generic param, an unresolvable arg kind, a
//     same-family literal param without an arg literal to compare) might be the arm TS picks,
//     so nothing after it can be single-selected;
//   - `candidates`: every arm the args do not provably reject, for the caller's fold. an arm
//     refuted by arity or by a param that rejects its arg is not a return this call can produce,
//     and folding it in widened the answer to generic for no reason.
// a set of fewer than two signatures is not discriminated at all - there is nothing to choose
// between, and the lone arm is the caller's answer whatever the args are
export function discriminateOverloads(overloads, getParams, argPaths, resolveNodeType) {
  if (overloads.length < 2) return { selected: null, candidates: overloads };
  const argLiterals = argPaths.map(a => overloadLiteralValue(a.node));
  const argKinds = argPaths.map(a => primitiveTypeKind(resolveNodeType(a)?.type));
  const candidates = [];
  let selected = null;
  let blocked = false;
  for (const ov of overloads) {
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
