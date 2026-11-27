import _at from "@core-js/pure/actual/instance/at";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
var _ref;
const source = [[3]];
source[_Symbol$iterator] = function* () {
  yield 'word';
};
var rows;
{
  var [...rows] = source;
}
export const first = _at(_ref = rows[0]).call(_ref, 0);