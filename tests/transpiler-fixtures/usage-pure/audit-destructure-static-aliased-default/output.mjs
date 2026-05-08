import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// destructure with rename + AssignmentPattern: `const { from: customFrom = () => [] } = Array;`.
// `staticPairFromDestructure` peels AssignmentPattern.left to reach the renamed Identifier
// `customFrom` - matches binding name post-peel. body-extract emits
// `const customFrom = _Array$from === void 0 ? () => [] : _Array$from;` and narrowing
// fires through the registered alias. distinct methods per line
const customFrom = _Array$from === void 0 ? () => [] : _Array$from;
const xs = customFrom('hi');
_atMaybeArray(xs).call(xs, -1);
_includesMaybeArray(xs).call(xs, 'h');
_flatMaybeArray(xs).call(xs);