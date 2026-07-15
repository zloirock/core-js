import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// descendants are found through an index keyed by the SUPER'S NAME, so a class of that same name in
// another scope hands over its own subclasses as if they were this class's. an instance write through
// such a stranger then widens a field fold that nothing actually writes. the two rows differ ONLY in
// whether the stranger's name collides - one method each, so the import set says which row answered what
class Holder {
  items = [1, 2, 3];
  getFirst() {
    return this.items.at(0);
  }
}
class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    return this.entries.includes("a");
  }
}

// the writing subclass belongs to a DIFFERENT class that merely shares the name, so it must not be
// taken for a descendant - the narrow survives and only the array leg appears
function strangerOfTheSameName() {
  class Holder {}
  class Poison extends Holder {}
  new Poison().items = "string";
}

// the same shape with no name collision: the control that pins the name as the only variable
function strangerWithoutCollision() {
  class Unrelated {}
  class Tainted extends Unrelated {}
  new Tainted().entries = "string";
}
strangerOfTheSameName();
strangerWithoutCollision();
new Holder().getFirst();
new Keeper().hasFirst();