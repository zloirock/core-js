import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
const _ref = _flatMaybeArray(xs).call(xs, ys);
const includes = _includes(_ref);
// split-emitted init (`xs.flat(ys)`) feeding TWO instance-method bindings (`includes`, `at`): the
// split resolves once by logical range into a shared memo, then each binding wraps that memo -
// distinct from the single-binding inline path
const at = _at(_ref);
includes("x");
at(0);