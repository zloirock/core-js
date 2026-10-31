import _includes from "@core-js/pure/actual/instance/includes";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Array patterns consume the runtime iterator before deciding a slot default.
// An empty literal does not prove absence after a visible iterator replacement.
Array.prototype[_Symbol$iterator] = function* () {
  yield 'xy';
};
const [value = [1]] = [];
export const result = _includes(value).call(value, 'xy');