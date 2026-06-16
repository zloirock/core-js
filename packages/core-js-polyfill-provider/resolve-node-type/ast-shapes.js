// Pure AST-shape predicates and accessors for type / qualified-name / interface heritage
// nodes. all functions are closure-free: no factory state, no parser context. shared by
// `name-resolution`, `type-subst`, `type-members`, `user-type-resolve`, `member-resolve`,
// and the factory itself.
//
// `getTypeArgs` is the only outside dep (imports from `helpers/ast-patterns.js`).
//
// the shape predicates here encode cross-parser compatibility (babel / oxc / flow), discovered
// empirically per parser - change them only with care
import { getTypeArgs, isDeferredContextStep } from '../helpers/ast-patterns.js';
import { isLoopStatement } from '../destructure-host-shape.js';

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
// semantic role is identical (left=parent path, right=segment-name Identifier)
export function qualifiedNameLeft(node) { return node.left ?? node.qualification ?? node.object; }
export function qualifiedNameRight(node) { return node.right ?? node.id ?? node.property; }

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

export function isTypeAlias(decl) {
  return decl?.type === 'TSTypeAliasDeclaration' || decl?.type === 'TypeAlias' || decl?.type === 'OpaqueType';
}

export function isInterfaceDeclaration(decl) {
  return decl?.type === 'TSInterfaceDeclaration' || decl?.type === 'InterfaceDeclaration';
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
  if (decl.type === 'OpaqueType') return decl.impltype;
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

// bare-`undefined` Identifier shape. callers needing the runtime-`undefined` semantic
// MUST additionally check scope binding (`undefined` is shadowable: `(undefined => ...)`,
// `var undefined`, `const undefined = "X"`); the pure-shape predicate is parser-side only
export function isBareUndefinedIdentifier(node) {
  return node?.type === 'Identifier' && node.name === 'undefined';
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
    for (let p = v.parentPath, child = v; p && p !== stopPath; child = p, p = p.parentPath) {
      if (isDeferredContextStep(t, p.node, child)) return true;
    }
    return false;
  });
}
