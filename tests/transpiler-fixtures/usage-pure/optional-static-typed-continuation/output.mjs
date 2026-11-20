import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
type Item = {
  label<T>(value: T): T;
};
export function read(useBuiltin: boolean, item: Item) {
  let groups: {
    groupBy?: typeof Map.groupBy;
  };
  if (useBuiltin) groups = _Map;else groups = {};
  return (null == groups ? void 0 : groups === _Map ? _Map$groupBy<number, Item>([item], () => 1).get(1) : groups.groupBy?.<number, Item>([item], () => 1).get(1))?.[0].label<string>('ok');
}