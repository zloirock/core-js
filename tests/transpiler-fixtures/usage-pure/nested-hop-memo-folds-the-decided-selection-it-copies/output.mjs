import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import _keys from "@core-js/pure/actual/instance/keys";
// the memo of a nested hop an assignment reads twice holds a selection the build decides as the operand that
// runs: the copy the memo takes folds as the original does, so the dead arm leaves neither text nor import
let at, flat, includes, keys;
const _ref = box['a'].a;
at = _at(_ref);
flat = _flatMaybeArray(_ref);
const _ref2 = make(1).c;
includes = _includes(_ref2);
keys = _keys(_ref2);
export { at, flat, includes, keys };