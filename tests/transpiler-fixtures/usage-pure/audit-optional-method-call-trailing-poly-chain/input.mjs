// optional call on a non-polyfilled method, followed by TWO+ polyfilled instance methods:
// `recv.m?.().at(0).at(1)`. each trailing poly used to queue its own standalone transform over
// the shared `recv.m?.()` optional call - overlapping ranges crashed the transform queue. the
// combine now owns the whole optional chain and threads the poly hops onto one memoized inner
// result. a side-effecting receiver (`getList()`) is memoized once; babel comma-splits the
// receiver / method memo while unplugin nests it (output-unplugin), both evaluate it once
obj.m?.().at(0).at(1);
getList().fetch?.().flat().findLast(p);
