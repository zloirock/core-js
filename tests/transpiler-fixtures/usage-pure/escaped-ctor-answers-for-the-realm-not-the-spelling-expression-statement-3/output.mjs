import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
// A parameter handed the realm constructor widens that constructor family.
function hand(x) {
  _globalThis.taken = x;
}
function shell(Promise) {
  hand(Promise);
}
shell(_Promise);
new _Promise(function (r) {
  r();
});