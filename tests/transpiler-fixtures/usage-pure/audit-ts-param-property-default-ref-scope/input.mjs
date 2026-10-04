// A parameter-property default owns its receiver memo in a lexical expression activation.
// Constructor-body vars are invisible from parameters, and an enclosing var would be
// shared across reentrant constructions. The same source survives parameter lowering.
class C {
  constructor(public x = [1, 2].flat()) {}
}
new C();
