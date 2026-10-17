import _at from "@core-js/pure/actual/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
// An identity return takes its value from the runtime argument position.
// A changed iterator prevents peeling the spread's literal element as that value.
Array.prototype[_Symbol$iterator] = function* () {
  yield 'text';
};
export const result = _at(_ref = (value => value)(...[[1]])).call(_ref, 0);