import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `Awaited<A & B>` over plain objects must return the intersection unchanged (no Promise to peel).
// Member lookup through the intersection must find each branch's array field for per-key narrowing.
async function objs() {
  var _ref, _ref2;
  type T = { items: number[] } & { tags: string[] };
  declare const r: Awaited<T>;
  _atMaybeArray(_ref = r.items).call(_ref, 0);
  _includesMaybeArray(_ref2 = r.tags).call(_ref2, 'x');
}
objs();