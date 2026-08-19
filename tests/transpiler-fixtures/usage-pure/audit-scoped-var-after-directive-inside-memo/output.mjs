import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref3;
// a function body with a `;`-less directive prologue, nested inside an instance memo (the IIFE
// stands in the memoized array / argument): the body's scoped `var` cannot be a plain insert there
// (it would split the enclosing overwrite) and rides the owner's content instead - and it has to
// open its own line exactly like the plain insert does, or `'use strict' var _ref2;` is a parse error
export const inArray = _atMaybeArray(_ref = [function () {
  'use strict';

  var _ref2;
  return _atMaybeArray(_ref2 = [1]).call(_ref2, 0);
}()]).call(_ref, 0);
export const inArgument = _atMaybeArray(_ref3 = [1]).call(_ref3, (() => {
  'use strict';

  var _ref4;
  return _atMaybeArray(_ref4 = [2]).call(_ref4, 0);
})());
export const inOptional = arr == null ? void 0 : _at(arr).call(arr, (() => {
  'use strict';

  var _ref5;
  return _atMaybeArray(_ref5 = [3]).call(_ref5, 0);
})());