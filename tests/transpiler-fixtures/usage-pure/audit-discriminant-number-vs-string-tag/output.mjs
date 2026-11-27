import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Discriminants compare with `===`, so `1` and `"1"` select different union branches even though
// both index the same property slot. One method per row keeps each narrow attributable.
type Tagged = {
  kind: 1;
  payload: number[];
} | {
  kind: "1";
  payload: string;
};
declare const tagged: Tagged;
if (tagged.kind === 1) {
  var _ref;
  _atMaybeArray(_ref = tagged.payload).call(_ref, 0);
}
if (tagged.kind === "1") {
  var _ref2;
  _includesMaybeString(_ref2 = tagged.payload).call(_ref2, "a");
}