import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// A local box must not capture the same-named property of the realm.
const box = {
  self: {}
};
export const deleteAboveDispatch = delete _at(_globalThis.box.list).name;
export const local = box.self;