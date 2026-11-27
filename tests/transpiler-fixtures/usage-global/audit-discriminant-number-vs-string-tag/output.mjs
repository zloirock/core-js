import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
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
  tagged.payload.at(0);
}
if (tagged.kind === "1") {
  tagged.payload.includes("a");
}