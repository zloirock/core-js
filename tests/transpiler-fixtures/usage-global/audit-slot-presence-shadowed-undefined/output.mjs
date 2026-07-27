import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.trim-start";
// a destructuring default fires only when the paired slot is absent, and a slot holding the literal
// `undefined` counts as absent. `undefined` is shadowable though: bound to a value the slot IS
// present, the default stays dead, and the member dispatches on the slot's own value instead of the
// default's type. a shadow in a sibling scope does not reach this use, and `void 0` is always the
// real undefined. both rows use a multi-prototype method so the emitted set shows the inference:
// the array slot keeps only the array variant, the string default only the string one. distinct
// method per line
export function shadowed() {
  const undefined = [1, 2];
  const {
    slot = "str"
  } = {
    slot: undefined
  };
  return slot.at(0);
}
export function genuine() {
  const {
    slot = "str"
  } = {
    slot: undefined
  };
  return slot.includes("a");
}
export function viaVoid() {
  const {
    slot = "str"
  } = {
    slot: void 0
  };
  return slot.trimStart();
}