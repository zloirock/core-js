// Pure AST-shape predicates and accessors for type / qualified-name / interface heritage
// nodes. all functions are closure-free: no factory state, no parser context. shared by
// `name-resolution`, `type-subst`, `type-members`, `user-type-resolve`, `member-resolve`,
// and the factory itself.
//
// `getTypeArgs` is the only outside dep (imports from `helpers/ast-patterns.js`).
//
// Public surface mirrors what was previously inlined in the factory body. Move-not-rewrite
// to preserve cross-parser shape compatibility (babel/oxc/flow) without re-discovery cost
import { getTypeArgs } from '../helpers/ast-patterns.js';

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

export function typeAliasBody(decl) {
  if (decl.type === 'TSTypeAliasDeclaration') return decl.typeAnnotation;
  if (decl.type === 'OpaqueType') return decl.impltype;
  return decl.right;
}

// TS extends: TSExpressionWithTypeArguments has .expression; Flow extends: InterfaceExtends has .id.
// null on neither slot - callers use `?.type` / `if (!base)` to bail rather than silently
// treating the heritage clause itself as the qualified head. earlier `?? parent` fallback
// masked future parser regressions (new heritage shape) by handing back a non-Identifier
// wrapper that downstream filters silently rejected
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
