import _globalThis from "@core-js/pure/actual/global-this";
import _URL from "@core-js/pure/actual/url/constructor";
// A for-of shadow from an opaque iterable widens the global family only in usage-global.
function hand(x) {
  _globalThis.taken = x;
}
for (const URL of list) hand(URL);
new _URL('x');