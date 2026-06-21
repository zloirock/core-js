// optional call on a non-polyfilled method, followed by TWO+ polyfilled instance methods:
// `recv.m?.().at(0).at(1)`. one transform must own the whole optional chain and thread the poly
// hops onto a single memoized inner result; queuing each trailing poly separately overlaps
// ranges and crashes. a side-effecting receiver (`getList()`) is memoized and evaluated once.
obj.m?.().at(0).at(1);
getList().fetch?.().flat().findLast(p);
