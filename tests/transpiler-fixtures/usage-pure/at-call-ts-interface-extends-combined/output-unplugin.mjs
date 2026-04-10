var _ref, _ref2;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Cfg = { data: string[] };
interface Base<T> { fn: () => T["data"]; cond: T extends Cfg ? T["data"] : never }
interface Child extends Base<Cfg> {}
declare const c: Child;
_atMaybeArray(_ref = c.fn()).call(_ref, -1);
_atMaybeArray(_ref2 = c.cond).call(_ref2, -1);