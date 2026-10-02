// Shared shape predicates and write-target helpers for class members. Single source for the
// predicates shared by `class-fields`, `closure-analysis`, and `class-object-member` - one
// definition eliminates comment / style drift across them.
//
// Top-level `memberWriteTargetPath` is closure-free (operates on a NodePath's `.node.type` +
// `.get(...)`); the two factories carry adapter (`t`) and key resolvers required by
// shape-aware variants.
import { isDeleteTarget, peelSkippableWrapperPath, unwrapRuntimeExpr, singleQuasiString } from '../helpers/ast-patterns.js';

// shape unification of `<expr>.<field> = ...` / `<expr>.<field>++` writes: AssignmentExpression
// target on `.left`, update/delete target on `.argument`. callers ask "is this a member-
// target write, what's the field name, what's the RHS value?" without re-implementing the
// AST shape switch. parser-agnostic - reads `.node.type` strings and uses path navigation.
// a bare MemberExpression IS its own target: destructure-pattern / for-x heads index member
// write paths directly (no enclosing assignment node), so the path stands in for the target
export function memberWriteTargetPath(writePath) {
  const { type } = writePath.node;
  // peel transparent wrappers (TS `!`/`as`/`satisfies`, parens) so a wrapped write target
  // (`this.field! = Y`, `(this.field) = Y`) resolves to the member - callers read `.object` /
  // `memberWriteFieldName` off the result, which a TSNonNull/paren wrapper would strand (the
  // write then drops from the field's flow union, leaving a stale narrow that throws on ie:11)
  if (type === 'UpdateExpression' || isDeleteTarget(writePath.node)) return peelSkippableWrapperPath(writePath.get('argument'));
  if (type === 'MemberExpression') return writePath;
  return peelSkippableWrapperPath(writePath.get('left'));
}

// every census consumer asks the same question of an indexed write: through WHICH receiver does it
// reach the field. for a member write that is the member's `.object`, but an `Object.assign(target,
// { k: v })` source property writes `target.k` with no member expression anywhere, so its receiver
// is the call's first argument. one accessor keeps the two shapes from growing two readers
export function memberWriteReceiverPath(writePath) {
  const { type } = writePath.node;
  if (type === 'ObjectProperty' || type === 'Property') {
    return writePath.parentPath?.parentPath?.get('arguments')?.[0] ?? null;
  }
  return memberWriteTargetPath(writePath).get('object');
}

// class-member kind predicates. babel emits distinct node types for public / private /
// accessor members; ESTree (oxc) uses MethodDefinition / PropertyDefinition with
// PrivateIdentifier keys. collapse both shapes to one predicate per category so callers
// don't miss private members. parameterised by `t` so adapter dispatch stays in the cluster
export function createClassMemberShape({ t }) {
  // the four shapes a class METHOD takes across the two dialects, and the bodyless pair is not
  // optional: babel spells `declare` / `abstract` members `TSDeclareMethod` while oxc normalises the
  // concrete ones and keeps `TSAbstractMethodDefinition`. omitting them made the same source answer
  // differently per parser - a `declare class C { then(cb: (v: T) => void): void }` was a thenable on
  // one side and an opaque object on the other
  function isMethodMember(node) {
    return t.isClassMethod(node) || t.isClassPrivateMethod?.(node)
      || node?.type === 'TSDeclareMethod' || node?.type === 'TSAbstractMethodDefinition';
  }
  function isPropertyMember(node) {
    return t.isClassProperty(node) || t.isClassAccessorProperty(node) || t.isClassPrivateProperty?.(node);
  }
  // narrower question than `isPropertyMember`: does the member install an OWN DATA property? an
  // auto-accessor (`accessor x = 1`) does not - it puts a getter/setter pair on the prototype over a
  // private slot, so it answers a read through the accessor path like any other accessor
  function isDataFieldMember(node) {
    return t.isClassProperty(node) || t.isClassPrivateProperty?.(node);
  }
  return { isMethodMember, isPropertyMember, isDataFieldMember };
}

// member-write semantics: extract the field name from a write-target MemberExpression
// (computed literal-string / literal-number keys resolve via `getKeyName`, truly dynamic
// keys -> null without a scope; a scoped query also folds constant keys), and report the
// value path contributed by a write. Plain `=` contributes
// its RHS path; compound / update / delete operators contribute an opaque null marker
// (operator-coerced type depends on BOTH operands, not statically precise)
export function createMemberWriteShape({ t, getKeyName, resolveComputedKeyName }) {
  function memberWriteFieldName(targetNode, scope) {
    // peel transparent wrappers (TS `!`/`as`/`satisfies`, parens) so a wrapped write target
    // (`this.field! = s`, `(this.field) = s`) is still recognized as a member write - without the
    // peel the field name is lost, the write is dropped from the field's type index, and the field
    // keeps a stale narrow that emits a type-specific Maybe helper throwing on the new value (ie:11)
    const target = unwrapRuntimeExpr(targetNode);
    if (!t.isMemberExpression(target)) return null;
    // A computed key names a field by its value, never by an identifier's spelling.
    // Scoped queries use the canonical constant-key resolver; context-free queries
    // accept only literal keys and single-quasi templates.
    if (target.computed) {
      if (scope) return resolveComputedKeyName(target.property, scope);
      if (t.isIdentifier(target.property)) return null;
      return singleQuasiString(target.property) ?? getKeyName(target.property);
    }
    return getKeyName(target.property);
  }
  // Every write contributes, including null: dropping an opaque contribution would unsoundly
  // narrow the field to its other writes. Keep RHS paths so mixed-family alternatives survive.
  function writePathContributedValue(writePath) {
    return writePath.node.type === 'AssignmentExpression' && writePath.node.operator === '='
      ? writePath.get('right') : null;
  }
  return { memberWriteFieldName, writePathContributedValue };
}
