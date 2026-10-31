import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// An arrow property reader preserves a readonly named array argument.
const pick = <T extends {
  rows: unknown;
},>(o: T): T["rows"] => o.rows;
const box = {
  rows: [8, 9]
} as const;
use(_atMaybeArray(_ref = pick(box)).call(_ref, -1));