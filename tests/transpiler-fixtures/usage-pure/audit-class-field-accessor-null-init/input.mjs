// ClassAccessorProperty (TC39 decorators) hits the same `isPropertyMember` branch - auto
// accessor's backing storage follows the same assignment flow as plain fields, so `accessor
// box = null` + `this.box = Set.from(xs)` unions to Set
class C {
  accessor box = null;
  load(xs) { this.box = new Set(xs); }
  snapshot() { return this.box?.entries(); }
}
