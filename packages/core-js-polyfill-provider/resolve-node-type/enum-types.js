// TS enum type resolution. valid-TS enum bodies carry numeric or string initializers;
// non-type-checked input can carry anything parseable (see ENUM_VALUE_KINDS). we
// statically classify each member's RUNTIME value-kind and collapse the enum to a
// $Primitive type when all members agree. mixed-kind enums (some number, some string) collapse to null -
// caller treats the enum as opaque rather than mis-narrow to one kind.
//
// Public surface:
//   resolveEnumMemberKind(initializer) - 'string' | 'number' | null
//   enumMembers(declaration)           - cross-parser body unwrap
//   findEnumMember(declaration, name)  - lookup by member name
//   resolveEnumMemberType(decl, name)  - $Primitive for the named member, or null
//   resolveEnumType(declaration)       - $Primitive for the whole enum, or null
//
// Service object passes `babelNodeType` (Babel/ESTree literal-discriminator normaliser).
// `$Primitive` and `unwrapParens` are imported directly - no closure deps
import { $Primitive } from './base.js';
import { binaryOperatorResultKind, unaryOperatorResultKind } from './value-ops.js';
import { unwrapParens } from '../helpers/ast-patterns.js';

// kinds an enum member may carry at RUNTIME. valid TS allows ONLY number and string
// enum members (a bigint / typeof / comparison initializer is a compile error) - but
// strip-mode transpilation feeds us non-type-checked source, and there the runtime value
// of `1n * 2n` IS a bigint, so classifying it truthfully beats bailing to an opaque
// receiver (a known bigint suppresses pointless string-name dispatch; the canonical
// resolver already treats $Primitive('bigint') as first-class). anything else the shared
// operator table reports (boolean from a comparison, undefined, unknown) bails the member
// to null so the caller treats the enum as opaque instead of mis-narrowing
const ENUM_VALUE_KINDS = new Set(['string', 'number', 'bigint']);

export function createEnumTypes({ babelNodeType }) {
  // ESTree preserves ParenthesizedExpression wrappers (babel strips them); unwrap so
  // `enum E { A = (1 + 2) }` resolves through the operator table
  function resolveEnumMemberKind(initializer) {
    const init = unwrapParens(initializer);
    if (!init) return 'number'; // implicit numeric
    const nodeType = babelNodeType(init);
    if (nodeType === 'StringLiteral' || init.type === 'TemplateLiteral') return 'string';
    if (nodeType === 'NumericLiteral') return 'number';
    if (nodeType === 'BigIntLiteral') return 'bigint';
    // operator semantics delegate to the SHARED table (value-ops) - the node-level
    // operand walk below is the only enum-specific part. non-value results (boolean
    // comparisons etc.) are invalid TS enum initializers reachable through a
    // non-type-checking parse; the kind gate bails them
    let kind = null;
    if (init.type === 'UnaryExpression') {
      kind = unaryOperatorResultKind(init.operator, () => resolveEnumMemberKind(init.argument));
    } else if (init.type === 'BinaryExpression') {
      kind = binaryOperatorResultKind(init.operator,
        () => resolveEnumMemberKind(init.left), () => resolveEnumMemberKind(init.right));
    }
    return ENUM_VALUE_KINDS.has(kind) ? kind : null;
  }

  // ESTree (oxc-parser): members under body.members; Babel: directly on declaration
  function enumMembers(declaration) {
    return declaration.members ?? declaration.body?.members;
  }

  // member's id may be Identifier (babel) or StringLiteral (oxc) - handle both shapes
  function findEnumMember(declaration, name) {
    return enumMembers(declaration)?.find(m => (m.id?.name ?? m.id?.value) === name) ?? null;
  }

  function resolveEnumMemberType(declaration, name) {
    const member = findEnumMember(declaration, name);
    if (!member) return null;
    const kind = resolveEnumMemberKind(member.initializer);
    return kind ? new $Primitive(kind) : null;
  }

  function resolveEnumType(declaration) {
    const members = enumMembers(declaration);
    if (!members?.length) return null;
    let kind = null;
    for (const member of members) {
      const memberKind = resolveEnumMemberKind(member.initializer);
      if (!memberKind) return null;
      kind ??= memberKind;
      if (kind !== memberKind) return null;
    }
    return kind ? new $Primitive(kind) : null;
  }

  // `enumMembers` stays cluster-private (consumed by `findEnumMember` / `resolveEnumType`)
  return {
    resolveEnumMemberKind,
    findEnumMember,
    resolveEnumMemberType,
    resolveEnumType,
  };
}
