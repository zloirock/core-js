import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
export function settled(items) {
  let C = Array;
  {
    function Reflect() {}
    if (typeof Reflect == 'object') C = _Map;
    return (C === Array ? _Array$from : C.from.bind(C))(items);
  }
}