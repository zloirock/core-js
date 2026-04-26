import _includes from "@core-js/pure/actual/instance/includes";
// catch destructure inside an arrow function body: pattern bindings still route
// through pure-mode instance-method polyfills when used in the body.
const f = (x) => { try {} catch (_ref) {
let includes = _includes(_ref); return includes(x); } };