import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
export function read(useArray) {
  const box = {
    C: _Map
  };
  if (useArray) box.C = Array;
  for (const _ref of [box.C]) {
    const of = _ref === Array ? _Array$of : _ref.of,
      {
        groupBy
      } = _ref;
    return [of, groupBy];
  }
}