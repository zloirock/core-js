import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A residual member target reads the pure constructor even when the native constructor is absent.
// Iterator is a function: its own map read needs no Array dispatcher. The pure constructor keeps
// its legacy instance-as-static surface; the controls still read names from function values.
const box = {};
let from;
({
  Iterator: {
    map: box.m,
    from
  }
} = {
  Iterator: {
    map: _Iterator.map,
    from: _Iterator$from
  }
});
export const anchored = ['m' in box, typeof from];
const {
  of: {
    name: staticName
  }
} = {
  of: {
    name: _nameMaybeFunction(_Array$of)
  }
};
export const staticPonyfillMember = typeof staticName;
let ctorName;
ctorName = _nameMaybeFunction(_Promise);
export const ctorResidualName = typeof ctorName;