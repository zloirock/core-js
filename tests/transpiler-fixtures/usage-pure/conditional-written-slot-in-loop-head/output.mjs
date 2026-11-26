import _Array$of from "@core-js/pure/actual/array/of";
export function read(flag, other) {
  const box = {
    C: Array
  };
  if (flag) box.C = other;
  for (const _ref of [box.C]) {
    const of = _ref === Array ? _Array$of : _ref.of,
      {
        groupBy
      } = _ref;
    return [of, groupBy];
  }
}