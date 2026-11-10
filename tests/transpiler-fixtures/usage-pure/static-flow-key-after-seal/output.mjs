import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
try {
  const {
    [(_pushMaybeArray(effects).call(effects, "key"), "groupBy")]: {
      length
    }
  } = ({} = ((null == _globalThis.window ? void 0 : _self).Map, _Map), {
    groupBy: _Map$groupBy
  });
  r = length;
} catch (error) {
  r = _nameMaybeFunction(error);
}