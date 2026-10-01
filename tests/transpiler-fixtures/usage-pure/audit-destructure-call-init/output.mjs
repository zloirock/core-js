import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// destructure from a call init with multiple instance-method properties - the init call
// must be evaluated once (single `getArr()`) and shared across each polyfill lookup
const _ref = getArr();
const at = _at(_ref);
const includes = _includes(_ref);