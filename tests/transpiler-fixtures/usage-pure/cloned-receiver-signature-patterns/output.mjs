import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
var _ref, _ref2;
// A repeated or memoized receiver retains the full type-level parameter patterns.
const handlers = [(n: number) => n + 1];
export const last = _atMaybeArray(handlers as Array<(...values: number[]) => number>).call(handlers as Array<(...values: number[]) => number>, -1);
const make = ([a, b]: number[]) => [a, b];
export const pair = _includesMaybeArray(_ref = (make as ([a, b]: number[]) => number[])([3, 4])).call(_ref, 4);
const object = ({
  value
}: {
  value: number;
}) => [value];
export const flat = _flatMaybeArray(_ref2 = (object as ({
  value
}: {
  value: number;
}) => number[])({
  value: 5
})).call(_ref2);