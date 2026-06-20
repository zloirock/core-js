// Shared shape predicates and write-target helpers for class members. Single source for the
// predicates shared by `class-fields`, `closure-analysis`, and `class-object-member` - one
// definition eliminates comment / style drift across them.
//
// Top-level `memberWriteTargetPath` is closure-free (operates on a NodePath's `.node.type` +
// `.get(...)`); the two factories carry adapter (`t`) and key/type resolvers required by
// shape-aware variants.
import { $Primitive } from './base.js';
import { peelSkippableWrapperPath, peelSkippableWrappers } from '../helpers/ast-patterns.js';

// shape unification of `<expr>.<field> = ...` / `<expr>.<field>++` writes: AssignmentExpression
// target on `.left`, UpdateExpression target on `.argument`. callers ask "is this a member-
// target write, what's the field name, what's the RHS type?" without re-implementing the
// AST shape switch. parser-agnostic - reads `.node.type` strings and uses path navigation.
// a bare MemberExpression IS its own target: destructure-pattern / for-x heads index member
// write paths directly (no enclosing assignment node), so the path stands in for the target
export function memberWriteTargetPath(writePath) {
  const { type } = writePath.node;
  // peel transparent wrappers (TS `!`/`as`/`satisfies`, parens) so a wrapped write target
  // (`this.field! = Y`, `(this.field) = Y`) resolves to the member - callers read `.object` /
  // `memberWriteFieldName` off the result, which a TSNonNull/paren wrapper would strand (the
  // write then drops from the field's flow union, leaving a stale narrow that throws on ie:11)
  if (type === 'UpdateExpression') return peelSkippableWrapperPath(writePath.get('argument'));
  if (type === 'MemberExpression') return writePath;
  return peelSkippableWrapperPath(writePath.get('left'));
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
    // peel transparent wrappers (TS `!`/`as`/`satisfies`, parens) so a wrapped write target
    // (`this.field! = s`, `(this.field) = s`) is still recognized as a member write - without the
    // peel the field name is lost, the write is dropped from the field's type index, and the field
    // keeps a stale narrow that emits a type-specific Maybe helper throwing on the new value (ie:11)
    const target = peelSkippableWrappers(targetNode);
    if (!t.isMemberExpression(target)) return null;
    return getKeyName(target.property);
  }
  function writePathContributedType(writePath) {
    if (writePath.node.type === 'AssignmentExpression' && writePath.node.operator === '=') {
      // an opaque RHS (resolveNodeType -> null) must WIDEN the field to unknown, not be dropped:
      // consumers gate on a truthy contribution, so a null silently keeps the field narrowed to its
      // other (e.g. array) writes and emits a type-specific Maybe helper that throws on a foreign
      // runtime value (ie:11). same `unknown` sentinel the compound / update branch already uses
      return resolveNodeType(writePath.get('right')) ?? new $Primitive('unknown');
    }
    return new $Primitive('unknown');
  }
  return { memberWriteFieldName, writePathContributedType };
}
