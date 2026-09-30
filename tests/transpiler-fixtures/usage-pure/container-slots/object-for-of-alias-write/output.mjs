import _Map from "@core-js/pure/actual/map/constructor";
import _Object$defineProperties from "@core-js/pure/actual/object/define-properties";
// A for-of binding receives the container and writes its constructor slot before the nested read.
const escapedByForOfHead = function () {
  const loopBox = {
    k: Object
  };
  for (const x of [loopBox]) x.k = _Map;
  const {
      k: _ref
    } = loopBox,
    defineProperties = _ref === Object ? _Object$defineProperties : _ref.defineProperties;
  return defineProperties;
}();
export { escapedByForOfHead };