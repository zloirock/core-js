import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// instances are matched to their class through indexes keyed by the CONSTRUCTOR'S NAME, so a class of
// that same name in another scope drops its own instances into this class's bucket and their writes
// widen a field nothing here writes. the two rows enter through different matchers - one through the
// `new` index for a named instance, one through the external-write predicate for a transient - and
// neither stranger may reach us, so both rows keep their narrow and no string leg appears
class Holder {
  items = [1, 2, 3];
  getFirst() {
    var _ref;
    return _atMaybeArray(_ref = this.items).call(_ref, 0);
  }
}
class Keeper {
  entries = ["a", "b"];
  hasFirst() {
    var _ref2;
    return _includesMaybeArray(_ref2 = this.entries).call(_ref2, "a");
  }
}

// the stranger's instance is BOUND, so the write travels through its binding
function strangerBoundInstanceWrite() {
  class Holder {}
  const s = new Holder();
  s.items = "string";
}

// the stranger's instance is TRANSIENT, so the write lands straight on the construction
function strangerTransientWrite() {
  class Keeper {}
  new Keeper().entries = "string";
}
strangerBoundInstanceWrite();
strangerTransientWrite();
new Holder().getFirst();
new Keeper().hasFirst();