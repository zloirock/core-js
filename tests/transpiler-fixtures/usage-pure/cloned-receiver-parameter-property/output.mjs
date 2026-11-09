import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// A cloned constructor keeps its parameter property and the transformed default.
export const last = _at(_ref = new class {
  constructor(public readonly value: number[] = _Array$from([1, 2])) {}
}().value).call(_ref, -1);