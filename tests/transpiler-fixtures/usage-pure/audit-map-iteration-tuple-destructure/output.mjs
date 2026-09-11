import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `for (const [k, v] of map)` destructures Map iteration into key (string) and value (number);
// `.at(...)` on `k` and `.toFixed(...)` on `v` route to type-specific polyfills.
declare const m: Map<string, number>;
for (const [k, v] of m) {
  _atMaybeString(k).call(k, 0);
  _toFixedMaybeNumber(v).call(v, 2);
}