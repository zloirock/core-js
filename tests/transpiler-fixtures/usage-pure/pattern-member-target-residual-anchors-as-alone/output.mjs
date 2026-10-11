import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _Set from "@core-js/pure/actual/set";
// a sibling's extraction leaves the residual the host would be with no such sibling: a proxy hop above a member
// target peels, and a constructor hop nothing is extracted from anchors on its own read
let S, P;
({
  Map: sink.m
} = _globalThis);
S = _Set;
({
  from: sink.f
} = _globalThis.Array);
P = _Promise;
use(S, P);