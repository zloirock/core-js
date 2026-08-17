// TS enum type resolution. valid-TS enum bodies carry numeric or string initializers;
// non-type-checked input can carry anything parseable (see ENUM_VALUE_KINDS). we
// statically classify each member's RUNTIME value-kind and collapse the enum to a
// $Primitive type when all members agree. mixed-kind enums (some number, some string) collapse to null -
// caller treats the enum as opaque rather than mis-narrow to one kind.
//
// Public surface (the two resolvers take the whole merge-set of `enum E {}` blocks):
//   findEnumMember(declaration, name)  - lookup by member name in ONE block
//   resolveEnumMemberType(decls, name) - $Primitive for the named member, or null
//   resolveEnumType(decls)             - $Primitive for the whole enum, or null
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
  // `enum E { A = (1 + 2) }` resolves through the operator table. the operand recursion needs
  // no depth budget: an operator chain deep enough to exhaust this walk's stack exhausts the
  // surrounding traversal first, on both parsers
  function resolveEnumMemberKind(initializer) {
    const init = unwrapParens(initializer);
    // no initialiser means the member has no kind of its OWN - the position-aware classifier
    // below decides it from the predecessor
    if (!init) return null;
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
  function enumMemberName(member) {
    return member.id?.name ?? member.id?.value;
  }

  function findEnumMember(declaration, name) {
    return enumMembers(declaration)?.find(m => enumMemberName(m) === name) ?? null;
  }

  // an initialiser-less member is auto-numbered from the preceding member, so its kind is decided
  // by the nearest preceding INITIALISED one rather than by its own (absent) initialiser. valid TS
  // permits this only after a numeric member, and after anything else the emitters disagree about
  // what the member even holds - measured: babel refuses to transpile the enum at all, swc gives
  // the member `undefined`. neither is an enum value kind, so a non-numeric predecessor bails to
  // null (opaque) instead of letting the `number` default over-resolve into the wrong family
  // asking it per member walked BACK to that initialiser each time and re-read it, so a block of N
  // members re-resolved the same initialiser once per member after it. one FORWARD pass carries the
  // last initialised kind instead and answers every member on the way; `visit` returning false stops
  // it, which is how the single-member lookup pays for only the prefix it needs
  function eachMemberKind(members, visit) {
    let lastKind = null;
    // distinct from `lastKind === null`, which also means "the last initialiser was unclassifiable" -
    // a bare member after THAT one bails, while one before any initialiser auto-numbers
    let seenInitializer = false;
    for (let i = 0; i < members.length; i++) {
      const { initializer } = members[i];
      // a bare member OPENING a block auto-numbers from 0; after an initialised one it continues
      // that member's sequence, which valid TS permits only when the sequence is numeric
      if (initializer) {
        lastKind = resolveEnumMemberKind(initializer);
        seenInitializer = true;
      }
      const kind = initializer ? lastKind
        : !seenInitializer || lastKind === 'number' ? 'number' : null;
      if (visit(i, kind) === false) return;
    }
  }

  // TS merges `enum E {}` blocks, so a member may live in any of them and both lookups below take
  // the whole block list. auto-numbering does NOT carry across the boundary though - each block
  // emits its own initialiser sequence and a bare member opening one restarts at 0 (measured on
  // babel and swc alike), so the kind walk-back stays inside the block that owns the member
  function resolveEnumMemberType(declarations, name) {
    for (const declaration of declarations) {
      const members = enumMembers(declaration);
      const index = members?.findIndex(m => enumMemberName(m) === name) ?? -1;
      if (index < 0) continue;
      let kind = null;
      eachMemberKind(members, (i, memberKind) => {
        if (i !== index) return true;
        kind = memberKind;
        return false;
      });
      if (kind) return new $Primitive(kind);
    }
    return null;
  }

  // uniform across every block -> that kind; any disagreement (or an unclassifiable member) -> null,
  // so the caller keeps the enum opaque instead of masquerading one block's kind
  function resolveEnumType(declarations) {
    let kind = null;
    for (const declaration of declarations) {
      const members = enumMembers(declaration) ?? [];
      let disagreed = false;
      eachMemberKind(members, (_index, memberKind) => {
        if (!memberKind || (kind !== null && kind !== memberKind)) {
          disagreed = true;
          return false;
        }
        kind ??= memberKind;
        return true;
      });
      if (disagreed) return null;
    }
    return kind ? new $Primitive(kind) : null;
  }

  // `enumMembers` / `resolveEnumMemberKind` / `eachMemberKind` stay cluster-private
  return {
    findEnumMember,
    resolveEnumMemberType,
    resolveEnumType,
  };
}
