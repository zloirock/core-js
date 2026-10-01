import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2, _ref3;
declare class Box<T> {
  get data(): T[];
  get rawKeys(): string[];
  plain: T[];
}
declare const b: Box<number>;
// getter access yields the getter's return type - the three polyfill targets exercise
// the generic body (`T[]` with T=number), a concrete annotation (`string[]`), and a plain
// class property for comparison. all three should resolve to an Array receiver and pick
// the Array variant of `.at`; without getter return-type extraction the getter reads
// would resolve to `Function` and skip polyfilling entirely
_atMaybeArray(_ref = b.data).call(_ref, 0);
_atMaybeArray(_ref2 = b.rawKeys).call(_ref2, -1);
_atMaybeArray(_ref3 = b.plain).call(_ref3, 1);