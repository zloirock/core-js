import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// destructure with rename + default: `const { from: customFrom = () => [] } = Array`.
// the rename + default combination must still register `customFrom` as an Array.from
// alias so the call's return narrows; distinct instance methods per line lock that
const customFrom = _Array$from === void 0 ? () => [] : _Array$from;
const xs = customFrom('hi');
_atMaybeArray(xs).call(xs, -1);
_includesMaybeArray(xs).call(xs, 'h');
_flatMaybeArray(xs).call(xs);