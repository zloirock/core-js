import "core-js/modules/es.array.at";
// A mutually recursive pair of union aliases, with BOTH members of the pair referenced from one union.
type Ping = Pong | {
  kind: "a";
  items: string[];
};
type Pong = Ping | {
  kind: "b";
  items: string[];
};
declare const pair: Ping | Pong;
// both halves of the pair in one union: the second reference must not inherit the first one's cut
export function bothHalvesOfACyclicPair() {
  if (pair.kind === "a") return pair.items.at(0);
  return "";
}