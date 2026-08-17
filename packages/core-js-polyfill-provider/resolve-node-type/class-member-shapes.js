// Shared shape predicates and write-target helpers for class members. Single source for the
// predicates shared by `class-fields`, `closure-analysis`, and `class-object-member` - one
// definition eliminates comment / style drift across them.
//
// Top-level `memberWriteTargetPath` is closure-free (operates on a NodePath's `.node.type` +
// `.get(...)`); the two factories carry adapter (`t`) and key/type resolvers required by
// shape-aware variants.
import { $Primitive } from './base.js';
import { peelSkippableWrapperPath, unwrapRuntimeExpr, singleQuasiString } from '../helpers/ast-patterns.js';

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
// keys -> null), and report the resolved type contributed by a write. pure `=` with
// resolvable RHS contributes the RHS type; compound / update operators push `unknown`
// (operator-coerced type depends on BOTH operands, not statically precise)
export function createMemberWriteShape({ t, getKeyName, resolveNodeType }) {
  function memberWriteFieldName(targetNode) {
    // peel transparent wrappers (TS `!`/`as`/`satisfies`, parens) so a wrapped write target
    // (`this.field! = s`, `(this.field) = s`) is still recognized as a member write - without the
    // peel the field name is lost, the write is dropped from the field's type index, and the field
    // keeps a stale narrow that emits a type-specific Maybe helper throwing on the new value (ie:11)
    const target = unwrapRuntimeExpr(targetNode);
    if (!t.isMemberExpression(target)) return null;
    // a computed key names a field only by its STATIC value: a string / number literal (`this['f']` /
    // `this[0]`, via getKeyName) or a single-quasi template (`this[`f`]`, via singleQuasiString). a
    // dynamic computed key names the field by a RUNTIME value - `this[k]` by the variable's value (not
    // its name), `this[f()]` by the call result - so it must not be attributed to any name -> null,
    // honouring this function's contract and matching the computed-key resolution used elsewhere
    if (target.computed) {
      if (t.isIdentifier(target.property)) return null;
      return singleQuasiString(target.property) ?? getKeyName(target.property);
    }
    return getKeyName(target.property);
  }
  // TOTAL: every write contributes a type. an opaque RHS yields the `unknown` sentinel rather than
  // null, so a caller must never gate on the result - a guard there reads as "this write might not
  // count", which is exactly the dropped-write bug the sentinel exists to prevent
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
