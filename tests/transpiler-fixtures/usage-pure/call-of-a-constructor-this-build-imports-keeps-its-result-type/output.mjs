import _AggregateError from "@core-js/pure/actual/aggregate-error/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
var _ref, _ref2;
// a call of a constructor this build imports in its place - the rewrite to the import lands before a
// later read of the call's result is typed - still yields that constructor's result: the description and
// the message read off it are strings. distinct member per line
const s = _Symbol('x');
export const description = _atMaybeString(_ref = s.description).call(_ref, -1);
const e = _AggregateError([], 'm');
export const message = _includesMaybeString(_ref2 = e.message).call(_ref2, 'm');