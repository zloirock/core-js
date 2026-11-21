import "core-js/modules/es.array.includes";
// The writes belong to an unrelated superclass even when its name matches the reader's.
class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    return this.entries.includes("a");
  }
}
function strangerWithoutCollision() {
  class Unrelated {}
  class Tainted extends Unrelated {}
  new Tainted().entries = "string";
}
strangerWithoutCollision();
export const found = new Keeper().hasFirst();