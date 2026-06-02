// Shared shape predicates and write-target helpers for class members. Consolidates
// definitions that were previously duplicated across `class-fields`, `closure-analysis`,
// and `class-object-member` clusters - logic identical, but drift in comments / style
// already started. Single source eliminates the drift surface.
//
// Top-level `memberWriteTargetPath` is closure-free (operates on a NodePath's `.node.type` +
// `.get(...)`); the two factories carry adapter (`t`) and key/type resolvers required by
// shape-aware variants.
import { $Primitive } from './base.js';

// shape unification of `<expr>.<field> = ...` / `<expr>.<field>++` writes: AssignmentExpression
// target on `.left`, UpdateExpression target on `.argument`. callers ask "is this a member-
// target write, what's the field name, what's the RHS type?" without re-implementing the
// AST shape switch. parser-agnostic - reads `.node.type` strings and uses path navigation.
// a bare MemberExpression IS its own target: destructure-pattern / for-x heads index member
// write paths directly (no enclosing assignment node), so the path stands in for the target
export function memberWriteTargetPath(writePath) {
  const { type } = writePath.node;
  if (type === 'UpdateExpression') return writePath.get('argument');
  if (type === 'MemberExpression' || type === 'OptionalMemberExpression') return writePath;
  return writePath.get('left');
}

// class-member kind predicates. babel emits distinct node types for public / private /
// accessor members; ESTree (oxc) uses MethodDefinition / PropertyDefinition with
// PrivateIdentifier keys. collapse both shapes to one predicate per category so callers
// don't miss private members. parameterised by `t` so adapter dispatch stays in the cluster
export function createClassMemberShape({ t }) {
  function isMethodMember(node) {
    return t.isClassMethod(node) || t.isClassPrivateMethod?.(node);
  }
  function isPropertyMember(node) {
    return t.isClassProperty(node) || t.isClassAccessorProperty(node) || t.isClassPrivateProperty?.(node);
  }
  return { isMethodMember, isPropertyMember };
}

// member-write semantics: extract the field name from a write-target MemberExpression
// (computed literal-string / literal-number keys resolve via `getKeyName`, truly dynamic
// keys -> null), and report the resolved type contributed by a write. pure `=` with
// resolvable RHS contributes the RHS type; compound / update operators push `unknown`
// (operator-coerced type depends on BOTH operands, not statically precise)
export function createMemberWriteShape({ t, getKeyName, resolveNodeType }) {
  function memberWriteFieldName(targetNode) {
    if (!t.isMemberExpression(targetNode)) return null;
    return getKeyName(targetNode.property);
  }
  function writePathContributedType(writePath) {
    if (writePath.node.type === 'AssignmentExpression' && writePath.node.operator === '=') {
      return resolveNodeType(writePath.get('right'));
    }
    return new $Primitive('unknown');
  }
  return { memberWriteFieldName, writePathContributedType };
}
