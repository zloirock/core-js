class Uses {
  // `var X = X` self-refs the GLOBAL on the RHS; the decorator's inline function gets a dedicated
  // estree FRAME scope whose binding must surface KIND `var` so the self-ref-var guard fires and the
  // RHS + the constructor both substitute to the pure `_Map`. a null-kind binding treated `var Map`
  // as a real shadow and left the whole thing raw, missing the substitution.
  @first(function () { var Map = Map; return new Map([[1, 2]]); })
  a() {}

  // `let`/`const` are real block-scoped shadows (their RHS sits in the TDZ), NOT self-ref vars - the
  // local constructor stays the user binding and is NOT substituted.
  @second(function () { let Set = Set; return new Set([1]); })
  b() {}
}

export { Uses };
