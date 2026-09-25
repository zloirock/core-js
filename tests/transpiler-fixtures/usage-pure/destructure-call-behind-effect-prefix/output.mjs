import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Math$cbrt from "@core-js/pure/actual/math/cbrt";
import _Math$sign from "@core-js/pure/actual/math/sign";
// A call standing behind a sequence prefix runs after that prefix, which a lifted extraction would
// reorder, so the destructure keeps its native read; an OPTIONAL call to a proven callee is stepped
// like a plain one, whichever parser spells it. The prefixed literal twin mirrors its element in
// place, the prefix still first.
const log = [];
const make = () => (_pushMaybeArray(log).call(log, 'make'), [Math]);
const [{
  trunc: viaPrefixed
} = {}] = (_pushMaybeArray(log).call(log, 'prefix'), make());
make?.();
const viaOptional = _Math$sign;
const [{
  cbrt: viaLiteral
} = {}] = (_pushMaybeArray(log).call(log, 'literal'), [{
  cbrt: _Math$cbrt
}]);
export { viaPrefixed, viaOptional, viaLiteral, log };