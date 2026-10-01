import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
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
type Wide = {
  tag: 2;
  items: number[];
} | {
  tag: 2n;
  items: string;
};
declare const tagged: Tagged;
declare const wide: Wide;
if (tagged.kind === 1) {
  var _ref;
  _atMaybeArray(_ref = tagged.payload).call(_ref, 0);
}
if (tagged.kind === "1") {
  var _ref2;
  _includesMaybeString(_ref2 = tagged.payload).call(_ref2, "a");
}
if (wide.tag === 2) {
  var _ref3;
  _findMaybeArray(_ref3 = wide.items).call(_ref3, x => x);
}