// catch-default with a THREE-level instance chain (`[9].flat().flat().at(0)`): the relocate must
// fold BOTH inner `.flat` overwrites into the outer `.at` (deeper than a two-level chain), emitting
// one disjoint composed splice rather than three overlapping ones
try {} catch ({ [Symbol.iterator]: it = [9].flat().flat().at(0) }) { it; }
