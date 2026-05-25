// `const D = (C as any)` - the alias init is a TS expression wrapper around an Identifier.
// closure-walker must peel TS expression wrappers between the ref and its semantic parent so
// the VariableDeclarator-init shape is recognised and D enrolls as an alias of C. without
// the peel, the ref's immediate parent stays as TSAsExpression (not VariableDeclarator),
// classifier falls through to 'leak', closure bails to null, and narrow disables - emitting
// generic `_at` even though no writes ever escape the closure
class C {
  static items = [1, 2, 3];
  static getFirst() { return C.items.at(0); }
}
const D = (C as any);
D.unusedField;
C.getFirst();
