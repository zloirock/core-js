import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// `ConstructorParameters<typeof Derived>` recovers the ambient super class by a TYPE lookup of the
// `extends` name. that lookup must anchor at the CLASS, not at the reference site: an unrelated
// local `Base` shadowing the name there would resolve the element type to the wrong constructor
// and pick the wrong instance helper for it
declare class Base {
  constructor(a: number[]);
}
class Derived extends Base {}
function shadowed() {
  class Base {
    constructor(b: string);
  }
  type P = ConstructorParameters<typeof Derived>;
  const picked: P[0] = null!;
  return _atMaybeArray(picked).call(picked, 0);
}