import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find";
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
  tagged.payload.at(0);
}
if (tagged.kind === "1") {
  tagged.payload.includes("a");
}
if (wide.tag === 2) {
  wide.items.find(x => x);
}