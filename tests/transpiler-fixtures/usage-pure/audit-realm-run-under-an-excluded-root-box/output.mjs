import _at from "@core-js/pure/actual/instance/at";
import _self from "@core-js/pure/actual/self";
// A local box must not capture the same-named property of the realm.
const box = {
  self: {}
};
export const deleteAboveDispatch = delete _at(_self.box.list).name;
export const local = box.self;