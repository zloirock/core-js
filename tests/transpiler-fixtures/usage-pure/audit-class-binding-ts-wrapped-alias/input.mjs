// `const D = (C as any)` - the alias init is a TS expression wrapper around an Identifier.
// the closure walk must peel TS wrappers between the ref and its semantic parent so the
// VariableDeclarator-init shape is recognised and D enrolls as an alias of C. without the peel,
// the immediate parent stays TSAsExpression, the ref reads as a leak, and narrow disables unsoundly
class C {
  static items = [1, 2, 3];
  static getFirst() { return C.items.at(0); }
}
const D = (C as any);
D.unusedField;
C.getFirst();
