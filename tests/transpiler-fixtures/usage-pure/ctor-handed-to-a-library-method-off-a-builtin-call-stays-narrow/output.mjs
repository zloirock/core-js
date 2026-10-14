import _Array$from from "@core-js/pure/actual/array/from";
import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$values from "@core-js/pure/actual/object/values";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
var _ref, _ref2, _ref3;
// a constructor handed to a standard-library method off what a builtin call returns - typed by that
// call's known return type - is called by the library alone, which reads no static off it: no escape,
// so a polyfilled constructor keeps its narrow entry and one core-js does not polyfill loads nothing.
// the same method off a receiver nothing types is no known library, and its argument still escapes
export const symbols = _mapMaybeArray(_ref = _Array$from(names)).call(_ref, _Symbol);
export const numbers = _filterMaybeArray(_ref2 = String(text).split(',')).call(_ref2, Number);
export const patterns = _flatMapMaybeArray(_ref3 = _Object$values(table)).call(_ref3, RegExp);
export const labelled = _Array$of(1, 2).every(String);
export const errors = _findMaybeArray(messages).call(messages, Error);