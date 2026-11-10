import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _self from "@core-js/pure/actual/self";
// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
const {
  groupBy: {
    length
  },
  size
} = ({} = ((null == _globalThis.window ? void 0 : _self).Map, _Map), {
  groupBy: _Map$groupBy,
  size: _Map.size
});
r = [length, typeof size];