// TS enum type resolution. enum bodies carry numeric or string literal initializers; we
// statically classify each member's value-kind and collapse the enum to a $Primitive type
// when all members agree. mixed-kind enums (some number, some string) collapse to null -
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
import { unwrapParens } from '../helpers/ast-patterns.js';

export function createEnumTypes({ babelNodeType }) {
  // ESTree preserves ParenthesizedExpression wrappers (babel strips them); unwrap so
  // `enum E { A = (1 + 2) }` resolves through BinaryExpression's operand-shape check
  function resolveEnumMemberKind(initializer) {
    const init = unwrapParens(initializer);
    if (!init) return 'number'; // implicit numeric
    const nodeType = babelNodeType(init);
    if (nodeType === 'StringLiteral') return 'string';
    // numeric UnaryExpression: `+`/`-`/`~` yield number; `!` yields boolean (invalid as
    // enum initializer but TS would reject at compile time); `typeof`/`void`/`delete`
    // yield non-number. limit to arithmetic operators to stay precise
    if (init.type === 'UnaryExpression') {
      return init.operator === '+' || init.operator === '-' || init.operator === '~' ? 'number' : null;
    }
    if (nodeType === 'NumericLiteral') return 'number';
    if (init.type === 'TemplateLiteral') return 'string';
    if (init.type === 'BinaryExpression') {
      const left = resolveEnumMemberKind(init.left);
      return left && left === resolveEnumMemberKind(init.right) ? left : null;
    }
    return null;
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
