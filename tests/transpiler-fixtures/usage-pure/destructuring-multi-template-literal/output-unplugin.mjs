var _ref;
import _trimMaybeString from "@core-js/pure/actual/string/instance/trim";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
const x = 'world';
const _ref = `hello ${ x }`;
const trim = _trimMaybeString(_ref);
const at = _atMaybeString(_ref);