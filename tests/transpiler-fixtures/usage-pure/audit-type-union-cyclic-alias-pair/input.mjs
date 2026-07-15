// a mutually recursive pair of union aliases, with BOTH members of the pair referenced from one
// union. expanding the first one has to cut the cycle when it comes back around, and that cut is
// true only for the descent that made it - so the cut expansion must not be handed to the second
// reference, which reaches the pair from outside the cycle. the walk must also simply terminate:
// the guard that stops it is what keeps a heritage cycle from spinning forever
type Ping = Pong | {
  kind: "a";
  items: string[];
};
type Pong = Ping | {
  kind: "b";
  items: string[];
};
type Loop = Ring | {
  kind: "a";
  entries: string[];
};
type Ring = Loop | {
  kind: "b";
  entries: string[];
};

declare const pair: Ping | Pong;
declare const viaUnion: Ring;

// both halves of the pair in one union: the second reference must not inherit the first one's cut
export function bothHalvesOfACyclicPair() {
  if (pair.kind === "a") return pair.items.at(0);
  return "";
}

// the cycle is reached THROUGH a union alias rather than directly
export function cycleReachedThroughAUnionAlias() {
  if (viaUnion.kind === "a") return viaUnion.entries.includes("x");
  return false;
}
