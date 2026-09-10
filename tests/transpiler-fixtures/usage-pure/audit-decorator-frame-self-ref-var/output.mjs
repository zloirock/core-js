import _Array$from from "@core-js/pure/actual/array/from";
class Uses {
  // a `var X = X` inside a decorator's inline FUNCTION binds afresh in that frame and hoists to
  // `undefined`, so the initializer reads that undefined and names no global. the decorator's inline
  // function is a scope both emitters reach through a FRAME of their own, and the frame has to
  // surface the binding for that verdict - the third row is the control that it does not simply go
  // unvisited. the names are ones the legacy-decorator helper does not spell itself, so a
  // resurrected read shows in the import set instead of hiding behind the helper's own Map
  @first(function () {
    var Set = Set;
    return new Set([1]);
  })
  a() {}

  // `let`/`const` are real block-scoped shadows (their RHS sits in the TDZ) - the same verdict by a
  // different route, and the control that the two never diverge
  @second(function () {
    let WeakSet = WeakSet;
    return new WeakSet([{}]);
  })
  b() {}

  // ... and an unshadowed read in the same frame, which still polyfills
  @third(function () {
    return _Array$from([1]);
  })
  c() {}
}
export { Uses };