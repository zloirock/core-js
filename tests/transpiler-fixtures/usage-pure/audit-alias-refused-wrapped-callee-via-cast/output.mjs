import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A transparent wrapper around a guarded static callee preserves its receiver. Exported readers must also serve unknown callers
// beside the local example calls.
export function viaCast(c) {
  let M: any;
  if (c) M = _Map;
  return ((M === _Map ? _Map$groupBy : M.groupBy.bind(M)) as any)([1, 2], x => x % 2);
}
export const r = [viaCast(true)];