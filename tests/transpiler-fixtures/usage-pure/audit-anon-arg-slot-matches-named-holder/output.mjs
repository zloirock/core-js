import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _entries from "@core-js/pure/actual/instance/entries";
import _includes from "@core-js/pure/actual/instance/includes";
import _Object$assign from "@core-js/pure/actual/object/assign";
// an object written INLINE at a call argument has to read exactly like the same object bound to a
// name first - both walks ask one shared question about the slot, and it has three layers: the
// callee must inspect rather than copy the object's own properties out, it must not mutate that
// slot, and an identity-returning callee must not have its result held. one row per layer, plus the
// named baseline they are compared against. distinct method per row so each narrow is attributable
export function namedHolderAtInspectedSlot() {
  const held = {
    rows: [1, 2],
    read() {
      var _ref;
      return _atMaybeArray(_ref = this.rows).call(_ref, 0);
    }
  };
  return Object.keys(held);
}
export function inlineAtInspectedSlot() {
  return Object.keys({
    cells: [1, 2],
    read() {
      var _ref2;
      return _includesMaybeArray(_ref2 = this.cells).call(_ref2, 1);
    }
  });
}
export function inlineAtCopyingSlot() {
  return _Object$assign(target, {
    items: [1, 2],
    read() {
      var _ref3;
      return _at(_ref3 = this.items).call(_ref3, 0);
    }
  });
}
export function inlineWithHeldIdentityResult() {
  return Object.freeze({
    entries: [1, 2],
    read() {
      var _ref4;
      return _includes(_ref4 = _entries(this)).call(_ref4, 1);
    }
  });
}